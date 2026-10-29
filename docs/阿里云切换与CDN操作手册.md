# 阿里云切换与 CDN 操作手册（方案 A：全切阿里云 + CDN 全球加速）

> 2026-10-28 ｜ 前置：备案已通过（苏ICP备2026082876号-1），服务器 47.97.192.90，
> 仓库 CI 已改为 SSH 部署主通道（deploy.yml），CF Pages 保留为手动回滚。

---

## 一、GitHub 侧（一次性，10 分钟）

1. 生成部署密钥（本地执行）：
   ```bash
   ssh-keygen -t ed25519 -f aliyun-deploy -N ""
   ```
2. 公钥上服务器：把 `aliyun-deploy.pub` 内容追加到 `47.97.192.90` 的
   `/root/.ssh/authorized_keys`（或部署用户对应文件）。
3. 私钥进 GitHub：仓库 → Settings → Secrets and variables → Actions →
   New repository secret，添加 4 个：

   | Secret 名 | 值 |
   |---|---|
   | `ALIYUN_SSH_HOST` | `47.97.192.90` |
   | `ALIYUN_SSH_USER` | `root`（或部署用户） |
   | `ALIYUN_SSH_PORT` | `22` |
   | `ALIYUN_SSH_KEY` | `aliyun-deploy` 私钥全文 |

4. （可选，CDN 自动刷新）再建 RAM 子账号 → 只授 `AliyunCDNFullAccess` 里的
   RefreshObjectCaches 权限 → 生成 AK → 两个 secret：
   `ALIYUN_CDN_ACCESS_KEY_ID` / `ALIYUN_CDN_ACCESS_KEY_SECRET`。
   不配也不阻塞——CI 会提示去控制台手动刷新。

## 二、服务器侧（一次性，核对项）

```bash
# 1. 环境变量补齐（10-19 迁移时缺 3 个）
vi /var/www/xiaominart/server/.env
#   RESEND_FROM_EMAIL=  RESEND_TO_EMAIL=  FEISHU_KEYWORD=
#   （FEISHU_KEYWORD = 飞书机器人关键词安全设置里的那个词）

# 2. API 服务已装过则重启验证
systemctl enable --now xiaominart-api
curl -s http://127.0.0.1:8787/api/event && echo OK

# 3. nginx 配置确认含 server_name 与 IP（10-19 已做，切换域名后复查）
nginx -t && systemctl reload nginx
```

## 三、DNS 切换（切换日执行）

阿里云域名 DNS → 解析设置：

| 记录 | 类型 | 值 | TTL | 说明 |
|---|---|---|---|---|
| `@` | A | CDN 提供的 CNAME（见第四节） | 600 | 先加 CDN，再改这条 |
| `www` | CNAME | `xiaominart.com` | 600 | 保持 301 到 apex |

顺序：**先在 CDN 配好加速域名 → 拿到 CNAME → 再把 `@` 记录从服务器 IP 改为 CNAME**。
切换前可用 `curl --resolve xiaominart.com:443:47.97.192.90 https://xiaominart.com/` 先验证源站直连正常。

> 回滚：把 `@` 记录改回 `47.97.192.90` 即回到源站直连（5–10 分钟生效）。
> 极端情况：GitHub 上手动触发 `Deploy site (Cloudflare rollback)` 可回到 CF Pages。

## 四、阿里云 CDN 控制台配置（一次性，30 分钟）

1. **添加加速域名**：CDN 控制台 → 域名管理 → 添加
   - 加速域名：`xiaominart.com`（整站加速，不用子域名，省得改页面资源路径）
   - 业务类型：图片小文件
   - 源站信息：IP `47.97.192.90`，端口 443，回源协议「协议跟随」
   - 加速区域：**全球（含中国内地）** ← 这就是「全球加速」，境外 AI 爬虫受益
2. **HTTPS**：域名管理 → HTTPS 配置 → 免费证书（DigiCert 免费版，一键申请）或
   上传现有证书；开启「强制 HTTPS 跳转」+「HTTP/2」
3. **缓存规则**（按优先级从上到下）：

   | 类型 | 规则 | TTL |
   |---|---|---|
   | 文件后缀 | `css,js,webp,jpg,png,svg,woff2` | 30 天（nginx 已发 immutable，可放心长） |
   | 目录 | `/api/*` | **不缓存**（回源，nginx 已标 no-store） |
   | 其余（HTML） | 默认 | 300 秒（5 分钟，部署后靠刷新兜底） |

4. **性能**：开启 Brotli/Gzip 压缩、HTTP/2、智能压缩
5. **安全**：暂不开启 WAF（按量付费，等有攻击迹象再说）；Referer 防盗链**不要开**
   （会拦掉部分 AI 爬虫预览）
6. 验证：`curl -sI https://xiaominart.com/ | grep -iE "x-cache|via|eagleid"`
   出现 CDN 头即为命中链路

## 五、上线后验证清单

- [ ] `https://xiaominart.com/` 200，响应头含 CDN 标识
- [ ] `https://www.xiaominart.com/` 301 → apex
- [ ] 首页页脚出现「苏ICP备2026082876号-1」并链到工信部
- [ ] 任一表单提交 → 飞书群收到通知（`/api/lead` 通了才算迁移完成）
- [ ] `curl -sI https://xiaominart.com/sitemap.xml` 200 且为 XML
- [ ] `https://xiaominart.com/llms.txt` 200（AI 引用地图）
- [ ] 手机打开首页：底部栏 2 格（收藏/私信）、左上菜单抽屉
- [ ] CDN 控制台「刷新预热」能手动刷新成功（为 CI 自动刷新兜底）
- [ ] 百度搜索资源平台抓取诊断通过（确认百度蜘蛛走 CDN 后仍能回源）

## 六、费用预期（月）

| 项 | 金额 |
|---|---|
| 轻量服务器 | 0（已购，到期 2027-10-20） |
| CDN 流量 | 国内 ~¥0.24/GB；按 10–30 GB/月估 **¥3–8**；境外流量 ~¥0.5/GB 另计 |
| HTTPS 证书 | 0（免费版，每年续一次） |
| 静态 HTTPS 请求数 | 0–1000 万次/月内免费额度通常覆盖 |
| **合计** | **约 ¥5–15/月**，主要是 CDN 流量 |
阿里云 CI 部署修复记录：2026-10-29 私钥格式修正后重新触发。
