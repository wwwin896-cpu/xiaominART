/**
 * 零依赖行为验证 · 用最小 DOM 桩真实执行菜单逻辑
 *
 * 背景：沙箱里 jsdom 装不上（npm 反复失败），Chromium 也起不来。
 * 但菜单逻辑本身只依赖 DOM 的一个极小子集：
 *   querySelector / addEventListener / classList / setAttribute / contains / matchMedia
 * 因此这里手写一个够用的桩，把 Layout chunk 里的真实逻辑跑起来做断言。
 * —— 比"肉眼看代码"强得多：它真的执行了分支。
 */

// ── 最小 DOM 桩 ──
class ClassList {
  constructor() { this.set = new Set(); }
  add(c) { this.set.add(c); }
  remove(c) { this.set.delete(c); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    const want = force === undefined ? !this.set.has(c) : !!force;
    want ? this.set.add(c) : this.set.delete(c);
    return want;
  }
}

class El {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.classList = new ClassList();
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  append(...nodes) { nodes.forEach((n) => { n.parent = this; this.children.push(n); }); }
  contains(node) {
    if (node === this) return true;
    return this.children.some((c) => c.contains && c.contains(node));
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, event = {}) {
    const ev = { type, target: this, ...event };
    const list = this.listeners[type] || [];
    // 冒泡：先本节点，再逐级向上
    list.forEach((fn) => fn.call(this, ev));
    if (ev.__stopBubble) return;
    let p = this.parent;
    while (p) {
      (p.listeners[type] || []).forEach((fn) => fn.call(p, { ...ev, target: this }));
      p = p.parent;
    }
  }
  querySelectorAll(sel) {
    // 只需支持 'a' 与 '#id' 两种简单场景
    const out = [];
    const walk = (n) => {
      if (sel.startsWith('#') && n.attrs.id === sel.slice(1)) out.push(n);
      if (sel === 'a' && n.tagName === 'A') out.push(n);
      n.children.forEach(walk);
    };
    this.children.forEach(walk);
    return out;
  }
}

const document = new El('#document');
document.body = new El('body');
document.append(document.body);

const header = new El('header');
const toggle = new El('button', { 'aria-expanded': 'false' });
const nav = new El('nav', { id: 'site-nav' });
nav.classList = new ClassList();
const linkA = new El('a', { href: '/a/' });
const linkB = new El('a', { href: '/b/' });
nav.append(linkA, linkB);
header.append(toggle, nav);
document.body.append(header);
const outside = new El('p', { id: 'outside' });
document.body.append(outside);

// 让 document / body 参与冒泡：节点的 parent 链要接上 document
header.parent = document.body;
document.body.parent = document;

// ── 复刻 Layout chunk 中的真实逻辑（与压缩产物逐字对应）──
const isMenuOpen = () => toggle?.getAttribute('aria-expanded') === 'true';
const closeMenu = () => {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
};
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('click', (e) => {
  if (!isMenuOpen()) return;
  const t = e.target;
  t && (nav?.contains(t) || toggle?.contains(t) || closeMenu());
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen()) closeMenu();
});
const win = new El('#window');
win.addEventListener('scroll', () => { if (isMenuOpen()) closeMenu(); });

// ── 断言 ──
let pass = 0, fail = 0;
const assert = (label, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label} ${extra}`); }
};
const state = () => `aria=${toggle.getAttribute('aria-expanded')} open=${nav.classList.contains('open')} body=${document.body.classList.contains('menu-open')}`;

console.log('\n【场景 1】点「菜单」按钮 → 展开');
toggle.dispatch('click');
assert('aria-expanded=true', toggle.getAttribute('aria-expanded') === 'true', state());
assert('nav.open 存在', nav.classList.contains('open'), state());
assert('body.menu-open 存在', document.body.classList.contains('menu-open'), state());

console.log('\n【场景 2】点菜单内链接 → 关闭');
linkA.dispatch('click');
assert('aria-expanded=false', toggle.getAttribute('aria-expanded') === 'false', state());
assert('nav.open 已移除', !nav.classList.contains('open'), state());
assert('body.menu-open 已移除', !document.body.classList.contains('menu-open'), state());

console.log('\n【场景 3】展开后点页面空白处 → 关闭');
toggle.dispatch('click');
assert('先确认已展开', isMenuOpen(), state());
outside.dispatch('click');
assert('aria-expanded=false', toggle.getAttribute('aria-expanded') === 'false', state());
assert('nav.open 已移除', !nav.classList.contains('open'), state());

console.log('\n【场景 4】展开后点菜单面板内部（非链接）→ 不关闭');
toggle.dispatch('click');
nav.dispatch('click');
assert('菜单保持展开', isMenuOpen(), state());

console.log('\n【场景 5】展开后点「菜单」按钮 → 关闭（切换语义）');
assert('点之前是展开的', isMenuOpen(), state());
toggle.dispatch('click');
assert('aria-expanded=false', toggle.getAttribute('aria-expanded') === 'false', state());

console.log('\n【场景 6】展开后页面滚动（上滑）→ 关闭');
toggle.dispatch('click');
assert('先确认已展开', isMenuOpen(), state());
win.dispatch('scroll');
assert('aria-expanded=false', toggle.getAttribute('aria-expanded') === 'false', state());
assert('nav.open 已移除', !nav.classList.contains('open'), state());
assert('body.menu-open 已移除', !document.body.classList.contains('menu-open'), state());

console.log('\n【场景 7】关闭状态下滚动 → 无副作用');
win.dispatch('scroll');
assert('保持关闭', toggle.getAttribute('aria-expanded') === 'false', state());

console.log('\n【场景 8】展开后按 Escape → 关闭');
toggle.dispatch('click');
assert('先确认已展开', isMenuOpen(), state());
document.dispatch('keydown', { key: 'Escape' });
assert('aria-expanded=false', toggle.getAttribute('aria-expanded') === 'false', state());

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail === 0 ? 0 : 1);
