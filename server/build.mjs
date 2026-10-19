// ─────────────────────────────────────────────────────────────
// 把 Cloudflare Pages Functions 打包成 Node 可直接 import 的 ESM
//
// 为什么这么做：functions/api/*.ts 里全是标准 Web API（fetch / Request /
// Response），唯一 Cloudflare 专有的只有 context.waitUntil。所以迁移
// **不需要重写业务逻辑**，只要把它们编译成 .mjs，由 server/index.mjs
// 提供 Node 侧的 Request/Response 适配即可。
//
// 好处：Cloudflare 与阿里云共用同一份源码。以后改表单逻辑只改
// functions/，两边同时生效，不会出现「线上两套实现行为不一致」。
//
// 用法：node server/build.mjs
// ─────────────────────────────────────────────────────────────
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';

const ENTRIES = [
  ['functions/api/lead.ts', 'lead'],
  ['functions/api/event.ts', 'event'],
  ['functions/api/progress.ts', 'progress'],
  ['functions/api/admin/progress.ts', 'admin-progress'],
  // Keystatic 后台：体积大，且依赖 @keystatic/core 运行时。
  // 标为 external，由服务器上的 node_modules 提供（npm ci --omit=dev）。
  ['functions/api/keystatic/[[route]].ts', 'keystatic'],
];

mkdirSync('server/dist', { recursive: true });

await Promise.all(
  ENTRIES.map(([entry, name]) =>
    build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node20',
      outfile: `server/dist/${name}.mjs`,
      external: ['@keystatic/core', '@keystatic/core/*'],
      // 让打包产物保留 import.meta.url，Node 下行为正确
      banner: { js: '/* 自动生成，勿手改：源文件在 functions/api/ */' },
      logLevel: 'warning',
    }).then(() => console.log(`  ✓ ${name}.mjs  ←  ${entry}`)),
  ),
);

console.log('\n打包完成，产物在 server/dist/');
