# Header/Footer Wireframe Implementation Spec

## Goal
Implement the exact header, navigation, and footer wireframe below while preserving the current premium visual theme (existing color system, typography tone, spacing rhythm, shadows, button style language).

## Theme Guardrails (Do Not Re-Theme)
- Keep existing brand color tokens and premium look.
- Keep sticky header behavior.
- Keep elevated cards, rounded corners, and soft border treatment already used.
- Keep CTA style family (filled brand button, subtle hover lift).
- Only change structure/content/link mapping, not the underlying visual identity.

## Responsive Behavior
- Desktop (`>=1024px`):
  - Render all 3 header rows.
  - Render hover/click mega menus with requested column counts.
- Mobile (`<1024px`):
  - Keep top utility controls available.
  - Collapse nav mega menus into accordion sections.
  - Preserve all link coverage.

## Interaction Rules
- Desktop mega menus open on hover and click.
- Mega menus close on:
  - outside click
  - `Escape`
  - route change
- Top utility search icon always links to full-site search page.
- All CTA and nav links must resolve to working pages.

## Locale Rule
- Every internal path is locale-aware:
  - pattern: `/{locale}/...`
  - locale set: `en`, `es`, `pt`, `fr`

---

## Header Structure

### Row 1 (Top Thin Bar)
- Accessibility Switcher -> `/{locale}/accessibility`
- Search Icon -> `/{locale}/search`
- Language Switcher -> locale toggles for `EN ES PT FR`
- Client Portal Login -> `/{locale}/client-portal`

### Row 2 (Main Menu)
- Brand block (left):
  - Name: `Immigrate to Brazil`
  - Slogan: `Helping Immigrants, Promoting Brazil`
- Home (center) -> `/{locale}/`
- CTA (right): `Start Consultation` -> `/{locale}/visa-consultation`

### Row 3 (Primary Nav)
Top-level items:
- Services ▼
- Process ▼
- Brazil ▼
- Insights ▼
- About Us ▼

---

## Mega Menu Link Mapping

## Services (6 Columns)

### 1) Visas
- Artistic -> `/services/immigration-law-services/visas/artistic`
- Business -> `/services/immigration-law-services/visas/business`
- Educational -> `/services/immigration-law-services/visas/educational-exchange`
- Exchange -> `/services/immigration-law-services/visas/educational-exchange`
- Digital Nomad -> `/services/immigration-law-services/visas/digital-nomad`
- Diplomatic -> `/services/immigration-law-services/visas/diplomatic`
- Family -> `/services/immigration-law-services/visas/family`
- Humanitarian -> `/services/immigration-law-services/visas/humanitarian`
- Investor -> `/services/immigration-law-services/visas/investor`
- Journalist -> `/services/immigration-law-services/visas/journalist`
- Medical -> `/services/immigration-law-services/visas/medical`
- Religious -> `/services/immigration-law-services/visas/religious`
- Research -> `/services/immigration-law-services/visas/research`
- Retiree -> `/services/immigration-law-services/visas/retiree`
- Sports -> `/services/immigration-law-services/visas/sports`
- Startup -> `/services/immigration-law-services/visas/startup`
- Student -> `/services/immigration-law-services/visas/student`
- Tourist -> `/services/immigration-law-services/visas/tourist`
- Transit -> `/services/immigration-law-services/visas/transit`
- Volunteer -> `/services/immigration-law-services/visas/volunteer`
- Work -> `/services/immigration-law-services/visas/work`

### 2) Residencies
- CPLP -> `/services/immigration-law-services/residencies/cplp`
- MERCOSUL -> `/services/immigration-law-services/residencies/mercosul`
- Digital Nomad -> `/services/immigration-law-services/residencies/digital-nomad`
- Educational -> `/services/immigration-law-services/residencies/educational-exchange`
- Exchange -> `/services/immigration-law-services/residencies/youth-exchange`
- Family Reunion -> `/services/immigration-law-services/residencies/family-reunion`
- Health -> `/services/immigration-law-services/residencies/health-treatment`
- Humanitarian -> `/services/immigration-law-services/residencies/humanitarian`
- Investor -> `/services/immigration-law-services/residencies/investor`
- Religious -> `/services/immigration-law-services/residencies/religious`
- Retiree -> `/services/immigration-law-services/residencies/retiree`
- Research -> `/services/immigration-law-services/residencies/researcher`
- Skilled -> `/services/immigration-law-services/residencies/skilled-worker`
- Study -> `/services/immigration-law-services/residencies/study`
- Work -> `/services/immigration-law-services/residencies/work`
- Youth -> `/services/immigration-law-services/residencies/youth-exchange`
- Volunteer -> `/services/immigration-law-services/residencies/volunteer`

### 3) Naturalisation
- Ordinary -> `/services/immigration-law-services/naturalisation/ordinary`
- Extraordinary -> `/services/immigration-law-services/naturalisation/extraordinary`
- Provisional -> `/services/immigration-law-services/naturalisation/provisional`
- Special -> `/services/immigration-law-services/naturalisation/special`
- Renunciation -> `/services/immigration-law-services/naturalisation/renouncing-citizenship`
- Reacquisition -> `/services/immigration-law-services/naturalisation/reacquisition-citizenship`

### 4) Defense
- Deportation -> `/services/immigration-law-services/other-services/deportation`
- Expulsion -> `/services/immigration-law-services/other-services/expulsion`
- Extradition -> `/services/immigration-law-services/other-services/extradition`
- Appeals -> `/services/immigration-law-services/other-services/appeals`
- Fines -> `/services/immigration-law-services/other-services/fines`
- Litigation -> `/services/legal`

### 5) Services
- Consular -> `/services/immigration-law-services/other-services/consular`
- Criminal Records -> `/services/immigration-law-services/other-services/criminal-records`
- Translation -> `/services/immigration-law-services/other-services/translation`
- Regularization -> `/services/legal`

### 6) Advisory
- Consultation -> `/services/immigration-law-services/other-services/consultation`
- Strategy -> `/consultation`
- Compliance -> `/about/about-us/legal-compliance-standards`
- Representation -> `/services/legal`
- Corporate -> `/services/immigration-law-services/other-services/company-formation`

---

## Process (4 Columns)

### 1) Method
- Consultation -> `/consultation`
- Assessment -> `/process`
- Strategy -> `/about/about-us/immigration-done-right`
- Filing -> `/process`
- Approval -> `/process`
- Works -> `/about/about-us/how-it-works`

### 2) Avoiding Pitfalls
- Mistakes -> `/about/about-us/common-mistakes`
- Failures -> `/about/about-us/common-mistakes`
- Deadlines -> `/process`
- Obligations -> `/process`
- Alone -> `/about/about-us/10-reasons-not-alone`
- Fees -> `/consultation`
- Refund -> `/policies/refund`
- Timeline -> `/process`
- Responsibilities -> `/process`
- Right -> `/about/about-us/immigration-done-right`

### 3) Aftercare
- Renewal -> `/services/immigration-law-services/residencies/temporary-residency`
- Permanent -> `/services/immigration-law-services/residencies/permanent`
- Naturalisation -> `/services/immigration-law-services/naturalisation/ordinary`
- Compliance -> `/about/about-us/legal-compliance-standards`

### 4) Lifecycle
- Conversion -> `/services/immigration-law-services/residencies/permanent-residency`
- Regularization -> `/services/legal`
- Planning -> `/consultation`

---

## Brazil (6 Columns)

### 1) Discover
- Why Brazil -> `/about/about-brazil`
- Investment -> `/services/immigration-law-services/residencies/investor`
- Economy -> `/about/about-brazil/cost-of-living-in-brazil`
- Quality -> `/about/about-us/immigration-done-right`

### 2) Living
- Cost -> `/about/about-brazil/cost-of-living-in-brazil`
- Housing -> `/resources-guides-brazil`
- Healthcare -> `/services/immigration-law-services/residencies/health-treatment`
- Education -> `/services/immigration-law-services/visas/student`
- Safety -> `/about/about-states`

### 3) Regions
- North -> `/discover/brazilian-regions/north-region`
- Northeast -> `/discover/brazilian-regions/northeast-region`
- Central-West -> `/discover/brazilian-regions/central-west-region`
- Southeast -> `/discover/brazilian-regions/southeast-region`
- South -> `/discover/brazilian-regions/south-region`

### 4) States
- Directory -> `/discover/brazilian-states`
- Include all 27 states (required, alphabetical preferred) linking to:
  - `/discover/brazilian-states/{stateCodeLower}`
  - examples: `sp`, `rj`, `pr`, `mg`, `ba`, etc.

### 5) Cities
- Guides -> `/discover/brazilian-regions`
- Municipalities -> `/discover/brazilian-regions`
- Search (placeholder) -> `/search?q=Maringa`

### 6) Culture
- Festivals -> `/about/about-brazil/festivals`
- Cuisine -> `/about/about-brazil/food`
- Events -> `/about/about-brazil/festivals`
- Blogs -> `/blog`
- FAQs -> `/faq`

---

## Insights (5 Columns)

### 1) Guides
- Immigration -> `/resources-guides-brazil`
- Visa -> `/services/visas`
- Residency -> `/services/residencies`
- Citizenship -> `/services/naturalisation`
- State -> `/state-guides`

### 2) FAQ
- General -> `/faq`
- Visa -> `/faq`
- Residency -> `/faq`
- Process -> `/process`
- Compliance -> `/about/about-us/legal-compliance-standards`
- State -> `/faq`

### 3) Blog
- Updates -> `/blog`
- Legal -> `/blog`
- Policy -> `/policies`
- State -> `/state-guides`
- Cases -> `/about/about-us/10-success-stories`

### 4) Resources
- Process -> `/process`
- Mistakes -> `/about/about-us/common-mistakes`
- Standards -> `/about/about-us/legal-compliance-standards`
- Accessibility -> `/accessibility`
- Portal -> `/client-portal`
- Checklist -> `/resources-guides-brazil`

### 5) Archive
- Policy -> `/policies`
- Press -> `/about/about-us/10-press-mentions`
- Sitemap -> `/sitemap.xml`
- Search placeholder -> `/search?q=Visa+Updates`

---

## About Us (6 Columns)

### 1) Profile
- About -> `/about/about-us`
- Mission -> `/about/about-us/mission`
- Philosophy -> `/about/about-us/immigration-done-right`
- Institutional -> `/about/about-us/trusted-worldwide`
- Story -> `/about/about-us/10-success-stories`
- Values -> `/about/about-us/mission-values-ethics`

### 2) Team
- Lawyers -> `/about/about-us/10-experts`
- Advisors -> `/about/about-us/10-experts`
- Staff -> `/about/about-us/10-experts`
- Experts -> `/about/about-us/10-experts`

### 3) Experience
- Years -> `/about/about-us/years-experience`
- Volume -> `/about/about-us/10-success-stories`
- Industries -> `/about/about-us/trusted-worldwide`

### 4) Recognition
- Awards -> `/about/about-us/10-awards`
- Media -> `/about/about-us/10-press-mentions`
- Speaking -> `/about/about-us/trusted-worldwide`
- Mentions -> `/about/about-us/10-press-mentions`

### 5) Credibility
- Why Us -> `/about/about-us/10-reasons-choose-us`
- Results -> `/about/about-us/10-success-stories`
- Stories -> `/about/about-us/10-success-stories`
- Clients -> `/about/about-us/trusted-worldwide`
- Testimonials -> `/about/about-us/10-success-stories`

### 6) Governance
- Compliance -> `/about/about-us/legal-compliance-standards`
- Ethics -> `/about/about-us/mission-values-ethics`
- Standards -> `/about/about-us/legal-compliance-standards`
- Regulatory -> `/policies`

---

## Footer Structure and Link Mapping

## Brand
- Logo
- Description
- Email
- Phone
- Hours
- Worldwide
- Social Icons:
  - X
  - LinkedIn
  - YouTube

## Immigration
- Visas -> `/services/visas`
- Residency -> `/services/residencies`
- Naturalisation -> `/services/naturalisation`
- Defense -> `/services/legal`
- Regularization -> `/services/legal`

## Brazil
- States -> `/discover/brazilian-states`
- Cities -> `/discover/brazilian-regions`
- Cost -> `/about/about-brazil/cost-of-living-in-brazil`
- Culture -> `/about/about-brazil/festivals`
- Investment -> `/services/immigration-law-services/residencies/investor`

## Resources
- Guides -> `/resources-guides-brazil`
- FAQ -> `/faq`
- Blog -> `/blog`
- Checklist -> `/resources-guides-brazil`
- Sitemap -> `/sitemap.xml`

## Firm
- About -> `/about/about-us`
- Team -> `/about/about-us/10-experts`
- Awards -> `/about/about-us/10-awards`
- Results -> `/about/about-us/10-success-stories`

## Legal
- Privacy -> `/policies/privacy`
- Terms -> `/policies/terms`
- Refund -> `/policies/refund`
- GDPR -> `/policies/gdpr`
- Accessibility -> `/accessibility`
- Disclaimer -> `/policies/disclaimers`

## Site Search
- Search bar submit target -> `/search` with query param `q`

## Call for Consultation
- Button: `Start Your Consultation Now` -> `/visa-consultation`

## Disclaimer
- Exact text:
  - `© 2019-2026 Immigrate to Brazil. All rights reserved. Information provided is general guidance and not legal representation until engagement is confirmed.`
- Tiny logo inline/right.

---

## Acceptance Checklist
- Header row 1 contains all 4 utility items and search icon goes to `/search`.
- Header row 2 has left brand, centered home, right CTA.
- Header row 3 has exactly 5 top-level menus.
- Column counts match:
  - Services: 6
  - Process: 4
  - Brazil: 6
  - Insights: 5
  - About Us: 6
- Brazil states section includes all 27 states with working links.
- Footer contains required columns, full-width search strip, consultation CTA, and disclaimer.
- No menu/footer link 404s.
- Premium theme remains intact (no redesign drift).

---

## Data Source Notes
- Link choices above are based on current route inventory in `content/generated/route-index.json` plus modern app routes.
- Some modern routes (example: `/search`, `/client-portal`) are app-native and may not appear in route-index JSON; they are valid app pages.
