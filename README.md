# Immigrate to Brazil

This repository is now a direct static-site workspace.

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

Preview locally:
```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.
The shared shell uses HTML partial fetches, so opening pages as raw `file://` documents will not hydrate the nav/footer placeholders in a normal browser.

Static data still used by the live site:
- `data/search-index.json`
- `pt-br/data/search-index.json`

PT-BR translation workflow:
```bash
python3 scripts/generate_pt.py --doctor
python3 scripts/generate_pt.py
python3 scripts/generate_pt.py --force --resume
python3 scripts/generate_pt.py --force --clear-memory --provider hybrid
```

Or with npm shortcuts:
```bash
npm run translate:pt
npm run translate:pt:all
npm run translate:pt:doctor
```

If the translator complains about missing Python packages, install them with:

```bash
python3 -m pip install -r requirements-pt-translation.txt
```

The default provider is now `hybrid`: it prefers higher-quality online translation and falls back to Argos only if that runtime is available and needed.
