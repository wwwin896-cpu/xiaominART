/**
 * 博客内容源（2026-11-14 新建）
 *
 * 文章不在这套仓库里，而是在运营后台的数据库中，通过公开只读接口输出：
 *   · 列表   GET {BASE}/articles
 *   · 详情   GET {BASE}/articles/{slug}
 * BASE 由环境变量 PUBLIC_ARTICLES_API 指定（默认同域 https://xiaominart.com/api/public）。
 *
 * 两条铁律（见《内容策略与选题库》第十节）：
 *   1. 构建期拉取，正文进 HTML —— 客户端拉取的文章对搜索引擎不可见，等于白写。
 *   2. 拉不到就静默降级为 0 篇 —— 博客首页渲染空态并 noindex、详情不生成、
 *      sitemap 不输出 /blog/。「宁可少提交，也不提交一批软 404」。
 *
 * 后台「站点设置 · 博客页面已上线」开关打开后，接口才会返回文章；
 * 下一次 CI 构建时本模块即可取到，页面与 sitemap 自动跟上，无需改代码。
 */

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  en?: string;
  pillar?: string;
  keywords?: string;
  /** 渲染好的正文 HTML（后台给 markdown 则在此转好） */
  html: string;
  publishedAt?: string;
  updatedAt?: string;
};

const DEFAULT_API = 'https://xiaominart.com/api/public';

function apiBase(): string {
  const raw =
    import.meta.env.PUBLIC_ARTICLES_API?.trim() ||
    process.env.PUBLIC_ARTICLES_API?.trim() ||
    DEFAULT_API;
  return raw.replace(/\/$/, '');
}

const listCache: { promise: Promise<BlogPost[]> | null } = { promise: null };

/** 带超时的 GET；任何失败都返回 null，由调用方降级。 */
async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    // 后台统一返回 { ok: true, data: ... } 包装；裸数组/裸对象也兼容
    if (data && typeof data === 'object' && 'ok' in data) {
      const wrapped = data as { ok: boolean; data?: unknown };
      return wrapped.ok ? (wrapped.data ?? null) : null;
    }
    return data;
  } catch {
    return null;
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const pick = (o: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) if (str(o[k])) return str(o[k]);
  return '';
};

/** 字段名归一：后台字段名可能调整，这里多名字段都兜住，别让上游改名打破构建。 */
function normalize(raw: Record<string, unknown>): BlogPost | null {
  const slug = pick(raw, ['slug', 'id']).replace(/^\/|\/$/g, '');
  const title = pick(raw, ['title', 'name']);
  if (!slug || !title) return null;
  const body = pick(raw, ['body', 'content', 'html', 'markdown']);
  return {
    slug,
    title,
    seoTitle: pick(raw, ['seoTitle', 'seo_title', 'seoTitleText']) || title,
    description:
      pick(raw, ['seoDescription', 'seo_description', 'description', 'summary', 'excerpt']) ||
      '',
    en: pick(raw, ['en', 'enTitle', 'subtitle']) || undefined,
    pillar: pick(raw, ['pillar', 'category', 'column']) || undefined,
    keywords: pick(raw, ['keywords', 'keyword']) || undefined,
    html: renderBody(body),
    publishedAt: pick(raw, ['publishedAt', 'published_at', 'date', 'createdAt']) || undefined,
    updatedAt: pick(raw, ['updatedAt', 'updated_at']) || undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// 正文渲染：后台正文是 markdown（见写作规范：正文不出现 # 一级标题，
// 标题从 ## 开始）。若上游直接给 HTML 则原样透传。
// 转义在先、拼装在后，正文里即使混入裸 HTML 也不会被当成标签执行。
// ─────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMd(s: string): string {
  let out = escapeHtml(s);
  // 图片：仅接受绝对 http(s) 或站内相对路径
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, src: string) =>
    /^(https?:)?\/\//.test(src) || src.startsWith('/')
      ? `<img src="${src}" alt="${alt}" loading="lazy" />`
      : ''
  );
  // 链接（锚文本必须用页面真实名称——见写作规范）
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) =>
    /^(https?:)?\/\//.test(href) || href.startsWith('/')
      ? `<a href="${href}">${text}</a>`
      : text
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

export function renderBody(raw: string): string {
  if (!raw) return '';
  // 已经是 HTML（含块级标签）→ 透传
  if (/<(p|h[2-4]|ul|ol|figure|section)[\s>]/i.test(raw)) return raw;
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;
  const flushList = () => {
    if (!list) return;
    out.push(`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushList();
      continue;
    }
    const ul = t.match(/^[-*]\s+(.*)$/);
    const ol = t.match(/^\d+[.、]\s+(.*)$/);
    if (ul) {
      if (!list || list.tag !== 'ul') {
        flushList();
        list = { tag: 'ul', items: [] };
      }
      list.items.push(inlineMd(ul[1]));
      continue;
    }
    if (ol) {
      if (!list || list.tag !== 'ol') {
        flushList();
        list = { tag: 'ol', items: [] };
      }
      list.items.push(inlineMd(ol[1]));
      continue;
    }
    flushList();
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      // 页面 h1 是文章标题，正文小节最高从 h2 开始：# 与 ## 都归 h2
      const level = Math.max(2, Math.min(h[1].length, 4));
      out.push(`<h${level}>${inlineMd(h[2])}</h${level}>`);
      continue;
    }
    if (t.startsWith('&gt;') || t.startsWith('>')) {
      out.push(`<blockquote>${inlineMd(t.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }
    out.push(`<p>${inlineMd(t)}</p>`);
  }
  flushList();
  return out.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 构建期取数
// ─────────────────────────────────────────────────────────────

async function fetchListOnce(): Promise<BlogPost[]> {
  const data = await fetchJson(`${apiBase()}/articles`);
  const arr = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[]; articles?: unknown[] })?.items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { articles?: unknown[] })?.articles)
        ? (data as { articles: unknown[] }).articles
        : null;
  if (!arr) return [];
  const posts = arr
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
    .map(normalize)
    .filter((p): p is BlogPost => p !== null);
  // slug 去重，后写者优先（接口侧本应唯一，这里兜底）
  const seen = new Map<string, BlogPost>();
  for (const p of posts) seen.set(p.slug, p);
  return [...seen.values()];
}

/** 文章列表（构建期）。接口不可达或开关未开 → 返回空数组，页面走空态。 */
export function getBlogPosts(): Promise<BlogPost[]> {
  if (!listCache.promise) {
    listCache.promise = fetchListOnce();
  }
  return listCache.promise;
}

/** 单篇详情：优先取详情接口（正文可能比列表长），失败回退列表里的记录。 */
export async function getBlogPostDetail(slug: string): Promise<BlogPost | null> {
  const list = await getBlogPosts();
  const fromList = list.find((p) => p.slug === slug) ?? null;
  const raw = await fetchJson(`${apiBase()}/articles/${encodeURIComponent(slug)}`);
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const detail = normalize(raw as Record<string, unknown>);
    if (detail) return detail;
  }
  return fromList;
}
