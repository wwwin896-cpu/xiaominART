# XIAOMINART 首页文本、Logo 与排版优化报告

## 部署

- 目标站点：`https://www.xiaominart.com/`
- Vercel 项目：`geektion-e-drive/xiaomin-art`
- 最新部署：Production `Ready`
- HTTP：`200`
- 静态页面：38 个

## 修改文件

- `src/layouts/Layout.astro`
  - 全局默认标题、SEO 标题归一为 `XIAOMINART`
  - 导航 Logo 改用 `xiaominart-wordmark-black.svg`
  - Logo 展示尺寸由 `185px` 增至 `218px`
  - Logo 字标 SVG 字号由 112 提升至 128、字重调整为 500
  - 移除 `Art, made personal`
  - 保留并调整“东方艺术定制平台”作为右侧副文案，桌面与 Logo 同行平衡对齐
  - 页脚品牌名全部更新为 `XIAOMINART`
- `src/pages/index.astro`
  - 删除 InkIntro import、内联播放脚本与 `<InkIntro />`
  - 首页直接渲染 Hero
  - Hero 品牌名统一为 `XIAOMINART`
  - Hero 主标题字号改为 `clamp(48px, 6.2vw, 78px)`，移动端改为 `clamp(42px, 12vw, 54px)`
  - 微调标题行高、字距、英文副标题、边界说明和按钮间距
  - Hero 原有业务文案与 CTA 文案保持不变
- `src/pages/*`
  - 页面标题和描述中的品牌名统一为 `XIAOMINART`
- `public/assets/brand/xiaominart-wordmark-black.svg`
  - 更新为 XIAOMINART 黑色高奢衬线字标
- `public/assets/brand/xiaominart-wordmark-champagne.svg`
  - 更新为 XIAOMINART 香槟金点缀字标
- 已将旧 `InkIntro.astro`、`docs/ink-intro.md` 和旧命名 Logo SVG 移入回收站。

## 核验

- 全项目 `XIAOMINGART`：无匹配
- 全项目 `XiaominART`：无匹配
- 全项目 `xiaomingart`：无匹配
- 全项目 `InkIntro` / `ink-intro` / `Art, made personal`：无匹配
- 首页无 fixed/sticky 水墨覆盖层、canvas 或动画播放脚本
- 导航结构保持：无独立“艺术家”一级菜单；“灵感参考”保留下拉子菜单
- Hero 业务文本、按钮与页面结构未重写
- `npm run check`：0 errors / 0 warnings / 0 hints
- `npm run build`：通过，38 个静态页面
- 桌面 1440px：横向溢出 0，严重 JS 错误 0
- 移动 375px：横向溢出 0，Logo 约 161×36px，按钮等宽堆叠
- 线上首页：HTTP 200，Vercel Server，HTTPS 正常

## 截图

- [PC 首页](../../shots/final-xiaominart-desktop.png)
- [移动端首页](../../shots/final-xiaominart-mobile.png)
