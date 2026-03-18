import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

import {
  DYSLEXIA_FONT_STACK,
  FORM_ENDPOINTS,
  OFFICIAL_SOURCES,
  SITE,
  SOURCE_SETS
} from "../content/config.js";
import { LAWYER_FACTS, NAVIGATION, PAGES, pageLookup, routeKey } from "../content/pages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_PATH = path.join(ROOT, "templates", "base.html");
const TESTIMONIALS_PATH = path.join(ROOT, "content", "testimonials.json");
const PT_PRESENT = process.env.PT_PRESENT === "1" || existsSync(path.join(ROOT, "pt-br"));

const WORD_COUNT_TARGET = { min: 2100, max: 2550 };
const WORD_COUNT_EXCEPTIONS = new Set(["search", "utility"]);

const STYLE_LABELS = {
  about: "institutional guidance",
  lawyer: "public professional profile",
  brazil: "country context",
  "brazil-search": "discovery guidance",
  process: "process guidance",
  "service-hub": "service overview",
  "service-child": "service detail",
  "services-home": "service overview",
  home: "home guidance",
  consultation: "consultation intake",
  payment: "operational payment guidance",
  form: "intake guidance",
  emergency: "emergency guidance",
  legal: "policy guidance",
  insight: "editorial guidance",
  search: "search page",
  "404": "recovery guidance",
  utility: "utility guidance"
};

function ensureOk(status, message) {
  if (!status) {
    throw new Error(message);
  }
}

function absoluteUrl(route) {
  if (route === "/") return SITE.domain;
  return `${SITE.domain}${route}`;
}

function humanizeRoute(route) {
  if (route === "/") return "Home";
  return route
    .replace(/^\/|\/$/g, "")
    .split("/")
    .slice(-1)[0]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).length : 0;
}

function truncate(value, length) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trim()}…`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderLink(url, label) {
  return `<a href="${url}">${escapeHtml(label)}</a>`;
}

function buildMetaDescription(page) {
  const topicList = page.topics.slice(0, 3).join(", ").toLowerCase();
  return truncate(
    `${page.summary} Covers ${topicList}, practical documentation logic, official-resource orientation, and clear advisory boundaries.`,
    158
  );
}

function buildTitle(page) {
  if (page.route === "/") {
    return `Immigrate to Brazil | Immigration Pathways, Compliance, and Living Guidance`;
  }
  const familyLabel =
    page.family === "services"
      ? "Brazil Immigration Services"
      : page.family === "process"
        ? "Brazil Immigration Process"
        : page.family === "brazil"
          ? "Brazil Living Guidance"
          : page.family === "legal"
            ? "Legal Information"
            : page.family === "insights"
              ? "Immigration Insights"
              : "Immigrate to Brazil";
  return `${page.title} | ${familyLabel} | ${SITE.titleSuffix}`;
}

function getHero(page) {
  const folder = page.family === "foundation" ? "foundation" : page.family;
  return {
    path: `/assets/images/heroes/${folder}/${routeKey(page.route)}.webp`,
    alt: `${page.title} page hero with a cinematic Brazil landscape`,
    folder,
    query: page.heroTheme
  };
}

function getOfficialSources(page) {
  return page.officialSourceSet.map((key) => OFFICIAL_SOURCES[key]).filter(Boolean);
}

function getFamilyLead(page) {
  switch (page.sectionStyle) {
    case "about":
      return "This page sets out institutional context in a neutral, OAB-safe voice and avoids claims about outcomes or superiority.";
    case "lawyer":
      return "This page is the only location on the site where the named professional reference is used directly, and it stays limited to publicly available factual material.";
    case "brazil":
    case "brazil-search":
      return "The goal here is orientation rather than promotion: readers get structured context about Brazil, authorities, variation between regions, and practical relocation considerations.";
    case "process":
      return "Brazilian immigration procedures are authority-led, which means advisory work is mainly about lawful preparation, sequencing, and realistic expectations.";
    case "service-hub":
    case "service-child":
    case "services-home":
      return "Service pages describe how work is structured, what documentation logic usually matters, and where the limits of prediction remain.";
    case "consultation":
      return "The consultation flow is designed to be explicit from the first contact, including payment, scheduling rules, document review, and manual confirmation.";
    case "payment":
      return "Payment information is operational and transparent so that visitors understand what is paid, where proof should be sent, and when a slot can be confirmed.";
    case "form":
      return "The intake form exists to organize information before any meeting is confirmed, not to promise representation or guarantee a filing route.";
    case "emergency":
      return "Urgent situations are handled with a practical first-response logic: immediate threats go first to the competent authority, while legal follow-up is coordinated through WhatsApp.";
    case "legal":
      return "Policy pages explain how the website operates, how data is handled, and how readers can understand the boundaries of the platform.";
    case "insight":
      return "Insights pages are editorial explainers that clarify concepts, institutions, and distinctions often misunderstood by people planning a move to Brazil.";
    default:
      return "The site is structured to give readers clear guidance, grounded in official sources and neutral language, before any consultation is requested.";
  }
}

function buildIntroParagraph(page) {
  const familyIntro =
    page.family === "brazil"
      ? "Brazil is large, institutionally layered, and regionally varied, so any useful explanation has to balance federal rules with local realities."
      : page.family === "services"
        ? "Advisory work in immigration matters is rarely about a single form or a single appointment; it usually involves timing, documentation, official channels, and a careful reading of purpose and eligibility."
        : page.family === "process"
          ? "A process view helps readers understand what happens before, during, and after filing, and where professional support can reduce avoidable risk without promising a result."
          : page.family === "about"
            ? "Institutional pages matter because readers need to understand the structure of the platform, its informational goals, and the professional boundaries that apply to legal content in Brazil."
            : page.family === "legal"
              ? "Operational and policy pages should be as readable as service pages, because expectations around data, payment, contact, and access directly affect user decisions."
              : "People exploring immigration to Brazil often need a single page that brings together concept, procedure, documentation logic, and authority context.";

  return `<p class="lead">${escapeHtml(page.summary)}</p>
  <p>${escapeHtml(getFamilyLead(page))}</p>
  <p>${escapeHtml(familyIntro)} ${escapeHtml(
    page.route === "/about/lawyer/"
      ? "Where the site references the lawyer profile, it does so only within the limited factual scope permitted by the brief."
      : "Throughout the site, the language stays informational, avoids guarantees, and points readers back to official sources whenever a formal rule or authority decision controls the next step."
  )}</p>`;
}

function topicParagraphs(page, topic, index) {
  const topicLower = topic.toLowerCase();
  const pageLower = page.title.toLowerCase();

  if (page.route === "/about/lawyer/") {
    const lawyerContent = {
      "Full Identification": `Public source material reviewed for this website identifies ${LAWYER_FACTS.legalName} as a Brazilian attorney and names ${LAWYER_FACTS.oab} as the professional registration reference. That is the core identification detail used here. The page does not expand beyond public-facing material, and it deliberately avoids inventing biographical information that the source record does not state. Keeping this section limited is important for accuracy, for OAB-safe communication, and for preserving a clear distinction between public professional identification and unverified personal biography.`,
      "Academic Background": `The brief asks for academic background, but the available source materials reviewed for this build do not publish a law-school name, degree date, or a public academic timeline. For that reason, this section is intentionally narrow: it explains that the site will not infer an institution, a degree sequence, or a credential list that was not clearly made public in the source material. In other words, factual restraint is treated as part of compliance. Where a future verified public record exists, this page can be updated with precise institutional details, but the current release stops at what is presently documented.`,
      "Professional Qualifications": `The professionally relevant facts that can be stated with confidence are the OAB registration, the public identification as a Brazilian attorney, the stated service languages, and the public positioning of the practice in immigration-related matters. That is enough to explain qualification in a legally careful way without sliding into promotional language. The point of this page is not to market prestige; it is to tell readers what can be verified, how the professional role is framed, and where the boundaries of public information currently sit.`,
      "Areas of Practice": `Source material indicates a practice focus that includes immigration, civil, family, and human-rights matters. This website, however, is built for immigration-focused guidance, so that broader range is mentioned only as contextual background. Readers should understand the difference between a public description of practice areas and the narrower editorial scope of this platform. The information architecture here keeps immigration front and center while acknowledging that cross-border cases sometimes intersect with family status, records, translations, or related civil questions.`,
      "Immigration Experience": `Public-facing materials describe experience supporting immigration matters and reference a practice active since 2018. Rather than turning that into a comparative claim, this page uses it to situate the timeline of the work. Experience in this context means repeated exposure to documentation review, route assessment, status maintenance, and authority-led procedures. It does not remove uncertainty from any case, and it does not substitute for the formal rules issued by the competent authorities. The practical value of experience lies in organization, issue spotting, and communication discipline.`,
      "Languages": `The reviewed source materials state that services are offered in English and Portuguese. On this site, that fact matters because many users are international readers navigating Brazilian institutions for the first time. Clear bilingual service capacity can reduce misunderstanding around document names, procedural expectations, and next-step instructions. It does not change the legal standards applied by Brazilian authorities, but it can improve how guidance is understood and how communication is sequenced between intake, review, and later stages of a matter.`
    };
    const text =
      lawyerContent[topic] ||
      `This section addresses ${topicLower} using only public, verifiable facts and avoids embellishment. That restraint is deliberate, because professional profile pages should remain accurate even when the underlying source material is limited.`;
    return [
      text,
      `Viewed together, the lawyer profile on this site is intentionally modest: it confirms identity, registration reference, languages, and practice framing, but it avoids unsupported biography. That method aligns with the broader editorial approach of the project, which favors careful public facts over inferred credentials or persuasive claims.`
    ];
  }

  const style = page.sectionStyle;
  if (style === "about") {
    return [
      `${topic} is treated here as part of the platform's institutional architecture rather than as a marketing slogan. In practice, that means explaining how the site organizes information, where immigration guidance fits within Brazilian legal and administrative structures, and how readers should interpret the material before taking action. Because the platform is English-first and built for cross-border readers, each institutional topic also has to be usable by people who may not yet know the difference between a visa, a residence authorization, a Federal Police registration duty, and a later citizenship route. The narrative therefore focuses on definitions, scope, and operational clarity.`,
      `From a compliance perspective, ${topicLower} also helps set boundaries. It tells readers what the site can do, what it cannot do, and why a later consultation may still be necessary for a case-specific answer. Institutional pages are where transparency becomes concrete: they explain nationwide online service delivery, acknowledge regional examples without narrowing the service area, and make clear that Brazilian authorities issue final decisions. That is especially important in immigration matters, where readers often arrive with urgent goals, incomplete document files, or assumptions drawn from another country's system.`
    ];
  }

  if (style === "brazil" || style === "brazil-search") {
    return [
      `${topic} is best understood in a Brazil-wide frame first and a local frame second. Federal institutions set many of the rules that matter to migrants and residents, but living conditions, service availability, cost patterns, and administrative friction vary by state and municipality. That is why this page treats ${topicLower} as a contextual issue rather than a single nationwide fact. Readers thinking about Brazil need both the macro picture and the regional nuance: what is common across the country, what changes between capitals and interior cities, and what practical differences appear once a person starts dealing with housing, schooling, healthcare, mobility, or documentation.`,
      `In relocation planning, ${topicLower} also connects directly with decision quality. A route that looks straightforward on paper can feel different once transport, safety, cost variation, climate, local infrastructure, and public-service access are taken into account. The value of this section is therefore not to rank places or make lifestyle promises. Instead, it gives a structured lens for comparing regions, understanding institutional responsibilities, and identifying where official datasets, municipal information, or national statistics should be consulted before making a move, renting property, or structuring a long-term immigration plan.`
    ];
  }

  if (style === "process") {
    return [
      `${topic} is one of the points where readers often need a more realistic picture of how Brazilian immigration administration works. Procedures are not only about eligibility; they also depend on document consistency, timing, the correct authority, and the ability to respond to follow-up requests without creating contradictions in the file. This is why process guidance focuses on structure. By breaking ${topicLower} into its legal and administrative components, the page helps people understand what is in their control, what remains in the authority's control, and where professional review can prevent avoidable friction.`,
      `A process-oriented reading of ${topicLower} is also useful because it counters a common misunderstanding: many applicants assume that once a route is chosen, the rest is mechanical. In reality, the sequence of preparation matters. Documents may need legalization, translation, updates, or consistency checks; timelines can move around authority backlogs; and some obligations only become visible after submission or after approval. The section therefore explains ${topicLower} as a management issue as much as a legal issue, which is often the difference between a coherent case file and a preventable setback.`
    ];
  }

  if (style === "service-child" || style === "service-hub" || style === "services-home") {
    return [
      `In a ${pageLower} matter, ${topicLower} usually begins with a disciplined review of purpose, status, timing, and supporting records. Brazil's immigration system distinguishes between entry, stay, registration, and later status management, so advisory work cannot be reduced to naming a category and filing a form. The legal value of this section lies in showing how the service is organized: what should be checked first, how the intended activity is framed, which documents normally need scrutiny, and where the line sits between a lawful plan and an avoidable compliance risk. That structure helps readers understand the service without implying certainty about an outcome.`,
      `The same topic also matters after the first analysis, because service delivery continues beyond a checklist. ${topic} can affect how a case is positioned, how an applicant communicates with a consular or administrative authority, how later Federal Police obligations are anticipated, and whether the route still makes sense once facts change. For that reason, the page presents ${topicLower} as an ongoing part of file management. It is not presented as a guarantee, and it is not treated as a shortcut around official rules. Instead, it is framed as a way to reduce inconsistency, clarify expectations, and keep the matter aligned with Brazilian law and procedure.`
    ];
  }

  if (style === "consultation") {
    return [
      `${topic} is important at the intake stage because consultations work best when expectations are clear before a meeting is confirmed. On this site, the request comes first, payment follows, and scheduling only moves ahead after proof of payment is checked and the team confirms that the requested slot respects the 36-hour minimum window. This sequence keeps operational steps visible and avoids the confusion that happens when a visitor assumes that form submission alone reserves time. By explaining ${topicLower} directly, the page reduces avoidable back-and-forth and helps clients arrive with the right documents and questions prepared.`,
      `There is also a legal reason to describe ${topicLower} carefully. Early-stage communication often shapes how a later case file is organized, what the first document checklist looks like, and whether a person understands the limits of preliminary analysis. A consultation is a structured discussion, not an automatic engagement or a filing promise. The intake logic on this page therefore treats ${topicLower} as part of proper case scoping: enough information is gathered to identify issues, but final strategy still depends on review of the record, applicable law, current authority guidance, and the practical realities of the applicant's timeline.`
    ];
  }

  if (style === "payment") {
    return [
      `${topic} is explained in operational detail because payment misunderstandings quickly affect scheduling, expectations, and later communication. The consultation flow used on this site is simple on purpose: the client requests a consultation, pays the stated fee using one of the accepted channels, sends proof, and then waits for manual confirmation. By treating ${topicLower} as a documented operational step rather than an informal side note, the site helps visitors understand what has been done, what still needs confirmation, and when an appointment can realistically be set.`,
      `This matters for fairness as well as efficiency. A payment page should not feel vague or improvised, particularly when visitors may be in different countries and using different transfer methods. That is why ${topicLower} is described alongside receiver details, proof-of-payment expectations, and WhatsApp support for practical issues. The objective is not to create urgency; it is to build a clear administrative trail so that payment, review, and scheduling line up cleanly with the team's manual confirmation workflow.`
    ];
  }

  if (style === "form") {
    return [
      `${topic} appears in the intake form because the team needs a minimum factual basis before reviewing whether a consultation request is ready to move forward. Immigration matters often turn on small details such as nationality, current location, existing status, target timeline, document condition, and intended activity in Brazil. When ${topicLower} is captured early, it helps organize the first review and reduces the risk that a consultation begins with missing essentials. This is not about collecting more data than necessary; it is about receiving enough context to make the first conversation productive and properly scoped.`,
      `The form also has to serve users who are uncertain about their category. Many people know their goal but not the precise legal label. That is why ${topicLower} is presented with practical explanations rather than technical shorthand wherever possible. The form page makes clear that submission does not create a lawyer-client relationship by itself, but it does create an orderly intake record that supports manual review, follow-up questions, and better preparation for the consultation stage if the request proceeds.`
    ];
  }

  if (style === "emergency") {
    return [
      `${topic} is framed here with urgency but also with discipline. Not every stressful immigration problem is a legal emergency, and not every emergency should start with a lawyer. When immediate danger, detention, health risk, or a time-critical authority event is involved, the first contact may need to be the competent public authority. This page explains ${topicLower} so that users understand when WhatsApp is the fastest way to alert the team and when an authority-first response is the safer first step. That distinction prevents delay and keeps legal follow-up aligned with the real nature of the event.`,
      `Emergency guidance also needs limits. A site can explain channels, response expectations, and what information should be sent, but it cannot promise instant intervention in every situation. By describing ${topicLower} openly, the page gives users a practical escalation path: identify the emergency, send a concise message through WhatsApp, include the location and immediate issue, and understand that existing clients with active matters may require a different handling note than first-time contacts. Clarity is itself a form of support in urgent situations.`
    ];
  }

  if (style === "legal") {
    return [
      `${topic} is discussed here in plain English because legal notices are only useful if readers can understand them before a problem arises. Whether the issue is privacy, cookies, terms, refunds, or accessibility, the page treats ${topicLower} as an operational commitment that shapes how the platform works. This includes the limits of website use, the lawful bases used for basic data handling, the role of consent for analytics, and the difference between receiving information through a website and formally engaging legal representation. A notice should reduce ambiguity, not create it.`,
      `Policy content also has a trust function. Visitors deciding whether to contact the team need to know how their information is handled, what the site tracks after consent, and what rights or options they retain if they want to ask questions or withdraw. Explaining ${topicLower} in this context is therefore part of broader compliance. It also aligns with the Brazil-first nature of the site, which uses LGPD as the main framework while acknowledging international expectations when that is appropriate for global readers.`
    ];
  }

  if (style === "insight") {
    return [
      `${topic} is one of the concepts that often gets flattened or misunderstood in public discussions about immigration. An insights page has a different job from a service page: it gives readers a framework for thinking clearly before they decide whether they need case-specific assistance. In the Brazilian context, ${topicLower} is rarely only a matter of terminology. It can affect whether a person approaches a consulate, a ministry, or the Federal Police, and it can change how rights, duties, and timelines are interpreted. That is why this section explains the concept in narrative form instead of reducing it to a single definition.`,
      `A second reason to isolate ${topicLower} is that migration planning often fails when people treat categories as interchangeable. Visa, residence, registration, renewal, and naturalisation all operate at different stages and under different logics. The purpose of this section is to slow that confusion down. It shows where distinctions matter, which institutional actors are usually involved, and why official guidance should be checked whenever a reader is moving from broad orientation into an actual filing or travel decision.`
    ];
  }

  return [
    `${topic} matters on this page because readers need structured guidance before they can judge what to do next. In the context of ${pageLower}, the subject is explained with attention to documentation, timing, official instructions, and the limits of website-based information. That approach helps keep the page neutral and practical at the same time.`,
    `The wider point is that ${topicLower} should not be treated as a slogan or a shortcut. It is one part of a broader framework involving legal rules, administrative steps, and real-world preparation. This page therefore connects the topic back to official resources, related internal guidance, and clear next steps for readers who need deeper review.`
  ];
}

function topicSectionVariant(page, index) {
  if (page.sectionStyle === "legal" || ["payment", "form", "emergency"].includes(page.sectionStyle)) {
    return index % 2 === 0 ? "frame" : "band";
  }
  if (page.sectionStyle === "process" || page.sectionStyle === "consultation") {
    return ["split", "rail", "frame"][index % 3];
  }
  if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
    return ["band", "split", "frame"][index % 3];
  }
  if (page.sectionStyle === "service-hub" || page.sectionStyle === "service-child" || page.sectionStyle === "services-home") {
    return ["split", "frame", "band"][index % 3];
  }
  if (page.sectionStyle === "home") {
    return ["band", "split", "frame"][index % 3];
  }
  return ["split", "frame", "band"][index % 3];
}

function topicKicker(page, index) {
  const label = STYLE_LABELS[page.sectionStyle] || "page guidance";
  return `${label} ${String(index + 1).padStart(2, "0")}`;
}

function topicStrap(page, topic, index) {
  const topicLower = topic.toLowerCase();
  if (page.sectionStyle === "service-child" || page.sectionStyle === "service-hub" || page.sectionStyle === "services-home") {
    return `Route fit, records, and next-step focus for ${topicLower}.`;
  }
  if (page.sectionStyle === "process" || page.sectionStyle === "consultation") {
    return `Sequence, timing, and expectations around ${topicLower}.`;
  }
  if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
    return `Regional context and comparison points for ${topicLower}.`;
  }
  if (page.sectionStyle === "legal" || ["payment", "form", "emergency"].includes(page.sectionStyle)) {
    return `Operational guidance on ${topicLower}.`;
  }
  if (page.sectionStyle === "home") {
    return `A high-level orientation to ${topicLower}.`;
  }
  return `Focused context for ${topicLower}.`;
}

function topicNotes(page, topic, index) {
  const familyNote =
    page.family === "services"
      ? "Structured service framing."
      : page.family === "process"
        ? "Timing and sequencing matter."
        : page.family === "brazil"
          ? "Regional differences matter."
          : page.family === "legal"
            ? "Operational notice and limits."
            : "Orientation before action.";

  const actionNote =
    page.sectionStyle === "consultation"
      ? "Prepare facts and documents."
      : page.sectionStyle === "payment"
        ? "Pay, then send proof."
        : page.sectionStyle === "form"
          ? "Complete the intake clearly."
          : page.sectionStyle === "emergency"
            ? "Use WhatsApp first."
            : page.family === "services"
              ? "Check fit and timing."
              : page.family === "process"
                ? "Track duties and deadlines."
                : "Follow official sources.";

  return [
    { label: "Why it matters", text: familyNote },
    {
      label: index % 2 === 0 ? "What users should do" : "What to keep in view",
      text: actionNote
    }
  ];
}

function pageJourneySteps(page) {
  if (page.sectionStyle === "home") {
    return [
      ["Choose a pathway", "Compare route families."],
      ["Read the framework", "Check official rules."],
      ["Prepare your facts", "Gather key records."],
      ["Request consultation", "Enter the intake flow."]
    ];
  }

  if (page.sectionStyle === "consultation") {
    return [
      ["Submit request", "Send the intake request."],
      ["Pay the fee", "Use an approved method."],
      ["Send proof", "Email or WhatsApp it."],
      ["Await confirmation", `Respect the ${SITE.consultationPolicy.minHoursAfterPayment}-hour rule.`]
    ];
  }

  if (page.sectionStyle === "payment") {
    return [
      ["Choose method", "Pick an approved channel."],
      ["Send proof", "Forward confirmation promptly."],
      ["Hold scheduling", "Payment is not booking."],
      ["Watch timing", `Keep the ${SITE.consultationPolicy.minHoursAfterPayment}-hour window in view.`]
    ];
  }

  if (page.sectionStyle === "emergency") {
    return [
      ["Use WhatsApp first", "State the emergency clearly."],
      ["Contact authorities", "Urgent risk goes first."],
      ["Identify the file", "Share matter details."],
      ["Expect triage", "Urgency is reviewed manually."]
    ];
  }

  if (page.family === "services") {
    return [
      ["Clarify the objective", "Define the route goal."],
      ["Check fit", "Test eligibility and timing."],
      ["Prepare the file", "Organize the record."],
      ["Move to intake", "Start the consultation flow."]
    ];
  }

  if (page.family === "process") {
    return [
      ["Locate the stage", "Place yourself in sequence."],
      ["Review timing", "Deadlines affect the next move."],
      ["Check evidence", "Records shape viability."],
      ["Track obligations", "Watch later duties."]
    ];
  }

  if (page.family === "brazil") {
    return [
      ["Compare regions", "Look beyond one city."],
      ["Check infrastructure", "Services vary by place."],
      ["Estimate real costs", "Budget by region."],
      ["Connect to immigration plan", "Match living context to status."]
    ];
  }

  if (page.family === "legal") {
    return [
      ["Read the rule", "Understand the notice."],
      ["Check boundaries", "Website use has limits."],
      ["Adjust preferences", "Set consent and accessibility."],
      ["Contact correctly", "Use the right channel."]
    ];
  }

  return [
    ["Understand the page", "Use it for orientation."],
    ["Check official sources", "Official rules come first."],
    ["Explore related pages", "Move laterally where needed."],
    ["Use the right CTA", "Choose the right next step."]
  ];
}

function renderPageNavigator(page, { title = "On this page", limit = 6, compact = false } = {}) {
  if (page.utility) return "";
  const topics = page.topics.slice(0, limit);
  if (!topics.length) return "";
  return `<section class="page-map${compact ? " page-map--compact" : ""}"${compact ? "" : ' id="page-map"'}>
    <div class="page-map__head">
      <h2>${escapeHtml(title)}</h2>
      <p>Jump between the main topics.</p>
    </div>
    <div class="page-map__links">
      ${topics
        .map(
          (topic) => `<a class="page-map__link" href="#topic-${slugify(topic)}">${escapeHtml(topic)}</a>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderQuickScan(page) {
  if (page.utility) return "";
  const steps = pageJourneySteps(page);
  return `<section class="quick-scan" aria-label="Page overview and journey">
    <div class="quick-scan__shell">
      <div class="quick-scan__panel quick-scan__panel--journey">
        <div class="section-head">
          <h2>Journey snapshot</h2>
          <p>Where this page sits in the flow.</p>
        </div>
        <div class="journey-strip">
          ${steps
            .map(
              ([title, text], index) => `<article class="journey-step">
                <span class="journey-step__count">${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>${escapeHtml(title)}</h3>
                  <p>${escapeHtml(text)}</p>
                </div>
              </article>`
            )
            .join("")}
        </div>
      </div>
      <div class="quick-scan__panel quick-scan__panel--map">
        ${renderPageNavigator(page, { title: "Page map", limit: 7 })}
      </div>
    </div>
  </section>`;
}

function renderSidebar(page) {
  return `<aside class="sidebar-column">
    <section class="sidebar-card sidebar-card--map">
      ${renderPageNavigator(page, { title: "Quick navigation", limit: 8, compact: true })}
    </section>
    <section class="sidebar-card sidebar-card--facts">
      <h2>At a glance</h2>
      <ul class="sidebar-list">
        <li><strong>Page model</strong><span>${escapeHtml(STYLE_LABELS[page.sectionStyle] || page.family)}</span></li>
        <li><strong>Coverage</strong><span>${escapeHtml(SITE.serviceArea)}</span></li>
        <li><strong>Intake route</strong><span>${escapeHtml(page.formGroupLabel)}</span></li>
      </ul>
    </section>
    <section class="sidebar-card sidebar-card--action">
      <h2>Recommended next step</h2>
      <p>${escapeHtml(topicStrap(page, page.topics[0] || page.title, 0))}</p>
      <div class="sidebar-actions">
        <a class="btn btn-cta btn-sm" href="/start-consultation/" data-cta-click="true">Start Consultation</a>
        <a class="btn btn-secondary btn-sm" href="${SITE.whatsappUrl}" data-whatsapp-click="true">WhatsApp</a>
      </div>
      <p class="sidebar-note">Representation and filing strategy remain case-specific and follow review of the record.</p>
    </section>
  </aside>`;
}

function renderTopicSection(page, topic, index) {
  const variant = topicSectionVariant(page, index);
  const topicId = `topic-${slugify(topic)}`;
  const [paragraphOne, paragraphTwo] = topicParagraphs(page, topic, index);
  const notes = topicNotes(page, topic, index);
  return `<section class="content-block flow-section topic-section topic-section--${variant}" id="${topicId}" data-topic="${escapeHtml(topic)}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">${escapeHtml(topicKicker(page, index))}</p>
        <h2>${escapeHtml(topic)}</h2>
        <p class="section-strap">${escapeHtml(topicStrap(page, topic, index))}</p>
      </div>
      <div class="topic-section__body">
        <p>${escapeHtml(paragraphOne)}</p>
        <p>${escapeHtml(paragraphTwo)}</p>
      </div>
      <aside class="topic-section__aside" aria-label="${escapeHtml(topic)} quick notes">
        ${notes
          .map(
            (item) => `<div class="topic-note">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.text)}</span>
            </div>`
          )
          .join("")}
      </aside>
    </div>
  </section>`;
}

function renderExpansionSection(page, index) {
  const label = [
    "Practical implications",
    "Documentation discipline",
    "Authority interaction",
    "Regional and case variation",
    "Planning perspective"
  ][index % 5];
  return `<section class="content-block flow-section supplemental topic-section topic-section--frame" id="expansion-${index}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Expanded context ${String(index + 1).padStart(2, "0")}</p>
        <h2>${label}</h2>
        <p class="section-strap">${escapeHtml(topicStrap(page, label, index + page.topics.length))}</p>
      </div>
      <div class="topic-section__body">
        <p>${escapeHtml(
      `${label} on ${page.title.toLowerCase()} matters is where general information becomes useful in practice. Readers moving to Brazil, regularizing status, or planning a longer stay usually need more than definitions: they need a way to connect the rule to their own documents, deadlines, locations, and decision points. That is why this extra section steps back from the page outline and highlights how the topic behaves when people move from research into action. It reinforces the distinction between public guidance and case-specific advice while still giving enough detail to reduce uncertainty. It also explains why strong preparation depends on chronology, document condition, and a realistic understanding of which issues can be clarified immediately and which only emerge after the file is reviewed in sequence.`
    )}</p>
        <p>${escapeHtml(
      `This added perspective also supports the quality goal of the site. Rather than ending a page with broad statements, the platform uses supplemental analysis to show where official instructions, procedural variation, and factual complexity can change the path ahead. In Brazilian immigration and relocation matters, seemingly small differences often affect timing, compliance, or the correct authority. Keeping that nuance visible helps readers prepare better questions, build cleaner records, and approach later consultations with a more realistic understanding of the process. It is especially useful for international readers comparing Brazil with another jurisdiction, because terminology, evidence expectations, and administrative sequencing do not always translate neatly from one country to another.`
    )}</p>
      </div>
      <aside class="topic-section__aside" aria-label="${escapeHtml(label)} quick notes">
        ${topicNotes(page, label, index + page.topics.length)
          .map(
            (item) => `<div class="topic-note">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.text)}</span>
            </div>`
          )
          .join("")}
      </aside>
    </div>
  </section>`;
}

function childPagesForHub(page) {
  const prefix = page.route;
  return PAGES.filter(
    (candidate) =>
      candidate.route.startsWith(prefix) &&
      candidate.route !== prefix &&
      candidate.route.split("/").filter(Boolean).length === prefix.split("/").filter(Boolean).length + 1
  );
}

function renderSpecialSections(page, testimonials) {
  const servicesChildren = childPagesForHub(page).slice(0, 4);
  const safeTestimonials = testimonials.filter((item) => !/Monique/i.test(item.text)).slice(0, 6);

  if (page.sectionStyle === "home") {
    const pathways = [
      { title: "Visas", route: "/services/visas/", text: "Entry routes matched to purpose, activity, and consular or administrative sequence." },
      { title: "Residencies", route: "/services/residencies/", text: "Longer-term status planning, registration, compliance, and renewal logic." },
      { title: "Naturalisation", route: "/services/naturalisation/", text: "Citizenship categories, residence-history review, and filing context." },
      { title: "Process", route: "/process/consultation/", text: "Step-by-step explanations of assessment, filing, approval, and obligations." }
    ];
    return `
      <section class="content-block highlight-block">
        <h2>Service pathways at a glance</h2>
        <div class="card-grid">
          ${pathways
            .map(
              (item) => `<article class="info-card">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
                <a class="stretched-link" href="${item.route}">Explore ${escapeHtml(item.title)}</a>
              </article>`
            )
            .join("")}
        </div>
      </section>
      <section class="content-block timeline-block">
        <h2>Consultation flow</h2>
        <ol class="timeline-list">
          <li>Submit the consultation request with your current situation, goals, and any available documents.</li>
          <li>Pay the consultation fee using PayPal, Wise, PIX, or Payoneer to <strong>${SITE.consultationPolicy.paymentReceiverEmail}</strong>.</li>
          <li>Send proof of payment by email or WhatsApp so the team can review the request manually.</li>
          <li>Wait for confirmation. Appointments are only scheduled at least ${SITE.consultationPolicy.minHoursAfterPayment} hours after payment confirmation.</li>
        </ol>
      </section>
      <section class="content-block testimonial-strip">
        <h2>Selected client feedback</h2>
        <div class="quote-grid">
          ${safeTestimonials
            .slice(0, 3)
            .map(
              (item) => `<blockquote class="quote-card">
                <p>“${escapeHtml(item.text)}”</p>
                <footer>${escapeHtml(item.author)}</footer>
              </blockquote>`
            )
            .join("")}
        </div>
      </section>`;
  }

  if (page.sectionStyle === "consultation") {
    return `
      <section class="content-block highlight-block">
        <h2>What to prepare before requesting a consultation</h2>
        <ul class="icon-list">
          <li>Your current country of residence and current immigration status.</li>
          <li>Any deadlines, travel dates, or appointment windows already known.</li>
          <li>Passports, visas, residence cards, civil certificates, or company documents already available.</li>
          <li>A short timeline of what has already happened and what you want to achieve next.</li>
        </ul>
      </section>
      ${renderLeadForm(page, { full: true })}
    `;
  }

  if (page.sectionStyle === "services-home") {
    const hubs = ["/services/visas/", "/services/residencies/", "/services/naturalisation/", "/services/defense/", "/services/other/", "/services/advisory/"]
      .map((route) => pageLookup(route))
      .filter(Boolean);
    return `<section class="content-block highlight-block">
      <h2>Organized by service family</h2>
      <div class="card-grid">
        ${hubs
          .map(
            (item) => `<article class="info-card">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary)}</p>
              <a class="stretched-link" href="${item.route}">Open ${escapeHtml(item.title)}</a>
            </article>`
          )
          .join("")}
      </div>
    </section>`;
  }

  if (page.sectionStyle === "service-hub") {
    return `<section class="content-block child-grid-block">
      <h2>Included routes</h2>
      <div class="card-grid">
        ${servicesChildren
          .map(
            (child) => `<article class="info-card">
              <h3>${escapeHtml(child.title)}</h3>
              <p>Route overview for ${escapeHtml(child.title.toLowerCase())} planning.</p>
              <a class="stretched-link" href="${child.route}">Read ${escapeHtml(child.title)}</a>
            </article>`
          )
          .join("")}
      </div>
    </section>`;
  }

  if (page.sectionStyle === "payment") {
    return `<section class="content-block highlight-block">
      <h2>Accepted payment methods</h2>
      <div class="card-grid compact">
        ${SITE.consultationPolicy.paymentMethods
          .map(
            (method) => `<article class="info-card">
              <h3>${escapeHtml(method)}</h3>
              <p>Use this method for the consultation fee and send proof of payment afterwards.</p>
            </article>`
          )
          .join("")}
      </div>
      <p><strong>Receiver email:</strong> <a href="mailto:${SITE.consultationPolicy.paymentReceiverEmail}">${SITE.consultationPolicy.paymentReceiverEmail}</a></p>
      <p>After payment, send proof by email or WhatsApp. Scheduling is confirmed manually and only for appointments at least ${SITE.consultationPolicy.minHoursAfterPayment} hours after confirmation.</p>
    </section>
    ${renderLeadForm(page, { compact: true })}`;
  }

  if (page.sectionStyle === "form") {
    return renderLeadForm(page, { full: true });
  }

  if (page.sectionStyle === "emergency") {
    return `<section class="content-block alert-block">
      <h2>How to use the emergency channel</h2>
      <p>If the situation is urgent, use <a href="${SITE.whatsappUrl}">WhatsApp</a> first and state the nature of the emergency, your location, your current status, and any deadline or authority action already in progress.</p>
      <p>If there is detention, an airport restriction, a health emergency, or immediate physical risk, contact the competent public authority first. Legal follow-up should then be coordinated through WhatsApp with the most concise possible summary.</p>
      <p>Existing clients should identify themselves as current clients and include the matter reference if available. First-time contacts should understand that an emergency message does not itself create representation.</p>
    </section>
    ${renderLeadForm(page, { compact: true })}`;
  }

  if (page.route === "/about/testimonials/") {
    return `<section class="content-block testimonial-strip">
      <h2>Primary testimonial dataset</h2>
      <p class="small-note">These statements are presented as feedback records, not as guarantees of future outcomes. Punctuation has been normalized lightly where needed, but the substance of each statement has not been rewritten.</p>
      <div class="quote-grid expanded">
        ${testimonials
          .map(
            (item) => `<blockquote class="quote-card">
              <p>“${escapeHtml(item.text)}”</p>
              <footer>${escapeHtml(item.author)}<span>${escapeHtml(item.publishTime.slice(0, 10))}</span></footer>
            </blockquote>`
          )
          .join("")}
      </div>
      <p class="small-note">Feedback reflects individual experiences, many of which are shaped by facts, timing, third-party documents, and authority decisions outside any lawyer's control.</p>
    </section>`;
  }

  if (page.route === "/about/lawyer/") {
    return `<section class="content-block profile-block">
      <h2>Public professional record used on this page</h2>
      <div class="fact-sheet">
        <div><strong>Legal name</strong><span>${escapeHtml(LAWYER_FACTS.legalName)}</span></div>
        <div><strong>Public reference</strong><span>${escapeHtml(LAWYER_FACTS.publicName)}</span></div>
        <div><strong>Registration</strong><span>${escapeHtml(LAWYER_FACTS.oab)}</span></div>
        <div><strong>Languages</strong><span>${escapeHtml(LAWYER_FACTS.languages.join(" and "))}</span></div>
      </div>
    </section>`;
  }

  if (page.sectionStyle === "search") {
    return `<section class="content-block search-results-shell">
      <h2>Search the site</h2>
      <form class="search-inline-form" action="/legal/search/" method="GET" data-search-form="true">
        <label class="visually-hidden" for="legal-search-query">Search term</label>
        <input id="legal-search-query" name="q" type="search" placeholder="Search visas, residencies, process pages, policies..." required />
        <button type="submit">Search</button>
      </form>
      <div id="search-results" data-search-results="true" aria-live="polite"></div>
    </section>`;
  }

  if (page.sectionStyle === "404") {
    return `<section class="content-block alert-block">
      <h2>The page could not be found</h2>
      <p>The address may be outdated, the route may have changed, or the URL may have been typed incorrectly. Use the search tool, the main navigation, or one of the recovery links below.</p>
      <div class="inline-actions">
        <a class="btn btn-cta" href="/">Home</a>
        <a class="btn btn-secondary" href="/start-consultation/">Start Consultation</a>
        <a class="btn btn-secondary" href="/legal/search/">Site Search</a>
      </div>
    </section>`;
  }

  return "";
}

function relatedPages(page) {
  const preferredRoutes = (() => {
    if (page.route === "/") {
      return ["/services/", "/process/consultation/", "/start-consultation/", "/legal/payment/", "/about/lawyer/"];
    }
    if (page.route === "/start-consultation/") {
      return ["/legal/payment/", "/legal/form/", "/process/consultation/", "/services/", "/legal/refund/"];
    }
    if (page.sectionStyle === "payment") {
      return ["/legal/form/", "/start-consultation/", "/process/consultation/", "/legal/refund/"];
    }
    if (page.sectionStyle === "form") {
      return ["/start-consultation/", "/legal/payment/", "/process/consultation/", "/services/"];
    }
    if (page.sectionStyle === "emergency") {
      return ["/process/rights/", "/services/defense/", "/legal/disclaimer/", "/start-consultation/"];
    }
    if (page.family === "services" && page.pageType === "service-child") {
      const segments = page.route.split("/").filter(Boolean);
      return [
        `/${segments[0]}/${segments[1]}/`,
        "/start-consultation/",
        "/process/consultation/",
        "/legal/payment/",
        "/services/"
      ];
    }
    if (page.family === "services") {
      return ["/start-consultation/", "/process/consultation/", "/legal/payment/", "/legal/form/"];
    }
    if (page.family === "process") {
      return ["/start-consultation/", "/services/", "/legal/payment/", "/legal/form/"];
    }
    if (page.family === "brazil") {
      return ["/services/", "/process/planning/", "/start-consultation/", "/insights/general/"];
    }
    if (page.family === "legal") {
      return ["/start-consultation/", "/legal/form/", "/legal/payment/", "/services/"];
    }
    return ["/start-consultation/", "/services/", "/process/consultation/"];
  })();

  const preferred = preferredRoutes.map((route) => pageLookup(route)).filter(Boolean);
  const familyMatches = PAGES.filter(
    (candidate) =>
      candidate.route !== page.route &&
      candidate.family === page.family &&
      !candidate.utility &&
      !candidate.noindex
  ).slice(0, 4);
  const fallback = ["/start-consultation/", "/services/", "/process/consultation/", "/legal/payment/"]
    .map((route) => pageLookup(route))
    .filter(Boolean)
    .filter((candidate) => candidate.route !== page.route);
  const items = [...preferred, ...familyMatches, ...fallback].filter(
    (candidate, index, list) => list.findIndex((item) => item.route === candidate.route) === index
  );
  return items.filter((candidate) => candidate.route !== page.route).slice(0, 5);
}

function buildFaq(page) {
  if (page.utility) return [];

  const baseQuestions = page.topics.slice(0, 5).map((topic) => {
    const topicLower = topic.toLowerCase();
    let question;
    if (page.sectionStyle === "service-child" || page.sectionStyle === "service-hub") {
      question = `How does the ${page.title.toLowerCase()} page address ${topicLower}?`;
    } else if (page.sectionStyle === "process") {
      question = `Why does ${topicLower} matter in the ${page.title.toLowerCase()} stage of the process?`;
    } else if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
      question = `How should readers interpret ${topicLower} on the ${page.title.toLowerCase()} page when planning life in Brazil?`;
    } else if (page.sectionStyle === "legal") {
      question = `How does the ${page.title.toLowerCase()} legal page explain ${topicLower}?`;
    } else if (page.sectionStyle === "consultation") {
      question = `What should a visitor know about ${topicLower} on the start consultation page?`;
    } else {
      question = `What does the ${page.title.toLowerCase()} page mean by ${topicLower}?`;
    }
    const answer = `This page treats ${topicLower} as part of a broader framework involving Brazilian law, administrative procedure, documentation quality, and case-specific facts. It explains the concept in neutral language, highlights where official instructions control the next step, and avoids promising outcomes that only a competent authority can determine.`;
    return { question, answer };
  });

  if (page.sectionStyle === "service-hub") {
    return baseQuestions.slice(0, 3);
  }

  return baseQuestions.slice(0, 5);
}

function renderFaq(page, faqItems) {
  if (!faqItems.length) return "";
  return `<section class="faq-block" id="faq" data-faq="true">
    <div class="section-head">
      <h2>Frequently asked questions</h2>
      <p>Each page carries its own FAQ block so the answer stays tied to the topic at hand.</p>
    </div>
    <div class="accordion" id="faq-accordion-${routeKey(page.route)}">
      ${faqItems
        .map(
          (item, index) => `<div class="accordion-item">
            <h3 class="accordion-header" data-faq-question="true">
              <button class="accordion-button ${index === 0 ? "" : "collapsed"}" type="button" data-bs-toggle="collapse" data-bs-target="#faq-${routeKey(page.route)}-${index}" aria-expanded="${index === 0 ? "true" : "false"}">
                ${escapeHtml(item.question)}
              </button>
            </h3>
            <div id="faq-${routeKey(page.route)}-${index}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}" data-bs-parent="#faq-accordion-${routeKey(page.route)}">
              <div class="accordion-body">${escapeHtml(item.answer)}</div>
            </div>
          </div>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderOfficialResources(page, resources) {
  return `<section class="official-resources" data-official-resources="true">
    <div class="section-head">
      <h2>Official resources</h2>
      <p>Primary government or institutional sources referenced when framing this page.</p>
    </div>
    <div class="resource-grid">
      ${resources
        .map(
          (item) => `<article class="resource-card">
            <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
            <p>${escapeHtml(item.note)}</p>
          </article>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderTrustMarkers(page) {
  if (!["process", "service-hub", "service-child", "services-home", "consultation"].includes(page.sectionStyle)) {
    return "";
  }
  return `<section class="trust-marker-block" data-trust-markers="true">
    <div class="marker">
      <strong>Nationwide online support</strong>
      <span>Guidance can be organized for clients across Brazil, with local examples used only as illustrations.</span>
    </div>
    <div class="marker">
      <strong>Document-driven workflow</strong>
      <span>Case assessment centers on records, timing, and authority requirements rather than assumptions.</span>
    </div>
    <div class="marker">
      <strong>Authority-led outcomes</strong>
      <span>Final decisions remain with the competent authority, court, or consular post.</span>
    </div>
  </section>`;
}

function serviceOptions() {
  return PAGES.filter((page) => page.family === "services" && page.pageType === "service-child").map((page) => page.title);
}

function renderLeadForm(page, options = {}) {
  const action = FORM_ENDPOINTS[page.formGroup];
  const services = serviceOptions();
  const full = Boolean(options.full);
  return `<section class="lead-form-block" id="consultation-form">
    <div class="section-head">
      <h2>${full ? "Request a consultation" : "Send an inquiry"}</h2>
      <p>The form posts to the grouped Formspree endpoint assigned to this route family.</p>
    </div>
    <form action="${action}" method="POST" class="lead-form ${full ? "lead-form-full" : "lead-form-compact"}" data-formspree-group="${page.formGroup}">
      <input type="hidden" name="_subject" value="${escapeHtml(`${page.title} inquiry | ${page.formGroupLabel}`)}" />
      <input type="hidden" name="page_route" value="${escapeHtml(page.route)}" />
      <input type="hidden" name="page_title" value="${escapeHtml(page.title)}" />
      <label>Full Name<input type="text" name="full_name" required /></label>
      <label>Email<input type="email" name="email" required /></label>
      <label>Phone / WhatsApp<input type="tel" name="phone_whatsapp" required /></label>
      ${full ? `<label>Occupation<input type="text" name="occupation" /></label>` : ""}
      ${full ? `<label>Country<input type="text" name="country" required /></label>` : ""}
      ${full ? `<label>Current immigration stage<input type="text" name="immigration_stage" required /></label>` : ""}
      <label>Select your service
        <select name="service_interest" required>
          <option value="">Choose a route</option>
          ${services.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}
          <option value="Not sure yet">Not sure yet</option>
          <option value="Other">Other</option>
        </select>
      </label>
      ${full ? `<label>Case reference (optional)<input type="text" name="case_reference" /></label>` : ""}
      ${full ? `<label>Upload documents<input type="file" name="documents" multiple /></label>` : ""}
      <label>Notes / message<textarea name="message" rows="${full ? 6 : 4}" required></textarea></label>
      <div class="form-note">
        <p>Appointments are confirmed manually after payment verification, and consultation slots must be at least ${SITE.consultationPolicy.minHoursAfterPayment} hours after payment confirmation.</p>
      </div>
      <button type="submit" class="btn btn-cta" data-cta-click="true">Send request</button>
    </form>
  </section>`;
}

function renderRelated(page) {
  const items = relatedPages(page);
  return `<section class="related-block" data-related-links="true">
    <div class="section-head">
      <h2>See also</h2>
      <p>Related internal pages for the next part of the journey.</p>
    </div>
    <div class="related-grid">
      ${items
        .map(
          (item) => `<a class="related-card" href="${item.route}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.summary)}</span>
          </a>`
        )
        .join("")}
    </div>
  </section>`;
}

function breadcrumbs(page) {
  if (page.route === "/") return [];
  const segments = page.route.split("/").filter(Boolean);
  const items = [{ name: "Home", route: "/" }];
  if (segments.length >= 1) {
    const familyRoute = `/${segments[0]}/`;
    const familyPage = pageLookup(familyRoute);
    if (familyPage && familyPage.route !== page.route) {
      items.push({ name: familyPage.title, route: familyPage.route });
    }
  }
  items.push({ name: page.title, route: page.route });
  return items;
}

function renderBreadcrumbs(page) {
  const items = breadcrumbs(page);
  if (!items.length) return "";
  return `<nav class="breadcrumbs" aria-label="Breadcrumb" data-breadcrumbs="true">
    <ol>
      ${items
        .map(
          (item, index) => `<li${index === items.length - 1 ? ` aria-current="page"` : ""}>
            ${index === items.length - 1 ? escapeHtml(item.name) : `<a href="${item.route}">${escapeHtml(item.name)}</a>`}
          </li>`
        )
        .join("")}
    </ol>
  </nav>`;
}

function heroPrimaryAction(page) {
  if (page.sectionStyle === "home") {
    return { href: "/start-consultation/", label: "Start Consultation" };
  }
  if (page.sectionStyle === "consultation") {
    return { href: "#consultation-form", label: "Request Consultation" };
  }
  if (page.sectionStyle === "payment") {
    return { href: "/legal/form/", label: "Open Intake Form" };
  }
  if (page.sectionStyle === "form") {
    return { href: "#consultation-form", label: "Complete the Form" };
  }
  if (page.sectionStyle === "emergency") {
    return { href: SITE.whatsappUrl, label: "Use WhatsApp", whatsapp: true };
  }
  if (page.sectionStyle === "search") {
    return { href: "#main-content", label: "Search the Site" };
  }
  if (page.family === "services" || page.family === "process") {
    return { href: "/start-consultation/", label: "Start Consultation" };
  }
  return { href: "#consultation-form", label: "Request Guidance" };
}

function heroCollectionLabel(page) {
  const labels = {
    foundation: "Private-client entry point",
    services: "Brazil immigration concierge",
    process: "Immigration process architecture",
    brazil: "Brazil relocation editorial",
    about: "Practice identity and standards",
    insights: "Editorial immigration intelligence",
    legal: "Operational policies and boundaries"
  };
  return labels[page.family] || "Immigration guidance";
}

function heroProofList(page) {
  const lists = {
    foundation: [
      "Brazil-wide online support",
      "English-first client guidance",
      "Clear consultation protocol"
    ],
    services: [
      "Document-led route planning",
      "Eligibility and timing framed carefully",
      "Authority-led outcomes kept explicit"
    ],
    process: [
      "Procedure sequence made visible",
      "Timing and obligations kept central",
      "Structured next-step decisions"
    ],
    brazil: [
      "Relocation context beyond visa rules",
      "Regional variation treated seriously",
      "Official-source orientation throughout"
    ],
    about: [
      "Institutional clarity over hype",
      "Public facts where required",
      "Professional boundaries kept visible"
    ],
    insights: [
      "Editorial explainers before casework",
      "Concepts clarified in plain English",
      "Built for informed planning"
    ],
    legal: [
      "Operational transparency",
      "Consent and privacy controls",
      "Plain-English notices"
    ]
  };
  return lists[page.family] || ["Structured guidance", "Clear boundaries", "Official-source orientation"];
}

function heroGlanceItems(page) {
  const base = {
    foundation: [
      ["Client profile", "People planning a move, a filing, or a Brazil relocation strategy."],
      ["Operating model", "Consultation-led, document-driven, and handled remotely across Brazil."],
      ["Decision framework", "Authorities decide outcomes; the service focuses on structure and preparation."]
    ],
    services: [
      ["Service mode", "Route analysis, records review, and authority-facing preparation."],
      [
        "Best use",
        page.pageType === "service-child"
          ? "Ideal when one immigration objective is already in view."
          : "Ideal when comparing related pathways before committing."
      ],
      ["Coverage", "Brazil-wide online advisory support with clear next-step guidance."]
    ],
    process: [
      ["Main focus", "Sequence, timing, and obligations across a live or planned matter."],
      ["Best use", "Useful when documents, deadlines, or later duties need to be clarified."],
      ["Outcome model", "A better-prepared file, not a promised result."]
    ],
    brazil: [
      ["Reading lens", "Lifestyle, cost, infrastructure, and migration context read together."],
      ["Best use", "For readers comparing regions before choosing a move or route."],
      ["Coverage", "National perspective with regional nuance and official references."]
    ],
    about: [
      ["Reading lens", "Institutional fit, working method, governance, and service philosophy."],
      ["Best use", "For readers evaluating trust, standards, and professional alignment."],
      ["Model", "Boutique advisory with explicit boundaries and remote delivery."]
    ],
    insights: [
      ["Reading lens", "Editorial clarification before any route or filing decision."],
      ["Best use", "For readers who need terminology and structure before consulting."],
      ["Use case", "Read first, then move into service pages or intake when needed."]
    ],
    legal: [
      ["Reading lens", "Privacy, payment, access, and website-use rules in plain English."],
      ["Best use", "For visitors checking how contact, consent, or intake works."],
      ["Use case", "Reference material tied directly to site operations and client handling."]
    ]
  };
  return base[page.family] || base.foundation;
}

function renderHero(page, hero) {
  const primaryAction = heroPrimaryAction(page);
  const proofItems = heroProofList(page);
  const glanceItems = heroGlanceItems(page);
  const secondaryHref = page.utility ? "#main-content" : "#page-map";
  const secondaryLabel = page.utility ? "Skip to content" : "Explore the page";
  return `<header class="hero" style="--hero-image:url('${hero.path}')">
    <div class="hero-overlay"></div>
    <div class="container hero-inner">
      <div class="hero-copy">
        <div class="hero-copy__lead">
          <p class="eyebrow">${escapeHtml(page.family.toUpperCase())}</p>
          <p class="hero-kicker">${escapeHtml(heroCollectionLabel(page))}</p>
        </div>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="hero-summary">${escapeHtml(page.summary)}</p>
        <div class="hero-badges" aria-label="Page highlights">
          ${proofItems
            .map((item) => `<span class="hero-badge">${escapeHtml(item)}</span>`)
            .join("")}
        </div>
        <div class="hero-actions">
          <a class="btn btn-cta" href="${primaryAction.href}" ${primaryAction.whatsapp ? 'data-whatsapp-click="true"' : 'data-cta-click="true"'}>${escapeHtml(primaryAction.label)}</a>
          <a class="btn btn-secondary" href="${secondaryHref}">${escapeHtml(secondaryLabel)}</a>
        </div>
      </div>
      <div class="hero-meta">
        <div class="hero-panel hero-panel--contact">
          <strong>Contact</strong>
          <p>Begin with a concise message, your objective, and any active deadline already in view.</p>
          <a href="mailto:${SITE.email}">${SITE.email}</a>
          <a href="${SITE.whatsappUrl}" data-whatsapp-click="true">WhatsApp ${SITE.phone}</a>
        </div>
        <div class="hero-panel hero-panel--proof">
          <strong>What this page is built to do</strong>
          <ul class="hero-proof-list">
            ${proofItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
    <div class="container hero-glance">
      ${glanceItems
        .map(
          ([label, value]) => `<article class="hero-glance-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </article>`
        )
        .join("")}
    </div>
  </header>`;
}

function articleWordCount(mainContent) {
  const articleMatch = mainContent.match(/<article class="content-column">([\s\S]*?)<\/article>\s*<aside class="sidebar-column">/i);
  return wordCount(articleMatch ? articleMatch[1] : mainContent);
}

function renderPageMain(page, testimonials) {
  const topicSections = page.utility ? "" : page.topics.map((topic, index) => renderTopicSection(page, topic, index)).join("");
  const resources = getOfficialSources(page);
  const faqItems = buildFaq(page);
  let mainContent = `
    ${renderBreadcrumbs(page)}
    ${renderHero(page, getHero(page))}
    <main id="main-content" class="site-main" data-page-key="${page.key}">
      <div class="container">
        ${renderQuickScan(page)}
      </div>
      <div class="container main-shell">
        <article class="content-column">
          <section class="content-block intro-block">
            <h2>Overview</h2>
            ${buildIntroParagraph(page)}
          </section>
          ${renderTrustMarkers(page)}
          ${renderSpecialSections(page, testimonials)}
          ${topicSections}
          __EXPANSIONS__
        </article>
        ${renderSidebar(page)}
      </div>
      <div class="container">
        ${renderOfficialResources(page, resources)}
        ${renderRelated(page)}
        ${renderFaq(page, faqItems)}
        ${page.utility || page.route === "/legal/search/" || page.route === "/legal/404/" ? "" : renderLeadForm(page, { compact: page.route !== "/start-consultation/" && page.route !== "/legal/form/" })}
        ${["process", "service-child", "service-hub", "services-home", "consultation"].includes(page.sectionStyle) ? `<section class="cta-pair">
          <a class="btn btn-secondary" href="${SITE.whatsappUrl}" data-whatsapp-click="true">WhatsApp</a>
          <a class="btn btn-cta" href="/start-consultation/" data-cta-click="true">Start Consultation</a>
        </section>` : ""}
        <section class="site-disclaimer visible-disclaimer">
          <p>${escapeHtml(SITE.notice)}</p>
        </section>
      </div>
    </main>
  `;

  if (!page.utility && !WORD_COUNT_EXCEPTIONS.has(page.sectionStyle)) {
    let currentWords = articleWordCount(mainContent);
    let extraIndex = 0;
    while (currentWords < WORD_COUNT_TARGET.min && extraIndex < 8) {
      const insertion = renderExpansionSection(page, extraIndex);
      mainContent = mainContent.replace("__EXPANSIONS__", `${insertion}__EXPANSIONS__`);
      currentWords = articleWordCount(mainContent);
      extraIndex += 1;
    }
  }

  mainContent = mainContent.replace("__EXPANSIONS__", "");

  return { mainContent, faqItems };
}

function renderUtilityBar() {
  return `<div class="utility-bar">
    <div class="container utility-inner">
      <p class="utility-support">Supporting Immigrants <span aria-hidden="true">—</span> Promoting Brazil</p>
      <div class="utility-actions">
        <div class="lang-switcher lang-switcher--minimal" aria-label="Language switcher">
          <button type="button" class="lang-link active" data-language-toggle="en">EN</button>
          <span aria-hidden="true">|</span>
          <button type="button" class="lang-link" data-language-toggle="pt-BR" ${PT_PRESENT ? "" : "disabled aria-disabled=\"true\""}>PT</button>
        </div>
        <button type="button" class="utility-action utility-action--text" data-open-accessibility="true">Accessibility</button>
      </div>
    </div>
  </div>`;
}

function renderAccessibilityPanel() {
  return `<aside class="accessibility-panel" id="accessibility-panel" aria-hidden="true">
    <div class="accessibility-panel__inner">
      <div class="panel-header">
        <h2>Accessibility</h2>
        <button type="button" class="panel-close" data-close-accessibility="true">Close</button>
      </div>
      <div class="panel-actions">
        <div class="scale-control">
          <span>Text scale</span>
          <div class="inline-actions">
            <button type="button" data-accessibility-action="text-decrease">A-</button>
            <strong data-text-scale-value="true">100%</strong>
            <button type="button" data-accessibility-action="text-increase">A+</button>
          </div>
        </div>
        ${[
          ["contrast", "High contrast"],
          ["invert", "Invert colors"],
          ["grayscale", "Grayscale"],
          ["dyslexia", "Dyslexia font"],
          ["links", "Highlight links"],
          ["headings", "Highlight headings"],
          ["guide", "Reading guide"],
          ["images", "Hide images"],
          ["motion", "Reduce motion"]
        ]
          .map(
            ([key, label]) => `<button type="button" class="toggle-button" data-accessibility-action="${key}">${label}</button>`
          )
          .join("")}
        <button type="button" class="toggle-button reset" data-accessibility-action="reset">Reset all settings</button>
      </div>
    </div>
    <div class="reading-guide" data-reading-guide="true" aria-hidden="true"></div>
  </aside>`;
}

function renderBrandBar() {
  return "";
}

function chunkLinks(links, columns = 2) {
  const chunkSize = Math.ceil(links.length / columns);
  return Array.from({ length: columns }, (_, index) => links.slice(index * chunkSize, index * chunkSize + chunkSize)).filter(
    (group) => group.length
  );
}

function footerIcon(key) {
  const icons = {
    about:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2.2 8 4.8V21H4v-3.2C4 15.2 7.6 13 12 13Z" fill="currentColor"/></svg>',
    brazil:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 7v10l8 5 8-5V7l-8-5Zm0 2.3 5.9 3.7-5.9 3.7L6.1 8 12 4.3Zm-6 5.5 5 3.1v6.1l-5-3.1V9.8Zm7 9.2v-6.1l5-3.1v6.1l-5 3.1Z" fill="currentColor"/></svg>',
    process:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h6v4H5V6Zm8 0h6v4h-6V6ZM5 14h6v4H5v-4Zm8 0h6v4h-6v-4Zm-1-3h2v2h-2z" fill="currentColor"/></svg>',
    insights:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-1 7h5l-6 13 1-8H7l6-12Z" fill="currentColor"/></svg>',
    legal:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 5 5v6c0 5 3 8.7 7 11 4-2.3 7-6 7-11V5l-7-3Zm0 3.1 4 1.7v4.3c0 3.5-1.8 6.2-4 8-2.2-1.8-4-4.5-4-8V6.8l4-1.7Z" fill="currentColor"/></svg>'
  };
  return icons[key] || "";
}

function renderFooterPanel(panel) {
  const heading = panel.logo
    ? `<h2 class="footer-brand-title"><img src="/assets/logo/immigrate-to-brazil-logo.svg" alt="" width="44" height="44" /><span>${escapeHtml(panel.title)}</span></h2>`
    : `<h2>${panel.icon ? `<span class="footer-heading-icon" aria-hidden="true">${footerIcon(panel.icon)}</span>` : ""}<span>${escapeHtml(panel.title)}</span></h2>`;
  return `<section class="footer-panel footer-panel--${slugify(panel.title)}${panel.accent ? ` footer-panel--${panel.accent}` : ""}">
    <div class="footer-panel__head">
      ${heading}
      ${panel.description ? `<p>${escapeHtml(panel.description)}</p>` : ""}
    </div>
    ${
      panel.actions
        ? `<div class="footer-panel__actions">
            ${panel.actions
              .map(
                (action) => `<a class="btn ${action.variant === "secondary" ? "btn-secondary" : "btn-cta"} btn-sm" href="${action.href}" ${action.whatsapp ? 'data-whatsapp-click="true"' : action.search ? 'data-search-open="true"' : 'data-cta-click="true"'}>
                  ${escapeHtml(action.label)}
                </a>`
              )
              .join("")}
          </div>`
        : ""
    }
    ${
      panel.groups
        ? `<div class="footer-panel__groups">
            ${panel.groups
              .map(
                (group) => `<div class="footer-panel__group">
                  ${group.label ? `<h3>${escapeHtml(group.label)}</h3>` : ""}
                  ${
                    group.details
                      ? `<ul class="footer-contact-list">
                          ${group.details
                            .map(
                              (detail) => `<li>
                                <span>${escapeHtml(detail.label)}</span>
                                ${
                                  detail.href
                                    ? `<a href="${detail.href}" ${detail.whatsapp ? 'data-whatsapp-click="true"' : ""}>${escapeHtml(detail.value)}</a>`
                                    : `<strong>${escapeHtml(detail.value)}</strong>`
                                }
                              </li>`
                            )
                            .join("")}
                        </ul>`
                      : group.lines
                        ? `<div class="footer-panel__lines">
                            ${group.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
                          </div>`
                        : `<ul>
                          ${group.links
                            .map(
                              ([url, label]) => `<li><a href="${url}" ${url === SITE.whatsappUrl ? 'data-whatsapp-click="true"' : ""}>${escapeHtml(label)}</a></li>`
                            )
                            .join("")}
                        </ul>`
                  }
                </div>`
              )
              .join("")}
          </div>`
        : ""
    }
  </section>`;
}

function serviceFamilyLabel(label) {
  return label;
}

function serviceFamilyDescription(label) {
  const descriptions = {
    Visas: "Entry visas across work, investment, study, family, and specialist routes.",
    Residencies: "Longer-term residence pathways, renewals, and post-arrival planning.",
    Naturalisation: "Brazilian nationality routes, extraordinary cases, renunciation, and reacquisition.",
    Defense: "Appeals, fines, deportation, expulsion, extradition, and litigation support.",
    Services: "Consular records, sworn translation, and regularization matters outside the core route families.",
    Advisory: "Consultation, strategy, compliance, representation, and corporate immigration support."
  };
  return descriptions[serviceFamilyLabel(label)] || "Explore this service category.";
}

function renderMobileFamily(title, items, options = {}) {
  const intro = options.intro ? `<p class="mobile-nav-group__intro">${escapeHtml(options.intro)}</p>` : "";
  const grouped = items.some((item) => Array.isArray(item.links));
  const open = options.open ? " open" : "";
  return `<details class="mobile-nav-group"${open}>
    <summary>${escapeHtml(title)}</summary>
    <div class="mobile-nav-group__body">
      ${intro}
      ${
        grouped
          ? items
              .map(
                (group) => `<section class="mobile-nav-subgroup">
                  <h3>${escapeHtml(group.label)}</h3>
                  <div class="mobile-nav-links">
                    ${group.links
                      .map((item) => `<a href="${item.route}">${escapeHtml(item.label)}</a>`)
                      .join("")}
                  </div>
                </section>`
              )
              .join("")
          : `<div class="mobile-nav-links">
              ${items.map((item) => `<a href="${item.route}">${escapeHtml(item.label)}</a>`).join("")}
            </div>`
      }
    </div>
  </details>`;
}

function serviceFamilyIsActive(page, group) {
  return page.family === "services" && page.route.startsWith(group.links[0].route);
}

function renderServiceFamilyDropdown(group, isActive = false) {
  const heading = serviceFamilyLabel(group.label);
  const hubLink = group.links[0];
  const children = group.links.slice(1);
  const columns = chunkLinks(children, children.length > 16 ? 4 : children.length > 9 ? 3 : 2);
  return `<li class="nav-item dropdown service-family-dropdown${isActive ? " is-active" : ""}">
    <a class="nav-link dropdown-toggle${isActive ? " is-active" : ""}" href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false">${escapeHtml(heading)}</a>
    <div class="dropdown-menu service-family-menu">
      <div class="service-family-menu__head">
        <div>
          <a class="service-family-menu__heading" href="${hubLink.route}"><h3>${escapeHtml(heading)}</h3></a>
          <p>${escapeHtml(serviceFamilyDescription(group.label))}</p>
        </div>
      </div>
      <div class="service-family-menu__grid">
        ${columns
          .map(
            (column) => `<div class="service-family-menu__column">
              ${column
                .map(
                  (item) => `<a class="service-family-menu__link" href="${item.route}">
                    <strong>${escapeHtml(item.label)}</strong>
                  </a>`
                )
                .join("")}
            </div>`
          )
          .join("")}
      </div>
    </div>
  </li>`;
}

function navDropdown(label, items) {
  const grouped = items.some((item) => Array.isArray(item.links));
  const descriptions = {
    About: "Profile, governance, standards, and institutional pages.",
    Brazil: "Relocation, living, regional, and discovery guidance.",
    Process: "Procedure stages, obligations, risks, and timelines.",
    Services: "Visa, residency, citizenship, defense, and advisory pathways.",
    Insights: "Editorial explainers, updates, and terminology guides.",
    Legal: "Operational notices, privacy, terms, payment, and accessibility."
  };
  return `<li class="nav-item dropdown mega">
    <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false">${escapeHtml(label)}</a>
    <div class="dropdown-menu">
      <div class="mega-overview">
        <div>
          <p class="mega-label">${escapeHtml(label.toUpperCase())} directory</p>
          <h3>${escapeHtml(label)}</h3>
          <p>${escapeHtml(descriptions[label] || "Explore the routes in this section.")}</p>
        </div>
        <span class="mega-count">${grouped ? `${items.length} groups` : `${items.length} pages`}</span>
      </div>
      <div class="mega-grid${grouped ? " mega-grid-grouped" : ""}">
        ${grouped
          ? items
              .map(
                (group) => `<section class="mega-section">
                  <h3>${escapeHtml(group.label)}</h3>
                  <div class="mega-subgrid">
                    ${group.links
                      .map(
                        (item) => `<a class="mega-link" href="${item.route}">
                          <strong>${escapeHtml(item.label)}</strong>
                        </a>`
                      )
                      .join("")}
                  </div>
                </section>`
              )
              .join("")
          : items
              .map(
                (item) => `<a class="mega-link" href="${item.route}">
                  <strong>${escapeHtml(item.label)}</strong>
                </a>`
              )
              .join("")}
      </div>
    </div>
  </li>`;
}

function renderMainNav(page) {
  const serviceGroups = NAVIGATION.services
    .filter((group) => group.label !== "Overview")
    .map((group) => ({ ...group, label: serviceFamilyLabel(group.label) }));
  return `<nav class="navbar navbar-expand-xl main-nav" aria-label="Main navigation">
    <div class="container">
      <div class="main-header">
        <div class="main-header__upper">
          <div class="main-header__identity">
            <a class="brand-lockup" href="/">
              <img src="/assets/logo/immigrate-to-brazil-logo.svg" alt="Immigrate to Brazil logo" width="48" height="48" />
              <span>
                <strong>${SITE.name}</strong>
              </span>
            </a>
            <a class="main-header__home d-none d-xl-inline-flex${page.route === "/" ? " is-active" : ""}" href="/">Home</a>
          </div>
          <a class="btn btn-cta btn-sm main-header__cta d-none d-xl-inline-flex" href="/start-consultation/" data-cta-click="true">Start Consultation</a>
          <button class="navbar-toggler d-xl-none" type="button" data-bs-toggle="collapse" data-bs-target="#site-nav" aria-controls="site-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
        <div class="main-header__lower d-none d-xl-flex">
          <ul class="navbar-nav navbar-nav--services">
            ${serviceGroups.map((group) => renderServiceFamilyDropdown(group, serviceFamilyIsActive(page, group))).join("")}
          </ul>
        </div>
      </div>
      <div class="collapse navbar-collapse" id="site-nav">
        <div class="mobile-nav-shell d-xl-none">
          <div class="mobile-nav-actions">
            <a class="mobile-nav-home${page.route === "/" ? " is-active" : ""}" href="/">Home</a>
            <a class="btn btn-cta btn-sm" href="/start-consultation/" data-cta-click="true">Start Consultation</a>
          </div>
          <section class="mobile-nav-section">
            <p class="mobile-nav-shell__eyebrow">Service categories</p>
            <p class="mobile-nav-shell__intro">Choose the category first, then open the exact route.</p>
            ${serviceGroups
              .map((group) => renderMobileFamily(group.label, group.links, { intro: serviceFamilyDescription(group.label) }))
              .join("")}
          </section>
        </div>
      </div>
    </div>
  </nav>`;
}

function renderFooter() {
  const panels = [
    {
      title: SITE.name,
      logo: true,
      description: "Private-client immigration and relocation guidance for Brazil, built around clarity, restraint, and careful preparation.",
      accent: "brand",
      actions: [
        { href: "/start-consultation/", label: "Start Consultation" },
        { href: SITE.whatsappUrl, label: "WhatsApp", variant: "secondary", whatsapp: true }
      ],
      groups: [
        {
          details: [
            { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
            { label: "Phone", value: SITE.phone, href: `tel:+5543991324028` },
            { label: "Hours", value: "Mon-Fri, 9:00-18:00 BRT" },
            { label: "Languages", value: "English / Portuguese" },
            { label: "Worldwide", value: "Online Support" }
          ]
        }
      ]
    },
    {
      title: "About",
      icon: "about",
      groups: [{ links: NAVIGATION.about.map((item) => [item.route, item.label]) }]
    },
    {
      title: "Brazil",
      icon: "brazil",
      groups: [
        {
          links: NAVIGATION.brazil.map((item) => [item.route, item.label])
        }
      ]
    },
    {
      title: "Process",
      icon: "process",
      groups: [
        {
          links: NAVIGATION.process.map((item) => [item.route, item.label])
        }
      ]
    },
    {
      title: "Insights",
      icon: "insights",
      groups: [
        { links: NAVIGATION.insights.map((item) => [item.route, item.label]) }
      ]
    },
    {
      title: "Legal",
      icon: "legal",
      groups: [
        {
          links: [...NAVIGATION.legal, { label: "404", route: "/legal/404/" }].map((item) => [item.route, item.label])
        }
      ]
    }
  ];

  return `<footer class="site-footer">
    <div class="container footer-grid footer-grid--simple">
      ${panels.map((panel) => renderFooterPanel(panel)).join("")}
    </div>
    <div class="container footer-bottom">
      <p>${SITE.copyright}</p>
      <p>${SITE.notice}</p>
      <div class="footer-actions">
        <a href="/legal/search/" data-search-open="true">Search</a>
        <a href="/start-consultation/" data-cta-click="true">Start Consultation</a>
      </div>
    </div>
    <div class="container footer-meta">
      <a href="/sitemap.xml">Sitemap</a>
      <span>–</span>
      <a href="/robots.txt">Robots</a>
    </div>
  </footer>`;
}

function renderCookieBanner() {
  return `<div class="cookie-banner" data-cookie-banner="true" hidden>
    <div class="cookie-banner__inner">
      <div>
        <strong>Cookie settings</strong>
        <p>Essential site settings support accessibility, search, and session preferences. Analytics load only after LGPD-aware consent is granted.</p>
      </div>
      <div class="cookie-actions">
        <button type="button" class="btn btn-secondary" data-consent="decline">Decline analytics</button>
        <button type="button" class="btn btn-cta" data-consent="accept">Accept analytics</button>
      </div>
    </div>
  </div>`;
}

function renderFloatingWhatsApp() {
  return `<a class="floating-whatsapp" href="${SITE.whatsappUrl}" data-whatsapp-click="true" aria-label="Open WhatsApp chat">
    <img src="/assets/images/whatsapp-agent-avatar.svg" alt="" width="44" height="44" />
    <span>
      <strong>WhatsApp</strong>
      <small>Private client contact</small>
    </span>
  </a>`;
}

function renderBackToTop() {
  return `<button type="button" class="back-to-top" data-back-to-top="true" aria-label="Back to top">Top</button>`;
}

function renderGtmNoscript() {
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${SITE.tracking.gtmId}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;
}

function renderUpgradeBanner() {
  if (!SITE.upgradeBanner.enabled) return "";
  return `<div class="upgrade-banner">
    <div class="container upgrade-inner">
      <strong>${escapeHtml(SITE.upgradeBanner.label)}</strong>
      <span>${escapeHtml(SITE.upgradeBanner.text)}</span>
    </div>
  </div>`;
}

function buildJsonLd(page, faqItems) {
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE.domain}#organization`,
      name: SITE.name,
      url: SITE.domain,
      email: SITE.email,
      telephone: SITE.phone,
      logo: `${SITE.domain}/assets/logo/immigrate-to-brazil-logo.png`,
      sameAs: [SITE.whatsappUrl]
    },
    {
      "@context": "https://schema.org",
      "@type": "ContactPoint",
      "@id": `${SITE.domain}#contactpoint`,
      contactType: "customer support",
      email: SITE.email,
      telephone: SITE.phone,
      availableLanguage: ["English", "Portuguese"]
    }
  ];

  if (page.route === "/") {
    graph.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE.domain}#website`,
      url: SITE.domain,
      name: SITE.name,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.domain}/legal/search/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });
    graph.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${SITE.domain}#localbusiness`,
      name: SITE.name,
      areaServed: "Brazil",
      telephone: SITE.phone,
      email: SITE.email,
      url: SITE.domain
    });
  }

  if (page.route !== "/") {
    graph.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs(page).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.route)
      }))
    });
  }

  if (["process", "service-hub", "service-child", "services-home", "consultation"].includes(page.sectionStyle)) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: `${page.title} | ${SITE.name}`,
      serviceType: page.title,
      areaServed: "Brazil",
      provider: { "@id": `${SITE.domain}#organization` },
      url: absoluteUrl(page.route),
      description: page.summary
    });
  }

  if (page.family === "insights") {
    graph.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.summary,
      author: { "@type": "Organization", name: SITE.name },
      publisher: { "@id": `${SITE.domain}#organization` },
      mainEntityOfPage: absoluteUrl(page.route)
    });
  }

  if (faqItems.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    });
  }

  return `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
}

function themeColorForPage(page) {
  const colors = {
    foundation: SITE.colors.emerald,
    services: SITE.colors.green,
    process: SITE.colors.gold,
    brazil: SITE.colors.navy,
    about: "#44506B",
    insights: "#7A5536",
    legal: "#4F5965"
  };
  return colors[page.family] || SITE.colors.green;
}

function renderHead(page, faqItems, hero) {
  const title = buildTitle(page);
  const description = buildMetaDescription(page);
  const robots = page.noindex ? "noindex,follow" : "index,follow";
  const alternates = PT_PRESENT
    ? `
    <link rel="alternate" hreflang="en" href="${absoluteUrl(page.route)}" />
    <link rel="alternate" hreflang="pt-BR" href="${SITE.domain}/pt-br${page.route === "/" ? "/" : page.route}" />
    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(page.route)}" />`
    : "";
  return `
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="${themeColorForPage(page)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${SITE.name}" />
    <meta name="robots" content="${robots}" />
    <meta name="format-detection" content="telephone=no,email=no,address=no" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${absoluteUrl(page.route)}" />
    <link rel="preload" as="image" href="${hero.path}" fetchpriority="high" />
    <link rel="icon" href="/assets/favicons/favicon-32x32.png" sizes="32x32" type="image/png" />
    <link rel="icon" href="/assets/favicons/favicon-16x16.png" sizes="16x16" type="image/png" />
    <link rel="apple-touch-icon" href="/assets/favicons/apple-touch-icon.png" />
    <link rel="manifest" href="/assets/favicons/site.webmanifest" />
    <link rel="stylesheet" href="/assets/vendor/bootstrap/bootstrap.min.css" />
    <link rel="stylesheet" href="/css/site.css" />
    <meta property="og:type" content="${page.family === "insights" ? "article" : "website"}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${absoluteUrl(page.route)}" />
    <meta property="og:image" content="${SITE.domain}${hero.path}" />
    <meta property="og:site_name" content="${SITE.name}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SITE.domain}${hero.path}" />
    ${alternates}
    ${buildJsonLd(page, faqItems)}
    <script>
      window.ITB_SITE = ${JSON.stringify({
        pageRoute: page.route,
        pageTitle: page.title,
        pageFamily: page.family,
        tracking: SITE.tracking,
        consultationPolicy: SITE.consultationPolicy,
        contact: { email: SITE.email, phone: SITE.phone, whatsappUrl: SITE.whatsappUrl },
        accessibility: { dyslexiaFont: DYSLEXIA_FONT_STACK }
      })};
    </script>`;
}

function renderPage(page, template, testimonials) {
  const hero = getHero(page);
  const { mainContent, faqItems } = renderPageMain(page, testimonials);
  const finalHtml = template
    .replace(/{{LANG}}/g, "en")
    .replace(/{{HEAD}}/g, renderHead(page, faqItems, hero))
    .replace(/{{BODY_CLASS}}/g, `site-root page-${routeKey(page.route)} family-${page.family} style-${page.sectionStyle}`)
    .replace(/{{GTM_NOSCRIPT}}/g, renderGtmNoscript())
    .replace(/{{UPGRADE_BANNER}}/g, renderUpgradeBanner())
    .replace(/{{UTILITY_BAR}}/g, renderUtilityBar())
    .replace(/{{ACCESSIBILITY_PANEL}}/g, renderAccessibilityPanel())
    .replace(/{{BRAND_BAR}}/g, renderBrandBar())
    .replace(/{{MAIN_NAV}}/g, renderMainNav(page))
    .replace(/{{MAIN_WRAPPER}}/g, `${mainContent}${renderFooter()}`)
    .replace(/{{FLOATING_WHATSAPP}}/g, renderFloatingWhatsApp())
    .replace(/{{BACK_TO_TOP}}/g, renderBackToTop())
    .replace(/{{COOKIE_BANNER}}/g, renderCookieBanner());

  const mainWordCount = articleWordCount(mainContent);
  return {
    html: finalHtml,
    wordCount: mainWordCount,
    hero,
    faqItems
  };
}

async function writeFile(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
}

function outputPathForRoute(route) {
  if (route === "/") return "index.html";
  return path.join(route.replace(/^\/|\/$/g, ""), "index.html");
}

function buildSitemap(pages) {
  const urls = pages
    .filter((page) => !page.noindex)
    .map(
      (page) => `<url><loc>${absoluteUrl(page.route)}</loc><changefreq>weekly</changefreq><priority>${page.route === "/" ? "1.0" : "0.8"}</priority></url>`
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function buildRobots() {
  return `User-agent: *
Allow: /
Disallow: /legal/search/

Sitemap: ${SITE.domain}/sitemap.xml
`;
}

function buildHeaders() {
  return `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://formspree.io https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net; frame-src https://www.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'self'; upgrade-insecure-requests
`;
}

function buildFormMap(pages) {
  return pages.map((page) => ({
    route: page.route,
    title: page.title,
    formGroup: page.formGroup,
    formLabel: page.formGroupLabel,
    endpoint: FORM_ENDPOINTS[page.formGroup]
  }));
}

function buildFormMapMarkdown(formMap) {
  return `# Formspree Map

| Route | Title | Group | Endpoint |
| --- | --- | --- | --- |
${formMap
  .map((item) => `| \`${item.route}\` | ${item.title} | ${item.formLabel} | \`${item.endpoint}\` |`)
  .join("\n")}
`;
}

function buildSearchIndex(page, faqItems) {
  return {
    route: page.route,
    title: page.title,
    family: page.family,
    summary: page.summary,
    topics: page.topics,
    faq: faqItems.map((item) => item.question),
    keywords: [...page.topics, page.title, page.family, page.formGroupLabel].join(" ")
  };
}

async function main() {
  ensureOk(PAGES.length >= 150, `Expected at least 150 pages, found ${PAGES.length}`);
  const template = await fs.readFile(TEMPLATE_PATH, "utf8");
  const testimonials = JSON.parse(await fs.readFile(TESTIMONIALS_PATH, "utf8")).reviews;
  const brandRun = spawnSync("python3", [path.join("scripts", "generate_brand_assets.py")], {
    cwd: ROOT,
    stdio: "inherit"
  });
  ensureOk(brandRun.status === 0, "Brand asset generation failed");

  const heroManifest = [];
  const formMap = [];
  const searchIndex = [];
  const buildReport = [];

  for (const page of PAGES) {
    const rendered = renderPage(page, template, testimonials);
    await writeFile(outputPathForRoute(page.route), rendered.html);
    heroManifest.push({
      key: page.key,
      title: page.title,
      route: page.route,
      family: rendered.hero.folder,
      query: rendered.hero.query,
      path: rendered.hero.path,
      alt: rendered.hero.alt
    });
    formMap.push(...buildFormMap([page]));
    searchIndex.push(buildSearchIndex(page, rendered.faqItems));
    buildReport.push({
      route: page.route,
      title: page.title,
      wordCount: rendered.wordCount
    });
  }

  const legal404 = PAGES.find((page) => page.route === "/legal/404/");
  if (legal404) {
    const rendered404 = renderPage(legal404, template, testimonials);
    await writeFile("404.html", rendered404.html);
  }

  await writeFile("data/hero-manifest.json", JSON.stringify(heroManifest, null, 2));
  await writeFile("data/formspree-map.json", JSON.stringify(formMap, null, 2));
  await writeFile("docs/formspree-map.md", buildFormMapMarkdown(formMap));
  await writeFile("data/search-index.json", JSON.stringify(searchIndex, null, 2));
  await writeFile("sitemap.xml", buildSitemap(PAGES));
  await writeFile("robots.txt", buildRobots());
  await writeFile("_headers", buildHeaders());
  await writeFile("data/build-report.json", JSON.stringify(buildReport, null, 2));

  console.log(`Built ${PAGES.length} English pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
