// 表单提交模块（仅客户端使用）
// 生产链路：浏览器 → 同源 /api/lead/（Vercel serverless 代理，见 src/pages/api/lead.ts）→ WorkBuddy 云数据库。
// 为什么不直连云端：云服务端强制精确 Origin 匹配，www.xiaominart.com 不在白名单，
// 浏览器直连会在预检阶段被 403 拦截。同源代理请求无 CORS 限制。
// publishableKey 已收敛到服务端，不再进入前端打包产物。
export type SubmitOutcome = { ok: boolean; message?: string };

const FALLBACK_EMAIL = 'hello@xiaominart.com';
export const CONTACT_FALLBACK = `如持续失败，可直接邮件联系 ${FALLBACK_EMAIL}。`;

const API_URL = '/api/lead/';

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

/** 提交线索到 leads 表（formType: quick_message / commission） */
export async function submitLead(
  formType: string,
  name: string,
  contact: string,
  payload: Record<string, unknown> = {},
): Promise<SubmitOutcome> {
  return postToApi({ kind: 'lead', formType, name, contact, payload });
}

/** 提交订阅邮箱到 subscribers 表（email 唯一，重复时视为成功并提示） */
export async function subscribeEmail(email: string, source: string): Promise<SubmitOutcome> {
  return postToApi({ kind: 'subscribe', email, source });
}

/** 蜜罐字段检测：被填写的请求视为机器人，静默丢弃但不报错 */
export function isHoneypotFilled(form: HTMLFormElement): boolean {
  const honeypot = form.querySelector<HTMLInputElement>('input[name="website"][tabindex="-1"]');
  return Boolean(honeypot && honeypot.value.trim());
}
