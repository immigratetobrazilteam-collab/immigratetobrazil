# Modern Architecture

## 1) System overview
The site is a locale-aware Next.js application backed by JSON content stores and generated route indices. Most page content is data-driven, not hardcoded in components.

Primary concerns:
- route rendering
- content storage and validation
- locale fallback behavior
- static output for deployment

## 2) Major layers

### App/render layer
- Routes: `app/[locale]/*`
- Shared UI: `components/*`
- Content loaders: `lib/*`

### Content layer
- Global and page-level managed copy: `content/cms/site-copy/<locale>.json`
- Managed legacy pages: `content/cms/managed-legacy/<locale>/**/*.json`
- Discover pages: `content/cms/discover-pages/<locale>/**/*.json`
- State templates/overrides: `content/cms/state-copy/<locale>.json`
- Policies: `content/cms/policies/<locale>.json`
- Navigation source of truth: `content/cms/navigation-map/<locale>.json`

### Generated/index artifacts
- Route indexes: `content/generated/route-index.json`, `route-index-lite.json`
- Build output: `out/`
- Operational/SEO/content artifacts: `artifacts/*`

## 3) Content delivery model

### Managed legacy route family
`app/[locale]/[...slug]/page.tsx` resolves content via:
1. `lib/managed-legacy-content.ts` (file-backed pages)
2. `lib/legacy-loader.ts` (overrides + fallback synthesis)

### Discover route family
`app/[locale]/discover/[...slug]/page.tsx` resolves content via:
- `lib/discover-pages-content.ts`

### Global/hub routes
Hub and top-level pages consume `site-copy` `managedPages` through:
- `lib/site-cms-content.ts`

## 4) Locale and fallback behavior
- Supported locales: `en`, `pt`
- English is canonical fallback for many content domains
- Locale shape consistency is enforced with `cms:sync-locales:check`

## 5) Validation and quality gates
- Structural CMS validation: `npm run cms:validate`
- Rewrite quality validation: `npm run rewrite:validate`
- Route generation: `npm run migrate:routes`
- Tests: `npm run test`
- Static build verification: `npm run build:static`

## 6) Deployment model
- Preferred delivery: static export (`out/`) after `npm run build:static`
- Cloudflare configuration in `wrangler.toml`
