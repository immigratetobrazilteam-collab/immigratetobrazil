# Content Workflow

English pages now live in `content/en/` and generate the checked-in HTML output.

## What To Edit

- Global English site settings live in `content/en/about/about.json`.
- The home page lives in `content/en/routes/root/`.
- Any other route maps directly to `content/en/routes/...`.
  Example: `/insights/blog/` maps to `content/en/routes/insights/blog/`.
- Each route folder has:
  - `page.json` for metadata, social tags, runtime config, and page-specific schema.
  - `page.json` also stores route shell data under `shell` for runtime-loaded breadcrumbs, sidebar content, official resources, and related links.
  - `body.html` for the rendered body markup.
- Shared shell partials live in `partials/en/` and `partials/pt-br/`.
  - Edit `site-navigation.html`, `site-footer.html`, `utility-bar.html`, and the other files in `partials/` when you want to change sitewide shared UI.
  - Route pages now call the shared `breadcrumbs`, `sidebar-shell`, `official-resources`, and `related-links` partials at runtime instead of storing those blocks inline in every page body.

## Commands

- `npm run generate:content`
  Regenerates English `index.html` files from `content/en/...`.
- `npm run sync:data`
  Regenerates English HTML and refreshes search/build/supporting JSON files.
- `npm run generate:sitemap`
  Regenerates `sitemap.xml` and `robots.txt` from the current checked-in HTML routes.
- `npm run images:sections`
  Scans `content/en/routes/...` and generates the site-wide section query/image manifests.
- `npm run images:sections:bootstrap`
  Downloads and refreshes the local curated Brazil place library used to reduce section-image repetition site-wide.
- `npm run images:sections:download`
  Runs the same section-image pipeline with provider searches and local asset downloads enabled.
- `npm run translate:pt`
  Regenerates English HTML first, then rebuilds the Portuguese output.
- `npm run check`
  Runs the full English generation, data sync, and validation flow.

## Notes

- Treat English `index.html` files as generated output.
- Portuguese `pt-br/...` pages remain generated output as well.
- Section image assets are organized by route path and section number.
  Example: `/about/about/` section 2 now maps to `assets/images/sections/about/about/section-02-.../`.
- Section image filenames now use `page-section-number-section-name-scene-keywords-brazil-bg-primary.webp`.
- `data/section-image-index.csv` is the human-readable lookup file for route, page, section number, section title, selected option, scene, and asset path.
- If you ever need to re-bootstrap the content tree from the current English HTML, run `npm run migrate:content`.
- If you ever need to re-extract the route shell blocks from English route bodies into `page.json`, run `npm run extract:route-shell`.
