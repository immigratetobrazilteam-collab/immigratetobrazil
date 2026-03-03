# Site Audit Documentation

`documentation/site-audit.md` is no longer maintained as a static manual report.

## Where audits are generated now
Use script-driven artifacts instead:
- `npm run seo:audit` -> `artifacts/seo-audits/*`
- `npm run seo:psi` -> `artifacts/seo-psi/*`
- `npm run seo:weekly:report` -> `artifacts/seo-weekly/*`
- `npm run content:coverage:report` -> `artifacts/content-coverage/*`
- `npm run editorial:check` -> `artifacts/editorial/*`

## Why this changed
The route/content surface is very large and changes frequently. Generated artifacts are the source of truth for current audit status, not a hand-edited markdown snapshot.
