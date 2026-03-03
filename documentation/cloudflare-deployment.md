# Cloudflare Deployment Guide

## Deployment target
Preferred production flow is static export:
- Build: `npm run build:static`
- Output directory: `out/`

## Wrangler config
Main config: `wrangler.toml`

Important areas:
- project identity (`name`, `account_id`, routes)
- assets binding
- observability settings (`logs`, `traces`, sampling/persist)

## Pre-deploy required checks
```bash
npm run migrate:routes
npm run cms:validate
npm run cms:sync-locales:check
npm run rewrite:validate
npm run typecheck
npm run lint
npm run test
npm run build:static
```

## Deploy checklist
1. Confirm `out/` generated successfully.
2. Confirm Cloudflare secrets and account settings are correct.
3. Deploy using your CI/CD workflow.
4. Run smoke checks on localized and operational endpoints.

## Post-deploy smoke checks
- `/{locale}` for `en`, `es`, `pt`, `fr`
- `/{locale}/services`
- `/{locale}/discover`
- `/{locale}/about/about-us`
- `/{locale}/faq`
- `/{locale}/contact`
- `/api/health`
- `/api/ready`

## Notes
- Static export does not apply runtime redirects/headers from Next export mode in the same way as SSR.
- Keep deployment mode consistent with the current release strategy.
