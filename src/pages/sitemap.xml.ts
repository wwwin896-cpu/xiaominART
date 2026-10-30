import type { APIRoute } from 'astro';
import { getGiftCatalog } from '../lib/keystatic';
import { artists, work, channelPages, seasons } from '../data/content';
import { getReadyMadeWorks } from '../lib/ready-made';
import { getArchives } from '../lib/code-registry';
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
//
// 2026-10-07 补录（T-08，外部检查任务包）：seasons/{slug}/、occasions/{slug}/、recipients/{slug}/
//   · occasions / recipients 详情页是带商品网格的真实落地页（索引页才被 301）
//   · seasons 详情页偏薄但可索引，先入图；内容补齐后 lastmod 会自然更新
//   · 同步新增发布校验：scripts/check-sitemap.mjs 在构建后核对 dist 页面与 sitemap 的一致性
const P = (p: string) => `src/pages/${p}`;
const GH = (p: string) => `src/components/${p}`;
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
  // 企业礼赠四条业务线详情页（2026-10-15 新增）
  // ⚠️ GEO 要求：每条业务线独立可寻址 —— AI 助手回答用户问题时需要能指到具体 URL，
  //    单页 + 锚点对它不友好（分不清锚点内容的归属）。故这四条必须进 sitemap 白名单。
  { path: 'business-gifts/gifts/', files: [P('business-gifts/gifts.astro'), GH('BusinessCaseWall.astro'), GH('BusinessDetailPage.astro')] },
  { path: 'business-gifts/keep/', files: [P('business-gifts/keep.astro'), GH('BusinessCaseWall.astro'), GH('BusinessDetailPage.astro')] },
  { path: 'business-gifts/space/', files: [P('business-gifts/space.astro'), GH('BusinessCaseWall.astro'), GH('BusinessDetailPage.astro')] },
  { path: 'business-gifts/campus/', files: [P('business-gifts/campus.astro'), GH('BusinessCaseWall.astro'), GH('BusinessDetailPage.astro')] },
  // 定制业务（2026-10-19 导航改版）：聚合页 + 个人定制索引 + 五个方向页
  // ⚠️ 企业侧地址仍是 business-gifts/*，不改 /custom/corporate —— 保护已有收录。
  { path: 'custom/', files: [P('custom/index.astro')] },
  { path: 'custom/personal/', files: [P('custom/personal/index.astro')] },
  { path: 'custom/personal/gifting/', files: [P('custom/personal/gifting.astro'), GH('CustomDetailPage.astro')] },
  { path: 'custom/personal/wedding/', files: [P('custom/personal/wedding.astro'), GH('CustomDetailPage.astro')] },
  { path: 'custom/personal/housewarming/', files: [P('custom/personal/housewarming.astro'), GH('CustomDetailPage.astro')] },
  { path: 'custom/personal/study/', files: [P('custom/personal/study.astro'), GH('CustomDetailPage.astro')] },
  { path: 'custom/personal/festival/', files: [P('custom/personal/festival.astro'), GH('CustomDetailPage.astro')] },
  // 创作笔记（2026-10-19）：一字一源二级项，记录取字过程
  { path: 'notes/', files: [P('notes/index.astro')] },
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
  // 隐私政策（P1-04 收尾，2026-10-09）：页脚常驻入口，合规必备页
  { path: 'privacy/', files: [P('privacy/index.astro')] },
  // 内容与参考
  // 2026-10-15 精简：art-direction / pricing-guide / your-story / referral / blessings
  // 五个零内链页面已下线（301 见 public/_redirects）；blessings 数据保留备「字游记」
  // 独立页面
  { path: 'works/', files: [P('works/index.astro'), ...CONTENT] },
  { path: 'stories/', files: [P('stories/index.astro')] },
  { path: 'seasons/', files: [P('seasons/index.astro')] },
  // 字游记 · 第一辑（2026-10-17）：甲骨文十二生肖聚合页（业主《一字一源版块扩容》）
  { path: 'zodiac/', files: [P('zodiac/index.astro'), ...CONTENT] },
  // 非遗研学 Tab（2026-10-30 v5.0 移动端）：可索引内容页，入图
  { path: 'intangible/', files: [P('intangible/index.astro')] },
  // 作品编码查询入口（2026-10-14 新增，防伪体系）
  { path: 'verify/', files: [P('verify/index.astro'), 'src/lib/code-registry.ts', ...CONTENT] },
];

// 动态详情路由：从数据源枚举，不手写
const dynamicRoutes: { path: string; files: string[] }[] = [
  // 礼品详情（数据：src/content/products/*.yaml + content.ts 兜底）
  ...getGiftCatalog().products.map((product) => ({
    path: `gifts/${product.slug}/`,
    files: [P('gifts/[slug].astro'), 'src/lib/keystatic.ts', ...CONTENT],
  })),
  // 现货详情（12 幅）
  ...getReadyMadeWorks().map((w) => ({
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
  // 祝愿词条页已下线（2026-10-15 精简，301 回首页）；blessings 数据保留备「字游记」
  // 四季节气详情（2026-10-07 补录，内容偏薄但可索引）
  ...seasons.map((s) => ({
    path: `seasons/${s.slug}/`,
    files: [P('seasons/[slug].astro'), ...CONTENT],
  })),
  // 送礼场合 / 送礼对象落地页（2026-10-07 补录：带商品网格的真实内容页；被 301 的是索引页）
  ...getGiftCatalog().occasions.map((item) => ({
    path: `occasions/${item.slug}/`,
    files: [P('occasions/[slug].astro'), 'src/lib/keystatic.ts'],
  })),
  ...getGiftCatalog().recipients.map((item) => ({
    path: `recipients/${item.slug}/`,
    files: [P('recipients/[slug].astro'), 'src/lib/keystatic.ts'],
  })),
  // 作品公开档案页（2026-10-14 新增，防伪体系核心）
  // 每件在册作品的编码都是一个唯一 URL——既是对外验真的入口，
  // 也是「客户搜编码直接找到官网」的 SEO 落点。
  ...getArchives().map((a) => ({
    path: `verify/${a.parts.raw}/`,
    files: [P('verify/[code].astro'), 'src/lib/code-registry.ts', ...CONTENT],
  })),
];

// 暂不收录（保持现状，非遗漏）：
//   · occasions|recipients 的索引页（/occasions/ /recipients/）已整体 301 到 gift-guide/
//   · progress/ wishlist/ keystatic/  功能页与后台，不需要收录
// 发布校验：npm run check:sitemap（CI 在 build 后自动跑），任何可索引页漏图会直接报错

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
