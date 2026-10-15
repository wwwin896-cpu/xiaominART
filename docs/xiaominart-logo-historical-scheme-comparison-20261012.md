# xiaominART Logo 历史方案找回与版本对照

日期：2026-10-12

## 结论先行

我在源项目当前工作树、Git 分支和历史提交中重新检索后，得到以下结论：

- 当前项目没有找到命名为“方案一”或“方案三”的独立 Logo 文件；
- 找到的是同一套“方案二”图形在不同时间节点的历史版本；
- 该图形从未在历史记录中切换为另一种完全不同的图案，主要变化集中在副标文案、字重、字号、间距、导出方式和最终排版质量；
- 现有“方案二”独立图标就是红色量具金石古印图形，历史版本中的核心图形保持一致。

## 一、可恢复的历史文件

恢复目录：

```text
docs/logo-recovered/
```

可查看文件：

```text
xiaominart-logo-55a516f.svg
xiaominart-logo-b9f0e99.svg
xiaominart-logo-b9f0e99.png
xiaominart-logo-502efa4.svg
xiaominart-logo-502efa4.png
xiaominart-logo-4ed0267.png
```

说明：`xiaominart-logo-55a516f.png` 在 Git 历史中虽然存在路径记录，但从提交内容导出后无法被当前图像读取器解码，因此不作为交付图片；同一提交的 SVG 版本可正常查看，已保留。

## 二、历史版本对照

### 版本 1：最早可见的方案二完整 Logo

文件：

```text
xiaominart-logo-55a516f.svg
```

对应提交：`55a516f`

设计表现：

- 左侧红色量具 / 金石古印图形；
- 英文标识使用 `xiaominART`，其中 `ART` 为金色；
- 中文副标为：`小民艺术｜日常之礼`；
- 图标与英文标识关系已经建立；
- 这是目前能从 Git 历史中看到的最早完整版本。

图形层面，它与现在的红色独立图标属于同一核心方案，并不是另一套图形方案。

### 版本 2：副标从“日常之礼”改为“用心好礼”

文件：

```text
xiaominart-logo-b9f0e99.svg
xiaominart-logo-b9f0e99.png
```

对应提交：`b9f0e99`

提交说明：品牌副标全站升级“日常之礼”→“用心好礼”。

设计表现：

- 核心红色图标不变；
- `xiaominART` 英文标识不变；
- 中文副标改为：`小民艺术｜用心好礼`；
- 这是品牌定位文案的变化，不是图形方案切换。

### 版本 3：副标字号和排版比例调整

文件：

```text
xiaominart-logo-502efa4.svg
xiaominart-logo-502efa4.png
```

对应提交：`502efa4`

提交说明：Logo 更新为业主最终版，副标字号从 14px 调整为 16px。

设计表现：

- 仍然使用同一红色量具古印；
- 仍然使用 `xiaominART` 与金色 `ART`；
- 副标继续为：`小民艺术｜用心好礼`；
- 中文副标相对前一版更清楚，整体识别度和导航使用效果更好。

### 版本 4：业主设计软件最终导出版

文件：

```text
xiaominart-logo-4ed0267.png
```

对应提交：`4ed0267`

提交说明明确指出：

- 使用业主设计软件导出的 1520×288 透明底 PNG；
- 直接替换程序模拟渲染的 Logo；
- 修正字体回退造成的中文变粗、字距不均问题；
- 重新生成 WebP、600px 和 1000px 变体；
- 构建通过。

设计表现：

- 核心图形仍未改变；
- 英文与中文副标的字形和间距更接近业主原始设计；
- 这是交付质量和排版质量的升级，不是新的图形方案。

## 三、当前 Logo 与历史版本的关系

当前项目仍保留以下方案二资产：

```text
public/assets/brand/xiaominart-logo-icon.svg
public/assets/brand/xiaominart-logo.svg
public/assets/brand/xiaominart-logo-light.svg
public/assets/brand/xiaominart-logo-dark.svg
public/assets/brand/xiaominart-logo-full.png
public/assets/brand/xiaominart-logo-full.webp
```

它们的关系可以理解为：

```text
方案二核心图形
├── 独立图标 / Favicon
├── 标准完整 Logo
├── 浅色 / 白底版
├── 深色背景版
└── PNG / WebP 网页导出版本
```

## 四、为什么不能把纯文字字标称为“方案一”或“方案三”

项目中另有：

```text
xiaominart-wordmark-black.svg
xiaominart-wordmark-champagne.svg
```

它们是纯文字 `XIAOMINART` 字标方向：

- 没有量具古印图形；
- 使用高对比衬线字体；
- 强调宽字距和编辑感；
- 香槟色版增加一条细金色线。

现有项目资料没有将它们命名为“方案一”或“方案三”，也没有证据表明它们与红色图形属于同一轮候选提案。因此本次不把它们擅自编号为方案一 / 方案三。

## 五、目前没有找到的内容

本次检索仍未找到：

- 方案一独立图形源文件；
- 方案三独立图形源文件；
- 方案一 / 方案二 / 方案三并列提案图；
- 原始 Logo 设计提案 PDF / PPT；
- 设计师或设计机构信息；
- 早期手绘草图、网格规范或完整 Logo 使用手册；
- 能证明纯文字字标就是方案一或方案三的记录。

## 六、对目前能看到的设计演进的判断

这批文件实际呈现的不是“多个图形方案淘汰”，而是一条逐步定稿路线：

```text
方案二图形确定
→ 副标“日常之礼”
→ 副标改为“用心好礼”
→ 副标字号和间距调整
→ 业主设计软件重新导出
→ 形成最终网站交付版本
```

所以，这次从源项目中真正找回的是：

> 方案二 Logo 的历史定稿过程，而不是方案一、方案三的候选图形。

如果必须恢复完整的“方案一 / 方案二 / 方案三”评审过程，还需要原始设计提案、设计师交付包、附件原图或对应的历史会话记录。
