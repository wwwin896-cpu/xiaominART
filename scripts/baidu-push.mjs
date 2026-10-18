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
//   node scripts/baidu-push.mjs --force         # 忽略进度记录，全量重推（慎用，会烧配额）
//
// ── 进度状态（2026-10-18 新增，修复「每天重复推前 10 条」）──
//
//   症状：脚本每次从 sitemap 索引 0 开始 splice，没有任何游标。
//         10-17 与 10-18 两次运行推的都是同一批 10 条（首页 → /business-gifts/space/），
//         第 11 条之后永远进不了队列 —— 配额天天照烧，进度天天为零。
//
//   修法：把「哪些 URL 已推过」持久化到仓库根目录 `.baidu-pushed.json`，
//         每次只从 sitemap 里挑**从未推过**或**推送后又被修改过**的 URL。
//         状态文件由 CI 在推送后自动提交回 main（见 deploy.yml
//         "Persist Baidu push progress" 步骤），因此进度跨运行、跨机器都不会丢。
//
//   为什么不用「按日期轮换」或「按 offset 切片」：
//     · offset 无法处理 sitemap 增删（新增一页会让偏移全部错位，漏推或重推）；
//     · 按 URL 记录可精确去重，且天然支持断点续推（中途超时/Hard fail 也不丢进度）；
//     · 顺带能回答业主真正关心的问题：「这 77 页里哪些百度已经知道？哪天推的？」
//
//   重新入队规则（默认）：
//     · 状态里没有该 URL            → 入队（新页面）
//     · sitemap 的 lastmod 晚于记录 → 入队（页面改过，值得再推一次）
//     · 其余                         → 跳过（已推过且未变更）
//
//   `--recheck-days=N`：额外的兜底保鲜策略，推送超过 N 天的 URL 重新入队。
//     默认 0 = 关闭。关闭是有意的 —— 定期重推会让「全部推完」这个终止信号永远
//     不出现，本任务就无法自动收尾；只在业主明确要求「每月全量刷一遍」时才开。
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
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  parseSitemap,
  emptyState,
  normalizeState,
  selectPending,
  applyPushed,
  countPushed,
} from './lib/baidu-queue.mjs';

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
const force = hasFlag('force');
const limit = Number.parseInt(getOpt('limit') ?? '', 10);
const recheckDaysRaw = Number.parseInt(getOpt('recheck-days') ?? '0', 10);
const recheckDays = Number.isFinite(recheckDaysRaw) && recheckDaysRaw > 0 ? recheckDaysRaw : 0;
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
/**
 * 从 dist/sitemap.xml 读 URL + lastmod —— 保证推送的永远是「站点真实存在且可索引」的页面。
 * lastmod 用于判断「推送之后页面是否又改过」，是实现增量重推的依据。
 * 解析逻辑见 lib/baidu-queue.mjs（纯函数，可单测）。
 */
function urlsFromSitemap() {
  const sitemapPath = join(ROOT, 'dist', 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    console.error('✗ 未找到 dist/sitemap.xml，请先执行 npm run build');
    process.exit(1);
  }
  return parseSitemap(readFileSync(sitemapPath, 'utf8'));
}

/** @type {import('./lib/baidu-queue.mjs').UrlEntry[]} */
const entries = explicitUrls.length > 0
  ? explicitUrls.map((u) => ({ loc: u, lastmod: null }))
  : urlsFromSitemap();
const allUrls = entries.map((e) => e.loc);

// 域名校验：百度要求推送 URL 与站点是同一域名，混入外域会被整批拒绝
const foreign = allUrls.filter((u) => {
  try { return new URL(u).hostname !== new URL(SITE).hostname; } catch { return true; }
});
if (foreign.length > 0) {
  console.error(`✗ 以下 ${foreign.length} 条 URL 不属于 ${SITE}，百度会拒绝整批推送：`);
  foreign.slice(0, 5).forEach((u) => console.error(`   ${u}`));
  process.exit(1);
}

// ---------- 进度状态 ----------
// 结构（version 固定 1，升级时按 version 分支迁移）：
// {
//   "version": 1,
//   "site": "https://xiaominart.com",
//   "updatedAt": "2026-10-19T01:10:00.000Z",   // 最后一次写入时间（UTC）
//   "urls": {
//     "https://xiaominart.com/": {              // key 为完整 URL，天然幂等
//       "pushedAt": "2026-10-18",               // 最后一次成功推送的日期（本地时区无关，取 UTC 日期）
//       "lastmod": "2026-10-17",                // 推送时 sitemap 里该页的 lastmod，用于判断后续是否变更
//       "count": 1                              // 累计推送次数，便于发现「反复重推」的异常页
//     }
//   }
// }
// ⚠️ 用 resolve 而非 join：join(ROOT, 'C:/x/y') 会拼成 'ROOT\\C:\\x\\y' 这种非法路径，
//    表现为「传了 --state 却像没传」——状态读不到 → 空状态 → 全量重推烧配额。
const stateArg = getOpt('state');
const STATE_FILE = stateArg ? resolve(ROOT, stateArg) : join(ROOT, '.baidu-pushed.json');

/** @returns {import('./lib/baidu-queue.mjs').PushState} */
function loadState() {
  if (!existsSync(STATE_FILE)) return emptyState(SITE);

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    // 损坏时**不能**静默当作空状态 —— 那会导致下一次全量重推，白烧好几天配额。
    // 直接硬失败，让人看一眼文件（它只是记录，删掉即可重建，但必须是人的决定）。
    console.error(`✗ 进度文件解析失败：${STATE_FILE}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    console.error('  处理：确认内容无误后删除该文件（会从头重推，慎用），或从 git 历史恢复。');
    process.exit(1);
  }

  try {
    return normalizeState(parsed, SITE);
  } catch (err) {
    console.error(`✗ 进度文件结构不符：${STATE_FILE}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

const state = loadState();

/** 落盘（只在真实推送后调用；dry-run 绝不写文件）
 * @param {import('./lib/baidu-queue.mjs').PushState} next */
function saveState(next) {
  writeFileSync(STATE_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

/** UTC 日期 YYYY-MM-DD。用 UTC 而非本地时区，避免 CI（UTC）与本地（+8）记录不一致 */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const { pending: pendingEntries, alreadyDone } = selectPending(entries, state, { force, recheckDays });

// limit 作用在**待推队列**上（而非全量），这样 --limit=10 才是「今天最多推 10 条」
const selected = Number.isFinite(limit) && limit > 0 ? pendingEntries.slice(0, limit) : pendingEntries;
const target = selected.map((e) => e.loc);
/** url → lastmod，推送成功后写进状态 */
const lastmodOf = new Map(selected.map((e) => [e.loc, e.lastmod]));

// 进度口径：只统计「仍在 sitemap 里」的记录，避免已删除页面长期挂在分母外造成误判
const pushedCount = countPushed(state, allUrls);

// ---------- 干跑 ----------
if (dryRun) {
  console.log(`[dry-run] 数据源：${explicitUrls.length > 0 ? '命令行参数' : 'dist/sitemap.xml'}`);
  console.log(`[dry-run] sitemap ${entries.length} 条 | 已推过 ${alreadyDone.length} 条 | 本次待推 ${selected.length} 条${force ? '（--force 忽略进度）' : ''}`);
  console.log(`[dry-run] 待推队列（按 sitemap 顺序）：`);
  selected.forEach((e, i) => console.log(`  ${String(i + 1).padStart(3)}. ${e.loc}${e.lastmod ? `  (lastmod ${e.lastmod})` : ''}`));
  if (selected.length === 0) {
    console.log('\n[dry-run] 没有待推 URL —— 全部已推过，且 sitemap 无新增/变更。');
  }
  console.log(`\n[dry-run] 未发送任何请求、未修改进度文件。去掉 --dry-run 即真实推送。`);
  process.exit(0);
}

// ---------- 无待推项：直接收工 ----------
/** 状态文件在日志里显示为仓库相对路径，便于人直接去 GitHub 上点开 */
const stateRel = STATE_FILE.replace(ROOT, '').replace(/^[\\/]+/, '') || STATE_FILE;

// 没有待推项 → **不探测、不发请求、不烧配额**，也不要求 token（没活要干就别拦人）。
// 这同时是「任务已完成」的终止信号：日志出现这句，业主就可以停掉每日任务。
if (selected.length === 0) {
  console.log(`百度主动推送：sitemap ${entries.length} 条 URL 全部已推送过，本次无需推送。`);
  console.log(`进度：${pushedCount} / ${entries.length} 条已推（记录于 ${stateRel}）`);
  console.log('✓ 无待推 URL —— 本任务可停止。');
  console.log('  后续：站点新增页面、或页面更新导致 sitemap lastmod 变化时，会自动重新入队。');
  console.log('  如需无视记录全量重推：npm run push:baidu -- --force（会消耗配额，慎用）。');
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

console.log(`百度主动推送：sitemap ${entries.length} 条 | 已推 ${pushedCount} 条 | 待推 ${pendingEntries.length} 条 | 本次计划 ${target.length} 条（自适应分批）`);
console.log(`站点 ${SITE}`);
console.log(`进度文件 ${stateRel}`);
console.log('');

// ⚠️ 这些变量被下方 runBatch() 读写。tsconfig 开了 checkJs，
//    若只写 `let lastRemain = null` / `const rejected = []`，
//    TS 会因「在被提升的函数里才被赋值/使用」而推不出类型 → ts(7034)/ts(7005) 报错。
//    必须显式标注（本文件是 .mjs，用 JSDoc 注解而非 TS 语法）。
/** @type {number|null} */
let lastRemain = null;
/** @type {string[]} */
const rejected = [];
let totalSuccess = 0;
let hardFailure = false;
let quotaHit = false;
const pending = [...target];
let batchNo = 0;

/** 当前进度：每批成功后被替换为新对象（applyPushed 不改入参） */
let liveState = state;

/**
 * 把本批「确认成功」的 URL 写进状态文件并落盘。
 * 每批成功就写一次（而不是跑完统一写）：中途超时/被取消时已推的部分不丢，
 * 明天不会重复烧配额推同一批。
 * @param {string[]} batch
 * @param {Record<string, any>} json
 * @returns {number} 实际记录条数
 */
function recordBatch(batch, json) {
  const result = applyPushed(liveState, batch, json, lastmodOf, todayStr());
  liveState = result.state;
  if (result.recorded > 0) saveState(liveState);
  return result.recorded;
}

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
  // 真·配置错误（token 无效 / 站点未验证 / 接口地址错 / site 参数被编码）：
  // 后续批次必然同样失败，重试无意义 → 立即止损并 exit=1 让 CI 标红。
  // 早先只判 [401,403,404] 把 400 放过了，导致 token 配错时退出码仍为 0，已修正。
  if (result.json.error) {
    hardFailure = true;
    return 'stop';
  }

  // 走到这里说明本批被接受 → 记进度（含 remain 刚好归零的那一批，否则会白推）
  const recorded = recordBatch(batch, result.json);
  if (recorded < batch.length) {
    console.log(`  ⚠ ${batch.length - recorded} 条未被接受（格式非法/非本站），已排除出队列，不计入进度`);
  }

  // remain 归零但本批仍有成功：配额刚好用完，同样按软失败收工
  if (lastRemain === 0) {
    quotaHit = true;
    console.log('  ⚠ 今日配额已用尽，剩余 URL 请改日再推');
    return 'stop';
  }
  return 'continue';
}

// ① 探测批：先发 1 条，换取真实 remain（见文件头 2026-10-15 修复说明）
if (pending.length > 0) {
  const probe = pending.splice(0, Math.min(PROBE_SIZE, pending.length));
  await runBatch(probe);
  // 失败时由 hardFailure/quotaHit 阻止后续批次，无需在这里清空 pending
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

// 累计进度（分母用 sitemap 当前条数，分子只算仍在 sitemap 里的记录）
const pushedNow = countPushed(liveState, allUrls);
if (pending.length === 0) {
  console.log(`进度：已推 ${pushedNow} / ${entries.length} 条，无待推项`);
} else if (pushedNow >= entries.length) {
  // 全部推过但仍有待推 → 是「内容更新后重新入队」，不是没推过。两者别混淆。
  console.log(`进度：已推 ${pushedNow} / ${entries.length} 条，其中 ${pending.length} 条因内容更新重新入队，待后续配额`);
} else {
  console.log(`进度：已推 ${pushedNow} / ${entries.length} 条，尚未推送 ${pending.length} 条`);
}

if (pending.length === 0 && !hardFailure) {
  console.log(`✓ 全部 ${entries.length} 条 URL 已推送完成 —— 本任务可以停止，无需再每天触发。`);
} else if (quotaHit) {
  console.log('说明：本次未推完的 URL 不是错误，明天配额重置后重跑本脚本即可（进度已记录，不会重复推同一批）。');
}
if (rejected.length > 0) {
  console.log(`未被接受 ${rejected.length} 条（多为超出配额，可改日重推）：`);
  rejected.slice(0, 10).forEach((u) => console.log(`   ${u}`));
  if (rejected.length > 10) console.log(`   … 另有 ${rejected.length - 10} 条`);
}

process.exit(hardFailure ? 1 : 0);
