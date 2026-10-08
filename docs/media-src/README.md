# media-src —— 素材源文件（不参与构建）

本目录存放**体积较大、且当前站点未引用**的原始素材。

## 与 `public/` 的区别

| | `public/` | `docs/media-src/` |
|---|---|---|
| 是否进入构建产物 | 是（原样拷贝到 `dist/`） | 否 |
| 是否计入首屏体积 | 会（如果被页面引用） | 不会 |
| 用途 | 线上资源 | 素材留档 |

判断标准：**页面里搜不到引用路径的资源，不该留在 `public/`**。
留在 `public/` 的后果是它虽不被加载，但仍进入每次部署的产物、拉长构建与上传时间。

## 当前内容

### `ink-writing.mp4`（5.24 MB）

- 原位置：`public/assets/video/ink-writing.mp4`
- 移出日期：2026-10-08
- 移出原因（见 Meemoo 指令 #109）：
  1. 体积 5.24 MB，远超网页资源合理体积（目标 200 KB 级，视频放宽到 1 MB）
  2. **全站零引用**——三重核验均为 0 命中：
     - `grep -rn "ink-writing" src/ public/` → 0
     - `grep -rn "VideoShot" src/` → 0（原 `VideoShot.astro` 组件也无人引用）
     - `grep -rn "assets/video" src/` → 0
- 处置方式：**移出 `public/` 而非删除**。它曾是「书写过程」类展示的备选素材，
  留档以备后续需要；若未来要启用，先按下面的命令压到 1 MB 内再放回 `public/`。

```bash
# 压缩（启用前执行）
ffmpeg -i docs/media-src/ink-writing.mp4 \
  -vf "scale=1280:-2" -c:v libx264 -crf 30 -preset slow -an \
  -movflags +faststart docs/media-src/ink-writing.min.mp4
```

启用时的推荐做法是「静态图占位 + 点击播放」，而不是直接内联 `<video>`：
首帧导出 WebP 作为 poster，用户点击后再请求视频，首屏体积可降一个数量级。
