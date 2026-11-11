#!/usr/bin/env node
// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// 分析埋点验收（2026-11-02）
//
// 业主的验收标准是「Network 里看到 hm.js 带 siteId 加载才算」，
// 所以这个脚本不看代码、只看**真实浏览器发出的请求**：
//
//   1. 未同意时：零个 hm.baidu.com 请求（合规：不是先加载再屏蔽）
//   2. 点「同意并启用」后：hm.js?<siteId> 真的 200 且返回脚本本体
//      （百度对未注册的 ID 也会返回 200，但 body 为空 —— 所以必须比字节数）
//   3. 四段漏斗事件真的 POST 到 /api/event：
//        详情浏览 / 加心愿单 / 点击获取方案 / 表单提交成功
//   4. 每条事件都带渠道字段 ch（UTM 归因）
//
// 用法：
//   npm run build && node scripts/verify-analytics.mjs
//   node scripts/verify-analytics.mjs --url=https://xiaominart.com   # 直接验线上
//
// 线上模式不拦截 /api/*，所以表单提交一项会跳过（不往真实库写测试线索）。
// ─────────────────────────────────────────────────────────────

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const argUrl = process.argv.find((a) => a.startsWith('--url='))?.slice(6);
const LIVE = Boolean(argUrl);

const BAIDU_ID = 'ecd08d2b5b02b8982ae7fdf7836e8a3b';

// ── 静态服务器（模拟 Cloudflare Pages 的目录索引行为）──
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function startServer(port = 0) {
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent((req.url || '/').split('?')[0]);
      let file = join(DIST, path);
      if (existsSync(file) && (await stat(file)).isDirectory()) file = join(file, 'index.html');
      if (!existsSync(file)) {
        // 无尾斜杠的目录 → 补斜杠（与线上 301 行为等价，脚本内部不需要跟跳转）
        if (existsSync(join(DIST, path, 'index.html'))) {
          res.writeHead(301, { Location: `${path}/` });
          res.end();
          return;
        }
        const notFound = join(DIST, '404.html');
        const body = existsSync(notFound) ? await readFile(notFound) : Buffer.from('404');
        res.writeHead(404, { 'Content-Type': MIME['.html'] });
        res.end(body);
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(500).end('500');
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

async function loadPlaywright() {
  const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')).href);
}

// ── 断言收集 ──
const results = [];
function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  const mark = pass ? '✅' : '❌';
  console.log(`${mark} ${name}${detail ? `  —  ${detail}` : ''}`);
}

/** 从 dist 里挑一个真实存在的商品详情页，避免硬编码 slug 随内容变动而失效 */
async function pickGiftDetail() {
  const dir = join(DIST, 'gifts');
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (existsSync(join(dir, entry.name, 'index.html'))) return `/gifts/${entry.name}/`;
  }
  return null;
}

async function main() {
  if (!LIVE && !existsSync(join(DIST, 'index.html'))) {
    console.error('找不到 dist/index.html —— 先跑 npm run build');
    process.exit(1);
  }
  const server = LIVE ? null : await startServer();
  const base = LIVE ? argUrl.replace(/\/$/, '') : `http://127.0.0.1:${server.address().port}`;
  console.log(`\n被测站点：${base}${LIVE ? '（线上）' : '（本地 dist）'}\n`);

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();

  const events = [];
  const baiduReqs = [];
  const baiduRes = [];

  // 拦截第一方上报，只记录不落库（本地无 Functions；线上也不该写入测试线索）
  await ctx.route('**/api/event', async (route) => {
    try { events.push(JSON.parse(route.request().postData() || '{}')); } catch { /* 忽略 */ }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await ctx.route('**/api/lead', async (route) => {
    if (LIVE) return route.continue();
    lastLead = route.request().postData() || '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  page.on('request', (r) => { if (/hm\.baidu\.com/.test(r.url())) baiduReqs.push(r.url()); });
  page.on('response', async (r) => {
    if (!/hm\.baidu\.com/.test(r.url())) return;
    let len = -1;
    try { len = (await r.body()).length; } catch { len = -1; }
    baiduRes.push({ url: r.url(), status: r.status(), len });
  });

  let lastLead = '';

  // ① 未同意：不应有任何百度请求
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  check('未同意时零个 hm.baidu.com 请求', baiduReqs.length === 0, `实际 ${baiduReqs.length} 个`);
  const html = await page.content();
  check('HTML 里能查到站点 ID（baidu-tongji-id）', html.includes(BAIDU_ID), `期望含 ${BAIDU_ID.slice(0, 8)}…`);

  // ② 点「同意并启用」→ hm.js 必须真的加载出脚本
  const accept = page.locator('[data-consent="accept"]');
  if (await accept.count()) {
    await accept.first().click({ force: true });
  } else {
    await page.evaluate(() => {
      try { localStorage.setItem('xiaominart-consent', 'accept'); } catch { /* 忽略 */ }
      window.__xmConsent = true;
      window.__xmLoadAnalytics?.();
    });
  }
  await page.waitForTimeout(6000);
  const hmjs = baiduRes.find((r) => /hm\.js\?/.test(r.url));
  check('同意后 hm.js 带 siteId 请求成功', Boolean(hmjs && hmjs.status === 200), hmjs ? `${hmjs.status} · ${hmjs.len}B` : '没发出请求');
  check('hm.js 返回脚本本体（非空壳）', Boolean(hmjs && hmjs.len > 10000), hmjs ? `${hmjs.len}B（<10KB 说明 ID 无效，百度返回空）` : '—');
  check('hm.js 的 siteId 与配置一致', Boolean(hmjs && hmjs.url.includes(BAIDU_ID)), hmjs?.url?.split('?')[1] || '—');
  const gif = baiduRes.find((r) => /hm\.gif/.test(r.url));
  check('打点请求 hm.gif 已发出', Boolean(gif && gif.status === 200), gif ? `${gif.status}` : '未发出（本地域名下百度可能不上报，线上应出现）');
  const hmt = await page.evaluate(() => {
    const h = window._hmt;
    return h && typeof h === 'object' ? { keys: Object.keys(h), isArr: Array.isArray(h) } : null;
  });
  check('window._hmt 已实例化', Boolean(hmt && !hmt.isArr && hmt.keys.includes('push')), hmt ? hmt.keys.join(',') : 'null');

  // ③ 落地上报 + 渠道字段
  const landing = events.find((e) => e.name === 'landing_view');
  check('landing_view 已上报', Boolean(landing), landing ? `ch=${landing.data?.ch}` : '未收到');
  check('事件带渠道字段 ch', Boolean(landing?.data?.ch), landing?.data?.ch || '—');

  // ③b UTM 四个渠道全部能识别（每个渠道独立标签页，避免首触归因互相污染）
  const CHANNEL_CASES = [
    ['小红书', 'utm_source=xiaohongshu&utm_medium=social&utm_campaign=xhs-note-01', 'xiaohongshu'],
    ['微信', 'utm_source=wechat&utm_medium=social&utm_campaign=moments-spring', 'wechat'],
    ['线下扫码', 'utm_source=offline&utm_medium=qr&utm_campaign=museum-a', 'offline'],
    ['自然搜索', 'utm_source=baidu&utm_medium=organic', 'search'],
  ];
  for (const [label, query, expect] of CHANNEL_CASES) {
    const tab = await ctx.newPage();
    const seen = [];
    tab.on('request', (r) => {
      if (!/\/api\/event/.test(r.url())) return;
      try { seen.push(JSON.parse(r.postData() || '{}')); } catch { /* 忽略 */ }
    });
    await tab.goto(`${base}/?${query}`, { waitUntil: 'domcontentloaded' });
    await tab.waitForTimeout(900);
    const got = seen.find((e) => e.name === 'landing_view');
    check(`UTM 渠道识别：${label} → ${expect}`, got?.data?.ch === expect, got ? `实际 ${got.data.ch}（src=${got.data.src} cmp=${got.data.cmp}）` : '未收到 landing_view');
    await tab.close();
  }

  // ④ 详情浏览
  // v30 后 /gifts/ 主列表已不放商品卡，商品详情入口集中在 /gifts/ready-made/（现货）；
  // 统一从 ready-made 列表页抓第一个详情链接，本地与线上同一套逻辑。
  let detailPath = null;
  try {
    await page.goto(`${base}/gifts/ready-made/`, { waitUntil: 'networkidle' });
    detailPath = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href*="/gifts/ready-made/"]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && !/\/gifts\/ready-made\/?$/.test(h));
      return links[0] || null;
    });
  } catch { /* 线上抓取失败时跳过详情段 */ }
  if (!detailPath && !LIVE) detailPath = await pickGiftDetail();
  if (detailPath) {
    await page.goto(`${base}${detailPath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const view = events.find((e) => e.name === 'gift_detail_view');
    check('商品详情浏览 gift_detail_view 已上报', Boolean(view), view ? `slug=${view.data?.slug}` : `页面 ${detailPath} 未上报`);
    check('详情浏览带 slug 与 kind', Boolean(view?.data?.slug && view?.data?.kind), view ? `${view.data.slug}/${view.data.kind}` : '—');

    // ⑤ 加心愿单
    const wish = page.locator('[data-wishlist]').first();
    if (await wish.count()) {
      await wish.click({ force: true });
      await page.waitForTimeout(500);
      const add = events.find((e) => e.name === 'wishlist_add');
      check('加入心愿单 wishlist_add 已上报', Boolean(add), add ? `slug=${add.data?.slug} place=${add.data?.place}` : '未收到');
    } else {
      check('加入心愿单 wishlist_add 已上报', false, '页面上找不到 [data-wishlist]');
    }

    // ⑥ 点击获取方案（详情页 CTA：好礼是获取送礼建议，现货是「咨询这一幅」）
    const CTA_EVENTS = ['gift_advice_click', 'custom_inquiry_start', 'ready_work_click'];
    const cta = page.locator(CTA_EVENTS.map((e) => `[data-event="${e}"]`).join(', ')).first();
    if (await cta.count()) {
      await Promise.all([
        page.waitForTimeout(1200),
        cta.click({ force: true }).catch(() => undefined),
      ]);
      const advice = events.find((e) => CTA_EVENTS.includes(e.name));
      check('点击获取方案事件已上报', Boolean(advice), advice ? `${advice.name}` : '未收到');
    } else {
      check('点击获取方案事件已上报', false, '详情页找不到对应 CTA');
    }
  } else {
    check('商品详情浏览 gift_detail_view 已上报', false, 'dist 里找不到商品详情页');
  }

  // ⑦ 表单提交成功（本地拦截 /api/lead 返回 ok）
  if (!LIVE) {
    await page.goto(`${base}/custom-commission/`, { waitUntil: 'networkidle' });
    // 选择器必须限定在 .commission-form 内：页面上还有订阅表单，
    // 裸 button[type=submit] 会命中两个（Playwright strict 模式直接报错）。
    await page.fill('#commission-intention', '验收脚本自动填写：想给书房写一幅安静的字。').catch(() => undefined);
    await page.locator('[data-step="1"] [data-step-next]').first().click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(250);
    await page.locator('[data-step="2"] [data-step-next]').click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(250);
    await page.fill('#commission-name', '验收测试').catch(() => undefined);
    await page.fill('#commission-contact', 'qa@example.com').catch(() => undefined);
    await page.locator('.commission-form button[type="submit"]').click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(1800);
    const ok = events.find((e) => e.name === 'lead_submit_success');
    check('表单提交成功 lead_submit_success 已上报', Boolean(ok), ok ? `form=${ok.data?.form}` : '未收到');
    check('表单提交确实调用了 /api/lead', Boolean(lastLead), lastLead ? `${String(lastLead).slice(0, 60)}…` : '未发出');
  }

  // ⑧ 汇总
  const total = results.filter((r) => r.pass).length;
  console.log(`\n结果：${total}/${results.length} 通过\n`);
  if (events.length) {
    console.log('本次收到的第一方事件：');
    events.forEach((e) => console.log(`  · ${e.name}  ${JSON.stringify(e.data)}`));
  }

  await browser.close();
  if (server) server.close();
  process.exit(total === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
