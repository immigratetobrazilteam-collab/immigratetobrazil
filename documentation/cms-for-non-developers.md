# CMS Guide (Non-Developers)

This guide explains where to edit content and how to avoid breaking pages.

## 1) Where content lives

### A) Global and hub pages
- File: `content/cms/site-copy/<locale>.json`
- Main area: `managedPages`
- Use for: homepage modules, hub pages, shared labels, SEO copy blocks

### B) Most long-tail pages (services/about/blog/contact/faq/etc.)
- File pattern: `content/cms/managed-legacy/<locale>/<slug>.json`
- Use for: page title, description, sections, bullets

### C) Discover pages
- File pattern: `content/cms/discover-pages/<locale>/<slug>.json`
- Use for: hero intro, sections, FAQ, CTA, SEO fields

### D) Navigation labels/links
- File: `content/cms/navigation-map/<locale>.json`

## 2) Safe editing rules
1. Edit one page at a time.
2. Keep JSON valid (quotes, commas, brackets).
3. Do not delete required keys.
4. Do not edit generated files in `content/generated/*`.
5. Do not edit `out/*` manually.

## 3) Required checks after edits
Ask an operator/developer to run:
```bash
npm run cms:validate
npm run cms:sync-locales:check
npm run rewrite:validate
npm run test
npm run build:static
```

## 4) Locale policy
- English (`en`) is the source for most structural changes.
- If EN structure changes, other locales must stay schema-compatible.

## 5) Common mistakes to avoid
- Removing section arrays
- Renaming keys that code expects
- Copy-pasting invalid JSON
- Editing manifest/index files manually (`_manifest.json`, `_hub-index.json`, route indexes)
