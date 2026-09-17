# xiaominART website

Astro + Sanity + Vercel starter for `xiaominart.com`. The current version follows the live brand direction: warm paper canvas, cinnabar accents, editorial serif typography, square rules and generous whitespace. It supports bilingual entry points and keeps Chinese as the factual source.

## Included

- 东方艺术定制平台首页：Hero、四步共创流程、灵感参考库、艺术家矩阵、B 端专区、艺术礼盒、About 与 Blog 引导。
- 固定双语导航：Custom Commission、Artists、Inspiration Gallery、Art Gift、About、Business Custom。
- 灵感参考库列表与详情页；每个案例都显示“案例仅作风格参考，不售卖同款 | For reference only, identical artwork is not for sale.”并导向定制表单。
- 定制表单页、艺术家列表与详情页、Blog 列表与文章页。
- 统一大地色色彩 token、衬线排版、直角边框、编辑式留白与克制动效。
- 不包含 checkout、payment、cart、stock、order 或现货销售承诺；所有 CTA 只导向定制表单、内容阅读或项目沟通。
- Sanity schema/query placeholders in `sanity/schemas/` and `src/lib/`。
- 可复用 UI 组件在 `src/components/`，文案包、组件交互文档和验收清单在 `docs/`。
- Vercel config and `.env.example` for later deployment and CMS connection。

## Local development

```bash
npm install
npm run dev
npm run check
npm run build
```

## Sanity handoff

Set the variables in `.env` using `.env.example`. The current UI uses local content in `src/data/content.ts` so it builds without a Sanity project. When the project ID is available, connect the query layer in `src/lib/sanity.ts` to the route data and add the remaining document types from `content-and-sanity-model.md` (season, solarTerm, story, article, customOrderGuide, b2bInquiryPage).

## Vercel handoff

`vercel.json` and `astro.config.mjs` are ready for a static Astro deployment. The production domain and canonical metadata are configured as `https://www.xiaominart.com`, but DNS/domain binding and deployment are not performed by this local implementation.

## Pending owner confirmations

Real paper/material/dimensions, mounting, price/currency, shipping/tax, lead time, capacity, revisions/refunds, contact destination, media licenses, English cultural explanations and whether works/stories may be indexed must be confirmed by the owner before publishing certainty or commerce functionality.
