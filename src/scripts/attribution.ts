// ─────────────────────────────────────────────────────────────
// 渠道归因（UTM / referrer → 会话级渠道字段）
//
// 为什么需要：此前事件链路只上报「哪个页面、哪个按钮」，不带「从哪来」。
// 结果是小民好礼的详情浏览量有了，却分不清来自小红书、微信转发、线下扫码
// 还是自然搜索 —— 渠道投放无法评估，等于只有结果没有原因。
//
// 设计取舍：
//   · **只存 sessionStorage，不设 Cookie**。归因只需要「这一次访问从哪来」，
//     跨会话记住来源属于追踪，会把一件纯统计的事变成需要额外同意的事。
//   · **会话内首触优先**：带 utm 的落地页覆盖；之后同会话内点站内链接
//     （无 utm）不覆盖，避免「首页 → 详情页」把来源洗成 direct。
//   · 归一成 6 个渠道枚举：小红书 / 微信 / 线下扫码 / 自然搜索 / 外链 / 直接访问。
//     原始 utm_source 一并保留，便于细看具体物料。
//
// 线下物料的约定（二维码/卡片/展签）：
//   https://xiaominart.com/?utm_source=offline&utm_medium=qr&utm_campaign=<物料名>
//   物料名建议：museum-a / hotel-b / exhibition-2026-spring
// ─────────────────────────────────────────────────────────────

/** 归一的渠道枚举。加值时必须同步 docs/数据分析接入指南.md 的渠道表。 */
export type Channel =
  | 'xiaohongshu' // 小红书
  | 'wechat'      // 微信（含公众号、朋友圈、会话转发）
  | 'offline'     // 线下扫码（展签、卡片、包装、门店）
  | 'search'      // 自然搜索
  | 'referral'    // 其他站外链接
  | 'direct'      // 直接访问 / 无法判定
  | 'internal';   // 站内跳转（不该出现在首触里，保留用于排查）

export interface Attribution {
  /** 归一渠道 */
  ch: Channel;
  /** 原始 utm_source / referrer 主机名 */
  src: string;
  /** utm_medium */
  medium: string;
  /** utm_campaign */
  cmp: string;
  /** utm_content（同一渠道下的不同素材） */
  content: string;
  /** utm_term（搜索关键词，多为 (not provided)） */
  term: string;
  /** 落地路径（首次带归因进入的路径） */
  landing: string;
  /** 采集时间戳（ms） */
  ts: number;
}

const KEY = 'xm-attribution';

/** 搜索 / 小红书 / 微信等已知来源的域名特征。命中即归一，不依赖 utm 是否存在。 */
const HOST_RULES: Array<[RegExp, Channel]> = [
  [/xiaohongshu\.com|xhslink\.com|xiaohongshu\.cn/i, 'xiaohongshu'],
  [/weixin\.qq\.com|wechat\.com|weixin\.com|mp\.weixin\.qq\.com/i, 'wechat'],
  [/baidu\.com|google\.|bing\.com|sogou\.com|so\.com|sm\.cn|yandex\.|duckduckgo\.com/i, 'search'],
];

/** utm_source / utm_medium 的自然语言特征（业主会手填中文，不能只认英文枚举）。 */
function classifySource(source: string, medium: string, host: string): Channel {
  const s = `${source} ${medium}`.toLowerCase();
  if (/xhs|xiaohongshu|小红书|redbook|rednote/.test(s)) return 'xiaohongshu';
  if (/wechat|weixin|wx|微信|公众号|朋友圈|视频号/.test(s)) return 'wechat';
  if (/offline|qr|线下|物料|展签|扫码|门店|包装|卡片/.test(s)) return 'offline';
  if (/search|organic|seo|baidu|google|bing|sogou|so|搜索|自然/.test(s)) return 'search';
  if (/referral|link|外链/.test(s)) return 'referral';
  for (const [pattern, channel] of HOST_RULES) {
    if (host && pattern.test(host)) return channel;
  }
  if (host) return 'referral';
  return 'direct';
}

/** 安全读 sessionStorage：隐私模式 / 被策略禁用时返回 null，不抛错。 */
function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (!parsed || typeof parsed !== 'object' || !parsed.ch) return null;
    return {
      ch: parsed.ch as Channel,
      src: String(parsed.src || ''),
      medium: String(parsed.medium || ''),
      cmp: String(parsed.cmp || ''),
      content: String(parsed.content || ''),
      term: String(parsed.term || ''),
      landing: String(parsed.landing || ''),
      ts: Number(parsed.ts) || 0,
    };
  } catch {
    return null;
  }
}

function writeStored(value: Attribution): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* 忽略：归因失败不影响统计本身，事件仍会以 direct 上报 */
  }
}

/**
 * 采集归因。每次页面加载调用一次即可（幂等）。
 *
 * 覆盖规则：
 *   1. 本次 URL 带 utm_* 参数 → 覆盖（新的一次投放落地）
 *   2. 本次无 utm 且已有记录 → 保留首触
 *   3. 本次无 utm 且无记录 → 用 referrer 判定；站内跳转记为 internal，
 *      但若来源是站内则视为「无有效来源」，落 direct
 */
export function captureAttribution(): Attribution {
  const now = Date.now();
  const params = new URLSearchParams(window.location.search);
  const pick = (key: string) => (params.get(`utm_${key}`) || '').trim().slice(0, 80);
  const source = pick('source');
  const medium = pick('medium');
  const campaign = pick('campaign');
  const content = pick('content');
  const term = pick('term');
  const hasUtm = Boolean(source || medium || campaign || content || term);

  let host = '';
  try {
    const ref = document.referrer;
    if (ref) host = new URL(ref).hostname.replace(/^www\./, '');
  } catch {
    host = '';
  }
  // 站内跳转不算来源：host 与当前站点相同时清空，交给「保留首触」分支处理
  const sameSite = host && host === window.location.hostname.replace(/^www\./, '');

  const stored = readStored();
  if (!hasUtm && stored) return stored;

  const attribution: Attribution = {
    ch: sameSite ? 'internal' : classifySource(source, medium, host),
    src: source || host || '',
    medium,
    cmp: campaign,
    content,
    term,
    landing: window.location.pathname,
    ts: now,
  };
  // 站内跳转且此前无归因 → 记为 direct（不是「从自己来的」）
  if (attribution.ch === 'internal') attribution.ch = 'direct';
  writeStored(attribution);
  return attribution;
}

/** 读取当前会话归因；未采集过时返回 direct，不触发写入。 */
export function getAttribution(): Attribution {
  return (
    readStored() || {
      ch: 'direct',
      src: '',
      medium: '',
      cmp: '',
      content: '',
      term: '',
      landing: typeof window === 'undefined' ? '' : window.location.pathname,
      ts: 0,
    }
  );
}

/**
 * 把归因压成 4 个短字段，附在每条事件上。
 *
 * 字段名刻意用短名（ch/src/cmp/lp）：事件体上限 4KB，长字段名会挤占
 * 内容空间，而这条链路是「量小但字段多」的场景。
 */
export function attributionFields(): Record<string, string> {
  const a = getAttribution();
  const fields: Record<string, string> = { ch: a.ch };
  if (a.src) fields.src = a.src;
  if (a.cmp) fields.cmp = a.cmp;
  if (a.landing) fields.lp = a.landing;
  return fields;
}
