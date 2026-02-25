# SEO AI Autopilot (Ollama)

This project includes an AI autopilot that can refresh SEO content clusters and state blog copy automatically.

## What it updates
- `content/cms/state-copy/{locale}.json`:
  - sets/refreshes `overrides[].blog` for selected states
- `content/cms/site-copy/{locale}.json`:
  - refreshes `blogHighlights` from the generated state set
- `artifacts/seo-clusters/<timestamp>/`:
  - writes JSON + Markdown cluster plans per locale

## Local run
1. Start Ollama (optional but recommended for AI output).
2. Run:
   - `npm run seo:clusters`
   - `npm run seo:clusters:apply`
   - `npm run seo:autopilot`

## Google Search Console DNS automation
- TXT value configured for apex record:
  - `google-site-verification=V_VZqx1NiakXTqLhWGFq83By48pnyeKglU8se9hGZIo`
- One-command upsert:
  - `npm run dns:google:verify`
- Required env:
  - `CLOUDFLARE_API_TOKEN`
- Optional env:
  - `CLOUDFLARE_ZONE_ID`
  - `CLOUDFLARE_ZONE_NAME` (default: `immigratetobrazil.com`)
  - `CLOUDFLARE_DNS_RECORD_NAME` (default: apex)
  - `CLOUDFLARE_DNS_TTL` (default: `3600`)

## Key options
- `--apply`: writes updates into CMS files
- `--days 90`: controls plan horizon
- `--states sao-paulo,rio-de-janeiro,...`: custom state set
- `--limit-states 12`: max number of states to refresh
- `--locale en,es,pt,fr`: target locales
- `--no-ollama`: deterministic fallback mode only

## Environment variables
- `OLLAMA_HOST` (default: `http://127.0.0.1:11434`)
- `OLLAMA_MODEL` (default: `llama3.1:8b`)
- `SEO_CLUSTER_USE_OLLAMA` (`false` disables Ollama usage)
- `SEO_CLUSTER_DAYS` (default: `90`)
- `SEO_CLUSTER_STATE_SLUGS` (comma-separated slugs)
- `SEO_CLUSTER_LIMIT_STATES` (default: `12`)

## GitHub automation
Workflow: `.github/workflows/seo-ai-autopilot.yml`

Weekly schedule:
1. Runs `npm run seo:autopilot`
2. Uploads `artifacts/seo-clusters/`
3. Creates or updates an automation PR with generated changes

For AI mode in GitHub Actions, configure repository secret `OLLAMA_HOST` to a reachable Ollama API endpoint.
