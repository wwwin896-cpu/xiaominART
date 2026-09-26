# 小民艺术｜Keystatic 接入与网站重做执行方案

## 0. 本文用途

本方案基于附件《小民艺术_Keystatic接入执行清单.docx》，并结合当前 `xiaominart-site` 项目实际状态，以及近两天确认的品牌方向和新 Logo 锁定文案编制。

本文件是**待确认的执行方案**。在用户确认前，不安装 Keystatic、不迁移内容、不改造页面、不部署生产环境。

---

## 1. 已确认的品牌基准

### 1.1 品牌 Logo / 品牌锁定

网站统一使用：

> **小民艺术｜东方日常之礼**

英文品牌标识继续使用现有 `XIAOMINART` 字标资源，中文品牌锁定作为 Logo 下方的副标/锁定文字呈现。

建议首版实现方式：

- 保留现有 `public/assets/brand/xiaominart-wordmark-black.svg` 字标资产。
- 在页眉、移动端菜单、页脚和 SEO 元数据中统一使用“小民艺术｜东方日常之礼”。
- 不在没有新 Logo 原始矢量文件的情况下擅自重绘字标或修改字形。
- 如果后续提供正式的中文 Logo SVG/PNG，再替换为完整组合 Logo；页面字段和 alt 文本保持一致。

### 1.2 艺术家笔名

全站统一使用：

> **升斗小民**

附件清单中的“斗升小民”属于旧写法，不能迁移为新内容。迁移脚本、默认值、艺术家资料、文章作者和筛选项统一采用“升斗小民”。

### 1.3 主导航基准

当前已确认的五项主导航作为第一版 CMS 菜单初始值：

1. 手写书法 → `/artists/`
2. 手作/插画 → `/inspiration/`
3. 非遗/器物 → `/art-gift/`
4. 企业定制 → `/business-gifts/`
5. 关于我们 → `/about/`

“送礼指南、生活场景、静气生活、Journal、咨询”等页面可作为二级菜单、页内入口或页脚入口，不默认增加主导航数量。

---

## 2. 当前项目核查结论

### 2.1 当前技术状态

- 框架：Astro 静态站点
- 部署：Vercel Production
- 内容主数据：主要位于 `src/data/content.ts`
- 页面文案：分散在 `.astro` 页面和组件中
- 图片：位于 `public/assets/`，近期场景图片位于 `public/assets/scenes/`
- 主导航：由 `src/data/content.ts` 的 `navItems` 提供
- 交易能力：当前没有真实购物车、支付、库存、订单和持久化咨询后台
- Sanity：存在占位配置/Schema，但当前不是可用生产 CMS
- Keystatic：当前项目没有 `keystatic.config.ts`，没有 Keystatic 依赖，没有 `/keystatic` 路由

### 2.2 与附件清单的偏差

附件将“本地 Markdown 内容”作为当前状态，但当前项目实际仍有大量内容在 TypeScript 和 Astro 模板中。因此不能只安装 Keystatic 就自动获得可编辑后台，必须先进行内容抽取和页面数据层改造。

附件中的 `writeFileSync` 方案不适合 Vercel Serverless 持久化咨询数据。企业咨询必须采用以下路线之一：

- Keystatic/GitHub API 写入受保护的内容仓库；
- 第三方表单服务；
- 第二阶段使用数据库或 CRM。

本次方案优先采用：**网站内容由 Keystatic 管理；企业咨询先接入可靠的表单/邮件通知链路，不把 Serverless 临时文件系统当作数据库。**

---

## 3. 目标架构

```text
Astro 前端
  ├─ 静态页面与响应式 UI
  ├─ Keystatic 内容读取层
  ├─ 主菜单/二级菜单读取层
  └─ Vercel 构建部署

Keystatic
  ├─ 本地开发：Local Mode
  ├─ 生产编辑：Cloud Mode + GitHub OAuth
  ├─ GitHub 仓库：Markdown/MDX 内容
  ├─ 图片：Git 资源或后续 CDN
  └─ 发布：Git commit → Vercel 自动构建
```

### 3.1 后台入口

目标入口：

```text
https://www.xiaominart.com/keystatic
```

该地址只有在完成 Keystatic 集成、GitHub OAuth、生产环境变量和 Vercel 部署后才会真实可用。在实施前不能把它当作已经存在的后台链接。

### 3.2 后台能力边界

第一阶段后台支持：

- 修改首页和全局文案
- 新增、编辑、隐藏产品/礼品
- 管理灵感/场景内容
- 管理 Journal / 创作笔记
- 管理客户故事
- 修改 Logo 副标、SEO 信息和联系信息
- 调整主菜单顺序
- 添加、删除、隐藏二级菜单
- 修改菜单标题、英文标题、链接、排序和发布状态

第一阶段不虚构：

- 在线支付
- 库存扣减
- 订单履约
- 退款系统
- 自动 CRM
- 直接把用户咨询写入 Vercel 本地文件

---

## 4. Keystatic 内容模型

### 4.1 `settings`：网站设置单例

用于管理全站只应存在一份的内容：

- `siteTitle`
- `siteDescription`
- `logoSubtitle`，默认值：`小民艺术｜东方日常之礼`
- `brandSlogan`，默认值：`见字如面，郑重表达`
- `contactEmail`
- `footerText`
- `artistPenName`，默认值：`升斗小民`
- `defaultOgImage`
- `published`

### 4.2 `navigation`：主菜单与二级菜单

建议采用单例配置，而不是把菜单散落在模板中：

```text
navigation
├─ primaryItems[]
│  ├─ label
│  ├─ englishLabel
│  ├─ href
│  ├─ visible
│  ├─ order
│  └─ children[]
│     ├─ label
│     ├─ englishLabel
│     ├─ href
│     ├─ visible
│     └─ order
└─ footerItems[]
```

初始主菜单数据：

| 顺序 | 中文 | 英文 | 链接 |
|---:|---|---|---|
| 1 | 手写书法 | Handwritten Calligraphy | `/artists/` |
| 2 | 手作/插画 | Handmade / Illustration | `/inspiration/` |
| 3 | 非遗/器物 | Heritage / Objects | `/art-gift/` |
| 4 | 企业定制 | Corporate Custom | `/business-gifts/` |
| 5 | 关于我们 | About | `/about/` |

二级菜单的初始建议：

```text
手写书法
├─ 艺术家介绍 → /artists/
├─ 书房与客厅场景 → /scenes/
└─ 礼赠方向 → /gift-guide/

手作/插画
├─ 灵感画廊 → /inspiration/
├─ 生活场景 → /scenes/
└─ 静气生活 → /journal/

非遗/器物
├─ 艺术礼盒 → /art-gift/
├─ 茶室与器物 → /scenes/
└─ 节日心意 → /gift-guide/

企业定制
├─ 企业伴手礼 → /business-gifts/
├─ 空间与活动 → /business-custom/
└─ 提交企业需求 → /business-gifts/#business-form

关于我们
├─ 品牌故事 → /about/
├─ 联系方式 → /contact/
└─ 常见问题 → /faq/
```

以上二级菜单是初始建议，不等于强制最终菜单；后台上线后可以由运营调整。

### 4.3 `products`：产品/礼品

字段：

- 标题与 slug
- 副标题
- 品类
- 价格区间
- 封面图
- 产品图集
- 适用场景
- 适用场合
- 礼品寓意
- 适合对象
- 包装说明
- 预计发货参考
- 首页推荐
- 是否发布
- 正文 MDX

现有价格档位先保持：

- 入门款：`¥100–300`
- 心意款：`¥300–500`
- 珍藏款：`¥800 以上`

价格字段必须是可编辑的内容字段，但不在本次接入中擅自改价。

### 4.4 `scenes`：生活场景

字段：

- 标题、slug、副标题
- 空间类型
- 风格关键词
- 场景描述
- 场景图片
- 关联产品
- 发布状态

初始场景：书房、客厅、茶室、玄关、礼赠、企业空间。

### 4.5 `blog`：静气生活 / Journal

字段：

- 标题、slug
- 作者，默认“升斗小民”
- 发布日期
- 封面图
- 标签
- 摘要
- 正文 MDX
- 发布状态

### 4.6 `clientStories`：客户故事

字段：

- 故事标题、slug
- 脱敏客户名
- 客户类型
- 项目类型
- 客户评价原文
- 项目实景图
- 授权状态
- 发布状态
- 故事正文

没有授权的素材不得自动公开。

### 4.7 `inquiries`：企业咨询

此集合只在确认持久化方案后启用。字段包含：

- 姓名
- 公司
- 邮箱/电话/微信
- 咨询类型
- 预算
- 数量
- 需求描述
- 收到时间
- 已读
- 已回复
- 内部备注

推荐初期使用表单服务或 GitHub API 受控写入，不使用 Vercel 临时文件写入。

---

## 5. 页面改造范围

### P0：后台基础和全局内容

1. 安装 `@keystatic/core` 与 `@keystatic/astro`。
2. 创建 `keystatic.config.ts`。
3. 创建 `/keystatic` 路由。
4. 创建 `src/lib/keystatic.ts` 数据读取层。
5. 创建 `settings` 和 `navigation` 单例。
6. 改造 `Layout.astro` 读取 Logo 副标、SEO、主导航和二级菜单。
7. 统一使用“小民艺术｜东方日常之礼”和“升斗小民”。

### P1：内容迁移和页面数据化

1. 将 `src/data/content.ts` 中的产品、场景、艺术家、文章和客户故事迁移为内容集合。
2. 将最近接入的场景图片迁移到内容引用或公开资源路径。
3. 改造首页读取设置、推荐产品和场景。
4. 改造手写书法、手作/插画、非遗/器物页面。
5. 改造礼品详情页和生活场景页。
6. 改造 Journal 列表和详情页。
7. 改造企业定制页面。

### P2：咨询和运营增强

1. 企业咨询表单接入可靠存储/通知。
2. 后台增加咨询状态管理。
3. 增加图片授权状态管理。
4. 增加草稿/发布流程说明。
5. 增加菜单预览和移动端导航验收。
6. 增加内容编辑操作手册。

---

## 6. Logo 与视觉重做要求

### 6.1 不改变已确认的品牌文字

所有以下位置统一：

```text
小民艺术｜东方日常之礼
```

- 桌面端 Logo 锁定
- 移动端 Logo 锁定
- 页脚品牌信息
- `title`
- Open Graph 标题
- 默认站点描述
- 后台网站设置

### 6.2 视觉执行

- 保留现有 XIAOMINART 字标作为英文识别资产。
- 中文副标与字标保持清晰层级，不让副标挤压移动端导航。
- 移动端使用单行或可控宽度布局，不能产生横向溢出。
- 主导航五项保持当前确认顺序，二级菜单使用抽屉/下拉展开，不增加顶部拥挤度。
- 图片、场景和产品卡片优先使用已授权/已确认素材。

---

## 7. 部署与环境变量

### 7.1 必需环境变量

本地使用 `.env.local`，生产环境配置在 Vercel Project Settings；真实值不提交 Git：

```text
KEYSTATIC_GITHUB_CLIENT_ID=
KEYSTATIC_GITHUB_CLIENT_SECRET=
KEYSTATIC_SECRET=
PUBLIC_SITE_URL=https://www.xiaominart.com
```

如果当前 Keystatic 版本要求额外的 Cloud 项目变量，以安装后的官方类型和构建提示为准，不在没有验证前硬编码字段名。

### 7.2 GitHub OAuth

需要在 GitHub OAuth App 中配置：

- Homepage URL：`https://www.xiaominart.com`
- Authorization callback URL：以当前安装的 Keystatic 官方集成要求为准
- Client ID/Secret 写入 Vercel 环境变量
- OAuth App 权限仅授予目标仓库所需范围

附件清单中把部分 Vercel Secret 写法直接放进 `vercel.json`，不建议照搬；敏感值应放在 Vercel 环境变量设置中。

### 7.3 发布链路

```text
后台编辑
  → Keystatic 生成 Markdown/MDX 变更
  → GitHub commit
  → Vercel 自动构建
  → 生产站更新
```

每次上线前执行：

```bash
npm run check
npm run build
```

---

## 8. 验收标准

### 后台

- `/keystatic` 可以访问。
- 未登录用户不能编辑生产内容。
- GitHub OAuth 能完成登录。
- 可以修改网站设置并生成 Git commit。
- 可以编辑产品、场景和文章。
- 可以修改主菜单顺序和二级菜单关系。
- 可以隐藏菜单项而不删除内容。

### 前端

- 首页、产品、场景、Journal、企业定制页面从内容集合读取。
- Logo 显示“小民艺术｜东方日常之礼”。
- 艺术家笔名全部显示“升斗小民”。
- 五项主导航顺序正确。
- 二级菜单桌面端和移动端都能展开。
- 移动端无横向溢出，底部快捷栏不遮挡内容。
- 图片无 404，alt 文本完整。
- 价格档位保持：¥100–300、¥300–500、¥800 以上。

### 构建与性能

- `npm run check`：0 errors、0 warnings、0 hints。
- `npm run build` 成功。
- 生产首页、主导航、二级菜单、产品详情、场景页和 `/keystatic` 路由可访问。
- Lighthouse 目标不低于附件要求的 80 分；正式测试应在后台和页面改造完成后进行。

---

## 9. 执行顺序与暂停点

### 批次 A：基建验证

- 安装依赖
- 创建配置
- 接入 Astro
- 创建后台路由
- 本地启动验证
- 不部署生产

### 批次 B：内容与 Logo 迁移

- 创建内容目录
- 迁移设置、导航、产品、场景和文章
- 统一 Logo 副标
- 统一“升斗小民”
- 本地页面回归

### 批次 C：页面数据化

- 首页
- 产品/礼品页
- 场景页
- Journal
- 企业定制
- 菜单二级关系

### 批次 D：生产接入

- 配置 GitHub OAuth
- 配置 Vercel 环境变量
- 生产构建
- 后台登录验收
- 移动端验收
- 生产部署

**暂停规则：** 批次 A 完成后先停下。如果 Keystatic 版本、GitHub OAuth、内容读取方式或后台路由与预期不一致，先修订方案，不直接进入批量迁移。

---

## 10. 需要用户确认的事项

请确认以下内容后，我再开始执行：

1. 是否同意把当前网站升级为 Astro + Keystatic + GitHub + Vercel 架构。
2. 是否确认后台入口使用 `/keystatic`。
3. 是否确认 Logo 文案固定为：`小民艺术｜东方日常之礼`。
4. 是否确认艺术家笔名固定为：`升斗小民`。
5. 是否确认主导航仍为：手写书法、手作/插画、非遗/器物、企业定制、关于我们。
6. 是否同意保留当前价格档位：`¥100–300`、`¥300–500`、`¥800 以上`。
7. 是否同意第一阶段不接入真实支付、库存和订单系统。
8. 是否能提供或授权配置 GitHub OAuth App，以及 Vercel 环境变量。
9. 企业咨询是先接第三方表单/邮件通知，还是等待 GitHub API 受控写入方案。
10. 是否同意保留现有 XIAOMINART 字标，中文 Logo 先以副标锁定形式实现；如有正式中文 Logo 原文件，请在开发前提供。

---

## 11. 本次交付范围

本次已完成：

- 读取并核对附件执行清单。
- 对照当前项目架构、数据来源和部署方式。
- 识别附件中需要修正的技术风险。
- 结合最新 Logo、笔名、价格和五项主导航整理本执行方案。

本次未执行：

- 未安装 Keystatic。
- 未创建配置文件。
- 未迁移内容。
- 未修改网站源码。
- 未修改 GitHub 仓库。
- 未部署生产环境。
