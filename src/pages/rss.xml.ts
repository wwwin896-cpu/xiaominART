// ─────────────────────────────────────────────────────────────
// RSS 2.0 订阅源（2026-10-18）：「订阅和关注」里「关注」的真实通道。
// 为什么做 RSS：业主要做真正的订阅+关注；公众号尚在筹备（挂起中），
// RSS 是不依赖任何第三方平台、AI/阅读器都能直接抓的关注方式（也是 GEO 友好信号）。
// 内容策略：手工精选条目（上新即手写一条加进 items），不追求全站文章化。
// 注意：rss.xml 不进 sitemap 白名单（check-sitemap.mjs 只收 index.html，天然不冲突）。
// ─────────────────────────────────────────────────────────────
import type { APIRoute } from 'astro';

const SITE = 'https://xiaominart.com';

type Item = { title: string; link: string; date: string; desc: string };

const items: Item[] = [
  {
    title: '字游记 · 第一站：十二生肖',
    link: '/zodiac/',
    date: '2026-10-17',
    desc: '沿着字源出发的连载开了头：甲骨文十二生肖，十二个字，十二种藏在时光里的守护。黑胡桃木框摆件，画芯 16×8cm。',
  },
  {
    title: '琴瑟和鸣：为婚庆纪念写的一幅字',
    link: '/gifts/qin-se-he-ming-gift/',
    date: '2026-10-17',
    desc: '订婚、结婚、周年——把两个人的名字与祝愿写成一幅。朱砂红底古文字，装裱外框 40.5×17.5cm。',
  },
  {
    title: '现货书法作品：已写好、可直接发出',
    link: '/gifts/ready-made/',
    date: '2026-10-15',
    desc: '十二幅小幅手写原作，编码验真，48 小时内顺丰发出，¥300 起。',
  },
  {
    title: '节气礼物：按二十四节气选一幅应时的字',
    link: '/seasons/',
    date: '2026-10-16',
    desc: '二十四节气、十二生肖、福禄寿喜财——按传统的时间选礼物，让问候踩在节拍上。',
  },
  {
    title: '手写书法原作：一字一源的字形考据',
    link: '/works/',
    date: '2026-10-12',
    desc: '每个字有它自己的来处。从甲骨、青铜、石鼓与碑刻里长出来的字，落到今天的案头。',
  },
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  `<title>${esc('小民艺术 · 字游记与创作笔记')}</title>`,
  `<link>${SITE}</link>`,
  `<description>${esc('把古文字写进日常：字游记连载、新作品与字源故事。')}</description>`,
  '<language>zh-CN</language>',
  `<lastBuildDate>${new Date('2026-10-18T00:00:00+08:00').toUTCString()}</lastBuildDate>`,
  `<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />`,
  ...items.map((it) => {
    const url = `${SITE}${it.link}`;
    return [
      '<item>',
      `<title>${esc(it.title)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(`${it.date}T10:00:00+08:00`).toUTCString()}</pubDate>`,
      `<description>${esc(it.desc)}</description>`,
      '</item>',
    ].join('');
  }),
  '</channel>',
  '</rss>',
].join('\n');

export const GET: APIRoute = async () =>
  new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
