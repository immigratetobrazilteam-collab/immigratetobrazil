# Content Workflow

English pages now live in `content/en/` and generate the checked-in HTML output.

## What To Edit

- Global English site settings live in `content/en/about/about.json`.
- The home page lives in `content/en/routes/root/`.
- Any other route maps directly to `content/en/routes/...`.
  Example: `/insights/blog/` maps to `content/en/routes/insights/blog/`.
- Each route folder has:
  - `page.json` for metadata, social tags, runtime config, and page-specific schema.
  - `body.html` for the rendered body markup.

## Commands

- `npm run generate:content`
  Regenerates English `index.html` files from `content/en/...`.
- `npm run sync:data`
  Regenerates English HTML and refreshes search/build/supporting JSON files.
- `npm run translate:pt`
  Regenerates English HTML first, then rebuilds the Portuguese output.
- `npm run check`
  Runs the full English generation, data sync, and validation flow.

## Notes

- Treat English `index.html` files as generated output.
- Portuguese `pt-br/...` pages remain generated output as well.
- If you ever need to re-bootstrap the content tree from the current English HTML, run `npm run migrate:content`.
