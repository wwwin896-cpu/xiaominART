# xiaominART Netlify 上线准备报告（历史评估）

> 状态：已被 Hugo + GitHub Pages + Cloudflare 架构取代；不再作为当前发布路径
> 原用途：评估 Netlify 与原 Node/SQLite 工程的兼容性
> 当前发布路径：见独立 `hugo-site/RELEASE-PREP-REPORT.md`

> 状态：已完成 Netlify 部署准备，尚未创建/发布 Netlify 站点
> 项目：xiaominART 独立网站，与 Geektion 完全无关
> 日期：2026-09-13

## 1. 官方部署依据

本准备工作参考：

- Astro 官方 Netlify 部署指南：<https://docs.astro.build/en/guides/deploy/netlify/>
- Netlify 官方 Astro 指南：<https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/>
- Netlify 构建配置说明：<https://docs.netlify.com/build/configure-builds/overview/>

官方路径中，Astro 静态站通常使用 `npm run build` / `astro build`，发布目录为 `dist`；需要 SSR 时使用 Astro Netlify Adapter，将按需渲染交给 Netlify Functions。Node 版本通过 `.nvmrc` 或 `NODE_VERSION` 配置。

## 2. 当前工程兼容性结论

当前工程**不是 Astro 工程**：

- 没有 `astro.config.*`；
- 没有 `src/pages` 或 Astro 构建入口；
- `package.json` 没有 Astro 依赖或 build 脚本；
- 当前运行方式是长驻 `node server.mjs`；
- 当前服务直接使用 Node 内置 `node:sqlite` 和本地 `data/xiaominart.sqlite`；
- 当前后台登录会话保存在进程内存；
- Netlify 的常规 Astro 发布流程不能原样托管这个长驻 Node + 本地 SQLite 应用。

因此，本轮没有把当前 Node 服务伪装成 Astro 静态站，也没有直接执行会产生错误发布结果的 `netlify deploy`。

## 3. 本轮已完成的上线准备

- 添加 `netlify.toml`：锁定 Node 22.23.2、noindex 安全头和 preparation-only 构建命令；
- 添加 `.nvmrc`：`22.23.2`；
- 添加 `scripts/netlify-preflight.mjs`：检查工程交接文件并主动报告部署阻塞；
- 添加 `npm run netlify:preflight`；
- 保留 `package.json`、`package-lock.json`、数据库结构/演示数据、测试、复验报告和浏览器证据；
- 未创建 Netlify 项目、未绑定 Git 仓库、未接入 Netlify 账号、未修改 DNS、未接入支付。

## 4. 当前部署阻塞项

| 阻塞项 | 原因 | 是否必须解决 |
|---|---|---|
| Astro 架构迁移 | 当前工程不是 Astro，缺少 `astro build`/`dist` | 是 |
| API 运行时迁移 | 长驻 Node server 需迁为 Astro SSR/Netlify Functions | 是 |
| 数据库迁移 | 本地 SQLite 不适合作为 Netlify 多实例生产持久化方案 | 是 |
| 会话/权限迁移 | 进程内存 sessions 无法保证多实例稳定 | 是 |
| 生产环境变量 | `ADMIN_PASSWORD`、数据服务、支付和站点配置未提供 | 是 |
| Netlify 项目绑定 | 尚无 Netlify 站点/仓库绑定 | 是 |
| 真实素材与经营配置 | 当前仍为演示数据和待确认政策 | 是 |
| 支付 | 当前只有内部模拟支付 | 正式收款时是 |
| DNS | `www.xiaominart.com` 尚未切换 | 正式上线时是 |

## 5. 建议的最小迁移路径

不推倒重做，保留现有品牌页面、商品模型、测试用例和验收证据：

1. 新增 Astro 外壳，迁移首页、商城、详情、定制、政策和后台页面；
2. 按页面需求选择静态预渲染和按需 SSR；
3. 把订单、定制、投稿 API 拆成 Netlify Functions 或 Astro SSR endpoints；
4. 把本地 SQLite 数据访问层替换为已批准的托管数据库/持久化服务；
5. 把进程内会话换成生产级会话/身份方案；
6. 保留内部模拟支付，先部署受控预览；
7. 运行完整浏览器回归与第三方验收；
8. 只有经营、素材、支付、备份和 DNS 均批准后，才进入正式发布。

## 6. 准备完成标准

### 预发布前

- [ ] Astro 构建命令成功，生成 `dist`；
- [ ] Netlify Functions/SSR API 可用；
- [ ] 生产数据库迁移与备份恢复演练完成；
- [ ] 环境变量通过 Netlify 项目设置注入，不进入 Git；
- [ ] 模拟支付闭环在受控预览通过；
- [ ] 真实客户数据仍未导入；
- [ ] `noindex` 保持开启。

### 正式发布前

- [ ] 真实商品、素材授权、经营主体、价格、配送、售后和隐私政策确认；
- [ ] 第三方支付沙盒验证和生产支付批准；
- [ ] 生产域名证书与 DNS 变更窗口批准；
- [ ] 备份、监控、回退版本和故障联系人确认；
- [ ] 用户明确批准发布到 `www.xiaominart.com`。

## 7. 运行验证

当前工程仍使用：

```bash
node --check server.mjs
npm test
npm run netlify:preflight
```

其中 `netlify:preflight` 在 `NETLIFY_PREP_ONLY=true` 下会主动以阻断状态退出，防止把未迁移的 Node/SQLite 测试工程误部署为正式 Netlify 站点。这是有意的安全门槛，不是构建失败。

## 8. 本轮验证结果

- `node --check server.mjs`：通过；
- `npm test`：11/11 通过；
- `npm run netlify:preflight`：按设计以退出码 2 结束，已确认交接文件齐全并列出 4 项部署阻塞；
- `netlify.toml`：已写入 Node 22.23.2、noindex/安全头和 preparation-only 构建命令；
- 当前没有 `astro.config.*`、Astro 依赖、`dist` 构建产物或 Netlify Functions；
- 未执行 `netlify deploy`、未创建 Netlify 项目、未绑定 Git 仓库、未改 DNS。

## 9. 结论

本轮完成的是**Netlify 上线准备和兼容性评估**，不是正式部署。当前工程还不能直接按 Astro + Netlify 的生产方式上线；下一步必须先完成 Astro/Netlify Functions/生产数据库迁移，再创建 Netlify 项目和受控预览。

**本次没有修改正式域名，没有接入真实支付，没有发布正式站。**
