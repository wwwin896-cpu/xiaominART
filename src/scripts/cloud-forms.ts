// WorkBuddy Cloud 表单提交模块（仅客户端使用）
// - endpoint 与 publishableKey 为可公开凭据（publishable key 设计即公开），
//   数据安全由云端 RLS 保证：匿名角色仅有 INSERT 权限，无法读取任何线索。
// - 匿名插入不可携带 .select()（RETURNING 需要 SELECT 可见性，会触发 42501）。
import { createWorkBuddyCloud } from '@tencent-ai/workbuddy-cloud-sdk';

const cloud = createWorkBuddyCloud({
  endpoint: 'https://xiaominart-forms.app.workbuddy.host',
  publishableKey: 'wbpk_F0w7EXBEJ6ijaciNTHWkaW_og4NwUbg9n03Ie90K1Yq4dBZCicDBh3U',
});

export type SubmitOutcome = { ok: boolean; message?: string };

const FALLBACK_EMAIL = 'hello@xiaominart.com';
export const CONTACT_FALLBACK = `如持续失败，可直接邮件联系 ${FALLBACK_EMAIL}。`;

function errorText(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error ?? '');
}

/** 提交线索到 leads 表（form_type: quick_message / commission 等） */
export async function submitLead(
  formType: string,
  name: string,
  contact: string,
  payload: Record<string, unknown> = {},
): Promise<SubmitOutcome> {
  try {
    const { error } = await cloud.database.from('leads').insert({
      form_type: formType,
      name: name.slice(0, 200),
      contact: contact.slice(0, 200),
      payload,
    });
    if (error) return { ok: false, message: errorText(error) };
    return { ok: true };
  } catch (error) {
    return { ok: false, message: errorText(error) };
  }
}

/** 提交订阅邮箱到 subscribers 表（email 唯一，重复时视为成功并提示） */
export async function subscribeEmail(email: string, source: string): Promise<SubmitOutcome> {
  try {
    const { error } = await cloud.database
      .from('subscribers')
      .insert({ email: email.trim().toLowerCase(), source });
    if (!error) return { ok: true };
    const detail = errorText(error).toLowerCase();
    if (detail.includes('duplicate') || detail.includes('23505') || detail.includes('unique')) {
      return { ok: true, message: '这个邮箱已经订阅过了，无需重复提交。' };
    }
    return { ok: false, message: errorText(error) };
  } catch (error) {
    return { ok: false, message: errorText(error) };
  }
}

/** 蜜罐字段检测：被填写的请求视为机器人，静默丢弃但不报错 */
export function isHoneypotFilled(form: HTMLFormElement): boolean {
  const honeypot = form.querySelector<HTMLInputElement>('input[name="website"][tabindex="-1"]');
  return Boolean(honeypot && honeypot.value.trim());
}
