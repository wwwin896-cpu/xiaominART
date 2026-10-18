// ─────────────────────────────────────────────────────────────
// 百度主动推送的「待推队列 + 进度记录」纯逻辑。
// 从 scripts/baidu-push.mjs 拆出来是为了能脱离网络/文件系统直接单测——
// 这段逻辑一旦退化（比如又变成「每次从 sitemap 头部开始」），
// 就会天天烧配额却不前进，且线上很难一眼看出来，必须有回归测试守着。
//
// 本模块**不做 I/O**：不读文件、不发请求、不打印。调用方负责落盘与输出。
// ─────────────────────────────────────────────────────────────

/** 状态文件结构版本。将来改结构时在 normalizeState 里按版本迁移。 */
export const STATE_VERSION = 1;

/**
 * @typedef {{ loc: string, lastmod: string|null }} UrlEntry
 * @typedef {{ pushedAt: string, lastmod: string|null, count: number }} UrlRecord
 * @typedef {{ version: number, site: string, updatedAt: string|null, urls: Record<string, UrlRecord> }} PushState
 */

/**
 * 解析 sitemap.xml。
 * ⚠️ 必须整块匹配 <url>…</url> 再分别取 loc/lastmod ——
 *    直接用 matchAll(/<loc>/) 会丢掉「哪个 lastmod 属于哪个 URL」的配对关系。
 * @param {string} xml
 * @returns {UrlEntry[]}
 */
export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map((m) => {
      const block = m[1];
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim() ?? '';
      const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? null;
      return { loc, lastmod };
    })
    .filter((e) => e.loc);
}

/**
 * 空状态
 * @param {string} site
 * @returns {PushState}
 */
export function emptyState(site) {
  return { version: STATE_VERSION, site, updatedAt: null, urls: {} };
}

/**
 * 校验并规范化读到的 JSON。
 * 结构不对**抛错**而不是返回空状态：静默当空会导致全量重推，白烧好几天配额。
 * @param {unknown} raw
 * @param {string} site
 * @returns {PushState}
 */
export function normalizeState(raw, site) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('状态文件为空或不是对象');
  }
  const obj = /** @type {Record<string, any>} */ (raw);
  if (!obj.urls || typeof obj.urls !== 'object' || Array.isArray(obj.urls)) {
    throw new Error('状态文件缺少 urls 字段（应为 { "url": { pushedAt, lastmod, count } }）');
  }
  // 逐条清洗：手工改坏的单条记录不该拖垮整个进度，按「未推过」处理即可
  /** @type {Record<string, UrlRecord>} */
  const urls = {};
  for (const [url, rec] of Object.entries(obj.urls)) {
    if (!rec || typeof rec !== 'object') continue;
    const r = /** @type {Record<string, any>} */ (rec);
    if (typeof r.pushedAt !== 'string') continue;
    urls[url] = {
      pushedAt: r.pushedAt,
      lastmod: typeof r.lastmod === 'string' ? r.lastmod : null,
      count: Number.isFinite(r.count) ? Number(r.count) : 1,
    };
  }
  return {
    version: STATE_VERSION,
    site: typeof obj.site === 'string' ? obj.site : site,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : null,
    urls,
  };
}

/**
 * 该 URL 是否要（重新）推送。
 * 规则：
 *   1. 从未推过                → 推
 *   2. --force                 → 推
 *   3. sitemap lastmod 变新了  → 推（页面改过，值得让百度重新抓）
 *   4. 距上次推送超过 recheckDays（默认 0=关闭）→ 推
 * @param {UrlEntry} entry
 * @param {PushState} state
 * @param {{ force?: boolean, recheckDays?: number, now?: number }} [opts]
 * @returns {boolean}
 */
export function needsRepush(entry, state, opts = {}) {
  const rec = state.urls[entry.loc];
  if (!rec) return true;
  if (opts.force) return true;
  if (entry.lastmod && rec.lastmod && entry.lastmod > rec.lastmod) return true;

  const recheckDays = opts.recheckDays ?? 0;
  if (recheckDays > 0) {
    const pushedAt = new Date(`${rec.pushedAt}T00:00:00Z`).getTime();
    const now = opts.now ?? Date.now();
    if (Number.isFinite(pushedAt) && now - pushedAt > recheckDays * 86400000) return true;
  }
  return false;
}

/**
 * 把 sitemap 条目切成「待推」和「已推过」。
 * **顺序保持 sitemap 原序**，保证多天累计的推送顺序可预期、可复现。
 * @param {UrlEntry[]} entries
 * @param {PushState} state
 * @param {{ force?: boolean, recheckDays?: number, now?: number }} [opts]
 * @returns {{ pending: UrlEntry[], alreadyDone: UrlEntry[] }}
 */
export function selectPending(entries, state, opts = {}) {
  /** @type {UrlEntry[]} */
  const pending = [];
  /** @type {UrlEntry[]} */
  const alreadyDone = [];
  for (const e of entries) {
    if (needsRepush(e, state, opts)) pending.push(e);
    else alreadyDone.push(e);
  }
  return { pending, alreadyDone };
}

/**
 * 把一批「接口已接受」的 URL 记进状态（返回新对象，不改入参）。
 * not_valid / not_same_site 里的 URL 不算成功，不能记账——否则下次会被跳过，
 * 等于永久放弃这些页面。
 * @param {PushState} state
 * @param {string[]} batch
 * @param {Record<string, any>} json 接口原始返回
 * @param {Map<string, string|null>} lastmodOf url → 推送时的 lastmod
 * @param {string} day YYYY-MM-DD
 * @returns {{ state: PushState, recorded: number, skipped: string[] }}
 */
export function applyPushed(state, batch, json, lastmodOf, day) {
  const bad = new Set([...(json?.not_valid ?? []), ...(json?.not_same_site ?? [])]);
  /** @type {Record<string, UrlRecord>} */
  const urls = { ...state.urls };
  /** @type {string[]} */
  const skipped = [];
  let recorded = 0;

  for (const url of batch) {
    if (bad.has(url)) {
      skipped.push(url);
      continue;
    }
    const prev = urls[url];
    urls[url] = {
      pushedAt: day,
      lastmod: lastmodOf.get(url) ?? null,
      count: (prev?.count ?? 0) + 1,
    };
    recorded += 1;
  }

  return {
    state: { ...state, urls, updatedAt: new Date().toISOString() },
    recorded,
    skipped,
  };
}

/**
 * 累计已推数量。只统计**仍在 sitemap 里**的 URL：
 * 已删除页面若算进分子，会出现「已推 80 / 共 77」这种让业主困惑的数字。
 * @param {PushState} state
 * @param {string[]} allUrls
 * @returns {number}
 */
export function countPushed(state, allUrls) {
  const live = new Set(allUrls);
  return Object.keys(state.urls).filter((u) => live.has(u)).length;
}
