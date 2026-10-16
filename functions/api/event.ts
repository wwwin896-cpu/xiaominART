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
  // 分步表单（P1-03）：每步点「下一步」时上报 { step, total }，用于定位流失步骤
  'consultation_step',
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
  // 2026-10-15 补录：现货作品详情页 → 企业礼赠页（批量定制导流）
  // 三处同登记：本文件 / src/scripts/cloud-forms.ts / docs/事件字典.md
  'ready_to_business',
  // ── 企业礼赠页（2026-10-15 晚 二次重写后的事件集）──
  // 本轮按业主意见大幅精简：下载入口收敛到 2 处、只留 DOCX、删除场景导航/页中转化条/六步流程。
  // 已废弃并移除（历史数据仍在库中）：
  //   biz_scene_nav / biz_trust_to_form
  //   biz_hero_download / biz_hero_wechat / biz_dl_pdf / biz_dl_print / biz_dl_wechat
  //   biz_form_dl_docx / biz_form_dl_pdf / biz_form_wechat
  //   biz_mid_download / biz_mid_form / biz_mid_wechat
  'biz_hero_dl',
  'biz_hero_form',
  'biz_dl_docx',
  'biz_dl_email',
  'biz_line_nav',
  'biz_line_nav_more',
  // 四条业务详情页共用（商务伴手礼 / 庆典墨宝礼 / 空间书法礼 / 校园纪念礼）
  'biz_detail_form',
  'biz_detail_dl',
  'biz_detail_form_bottom',
  'biz_detail_dl_bottom',
  'scene_to_product',
  'scene_view',
  // 2026-10-16：首页「作品展示 · 一字一源」区块（原「心意之选」改版）引入的两个事件。
  // 与 src/scripts/cloud-forms.ts 的 TRACKED_EVENTS、docs/事件字典.md 三处同登记。
  'source_work_click',
  'source_work_wish',
  // 页面 data-event：心愿单与分享
  'wishlist_to_guide',
  'wish_stories_click',
  'wish_commission_click',
  'share_click',
  // 2026-10-09 补录：第 2/1 批工单（P0-03 搜索、P1-02 心愿单抽屉、P0-04 微信直联）
  // 上线时漏登白名单，导致这几个新交互的埋点被静默丢弃。
  'search_open',
  'search_result_click',
  'wishlist_drawer_open',
  'wechat_direct_open',
  'wechat_id_copy',
  // 2026-10-14 补录：作品档案页扫码转化漏斗（二维码验真 → 关注 → 定制）
  // 三处同登记：本文件 / src/scripts/cloud-forms.ts / docs/事件字典.md
  'archive_view',
  'archive_custom_click',
  // 2026-10-14 档案页改版（结论优先）：原「查另一件作品」入口已移除，
  // archive_query_click / archive_follow_click 保留在册（旧的已上线页面可能仍在发），
  // 新增下面三个「下一步」引导点击。
  'archive_browse_click',
  'archive_stories_click',
  'archive_share_click',
  'archive_follow_click',
  'archive_query_click',
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
