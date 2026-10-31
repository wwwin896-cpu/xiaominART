// 第四批四项改动 · 双端验证
import { chromium } from '/root/.nvm/versions/node/v22.13.1/lib/node_modules/playwright/index.mjs';

const BASE = 'http://localhost:4173/';
const out = [];
const log = (k, v) => out.push(`${k}: ${v}`);

// ── 移动端 390×844 ──
const mb = await chromium.launch();
const mctx = await mb.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mp = await mctx.newPage();
mp.on('pageerror', (e) => log('MOBILE pageerror', e.message));
await mp.goto(BASE, { waitUntil: 'networkidle' });
const btn = mp.getByRole('button', { name: '仅必要' });
if (await btn.count()) await btn.click();

// ① 包装图块：可见、位于双核卡之后场景图之前
const pack = mp.locator('.mcore-pack');
log('① pack visible', await pack.isVisible());
const packBottom = await pack.evaluate((el) => el.getBoundingClientRect().bottom);
const sceneTop = await mp.locator('.mshow-scene').evaluate((el) => el.getBoundingClientRect().top);
const mcoreBottom = await mp.locator('.mcore-wrap').evaluate((el) => el.getBoundingClientRect().bottom);
log('① order mcore<pack<scene', mcoreBottom <= packBottom && packBottom <= sceneTop);
const packLoaded = await pack.evaluate((el) => { const i = el.querySelector('img'); return i && i.complete && i.naturalWidth > 0; });
log('① pack img loaded', packLoaded);

// ③ 右上角标签不存在；收藏键与价格行齐平
log('③ mshow-tag count', await mp.locator('.mshow-tag').count());
const favBox = await mp.locator('.mshow-tile[data-ms-tile="nan-xi-xin-ji"] .mshow-fav').boundingBox();
const priceBox = await mp.locator('.mshow-tile[data-ms-tile="nan-xi-xin-ji"] .mshow-tile-copy small').boundingBox();
log('③ fav/price overlap-y', favBox && priceBox ? Math.abs((favBox.y + favBox.height) - (priceBox.y + priceBox.height)) < 26 : 'N/A');

// ② 展开后自动收起
const expandBtn = mp.locator('[data-ms-expand]');
const visibleCount = async () => await mp.locator('[data-ms-tile]:visible').count();
log('② tiles before expand', await visibleCount());
await expandBtn.scrollIntoViewIfNeeded();
await expandBtn.click();
await mp.waitForTimeout(300);
log('② tiles after expand', await visibleCount());
log('② expand btn hidden', !(await expandBtn.isVisible()));
// 往下翻，让整个网格滚出视口上沿
await mp.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await mp.waitForTimeout(800);
log('② tiles after scroll-past', await visibleCount());
log('② expand btn back', await expandBtn.isVisible());

// ④ 两板块隐藏 + 抽屉菜单
log('④ choices hidden', await mp.locator('section.choices').isHidden());
log('④ zodiac hidden', await mp.locator('.zodiac-block').isHidden());
// 桌面 nav 不在移动端出现；开抽屉看菜单
await mp.evaluate(() => window.scrollTo(0, 0));
await mp.locator('.menu-toggle').click();
await mp.waitForTimeout(400);
const drawerText = await mp.locator('#site-nav').innerText();
log('④ drawer has 一字一礼', drawerText.includes('一字一礼'));
log('④ drawer has 小民好礼', drawerText.includes('小民好礼'));
log('④ drawer no top-level 小民好礼 duplicate', (drawerText.match(/小民好礼/g) || []).length === 1);
await mp.screenshot({ path: '/tmp/v10-mobile-drawer.png' });
await mb.close();

// ── 桌面端 1440×900：四项都不许变 ──
const db = await chromium.launch();
const dp = await db.newPage({ viewport: { width: 1440, height: 900 } });
dp.on('pageerror', (e) => log('DESKTOP pageerror', e.message));
await dp.goto(BASE, { waitUntil: 'networkidle' });
const dbtn = dp.getByRole('button', { name: '仅必要' });
if (await dbtn.count()) await dbtn.click();
log('D pack hidden', await dp.locator('.mcore-pack').isHidden());
log('D choices visible', await dp.locator('section.choices').isVisible());
log('D zodiac visible', await dp.locator('.zodiac-block').isVisible());
log('D nav 4 items', await dp.locator('nav#site-nav > .nav-item').count() === 4 || (log('D nav items actual', await dp.locator('nav#site-nav > .nav-item').count()), false));
log('D desk nav shows 一字一源', (await dp.locator('.nav-zh-desk').allInnerTexts()).includes('一字一源'));
log('D mshow hidden', await dp.locator('.mshow').isHidden());
await db.close();

console.log(out.join('\n'));
