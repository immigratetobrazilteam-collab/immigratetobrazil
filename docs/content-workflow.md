# Content Workflow

English HTML files are now the source of truth.

## What To Edit

- Edit the checked-in English route HTML directly.
  Example: `/` maps to [index.html](/home/ash/immigratetobrazil-new/index.html) and `/about/` maps to [about/index.html](/home/ash/immigratetobrazil-new/about/index.html).
- Shared shell partials live in `partials/en/` and `partials/pt-br/`.
  - Edit `site-navigation.html`, `site-footer.html`, `utility-bar.html`, and the other files in `partials/` when you want to change sitewide shared UI.
  - Route pages now call the shared `breadcrumbs`, `sidebar-shell`, `official-resources`, and `related-links` partials at runtime instead of storing those blocks inline in every page body.
- The old content-source tree is retired. Do not use legacy source JSON/body files to regenerate English HTML.

## Commands

- `npm run sync:data`
  Refreshes search/build/supporting JSON files and synced 404 outputs from the checked-in HTML routes.
- `npm run generate:sitemap`
  Regenerates the sitemap index at `sitemap.xml`, the child XML files in `sitemaps/`, `sitemap.xsl`, and `robots.txt` from the current checked-in HTML routes.
- `npm run translate:pt`
  Rebuilds the Portuguese output from the checked-in English HTML.
- `npm run check`
  Runs the data sync and validation flow against the checked-in HTML.

## Notes

- Treat English `index.html` files as the source of truth.
- Portuguese `pt-br/...` pages remain generated output.
- Legacy English page-generation helpers and the legacy section-image generator are retired.
- Section image assets are organized by route path and section number.
  Example: `/about/about/` section 2 now maps to `assets/images/sections/about/about/section-02-.../`.
- Section image filenames now use `page-section-number-section-name-scene-keywords-brazil-bg-primary.webp`.
- `data/section-image-index.csv` is the human-readable lookup file for route, page, section number, section title, selected option, scene, and asset path.
