import type { APIRoute } from 'astro';
const pages = ['', 'custom/', 'custom-commission/', 'commission/', 'inspiration/', 'artists/', 'art-gift/', 'pricing-guide/', 'faq/', 'about/', 'business-custom/', 'business/', 'blog/', 'journal/', 'contact/', 'progress/', 'referral/', 'works/', 'discover/', 'art-direction/', 'en/', 'en/custom/'];
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://www.xiaominart.com')).toString().replace(/\/$/, '');
  const body = pages.map((page) => `  <url><loc>${base}/${page}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
