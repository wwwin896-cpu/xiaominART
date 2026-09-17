# XIAOMINART 信任建设改造核验

本次对应附件任务：T004 客户评价/案例故事、T005 联系方式与信任信号、T013 首页首屏社会证明。

## 已完成

- 首页 Hero 下方新增低饱和社会证明条，明确授权故事、媒体与合作信息均待确认，不虚构统计或背书。
- 首页新增 3 条客户故事结构卡，统一包含：客户/昵称位、initials 图标、作品类型标签、双语评价位、授权状态和案例故事入口。
- 灵感案例卡增加“客户说 / Client story”入口，继续保留定制 CTA 与“不售卖同款”提示。
- 灵感详情页新增案例故事模板，包含：创作过程记录、艺术家访谈片段、客户故事、材质与尺寸说明。
- 页脚新增 `mailto:hello@xiaominart.com`、微信/企业微信待确认说明与 Instagram 平台入口（品牌账号待确认）。
- 页脚新增艺术家资质、媒体报道、合作机构信任信息区，均明确标记为待确认。
- 所有新增内容保持定制共创定位，没有新增购物车、结算、库存或购买流程。

## 事实边界

目前附件和工作区未提供真实客户姓名、评价、交付实拍、媒体报道、合作机构、奖项或统计数据，因此页面使用“待授权 / 待确认”占位。正式资料获得授权后，可沿用 `CustomerStories.astro` 数据结构替换内容。

## 变更文件

- `src/data/content.ts`
- `src/components/CustomerStories.astro`
- `src/components/InspirationCard.astro`
- `src/pages/index.astro`
- `src/pages/inspiration/[slug].astro`
- `src/layouts/Layout.astro`
- `docs/trust-building-qa.md`

## 构建核验

- `npm run check`：0 errors / 0 warnings / 0 hints
- `npm run build`：通过
- 静态页面：40 个
- 新增内容扫描：客户故事、社会证明、联系方式、案例故事结构均进入构建产物
- 电商边界扫描：仅命中既有事实边界说明组件，未新增交易组件

## 待上线前确认

- 将已获授权的客户姓名、评价、图像和项目资料替换为真实内容。
- 将品牌 Instagram 账号、微信/企业微信账号替换为正式链接或二维码。
- 仅在资料获得确认后补充艺术家经历、媒体和合作机构信息。
