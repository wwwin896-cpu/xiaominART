# xiaominART 官网深度诊断与后期解决方案

日期：2026-10-06  
对象：`https://www.xiaominart.com/` 及本地项目 `xiaominart-site`  
视角：普通用户、开发者、线上运营者  
验证方式：线上页面抓取、本地源码与内容读取、生产构建、类型检查、依赖审计、路由与部署配置核对  
原则：区分已复现事实、源码风险、待验证事项；不把未提交的表单或未确认的业务事实写成已完成

## 一、执行摘要

当前网站已经从“品牌展示 MVP”向“现货 + 定制 + 企业礼赠 + 机构合作”的综合入口演进，线上已经具备：

- 小民好礼总入口；
- 手写现货入口；
- 选礼指南对象 / 场合决策工具；
- 两位艺术家页面；
- 企业礼赠项目需求表单；
- 微信二维码、邮箱和定制咨询三种联系入口；
- `/shop/` 旧地址的 301 兜底；
- 6 个核心转化事件的上报基础；
- Cloudflare Pages 静态构建 + Pages Functions + GitHub Actions 部署链路。

但当前仍不建议把它视为“可以放心扩大投放的稳定运营站”，原因集中在四组：

1. **用户转化仍有断点**：首屏没有直接行动按钮；首页没有把两位艺术家、书法、面塑、现货、定制和机构合作在首屏后快速讲清；页面信息很多，但决策摘要不够统一。
2. **开发质量门禁未通过**：`npm run build` 成功，但 `npm run check` 失败，当前至少有 36 条由生成产物触发的 TypeScript 诊断；构建还有大于 500 kB 的 chunk 警告。
3. **安全与配置存在高优风险**：两个 Pages Function 将 WorkBuddy 访问密钥硬编码在源码；`public/_headers` 的安全响应头仍然很少；README、Astro 配置和部署文档对 Vercel / Cloudflare 的描述存在漂移。
4. **运营数据和事实治理还不完整**：核心事件已经接入，但没有完成线上读回、报表和漏斗复盘；sitemap 漏掉若干重要动态页面，且统一使用过期的 `2026-09-28` lastmod；现货库存、价格包含项、包装标准、交付和故事授权仍需建立单一事实源。

### 建议总顺序

```text
立即止损：密钥轮换 + 生产表单合成测试 + check 门禁修复
→ 转化修复：首屏 CTA + 两位艺术家 / 四项能力 + 现货决策摘要
→ SEO 与内容治理：sitemap、canonical、内容状态、授权状态
→ 运营增长：渠道落地页、事件报表、线索 SLA、复购和转介绍
```

## 二、现状与已完成项核对

| 项目 | 当前状态 | 证据 / 判断 |
|---|---|---|
| `/shop/` | 已不再直接 404，当前由 `public/_redirects` 301 到 `/gifts/` | 规则位于 `public/_redirects:30-35`；应继续保留并监控外部链接 |
| 企业表单 | 前端已调用 `submitLead('business_gift', ...)`，服务端白名单也包含 `business_gift` | `src/pages/business-gifts/index.astro:18-51`、`functions/api/lead.ts:17`；但本轮未提交测试线索，因此“能否在后台读到”仍未完成验收 |
| 移动端页脚联系 | `.footer-contact` 已恢复，微信二维码样式也有移动端规则 | `src/layouts/Layout.astro:170-175`；信任区和 Newsletter 仍隐藏 |
| `/journal/` | 有意通过 301 到 `/about/`，且站内主导航已移除 | `public/_redirects:25-27`；不是当前最高优先级缺陷 |
| 选礼指南 | 已有对象 / 场合选择、结果卡、价格、形式、时间、包装和 CTA | `src/pages/gift-guide/index.astro:28-119`；仍需验证内容映射与事件数据质量 |
| 现货页 | 已有独立 `/gifts/ready-made/` 与多条现货详情页，标注价格和可直接发货 | `src/pages/gifts/ready-made/index.astro:5-13`；需要确认每件作品状态与库存事实 |
| 联系页 | 已有微信二维码、邮箱、定制表单入口 | 线上 `/contact/` 与 `src/pages/contact/index.astro` |
| 首页首屏 | 仍只有轮播、文案和切换点，没有“现货 / 选礼 / 定制”三个直接 CTA | `src/pages/index.astro:22-81`；线上抓取也未见首屏行动按钮 |
| 两位艺术家首页呈现 | 艺术家详情页存在，但首页未形成明确的双艺术家展示与服务分流 | 首页源码 `src/pages/index.astro` 当前没有艺术家双卡区块 |
| 非遗面塑首页呈现 | 艺术家 / 机构页存在，首页没有面塑创作段落或作品细节段落 | 线上首页抓取内容未见非遗小宁区块 |

## 三、普通用户视角诊断

### 3.1 首次访问：气质先于答案

首页首屏依然主要表达：

- “方寸之境，也藏山河”；
- “它不完美，却很真实”；
- “看似条条框框，实则分寸有序”。

这些文案建立了审美气质，但首次访问用户仍需要自己回答：

- 这里具体卖什么？
- 是现货还是定制？
- 两位艺术家分别做什么？
- 非遗面塑是否是业务？
- 我现在应该看作品、选礼还是咨询？

当前首屏源码没有 CTA，只显示轮播 dots；见 [`src/pages/index.astro:22-81`](../src/pages/index.astro:22)。

#### 解决方案

在三张首屏画面内固定放置三枚入口，不随轮播内容变化：

```text
看手写现货 → /gifts/ready-made/
获取送礼建议 → /gift-guide/
发起定制咨询 → /custom-commission/
```

首屏下方立即增加一行事实型定位：

> 两位创作者，四种文化表达：手写书法、非遗面塑、插画与机构合作。

### 3.2 首页内容与已经确定的品牌方案仍不一致

此前确定的首页叙事包含：

```text
书法创作过程
→ 书法品质细节
→ 非遗小宁面塑创作
→ 面塑作品与细节
→ 我们可以为你做什么
→ 创作过程与品质证据
→ 作品精选
→ 给这份心意一句话
→ 最终咨询入口
```

但线上首页当前仍是：

```text
首屏轮播
→ 四个礼物方向
→ 客户分享
→ 四步共创过程
→ 联系入口
```

尚未看到：

- 书法 5 秒动态段落的 poster / 视频承接位；
- 三张书法品质细节图；
- 非遗小宁 5 秒动态段落的 poster / 视频承接位；
- 三张面塑作品 / 细节图；
- 两位艺术家并列入口；
- 四项能力矩阵；
- “给这份心意一句话”交互或轻量入口。

#### 解决方案

不要继续叠加长文案，优先新增 5 个短区块：

1. **书法创作段**：视频由运营方提供，页面只负责 poster、静音、reduced-motion 和 CTA；
2. **书法三图**：笔墨、作品进入空间、包装抵达；
3. **非遗小宁段**：视频 poster + 面塑创作说明；
4. **面塑三图**：创作手部、人物故事、微缩文化场景；
5. **双艺术家 / 四能力矩阵**：将个人礼赠、现货、定制、机构合作分流。

生成的 10 张方向素材和用法清单已经在：

- `docs/xiaominart-homepage-visual-assets-manifest-20260929.md`

上线时必须给这些素材标注“品牌视觉方向 / 示意图”，不要冒充真实成交作品或授权案例。

### 3.3 用户选礼路径变好，但结果仍有“形式”误导

`/gift-guide/` 当前已经能按对象和场合给出 2–3 个结果，并展示价格、形式、时间和包装；这是相比之前的明显进步。

但结果模板中仍统一写：

> 定制手写（另有可直接寄出的现货小品）

这会让用户在选择一个礼物方向时不清楚：

- 当前推荐的是定制方向，还是现货商品？
- 价格是现货价还是定制起点？
- 结果卡 CTA 是咨询，还是购买？

源码位置：[`src/pages/gift-guide/index.astro:84-96`](../src/pages/gift-guide/index.astro)。

#### 解决方案

产品数据增加明确的状态字段，并在结果卡按状态渲染：

```text
saleMode: ready_made | made_to_order | direction_only
availability: in_stock | pre_order | inquiry_only | unavailable
priceMode: fixed | range | starting_from | inquiry
```

结果卡必须显示：

```text
现货 · 可直接咨询发货
定制 · 需先确认内容与档期
方向参考 · 不代表同款可获得
```

### 3.4 现货页转化条件已经更清楚，但“可直接发货”需要后台事实支撑

线上现货页展示：

- 在册 12 幅；
- 摆件 / 挂墙价格；
- 含装裱、不含运费；
- 现货唯一一件；
- 不做复刻、不做批发；
- 微信二维码咨询。

用户路径已经比早期完整，但运营上必须确认：

- 12 幅是否对应 12 个真实库存记录；
- 每件作品是否已被售出、预留或下架；
- 页面图是否为对应实物图，而不是空间示意图；
- `Product` 结构化数据的 `InStock` 是否与真实库存同步。

现货详情页在 [`src/pages/gifts/ready-made/[slug].astro:20-33`](../src/pages/gifts/ready-made/[slug].astro) 固定输出 `availability: InStock`。如果某件售出，必须同步下架或改为不可售状态，否则会形成价格与库存承诺风险。

### 3.5 首页客户分享仍需更明确的事实标签

当前首页已把原“真实故事”改为：

> 客户分享 · 按委托情境整理

这是进步，但标题仍使用“客户分享”，正文采用引号形式，容易被普通用户理解为真实客户原话。

#### 解决方案

在内容模型中分离：

```text
storyStatus: real_authorized | anonymized_authorized | scenario_example
sourceNote: string
consentStatus: pending | granted | not_applicable
```

当 `scenario_example` 时显示：

> 典型送礼情境示例 · 非特定客户原话

只有获得授权并保留内部记录后，才显示“客户分享”。

## 四、开发者视角诊断

### 4.1 P0 安全问题：云数据库访问密钥硬编码在源码

以下两个 Pages Function 都把 `wbpk_...` 访问密钥直接写在源码常量中：

- `functions/api/lead.ts:14-17`
- `functions/api/event.ts:12-22`

本报告不复制该密钥。即使当前构建产物 grep 未发现它进入静态前端 JS，密钥仍然存在于仓库源码、构建上下文和服务端函数部署代码中，具备以下风险：

- 仓库权限扩大或历史提交泄露后可被读取；
- 密钥轮换必须修改代码并重新发布；
- 线索和事件接口共享长期凭据，权限边界不清晰；
- 运营者无法从部署平台单独吊销或替换凭据。

#### 解决方案

立即执行：

1. 在 WorkBuddy / 云数据库侧轮换当前访问密钥；
2. 检查现有密钥的权限范围、写入表和 RLS；
3. 从 `functions/api/lead.ts`、`functions/api/event.ts` 以及 Git 历史中移除硬编码；
4. 将密钥作为 Cloudflare Pages Secret / Environment Variable 注入；
5. Function 内通过 `context.env` 或平台运行时环境读取；
6. 分离 `lead` 和 `event` 凭据，事件写入权限不应自动等同线索写入权限；
7. 检查历史提交、构建日志和部署产物，确认旧密钥不再可用；
8. 轮换完成后再验证表单和事件。

这项不应等到下一轮视觉改造后处理。

### 4.2 `npm run check` 当前失败，不能作为合格质量门禁

本地执行结果：

- `npm run build`：成功，71 个页面构建完成；
- `npm run check`：失败，输出 36 条诊断；
- `npm audit --omit=dev`：2 个生产依赖漏洞，1 个 high、1 个 moderate。

`check` 的主要诊断来自构建后的 `dist/_astro/*.js`，例如：

- `FloatingConsultation` 中 `Element` 未收窄为 `HTMLFormElement` / `HTMLButtonElement`；
- `Element` 可能为 null；
- `Layout` 中 `Event` 未收窄为 `CustomEvent`；
- `dataset` 类型未收窄；
- 字符串索引空对象产生 `ts(7053)`。

这说明当前检查配置至少有两层问题：

1. `dist` 未被 TypeScript / Astro check 排除，生成 JS 被再次检查；
2. 源码中的 DOM 类型也需要明确收窄，不能只依赖生成产物排除来掩盖。

#### 解决方案

第一步：

- 在 `tsconfig.json` 明确排除 `dist`、`.astro` 生成目录和临时输出目录；
- 清理后重新执行 `npm run check`，得到纯源码结果。

第二步：

- 在 `FloatingConsultation.astro` 使用 `querySelector<HTMLFormElement>`、`querySelector<HTMLButtonElement>`、`querySelector<HTMLElement>`；
- 在 `Layout.astro` 将监听器参数收窄为 `CustomEvent<Record<string, unknown>>` 或定义事件类型；
- 对 `dataset` 和可能为空的节点使用显式类型守卫；
- 把 `trackEvent` 的 payload 定义成明确的事件联合类型，减少任意字符串。

第三步：

- 将 `npm run check` 设为部署前必须通过的 CI 步骤；
- `npm run build` 成功但 `check` 失败时禁止自动发布。

### 4.3 构建有大 chunk 警告

构建成功，但 Vite 报告部分压缩后 chunk 大于 500 kB。

#### 影响

- 移动端首屏 JS 下载和解析成本增加；
- Keystatic 或共享组件可能把不必要代码带入前台页面；
- 对小红书移动流量和低端设备不利。

#### 解决方案

- 检查 `dist/_astro` 最大 chunk 的来源；
- 将 Keystatic 仅保留在 `/keystatic/` 路由，不让前台共享入口引入；
- 对决策工具、愿望单和复杂详情交互使用按需加载；
- 图片继续使用明确尺寸和懒加载；
- 不要直接提高 `chunkSizeWarningLimit` 来掩盖问题；
- 将体积预算加入 CI，例如主站首屏 JS、单页总 JS、最大 chunk 三项分别设限。

### 4.4 部署架构文档漂移：README 写 Vercel，实际配置为 Cloudflare Pages

当前项目存在明显的架构说明不一致：

- `README.md:3`、`README.md:27` 仍描述 Astro + Sanity + Vercel；
- `astro.config.mjs:7-15` 描述 Cloudflare Pages + Pages Functions + GitHub Actions；
- `package.json:11` 使用 `wrangler pages deploy`；
- `.github/workflows/deploy.yml:41-46` 部署到 Cloudflare Pages；
- `.env.example` 仍包含 `PUBLIC_SANITY_*` 和旧的 `PUBLIC_FORM_ENDPOINT`。

#### 风险

- 新开发者会按错误平台排查问题；
- 环境变量和部署权限配置容易放错位置；
- 事故时无法快速判断 Function、静态构建、Keystatic 和域名规则归属；
- 文档中的“生产已验证”可能不再对应当前代码。

#### 解决方案

建立单一部署说明：

```text
GitHub main
→ GitHub Actions
→ npm install
→ npm run check
→ npm run build
→ Cloudflare Pages deploy
→ Pages Functions /api/lead、/api/event、/api/keystatic
```

同步修订：

- `README.md`；
- `.env.example`；
- `docs/cloudflare-部署与后台说明.md`；
- `astro.config.mjs` 顶部注释；
- Keystatic 使用指南；
- Vercel 旧文档和旧环境变量说明。

### 4.5 Keystatic 生产构建存在路由警告

构建过程中出现：

> No API Route handler exists for the method “GET” for the route `/keystatic/shell-page/`.

构建最终成功，但说明静态后台外壳的 Astro 路由生成行为仍有警告。

#### 解决方案

- 检查 `src/pages/keystatic/shell-page.js` 与 `src/pages/keystatic/index.astro` 的导入关系；
- 确认 `/keystatic/shell-page/` 是否意外被当作页面路径生成；
- 生产构建后用浏览器分别验证 `/keystatic/`、登录、树读取、编辑、保存和回跳；
- 把该警告加入后台专门的 smoke test，而不是只看 `npm run build` 的 exit code。

### 4.6 sitemap 覆盖不完整且 lastmod 过期

`src/pages/sitemap.xml.ts` 当前只包含：

- 部分一级页面；
- 5 个礼品详情；
- 未包含现货详情页；
- 未包含两位艺术家详情页；
- 未包含渠道专题页；
- 未包含场合 / 对象详情页；
- 未包含部分已经构建出来的内容页面。

同时 `LASTMOD` 固定为 `2026-09-28`，但当前已发生 10 月 3–6 日的代码和内容更新。

#### 解决方案

- sitemap 由最终可索引路由清单生成，不手写一份过时列表；
- 明确哪些页面是 SEO 内容页、哪些是后台 / 私密 / 重定向页；
- 纳入已确认可索引的现货详情、艺术家详情、渠道专题页；
- 对未发布、无真实内容或仅占位页面设置 `noindex` 或不进入 sitemap；
- `lastmod` 取内容文件的真实修改时间或发布版本时间；
- 使用 XML parser 或 Search Console 检查，而不是只看浏览器文本。

### 4.7 HTTP 安全响应头不足

`public/_headers` 目前主要设置：

- `X-Content-Type-Options: nosniff`；
- `Referrer-Policy: strict-origin-when-cross-origin`；
- 静态资源缓存。

尚未看到明确的：

- `Content-Security-Policy`；
- `Permissions-Policy`；
- `Strict-Transport-Security`（应确认由 Cloudflare 层统一提供）；
- 对 `/api/*` 的缓存禁用与来源限制说明。

#### 解决方案

先在 staging 验证再上线 CSP，避免破坏 Keystatic 和内联脚本：

- `Content-Security-Policy-Report-Only` 观察一轮；
- 限制 `script-src`、`img-src`、`connect-src` 到本站、GitHub OAuth、二维码和必要 CDN；
- 明确禁止页面被 iframe 嵌入或设置合适的 `frame-ancestors`；
- 为 `/api/*` 设置 `Cache-Control: no-store`；
- HSTS 在确认所有域名、子域名和后台链路都 HTTPS 后由 Cloudflare 配置。

### 4.8 `Product` 结构化数据和真实库存耦合不足

现货详情页固定输出：

- `Product`；
- `Offer`；
- `availability: InStock`；
- `price`。

但实际商品状态来自静态 `readyMadeWorks`，并且页面展示“现货唯一一件”。如果运营只在内容文件或后台修改标题 / 价格，未同步状态，搜索引擎和用户都会收到错误的库存信号。

#### 解决方案

为现货模型增加：

```text
published
availability
inventoryStatus
soldAt
price
shippingNote
imageType: real_product | scene_mockup
```

只对 `published: true` 且 `availability: in_stock` 的作品输出 `Offer`；售出后输出 `OutOfStock` 或移除 Offer，并保留作品档案页用于品牌内容。

## 五、线上运营者视角诊断

### 5.1 当前可以运营，但还缺“内容到线索”的闭环

已有渠道专题页：

- `/channel/xiaohongshu-housewarming/`；
- `/channel/xiaohongshu-teacher-gift/`。

已有核心事件基础：

- `hero_cta_click`；
- `gift_guide_select`；
- `consultation_start`；
- `consultation_submit`；
- `business_brief_submit`；
- `contact_channel_click`。

但当前仍缺：

- 运营者可查看的日报 / 周报；
- 页面、渠道、主题、场合、对象与线索的归因报表；
- 表单成功后的后台读回验收；
- 线索负责人、响应时间、状态和下一步；
- 现货售出 / 预留 / 下架的工作流；
- 内容发布前的事实检查和授权检查。

#### 解决方案：先做最小运营看板

第一版只需要回答：

```text
本周从哪里来了多少咨询？
哪一个主题被看得最多？
哪一个入口最容易开始咨询？
表单失败了几次？
企业线索是否在两个工作日内处理？
哪几件现货仍可售？
```

不要一开始做复杂 CRM，先把以下字段存入 `leads`：

```text
form_type
created_at
source_page
referrer
channel
artist
product_or_theme
recipient
occasion
contact
status
owner
first_response_at
```

### 5.2 线索 SLA 需要可执行而不是只写文案

企业页写“两个工作日内回复”，联系页写“通常当天回复”。这是用户承诺，运营者必须能执行。

#### 解决方案

定义线索状态：

```text
new → contacted → qualified → proposal_sent → won / lost / archived
```

定义最少运营规则：

- 微信、企业礼赠、定制咨询每日固定检查；
- 超过承诺时间未处理自动进入提醒；
- 线索必须有负责人；
- 线索内容默认私密；
- 公开案例必须从线索状态单独获得授权。

### 5.3 “现货”和“定制”要使用两套不同的运营话术

现货用户关心：

```text
是不是这一件？
多少钱？
能不能直接发？
运费多少？
多久到？
```

定制用户关心：

```text
能不能写这句话？
谁来创作？
多久能完成？
能改几次？
怎么确认？
预算如何确定？
```

当前部分页面仍把两条路径混在“礼物方向”里。建议所有内容卡片带状态标签：

```text
现货 · 可直接咨询发货
定制 · 先确认内容与档期
机构项目 · 需提交项目需求
```

### 5.4 内容发布必须加入“事实 / 授权 / 素材”三项检查

每次通过 Keystatic 发布前，运营者至少确认：

1. **事实**：价格、库存、包装、交期是否是当前真实值；
2. **授权**：客户姓名、原话、照片、Logo、项目名称是否获授权；
3. **素材**：图片是实拍、AI 方向图、空间示意图还是授权案例。

建议在后台内容模型中增加：

```text
contentStatus: draft | reviewed | published | archived
factCheckedAt
factCheckedBy
consentStatus
assetType
replacementRequired
```

### 5.5 渠道运营需要一页一任务，不要把所有流量送首页

现有小红书专题页方向正确，但要进一步做到：

```text
小红书笔记：乔迁送礼
→ 乔迁专题页
→ 2–3 个明确建议
→ 微信 / 表单
```

不要：

```text
小红书笔记
→ 首页
→ 用户自行寻找
```

未来渠道落地页建议按以下模板：

- 一个具体场景；
- 三张真实或明确标注的方向图；
- 一段 30 秒内读完的解释；
- 价格 / 时间 / 包装边界；
- 一个主 CTA；
- 一个备用 CTA；
- 事件参数带上 `channel`、`campaign`、`occasion`。

## 六、优先级整改清单

### P0：立即处理

| 编号 | 问题 | 影响 | 处理结果 |
|---|---|---|---|
| P0-1 | Pages Function 硬编码云访问密钥 | 线索与事件数据可能被未授权写入；无法安全轮换 | 轮换、分离权限、改用 Cloudflare Secrets、检查历史提交 |
| P0-2 | `npm run check` 失败 | 代码质量门禁失效，类型回归可能进入生产 | 排除生成目录后重跑，修复真实源码诊断，接入 CI |
| P0-3 | 企业表单线上入库未完成读回验证 | 企业线索可能丢失而运营者无感 | 用测试记录验证 `/api/lead`、云表、字段、失败提示和后台可查 |
| P0-4 | 现货 `InStock` 与真实库存没有统一事实源 | 售罄后仍可能显示可售 | 增加库存状态与发布工作流 |

### P1：本周处理

| 编号 | 问题 | 影响 | 处理方案 |
|---|---|---|---|
| P1-1 | 首屏没有 CTA | 首次访问用户看不懂下一步 | 固定三按钮：现货、选礼、定制 |
| P1-2 | 首页没有两位艺术家与非遗面塑叙事 | 品牌差异化未被快速理解 | 增加双艺术家 / 四能力区块和素材段落 |
| P1-3 | 选礼结果混淆现货和定制 | 用户无法判断购买路径 | 增加 `saleMode`、`availability`、`priceMode` |
| P1-4 | 移动端信任区仍部分隐藏 | 社交流量进入后难以即时确认品牌和联系 | 保留最小联系、隐私和事实边界 |
| P1-5 | sitemap 漏掉动态内容，lastmod 过期 | SEO 收录和更新信号不完整 | 从可索引路由生成 sitemap，动态 lastmod |
| P1-6 | 部署文档仍写 Vercel | 维护、排障和交接易出错 | 统一为 Cloudflare Pages + Functions |

### P2：两周内处理

| 编号 | 问题 | 影响 | 处理方案 |
|---|---|---|---|
| P2-1 | 大 chunk 警告 | 移动端性能和流量成本 | 体积分析、按需加载、Keystatic 隔离 |
| P2-2 | 安全响应头不足 | 浏览器防护基线不完整 | CSP Report-Only、Permissions-Policy、API no-store |
| P2-3 | 内容授权和事实状态未进入模型 | 运营发布容易越界 | 增加状态、授权、审核字段 |
| P2-4 | 运营看板和线索 SLA 缺失 | 无法判断渠道和销售效率 | 最小漏斗报表、负责人、响应时间 |
| P2-5 | 页面中英文和长文案层级偏重 | 普通用户决策时间增加 | 中文决策信息优先，英文作为辅助 |

## 七、推荐技术与运营路线图

### 第 0 阶段：安全和可回滚

- 轮换硬编码访问密钥；
- 保存当前线上版本的可回滚部署；
- 不在生产提交真实个人测试数据；
- 建立 staging / preview 验证环境；
- 记录密钥轮换、Function 验证、回滚点。

### 第 1 阶段：质量门禁与线索验证

- 修复 `npm run check`；
- CI 顺序改为 `npm install` → `npm run check` → `npm run build`；
- 验证企业、定制、快速留言三类线索入库；
- 验证成功 / 失败 / 超时 / 重复提交；
- 验证事件入库和重复去重。

### 第 2 阶段：首页获客改造

- 首屏三 CTA；
- 双艺术家 + 四能力；
- 书法 / 面塑素材区；
- “给这份心意一句话”轻量入口；
- 首页每个区块只保留一个主要动作。

### 第 3 阶段：商品和选礼运营化

- 现货模型与库存状态；
- 统一主题、场合、对象关系；
- 现货 / 定制 / 方向参考标签；
- 详情页 30 秒决策摘要；
- 价格、包装、交付、售后统一事实源。

### 第 4 阶段：SEO 与增长

- 修正 sitemap；
- 补充艺术家详情、合作页和授权案例；
- 每个渠道一个任务型落地页；
- 事件数据进入周报；
- 两周后依据漏斗数据调整 CTA 和页面排序。

## 八、验收标准

### 用户验收

- 首屏 5 秒内能回答“做什么”；
- 首屏 10 秒内能找到现货、选礼、定制任一入口；
- 现货详情页能回答价格、状态、交付和咨询方式；
- 选礼结果能区分现货与定制；
- 移动端能直接看到至少一个微信 / 邮件 / 表单入口；
- 企业用户提交后看到明确结果，不再出现“本机草稿”。

### 开发验收

- `npm run check` 通过；
- `npm run build` 通过且无未解释的路由警告；
- `npm audit --omit=dev` 的 high 风险得到处置或有书面豁免；
- 源码、历史提交、构建产物不含硬编码访问密钥；
- `/api/lead`、`/api/event` 使用部署 Secrets；
- sitemap 只包含最终可索引页面；
- 现货结构化数据与库存状态一致；
- 生产回滚点和部署平台文档一致。

### 运营验收

- 每条线索有 `form_type`、来源页面、来源渠道和状态；
- 企业线索在承诺时间内被处理；
- 现货售出 / 预留 / 下架有明确操作人；
- 每条客户故事有授权状态；
- 每张图片有素材类型：实拍、方向图、空间示意或授权案例；
- 每周能回答入口、主题、渠道和表单失败四个问题。

## 九、最终判断

xiaominART 当前最值得保留的是东方审美、书写礼赠定位、两位创作者的人物基础和“先理解心意、再决定形式”的沟通方式。

当前最需要停止的是：

- 在质量门禁未通过前继续堆页面；
- 在密钥未轮换前扩大表单流量；
- 在库存和包装事实未统一前扩大商品投放；
- 在授权状态不清时使用“客户原话 / 真实案例”式表达；
- 用长文案替代首屏明确行动入口。

最终改造目标不是让网站更复杂，而是让它稳定完成：

```text
被渠道带来
→ 5 秒看懂品牌
→ 30 秒找到方向
→ 2 分钟判断形式、价格和时间
→ 1 次提交完成咨询
→ 运营者收到、跟进并复盘
```

当前建议的第一执行顺序为：

```text
1. 轮换硬编码访问密钥
2. 修复 npm run check 并纳入 CI
3. 验证三类表单真实入库
4. 建立现货库存事实源
5. 首页加入三 CTA 和双艺术家 / 四能力区块
6. 修正 sitemap 与内容授权模型
```
