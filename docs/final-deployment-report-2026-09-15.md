# XIAOMINART 2026-09-15 优化执行与上线报告

## 一、执行范围

已依据《XIAOMINART网站优化审核报告与执行指令.docx》完成 T001–T013，并完成本轮用户体验测评提出的 P0、P1、P2 优化。

业务边界保持不变：XIAOMINART 是艺术定制共创平台，采用“表单咨询 → 人工对接共创”模式；不新增购物车、线上支付、库存、SKU、订单或现货购买模块。

## 二、本地实现状态

### P0 转化与信任

- 新增默认展开的“定制共创须知 / Commission notes”。
- 须知包含响应时效、参考创作周期、付款节点、修改规则、取消/退款边界、交付范围。
- 首页与灵感页新增预算参考模块，包含小幅礼赠、居家墙面、器物定制、商业空间大型装置四档；未确认金额明确标为“参考区间待确认”。
- 全站新增右下角“发起定制咨询 / 1–2 个工作日回复”悬浮按钮。
- 新增快速留言弹窗，支持关闭、点击背景关闭与 Escape 关闭。
- 灵感案例 CTA 携带 `inspiration` 与 `tag` 参数并预填表单。
- 礼盒 CTA 携带 `scene=gift` 并预填“艺术礼盒 / Art gift”。
- 定制表单新增填写建议提示。
- 定制表单新增联系方式、作品用途、尺寸/媒介、预算区间、交付时间、意向艺术家、图片上传等字段。
- 表单提交提示明确说明：默认邮件客户端、预计 1–2 个工作日联系、补充邮箱。

### P1 内容与导航

- 导航包含首页、灵感画廊、艺术家、个人定制、企业定制、Journal、关于我们，并保留 FAQ、定价参考入口。
- 企业定制页补充合同/项目范围、开票/付款、批量项目流程和 3 个“CONCEPT / 待授权”案例。
- 艺术家列表与 3 个详情页补充擅长媒介、适配项目、创作理念、作品集占位、落地实景待授权、经历待确认、参考报价沟通边界。
- 个人表单增加“意向合作艺术家（可选）”。
- FAQ 补充艺术共创、承接边界、加急、发票、海外交付、保养与版权问题。
- Newsletter、客户故事、页脚联系方式与社会证明已保留并整合。

### P2 体验与无障碍

- FAQ 与共创须知使用原生折叠交互。
- 移动端快速留言弹窗支持内部滚动。
- 触摸目标保持不低于 44px。
- 图片概念图使用描述性 alt、lazy loading、async decoding 与尺寸属性。
- 表单保留 required、autocomplete、显式 label/id 和友好错误提示。
- 微信、企业微信、小红书、Instagram 未确认账号均明确显示“账号待确认”，未伪造链接。

## 三、本地验证

```text
npm run check
0 errors
0 warnings
0 hints

npm run build
通过
43 page(s) built
```

浏览器只读验收：

- 悬浮咨询按钮：通过。
- 快速留言弹窗、关闭按钮、Escape：通过。
- 共创须知默认展开：通过。
- 首页/灵感页预算参考：通过。
- 表单新增字段：通过。
- 首页、表单、灵感页桌面/移动端横向溢出：0。
- Console errors：空数组。
- 电商禁用模块扫描：未发现购物车、Checkout、Add to cart、Buy now、SKU、库存。

## 四、截图

- `shots/ux-p0-home-desktop.png`
- `shots/ux-p0-home-mobile.png`
- `shots/ux-p0-form-desktop.png`
- `shots/ux-p0-form-mobile.png`
- `shots/ux-p0-inspiration.png`
- `shots/ux-p0-acceptance-report.md`

## 五、上线状态

### 结果：未能完成本次生产发布

本地构建已成功，但 Vercel 生产上传失败，生产域名仍返回旧版本。

线上核验：

- `https://www.xiaominart.com/`：HTTP 200，但未包含本轮“发起定制咨询”。
- `https://www.xiaominart.com/custom-commission/`：HTTP 200，但未包含本轮“定制共创须知”。
- `https://www.xiaominart.com/inspiration/`：HTTP 200，但未包含本轮“预算参考”。

Vercel CLI 两次发布结果：

```text
Deployment response: missing_files
Error: fetch failed
```

诊断确认：

- Vercel 项目 `xiaomin-art` 已识别。
- 项目生产域名已绑定。
- API access token 可识别。
- 失败发生在上传文件阶段，返回 `missing_files` 后上传请求 `fetch failed`。
- Vercel 控制台没有本地文件上传入口；只能 Redeploy/Promote 原有部署，无法安全发布当前本地文件。
- 当前工作区没有 `.git`、Git remote，也没有可用的 GitHub 源部署路径。

## 六、恢复上线所需条件

需要任选其一：

1. 在当前环境重新完成 Vercel CLI 授权后执行生产部署；或
2. 提供可用于 Vercel 部署的有效 token；或
3. 为项目配置可访问的 GitHub remote，并触发 Vercel Git 构建。

在获得上述条件前，不会点击 Redeploy、Promote 或 Rollback，因为这些操作只会重新部署旧版本，不能发布当前本地产物。
