# pt-BR Translation Workflow

Portuguese pages are generated under `/pt-br/` from the English HTML files.

## Commands

```bash
npm run translate:pt
```

Only changed English pages are regenerated.

```bash
npm run translate:pt:all
```

Regenerates the entire Portuguese tree.

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

## Generated Data

The PT workflow also maintains:

- `/pt-br/data/search-index.json`
- `/pt-br/data/build-report.json`
- `/pt-br/data/formspree-map.json`
- `/pt-br/404.html`

Root `sitemap.xml` includes both English and Portuguese URLs.
