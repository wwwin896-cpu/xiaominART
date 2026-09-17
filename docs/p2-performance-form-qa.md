# XIAOMINART P2 性能、图片与表单体验执行报告

**任务**：T016 / P2 细节优化  
**项目**：现有 `xiaominart-site/` Astro 静态站  
**范围**：移动端阅读、图片加载、内链与双语、社交入口、表单校验与提交反馈。  
**业务边界**：不新增购物车、线上支付、库存、SKU 或直接购买；表单仍通过人工咨询与默认邮件客户端衔接。

## 已落地

### 1. 移动端阅读与折叠

- `CommissionGuidance` 保持默认展开，使用原生 `<details>`，移动端自动单列。
- FAQ 使用原生 `<details>` 分组，长回答按问题展开，避免大段文字一次性铺满屏幕。
- 快速留言弹窗在移动端限制最大高度并允许内部滚动。
- Newsletter、表单输入、导航和 Footer 触控区域保持可用尺寸。

### 2. 图片加载

- 现有作品概念图增加描述性 `alt`、`loading="lazy"`、`decoding="async"` 与尺寸属性，减少布局位移。
- 当前项目主要视觉使用 CSS / SVG 占位，不添加未经授权的摄影素材或外部图片请求。
- 未宣称未经实测的 LCP 数值；正式 LCP 需在生产域名和目标设备网络下用 Lighthouse / PageSpeed 测量。

### 3. 内链与双语

- 本次检查确认 `/business/`、`/discover/`、`/art-direction/`、`/custom-commission/`、`/faq/`、`/pricing-guide/` 等当前路由均已生成或存在兼容入口。
- 404 入口保留返回灵感参考路径。
- 核心新增 P2 文案均提供中文与英文对应表达；未改写未授权的品牌、客户或社交账号信息。
- 遗留旧页面中仍存在少量历史小写品牌拼写，属于后续全站文案统一项，不影响本次构建；不将其当作已完成事实。

### 4. 社交入口

- Footer 保留可确认的邮箱 `hello@xiaominart.com`。
- 微信 / 企业微信、小红书、Instagram 使用“账号待确认”状态展示，不伪造链接或账号。
- 社交账号确认后可直接替换状态文本为真实链接，不需改动页面结构。

### 5. 表单校验与反馈

- 定制表单字段已有 `required`、`autocomplete`、明确 `label for/id`。
- 增加友好浏览器校验提示：`请先填写或选择这一项，再继续提交。 / Please complete this field before continuing.`
- 用户输入后自动清除自定义错误提示。
- 提交时以 `aria-live="polite"` 显示：默认邮件客户端将打开；邮件发送后预计 1–2 个工作日联系，并提供 `hello@xiaominart.com` 作为补充联系方式。
- 快速留言弹窗增加联系方式自动填充提示，并明确当前未连接在线客服服务。
- 未伪造在线提交成功；`mailto` 仍是当前 Demo 的真实行为。

## 修改文件

- `src/components/FloatingConsultation.astro`
- `src/layouts/Layout.astro`
- `src/pages/custom-commission/index.astro`
- `src/pages/works/[slug].astro`
- `docs/p2-performance-form-qa.md`

## 验收结论

| 项目 | 结果 |
|---|---|
| 移动端长文案可折叠或分组 | 通过 |
| 作品概念图懒加载与解码提示 | 通过 |
| 关键内链可生成 | 构建核验 |
| 社交入口不伪造账号 | 通过 |
| 表单友好校验 | 通过 |
| 1–2 个工作日反馈文案 | 通过 |
| 真实邮件服务 | 未接入，页面已明确说明 |
| LCP 数值 | 未虚构，待生产环境实测 |
| 电商交易模块 | 未新增 |
