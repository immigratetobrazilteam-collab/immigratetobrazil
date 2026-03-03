# Immigrate to Brazil

Production website and content platform for `immigratetobrazil.com`.

## What this repo contains
- Next.js application routes and UI (`app/`, `components/`)
- CMS-backed content system (`content/cms/*`)
- Large-scale managed content libraries:
  - `content/cms/managed-legacy/*`
  - `content/cms/discover-pages/*`
- Multi-locale support (`en`, `es`, `pt`, `fr`)
- Validation, import, SEO, and publishing automation scripts (`scripts/*`)

## Runtime and deployment model
- Local dev: Next.js app (`npm run dev`)
- Production build target for static hosting: `npm run build:static` -> `out/`
- Cloudflare config: `wrangler.toml`

## Core commands
- `npm run dev`
- `npm run migrate:routes`
- `npm run cms:validate`
- `npm run cms:sync-locales:check`
- `npm run rewrite:en:dry`
- `npm run rewrite:en`
- `npm run rewrite:validate`
- `npm run test`
- `npm run build:static`

## Content editing quick start
1. Identify URL family:
- `discover/*` -> `content/cms/discover-pages/<locale>/...`
- long-tail legacy/service/about/blog/contact/faq routes -> `content/cms/managed-legacy/<locale>/...`
- global/hub page copy -> `content/cms/site-copy/<locale>.json` (`managedPages`)
2. Edit JSON content.
3. Validate:
```bash
npm run cms:validate
npm run cms:sync-locales:check
npm run rewrite:validate
npm run test
```
4. Build and preview:
```bash
npm run build:static
npx serve out -l 4173
```

## Documentation map
- Architecture: `documentation/modern-architecture.md`
- Complete page-edit workflow: `documentation/page-editing-playbook.md`
- CMS guide (non-developers): `documentation/cms-for-non-developers.md`
- Navigation system reference: `documentation/navigation-map-reference.md`
- Deployment: `documentation/cloudflare-deployment.md`
- Launch and QA checklists: `docs/launch/*`
- Rewrite system: `documentation/content-migration-audit.md`
- SEO automation: `documentation/seo-ai-autopilot.md`
# test
