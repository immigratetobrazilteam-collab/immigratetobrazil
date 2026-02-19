# Implementation Plan

## Phase 1: Platform foundation (completed)
- Added Next.js app structure and TypeScript config.
- Added Tailwind design system with trust/government/premium visual direction.
- Implemented locale middleware and modern layouts.

## Phase 2: Core experiences (completed)
- Built modern homepage with hero, trust strip, services, process timeline, and CTA.
- Added redesigned routes for about, services, process, blog index, and contact.
- Added shared header/footer with language switcher and responsive navigation.

## Phase 3: Legacy continuity (completed)
- Added catch-all route that resolves existing static pages.
- Added parser to transform legacy HTML into modern section cards.
- Added legacy asset route for existing image inventory under `/assets`.

## Phase 4: Migration tooling (completed)
- Added route index generator script.
- Added architecture documentation and rollout guidance.

## Phase 5: Production operations (completed)
1. Added environment-driven contact channels and analytics config.
2. Added optional GA4/GTM runtime injection through shared layout.
3. Added watcher-safe development command for large-repo local execution.

## Phase 6: First-wave migration (completed)
- Migrated `/about/about-brazil/apply-brazil` into a dedicated modern route.
- Migrated `/about/about-brazil/cost-of-living-in-brazil` into a dedicated modern route.
- Migrated `/visa-consultation` into a dedicated modern route.
- Migrated `/resources-guides-brazil` into a dedicated modern route.
- Added runtime contact + analytics configuration using environment variables.

## Phase 7: Dynamic state migration (completed)
- Added canonical state dataset with all 27 federal units.
- Migrated state route families into typed dynamic pages:
  - `/[locale]/contact/contact-{state}`
  - `/[locale]/faq/faq-{state}`
  - `/[locale]/services/immigrate-to-{state}`
  - `/[locale]/blog/blog-{state}`
- Added modern policy center routes:
  - `/[locale]/policies`
  - `/[locale]/policies/{policy}`

## Phase 8: Quality automation (completed)
- Added test suite with Vitest for routing and dataset integrity.
- Added CI workflow to enforce migrate, typecheck, lint, test, and build.
- Expanded sitemap generation to include newly migrated dynamic state and policy routes.

## Phase 9: Content governance and deployment (completed)
- Added Git-backed CMS content layer for all state route families via locale templates and per-state overrides.
- Added fully populated policy content sets for EN/ES/PT under `content/cms/policies`.
- Integrated dynamic route copy rendering with CMS content modules.
- Added Decap CMS admin panel at `/admin` for non-developer editing workflows.
- Added Cloudflare Workers deployment architecture using OpenNext + Wrangler.
- Added automated Cloudflare deployment workflow for `main` branch.

## Phase 10: Operations hardening (completed)
- Added security headers middleware policy for clickjacking, MIME sniffing, referrer handling, and CSP baseline.
- Added `/api/health` and `/api/ready` runtime endpoints for uptime and readiness monitoring.
- Added `/admin` HTTP Basic Auth enforcement through runtime secrets.
- Added CMS backup export script and daily GitHub Actions backup artifact workflow.
- Added post-deploy smoke test checks in deployment workflow.

## Phase 11: Observability and SEO governance (completed)
- Added `/api/ops/summary` endpoint for operational route/CMS inventory visibility.
- Added weekly SEO audit script with JSON/Markdown reporting output.
- Added scheduled GitHub Actions workflow for weekly SEO audit artifacts.
- Extended deployment smoke checks to include ops summary endpoint coverage.

## Phase 12: Security and dependency governance (completed)
- Added workflow concurrency controls to avoid duplicate in-flight runs.
- Added weekly security audit workflow with npm vulnerability artifact export.
- Added Dependabot automation for npm and GitHub Actions dependency updates.

## Phase 13: CMS quality gate automation (completed)
- Added strict CMS validation script for structure, required fields, and slug integrity.
- Added CI gate to block merges when CMS content is malformed.
- Added deployment gate to block production deploys when CMS content validation fails.

## Phase 14: Incident recovery and workflow reliability (completed)
- Added resilient smoke check retries with cache-busting parameters.
- Added rollback deployment workflow for redeploying a chosen historical ref.
- Tuned SEO audit to fail only on core endpoint failures by default.
- Tuned security audit to report by default, with optional strict fail mode.
