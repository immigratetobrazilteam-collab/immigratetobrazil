# Phase 16: Go-Live Acceptance Checklist

Use this checklist before launch, after major platform changes, and before high-risk deploy windows.

## A. Quality gate (required)
- [ ] Run `npm ci`
- [ ] Run `npm run verify:release`
- [ ] Confirm all checks pass:
  - route index generation
  - CMS validation
  - typecheck
  - lint
  - tests
  - production build
  - performance budget

## B. Cloudflare and deploy readiness (required)
- [ ] `CLOUDFLARE_API_TOKEN` exists in GitHub Actions secrets.
- [ ] Cloudflare Worker runtime secrets are set:
  - `ADMIN_BASIC_AUTH_USER`
  - `ADMIN_BASIC_AUTH_PASS`
- [ ] `wrangler.toml` target account and routes match production zone.
- [ ] Deploy workflow (`Deploy Cloudflare Worker`) completed successfully on `main`.

## C. Production runtime validation (required)
- [ ] Smoke endpoint checks pass on production:
  - `/en`
  - `/es`
  - `/pt`
  - `/api/health`
  - `/api/ready`
  - `/api/ops/summary`
- [ ] `/admin` requires HTTP Basic Auth in production.
- [ ] Locale routing and fallback behavior are correct for non-localized paths.

## D. Governance and operations (required)
- [ ] CI workflow is green on latest commit.
- [ ] CMS backup workflow completed in last 24 hours or manual run completed.
- [ ] SEO audit workflow completed in last scheduled window.
- [ ] Security audit workflow completed and reviewed.

## E. Security and incident readiness (required)
- [ ] No credentials are committed in repository history.
- [ ] If any credentials were shared in plaintext, rotated in provider console.
- [ ] Rollback workflow (`rollback-cloudflare.yml`) tested with known-good `target_ref`.
- [ ] On-call contact and rollback owner confirmed for release window.

## Sign-off
- Release candidate SHA:
- Approved by:
- Date (UTC):
- Notes:
