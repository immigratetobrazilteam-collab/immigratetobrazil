# Hero Image Policy

Each page is assigned its own hero asset path under `assets/images/heroes/<family>/<slug>.webp`.

Fallback order:

1. Start from curated Brazil-only query pools covering cityscapes, capitals, coastlines, heritage sites, and nature landmarks.
2. Add region-specific Brazil pools for North, Northeast, Central-West, Southeast, and South routes.
3. Rotate query order deterministically per page so the site does not collapse onto the same landmark.
4. Prefer unused Brazil photos first, then reuse a verified Brazil hit before considering any synthetic fallback.
5. Only generate a branded scenic fallback if Pixabay has no usable Brazil-place result at all.

This keeps every hero grounded in Brazil while preserving manual override room for later swaps.
