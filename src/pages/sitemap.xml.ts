import type { APIRoute } from 'astro';
import { getGiftCatalog } from '../lib/keystatic';

// sitemap 只收录真实存在、未被重定向、且只有一个 URL 的最终页面。
//
// 2026-09-28 去重调整（原因见 public/_redirects 第二节）：
//   · 移除 inspiration/            —— 内容与 gifts/ 重复，已整体下线
//   · 移除 occasions/ recipients/  —— 与 gift-guide/by-occasion/（by-recipient/）重复
//   · 移除 business-custom/        —— 与 business-gifts/ 重复
//   · 移除 discover/               —— 站内软跳转页，已改为 301
//   · 商品详情不再同时输出 gifts/{slug}/ 与 gift-guide/{slug}/ 两个 URL
// 早前已通过 301 处理的旧地址（/custom/ /faq/ /art-gift/ /blog/ /en/ /commission/ /business/）
// 同样不在此列。
const LASTMOD = '2026-09-28';

const staticPaths = [
  '',
  // 核心导航（对应 src/data/content.ts 的 navItems；artists/ 已并入「关于我们·小民其人」，页面保留）
  'gifts/',
  'gift-guide/',
  'gift-guide/by-occasion/',
  'gift-guide/by-recipient/',
  'scenes/',
  'artists/',
  'business-gifts/',
  'about/',
  // 转化与信任
  'custom-commission/',
  'contact/',
  'help/',
  // 内容与参考
  'journal/',
  'art-direction/',
  'pricing-guide/',
  // 独立页面
  'works/',
  'stories/',
  'your-story/',
  'referral/',
  'seasons/',
  'blessings/',
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://xiaominart.com')).toString().replace(/\/$/, '');
  // 商品只有一个陈列位置：/gifts/{slug}/
  const productPaths = getGiftCatalog().products.map((product) => `gifts/${product.slug}/`);
  const paths = [...staticPaths, ...productPaths];
  const body = paths
    .map((path) => `  <url><loc>${base}/${path}</loc><lastmod>${LASTMOD}</lastmod></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
