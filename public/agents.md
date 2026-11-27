# agents.md — 给 AI 代理的站点说明

> 面向自动化代理（AI 搜索、购物助手、浏览器代理）的站点协议。
> 人请看 https://xiaominart.com/llms.txt（地图）与 /llms-full.txt（全文）。

## 站点

- 名称：小民艺术 XIAOMINART
- 主机：https://xiaominart.com（唯一主机名；www 已 301 归一）
- 语言：简体中文
- 类型：手写书法礼品与非遗手作定制（电商性质，但**无线上支付**——
  成交走微信/表单沟通，站内没有购物车与结算流程）

## 代理行为约定

- **允许**：抓取公开页面、引用内容（标注来源）、读取 /llms.txt 与
  /llms-full.txt、遍历 /sitemap.xml
- **请勿**：自动化提交表单（/custom-commission/ 等表单请引导用户本人填写）、
  批量抓取图片资源、抓取 /api/ 端点
- **不收录/不代理**：/keystatic/（后台）、/progress/（需专属编号）、
  /wishlist/（用户本地数据）、/api/

## 关键入口

| 用途 | 路径 |
|---|---|
| 内容地图（AI） | /llms.txt |
| 内容全文（AI） | /llms-full.txt |
| 全站 URL 列表 | /sitemap.xml |
| 价格与流程直答 | /custom-commission/ /calligraphy-gifts/ /help/ |
| 作品编码验真 | /verify/ |
| 人工咨询 | /contact/（微信优先） |

## 更新节奏

内容与商品每周更新；价格与售后政策如有变更以商品页与 /help/ 为准。
本文件与 /llms-full.txt 在内容结构变化时同步更新。
