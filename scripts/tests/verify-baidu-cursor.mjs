#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// 回归测试：百度主动推送必须「每次往前推」，不能反复推同一批。
//
// 背景（2026-10-18）：脚本早期没有游标，每次从 sitemap 索引 0 开始，
// 10-17 与 10-18 推的都是前 10 条 —— 配额天天烧、进度天天 0，
// 且线上日志看上去「每天都很正常」，很难发现。本测试把这条规则钉死。
//
// 手法：在临时目录造一个假站点（dist/sitemap.xml），把 globalThis.fetch
// 换成桩（模拟百度的 success/remain/over-quota），然后**在进程内反复执行**
// 真实的 scripts/baidu-push.mjs（用 ?v=N 绕开 ESM 缓存），逐天检查进度文件。
// 不联网、不消耗真实配额、不碰仓库里的真实进度文件。
//
// 运行：node scripts/tests/verify-baidu-cursor.mjs
// ─────────────────────────────────────────────────────────────
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, '..', 'baidu-push.mjs');
const SITE = 'https://xiaominart.com';

const TOTAL = 25;
const QUOTA = 10;

let failed = 0;
/** @param {boolean} ok @param {string} msg */
function check(ok, msg) {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) failed += 1;
}

/** 造 N 条 URL 的 sitemap */
function writeSitemap(root, lastmod = '2026-10-01') {
  const urls = Array.from({ length: TOTAL }, (_, i) =>
    `<url><loc>${SITE}/p${String(i + 1).padStart(2, '0')}/</loc><lastmod>${lastmod}</lastmod></url>`);
  mkdirSync(join(root, 'dist'), { recursive: true });
  writeFileSync(join(root, 'dist', 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
}

/** 剩余配额与本次推送到的 URL（由 fetch 桩读写） */
let quotaLeft = 0;
/** @type {string[]} */
let pushedThisRun = [];

globalThis.fetch = async (_url, init) => {
  const urls = String(init.body || '').split('\n').filter(Boolean);
  pushedThisRun.push(...urls);
  if (quotaLeft <= 0) {
    return { status: 400, text: async () => JSON.stringify({ error: 400, message: 'over quota' }) };
  }
  const accepted = urls.slice(0, quotaLeft);
  quotaLeft -= accepted.length;
  return {
    status: 200,
    text: async () => JSON.stringify({ success: accepted.length, remain: quotaLeft, not_same_site: [], not_valid: [] }),
  };
};

let seq = 0;
const origCwd = process.cwd();
const origLog = console.log;
const origErr = console.error;
const origExit = process.exit;

/**
 * 在临时站点的 cwd 下真实执行一次 baidu-push.mjs，返回退出码与输出。
 * process.exit 会被替换成抛异常，以便在进程内连续跑多「天」。
 * @param {string} root
 * @param {number} quota
 * @param {string[]} [args]
 */
async function runScript(root, quota, args = []) {
  quotaLeft = quota;
  pushedThisRun = [];
  process.chdir(root);
  process.env.BAIDU_PUSH_TOKEN = 'fake-token';
  // 脚本从 argv 解析参数，这里把测试参数接进去
  process.argv = [process.execPath, SCRIPT, ...args];

  const out = [];
  // 批次进度用的是 process.stdout.write（不带换行），也要一起捕获，否则输出会错行
  const origWrite = process.stdout.write.bind(process.stdout);
  console.log = (...a) => out.push(a.join(' '));
  process.stdout.write = ((chunk) => { out.push(String(chunk).replace(/\n$/, '')); return true; });
  console.error = (...a) => out.push(a.join(' '));
  let code = 0;
  process.exit = ((c) => { throw Object.assign(new Error('__exit__'), { __exit: c ?? 0 }); });

  try {
    seq += 1;
    await import(`${pathToFileURL(SCRIPT).href}?v=${seq}`);
  } catch (err) {
    if (err && typeof err === 'object' && '__exit' in err) code = Number(err.__exit);
    else { out.push(`[throw] ${err instanceof Error ? err.stack : String(err)}`); code = 99; }
  } finally {
    console.log = origLog;
    console.error = origErr;
    process.stdout.write = origWrite;
    process.exit = origExit;
    process.chdir(origCwd);
  }
  const text = out.join('\n');
  origLog(text.trimEnd()); // 便于排查：把当天真实输出打出来
  return { code, out: text, pushed: pushedThisRun };
}

const statePath = (root) => join(root, '.baidu-pushed.json');
const readState = (root) => JSON.parse(readFileSync(statePath(root), 'utf8'));
const stateUrls = (root) => Object.keys(readState(root).urls);
const existsState = (root) => existsSync(statePath(root));

const root = mkdtempSync(join(tmpdir(), 'baidu-cursor-'));
try {
  writeSitemap(root);

  console.log(`场景：${TOTAL} 条 URL，配额 ${QUOTA} 条/天\n`);

  console.log('第 1 天（配额 10）');
  const d1 = await runScript(root, QUOTA);
  check(d1.code === 0, `退出码 0（实际 ${d1.code}）`);
  check(/汇总：成功推送 10 \/ 25 条/.test(d1.out), '推送 10 条成功');
  check(existsState(root), '生成了进度文件');
  check(stateUrls(root).length === 10, `进度文件记录 10 条（实际 ${stateUrls(root).length}）`);
  const day1 = new Set(d1.pushed);
  check(day1.size === 10, `当天实际推了 10 条不同 URL（实际 ${day1.size}）`);

  console.log('\n第 2 天（配额重置为 10）—— 回归重点：必须推下一批，而非重复上一批');
  const d2 = await runScript(root, QUOTA);
  check(/汇总：成功推送 10 \/ 15 条/.test(d2.out), '本期计划 15 条，推成功 10 条');
  check(stateUrls(root).length === 20, `累计进度 20 条（实际 ${stateUrls(root).length}）`);
  const overlap = d2.pushed.filter((u) => day1.has(u));
  check(overlap.length === 0, `两批 URL 零重叠（重叠 ${overlap.length} 条）`);
  check(new Set(d2.pushed).size === 10, `第 2 天推了 10 条不同 URL（实际 ${new Set(d2.pushed).size}）`);

  console.log('\n第 3 天（配额为 0，模拟当天额度被别处用掉）');
  const d3 = await runScript(root, 0);
  check(/over quota|配额已用尽/.test(d3.out), '识别为配额用尽（软失败）');
  check(stateUrls(root).length === 20, `进度仍为 20 条，未被误记（实际 ${stateUrls(root).length}）`);
  check(d3.code === 0, '退出码 0（配额用尽不是错误）');

  console.log('\n第 4 天（配额 10，只剩 5 条待推）');
  const d4 = await runScript(root, QUOTA);
  check(/成功推送 5 \/ 5 条/.test(d4.out), '本期计划 5 条，全部成功');
  check(stateUrls(root).length === TOTAL, `进度 ${TOTAL} 条（实际 ${stateUrls(root).length}）`);
  check(/全部 25 条 URL 已推送完成/.test(d4.out), '输出「全部推完」终止信号');

  console.log('\n第 5 天（已全推完）');
  const d5 = await runScript(root, QUOTA);
  check(d5.code === 0, '退出码 0');
  check(d5.pushed.length === 0, `未发出任何推送请求（实际 ${d5.pushed.length} 条）`);
  check(/无待推 URL —— 本任务可停止/.test(d5.out), '输出「本任务可停止」');

  console.log('\n第 6 天（所有页面内容更新，lastmod 变新）');
  writeSitemap(root, '2026-10-20');
  const d6 = await runScript(root, QUOTA);
  check(stateUrls(root).length === TOTAL, '进度总数不变（不重复计数）');
  check(new Set(d6.pushed).size === QUOTA, `按配额推 ${QUOTA} 条，不因「改动多」而超额（实际 ${new Set(d6.pushed).size}）`);

  console.log('\n--force 全量重推');
  const d7 = await runScript(root, QUOTA, ['--force']);
  check(new Set(d7.pushed).size === QUOTA, `--force 后照旧按配额推 ${QUOTA} 条（实际 ${new Set(d7.pushed).size}）`);
  check(stateUrls(root).length === TOTAL, '进度不因重推而膨胀');
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failed > 0) {
  console.error(`\n✗ ${failed} 项断言失败`);
  process.exit(1);
}
console.log('\n✓ 全部通过：游标按预期前进，不会重复推送同一批 URL。');
