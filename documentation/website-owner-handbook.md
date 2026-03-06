# Website Owner Handbook (Beginner-Friendly)

This handbook is for running and editing this website end-to-end as the primary owner.

## 1) First, understand the architecture in plain English

This site is a **Next.js app** with most content stored in **JSON files**.

- You usually edit content in `content/cms/...`.
- Pages in `app/[locale]/...` render that content.
- Helper loaders in `lib/...` decide fallback rules (for example: use English if Portuguese copy is missing).

Current scale (from manifests in this repo):
- Managed legacy pages: `2660`
- Discover pages: `5441`
- State guides: `27`

Supported locales:
- `en`
- `pt`

## 1.1) Single-file editing mode (your new default)

If you want one file to edit almost everything, use:
- `content/cms/master-site.json`

What this controls now:
- global site copy
- navigation map
- page-copy
- state-copy
- policies
- state-guides
- legacy-overrides
- code-managed-pages
- site + SEO settings

For massive libraries (discover + managed-legacy), this master file now supports override maps by slug:
- `discoverOverrides.pagesByLocale.<locale>.<slug>`
- `managedLegacyOverrides.pagesByLocale.<locale>.<slug>`

This keeps performance stable while still letting you edit those pages from one JSON file when needed.

## 2) Folder-by-folder map (what matters, what to ignore)

Core app folders:
- `app/`: all routes and page layouts.
- `components/`: reusable UI sections used by routes.
- `lib/`: content loaders, locale logic, route index helpers, SEO helpers.
- `content/cms/`: your editable CMS JSON content.
- `content/generated/`: generated route indexes (do not hand-edit).
- `public/`: static files, including `/admin` CMS frontend.
- `scripts/`: validation/import/automation commands.
- `tests/`: automated checks.
- `documentation/`: project docs.

Operationally noisy / usually not edited for normal content updates:
- `node_modules/`
- `.next/`
- `artifacts/`
- `backups/`
- `.legacy-snapshot/`

## 3) Exact content source by page family

Use this as your main \"where do I edit?\" reference.
If a value exists in `content/cms/master-site.json`, that value wins over the files below.

### A) Global site text and shared homepage sections

Edit:
- `content/cms/site-copy/en.json`
- `content/cms/site-copy/pt.json`

Main top-level keys you will use often:
- `brand`
- `nav`
- `hero`
- `sections`
- `cta`
- `contact`
- `footer`
- `upgradeNotice`
- `homeContentMap`
- `trustStats`
- `serviceCards`
- `processSteps`
- `blogHighlights`
- `headerNavigation`
- `footerNavigation`
- `floatingActions`
- `managedPages` (page-specific managed copy blocks)

### B) Managed page-specific copy keys (`site-copy -> managedPages`)

Edit file:
- `content/cms/site-copy/<locale>.json` under `managedPages`

Key-to-route map:
- `homePageSeo` -> home page SEO block (`/[locale]`)
- `homePageExperience` -> home page large card/link sections (`/[locale]`)
- `aboutPage` -> `/{locale}/about`
- `servicesPage` -> `/{locale}/services`
- `servicesStatePage` -> `/{locale}/services/[slug]` state/fallback UI copy
- `processPage` -> `/{locale}/process`
- `resourcesGuidesBrazilPage` -> `/{locale}/resources-guides-brazil`
- `blogHubPage` -> `/{locale}/blog`
- `faqHubPage` -> `/{locale}/faq`
- `faqStatePage` -> `/{locale}/faq/[slug]`
- `contactHubPage` -> `/{locale}/contact`
- `contactStatePage` -> `/{locale}/contact/[slug]`
- `policiesHubPage` -> `/{locale}/policies`
- `policyDetailPage` -> `/{locale}/policies/[policy]`
- `aboutBrazilHubPage` -> `/{locale}/about/about-brazil`
- `aboutStatesHubPage` -> `/{locale}/about/about-states`
- `aboutUsHubPage` -> `/{locale}/about/about-us`
- `aboutUsDetailPage` -> `/{locale}/about/about-us/[slug]`
- `aboutBrazilSubPage` -> `/{locale}/about/about-brazil/[slug]`
- `aboutBrazilStatePage` -> `/{locale}/about/about-brazil/[slug]/[state]`
- `aboutStoryPage` -> `/{locale}/about/story`
- `aboutMissionPage` -> `/{locale}/about/mission`
- `aboutValuesPage` -> `/{locale}/about/values`
- `accessibilityPage` -> `/{locale}/accessibility`
- `homeArchivePage` -> `/{locale}/home`
- `libraryPage` -> `/{locale}/library`
- `visaConsultationPage` -> `/{locale}/visa-consultation`
- `applyBrazilPage` -> `/{locale}/about/about-brazil/apply-brazil`
- `costOfLivingBrazilPage` -> `/{locale}/about/about-brazil/cost-of-living-in-brazil`
- `formspreeForm` -> labels/messages in reusable contact form component
- `aboutLegacyRedesignUi` -> themed about legacy detail pages
- `aboutUsSignatureUi` -> about-us signature page component UI text
- `legacyUi` -> sidebar/labels in legacy content renderer
- `legacyPageOverrides` -> explicit page-level overrides for legacy routes
- `legacySyntheticDocument` -> fallback text when route exists but no page file exists
- `policyEntries` -> managed policy content fallback data

### C) Legacy long-tail pages (services/about/contact/faq etc.)

Edit:
- `content/cms/managed-legacy/<locale>/<slug>.json`

Loader path:
- `lib/managed-legacy-content.ts`
- `lib/legacy-loader.ts`
- rendered by `app/[locale]/[...slug]/page.tsx` and some family pages

Important behavior:
- Locale file first, then English fallback.
- Alias slugs are resolved via `content/cms/managed-legacy/en/_manifest.json`.

### D) Discover pages

Edit:
- `content/cms/discover-pages/<locale>/<slug>.json`

Hub/index support files:
- `content/cms/discover-pages/<locale>/_hub.json`
- `content/cms/discover-pages/<locale>/_hub-index.json`
- `content/cms/discover-pages/<locale>/_labels.json`

Loader:
- `lib/discover-pages-content.ts`

Routes:
- `/{locale}/discover`
- `/{locale}/discover/[...slug]`

### E) State guides

Edit:
- `content/cms/state-guides/en.json`
- `content/cms/state-guides/pt.json`

Loader:
- `lib/state-guides-content.ts`

Routes:
- `/{locale}/state-guides`
- `/{locale}/state-guides/[slug]`

### F) State template-based copy for contact/faq/services/blog state pages

Edit:
- `content/cms/state-copy/en.json`
- `content/cms/state-copy/pt.json`

Used by:
- `lib/phase2-content.ts`
- routes under `/{locale}/contact/[slug]`, `/{locale}/faq/[slug]`, `/{locale}/services/[slug]`

### G) Policy copy file

Edit:
- `content/cms/policies/en.json`
- `content/cms/policies/pt.json`

Also can be overridden by:
- `managedPages.policyEntries` in `site-copy`.

### H) Navigation menus and footer links

Edit:
- `content/cms/navigation-map/en.json`
- `content/cms/navigation-map/pt.json`

Rendered by:
- `components/site-header.tsx`
- `components/site-footer.tsx`
- loader: `lib/navigation-map-content.ts`

### I) Formerly code-managed pages (now CMS-managed)

Edit:
- `content/cms/code-managed-pages/en.json`
- `content/cms/code-managed-pages/pt.json`

This now controls:
- Consultation page (`/{locale}/consultation`)
- Client portal (`/{locale}/client-portal`)
- Book strategy consultation (`/{locale}/book-strategy-consultation`)
- Email notice (`/{locale}/email-us-notice`)
- Search page (`/{locale}/search`)
- Payment methods component labels
- Calendly embed labels

Loader:
- `lib/code-managed-pages-content.ts`

### J) Global business/contact/settings values

Edit:
- `content/cms/settings/site-settings.json`
- `content/cms/settings/seo-settings.json`

Used by:
- `lib/site-config.ts`

Examples:
- brand logo paths
- contact emails/WhatsApp
- default Formspree endpoint
- Google site verification

## 4) Your large label list (Accessibility Switcher, Client Portal Login, Why Brazil, all visa/residency labels, etc.)

Those labels are primarily navigation and mega-menu entries, and are already CMS-driven in:
- `content/cms/navigation-map/en.json`
- `content/cms/navigation-map/pt.json`

Where each part is edited:
- Individual link labels/URLs: `registry[]`
- Header dropdown groups and ordering: `header.mega_menus[]`
- Footer groupings and labels: `footer.columns[]`

So the list you sent is editable from `content/cms/*` now:
- navigation labels in `navigation-map/*`
- page/body copy in `site-copy/*`, `code-managed-pages/*`, `managed-legacy/*`, `discover-pages/*`, `state-guides/*`

## 5) How to run and preview locally

Install and run:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/en`
- `http://localhost:3000/pt`

Static preview build (same style as deployment target):

```bash
npm run build:static
npx serve out -l 4173
```

## 6) Safe content editing workflow (do this every time)

1. Edit content JSON (or code-managed copy files listed above).
2. Validate content:

```bash
npm run cms:validate
npm run cms:sync-locales:check
npm run rewrite:validate
```

3. Run code quality checks:

```bash
npm run typecheck
npm run lint
npm test
```

4. Build:

```bash
npm run build:static
```

5. Spot-check key routes in both locales.

## 7) Fast way to find the source file for any URL

Use:

```bash
npm run url:map -- /en/your/path
```

Example:

```bash
npm run url:map -- /en/discover/brazilian-states/ac
```

This calls `scripts/url-to-content-file.mjs` and prints likely content file + source mapping.

## 8) CMS `/admin` note

Admin frontend exists at:
- `public/admin/index.html`
- `public/admin/config.yml`

Current config expects OAuth endpoint:
- `/api/admin/oauth/auth`

In this snapshot, `app/api/admin/oauth/*` directories exist but there are no route handler files inside them, so local OAuth flow may need additional setup outside this repo state.

## 9) Do-not-edit list (high risk)

Avoid manual edits in:
- `content/generated/route-index.json`
- `content/generated/route-index-lite.json`
- any `_manifest.json` unless you are running/importing generation workflows
- `.next/`, `node_modules/`, `artifacts/`, `backups/`

## 10) Ownership checklist

When you publish updates, confirm all of this:
- Content appears correctly in `en` and `pt`.
- No JSON syntax errors.
- `npm run cms:validate` passes.
- `npm test` passes.
- `npm run build:static` passes.
- Top routes load: home, about, services, contact, discover, state-guides, policies.

---

If you want, next step I can convert the remaining code-managed pages into CMS-managed keys as well, so nearly all content can be updated from `content/cms/site-copy/*.json` (no TSX edits required).
