# xiaominART Hugo + GitHub Pages + Cloudflare 上线准备报告

> 日期：2026-09-13
> 状态：准备完成，未上线
> 目标域名：`www.xiaominart.com`
> 域名状态：用户已说明在阿里云购买；未执行 DNS 或 nameserver 变更

## 1. 已确认架构

| 层 | 方案 | 当前状态 |
|---|---|---|
| 静态官网 | Hugo Extended `0.166.0` | 已建立 `hugo-site/` |
| 静态托管 | GitHub Pages | 已准备 Actions，未创建/部署 |
| CDN/DNS/SSL | Cloudflare | 已写接入方案，未绑定账号/改 DNS |
| 注册商 | 阿里云 | 域名已购买，未改变现有解析 |
| 销售测试 | 独立 Node + SQLite | 保留在 `xiaominart-test-site/`，不随 GitHub Pages 运行 |

## 2. 静态站已准备

- Hugo bilingual config：中文默认、English 入口；
- 首页首屏：认识小民艺术、主标题、副标题、作品/定制双入口；
- 第二屏：福、禄、寿、喜、财、运；
- “四时有字”专题位；
- 节气内容留待创作更新稳定后加入；
- `static/CNAME`：`www.xiaominart.com`；
- `robots.txt` 和 HTML `noindex`：准备阶段不公开索引；
- 暖纸色、朱红操作色、书写感标题和移动菜单；
- 真实授权作品、创作照片、SKU、价格和经营政策均标为待补/待确认。

## 3. GitHub Pages 部署文件

- `.github/workflows/hugo.yml`：Hugo Extended 0.166.0，构建 `public/`，部署 GitHub Pages；
- `.hugo-version`：固定版本；
- `static/CNAME`：目标域名；
- `README.md`：本地运行、仓库根目录和上线边界；
- `DEPLOY-HUGO-GITHUB-CLOUDFLARE.md`：完整操作和回退方案；
- `ARCHITECTURE-DECISION.md`：静态官网与销售服务分层理由。

## 4. 构建验证

本机检查：

- `hugo version`：未通过，本机未安装 Hugo；
- `docker --version`：未通过，本机未安装 Docker；
- 因此本机不能把 Hugo 构建写成“已通过”。

真实构建路径已写入 GitHub Actions：固定 Hugo Extended `0.166.0`，推送到独立 GitHub Pages 仓库后由 Actions 构建。第一次推送前应在 CI 中确认构建日志和 `public/` artifact。

## 5. GitHub Pages + Cloudflare 操作门槛

### GitHub

- [ ] 创建独立 GitHub 仓库；
- [ ] 将 `hugo-site/` 内容作为仓库根目录；
- [ ] 设置 Pages → GitHub Actions；
- [ ] 推送 `main`，确认 workflow 成功；
- [ ] 设置 Custom domain：`www.xiaominart.com`；
- [ ] GitHub Pages HTTPS 证书生成后开启 Enforce HTTPS。

### Cloudflare/阿里云

- [ ] Cloudflare 添加 `xiaominart.com`；
- [ ] 记录 Cloudflare nameservers；
- [ ] 经用户批准后在阿里云将 nameservers 改为 Cloudflare；
- [ ] DNS 记录按 GitHub Pages 官方 Custom domain 页面当前要求配置；
- [ ] 初次证书验证阶段保守使用 DNS-only；
- [ ] GitHub Pages HTTPS 正常后，再按 Cloudflare SSL/TLS 方案评估 Proxied 和 Full (strict)；
- [ ] 保存原有 DNS 记录，作为回退依据。

本次没有执行以上账号、仓库、DNS、nameserver 或 HTTPS 切换动作。

## 6. 关键架构阻塞

Hugo + GitHub Pages 只负责静态官网。现有 Node + SQLite 测试工程包含：

- 订单 API；
- 定制/投稿 API；
- 管理后台；
- SQLite 写入；
- 进程内会话；
- 内部模拟支付。

这些不能直接由 GitHub Pages 执行。若要成为销售型正式网站，需要另行批准并迁移到生产 API、数据库、会话和支付服务。不能因静态首页上线而宣称销售后台或支付已上线。

## 7. 正式上线阻塞

1. Hugo CI 首次构建成功；
2. GitHub Pages 预览验收；
3. 真实作品/照片和授权；
4. 真实 SKU、价格、库存、规格和工艺；
5. 经营主体、销售地区、币种、配送和售后政策；
6. 生产销售 API、数据库、会话、备份和监控；
7. 第三方支付沙盒及生产支付审批；
8. Cloudflare/阿里云 DNS 切换批准；
9. 用户明确批准正式发布。

**本次完成 Hugo + GitHub Pages + Cloudflare 上线准备，不是正式上线；未修改正式 DNS、未接入真实支付、未发布正式站。**
