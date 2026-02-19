# Cloudflare Deployment Runbook

## Architecture
- Runtime: Cloudflare Workers
- Framework adapter: OpenNext Cloudflare
- Config: `wrangler.toml`
- Deploy workflow: `.github/workflows/deploy-cloudflare.yml`

## Domain routing
Configured routes:
- `immigratetobrazil.com/*`
- `www.immigratetobrazil.com/*`

Both routes are attached to zone ID `43970a2e28129a557bfb10a575247f70`.

## Required GitHub secrets
Set in repository settings -> Secrets and variables -> Actions:
- `CLOUDFLARE_API_TOKEN`

## Required Cloudflare runtime secrets
Set in Worker settings (production environment):
- `ADMIN_BASIC_AUTH_USER`
- `ADMIN_BASIC_AUTH_PASS`

Recommended token permissions:
- `Account` -> `Cloudflare Workers Scripts:Edit`
- `Zone` -> `Workers Routes:Edit`
- `Zone` -> `Zone:Read`

## Local preview
1. Install dependencies: `npm ci`
2. Build and preview worker: `npm run preview:worker`

## Production deploy
1. Push to `main`, or run workflow manually.
2. Workflow installs, validates, and runs `npm run deploy`.
3. Workflow runs post-deploy smoke checks against:
   - `/en`
   - `/es`
   - `/pt`
   - `/api/health`
   - `/api/ready`

## Runtime hardening
- Security headers are enforced in `middleware.ts` via `lib/security-headers.ts`.
- Health endpoints:
  - `app/api/health/route.ts`
  - `app/api/ready/route.ts`
- CMS admin path `/admin` requires HTTP Basic Auth enforced by middleware.

## CMS backup automation
- Workflow: `.github/workflows/cms-backup.yml`
- Trigger: daily at `03:30 UTC` and manual dispatch
- Output: artifact upload containing `artifacts/cms-backups/<timestamp>/`

## Security note
Do not commit Cloudflare API keys or origin certificates.
If any key has been shared in plain text, rotate it in Cloudflare immediately and replace it with a scoped API token for CI.
