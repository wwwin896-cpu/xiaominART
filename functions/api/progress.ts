// ─────────────────────────────────────────────────────────────
// 定制进度查询（Cloudflare Pages Function）
// 路由：GET /api/progress?code=XM-XXXXXX
//
// 设计要点（2026-10-07）：
// - 凭据是「专属查询码」，不是手机号/邮箱——避免熟人撞库拿到别人的项目。
// - 云端读取走 lookup_commission(text) 这个 SECURITY DEFINER 函数：
//   只按精确 code 返回单条，且只返回脱敏字段（不含完整联系方式）。
//   commissions 表对 anon/authenticated 未授予任何表级权限，
//   因此即使本函数被滥用，也无法枚举或全表读取。
// - 失败一律返回同一条泛化文案，不区分「码不存在」与「码格式不对」，
//   避免成为探测工具。
// ─────────────────────────────────────────────────────────────

const CLOUD_REST_BASE = 'https://xiaominart-forms.app.workbuddy.host/.cloud/database/rest';

type Env = Record<string, string | undefined>;

const API_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function jsonResponse(body: Record<string, unknown>, status: number = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: API_HEADERS });
}

// 查询码格式：XM- 前缀 + 6 位大写字母/数字（与录入后台生成规则一致）
const CODE_RE = /^XM-[A-Z0-9]{6}$/;

export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
  const accessKey = context.env?.FORMS_ACCESS_KEY ?? '';
  if (!accessKey) {
    return jsonResponse({ ok: false, message: '查询服务暂未配置完成，请通过微信联系我们。' }, 503);
  }

  const code = (new URL(context.request.url).searchParams.get('code') ?? '').trim().toUpperCase();
  if (!CODE_RE.test(code)) {
    return jsonResponse({ ok: false, message: '没有找到对应的项目。请核对查询码是否完整（形如 XM-7K2P9A）。' }, 404);
  }

  let res: Response;
  try {
    res = await fetch(`${CLOUD_REST_BASE}/rpc/lookup_commission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wb-webapp-access-key': accessKey,
      },
      body: JSON.stringify({ p_code: code }),
    });
  } catch {
    return jsonResponse({ ok: false, message: '查询服务暂时不可用，请稍后再试。' }, 502);
  }

  if (!res.ok) {
    // 不把云端原始错误抛给页面；404 与其它失败对用户是同一种语义
    return jsonResponse({ ok: false, message: '没有找到对应的项目。请核对查询码是否完整（形如 XM-7K2P9A）。' }, 404);
  }

  const rows = (await res.json().catch(() => null)) as
    | Array<{ project_name?: string; contact_hint?: string; stage?: string; note?: string; updated_at?: string }>
    | null;
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) {
    return jsonResponse({ ok: false, message: '没有找到对应的项目。请核对查询码是否完整（形如 XM-7K2P9A）。' }, 404);
  }

  return jsonResponse({
    ok: true,
    project: {
      name: row.project_name ?? '',
      contactHint: row.contact_hint ?? '',
      stage: row.stage ?? 'received',
      note: row.note ?? '',
      updatedAt: row.updated_at ?? '',
    },
  });
};

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, OPTIONS',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
