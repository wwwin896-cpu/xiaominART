// ─────────────────────────────────────────────────────────────
// 转化事件上报（Cloudflare Pages Function）
// 路由：POST /api/event   （由本文件路径 functions/api/event.ts 决定）
//
// 与 /api/lead 同一条链路：浏览器 → 同源代理 → WorkBuddy 云数据库。
// 只收第一版核心漏斗的 6 个事件，且只做「插入」，不读回：
//   hero_cta_click / gift_guide_select / consultation_start
//   consultation_submit / business_brief_submit / contact_channel_click
// 不引入第三方统计，无 Cookie，无跨站脚本；失败一律静默（不阻塞用户操作）。
// ─────────────────────────────────────────────────────────────

const CLOUD_REST_BASE = 'https://xiaominart-forms.app.workbuddy.host/.cloud/database/rest';
const ACCESS_KEY = 'wbpk_F0w7EXBEJ6ijaciNTHWkaW_og4NwUbg9n03Ie90K1Yq4dBZCicDBh3U';
const MAX_BODY_BYTES = 4 * 1024;
const ALLOWED_EVENTS = new Set([
  'hero_cta_click',
  'gift_guide_select',
  'consultation_start',
  'consultation_submit',
  'business_brief_submit',
  'contact_channel_click',
]);

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function handleEvent(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, message: '仅支持 POST。' }, 405);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, message: '内容过长。' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, message: '请求格式错误。' }, 400);
  }

  const name = str(body.name, 60);
  if (!ALLOWED_EVENTS.has(name)) {
    return jsonResponse({ ok: false, message: '未知事件。' }, 400);
  }

  const data = body.data && typeof body.data === 'object' && !Array.isArray(body.data)
    ? (body.data as Record<string, unknown>)
    : {};

  try {
    await fetch(`${CLOUD_REST_BASE}/site_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wb-webapp-access-key': ACCESS_KEY,
      },
      body: JSON.stringify({
        event_name: name,
        event_data: data,
        page_path: str(body.page, 300),
      }),
    });
  } catch {
    // 事件上报失败不影响任何用户操作，静默处理
    return jsonResponse({ ok: true, skipped: true });
  }
  return jsonResponse({ ok: true });
}

export const onRequestPost = async (context: { request: Request }): Promise<Response> =>
  handleEvent(context.request);

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  });
