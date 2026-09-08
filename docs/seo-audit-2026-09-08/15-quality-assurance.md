# Second-pass QA and remaining limitations

The continuation reviewed the saved inventory and all ledger artifacts, rechecked current Google guidance, sampled current search results and repeated five live transport checks. See `continuation-live-checks.json` for the fresh evidence. The original 1,720-URL crawl and mobile evidence remain preserved.

## Corrected

- Removed synthetic long-tail “title + questions” suggestions where no supporting query evidence existed.
- Replaced duplicate title alternatives; withheld archive alternatives when the actual subject needs recovery.
- Marked source-dependent article AFTER values as holds instead of publication-ready recommendations.
- Corrected sitemap proposal canonical/OG/schema identity to the observed `/sitemap` destination.
- Changed logo-only social previews to the summary card instead of promising a large-image layout.
- Replaced generic internal-link placements with context tied to the target task; flagged promotion links to source-dependent articles/country pages as conditional.
- Preserved all original URLs and before evidence; no conditional content redirects were executed.

## Full-ledger checks

1,720 URL dossiers are present. The verification utility correctly has no metadata/schema replacement; 1,719 metadata and JSON-LD assets are referenced by the other rows. All JSON parses; no missing ledger artifacts, unknown proposed internal-link endpoints, invalid breadcrumb positions or duplicate IDs within an individual graph were found by the package checker. No duplicate proposed titles or meta descriptions were found among indexable entries.

**19 duplicate H1 groups remain across 38 held article records.** These are retained source values, not approved replacement H1s. They are in `qa-findings.csv`. Cosmetic suffixes would conceal the underlying subject/content problem. Resolve each with source recovery and distinct intent or justified consolidation before release.

## What this QA does not establish

It does not validate every legal statement, independently verify business credentials, inspect every image's semantics, guarantee native Portuguese quality, run Google's Rich Results Test, measure current field Core Web Vitals, prove a ranking change, or confirm Google-selected canonicals. It is not a new comprehensive browser crawl of every page. A complete per-cluster competitor analysis and source-backed rewrite of every archive/country page remain unfinished.

No GSC, GA4, server-log, backlink or authenticated Business Profile evidence was available. This prevents data-supported CTR/striking-distance rankings, proof of cannibalization, backlink-sensitive migration decisions and conversion impact estimates. See 04 and 14 for the exact analyses to run when those inputs are available.

## Release gate

No page should be published solely on this structural QA. For every changed page confirm that its title, H1, introduction, internal anchor labels and schema describe the visible same task; all new claims have sources; its canonical is final; utility directives remain correct; and its conversion path works. Source-held pages remain held until the actual content problem is resolved.
