// ─────────────────────────────────────────────────────────────
// 表单提交服务端代理（Cloudflare Pages Function）
// 路由：POST /api/lead   （由本文件路径 functions/api/lead.ts 决定）
//
// 链路：浏览器 → 同源 /api/lead → WorkBuddy 云数据库 REST 端点。
// 为什么需要代理：云服务端强制精确 Origin 匹配（仅允许发布预留域名），
// 不含 www.xiaominart.com，浏览器直连预检即 403。服务端请求无 Origin 头，不受此限制。
// publishableKey 属客户端公开凭据（数据安全由云端 RLS 保证），收敛到服务端仅是收紧。
//
// 迁移说明：原实现是 Vercel serverless 函数（src/pages/api/lead.ts），
// 站点改为 Cloudflare Pages 静态托管后，同一份逻辑搬到这里，代码未改动。
// ─────────────────────────────────────────────────────────────

const CLOUD_REST_BASE = 'https://xiaominart-forms.app.workbuddy.host/.cloud/database/rest';
const ACCESS_KEY = 'wbpk_F0w7EXBEJ6ijaciNTHWkaW_og4NwUbg9n03Ie90K1Yq4dBZCicDBh3U';
const MAX_BODY_BYTES = 16 * 1024;
const ALLOWED_FORM_TYPES = new Set(['quick_message', 'commission']);

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function insertToCloud(table: 'leads' | 'subscribers', row: Record<string, unknown>): Promise<Response> {
  return fetch(`${CLOUD_REST_BASE}/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wb-webapp-access-key': ACCESS_KEY,
    },
    body: JSON.stringify(row),
  });
}

async function handleLead(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, message: '仅支持 POST。' }, 405);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, message: '提交内容过长，请精简后重试。' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, message: '请求格式错误。' }, 400);
  }

  if (body.kind === 'subscribe') {
    const email = str(body.email, 200).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, message: '邮箱格式不正确，请检查后重试。' }, 400);
    }
    const source = str(body.source, 100) || 'site';
    let res: Response;
    try {
      res = await insertToCloud('subscribers', { email, source });
    } catch {
      return jsonResponse({ ok: false, message: '提交失败，请稍后再试。' }, 502);
    }
    if (res.status === 201) return jsonResponse({ ok: true });
    if (res.status === 409) {
      return jsonResponse({ ok: true, message: '这个邮箱已经订阅过了，无需重复提交。' });
    }
    return jsonResponse({ ok: false, message: '提交失败，请稍后再试。' }, 502);
  }

  const formType = str(body.formType, 50);
  const name = str(body.name, 200);
  const contact = str(body.contact, 200);
  if (!ALLOWED_FORM_TYPES.has(formType)) {
    return jsonResponse({ ok: false, message: '未知表单类型。' }, 400);
  }
  if (!name || !contact) {
    return jsonResponse({ ok: false, message: '请填写称呼和联系方式。' }, 400);
  }
  const payload =
    body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};

  let res: Response;
  try {
    res = await insertToCloud('leads', { form_type: formType, name, contact, payload });
  } catch {
    return jsonResponse({ ok: false, message: '提交失败，请稍后再试。' }, 502);
  }
  if (res.status === 201) return jsonResponse({ ok: true });
  return jsonResponse({ ok: false, message: '提交失败，请稍后再试。' }, 502);
}

export const onRequestPost = async (context: { request: Request }): Promise<Response> =>
  handleLead(context.request);

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  });
