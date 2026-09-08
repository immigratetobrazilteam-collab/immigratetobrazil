# Search Console opportunity analysis

**No GSC or GA4 export was supplied or found among the saved audit inputs.** No authenticated Search Console connector is available in this session. Clicks, impressions, query positions, CTR, selected canonicals, conversions, indexing reasons, manual actions and losses cannot be established. The current site appears in a web-search discovery sample, but that is not evidence of complete indexing or a stable Google position.

## Exact data to obtain

Export Search type Web with date, query, page, country, device, search appearance, clicks, impressions, CTR and position. Preserve the property, filters, export date and data-finalization status. Use 16 months where available; obtain page-only totals separately because query exports omit anonymized queries and may be limited. Also obtain Page Indexing, Sitemaps, Core Web Vitals, enhancements, manual actions and representative URL Inspection results. Search Console API dimensions and export methods may require separate datasets; do not assume all dimensions can be combined into one reliable export.

Compare the most recent complete 28 days with the prior 28; the latest three complete months with the prior three; and equivalent prior-year periods. Align days of week, country, device, search type and query mix. Exclude recent incomplete days. Record deployment dates and changed URLs. Aggregate CTR as total clicks / total impressions; aggregate position using impression weights, never an unweighted average of page averages.

## Opportunity rules and deliverable columns

| Analysis | Filter and calculation | Action and evidence needed |
|---|---|---|
| CTR | Within country/device and intent cluster, sort impression-weighted positions 1–10 by impressions; compare CTR with similar branded/nonbranded peers in this property. | Inspect the actual result and page promise; test the dossier title/description for the qualified audience. No universal CTR benchmark or invented uplift. |
| Striking distance | Separate 4–10, 8–15 and 11–20 bands; overlapping bands are investigation views, not additive opportunity counts. | Check intended URL, missing answer, official evidence and contextual inbound links before adding content. |
| Cannibalization | For each query and locale, show all URLs, their impressions/clicks, position trend and share changes across periods. | Confirm shared intent; branded sitelinks and useful distinct pages are not automatically cannibalization. Use 06-cannibalization.csv as hypotheses. |
| Decline | Compare click/impression/CTR/position changes together, including zero-baseline handling; segment by device/country. | Separate demand/seasonality, ranking, snippet and indexing explanations. Check releases and actual SERPs before assigning cause. |
| Hidden queries | Join impression-generating queries to each URL's declared topic and exclusions in 05-keyword-url-map.csv. | Add a subsection if it belongs to the same task; reassign the correct owner if one exists. Create a page only if the task is materially distinct. |
| Conversion mismatch | Join landing-page organic sessions to consultation starts, successful submissions and qualified leads in analytics/CRM. | If rankings are strong but qualified leads weak, inspect offer, form friction and audience fit before rewriting keywords. |

The resulting opportunity table must contain period, query, URL, country, device, impressions, clicks, CTR, weighted position, comparison deltas, evidence label, proposed action and owner. Do not manufacture rows until data arrives.

First-wave selection is currently an **INFERENCE from commercial relevance**: home, service hubs, nomad/work/family/investment/naturalization routes, profile, consultation and contact. It is not a striking-distance ranking or CTR analysis.
