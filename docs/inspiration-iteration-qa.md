# XIAOMINART 灵感参考页与定制表单迭代报告

## 生产状态

- Vercel 项目：`geektion-e-drive/xiaomin-art`
- 生产地址：`https://www.xiaominart.com/`
- 最新部署：Production `Ready`
- 构建：`npm run check` 0 errors / 0 warnings / 0 hints
- 构建：`npm run build` 通过，38 个静态页面，构建时间约 1.50s
- dist 体积：约 416,990 bytes

## 灵感参考页

- 新增空间筛选：玄关、客厅、茶室、书房、办公室、企业会客厅、民宿空间。
- 桌面端使用多选 checkbox；选中状态为细底线与低饱和文字色。
- 移动端折叠为 select，选择后即时筛选。
- 筛选为 OR 逻辑：选择多个空间时显示任一空间匹配的案例。
- 案例卡使用 CSS 画框效果，无新增位图或 SVG 图片请求：
  - 哑光黑细框
  - 哑光香槟金细框
  - 原木细框
- 每张卡展示作品字符、画框、场景标签、适配空间标签与简短描述。
- 每张卡保留 `以此为灵感定制 / Commission from this direction →`，指向 `/custom-commission/`。
- 筛选区固定显示：`案例仅作风格参考，不售卖同款`。
- 保留完整双语案例提示：`案例仅作风格参考，不售卖同款 | For reference only, identical artwork is not for sale.`。

## 首页链路

- `浏览灵感参考 / Explore inspiration` 已直接指向 `/inspiration/`。
- 入口附近新增：`选择你的空间，浏览适配的艺术方向 / Choose your space, then explore a direction.`。

## 定制表单

新增可选字段：`陈设空间（可选） / Display space (optional)`。

选项：玄关、客厅、茶室、书房、办公室、企业会客厅、民宿空间、其他 / Other。

选择“其他”后显示自定义输入：`其他空间 / Other space`；默认隐藏，避免表单初始拥挤。

## 交互验收

- PC 多选“茶室 + 书房”：显示 3 张匹配案例。
- 移动端选择“客厅”：显示 2 张匹配案例。
- PC / 移动端横向溢出：0。
- Console 严重错误：0。
- 画框效果自适应，无裁切。
- 未新增购物车、价格、SKU、库存、结算或购买模块。
- 既有导航、XIAOMINART 品牌、无水墨入场动画和 38 个路由保持不变。

## 修改文件

- `src/data/content.ts`
- `src/components/InspirationCard.astro`
- `src/pages/inspiration/index.astro`
- `src/pages/custom-commission/index.astro`
- `src/pages/index.astro`

## GitHub 状态

当前工作区没有 Git remote，且 GitHub CLI 未完成授权。已启动 GitHub device login，但 OAuth access-token 交换阶段出现网络连接失败，因此本轮**尚未推送 GitHub**。未提交或推送任何未经授权的仓库。

## 截图

- [PC 灵感筛选与案例卡](../../shots/inspiration-filter-desktop.png)
- [移动端灵感筛选与画框卡](../../shots/inspiration-filter-mobile.png)
- [移动端定制表单陈设空间字段](../../shots/custom-space-form-mobile.png)
