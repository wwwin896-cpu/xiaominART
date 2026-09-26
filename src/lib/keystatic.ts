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

export type GiftCatalog = {
  products: GiftProduct[];
  occasions: typeof giftOccasions;
  recipients: typeof giftRecipients;
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
  const occasions = giftOccasions.map((fallback) => {
    const record = occasionOverrides.find((item) => item.slug === fallback.slug)?.data;
    return record && record.published !== false ? { ...fallback, title: String(record.title ?? fallback.title), en: String(record.englishTitle ?? fallback.en), intro: String(record.intro ?? fallback.intro) } : fallback;
  });
  const recipients = giftRecipients.map((fallback) => {
    const record = recipientOverrides.find((item) => item.slug === fallback.slug)?.data;
    return record && record.published !== false ? { ...fallback, title: String(record.title ?? fallback.title), en: String(record.englishTitle ?? fallback.en), intro: String(record.intro ?? fallback.intro) } : fallback;
  });

  return { products, occasions, recipients, scenes: giftScenes, tiers: giftTierLabels };
}

export function getGiftBySlug(slug: string) {
  return getGiftCatalog().products.find((product) => product.slug === slug);
}

export function getGiftsForScene(slugs: string[]) {
  return getGiftCatalog().products.filter((product) => slugs.includes(product.scene) || slugs.includes(product.tier));
}
