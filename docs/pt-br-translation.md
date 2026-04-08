# pt-BR Translation Workflow

Portuguese pages are generated under `/pt-br/` from the English HTML files.

The default provider is `hybrid`, which prefers higher-quality online translation and reuses the local cache, glossary, and manual overrides. If online translation fails, the generator can fall back to Argos when that runtime is available.

## Commands

```bash
npm run translate:pt:doctor
```

Checks which Python runtime is usable for PT generation and which packages are missing.

```bash
npm run translate:pt
```

Only changed English pages are regenerated.

```bash
npm run translate:pt:all
```

Runs a whole-site Portuguese pass with resume support, so restarting after an interruption skips routes already completed with the same source/config hash.

```bash
npm run translate:pt:fresh
```

Forces a fresh whole-site translation run and clears the translation-memory cache first. Use this after major glossary or shared wording changes.

If packages are missing in your virtualenv, install them with `python -m pip` so you do not depend on a broken `pip` shebang:

```bash
python -m pip install -r requirements-pt-translation.txt
```

After translation, refresh the site data and validate:

```bash
npm run check
```

## Source of Truth

- Edit English pages directly.
- Regenerate Portuguese pages after English edits.
- Do not hand-edit generated `/pt-br/` HTML if you want those changes to survive the next regeneration.

## Manual Overrides

Use:

- `/i18n/pt-br/glossary.json`
- `/i18n/pt-br/overrides.json`

`glossary.json` protects brand names, legal abbreviations, and fixed phrases.

`overrides.json` lets you replace awkward machine translations with exact preferred text.

Use `global` overrides for wording that should be corrected everywhere, and `routes` overrides when a phrase needs a different Portuguese rendering on one specific page.

Example:

```json
{
  "global": {
    "Start Consultation": "Iniciar consulta"
  },
  "routes": {
    "/about/clients/": {
      "Clients": "Clientes"
    }
  }
}
```

Then rerun:

```bash
npm run translate:pt -- --route /about/clients/
```

For larger wording corrections across the whole site:

1. Update `glossary.json` or the `global` section of `overrides.json`.
2. Run `npm run translate:pt:fresh`.

That clears the old translation memory and rebuilds the Portuguese output with the corrected shared phrasing.

## Providers

You can choose the provider explicitly:

```bash
python3 scripts/generate_pt.py --provider hybrid
python3 scripts/generate_pt.py --provider google
python3 scripts/generate_pt.py --provider argos
```

`hybrid` is the recommended default.

## Generated Data

The PT workflow also maintains:

- `/pt-br/data/search-index.json`
- `/pt-br/data/build-report.json`
- `/pt-br/data/formspree-map.json`
- `/pt-br/404.html`

Root `sitemap.xml` includes both English and Portuguese URLs.
