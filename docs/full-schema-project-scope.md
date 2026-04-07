# Full Schema Project Scope For immigratetobrazil.com

Last updated: March 24, 2026

This document is the verified sitewide structured-data audit and rollout blueprint for `immigratetobrazil.com`.

It does two jobs at once:

1. It records the current schema implementation as it exists in the repo and built HTML today.
2. It defines the next-phase entity, template, QA, and content roadmap so the schema system can scale cleanly.

The current implementation is materially stronger than an early draft of this plan. Page typing, multilingual page ids, visible FAQ alignment, and service-family graphing are already live. The remaining work is mostly refinement, content support, and graph discipline rather than basic rescue.

## Audit Basis

- repo crawl date: March 24, 2026
- built HTML pages: 318
- English built pages: 159
- Portuguese built pages: 159
- English source routes in `content/en/routes/`: 159
- route roots: `root`, `start-consultation`, `about`, `brazil`, `insights`, `legal`, `process`, `services`
- current generator entry points:
  - `scripts/generate-content.js`
  - `scripts/content-source-utils.js`
  - `scripts/schema-utils.js`
- core content sources:
  - `content/en/about/about.json`
  - `content/en/routes/**/page.json`
  - `content/en/routes/**/body.html`
- benchmark check date: March 24, 2026
- benchmark sample pages reviewed:
  - `https://www.fragomen.com/`
  - `https://www.bal.com/`
  - `https://www.boundless.com/`
  - `https://www.visalaw.com/`

## 1. Deep Sitewide Schema Audit

### Crawl Summary

English route counts by root:

- `root`: 1
- `start-consultation`: 1
- `about`: 14
- `brazil`: 28
- `insights`: 9
- `legal`: 14
- `process`: 25
- `services`: 66

Built output mirrors all 159 English routes into 159 Portuguese routes under `pt-br/`.

### Current Page Template Reality

Current live template groups are:

- homepage
- static root 404 fallback
- start-consultation intake page
- services home
- service family hubs
- service child pages
- about hub
- about trust pages
- lawyer profile page
- testimonials page
- Brazil planning hub
- Brazil navigation hubs for places, states, and cities
- Brazil macro-region pages
- Brazil evergreen topic guides
- process hub
- process explainer pages
- insights hub
- insights topic pages
- legal hub
- legal policy pages
- search utility pages

Not currently present as dedicated templates:

- standalone `/contact/` page
- standalone commercial landing-page family outside current service and intake routes
- individual state detail pages
- individual city detail pages
- dated single-post editorial template

### Reusable Section Inventory

English source-page section usage:

- `hero`: 158
- `content-block intro-block`: 158
- `content-block flow-section topic-section topic-section--split`: 446
- `content-block flow-section topic-section topic-section--frame`: 443
- `content-block flow-section topic-section topic-section--band`: 437
- `lead-form-block`: 159 built instances across EN/PT shell output
- `content-block highlight-block`: 17
- `faq-block`: 13
- `content-block flow-section supplemental topic-section topic-section--frame`: 10
- `content-block flow-section topic-section topic-section--rail`: 3
- `content-block search-results-shell`: 1
- `content-block timeline-block`: 1
- `content-block testimonial-strip`: 1
- `trust-marker-block`: 1
- `cta-pair`: 1

Common partials relevant to schema decisions:

- `breadcrumbs`
- `site-navigation`
- `related-links`
- `official-resources`
- `testimonials`
- `floating-whatsapp`
- `sidebar-shell`
- `site-footer`

### Current Schema Inventory

#### Output counts in English built HTML

- total JSON-LD nodes across EN pages: 2,616
- page entities present on EN pages: 159 of 159
- page entities by type:
  - `WebPage`: 128
  - `AboutPage`: 14
  - `CollectionPage`: 14
  - `SearchResultsPage`: 2
  - `ContactPage`: 1
- `BreadcrumbList`: 158 output nodes
- `ImageObject`: 159 output nodes
- `FAQPage`: 13 output nodes
- `ItemList`: 15 output nodes

All English pages currently emit:

- `Organization`
- `WebSite`
- `ContactPoint`
- `Country`
- practice-level `LegalService`
- service-family `OfferCatalog`
- six service-family `Service` nodes
- one page-scoped hero `ImageObject`
- one page entity

That shared layer is consistent, but it is heavier than necessary on many non-service pages.

#### Unique entity inventory by `@id` in English output

- `Organization`: 1
- `WebSite`: 1
- `ContactPoint`: 1
- `Country`: 1
- practice-level `LegalService`: 1
- child `LegalService` entities: 50
- `Service` entities: 15
  - 6 service families
  - 5 advisory child services
  - 4 other-support child services
- `Person`: 1
- `AdministrativeArea`: 5
- page-scoped `Thing` topic entities: 69
- `OfferCatalog`: 7
  - 1 global family catalog
  - 6 family-specific child-service catalogs
- `ItemList`: 15
- `FAQPage`: 13
- `BreadcrumbList`: 157 unique ids
- hero `ImageObject`: 158 unique ids
- page ids across all page types: 158 unique ids

Important special case:

- `404.html` reuses the `/legal/404/` page id, breadcrumb id, topic id, and hero id.
- This is acceptable if treated as a non-indexed fallback shell, but QA must treat it as an intentional duplicate.

### Current Strengths

- Every English and Portuguese built page now has a primary page entity.
- Page types are already sensibly separated:
  - home as `WebPage`
  - hubs as `CollectionPage`
  - intake as `ContactPage`
  - about pages as `AboutPage`
  - search pages as `SearchResultsPage`
- FAQ is now aligned with visible content:
  - 13 pages with visible FAQ blocks
  - 13 `FAQPage` objects
  - 0 visible-content mismatches in the current build
- Portuguese schema localization is currently healthy:
  - 159 of 159 PT page ids localized correctly
  - 159 of 159 PT hero image ids localized correctly
  - 159 of 159 PT page and hero `inLanguage` values set to `pt-BR`
  - shared organization url remains root-domain canonical
- Shared ids are stable and reused:
  - organization
  - website
  - contact point
  - practice
  - service families
  - child services
- The site already has a meaningful entity graph instead of isolated page snippets.
- No `Review` or `AggregateRating` overreach is present.
- No premature `Article` rollout is present on pages that lack bylines and dates.

### Current Weaknesses And Remaining Risks

- The sitewide layer is oversized.
  - Every page emits the practice node, global service catalog, and all six family nodes even when the page is about privacy, accessibility, or culture.
  - This is not invalid, but it adds graph noise and node weight without always adding meaning.
- 70 page entities still use a generic page-scoped `Thing` as the main entity.
  - This is acceptable for phase 1.
  - It is also the clearest place for selective future upgrades.
- 17 page entities currently omit `about`.
  - mostly homepage, about pages, and top-level Brazil pages
  - not broken, but additional `about` relationships would strengthen graph context
- The site still has no true dated editorial template.
  - no visible author module
  - no visible published date
  - no visible modified date
  - no `reviewedBy` module
- The site still has no dedicated `/contact/` template.
- There are no state-detail or city-detail content templates yet.
- The current public trust layer is still thin for richer person and credential modeling.
  - named attorney exists
  - job title exists
  - public credential detail is still limited
- `content/en/about/about.json` still contains a legacy `schemas` block that no longer matches the live generator output.
  - example mismatch: legacy `#contactpoint` vs live `#contact-primary`
  - this is internal configuration drift and should not be treated as the schema source of truth

## 2. Page Template Schema Mapping

| Template | Current primary page markup | Main entity model | Supporting markup | Status / notes |
| --- | --- | --- | --- | --- |
| Homepage `/` | `WebPage` | practice-level `LegalService` | `Organization`, `WebSite`, `ContactPoint`, `Country`, hero `ImageObject`, optional visible `FAQPage` | live and sensible |
| Static `404.html` fallback | `WebPage` reusing `/legal/404/` ids | page-scoped topic `Thing` | `BreadcrumbList`, hero `ImageObject` | special-case duplicate, keep noindex |
| Start consultation `/start-consultation/` | `ContactPage` | advisory consultation service | `ContactPoint`, hero `ImageObject`, visible `FAQPage` | live and correct |
| Services home `/services/` | `CollectionPage` | practice-level `LegalService` | `ItemList`, `BreadcrumbList`, hero image | live |
| Service family hubs `/services/{family}/` | `CollectionPage` | family `Service` | family `OfferCatalog`, `ItemList`, `BreadcrumbList`, hero image | live |
| Visa child pages | `WebPage` | child `LegalService` | `BreadcrumbList`, hero image, family/practice references | live |
| Residency child pages | `WebPage` | child `LegalService` | `BreadcrumbList`, hero image, family/practice references | live |
| Naturalisation child pages | `WebPage` | child `LegalService` | `BreadcrumbList`, hero image, family/practice references | live |
| Defense child pages | `WebPage` | child `LegalService` | `BreadcrumbList`, hero image, family/practice references | live |
| Advisory child pages | `WebPage` | child `Service` | `BreadcrumbList`, hero image, family/practice references | live |
| Other-support child pages | `WebPage` | child `Service` | `BreadcrumbList`, hero image, family/practice references | live |
| About hub `/about/` | `AboutPage` | `Organization` | `BreadcrumbList`, hero image | live |
| About trust pages | `AboutPage` | `Organization` | `BreadcrumbList`, hero image | live |
| Lawyer profile `/about/lawyer/` | `AboutPage` | `Person` | `Organization`, `BreadcrumbList`, hero image | live |
| Testimonials page | `AboutPage` | `Organization` | `BreadcrumbList`, hero image | live, no review markup |
| Brazil hub `/brazil/` | `CollectionPage` | `Country` | `ItemList`, `BreadcrumbList`, hero image | live |
| Brazil navigation hubs `/brazil/places/`, `/states/`, `/cities/` | `CollectionPage` | page-scoped topic `Thing` | `ItemList`, `BreadcrumbList`, hero image | live |
| Brazil country guide `/brazil/brazil/` | `WebPage` | `Country` | `BreadcrumbList`, hero image | live |
| Brazil region pages | `WebPage` | `AdministrativeArea` | `BreadcrumbList`, hero image | live |
| Brazil evergreen topic pages | `WebPage` | page-scoped topic `Thing` | `BreadcrumbList`, hero image | live |
| Process hub `/process/` | `CollectionPage` | page-scoped topic `Thing` | `ItemList`, `BreadcrumbList`, hero image | live |
| Process topic pages | `WebPage` | page-scoped topic `Thing` | `BreadcrumbList`, hero image | live |
| Insights hub `/insights/` | `CollectionPage` | page-scoped topic `Thing` | `ItemList`, `BreadcrumbList`, hero image | live |
| Insights topic pages | `WebPage` | page-scoped topic `Thing` | `BreadcrumbList`, hero image | live |
| Legal hub `/legal/` | `CollectionPage` | page-scoped topic `Thing` | `ItemList`, `BreadcrumbList`, hero image | live |
| Legal policy pages | `WebPage` | page-scoped topic `Thing` | `BreadcrumbList`, hero image, visible `FAQPage` only where present | live |
| Search utility pages | `SearchResultsPage` | page-scoped topic `Thing` | `BreadcrumbList`, hero image | live |
| FAQ-first pages | `WebPage` or `ContactPage` plus `FAQPage` | same as page intent | `Question` / `Answer` objects only when visible | live and restrained |
| Future state detail pages | `WebPage` | `AdministrativeArea` | `BreadcrumbList`, hero image, optional `ItemList` | not yet present |
| Future city detail pages | `WebPage` | `City` | `BreadcrumbList`, hero image | not yet present |
| Future single editorial posts | `BlogPosting` or `Article` | article entity | `author`, `publisher`, dates, image, breadcrumbs | not yet present |
| Future `/contact/` page | `ContactPage` | `ContactPoint` plus consultation service relation | `BreadcrumbList`, hero image | not yet present |

## 3. Full Entity Architecture

### Canonical Shared Entities

- `Organization`
  - brand and operating identity: Immigrate to Brazil
- `WebSite`
  - site-wide publishing/search surface
- `ContactPoint`
  - primary support and intake contact
- practice-level `LegalService`
  - umbrella legal and advisory offering
- service-family `Service` entities
  - visas
  - residencies
  - naturalisation
  - defense
  - advisory
  - other support
- child service entities
  - `LegalService` where formal legal handling is clear
  - `Service` where support/advisory scope is mixed
- `Person`
  - Monique Fernandes
- `Country`
  - Brazil
- `AdministrativeArea`
  - North
  - Northeast
  - Central-West
  - Southeast
  - South

### Page-Scoped Entities

- page entities:
  - `WebPage`
  - `AboutPage`
  - `CollectionPage`
  - `SearchResultsPage`
  - `ContactPage`
- page-scoped topic `Thing`
- `BreadcrumbList`
- hero `ImageObject`
- page-scoped `ItemList`
- page-scoped `FAQPage`

### Service Entity Set

Service families:

- visas
- residencies
- naturalisation
- defense
- advisory
- other

Child services:

- visas:
  - artistic
  - business
  - diplomatic
  - educational
  - exchange
  - family
  - humanitarian
  - investor
  - journalist
  - medical
  - nomad
  - religious
  - research
  - retiree
  - sports
  - startup
  - student
  - tourist
  - transit
  - volunteer
  - work
- residencies:
  - cplp
  - educational
  - exchange
  - health
  - humanitarian
  - investor
  - mercosul
  - nomad
  - religious
  - research
  - retiree
  - reunion
  - skilled
  - study
  - volunteer
  - work
  - youth
- naturalisation:
  - ordinary
  - extraordinary
  - provisional
  - special
  - renunciation
  - reacquisition
- defense:
  - appeals
  - deportation
  - expulsion
  - extradition
  - fines
  - litigation
- advisory:
  - consultation
  - strategy
  - compliance
  - representation
  - corporate
- other:
  - consular
  - records
  - regularization
  - translation

### Non-Service Entity Set

- about and trust pages:
  - about
  - profile
  - story
  - stories
  - mission
  - philosophy
  - whyus
  - values
  - ethics
  - results
  - clients
  - lawyer
  - testimonials
- process topics:
  - aftercare
  - alone
  - approval
  - assessment
  - compliance
  - consultation
  - conversion
  - deadlines
  - failures
  - fees
  - filing
  - mistakes
  - naturalisation
  - obligations
  - permanent
  - planning
  - refund
  - regularization
  - renewal
  - responsibilities
  - rights
  - strategy
  - timeline
  - transparency
- insights topics:
  - blog
  - updates
  - guides
  - general
  - process
  - visa
  - residency
  - naturalisation
- Brazil topics and hubs:
  - brazil
  - places
  - states
  - cities
  - living
  - cost
  - housing
  - safety
  - education
  - economy
  - healthcare
  - culture
  - cuisine
  - events
  - festivals
  - investment
  - directory
  - municipalities
  - quality
  - faqs
  - guides
  - search
- legal topics:
  - privacy
  - cookies
  - terms
  - payment
  - refund
  - form
  - gdpr
  - lgpd
  - accessibility
  - disclaimer
  - emergency
  - search
  - 404

### Relationship Rules

- `Organization` publishes `WebSite`.
- `Organization` operates the practice-level `LegalService`.
- practice `LegalService` has the family `OfferCatalog`.
- family `Service` nodes are related to the practice.
- family-specific `OfferCatalog` nodes list child services on family hubs.
- child service pages point to their shared child service entity with `mainEntity`.
- service hubs point to the shared family entity with `mainEntity`.
- about pages point to `Organization` or `Person`.
- location pages point to `Country`, `AdministrativeArea`, or page-scoped location topic entities.
- process, insight, and legal pages point to page-scoped topic entities.
- page entities connect to the graph through:
  - `isPartOf`
  - `mainEntity`
  - `about`
  - `breadcrumb`
  - `primaryImageOfPage`

## 4. Knowledge Graph Design

### Graph Spine

Recommended graph spine:

`Organization` -> `WebSite` -> page entity -> main entity -> supporting entities

Expanded:

- `Organization` -> publishes -> `WebSite`
- `Organization` -> provides -> practice `LegalService`
- practice `LegalService` -> hasOfferCatalog -> family catalog
- family catalog -> points to -> family `Service` entities
- family `Service` -> optionally hasOfferCatalog -> child-service catalog
- child-service catalog -> points to -> child service entities
- page entity -> isPartOf -> `WebSite`
- page entity -> mainEntity -> service / person / place / topic / organization entity
- page entity -> about -> related services, places, or organization entities
- page entity -> breadcrumb -> `BreadcrumbList`
- page entity -> primaryImageOfPage -> hero `ImageObject`

### Current-State Assessment

The site already behaves like a graph, not like isolated snippets.

What is already working:

- shared global ids
- service-family hierarchy
- child service ids
- person entity
- multilingual page-local ids
- page-level `mainEntity`

What still needs refinement:

- reduce unnecessary global node repetition on pages where it adds little meaning
- selectively upgrade `Thing` where a stronger entity is justified by visible content
- add better `about` relationships on pages that are still graph-thin
- add future editorial byline/date/reviewer fields before any article rollout

## 5. Internal Entity ID / `@id` System

### Current Canonical ID Rules

- global shared entities use root-fragment ids
- page-scoped entities use page-fragment ids
- EN and PT page ids differ by page path only
- shared entities do not split by language

### Canonical Shared IDs

- `https://immigratetobrazil.com#organization`
- `https://immigratetobrazil.com#website`
- `https://immigratetobrazil.com#contact-primary`
- `https://immigratetobrazil.com#place-brazil`
- `https://immigratetobrazil.com#legal-practice`
- `https://immigratetobrazil.com#person-monique-fernandes`
- `https://immigratetobrazil.com#catalog-service-families`
- `https://immigratetobrazil.com#service-family-visas`
- `https://immigratetobrazil.com#service-family-residencies`
- `https://immigratetobrazil.com#service-family-naturalisation`
- `https://immigratetobrazil.com#service-family-defense`
- `https://immigratetobrazil.com#service-family-advisory`
- `https://immigratetobrazil.com#service-family-other`
- `https://immigratetobrazil.com#catalog-service-family-visas`
- `https://immigratetobrazil.com#catalog-service-family-residencies`
- `https://immigratetobrazil.com#catalog-service-family-naturalisation`
- `https://immigratetobrazil.com#catalog-service-family-defense`
- `https://immigratetobrazil.com#catalog-service-family-advisory`
- `https://immigratetobrazil.com#catalog-service-family-other`
- child-service examples:
  - `https://immigratetobrazil.com#service-visas-nomad`
  - `https://immigratetobrazil.com#service-residencies-nomad`
  - `https://immigratetobrazil.com#service-naturalisation-ordinary`
  - `https://immigratetobrazil.com#service-defense-deportation`
  - `https://immigratetobrazil.com#service-advisory-consultation`

### Page ID Pattern

English page ids:

- `https://immigratetobrazil.com/services/visas/nomad/#webpage`
- `https://immigratetobrazil.com/about/lawyer/#webpage`
- `https://immigratetobrazil.com/brazil/south/#webpage`

Portuguese page ids:

- `https://immigratetobrazil.com/pt-br/services/visas/nomad/#webpage`
- `https://immigratetobrazil.com/pt-br/about/lawyer/#webpage`
- `https://immigratetobrazil.com/pt-br/brazil/south/#webpage`

Derived page-scoped ids:

- `.../#breadcrumb`
- `.../#hero-image`
- `.../#page-list`
- `.../#faq`
- `.../#faq-question-1`
- `.../#topic`

### Hard Rules

- never reuse one `@id` for two semantic roles
- never create separate EN/PT ids for organization, website, contact point, person, or shared services
- never collapse similarly named but different services into one id

These must stay separate:

- nomad visa vs nomad residency
- consultation service vs consultation process topic vs start-consultation page
- regularization service vs regularization process topic
- strategy advisory service vs strategy process topic
- naturalisation family vs naturalisation process topic vs naturalisation insights topic

## 6. Sitewide Core Schema Layer

### Current Shared Layer

Current all-page shared layer:

1. `Organization`
2. `WebSite`
3. `ContactPoint`
4. `Country`
5. practice `LegalService`
6. family `OfferCatalog`
7. six service-family `Service` nodes

This is valid, but not always necessary.

### Recommended Core Layer For Long-Term Maintainability

Keep on all indexable pages:

1. `Organization`
2. `WebSite`
3. `ContactPoint`
4. page entity
5. hero `ImageObject`
6. `BreadcrumbList` when visible

Keep conditionally:

- `Country`
  - keep on Brazil, service, process, and most sitewide planning pages
  - optional on some legal/about pages if graph weight needs trimming
- practice `LegalService`
  - keep on homepage, services home, service hubs, service child pages, about/lawyer, and intake pages
  - optional on some narrow legal-policy pages
- family catalog and family nodes
  - keep on services home and service-related pages
  - do not require them on every legal, about, or Brazil guide page

### Core-Layer Recommendation

Phase 2 should slim the universal layer without changing ids.

The improvement is not an id rewrite. It is conditional publishing discipline.

## 7. Section-Level Schema Blueprint

| Section type | Schema? | Current status | Recommended handling |
| --- | --- | --- | --- |
| Hero | yes, indirectly | live on all pages | keep one hero `ImageObject` per page and link via `primaryImageOfPage` |
| Intro / value proposition | no standalone block | live | fold into page `description` and main-entity language |
| Service family grid | yes, selectively | live on hubs | use `ItemList` or family `OfferCatalog` where cards are visible |
| Quick navigation block | sometimes | limited | use `ItemList` only where order and membership matter |
| FAQ block | yes, only when visible | live on 13 pages | current policy is correct, keep it strict |
| Testimonial strip | not as review in phase 1 | live but sparse | keep visible only until provenance and review fields improve |
| Trust / authority section | no standalone type | live | reinforce via `Organization`, `Person`, and page copy |
| Contact section | yes, through shared entity | live | reference shared `ContactPoint`, do not create per-CTA contact nodes |
| Consultation CTA | no standalone entity | live | keep as page copy and link context |
| Inquiry form | page-level only | live | use `ContactPage` on true intake pages only |
| Comparison table | future-only | not currently real | add markup only when real structured tables exist |
| State / city snapshot | future-only | not yet present | tie to `AdministrativeArea` or `City` detail templates |
| Editorial callout | no | live | keep plain HTML |
| Internal link hub | yes, selectively | live on 15 pages | `ItemList` is appropriate on major hub pages |
| Official resource list | usually no | live | optional internal QA value, low public graph value |

## 8. Advanced Service Modeling

### Top-Level Commercial Model

Umbrella practice:

- Brazil immigration legal and advisory services

Service families:

- visas
- residencies
- naturalisation
- defense
- advisory
- other support

### Child-Service Modeling Rules

Use `LegalService` for:

- visas
- residencies
- naturalisation pathways
- defense / enforcement matters

Use `Service` for:

- consultation
- strategy
- compliance advisory
- representation support
- corporate support
- consular support
- records
- regularization support
- translation

### Educational vs Commercial Boundary

- commercial service routes: `/services/**`
- intake / conversion routes: `/start-consultation/`
- educational process routes: `/process/**`
- educational insights routes: `/insights/**`
- relocation / place guides: `/brazil/**`
- legal / policy routes: `/legal/**`

### Modeling Rule

Every commercial service page gets exactly one canonical shared service entity.

Supporting pages should reference service entities with:

- `about`
- `mentions`
- `isRelatedTo`

Supporting pages should not generate duplicate service entities for the same service.

## 9. Service Taxonomy Framework

### Taxonomy Levels

- Level 0: organization and practice
- Level 1: service family
- Level 2: service offering
- Level 3: language-specific page instance
- Level 4: supporting educational clusters
- Level 5: location context

### Naming Rules

- use canonical English family slugs for shared ids
- use localized titles for page `name`
- keep family ids plural because the live implementation already does so
- keep child-service ids tied to their family slug
- do not let matching words force shared ids across different intents

### Consistency Rules

- one child service belongs to one family only
- a location page is never a service entity
- a legal notice is never a service entity
- an intake page never replaces the consultation service entity
- a process topic never replaces a commercial service entity

## 10. Multilingual Schema Plan

### Current State

Multilingual schema is currently in good shape.

Verified in the built HTML:

- 159 of 159 PT page ids are localized correctly
- 159 of 159 PT hero image ids are localized correctly
- 159 of 159 PT page `inLanguage` values are `pt-BR`
- 159 of 159 PT hero image `inLanguage` values are `pt-BR`
- shared organization url remains root-domain canonical
- shared service and person ids remain language-neutral

### Shared Across EN/PT

These ids must remain shared:

- organization
- website
- contact point
- Brazil country entity
- practice entity
- person entity
- service families
- child services

### Language-Specific

These ids must remain page-local:

- page ids
- hero image ids
- breadcrumb ids
- page list ids
- FAQ ids
- page-scoped topic ids

### Multilingual Rules

- English page nodes use `inLanguage: "en"`
- Portuguese page nodes use `inLanguage: "pt-BR"`
- page names, breadcrumb labels, and FAQ text localize by page language
- shared entities stay language-neutral
- page canonicals and `hreflang` must stay aligned with page schema

### Optional Future Upgrade

If the site adds a formal EN/PT pairing registry in the generator, it can expose stronger alternate-language linkage for internal QA and future markup decisions. That is an enhancement, not a blocker.

## 11. Advanced FAQ Schema Strategy

### Current State

Current FAQ usage is disciplined:

- visible FAQ blocks in English source pages: 13
- `FAQPage` objects in English built pages: 13
- pages with FAQ schema but no visible FAQ: 0
- pages with visible FAQ but no FAQ schema: 0

### Approved FAQ Pattern

Use `FAQPage` only when:

- the questions are visibly present
- the answers are public and stable
- the Q&A is part of the actual page experience
- the answers are not case-specific legal advice

Strong candidates:

- homepage, if the visible FAQ remains
- `/start-consultation/`
- legal-policy pages with real FAQ blocks
- `/brazil/faqs/` if it remains truly FAQ-first

Weak candidates:

- cloned service-child FAQ sets
- guide pages without visible accordions
- editorial pages where FAQ is only a conversion add-on

### Search-Result Reality

FAQ rich-result expectations should stay low.

Use FAQ primarily for:

- page comprehension
- entity support
- parser clarity

Do not build the schema program around FAQ SERP features.

## 12. Testimonial / Review Schema Strategy

### Current State

- visible testimonial content exists
- no `Review` markup is currently live
- no `AggregateRating` is currently live

That is the correct current posture.

### Phase-1 Policy

- no `AggregateRating`
- no self-serving organization review snippets
- no review markup on the testimonials page yet

### Conditions For Future Review Markup

Only add `Review` if the visible page includes:

- reviewer name or durable alias
- review body
- review date
- item reviewed
- clear provenance or consent handling

Even then:

- keep reviews page-specific
- do not add `AggregateRating` until the site has an auditable ratings system

## 13. Contact, Consultation, And Inquiry Flow Schema

### Current Lead Paths

- homepage inquiry form
- `/start-consultation/` intake form
- `/legal/form/` intake-policy page
- repeated consultation CTAs
- email
- phone / WhatsApp
- floating WhatsApp widget

Current visible form endpoint:

- `https://formspree.io/f/xdawygld`

### Current Modeling

- canonical contact entity: shared `ContactPoint`
- true intake page: `/start-consultation/` as `ContactPage`
- consultation service remains a separate service entity
- homepage is not treated as a contact page
- `/legal/form/` stays a policy page, not a contact-page replacement

### Recommendation

Keep the current model.

If a future `/contact/` route is introduced:

- type it as `ContactPage`
- point it to the shared `ContactPoint`
- optionally reference the consultation service as a related entity

Avoid over-modeling:

- third-party form endpoints
- CTA cards
- floating widgets as standalone entities

## 14. Legal Compliance Schema Strategy

### Current Legal Template Strategy

- `/legal/`: `CollectionPage`
- `/legal/search/`: `SearchResultsPage`
- legal policy routes: `WebPage`
- FAQ only where visibly present

This is directionally correct.

### What To Keep

- `WebPage`
- `BreadcrumbList`
- hero `ImageObject`
- visible FAQ markup where truly present

### What To Avoid

- `Article` by default
- `LegalService` on policy pages
- `Review`
- `AggregateRating`

### Content Fields Worth Adding Later

- effective date
- last reviewed date
- reviewer name or role
- policy-contact route

These fields would strengthen trust without requiring inflated schema types.

## 15. Content-To-Schema Gap Analysis

### High-Priority Gaps

- no true author module on insights, process, or Brazil guide pages
- no visible published dates
- no visible modified / reviewed dates
- no formal reviewed-by module on YMYL pages
- no dedicated contact page
- no state-detail or city-detail template
- no date-rich editorial template
- public credential detail on the lawyer page is still limited for a stronger professional profile
- 70 pages still rely on generic `Thing`

### Medium-Priority Gaps

- about pages could carry stronger `about` relationships
- homepage could carry stronger `about` context
- legal and about pages do not need full service-family graph on every page
- testimonial content lacks provenance fields for future review markup
- no visible business hours or broader contact module
- organization `sameAs` is currently very limited

### Internal Maintenance Gaps

- legacy unused schema seed in `content/en/about/about.json`
- no dedicated schema-audit script capturing counts and edge cases automatically
- no explicit QA rule in code for the `404.html` duplicate-id exception

## 16. Schema-Safe Content Recommendations

- Add a reusable visible author / reviewer block for future editorial templates.
- Add visible `Published` and `Last reviewed` dates where freshness matters.
- Add a stronger public attorney credentials block on the lawyer page and homepage.
- If legally acceptable, add visible OAB registration detail in a controlled trust module.
- Add a reusable visible contact block with languages, channels, and response framing.
- Keep FAQ only where a visible FAQ component exists.
- Add clear “who this page is for” and “next step” framing on overlapping service pages.
- Add stronger intent statements on overlap clusters such as nomad, consultation, compliance, strategy, and regularization.
- If future state and city pages launch, add visible quick facts modules so place entities have real support.

## 17. Rich Result Opportunity Map

| Feature | Realistic? | Priority | Notes |
| --- | --- | --- | --- |
| Breadcrumb rich results | yes | high | already close and well supported |
| Organization / site identity | yes | high | current organization and website layer supports this |
| Logo understanding | yes | high | current org logo exists, can be upgraded to an `ImageObject` later |
| FAQ rich results | low | low | use FAQ for semantic support, not SERP expectations |
| Article rich results | future-only | medium | requires visible bylines, dates, and real article templates |
| Review rich results | not a target | low | self-serving org/business review snippets are not a safe goal |
| Place/entity understanding | yes | medium | especially for country, region, and future city/state content |
| Contact understanding | yes | medium | useful for parsers, not a classic rich result |
| Sitelinks search box | no | none | Google retired this feature in November 2024 |

## 18. Editorial / Insights Schema Strategy

### Current-State Recommendation

Current insight pages are topical hubs and evergreen explainers, not dated posts.

Current live modeling is acceptable:

- `/insights/`: `CollectionPage`
- `/insights/{topic}/`: `WebPage`

The same logic broadly applies to `/process/**` and many `/brazil/**` explainers.

### What Not To Do Yet

Do not force:

- `Article`
- `BlogPosting`
- `NewsArticle`

until the visible page components support:

- author
- publisher
- date published
- date modified
- representative image discipline

### Future Editorial Model

When true editorial posts exist:

- `BlogPosting` for blog-style posts
- `Article` for evergreen explainers with visible bylines and dates
- `NewsArticle` only for time-sensitive reporting

Future article pages should connect to:

- service entities through `about`
- place entities through `about` or `mentions`
- organization via `publisher`
- person via `author` and optional `reviewedBy`

## 19. Guide, State, And City Content Schema Strategy

### Current Guide Model

Current location and relocation content splits into:

- country and navigation hubs
- macro-region pages
- evergreen topic guides
- state and city navigation hubs

### Current Entity Model

- Brazil: `Country`
- five macro-regions: `AdministrativeArea`
- topic guide pages: page-scoped `Thing`

### Future State And City Plan

When detail pages exist:

- state pages: `WebPage` with `mainEntity` = `AdministrativeArea`
- city pages: `WebPage` with `mainEntity` = `City`

### Connection Rule

Location pages should reference immigration services as related context only.

Location pages should not pretend to be service pages.

## 20. About / Trust / Authority Schema Framework

### Current Pages

- `/about/`
- `/about/about/`
- `/about/profile/`
- `/about/story/`
- `/about/stories/`
- `/about/mission/`
- `/about/philosophy/`
- `/about/whyus/`
- `/about/values/`
- `/about/ethics/`
- `/about/results/`
- `/about/clients/`
- `/about/lawyer/`
- `/about/testimonials/`

### Current Modeling

- about hub and trust pages: `AboutPage`
- lawyer page: `AboutPage` with `Person` main entity
- testimonials page: `AboutPage` without review markup

### Trust Reinforcement Targets

- organization clarity
- named attorney clarity
- bilingual support
- legal and advisory boundary clarity
- ethical positioning
- realistic authority framing

### Next-Step Improvement

Add stronger `about` relationships and a stronger visible credential block. The page-type choices themselves are already sound.

## 21. Media And Image Schema Strategy

### Current State

- one hero `ImageObject` per built page
- current PT hero ids and languages are correct
- organization logo exists as a string URL on the organization entity
- section images are not modeled individually

### What To Keep

- hero image as the page’s primary image
- organization logo on the organization entity
- future author photo support on the person entity

### Recommended Improvement

Consider upgrading the logo from a string URL to a reusable `ImageObject` with its own `@id`, but treat this as an enhancement, not a priority issue.

### What Not To Do

Do not model the decorative section-image system as thousands of `ImageObject` nodes.

That would add noise without meaningful search value.

## 22. Editorial Vs Service Boundary Framework

### Service Pages

- purpose: commercial route or formal support offer
- primary entity: `LegalService` or `Service`
- CTA intensity: high

### Intake / Conversion Pages

- purpose: contact or consultation initiation
- primary entity: `ContactPage` or page entity about contact
- relation: consultation service and `ContactPoint`

### Editorial / Guide Pages

- purpose: explanation and planning support
- primary entity: topic or place entity
- service entities: secondary

### Legal / Policy Pages

- purpose: governance and compliance
- primary entity: policy topic
- no service markup

### FAQ Pages

- purpose: visible question-and-answer experience
- use `FAQPage` only when the page is actually FAQ-first or contains visible FAQ content

### About / Trust Pages

- purpose: organization, method, people, standards, credibility
- primary entity: `Organization` or `Person`

## 23. Cannibalization And Duplication Cleanup

### Overlap Clusters

- `naturalisation`: service family vs process topic vs insights topic
- `consultation`: advisory service vs process topic vs start-consultation page
- `regularization`: support service vs process topic
- `strategy`: advisory service vs process topic
- `compliance`: advisory service vs process topic
- `refund`: legal policy vs process topic
- `about` vs `/about/about/`
- `brazil` vs `/brazil/brazil/`
- paired visa and residency slugs:
  - nomad
  - investor
  - educational
  - exchange
  - humanitarian
  - religious
  - research
  - retiree
  - volunteer
  - work

### Current Positive Signal

The current `mainEntity` separation already helps:

- services map to service entities
- process pages map to topic entities
- about pages map to organization/person entities
- region pages map to `AdministrativeArea`

### Cleanup Rules

- each overlap page needs an explicit visible intent statement
- page titles and H1s should keep the boundary obvious
- FAQ sets should not be cloned across overlap pages
- service summaries should explain how similar routes differ

## 24. Schema Validation Framework

### Validation Workflow

1. validate JSON-LD syntax in generated HTML
2. validate eligible rich-result features in Google Rich Results Test
3. validate graph structure in Schema.org Validator
4. compare JSON-LD against visible page content
5. verify `@id` reuse and collision safety
6. verify EN/PT parity
7. verify template consistency
8. verify edge-case handling for `404.html`

### Must-Check Items

- syntax validity
- page-type correctness
- one clear `mainEntity`
- visible-content match
- FAQ visibility
- multilingual page-id correctness
- breadcrumb correctness
- reuse of global ids
- no accidental duplicate entity ids
- no unnecessary graph inflation on low-need pages

### Recommended Automation Targets

- route-by-route page-type audit
- FAQ visibility vs FAQ schema audit
- PT id and `inLanguage` audit
- duplicate-id detector
- node-count warning for oversized pages
- root 404 duplicate-id exception audit

## 25. QA Checklist

- Does the page use the correct page type?
- Does the page have one clear `mainEntity`?
- Does the page reuse the canonical organization, website, contact, and service ids?
- Does the schema match visible content exactly?
- Is FAQ markup present only when visible?
- Is review markup absent unless fully supported?
- Are EN/PT page ids localized while shared ids remain shared?
- Do breadcrumbs match the visible path?
- Is the page’s hero image correctly linked and language-tagged?
- Is this page intentionally carrying the full service-family layer, or should it be slimmer?
- If the page is editorial, does visible content justify article markup yet?
- If the page is legal/policy, is service markup being avoided?
- If the page is a 404 shell, is it noindex and treated as a special case?

## 26. Competitor-Style Schema Benchmarking

### Benchmark Snapshot

Public homepage HTML sampled on March 24, 2026:

- Fragomen:
  - JSON-LD detected
  - observed types: `Organization`, `BreadcrumbList`
- BAL:
  - JSON-LD detected
  - observed types: `WebPage`, `BreadcrumbList`, `WebSite`, `Organization`, `SiteNavigationElement`
- Boundless:
  - no homepage JSON-LD detected at fetch time
- VisaLaw:
  - JSON-LD detected
  - observed types: `WebPage`, `ImageObject`, `BreadcrumbList`, `WebSite`

### Benchmark Takeaways

- conservative schema is still common on strong immigration/legal sites
- organization, website, page, and breadcrumb markup are more common than deep service graphing
- deep public service-family graphing is still uncommon
- this site already exposes more service and entity depth than most sampled homepages

### Where immigratetobrazil.com Can Outperform

- clean service-family and child-service hierarchy
- clearer separation of service vs process vs insight vs legal pages
- consistent EN/PT shared-entity reuse
- person entity linked to trust pages and intake pages
- disciplined FAQ restraint

### Where The Site Must Stay Careful

- avoid turning “more schema” into graph noise
- avoid publishing every shared entity on every page if the page intent does not support it
- avoid upgrading topic pages into article or review types before the visible layer supports them

## 27. Legal And Non-Local Service Positioning

### Recommended Positioning

- canonical identity: `Organization`
- umbrella practice: shared `LegalService`
- family entities: `Service`
- child entities:
  - `LegalService` where formal legal handling is explicit
  - `Service` where the offering is advisory or operational support

### Geographic Positioning

- jurisdictional focus: Brazil-related immigration and nationality matters
- client support model: remote and international support by channel
- do not imply local walk-in office behavior or local-pack targeting

### What To Avoid

- `LocalBusiness` as the main brand type
- address-dependent local-office claims without visible public support
- overcommitted geographic specificity that the site does not visibly support

## 28. Claim Verification And Trust-Signal Review

### Claims Currently Safe To Support

- bilingual support
- attorney-led work
- manual review and manual confirmation
- no guaranteed outcomes
- authority-controlled outcomes
- legal and advisory boundary language

### Claims That Need Stronger Public Evidence Before Heavier Markup

- OAB status without a fuller public credential block
- testimonial-based outcome claims
- speed or success-rate implications
- supplier-identification details that are not yet visibly published

### Recommendation

Keep trust claims visible in copy.

Only promote them into richer structured data when the public page layer clearly exposes the supporting facts.

## 29. Full Developer-Ready Schema Blueprint

### Current Source Of Truth

Operational sources of truth:

- `scripts/schema-utils.js`
- `scripts/content-source-utils.js`
- `content/en/routes/**/page.json`
- `content/en/routes/**/body.html`
- `content/en/about/about.json`

Do not treat this as a source of truth:

- legacy `about.json.schemas` block

### What Should Be Generated Globally

Always or near-always reusable:

- organization
- website
- contact point
- practice entity
- service-family entities
- service-family catalog

Conditional reusable entities:

- family-specific child-service catalogs
- child service entities
- country entity
- person entity

### What Should Be Generated Per Page

- page entity
- breadcrumb
- hero image
- page-scoped topic entity where needed
- page-scoped `ItemList` where the visible section supports it
- page-scoped `FAQPage` only when visible

### Dynamic Field Mapping

- route -> page url and page `@id`
- `meta.title` -> page `name`
- `meta.description` -> page `description`
- route classification -> page type and main-entity strategy
- hero image path -> hero `ImageObject`
- breadcrumb config -> `BreadcrumbList`
- service slug -> shared child-service id
- family slug -> shared family id
- page language -> `inLanguage`
- visible FAQ block -> `FAQPage`

### Current Implementation Notes

Current route classification already does most of the hard work:

- `/` -> `WebPage`
- `/start-consultation/` -> `ContactPage`
- `/services/` -> `CollectionPage`
- `/services/{family}/` -> `CollectionPage`
- `/services/{family}/{child}/` -> `WebPage`
- `/about/**` -> `AboutPage`
- `/legal/search/` and `/brazil/search/` -> `SearchResultsPage`
- `/legal/`, `/process/`, `/insights/`, `/brazil/` hubs -> `CollectionPage`
- content detail pages -> `WebPage`

### Recommended Next Refactors

1. Keep the current id system.
2. Slim the universal graph layer so service-family nodes are not emitted on every page by default.
3. Keep full family and child-service graphing on service pages and service hubs.
4. Add a schema-audit script that reproduces counts and flags regressions.
5. Add future content fields for:
   - `publishedAt`
   - `updatedAt`
   - `author`
   - `reviewedBy`
   - attorney credentials
6. Decide whether some `Thing` entities should remain generic or get richer entity types as content evolves.
7. Either sync or remove the legacy `about.json.schemas` block to avoid internal confusion.

### Example: Child Service Page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://immigratetobrazil.com#organization",
      "name": "Immigrate to Brazil",
      "url": "https://immigratetobrazil.com",
      "contactPoint": {
        "@id": "https://immigratetobrazil.com#contact-primary"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://immigratetobrazil.com/services/visas/nomad/#webpage",
      "url": "https://immigratetobrazil.com/services/visas/nomad/",
      "name": "Nomad Visa",
      "description": "Digital nomad visa support for structured entry planning into Brazil.",
      "isPartOf": {
        "@id": "https://immigratetobrazil.com#website"
      },
      "breadcrumb": {
        "@id": "https://immigratetobrazil.com/services/visas/nomad/#breadcrumb"
      },
      "primaryImageOfPage": {
        "@id": "https://immigratetobrazil.com/services/visas/nomad/#hero-image"
      },
      "mainEntity": {
        "@id": "https://immigratetobrazil.com#service-visas-nomad"
      },
      "about": [
        {
          "@id": "https://immigratetobrazil.com#service-family-visas"
        },
        {
          "@id": "https://immigratetobrazil.com#place-brazil"
        },
        {
          "@id": "https://immigratetobrazil.com#legal-practice"
        }
      ],
      "inLanguage": "en"
    },
    {
      "@type": "LegalService",
      "@id": "https://immigratetobrazil.com#service-visas-nomad",
      "name": "Nomad Visa",
      "provider": {
        "@id": "https://immigratetobrazil.com#organization"
      },
      "areaServed": {
        "@id": "https://immigratetobrazil.com#place-brazil"
      },
      "availableLanguage": ["en", "pt-BR"],
      "isRelatedTo": {
        "@id": "https://immigratetobrazil.com#service-family-visas"
      },
      "mainEntityOfPage": {
        "@id": "https://immigratetobrazil.com/services/visas/nomad/#webpage"
      }
    }
  ]
}
```

### Example: Service Family Hub

```json
{
  "@type": "CollectionPage",
  "@id": "https://immigratetobrazil.com/services/visas/#webpage",
  "url": "https://immigratetobrazil.com/services/visas/",
  "name": "Visas",
  "mainEntity": {
    "@id": "https://immigratetobrazil.com#service-family-visas"
  },
  "hasPart": {
    "@id": "https://immigratetobrazil.com/services/visas/#page-list"
  }
}
```

### Example: Lawyer Page

```json
{
  "@type": "AboutPage",
  "@id": "https://immigratetobrazil.com/about/lawyer/#webpage",
  "url": "https://immigratetobrazil.com/about/lawyer/",
  "name": "Monique Fernandes and the legal structure behind formal immigration matters in Brazil",
  "mainEntity": {
    "@id": "https://immigratetobrazil.com#person-monique-fernandes"
  },
  "isPartOf": {
    "@id": "https://immigratetobrazil.com#website"
  },
  "primaryImageOfPage": {
    "@id": "https://immigratetobrazil.com/about/lawyer/#hero-image"
  },
  "inLanguage": "en"
}
```

```json
{
  "@type": "Person",
  "@id": "https://immigratetobrazil.com#person-monique-fernandes",
  "name": "Monique Fernandes",
  "jobTitle": "Brazilian immigration lawyer",
  "worksFor": {
    "@id": "https://immigratetobrazil.com#organization"
  },
  "knowsLanguage": ["en", "pt-BR"],
  "mainEntityOfPage": {
    "@id": "https://immigratetobrazil.com/about/lawyer/#webpage"
  }
}
```

### Example: Start Consultation

```json
{
  "@type": "ContactPage",
  "@id": "https://immigratetobrazil.com/start-consultation/#webpage",
  "url": "https://immigratetobrazil.com/start-consultation/",
  "name": "Start Consultation",
  "mainEntity": {
    "@id": "https://immigratetobrazil.com#service-advisory-consultation"
  },
  "about": [
    {
      "@id": "https://immigratetobrazil.com#contact-primary"
    },
    {
      "@id": "https://immigratetobrazil.com#legal-practice"
    }
  ],
  "inLanguage": "en"
}
```

### Priority Rollout Order

1. preserve the current id architecture
2. clean internal config drift around legacy schema seed data
3. slim the universal graph layer
4. keep strong service-family and child-service graphing on service pages
5. strengthen about relationships on graph-thin pages
6. add content fields for bylines, dates, and reviewers
7. launch true editorial schema only when the visible template supports it
8. launch state/city detail entities only when those templates exist
9. keep FAQ and review discipline intact during all future changes

## 30. Final Goal

The final structured-data system should define one coherent, attorney-led, multilingual Brazil immigration brand and one reusable entity graph that scales cleanly.

It should make search engines understand:

- who Immigrate to Brazil is
- what the organization does
- which routes are legal services
- which routes are advisory or intake flows
- which routes are editorial or process explainers
- which routes are legal/policy pages
- how service families, child services, trust pages, guides, regions, FAQs, and contact flows relate

The target is not more markup.

The target is a cleaner, safer, reusable knowledge-graph system that matches visible content, avoids duplication, avoids schema misuse, and can expand into richer editorial and location entities only when the public page layer supports them.

## Appendix A: Current Route Inventory

### Foundation

- `/`
- `/start-consultation/`
- static fallback: `/404.html`

### Services

- `/services/`
- `/services/visas/` plus 21 child pages
- `/services/residencies/` plus 17 child pages
- `/services/naturalisation/` plus 6 child pages
- `/services/defense/` plus 6 child pages
- `/services/advisory/` plus 5 child pages
- `/services/other/` plus 4 child pages

### Brazil / Relocation

- `/brazil/`
- `/brazil/brazil/`
- `/brazil/places/`
- `/brazil/states/`
- `/brazil/cities/`
- `/brazil/north/`
- `/brazil/northeast/`
- `/brazil/central-west/`
- `/brazil/southeast/`
- `/brazil/south/`
- plus living, cost, housing, safety, education, economy, healthcare, culture, cuisine, events, festivals, investment, directory, municipalities, quality, faqs, guides, search

### Process

- `/process/`
- 24 process-topic pages

### Insights

- `/insights/`
- `/insights/blog/`
- `/insights/updates/`
- `/insights/guides/`
- `/insights/general/`
- `/insights/process/`
- `/insights/visa/`
- `/insights/residency/`
- `/insights/naturalisation/`

### About

- `/about/`
- `/about/about/`
- `/about/profile/`
- `/about/story/`
- `/about/stories/`
- `/about/mission/`
- `/about/philosophy/`
- `/about/whyus/`
- `/about/values/`
- `/about/ethics/`
- `/about/results/`
- `/about/clients/`
- `/about/lawyer/`
- `/about/testimonials/`

### Legal

- `/legal/`
- `/legal/privacy/`
- `/legal/cookies/`
- `/legal/terms/`
- `/legal/payment/`
- `/legal/refund/`
- `/legal/form/`
- `/legal/gdpr/`
- `/legal/lgpd/`
- `/legal/accessibility/`
- `/legal/disclaimer/`
- `/legal/emergency/`
- `/legal/search/`
- `/legal/404/`

## Appendix B: Current Page-Type Count Snapshot

English built-page page types:

- `WebPage`: 128
- `AboutPage`: 14
- `CollectionPage`: 14
- `SearchResultsPage`: 2
- `ContactPage`: 1

English unique entity snapshot:

- shared brand / site / contact entities: 3
- shared practice / place / person entities: 3
- family `Service` entities: 6
- family-specific `OfferCatalog` entities: 6
- child `LegalService` entities: 50
- child `Service` entities: 9
- macro-region `AdministrativeArea` entities: 5
- page-scoped topic `Thing` entities: 69

## Appendix C: Current Special Cases

- `404.html` is a noindex fallback shell that reuses `/legal/404/` schema ids.
- `/legal/search/` is noindex and typed as `SearchResultsPage`.
- the homepage intentionally has no breadcrumb.
- person schema currently appears on:
  - `/about/`
  - `/about/lawyer/`
  - `/`
  - `/start-consultation/`
  because attorney-led language is visible on those pages.

## Appendix D: External References Used

Google Search Central:

- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/structured-data/faqpage
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/blog/2023/08/howto-faq-changes
- https://developers.google.com/search/blog/2024/10/sitelinks-search-box

Schema.org:

- https://schema.org/ContactPoint
- https://schema.org/LegalService
- https://schema.org/Service
- https://schema.org/AboutPage
- https://schema.org/CollectionPage
- https://schema.org/ContactPage
- https://schema.org/AdministrativeArea

Benchmark pages:

- https://www.fragomen.com/
- https://www.bal.com/
- https://www.boundless.com/
- https://www.visalaw.com/
