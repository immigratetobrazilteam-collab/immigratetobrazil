# Sitewide strategy established before rewrites

Audit date: 8 September 2026. Scope: repository route census, live sitemap recursion, raw HTML link traversal, HTTP variants, five mobile browser routes, supplied historical Lighthouse reports, and current web-search results. English and Brazilian Portuguese. Business and conversion assumptions: Monique Fernandes' Brazil immigration legal practice; international and in-country clients; qualified consultation requests. Country priorities and revenue by service were not supplied.

## Initial diagnosis

**OBSERVED:** 1,720 distinct URLs after normalizing the bare origin to `/`, including 1,708 sitemap URLs and 12 utility/support URLs. All returned 200 after redirects. A separate deliberately nonexistent path returned 404. This is transport/indexability evidence, not evidence that Google indexed 1,708 pages. Ten URLs carry noindex. Every sitemap page is reachable in the raw HTML graph within three links from home. That graph includes broad directory links; short depth does not establish useful contextual prominence.

**OBSERVED:** Existing strengths are static substantive HTML, canonical and language annotations, working HTTPS, a browsable service hierarchy, an identified lawyer, contact and policy pages, responsive image variants, and extensive source-page linking. Current titles and descriptions are largely unique; uniqueness alone has not produced sufficiently differentiated content.

**OBSERVED:** 388 country pages repeat an almost identical planning template. `/countries/brazil/` even promises moving to Brazil from Brazil. Numerous archived articles use truncated social-post titles but replace the underlying explanation with generic immigration advice. `/rights/refund/` describes refunds as a stage in immigration rather than giving refund terms. Student/educational visa pages describe overlapping offers. These are usefulness and intent problems before they are metadata problems.

**INFERENCE:** Thin templated pages could weaken satisfaction and consume editorial capacity. No manual action, ranking penalty, traffic loss, or Google canonical disagreement is established. Do not purge these URLs or canonicalize them all to hubs. Recover source content, check GSC, links and conversions, then distinguish retain/expand from merge decisions.

**OBSERVED:** `www` serves a 200 copy; non-www is the declared canonical host. `/sitemap.html` redirects to `/sitemap` but retains the former canonical. Navigation is inserted from `/partials/`, which robots.txt disallows; the existing raw content links mitigate discovery loss but do not make blocked navigation rendering desirable.

## Ownership of intent

| Page family | Owns | Does not own |
|---|---|---|
| `/` and `/pt-br/` | Choosing this Brazil immigration practice; brand; broad attorney intent | Detailed legal eligibility for every route |
| `/services/` | Comparing the practice's service families | Each individual route's service query |
| `/services/visas/{route}/` | Legal assistance with entry/consular visa preparation for that route | In-country residence application; generic route news |
| `/services/residencies/{route}/` | Residence authorization assistance for that route | Visa issuance abroad; automatic citizenship promises |
| `/services/naturalisation/` and children | Naturalization service and legally distinct modalities | Investment-as-guaranteed-citizenship |
| `/services/defense/` and children | Specific enforcement/problem assistance | Generic moving advice |
| `/process/` and children | What the practice's engagement, preparation and filing involve | Duplicating statutory rights or service sales pages |
| `/rights/` | Rights, obligations and remedies for immigrants | Client fee/refund policy or generic process stages |
| `/insights/` and qualifying articles | Answering one complete question with dated, sourced explanation | Replacing an answer with a consultation pitch |
| `/countries/{origin}/` | Verified origin-specific document/consular planning | Unsourced nationality claims; duplicate general visa services |
| `/brazil/` and city pages | Practical relocation decisions | Implying offices or locally available legal teams |
| `/about/profile/` | Consolidated professional biography and identity | Every philosophical/about-page variation targeting the lawyer's name |
| `/start-consultation/` | Requesting a consultation, payment/confirmation sequence | Guaranteeing a booked appointment on form submission |
| `/legal/` | Actual policy and legal disclosures | Competitive generic immigration queries |

English and Portuguese counterparts are localized owners, not cannibalizing duplicates. Keep each self-canonical; reciprocal hreflang only for real equivalents. Do not generate 32 Portuguese city pages just to make counts symmetrical.

## Cannibalization findings and first opportunities

**OBSERVED overlap / INFERENCE search impact:** student versus educational visas; study versus educational residence; lawyer/profile/about/about/atlas; rights/process stage duplicates; three refund pages; consultation service/process/request pages. Preserve separate pages where the offer, workflow and transaction are actually distinct. GSC query-by-page data is needed to prove search competition and choose a migration winner.

Highest-value first wave: clearer consultation transaction, service hub, visas/residence distinction, digital nomad, work, family, investor and naturalization services, professional profile, and a sourced country pilot chosen by actual business demand. This order reflects commercial relevance, not invented impressions or revenue. Preserve long article URLs until a measured migration benefit exists.

## Search-result differentiation

Search tools provide a nonpersonalized discovery sample, not a controlled Google country/device top-ten report. No ranking positions or search volumes are claimed.

- **DATA-SUPPORTED:** [Stay Legal Brazil](https://staylegalbrazil.com/) presents named lawyers, credentials, route choices and a visible contact path. Differentiate with a concise explanation of what Monique personally reviews, verified public registration, and clear written scope.
- **DATA-SUPPORTED:** [Alves Jacob consultation page](https://www.alvesjacob.com/brazil-immigration-lawyer-book-a-consultation.html) explains consultation deliverables, but the inspected page contains unfilled booking/price placeholders. Our advantage should be an operational form and truthful request → payment verification → written confirmation flow; do not copy its promises or duration.
- **DATA-SUPPORTED:** [ZS family reunion guide](https://zsassociados.com/blog/brazil-family-reunion-marriage-visa/) separates visa and in-country residence and addresses evidence. Meet this intent with a reviewed relationship/document matrix and primary-source links; competitor statements are not legal authorities.
- **DATA-SUPPORTED:** [Brazil's digital nomad residence booklet](https://portaldeimigracao.mj.gov.br/images/publicacoes/Cartilha-No%CC%82mades-INGLE%CC%82S_1.pdf) and consular pages are direct informational competition. Explain which authority/process applies before presenting paid help. Verify the latest rule and relevant consular jurisdiction before publishing numerical conditions.
- Portuguese query themes observed in search: `autorização de residência`, `naturalização brasileira`, `documentos para naturalização`, `visto de reunião familiar`, `advogado de imigração`. Use these concepts naturally; do not translate “filing” as “arquivamento” or settlement as “liquidação”. Country-specific Portuguese research is still required for origin-page differentiation.

## Current Google guidance used

**BEST PRACTICE:** [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) prohibit doorway and scaled low-value practices. Country labels alone do not justify separate pages. This is a risk assessment, not a finding of a Google penalty.

**BEST PRACTICE:** [People-first guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) supports complete answers, useful sourcing and clear responsibility. Legal pages require particular factual care.

**BEST PRACTICE:** [Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), and [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) underpin the technical plan.

**BEST PRACTICE:** [Google's 2026 documentation updates](https://developers.google.com/search/updates) confirm FAQ rich results ended May 7, 2026, and llms.txt does not improve or harm Google visibility. Keep useful visible questions; do not sell FAQ schema or llms.txt as ranking improvements. [Supported structured data](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) and [general rules](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) govern feature claims. JSON parsing alone is not Google eligibility validation.
