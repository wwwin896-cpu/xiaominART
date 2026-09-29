import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// ─────────────────────────────────────────────────────────────
// 部署形态：纯静态站（Cloudflare Pages）+ Pages Functions
//
// 1. 生产站是构建期生成的静态 HTML，部署到 Cloudflare Pages（免费档明确允许商用）。
// 2. 在线后台（2026-09-29 启用）：
//      · 后台界面  /keystatic/   → src/pages/keystatic/index.astro（静态外壳 + React SPA）
//      · 后台接口  /api/keystatic/* → functions/api/keystatic/[[route]].ts（Pages Function，
//        包装 @keystatic/core 的 makeGenericAPIRouteHandler，直接读写 GitHub 仓库）
//      · 表单代理  /api/lead → functions/api/lead.ts（Pages Function）
// 3. 后台保存 = 提交到 GitHub 仓库 → GitHub Action 自动构建并部署（.github/workflows/deploy.yml）。
// 4. 环境变量（Pages 项目设置里配置）：
//      KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET /
//      KEYSTATIC_SECRET / PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
//    首次生成：本地 npm run dev → 打开 http://localhost:4321/keystatic →
//    按向导创建 GitHub App，.env 会写入这 4 个值。
// ─────────────────────────────────────────────────────────────

const withLocalCms =
  process.env.npm_lifecycle_event === 'dev' || process.argv.slice(2).includes('dev');

export default defineConfig({
  site: 'https://xiaominart.com',
  // dev 用 server 让 Keystatic 集成注入的本地 API 路由可用；build 恒定输出静态文件。
  output: withLocalCms ? 'server' : 'static',
  integrations: [react(), markdoc(), ...(withLocalCms ? [keystatic()] : [])],
  // dev 用 'ignore'：Keystatic 的 GitHub 登录/OAuth 接口（/api/keystatic/github/login 等）
  // 固定生成无尾斜杠 URL，'always' 会让它们 404；生产保持 'always' 维持 URL 规范化。
  trailingSlash: withLocalCms ? 'ignore' : 'always',
  vite: {
    resolve: {
      alias: withLocalCms
        ? []
        : // 生产构建没有 Keystatic 集成（无 virtual 模块插件），把后台外壳引用的
          // virtual:keystatic-config 别名到真实配置文件（dev 下集成插件的 resolveId 优先）。
          [{ find: /^virtual:keystatic-config$/, replacement: new URL('./keystatic.config.ts', import.meta.url).href }],
    },
  },
});
