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
- Expanded CMS coverage for global site copy and migrated core page copy.
- Added Cloudflare Workers deployment pipeline (OpenNext + Wrangler + GitHub Actions).

## Commands
- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - start built server
- `npm run lint` - lint checks
- `npm run typecheck` - TypeScript checks
- `npm run test` - run test suite
- `npm run migrate:routes` - generate `content/generated/route-index.json`
- `npm run cms:validate` - validate CMS JSON structure and slug integrity
- `npm run cms:backup` - export timestamped CMS backup snapshot under `artifacts/cms-backups/`
- `npm run seo:audit` - generate SEO audit report under `artifacts/seo-audits/`
- `npm run smoke` - run production smoke checks (local or live URL)
- `npm run perf:budget` - enforce JS build-size performance budgets from `.next/build-manifest.json`
- `npm run verify:release` - run full go-live quality gate sequence in one command
- `npm run preview:worker` - local Cloudflare Worker preview build
- `npm run deploy` - build and deploy to Cloudflare Worker

## Core directories
- `app/` - Next.js routes and layouts
- `components/` - reusable UI blocks
- `lib/` - i18n, SEO, legacy loader, typed content
- `content/curated/` - canonical data modules for migrated dynamic content
- `content/generated/` - generated route inventory
- `content/cms/` - Git-backed CMS content for state, policy, site, and page copy
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
3. `npm run cms:validate`
4. `npm run typecheck`
5. `npm run lint`
6. `npm run test`
7. `npm run build`
8. `npm run perf:budget`

Security workflow at `.github/workflows/security-audit.yml` runs weekly:
1. `npm ci`
2. `npm audit --json`
3. Reports high/critical vulnerabilities (optional fail mode configurable in workflow env)
4. Uploads audit artifact

Deployment workflow at `.github/workflows/deploy-cloudflare.yml` runs on `main`:
1. `npm ci`
2. `npm run migrate:routes`
3. `npm run cms:validate`
4. `npm run typecheck`
5. `npm run test`
6. `npm run deploy`
7. `npm run smoke` against `https://immigratetobrazil.com`

Rollback workflow at `.github/workflows/rollback-cloudflare.yml` (manual):
1. Set `target_ref` (commit SHA/tag/branch)
2. Rebuild and deploy selected ref to Cloudflare
3. Run post-rollback smoke checks

## Environment setup
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_CONSULTATION_EMAIL`
- `NEXT_PUBLIC_CLIENT_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_LINK`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_BASIC_AUTH_USER`
- `ADMIN_BASIC_AUTH_PASS`
- `DECAP_GITHUB_OAUTH_CLIENT_ID`
- `DECAP_GITHUB_OAUTH_CLIENT_SECRET`
- `DECAP_GITHUB_OAUTH_SCOPE`

## Cloudflare setup
1. Create Cloudflare API token with Worker and Route edit permissions.
2. Add GitHub secret `CLOUDFLARE_API_TOKEN`.
3. Verify `wrangler.toml` values for:
   - `account_id`
   - `routes` for `immigratetobrazil.com` and `www.immigratetobrazil.com`
4. Push to `main` or run deploy workflow manually.
5. In Cloudflare Worker environment variables/secrets, set:
   - `ADMIN_BASIC_AUTH_USER`
   - `ADMIN_BASIC_AUTH_PASS`
   - `DECAP_GITHUB_OAUTH_CLIENT_ID`
   - `DECAP_GITHUB_OAUTH_CLIENT_SECRET`
   - `DECAP_GITHUB_OAUTH_SCOPE` (recommended `repo,user`)

## CMS setup
- Decap CMS admin is available at `/admin`.
- `/admin` is protected with HTTP Basic Auth from `ADMIN_BASIC_AUTH_USER` + `ADMIN_BASIC_AUTH_PASS`.
- Config file: `public/admin/config.yml`.
- OAuth endpoints for Decap are hosted at:
  - `/api/admin/oauth/auth`
  - `/api/admin/oauth/callback`
- Create a GitHub OAuth App and set:
  - Homepage URL: `https://immigratetobrazil.com/admin`
  - Authorization callback URL: `https://immigratetobrazil.com/api/admin/oauth/callback?provider=github`
- State content templates and overrides:
  - `content/cms/state-copy/en.json`
  - `content/cms/state-copy/es.json`
  - `content/cms/state-copy/pt.json`
- Policy content:
  - `content/cms/policies/en.json`
  - `content/cms/policies/es.json`
  - `content/cms/policies/pt.json`
- Global site content (navigation, hero, trust, services, process, blog highlights):
  - `content/cms/site-copy/en.json`
  - `content/cms/site-copy/es.json`
  - `content/cms/site-copy/pt.json`
- Migrated page content (apply, cost of living, resources, visa consultation):
  - `content/cms/page-copy/en.json`
  - `content/cms/page-copy/es.json`
  - `content/cms/page-copy/pt.json`

## Monitoring endpoints
- `GET /api/health` - liveness endpoint
- `GET /api/ready` - readiness endpoint (checks required runtime configuration)
- `GET /api/ops/summary` - operational summary for routes and CMS inventory health

## Go-live checklist
- Use `documentation/go-live-acceptance.md` for production release sign-off.

## CMS backups
- Scheduled workflow: `.github/workflows/cms-backup.yml` (daily + manual trigger).
- Backup artifacts are stored in GitHub Actions artifacts for 30 days.

## SEO audits
- Scheduled workflow: `.github/workflows/seo-audit.yml` (weekly + manual trigger).
- Report artifacts (JSON + Markdown) are uploaded for 30 days.

## Dependency updates
- Dependabot config: `.github/dependabot.yml`
- Weekly update PRs for:
  - npm dependencies
  - GitHub Actions workflow dependencies
