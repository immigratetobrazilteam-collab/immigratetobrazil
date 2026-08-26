# Brazil City Discovery Hub: audit and implementation brief

## What the existing site does well

- A crawlable static architecture, canonical URLs, hreflang scaffolding, shared navigation, breadcrumbs, schema, sitemap generation, and consultation paths already exist.
- The Brazil and Places hubs correctly frame relocation as a life decision, not merely a visa transaction.
- Service pages give the legal detail its own home, which protects discovery pages from becoming generic visa summaries.

## Gaps found

- `/brazil/places/` is useful but has no city directory or indexable city landing pages; high-intent searches such as “living in Florianópolis” have no destination page.
- Existing regional pages do not establish a crawlable city-to-city comparison network or a clear next step from city inspiration to the right legal service.
- The existing sitemap had a city URL reference before the corresponding hub existed. The new generator creates the route and regenerates sitemap artifacts from real pages.
- The navigation and footer can surface the directory over time; the city hub is also linked prominently from the Brazil content layer to avoid a disruptive global-navigation change.
- English has the strongest opportunity first. Portuguese and future-market pages should be separately localized, never machine-copied or canonically merged with English.

## Architecture implemented

`/brazil/cities/` is the canonical English directory. Each editorial city uses `/brazil/cities/{slug}/`. A central data file supplies localized facts and page copy; a generator renders the directory and individual pages with canonical, hreflang-ready, breadcrumb, WebPage, ImageObject, FAQPage, and linked-data markup. The same hub includes a searchable directory of all 5,571 official Brazilian municipalities, sourced from the IBGE locality API. Municipalities do not receive thin auto-generated destination pages; a full editorial guide is published only when it can be properly localized and reviewed.

Every page follows the same discovery sequence: city personality → daily-life signals → who it may suit → immigration pathways at a high level → attorney-led next step → related cities and services. Pages deliberately link to legal services rather than restating requirements or processing times.

## SEO and growth recommendations

- Publish only pages with verified local editorial review and a distinct city point of view. Add quarterly refresh dates and source logs for time-sensitive local facts.
- Build Portuguese equivalents at `/pt-br/brazil/cities/{slug}/` only when fully localized; then add reciprocal hreflang links. Future audience variants should use language/country folders with unique editorial intent, not parameter URLs.
- Add original city photography with descriptive alt text, responsive WebP/AVIF variants, dimensions, and image sitemap entries. The present visual system intentionally avoids stock-image duplication until rights-cleared images are available.
- Monitor Search Console by city, city-plus-intent query, service referral click, WhatsApp click, and consultation completion. Use these signals to prioritise neighborhood guides and comparison pages.
- Avoid price tables and legal instructions on city pages. Keep route rules, eligibility and documentary detail on their dedicated service pages, with review dates and attorney oversight.
