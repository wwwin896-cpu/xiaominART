# XIAOMINART 成功部署日志与问题根因

## 部署结果

- 项目：`xiaomin-art`
- 团队：`Geektion e drive`
- 生产域名：`https://www.xiaominart.com`
- Vercel 生产部署：`Ready`
- Production URL：`https://xiaomin-26smxvlus-geektion-e-drive.vercel.app`
- 最终使用命令：`npx vercel deploy --prod`
- 结果：已别名到 `https://xiaominart.com`

## 本地静态产物核对

- `npm run build`：通过
- 静态页面：43
- dist 文件：55
- HTML：43
- CSS：6
- SVG：4
- 总大小：763,255 bytes
- 必要路由：首页、灵感、定制表单、FAQ、定价参考、企业定制、艺术家、方向工具、sitemap 均存在
- 文件名大小写冲突：0
- `.gitignore`：仅忽略 `.vercel` 与 `.env*`，未忽略 `dist` 或必要静态资源
- `vercel.json`：已显式配置 `outputDirectory: "dist"`

## 生产构建日志摘要

```text
Running "vercel build"
Running "npm run build"
43 page(s) built in 836ms
Build Completed in /vercel/output
Deploying outputs...
Deployment completed
Created build cache
Build cache uploaded
status  Ready
Aliased https://xiaominart.com
```

## 生产验收

- 首页 Logo：`XIAOMINART`，通过
- 导航与 Hero：本轮版本，H1 为“与你创作 独一无二的作品。”，通过
- 悬浮“发起定制咨询”：存在，桌面/移动端均通过
- 定制表单“定制共创须知”：存在并默认展开，通过
- 灵感页“预算参考”：存在，通过
- `/faq/`：HTTP 200
- `/artists/`：HTTP 200
- `/business-custom/`：HTTP 200
- `/discover/`：HTTP 200
- `/pricing-guide/`：HTTP 200
- 首页/表单/灵感桌面端横向溢出：0
- 首页/表单/灵感移动端横向溢出：0
- Console errors：空数组
- 禁用电商模块扫描：购物车、Checkout、Add to cart、Buy now、SKU、库存均未出现

## 问题根因

此前 `fetch failed + missing_files` 并非 Astro 源码、dist 资源缺失或大小写问题：

1. 本地 dist 构建和资源清单完整。
2. `vercel.json` 原先未显式声明 `outputDirectory`，已补为 `dist`，消除输出目录歧义。
3. Vercel 控制台没有可用的“清除 Build Cache”按钮；未执行 Redeploy/Promote/Rollback。
4. 失败发生在普通部署的增量文件哈希/上传阶段：API 先返回 `missing_files`，随后上传请求 `fetch failed`。
5. 改用基础 `vercel deploy --prod` 后，Vercel 使用完整上传路径并成功完成远程 build、输出部署和域名别名。

## 截图

- `shots/production-final-home-desktop.png`
- `shots/production-final-home-mobile.png`
- `shots/production-final-form-desktop.png`
- `shots/production-final-form-mobile.png`
- `shots/production-final-inspiration.png`
