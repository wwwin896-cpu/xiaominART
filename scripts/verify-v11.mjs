// @ts-nocheck —— 一次性验证脚本（CI astro check 不扫描 dist 外目录，但仍加保护）
import { chromium } from '/root/.nvm/versions/node/v22.13.1/lib/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4173/';
const out = [];
const log = (k, v) => out.push(`${k}: ${v}`);

// ── 移动端 ──
const mb = await chromium.launch();
const mctx = await mb.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mp = await mctx.newPage();
mp.on('pageerror', (e) => log('MOBILE pageerror', e.message));
await mp.goto(BASE, { waitUntil: 'networkidle' });
const btn = mp.getByRole('button', { name: '仅必要' });
if (await btn.count()) await btn.click();

// 1 包装图文案
log('1 cap new', await mp.locator('.mcore-pack-cap strong').innerText());
// 2 场景图换新
const sceneSrc = await mp.locator('.mshow-scene img').getAttribute('src');
log('2 scene src', sceneSrc);
const loaded = await mp.locator('.mshow-scene img').evaluate((i) => i.complete && i.naturalWidth > 0);
log('2 scene loaded', loaded);
// 4 页脚胶囊
const pills = mp.locator('.footer-pills');
log('4 pills visible', await pills.isVisible());
log('4 pill count', await mp.locator('.footer-pill').count());
log('4 has 我的收藏', await mp.locator('.footer-pill', { hasText: '我的收藏' }).count());
await mp.locator('.footer-pills').scrollIntoViewIfNeeded();
const pillBox = await mp.locator('.footer-pill').first().boundingBox();
log('4 pill height ok', pillBox && pillBox.height < 40);
// 我的收藏点开抽屉
await mp.locator('.footer-pill', { hasText: '我的收藏' }).click();
await mp.waitForTimeout(500);
log('4 wishlist drawer opens', await mp.locator('[data-wishlist-drawer]').isVisible().catch(() => false) || await mp.evaluate(() => !!document.querySelector('.wishlist-drawer:not([hidden]), [data-wishlist-open-panel]:not([hidden])')));
await mp.screenshot({ path: '/tmp/v11-mobile-footer.png' });
await mb.close();

// ── 桌面端 ──
const db = await chromium.launch();
const dp = await db.newPage({ viewport: { width: 1440, height: 900 } });
dp.on('pageerror', (e) => log('DESKTOP pageerror', e.message));
await dp.goto(BASE, { waitUntil: 'networkidle' });
const dbtn = dp.getByRole('button', { name: '仅必要' });
if (await dbtn.count()) await dbtn.click();
log('D pills visible', await dp.locator('.footer-pills').isVisible());
await dp.locator('.footer-pills').scrollIntoViewIfNeeded();
await dp.screenshot({ path: '/tmp/v11-desktop-footer.png' });
// 3 gifts 页标题
await dp.goto(BASE + 'gifts/', { waitUntil: 'networkidle' });
log('3 gifts h2', await dp.locator('#paths-title').innerText());
await db.close();

console.log(out.join('\n'));
