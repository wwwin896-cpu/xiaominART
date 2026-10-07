// 表单提交模块（仅客户端使用）
// 生产链路：浏览器 → 同源 /api/lead（Cloudflare Pages Function，见 functions/api/lead.ts）→ WorkBuddy 云数据库。
// 为什么不直连云端：云服务端强制精确 Origin 匹配，www.xiaominart.com 不在白名单，
// 浏览器直连会在预检阶段被 403 拦截。同源代理请求无 CORS 限制。
// publishableKey 已收敛到服务端，不再进入前端打包产物。
export type SubmitOutcome = { ok: boolean; message?: string };

const FALLBACK_EMAIL = 'hi@xiaominart.com';
// 2026-10-07（T-01）：失败态给出微信路径——站内最快的联系方式是联系页二维码
export const CONTACT_FALLBACK = `如持续失败，最快是加微信：在「联系我们」页长按二维码添加（备注来意）；也可以发邮件到 ${FALLBACK_EMAIL}。`;

// 对应 Cloudflare Pages Function 的路由 /api/lead（不带尾斜杠）。
const API_URL = '/api/lead';

async function postToApi(body: Record<string, unknown>): Promise<SubmitOutcome> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (res.ok && data?.ok) {
      return { ok: true, message: typeof data.message === 'string' ? data.message : undefined };
    }
    return { ok: false, message: data?.message || '提交失败，请稍后再试。' };
  } catch {
    return { ok: false, message: '网络异常，请稍后再试。' };
  }
}

/** 提交线索到 leads 表（formType: quick_message / commission / business_gift） */
export async function submitLead(
  formType: string,
  name: string,
  contact: string,
  payload: Record<string, unknown> = {},
): Promise<SubmitOutcome> {
  const result = await postToApi({ kind: 'lead', formType, name, contact, payload });
  // 表单是否成功，本身就是最重要的一类转化事件（失败会吃掉线索）
  if (formType === 'commission') trackEvent('consultation_submit', { status: result.ok ? 'success' : 'error' });
  if (formType === 'business_gift') trackEvent('business_brief_submit', { status: result.ok ? 'success' : 'error' });
  return result;
}

/** 提交订阅邮箱到 subscribers 表（email 唯一，重复时视为成功并提示） */
export async function subscribeEmail(email: string, source: string): Promise<SubmitOutcome> {
  return postToApi({ kind: 'subscribe', email, source });
}

/** 提交礼物清单/购买意向（formType: wishlist）。
 * items 为心愿单 slug 列表；source 标记提交入口（wishlist-page / ready-made-detail）。 */
export async function submitWishlist(
  name: string,
  contact: string,
  items: string[],
  source: string,
  note = '',
): Promise<SubmitOutcome> {
  const result = await submitLead('wishlist', name, contact, { items, source, note });
  trackEvent('wishlist_submit', { status: result.ok ? 'success' : 'error', count: items.length, source });
  return result;
}

/** 蜜罐字段检测：被填写的请求视为机器人，静默丢弃但不报错 */
export function isHoneypotFilled(form: HTMLFormElement): boolean {
  const honeypot = form.querySelector<HTMLInputElement>('input[name="website"][tabindex="-1"]');
  return Boolean(honeypot && honeypot.value.trim());
}

// ── 转化事件 ─────────────────────────────────────────────────
// 2026-10-07（T-02）：由「6 个核心事件」扩为全量事件——页面 data-event 使用了 20+ 种
// 事件名，此前不在 TRACKED_EVENTS 内的直接被 return 丢弃，行为数据从未上报。
// 事件定义与含义统一维护在 docs/事件字典.md；本集合必须与
// functions/api/event.ts 的 ALLOWED_EVENTS 保持一致（两端各一份字面量，改动时同步）。
const TRACKED_EVENTS = new Set([
  // 程序化触发（表单结果、选礼器）
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

const EVENT_URL = '/api/event';

/** 上报一个转化事件；同一事件在同一会话内只发一次，避免重复计数 */
const sent = new Set<string>();
export function trackEvent(name: string, data: Record<string, unknown> = {}): void {
  if (!TRACKED_EVENTS.has(name)) return;
  const key = `${name}:${JSON.stringify(data)}`;
  if (sent.has(key)) return;
  sent.add(key);
  try {
    void fetch(EVENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ name, page: window.location.pathname, data }),
    }).catch(() => undefined);
  } catch {
    // 忽略：统计不影响任何业务操作
  }
}
