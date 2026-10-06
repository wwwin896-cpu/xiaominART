import type { APIRoute } from 'astro';
import { getGiftCatalog } from '../lib/keystatic';
import { readyMadeWorks, artists, work, channelPages, blessings } from '../data/content';
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
//   · 补录 5 个祝愿词条页 blessings/{slug}/；修正 partners 四个页面的信号文件路径
//     （实际是平铺的 publishing.astro 等，此前写成 xxx/index.astro 会让 lastmod 失真）
//   · lastmod 信号文件只取「该页真正专属的内容源」：全站共用的 src/data/content.ts
//     不再挂到静态页上，否则每改一次导航，全站 lastmod 都会被拉平成同一天，
//     反而失去「这一页最近动过」的参考价值。详情页例外——它们的正文确实
//     由 content.ts 里的数组驱动。
const P = (p: string) => `src/pages/${p}`;
const CONTENT = ['src/data/content.ts'];

// 静态路由：lastmod 只看该页自身模板（+ 确实驱动它内容的数据文件）
const staticRoutes: { path: string; files: string[] }[] = [
  { path: '', files: [P('index.astro')] },
  // 核心导航（对应 src/data/content.ts 的 navItems）
  { path: 'gifts/', files: [P('gifts/index.astro'), 'src/lib/keystatic.ts'] },
  { path: 'gifts/ready-made/', files: [P('gifts/ready-made/index.astro'), ...CONTENT] },
  { path: 'gift-guide/', files: [P('gift-guide/index.astro'), 'src/lib/keystatic.ts'] },
  { path: 'scenes/', files: [P('scenes/index.astro')] },
  { path: 'artists/', files: [P('artists/index.astro'), ...CONTENT] },
  { path: 'business-gifts/', files: [P('business-gifts/index.astro')] },
  // 机构合作（注意：这四个页面是平铺文件 xxx.astro，不是 xxx/index.astro）
  { path: 'partners/', files: [P('partners/index.astro')] },
  { path: 'partners/publishing/', files: [P('partners/publishing.astro')] },
  { path: 'partners/museum-tourism/', files: [P('partners/museum-tourism.astro')] },
  { path: 'partners/heritage/', files: [P('partners/heritage.astro')] },
  { path: 'partners/cases/', files: [P('partners/cases.astro')] },
  { path: 'about/', files: [P('about/index.astro')] },
  // 转化与信任
  { path: 'custom-commission/', files: [P('custom-commission/index.astro')] },
  { path: 'contact/', files: [P('contact/index.astro')] },
  { path: 'help/', files: [P('help/index.astro')] },
  // 内容与参考
  { path: 'art-direction/', files: [P('art-direction/index.astro')] },
  { path: 'pricing-guide/', files: [P('pricing-guide/index.astro')] },
  // 独立页面
  { path: 'works/', files: [P('works/index.astro'), ...CONTENT] },
  { path: 'stories/', files: [P('stories/index.astro')] },
  { path: 'your-story/', files: [P('your-story/index.astro')] },
  { path: 'referral/', files: [P('referral/index.astro')] },
  { path: 'seasons/', files: [P('seasons/index.astro')] },
  { path: 'blessings/', files: [P('blessings/index.astro')] },
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
  // 祝愿词条（福/禄/寿/喜/财）——索引页与首页 BlessingRail 均有站内链接，
  // 每页有独立字义与适用场景文案，是「福字书法」这类长尾词的自然落点
  ...blessings.map((b) => ({
    path: `blessings/${b.slug}/`,
    files: [P('blessings/[slug].astro'), ...CONTENT],
  })),
];

// 暂不收录（保持现状，非遗漏）：
//   · seasons/{slug}/   四季详情页当前是占位文案（「更多节气内容将持续呈现」），
//                       属薄内容页，等补齐实质内容后再加入本清单
//   · occasions|recipients/{slug}/  索引页已 301、无导航入口，仅作内容底稿
//   · progress/ wishlist/ keystatic/  功能页与后台，不需要收录

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
