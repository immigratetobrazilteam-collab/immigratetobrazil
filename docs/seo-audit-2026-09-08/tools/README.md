# Audit recovery tools

Run from the repository root. These tools operate on the dated audit directory, not production pages.

- `finish_audit.py`: repair proposal alternatives and known sitemap canonical mismatch; validate all ledger artifacts and produce completion-summary.json, qa-findings.csv, unfinished-editorial-ledger.csv and source-manifest.csv. Uses Python 3 standard library.
- `seo_discover.py`: recovered original full local/live census. Requires requests and BeautifulSoup. Performs network requests and overwrites original crawl snapshots; preserve the current snapshots before rerunning.
- `seo_supplement.py`: recovered original whole-document heading extraction, correcting the initial main-only extraction. Requires requests. Overwrites heading/local evidence.
- `seo_analyse.py`: recovered original inventory/link analysis; run only after discovery and heading supplementation. Rewrites inventory/evidence summaries.
- `seo_package.py`: recovered draft generator, not a production publishing tool. Rewrites all dossiers, metadata and schema from the evidence. It contains family-level draft heuristics and must be followed by finish_audit.py and actual editorial review. It does not perform legal research or produce publishable replacements for lost article text.

Do not rerun the full pipeline just to print the status report. Use:

```sh
cat docs/seo-audit-2026-09-08/TERMINAL-REPORT.txt
```

The original interrupted pipeline used `/tmp` scripts. They are preserved here so work no longer depends on temporary files. No external account tokens or environment credentials are included.
