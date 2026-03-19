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

## Normal workflow

1. Open the page you want to change.
2. Edit the HTML directly.
3. If needed, adjust shared CSS or JS.
4. Run `npm run sync:data` to refresh helper files such as the search index and form map.
5. Run `npm run validate` to check for broken links and missing metadata.

If you want one command for both steps, run:

```bash
npm run check
```

## Important note

This repo no longer uses page generators in the active workflow.

It only refreshes:

- `/data/search-index.json`
- `/data/build-report.json`
- `/data/formspree-map.json`
- `/docs/formspree-map.md`
- `/404.html` from `/legal/404/index.html`

## How to find a page fast

Use ripgrep from the project root:

```bash
rg --files -g 'index.html'
```

Find a specific route:

```bash
rg --files -g 'index.html' | rg 'services/visas/work|brazil/cost|about/lawyer'
```
