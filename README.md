# Immigrate to Brazil - Modern Redesign

This repository now contains a full modern framework architecture built on Next.js + TypeScript + Tailwind.

## What changed
- Replaced static-only architecture with locale-aware app routing (`/en`, `/es`, `/pt`).
- Added premium redesign system aligned to immigration/travel/trust positioning.
- Added dynamic legacy bridge so existing long-tail HTML pages remain reachable.
- Added route-index generation for scalable sitemap coverage.
- Migrated state route families into typed dynamic pages (`contact-*`, `faq-*`, `immigrate-to-*`, `blog-*`).
- Added policy center routes under `/{locale}/policies/*`.
- Added test suite + CI quality gates.
- Added Phase-9 CMS-backed content layer for state pages and policy pages.
- Added Cloudflare Workers deployment pipeline (OpenNext + Wrangler + GitHub Actions).

## Commands
- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - start built server
- `npm run lint` - lint checks
- `npm run typecheck` - TypeScript checks
- `npm run test` - run test suite
- `npm run migrate:routes` - generate `content/generated/route-index.json`
- `npm run preview:worker` - local Cloudflare Worker preview build
- `npm run deploy` - build and deploy to Cloudflare Worker

## Core directories
- `app/` - Next.js routes and layouts
- `components/` - reusable UI blocks
- `lib/` - i18n, SEO, legacy loader, typed content
- `content/curated/` - canonical data modules for migrated dynamic content
- `content/generated/` - generated route inventory
- `content/cms/` - Git-backed CMS content for state and policy copy
- `tests/` - Vitest unit tests
- `documentation/` - architecture and rollout docs

## Migration strategy
1. Keep all legacy pages accessible through `/{locale}/[...slug]`.
2. Migrate high-value pages into first-class route modules.
3. Regenerate route index as content inventory changes.
4. Phase out legacy parser once structured migration is complete.

## CI
GitHub Actions workflow at `.github/workflows/ci.yml` runs:
1. `npm ci`
2. `npm run migrate:routes`
3. `npm run typecheck`
4. `npm run lint`
5. `npm run test`
6. `npm run build`

Deployment workflow at `.github/workflows/deploy-cloudflare.yml` runs on `main`:
1. `npm ci`
2. `npm run migrate:routes`
3. `npm run typecheck`
4. `npm run test`
5. `npm run deploy`

## Environment setup
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_CONSULTATION_EMAIL`
- `NEXT_PUBLIC_CLIENT_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_LINK`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_SITE_URL`

## Cloudflare setup
1. Create Cloudflare API token with Worker and Route edit permissions.
2. Add GitHub secret `CLOUDFLARE_API_TOKEN`.
3. Verify `wrangler.toml` values for:
   - `account_id`
   - `routes` for `immigratetobrazil.com` and `www.immigratetobrazil.com`
4. Push to `main` or run deploy workflow manually.

## CMS setup
- Decap CMS admin is available at `/admin`.
- Config file: `public/admin/config.yml`.
- State content templates and overrides:
  - `content/cms/state-copy/en.json`
  - `content/cms/state-copy/es.json`
  - `content/cms/state-copy/pt.json`
- Policy content:
  - `content/cms/policies/en.json`
  - `content/cms/policies/es.json`
  - `content/cms/policies/pt.json`
