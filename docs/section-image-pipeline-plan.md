# Section Image Pipeline Plan

## What The Scan Found

- English source pages live under `content/en/routes/`, and generated HTML should not be edited directly. See [content-workflow.md](/home/ash/immigratetobrazil-new/docs/content-workflow.md).
- The site currently has 158 English route pages.
- There are 1,683 `<section>` blocks in total.
- There are 1,488 core content sections if we exclude consultation CTAs, menus, FAQ blocks, and homepage/start-consultation expansions.
- 139 pages follow the long-form pattern of roughly `10 content sections + consultation CTA`.
- Family/page counts:
  - `services`: 66 pages, 625 core sections
  - `brazil`: 28 pages, 270 core sections
  - `process`: 25 pages, 245 core sections
  - `about`: 14 pages, 133 core sections
  - `legal`: 14 pages, 115 core sections
  - `insights`: 9 pages, 85 core sections
  - `root`: 1 page, 7 core sections
  - `start-consultation`: 1 page, 8 core sections

## Existing Gaps

- The current prototype downloader at [fetch_brazil_images.py](/home/ash/immigratetobrazil-new/scripts/fetch_brazil_images.py#L186) is not usable as-is.
- The CLI passes `filter_section` to `process_page()` even though that function does not accept it. See [fetch_brazil_images.py](/home/ash/immigratetobrazil-new/scripts/fetch_brazil_images.py#L186) and [fetch_brazil_images.py](/home/ash/immigratetobrazil-new/scripts/fetch_brazil_images.py#L293).
- Query generation is too generic. The current pattern uses slugs like `"page_slug section_slug Brazil immigration cinematic background"`, which is why irrelevant results appear. See [fetch_brazil_images.py](/home/ash/immigratetobrazil-new/scripts/fetch_brazil_images.py#L105).
- The config file only covers 10 manually configured sections, not the site-wide inventory. See [image_config.yml](/home/ash/immigratetobrazil-new/scripts/image_config.yml#L16).
- Section CSS does not yet support per-section background images and per-section overlays. The current section layout styles start at [site.css](/home/ash/immigratetobrazil-new/css/site.css#L2572).
- The repo already includes a curated Brazil hero source library that should be reused for section-image anchoring instead of starting from random stock search alone. See [hero-seo-utils.js](/home/ash/immigratetobrazil-new/scripts/hero-seo-utils.js#L18).

## Recommended Outcome

Build a new pipeline that produces:

- 2 image options per core section
- 1 chosen image per section rendered behind the section content
- a section-image manifest with query history, source, license, alt text, description, overlay, and local file path
- bilingual query packs for every section in English and Portuguese
- deterministic SEO filenames and folders

At current scale, that means planning for:

- 1,488 core sections
- 2,976 candidate images if we store two options for every core section

## Recommended Folder Structure

Store section backgrounds separately from hero images:

- `assets/images/sections/<family>/<route-slug>/<section-slug>/<seo-file>.webp`

Example:

- `assets/images/sections/services/services-visas-work/section-2-who-this-visa-is-usually-for/brazil-sao-paulo-professionals-work-visa-option-a.webp`

Also generate:

- `data/section-image-manifest.json`
- `data/section-query-manifest.json`

## Recommended Metadata Per Candidate

Each candidate record should include:

- `route`
- `family`
- `page_title`
- `section_id`
- `section_title`
- `section_variant`
- `option_key`
- `query_en`
- `query_pt`
- `query_strategy`
- `source`
- `source_id`
- `source_url`
- `license`
- `author`
- `download_path`
- `width`
- `height`
- `hash`
- `overlay_name`
- `overlay_css`
- `alt`
- `description`
- `keywords`
- `approved`

## Source Strategy

Use this order:

1. Curated Brazil source pool from the existing hero system for strong place anchoring.
2. Pixabay for broad cinematic landscape and city imagery.
3. Creative Commons sources through Wikimedia Commons first.
4. Optional licensed-search adapters only if needed.
5. Guarded scraping only from approved CC-friendly domains with robots and license verification.

Do not use arbitrary image scraping from random websites. It will create copyright, attribution, and quality problems.

## Query Strategy

Every section should get a query pack, not one query.

Each pack should contain:

- 4 English queries
- 4 Portuguese queries
- 2 fallback queries tied to a Brazil location keyword from the curated source list
- negative filtering rules and tag checks after search

Each query should combine:

- Brazil anchor
- section intent
- visual style
- wide background language
- optional city/region anchor

Template:

- `"<brazil place> <section intent> Brazil cinematic landscape background copy space"`
- `"<brazil place> <page topic> wide editorial background Brazil"`
- `"<section intent in pt> Brasil paisagem cinematográfica fundo horizontal"`
- `"<brazil place in pt> <page topic in pt> Brasil wallpaper editorial"`

## Query Archetypes

The site is repetitive enough that we should generate most query packs from archetypes plus route-specific tokens.

### Long-form archetypes

- Visa child pages: 21 pages with the same 10 section titles.
- Residency child pages: 17 pages with the same 10 section titles.
- Defense child pages: 6 pages with the same 10 section titles.
- Naturalisation child pages: 6 pages with the same 10 section titles.
- Advisory child pages: 5 pages with the same 10 section titles.
- Other services pages: 4 pages with the same 10 section titles.
- Brazil region pages: 5 pages with the same 10 section titles.

### Hub archetypes

- Service hubs: 7 pages with the same 5 main section titles.
- Brazil hubs: 2 pages with the same 5 main section titles.
- Insights hub: 1 page with 5 main section titles.
- Process hub: 1 page with 5 main section titles.
- About hub: 1 page with 3 main section titles.

### Custom families

- `about/*`
- `brazil/*` topic pages
- `process/*`
- `legal/*`
- `insights/*`
- `start-consultation`

These should still use generator templates, but with family-specific keyword vocabularies.

## Overlay System

Each chosen image should get a named overlay preset so text remains readable without flattening the whole design.

Recommended presets:

- `civic-deep`: dark green/blue overlay for legal, official, authority, and compliance content
- `coastal-warm`: gold/teal overlay for lifestyle, culture, and welcoming Brazil promotion
- `forest-depth`: green/charcoal overlay for geography, regions, and environmental content
- `sunrise-amber`: warm amber overlay for testimonials, stories, and optimistic transition sections
- `slate-focus`: neutral slate overlay for process, planning, and documentation sections
- `night-city`: deep navy overlay for urban, business, and investment sections

Map overlays by section intent, not only by page family.

Examples:

- overview, lifestyle, culture, opportunities: `coastal-warm` or `forest-depth`
- process, compliance, legal boundaries, documentation: `slate-focus` or `civic-deep`
- trust, ethics, results, testimonials: `sunrise-amber` or `night-city`
- economy, business, investor, work, startup: `night-city`

## SEO Naming Rules

Filename rules:

- always start with `brazil-`
- include a real place or scene token when possible
- include the route topic
- include the section intent
- include an option suffix

Pattern:

- `brazil-<place>-<route-topic>-<section-topic>-option-a.webp`

Alt text rules:

- mention Brazil
- mention the page/section purpose
- stay descriptive, not spammy
- avoid repeating the filename verbatim

Description rules:

- explain how the image supports that section for readers considering immigration to Brazil
- keep the copy promotional but credible

## Rendering Plan

Add section-image support to the content templates rather than pasting images manually into every page.

Recommended approach:

1. Generate a manifest keyed by `route + section_id`.
2. During content generation, inject section attributes like:
   - `data-section-image`
   - `data-section-overlay`
   - `style="--section-image:url(...); --section-overlay:..."`
3. Extend `.topic-section`, `.intro-block`, `.highlight-block`, and other shared section wrappers to support:
   - background image layer
   - overlay layer
   - inner surface layer for readable text
4. Keep accessibility fallback so high-contrast and image-hidden modes still work cleanly.

## Python Build Plan

Create a new script, not a patch on the current prototype:

- `scripts/generate_section_images.py`

Recommended phases inside the script:

1. Scan `content/en/routes/**/body.html`.
2. Extract `route`, `family`, `section_id`, `section_title`, and section variant.
3. Classify each section into an archetype.
4. Generate bilingual query packs per section.
5. Search sources in order.
6. Score candidates by Brazil relevance, landscape suitability, tag quality, and duplication risk.
7. Download the top 2 approved candidates.
8. Convert to WebP, normalize dimensions, and save with SEO filenames.
9. Generate alt text, description, and keywords.
10. Write the query manifest and section-image manifest.

## Reliability Rules

- Move the Pixabay API key out of YAML and into `PIXABAY_API_KEY`.
- Keep source adapters isolated so one provider failure does not stop the run.
- Track image hashes to prevent repeats across the site.
- Reject candidates with weak Brazil signals.
- Reject images with obvious non-Brazil civic buildings, passport mockups, medical stock scenes, or unrelated icons unless the section truly needs that.
- Keep a manual override file for any section where automation still chooses something weak.

## Best Build Order

1. Replace the broken downloader with the new manifest-driven Python script.
2. Generate only the query manifest first and review it.
3. Run image discovery for one family at a time.
4. Review the two options per section before selecting defaults.
5. Add section rendering support in HTML/CSS.
6. Regenerate English pages.
7. Port the selected section-image manifest to Portuguese rendering if needed.

## What I Would Implement Next

If we continue from this plan, the next practical milestone is:

- generate a complete site-wide section inventory
- generate bilingual query packs for every core section
- build the new Python script with dedupe, licensing metadata, and SEO naming
- add section background + overlay support to the shared section CSS and templates

That gives you the scalable foundation you need before downloading thousands of images.
