# Non-Developer Content Editing Guide

## Core rule
For almost all visible frontend text, use:
- `content/cms/site-copy/en.json`

Inside that file:
- Global UI text (header, footer, nav, hero, CTA, contact labels) is in top-level fields.
- Page-specific text is in `managedPages`.

If you only learn one thing, learn this file.

## What changed
`managedPages` is now the source-of-truth for migrated page copy.

Older `content/cms/page-copy/*.json` files are legacy and not the primary editing path.

## Fast beginner workflow
1. Edit `content/cms/site-copy/en.json`.
2. Run validation:
   ```bash
   npm run cms:validate
   ```
3. Sync locales:
   ```bash
   npm run cms:sync-locales
   ```
4. Optional machine translation for locale files:
   ```bash
   npm run cms:sync-locales:translate
   ```
5. Run local preview:
   ```bash
   npm run dev
   ```
6. Check pages in browser (example: `/en`, `/en/about`, `/en/services`).

Or run one command:
```bash
npm run content:check
```

## Exact places to edit (English)
- Header menus, dropdown labels, and quick links:
  - `headerNavigation` in `content/cms/site-copy/en.json`
- Footer menus and section labels:
  - `footerNavigation` in `content/cms/site-copy/en.json`
- Floating WhatsApp + back-to-top labels:
  - `floatingActions` in `content/cms/site-copy/en.json`
- Homepage hero/services/process/trust/blog:
  - top-level `hero`, `sections`, `cta`, `trustStats`, `serviceCards`, `processSteps`, `blogHighlights`
- Most page copy:
  - `managedPages` in `content/cms/site-copy/en.json`
- SEO controls for key pages:
  - `managedPages.homePageSeo`
  - `managedPages.aboutPage.seo`
  - `managedPages.servicesPage.seo`
  - `managedPages.resourcesGuidesBrazilPage.seo`
  - `managedPages.visaConsultationPage.seo`
  - plus metadata fallback fields under `aboutUsDetailPage`, `aboutBrazilSubPage`, and `aboutBrazilStatePage`

## Publish workflow (safe)
1. `npm run cms:validate`
2. `npm run cms:sync-locales`
3. `npm run cms:sync-locales:check`
4. `npm run content:check`
5. Commit and push

CI now blocks deploy if locale files are out of sync with English `managedPages`.

## Weekly SEO monitoring
- Run live PSI + report (uses Google API key if set):
  - `npm run seo:psi`
- Build combined weekly summary from latest SEO + PSI artifacts:
  - `npm run seo:weekly:report`

## If you edit in `/admin`
Collections to focus on:
- `Site Copy` (includes `managedPages`)
- `State Copy`
- `Policy Copy`
- `Legacy Overrides`

Admin URL:
- `/admin`

Admin is protected with HTTP Basic Auth and OAuth.

## Which file controls what
- `content/cms/site-copy/<locale>.json`
  - Header labels
  - Footer labels
  - Home hero and CTA
  - Floating actions
  - Most migrated page text under `managedPages`

- `content/cms/state-copy/<locale>.json`
  - State template copy and state-specific overrides

- `content/cms/policies/<locale>.json`
  - Policy page content

- `content/cms/legacy-overrides/<locale>.json`
  - Legacy route override labels and page overrides

## Translation notes
- `npm run cms:sync-locales` copies English `managedPages` to `es/pt/fr`.
- `npm run cms:sync-locales:translate` attempts machine translation for full `site-copy` locale files.
- Translation mode uses `LIBRETRANSLATE_URL` and optional `LIBRETRANSLATE_API_KEY`.

## Safe editing checklist
Before commit:
1. `npm run cms:validate`
2. `npm run migrate:routes`
3. `npm run smoke`
4. Optional performance + SEO scoring check:
   ```bash
   npm run seo:psi
   ```

If all pass, your content structure is in good shape.
