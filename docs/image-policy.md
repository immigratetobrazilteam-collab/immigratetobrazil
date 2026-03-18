# Hero Image Policy

Each page is assigned its own hero asset path under `assets/images/heroes/<family>/<slug>.webp`.

Fallback order:

1. Search Pixabay with the page-specific hero query.
2. Retry with the page title plus `Brazil landscape`.
3. Retry with the family plus `Brazil landscape`.
4. Retry using curated Brazil destination and nature queries.
5. If Pixabay results are weak, repetitive, or exhausted, generate a branded scenic fallback so the route still ships with a unique hero path and no missing image.

This keeps the site buildable while preserving manual override room for later image swaps.
