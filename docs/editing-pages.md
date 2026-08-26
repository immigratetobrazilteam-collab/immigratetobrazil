# Editing Pages Directly

This site can now be edited page-by-page with plain HTML, CSS, JS, and Bootstrap.

## What to edit

- Page content: open the route file itself, for example:
  - `/index.html`
  - `/services/visas/work/index.html`
  - `/brazil/cost/index.html`
- Global styles: `/css/site.css`
- Shared JavaScript: `/js/site.js`, `/js/search.js`, `/js/accessibility.js`
- Shared images and assets: `/assets/`

## Publishing workflow

1. Open the page you want to change.
2. Edit the HTML directly.
3. If needed, adjust shared CSS or JS.
4. Make the matching edit in the Portuguese `pt-br/` page when needed.
5. Commit the changed static files and push to `main`.

## Important note

This repo does not use page generators or a deployment build. The checked-in
English and Portuguese HTML, data files, sitemaps, and assets are all the
published source of truth.

## How to find a page fast

Use ripgrep from the project root:

```bash
rg --files -g 'index.html'
```

Find a specific route:

```bash
rg --files -g 'index.html' | rg 'services/visas/work|brazil/cost|about/lawyer'
```

## Portuguese pages

`/pt-br/` is static content. Edit its committed HTML directly when the
Portuguese version needs to change.
