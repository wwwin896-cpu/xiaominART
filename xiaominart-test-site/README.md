# xiaominART 网站测试版

这是小民艺术 XIAOMINART 的独立销售型网站测试版，与 Geektion 完全无关。本版本处于整改与复验中，不是正式上线版本。

## 测试边界

- 仅使用演示商品、虚拟客户和虚拟地址。
- 模拟支付只产生测试状态，不接收真实付款、不收集银行卡信息、不发货。
- 测试站带 `noindex`，不会修改 `xiaominART.com` / `xiaominart.com` DNS。
- 图片为明确标注的演示构图，不能当作斗升小民原作或正式品牌素材。
- 商品价格和库存是测试值，不代表正式定价和真实库存。

## 环境要求

- Node.js >= 22.5（使用 Node 内置 `node:sqlite`，无需额外数据库依赖）。
- Windows PowerShell、macOS 或 Linux 均可运行。

## 启动

```bash
npm run dev
```

打开 `http://localhost:4321`。

可通过环境变量修改端口和测试后台登录：

```bash
PORT=4321 ADMIN_USER=admin ADMIN_PASSWORD=change-me npm run dev
```

PowerShell：

```powershell
$env:PORT='4321'; $env:ADMIN_USER='admin'; $env:ADMIN_PASSWORD='change-me'; npm run dev
```

测试后台：

- 地址：`http://localhost:4321/admin/login`
- 账号：由 `ADMIN_USER` 环境变量提供
- 密码：由 `ADMIN_PASSWORD` 环境变量提供，至少 12 位；不会预填、不会写入前端或仓库

启动前必须设置独立测试密码：

```powershell
$env:ADMIN_USER='admin'; $env:ADMIN_PASSWORD='local-test-password-1234'; npm run dev
```

## 页面

- `/` 首页
- `/shop` 作品商城
- `/shop/fu`、`/shop/lu`、`/shop/shou`、`/shop/xi`、`/shop/cai` 商品详情
- `/custom` 定制需求
- `/craft` 工艺与故事
- `/about` 关于小民
- `/contact` 联系与帮助
- `/cart` 购物车
- `/checkout` 测试结算
- `/admin/login`、`/admin` 测试后台

后台 API 支持：管理员读取摘要、修改演示商品库存/价格/状态、更新测试订单状态、更新定制需求状态。投稿 API 默认保存为“待人工审核”，不会自动公开。

## 测试数据

首次启动会生成 `data/xiaominart.sqlite`，包含福、禄、寿、喜、财五个演示 SKU：`F/L/S/X/C`。可查阅 `database/demo-data.json` 了解不含客户数据的演示种子，`database/schema.sql` 为数据库结构参考。

- F、S：演示独件手写原作，库存为 1。
- L：演示手写定制，库存为 3。
- X、C：演示授权印品，明确标为非手写原作。

删除 `data/xiaominart.sqlite` 后重启，可恢复初始演示数据。不要把真实客户资料放入此测试工程。数据库使用 WAL 模式；正式部署前仍需补充受保护的备份、恢复、迁移和访问策略。

## 可验收路径

1. 首页 → 作品商城 → 选择一个商品 → 加入购物车。
2. 购物车 → 测试结算 → 选择模拟成功 → 创建测试订单。
3. 打开订单结果页，确认状态和演示金额。
4. 后台登录，确认订单记录和库存变化。
5. 返回结算选择模拟失败或取消，确认不会显示支付成功。
6. `/custom` 提交不填写故事的定制需求，确认生成 `CUSTOM-...` 编号。

## 补交材料

- `冻结状态说明.md`：待验收冻结边界与临时访问地址
- `验收证据与操作记录.md`：标准下单、定制提交、后台查询操作证据
- `验收报告.md`：整改后自动化、API、页面和浏览器复验结果
- `整改变更摘要.md`：原始基线、实际代码整改和复验边界
- `F01-F15缺陷闭环表.md`：独立核验问题逐项状态
- `原任务范围状态表.md`：原任务范围逐项状态
- `上线缺口清单.md`：缺失内容、负责人、资料、阻塞状态和建议时间
- `xiaominART-商品与素材授权模板.xlsx`：商品表、素材授权表、填写说明
- `经营配置确认单.md`：销售地区、经营主体、币种、支付、配送和售后确认项
- `上线与回退方案.md`：演示数据清理、真实支付、备份、DNS 和回退步骤
- `NETLIFY-DEPLOY-PREP.md`：Astro/Netlify 兼容性评估、部署准备、阻塞项和验证结果
- `netlify.toml`：准备阶段配置，当前主动阻断部署
- `.nvmrc`：Node.js 22.23.2
- `scripts/netlify-preflight.mjs`：Netlify 部署前置检查

## 交接与限制

当前版本采用 Node 内置 SQLite 文件持久化，适合整改复验和单机演示；正式多用户部署前仍需补充受保护的数据库备份/恢复、跨实例策略、CSRF、限流、反向代理、生产日志、真实经营主体、隐私政策、销售条款、支付、配送和售后规则。

当前未实现：真实支付、正式订单履约、真实素材管理、文件上传、公开投稿自动发布、物流接口、税费、多语言和第三方分析。
