// ─────────────────────────────────────────────────────────────
// 定制项目进度 · 内部管理接口（Cloudflare Pages Function）
// 路由：GET  /api/admin/progress        列出全部项目
//       POST /api/admin/progress        新增 / 更新一个项目（body: { code?, projectName, contactHint, stage, note }）
//
// 鉴权：请求头 x-admin-key 必须等于环境变量 ADMIN_ACCESS_KEY。
//   - 与 FORMS_ACCESS_KEY 分开：后者只给服务端写表单用，泄露也不至于让别人改进度；
//     本密钥仅用于后台，请勿写进任何前端代码。
//   - 未配置 ADMIN_ACCESS_KEY 时接口整体关闭（503），避免用弱默认值放行。
//
// 数据层有两道门，且都收在服务端（2026-10-07 收紧）：
//   1. commissions 表对 anon/authenticated 无任何表级权限；
//   2. admin_upsert_commission / admin_list_commissions 的 EXECUTE 只给 service_role，
//      anon/authenticated 已 REVOKE——即使有人拿到公开的 publishableKey，
//      也无法调用这两个函数（lookup_commission 才是匿名可调的，且只按码返回单条脱敏数据）。
// ─────────────────────────────────────────────────────────────

const CLOUD_REST_BASE = 'https://xiaominart-forms.app.workbuddy.host/.cloud/database/rest';

type Env = Record<string, string | undefined>;
type Ctx = { request: Request; env: Env };

const API_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function jsonResponse(body: Record<string, unknown>, status: number = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: API_HEADERS });
}

const STAGES = new Set(['received', 'review', 'match', 'writing', 'delivery', 'done']);
const CODE_RE = /^XM-[A-Z0-9]{6}$/;

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function callRpc(fn: string, key: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(`${CLOUD_REST_BASE}/rpc/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-wb-webapp-access-key': key },
    body: JSON.stringify(payload),
  });
}

// 生成不易撞码的查询码：XM- + 6 位（去掉易混的 I/O/0/1）
function makeCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `XM-${out}`;
}

async function handleList(key: string): Promise<Response> {
  let res: Response;
  try {
    res = await callRpc('admin_list_commissions', key, {});
  } catch {
    return jsonResponse({ ok: false, message: '云端连接失败。' }, 502);
  }
  if (!res.ok) return jsonResponse({ ok: false, message: '读取失败，请检查密钥是否正确。' }, 502);
  const rows = (await res.json().catch(() => [])) as Array<Record<string, unknown>>;
  return jsonResponse({ ok: true, items: Array.isArray(rows) ? rows : [] });
}

async function handleUpsert(request: Request, key: string): Promise<Response> {
  const raw = await request.text();
  if (raw.length > 8 * 1024) return jsonResponse({ ok: false, message: '内容过长。' }, 413);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, message: '请求格式错误。' }, 400);
  }

  const projectName = str(body.projectName, 120);
  const contactHint = str(body.contactHint, 60);
  const stage = str(body.stage, 20) || 'received';
  const note = str(body.note, 500);
  let code = str(body.code, 12).toUpperCase();

  if (!projectName) return jsonResponse({ ok: false, message: '请填写项目名称。' }, 400);
  if (!STAGES.has(stage)) return jsonResponse({ ok: false, message: '阶段取值不合法。' }, 400);
  if (code && !CODE_RE.test(code)) return jsonResponse({ ok: false, message: '查询码格式不对（形如 XM-7K2P9A）。' }, 400);
  if (!code) code = makeCode();

  let res: Response;
  try {
    res = await callRpc('admin_upsert_commission', key, {
      p_code: code,
      p_project_name: projectName,
      p_contact_hint: contactHint,
      p_stage: stage,
      p_note: note,
    });
  } catch {
    return jsonResponse({ ok: false, message: '云端连接失败。' }, 502);
  }
  if (!res.ok) return jsonResponse({ ok: false, message: '保存失败，请检查密钥是否正确。' }, 502);
  const rows = (await res.json().catch(() => [])) as Array<Record<string, unknown>>;
  const row = Array.isArray(rows) ? rows[0] : null;
  return jsonResponse({ ok: true, item: row ?? { code } });
}

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  const key = context.env?.ADMIN_ACCESS_KEY ?? '';
  if (!key) return jsonResponse({ ok: false, message: '后台尚未配置密钥（ADMIN_ACCESS_KEY）。' }, 503);
  if (context.request.headers.get('x-admin-key') !== key) {
    return jsonResponse({ ok: false, message: '密钥不正确。' }, 401);
  }
  return handleList(key);
};

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const key = context.env?.ADMIN_ACCESS_KEY ?? '';
  if (!key) return jsonResponse({ ok: false, message: '后台尚未配置密钥（ADMIN_ACCESS_KEY）。' }, 503);
  if (context.request.headers.get('x-admin-key') !== key) {
    return jsonResponse({ ok: false, message: '密钥不正确。' }, 401);
  }
  return handleUpsert(context.request, key);
};

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
