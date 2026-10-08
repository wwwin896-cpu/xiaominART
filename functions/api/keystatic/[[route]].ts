// ─────────────────────────────────────────────────────────────
// Keystatic 在线后台 API（Cloudflare Pages Function）
// 路由：/api/keystatic/*（登录、GitHub App 回调、内容读写代理）
//
// 包装 @keystatic/core 的 makeGenericAPIRouteHandler（Web 标准 Request/Response），
// 与 @keystatic/astro 官方适配层逻辑一致，仅把环境变量来源从 process.env
// 换成 Pages Function 的 context.env。
//
// 需要在 Cloudflare Pages 项目环境变量里配置：
//   KEYSTATIC_GITHUB_CLIENT_ID        GitHub App 的 Client ID
//   KEYSTATIC_GITHUB_CLIENT_SECRET    GitHub App 的 Client Secret
//   KEYSTATIC_SECRET                  任意随机字符串（会话签名密钥）
//   PUBLIC_KEYSTATIC_GITHUB_APP_SLUG  GitHub App 的 slug（URL 名称）
// ─────────────────────────────────────────────────────────────

import keystaticConfig from '../../../keystatic.config';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';

type Env = Record<string, string | undefined>;
type Ctx = { request: Request; env: Env };

export const onRequest = async (context: Ctx): Promise<Response> => {
  const env = context.env ?? {};

  // Workers 运行时没有 process.env；给 @keystatic/core 内部逻辑（读取
  // PUBLIC_KEYSTATIC_GITHUB_APP_SLUG 等默认值）做一个安全的 shim。
  const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
  if (!g.process) g.process = { env: {} };
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') g.process.env[key] = value;
  }

  // 密钥未配置时返回友好提示页，避免 Cloudflare 1101（Worker threw exception）。
  const missing = (['KEYSTATIC_GITHUB_CLIENT_ID', 'KEYSTATIC_GITHUB_CLIENT_SECRET', 'KEYSTATIC_SECRET'] as const).filter(
    (k) => !env[k],
  );
  if (missing.length > 0) {
    // 注：下面提示里的 http://localhost:4321 是**本地开发服务器地址**，不是混合内容风险。
    // localhost 不提供 TLS，此处必须用 http；静态审计工具按「明文 http://」报警属误报。
    return new Response(
      `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>后台密钥待配置 · XIAOMINART</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf7f0;color:#4d3822;font-family:"Songti SC","STSong","SimSun",serif}main{max-width:560px;padding:40px 28px}h1{font-size:26px;font-weight:500;letter-spacing:.06em;margin:0 0 18px}p{font-size:15px;line-height:1.9;margin:0 0 12px;color:#6b5a44}code{font-family:Consolas,monospace;font-size:13px;background:#f0e9dc;padding:2px 8px;border-radius:4px}hr{border:0;border-top:1px solid #e5dcc9;margin:26px 0}small{color:#a5947a;letter-spacing:.14em;font-size:11px}</style></head><body><main><small>XIAOMINART · ADMIN</small><h1>后台密钥待配置</h1><p>在线后台的登录钥匙还没有写入服务器（缺少 ${missing.join('、')}），所以暂时无法登录。这不是网站故障——前台页面一切正常。</p><hr><p><b>你只需要做一步：</b>在项目文件夹运行 <code>npm run dev</code>，浏览器打开 <code>http://localhost:4321/keystatic</code>，点击「Log in with GitHub」，按向导创建应用（Deployed URL 填 <code>https://xiaominart.com</code>）。完成后告诉助手，剩下的配置由助手完成。</p></main></body></html>`,
      { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
    );
  }

  const handler = makeGenericAPIRouteHandler(
    {
      config: keystaticConfig,
      clientId: env.KEYSTATIC_GITHUB_CLIENT_ID,
      clientSecret: env.KEYSTATIC_GITHUB_CLIENT_SECRET,
      secret: env.KEYSTATIC_SECRET,
    },
    { slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' },
  );

  const { body, headers, status } = await handler(context.request);
  // Keystatic 的 body 联合类型含 Uint8Array，Web 标准 Response 的 BodyInit 不直接收；
  // 显式转成 BodyInit 兼容的类型（Uint8Array 在运行时完全合法）。
  const bodyInit = body as BodyInit | null;
  // 后台接口一律不缓存、不被搜索引擎收录。
  return new Response(bodyInit, {
    status,
    headers: { ...headers, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
};
