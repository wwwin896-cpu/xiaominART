# 小民艺术 · Cloudflare 部署与后台操作说明

更新日期：2026-09-28
适用仓库：`wwwin896-cpu/xiaominART`（站点根目录即仓库根目录）

> **状态：迁移已完成。** 站点现由 Cloudflare Pages 提供服务，Vercel 项目已停用。
> 本文是现行部署与环境变量的**唯一权威说明**；文中「一、为什么从 Vercel 迁移」与迁移步骤小节保留下来作为决策留痕，其中的 Vercel 操作步骤仅作背景，不再需要执行。
> 其余提到 Vercel 的历史文档（`production-domain-and-qa.md`、`keystatic-site-rebuild-execution-plan.md`、`acceptance-checklist.md` 等）均已加存档标记，排障请以本文为准。

---

## 一、为什么从 Vercel 迁移

Vercel 的免费档（Hobby）**在服务条款层面禁止商业用途**。其官方定义里"商业用途"包括：

- 向访客收取或处理付款
- 宣传销售产品或服务
- 付费请人创建、更新或托管该站点

并且服务条款写着 Vercel 可以在**不通知的情况下**关停 Hobby 项目。xiaominart.com 是真实运营的销售型站点，上述三条全部命中——继续留在 Hobby，等于把站点放在一个随时可能被关闭的位置上。

要合规地留在 Vercel，唯一路径是升级 Pro（每人每月 20 美元）。

迁移到 Cloudflare Pages 后：**免费档明确允许商用**，且静态站带宽不限量。

---

## 二、新架构

```
用户浏览器
   │
   ▼
Cloudflare Pages（免费档）
   ├── 静态 HTML / CSS / 图片 ──── 站点全部页面（构建产物 dist/）
   └── Pages Function ─────────── /api/lead（表单与订阅代理，唯一需要服务端的部分）
                                        │
                                        ▼
                                  WorkBuddy 云数据库
                                  （leads / subscribers 两张表）

本地电脑（只有主理人用）
   └── npm run dev → http://localhost:4321/keystatic
       后台直接读写本机 content/ 目录 → git commit & push → Cloudflare 自动重新构建
```

三个关键点：

1. **站点是纯静态的**，没有数据库、没有常驻服务端。除了一个表单代理函数，其他全部是预先生成好的 HTML。
2. **后台跑在本机**，不上线。Keystatic 用 local 模式直接改 `content/` 里的文件，不涉及 GitHub 登录、不涉及 OAuth、不涉及任何云服务。
3. **发布靠 git**。改动提交并推送后，Cloudflare 自动重新构建上线。

---

## 三、上线操作手册（照着点，约 30 分钟）

### 开工前：三个后台各管什么

这次会碰到三个网站，先说清楚各自负责什么，免得在错的地方找按钮：

| 后台 | 网址 | 它管什么 | 本次要动吗 |
|---|---|---|---|
| **GitHub** | github.com | 存放网站源码（仓库 `wwwin896-cpu/xiaominART`） | **几乎不用动**，只需授权一次 |
| **Cloudflare** | dash.cloudflare.com | 建 Pages 项目、绑域名、配跳转规则 | 主要工作在这里 |
| **阿里云** | 阿里云控制台 → 域名 | 域名注册与 DNS 解析 | 只需改一次 NS |

### GitHub 到底要不要改设置？——结论：不用

很多人第一反应是去 GitHub 的 Settings 里找，但这次**没有一个设置需要在那里改**：

- ❌ **不用**去 `Settings → Pages`——那是 GitHub Pages 的功能，本方案不用它
- ❌ **不用**把仓库改成公开——Cloudflare Pages 公开库、私有库都能读（官方原文：*Both private and public repositories are supported*）
- ❌ **不用**配 Actions、不用加 Secrets
- ✅ **唯一需要碰 GitHub 的**，是给「Cloudflare Pages」这个 GitHub 应用授权，让它能读你的仓库。两个入口，任选其一：

  **入口 A（推荐，跟着流程走就行）**
  在 Cloudflare 里点 Connect to Git 时会自动弹出 GitHub 授权页，授权完自动回到 Cloudflare。

  **入口 B（想主动先进 GitHub）**
  浏览器打开 `https://github.com/apps/cloudflare-pages`
  → 点 **Install**
  → 选 **Only select repositories**，只勾 `xiaominART`
  → 点 **Install**

  选「Only select repositories」很重要：这样 Cloudflare 只能看到这一个仓库，你账号里其他仓库它看不到。

- **事后想查看或撤销授权**：GitHub 右上角头像 → **Settings** → 左侧边栏最下方 **Applications** → **Installed GitHub Apps** → 找到 Cloudflare Pages → **Configure**

### 开工前的事实底座（2026-09-28 实测）

- 域名 NS 当前在**阿里云**：`dns1.hichina.com` / `dns2.hichina.com`
- 站点当前在 **Vercel**：`www` → `64.29.17.1`，顶点域 → `216.198.79.1`
- 域名**没有 MX 记录、没有 TXT 记录**（未用于收发邮件）→ 改 NS **不会影响邮件**
- 仓库默认分支 `main`，最新提交 `fde3c91`（已含 `_redirects` / `_headers` / `functions`）

### ⚠️ 一条硬约束

Cloudflare 官方明确：**顶点域（`xiaominart.com`）必须先把域名添加为 Cloudflare zone 并改 nameserver**，没有别的办法。
（子域如 `www` 可以用外部 CNAME 指向 `pages.dev`，但顶点域不行。）所以第 4 步改 NS 是绕不开的。

### ⚠️ 顺序：域名放在最后一步动

**不要先改 NS。** 正确顺序是：先把新站建好、在临时网址上验收通过，最后才切换域名。
这样切换前旧站一直正常服务，切换后若有问题也还能快速切回。

---

### 第 1 步 · Cloudflare 添加站点，拿到 NS

1. 打开 https://dash.cloudflare.com/ 注册并登录（免费账号即可）
2. 顶部 **+ Add a site** → 输入 `xiaominart.com` → 计划选 **Free** → Continue
3. Cloudflare 会扫描现有解析记录并列出几条（A 记录，指向 Vercel）。先不用管，继续
4. 页面给出**两个 nameserver**，形如 `xxxx.ns.cloudflare.com` 和 `yyyy.ns.cloudflare.com`
   → **把这两个地址抄下来**，第 4 步要用

### 第 2 步 · 建 Pages 项目，连上 GitHub 仓库

1. 左侧 **Workers & Pages** → **Create application** → 切到 **Pages** 标签 → **Connect to Git**
2. 点 GitHub 授权（就是上面说的入口 A）→ 在弹出的 GitHub 页面点 **Install & Authorize**
   - 在授权页选 **Only select repositories** → 只勾 `xiaominART`
3. 回到 Cloudflare，从仓库列表选中 `xiaominART` → **Begin setup**
4. 构建设置照抄：

   | 字段 | 填什么 |
   |---|---|
   | Project name | `xiaominart` |
   | Production branch | `main` |
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. **Environment variables 不用加**——仓库根目录已有 `.nvmrc`（内容 `22`），Cloudflare 会按 Node 22 构建
6. 点 **Save and Deploy**，等 1–2 分钟

构建成功后会得到一个临时网址，形如 `https://xiaominart.pages.dev`

### 第 3 步 · 在临时网址上验收（此时旧站仍在正常服务）

逐项检查 `https://xiaominart.pages.dev`：

- [ ] 首页正常打开，**样式完整**（若是无样式的裸页面，说明 `_astro/` 资源没加载，去构建日志里查）
- [ ] 导航能点：`/gifts/`、`/scenes/`、`/journal/`、`/business-gifts/` 都能打开
- [ ] 抽查一个已下线的旧网址，如 `/inspiration/`，应 **301 跳转**到 `/gifts/`（能跳说明 `_redirects` 已被识别）
- [ ] 提交一条测试留言（「与我们聊聊」表单），确认提交成功
- [ ] 手机打开看一眼版式

> 这一步是关键闸门。任何一项不过，都先别往下走。

### 第 4 步 · 改 NS（唯一动域名的一步）

1. 登录**阿里云** → 控制台 → **域名** → 找到 `xiaominart.com` → 点 **管理** → 左侧 **DNS 修改**（部分界面叫「DNS 服务器」）
2. 把原来的 `dns1.hichina.com`、`dns2.hichina.com` 替换成第 1 步抄下的两个 Cloudflare 地址
3. 保存

生效时间通常 1–4 小时，最长 48 小时。在 Cloudflare 该域名的首页看状态：`Pending` → **`Active`** 就是生效了。

> 域名没有邮箱记录，这一步不会影响收发邮件。

### 第 5 步 · 在 Cloudflare 绑定自定义域名

**等 zone 状态变成 Active 之后再回来做。**

1. **Workers & Pages** → 点进 `xiaominart` 项目 → **Custom domains** → **Set up a domain**
2. 依次添加 `xiaominart.com` 与 `www.xiaominart.com`

> ⚠️ **顺序很关键**：必须**先在 Pages 面板里加域名**，再让 Cloudflare 生成解析记录。
> 自己先去 DNS 页面手加 CNAME 会报 **522**，而且这个失败状态会一直粘在该域名的验证上，
> 反复重试也不一定能恢复。

**实际执行结果（2026-09-28）——两个域名表现不同：**

| 域名 | Pages 验证结果 |
|---|---|
| `xiaominart.com`（顶点域） | ✅ `active`，Pages 正常服务 |
| `www.xiaominart.com` | ❌ 始终 `pending`，错误 `CNAME record not set` |

www 的记录类型（CNAME）、内容（`xiaominart.pages.dev`）、代理状态（橙云）都正确，
官方文档与社区都有同类案例，属 Cloudflare 侧的验证问题，长期重试也未必通过。

**因此最终采用「顶点域为规范域名」**：`xiaominart.com` 直接由 Pages 服务，
`www` 通过 301 跳过来。详见第十节。

### 第 6 步 · 配 www 跳转到顶点域

`public/_redirects` 只能按路径匹配、**不能按域名匹配**，所以这条要在 Cloudflare 侧配。
本次用的是 **Page Rules**（因为手上的 API 令牌没有 Redirect Rules 权限，效果等价）：

| 设置 | 值 |
|---|---|
| 匹配 | `www.xiaominart.com/*` |
| 动作 | Forwarding URL |
| 状态码 | 301 |
| 目标 | `https://xiaominart.com/$1` |

> 日后若想换成更现代的 Redirect Rules：在 **Rules → Redirect Rules** 建一条
> `Hostname equals www.xiaominart.com` → 301 到 `concat("https://xiaominart.com", http.request.uri.path)`，
> 然后删掉这条 Page Rule。

### 第 7 步 · 验证与收尾

- [x] `https://xiaominart.com` 正常打开，样式完整
- [x] `https://www.xiaominart.com` 自动 301 跳到 `https://xiaominart.com`
- [x] `http://` 自动升级为 `https://`（两种域名形态均验证）
- [x] 老网址 301 生效（`/inspiration/`、`/occasions/`、`/recipients/` 等 6 组）
- [x] `/api/lead` 表单函数在线（OPTIONS 204 / 非法类型 400）
- [ ] 提交一条测试留言，确认云数据库里能看到记录 ← **需要你自己做一次**
- [ ] 回 **Vercel** 后台删除旧项目（避免两处同时服务）

### 出问题去哪看

| 现象 | 排查入口 |
|---|---|
| 构建失败 | Cloudflare → Pages 项目 → **Deployments** → 点最新一条看构建日志 |
| 页面样式丢失 | 构建日志搜 `_astro`；本地跑 `npm run build` 后确认 `dist/_astro/` 有文件 |
| 表单提交失败 | 浏览器网络面板看 `/api/lead` 的状态码；若 404，在 `functions/api/lead/` 下补 `index.ts` |
| 域名不生效 | Cloudflare 域名首页看是否仍是 Pending；用 `whatsmydns.net` 查 NS 是否已切换 |
| 报 522 | 多半是自己手加了 DNS 记录。删掉，改走第 5 步的页面流程 |

---

## 四、日常运营流程（这是主理人每天要用的部分）

### 改内容

```bash
cd <仓库目录>
npm run dev
```

浏览器打开 **http://localhost:4321/keystatic** —— 这就是后台。

后台里已有的栏目（全部中文化，字段可拖拽排序）：

| 后台栏目 | 对应网站位置 |
|---|---|
| 产品与礼品 | 小民好礼 /gifts/ 及各商品详情页 |
| 选礼指南 / 场合 | 按场合选礼 /gift-guide/by-occasion/ |
| 选礼指南 / 对象 | 按对象选礼 /gift-guide/by-recipient/ |
| 生活场景 | /scenes/ |
| 静气生活 / Journal | /journal/ |
| 客户故事 | 首页案例区 |
| 帮助中心 / FAQ | /help/ |
| 渠道专题 / 小红书承接页 | /channel/{slug}/ |
| 网站设置 | 站名、口号、联系邮箱等 |
| 主菜单与二级菜单 | 顶部导航与页脚（可排序、可隐藏） |

改完内容点保存 → 文件直接写到本机 `content/` 目录。

### 发布上线

```bash
git add -A
git commit -m "更新内容：xxx"
git push
```

推送后 Cloudflare 会自动重新构建，约 1–2 分钟生效。

### 如果内容改坏了想撤回

每次改动都是一条 git 提交记录。找到改动前的那条提交，用 `git revert <提交号>` 撤回到原状态，再 push 即可。**内容不会丢**。

---

## 五、表单为什么还能用

站点的「与我们聊聊」「定制咨询」「订阅创作笔记」三个表单，提交后要写进云数据库。这部分需要服务端，因此改为 **Cloudflare Pages Function**：

- 文件位置：`functions/api/lead.ts`
- 路由：`POST /api/lead`
- 逻辑与原 Vercel serverless 版本**完全一致**（仅搬了位置）

前端调用地址已同步从 `/api/lead/` 改为 `/api/lead`。

**上线后请验证一次**：在网站上提交一条测试留言，确认能在云数据库后台看到记录。如果返回 404，说明尾斜杠路由未匹配，需要在 `functions/api/lead/` 下补一个 `index.ts`。

---

## 六、缓存与重定向

| 文件 | 作用 |
|---|---|
| `public/_headers` | 静态资源缓存策略（`/_astro/*` 一年、`/assets/*` 两周）+ 基础安全头 |
| `public/_redirects` | 全部 301 规则：旧地址迁移 + 本次去重 |

2026-09-28 新增的去重 301 见 `_redirects` 第二节，共 5 组，覆盖灵感参考下线、商品详情双 URL、场合/对象索引双 URL、企业页双 URL、软跳转页转真 301。

---

## 七、以后要升级的话

| 需求出现时 | 该做什么 |
|---|---|
| 想让助手也能改内容，但不想给 GitHub 账号 | 订阅 Keystatic Cloud Solo（约 9 美元/月），换成网页后台账号密码登录 |
| 需要给第二个人开"只能改某几个栏目"的权限 | 这时才考虑换 Payload CMS（需重写站点，非小改动） |
| 商品上百件、图片几百张 | 图片不要进 Git 仓库，改用对象存储（Cloudflare R2 免费额度 10GB） |
| 需要站内下单与订单管理 | 接微信小店 / 小程序（站点商品页已预留 `miniProgramUrl` 字段） |
| 需要定时发布（节日页到点自动上线） | Keystatic 不支持，需加构建定时任务或换 CMS |

---

## 八、需要留意的两个技术债

1. **`package.json` 里 astro 写的是 `latest`**。每次构建拉到的版本可能不同，建议改成固定版本（如 `^7.3.2`）以保证构建可复现。
2. **Keystatic 仍是 0.x 版本**（当前 0.6.9），升级时请先看 release notes 再升。

---

## 九、迁移执行记录（2026-09-28 实际完成）

### 已完成的事实（可用于日后核对）

| 项目 | 值 |
|---|---|
| Cloudflare 账号 ID | `fc5bdc20f05edbbfa43081b6a8f6c672` |
| 域名 Zone ID | `ec5edffa0f75fe19fbc66a771b34e485` |
| Pages 项目名 | `xiaominart` |
| 生产地址 | `https://xiaominart.pages.dev` |
| 指定 nameserver | `harlan.ns.cloudflare.com` / `priscilla.ns.cloudflare.com` |
| 原 nameserver | `dns1.hichina.com` / `dns2.hichina.com`（阿里云） |

### 已配置的内容

**DNS 记录（两条，均为代理开启）**

| 类型 | 名称 | 指向 | 代理 |
|---|---|---|---|
| CNAME | `www.xiaominart.com` | `xiaominart.pages.dev` | 已开启 |
| CNAME | `xiaominart.com` | `xiaominart.pages.dev` | 已开启 |

**Pages 自定义域名**

| 域名 | 验证状态 | 说明 |
|---|---|---|
| `xiaominart.com` | ✅ `active` | 由 Pages 直接服务，**规范域名** |
| `www.xiaominart.com` | ❌ `pending` | 报 `CNAME record not set`，长期未通过 |

**跳转规则**（走 Page Rules，不是 Redirect Rules）

```
匹配  www.xiaominart.com/*
动作  Forwarding URL，301
目标  https://xiaominart.com/$1
```

> 方向说明：**原计划是顶点域跳 www**，但 www 的 Pages 验证始终未通过（原因见第十节），
> 故改为 **www 跳顶点域**，以验证通过的顶点域作为规范域名。
>
> 为什么用 Page Rules 而不是更现代的 Redirect Rules：配置时手上的 API 令牌没有
> `Single Redirect` 权限，但 Page Rules 可用，效果等价。日后若要换成 Redirect Rules，
> 在 Cloudflare 后台 Rules → Redirect Rules 里重建即可，记得同时删掉这条 Page Rule。
> 免费版 Page Rules 上限 3 条，目前用掉 1 条。

**SSL 与 HTTPS**

| 设置 | 值 |
|---|---|
| SSL/TLS 加密模式 | Full (strict) |
| Always Use HTTPS | 开启 |

### 首次部署的验收结果

- 首页 + 6 个栏目页全部返回 200，无头浏览器截图确认渲染完整
- `_redirects` 里 6 组去重 301 全部生效（实测 8 条）
- `/api/lead` 表单函数在线：OPTIONS → 204，POST 无效类型 → 400，缺字段 → 400

### 迁移过程中发现的一个线上问题（已在新站修复）

`fde3c91` 删除重复页面时同时删掉了 `vercel.json`，改用了 Cloudflare/Netlify 才认的
`public/_redirects`。**但 Vercel 不读 `_redirects`**，所以在迁移完成前，
`/inspiration/`、`/occasions/`、`/recipients/` 等旧地址在正式站上返回的是 **404 而不是 301**。
这类"页面消失"信号对 SEO 有害。切到 Cloudflare 后这批 301 立即恢复——这也是本次迁移的额外收益。

### 两个 API 令牌的分工（日后维护参考）

本次迁移用了两个权限互补的令牌，**迁移完成后建议都作废**：

| 令牌 | 能做什么 | 缺什么 |
|---|---|---|
| 令牌 A | Cloudflare Pages、DNS、SSL/Zone Settings | 不能创建域名、不能用 Page Rules |
| 令牌 B | 创建域名、Page Rules | 不能访问 Pages、不能改 SSL 设置 |

**下次重新签发令牌时的完整权限清单**（合并两者，一次到位）：

| 作用域 | 权限 | 级别 |
|---|---|---|
| Account | Cloudflare Pages | Edit |
| Account | Account Settings | Read |
| Account | Zone | Edit ← 创建域名必需，注意第一列是 Account |
| Zone | DNS | Edit |
| Zone | Zone Settings | Edit |
| Zone | Config Rules | Edit |
| Zone | Page Rules | Edit |

---

## 十、域名切换与 www 验证问题（2026-09-28 14:00–14:45）

### 时间线

| 时间 | 事件 |
|---|---|
| 14:03 | 用户在阿里云把 NS 改为 Cloudflare 指定地址 |
| 14:05 | 权威 DNS 已切换；zone 状态 `active` |
| 14:10 | 顶点域 `xiaominart.com` 的 Pages 验证通过（`active`） |
| 14:10–14:40 | `www` 反复报 `CNAME record not set`，多轮重试未通过 |
| 14:12 | 出现 **522**（记录存在但 Pages 未认领该域名） |
| 14:35 | 改用顶点域为规范域名，www 反向 301 |
| 14:40 | 站点恢复：`https://xiaominart.com` 200 |
| 14:42 | 站点配置同步改为 apex，重新构建部署完成 |

### 根因与踩坑记录

**坑 1 —— 手动建 DNS 记录**
最初的 `www` / 顶点域 CNAME 是**在添加 Pages 自定义域之前手动建的**。
Cloudflare 官方文档明确：手工加记录会导致域名无法在 CNAME 目标解析，并显示 **522**。

**坑 2 —— 顺序要求**
正确顺序是「先在 Pages 项目里添加自定义域 → 由 Cloudflare 生成解析记录」。
即使后来改成正确顺序（先加域、后建记录、删掉重建、橙云/灰云都试过、触发多次
重新验证），`www` 依然报 `CNAME record not set`，而顶点域在同样条件下能通过。

**坑 3 —— 灰云无效**
试过把 `www` 改成灰云（DNS only）让公网能查到 CNAME，Postman 级别的公网查询
确实返回 `xiaominart.pages.dev.`，但 Pages 验证仍不通过，且灰云下 Cloudflare 的
CDN/WAF/Page Rules 全部失效，反而更不可用。**结论：www 必须保持橙云。**

**坑 4 —— 构建产物没更新**
改完 `astro.config.mjs` 后直接 `npm run build`，`dist/` 未被覆盖（safe-delete 拦截 +
增量缓存），部署上去的还是旧产物。**以后改配置后要先清 `dist` 再构建**：

```bash
CODEBUDDY_SAFE_DELETE_ENABLED=0 rm -rf dist .astro
npm run build
```

### 结论：以顶点域为规范域名

**现状（可用且一致）**

| 请求 | 结果 |
|---|---|
| `https://xiaominart.com/` | 200（Pages 直接服务） |
| `https://www.xiaominart.com/` | 301 → `https://xiaominart.com/` |
| `http://xiaominart.com/` | 301 → `https://xiaominart.com/` |
| `http://www.xiaominart.com/` | 301 → `https://xiaominart.com/` |

canonical / og:url / robots.txt / sitemap.xml 全部输出 `https://xiaominart.com`。

### 如果日后想改回 www 作为规范域名

前提：先在 Cloudflare 后台确认 `www.xiaominart.com` 的 Pages 验证已变成 `active`
（Pages 项目 → Custom domains 里看状态）。若仍是 `pending`，不要改，否则全站会 522。

确认通过后，需要四处同步修改：

1. `astro.config.mjs` → `site: 'https://www.xiaominart.com'`
2. `public/robots.txt` → Sitemap 地址
3. `src/pages/sitemap.xml.ts` → fallback base
4. Cloudflare Page Rule 方向反过来：`xiaominart.com/*` → 301 → `https://www.xiaominart.com/$1`

然后清 `dist` 重新构建、部署。

### 已知遗留

- `www` 的 Pages 验证仍是 `pending`。不影响使用（走 301），但**不要再动它的 DNS 记录**，
  每次改动都会让验证状态重置。
- 建议在 Google Search Console 里把站点属性设为 `https://xiaominart.com`
  （若之前用的是 www 属性，建议重新提交新属性的 sitemap）。
