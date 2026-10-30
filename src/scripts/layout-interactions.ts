// ─────────────────────────────────────────────────────────────
// 全站布局级交互（2026-10-12 从 Layout.astro 抽出）
//
// 抽出的原因：以下 6 类互不相关的交互此前全部挤在 Layout.astro 的
// 同一个 <script> 里，导致每次任何一处需求（改菜单、加弹层、调埋点）
// 都要动这个文件，7 天内被反复修改 18 次 —— 问题不在写得不好，
// 而在这个文件同时承担了太多职责。
//
// 现按职责在此分节，各节之间**不共享状态**，可独立修改、独立删除：
//   ① 移动端菜单开合（含 4 种关闭方式）
//   ② 移动端返回键
//   ③ 滚动显现（[data-reveal]）
//   ④ 埋点事件委托 + 统一上报
//   ⑤ 微信直联弹层 + 复制微信号
//   ⑥ 心愿单角标同步
//
// 本文件由 Layout.astro 通过一个 <script> import 引入一次即可，
// 不要在这里做模块级副作用判断（如 document.readyState），
// Astro 的 <script> 默认 defer 行为已保证 DOM 就绪。
// ─────────────────────────────────────────────────────────────
import { trackEvent } from './cloud-forms';
import { readWishlist, onWishlistChange } from './wishlist';
import { initFormSuccessDialog } from './form-success-dialog';

// 表单成功弹层：集中在此初始化一次，各表单成功后派发
// 'xiaominart:form-success' 事件即可弹出（见 form-success-dialog.ts）。
initFormSuccessDialog();

// ── ① 移动端菜单开合 ──────────────────────────────────────────
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const isMenuOpen = () => toggle?.getAttribute('aria-expanded') === 'true';
const closeMenu = () => {
  if (!toggle || !nav) return;
  if (!nav.classList.contains('open')) { toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); return; }
  toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  // 滑出动画（2026-10-29）：保持 open（display:grid）把 transform 拉回屏外，
  // 过渡结束后再真正移除 open。reduced-motion / 旧浏览器 transition 不跑，
  // 用 360ms 兜底定时器保证 close 一定完成，不会卡在半开态。
  let done = false;
  const finish = () => { if (done) return; done = true; nav.classList.remove('open'); nav.classList.remove('closing'); };
  nav.classList.add('closing');
  nav.addEventListener('transitionend', finish, { once: true });
  window.setTimeout(finish, 360);
};

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

// 移动端菜单的四种关闭方式（2026-10-12 业主反馈：此前只能在菜单项上点一下才关得掉）
//   ① 点菜单项
//   ② 点菜单与按钮以外的任意处
//   ③ 手指上滑 / 页面滚动（内容往上走）时自动收起
//   ④ Escape 键（键盘与外接键盘用户）
// 四者都只在菜单已展开时生效，避免给未展开的页面增加无谓监听开销。
document.addEventListener('click', (event) => {
  if (!isMenuOpen()) return;
  const target = event.target as Node | null;
  if (!target) return;
  if (nav?.contains(target) || toggle?.contains(target)) return;
  closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMenuOpen()) closeMenu();
});
// 滚动即收起：用 passive 监听，保证不拖慢滚动本身。
// 注意不要在所有滚动里做 DOM 写操作——先判断 isMenuOpen() 再动手。
window.addEventListener('scroll', () => { if (isMenuOpen()) closeMenu(); }, { passive: true });
// 视口变宽（横竖屏切换 / 放大窗口）后菜单变为桌面形态，
// 若仍留着 open 类会让桌面导航状态与 aria-expanded 不一致，这里一并复位。
const wideQuery = window.matchMedia('(min-width: 768px)');
wideQuery.addEventListener('change', (e) => { if (e.matches) closeMenu(); });

// ── ①b 磁吸印章滑块（2026-10-29，桌面端专属）──────────────────────
// 当前项默认被一枚淡朱砂「印」吸住；悬停其他项时印吸过去，离开回到当前项。
// 只在 ≥768px 且指针支持悬停的设备激活；触屏上没有 hover，滑块永远停在当前项
//（用 opacity:0 起步，激活时才 .on，无 JS / 移动端零痕迹）。
// 性能：只监听 mouseenter/mouseleave 两个冒泡点，不做 scroll/resize 高频回调；
//       resize 后由下一次 hover 自然重算（current 项位置变化可接受）。
const magnet = document.querySelector<HTMLElement>('.nav-magnet');
const desktopNav = document.querySelector<HTMLElement>('#site-nav');
if (magnet && desktopNav && wideQuery.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const items = Array.from(desktopNav.querySelectorAll<HTMLElement>('.nav-item'));
  const snapTo = (item: HTMLElement) => {
    // .nav-item 是定位基准；印的位置相对 nav（magnet 的 offsetParent）
    const navBox = desktopNav.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    magnet.style.width = `${Math.round(box.width + 8)}px`;
    magnet.style.transform = `translate(${Math.round(box.left - navBox.left - 4)}px, -50%)`;
    magnet.classList.add('on');
  };
  const current = desktopNav.querySelector<HTMLElement>('.nav-item a.current')?.closest<HTMLElement>('.nav-item');
  // 初次定位：等字体加载完成再量，否则衬线字体换帧会量偏。
  // 首页等导航里没有当前页的页面：无 current，印保持熄灭（悬停才出现）。
  const snapCurrent = () => { if (current) snapTo(current); else magnet.classList.remove('on'); };
  if (document.fonts?.ready) document.fonts.ready.then(snapCurrent);
  else snapCurrent();
  desktopNav.addEventListener('mouseover', (event) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('.nav-item');
    if (item) snapTo(item);
  });
  desktopNav.addEventListener('mouseleave', snapCurrent);
  // 窗口跨过桌面断点后重新吸回当前项；回到移动端则熄灭
  wideQuery.addEventListener('change', (e) => {
    if (e.matches) snapCurrent();
    else magnet.classList.remove('on');
  });
}

// ── ①c 移动端四 Tab 当前页标记（v5.0）──────────────────────────
// 底栏是 <a> 链接，浏览器不会自动标 aria-current —— 这里按路径前缀匹配：
// 首页精确「/」，其余按第一段目录匹配（/gifts/xx 也点亮「书法」）。
const path = window.location.pathname;
document.querySelectorAll<HTMLAnchorElement>('.mobile-tabbar a').forEach((a) => {
  const href = a.getAttribute('href') || '/';
  const hit = href === '/' ? path === '/' : path === href || path.startsWith(href.slice(0, -1) + '/');
  if (hit) a.setAttribute('aria-current', 'page');
});

// ── ①d 回到顶部（v5.0：替代「返回首页」FAB）─────────────────────
const backTop = document.querySelector<HTMLButtonElement>('[data-back-top]');
if (backTop) {
  let btTick = false;
  window.addEventListener('scroll', () => {
    if (btTick) return;
    btTick = true;
    requestAnimationFrame(() => {
      btTick = false;
      backTop.classList.toggle('show', window.scrollY > window.innerHeight * 1.5);
    });
  }, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── ② 移动端返回键 ────────────────────────────────────────────
// 非首页显示，优先浏览器历史回退，无历史则回首页。
const backBtn = document.querySelector<HTMLButtonElement>('[data-back-button]');
if (backBtn) {
  if (window.location.pathname === '/') backBtn.remove();
  else backBtn.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  });
}

// ── ③ 滚动显现 ────────────────────────────────────────────────
const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// ── ④ 埋点：事件委托 + 统一上报 ───────────────────────────────
// 2026-10-09：由「逐个节点绑 addEventListener」改为**事件委托**。
// 原写法只在页面加载时对既有 [data-event] 节点绑定一次，之后由组件动态插入的节点
// （搜索结果项、心愿单抽屉条目、选礼器选项卡）**永远收不到监听** —— 表现是这些交互
// 的埋点全部为空，且没有任何报错，极难发现。委托到 document 后，动态节点自动生效。
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const element = target?.closest<HTMLElement>('[data-event]');
  if (!element) return;
  const eventName = element.dataset.event;
  if (!eventName) return;
  window.dispatchEvent(new CustomEvent('xiaominart:event', {
    detail: {
      name: eventName,
      path: window.location.pathname,
      slot: element.dataset.slot,
      channel: element.dataset.channel,
    },
  }));
});
// 站内所有交互事件统一在这里汇入上报（只上报核心漏斗的 6 个，服务端另有白名单）
window.addEventListener('xiaominart:event', (event) => {
  const detail = ((event as CustomEvent).detail || {}) as Record<string, unknown>;
  const name = typeof detail.name === 'string' ? detail.name : '';
  if (!name) return;
  const data: Record<string, unknown> = {};
  Object.entries(detail).forEach(([key, value]) => { if (key !== 'name' && value) data[key] = value; });
  trackEvent(name, data);
});

// ── ⑤ 移动端「微信直联」弹层（WO-P0-04）────────────────────────
// 触点：底栏按钮 → 弹出二维码 + 可选微信号复制。微信内打开时提示「长按识别」，
// 其他浏览器补一句「截图后用微信扫一扫」，因为站内无法直接唤起微信加好友。
//
// 2026-10-15 扩展：页内任何 `[data-wechat-open]` 元素也能唤起同一个弹层。
// 起因 —— 企业礼赠页把「加微信直接聊」提到了首屏与下载区，若只能靠移动底栏触发，
// 桌面端访客在这些位置点下去会没有任何反应（底栏在桌面是隐藏的）。
const wechatTrigger = document.querySelector<HTMLButtonElement>('.wechat-link');
const wechatSheet = document.querySelector<HTMLElement>('#wechat-sheet');
const closeWechat = () => {
  // 2026-10-18：底栏「微信直联」格已移除（改 3 格），.wechat-link 可能为 null；
  // 关闭只依赖弹层本身存在，否则页内 [data-wechat-open] 打开后将关不掉。
  if (!wechatSheet) return;
  wechatSheet.hidden = true;
  wechatTrigger?.setAttribute('aria-expanded', 'false');
};
const openWechat = (source?: string) => {
  if (!wechatSheet) return;
  wechatSheet.hidden = false;
  wechatTrigger?.setAttribute('aria-expanded', 'true');
  window.dispatchEvent(new CustomEvent('xiaominart:event', {
    detail: { name: 'wechat_direct_open', path: window.location.pathname, source },
  }));
  wechatSheet.querySelector<HTMLButtonElement>('.wechat-sheet-close')?.focus();
};
wechatTrigger?.addEventListener('click', () => openWechat());
// 页内触发点：[data-wechat-open]（可带 data-wechat-source 标明来路，便于比对各入口效果）
document.querySelectorAll<HTMLElement>('[data-wechat-open]').forEach((el) => {
  el.addEventListener('click', () => {
    openWechat(el.dataset.wechatSource || el.dataset.event || 'inline');
  });
});
wechatSheet?.querySelector('.wechat-sheet-close')?.addEventListener('click', closeWechat);
wechatSheet?.addEventListener('click', (event) => { if (event.target === wechatSheet) closeWechat(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeWechat(); });

// 一键复制微信号：成功与否都给明确反馈（失败时回退为选中文本，方便手动复制）
const copyWechatBtn = document.querySelector<HTMLButtonElement>('[data-copy-wechat]');
copyWechatBtn?.addEventListener('click', async () => {
  const id = document.querySelector<HTMLElement>('[data-wechat-id]')?.textContent?.trim() || '';
  if (!id) return;
  const restore = () => setTimeout(() => {
    if (copyWechatBtn) copyWechatBtn.textContent = '复制微信号';
  }, 1800);
  try {
    await navigator.clipboard.writeText(id);
    copyWechatBtn.textContent = '已复制 ✓';
    window.dispatchEvent(new CustomEvent('xiaominart:event', {
      detail: { name: 'wechat_id_copy', path: window.location.pathname },
    }));
    restore();
  } catch {
    // 剪贴板不可用（非 HTTPS 或权限被拒）时，选中文本让用户手动复制，不留死路
    const node = document.querySelector<HTMLElement>('[data-wechat-id]');
    if (node) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    copyWechatBtn.textContent = '长按上方号码复制';
    restore();
  }
});

// ── ⑥ 心愿单角标同步 ──────────────────────────────────────────
// 底栏 / 桌面导航的心愿单角标。
// 读写与订阅统一走 src/scripts/wishlist.ts —— 此前这里是第 4 份独立实现，
// 抽屉上线后必须与其他三处共享同一份逻辑，否则会出现「抽屉里移除了一件、
// 角标却还停在旧数字」的状态不同步。
const updateWishlistCount = () => {
  const count = readWishlist().length;
  document.querySelectorAll<HTMLElement>('[data-wishlist-count]').forEach((node) => {
    node.textContent = String(count);
    // 桌面端是胶囊数字，0 时整颗隐藏；移动端底栏是文字后缀，0 时留空即可
    if (node.classList.contains('wishlist-entry-count')) node.hidden = count === 0;
  });
};
updateWishlistCount();
onWishlistChange(updateWishlistCount);
