import type { APIRoute } from 'astro';
import { getGiftCatalog } from '../lib/keystatic';

// sitemap 只收录真实存在且未被重定向的最终 URL。
// 旧页面（/custom/ /faq/ /art-gift/ /blog/ /en/ /commission/ /business/）已通过 vercel.json 301 至新地址。
const LASTMOD = '2026-09-26';

const staticPaths = [
  '',
  // 核心导航
  'gifts/',
  'gift-guide/',
  'gift-guide/by-occasion/',
  'gift-guide/by-recipient/',
  'business-gifts/',
  'about/',
  // 转化与信任
  'custom-commission/',
  'business-custom/',
  'pricing-guide/',
  'contact/',
  'help/',
  // 内容与参考
  'journal/',
  'art-direction/',
  'artists/',
  'works/',
  'inspiration/',
  'referral/',
  'discover/',
  'stories/',
  'your-story/',
  // 选礼场景索引
  'scenes/',
  'occasions/',
  'recipients/',
  'seasons/',
  'blessings/',
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://www.xiaominart.com')).toString().replace(/\/$/, '');
  const productPaths = getGiftCatalog()
    .products.flatMap((product) => [`gifts/${product.slug}/`, `gift-guide/${product.slug}/`]);
  const paths = [...staticPaths, ...productPaths];
  const body = paths
    .map((path) => `  <url><loc>${base}/${path}</loc><lastmod>${LASTMOD}</lastmod></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
