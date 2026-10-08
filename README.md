# xiaominART website

Astro site for `xiaominart.com` — a Chinese-first calligraphy gift brand: ready-made works, gift guidance and commissioned pieces by two makers. Warm paper canvas, editorial serif typography, restrained motion.

**Stack:** Astro (static build) + Keystatic (Git-based CMS) + Cloudflare Pages + Cloudflare Pages Functions + WorkBuddy cloud database.

> Historical note: earlier revisions of this README described an `Astro + Sanity + Vercel` setup. The site **no longer runs on Vercel and no longer reads from Sanity**. Sanity is legacy (see *Legacy* below); deployment is Cloudflare Pages. For the current deploy/ops picture read `docs/cloudflare-部署与后台说明.md`.

## Routes

Public:

- `/` — gift-led homepage (hero, gift directions, client-sharing section, co-creation process, contact).
- `/gifts/` and `/gifts/ready-made/` — gift hub and 12 ready-made calligraphy works.
- `/gifts/ready-made/[slug]/` — work detail: material, size, delivery, `sold` state, Product JSON-LD with `InStock`/`SoldOut`.
- `/gift-guide/` — recipient + occasion decision tool, FAQ, gift directions.
- `/business-gifts/` — corporate gifting directions, tiers and inquiry form.
- `/artists/`, `/artists/[slug]/` — artist index and profiles (升斗小民 · 书者 / 非遗小宁 · 传承人).
- `/about/` — brand origin, story, philosophy, makers, and the 「书者手记」creed section.
- `/occasions/[slug]/`, `/recipients/[slug]/`, `/scenes/`, `/seasons/`, `/blessings/` — context and themed entries.
- `/partners/` — collaboration directions (heritage, museum & tourism, publishing, cases).
- `/channel/[slug]/` — social-channel landing pages (e.g. Xiaohongshu).
- `/works/`, `/pricing-guide/`, `/help/`, `/contact/`, `/your-story/`, `/referral/`, `/art-direction/`, `/custom-commission/`, `/stories/`, `/wishlist/`, `/progress/`, `404`.

Functional (deliberately excluded from `sitemap.xml`):

- `/keystatic/` — CMS admin (React SPA, loads its own large bundle).
- `/admin/progress/` — internal commission-progress console.
- `/progress/` — customer progress lookup by code.
- `/wishlist/` — local wishlist page.

## API (Cloudflare Pages Functions)

| Route | Purpose | Auth |
| --- | --- | --- |
| `POST /api/lead` | Form submissions (commission / quick message / business gift) | `FORMS_ACCESS_KEY` env |
| `POST /api/event` | Behaviour events (whitelist in `docs/事件字典.md`) | `FORMS_ACCESS_KEY` env |
| `GET /api/progress?code=` | Customer progress lookup by code | `FORMS_ACCESS_KEY` env |
| `/api/admin/progress` | Internal progress entry console | `ADMIN_ACCESS_KEY` env |
| `/api/keystatic/*` | CMS read/write against the GitHub repo | GitHub OAuth |

Secrets are read from Cloudflare Pages environment variables and are **never** committed. See `docs/密钥轮换与安全头操作说明.md` and `docs/后台使用指南.md`.

## Content

Editable through Keystatic at `/keystatic/` (GitHub mode: edits commit to the repo, which triggers a rebuild):

- Singletons: `settings`, `navigation`.
- Collections: `products`, `occasions`, `recipients`, `channelPages`, `faqs`, `scenes`, `blog`, `clientStories`.

CMS entries live on disk under `content/` (`content/products/*.yaml`, `content/occasions/*`, `content/recipients/*`, `content/faqs/*`, `content/channel-pages/*`, `content/settings/*`) and are read through `src/lib/keystatic.ts`.

Site copy that is not yet CMS-driven lives in `src/data/` (`content.ts` — works, scenes, FAQ and process copy; `site.ts` — contact and global settings; `creator-creed.ts` — the 「书者手记」 creed).

## Local development

```bash
npm install
npm run dev
npm run check        # astro check — expected: 0 errors / 0 warnings
npm run build        # gen-webp preprocess + astro build
npm run check:sitemap
```

Local preview of Pages Functions requires `wrangler pages dev`; plain `npm run preview` serves the static build only.

## Deployment

Cloudflare Pages, project `xiaominart`. Two paths, both producing the same output:

- **GitHub Actions** (`.github/workflows/deploy.yml`): on push to `main` runs `npm install` → `npm run check` → `npm run build` → `npm run check:sitemap` → `wrangler pages deploy`. Type errors block deployment.
- **Manual**: `npm run deploy`.

Production host: `https://xiaominart.com` (`www` 301-redirects to the apex). Environment variables must be set for **both** Production and Preview, and any change requires a **Retry deployment** to take effect.

## Legacy

- `sanity/` and `src/lib/sanity.ts` — unused leftovers from the earlier Sanity plan; nothing imports them.
- `hugo.toml`, `layouts/`, `static/`, `config/`, `.github/workflows/hugo.yml` — pre-Astro static generation, no longer built. (Note: the `content/` directory is **not** Hugo — it is the live Keystatic content store.)
- `.vercel/` — local residue from the Vercel era; git-ignored.

## Pending owner confirmations

Real product images, materials, dimensions, packaging, prices, shipping, lead times, capacity, refunds, contact destination and media licenses must be confirmed before publishing transactional certainty. Client stories publish only after explicit authorisation (`clientStories.authorization`).
