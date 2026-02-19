# Content Migration Audit

Date: 2026-02-19

## Inventory Snapshot

Generated from `content/generated/route-index.json`.

- Total indexed routes: 8,102
- English routes: 8,072
- Spanish routes: 15
- Portuguese routes: 15

Top route families:

- `discover/*`: 5,441
- `services/*`: 2,409
- `about/*`: 127
- `home/*`: 28
- `blog/*`: 28
- `contact/*`: 28
- `faq/*`: 28
- `policies/*`: 7
- `accessibility`: 1
- `resources-guides-brazil`: 1

## What Was Fixed In This Pass

1. Route index generation now includes `accessibility` and keeps `home/*` paths stable.
2. Legacy route resolution now supports practical compatibility aliases for common old/new path mismatches.
3. New modern hubs were added:
   - `/{locale}/about/about-brazil`
   - `/{locale}/about/about-states`
   - `/{locale}/about/about-us`
   - `/{locale}/home`
   - `/{locale}/accessibility`
   - `/{locale}/library`
4. Header/footer navigation now exposes archive hubs and all-pages discovery.
5. Main index pages (`about`, `services`, `blog`, `contact`, `resources`) now surface legacy families directly.
6. Legacy catch-all page now includes related links and section navigation to improve discoverability.
7. Sitemap coverage expanded to include more static hubs and up to 10,000 generated routes.
8. State dynamic routes (`blog/*`, `contact/*`, `faq/*`, `services/immigrate-to-*`), policy routes, and visa consultation now use legacy-first rendering with redesigned layout.

## Remaining High-Impact Work

1. Move legacy pages from parser-rendered mode into typed, first-class React route modules only when you need custom bespoke page designs.
2. Add per-family internal-link strategy (especially `discover/*` and deep `services/*`) to avoid orphaned SEO pages.
3. Expand ES/PT content coverage beyond 15 pages each.
4. Add content QA pipeline for legacy extraction quality (heading accuracy, paragraph grouping, hero image quality).
5. Add visual regression testing for new hub pages and legacy rendering layouts.
6. Add analytics events for archive navigation usage to guide migration priority.

## Recommended Next Milestone

- Phase 3: selectively migrate only the URLs that need custom editorial layouts, while keeping the full-URL legacy-first system active for total coverage.
