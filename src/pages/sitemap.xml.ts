import type { APIRoute } from 'astro';
import { getGiftCatalog } from '../lib/keystatic';
import { readyMadeWorks, artists, work, channelPages } from '../data/content';
import { lastmodFor } from '../lib/seo';

// sitemap 只收录真实存在、未被重定向、且只有一个 URL 的最终页面。
//
// 2026-09-28 去重调整（原因见 public/_redirects 第二节）：
//   · 移除 inspiration/            —— 内容与 gifts/ 重复，已整体下线
//   · 移除 occasions/ recipients/  —— 索引页已 301，详情页保留为内容底稿（无导航入口，不收录）
//   · 移除 business-custom/        —— 与 business-gifts/ 重复
//   · 移除 discover/               —— 站内软跳转页，已改为 301
//   · 商品详情不再同时输出 gifts/{slug}/ 与 gift-guide/{slug}/ 两个 URL
// 早前已通过 301 处理的旧地址（/custom/ /faq/ /art-gift/ /blog/ /en/ /commission/ /business/）
// 同样不在此列。
//
// 2026-10-06 重构（SEO 运营质量）：
//   · 补齐此前遗漏的详情页：现货 12 幅（gifts/ready-made/{slug}/）、
//     艺术家 2 位（artists/{slug}/）、渠道专题（channel/{slug}/）、作品（works/{slug}/）
//   · lastmod 不再固定日期：按每个页面的内容源文件最后一次 git 提交时间生成
//     （见 src/lib/seo.ts；CI 需要 fetch-depth: 0）
const P = (p: string) => `src/pages/${p}`;
const CONTENT = ['src/data/content.ts'];

// 静态路由：每项带自己的信号文件（页面模板 + 驱动其内容的数据文件）
const staticRoutes: { path: string; files: string[] }[] = [
  { path: '', files: [P('index.astro'), ...CONTENT] },
  // 核心导航（对应 src/data/content.ts 的 navItems）
  { path: 'gifts/', files: [P('gifts/index.astro'), ...CONTENT] },
  { path: 'gifts/ready-made/', files: [P('gifts/ready-made/index.astro'), ...CONTENT] },
  { path: 'gift-guide/', files: [P('gift-guide/index.astro'), 'src/lib/keystatic.ts', ...CONTENT] },
  { path: 'scenes/', files: [P('scenes/index.astro'), ...CONTENT] },
  { path: 'artists/', files: [P('artists/index.astro'), ...CONTENT] },
  { path: 'business-gifts/', files: [P('business-gifts/index.astro'), ...CONTENT] },
  // 机构合作
  { path: 'partners/', files: [P('partners/index.astro'), ...CONTENT] },
  { path: 'partners/publishing/', files: [P('partners/publishing/index.astro'), ...CONTENT] },
  { path: 'partners/museum-tourism/', files: [P('partners/museum-tourism/index.astro'), ...CONTENT] },
  { path: 'partners/heritage/', files: [P('partners/heritage/index.astro'), ...CONTENT] },
  { path: 'partners/cases/', files: [P('partners/cases/index.astro'), ...CONTENT] },
  { path: 'about/', files: [P('about/index.astro'), ...CONTENT] },
  // 转化与信任
  { path: 'custom-commission/', files: [P('custom-commission/index.astro'), ...CONTENT] },
  { path: 'contact/', files: [P('contact/index.astro'), ...CONTENT] },
  { path: 'help/', files: [P('help/index.astro'), ...CONTENT] },
  // 内容与参考
  { path: 'art-direction/', files: [P('art-direction/index.astro'), ...CONTENT] },
  { path: 'pricing-guide/', files: [P('pricing-guide/index.astro'), ...CONTENT] },
  // 独立页面
  { path: 'works/', files: [P('works/index.astro'), ...CONTENT] },
  { path: 'stories/', files: [P('stories/index.astro'), ...CONTENT] },
  { path: 'your-story/', files: [P('your-story/index.astro'), ...CONTENT] },
  { path: 'referral/', files: [P('referral/index.astro'), ...CONTENT] },
  { path: 'seasons/', files: [P('seasons/index.astro'), ...CONTENT] },
  { path: 'blessings/', files: [P('blessings/index.astro'), ...CONTENT] },
];

// 动态详情路由：从数据源枚举，不手写
const dynamicRoutes: { path: string; files: string[] }[] = [
  // 礼品详情（数据：src/content/products/*.yaml + content.ts 兜底）
  ...getGiftCatalog().products.map((product) => ({
    path: `gifts/${product.slug}/`,
    files: [P('gifts/[slug].astro'), 'src/lib/keystatic.ts', ...CONTENT],
  })),
  // 现货详情（12 幅）
  ...readyMadeWorks.map((w) => ({
    path: `gifts/ready-made/${w.slug}/`,
    files: [P('gifts/ready-made/[slug].astro'), ...CONTENT],
  })),
  // 艺术家详情
  ...artists.map((a) => ({
    path: `artists/${a.slug}/`,
    files: [P('artists/[slug].astro'), ...CONTENT],
  })),
  // 作品详情（概念页）
  { path: `works/${work.slug}/`, files: [P('works/[slug].astro'), ...CONTENT] },
  // 渠道专题落地页
  ...channelPages.map((c) => ({
    path: `channel/${c.slug}/`,
    files: [P('channel/[slug].astro'), ...CONTENT],
  })),
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://xiaominart.com')).toString().replace(/\/$/, '');
  const routes = [...staticRoutes, ...dynamicRoutes];
  const seen = new Set<string>();
  const body = routes
    .filter(({ path }) => (seen.has(path) ? false : (seen.add(path), true)))
    .map(({ path, files }) => {
      const lastmod = lastmodFor(files);
      return `  <url><loc>${base}/${path}</loc><lastmod>${lastmod}</lastmod></url>`;
    })
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
