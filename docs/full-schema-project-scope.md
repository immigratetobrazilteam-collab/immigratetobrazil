# Full Schema Project Scope For immigratetobrazil.com

Last updated: March 24, 2026

This document is the developer-facing schema blueprint for `immigratetobrazil.com`. It is based on a repo crawl, generated-page audit, current JSON-LD review, content-template review, and a light benchmark of live immigration/legal sites.

Audit basis:

- 316 built HTML pages total
- 158 English routes in `content/en/routes/`
- 158 Portuguese built routes under `pt-br/`
- 7 English route families: `foundation`, `about`, `brazil`, `insights`, `legal`, `process`, `services`
- current schema generation driven from `content/en/about/about.json`, `content/en/routes/**/page.json`, and `scripts/content-source-utils.js`

## 1. Deep Sitewide Schema Audit

### Crawl Summary

- English family counts:
  - `foundation`: 2 pages
  - `about`: 14 pages
  - `brazil`: 28 pages
  - `insights`: 9 pages
  - `legal`: 14 pages
  - `process`: 25 pages
  - `services`: 66 pages
- Built HTML mirrors all 158 English routes into Portuguese.
- Every built page has a hero image.
- Every built page also carries section-image decorations in generated HTML.
- Current built section-image volume is large: 2,976 decorated section-image instances across EN/PT.

### Page Template Reality

Current live template groups are:

- homepage
- start-consultation intake page
- service family home
- service hubs
- service child pages
- about hub
- about trust pages
- lawyer profile page
- testimonials page
- brazil hub pages
- long-form brazil guidance pages
- insights hub pages
- process hub and process explainer pages
- legal hub
- legal policy pages
- internal search pages
- 404 page

Not currently present as dedicated templates:

- standalone `/contact/` page
- standalone commercial landing-page family outside current service/intake pages
- individual state detail pages
- individual city detail pages
- single dated blog-post template

### Reusable Section Inventory

Most pages are built from a stable reusable section system:

- `hero` on all 158 English source pages
- `content-block intro-block` on all 158 English source pages
- `content-block flow-section topic-section topic-section--split` used 446 times
- `content-block flow-section topic-section topic-section--frame` used 443 times
- `content-block flow-section topic-section topic-section--band` used 437 times
- `lead-form-block` used on 159 built pages across EN/PT
- `faq-block` used on only 13 English source pages
- `content-block highlight-block` used 17 times
- `trust-marker-block` used once
- `testimonial-strip` used once
- `search-results-shell` on search utility templates

Common reusable partials:

- `site-navigation`
- `breadcrumbs`
- `sidebar-shell`
- `official-resources`
- `related-links`
- `site-footer`
- `floating-whatsapp`

### Current Schema Inventory

Shared objects currently injected on every generated page:

- `Organization`
- `ContactPoint`

English page-level object counts:

- `BreadcrumbList`: 157
- `WebSite`: 1
- `LocalBusiness`: 1
- `WebPage`: 11
- `Article`: 58
- `LegalService`: 60
- `FAQPage`: 141
- `ImageObject`: 158

### Current Strengths

- Stable shared `Organization` and `ContactPoint` ids already exist.
- Breadcrumb coverage is nearly complete.
- The site has clean EN/PT route mirroring.
- Service, process, legal, and trust content is already strong enough to support a better entity graph.
- Hero image coverage is consistent and technically easy to keep.

### Current Weaknesses

- 28 English pages in the `about` and `legal` families have no real primary page entity beyond `BreadcrumbList` and `ImageObject`.
- missing primary page entity pages:
  - `/about/`
  - `/about/about/`
  - `/about/clients/`
  - `/about/ethics/`
  - `/about/lawyer/`
  - `/about/mission/`
  - `/about/philosophy/`
  - `/about/profile/`
  - `/about/results/`
  - `/about/stories/`
  - `/about/story/`
  - `/about/testimonials/`
  - `/about/values/`
  - `/about/whyus/`
  - `/legal/`
  - `/legal/404/`
  - `/legal/accessibility/`
  - `/legal/cookies/`
  - `/legal/disclaimer/`
  - `/legal/emergency/`
  - `/legal/form/`
  - `/legal/gdpr/`
  - `/legal/lgpd/`
  - `/legal/payment/`
  - `/legal/privacy/`
  - `/legal/refund/`
  - `/legal/search/`
  - `/legal/terms/`
- 58 `Article` objects are missing article-grade properties such as `headline`, `author`, `publisher`, `datePublished`, `dateModified`, `image`, and `mainEntity`.
- 60 `LegalService` objects are missing stable `@id`, and almost all are missing stronger service semantics such as `serviceType`, `areaServed`, `availableLanguage`, `audience`, and `hasOfferCatalog`.
- 11 `WebPage` objects are missing `@id`, `isPartOf`, `breadcrumb`, `primaryImageOfPage`, and `inLanguage`.
- 129 current page entities have no `mainEntity`, so the graph is page-snippet-driven rather than entity-driven.
- `mainEntityOfPage` is usually a plain string URL instead of a referenced page object.
- FAQ is heavily overused. There are 141 English `FAQPage` objects, but only 13 English source pages with a visible `faq-block`.
- visible FAQ pages today:
  - `/`
  - `/start-consultation/`
  - `/legal/accessibility/`
  - `/legal/cookies/`
  - `/legal/disclaimer/`
  - `/legal/emergency/`
  - `/legal/form/`
  - `/legal/gdpr/`
  - `/legal/lgpd/`
  - `/legal/payment/`
  - `/legal/privacy/`
  - `/legal/refund/`
  - `/legal/terms/`
- The homepage uses `LocalBusiness` without a visible postal address. That is weak and unnecessary.
- The lawyer page names a real person, `Monique Fernandes`, but no `Person` entity exists.
- The site claims attorney-led and OAB-linked work in visible copy, but structured data does not model that trust layer.
- There is no dedicated contact-page template. Contact flow is split across homepage form, intake form, WhatsApp, sidebars, and legal policy pages.

### Portuguese Layer Audit

- All 158 Portuguese pages currently use hero `ImageObject` entries with `inLanguage: "en"`.
- All 158 Portuguese pages currently use non-PT hero image ids such as `https://immigratetobrazil.com/about/lawyer/#hero-image`.
- All 158 Portuguese pages currently change `Organization.url` to the `/pt-br/` folder instead of keeping the organization entity language-neutral.
- Page URLs inside PT `WebPage` / `Article` / `LegalService` objects are correctly PT-localized.

## 2. Page Template Schema Mapping

| Template | Current status | Recommended primary page markup | Supporting markup | Notes |
| --- | --- | --- | --- | --- |
| Homepage `/` | current | `WebPage` | `WebSite`, `Organization`, `ContactPoint`, `BreadcrumbList` optional, `ImageObject`, selective `FAQPage` | remove `LocalBusiness`; homepage is not a local-office page |
| Service family home `/services/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList`, family entities | this page should organize families, not behave like one service |
| Service hub pages `/services/{family}/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList`, shared family entity | use hub pages to expose taxonomy and child-service relationships |
| Visa pages | current | `WebPage` with `mainEntity` = `LegalService` | `BreadcrumbList`, `ImageObject`, optional `FAQPage` only when visible | use distinct entities for each visa route |
| Residency pages | current | `WebPage` with `mainEntity` = `LegalService` | `BreadcrumbList`, `ImageObject`, optional `FAQPage` only when visible | keep visa and residency entities separate even when slugs match |
| Citizenship / naturalisation hub | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList`, family entity | hub should not be typed as one service |
| Citizenship / naturalisation child pages | current | `WebPage` with `mainEntity` = `LegalService` | `BreadcrumbList`, `ImageObject`, optional `FAQPage` only when visible | use service entities for ordinary, extraordinary, special, etc. |
| Defense / legal support hub | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList`, family entity | high-risk family should still use hub semantics |
| Defense / legal support child pages | current | `WebPage` with `mainEntity` = `LegalService` | `BreadcrumbList`, `ImageObject`, selective `FAQPage` | best place for explicit legal-service modeling |
| Advisory hub | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList`, family entity | advisory is a service family, not an article |
| Advisory child pages | current | `WebPage` with `mainEntity` = `Service` | `BreadcrumbList`, `ImageObject`, selective `FAQPage` | use generic `Service` for mixed advisory/support work unless formal legal scope is explicit |
| About hub `/about/` | current | `AboutPage` or `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList` | current page is missing a page entity entirely |
| About trust pages | current | `AboutPage` | `BreadcrumbList`, `ImageObject`, references to `Organization`, `Person`, service families | `whyus`, `ethics`, `values`, `mission`, `story`, etc. |
| Lawyer profile page `/about/lawyer/` | current | `AboutPage` with `mainEntity` = `Person` | `BreadcrumbList`, `ImageObject`, `Organization`, practice entity | should become the canonical attorney page |
| Testimonials page `/about/testimonials/` | current | `AboutPage` or `WebPage` | `BreadcrumbList`, `ImageObject` | no review markup in phase 1 |
| Legal hub `/legal/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList` | this is a legal-notices collection page |
| Legal / policy pages | current | `WebPage` | `BreadcrumbList`, `ImageObject`, selective `FAQPage` only when visible | do not type policy pages as `Article` or `LegalService` |
| FAQ hub pages | current but limited | `FAQPage` only when visible Q&A is the page's actual structure | `BreadcrumbList`, `ImageObject` | `/brazil/faqs/` can use `FAQPage` if the questions are visible and unique |
| Insights hub `/insights/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList` | current page is a topical hub, not a single article |
| Insight topic pages | current | `CollectionPage` or `WebPage` in phase 1 | `BreadcrumbList`, `ImageObject`, optional article upgrade later | current pages are not true dated articles yet |
| Future single blog / editorial posts | future-ready | `BlogPosting` or `Article` | `BreadcrumbList`, `ImageObject`, `author`, `publisher`, dates, `about` refs | requires visible byline and date modules |
| Brazil hub `/brazil/` and `/brazil/places/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList` | these are navigation hubs |
| Country / relocation guide detail pages | current | `WebPage` in phase 1, `Article` in phase 2 once bylines and dates exist | `BreadcrumbList`, `ImageObject`, `about` Place and topic entities | current `brazil/*` explainers are guide-like but under-modeled |
| State hub `/brazil/states/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList` | current page is a hub, not a state detail page |
| Future state detail pages | future-ready | `WebPage` with `mainEntity` = `AdministrativeArea` | `BreadcrumbList`, `ImageObject`, optional `ItemList` | connect place entity to relevant service families via `about`/`mentions` |
| City hub `/brazil/cities/` | current | `CollectionPage` | `BreadcrumbList`, `ImageObject`, `ItemList` | current page is a hub, not a city detail page |
| Future city detail pages | future-ready | `WebPage` with `mainEntity` = `City` | `BreadcrumbList`, `ImageObject` | keep city pages place-centered, not service-centered |
| Start consultation `/start-consultation/` | current | `ContactPage` | `BreadcrumbList`, `ImageObject`, `ContactPoint`, consultation service entity, visible FAQ if retained | this page is intake-first, not just a service page |
| Legal form policy `/legal/form/` | current | `WebPage` | `BreadcrumbList`, `ImageObject`, visible `FAQPage` optional | policy page about forms, not the actual contact page |
| Search pages | current | `WebPage` | `BreadcrumbList`, `ImageObject` | utility page, not article/service/FAQ |
| Landing pages | future-ready | `WebPage` with one clear `mainEntity` | `BreadcrumbList`, `ImageObject` | use same rules as service or editorial pages, depending intent |

## 3. Full Entity Architecture

### Core entities that should exist

- `Organization`: Immigrate to Brazil as the canonical brand and operating entity.
- `WebSite`: the site as a searchable publishing surface.
- `ContactPoint`: primary support / intake contact entity.
- `Service` / `LegalService`: one practice-level service node plus family and child service entities.
- `Person`: Monique Fernandes as the named attorney profile.
- `CollectionPage` entities: hubs for services, legal notices, insights, and location navigation.
- `Place` entities: Brazil as a country entity, macro-regions as `AdministrativeArea`, future state and city entities as those templates are created.
- `FAQ` entities: page-scoped `Question` objects only where visible.
- `ImageObject`: hero images, logo, and future author headshots.
- `Testimonial` / `Review`: future-only, contingent on stronger visible evidence.

### Service entity set

Family entities:

- visas
- residencies
- naturalisation
- defense
- advisory
- other support services

Child entities:

- visas: artistic, business, diplomatic, educational, exchange, family, humanitarian, investor, journalist, medical, nomad, religious, research, retiree, sports, startup, student, tourist, transit, volunteer, work
- residencies: CPLP, educational, exchange, health, humanitarian, investor, MERCOSUL, nomad, religious, research, retiree, reunion, skilled, study, volunteer, work, youth
- naturalisation: ordinary, extraordinary, provisional, special, renunciation, reacquisition
- defense: appeals, deportation, expulsion, extradition, fines, litigation
- advisory: consultation, strategy, compliance, representation, corporate
- other: consular, records, regularization, translation

### Non-service content entities

- process topics: aftercare, alone, approval, assessment, compliance, consultation, conversion, deadlines, failures, fees, filing, mistakes, naturalisation, obligations, permanent, planning, refund, regularization, renewal, responsibilities, rights, strategy, timeline, transparency
- insights clusters: blog, updates, guides, general, process, visa, residency, naturalisation
- brazil clusters: brazil, places, states, cities, north, northeast, central-west, southeast, south, living, cost, housing, safety, education, economy, healthcare, culture, cuisine, events, festivals, investment, directory, municipalities, quality, faqs, search
- about / trust clusters: about, profile, story, stories, mission, whyus, values, ethics, results, clients, lawyer, testimonials
- legal / policy clusters: privacy, cookies, terms, payment, refund, form, gdpr, lgpd, accessibility, disclaimer, emergency, search, 404

### Relationship rules

- `Organization` owns `WebSite`.
- `Organization` operates the practice entity.
- `Person` works for or is associated with `Organization`.
- practice entity has service-family entities.
- service-family entities have child-service entities.
- service pages point to shared service entities via `mainEntity`.
- hub pages point to family or collection entities via `mainEntity`.
- about pages point to `Organization` or `Person`.
- editorial and process pages point to topic entities via `mainEntity`, and to related service or place entities via `about` / `mentions`.
- legal pages point to `Organization`, `ContactPoint`, and policy-topic entities via `about`.

## 4. Knowledge Graph Design

### Graph spine

Recommended graph spine:

`Organization` -> `WebSite` -> page entities -> main entity -> supporting entities

Expanded:

- `Organization` -> publishes -> `WebSite`
- `Organization` -> provides -> practice entity
- practice entity -> hasOfferCatalog -> service families
- service family -> itemListElement -> child services
- `Person` -> worksFor -> `Organization`
- page entity -> isPartOf -> `WebSite`
- page entity -> mainEntity -> service / person / place / policy / collection entity
- page entity -> breadcrumb -> `BreadcrumbList`
- page entity -> primaryImageOfPage -> `ImageObject`
- page entity -> about / mentions -> related services, places, process topics, or policies
- `FAQPage` -> `Question` -> about -> the page's true main entity

### Intent separation inside the graph

- service pages must point to service entities
- editorial pages must point to editorial topic entities, then mention services secondarily
- legal pages must point to policy entities, not to service entities
- about pages must point to organization or person entities
- location pages must point to place entities first, then mention immigration services only as secondary related context

### Why the current graph is not enough

The current system mostly publishes isolated snippets:

- organization
- contact point
- page breadcrumb
- one weak page type
- FAQ
- hero image

That helps parsers find fragments, but it does not tell search engines how pages, services, people, trust pages, legal notices, intake flows, and location content belong to the same knowledge graph.

## 5. Internal Entity ID / `@id` System

### Rule set

- Use root-fragment ids for global, language-neutral entities.
- Use page-fragment ids for language-specific page entities.
- Use page-fragment ids for page-scoped breadcrumbs, FAQs, and hero images.
- Never use the same `@id` for two different semantic roles.
- Never create separate EN/PT ids for the same organization, contact point, person, service family, or child service.
- Do not use page URLs as both page ids and main-entity ids.

### Global id pattern

Use language-neutral root ids like:

- `https://immigratetobrazil.com#organization`
- `https://immigratetobrazil.com#website`
- `https://immigratetobrazil.com#contact-primary`
- `https://immigratetobrazil.com#practice`
- `https://immigratetobrazil.com#person-monique-fernandes`
- `https://immigratetobrazil.com#service-family-visas`
- `https://immigratetobrazil.com#service-visa-nomad`
- `https://immigratetobrazil.com#service-residency-nomad`
- `https://immigratetobrazil.com#service-naturalisation-ordinary`
- `https://immigratetobrazil.com#service-defense-deportation`

### Page id pattern

Use language-specific page ids:

- English page: `https://immigratetobrazil.com/services/visas/nomad/#webpage`
- Portuguese page: `https://immigratetobrazil.com/pt-br/services/visas/nomad/#webpage`

Derived page-scoped ids:

- breadcrumb: `.../#breadcrumb`
- hero image: `.../#hero-image`
- FAQ item 1: `.../#faq-1`
- FAQ item 2: `.../#faq-2`
- consultation form block: `.../#consultation-form`

### ID mapping rules for duplicated slugs

These must not collapse into one id:

- `nomad visa` vs `nomad residency`
- `consultation` service vs `consultation` process topic vs `start consultation` intake page
- `regularization` service vs `regularization` process topic
- `naturalisation` service family vs `naturalisation` insights topic vs `naturalisation` process topic

## 6. Sitewide Core Schema Layer

### Foundation layer

Recommended foundation objects:

1. `Organization`
2. `WebSite`
3. `ContactPoint`
4. page entity (`WebPage`, `CollectionPage`, `AboutPage`, or `ContactPage`)
5. `BreadcrumbList`
6. `ImageObject`

Conditional foundation object:

- practice-level `LegalService` or `Service`

### Core layer decisions

- Keep `Organization` as the canonical identity node.
- Replace the current homepage `LocalBusiness`.
- Keep `WebSite` on the homepage and reference it from all page entities using `isPartOf`.
- Keep one primary `ContactPoint` entity reused across the site.
- Add one shared practice entity for the attorney-led immigration practice.
- Add one shared `Person` entity for `Monique Fernandes` once the credential block is finalized.

### Search-action note

Keep `WebSite` because it helps site identity and site-name understanding.

Do not treat sitelinks search box as a 2026 rich-result target. Google retired that visual feature starting November 21, 2024.

### Language note

For `ContactPoint.availableLanguage`, use language codes or explicit language entities consistently. Do not mix English text on EN pages and translated labels on PT pages while keeping the same global id.

Preferred values:

- `en`
- `pt-BR`

## 7. Section-Level Schema Blueprint

| Section type | Schema? | Recommended approach | Notes |
| --- | --- | --- | --- |
| Hero | yes, indirectly | page entity + `ImageObject` + `primaryImageOfPage` | do not create a separate page-type object just for hero copy |
| Intro / value proposition | no standalone block | fold into page `description`, `about`, and main entity fields | visible copy still matters for support |
| Service family grid | yes, selectively | `ItemList` on hubs or `hasOfferCatalog` on family entity | only when cards are visible and curated |
| Quick navigation block | sometimes | `ItemList` only if order and membership are editorially meaningful | skip for tiny utility nav |
| FAQ section | yes, only when visible | `FAQPage` with page-scoped `Question` ids | current site overuses this badly |
| Testimonial section | not in phase 1 | plain visible content; future `Review` only if stronger evidence exists | no `AggregateRating` now |
| Trust / authority section | no standalone block | use `Organization`, `Person`, `reviewedBy`, and page copy | trust lives in the graph spine, not in isolated snippets |
| Contact section | yes, via shared entity | reference shared `ContactPoint` from the page | do not emit duplicate contact objects per CTA card |
| Consultation CTA | no standalone block | keep inside page copy | CTAs are not separate entities |
| Inquiry form | page-level only | use `ContactPage` on true intake pages; do not mark up Formspree endpoint | page can still link to consultation service entity |
| Comparison table | future-only | use `Table` or `ItemList` only if actual comparison tables are added | current site has no real comparison tables |
| State / city snapshot | future-only | use `AdministrativeArea` / `City` on detail pages | current `/states/` and `/cities/` are hubs |
| Editorial callout | no | keep plain HTML | low semantic value |
| Internal link hub | yes, selectively | `ItemList` on major hub sections | useful on `/services/`, `/legal/`, `/brazil/` |
| Official resource list | usually no | optional `ItemList` if needed for internal QA only | do not over-model outbound citations |

## 8. Advanced Service Modeling

### Parent service model

Top-level commercial umbrella:

- Immigration to Brazil practice

Service families:

- Visas
- Residencies
- Naturalisation
- Defense
- Advisory
- Other support services

### Child-service hierarchy

Visas:

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

Residencies:

- CPLP
- educational
- exchange
- health
- humanitarian
- investor
- MERCOSUL
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

Naturalisation:

- ordinary
- extraordinary
- provisional
- special
- renunciation
- reacquisition

Defense:

- appeals
- deportation
- expulsion
- extradition
- fines
- litigation

Advisory:

- consultation
- strategy
- compliance
- representation
- corporate

Other support:

- consular
- records
- regularization
- translation

### Commercial vs educational boundaries

- commercial service pages: `/services/**`
- public process explainers: `/process/**`
- public editorial explainers: `/insights/**`
- public location / relocation explainers: `/brazil/**`
- intake / conversion: `/start-consultation/`
- legal / policy: `/legal/**`

### Modeling rule

Every commercial route gets one canonical service entity.

Supporting pages do not create duplicate service entities. They reference the service entity with:

- `about`
- `mentions`
- `isRelatedTo`

## 9. Service Taxonomy Framework

### Taxonomy levels

- Level 0: organization / practice
- Level 1: service family
- Level 2: service offering
- Level 3: page instance by language and intent
- Level 4: supporting educational clusters
- Level 5: location context

### Taxonomy naming rules

- Use canonical English labels for shared service ids.
- Use localized page names for EN/PT page entities.
- Use singular service entities even when hub pages are plural.
- Keep service-family hubs plural, child-service entities singular.
- Separate legal route entities from editorial topic entities even when the visible label matches.

### Taxonomy consistency rules

- one family per child service
- no service entity should belong to two families
- location pages never become child-service entities
- legal notices never become service entities
- intake pages never replace the consultation service entity

## 10. Multilingual Schema Plan

### Shared across EN/PT

These ids must be identical across English and Portuguese:

- organization
- website
- contact point
- practice entity
- person entity
- service families
- child services

### Language-specific

These ids must be language-specific:

- page entities
- page breadcrumbs
- page hero images
- FAQ item ids
- page-scoped `ItemList` objects

### Required multilingual rules

- use `inLanguage: "en"` on English page objects and page-scoped images
- use `inLanguage: "pt-BR"` on Portuguese page objects and page-scoped images
- keep `Organization.url` on the root domain, not `/pt-br/`
- keep page canonical urls language-appropriate
- keep `hreflang` and page schema aligned
- use the same service/person ids on EN/PT variants
- use PT-localized page names, breadcrumbs, and FAQ text on PT pages

### Current multilingual fixes required

- fix all 158 PT hero `ImageObject` language values
- fix all 158 PT hero image ids
- stop fragmenting the organization entity by language-folder url
- normalize `ContactPoint.availableLanguage`

## 11. Advanced FAQ Schema Strategy

### Current state

- English `FAQPage` count: 141
- English visible `faq-block` count: 13
- visible FAQ usage is concentrated on the homepage, intake page, and legal-policy pages rather than on service or guide templates

This means FAQ is currently being used on many pages without visible matching FAQ sections. That is the single biggest visible-content mismatch in the current schema implementation.

### Recommended policy

Use `FAQPage` only when:

- the page has visible FAQ content
- the questions are unique to that page or template
- the answers are stable, public, and non-case-specific
- the Q&A is part of the main user experience, not hidden boilerplate

Strong candidates:

- homepage, if the visible FAQ block remains
- `/start-consultation/`
- `/legal/form/`
- selected legal policy pages with visible FAQ blocks
- `/brazil/faqs/` if it remains a true FAQ page

Weak candidates:

- repetitive service-child pages with cloned three-question sets
- editorial hubs with generic "when should I contact you" questions
- process pages without visible accordion or FAQ formatting

### Search-result realism

FAQ markup may still help entity understanding, but Google has sharply limited FAQ rich results. Current Google guidance says FAQ rich results are mainly shown for well-known government and health sites, not typical commercial legal sites.

Result:

- use FAQ for semantic clarity only where content truly supports it
- do not build the schema program around FAQ rich-result expectations

## 12. Testimonial / Review Schema Strategy

### Current state

- testimonials exist visibly on the homepage and `/about/testimonials/`
- the current site does not expose structured review markup
- testimonial content lacks dates, rating values, and item-reviewed metadata

### Recommended phase-1 policy

- no `AggregateRating`
- no `Review` on the organization
- no review-rich-result targeting for service or organization pages

Why:

- Google does not show self-serving review snippets for `Organization` and `LocalBusiness`
- the visible testimonial data is not yet structured enough for safe review markup

### Future-safe policy

Only add `Review` if the page visibly provides:

- reviewer name or stable alias
- review body
- item reviewed
- review date
- clear consent / provenance policy

Even then:

- keep reviews page-specific
- do not use `AggregateRating` until there is a consistent, countable, auditable ratings system

## 13. Contact, Consultation, and Inquiry Flow Schema

### Current contact-flow reality

There is no dedicated `/contact/` page.

Current lead / intake touchpoints:

- homepage compact inquiry form
- `/start-consultation/` full intake form
- `/legal/form/` intake-policy page
- repeated consultation CTA blocks
- email contact
- WhatsApp / phone contact
- `floating-whatsapp`

Form endpoint currently used:

- homepage: `https://formspree.io/f/xdawygld`
- start-consultation: `https://formspree.io/f/xdawygld`

### Recommended modeling

- shared `ContactPoint` as canonical contact entity
- `/start-consultation/` as `ContactPage`
- consultation service entity linked from `/start-consultation/`
- `/legal/form/` as `WebPage` about intake policy, not a contact-page replacement
- homepage references `ContactPoint` and consultation service, but stays a homepage

### Low-priority markup

Avoid over-modeling:

- third-party form endpoints
- every CTA card
- floating WhatsApp widget as a separate entity

## 14. Legal Compliance Schema Strategy

### Legal hub

- `/legal/` should be `CollectionPage`
- its visible notice cards can be represented as `ItemList`

### Legal policy pages

Use:

- `WebPage`
- `BreadcrumbList`
- `ImageObject`
- `FAQPage` only where a visible FAQ block exists

Do not use:

- `Article` by default
- `LegalService`
- `Review`
- `AggregateRating`

### YMYL support fields

Add visible fields before richer policy schema:

- effective date
- last reviewed date
- legal / editorial reviewer
- contact route for policy questions
- supplier-identification details if legal sign-off allows publication

## 15. Content-to-Schema Gap Analysis

### High-priority gaps

- about and legal pages are missing true page entities
- FAQ markup often does not match visible content
- insights / process / guide pages lack visible author modules
- insights / process / guide pages lack visible published and modified dates
- there is no true single-post editorial template yet, so current `Article` usage is structurally premature
- lawyer page lacks visible structured credential block rich enough for a strong person entity
- homepage trust claims are stronger than the supporting structured data
- no dedicated contact-page template exists
- no address or legal supplier details are visibly published for stronger business/service typing

### Medium-priority gaps

- no consistent reviewed-by module on YMYL content
- no visible state or city structured-summary modules because detail pages do not exist yet
- testimonials lack dates and provenance
- service hubs do not expose an explicit visible taxonomy module beyond cards

### Graph-quality gaps

- no shared service-family ids
- no child-service ids
- no person entity
- no place entity layer
- no clean `mainEntity` / `about` relationships on most pages

## 16. Schema-Safe Content Recommendations

- Add visible author and reviewer modules on editorial, process, and policy pages.
- Add visible `Published` and `Last reviewed` dates where freshness matters.
- Add a reusable attorney credentials block on homepage and lawyer page.
- If legally acceptable, publish OAB/PR registration details in a controlled trust module.
- Add a standardized visible contact / support module with email, phone, business hours, and languages.
- Only keep FAQ on pages where a visible accordion or FAQ block exists.
- Add explicit "who this is for / not for / next step" modules on service pages.
- Add family-relationship copy on overlapping pages such as nomad visa vs nomad residency.
- If review markup is ever desired, add visible testimonial dates, reviewer consent policy, and item-reviewed structure first.
- If future state and city pages are launched, add visible structured overview modules so place entities are well supported.

## 17. Rich Result Opportunity Map

| Feature | Realistic? | Priority | Notes |
| --- | --- | --- | --- |
| Breadcrumb rich results | yes | high | current site is already close |
| Organization / logo understanding | yes | high | especially for homepage and about/lawyer |
| Article rich results | future-only | medium | requires true article templates with byline/date/image discipline |
| FAQ rich results | low | low | Google now limits FAQ rich results heavily for non-government/non-health sites |
| Review rich results | not a target | low | self-serving org/business review snippets are not a safe target |
| Sitelinks search box | no | none | Google retired this in November 2024 |
| Place/entity understanding | yes, but not classic rich result | medium | useful for location hubs and future state/city pages |
| ContactPoint understanding | yes, but not classic rich result | medium | helpful for machine understanding, not a featured SERP objective |

## 18. Editorial / Insights Schema Strategy

### Current-state recommendation

The current `insights` pages are topic hubs and explainers, not true single posts.

Use in phase 1:

- `/insights/`: `CollectionPage`
- `/insights/{topic}/`: `CollectionPage` or `WebPage`

Do not force `Article` on these templates until the visible page components support:

- author
- publisher
- date published
- date modified
- representative image

### Future editorial model

For future single editorial pages:

- use `BlogPosting` for blog-style posts
- use `Article` for evergreen explainers
- use `NewsArticle` only for true time-sensitive reporting

Article pages should connect to:

- service entities via `about`
- location entities via `about` / `mentions`
- organization via `publisher`
- person via `author` and optional `reviewedBy`

## 19. Guide, State, and City Content Schema Strategy

### Current guide model

Current location / relocation content splits into:

- country and hub pages
- macro-region pages
- evergreen topic guides
- state and city hubs

### Recommended entity model

- Brazil: `Country`
- regions: `AdministrativeArea`
- future state pages: `AdministrativeArea`
- future city pages: `City`

### Page model

- `/brazil/`, `/brazil/places/`, `/brazil/states/`, `/brazil/cities/`: `CollectionPage`
- macro-region pages: `WebPage` with `mainEntity` = region entity
- evergreen topic guides such as cost, safety, housing, healthcare: `WebPage` in phase 1, optional `Article` in phase 2

### Connection rule

Location pages should connect to immigration services through `about` or `mentions`, not by pretending the page itself is a service page.

Example:

- `brazil/cities/` may mention `nomad residency`, `investor residency`, or `family visa` as related planning context
- it should not use those service entities as its primary page type

## 20. About / Trust / Authority Schema Framework

### Current pages

- `/about/`
- `/about/about/`
- `/about/profile/`
- `/about/story/`
- `/about/stories/`
- `/about/mission/`
- `/about/whyus/`
- `/about/values/`
- `/about/ethics/`
- `/about/results/`
- `/about/clients/`
- `/about/lawyer/`
- `/about/testimonials/`

### Recommended model

- about hub: `AboutPage` or `CollectionPage`
- about trust pages: `AboutPage`
- lawyer page: `AboutPage` + `Person`
- testimonials page: `AboutPage` with visible testimonial content only

### Trust reinforcement targets

- organization clarity
- named attorney entity
- service legitimacy
- bilingual support
- legal / advisory boundary clarity
- authority and ethics signals

## 21. Media and Image Schema Strategy

### Keep

- hero `ImageObject` on indexable pages
- organization logo on the organization entity
- future author photos on person entities

### Fix

- page-scoped hero image ids on PT pages
- `inLanguage` on all page-scoped hero images
- `primaryImageOfPage` link from page objects

### Do not do in phase 1

Do not emit 2,976 section-image `ImageObject` nodes across the site.

Reason:

- the graph would become noisy
- these images are decorative support assets, not primary page entities
- hero images, logo, and future author photos are the high-value media objects

## 22. Editorial vs Service Boundary Framework

### Service pages

- purpose: commercial route or support offering
- primary entity: `Service` or `LegalService`
- CTA intensity: high

### Commercial landing / intake pages

- purpose: contact or conversion
- primary entity: `ContactPage` or `WebPage`
- main relation: consultation service + contact point

### Editorial / guide pages

- purpose: public explanation
- primary entity: topic or place page
- service entities stay secondary

### Legal / policy pages

- purpose: platform governance and compliance
- primary entity: policy page
- no service markup

### FAQ pages

- purpose: visible Q&A
- only use `FAQPage` when the page is truly Q&A-first

### About / trust pages

- purpose: organization, attorney, method, standards
- primary entity: `Organization` or `Person`

## 23. Cannibalization and Duplication Cleanup

### Current overlap clusters

- `naturalisation`: insights vs process vs service family
- `consultation`: process vs advisory service vs start-consultation page
- `regularization`: process vs support service
- `strategy`: process vs advisory service
- `compliance`: process vs advisory service
- `refund`: legal policy vs process concept
- `about` vs `/about/about/`
- `brazil` vs `/brazil/brazil/`
- `nomad`, `investor`, `educational`, `exchange`, `humanitarian`, `religious`, `research`, `retiree`, `volunteer`, `work`: visa vs residency versions

### Cleanup rules

- each overlapping page needs a distinct visible intent statement
- each overlapping page needs a distinct main entity
- duplicated FAQ sets must be removed
- duplicated service descriptions must be differentiated
- page titles and H1s should make the boundary obvious

### High-risk overlap pairs

- `/about/` vs `/about/about/`
- `/brazil/` vs `/brazil/brazil/`
- `/process/consultation/` vs `/services/advisory/consultation/` vs `/start-consultation/`

These should be explicitly disambiguated in page copy and schema.

## 24. Schema Validation Framework

### Validation workflow

1. validate JSON-LD syntax in generated HTML
2. validate supported rich-result features in Google's Rich Results Test
3. validate graph completeness in Schema.org Validator
4. compare JSON-LD to visible page content
5. check entity-id reuse and collision risk
6. check EN/PT parity
7. check template consistency across all generated pages

### What must be checked

- syntax validity
- page-type correctness
- `@id` uniqueness
- reuse of global entities
- visible-content match
- FAQ visibility
- breadcrumb accuracy
- language accuracy
- correct canonical / localized page references

### Template consistency checks

- all service child pages use the same service-page scaffold
- all hub pages use the same hub-page scaffold
- all policy pages use the same policy scaffold
- lawyer/about pages point to organization/person entities consistently

## 25. QA Checklist

- Does the page use the correct page type?
- Does the page have one clear `mainEntity`?
- Do all global entities reuse the same `@id` values?
- Does the page reference the shared organization and contact point correctly?
- Does the schema match visible content exactly?
- Are FAQ and review objects used only where the content visibly supports them?
- Are EN/PT page ids localized while shared entities remain shared?
- Are breadcrumbs accurate and page-specific?
- Are article pages carrying visible authorship and dates before `Article` is used?
- Are lawyer and trust claims linked to the correct person and organization entities?
- Are hero images linked with correct language and page ids?
- Are there any duplicate service entities caused by overlapping slugs?

## 26. Competitor-Style Schema Benchmarking

### Sites sampled

Sampled public pages on:

- `https://www.fragomen.com/`
- `https://www.fragomen.com/countries/united-states.html`
- `https://www.bal.com/`
- `https://www.bal.com/perspectives-and-news/`
- `https://www.boundless.com/`
- `https://www.boundless.com/immigration-resources/`
- `https://www.visalaw.com/`
- `https://www.visalaw.com/category/immigration-news/`

### Benchmark observations

- sampled immigration/legal sites were generally conservative with schema
- breadcrumb usage was common
- organization-level data was common
- deep service graphing was uncommon in public source HTML
- strong multilingual id reuse was not obvious in the sampled set
- sampled sites did not show the kind of attorney + service-family + editorial + location graph that this site can implement

### Where immigratetobrazil.com can outperform

- clearer service-family hierarchy
- stronger distinction between service, process, editorial, and legal pages
- cleaner EN/PT entity reuse
- explicit attorney entity connected to trust pages and legal-service pages
- safer FAQ and review restraint
- stronger page-to-service and page-to-place relationships

## 27. Legal and Non-Local Service Positioning

### Recommended positioning

- canonical identity: `Organization`
- commercial practice model: one shared practice entity
- service families: `Service` / `LegalService` children depending scope

### Type recommendation

Use `LegalService` for:

- visa route execution
- residency route execution
- nationality / naturalisation routes
- defense and enforcement matters
- any page where formal legal handling is clearly visible in the copy

Use generic `Service` for:

- consultation
- strategy
- compliance monitoring
- corporate support
- records
- translation
- consular support
- other mixed advisory / coordination offerings

### Geographic positioning

- serve Brazil-related matters
- support international clients remotely
- do not invent local-office schema or local-pack signals
- use `areaServed` carefully: Brazil as service jurisdiction, plus international client support by channel

### What to avoid

- `LocalBusiness` as the main brand type without public address details
- overly narrow city-based claims
- any markup that implies local walk-in office behavior not visible on the site

## 28. Claim Verification and Trust-Signal Review

### Claims currently visible and usable

- licensed Brazilian attorney
- OAB / OAB-registered lawyer
- bilingual consultations in English and Portuguese
- manual review and manual confirmation
- no false guarantees
- authority-controlled outcomes

### Claims that are safe for schema support

- bilingual support
- manual review / confirmation flow
- named attorney identity
- legal and advisory boundary language
- authority-control disclaimers

### Claims that need stronger visible evidence before heavier markup

- OAB status without a visible registration number or formal credential block
- testimonial-based outcomes
- any implied speed, approval likelihood, or success-rate claims
- any supplier-identification details needed for stronger business/service schema

### Recommendation

Keep trust claims visible, but only upgrade them into richer structured data after the public page layer exposes the supporting facts cleanly.

## 29. Full Developer-Ready Schema Blueprint

### What should be generated globally

- shared organization entity
- shared website entity
- shared contact point
- shared practice entity
- shared person entity
- shared service-family and child-service dictionary

### What should be generated per page

- page entity
- breadcrumb
- hero image
- page-specific `mainEntity`
- page-specific `ItemList` for hub sections where useful
- page-specific `FAQPage` only when visible

### Dynamic field mapping

- `page.route` -> page url and page `@id`
- `meta.title` -> page `name` / `headline`
- `meta.description` -> page `description`
- `meta.preloadImage` or social image -> hero `ImageObject`
- `shell.breadcrumbs` -> `BreadcrumbList`
- service route slug -> shared service id lookup
- PT route pair -> alternate-language page reference
- lawyer / reviewer module -> person id reference

### Example: core page frame

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://immigratetobrazil.com#organization",
      "name": "Immigrate to Brazil",
      "url": "https://immigratetobrazil.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://immigratetobrazil.com#logo",
        "contentUrl": "https://immigratetobrazil.com/assets/logo/immigrate-to-brazil-logo.png"
      },
      "contactPoint": {
        "@id": "https://immigratetobrazil.com#contact-primary"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://immigratetobrazil.com#website",
      "url": "https://immigratetobrazil.com",
      "name": "Immigrate to Brazil",
      "publisher": {
        "@id": "https://immigratetobrazil.com#organization"
      }
    },
    {
      "@type": "ContactPoint",
      "@id": "https://immigratetobrazil.com#contact-primary",
      "contactType": "customer support",
      "email": "immigratetobrazilteam@gmail.com",
      "telephone": "+55 43 99132-4028",
      "availableLanguage": ["en", "pt-BR"]
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
        "@id": "https://immigratetobrazil.com#service-visa-nomad"
      },
      "inLanguage": "en"
    }
  ]
}
```

### Example: service family hub

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
    "@type": "ItemList",
    "@id": "https://immigratetobrazil.com/services/visas/#service-list",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://immigratetobrazil.com/services/visas/tourist/",
        "item": {
          "@id": "https://immigratetobrazil.com#service-visa-tourist"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://immigratetobrazil.com/services/visas/nomad/",
        "item": {
          "@id": "https://immigratetobrazil.com#service-visa-nomad"
        }
      }
    ]
  }
}
```

### Example: child service entity

```json
{
  "@type": "LegalService",
  "@id": "https://immigratetobrazil.com#service-visa-nomad",
  "name": "Nomad Visa",
  "alternateName": ["Digital Nomad Visa", "Visto Nomade Digital"],
  "provider": {
    "@id": "https://immigratetobrazil.com#organization"
  },
  "serviceType": "Brazil immigration legal service",
  "areaServed": "Brazil",
  "availableLanguage": ["en", "pt-BR"],
  "isRelatedTo": {
    "@id": "https://immigratetobrazil.com#service-family-visas"
  }
}
```

### Example: lawyer page

```json
{
  "@type": "AboutPage",
  "@id": "https://immigratetobrazil.com/about/lawyer/#webpage",
  "url": "https://immigratetobrazil.com/about/lawyer/",
  "name": "Lawyer",
  "mainEntity": {
    "@id": "https://immigratetobrazil.com#person-monique-fernandes"
  },
  "about": {
    "@id": "https://immigratetobrazil.com#organization"
  }
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
  "knowsLanguage": ["en", "pt-BR"]
}
```

### Example: start consultation page

```json
{
  "@type": "ContactPage",
  "@id": "https://immigratetobrazil.com/start-consultation/#webpage",
  "url": "https://immigratetobrazil.com/start-consultation/",
  "name": "Start Consultation",
  "mainEntity": {
    "@id": "https://immigratetobrazil.com#service-advisory-consultation"
  },
  "about": {
    "@id": "https://immigratetobrazil.com#contact-primary"
  },
  "inLanguage": "en"
}
```

### Priority rollout order

1. fix PT language and image-id issues
2. remove unsupported FAQ usage
3. replace weak page types and add missing about/legal page entities
4. introduce shared service-family and child-service ids
5. introduce attorney person entity and trust-page linking
6. convert hubs to `CollectionPage` with `ItemList`
7. add contact-page modeling to `/start-consultation/`
8. add editorial author/date modules, then upgrade true editorial pages
9. expand place entities when state/city detail templates exist

## 30. Final Goal

The finished system should describe one coherent attorney-led Brazil immigration brand, one clean multilingual site, one reusable set of shared entities, and many clearly differentiated page roles.

It should help search engines understand:

- who Immigrate to Brazil is
- what the organization actually offers
- which pages are service pages
- which pages are editorial or educational
- which pages are legal/policy pages
- how service families, child services, legal notices, trust pages, guides, locations, FAQs, and intake flows all connect

The target is not "more schema."

The target is a cleaner, safer, reusable knowledge-graph system that matches the visible site and can scale without creating duplication, cannibalization, or unsupported markup.

## Appendix A: Current Route Inventory

### Foundation

- `/`
- `/start-consultation/`

### Services

- `/services/`
- `/services/visas/` and 21 visa child pages
- `/services/residencies/` and 17 residency child pages
- `/services/naturalisation/` and 6 naturalisation child pages
- `/services/defense/` and 6 defense child pages
- `/services/advisory/` and 5 advisory child pages
- `/services/other/` and 4 support child pages

### Brazil / relocation

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
- 24 process-topic pages, including consultation, planning, filing, approval, rights, fees, deadlines, naturalisation, regularization, refund, and aftercare

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

## Appendix B: External References Used

Google Search Central:

- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/structured-data/faqpage
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/blog/2023/08/howto-faq-changes
- https://developers.google.com/search/blog/2024/10/sitelinks-search-box
- https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful

Schema.org:

- https://schema.org/ContactPoint
- https://schema.org/Service

Benchmark pages:

- https://www.fragomen.com/
- https://www.fragomen.com/countries/united-states.html
- https://www.bal.com/
- https://www.bal.com/perspectives-and-news/
- https://www.boundless.com/
- https://www.boundless.com/immigration-resources/
- https://www.visalaw.com/
- https://www.visalaw.com/category/immigration-news/
