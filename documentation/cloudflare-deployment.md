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

## Security note
Do not commit Cloudflare API keys or origin certificates.
If any key has been shared in plain text, rotate it in Cloudflare immediately and replace it with a scoped API token for CI.
