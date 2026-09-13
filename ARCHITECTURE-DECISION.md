# xiaominART 架构决策

## 已确认架构

- **官网静态层**：Hugo Extended 0.166.0；
- **静态托管**：GitHub Pages；
- **DNS/CDN/SSL**：Cloudflare；
- **域名注册**：阿里云，域名 `www.xiaominart.com`；
- **销售测试服务**：当前 Node + SQLite 工程独立保留，仅用于测试和后台验收。

## 为什么分层

Hugo 生成的是静态 HTML，GitHub Pages 不运行长驻 Node 进程，也不提供当前工程所需的本地 SQLite 写入和进程内会话。将销售测试服务原样放入 GitHub Pages 会导致订单、后台和持久化不可用，因此不做假部署。

## 迁移原则

保留已有品牌页面、商品模型、验收测试和演示数据；只把展示层迁移到 Hugo。订单、定制、投稿、后台和支付 API 等待单独的生产后端方案批准后再接入。

## 当前上线门槛

1. Hugo 本地或 GitHub Actions 构建成功；
2. GitHub Pages 预览成功；
3. Cloudflare/阿里云 DNS 变更已批准；
4. 真实素材和授权完成；
5. 经营主体、价格、配送、售后和隐私政策完成；
6. 真实销售后端和支付方案完成；
7. 用户明确批准正式发布。
