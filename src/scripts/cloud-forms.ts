// 表单提交模块（仅客户端使用）
// 生产链路：浏览器 → 同源 /api/lead（Cloudflare Pages Function，见 functions/api/lead.ts）→ WorkBuddy 云数据库。
// 为什么不直连云端：云服务端强制精确 Origin 匹配，www.xiaominart.com 不在白名单，
// 浏览器直连会在预检阶段被 403 拦截。同源代理请求无 CORS 限制。
// publishableKey 已收敛到服务端，不再进入前端打包产物。
export type SubmitOutcome = { ok: boolean; message?: string };

const FALLBACK_EMAIL = 'hi@xiaominart.com';
// 2026-10-07（T-01）：失败态给出微信路径——站内最快的联系方式是联系页二维码
export const CONTACT_FALLBACK = `如持续失败，最快是加微信：在「联系我们」页长按二维码添加（备注来意）；也可以发邮件到 ${FALLBACK_EMAIL}。`;

// 微信二维码路径（与 src/data/site.ts 的 siteContact.wechatQr 保持一致）。
// 这里独立声明是因为本模块是纯客户端脚本，不参与 Astro 构建期求值。
const WECHAT_QR = '/assets/images/wechat-qr.jpg';

/**
 * 把文本中的 HTML 元字符转义为实体。
 * 用于任何**可能来自外部（用户输入 / 接口返回）**的字符串在拼进 HTML 之前。
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}

/**
 * HTML 注入白名单校验：只放行本模块自己用到的两类标签。
 *
 * 背景：`successHtml()` 的两个参数历史上是各页面写死的字面量（含 `<strong>` 强调），
 * 因此实现里直接做了字符串插值。为防止后续有人把用户数据传进来造成 XSS，
 * 这里在拼接前做一次「只允许既定标签」的校验，把「约定」升级为「机制」。
 */
const ALLOWED_TAGS = new Set(['strong', 'b', 'em']);
function assertSafeMarkup(value: string, param: string): void {
  // 任何标签都必须落在白名单内，且不允许事件处理器 / javascript: 协议
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(value)) !== null) {
    if (!ALLOWED_TAGS.has(match[1].toLowerCase())) {
      throw new Error(`successHtml(${param}) 含未授权标签 <${match[1]}>——该参数只接受内部字面量，若需传入外部数据请先 escapeHtml()`);
    }
  }
  if (/\son[a-z]+\s*=/i.test(value) || /javascript:/i.test(value)) {
    throw new Error(`successHtml(${param}) 含可疑属性或协议——该参数只接受内部字面量`);
  }
}

/**
 * 表单提交成功后的统一收尾：明确回复时效 + 就地给出微信二维码。
 * 2026-10-07（B3）：此前成功态只有一句「已收到」，用户不知道要等多久、也拿不到更快的通道，
 * 容易在等待期流失。这里把「多久回复」和「想更快就扫码」一次性讲清。
 *
 * ⚠ 参数约束：`note` / `hint` 会**未经转义**拼进 HTML，只接受模块内调用点写死的字面量
 * （允许 `<strong>` `<b>` `<em>`）。**不要把用户输入、接口返回值直接传进来**——
 * 需要传外部数据时，先 `escapeHtml()` 再传，或改用 DOM 构建。
 * 违反约束会在开发阶段直接抛错（见 assertSafeMarkup），不会静默生成不安全 HTML。
 *
 * @param note 各页可自定义的时效说明，默认按工作日 1 个工作日内回复
 * @param hint 补充提示（如企业需求的批量说明、定制可发参考图）
 */
export function successHtml(note?: string, hint?: string): string {
  const timing = note || '工作日通常 <strong>当天或次日</strong>回复你。';
  if (import.meta.env.DEV) {
    assertSafeMarkup(timing, 'note');
    if (hint) assertSafeMarkup(hint, 'hint');
  }
  const tip = hint ? `<p class="form-success-tip">${hint}</p>` : '';
  return `<div class="form-success">
    <p class="form-success-lead"><strong>已经收到你的消息了。</strong>${timing}</p>
    <p class="form-success-sub">想更快聊上——扫码加微信，备注一句来意即可：</p>
    <a class="form-success-qr" href="${WECHAT_QR}" target="_blank" rel="noopener" title="点击查看大图，长按识别添加"><img src="${WECHAT_QR}" width="132" height="132" alt="小民艺术微信二维码" loading="lazy" /></a>
    <p class="form-success-tip">手机上长按二维码识别添加；不方便加微信也可以等我们的回复。</p>
    ${tip}
  </div>`;
}

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
  'scene_to_product',
  'scene_view',
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
