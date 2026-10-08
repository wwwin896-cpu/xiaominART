// ─────────────────────────────────────────────────────────────
// 表单提交通知（WO-P0-01 双通道，2026-10-09）
//
// 通道 1 · 飞书群机器人：环境变量 FEISHU_WEBHOOK_URL
// 通道 2 · 邮件（Resend）：环境变量 RESEND_API_KEY + RESEND_TO_EMAIL
//          （RESEND_FROM_EMAIL 可选，默认 onboarding@resend.dev）
//
// 三条原则：
// 1. 通知是「尽力而为」——任何失败只写日志，绝不影响用户提交结果；
// 2. 凭据一律走 Cloudflare Pages 环境变量，禁止硬编码（本仓库公开，
//    2026-10-06 publishableKey 泄露教训见 lead.ts 头注）；
// 3. 未配置 = 通道静默关闭，站点零报错；业主配置后无需改代码自动生效。
// ─────────────────────────────────────────────────────────────

export type Env = Record<string, string | undefined>;

/** Cloudflare Pages Functions 的 EventContext.waitUntil：响应发出后继续跑后台任务 */
export type WaitUntil = (promise: Promise<unknown>) => void;

export type NotifyPayload = {
  kind: 'lead' | 'subscribe';
  /** lead 表单类型：quick_message / commission / business_gift / wishlist */
  formType?: string;
  name: string;
  contact: string;
  payload?: Record<string, unknown>;
  /** subscribe 的邮箱 */
  email?: string;
};

const FORM_TYPE_LABEL: Record<string, string> = {
  quick_message: '快速咨询',
  commission: '定制咨询',
  business_gift: '企业礼赠',
  wishlist: '心愿清单',
};

// 与 src/pages/*.astro 提交代码里的 payload 字段一一对应；查不到的键原样显示
const FIELD_LABEL: Record<string, string> = {
  inspiration: '灵感来源',
  artist: '艺术家',
  context: '使用场景',
  use: '用途',
  size: '尺寸',
  budget: '预算',
  displaySpace: '悬挂空间',
  displaySpaceOther: '空间补充',
  intention: '意向说明',
  direction: '内容方向',
  timeline: '期望时间',
  private: '私密定制',
  page: '提交页面',
  referrer: '来源页',
  question: '咨询内容',
  items: '心愿作品',
  source: '来源',
  note: '备注',
  quantity: '数量',
  scene: '场景',
  brief: '需求简述',
};

const FEISHU_TEXT_MAX = 3000;

/** 北京时间（Workers/Node 均内置 Asia/Shanghai 时区数据） */
function beijingTime(): string {
  return new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 空值/null/false 不显示；true 显示「是」；对象 JSON 化；超长截断 */
function fmtValue(v: unknown): string {
  if (v === null || v === undefined || v === '' || v === false) return '';
  if (v === true) return '是';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > 200 ? `${s.slice(0, 200)}…` : s;
}

function titleOf(n: NotifyPayload): string {
  if (n.kind === 'subscribe') return '邮件订阅';
  return FORM_TYPE_LABEL[n.formType ?? ''] ?? n.formType ?? '未知表单';
}

/** 纯函数：飞书 text 消息正文。本地可独立测试。 */
export function buildFeishuText(n: NotifyPayload): string {
  const lines: string[] = [`【小民艺术官网 · 新线索】${titleOf(n)}`];
  if (n.kind === 'subscribe') {
    lines.push(`邮箱：${n.email ?? ''}`);
  } else {
    lines.push(`称呼：${n.name}`);
    if (n.contact) lines.push(`联系方式：${n.contact}`);
    const body = Object.entries(n.payload ?? {})
      .map(([k, v]) => [FIELD_LABEL[k] ?? k, fmtValue(v)] as const)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `${k}：${v}`)
      .join('\n');
    if (body) lines.push('――――――――', body);
  }
  lines.push('――――――――', `时间：${beijingTime()}（北京时间）`);
  const text = lines.join('\n');
  return text.length > FEISHU_TEXT_MAX ? `${text.slice(0, FEISHU_TEXT_MAX)}…` : text;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 纯函数：Resend 邮件（主题 + HTML 正文）。用户输入全部 HTML 转义。 */
export function buildEmail(n: NotifyPayload): { subject: string; html: string } {
  const title = titleOf(n);
  const subject = `【小民艺术官网】新线索 · ${title} · ${escapeHtml(
    n.kind === 'subscribe' ? n.email ?? '' : n.name,
  )}`;

  const rows: Array<[string, string]> = [];
  if (n.kind === 'subscribe') {
    rows.push(['邮箱', escapeHtml(n.email ?? '')]);
  } else {
    rows.push(['称呼', escapeHtml(n.name)]);
    if (n.contact) rows.push(['联系方式', escapeHtml(n.contact)]);
    for (const [k, v] of Object.entries(n.payload ?? {})) {
      const val = fmtValue(v);
      if (val) rows.push([escapeHtml(FIELD_LABEL[k] ?? k), escapeHtml(val)]);
    }
  }
  rows.push(['时间', `${beijingTime()}（北京时间）`]);

  const html = `<div style="font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;max-width:640px;margin:0 auto;color:#3a3430;">
  <h2 style="font-size:18px;margin:24px 0 12px;">【小民艺术官网】新线索 · ${escapeHtml(title)}</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px;border:1px solid #eee0d4;background:#faf7f0;white-space:nowrap;width:96px;">${k}</td><td style="padding:8px 12px;border:1px solid #eee0d4;">${v}</td></tr>`,
      )
      .join('\n    ')}
  </table>
  <p style="font-size:12px;color:#8a837c;margin-top:16px;">来自 xiaominart.com 表单提交 · 邮件通道（Resend）</p>
</div>`;
  return { subject, html };
}

/** 发飞书 text 消息；非 2xx 抛错（由 notify 统一吞错记日志） */
async function sendFeishu(webhook: string, text: string): Promise<void> {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg_type: 'text', content: { text } }),
  });
  if (!res.ok) throw new Error(`飞书返回 HTTP ${res.status}`);
}

/** 发 Resend 邮件；非 2xx 抛错（由 notify 统一吞错记日志） */
async function sendResendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend 返回 HTTP ${res.status}${detail ? `：${detail.slice(0, 200)}` : ''}`);
  }
}

/**
 * 顶层入口：按环境变量开关两个通道，全部后台执行（waitUntil），
 * 失败只 console.error，绝不向用户冒泡。
 */
export function notify(env: Env, waitUntil: WaitUntil, n: NotifyPayload): void {
  const feishuUrl = env.FEISHU_WEBHOOK_URL;
  if (feishuUrl) {
    const text = buildFeishuText(n);
    waitUntil(
      sendFeishu(feishuUrl, text).catch((err: unknown) =>
        console.error('[notify] 飞书通知失败：', err instanceof Error ? err.message : err),
      ),
    );
  }

  const resendKey = env.RESEND_API_KEY;
  const toEmail = env.RESEND_TO_EMAIL;
  if (resendKey && toEmail) {
    const { subject, html } = buildEmail(n);
    const from = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    waitUntil(
      sendResendEmail(resendKey, from, toEmail, subject, html).catch((err: unknown) =>
        console.error('[notify] 邮件通知失败：', err instanceof Error ? err.message : err),
      ),
    );
  } else if (resendKey || toEmail) {
    // 只配了一个 = 配置不完整，提醒但不报错
    console.error('[notify] 邮件通道配置不完整（需同时配置 RESEND_API_KEY 与 RESEND_TO_EMAIL），已跳过');
  }
  // 两个都没配 = 邮件通道未启用，静默
}
