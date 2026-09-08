# Implementation priority and developer checklist

This package changes audit files only. No website edits, redirects, DNS changes or deployment occurred in this continuation. Priorities indicate order and dependencies, not promised traffic gains or arbitrary time estimates.

| Tier | Item | Impact | Effort | Risk | Confidence | Pages | Implementation |
|---|---|---|---|---|---|---|---|
| P0 verification | Check representative GSC exclusions and selected canonicals | VERY HIGH if excluded | LOW | LOW | MEDIUM | Priority services and both home pages | Obtain URL Inspection/Page Indexing evidence; no confirmed sitewide blocking incident presently. |
| P1 | Allow navigation resources | HIGH | LOW | LOW | HIGH | Both locale templates | Remove both partial disallows and add response noindex to standalone partials; verify headers/rendering. |
| P1 | Normalize www and sitemap final URL | MEDIUM | LOW | MEDIUM | HIGH | Host variants, HTML sitemap | Cloudflare host redirect preserving path/query; align sitemap canonical/OG/internal links. |
| P1 | Repair Portuguese overflow | HIGH for usability | MEDIUM | LOW | HIGH | PT footer template | Diagnose minimum-width/text wrapping; test 320/390/768 widths with no hidden content. |
| P1 | Clarify highest-value service and consultation pages | HIGH | MEDIUM | MEDIUM | MEDIUM | Home, hubs, nomad, work, family, investor, nationality, profile, consultation EN/PT | Use dossier title, description, outline and copy with factual scope review; ship matching metadata, body and schema together. |
| P1 | Restore misleading article bodies and actual refund meaning | HIGH | HIGH | MEDIUM | HIGH for content defect | Source-review articles; refund/process/rights candidates | Recover original article/source; write actual refund policy from practice facts; do not substitute generic filler. |
| P2 | Country differentiation | HIGH | HIGH | MEDIUM | HIGH for template repetition | 388 country URLs | Work through source ledger; prioritize actual demand; retain or consolidate based on unique value and performance. |
| P2 | Resolve same-intent page pairs | MEDIUM | MEDIUM | HIGH | MEDIUM | 06-cannibalization.csv | Compare GSC, backlinks, original content and conversion role; redirect only after selecting a defensible winner. |
| P2 | Contextual links and truthful entity graph | MEDIUM | MEDIUM | LOW | HIGH | Retained pages | Follow 08 table and each dossier; avoid promoting source-deficient pages; replace conflicting graph and verify visible trail. |
| P2 | Field-performance investigation | MEDIUM | MEDIUM | LOW | MEDIUM | Representative templates | Obtain field metrics; profile confirmed bottlenecks, then implement and measure. |
| P3 | Original research, useful downloads, richer media | MEDIUM | HIGH | LOW | MEDIUM | Evidence-backed existing owners | Use 11-content-opportunities.md; no mass new pages. |

## Immediate verification and technical wave

- [ ] Save the pre-release GSC/analytics baseline and changed-URL set.
- [ ] Verify the saved transport observations still hold on the release date.
- [ ] Apply the exact technical changes in 03 only after inspecting current files; preserve unrelated edits.
- [ ] Check unknown EN/PT paths return HTTP 404, and search/feedback pages retain noindex.
- [ ] Check canonical host, final sitemap URL, reciprocal locale annotations, sitemap exclusions and crawlable navigation.
- [ ] Test mobile footer, menus, form labels and usable contact paths; verify form delivery separately with an authorized test.

## First content wave

- [ ] Select the home, service hubs and commercially relevant routes from master-ledger.csv; replace commercial-order assumptions with actual GSC/lead evidence when available.
- [ ] Read the complete page dossier and original page. Satisfy its specific ADD/VERIFY requirements; do not deploy titles promising missing sections.
- [ ] Replace existing title/description/canonical/OG tags with the exact matching metadata asset; keep one of each, preserving valid locale annotations.
- [ ] Apply the selected H1, heading structure and opening with the body corrections. Titles are alternatives, not tags to publish simultaneously.
- [ ] Replace JSON-LD using the matching schema asset only when all represented facts and breadcrumb links are visible.
- [ ] Add only the contextual links that resolve the next question. Follow-up links to unreviewed archive/country content remain conditional.

## Second and third waves

- [ ] Recover archived sources and factual references using unfinished-editorial-ledger.csv. Reassess whether each retains separate value.
- [ ] Use query-by-page data for striking-distance, overlap and CTR prioritization. Do not redirect on topic resemblance alone.
- [ ] Complete origin-specific evidence and Portuguese localization before promoting country pages.
- [ ] Consider only original content assets with a confirmed unfilled task and maintenance owner.

## Release QA and rollback

- [ ] Run `python3 docs/seo-audit-2026-09-08/tools/finish_audit.py` for package checks. This is not a test of edits to production HTML.
- [ ] Run the site's existing validators after production edits, reviewing their expectations before changing templates: `node scripts/seo-audit.js` and `node scripts/validate-site.js`.
- [ ] Inspect a rendered mobile page for every changed template and both languages. Validate actual metadata and JSON-LD from final HTML.
- [ ] Crawl changed pages and their inbound links; verify no loops, chains, missing targets, accidental noindex or sitemap conflicts.
- [ ] Test eligible schema with Google's Rich Results Test and inspect representative published URLs in GSC.
- [ ] Keep code and redirect changes separable for rollback. Do not automatically reverse beneficial changes after a short-term impression fluctuation.

Do not run generators blindly: the preserved recovery scripts write audit snapshots and may overwrite evidence/proposals. `tools/README.md` gives the correct distinctions.
