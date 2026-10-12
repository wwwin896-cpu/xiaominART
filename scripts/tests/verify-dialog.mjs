/**
 * 零依赖行为验证 · 表单成功弹层
 *
 * 需真正断言的三件事：
 *   ① 派发事件后弹层出现，标题是业主指定的「已完成提交，我们会尽快联系您！」
 *   ② 三种关闭方式都有效：关闭按钮 / Escape / 点遮罩
 *   ③ 安全：note 里的 <strong> 保留，但 <script>/onerror 必须被转义
 */

// ── 最小 DOM 桩 ──
class ClassList {
  constructor() { this.set = new Set(); }
  add(c) { this.set.add(c); }
  remove(c) { this.set.delete(c); }
  contains(c) { return this.set.has(c); }
  toggle(c, f) { const w = f === undefined ? !this.set.has(c) : !!f; w ? this.set.add(c) : this.set.delete(c); return w; }
}
class El {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.children = [];
    this.parent = null; this.listeners = {}; this.classList = new ClassList();
    this._text = ''; this._html = ''; this.hidden = false;
  }
  set className(v) { this.attrs.class = v; }
  get className() { return this.attrs.class || ''; }
  set textContent(v) { this._text = String(v); this._html = ''; }
  get textContent() { return this._text; }
  set innerHTML(v) { this._html = String(v); this._text = String(v).replace(/<[^>]*>/g, ''); }
  get innerHTML() { return this._html; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  append(...ns) { ns.forEach((n) => { n.parent = this; this.children.push(n); }); }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  dispatch(t, ev = {}) {
    const e = { type: t, target: this, ...ev };
    (this.listeners[t] || []).forEach((fn) => fn.call(this, e));
    if (e.__stop) return;
    let p = this.parent;
    while (p) { (p.listeners[t] || []).forEach((fn) => fn.call(p, { ...e, target: this })); p = p.parent; }
  }
  querySelector(sel) {
    const walk = (n) => {
      for (const c of n.children) {
        if (sel.startsWith('.') && (c.attrs.class || '').split(/\s+/).includes(sel.slice(1))) return c;
        const r = walk(c); if (r) return r;
      }
      return null;
    };
    return walk(this);
  }
}

const document = new El('#document');
document.body = new El('body');
const window = new El('#window');
window.listeners = {};

// ── 复刻 form-success-dialog.ts 逻辑 ──
const DEFAULT_TITLE = '已完成提交，我们会尽快联系您！';
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const ALLOWED = new Set(['strong', 'b', 'em', 'br']);
function safeRich(v) {
  return escapeHtml(v).replace(/&lt;(\/?)(strong|b|em|br)\s*\/?&gt;/gi, (_m, slash, tag) => {
    const t = tag.toLowerCase();
    if (!ALLOWED.has(t)) return _m;
    return t === 'br' ? '<br />' : `<${slash}${t}>`;
  });
}

let dialog = null, titleEl = null, noteEl = null, hintEl = null;
function build() {
  if (dialog) return;
  dialog = new El('div', { class: 'form-success-dialog' });
  dialog.hidden = true;
  const card = new El('div', { class: 'form-success-dialog-card' });
  const closeBtn = new El('button', { class: 'form-success-dialog-close' });
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', close);
  titleEl = new El('h2', { class: 'form-success-dialog-title' });
  titleEl.textContent = DEFAULT_TITLE;
  noteEl = new El('p', { class: 'form-success-dialog-note' }); noteEl.hidden = true;
  hintEl = new El('p', { class: 'form-success-dialog-hint' }); hintEl.hidden = true;
  card.append(closeBtn, titleEl, noteEl, hintEl);
  dialog.append(card);
  document.body.append(dialog);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
}
function open(detail = {}) {
  build();
  titleEl.textContent = detail.title || DEFAULT_TITLE;
  if (detail.note) { noteEl.innerHTML = safeRich(detail.note); noteEl.hidden = false; } else noteEl.hidden = true;
  if (detail.hint) { hintEl.innerHTML = safeRich(detail.hint); hintEl.hidden = false; } else hintEl.hidden = true;
  dialog.hidden = false;
  document.body.classList.add('drawer-open');
}
function close() {
  if (!dialog || dialog.hidden) return;
  dialog.hidden = true;
  document.body.classList.remove('drawer-open');
}
window.addEventListener('xiaominart:form-success', (e) => open(e.detail || {}));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

// ── 断言 ──
let pass = 0, fail = 0;
const assert = (l, c, x = '') => { c ? (pass++, console.log(`  ✅ ${l}`)) : (fail++, console.log(`  ❌ ${l} ${x}`)); };

console.log('\n【场景 1】派发成功事件 → 弹层出现，文案正确');
window.dispatch('xiaominart:form-success', {
  detail: { note: '工作日通常 <strong>当天或次日</strong>回复你。', hint: '参考图可以直接发微信。' },
});
assert('弹层可见', dialog.hidden === false);
assert('标题 =「已完成提交，我们会尽快联系您！」', titleEl.textContent === DEFAULT_TITLE, titleEl.textContent);
assert('body.drawer-open 已加', document.body.classList.contains('drawer-open'));
assert('note 的 <strong> 被保留', noteEl.innerHTML.includes('<strong>当天或次日</strong>'), noteEl.innerHTML);
assert('hint 已显示', hintEl.hidden === false);

console.log('\n【场景 2】点关闭按钮 → 收起');
dialog.querySelector('.form-success-dialog-close').dispatch('click');
assert('弹层已隐藏', dialog.hidden === true);
assert('body.drawer-open 已移除', !document.body.classList.contains('drawer-open'));

console.log('\n【场景 3】重新打开后按 Escape → 关闭');
window.dispatch('xiaominart:form-success', { detail: {} });
assert('已重新打开', dialog.hidden === false);
assert('标题为默认文案', titleEl.textContent === DEFAULT_TITLE, titleEl.textContent);
document.dispatch('keydown', { key: 'Escape' });
assert('Escape 已关闭', dialog.hidden === true);

console.log('\n【场景 4】点遮罩关闭 / 点卡片内部不关');
window.dispatch('xiaominart:form-success', { detail: {} });
dialog.dispatch('click');                       // target === dialog → 关
assert('点遮罩已关闭', dialog.hidden === true);
window.dispatch('xiaominart:form-success', { detail: {} });
dialog.querySelector('.form-success-dialog-card').dispatch('click');
assert('点卡片内部不关闭', dialog.hidden === false);
close();

console.log('\n【场景 5】安全：恶意输入必须被转义');
window.dispatch('xiaominart:form-success', {
  detail: { note: '<script>alert(1)</script>', hint: '<img src=x onerror=alert(1)>' },
});
assert('script 被转义', !noteEl.innerHTML.includes('<script>'), noteEl.innerHTML);
assert('img/onerror 被转义', !hintEl.innerHTML.includes('<img'), hintEl.innerHTML);

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail === 0 ? 0 : 1);
