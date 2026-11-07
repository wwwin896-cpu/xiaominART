# 仓库协作约定（给小民艺术项目里的 AI 助手）

本文件是项目级常驻记忆。任何在这个仓库里做改动的助手，动手前先读这里，再读对应 skill。

## 必读 skill

**`xiaominart-visual-layout`** —— 视觉排版与双端隔离规范。以下任何一类改动，先加载它：

- 页面排版 / 卡片布局 / 网格 / 间距 / 图片比例
- 桌面端或移动端任一端的外观改动
- 商品上架、商品图替换、文案与图片对应关系

其中两节是业主明确要求「不要重复犯错」的硬流程：

| 节 | 内容 | 一句话 |
|---|---|---|
| §11 | 桌面/移动双端独立更新 | 改一端要证明另一端零差异，用 `scripts/dual-view-guard.mjs`，`干净 0.000%` 才算证明 |
| §12 | 图文一致零错 | 先辨字后命名；改名必清 webp；上线前四联核对（主图选择器 / 图↔文同框 / 哈希 / 分组） |

## 双端隔离速记

- 桌面专属：`.hero` `.choices` `.zodiac-block` `.origin-rail` `.brand-landing` `.self-grid` `.nav-magnet`
- 移动专属：`.mhero` `.mcore-wrap` `.mshow*` MobileBar `.brand-logo-zh` `.burger-line`
- 共享（一改双端都变）：`.site-header` `.header-inner` `.brand*` `nav` `.site-footer` `.btn`
- 桌面改动写进 `@media (min-width: 768px)`，移动改动写进 `@media (max-width: 767px)`

## 双端守门命令

```bash
npm run build && npm run guard -- snap --tag before     # 改动前
# ……改代码……
npm run build && npm run guard -- snap --tag after
npm run guard -- diff --tag before --expect desktop     # 允许桌面变，移动必须零差异
```

## 其他既有约定

- 门禁：`npm run check`（0 errors）→ `npm run build` → `npm run check:sitemap`
- `git push` 成功 ≠ 已上线：必须查 GitHub Actions conclusion + 线上特征串验证
- 新增 `scripts/*.mjs` 会被 `astro check` 扫描，首行加 `// @ts-nocheck`
- `<Pic width height>` 必须传数字（`{1100}`），传字符串 CI 报 ts(2322)
