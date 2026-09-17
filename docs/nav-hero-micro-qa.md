# XIAOMINART 导航与首页 Hero 微调报告

## 生产状态

- 站点：`https://www.xiaominart.com/`
- Vercel：Production `Ready`
- 构建页面：38 个
- `npm run check`：0 errors / 0 warnings / 0 hints
- `npm run build`：通过，约 1.41s

## 修改

- `src/layouts/Layout.astro`
  - Logo 与“东方艺术定制平台”改为同一列纵向排列。
  - 两个元素左边缘完全对齐。
  - 两个元素使用相同宽度：桌面 `218px`，移动端 `clamp(142px, 43vw, 178px)`。
  - 中文副标题使用字距、`text-align: justify` 和 `text-align-last: justify` 与 Logo 视觉齐平。
  - 保留 Logo 点击返回首页逻辑。
- `src/data/content.ts`
  - 导航中文从“B端企业定制”改为“企业定制”。
  - 英文 `Business Custom` 保持不变。
- `src/pages/index.astro`
  - Hero 标题文字不变。
  - 标题桌面字号下调至 `clamp(40px, 5.45vw, 68px)`。
  - 移动字号下调至 `clamp(34px, 10.5vw, 44px)`。
  - `white-space: nowrap` 确保显式 `<br>` 后严格两行。
  - 保留原有 Hero 双语文案、按钮和业务链路。

## 线上验收

- Logo 与副标题：桌面 `218×49` / `218×15.6`，左边缘均为 `x=112.4`；移动均为 `x=16`。
- 导航：包含“企业定制 / Business Custom”。
- Hero：
  - 桌面两行，第二行完整显示“独一无二的作品。”，标题字号约 `68px`。
  - 移动两行，第二行完整显示，标题字号约 `39.4px`。
- PC / 移动 `scrollWidth - clientWidth = 0`。
- Console 严重错误：PC 与移动均为空。
- 无其他页面业务文案、路由或业务逻辑改动。

## 截图

- [PC 导航与 Hero](../../shots/nav-hero-desktop-final.png)
- [移动端导航与 Hero](../../shots/nav-hero-mobile-final.png)
