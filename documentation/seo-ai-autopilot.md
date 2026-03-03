# SEO and AI Automation

This repo includes automated SEO planning/reporting and AI-assisted content workflows.

## Primary scripts
- `npm run seo:audit`
- `npm run seo:clusters`
- `npm run seo:clusters:apply`
- `npm run seo:autopilot`
- `npm run seo:psi`
- `npm run seo:weekly:report`
- `npm run seo:final`

## Rewrite automation (content quality)
- `npm run rewrite:en:dry`
- `npm run rewrite:en`
- `npm run rewrite:validate`

## Artifacts
Automation writes reports under `artifacts/*`, including:
- `artifacts/seo-audits/*`
- `artifacts/seo-clusters/*`
- `artifacts/seo-psi/*`
- `artifacts/seo-weekly/*`
- `artifacts/content-rewrite/*`

## Ollama support (optional)
Used by SEO cluster workflows when enabled.

Relevant environment variables:
- `OLLAMA_HOST`
- `OLLAMA_MODEL`
- `SEO_CLUSTER_USE_OLLAMA`
- `SEO_CLUSTER_DAYS`
- `SEO_CLUSTER_STATE_SLUGS`
- `SEO_CLUSTER_LIMIT_STATES`

## CI automation
- Workflow: `.github/workflows/seo-ai-autopilot.yml`
- Can generate changes and open/update PRs with artifacts.

## Guidance
- Run in dry/report mode first.
- Review generated changes before apply in production branches.
