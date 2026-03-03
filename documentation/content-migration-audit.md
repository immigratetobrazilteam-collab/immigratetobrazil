# Content and Rewrite Audit

Date: 2026-03-02

## Current inventory snapshot
From generated indexes and content stores:
- Route index generation reported: `30,372` routes (EN in current snapshot)
- Managed legacy EN pages: ~`2,660+`
- Discover EN pages: `5,441`

## Rewrite program status
EN rewrite pipeline is implemented and applied with:
- `scripts/rewrite-content-en.mjs`
- `scripts/rewrite-sources-en.mjs`
- `scripts/validate-rewritten-content.mjs`

It adds/validates hybrid governance fields while preserving existing schema compatibility:
- `contentSources`
- `factuality`
- `editorial`
- `seoV2`

## Operational outcomes
- Generic placeholder-heavy pages were rewritten/enriched.
- Validation now enforces structural and rewrite quality gates.
- Locale drift checks remain part of release gate.

## Remaining strategic work
1. Extend rewrite/localization strategy for ES/PT/FR.
2. Add stronger deduplication and factual source quality scoring.
3. Continue selective migration of highest-value legacy routes into bespoke React templates.
4. Improve internal-link graph for deeper discover/service nodes.
