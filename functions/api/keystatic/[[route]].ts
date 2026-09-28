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
  return new Response(body, { status, headers });
};
