import { parse } from 'yaml';
import {
  giftOccasions,
  giftProducts,
  giftRecipients,
  giftScenes,
  giftTierLabels,
  type GiftProduct,
} from '../data/content';

type ContentRecord = Record<string, unknown>;
const productFiles = import.meta.glob('../../content/products/*.yaml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const occasionFiles = import.meta.glob('../../content/occasions/*.yaml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const recipientFiles = import.meta.glob('../../content/recipients/*.yaml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

const readRecords = (files: Record<string, string>) => Object.entries(files).map(([path, raw]) => ({
  slug: path.split('/').pop()?.replace(/\.yaml$/, '') ?? '',
  data: parse(raw) as ContentRecord,
}));

const asList = (value: unknown) => Array.isArray(value) ? value.map(String) : [];

/**
 * Keystatic 侧可覆盖的可选 SEO 字段。
 *
 * 2026-10-28：这两个字段一直存在于 `content/occasions/*.yaml` 与
 * `content/recipients/*.yaml` 里，但类型上完全没声明，所以模板取不到、
 * TypeScript 也不报错（因为压根没读）。现在显式声明，让「有文案但没接线」
 * 这类问题在类型层就暴露出来。
 */
type SeoOverrides = { seoTitle?: string; seoDescription?: string };

export type GiftCatalog = {
  products: GiftProduct[];
  occasions: (typeof giftOccasions[number] & SeoOverrides)[];
  recipients: (typeof giftRecipients[number] & SeoOverrides)[];
  scenes: typeof giftScenes;
  tiers: typeof giftTierLabels;
};

/**
 * Single content boundary for gift-led pages.
 * Published Keystatic files override the typed seed catalog during the build.
 */
export function getGiftCatalog(): GiftCatalog {
  const products = giftProducts
    .map((fallback) => {
      const record = readRecords(productFiles).find((item) => item.slug === fallback.slug)?.data;
      if (!record || record.published === false) return record ? null : fallback;
      return {
        ...fallback,
        name: String(record.title ?? fallback.name),
        en: String(record.subtitle ?? fallback.en),
        scene: String(record.scene ?? fallback.scene),
        sceneLabel: String(record.occasion ?? fallback.sceneLabel),
        price: String(record.priceRange ?? fallback.price),
        meaning: String(record.meaning ?? fallback.meaning),
        recipient: asList(record.recipients).join('、') || fallback.recipient,
        packaging: String(record.packaging ?? fallback.packaging),
        dispatch: String(record.dispatch ?? fallback.dispatch),
        miniProgramUrl: typeof record.miniProgramUrl === 'string' && record.miniProgramUrl ? record.miniProgramUrl : undefined,
        miniProgramStatus: record.miniProgramStatus === 'ready' ? 'ready' : record.miniProgramStatus === 'unavailable' ? 'unavailable' : 'unconfigured',
        published: true,
      } satisfies GiftProduct;
    })
    .filter((product): product is GiftProduct => product !== null);

  const occasionOverrides = readRecords(occasionFiles);
  const recipientOverrides = readRecords(recipientFiles);
  // 2026-10-28 审计修复：此前只读 title / englishTitle / intro，把 YAML 里已经写好的
  // `seoDescription`（40–50 字）整个丢掉，模板只能拿 20 字的 intro 再拼一句尾巴，
  // 结果 6 个场合页 + 6 个对象页描述全部过短。现补进来，模板按
  // seoDescription → desc → intro 的优先级取用。
  const occasions = giftOccasions.map((fallback) => {
    const record = occasionOverrides.find((item) => item.slug === fallback.slug)?.data;
    return record && record.published !== false ? { ...fallback, title: String(record.title ?? fallback.title), en: String(record.englishTitle ?? fallback.en), intro: String(record.intro ?? fallback.intro), seoDescription: typeof record.seoDescription === 'string' && record.seoDescription ? record.seoDescription : undefined } : fallback;
  });
  const recipients = giftRecipients.map((fallback) => {
    const record = recipientOverrides.find((item) => item.slug === fallback.slug)?.data;
    return record && record.published !== false ? { ...fallback, title: String(record.title ?? fallback.title), en: String(record.englishTitle ?? fallback.en), intro: String(record.intro ?? fallback.intro), seoDescription: typeof record.seoDescription === 'string' && record.seoDescription ? record.seoDescription : undefined } : fallback;
  });

  return { products, occasions, recipients, scenes: giftScenes, tiers: giftTierLabels };
}

export function getGiftBySlug(slug: string) {
  return getGiftCatalog().products.find((product) => product.slug === slug);
}

export function getGiftsForScene(slugs: string[]) {
  return getGiftCatalog().products.filter((product) => slugs.includes(product.scene) || slugs.includes(product.tier));
}
