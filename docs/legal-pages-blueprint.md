# Legal Pages Blueprint

Last updated: March 23, 2026

## 1. Positioning

This blueprint is the publishing version for the legal family of Immigrate to Brazil. It is written for implementation, not brainstorming. The objective is to turn the existing legal route family into a controlled, premium, advisory-level system that reinforces legal certainty, operational discipline, and process credibility.

These pages should not read like generic legal templates. They should not read like warm blog posts. They should read like the legal and compliance layer of a structured immigration advisory business that understands intake control, record quality, payment governance, client coordination, and authority-facing execution.

This blueprint now combines two models intentionally:

- the premium, procedural, high-authority model requested by the user
- the clarity-first operating model already present in the strongest Immigrate to Brazil pages

The result should feel controlled and premium without becoming sterile. It should feel advisory-level without becoming unreadable. It should sound like a company that works with legal structure every day, but still knows its readers are often immigrants navigating uncertainty under pressure.

### Voice standard

- controlled
- precise
- procedural
- premium
- advisory-level
- immigration-literate
- compliance-aware
- plain-English when explaining consequences
- calm under pressure

### Voice rules

- Write as Immigrate to Brazil using `we`, `our`, and `us`.
- Prefer language such as `govern`, `process`, `verify`, `coordinate`, `execute`, `retain`, `review`, `control`, `document`, and `escalate`.
- Do not sound casual, soft, chatty, or lifestyle-oriented.
- Do not promise approvals, timelines, outcomes, or authority decisions.
- Do not oversell. Authority comes from structure, not from adjectives.
- After each formal rule, give the reader the practical meaning in direct English.
- Use restraint, but do not become abstract. A reader should always understand what the rule changes in practice.
- Public pages must distinguish clearly between:
  - public information
  - strategic consultation
  - execution support
  - formal representation
  - authority discretion

### Hybrid writing method

Each major section should follow a two-layer pattern:

1. Formal layer
   - state the rule in controlled, advisory-level language
2. Practical layer
   - explain what the rule means for the client, the platform, or the next step

Example:

- Formal layer: `Payment is applied to the defined service stage accepted in writing and does not create an open-ended execution mandate.`
- Practical layer: `In practical terms, paying for a strategy session does not automatically start full-service execution support.`

That combination is the right blend for this brand. It protects authority while preserving readability.

## 2. Repo Reality And Operational Facts

The legal family already exists in the repo and should be upgraded rather than reinvented.

### Existing strengths

- `content/en/routes/legal/*` already exists for all major legal pages.
- The site already has a legal visual family with hero assets and `family-legal` styling.
- The page-map and sidebar systems are already in place.
- The company voice is already strongest on the better `about` pages and should be reused here.

### Operational facts already embedded in the site

- contact email: `moniquefadv@gmail.com`
- WhatsApp / phone: `+55 43 9961-4034`
- support window in footer: Monday to Friday, 9:00-18:00 BRT
- requests are reviewed manually
- payment verification is manual
- consultations are only treated as booked after written confirmation
- current booking logic uses a 36-hour post-confirmation scheduling rule
- current accepted payment methods in the repo:
  - PIX
  - PayPal
  - Payoneer
  - Wise
  - direct bank transfer
  - Bitcoin
  - USDT

### Current weaknesses

- most legal body content is still scaffold text
- the legal family lacks a real `/legal/` hub
- search and 404 work technically but not strategically
- policy language is not yet premium enough for a high-trust immigration advisory brand

## 3. Legal Tone Calibration

### Target posture

The legal family should feel like the operating manual of a structured advisory business. It should communicate:

- legal certainty
- operational clarity
- record discipline
- scope control
- execution structure
- compliance maturity

### What it should not sound like

- generic privacy-policy generators
- startup SaaS filler
- blog-style empathy paragraphs
- law-firm chest-thumping
- vague “we care about your privacy” slogans without procedure

### What it should sound like

- “we process”
- “we verify”
- “we retain only for legitimate operational and legal purposes”
- “service scope is defined in writing”
- “outcomes remain subject to government authority”
- “payment covers defined deliverables only”
- “representation begins only after written acceptance of scope”

## 4. Link Governance

The user requested a stricter internal-link and resource system. This blueprint adopts that rule.

### Internal links

Every page should have page-specific related internal links.

Those links should point only to:

- services pages
- about pages
- other legal pages

Do not use generic shortcut chips that simply repeat the page title or search terms. Each page should have a deliberate internal-link set matched to its function.

### External links

Any outbound links on legal pages should be limited to official public authority resources.

That means:

- Brazilian federal government
- Planalto
- Policia Federal
- ANPD
- European Commission
- other comparable public-authority sources if needed

Do not use non-government outbound links in the legal family resource sections.

### Contact presentation

Inside the body content, present contact routes as text:

- `moniquefadv@gmail.com`
- `+55 43 9961-4034`

Do not rely on external platform links inside the body copy itself. If the implementation later keeps a WhatsApp hero button, that is a UI decision, but the content system should not depend on non-government outbound links for legal completeness.

## 5. Service Execution Model To Reflect Across Legal Pages

The repo repeatedly implies a four-part service logic. The legal family should make that logic explicit because it reinforces trust.

### Immigrate to Brazil execution structure

1. Route fit and intake control
2. Chronology and record review
3. Document quality and execution planning
4. Authority-facing preparation, submission support, and follow-through

This model should appear most clearly on:

- Terms & Conditions
- Payment Terms
- Form & Intake Policy
- Refund Policy
- Disclaimer
- Legal Hub

## 6. Publishing Rules

### Mandatory language that should recur across the family

- we review requests manually
- we operate through structured scope and written confirmation
- public content is general information and not case-specific advice by default
- service execution depends on facts, chronology, record quality, and authority procedure
- government authorities control final outcomes
- payment alone does not create a confirmed booking or formal engagement
- representation begins only after written acceptance of scope

### Mandatory cautions

- no guarantee of visa approval
- no guarantee of residency approval
- no guarantee of nationality approval
- no guarantee of government response speed
- no guarantee of outcome based on payment

### Compliance caution retained from earlier review

The user requested no address and no OAB number. That is workable for drafting, but a real publication risk remains: Brazilian online contracting transparency rules often require supplier-identification details, including legal entity information and address, in e-commerce contexts. Treat that as a final legal sign-off issue even if the body copy is otherwise ready.

## 7. Official Public Authority Library

Use only official public references in legal-page resource blocks.

### Brazil migration and authority framework

- Brazilian Migration Law: `https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13445.htm`
- Migration Regulation Decree: `https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9199.htm`
- Policia Federal immigration portal: `https://www.gov.br/pf/pt-br/assuntos/imigracao`

### Privacy and data protection

- LGPD text: `https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm`
- ANPD FAQ: `https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes/perguntas-frequentes`
- ANPD petition route: `https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao-titular-de-dados/denuncia-peticao-de-titular`

### Consumer and e-commerce rules

- Decreto no. 7.962/2013: `https://www.planalto.gov.br/ccivil_03/_Ato2011-2014/2013/Decreto/D7962.htm`
- Ministry of Justice consumer guidance on online withdrawal: `https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line`

### Accessibility and digital access

- Gov.br accessibility page: `https://www.gov.br/pt-br/acessibilidade`
- Governo Digital accessibility tools: `https://www.gov.br/governodigitallogin/pt-br/acessibilidade-e-usuario/acessibilidade-digital/ferramentas`
- Governo Digital accessibility guide: `https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/guiaboaspraaticasparaacessibilidadedigital.pdf`

### European public authority references

- European Commission data protection overview: `https://commission.europa.eu/law/law-topic/data-protection_en`
- European Commission international transfers overview: `https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en`

## 8. Page Matrix

| URL | Title | Primary role |
| --- | --- | --- |
| `/legal/` | ImmigrateToBrazil.com Legal Notices | central legal hub |
| `/legal/privacy/` | Privacy Policy | main data-protection notice |
| `/legal/cookies/` | Cookies Policy | cookies and tracking governance |
| `/legal/terms/` | Terms & Conditions | platform and service-use framework |
| `/legal/payment/` | Payment Terms | payment structure and booking control |
| `/legal/refund/` | Refund Policy | cancellation and refund rules |
| `/legal/form/` | Form & Intake Policy | intake governance and submission rules |
| `/legal/gdpr/` | GDPR Notice | EU-facing privacy supplement |
| `/legal/lgpd/` | LGPD Notice | Brazil-facing privacy supplement |
| `/legal/accessibility/` | Accessibility Statement | accessibility commitment and support |
| `/legal/disclaimer/` | Disclaimer & Legal Notice | protective reliance boundary |
| `/legal/emergency/` | Emergency Resources | urgent contact and authority-first protocol |
| `/legal/search/` | Search | legal-family search gateway |
| `/legal/404/` | Page Not Found | route recovery page |

## 9. `/legal/` Legal Hub

### Tone

controlled, premium, institutional

### Internal links

- `/legal/privacy/`
- `/legal/terms/`
- `/legal/payment/`
- `/legal/refund/`
- `/about/compliance/`
- `/about/standards/`
- `/services/advisory/consultation/`

### Official resources

- LGPD text
- Migration Law
- Decree no. 7.962/2013

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Legal notices, compliance architecture, and operating rules`
- H1: `ImmigrateToBrazil.com Legal Notices`
- Summary: `This legal hub consolidates the policies, disclosures, and procedural standards that govern how we handle privacy, payments, intake, accessibility, urgent contact, and public information.`

### Publish-ready page content

#### Overview

This legal hub is the control center for the legal and compliance layer of Immigrate to Brazil. It exists so that visitors, prospective clients, and active clients can review the rules that govern our public platform, our intake systems, our payment handling, our privacy standards, and our operating boundaries before relying on our services.

We do not believe legal pages should function as decorative fine print. In an immigration context, legal certainty begins before execution begins. People need to understand how information is handled, how scope is defined, how payments are controlled, how cancellations work, and where authority discretion begins and our responsibility ends.

#### Why this hub exists

Immigration advisory work is trust-sensitive by design. Clients share identity details, chronology, documents, payment confirmations, and decisions that may affect family life, legal status, travel, work, and long-term planning. A premium advisory business should not treat those points as scattered disclaimers hidden across the platform.

For that reason, we centralize the legal framework here. This hub gives you a single reference point for the rules that support our intake discipline, our compliance posture, and our execution standards.

#### How our legal framework is organized

Our legal framework is organized around the operational points that matter most to a client journey:

- privacy and personal-data governance
- cookies and tracking controls
- terms governing use of the platform and public materials
- payment structure and booking control
- refund and cancellation boundaries
- form and intake submission rules
- accessibility commitment and reporting routes
- supplemental privacy notices for GDPR and LGPD contexts
- emergency contact protocol for urgent immigration situations

This structure mirrors how real client risk appears in practice. Risk does not appear only at filing. It appears at first contact, data submission, payment, timing, document handling, and reliance on public information.

#### Legal notice menu

Each legal card on the hub should read like a functional menu item, not a marketing tile.

- Privacy Policy: `How we process, retain, protect, and respond to requests about personal information.`
- Cookies Policy: `How cookies, analytics tools, consent controls, and third-party tracking functions are governed.`
- Terms & Conditions: `How the platform may be used, how service scope is framed, and what the platform does not guarantee.`
- Payment Terms: `How payment methods, booking confirmation, anti-fraud controls, and execution-stage billing work.`
- Refund Policy: `How cancellations, no-shows, reserved time, and completed work affect refund eligibility.`
- Form & Intake Policy: `How forms, uploads, and first-stage review are governed.`
- GDPR Notice: `Supplemental privacy notice for users expecting GDPR-style transparency and rights language.`
- LGPD Notice: `Brazil-first data-protection notice under the LGPD framework.`
- Accessibility Statement: `How we approach digital accessibility, compatibility, and barrier reporting.`
- Disclaimer & Legal Notice: `The boundary between public information, strategic consultation, and authority-controlled outcomes.`
- Emergency Resources: `What qualifies as urgent, when to contact authorities first, and how emergency triage works.`

#### Contact and policy questions

Questions about any legal page may be directed to `moniquefadv@gmail.com`. If the issue is time-sensitive and connected to an active matter, contact may also be made by phone or WhatsApp at `+55 43 9961-4034`, but policy-level questions are generally easier to review and document through email.

Policy questions are reviewed manually. A question about a legal page does not, by itself, create a service engagement or legal representation, but we use those enquiries to clarify the correct next procedural step where appropriate.

#### Final notice

These pages are part of how we operate, not only how we disclose. They are intended to support a more structured, more transparent, and more professionally controlled client experience.

## 10. `/legal/privacy/` Privacy Policy

### Tone

structured, controlled, authoritative

### Internal links

- `/legal/lgpd/`
- `/legal/gdpr/`
- `/legal/form/`
- `/legal/payment/`
- `/about/compliance/`
- `/about/standards/`

### Official resources

- LGPD text
- ANPD FAQ
- ANPD petition route

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Data protection, confidentiality, and information governance`
- H1: `Privacy Policy`
- Summary: `This Privacy Policy explains how Immigrate to Brazil collects, processes, stores, protects, shares, and governs personal information across intake, advisory, execution, and compliance operations.`

### Publish-ready page content

#### Purpose of this policy

This Privacy Policy formalizes our approach to personal-data protection and compliance. It defines how Immigrate to Brazil handles personal information provided through our platform, our intake systems, our direct communication channels, and our service-delivery workflow.

Our objective is not only legal disclosure. Our objective is controlled handling. Immigration advisory work often involves identity records, chronology, family data, government notices, and documents that can affect legal status, travel, and execution strategy. That requires a deliberate privacy framework rather than casual information handling.

#### Scope of data collected

We may process personal information that identifies or relates to a visitor, lead, client, or service contact. This may include client-identification data such as name, nationality, country of residence, email address, telephone number, WhatsApp number, occupation, and other core contact details.

Where a person submits documentation or seeks advisory or execution support, we may also process immigration-related information and supporting records, including travel history, residence status, authority notices, procedural chronology, family-relationship records, translations, filings, payment confirmations, and other documents relevant to the matter.

We may additionally collect technical and usage information connected to the operation of the platform, including browser data, session data, IP-related technical information, access logs, interaction records, accessibility settings, and analytics information where used lawfully.

#### Data collection channels

Data may be collected through consultation and intake forms, through direct contact by email or phone, through WhatsApp communications, through payment-related correspondence, through document submission, and through website interactions involving cookies, analytics, accessibility settings, or security controls.

The collection channel matters because it affects the purpose, retention logic, and operational safeguards applied to the information. We therefore do not treat all data flows as interchangeable.

#### Purpose of processing

We process personal information for legitimate operational purposes connected to our immigration advisory and execution model. Those purposes may include route assessment, intake review, chronology verification, document planning, payment matching, scheduling, communication with clients and prospective clients, service delivery, quality control, legal compliance, fraud prevention, dispute management, and the defense of rights.

We may also process data to maintain internal records of communications, preserve an audit trail of procedural decisions, and control the consistency of information across the life of a matter. In immigration work, record integrity is not administrative decoration. It is part of execution quality.

#### Legal basis for processing

Depending on context, our legal basis for processing may include contractual necessity, pre-contractual steps taken at the request of the data subject, legitimate interest, legal or regulatory obligation, protection of rights in judicial or administrative settings, and consent where consent is the correct basis for the specific activity.

We do not rely on consent as a blanket explanation for all processing. Where another legal basis more accurately reflects the actual processing purpose, we use that basis. This matters because serious compliance requires matching the basis to the function rather than defaulting to convenience language.

#### Data sharing and third parties

We do not sell personal data. We may share information with carefully selected service providers or professional collaborators when that is necessary for lawful operations, secure infrastructure, communication management, document handling, scheduling, technical support, translation support, advisory delivery, or execution support.

Where the matter requires it, information may also be disclosed to legal professionals, translation providers, government authorities, or other necessary parties involved in a legitimate service stage or legal obligation. Any such disclosure should be limited to what is relevant to the purpose at hand.

#### International data transfers

Our client base is cross-border by nature. As a result, personal information may be processed, stored, accessed, or transmitted across jurisdictions where that is necessary for communication, intake, service coordination, infrastructure operation, or cross-border client handling.

International transfer does not change our responsibility to apply controlled handling. It means that operational reality may involve more than one jurisdiction while the underlying principles remain the same: purpose limitation, proportionality, access control, and lawful handling.

#### Data retention framework

We retain personal information only for as long as reasonably necessary for legal, operational, contractual, evidentiary, and compliance purposes. Retention periods depend on the type of data, the service stage, the existence of an active or completed matter, payment history, document relevance, dispute risk, and legal retention requirements.

Information is not retained indefinitely by default. It is retained according to operational necessity and risk logic. Where deletion, anonymization, or controlled removal is appropriate, we may apply those measures in line with legal and procedural constraints.

#### Data subject rights

Subject to applicable law, data subjects may have rights that include access, confirmation of processing, correction of incomplete or inaccurate data, deletion where legally available, restriction of certain processing, portability where applicable, information about sharing, and objection in circumstances recognized by law.

If you wish to exercise a data right, submit the request to `moniquefadv@gmail.com`. We may require reasonable identity verification before acting on a request, particularly where the request concerns sensitive records, deletion, disclosure, or correction of service-related files.

#### Security and data protection measures

We use process-based safeguards to support secure handling of data, including controlled access, need-to-know review, communication discipline, record segregation where appropriate, secure storage practices, and operational controls around intake, payment verification, and document handling.

No platform can credibly promise absolute security. What we can say is that privacy protection is treated as an operational control issue, not as an afterthought.

#### Contact for data requests

Privacy, correction, deletion, and data-rights requests should be sent to `moniquefadv@gmail.com`.

## 11. `/legal/cookies/` Cookies Policy

### Tone

simple, clear, premium

### Internal links

- `/legal/privacy/`
- `/legal/terms/`
- `/legal/accessibility/`
- `/legal/search/`
- `/about/compliance/`

### Official resources

- LGPD text
- Decree no. 7.962/2013
- European Commission data protection overview

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Cookies, tracking controls, and platform performance`
- H1: `Cookies Policy`
- Summary: `This Cookies Policy explains how Immigrate to Brazil uses cookies and similar technologies to support platform functionality, performance measurement, consent control, and security.`

### Publish-ready page content

#### Purpose of cookies in platform operation

We use cookies and similar technologies to maintain essential platform functions, remember operational preferences, support accessibility controls, secure the platform, and understand how visitors use the site so that navigation, content structure, and technical performance can be improved in a controlled way.

Cookie use on this platform is not treated as a hidden layer of casual tracking. It is governed according to purpose. Different cookies serve different functions, and they should be explained in those terms.

#### Categories of cookies used

We group cookies into four practical categories: essential cookies, analytical cookies, optional preference or convenience cookies, and third-party integration cookies where a service or tool supplied by another provider forms part of the platform experience.

This category structure matters because not every cookie performs the same legal or operational role. Essential cookies support site operation. Analytical cookies support measurement. Optional cookies support non-core convenience or marketing functions if such functions are activated. Third-party integration cookies arise where embedded or linked tools require them.

#### Essential cookies

Essential cookies support core site functionality. This includes navigation continuity, session handling, consent recording, security-related behavior, accessibility settings, and technical features that the user directly requests by using the platform.

Without essential cookies, parts of the platform may not function as intended. For that reason, essential cookies should be treated differently from optional tracking layers.

#### Analytical cookies

Analytical cookies may be used to monitor platform performance, understand traffic patterns, identify navigation friction, improve content hierarchy, and evaluate how visitors interact with the public areas of the platform.

Analytical processing should be proportionate to the objective. The purpose is service improvement and performance visibility, not uncontrolled behavioral profiling.

#### Optional cookies and tracking systems

If optional marketing, tracking, or non-essential audience tools are used, they should be governed through appropriate notice and consent controls before activation. Refusing optional cookies should not impair access to core legal or service information.

Optional means optional. It should not be engineered as a disguised requirement for ordinary platform use.

#### Third-party integrations

Some third-party tools, embedded functions, or analytics systems may rely on their own cookies or similar technologies. Where those tools form part of the platform, they should be disclosed in functional terms and governed consistently with the privacy and consent model applied to the rest of the site.

Third-party technical involvement does not remove the need for disciplined disclosure.

#### User control mechanisms

Users may manage cookie choices through browser settings, device privacy controls, and any consent banner or preference interface made available on the platform. Browser-level controls may allow deletion, blocking, or limitation of cookies by category or by source.

Blocking cookies at browser level may reduce site functionality, disable stored preferences, or affect accessibility-related controls. Where that occurs, the technical limitation should be understood as a consequence of the browser configuration rather than hidden platform behavior.

#### Relationship with the Privacy Policy

This Cookies Policy should be read together with our Privacy Policy. The Privacy Policy explains the wider framework for personal-data handling, while this page explains the specific role of cookies and similar technologies within that framework.

## 12. `/legal/terms/` Terms & Conditions

### Tone

firm, controlled, high-authority

### Internal links

- `/legal/disclaimer/`
- `/legal/payment/`
- `/legal/refund/`
- `/services/`
- `/services/advisory/consultation/`
- `/about/governance/`
- `/about/standards/`

### Official resources

- Migration Law
- Migration Regulation Decree
- LGPD text

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Platform use, service boundaries, and governing rules`
- H1: `Terms & Conditions`
- Summary: `These Terms & Conditions govern use of the Immigrate to Brazil platform, public materials, intake channels, and structured service framework.`

### Publish-ready page content

#### Nature of service

Immigrate to Brazil operates as an immigration advisory and execution-support platform. We provide structured guidance, documentation planning, procedural coordination, compliance-oriented support, and related service assistance connected to immigration, residency, nationality, records, and cross-border relocation matters involving Brazil.

We are not a government entity, and the platform should never be understood as a substitute for the competent authority itself. We do not issue visas, residence permits, or nationality decisions. Authorities do.

#### Service scope definition

Our service model is scope-based and phase-based. Public content provides orientation. Strategic consultation provides assessment and direction. Execution support provides structured assistance within the defined deliverables accepted for a specific matter.

Nothing on the platform should be interpreted as open-ended responsibility for every issue connected to a client unless that responsibility has been accepted in writing as part of a defined scope.

#### Process-based engagement model

Our operating model is structured around four phases:

1. route fit and intake control
2. chronology and record review
3. document quality and execution planning
4. authority-facing preparation, filing support, and follow-through

This matters because immigration work is not executed responsibly through improvisation. The quality of the outcome depends heavily on the order in which the matter is assessed, documented, and prepared.

#### Client obligations

Clients and users are responsible for the accuracy, completeness, and timeliness of the information they provide. That includes identity details, chronology, country information, procedural background, prior filings, deadlines, relationship facts, and documentary records.

Clients are also responsible for timely cooperation, timely payment where payment is due, and timely response where the service stage depends on information or documentation still under the client’s control.

#### No guarantee clause

We do not guarantee approval, issuance, registration, conversion, extension, regularization, nationality recognition, or any other government outcome. Decisions are made by public authorities, not by Immigrate to Brazil.

We also do not guarantee that a theoretically available route is the correct route for a specific case until the relevant facts, chronology, documents, and authority-facing implications have been properly reviewed.

#### Limitation of liability

To the fullest extent permitted by applicable law, we are not responsible for delays, denials, or disruptions caused by government authorities, consulates, courts, technical outages in third-party systems, translation delays outside our control, client omission or inaccuracy, or any other factor that falls outside the scope of our accepted responsibility.

Nothing in this clause is intended to remove liabilities that cannot lawfully be excluded. Its purpose is to make the operational boundary visible rather than leave it implied.

#### Use of platform

The platform may be used for lawful informational, advisory, and intake-related purposes only. You may not use the site for abusive communications, fraud, impersonation, unlawful scraping, technical interference, malicious code injection, or false submissions.

You may not use the platform or its contact channels to create misleading associations, unauthorized lead-generation structures, or false claims of partnership or endorsement.

#### Intellectual property protection

The platform structure, original text, branding, design elements, and published materials belonging to Immigrate to Brazil are protected intellectual property unless otherwise stated. Public materials may be read, downloaded, and referenced for legitimate informational purposes, but not republished in misleading, deceptive, or commercially parasitic ways.

The site may not be copied or mirrored in a manner that obscures authorship, branding, or source.

#### Jurisdiction and applicable law

These Terms & Conditions are governed by Brazilian law, subject to any mandatory consumer or data-protection rights that may apply under another legal framework in a specific case.

Where a separate written service document applies to an engagement, that document governs the specific service relationship together with these public terms where relevant.

#### Modifications

These terms may be modified to reflect regulatory change, platform change, service-structure change, operational control improvements, or other legitimate business and compliance developments. The version published on the platform is the current reference version.

## 13. `/legal/payment/` Payment Terms

### Tone

precise, transparent, premium service clarity

### Internal links

- `/legal/refund/`
- `/legal/form/`
- `/legal/terms/`
- `/services/advisory/consultation/`
- `/about/compliance/`

### Official resources

- Decree no. 7.962/2013
- Ministry of Justice consumer guidance
- LGPD text

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Payment control, billing structure, and booking confirmation`
- H1: `Payment Terms`
- Summary: `These Payment Terms explain how Immigrate to Brazil structures billing, verifies transfers, controls booking confirmation, and aligns payment with defined deliverables.`

### Publish-ready page content

#### Pricing model

Our pricing model distinguishes between strategy-stage work and execution-stage work. A strategic consultation or assessment stage is a defined, payable service in its own right. Full-service execution support, where offered, is a separate scope and is not implied by payment for an earlier advisory stage.

This distinction is important because payment is tied to defined deliverables, not to a vague expectation of unlimited support.

#### Accepted payment methods

We currently accept local and international payment through PIX, PayPal, Payoneer, Wise, direct bank transfer, Bitcoin, and USDT, depending on the service context and the payment instructions issued for the specific matter.

Not every payment method is appropriate for every client or every service stage. Where a transfer method requires specific account or wallet instructions, those instructions must be confirmed in current written communication before payment is sent.

#### Billing structure

Payment is generally required before consultation delivery and before execution work begins for a defined scope. Where a matter progresses from consultation into execution support, the billing structure for that later scope must be agreed separately in writing.

A prior payment does not automatically open later phases of work. Each phase remains tied to its own accepted scope and corresponding deliverables.

#### Scope versus payment

Payment covers the deliverables defined for the stage that was accepted. It does not create an open-ended mandate. It does not silently expand to unrelated work. It does not convert public interaction into formal representation.

This principle protects both parties. It keeps scope visible, prevents assumption-based escalation, and supports disciplined service execution.

#### Verification and booking control

All payments are subject to manual verification. The fact that a transfer has been initiated or completed does not, by itself, create a confirmed consultation slot or a confirmed execution start.

Booking confirmation requires transfer matching, proof review, and written confirmation from our side. The site’s existing operational standard also requires confirmed appointments to respect the 36-hour post-confirmation scheduling rule.

#### Security

Payments should be made only through current written instructions tied to the live matter or booking. Old screenshots, forwarded wallet details, and stale payment instructions should not be relied upon.

This is a security control, not an inconvenience. Financial misdirection is significantly harder to remedy after funds have already moved.

#### Non-payment consequences

If payment required for a defined stage is not made, or if a transfer cannot be verified, the relevant consultation or service stage may be suspended, postponed, or not initiated. Non-payment also prevents booking confirmation where booking depends on cleared payment.

Service continuity depends on the payment terms applicable to the current scope being satisfied.

#### Payment assistance

Payment questions, transfer-matching issues, and proof-of-payment support requests should be sent to `moniquefadv@gmail.com`. Include the payer name, service stage, date, amount, payment method, and proof where available.

## 14. `/legal/refund/` Refund Policy

### Tone

firm, protective, controlled

### Internal links

- `/legal/payment/`
- `/legal/terms/`
- `/legal/form/`
- `/services/advisory/consultation/`
- `/about/compliance/`

### Official resources

- Ministry of Justice consumer guidance
- Decree no. 7.962/2013

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Refunds, cancellations, and service-stage boundaries`
- H1: `Refund Policy`
- Summary: `This Refund Policy explains how Immigrate to Brazil handles cancellations, no-shows, reserved professional time, work already performed, and refund requests.`

### Publish-ready page content

#### General principle

Our fees reflect time allocation, professional review, process planning, record handling, and execution capacity reserved for a defined stage of work. Refund analysis therefore turns on service stage, not on client dissatisfaction alone.

A premium advisory business should not blur that point. Time, expertise, and process capacity are real deliverables even before a matter reaches formal filing.

#### Non-refundable components

Strategy consultations, completed consultations, and work already performed are ordinarily non-refundable. That includes professional review time, document assessment, chronology analysis, preparation already undertaken, and execution capacity already allocated to the matter.

Where substantive work has already begun, the corresponding fee should generally be treated as earned to the extent of the work already delivered or the capacity already consumed.

#### Conditional refunds

Refunds may be considered where payment has been made but no work has begun, no booking has been confirmed, or the inability to proceed is attributable to our side rather than to the client, the authority, or an external factor outside accepted scope.

Conditional refund review is case-specific. It depends on whether time was reserved, whether documents were reviewed, whether the consultation was delivered, and whether any mandatory consumer right applies.

#### Client cancellation terms

If a client needs to cancel, notice should be given as early as possible. Early notice improves the possibility of rescheduling or another controlled solution. Late cancellations and no-shows reduce that possibility because reserved capacity and preparatory review may already have been consumed.

Cancellation does not convert completed work into unused work. The timing of the cancellation matters.

#### No outcome-based refunds

Refunds are not available merely because a client expected a different authority outcome, a faster timeline, or a more favorable procedural result. Government authorities control those outcomes, not Immigrate to Brazil.

No outcome-based refund model would be credible in immigration work, and we do not operate on that basis.

#### Refund processing timeline

Refund requests are reviewed manually after the underlying record is checked. That review considers payment date, booking status, work stage, correspondence, documentary record, and any mandatory consumer-right rule that may apply.

Requests should be sent to `moniquefadv@gmail.com` with the client name, service stage, payment amount, date, payment method, and the basis for the request.

## 15. `/legal/form/` Form & Intake Policy

### Tone

controlled, procedural, intake-focused

### Internal links

- `/legal/privacy/`
- `/legal/payment/`
- `/legal/refund/`
- `/legal/terms/`
- `/about/compliance/`
- `/services/advisory/consultation/`

### Official resources

- LGPD text
- ANPD FAQ

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Structured intake, submission discipline, and first-stage review`
- H1: `Form & Intake Policy`
- Summary: `This policy explains how our forms, uploads, and first-contact intake channels operate, what information they request, and what submission does and does not mean.`

### Publish-ready page content

#### Intake purpose

Our forms are designed to support intake control. They help us determine who is contacting us, what issue is being presented, what route the person believes may apply, what chronology is already known, and what level of review is appropriate as the next step.

A structured intake process reduces noise, reduces avoidable follow-up, and improves the quality of the first assessment. That is the point of the system.

#### Information requested

Our intake systems may request full name, contact information, nationality or country context, occupation, current immigration stage, service category, optional reference details, document uploads, and a matter summary.

Those fields are not ornamental. They exist because route fit, chronology, documentary readiness, and communication control all depend on basic intake accuracy.

#### Document submission

Where document upload is enabled, users may submit records relevant to the current matter. Typical examples include authority notices, identity records, prior filings, translations, payment proof, relationship records, and procedural documents.

The upload function should be used with discipline. It is not intended to receive every document a person possesses regardless of relevance.

#### Sensitive and excessive information

Do not submit more sensitive data than the current stage reasonably requires. If you are unsure whether a record should be sent, begin with a controlled summary or ask for guidance before disclosing additional material.

Data minimization is part of intake quality. Over-submission can create risk as well as delay.

#### Manual review

All form submissions are reviewed manually. Submission does not trigger automated legal analysis, instant booking, or implied acceptance of the matter. It creates a structured record for controlled review.

The next step may be clarification, strategic consultation, payment instruction, execution-stage discussion, or a note that another route should be considered before resources are allocated further.

#### No representation by submission alone

Form submission does not create legal representation, open-ended advisory responsibility, or a guaranteed service commitment. Representation begins only after defined scope has been accepted in writing.

This is a necessary boundary in any serious immigration practice. Intake is not the same thing as engagement.

#### Accuracy obligation

The person submitting the form is responsible for the accuracy and completeness of the information supplied. Incorrect dates, incomplete chronology, omitted filings, or misleading summaries may change route analysis, execution planning, and risk assessment.

Where material facts change after submission, those changes should be communicated rather than left for later discovery.

#### Technical issues

If a form fails, an upload appears incomplete, or a technical issue prevents proper submission, contact `moniquefadv@gmail.com`. If the matter is urgent, note the technical issue and the urgency separately.

Duplicate submissions should be avoided unless the first attempt clearly failed. Duplicate records reduce intake efficiency and slow review.

## 16. `/legal/gdpr/` GDPR Notice

### Tone

compliance-heavy, international, precise

### Internal links

- `/legal/privacy/`
- `/legal/lgpd/`
- `/legal/terms/`
- `/about/governance/`
- `/about/compliance/`

### Official resources

- European Commission data protection overview
- European Commission international transfers overview
- ANPD FAQ

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Supplemental notice for European data-protection expectations`
- H1: `GDPR Notice`
- Summary: `This GDPR Notice supplements our Privacy Policy for users who expect GDPR-style transparency on controller identity, legal basis, international transfers, and individual rights.`

### Publish-ready page content

#### Statement of GDPR alignment

This page is a supplemental compliance notice for visitors, leads, and clients who are in the European Economic Area, the United Kingdom, Switzerland, or otherwise expect GDPR-style transparency when interacting with Immigrate to Brazil.

Its purpose is not to replace our Privacy Policy. Its purpose is to express the same operating model through a more specifically international data-protection lens.

#### Data controller identification

For purposes of this notice, the data controller for the public platform, intake communications, advisory contact, and related operational processing described here is Immigrate to Brazil, reachable at `moniquefadv@gmail.com`.

This identification is functional and operational. It identifies who governs the processing described on this page and where requests should be directed.

#### Legal basis for processing

Depending on context, processing may be based on pre-contractual necessity, contractual necessity, legitimate interests, legal obligations, or consent where consent is the appropriate basis for the activity concerned.

We use legal-basis language in a controlled way. We aim to reflect the actual function of the processing rather than default to a generic formula.

#### Explicit EU client rights

Where GDPR or comparable rights apply, individuals may have rights that include access, rectification, erasure in appropriate circumstances, restriction, portability where applicable, objection in appropriate circumstances, and withdrawal of consent where consent is the legal basis relied upon.

Those rights are not unlimited in every situation, but they are part of the rights architecture that informs this notice.

#### Cross-border transfer acknowledgment

Immigrate to Brazil operates with an international client base and may use cross-border infrastructure, communications, and service tools. As a result, personal data may be accessed from or transferred to jurisdictions outside the EEA, UK, or Switzerland where that is necessary for lawful operations.

Where such transfer occurs, we aim to apply appropriate legal and operational safeguards proportionate to the circumstances.

#### Complaint process

If you believe your data-protection rights have been infringed and the applicable legal framework gives you the right to complain to a supervisory authority, you may do so. We encourage direct contact first because many issues can be resolved more quickly at operational level, but direct contact with us is not a condition of your rights.

#### Contact point

GDPR-related requests and questions should be sent to `moniquefadv@gmail.com`.

## 17. `/legal/lgpd/` LGPD Notice

### Tone

local compliance authority, precise, Brazil-first

### Internal links

- `/legal/privacy/`
- `/legal/gdpr/`
- `/legal/form/`
- `/about/compliance/`
- `/about/regulatory/`

### Official resources

- LGPD text
- ANPD FAQ
- ANPD petition route

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Brazil-first data-protection and rights notice`
- H1: `LGPD Notice`
- Summary: `This LGPD Notice explains how Immigrate to Brazil approaches data processing, legal bases, rights of data subjects, retention, sharing, and request handling under Brazilian data-protection standards.`

### Publish-ready page content

#### LGPD compliance statement

Immigrate to Brazil approaches personal-data processing on the basis that treatment of personal data must be lawful, purpose-driven, proportionate, and transparent. This notice supplements our Privacy Policy by expressing that framework in Brazil-first terms.

Privacy compliance in this context is not only about disclosure. It is about governing intake, advisory communications, document handling, retention, and service support according to a disciplined operating model.

#### Identification of the controlador

For purposes of this notice, the `controlador` of the personal-data processing described on this page is Immigrate to Brazil, acting through its operating team for platform, intake, communication, advisory, payment, and record-handling activities. Contact for LGPD matters is `moniquefadv@gmail.com`.

#### Data processing purpose

Personal data may be processed for route assessment, intake handling, chronology review, communication, document planning, service delivery, internal compliance controls, fraud prevention, payment verification, dispute management, and protection of rights.

Processing purpose is central to compliance. Data should be processed because the service and legal context require it, not because it happens to be available.

#### Legal bases under Brazilian law

Depending on the situation, legal bases may include consent where appropriate, compliance with legal or regulatory obligations, procedures preliminary to contract formation, contract execution, regular exercise of rights, legitimate interests where lawful and proportionate, and protection of life or physical safety where relevant.

We treat basis selection as a substantive issue. It should track the actual function of the processing.

#### Brazilian user rights

Under the LGPD, data subjects may have rights that include confirmation of processing, access to data, correction of incomplete or inaccurate data, anonymization, blocking or deletion in cases recognized by law, portability where applicable, information about sharing, information about consent consequences, and revocation of consent where consent applies.

Requests should be directed in a sufficiently specific way to allow controlled review and identity verification where necessary.

#### Data retention and sharing

Data is retained only for as long as reasonably necessary for operational, legal, evidentiary, contractual, compliance, or rights-protection purposes. Information may be shared with service providers, collaborators, legal professionals, translation providers, or authorities where necessary for lawful operations or service execution.

Sharing is not casual. It should be tied to purpose, necessity, and proper handling.

#### ANPD reference

If you believe your rights under the LGPD have not been respected, you may review ANPD guidance and the ANPD petition route in addition to contacting us directly. The ANPD remains the relevant public authority reference for the broader regulatory framework.

#### Contact for requests

LGPD-related requests should be sent to `moniquefadv@gmail.com`.

## 18. `/legal/accessibility/` Accessibility Statement

### Tone

simple, professional, credible

### Internal links

- `/legal/search/`
- `/legal/privacy/`
- `/legal/cookies/`
- `/about/standards/`
- `/about/compliance/`

### Official resources

- Gov.br accessibility page
- Governo Digital accessibility tools
- Governo Digital accessibility guide

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Accessibility commitment and ongoing improvement`
- H1: `Accessibility Statement`
- Summary: `This statement explains our commitment to accessibility, our current compatibility objectives, how barriers can be reported, and how we continue improving platform usability.`

### Publish-ready page content

#### Commitment to accessibility standards

We want the Immigrate to Brazil platform to be usable by as many people as possible, including people using screen readers, keyboard navigation, zoom controls, contrast adjustments, reduced-motion settings, and other assistive technologies or accessibility accommodations.

Accessibility is treated here as an operating standard, not as a decorative value statement. If a user cannot navigate, read, submit, or contact us effectively, the platform is not functioning to the standard we expect.

#### Ongoing improvements

Accessibility is an ongoing discipline. We review navigation structure, heading logic, keyboard usability, contrast, text clarity, form behavior, and content structure with the objective of reducing avoidable barriers over time.

We do not present accessibility as completed perfection. We present it as an active control area that requires maintenance and improvement.

#### Compatibility with assistive technologies

We aim for compatibility with modern browsers and common assistive technologies and align our direction with widely recognized accessibility standards, including WCAG 2.2 AA as a practical benchmark.

Actual user experience may vary depending on browser version, device configuration, assistive technology stack, and third-party tools that may not be fully under our control.

#### Reporting issues

If you encounter an accessibility issue, email `moniquefadv@gmail.com` and describe the page, the issue, and the task you were attempting. If email is not the easiest route, you may also contact us by phone or WhatsApp at `+55 43 9961-4034`.

Where a barrier affects your ability to complete a step, we will do our best to provide an alternative route while the issue is being reviewed.

## 19. `/legal/disclaimer/` Disclaimer & Legal Notice

### Tone

strong, protective, immigration-realistic

### Internal links

- `/legal/terms/`
- `/legal/privacy/`
- `/services/`
- `/services/defense/`
- `/about/governance/`
- `/about/ethics/`

### Official resources

- Migration Law
- Migration Regulation Decree
- Policia Federal immigration portal

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Public-information limits and authority-controlled outcomes`
- H1: `Disclaimer & Legal Notice`
- Summary: `This notice clarifies the legal boundary between general information, strategic consultation, formal representation, and government-controlled decision-making.`

### Publish-ready page content

#### Information is general in nature

Information published on this platform is general in nature and is intended to support orientation, not to function as a final or individualized legal determination. Public guidance may help a visitor understand route structure, procedural logic, or common record issues, but it does not resolve a case by itself.

That distinction is essential in immigration work, where the same rule may produce different consequences depending on chronology, nationality, record quality, authority posture, and prior procedural history.

#### Not a substitute for individualized legal advice

Nothing on this platform should be treated as individualized legal advice unless it has been provided in the proper professional context after controlled review of the relevant facts and records. Public content may inform. It does not replace tailored legal analysis.

If the cost of being wrong is material, public content is not enough.

#### No guarantee of approval

We do not guarantee visa approval, residence approval, naturalization approval, regularization success, or any other substantive government outcome. Government authorities control those decisions.

We also do not guarantee that a route that appears available in theory will remain viable once the record is fully reviewed.

#### Government authorities control outcomes

The competent authority controls final acceptance, issuance, registration, interpretation, document sufficiency, procedural discretion, and timing. Immigrate to Brazil may help structure and strengthen the process, but we do not replace authority control.

Any credible immigration disclaimer must say this plainly.

#### Timelines are variable and external

Timelines in immigration matters are affected by authority workload, procedural sequence, documentary quality, translation timing, filing logic, technical systems, and external events. Public references to timelines should therefore be treated as general planning guidance only.

We do not control the speed at which a public authority acts.

#### Representation boundary

Platform use, email contact, form submission, document upload, or payment for an earlier stage does not by itself create formal legal representation. Representation begins only when scope is accepted in writing.

This boundary protects both client and company from false assumptions about responsibility.

## 20. `/legal/emergency/` Emergency Resources

### Tone

controlled, urgent, procedural

### Internal links

- `/legal/disclaimer/`
- `/legal/form/`
- `/services/defense/`
- `/services/defense/appeals/`
- `/services/defense/deportation/`
- `/services/defense/expulsion/`
- `/about/compliance/`

### Official resources

- Migration Law
- Migration Regulation Decree
- Policia Federal immigration portal

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Urgent matters, authority-first action, and emergency triage`
- H1: `Emergency Resources`
- Summary: `This page defines what qualifies as urgent, when authorities should be contacted first, and how emergency triage should be initiated with Immigrate to Brazil.`

### Publish-ready page content

#### Purpose of this page

This page exists to impose order on urgent immigration situations. It identifies what should be treated as an actual emergency, what should be escalated first to a public authority, and what information must be assembled immediately to support useful triage.

Urgency does not justify procedural confusion. In high-risk situations, clarity matters more, not less.

#### What qualifies as urgent

Urgent situations may include airport restrictions, detention risk, immediate removal exposure, live authority action, seizure or loss of essential immigration documents, same-day deadlines, immediate compliance failures with material consequences, or other situations where waiting in a standard queue would materially worsen the matter.

Not every stressful situation is legally urgent. This page is for matters where time and procedural posture genuinely affect risk.

#### Authority-first rule

If the situation involves immediate physical danger, health emergency, detention, or another condition that requires state intervention, the relevant public authority should be contacted first. Legal triage does not replace emergency services or immediate public protection channels.

Once that first authority step is taken, the matter may then be escalated to us with a controlled factual summary.

#### Emergency triage protocol

An emergency message should include:

- full name
- current location
- nationality
- current status if known
- authority involved, if any
- deadline or live event
- the most important document, notice, or instruction available

Existing clients should identify themselves as current clients and include any matter reference already in use.

#### What this page does not promise

This emergency channel does not promise instant availability, automatic case acceptance, guaranteed intervention, or guaranteed success. It is a triage mechanism, not a guarantee mechanism.

The objective is to shorten the path to the right next action, not to manufacture certainty in circumstances where certainty does not yet exist.

#### Contact

Urgent operational contact:

- `+55 43 9961-4034`
- `moniquefadv@gmail.com`

## 21. `/legal/search/` Search

### Tone

controlled, functional, navigation-focused

### Internal links

The search page should use route shortcuts, not keyword chips.

- `/services/`
- `/services/visas/`
- `/services/residencies/`
- `/services/naturalisation/`
- `/services/defense/`
- `/about/about/`
- `/about/clients/`
- `/legal/`
- `/legal/privacy/`
- `/legal/payment/`
- `/legal/refund/`

### Official resources

No outbound resources are required here beyond the standard legal-family resource shell.

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Route discovery and legal-family navigation`
- H1: `Search`
- Summary: `Use search to locate the correct service route, legal notice, or institutional page when the problem is clear but the page name is not.`

### Publish-ready page content

#### Overview

This search page is designed to reduce route friction. Many visitors know the issue they are dealing with but do not yet know the site structure or the category name that best matches it. Search should help them move from uncertainty to the right internal destination quickly.

The search experience should therefore privilege route discovery, not generic suggestion noise.

#### Shortcut guidance

Above or below the search field, the page should display direct route shortcuts into the main site families:

- Services
- Visas
- Residencies
- Naturalisation
- Defense
- About
- Legal Hub
- Privacy Policy
- Payment Terms
- Refund Policy

Each shortcut should lead to an actual page, not to a search query.

#### When search is not enough

If search results still do not produce the right page, the visitor should move to the Services hub, the Legal hub, or the About family depending on whether the question is route-specific, policy-specific, or company-standards-specific.

## 22. `/legal/404/` Page Not Found

### Tone

controlled, reassuring, procedural

### Internal links

- `/legal/`
- `/legal/search/`
- `/services/`
- `/services/advisory/consultation/`
- `/about/about/`
- `/about/clients/`

### Official resources

No outbound resources required.

### Hero

- Eyebrow: `LEGAL`
- Kicker: `Route recovery`
- H1: `Page Not Found`
- Summary: `The requested page is not available at this address. Use the recovery links below to return to the correct legal, service, or institutional route.`

### Publish-ready page content

#### Overview

This address does not currently resolve to a live page. The cause may be a moved page, an outdated bookmark, an incomplete URL, or an internal link that no longer matches the current route structure.

The correct response is recovery, not guesswork.

#### Recovery actions

The 404 page should direct the visitor immediately to:

- Legal Hub
- Search
- Services
- Advisory Consultation
- About
- Clients

These links should be presented as direct recovery routes rather than as decorative suggestions.

#### If the missing page matters urgently

If the missing page was being used in connection with an urgent immigration issue, the visitor should be directed to the Emergency Resources page or to the most relevant defense route inside the Services family.

## 23. Implementation Rules For Related Links

### Page-specific related-link sets

Do not repeat the same five related links across every legal page. Use these mapped sets:

- Legal Hub:
  - Privacy
  - Terms
  - Payment
  - Refund
  - About Compliance

- Privacy:
  - LGPD
  - GDPR
  - Form
  - About Compliance
  - About Standards

- Cookies:
  - Privacy
  - Terms
  - Accessibility
  - Search
  - About Compliance

- Terms:
  - Disclaimer
  - Payment
  - Refund
  - Services
  - About Governance

- Payment:
  - Refund
  - Form
  - Terms
  - Advisory Consultation
  - About Compliance

- Refund:
  - Payment
  - Terms
  - Form
  - Advisory Consultation
  - About Compliance

- Form:
  - Privacy
  - Payment
  - Refund
  - Terms
  - About Compliance

- GDPR:
  - Privacy
  - LGPD
  - Terms
  - About Governance
  - About Compliance

- LGPD:
  - Privacy
  - GDPR
  - Form
  - About Compliance
  - About Regulatory

- Accessibility:
  - Search
  - Privacy
  - Cookies
  - About Standards
  - About Compliance

- Disclaimer:
  - Terms
  - Services
  - Defense
  - About Governance
  - About Ethics

- Emergency:
  - Disclaimer
  - Defense
  - Appeals
  - Deportation
  - Expulsion

- Search:
  - Services
  - Visas
  - Residencies
  - About
  - Legal Hub

- 404:
  - Legal Hub
  - Search
  - Services
  - Advisory Consultation
  - About

## 24. Implementation Rules For Official Resources

### Resource-block rule

Every legal page may include an official resource block, but only with public authority sources and only where the link meaningfully supports the page.

### Resource assignments

- Privacy:
  - LGPD
  - ANPD FAQ
  - ANPD petition route

- Cookies:
  - LGPD
  - Decree no. 7.962/2013

- Terms:
  - Migration Law
  - Migration Regulation Decree

- Payment:
  - Decree no. 7.962/2013
  - Ministry of Justice consumer guidance

- Refund:
  - Ministry of Justice consumer guidance
  - Decree no. 7.962/2013

- Form:
  - LGPD
  - ANPD FAQ

- GDPR:
  - European Commission data protection overview
  - European Commission international transfers overview

- LGPD:
  - LGPD
  - ANPD FAQ
  - ANPD petition route

- Accessibility:
  - Gov.br accessibility page
  - Governo Digital accessibility tools
  - Governo Digital accessibility guide

- Disclaimer:
  - Migration Law
  - Migration Regulation Decree
  - Policia Federal immigration portal

- Emergency:
  - Migration Law
  - Migration Regulation Decree
  - Policia Federal immigration portal

## 25. Final Editorial Direction

The legal family should now be treated as a premium advisory layer, not as a template exercise. The writing should make the company look more controlled, more compliant, more structured, and more credible. The pages should feel publish-ready because they are doing real legal and operational work:

- setting scope
- protecting the company
- informing the client
- reinforcing process discipline
- clarifying authority boundaries
- showing how Immigrate to Brazil actually works

The next implementation step, if requested, is to convert this blueprint directly into the actual `page.json` and `body.html` files for the English legal family and then mirror the same framework into `pt-br`.
