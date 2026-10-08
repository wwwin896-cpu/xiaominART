# media-src —— 大体积素材的处置记录

本目录**不存放素材文件本体**，只记录「体积超标素材」的去向与恢复方法。

## 为什么素材本体不在这里

审计工具（Meemoo）的扫描范围是**整个项目监听目录**，不区分 `public/`（会被部署）
与 `docs/`（不会部署）。因此：

- 把大文件从 `public/` 移到 `docs/` 只是让它不进构建产物，**并不能消除体积告警**
- 要让告警消失，文件必须**移出项目目录之外**

本项目的处置惯例：移出到仓库同级的 `../_media-archive/`（该目录在项目监听范围之外，
不参与构建、不进 git）。

## 当前记录

### `ink-writing.mp4`（5.24 MB）

| 项 | 内容 |
|---|---|
| 原始位置 | `public/assets/video/ink-writing.mp4` |
| 移出 `public/` | 2026-10-08（Meemoo 指令 #109） |
| 移出项目目录 | 2026-10-08（Meemoo 指令 #124 —— 移入 `docs/` 后告警仍在，因为它扫全目录） |
| 当前实际位置 | `../_media-archive/ink-writing.mp4`（仓库同级，项目外） |
| 恢复方式 | 从 `../_media-archive/` 拷回，并先按下方命令压缩 |

**为什么先移走而不是压缩**：本机无 `ffmpeg`（`which ffmpeg` 无输出），
无法执行压缩。该文件全站零引用（三重核验：文件名 / `VideoShot` 组件 / `assets/video` 路径
均为 0 命中），移出不影响任何页面。

**若未来要启用**，先压缩再放回 `public/`：

```bash
# 需要先安装 ffmpeg
ffmpeg -i ink-writing.mp4 \
  -vf "scale=1280:-2" -c:v libx264 -crf 30 -preset slow -an \
  -movflags +faststart ink-writing.min.mp4
```

页面上的推荐用法是「静态图占位 + 点击播放」，而非直接内联 `<video>`：
首帧导出 WebP 作 poster，用户点击后再请求视频，首屏体积可降一个数量级。
