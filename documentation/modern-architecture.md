# Modern Site Architecture

## Objectives
- Replace duplicated static HTML shells with a framework-driven architecture.
- Keep legacy URL coverage while progressively migrating content.
- Standardize SEO, localization, and UI for long-term scalability.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Dynamic route index generator (`scripts/generate-route-index.mjs`)
- OpenNext Cloudflare adapter (`@opennextjs/cloudflare`)
- Wrangler deployment runtime

## Route model
- `/{locale}` for primary market pages (`en`, `es`, `pt`)
- `/{locale}/about`, `/{locale}/services`, `/{locale}/process`, `/{locale}/blog`, `/{locale}/contact`
- `/{locale}/[...slug]` as a legacy bridge for long-tail pages
- `/{locale}/contact/contact-{state}`, `/{locale}/faq/faq-{state}`, `/{locale}/services/immigrate-to-{state}`, `/{locale}/blog/blog-{state}` for migrated state content
- `/{locale}/policies` and `/{locale}/policies/{policy}` for legal pages
- `middleware.ts` redirects non-localized routes to `/en/...`

## Legacy bridge design
- The catch-all route loads existing HTML files directly from repository paths.
- It extracts title, description, headings, and paragraph blocks.
- Content is rendered inside the new design system, preserving URL reachability.
- Legacy image paths under `/assets/*` are served by `app/legacy-assets/[...file]/route.ts`.

## SEO and discoverability
- Shared metadata helper in `lib/seo.ts`
- Locale alternates (`en`, `es`, `pt`, `x-default`)
- Generated `robots.txt` and `sitemap.xml`
- Optional large-route sitemap extension through `content/generated/route-index.json`

## Content operations
- Run `npm run migrate:routes` to generate route inventory from current HTML files.
- Route index is consumed by the sitemap pipeline.
- As pages are migrated into structured content, legacy extraction can be phased out.
- Canonical state data is managed in `content/curated/states.ts` and reused across migrated route families.
- CMS-governed state templates and per-state overrides are managed in `content/cms/state-copy/*.json`.
- CMS-governed legal content is managed in `content/cms/policies/*.json`.
- Decap CMS UI is exposed via `public/admin/*` and served at `/admin`.

## Operational configuration
- Contact channels are loaded from environment variables in `lib/site-config.ts`.
- Analytics (GA4/GTM) is injected through `components/analytics.tsx` when IDs are configured.
- Use `.env.example` as baseline for production environment setup.
- Cloudflare deployment is defined in `wrangler.toml`.
- Worker build/deploy commands are provided through `npm run preview:worker` and `npm run deploy`.

## Quality gates
- Unit tests run with Vitest (`npm run test`).
- CI workflow (`.github/workflows/ci.yml`) runs: migrate routes, typecheck, lint, test, and build.
- Deploy workflow (`.github/workflows/deploy-cloudflare.yml`) validates and deploys to Cloudflare on `main`.

## Recommended production rollout
1. Deploy framework app in staging.
2. Validate locale redirects and top conversion pages.
3. Generate and verify route index.
4. Monitor crawl logs and not-found rates.
5. Migrate high-traffic legacy sections into curated pages first.
