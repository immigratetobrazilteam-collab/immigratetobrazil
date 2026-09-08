# Schema library and release rules

There are 1,719 complete JSON files in `schema/`, linked one-to-one from `master-ledger.csv`. The verification token has no schema proposal. These are syntax-checked proposals, not evidence of Google feature approval. The 944 source-dependent Article graphs must remain unpublished until the actual article is restored; country and legal drafts have the same content dependency as their metadata.

| Page type | Proposed graph | Application / eligibility |
|---|---|---|
| Home | Organization, WebSite, WebPage | Explain publisher and site identity. Use the existing stable organization and website IDs. Organization markup does not guarantee a knowledge panel. |
| Service detail | WebPage, Service, BreadcrumbList | Describe the visible service and its provider. Service is semantic markup, not a generic Google service rich result. |
| Hub | WebPage or CollectionPage plus BreadcrumbList | Describe the navigation collection. No invented ItemList products or offers. |
| Professional profile | AboutPage/WebPage and Person, BreadcrumbList | Connect the visibly identified professional. Add professional credentials only when independently verified and visible. |
| Contact | ContactPage and BreadcrumbList | Represent actual contact details. ContactPage does not produce a special contact rich result. |
| Article | WebPage, Article, BreadcrumbList | Conditional on a complete actual article. Add the actual author and valid publication/update dates from evidence, not the audit date. Article syntax without real article content is not release-ready. |
| Country/city guide | WebPage and BreadcrumbList | A useful guide, not a separate branch office or LocalBusiness. |
| Utility | Omit schema if it adds no useful identity | Preserve noindex and verification tokens. No need to deploy a graph merely because a draft exists. |

The existing organization graph repeats page-specific descriptions across pages. Prefer one stable organizational identity on the home page; detail pages reference it by ID. Retain `https://immigratetobrazil.com#organization` and `https://immigratetobrazil.com#website` to avoid unnecessary identity changes. The homepage example uses only contact data already present in source; their presence is not independent validation of current availability.

## Homepage implementation

Use `schema/0001-home.json` as the complete Organization/WebSite/WebPage graph. Its paired tags are `metadata/0001-home.html`. For other pages use the ledger's exact file. Replace the existing JSON-LD, rather than appending a second competing graph. The page dossier contains visible breadcrumb HTML matching the proposed BreadcrumbList.

To produce the script element for a selected file without placeholders:

```sh
python3 - <<'PY'
from pathlib import Path
import json
p = Path('docs/seo-audit-2026-09-08/schema/0001-home.json')
data = json.loads(p.read_text())
print('<script type="application/ld+json">')
print(json.dumps(data, ensure_ascii=False, indent=2).replace('</', '<\\/'))
print('</script>')
PY
```

No fabricated reviews, prices, ratings, address, founders, credentials, author biography or social accounts were added. Fields requiring verification are omitted from deployable JSON rather than populated with a literal owner-input string. Additional business facts: **[OWNER INPUT REQUIRED]** verified current registration, eligible location if any, controlled social profile URLs, current commercial terms and author/date provenance.

## Validation

`tools/finish_audit.py` parses all JSON-LD files, checks ID uniqueness within each graph, breadcrumb positions and known destinations, and flags unsupported review/rating/FAQ nodes. This validates syntax and selected relationships; it cannot establish factual truth or validate every Schema.org property. Perform a Google Rich Results Test for a representative deployed page per eligible template, then URL Inspection and visible-page comparison. Do not claim that WebPage/Service passes rich-result eligibility just because JSON parses.

BEST PRACTICE: markup must describe visible content under [Google's structured-data rules](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). Use the [current feature gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) to identify eligible types. [Google's updates](https://developers.google.com/search/updates) state FAQ rich results stopped appearing on May 7, 2026. Do not deploy FAQPage to promise that retired feature. Visible useful questions can remain.
