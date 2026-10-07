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
const MAX_BODY_BYTES = 4 * 1024;

// 云访问密钥从 Cloudflare Pages 环境变量读取（变量名：FORMS_ACCESS_KEY）。
// 2026-10-06 从源码硬编码改为环境变量：原密钥已随仓库公开，需作废后换新值。
type Env = Record<string, string | undefined>;
// 2026-10-07（T-02）：白名单由 6 个扩为全量事件，与 src/scripts/cloud-forms.ts 的
// TRACKED_EVENTS 保持一致（事件含义见 docs/事件字典.md）。此前页面 20+ 种 data-event
// 均不在白名单内，全部被丢弃，行为数据为空。
const ALLOWED_EVENTS = new Set([
  // 程序化触发（表单结果、选礼器、心愿单提交）
  'hero_cta_click',
  'gift_guide_select',
  'consultation_start',
  'consultation_submit',
  'business_brief_submit',
  'contact_channel_click',
  'wishlist_submit',
  // 页面 data-event：转化入口
  'custom_inquiry_start',
  'custom_entry',
  'business_entry',
  'artist_service_entry',
  'channel_landing_view',
  'mini_program_click',
  // 页面 data-event：礼赠线
  'gift_advice_click',
  'gift_guide_view',
  'gift_guide_to_detail',
  'gift_guide_to_advice',
  'gift_guide_ready_made',
  'gift_detail_view',
  'ready_work_click',
  'scene_to_product',
  'scene_view',
  // 页面 data-event：心愿单与分享
  'wishlist_to_guide',
  'wish_stories_click',
  'wish_commission_click',
  'share_click',
]);

// /api/* 是接口，不应被搜索引擎收录、也不应被缓存。
const API_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function jsonResponse(body: Record<string, unknown>, status: number = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: API_HEADERS });
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function handleEvent(request: Request, accessKey: string): Promise<Response> {
  // 事件上报是静默链路：密钥没配就直接跳过，不打扰任何用户操作。
  if (!accessKey) {
    return jsonResponse({ ok: true, skipped: true });
  }

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
        'x-wb-webapp-access-key': accessKey,
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

export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> =>
  handleEvent(context.request, context.env?.FORMS_ACCESS_KEY ?? '');

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
