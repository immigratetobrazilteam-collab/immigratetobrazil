# Content Editing Guide (Plain-English)

This guide explains exactly where to edit text, links, buttons, and forms in this project.

## 1) The Fast Mental Model
- `app/[locale]/*`: page structure/layout for each route.
- `components/*`: reusable UI blocks (header, footer, forms, CTAs).
- `content/cms/site-copy/<locale>.json`: homepage/global copy (hero, CTA section, footer text, etc).
- `content/cms/navigation-map/<locale>.json`: header/footer menu labels + link targets.
- `content/generated/route-index-lite.json`: known content slugs (generated content index).

Locales:
- English: `en`
- Portuguese: `pt`

## 2) Edit Header/Footer Menus and Links
Files:
- `content/cms/navigation-map/en.json`
- `content/cms/navigation-map/pt.json`

What to edit:
- `registry[]`: actual link labels and destinations.
- `header.mega_menus[]`: top menu headings + dropdown sections.
- `footer.columns[]`: footer column titles and items.
- `footer.search`: search placeholder/button text.

Rule:
- Keep internal links as path-only values, like `/consultation`.

## 3) Edit Homepage + Global CTA Text
Files:
- `content/cms/site-copy/en.json`
- `content/cms/site-copy/pt.json`

Main keys you will edit often:
- `hero.*`
- `cta.*`
- `footer.*`
- `upgradeNotice.*`

## 4) Edit/New Form Endpoints
Current important pages and endpoints:
- Client portal: `app/[locale]/client-portal/page.tsx`
- Consultation page: `app/[locale]/consultation/page.tsx`
- Book strategy page: `app/[locale]/book-strategy-consultation/page.tsx`
- Email notice page: `app/[locale]/email-us-notice/page.tsx`

Reusable form component:
- `components/formspree-dynamic-form.tsx`

If you need to swap endpoint:
1. Open target page file.
2. Change the `const ..._ENDPOINT` value.
3. Keep field names stable unless you intentionally change submission schema.

## 5) Accessibility Panel
Files:
- `components/accessibility-tools.tsx`
- `app/globals.css`
- `app/[locale]/layout.tsx`
- `components/site-header.tsx`

What these do:
- Header button opens panel.
- Settings saved per browser session.
- CSS classes apply text size, contrast, motion reduction, etc.

## 6) How “Missing Link Content” Is Handled
Files:
- `lib/static-export.ts`
- `lib/legacy-loader.ts`
- `app/[locale]/[...slug]/page.tsx`

Behavior:
- Legacy/catch-all routes are statically generated.
- Navigation slugs are included in generation.
- If content is missing, a synthetic fallback page is generated so links do not dead-end.

## 7) Safe Editing Workflow
1. Edit content/code.
2. Run checks:
```bash
npm run typecheck
npm run lint
npm run build
```
3. If build passes, preview locally:
```bash
npm run dev
```
4. Test both languages: `/en/...` and `/pt/...`.

## 8) Git Workflow (when ready)
```bash
git status
git add -A
git commit -m "Update content/routes/forms"
git push origin main
```

If push fails with SSH/auth errors, fix your local GitHub auth key first.
