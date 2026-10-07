#!/usr/bin/env node
// 发布校验（T-08「上线即入图」）：构建完成后核对 dist 页面与 sitemap.xml 的一致性。
// - dist 里存在、可索引、但不在 sitemap 的页面 → 报错（除非在 ALLOWLIST）
// - sitemap 里有、但 dist 不存在的 URL → 报错（死图）
// 用法：npm run build && npm run check:sitemap
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const sitemapPath = join(dist, 'sitemap.xml');

if (!existsSync(sitemapPath)) {
  console.error('✗ 未找到 dist/sitemap.xml，请先 npm run build');
  process.exit(1);
}

// 允许不在 sitemap 的页面：404、后台、功能页、接口
const ALLOWLIST = new Set([
  '/404',           // 404.html
  '/keystatic',     // 后台入口（SPA 壳）
  '/progress',      // 定制进度（noindex 功能页；暂无站内入口，等接入真实项目查询后再定去留）
  '/wishlist',      // 心愿单（noindex，localStorage 本地功能页；有移动端底栏入口，故不入 sitemap）
]);

// ---------- 收集 dist 里的页面 ----------
/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (name === 'index.html') out.push(full);
  }
  return out;
}

const pages = new Set();
for (const file of walk(dist)) {
  const rel = relative(dist, file).replace(/\\/g, '/');          // e.g. gifts/ready-made/chan/index.html
  const path = rel === 'index.html' ? '/' : `/${dirname(rel)}`;  // 根 index.html 特判，避免出现 /./
  const clean = path === '/' ? '/' : path.replace(/\/$/, '');
  pages.add(clean);
}
pages.delete('/'); // 首页单独处理

// ---------- 收集 sitemap 里的路径 ----------
const sitemapXml = readFileSync(sitemapPath, 'utf8');
const sitemapPaths = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => {
      try { return new URL(m[1]).pathname.replace(/\/$/, '') || '/'; } catch { return null; }
    })
    .filter((p) => typeof p === 'string')
);

// ---------- 比对 ----------
const missingInSitemap = [...pages].filter(
  (p) => !sitemapPaths.has(p) && !sitemapPaths.has(`${p}/`) && !ALLOWLIST.has(p)
);
const deadInSitemap = [...sitemapPaths].filter((p) => p !== '/' && !pages.has(p) && !ALLOWLIST.has(p));

let failed = false;
if (missingInSitemap.length > 0) {
  failed = true;
  console.error(`✗ 以下 ${missingInSitemap.length} 个已构建页面不在 sitemap 中（应收录或加入 ALLOWLIST）：`);
  missingInSitemap.forEach((p) => console.error(`   ${p}/`));
}
if (deadInSitemap.length > 0) {
  failed = true;
  console.error(`✗ sitemap 中以下 ${deadInSitemap.length} 个 URL 没有对应的构建产物：`);
  deadInSitemap.forEach((p) => console.error(`   ${p}/`));
}
if (!failed) {
  console.log(`✓ sitemap 一致性校验通过：dist ${pages.size + 1} 个页面与 sitemap ${sitemapPaths.size} 条 URL 完全对齐`);
}
process.exit(failed ? 1 : 0);
