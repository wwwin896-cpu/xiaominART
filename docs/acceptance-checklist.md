# XiaominART 独立站迭代验收清单

## A. 项目边界

- [x] 在现有 `xiaominart-site/` Demo 内迭代。
- [x] 未新建 Astro 项目。
- [x] 保留 Astro + Sanity 占位 + Vercel 配置。
- [x] 未接入真实支付、购物车、库存、订单或现货销售能力。

## B. 品牌与业务规则

- [x] 品牌定位为东方艺术定制平台。
- [x] 首页明确“不售卖现成画作，仅接受艺术定制共创”。
- [x] 首页主入口明确为“开启定制咨询 / Begin a consultation”。
- [x] 页面明确不售卖现货装饰画。
- [x] 灵感案例仅作为方向参考。
- [x] 灵感案例统一显示：`案例仅作风格参考，不售卖同款 | For reference only, identical artwork is not for sale.`
- [x] 案例 CTA 统一指向 `/custom-commission/`。
- [x] 艺术家详情 CTA 指向定制表单。
- [x] 艺术礼盒 CTA 指向定制表单。
- [x] B 端项目 CTA 指向定制表单。

## C. 导航与页面

- [x] 导航顺序：定制创作｜Custom Commission。
- [x] 导航顺序：艺术家｜Artists。
- [x] 导航顺序：灵感参考库｜Inspiration Gallery。
- [x] 导航顺序：艺术礼盒｜Art Gift。
- [x] 导航顺序：品牌介绍｜About。
- [x] 导航顺序：B端企业定制｜Business Custom。
- [x] 首页包含 Hero。
- [x] Hero 中文更新为“与你创作独一无二的作品”，英文更新为“Co-create one-of-a-kind artwork with you”。
- [x] 首页包含 4 步共创流程。
- [x] 首页包含灵感库。
- [x] 首页包含艺术家矩阵。
- [x] 首页包含 B 端专区。
- [x] 首页包含 About 板块。
- [x] 存在定制表单页 `/custom-commission/`。
- [x] 存在艺术家详情页 `/artists/[slug]/`。
- [x] 存在 Blog 列表与文章页 `/blog/`、`/blog/[slug]/`。

## D. 视觉与交互

- [x] 使用纸白、墨色、朱砂、豆青、鎏金和大地色线条。
- [x] 保持全站衬线标题、人文英文衬线与高行高正文。
- [x] 使用直角、细边框、编辑式留白。
- [x] 不使用电商卡片化购买结构。
- [x] 动效仅使用轻微位移、颜色变化与 reduced-motion 降级。
- [x] 移动端导航支持键盘 Escape 关闭。
- [x] 表单字段提供 required 校验与私密默认选项。
- [x] 页面提供键盘焦点态。
- [x] 移动端 CTA 可用且无横向溢出设计。

## E. 技术验证

- [x] `npm run check` 通过，无 errors/warnings/hints。
- [x] `npm run build` 通过。
- [x] 静态路由生成成功。
- [ ] 浏览器实际截图验收：待用户打开当前 `http://127.0.0.1:4321/` 复核。
- [ ] 真实字体授权、图片授权、表单服务和联系方式：待主理人确认。
