#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// 百度「主动推送」（快速收录 API）——把 dist/sitemap.xml 里的 URL 推送给百度。
//
// 为什么用主动推送而不用 sitemap 提交：
//   sitemap 提交依赖百度侧配额释放（新验证站点常显示「今日上限 0 条」，需 1-3 天）；
//   主动推送配额独立、且一旦释放即可当天用，实时的（推完立刻进入抓取队列）。
//
// 用法：
//   node scripts/baidu-push.mjs                 # 自适应推送：先探测配额再按额度分批
//   node scripts/baidu-push.mjs --dry-run       # 只打印将要推送的 URL，不发请求
//   node scripts/baidu-push.mjs --limit=10      # 最多推送 10 条（保护今日配额）
//   node scripts/baidu-push.mjs --urls=a,b      # 只推送指定 URL（适合增量推送）
//
// 环境变量：
//   BAIDU_PUSH_TOKEN   必填（或写入 .env.baidu，见下）。CI 里从 Repository Secrets 注入。
//
// token 来源：百度搜索资源平台 → 普通收录 → API 提交 → 「准入密钥」。
// ⚠️ 该 token 等同于「代表本站向百度推送 URL」的权限，勿提交进公开仓库。
//    本地调试可写入仓库根目录 .env.baidu（已在 .gitignore 忽略），格式：
//      BAIDU_PUSH_TOKEN=xxxxxxxxxxxxxxxx
//
// ⚠️⚠️ 2026-10-15 关键修复：**超配额会整批拒绝，不是「推一部分成功」**
//
//   实测（证据：CI run 38646550964 与 38732246171 的步骤日志，跨两天结果一致）：
//     「百度主动推送：共 71 条 URL，分 1 批
//       批次 1/1（71 条）… ⚠ 推送被拒绝：今日配额已用尽（over quota）
//       汇总：成功推送 0 / 71 条」
//
//   原实现按 MAX_PER_REQUEST=1000 分批，71 条只分 1 批 → 整批超出配额 →
//   百度**整批拒绝**（success:0），于是「每天都跑、每天都是 0 条成功」，
//   长期静默失效。本站配额实测远小于 71（历史记录为 10 条/天，甚至可能为 0）。
//
//   修法：**先小批探测，再按返回的 remain 自适应分批**——
//     ① 首批发 PROBE_SIZE 条（默认 1 条），成本极低但能拿到真实 remain
//     ② 按 remain 把剩余 URL 切成不超过 remain 的批
//     ③ 任一批返回 over quota 立即收尾（软失败，不报错）
//   这样「配额 10 条」能推 10 条成功、而不是 0 条。
//
// 退出码：0 = 推送成功或无需推送；1 = 配置/网络/接口错误（CI 会因此标红）。
// ─────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://xiaominart.com';
const ENDPOINT = 'http://data.zz.baidu.com/urls';

// 百度单次请求上限 2000 条，这里保守取 1000，避免请求体过大。
// ⚠️ 注意：这是「单次请求的协议上限」，**不是配额**。实际配额由百度按站点下发，
//    超了会整批拒绝 → 见文件头 2026-10-15 修复说明，务必先探测再分批。
const MAX_PER_REQUEST = 1000;

// 探测批大小：首批只发这么多条，用于换取接口返回的真实 remain。
// 取 1 是有意的 —— 成本最低（最多浪费 1 条额度），但能拿到准确配额。
const PROBE_SIZE = 1;

// ---------- 参数解析 ----------
const argv = process.argv.slice(2);
/** @param {string} name */
const hasFlag = (name) => argv.includes(`--${name}`);
/** @param {string} name */
const getOpt = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};

const dryRun = hasFlag('dry-run');
const limit = Number.parseInt(getOpt('limit') ?? '', 10);
const explicitUrls = (getOpt('urls') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// ---------- 读取 token ----------
/** 优先环境变量，其次仓库根目录 .env.baidu（本地调试用，已在 .gitignore） */
function resolveToken() {
  if (process.env.BAIDU_PUSH_TOKEN) return process.env.BAIDU_PUSH_TOKEN.trim();

  const envFile = join(ROOT, '.env.baidu');
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, 'utf8').match(/^\s*BAIDU_PUSH_TOKEN\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return null;
}

// ---------- 收集待推送 URL ----------
/** 从 dist/sitemap.xml 读 URL —— 保证推送的永远是「站点真实存在且可索引」的页面 */
function urlsFromSitemap() {
  const sitemapPath = join(ROOT, 'dist', 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    console.error('✗ 未找到 dist/sitemap.xml，请先执行 npm run build');
    process.exit(1);
  }
  const xml = readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const allUrls = explicitUrls.length > 0 ? explicitUrls : urlsFromSitemap();

// 域名校验：百度要求推送 URL 与站点是同一域名，混入外域会被整批拒绝
const foreign = allUrls.filter((u) => {
  try { return new URL(u).hostname !== new URL(SITE).hostname; } catch { return true; }
});
if (foreign.length > 0) {
  console.error(`✗ 以下 ${foreign.length} 条 URL 不属于 ${SITE}，百度会拒绝整批推送：`);
  foreign.slice(0, 5).forEach((u) => console.error(`   ${u}`));
  process.exit(1);
}

const target = Number.isFinite(limit) && limit > 0 ? allUrls.slice(0, limit) : allUrls;

// ---------- 干跑 ----------
if (dryRun) {
  console.log(`[dry-run] 将从 ${explicitUrls.length > 0 ? '命令行参数' : 'dist/sitemap.xml'} 推送 ${target.length} 条 URL：`);
  target.forEach((u, i) => console.log(`  ${String(i + 1).padStart(3)}. ${u}`));
  console.log(`\n[dry-run] 未发送任何请求。去掉 --dry-run 即真实推送。`);
  process.exit(0);
}

// ---------- 真实推送 ----------
const token = resolveToken();
if (!token) {
  console.error('✗ 未找到 BAIDU_PUSH_TOKEN。');
  console.error('  CI：在 GitHub → Settings → Secrets and variables → Actions → Secrets 添加 BAIDU_PUSH_TOKEN');
  console.error('  本地：在仓库根目录建 .env.baidu 写入 BAIDU_PUSH_TOKEN=xxxx');
  process.exit(1);
}

// ⚠️ site 参数绝不能 encodeURIComponent —— 那会把 "://" 编成 "%3A%2F%2F"，
// 百度这个老接口不认百分号编码，直接回 400 "site init fail"（消息极具误导性，
// 实测 2026-10-09 定性：site 原样拼接 = 200，编码后 = 400）。
// token 是纯字母数字，无需编码。
const endpoint = `${ENDPOINT}?site=${SITE}&token=${token}`;

/** 单批推送；返回接口原始 JSON
 * @param {string[]} urls
 * @returns {Promise<{ status: number, json: Record<string, any> }>} */
async function pushBatch(urls) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n'),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`接口返回非 JSON（HTTP ${res.status}）：${text.slice(0, 200)}`);
  }
  return { status: res.status, json };
}

/** 配额类错误：属于软失败（改天自动恢复），不该报成「配置错误」误导排查
 * @param {Record<string, any>} json */
function isQuotaError(json) {
  if (!json.error) return false;
  const msg = String(json.message ?? '').toLowerCase();
  return msg.includes('over quota') || msg.includes('quota') || json.error === 429;
}

/** 把接口返回翻译成人话，便于 CI 日志阅读
 * @param {Record<string, any>} json
 * @returns {{ text: string, quota: boolean }} */
function explain(json) {
  if (json.error) {
    // ⚠️ 百度把「配额用尽」也塞进 error:400，message 才是真原因。
    // 早先只按 error 码翻译，把 over quota 误报成「站点域名或 token 格式错误」，
    // 会让人去反复检查 token —— 先判 message，别只看码。
    if (isQuotaError(json)) {
      return {
        quota: true,
        text: `⚠ 推送被拒绝：今日配额已用尽（${json.message}）—— 属正常限流，改日重跑即可，无需改配置`,
      };
    }
    /** @type {Record<number, string>} */
    const table = {
      400: '请求格式错误（若 message 为 site init fail，多为 site 参数被 URL 编码）',
      401: 'token 无效（请核对站长平台的准入密钥）',
      403: '站点未验证或 token 与站点不匹配',
      404: '接口地址错误',
      500: '百度服务端异常，稍后重试',
    };
    return {
      quota: false,
      text: `✗ 推送被拒绝：${json.message ?? '未知原因'}（${table[Number(json.error)] ?? 'HTTP ' + json.error}）`,
    };
  }
  const parts = [];
  if (typeof json.success === 'number') parts.push(`成功 ${json.success} 条`);
  if (typeof json.remain === 'number') parts.push(`今日剩余配额 ${json.remain} 条`);
  if (Array.isArray(json.not_same_site) && json.not_same_site.length) {
    parts.push(`⤫ 非本站域名被忽略 ${json.not_same_site.length} 条`);
  }
  if (Array.isArray(json.not_valid) && json.not_valid.length) {
    parts.push(`⤫ 格式非法被忽略 ${json.not_valid.length} 条：${json.not_valid.slice(0, 3).join(', ')}`);
  }
  return { quota: false, text: `✓ ${parts.join('，') || '推送完成'}` };
}

/** 已提交但超配额/未通过校验的 URL，接口会回传，用于提示业主
 * @param {Record<string, any>} json
 * @returns {string[]} */
function leftovers(json) {
  const out = [];
  if (Array.isArray(json.not_same_site)) out.push(...json.not_same_site);
  if (Array.isArray(json.not_valid)) out.push(...json.not_valid);
  return out;
}

console.log(`百度主动推送：共 ${target.length} 条 URL（自适应分批）`);
console.log(`站点 ${SITE}`);
console.log('');

let totalSuccess = 0;
let lastRemain = null;
let hardFailure = false;
let quotaHit = false;
const rejected = [];
const pending = [...target];
let batchNo = 0;

/** 推一批并统一处理返回；返回 'stop' 表示应终止循环
 * @param {string[]} batch
 * @returns {Promise<'continue'|'stop'>} */
async function runBatch(batch) {
  batchNo += 1;
  process.stdout.write(`  批次 ${batchNo}（${batch.length} 条）… `);
  let result;
  try {
    result = await pushBatch(batch);
  } catch (err) {
    console.log('✗ 网络错误');
    console.error(`     ${err instanceof Error ? err.message : String(err)}`);
    hardFailure = true;
    return 'stop';
  }

  const verdict = explain(result.json);
  console.log(verdict.text);
  totalSuccess += Number(result.json.success ?? 0);
  if (typeof result.json.remain === 'number') lastRemain = result.json.remain;
  rejected.push(...leftovers(result.json));

  // 配额用尽：软失败。百度把 over quota 也塞进 error:400，
  // 若按硬失败处理会让 CI 每次配额到期都标红（属正常限流，非缺陷）。
  if (verdict.quota) {
    quotaHit = true;
    console.log('  ⚠ 今日配额已用尽，剩余 URL 请改日再推（脚本可重复执行，已收录的重复推送不影响）');
    return 'stop';
  }
  // remain 归零但本批仍有成功：配额刚好用完，同样按软失败收工
  if (lastRemain === 0) {
    quotaHit = true;
    console.log('  ⚠ 今日配额已用尽，剩余 URL 请改日再推');
    return 'stop';
  }
  // 真·配置错误（token 无效 / 站点未验证 / 接口地址错 / site 参数被编码）：
  // 后续批次必然同样失败，重试无意义 → 立即止损并 exit=1 让 CI 标红。
  // 早先只判 [401,403,404] 把 400 放过了，导致 token 配错时退出码仍为 0，已修正。
  if (result.json.error) {
    hardFailure = true;
    return 'stop';
  }
  return 'continue';
}

// ① 探测批：先发 1 条，换取真实 remain（见文件头 2026-10-15 修复说明）
if (pending.length > 0) {
  const probe = pending.splice(0, Math.min(PROBE_SIZE, pending.length));
  const act = await runBatch(probe);
  if (act === 'stop') {
    // 探测批就失败 → 直接进入汇总；此时 totalSuccess 已如实统计
    pending.length = 0;
  }
}

// ② 自适应批：按 remain 决定每批大小（remain 未知时退回保守的 10 条）
while (pending.length > 0 && !hardFailure && !quotaHit) {
  const size = Math.max(1, Math.min(lastRemain ?? 10, MAX_PER_REQUEST, pending.length));
  const batch = pending.splice(0, size);
  const act = await runBatch(batch);
  if (act === 'stop') break;
}

console.log('');
console.log(`汇总：成功推送 ${totalSuccess} / ${target.length} 条` + (lastRemain !== null ? `，今日剩余配额 ${lastRemain} 条` : ''));
if (quotaHit) {
  console.log('说明：本次未推完的 URL 不是错误，明天配额重置后重跑本脚本即可（重复推送幂等，不会产生副作用）。');
}
if (rejected.length > 0) {
  console.log(`未被接受 ${rejected.length} 条（多为超出配额，可改日重推）：`);
  rejected.slice(0, 10).forEach((u) => console.log(`   ${u}`));
  if (rejected.length > 10) console.log(`   … 另有 ${rejected.length - 10} 条`);
}

process.exit(hardFailure ? 1 : 0);
