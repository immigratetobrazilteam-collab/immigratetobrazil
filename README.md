# Immigrate to Brazil - Modern Redesign

This repository now contains a full modern framework architecture built on Next.js + TypeScript + Tailwind.

## What changed
- Replaced static-only architecture with locale-aware app routing (`/en`, `/es`, `/pt`, `/fr`).
- Added premium redesign system aligned to immigration/travel/trust positioning.
- Added dynamic legacy bridge so existing long-tail HTML pages remain reachable.
- Added route-index generation for scalable sitemap coverage.
- Migrated state route families into typed dynamic pages (`contact-*`, `faq-*`, `immigrate-to-*`, `blog-*`).
- Added policy center routes under `/{locale}/policies/*`.
- Added test suite + CI quality gates.
- Added Phase-9 CMS-backed content layer for state pages and policy pages.
- Expanded CMS coverage for global site copy and migrated page-level copy through `site-copy -> managedPages`.
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
- `npm run legacy:snapshot` - materialize legacy HTML snapshot from git (`HEAD~1`) into `.legacy-snapshot/`
- `npm run content:reimport:from-legacy-ref` - rebuild managed content from legacy snapshot (`state-guides` + `discover` + `managed-legacy`)
- `npm run content:retention:audit` - compare legacy-source text vs managed JSON text and export retention report
- `npm run cms:sync-locales` - copy English `managedPages` into locale files (`es`, `pt`, `fr`)
- `npm run cms:sync-locales:check` - fail if locale `managedPages` drift from English schema/content
- `npm run cms:sync-locales:translate` - machine-translate English `site-copy` content into locale files (`es`, `pt`, `fr`)
- `npm run content:check` - run your full content publishing checklist (`cms:validate` + locale sync + route index + smoke)
- `npm run cms:backup` - export timestamped CMS backup snapshot under `artifacts/cms-backups/`
- `npm run seo:audit` - generate SEO audit report under `artifacts/seo-audits/`
- `npm run seo:env:check` - verify required/recommended SEO env vars (`NEXT_PUBLIC_SITE_URL`, `PAGESPEED_API_KEY`)
- `npm run seo:clusters` - generate 90-day SEO cluster plans under `artifacts/seo-clusters/` (AI via Ollama when available)
- `npm run seo:clusters:apply` - generate clusters and apply AI blog overrides to `content/cms/state-copy/*.json` + `content/cms/site-copy/*.json`
- `npm run seo:psi` - run Google PageSpeed Insights checks on key pages (mobile + desktop)
- `npm run seo:final` - run canonical + structured-data + sitemap sample final SEO checks
- `npm run seo:weekly:report` - generate weekly prioritized SEO/PSI summary from latest artifacts
- `npm run seo:autopilot` - run full SEO cluster autopilot (`seo:clusters:apply` + `cms:validate`)
- `npm run env:validate` - run one-shot environment/API integration checks from `.env.local`
- `npm run indexnow:key` - generate `public/<INDEXNOW_API_KEY>.txt` key file for IndexNow verification
- `npm run indexnow:submit -- --url=/en/about,/en/services` - submit specific URLs to IndexNow
- `npm run indexnow:submit:sitemap` - submit a sitemap-derived URL set to IndexNow (limit 200)
- `npm run dns:google:verify` - upsert Google Search Console TXT verification record in Cloudflare DNS
- `npm run smoke` - run production smoke checks (local or live URL)
- `npm run visual:smoke` - run Playwright visual smoke checks and capture screenshots for key route hubs
- `npm run perf:budget` - enforce JS build-size performance budgets from Next.js manifests/chunks
- `npm run editorial:check` - generate stale-content editorial QA report from review cadence metadata
- `npm run production:readiness` - run consolidated production readiness gate locally
- `npm run verify:release` - run full go-live quality gate sequence in one command
- `npm run preview:worker` - local Cloudflare Worker preview build
- `npm run deploy` - build and deploy to Cloudflare Worker

## Core directories
- `app/` - Next.js routes and layouts
- `components/` - reusable UI blocks
- `lib/` - i18n, SEO, legacy loader, typed content
- `content/curated/` - canonical data modules for migrated dynamic content
- `content/generated/` - generated route inventory
- `content/cms/` - Git-backed CMS content for state, policy, site copy, and legacy overrides
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
4. `npm run cms:sync-locales:check`
5. `npm run typecheck`
6. `npm run lint`
7. `npm run test`
8. `npm run build`
9. `npm run perf:budget`

Security workflow at `.github/workflows/security-audit.yml` runs weekly:
1. `npm ci`
2. `npm audit --json`
3. Reports high/critical vulnerabilities (optional fail mode configurable in workflow env)
4. Uploads audit artifact

Deployment workflow at `.github/workflows/deploy-cloudflare.yml` runs on `main`:
1. `npm ci`
2. `npm run migrate:routes`
3. `npm run cms:validate`
4. `npm run cms:sync-locales:check`
5. `npm run typecheck`
6. `npm run test`
7. `npm run dns:google:verify`
8. `npm run deploy`
9. `npm run smoke` against `https://immigratetobrazil.com`

Rollback workflow at `.github/workflows/rollback-cloudflare.yml` (manual):
1. Set `target_ref` (commit SHA/tag/branch)
2. Rebuild and deploy selected ref to Cloudflare
3. Run post-rollback smoke checks

SEO AI autopilot workflow at `.github/workflows/seo-ai-autopilot.yml` runs weekly:
1. `npm ci`
2. `npm run seo:autopilot`
3. Uploads `artifacts/seo-clusters/` artifact
4. Creates/updates an automated PR with refreshed CMS SEO copy

## Environment setup
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_CONSULTATION_EMAIL`
- `NEXT_PUBLIC_CLIENT_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_LINK`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_SITE_URL`
- `PAGESPEED_API_KEY` (recommended for `npm run seo:psi` to avoid shared API quota limits)
- `INDEXNOW_API_KEY` (required for IndexNow key file + URL submission)
- `SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN` (error tracking)
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (optional source-map upload)
- `CLOUDFLARE_ZONE_ID` (optional; used by `npm run dns:google:verify`)
- `CLOUDFLARE_ZONE_NAME` (optional; defaults to `immigratetobrazil.com`)
- `CLOUDFLARE_DNS_RECORD_NAME` (optional; defaults to apex record)
- `CLOUDFLARE_DNS_TTL` (optional; defaults to `3600`)
- `ADMIN_BASIC_AUTH_USER`
- `ADMIN_BASIC_AUTH_PASS`
- `DECAP_GITHUB_OAUTH_CLIENT_ID`
- `DECAP_GITHUB_OAUTH_CLIENT_SECRET`
- `DECAP_GITHUB_OAUTH_SCOPE`

## Analytics events
GA4 event tracking is wired for high-intent actions:
- `cta_click` for primary conversion CTAs (hero, header consultation button, CTA cards)
- `contact_click` for email and WhatsApp actions
- `generate_lead` for successful form submissions
- `form_validation_error` for client-side form validation failures
- `form_submit_error` for failed form submission attempts
- `form_spam_blocked` for anti-spam blocked submissions

## Cloudflare setup
1. Create Cloudflare API token with Worker and Route edit permissions.
2. Add GitHub secret `CLOUDFLARE_API_TOKEN`.
3. Optional for deterministic zone targeting: set GitHub variable `CLOUDFLARE_ZONE_ID`.
4. Verify `wrangler.toml` values for:
   - `account_id`
   - `routes` for `immigratetobrazil.com` and `www.immigratetobrazil.com`
5. Push to `main` or run deploy workflow manually.
6. In Cloudflare Worker environment variables/secrets, set:
   - `ADMIN_BASIC_AUTH_USER`
   - `ADMIN_BASIC_AUTH_PASS`
   - `DECAP_GITHUB_OAUTH_CLIENT_ID`
   - `DECAP_GITHUB_OAUTH_CLIENT_SECRET`
   - `DECAP_GITHUB_OAUTH_SCOPE` (recommended `repo,user`)

## CMS setup
- Decap CMS admin is available at `/admin`.
- Non-developer editing guide: `documentation/cms-for-non-developers.md`
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
  - `content/cms/state-copy/fr.json`
- Policy content:
  - `content/cms/policies/en.json`
  - `content/cms/policies/es.json`
  - `content/cms/policies/pt.json`
  - `content/cms/policies/fr.json`
- Global site content (navigation, hero, trust, services, process, blog highlights):
  - `content/cms/site-copy/en.json`
  - `content/cms/site-copy/es.json`
  - `content/cms/site-copy/pt.json`
  - `content/cms/site-copy/fr.json`
- Managed page-level copy source-of-truth lives under:
  - `content/cms/site-copy/<locale>.json -> managedPages`
- Locale sync tooling:
  - `npm run cms:sync-locales`
  - `npm run cms:sync-locales:translate`
- Legacy route overrides and UI labels:
  - `content/cms/legacy-overrides/en.json`
  - `content/cms/legacy-overrides/es.json`
  - `content/cms/legacy-overrides/pt.json`
  - `content/cms/legacy-overrides/fr.json`
- Site operational settings (contact channels, brand assets, Formspree endpoint):
  - `content/cms/settings/site-settings.json`

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

## SEO weekly report
- Scheduled workflow: `.github/workflows/seo-weekly-report.yml` (weekly + manual trigger).
- Runs SEO audit + PageSpeed checks and builds a prioritized combined report artifact.

## Production readiness checks
- Scheduled workflow: `.github/workflows/production-readiness.yml` (weekly + manual trigger).
- Runs editorial stale-content QA, visual smoke screenshots, final SEO checks, PageSpeed checks, and sitemap submission.

## PageSpeed API key setup
1. Create/select a Google Cloud project and enable `PageSpeed Insights API`.
2. Create an API key (restrict by API and app as needed).
3. Add it locally:
   - `PAGESPEED_API_KEY=...` in `.env.local`
4. Add it in GitHub:
   - Repository secret `PAGESPEED_API_KEY`
5. Verify setup:
   - `npm run seo:env:check`
6. Run live checks:
   - `npm run seo:psi`

## IndexNow quick setup
1. Set `NEXT_PUBLIC_SITE_URL` and `INDEXNOW_API_KEY` in `.env.local`.
2. Generate hosted key file:
   - `npm run indexnow:key`
3. Deploy so this file is public at:
   - `https://<your-domain>/<INDEXNOW_API_KEY>.txt`
4. Submit changed URLs:
   - `npm run indexnow:submit -- --url=/en/about,/en/services`
5. Or submit a sitemap batch:
   - `npm run indexnow:submit:sitemap`

## SEO AI autopilot setup
- Optional (recommended): set GitHub secret `OLLAMA_HOST` to your reachable Ollama endpoint (example: `http://<your-server>:11434`).
- Optional: set GitHub repository variable `OLLAMA_MODEL` (example: `llama3.1:8b`).
- Optional: set `SEO_CLUSTER_STATE_SLUGS` (comma-separated state slugs) and `SEO_CLUSTER_LIMIT_STATES`.
- If Ollama is unreachable, autopilot falls back to deterministic templates so automation still runs.
- Full runbook: `documentation/seo-ai-autopilot.md`

## Dependency updates
- Dependabot config: `.github/dependabot.yml`
- Weekly update PRs for:
  - npm dependencies
  - GitHub Actions workflow dependencies
