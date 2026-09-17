# XIAOMINART SEO / 移动端 / 无障碍核验记录

**范围**：附件任务 T010、T011、T012  
**项目**：现有 `xiaominart-site/` Astro 静态站  
**品牌定位**：东方艺术定制共创平台；不售卖现货，不新增购物车、结算、库存或购买模块。

## T010 Newsletter 静态订阅模块

- 位置：全站 Footer 上方。
- 中文说明：订阅创作笔记，获取最新案例与艺术灵感。
- English：Subscribe to studio notes, new references and quiet inspiration.
- 邮箱输入：`type="email"`、`autocomplete="email"`、必填。
- 提交反馈：使用 `aria-live="polite"` / `role="status"` 显示确认提示。
- 真实服务边界：表单明确写明当前为静态 Demo，尚未连接真实邮件服务；提交不会伪造订阅成功或调用第三方服务。
- 移动端：输入与按钮全宽、纵向排列，最小高度 48px。

## T011 移动端优化

### 已处理

- 全局 `input`、`textarea`、`select` 最小高度 44px。
- Footer 链接、移动端导航项、导航下拉项和灵感筛选项提供至少 44px 触控区域。
- Newsletter 在移动端单列布局，输入和按钮不挤压。
- 灵感页移动端使用筛选下拉，保留多维筛选功能。
- 预览大图关闭、上一张、下一张按钮维持可触控尺寸。
- 全局 viewport 增加 `initial-scale=1` 与 `viewport-fit=cover`。
- 表单字段保留原有移动端堆叠布局和系统校验，不增加交易流程。

### 性能说明

本轮未虚构 LCP 数值。项目为 Astro 静态站，Newsletter 无外部请求，SEO 图像元数据使用已有本地占位资源；正式 LCP 需在目标设备、网络和生产域名上使用 Lighthouse / PageSpeed 实测。

## T012 无障碍与 SEO

### 图片与媒体

- Logo alt 更新为：`XIAOMINART 东方艺术定制平台`。
- 作品概念图保留描述性 alt，并继续标注概念/非量产边界。
- 灵感 CSS 场景图使用 `role="img"` 与包含作品、空间和画框类型的描述性 `aria-label`；文字字形为装饰内容并设置 `aria-hidden`。
- 无真实图片的抽象视觉没有伪造摄影事实。

### 交互

- 页面保留 skip link：`跳到主要内容`。
- 主导航有 `aria-label`；移动菜单按钮有 `aria-expanded`、`aria-controls`，支持 Escape 关闭。
- 定制表单增加 `aria-labelledby`，每个字段显式绑定 `label for` 与控件 `id`，保留 `autocomplete`。
- 灵感筛选分组使用 `fieldset` / `legend`，选项支持键盘焦点和细底线状态。
- 筛选结果使用 `aria-live="polite"` 反馈可见方向数量。
- 灵感 Lightbox 使用 `role="dialog"`、`aria-modal`、动态标题、关闭/前后切换按钮可访问名称；打开后焦点进入关闭按钮，关闭后焦点返回触发项；支持 Escape、左右方向键。
- 全局 `:focus-visible` 保留高对比焦点轮廓；`prefers-reduced-motion` 关闭过渡和滚动动画。

### SEO Head

- 每页使用标题、description、canonical。
- 统一 `robots=index,follow`、Open Graph title/description/url/site_name/locale/image。
- `viewport` 包含移动端缩放和安全区域设置。
- `sitemap.xml` 继续由 Astro 静态路由生成，覆盖首页、核心内容页、作品、FAQ 与定价参考页。
- `robots.txt` 继续指向 `https://www.xiaominart.com/sitemap.xml`。
- 未添加未经验证的销量、评分、价格或服务数据到结构化 SEO 信息。

## 验收结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| Newsletter 模块存在 | 通过 | `src/components/Newsletter.astro`、`Layout.astro` |
| 静态订阅确认提示 | 通过 | `data-newsletter-status` + `aria-live` |
| 移动端触控尺寸 | 通过（代码级） | 全局输入控件、导航、Footer、筛选、Lightbox 规则 |
| 表单字段可访问名称 | 通过 | `custom-commission/index.astro` 显式 `for/id` |
| 灵感筛选可访问 | 通过 | fieldset/legend、键盘焦点、结果播报 |
| Lightbox 键盘支持 | 通过 | Escape、ArrowLeft、ArrowRight、焦点返回 |
| SEO canonical / OG / robots | 通过（代码级） | `Layout.astro`、`sitemap.xml.ts`、`public/robots.txt` |
| 电商交易模块 | 保持移除 | 未新增购物车、结算、库存、购买或价格交易组件 |
| LCP 实测 | 未宣称 | 需生产环境 Lighthouse / PageSpeed 实测 |
