# P1 导航、企业与艺术家体验核验

## 已完成

- 顶部导航调整为：首页、灵感画廊、艺术家、个人定制、企业定制、Journal、关于我们，并保留 FAQ 入口。
- 企业定制页补充合同与项目范围、开票与付款说明、批量项目流程，以及三张明确标注“CONCEPT / 待授权”的企业案例卡。
- 艺术家卡片补充擅长媒介与适配项目类型标签。
- 三位艺术家详情页补充创作理念、作品集占位、落地实景图待授权说明、经历待确认、风格媒介、适配项目类型与参考报价沟通边界。
- 个人定制表单新增“意向艺术家（可选）”下拉，并支持通过 URL 参数预填。
- 未新增现货、购物车、在线支付、库存或订单逻辑。

## 验证

```text
npm run check
0 errors
0 warnings
0 hints

npm run build
通过
43 page(s) built
```

## 主要修改文件

- `src/data/content.ts`
- `src/layouts/Layout.astro`
- `src/components/ArtistCard.astro`
- `src/pages/business-custom/index.astro`
- `src/pages/artists/[slug].astro`
- `src/pages/custom-commission/index.astro`

## 状态说明

本地代码与构建验证已完成。GitHub 推送与线上部署需由仓库负责人在完成 GitHub 授权和 remote 配置后执行。
