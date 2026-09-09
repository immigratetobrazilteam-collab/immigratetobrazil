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
- `data/search-index.json`
- `pt-br/data/search-index.json`
- `data/brazil-municipalities.json`
- `data/largest-municipalities-by-state.json`
- `data/city-directory.json`
- `data/ai-route-manifest.json`

The repository intentionally excludes local agents, editor settings, audit
reports, virtual environments, dependency folders, generated inventories, and
old page-generation scripts. Keep the public site as committed HTML, CSS, JS,
assets, and the small runtime data files above.

## Maintenance scripts

Permanent Python maintenance commands live in `scripts/`. They are designed for
terminal use from the repository root and avoid deleting HTML files.

- `python3 scripts/discovery.py` rebuilds `sitemap.xml`, sitemap shards,
  `robots.txt`, `llms.txt`, `data/ai-route-manifest.json`, search indexes, and
  IndexNow pending state. Use `--submit-indexnow` with `INDEXNOW_KEY` set to
  submit changed URLs.
- `python3 scripts/indexnow.py` prepares IndexNow changed-URL state separately.
  Use `python3 scripts/indexnow.py --submit` with `INDEXNOW_KEY` set to submit.
- `python3 scripts/update_pt_br.py --provider google` updates Brazilian
  Portuguese pages from English source pages while preserving markup, assets,
  scripts, styles, and metadata structure. It uses cached translation output and
  stops without overwriting pages if translation capability is unavailable. Use
  `--provider openai` with `OPENAI_API_KEY` set, or `--provider copy` only for
  structure/URL localization tests.
- `python3 scripts/audit_site.py` writes `reports/site-audit.md` and
  `reports/site-audit.json` with SEO, technical, performance, accessibility,
  schema, and link recommendations.
- `python3 scripts/fix_site.py` applies only safe mechanical fixes and writes
  `reports/fix-report.json` explaining skipped items.
- `python3 scripts/validate_site.py` validates HTML structure signals, local
  links/assets, JSON, XML, sitemaps, and generated data.
- `python3 scripts/git_publish.py` runs `git add -A`, creates a timestamped
  commit with `--allow-empty`, and pushes the current branch.
- `python3 scripts/weekly_maintenance.py --fix --submit-indexnow` coordinates
  translation, discovery, audit, safe fixes, post-fix discovery, and validation.
  Add `--publish` when you want it to commit and push at the end.

Recovered yesterday commands are also kept under `scripts/`:

- `python3 scripts/site_index_manager.py` is the original sitemap, sitemap HTML,
  robots, IndexNow, and search-engine notification manager.
- `python3 scripts/weekly_site_optimizer.py --apply --push` is the original
  standard-library weekly SEO optimizer and safe fixer.
- `bash scripts/run_weekly_optimization.sh` runs that original weekly optimizer
  from the repo root and forwards extra arguments such as `--help`.

## Deploying to Cloudflare Pages

Use the repository root as the Pages root directory, leave the framework preset
and build command blank, and deploy the repository root (`/`). The full
configuration and GitHub-connection recovery steps are in
[`docs/cloudflare-pages-static.md`](docs/cloudflare-pages-static.md).
