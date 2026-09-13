# xiaominART Hugo + GitHub Pages + Cloudflare 上线准备

> 状态：已完成准备，未推送、未创建 GitHub Pages 站点、未修改 DNS、未接入真实支付
> 域名：已知用户在阿里云购买 `www.xiaominart.com`
> 项目：xiaominART 独立网站，与 Geektion 完全无关

## 1. 架构边界

### 静态官网层

- Hugo 生成静态 HTML/CSS/少量原生 JavaScript；
- GitHub Pages 发布静态文件；
- Cloudflare 提供 DNS、代理/CDN、SSL/TLS 和基础安全能力；
- 本工程 `hugo-site/` 是独立静态发布层。

### 销售测试层

当前 `xiaominart-test-site/` 的 Node + SQLite 工程仍独立保留，用于购物车、测试订单、定制需求和后台验收。

GitHub Pages 不能直接运行长驻 `node server.mjs`、本地 SQLite、后台会话或订单 API。因此：

- Hugo/GitHub Pages/Cloudflare 负责品牌官网和内容展示；
- 订单、定制、后台和支付需要另行迁移到已批准的 API/托管服务；
- 不能把静态官网发布误称为销售后台已经上线。

## 2. 本次新增文件

- `hugo-site/hugo.toml`：正式域名、中文默认语言、中文/英文语言入口；
- `hugo-site/.hugo-version`：Hugo `0.166.0`；
- `hugo-site/static/CNAME`：`www.xiaominart.com`；
- `hugo-site/.github/workflows/hugo.yml`：GitHub Pages Actions；
- `hugo-site/layouts/`：首页、基础模板和 404；
- `hugo-site/content/zh-cn/`、`content/en/`：双语内容入口；
- `hugo-site/static/css/site.css`：暖纸色、朱红操作色和书写感标题；
- `hugo-site/DEPLOY-HUGO-GITHUB-CLOUDFLARE.md`：本说明。

首页结构已按确认方案准备：

1. 首屏认识小民艺术；
2. 两个入口：“看看作品”“定制一份心意”；
3. 第二屏“你想把哪份心意，写成字？”；
4. 福、禄、寿、喜、财、运六个方向；
5. “四时有字”专题占位；
6. 节气内容留待有稳定创作后逐步加入。

真实授权作品、创作照片和正式联系方式未提供，当前均标为待替换/待确认。

## 3. GitHub Pages 准备步骤

以下步骤需要用户在 GitHub 账号中操作或提供授权；本轮没有代为执行：

1. 创建独立 GitHub repository，建议使用 `xiaominART` 或用户指定的独立仓库；
2. 将 `hugo-site/` 作为仓库根目录，或将 workflow 中的工作目录改为实际仓库结构；
3. 将 `.github/workflows/hugo.yml` 放在仓库根目录的 `.github/workflows/` 下；
4. GitHub repository → Settings → Pages → Build and deployment 选择 GitHub Actions；
5. 推送 `main` 后等待 Actions build/deploy；
6. 在 GitHub Pages 的 Custom domain 中先填 `www.xiaominart.com`；
7. 等 DNS 和证书验证完成后，再开启 Enforce HTTPS；
8. 在自定义域名验证完成前保持站点不对外宣传。

官方 GitHub Pages 限制应以当前 GitHub 文档为准；官方文档当前说明有软带宽/构建限制，不把它表述为“每月无硬性上限”。

## 4. 阿里云域名与 Cloudflare 准备步骤

### 4.1 Cloudflare

1. 注册/登录 Cloudflare；
2. Add a site：输入 `xiaominart.com`；
3. 记录 Cloudflare 分配的两个 authoritative nameservers；
4. 在阿里云域名控制台将 DNS 服务器改为 Cloudflare nameservers；
5. 等待域名状态变为 Active；
6. 在 Cloudflare DNS 添加 GitHub Pages 要求的记录；
7. 代理状态、SSL/TLS 模式和 GitHub Pages 证书状态全部验证后才进行切换。

### 4.2 记录策略

`www` 记录的目标值必须以 GitHub Pages 当前 Custom domain 页面和 GitHub 官方文档为准，不在代码中硬编码未经核验的 IP。

建议：

- `www`：按 GitHub Pages 官方要求设置 CNAME，目标为 GitHub Pages 提供的站点域名；
- 根域 `@`：按 GitHub 官方 custom domain 要求配置 A/ALIAS/ANAME；
- Cloudflare Proxy：先使用 DNS-only 完成 GitHub custom domain/证书验证，确认成功后再评估 Proxied；
- SSL/TLS：不要使用 Flexible；在 GitHub Pages HTTPS 正常后使用 Full (strict)；
- 不新增邮件 MX/TXT 记录，不删除阿里云现有业务记录，先导出 DNS 备份。

## 5. DNS 切换前检查

- [ ] 已确认阿里云域名控制权和实名认证状态；
- [ ] 已保存阿里云现有 DNS 记录；
- [ ] 已确认 Cloudflare nameservers；
- [ ] 已确认 GitHub Pages repository 和 Actions 权限；
- [ ] GitHub Pages 构建成功并有预览/默认 Pages 地址；
- [ ] `CNAME` 文件内容为 `www.xiaominart.com`；
- [ ] GitHub Custom domain 已设置；
- [ ] HTTPS 证书已生成；
- [ ] Cloudflare DNS 状态和 SSL 模式已确认；
- [ ] 用户明确批准 DNS 切换。

## 6. 上线后的检查

```text
https://www.xiaominart.com/
https://www.xiaominart.com/robots.txt
https://www.xiaominart.com/sitemap.xml
```

检查：

- 页面 HTML、CSS、图片和中英文切换；
- CNAME 不被覆盖；
- noindex 是否仍符合当前阶段；
- Cloudflare SSL 证书和缓存；
- GitHub Actions 后续推送是否自动部署；
- 静态官网不应出现真实订单/后台功能假象。

## 7. 回退方案

1. 暂停 GitHub Pages Actions；
2. 保留当前 Git commit 和 GitHub Pages deployment；
3. 在 Cloudflare DNS 恢复切换前导出的旧记录；
4. 在 GitHub Pages Custom domain 中移除或恢复旧域名配置；
5. 不删除阿里云域名资产；
6. 重新验证 HTTPS、DNS 和旧站可用性；
7. 若只是内容错误，通过 Git revert 回退 Hugo commit，不直接改生产文件。

## 8. 未执行项

- 未推送到 GitHub；
- 未创建或修改 GitHub Pages 设置；
- 未登录/绑定 Cloudflare；
- 未改阿里云 nameservers 或 DNS；
- 未发布 `www.xiaominart.com`；
- 未接入真实支付；
- 未把 Node/SQLite 后台暴露到静态站。

**当前完成的是 Hugo + GitHub Pages + Cloudflare 的上线准备，不是正式上线。**
