# Measurement framework

Success is more qualified organic enquiries from useful, discoverable pages, with fewer technical inconsistencies. No ranking or traffic improvement has been measured by this audit.

| Metric | Source / calculation | Comparison / interpretation |
|---|---|---|
| Indexed canonical pages | GSC Page Indexing, Sitemaps and sampled URL Inspection | Track valuable canonical URLs by family; indexed count alone is not a goal. Separate sitemap total from indexed total. |
| Clicks and impressions | GSC by landing page, query cluster, country and device | Latest complete 28 days vs prior 28; three complete months vs prior three; comparable prior year. |
| CTR | Total clicks / total impressions in each segment | Interpret with query mix, average position and SERP features; do not average row percentages. |
| Position | Impression-weighted position and query-level trends | Compare consistent query/country/device sets. Broad average position can worsen as new long-tail impressions appear. |
| Branded / nonbranded | Brand dictionary including Immigrate to Brazil, Monique Fernandes and observed variants | Manually review ambiguity: “immigrate to Brazil” can be a generic query, so separate ambiguous terms instead of counting all as brand. |
| Conversions | Organic landing-page sessions → request starts → successful submissions → qualified leads → engagements | Use actual delivery/CRM status, not just button clicks. Report lead quality and consent-respecting attribution limitations. |
| Schema / appearance | Rich Results Test, GSC enhancement and search-appearance data where supported | Zero syntax errors is a release check, not proof of enhanced display. Do not track retired FAQ appearance as a goal. |
| Page experience | GSC/CrUX field LCP, INP, CLS by device; lab traces for diagnosis | Field windows lag releases. Compare corresponding templates and devices. |
| Crawl health | Crawl snapshots, server logs if available, redirect/canonical/sitemap checks | Track important broken links, unexpected exclusions and changed canonical destinations. |
| Content completeness | Per-URL review ledger | Track source-restored articles and country-specific evidence completed, not word counts or SEO-plugin scores. |

Record release date, URLs, exact changes, page family, locale and remaining dependencies. Preserve stable unchanged comparison pages where practical. A simultaneous sitewide rewrite makes attribution weaker; roll out coherent intent clusters so results can be interpreted. Use a sufficient number of impressions and comparable periods before judging a title change; there is no universal observation period that removes seasonality and noise.

Event definitions: `consultation_start` means meaningful interaction with the request form; `consultation_submit_success` fires only on confirmed successful submission; `qualified_lead` comes from the actual review workflow. Existing event names and analytics configuration were not verified, so reconcile these definitions with the implementation rather than firing duplicate events. Do not send legal case narratives, documents or personal immigration details to analytics.

Before making causal claims check deployment completion, crawling lag, indexing changes, algorithm/SERP changes, seasonality and changes in query mix. Report evidence and plausible explanations separately.
