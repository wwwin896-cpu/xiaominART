# XIAOMINGART 生产域名与线上核验报告

## 当前部署

- Vercel 项目：`geektion-e-drive/xiaomin-art`
- 最新生产部署状态：`Ready`
- Vercel 生产别名：`https://xiaomin-art.vercel.app`
- 项目已配置别名：`https://xiaominart.com`、`https://www.xiaominart.com`
- 最新部署检查地址：见 Vercel 项目部署记录
- Astro 构建：38 个静态页面

## DNS 当前状态

域名当前使用 HiChina/阿里云 DNS：

- 当前 NS：`dns1.hichina.com`、`dns2.hichina.com`
- 当前裸域名 A 记录仍指向 GitHub Pages：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
- 当前 `www` CNAME 仍为：`wwwin896-cpu.github.io.`
- Vercel 状态：Invalid Configuration

## 需要在域名服务商后台修改的记录

### 推荐配置

| 主机记录 | 类型 | 记录值 | 操作 |
|---|---|---|---|
| `@` | `A` | `216.198.79.1` | 删除旧 GitHub Pages A 记录后新增 |
| `@` | `A` | `64.29.17.1` | 删除旧 GitHub Pages A 记录后新增 |
| `www` | `CNAME` | `a2d4fe65f51b4a73.vercel-dns-017.com.` | 删除 `wwwin896-cpu.github.io.` 后新增 |

另一种方案是将域名 NS 切换为：

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

不要同时保留旧 GitHub Pages A 记录或旧 GitHub Pages CNAME，否则 Vercel 校验会继续失败。

## 已同步到线上代码

- 导航移除独立一级菜单“艺术家”。
- “灵感参考库”改为“灵感参考”。
- “灵感参考”增加子菜单：艺术家档案、创作手稿、灵感素材、参考图集。
- 导航接入 XIAOMINGART 方向 1 炭黑细衬线字标 SVG。
- 子菜单增加柔和淡入与下移交互。
- 灵感参考页增加创作手稿、灵感素材、参考图集三个区块。
- 案例卡支持桌面端黑底大图弹窗、上一张/下一张和键盘左右方向键，Escape 关闭。
- 继续保留“不售卖现成画作，仅接受艺术定制共创”与“不售卖同款”业务边界。
- 新增 `/sitemap.xml`，robots.txt 已指向该 sitemap。
- 页面 SEO title 统一将品牌名规范化为 `XIAOMINGART`。

## 验证结果

- 本地 `npm run check`：0 errors / 0 warnings / 0 hints
- 本地 `npm run build`：通过
- 静态页面：38
- 最新 Vercel 生产部署：Ready
- Vercel 项目域名绑定：已添加 `xiaominart.com` 与 `www.xiaominart.com`
- DNS 解析切换：未完成，仍指向 GitHub Pages
- SSL：Vercel 域名已配置申请目标，但因 DNS 尚未切换，不能确认正式域名 HTTPS 证书已签发

## 最终验收结果（2026-09-15）

1. DNS 已传播到 Vercel：公共 DNS 返回裸域名 A `216.198.79.1`、`64.29.17.1`；`www` CNAME 返回 `a2d4fe65f51b4a73.vercel-dns-017.com.`。
2. `vercel domains verify xiaominart.com`：Valid Configuration。
3. `vercel domains verify www.xiaominart.com`：Valid Configuration。
4. `https://www.xiaominart.com`：HTTP 200，响应服务器为 Vercel，HSTS 已启用。
5. `https://xiaominart.com`：HTTP 308 永久跳转至 `https://www.xiaominart.com/`。
6. 生产部署状态：Ready；别名包含 `xiaominart.com`、`www.xiaominart.com`、`xiaomin-art.vercel.app`。
7. `npm run check`：0 errors / 0 warnings / 0 hints；`npm run build`：38 page(s) built。
8. PC 自测中发现的首页艺术家矩阵横向溢出已修复为 `minmax(0, 1fr)`；移动端原无横向溢出。
9. 站内品牌名已统一为 `XIAOMINGART`。
10. 正式域名首页、灵感参考页、定制创作页均返回最新站点内容；灵感参考弹窗支持键盘左右方向键和 Escape。
