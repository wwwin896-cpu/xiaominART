# 小民艺术 · Cloudflare 部署与后台操作说明

更新日期：2026-09-28
适用仓库：`wwwin896-cpu/xiaominART`（站点根目录即仓库根目录）

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

## 三、一次性配置（约 15 分钟）

### 1. 在 Cloudflare 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选择仓库 `wwwin896-cpu/xiaominART`
3. 构建设置填写：

   | 项目 | 值 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. 点击 **Save and Deploy**

> 仓库根目录已经放了 `.nvmrc`（内容为 `22`），Cloudflare 会按 Node 22 构建。

### 2. 绑定自定义域名

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 添加 `www.xiaominart.com`
3. 再添加 `xiaominart.com`（顶点域）

### 3. 配置顶点域跳转到 www（必须手动做）

`public/_redirects` 只能按路径匹配，**不能按域名匹配**，所以这条规则要在 Cloudflare 后台配：

1. 左侧 **Rules** → **Redirect Rules** → **Create rule**
2. 名称：`apex-to-www`
3. 匹配条件：`Hostname` 等于 `xiaominart.com`
4. 目标：动态表达式 `concat("https://www.xiaominart.com", http.request.uri.path)`
5. 状态码选 **301**，保留查询字符串，勾选"保留路径"

### 4. 换掉域名解析

把 xiaominart.com 的 DNS 指向 Cloudflare（域名注册商处改 nameserver，或在 Cloudflare 里加站点并按提示操作）。
确认新站可访问后，再回 Vercel 删除项目。

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
