/**
 * 表单提交成功的全局弹层（2026-10-12）
 *
 * 背景：此前各表单成功后只把一段提示**内联**渲染在表单下方（successHtml），
 * 但定制表单提交后会 `goTo(0)` 把分步表单重置回第 1 步 —— 用户视线还在
 * 提交按钮附近，而提示卡渲染在整个表单下方，**很容易完全看不到**。
 * 业主反馈：「定制表格提交后，需要跳出『已完成提交，我们会尽快联系您！』」
 *
 * 设计取舍：
 *   · 做成"屏幕中央浮层 + 明确关闭按钮"，比内联文字更不易漏看；
 *   · **集中实现在 Layout 一处**，各表单成功后只需派发一个事件，
 *     避免 4 个表单各写一遍弹层（企业礼赠 / 定制 / 心愿单 / 浮动咨询）。
 *
 * 用法（各表单页提交成功后）：
 *   window.dispatchEvent(new CustomEvent('xiaominart:form-success', {
 *     detail: { note: '可选，回复时效说明', hint: '可选，补充提示' },
 *   }));
 *
 * 无障碍：role=dialog + aria-modal、打开时聚焦关闭按钮、Escape 可关、
 *         点击遮罩可关、关闭后焦点归还触发前的元素。
 */

export interface FormSuccessDetail {
  /** 回复时效说明，可含 <strong> 等白名单标签（仅限内部字面量） */
  note?: string;
  /** 补充提示（如"可以发参考图给我们"） */
  hint?: string;
  /** 覆盖默认标题；不传则用「已完成提交，我们会尽快联系您！」 */
  title?: string;
}

const DEFAULT_TITLE = '已完成提交，我们会尽快联系您！';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 只放行内部约定的强调标签，其余一律转义——与 cloud-forms 的 assertSafeMarkup 同一策略。 */
const ALLOWED = new Set(['strong', 'b', 'em', 'br']);
function safeRich(value: string): string {
  // 先转义全部，再把白名单标签还原（避免任何属性/事件处理器混入）
  const escaped = escapeHtml(value);
  return escaped.replace(/&lt;(\/?)(strong|b|em|br)\s*\/?&gt;/gi, (_m, slash: string, tag: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return _m;
    return t === 'br' ? '<br />' : `<${slash}${t}>`;
  });
}

let dialog: HTMLDivElement | null = null;
let closeBtn: HTMLButtonElement | null = null;
let titleEl: HTMLElement | null = null;
let noteEl: HTMLElement | null = null;
let hintEl: HTMLElement | null = null;
let lastFocused: Element | null = null;

function build(): void {
  if (dialog) return;

  dialog = document.createElement('div');
  dialog.className = 'form-success-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'form-success-title');
  dialog.hidden = true;

  const card = document.createElement('div');
  card.className = 'form-success-dialog-card';

  closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'form-success-dialog-close';
  closeBtn.setAttribute('aria-label', '关闭提示');
  closeBtn.textContent = '×';

  const mark = document.createElement('span');
  mark.className = 'form-success-dialog-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '✓';

  titleEl = document.createElement('h2');
  titleEl.id = 'form-success-title';
  titleEl.className = 'form-success-dialog-title serif';
  titleEl.textContent = DEFAULT_TITLE;

  noteEl = document.createElement('p');
  noteEl.className = 'form-success-dialog-note';
  noteEl.hidden = true;

  hintEl = document.createElement('p');
  hintEl.className = 'form-success-dialog-hint';
  hintEl.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'form-success-dialog-actions';

  const wechat = document.createElement('button');
  wechat.type = 'button';
  wechat.className = 'btn btn-primary';
  wechat.textContent = '加微信，聊得更快';
  wechat.addEventListener('click', () => {
    close();
    // 复用站内已有的微信 sheet（在 Layout 底部），避免弹层里再嵌一套二维码
    document.querySelector<HTMLButtonElement>('.wechat-link')?.click();
  });

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'btn btn-ghost';
  ok.textContent = '知道了';
  ok.addEventListener('click', close);

  actions.append(wechat, ok);
  card.append(closeBtn, mark, titleEl, noteEl, hintEl, actions);
  dialog.append(card);
  document.body.append(dialog);

  closeBtn.addEventListener('click', close);
  // 点遮罩关闭（点卡片内部不关）
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
}

export function open(detail: FormSuccessDetail = {}): void {
  build();
  if (!dialog || !titleEl || !noteEl || !hintEl) return;

  lastFocused = document.activeElement;

  titleEl.textContent = detail.title || DEFAULT_TITLE;

  if (detail.note) {
    noteEl.innerHTML = safeRich(detail.note);
    noteEl.hidden = false;
  } else {
    noteEl.hidden = true;
  }
  if (detail.hint) {
    hintEl.innerHTML = safeRich(detail.hint);
    hintEl.hidden = false;
  } else {
    hintEl.hidden = true;
  }

  dialog.hidden = false;
  document.body.classList.add('drawer-open');
  closeBtn?.focus();
}

export function close(): void {
  if (!dialog || dialog.hidden) return;
  dialog.hidden = true;
  document.body.classList.remove('drawer-open');
  // 焦点归还原处，键盘/读屏用户不会"丢位置"
  if (lastFocused instanceof HTMLElement) lastFocused.focus({ preventScroll: true });
  lastFocused = null;
}

/** 在 Layout 里调用一次，接住各表单派发的事件。 */
export function initFormSuccessDialog(): void {
  window.addEventListener('xiaominart:form-success', (event) => {
    const detail = (event as CustomEvent<FormSuccessDetail>).detail || {};
    open(detail);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}
