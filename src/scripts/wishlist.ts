// ─────────────────────────────────────────────────────────────
// 心愿单（WO-P1-02）——全站唯一读写入口
//
// 背景：这套逻辑原本在 3 个地方各写了一遍（GiftCard.astro、
// GiftProductDetail.astro、gifts/ready-made/[slug].astro），
// 加上 Layout 底栏角标共 4 份。抽屉上线前先收敛到本模块，
// 否则「抽屉里移除一件 → 卡片按钮状态要跟着变」需要跨 4 份实现同步，
// 迟早会因为漏改一处而出现「抽屉空了、按钮还是已收藏」的鬼状态。
//
// 存储：localStorage 单 key，值是 slug 数组。只存 slug，不存快照 ——
// 商品价格/时效会变，存快照会让抽屉显示过期信息（这是刻意的取舍）。
// ─────────────────────────────────────────────────────────────

/** localStorage key。改动会使用户已有心愿单失效，不要随意更名。 */
export const WISHLIST_KEY = 'xiaominart-wishlist';

/** 读取心愿单。localStorage 被禁用或数据损坏时返回空数组，不抛异常。 */
export function readWishlist(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    // 防御：手工改过 localStorage 或旧版本写入过非数组时，退回空数组
    return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * 写入心愿单并广播变更。
 *
 * `storage` 事件只在**其他标签页**改动时触发，同页面内监听不到，
 * 因此这里手动补发一次，让同页的其他组件（卡片按钮、底栏角标、抽屉）即时同步。
 */
export function writeWishlist(items: string[]): void {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // 隐私模式 / 配额满：静默失败，UI 会因读回失败而回落到未收藏态，不至于报错弹窗
    return;
  }
  window.dispatchEvent(new StorageEvent('storage', { key: WISHLIST_KEY }));
}

/** 切换某一项的收藏状态，返回切换后是否已收藏。 */
export function toggleWishlist(slug: string): boolean {
  if (!slug) return false;
  const items = readWishlist();
  const saved = items.includes(slug);
  writeWishlist(saved ? items.filter((item) => item !== slug) : [...items, slug]);
  return !saved;
}

/** 某一项是否已收藏。 */
export function isWishlisted(slug: string): boolean {
  return readWishlist().includes(slug);
}

/** 清空心愿单。 */
export function clearWishlist(): void {
  writeWishlist([]);
}

/**
 * 订阅心愿单变化，返回取消订阅函数。
 *
 * 覆盖三条路径：
 *  1. 同页面内其他组件调用 writeWishlist（手动 StorageEvent）
 *  2. 其他标签页改动（浏览器原生 storage 事件）
 *  3. bfcache 恢复 —— 移动端返回时浏览器原样恢复旧 DOM，
 *     Safari / 微信内尤其明显，不重跑会看到过期的按钮文案。
 */
export function onWishlistChange(handler: () => void): () => void {
  window.addEventListener('storage', handler);
  window.addEventListener('pageshow', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('pageshow', handler);
  };
}
