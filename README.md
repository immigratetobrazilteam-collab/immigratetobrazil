# Immigrate to Brazil

This is a direct, handwritten static site. Cloudflare Pages serves the files in
this repository exactly as committed. There is no package manager, framework,
or build command.

Edit pages directly:
- `index.html`
- `about/**/index.html`
- `brazil/**/index.html`
- `countries/**/index.html`
- `insights/**/index.html`
- `legal/**/index.html`
- `process/**/index.html`
- `services/**/index.html`
- `start-consultation/index.html`
- `pt-br/**/index.html`

Shared partials:
- `partials/en/*.html`
- `partials/pt-br/*.html`

Shared runtime assets:
- `css/site.css`
- `js/partials.js`
- `js/site.js`
- `js/search.js`
- `assets/**`

## Deploying to Cloudflare Pages

Use the repository root as the Pages root directory, leave the framework preset
and build command blank, and deploy the repository root (`/`). The full
configuration and GitHub-connection recovery steps are in
[`docs/cloudflare-pages-static.md`](docs/cloudflare-pages-static.md).
