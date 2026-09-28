import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// ─────────────────────────────────────────────────────────────
// 部署形态：静态站（Cloudflare Pages）+ 本地后台（Keystatic local 模式）
//
// 为什么这样分：
//   1. 生产站是纯静态 HTML，部署到 Cloudflare Pages（免费档明确允许商用，
//      带宽不限；Vercel Hobby 条款禁止商用，故已弃用 @astrojs/vercel）。
//   2. Keystatic 后台只在本地 `npm run dev` 时挂载，直接读写本机文件，
//      不需要数据库、不需要 OAuth、不会出现在生产产物里。
//   3. 唯一需要服务端能力的表单代理 /api/lead 已改为 Cloudflare Pages Function
//      （见根目录 functions/api/lead.ts），静态托管同样支持。
//
// 本地开后台：npm run dev  →  http://localhost:4321/keystatic
// ─────────────────────────────────────────────────────────────
const withLocalCms =
  process.env.npm_lifecycle_event === 'dev' || process.argv.slice(2).includes('dev');

export default defineConfig({
  site: 'https://www.xiaominart.com',
  // dev 用 server 让 Keystatic 的后台路由可用；build 恒定输出静态文件。
  output: withLocalCms ? 'server' : 'static',
  ...(withLocalCms ? { integrations: [react(), markdoc(), keystatic()] } : {}),
  trailingSlash: 'always',
});
