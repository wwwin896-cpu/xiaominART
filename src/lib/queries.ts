export const siteSettingsQuery = `*[_type == "siteSettings"][0]{brandName, brandNameZh, primaryClaim, secondaryClaim, defaultSeo, navigation, disclaimer}`;
export const blessingsQuery = `*[_type == "blessing"]|order(_createdAt asc){title, slug, pinyin, literalMeaning, culturalMeaning, scenarios, cautions, seo}`;
export const workBySlugQuery = `*[_type == "work" && slug.current == $slug][0]{title, slug, workCode, status, deliveryType, summary, story, materials, dimensions, process, evidence, media, variants, leadCta, isConceptVisual, seo}`;
export const faqQuery = `*[_type == "faqEntry" && published == true]|order(order asc){question, answer, category}`;
