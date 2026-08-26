# Content Workflow

English HTML files are now the source of truth.

## What To Edit

- Edit the checked-in English route HTML directly.
  Example: `/` maps to [index.html](/home/ash/immigratetobrazil-new/index.html) and `/about/` maps to [about/index.html](/home/ash/immigratetobrazil-new/about/index.html).
- Shared shell partials live in `partials/en/` and `partials/pt-br/`.
  - Edit `site-navigation.html`, `site-footer.html`, `utility-bar.html`, and the other files in `partials/` when you want to change sitewide shared UI.
  - Route pages now call the shared `breadcrumbs`, `sidebar-shell`, `official-resources`, and `related-links` partials at runtime instead of storing those blocks inline in every page body.
- The old content-source tree is retired. Do not use legacy source JSON/body files to regenerate English HTML.

## Publishing

There is no content-generation or deployment command. Edit the committed files
that need to change, commit them, and push to `main`. Cloudflare Pages serves
those files without building the project.

## Notes

- Treat English `index.html` files as the source of truth.
- Portuguese `pt-br/...` pages are committed static output and can be edited
  directly.
- Legacy English page-generation helpers and the legacy section-image generator are retired.
- Section image assets are organized by route path and section number.
  Example: `/about/about/` section 2 now maps to `assets/images/sections/about/about/section-02-.../`.
- Section image filenames now use `page-section-number-section-name-scene-keywords-brazil-bg-primary.webp`.
- `data/section-image-index.csv` is the human-readable lookup file for route, page, section number, section title, selected option, scene, and asset path.
