# Content Population Plan (Section-by-Section)

## Objective
Populate site content across all major page families with a scalable editorial system, while making the homepage the strongest navigation and conversion hub.

## Scope Reality (Current EN index)
- Total EN routes: 8071
- Discover routes: 5441
- Services routes: 2409
- About routes: 99
- Blog/FAQ/Contact/Home state archives: 27 each

Because of this volume, content must be executed by **page family templates + priority hubs first**, not individual manual rewrites.

## Execution Model
1. Build and finalize section blueprints for each page family.
2. Fully populate top-level hubs (high-conversion/high-navigation pages).
3. Apply templated copy to scaled state/city/service archives.
4. Add cross-linking and CTA consistency pass.
5. Run editorial QA and factuality checks.

## Page Family Blueprint

### 1) Homepage (`/[locale]`)
Required sections:
1. Hero (value proposition + primary CTA)
2. Trust strip (proof markers)
3. Persona journeys (family/investor/nomad/retiree)
4. Core services cards
5. Process timeline
6. Visa/residency pathway cards
7. Core site hubs (services/discover/about/resources/process)
8. Region explorer
9. State explorer
10. Knowledge links (cost, apply, consultation, FAQ, contact)
11. Full content map
12. Final conversion banner + dual CTA

Primary outcomes:
- Route users into the right page family quickly
- Maximize internal linking depth
- Keep conversion CTAs visible across sections

### 2) Services Hub (`/[locale]/services`)
Required sections:
1. Services hero + route count
2. Core service modules
3. Legacy service family groups
4. State service hubs grid
5. SEO internal links block
6. Final CTA

### 3) Discover Hub (`/[locale]/discover`)
Required sections:
1. Discover hero + page count
2. State overview cards
3. City/regional long-tail sample links
4. Region/state entry CTAs
5. Final CTA

### 4) About Hubs (`/[locale]/about/*`)
Required sections:
1. Hero with purpose and context
2. Hub cards (About Brazil / About States / About Us)
3. Deep-link cards to key subpages
4. Related hub links
5. Final CTA

### 5) Resource + Process Pages
Required sections:
1. Strategic intro
2. Framework blocks/checklists
3. Next-step links to services/consultation
4. Related guides
5. Final CTA

### 6) State Archive Families (Blog/FAQ/Contact/Services-by-state)
Required sections:
1. State-specific hero
2. Standardized content modules per family
3. Short state-tailored intro paragraph
4. Cross-links to consultation + hub pages
5. Final CTA

### 7) Policy Pages
Required sections:
1. Policy title + effective date
2. Structured policy sections
3. Contact for policy questions
4. Related legal pages

## Content Standards
- Every page must include:
1. Clear intent-focused H1
2. Minimum one “next step” CTA
3. At least 3 relevant internal links
4. Compliance-safe language (no legal guarantees)
5. Metadata aligned to page intent

## Phasing

### Phase 1 (Completed in code)
- Homepage upgraded to flagship multi-section architecture.
- Internal linking density increased across core hubs and pathways.

### Phase 2 (Next)
- Populate/refresh copy for top hubs:
1. `/services`
2. `/discover`
3. `/about`
4. `/resources-guides-brazil`
5. `/process`
6. `/faq`
7. `/blog`
8. `/contact`

### Phase 3
- Templated content rollout for scaled state/city/service archives.

### Phase 4
- QA pass: factuality, duplication, link relevance, and conversion clarity.

## Source Files To Edit Most
- `content/cms/site-copy/en.json`
- `content/cms/page-copy/en.json`
- `content/cms/navigation-map/en.json`
- `content/cms/state-copy/en.json`
- Managed legacy content under `content/cms/managed-legacy/en/`

## Validation Checklist
Run after each major batch:
```bash
npm run typecheck
npm run lint
npm run build
```

Optional quality checks:
```bash
npm run cms:validate
npm run test
```
