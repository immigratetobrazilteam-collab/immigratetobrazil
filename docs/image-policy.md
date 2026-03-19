# Hero Image Policy

Each page is assigned its own hero asset path under `assets/images/heroes/<family>/<slug>.webp`.

Fallback order:

1. Use a curated library of verified Brazil-only images drawn from real places, landmarks, cityscapes, and nature destinations.
2. Match pages to region-aware tags so North, Northeast, Central-West, Southeast, and South routes pull from relevant Brazil imagery.
3. Generate descriptive local filenames that combine the Brazil location, the page topic, and the hero folder.
4. Store page-specific alt text, description, and keyword metadata for each hero image in the manifest and page markup.
5. Only generate a branded scenic fallback if a curated source cannot be downloaded.

This keeps every hero grounded in Brazil while preserving manual override room for later swaps.
