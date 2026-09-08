# Technical audit and indexation strategy

Evidence date: 2026-09-08. Read `02-url-inventory.csv`, `technical-issues.csv`, `transport-evidence.json`, `mobile-followup.json` and `qa-findings.csv` together. The seven original technical-issues rows are not the complete technical diagnosis. The stored full crawl is from the interrupted run on this date. Five transport checks were freshly repeated in this continuation (continuation-live-checks.json), confirming the sitemap 200, www duplicate 200, sitemap.html 308, robots response and a true missing-path 404.

| Finding | Evidence | Exact implementation | Acceptance check |
|---|---|---|---|
| www returns a duplicate 200 homepage | OBSERVED, transport evidence | At Cloudflare, match hostname `www.immigratetobrazil.com`; issue a permanent redirect to `https://immigratetobrazil.com` plus the incoming path, preserving query strings. Restrict the match to www to avoid a loop. Test before enabling globally. | `/`, `/services/visas/nomad/`, a Portuguese route and a URL with a query resolve to non-www in one host redirect. |
| Rendered navigation uses blocked partials | OBSERVED, robots.txt and shared partial architecture | Remove both `Disallow: /partials/` lines from robots.txt. Give standalone partial responses `X-Robots-Tag: noindex` through `_headers` while permitting resource fetches. Keep crawlable `<a href>` navigation; pre-render shared navigation as a separate improvement if maintaining static output is practical. | Googlebot can fetch EN/PT partials; rendered header/footer links work; standalone partial responses carry noindex. |
| `/sitemap.html` redirects to `/sitemap` but declares the old URL | OBSERVED | Preserve Cloudflare's existing redirect. Set canonical and og:url in sitemap.html to `https://immigratetobrazil.com/sitemap`; update links that explicitly reference `/sitemap.html`. Updated proposal is in metadata/. | Final HTML has one canonical pointing at final 200 destination. |
| Utility 404 URLs have mismatched canonical/hreflang | OBSERVED | Keep noindex for error/search/feedback utilities. Remove language alternates and unnecessary canonical from dedicated error documents; ensure an unknown requested URL serves the error body with HTTP 404. Do not redirect every missing URL to a 200 error page. | Deliberately missing EN/PT paths return 404; utilities absent from sitemaps. |
| Portuguese footer overflow | OBSERVED in mobile-followup.json | Inspect `.footer-panel`, `.footer-panel__head`, `.footer-brand-title`, contact-list items and children. Apply `min-width:0` to grid/flex children and `overflow-wrap:anywhere` to long text; remove inappropriate nowrap/min-content constraints. Confirm the actual culprit before shipping CSS. | At 320, 390 and 768 CSS pixels, document scrollWidth does not exceed clientWidth; text remains readable and controls usable. |
| 388 origin pages share a planning template | OBSERVED | Keep URLs stable during investigation. For each retained page fill its country evidence table, or recover a more useful original page. `/countries/brazil/` and its PT counterpart need separate investigation because “moving from Brazil to Brazil” is not the stated origin intent. | Each retained country page answers a distinct origin-specific task with cited sources. No blanket noindex/redirect. |
| Article identity/content mismatch | OBSERVED | Work from each of 944 article dossiers and recover source text. Keep date-sensitive claims dated. Replace generic immigration introductions only after establishing what the article answers. | Title, H1, introduction and Article headline describe the same complete answer. |

## Crawl and sitemap findings

OBSERVED: Inventory contains 1,720 normalized URLs and 1,708 sitemap URLs. Recorded fetches returned 200 after redirects; this does not mean all requested URLs initially returned 200 or are indexed. See initial request, final URL and redirect fields. Ten noindex utilities and one verification document must not be bulk optimized. The raw HTML graph reaches sitemap pages within three links. Shared runtime navigation can contain hundreds more links than the extracted content graph; distinguish raw-content link counts from rendered whole-page counts.

BEST PRACTICE: Keep sitemap URLs canonical, indexable and successful; exclude search, error, verification and private support documents. Retain segmented XML sitemaps. Set `lastmod` only from a meaningful page-content update, not the date an audit/generator runs. If reliable modification dates are unavailable, omit lastmod. Never publish draft audit artifacts into the sitemap.

OBSERVED: A deliberately missing route returned 404 in the saved transport test. No sitewide redirect loop or important-page robots exclusion was established. Do not infer the absence of every parameter duplicate, soft 404 or server error from these checks. Server logs and GSC remain necessary for crawl anomalies not exposed by navigation.

## Canonical and international policy

BEST PRACTICE: Retained English and Portuguese pages use self-referencing canonicals, reciprocal `en`/`pt-BR` alternates for true equivalents, and an x-default only when a real fallback is intended. Do not canonicalize Portuguese pages to English. Link locale switches directly to the counterpart. Translated URLs alone do not prove equivalent content. English and Portuguese counterparts may share entities without competing for the same language intent.

Retain URL spelling and existing article paths unless the consolidation review establishes a benefit. Do not normalize naturalisation to naturalization in URLs solely for keyword preference. No country/city mass migrations are approved by this report.

## Performance, rendering, security and limitations

OBSERVED: HTTPS works and HTTP redirects to HTTPS in transport evidence. Five saved mobile browser observations are available, with a focused follow-up on two nomad pages. The follow-up disproves the first snapshot's apparent absence of EN nomad content and confirms PT footer overflow. These are rendering checks, not Core Web Vitals measurements.

Potential issues requiring testing: heavy shared navigation, image transfer size, unused JavaScript, lazy-loading of important content and layout movement when partials mount. Run a fresh mobile Lighthouse trace on home, consultation, EN/PT nomad, country and article templates, then profile the slow element. Do not use historical lab results as current field LCP/INP/CLS. Obtain GSC or CrUX field data and evaluate the 75th percentile by device; good thresholds are LCP <=2.5s, INP <=200ms, CLS <=0.1. Test contact form completion without submitting real messages as part of SEO QA; verify successful lead capture with an authorized test submission in a separate release check.

No comprehensive mixed-content asset crawl, full-site visual review, backlink crawl, log analysis or current field-performance dataset is present. These remain explicit checks, not confirmed failures.

Sources: [canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [international annotations](https://developers.google.com/search/docs/specialty/international/localized-versions), [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).
