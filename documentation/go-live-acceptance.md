# Go-Live Acceptance Checklist

Use this before production releases and major content waves.

## A) Build and quality gates (required)
- [ ] `npm ci`
- [ ] `npm run migrate:routes`
- [ ] `npm run cms:validate`
- [ ] `npm run cms:sync-locales:check`
- [ ] `npm run rewrite:validate`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build:static`

## B) Environment and deploy readiness (required)
- [ ] Required Cloudflare and CI secrets are present.
- [ ] `wrangler.toml` routes/account/observability are correct.
- [ ] Deployment workflow completed successfully on release commit.

## C) Runtime verification (required)
- [ ] Core locale pages load: `/en`, `/es`, `/pt`
- [ ] Critical hubs load: services/discover/about/contact/faq
- [ ] Ops endpoints load (`/api/health`, `/api/ready`)

## D) Content governance (required)
- [ ] No locale drift
- [ ] Rewrite validation passed
- [ ] Editorial stale checks reviewed
- [ ] SEO artifacts reviewed for major regressions

## E) Security and recovery readiness (required)
- [ ] No leaked secrets/credentials in repo changes
- [ ] Rollback path confirmed and owner assigned
- [ ] On-call or release owner confirmed

## Sign-off
- Release SHA:
- Approved by:
- Date (UTC):
- Notes:
