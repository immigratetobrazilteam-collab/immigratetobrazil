# Page Editing Playbook

## 1) Map URL -> content source
Use this routing map first:
- `/{locale}/discover/...` -> `content/cms/discover-pages/<locale>/...`
- most other long-tail pages -> `content/cms/managed-legacy/<locale>/...`
- top-level/hub/shared copy -> `content/cms/site-copy/<locale>.json` (`managedPages`)

## 2) Edit content by page type

### Managed legacy page schema (common)
- `title`
- `description`
- `heading`
- `sections[]` with `{ title, paragraphs[] }`
- optional governance fields: `contentSources`, `factuality`, `editorial`, `seoV2`

### Discover page schema
- `heroIntro`
- `sections[]` with block-based structure
- `faq[]`
- `cta`
- `seo` + optional `seoV2`

### Global/hub managed copy
- `content/cms/site-copy/<locale>.json` -> `managedPages.<key>`

## 3) Validation workflow (required)
```bash
npm run migrate:routes
npm run cms:validate
npm run cms:sync-locales:check
npm run rewrite:validate
npm run test
npm run build:static
```

## 4) Local preview
```bash
npx serve out -l 4173
```
Open `http://localhost:4173`.

## 5) Adding a new nav page safely
1. Add route and content source.
2. Register link in `content/cms/navigation-map/<locale>.json`.
3. Ensure locale-aware href and valid template metadata.
4. Run full validation/build.

## 6) Troubleshooting
- Page 404: verify source file path and slug mapping.
- Locale drift failure: run `npm run cms:sync-locales` then re-check.
- Rewrite validation failure: ensure required hybrid/governance fields exist where expected.
