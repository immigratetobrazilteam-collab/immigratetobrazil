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

const BRAND_ASSETS = {
  markPng: "/assets/logo/immigrate-to-brazil-logo.png",
  markTransparentPng: "/assets/logo/immigrate-to-brazil-logo-transparent.png",
  markWithBackgroundPng: "/assets/logo/immigrate-to-brazil-logo-with-background.png",
  logoPng: `${SITE.domain}/assets/logo/immigrate-to-brazil-logo.png`
};

const BRAND_ALT = {
  mark: "Immigrate to Brazil circular logo",
  lockup: "Immigrate to Brazil brand wordmark with the site logo"
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

function renderBrandMark(options = {}) {
  const {
    className = "",
    alt = BRAND_ALT.mark,
    width = 52,
    height = 52,
    decorative = false
  } = options;
  return `<img${className ? ` class="${className}"` : ""} src="${BRAND_ASSETS.markTransparentPng}" alt="${
    decorative ? "" : escapeHtml(alt)
  }" width="${width}" height="${height}"${decorative ? ' aria-hidden="true"' : ""} />`;
}

function renderBrandLockup(options = {}) {
  const {
    className = "",
    tone = "default"
  } = options;
  return `<span class="brand-wordmark ${className ? `${className} ` : ""}brand-wordmark--${tone}" aria-label="${escapeHtml(
    BRAND_ALT.lockup
  )}">
    ${renderBrandMark({ className: "brand-wordmark__mark", width: 56, height: 56, decorative: true })}
    <span class="brand-wordmark__text">
      <span class="brand-wordmark__line brand-wordmark__line--top">Immigrate</span>
      <span class="brand-wordmark__line brand-wordmark__line--bottom">to Brazil</span>
    </span>
  </span>`;
}

function renderLink(url, label) {
  return `<a href="${url}">${escapeHtml(label)}</a>`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash;
}

function pickVariant(seed, options) {
  return options[Math.abs(hashString(seed)) % options.length];
}

function normalizeTopic(topic) {
  return topic
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function topicProfile(topic) {
  const lower = normalizeTopic(topic);
  const has = (...phrases) => phrases.some((phrase) => lower.includes(phrase));

  let theme = "general";
  if (lower === "nationwide online support" || lower === "trust markers") {
    theme = "institutional";
  } else if (has("official-resource", "official source", "official-resource orientation")) {
    theme = "authority";
  } else if (has("what to prepare", "document uploads")) {
    theme = "documents";
  } else if (has("intake fields", "manual review", "manual review and confirmation", "scope boundaries", "limitations of initial analysis")) {
    theme = "consultation";
  } else if (has("ongoing support", "monitoring")) {
    theme = "compliance";
  } else if (has("payment", "proof-of-payment", "fee", "refund", "receiver email")) {
    theme = "payment";
  } else if (has("email", "phone", "whatsapp", "full name", "occupation", "country", "notes", "message", "case reference")) {
    theme = "contact";
  } else if (
    has(
      "deadline",
      "timing",
      "timeline",
      "36-hour",
      "scheduling",
      "renewal",
      "expiry",
      "window",
      "manual confirmation",
      "next steps",
      "next step",
      "processing",
      "sequence"
    )
  ) {
    theme = "timing";
  } else if (has("document", "documentation", "record", "records", "certificate", "upload", "proof", "translation", "evidence", "file")) {
    theme = "documents";
  } else if (has("federal police", "policia", "consular", "consulate", "authority", "authorities", "court", "jurisdiction", "competent", "registration", "ministry")) {
    theme = "authority";
  } else if (has("compliance", "obligation", "obligations", "duty", "duties", "maintenance", "monitoring", "conditions", "status", "regularization", "responsibilities")) {
    theme = "compliance";
  } else if (has("consultation", "intake", "initial analysis", "scope", "information provided by client", "what to prepare", "request flow", "manual review", "select your service", "current immigration stage")) {
    theme = "consultation";
  } else if (has("naturalisation", "citizenship", "renunciation", "reacquisition", "residency-history")) {
    theme = "citizenship";
  } else if (has("deportation", "expulsion", "extradition", "appeals", "fines", "litigation", "rights", "representation", "protection")) {
    theme = "defense";
  } else if (has("family", "reunion", "relationship", "spouse", "parent", "child")) {
    theme = "family";
  } else if (has("work", "employment", "employer", "business", "invest", "startup", "corporate", "economic", "retiree", "nomad", "sports", "journalist", "artistic", "medical", "religious", "labor", "sponsored", "authorization")) {
    theme = "work";
  } else if (has("study", "student", "research", "exchange", "educational", "academic", "school", "university")) {
    theme = "education";
  } else if (has("privacy", "lgpd", "gdpr", "cookies", "consent", "accessibility", "acceptable use", "data subject", "processing", "terms")) {
    theme = "policy";
  } else if (has("search", "directory", "guides", "faqs", "blog", "updates", "keyword", "navigation", "publication")) {
    theme = "search";
  } else if (
    has(
      "living",
      "cost",
      "housing",
      "healthcare",
      "education system",
      "safety",
      "culture",
      "festivals",
      "cuisine",
      "events",
      "cities",
      "states",
      "municipalities",
      "regional",
      "climate",
      "infrastructure",
      "quality of life",
      "mobility",
      "transport"
    )
  ) {
    theme = "location";
  } else if (
    has(
      "mission",
      "values",
      "philosophy",
      "story",
      "profile",
      "lawyer",
      "why us",
      "clients",
      "testimonials",
      "governance",
      "ethics",
      "standards",
      "regulatory",
      "purpose",
      "scope of services",
      "organizational"
    )
  ) {
    theme = "institutional";
  } else if (has("results", "outcome", "outcomes", "approval", "limitations", "predictability", "denial", "failure", "mistakes", "decision")) {
    theme = "outcome";
  } else if (has("eligibility", "qualification", "applicable", "category", "categories", "pathway", "route", "classification", "legal basis", "selection", "visa", "residency", "residence")) {
    theme = "route";
  }

  const profiles = {
    payment: {
      focus: "the visitor should know exactly how payment is made, how proof is sent, and when scheduling actually becomes possible",
      review: "the payment method used, whether proof was sent correctly, and whether the requested timing respects the scheduling rule",
      risk: "payment is treated as if it automatically books the consultation or confirms a slot before manual review",
      why: "Payment steps need to be clear.",
      action: "Pay correctly and send proof."
    },
    contact: {
      focus: "clear contact details and a concise first summary usually determine how efficiently the matter can be reviewed",
      review: "how the client identifies the matter, how the team can respond, and whether the first message already contains the key facts",
      risk: "the first contact is too vague to identify the route, the urgency, or the next practical step",
      why: "Good contact details prevent avoidable delay.",
      action: "Send a clear first summary."
    },
    timing: {
      focus: "timing often changes what can be done immediately, what must wait, and what becomes risky if a date is missed",
      review: "the present status, the relevant dates, and any appointment or filing windows already in play",
      risk: "people spend money or make travel plans before the timeline is legally or administratively workable",
      why: "Timing can change the route.",
      action: "Check dates before acting."
    },
    documents: {
      focus: "Brazil immigration work usually turns on how well the documents support the facts, not only on whether a person believes they qualify",
      review: "whether the records are current, consistent, translated where necessary, and strong enough for the authority or consular stage involved",
      risk: "a route may look viable in theory but become fragile because the papers are incomplete, inconsistent, or not ready for use",
      why: "Documents support the legal story.",
      action: "Organize the file early."
    },
    authority: {
      focus: "the competent authority matters because the same objective can involve different procedures, booking systems, and expectations depending on where the step occurs",
      review: "which authority or consular channel is actually involved, what that body handles, and what must be prepared for that specific interaction",
      risk: "clients assume every immigration issue is handled by the same office and lose time following the wrong channel",
      why: "The right authority matters.",
      action: "Confirm who handles the step."
    },
    compliance: {
      focus: "immigration matters do not end at approval, because status maintenance, registrations, updates, and later duties can shape what happens next",
      review: "ongoing duties, reporting points, validity periods, and the practical steps needed to keep the file in order after the first decision",
      risk: "a client treats the approval as the finish line and overlooks the duties that protect the status afterwards",
      why: "Post-approval duties still matter.",
      action: "Keep obligations visible."
    },
    consultation: {
      focus: "the first review works best when the objective, the current status, and the available facts are clear from the beginning",
      review: "what the client is trying to do, what documents already exist, and what questions must be clarified before any route is discussed seriously",
      risk: "a short message is mistaken for a full case assessment, even though the real analysis depends on the documents and chronology",
      why: "The first review sets the scope.",
      action: "Prepare the core facts."
    },
    citizenship: {
      focus: "citizenship issues usually depend on legal category, residence history, documentary continuity, and the precise statutory route being used",
      review: "the residence timeline, identity and civil records, the legal basis claimed, and any gap that may affect the category",
      risk: "people speak about citizenship in broad terms while the actual route depends on technical requirements that need careful checking",
      why: "Citizenship routes are technical.",
      action: "Check the legal basis carefully."
    },
    defense: {
      focus: "defense and rights issues require calm, precise handling because the wrong response can affect status, deadlines, and later options",
      review: "the authority act involved, the immediate risk, the response window, and the documents needed to support the client's position",
      risk: "stress pushes the matter into rushed communication before the legal and factual posture is properly understood",
      why: "Response quality matters quickly.",
      action: "Clarify the risk and deadline."
    },
    family: {
      focus: "family-based matters depend on the exact relationship, the documents that prove it, and the way the family history is presented to the authority",
      review: "the family tie, the civil records available, cross-border documents, and any fact that may need careful explanation",
      risk: "the relationship is assumed to be enough on its own even though the authority still needs properly prepared evidence",
      why: "The relationship must be documented.",
      action: "Match the family story to the records."
    },
    work: {
      focus: "work and business routes depend on the real activity in Brazil, the structure around it, and documents that match the proposed purpose closely",
      review: "the activity itself, the company or institutional context, the expected timeline, and the records needed to support the route",
      risk: "the category is chosen from the label alone, while the actual facts point to a different route or a different preparation sequence",
      why: "Activity and category must match.",
      action: "Define the activity precisely."
    },
    education: {
      focus: "study, research, and exchange matters usually depend on the institution, the program, and documents that show the academic purpose clearly",
      review: "the institution, the program or invitation, the student's current status, and the records needed for the chosen stage",
      risk: "the academic objective is clear to the client but not yet documented in the way the authority expects",
      why: "Academic purpose has to be shown.",
      action: "Confirm the institution and records."
    },
    location: {
      focus: "relocation planning is rarely abstract, because city, region, infrastructure, budget, and public-service access all affect how realistic a move feels after arrival",
      review: "regional differences, living costs, service access, and the practical trade-offs between one part of Brazil and another",
      risk: "Brazil is treated as if one city's reality applies everywhere, which usually leads to weak planning",
      why: "Regional differences affect daily life.",
      action: "Compare places realistically."
    },
    institutional: {
      focus: "potential clients usually need to understand how the practice works before they decide whether the fit is right",
      review: "how the practice organizes the work, what can be discussed publicly, and where general information ends and case-specific advice begins",
      risk: "institutional language becomes marketing copy instead of helping readers evaluate standards, scope, and working method",
      why: "Clarity builds trust.",
      action: "Use the page to assess fit."
    },
    outcome: {
      focus: "expectations stay healthier when outcomes are described honestly, with the real limits created by documents, timing, and authority discretion",
      review: "what the page can responsibly say about results, what remains outside the lawyer's control, and what preparation can realistically improve",
      risk: "language becomes promotional and obscures the difference between good preparation and a certain outcome",
      why: "Expectations need realistic framing.",
      action: "Read outcome language carefully."
    },
    policy: {
      focus: "policy and privacy topics matter because clients should understand contact, consent, payment, and data-handling rules before relying on them",
      review: "what happens operationally, what the visitor can control, and how privacy, consent, or accessibility requests are handled",
      risk: "a practical rule is hidden inside abstract legal language and becomes hard for a real person to follow",
      why: "Operational rules should be readable.",
      action: "Follow the stated rule directly."
    },
    search: {
      focus: "navigation topics matter because readers should be able to find the right information without confusing broad guidance with case-specific advice",
      review: "which questions belong to route guidance, which belong to process guidance, and when browsing should move into intake",
      risk: "a reader stays in research mode too long or follows the wrong path for the issue that needs solving",
      why: "Navigation changes the user journey.",
      action: "Move to the right page quickly."
    },
    route: {
      focus: "the route has to match the client's real objective, present status, and supporting facts before any serious next step is taken",
      review: "the stated goal, the legal category under consideration, and whether the documents and timing truly support that route",
      risk: "a category is chosen too early because the label sounds right even though the facts need a different analysis",
      why: "Route fit shapes the file.",
      action: "Test the category before filing."
    },
    general: {
      focus: "clients usually need the topic translated into practical terms before they can decide what to do with it",
      review: "how the issue affects timing, documents, next steps, and the realistic scope of general guidance",
      risk: "the topic sounds clear in theory but remains too abstract for a real decision",
      why: "Practical clarity matters.",
      action: "Turn the topic into a next step."
    }
  };

  return { lower, theme, ...profiles[theme] };
}

function themeProcessExplanation(profile) {
  switch (profile.theme) {
    case "route":
      return "A typical route review starts by confirming the client's objective, current status, and legal basis, then checking whether the next formal step belongs at a consulate, with the Federal Police, or at a later registration stage in Brazil.";
    case "work":
      return "A typical work-related file starts with the real activity in Brazil, the sponsoring company or business structure, and the category that best matches that activity before any supporting record is finalized.";
    case "family":
      return "A typical family-based case starts with the exact family relationship, the civil records that prove it, and the way the family history will be presented to the authority.";
    case "education":
      return "A typical academic case starts with the institution, the program or invitation, and the document trail showing why the study, research, or exchange purpose fits the chosen route.";
    case "citizenship":
      return "A typical citizenship review starts with the statutory basis, the residence timeline, and the continuity of the identity and civil records needed for the filing.";
    case "documents":
      return "A typical document review starts by separating identity and civil records from route-specific proof, then checking validity, consistency, apostille needs, and sworn translation needs before the file is assembled.";
    case "timing":
      return "A typical timing review starts with expiry dates, appointment windows, travel plans, and the client's current status before any filing or consular step is chosen.";
    case "authority":
      return "A typical procedural review starts by identifying which authority controls the next step, because consular posts, the Federal Police, ministries, and courts can each require a different sequence and a different record set.";
    case "compliance":
      return "A typical compliance review starts after the initial approval question, because registration, updates, renewals, and later duties usually determine whether the status remains protected.";
    case "consultation":
      return "A useful first consultation usually starts with the objective, the current immigration position, the key dates, the documents already available, and the questions the client most needs answered.";
    case "defense":
      return "A typical defense review starts with the authority act, the response deadline, the immediate risk, and the records needed to support the client's position before any message is sent in haste.";
    case "policy":
      return "A practical policy review starts with the rule itself, the action it changes, and the correct channel the client should use before moving forward.";
    case "contact":
      return "A useful first message usually starts with the route or issue, the client's location, the key dates, and the fastest reply channel.";
    case "location":
      return "A useful relocation comparison usually starts with budget, rent, transport, healthcare, school planning where relevant, and how daily administration works in the chosen city or state.";
    case "institutional":
      return "A serious client usually starts by checking who will handle the matter, how scope is set, how communication is documented, and how professional boundaries are kept clear.";
    case "outcome":
      return "A realistic outcome review starts by separating what preparation can improve from what still depends on authority discretion, documentary quality, and timing.";
    default:
      return "A practical review starts by linking the topic to the next legal step, the key dates, and the documents that will matter when the matter stops being theoretical.";
  }
}

function themeRecordExplanation(profile) {
  switch (profile.theme) {
    case "route":
      return "Typical records at this point include passports, current-status evidence, route-specific civil or corporate documents, and proof showing why the chosen category fits the facts.";
    case "work":
      return "Typical records include passports, corporate records, contracts or assignment material, proof of the proposed activity in Brazil, and any documents the sponsor must issue.";
    case "family":
      return "Typical records include passports, birth or marriage certificates, proof of the family tie, and any supporting documents needed to explain the relationship clearly and consistently.";
    case "education":
      return "Typical records include passports, enrollment or invitation letters, proof of the academic purpose, and the identity or civil documents required for the chosen route.";
    case "citizenship":
      return "Typical records include residence-history evidence, civil certificates, identity documents, and any document needed to show continuity of lawful residence or the precise legal basis.";
    case "documents":
      return "Strong files are built from clean civil records, route-specific proof, translations where required, and a chronology that tells one consistent story from start to finish.";
    case "timing":
      return "The decisive record set is often the one that proves current status validity, prior filings, appointment availability, and the dates that cannot safely be missed.";
    case "authority":
      return "The same client can face different forms, booking systems, and document expectations depending on which authority controls the next step.";
    case "compliance":
      return "The file often needs later registration records, renewal planning, update proofs, and evidence that the client kept the status aligned after the first approval.";
    case "consultation":
      return "The first review works best with passports, visas or cards, civil certificates, sponsor or company records where relevant, and a short timeline of key events.";
    case "defense":
      return "The critical record set usually includes the authority notice, the client's status records, proof supporting the response, and any deadlines or procedural notices already issued.";
    case "policy":
      return "The important point is not abstract legal vocabulary but whether the reader can identify the right channel, permission, payment, or consent step.";
    case "contact":
      return "A short summary with route, location, deadline, and available documents is more useful than a long message without chronology.";
    case "location":
      return "The most useful planning points are monthly budget, rent, transport, health access, school options where relevant, and how local administration affects daily life after arrival.";
    case "institutional":
      return "Clients usually look for clear professional identification, scope boundaries, languages of service, and a working method that can be understood before contact.";
    case "outcome":
      return "A realistic file separates what preparation can strengthen from what no lawyer can promise, especially where timing, documents, and official discretion still control the result.";
    default:
      return "The practical value comes from turning the topic into documents, dates, decisions, and a clearer next move.";
  }
}

function themeGuardrail(profile) {
  switch (profile.theme) {
    case "route":
      return "If the route is chosen too early, money is often spent on the wrong translations, bookings, or document requests.";
    case "work":
      return "Many avoidable problems begin when the visa label is chosen first and the factual structure is checked later.";
    case "family":
      return "Many delays come from treating the relationship itself as enough without building the record set the authority still expects.";
    case "education":
      return "Academic purpose is often clear to the client long before it is clear in the documents.";
    case "citizenship":
      return "Citizenship filings usually fail on continuity, timing, or statutory detail rather than on broad eligibility assumptions.";
    case "documents":
      return "A file that looks complete at first glance can still fail if dates, names, translations, or route-specific proof do not line up cleanly.";
    case "timing":
      return "The wrong sequence can create avoidable cost, expired status problems, or travel decisions that are hard to unwind later.";
    case "authority":
      return "Following the wrong authority or the wrong channel can waste weeks before the real issue is even reviewed.";
    case "compliance":
      return "A good result can still be undermined later if registrations, renewals, or update duties are treated as secondary.";
    case "consultation":
      return "The first conversation is most useful when it is treated as route assessment and risk review, not as a shortcut around document analysis.";
    case "defense":
      return "In defense matters, rushed language and incomplete chronology often cause more damage than a short delay used to organize the response properly.";
    case "policy":
      return "Operational rules only protect the client if the next action is clear and followed correctly.";
    case "contact":
      return "The first reply is much easier to give when the core facts, deadline, and communication channel are clear from the beginning.";
    case "location":
      return "Brazil usually stops looking like one market as soon as rent, transport, healthcare, and local administration are compared closely.";
    case "institutional":
      return "Clear professional boundaries are part of the service quality, not a formality added after the client makes contact.";
    case "outcome":
      return "The safest planning always starts from what can be prepared carefully, not from the assumption that good preparation guarantees the result.";
    default:
      return "The safest approach is to turn the topic into a practical next step instead of leaving it at the level of general interest.";
  }
}

function uiIcon(key) {
  const icons = {
    book:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5a2.5 2.5 0 0 0-2.5-2.5H5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5V15h10.5c.53 0 1.04.13 1.5.36V4H7.5Zm-2.5 15h12.5c1.38 0 2.5 1.12 2.5 2.5H7.5A2.5 2.5 0 0 1 5 19Z" fill="currentColor"/></svg>',
    compass:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"/></svg>',
    route:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm10-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7 9v2c0 1.66 1.34 3 3 3h5v-2h-5a1 1 0 0 1-1-1V9H7Z" fill="currentColor"/></svg>',
    scan:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4v2H6v2H4V4Zm12 0h4v4h-2V6h-2V4ZM4 16h2v2h2v2H4v-4Zm14 0h2v4h-4v-2h2v-2ZM8 7h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z" fill="currentColor"/></svg>',
    next:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.2 5.3 6 6-6 6-1.4-1.4 3.6-3.6H4v-2h11.4l-3.6-3.6 1.4-1.4Z" fill="currentColor"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 5 5v6c0 5 3 8.7 7 11 4-2.3 7-6 7-11V5l-7-3Zm0 3.2 4 1.7v4.2c0 3.4-1.8 6-4 7.8-2.2-1.8-4-4.4-4-7.8V6.9l4-1.7Z" fill="currentColor"/></svg>',
    document:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7V3Zm2 2v14h8V9h-4V5H9Zm2 7h4v2h-4v-2Zm0 4h4v2h-4v-2Zm0-8h1v2h-1V8Z" fill="currentColor"/></svg>',
    related:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-2.1 2.1-1.4-1.4 2.1-2.1a1 1 0 1 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l2.1-2.1 1.4 1.4-2.1 2.1a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z" fill="currentColor"/></svg>',
    faq:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm2.2-7.4c0 1.15-.7 1.8-1.54 2.36-.8.53-1.16.9-1.16 1.54v.5h-2v-.74c0-1.37.74-2.19 1.72-2.86.73-.5.98-.84.98-1.34 0-.78-.56-1.32-1.48-1.32-.93 0-1.6.4-2.2 1.08l-1.46-1.26C8.06 7.12 9.28 6.3 10.98 6.3c1.96 0 3.22 1.22 3.22 2.8Z" fill="currentColor"/></svg>',
    form:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6V3Zm2 2v14h8V5H8Zm1 2h6v2H9V7Zm0 4h6v2H9v-2Zm0 4h4v2H9v-2Z" fill="currentColor"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm8.9 11.5 2.6 2.6-1.4 1.4-2.6-2.6 1.4-1.4Z" fill="currentColor"/></svg>',
    scales:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v2.1c2.9.4 5.2 2.7 5.7 5.6h1.3v2h-3.2l1.8 3.5a3.5 3.5 0 0 1-6.3 0l1.8-3.5H13V19h4v2H7v-2h4v-6.3H8.9l1.8 3.5a3.5 3.5 0 0 1-6.3 0l1.8-3.5H3v-2h1.3c.5-2.9 2.8-5.2 5.7-5.6V3Zm6.2 9.7-1.7 3.4a1.5 1.5 0 0 0 2.7 0l-1.7-3.4h.7Zm-10.4 0-1.7 3.4a1.5 1.5 0 0 0 2.7 0l-1.7-3.4h.7Zm5.2-5.6a3.78 3.78 0 0 0-3.7 3.6h7.4A3.78 3.78 0 0 0 12 7.1Z" fill="currentColor"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2a8.8 8.8 0 0 1 7.5 13.4 8.75 8.75 0 0 1-10.2 3.9l-4 1 1.1-3.8A8.8 8.8 0 1 1 12 3.2Zm0 1.9a6.9 6.9 0 0 0-5.9 10.4l.3.5-.7 2.3 2.4-.6.5.3a6.9 6.9 0 1 0 3.4-12.9Zm-2 3.1c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.8c.1.2.1.4 0 .6-.1.2-.2.4-.4.5l-.4.3c-.1.1-.2.2-.1.4.3.5.7 1 1.2 1.5.6.5 1.2.9 1.9 1.2.2.1.3 0 .4-.1l.5-.6c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.4.4 0 .2 0 .9-.3 1.2-.3.2-.8.5-1.4.5-.4 0-.9-.1-1.5-.3-.9-.3-1.8-.8-2.7-1.4a9.15 9.15 0 0 1-2-2.1 8.21 8.21 0 0 1-1.3-2.8c-.2-.7-.2-1.2-.2-1.5 0-.6.3-1.1.5-1.4Z" fill="currentColor"/></svg>',
    up:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 20V8.8L6.4 13.4 5 12l7-7 7 7-1.4 1.4L13 8.8V20h-2Z" fill="currentColor"/></svg>',
    alert:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20L12 3Zm0 4.3 6.5 11.7H5.5L12 7.3Zm-1 3.2h2v4.5h-2v-4.5Zm0 6h2v2h-2v-2Z" fill="currentColor"/></svg>',
    quote:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H5v5h3c0 1.7-1.3 3-3 3v2c2.8 0 5-2.2 5-5V7Zm10 0h-4v5h3c0 1.7-1.3 3-3 3v2c2.8 0 5-2.2 5-5V7Z" fill="currentColor"/></svg>',
    payment:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3V6Zm2 2v8h14V8H5Zm2 2h4v2H7v-2Zm8 0h2v4h-2v-4Z" fill="currentColor"/></svg>',
    places:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 1 7 7c0 4.8-5.2 10.7-7 13-1.8-2.3-7-8.2-7-13a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5Z" fill="currentColor"/></svg>',
    responsibilities:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v5c0 4.6 3 7.9 8 10 5-2.1 8-5.4 8-10V7l-8-4Zm-1 12.6-3.3-3.3 1.4-1.4 1.9 1.9 4.2-4.2 1.4 1.4-5.6 5.6Z" fill="currentColor"/></svg>',
    spark:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Zm6.5 13 1 2.5L22 18l-2.5 1-.5 2.5-1-2.5L15 18l2.5-1 .5-2Z" fill="currentColor"/></svg>'
  };
  return icons[key] || icons.book;
}

function renderHeadingWithIcon(tag, label, icon, className = "") {
  return `<${tag} class="section-title${className ? ` ${className}` : ""}"><span class="section-title__icon" aria-hidden="true">${uiIcon(
    icon
  )}</span><span>${escapeHtml(label)}</span></${tag}>`;
}

function renderHeaderConsultationCta(className = "") {
  return `<a class="btn btn-cta btn-sm main-header__cta${className ? ` ${className}` : ""}" href="/start-consultation/" data-cta-click="true">
    <span class="main-header__cta-icons" aria-hidden="true">
      <span class="main-header__cta-icon main-header__cta-icon--scales">${uiIcon("scales")}</span>
      <span class="main-header__cta-icon main-header__cta-icon--book">${uiIcon("book")}</span>
    </span>
    <span class="main-header__cta-label">Start Consultation</span>
  </a>`;
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
      return "Practice information is presented in a neutral, OAB-safe voice and avoids claims about outcomes or superiority.";
    case "lawyer":
      return "The lawyer profile stays limited to public, verifiable professional facts.";
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
      return "Policy pages explain payment, contact, privacy, consent, and accessibility in operational terms.";
    case "insight":
      return "Insights pages are editorial explainers that clarify concepts, institutions, and distinctions often misunderstood by people planning a move to Brazil.";
    default:
      return "The content is structured to give readers clear guidance, grounded in official sources and neutral language, before any consultation is requested.";
  }
}

function buildIntroParagraph(page) {
  let lead = page.summary;
  let paragraphOne = getFamilyLead(page);
  let paragraphTwo =
    page.route === "/about/lawyer/"
      ? "Only limited, publicly verifiable professional facts are used, in line with the factual scope permitted by the brief."
      : "The language stays client-facing, avoids guarantees, and points readers back to official sources whenever a formal rule or authority decision controls the next step.";

  if (page.route === "/") {
    lead = "Private-client legal guidance on visas, residency, citizenship, and relocation planning in Brazil.";
    paragraphOne =
      "If you are planning a move, regularization, or long-term status in Brazil, the first question is rarely which label sounds attractive. The real question is which legal route fits the facts, the timing, and the documents already available.";
    paragraphTwo =
      "A typical matter starts with route fit, then moves into chronology, documents, authority choice, and later compliance duties. Once the issue turns on personal facts or supporting records, the next step is consultation rather than guesswork.";
  } else if (page.sectionStyle === "services-home" || page.sectionStyle === "service-hub" || page.sectionStyle === "service-child") {
    lead = `Client-facing guidance on ${page.title.toLowerCase()} matters in Brazil.`;
    paragraphOne =
      "These pages explain how a Brazil immigration matter is usually built in practice: first the route is tested, then the chronology is checked, then the documents are reviewed, and only after that does the filing or appointment strategy become reliable.";
    paragraphTwo =
      "That sequence matters because the wrong category, the wrong timing, or the wrong document set can waste money before the authority ever looks at the file. The language stays careful because no responsible lawyer should treat an immigration category as a certain outcome.";
  } else if (page.sectionStyle === "process") {
    lead = `Practical guidance on the ${page.title.toLowerCase()} stage of a Brazil immigration matter.`;
    paragraphOne =
      "Clients often discover that the immigration process is less linear than they expected. A stage-by-stage explanation helps show what belongs to the applicant, what belongs to the authority, and which issues usually need attention before the next move is made.";
    paragraphTwo =
      "That is why these pages speak directly about deadlines, document control, follow-up duties, and common points of confusion. The result should be a more efficient consultation and fewer preventable mistakes, not a promise of administrative outcome.";
  } else if (page.sectionStyle === "consultation") {
    lead = "How the consultation request works, what to prepare, and what happens before a meeting is confirmed.";
    paragraphOne =
      "A consultation should begin with clear expectations. The request comes first, payment follows, and scheduling only moves ahead after proof is checked and the timing rule is respected.";
    paragraphTwo =
      "A useful first review usually begins with the objective, the current status, the key dates, and the documents already available. That is what allows route options, risks, and missing records to be identified in a structured way.";
  } else if (page.sectionStyle === "payment") {
    lead = "Consultation payment instructions written for real clients, not as fine print.";
    paragraphOne =
      "Payment pages are most useful when they remove uncertainty. A client should be able to see the accepted methods, where proof should be sent, and when scheduling can realistically move forward.";
    paragraphTwo =
      "The aim here is straightforward administration: clear steps, clear receiver details, and no implication that payment alone creates a booking, engagement, or guaranteed service outcome.";
  } else if (page.sectionStyle === "form") {
    lead = "A detailed intake form for sending the first summary of your matter.";
    paragraphOne =
      "The form is designed to collect the facts that usually change route analysis, timing, and document planning. That makes the first review more efficient and reduces avoidable follow-up questions.";
    paragraphTwo =
      "Submission on its own does not create representation. What it does create is a cleaner starting record, which helps the team identify the likely route, the missing information, and the right next operational step.";
  } else if (page.sectionStyle === "emergency") {
    lead = "How urgent immigration situations should be raised and what should be treated as genuinely urgent.";
    paragraphOne =
      "Urgent matters need short, useful communication. This page explains when WhatsApp is the right first contact, when an immediate public-authority response matters more, and what information helps the team understand the issue quickly.";
    paragraphTwo =
      "It also keeps the limits visible. An emergency message is a channel for triage, not a promise of immediate intervention, and the safest first step still depends on the type of risk involved.";
  } else if (page.family === "brazil") {
    lead = `Relocation guidance on ${page.title.toLowerCase()} for people planning life in Brazil.`;
    paragraphOne =
      "Brazil is large, institutionally layered, and regionally varied, so useful relocation content has to go beyond slogans. These pages are written to help readers compare places, costs, infrastructure, and day-to-day realities in a way that supports better immigration planning.";
    paragraphTwo =
      "The goal is not to sell a lifestyle. It is to connect practical relocation questions to official data, regional differences, and the kind of decisions that matter before choosing a city, a budget, or a longer-term route.";
  } else if (page.family === "about") {
    lead = `Professional guidance on ${page.title.toLowerCase()} for prospective clients.`;
    paragraphOne =
      "Institutional pages matter because readers need more than service lists. They need to understand the practice's working method, professional boundaries, and the standards used when handling immigration matters for international clients.";
    paragraphTwo =
      "These pages therefore emphasize factual clarity over marketing language. They help a reader assess fit, understand the style of communication, and see what belongs in public information versus what requires a proper legal review.";
  } else if (page.family === "legal") {
    lead = `Operational guidance on ${page.title.toLowerCase()} for clients and visitors.`;
    paragraphOne =
      "Policy and operational pages should be as readable as service pages, because decisions about contact, payment, consent, privacy, and platform use affect real people before any consultation takes place.";
    paragraphTwo =
      "For that reason, these notices are written to be usable first and compliant second, not the other way around. Visitors should be able to understand the rule, the boundary, and the next action without reading through filler.";
  } else if (page.family === "insights") {
    lead = `Plain-English guidance on ${page.title.toLowerCase()} in the Brazilian immigration context.`;
    paragraphOne =
      "Insights pages are meant to reduce confusion before a person decides whether they need a formal consultation. They explain the ideas, institutions, and distinctions that frequently sit behind a Brazil immigration question but are often misunderstood in broad online discussions.";
    paragraphTwo =
      "That makes them useful both for clients and for readers still in research mode. The content stays educational, but it is written with the practical reader in mind: someone who wants clearer terminology, better questions, and a more realistic picture of what comes next.";
  }

  return `<p class="lead">${escapeHtml(lead)}</p>
  <p>${escapeHtml(paragraphOne)}</p>
  <p>${escapeHtml(paragraphTwo)}</p>`;
}

function topicParagraphs(page, topic, index) {
  const topicLower = normalizeTopic(topic);
  const pageLower = page.title.toLowerCase();
  const profile = topicProfile(topic);
  const seed = `${page.key}:${topic}:${index}`;

  if (page.route === "/about/lawyer/") {
    const lawyerContent = {
      "Full Identification": `Public source material identifies ${LAWYER_FACTS.legalName} as a Brazilian attorney and names ${LAWYER_FACTS.oab} as the professional registration reference. That is the core professional identification currently verified. No additional biographical detail is added where the public record does not state it. That restraint protects accuracy, supports OAB-safe communication, and keeps a clear distinction between verified professional identification and unsupported biography.`,
      "Academic Background": `The available public material reviewed for this build does not publish a law-school name, degree date, or public academic timeline. For that reason, no institution, degree sequence, or credential list is inferred here. Factual restraint is part of compliance. If verified public records later make those details available, they can be stated precisely rather than guessed from incomplete material.`,
      "Professional Qualifications": `The professionally relevant facts that can be stated with confidence are the OAB registration, the public identification as a licensed Brazilian attorney, the stated service languages, and the public positioning of the practice in immigration-related matters. In practical terms, that means an OAB-registered lawyer handling Brazil immigration guidance within the limits of the public record. What matters here is what can be verified, how the professional role is framed, and where the public record ends.`,
      "Areas of Practice": `Source material indicates a practice focus that includes immigration, civil, family, and human-rights matters. The client guidance here is immigration-focused, so the broader range appears only as contextual background. That distinction matters because cross-border cases sometimes overlap with family status, records, translations, or related civil issues, even when the primary question is immigration.`,
      "Immigration Experience": `Public-facing materials describe experience supporting immigration matters and reference practice activity since 2018. Rather than turning that into a comparative claim, the safer reading is repeated exposure to document review, route assessment, status maintenance, and authority-led procedures. Experience does not remove uncertainty from any case, but it can improve organization, issue spotting, and communication discipline.`,
      "Languages": `The reviewed source materials state that services are offered in English and Portuguese. For international clients navigating Brazilian institutions for the first time, bilingual communication can reduce misunderstanding around document names, procedural expectations, and next-step instructions. It does not change the legal standards applied by Brazilian authorities, but it can improve how guidance is understood and how communication is sequenced between intake, review, and later stages of a matter.`
    };
    const text =
      lawyerContent[topic] ||
      `Only public, verifiable facts are used here and no embellishment is added. That restraint is deliberate, because a professional profile should remain accurate even when the available source material is limited.`;
    return [
      text,
      `Taken together, the profile confirms identity, registration reference, languages, and practice framing while avoiding unsupported biography. That approach favors careful public facts over inferred credentials or persuasive claims.`
    ];
  }

  const style = page.sectionStyle;
  if (style === "about") {
    return [
      `${pickVariant(seed, [
        `Before hiring any lawyer, a client should understand ${topicLower} in concrete terms.`,
        `${topicLower} matters because it shows how the work is organized, how communication is handled, and what standards guide the representation.`,
        `A serious client usually wants more than mission language, and ${topicLower} should make the practice easier to evaluate.`
      ])} ${themeProcessExplanation(profile)} ${themeRecordExplanation(profile)}`,
      `${themeGuardrail(profile)} ${topicLower} should make professional boundaries visible, make the working method easier to evaluate, and separate general information from case-specific legal advice.`
    ];
  }

  if (style === "brazil" || style === "brazil-search") {
    return [
      `${pickVariant(seed, [
        `The subject of ${topicLower} matters to relocation planning because ${profile.focus}.`,
        `When people compare life in Brazil seriously, the issue of ${topicLower} usually matters because ${profile.focus}.`,
        `For anyone planning a move, ${topicLower} matters because ${profile.focus}.`
      ])} ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  }

  if (style === "process") {
    return [
      `${pickVariant(seed, [
        `Clients often reach the ${pageLower} stage with more uncertainty than they expected.`,
        `By the time a matter reaches the ${pageLower} stage, many clients assume the next move is obvious.`,
        `The ${pageLower} stage usually looks simpler from the outside than it feels inside a real file.`
      ])} ${themeProcessExplanation(profile)} ${themeRecordExplanation(profile)}`,
      `Before moving forward, the review usually focuses on ${profile.review}. ${themeGuardrail(profile)} The common risk is that ${profile.risk}.`
    ];
  }

  if (style === "service-child" || style === "service-hub" || style === "services-home") {
    return [
      `${pickVariant(seed, [
        `For a client considering a ${pageLower} matter, ${topicLower} is one of the issues that usually needs early attention.`,
        `In a ${pageLower} matter, ${topicLower} is rarely just a label on a checklist.`,
        `If you are comparing options on a ${pageLower} matter, ${topicLower} is one of the points that usually changes the strategy.`
      ])} ${themeProcessExplanation(profile)} ${themeRecordExplanation(profile)}`,
      `During consultation, the review usually focuses on ${profile.review}. ${themeGuardrail(profile)} The common problem is that ${profile.risk}.`
    ];
  }

  if (style === "consultation") {
    return [
      `Before a consultation is scheduled, ${topicLower} affects what can happen next. ${themeProcessExplanation(profile)} ${themeRecordExplanation(profile)}`,
      `At this stage, we normally need ${profile.review}. ${themeGuardrail(profile)} The risk is that ${profile.risk}. A consultation can identify route options, document gaps, and priority issues, but it still depends on the facts actually provided and it is not a promise of outcome.`
    ];
  }

  if (style === "payment") {
    return [
      `For ${topicLower}, the key point is that ${profile.focus}. Payment, proof, and scheduling work together, so a transfer alone does not reserve time.`,
      `From the client side, the safest approach is simple: ${profile.action.replace(/\.$/, "").charAt(0).toLowerCase()}${profile.action.replace(/\.$/, "").slice(1)}. Clear payment records reduce confusion and make manual confirmation easier.`
    ];
  }

  if (style === "form") {
    return [
      `For ${topicLower}, the key point is that ${profile.focus}. Immigration matters are easier to review when the first message already contains the facts that change route analysis, timing, and document planning.`,
      `${topicLower} helps structure the first review, reduce follow-up questions, and show what still needs clarification before consultation moves ahead.`
    ];
  }

  if (style === "emergency") {
    return [
      `${topic} matters in urgent situations because ${profile.focus}. When time matters, the message has to show what is happening quickly and whether the safest first response belongs with the lawyer, the client, or the competent public authority.`,
      `In urgent matters, the review focuses on ${profile.review}. The danger is that ${profile.risk}. Short, useful information and realistic expectations matter more than long explanations.`
    ];
  }

  if (style === "legal") {
    return [
      `For privacy, payment, consent, or contact rules, ${topicLower} matters because ${profile.focus}. A visitor should understand the rule before using a form, sending payment, or relying on a platform feature.`,
      `The next action should be obvious. ${topicLower} is therefore stated in operational terms, with clear boundaries and practical instructions rather than abstract compliance language.`
    ];
  }

  if (style === "insight") {
    return [
      `${topic} is one of the points that often sounds simple until a client tries to apply it to a real Brazil immigration plan. In practical terms, ${profile.focus}. Read it in plain English first, then decide whether case-specific advice is needed.`,
      `The purpose is educational, but still practical. We connect ${topicLower} to the authority, document, timing, or route questions it usually affects so the reader can distinguish broad research from the point where a proper legal review becomes necessary.`
    ];
  }

  return [
    `The subject of ${topicLower} matters because ${profile.focus}. Many readers arrive with a goal but not yet with the right legal vocabulary, so the explanation is written to turn broad interest into a clearer next step.`,
    `The approach stays structured and careful: practical information first, clear boundaries, and consultation when the issue becomes specific to one client. That helps readers ask better questions without overstating what general guidance can do.`
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
  const topicLower = normalizeTopic(topic);
  if (page.sectionStyle === "service-child" || page.sectionStyle === "service-hub" || page.sectionStyle === "services-home") {
    return `${topicLower} in terms of route fit, supporting records, and next steps.`;
  }
  if (page.sectionStyle === "process" || page.sectionStyle === "consultation") {
    return `${topicLower}, the current stage, and the next practical check.`;
  }
  if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
    return `${topicLower}, regional comparison, and planning trade-offs.`;
  }
  if (page.sectionStyle === "legal" || ["payment", "form", "emergency"].includes(page.sectionStyle)) {
    return `${topicLower} in direct, operational terms.`;
  }
  if (page.sectionStyle === "home") {
    return `${topicLower} for first-time Brazil immigration planning.`;
  }
  return `${topicLower} in practical client terms.`;
}

function topicNotes(page, topic, index) {
  const profile = topicProfile(topic);
  const actionLabel =
    page.sectionStyle === "consultation"
      ? "What to send first"
      : page.sectionStyle === "payment"
        ? "Best next step"
        : page.sectionStyle === "form"
          ? "Why this field exists"
          : page.sectionStyle === "emergency"
            ? "First response"
            : page.family === "services"
              ? "What clients should do"
              : page.family === "process"
                ? "What to check next"
                : page.family === "brazil"
                  ? "Planning use"
                  : "What to keep in view";

  return [
    { label: "Why it matters", text: profile.why },
    {
      label: actionLabel,
      text: profile.action
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
      ["Check boundaries", "Use, payment, and contact have limits."],
      ["Adjust preferences", "Set consent and accessibility."],
      ["Contact correctly", "Use the right channel."]
    ];
  }

  return [
    ["Start with the issue", "Use this for orientation."],
    ["Check official sources", "Official rules come first."],
    ["Explore related pages", "Move laterally where needed."],
    ["Use the right CTA", "Choose the right next step."]
  ];
}

function renderPageNavigator(page, { title = "Key topics", limit = 6, compact = false, icon = "compass" } = {}) {
  if (page.utility) return "";
  const topics = page.topics.slice(0, limit);
  if (!topics.length) return "";
  return `<section class="page-map${compact ? " page-map--compact" : ""}"${compact ? "" : ' id="page-map"'}>
    <div class="page-map__head">
      ${renderHeadingWithIcon("h2", title, icon, "page-map__title")}
      <p>Move directly to the question that matters.</p>
    </div>
    <div class="page-map__links">
      ${topics
        .map(
          (topic) => `<a class="page-map__link" href="#topic-${slugify(topic)}"><span class="page-map__icon" aria-hidden="true">${uiIcon(
            "next"
          )}</span><span>${escapeHtml(topic)}</span></a>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderQuickScan(page) {
  if (page.utility) return "";
  const steps = pageJourneySteps(page);
  const stepIcons = ["route", "scan", "document", "next"];
  return `<section class="quick-scan" aria-label="Page overview and journey">
    <div class="quick-scan__shell">
      <div class="quick-scan__panel quick-scan__panel--journey">
        <div class="section-head">
          ${renderHeadingWithIcon("h2", "Journey snapshot", "route")}
          <p>How this issue fits into the broader process.</p>
        </div>
        <div class="journey-strip">
          ${steps
            .map(
              ([title, text], index) => `<article class="journey-step">
                <div class="journey-step__meta">
                  <span class="journey-step__icon" aria-hidden="true">${uiIcon(stepIcons[index % stepIcons.length])}</span>
                  <span class="journey-step__count">${String(index + 1).padStart(2, "0")}</span>
                </div>
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
        ${renderPageNavigator(page, { title: "Page map", limit: 7, icon: "scan" })}
      </div>
    </div>
  </section>`;
}

function renderSidebar(page) {
  return `<aside class="sidebar-column">
    <section class="sidebar-card sidebar-card--map">
      ${renderPageNavigator(page, { title: "Quick navigation", limit: 8, compact: true, icon: "compass" })}
    </section>
    <section class="sidebar-card sidebar-card--facts">
      ${renderHeadingWithIcon("h2", "At a glance", "scan")}
      <ul class="sidebar-list">
        <li><strong>Page model</strong><span>${escapeHtml(STYLE_LABELS[page.sectionStyle] || page.family)}</span></li>
        <li><strong>Coverage</strong><span>${escapeHtml(SITE.serviceArea)}</span></li>
        <li><strong>Intake route</strong><span>${escapeHtml(page.formGroupLabel)}</span></li>
      </ul>
    </section>
    <section class="sidebar-card sidebar-card--brand">
      <div class="sidebar-brand">
        ${renderBrandMark({ className: "sidebar-brand__mark", width: 68, height: 68 })}
        <div class="sidebar-brand__copy">
          <strong>${escapeHtml(SITE.name)}</strong>
          <span>${escapeHtml(SITE.footerTagline)}</span>
        </div>
      </div>
      <p class="sidebar-note">${escapeHtml(brandContextNote(page))}</p>
    </section>
    <section class="sidebar-card sidebar-card--action">
      ${renderHeadingWithIcon("h2", "Recommended next step", "next")}
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
  const labelSets = {
    home: [
      "What first-time readers usually need first",
      "Where public information stops",
      "What makes an inquiry useful",
      "How route planning becomes practical",
      "Why source quality matters"
    ],
    services: [
      "How the route is reviewed",
      "What strengthens the file",
      "Where clients usually lose time",
      "How timing changes strategy",
      "What consultation adds"
    ],
    process: [
      "What usually causes delay",
      "How the file stays coherent",
      "Where deadlines matter most",
      "How clients prepare better",
      "Why sequence changes outcomes"
    ],
    consultation: [
      "What makes the first review useful",
      "Information that changes the answer",
      "How scheduling and scope stay clear",
      "What can be clarified quickly",
      "What still needs deeper review"
    ],
    brazil: [
      "Comparing regions realistically",
      "What changes after arrival",
      "How cost and legal planning interact",
      "Why local variation matters",
      "Questions to settle early"
    ],
    about: [
      "How the practice communicates",
      "How scope stays clear",
      "What standards look like in practice",
      "How clients assess fit",
      "Why boundaries build trust"
    ],
    legal: [
      "What the rule changes in practice",
      "What to do first",
      "What to avoid",
      "How follow-up works",
      "Why the boundary matters"
    ],
    insights: [
      "Where the term gets confused",
      "Why the distinction matters",
      "How the concept appears in practice",
      "Questions readers usually ask",
      "When consultation becomes useful"
    ]
  };

  const labelSource =
    page.sectionStyle === "home"
      ? labelSets.home
      : page.sectionStyle === "consultation"
        ? labelSets.consultation
        : page.family === "services"
          ? labelSets.services
          : page.family === "process"
            ? labelSets.process
            : page.family === "brazil"
              ? labelSets.brazil
              : page.family === "about"
                ? labelSets.about
                : page.family === "legal"
                  ? labelSets.legal
                  : page.family === "insights"
                    ? labelSets.insights
                    : labelSets.home;
  const label = labelSource[index % labelSource.length];
  const profile = topicProfile(label);

  let paragraphs;
  if (page.sectionStyle === "home") {
    paragraphs = [
      `Most matters begin with the same practical questions: which route may fit, which authority controls the next step, which documents already exist, and which dates can safely be relied on. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.family === "services") {
    paragraphs = [
      `In service work, the practical sequence is usually route fit first, chronology second, document quality third, and authority-specific preparation after that. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.family === "process") {
    paragraphs = [
      `At a process stage, the legal question and the administrative question are not always the same. The next step may depend on filing sequence, appointment logic, record quality, or a duty that starts only after approval. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.sectionStyle === "consultation") {
    paragraphs = [
      `A useful consultation request usually follows the same order: objective, current status, key dates, documents already available, and the question that most needs to be answered first. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.family === "brazil") {
    paragraphs = [
      `Relocation planning usually becomes real when budget, rent, transport, healthcare, schooling where relevant, and local administration are compared together instead of separately. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.family === "about") {
    paragraphs = [
      `Practice information becomes useful when it answers the questions a real client asks before making contact: who handles the matter, how scope is set, how communication is documented, and what can be said publicly before the file is reviewed. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.family === "legal" || ["payment", "form", "emergency"].includes(page.sectionStyle)) {
    paragraphs = [
      `Operational rules only help when the next step is obvious. In practice, payment, intake, privacy, emergency contact, and consent questions are easiest to follow when the client can see the action expected and the risk the rule is meant to avoid. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else if (page.family === "insights") {
    paragraphs = [
      `Editorial guidance is most useful when a label is translated into the practical questions it changes: route choice, timing, documents, authority choice, or the need for consultation. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  } else {
    paragraphs = [
      `${label} becomes useful once the reader is trying to act on the information rather than just read it. ${themeProcessExplanation(profile)}`,
      `${themeRecordExplanation(profile)} ${themeGuardrail(profile)}`
    ];
  }

  return `<section class="content-block flow-section supplemental topic-section topic-section--frame" id="expansion-${index}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Expanded context ${String(index + 1).padStart(2, "0")}</p>
        <h2>${label}</h2>
        <p class="section-strap">${escapeHtml(topicStrap(page, label, index + page.topics.length))}</p>
      </div>
      <div class="topic-section__body">
        <p>${escapeHtml(paragraphs[0])}</p>
        <p>${escapeHtml(paragraphs[1])}</p>
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
        ${renderHeadingWithIcon("h2", "Service pathways at a glance", "compass")}
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
        ${renderHeadingWithIcon("h2", "Consultation flow", "route")}
        <ol class="timeline-list">
          <li>Send the first summary of your matter, including your objective, your current status in or outside Brazil, and any deadline already in view.</li>
          <li>Attach or describe the main records already available, such as passports, visas, residence cards, civil certificates, or company documents relevant to the route.</li>
          <li>Use the stated payment instructions and send proof to <strong>${SITE.consultationPolicy.paymentReceiverEmail}</strong> by email or WhatsApp so manual review can begin.</li>
          <li>After the first review identifies the likely route, document gaps, and timing issues, the appointment is confirmed for a time at least ${SITE.consultationPolicy.minHoursAfterPayment} hours after payment confirmation.</li>
        </ol>
      </section>
      <section class="content-block testimonial-strip">
        ${renderHeadingWithIcon("h2", "Selected client feedback", "quote")}
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
        ${renderHeadingWithIcon("h2", "What to prepare before requesting a consultation", "form")}
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
      ${renderHeadingWithIcon("h2", "Organized by service family", "compass")}
      <div class="card-grid">
        ${hubs
          .map(
            (item) => `<article class="info-card">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(
                item.title === "Visas"
                  ? "Guidance on entry routes, activity-based categories, and the documents usually reviewed before a client moves forward."
                  : item.title === "Residencies"
                    ? "Guidance on residence permits, registration issues, renewals, and the longer-term obligations that often follow approval."
                    : item.title === "Naturalisation"
                      ? "Guidance on citizenship routes, residence-history review, supporting records, and what usually needs technical checking first."
                      : item.title === "Defense"
                        ? "Guidance on deportation, fines, appeals, and other situations where response quality and timing matter quickly."
                        : item.title === "Other"
                          ? "Supporting services tied to immigration files, including records, translations, consular coordination, and regularization issues."
                          : "Advisory support for strategy, compliance, representation, and corporate immigration planning."
              )}</p>
              <a class="stretched-link" href="${item.route}">Open ${escapeHtml(item.title)}</a>
            </article>`
          )
          .join("")}
      </div>
    </section>`;
  }

  if (page.sectionStyle === "service-hub") {
    return `<section class="content-block child-grid-block">
      ${renderHeadingWithIcon("h2", "Included routes", "route")}
      <div class="card-grid">
        ${servicesChildren
          .map(
            (child) => `<article class="info-card">
              <h3>${escapeHtml(child.title)}</h3>
              <p>Typical route review for ${escapeHtml(child.title.toLowerCase())} matters, including legal fit, document logic, timing, and the authority that controls the next formal step.</p>
              <a class="stretched-link" href="${child.route}">Read ${escapeHtml(child.title)}</a>
            </article>`
          )
          .join("")}
      </div>
    </section>`;
  }

  if (page.sectionStyle === "payment") {
    return `<section class="content-block highlight-block">
      ${renderHeadingWithIcon("h2", "Accepted payment methods", "payment")}
      <div class="card-grid compact">
        ${SITE.consultationPolicy.paymentMethods
          .map(
            (method) => `<article class="info-card">
              <h3>${escapeHtml(method)}</h3>
              <p>Accepted for the consultation fee. After payment, send proof so manual confirmation can begin.</p>
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
      ${renderHeadingWithIcon("h2", "How to use the emergency channel", "alert")}
      <p>If the situation is urgent, use <a href="${SITE.whatsappUrl}">WhatsApp</a> first and state the nature of the emergency, your location, your current status, and any deadline or authority action already in progress.</p>
      <p>If there is detention, an airport restriction, a health emergency, or immediate physical risk, contact the competent public authority first. Legal follow-up should then be coordinated through WhatsApp with the shortest useful summary possible.</p>
      <p>Existing clients should identify themselves as current clients and include the matter reference if available. First-time contacts should understand that an emergency message is a request for triage, not the creation of representation by itself.</p>
    </section>
    ${renderLeadForm(page, { compact: true })}`;
  }

  if (page.route === "/about/testimonials/") {
    return `<section class="content-block testimonial-strip">
      ${renderHeadingWithIcon("h2", "Primary testimonial dataset", "quote")}
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
      ${renderHeadingWithIcon("h2", "Verified public professional record", "shield")}
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
      ${renderHeadingWithIcon("h2", "Search the site", "search")}
      <form class="search-inline-form" action="/legal/search/" method="GET" data-search-form="true">
        <label class="visually-hidden" for="legal-search-query">Search term</label>
        <input id="legal-search-query" name="q" type="search" placeholder="Search this site" required />
        <button type="submit">
          <span class="search-inline-form__submit-icon" aria-hidden="true">${uiIcon("search")}</span>
          <span>Search</span>
        </button>
      </form>
      <div id="search-results" data-search-results="true" aria-live="polite"></div>
    </section>`;
  }

  if (page.sectionStyle === "404") {
    return `<section class="content-block alert-block">
      ${renderHeadingWithIcon("h2", "The page could not be found", "alert")}
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

  const baseQuestions = page.topics.slice(0, 5).map((topic, index) => {
    const topicLower = normalizeTopic(topic);
    const profile = topicProfile(topic);
    const seed = `${page.key}:faq:${topic}:${index}`;
    let question;
    if (page.sectionStyle === "service-child" || page.sectionStyle === "service-hub") {
      question = `Why does ${topicLower} matter in a ${page.title.toLowerCase()} matter?`;
    } else if (page.sectionStyle === "process") {
      question = `Why does ${topicLower} matter at the ${page.title.toLowerCase()} stage?`;
    } else if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
      question = `How does ${topicLower} affect a move to Brazil in ${page.title.toLowerCase()} planning?`;
    } else if (page.sectionStyle === "consultation") {
      question = `What should you know about ${topicLower} before requesting consultation?`;
    } else if (page.sectionStyle === "payment" || page.sectionStyle === "form" || page.sectionStyle === "emergency" || page.sectionStyle === "legal") {
      question = `${page.title}: what should you know about ${topicLower}?`;
    } else if (page.sectionStyle === "home") {
      question = `Why does ${topicLower} matter when planning immigration to Brazil?`;
    } else {
      question = `${page.title}: what matters most about ${topicLower}?`;
    }

    let answer;
    if (page.sectionStyle === "service-child" || page.sectionStyle === "service-hub" || page.sectionStyle === "services-home") {
      answer = `${pickVariant(seed, [
        `The practical point is that ${profile.focus}.`,
        `In client terms, ${profile.focus}.`,
        `The key point is that ${profile.focus}.`
      ])} In real cases, ${topicLower} changes route fit, documents, and timing. No public explanation can replace a review of the actual file.`;
    } else if (page.sectionStyle === "process") {
      answer = `It matters because ${profile.focus}. Before the next step, ${topicLower} usually has to be checked for delay, inconsistency, and procedural risk as much as for the legal rule itself.`;
    } else if (page.sectionStyle === "consultation") {
      answer = `You should understand that ${profile.focus}. Send the core facts first, leave room for document review, and remember that the first assessment still depends on what is actually provided.`;
    } else if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
      answer = `${topicLower} should be treated as part of real relocation planning, not as lifestyle filler. It connects to regional variation, budgeting, public services, and the practical questions that often influence where and how a client plans to move in Brazil.`;
    } else if (page.sectionStyle === "payment" || page.sectionStyle === "form" || page.sectionStyle === "emergency" || page.sectionStyle === "legal") {
      answer = `What matters is straightforward: ${profile.focus}. Follow the rule with the next action in view and without guesswork.`;
    } else if (page.sectionStyle === "about") {
      answer = `This topic matters because clients need to see how the practice works in concrete terms. Standards, scope, and working method should be visible without drifting into exaggeration or claims that would be inappropriate under OAB-safe communication.`;
    } else if (page.sectionStyle === "insight") {
      answer = `The answer is usually more practical than people expect: ${profile.focus}. Read the concept in plain English first so broad research can be separated from the point where a case-specific review becomes necessary.`;
    } else {
      answer = `The practical point is that ${profile.focus}. ${topicLower} affects next steps, official-source checking, and the boundary between general information and individual legal advice.`;
    }

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
      ${renderHeadingWithIcon("h2", "Frequently asked questions", "faq")}
      <p>Short answers in direct client language.</p>
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
      ${renderHeadingWithIcon("h2", "Official resources", "document")}
      <p>Government or institutional sources that help anchor this topic in the real rules and public guidance.</p>
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
  const items =
    page.sectionStyle === "consultation"
      ? [
          ["Licensed Brazilian attorney", `${LAWYER_FACTS.oab}.`],
          ["Bilingual consultations", `Consultations are handled in ${LAWYER_FACTS.languages.join(" and ")}.`],
          ["No false guarantees", "A consultation can clarify routes and risks, but no lawyer controls the authority's final decision."]
        ]
      : page.sectionStyle === "process"
        ? [
            ["Clear step-by-step guidance", "The process is reviewed in sequence: route fit, documents, timing, authority contact, and later compliance duties."],
            ["Risk minimization focus", "Files are checked for chronology gaps, document weaknesses, and authority-specific requirements before the next move."],
            ["No false guarantees", "Good preparation helps, but the final administrative decision still belongs to the competent authority."]
          ]
        : [
            ["OAB-registered lawyer", `${LAWYER_FACTS.oab}.`],
            ["Compliance-first approach", "Route fit, document quality, and filing sequence are reviewed before translations, appointments, or submissions move ahead."],
            ["Remote support across Brazil", "Clients in Brazil or abroad can be assisted through a document-based remote process."]
          ];

  return `<section class="trust-marker-block" data-trust-markers="true">
    ${items
      .map(
        ([title, text]) => `<div class="marker">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </div>`
      )
      .join("")}
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
      ${renderHeadingWithIcon("h2", full ? "Request a consultation" : "Send an inquiry", "form")}
      <p>${escapeHtml(
        full
          ? "Use this form to send the first summary of your matter. Requests are reviewed manually before consultation is confirmed."
          : "Use this form to send the first summary of your matter. The team reviews requests manually and replies with the next practical step."
      )}</p>
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
        <p>Requests are reviewed manually. Consultation appointments are only confirmed after payment verification, and the selected time must be at least ${SITE.consultationPolicy.minHoursAfterPayment} hours after confirmation.</p>
      </div>
      <button type="submit" class="btn btn-cta" data-cta-click="true">${full ? "Submit consultation request" : "Send request"}</button>
    </form>
  </section>`;
}

function renderRelated(page) {
  const items = relatedPages(page);
  return `<section class="related-block" data-related-links="true">
    <div class="section-head">
      ${renderHeadingWithIcon("h2", "See also", "related")}
      <p>Related pages that usually answer the next client question.</p>
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
    foundation: page.route === "/" ? "Lawyer-led immigration guidance" : "Consultation and intake",
    services: "Route analysis and preparation",
    process: "What the process means in practice",
    brazil: "Relocation planning for Brazil",
    about: "How the practice works",
    insights: "Immigration concepts in plain English",
    legal: "Client operations and legal notices"
  };
  return labels[page.family] || "Immigration guidance";
}

function addHeroSignal(signals, signal) {
  if (!signal || !signal.label) return;
  if (!signals.some((item) => item.label === signal.label)) {
    signals.push(signal);
  }
}

function heroPageSpecificSignal(page) {
  if (page.route === "/") return { icon: "places", label: "Brazil-Wide Guidance" };
  if (page.sectionStyle === "services-home") return { icon: "route", label: "Visa Residency Citizenship" };
  if (page.sectionStyle === "service-hub") return { icon: "route", label: `${page.title} Pathways` };
  if (page.sectionStyle === "service-child") return { icon: "route", label: `${page.title} Review` };
  if (page.sectionStyle === "process") return { icon: "route", label: `${page.title} Stage Review` };
  if (page.sectionStyle === "payment") return { icon: "payment", label: `Clear ${page.title} Rules` };
  if (page.sectionStyle === "form") return { icon: "form", label: "Structured Intake" };
  if (page.sectionStyle === "emergency") return { icon: "alert", label: "Urgency Reviewed First" };
  if (page.sectionStyle === "brazil" || page.sectionStyle === "brazil-search") {
    return { icon: "places", label: `${page.title} Planning Lens` };
  }
  if (page.sectionStyle === "about") return { icon: "shield", label: `${page.title} Practice Info` };
  if (page.sectionStyle === "insight") return { icon: "book", label: `${page.title} Explained Clearly` };
  if (page.sectionStyle === "legal") return { icon: "scales", label: `Clear ${page.title} Rules` };
  return null;
}

function heroThemeSignal(profile, seed) {
  switch (profile.theme) {
    case "route":
      return { icon: "route", label: pickVariant(seed, ["Route Fit Checked", "Eligibility Before Filing", "Legal Basis Review"]) };
    case "work":
      return { icon: "scan", label: pickVariant(seed, ["Activity-Route Match", "Sponsor File Review", "Work Authorization Logic"]) };
    case "family":
      return { icon: "responsibilities", label: pickVariant(seed, ["Family Tie Evidence", "Relationship Record Review", "Family Route Support"]) };
    case "education":
      return { icon: "book", label: pickVariant(seed, ["Academic Purpose Review", "Study Route Planning", "Institution Record Check"]) };
    case "citizenship":
      return { icon: "shield", label: pickVariant(seed, ["Residence History Review", "Naturalization Route Check", "Citizenship Eligibility Review"]) };
    case "defense":
      return { icon: "alert", label: pickVariant(seed, ["Response Deadline Review", "Rights Protection Focus", "Defense File Strategy"]) };
    case "documents":
      return { icon: "document", label: pickVariant(seed, ["Document Quality Review", "File Consistency Check", "Record Set Prepared"]) };
    case "timing":
      return { icon: "route", label: pickVariant(seed, ["Deadline Sensitivity", "Sequence Before Submission", "Timing Reviewed Early"]) };
    case "authority":
      return { icon: "responsibilities", label: pickVariant(seed, ["Authority-Specific Prep", "Correct Filing Channel", "Consular and PF Logic"]) };
    case "compliance":
      return { icon: "responsibilities", label: pickVariant(seed, ["Compliance-First Planning", "Post-Approval Duties", "Status Maintenance Focus"]) };
    case "consultation":
      return { icon: "form", label: pickVariant(seed, ["Structured First Review", "Document-Based Assessment", "Fact-Based Intake"]) };
    case "policy":
      return { icon: "shield", label: pickVariant(seed, ["Consent and Privacy Clarity", "Operational Rules Clear", "Privacy Protected"]) };
    case "contact":
      return { icon: "whatsapp", label: pickVariant(seed, ["Clear First Summary", "Fast Contact Logic", "Facts Before Messaging"]) };
    case "location":
      return { icon: "places", label: pickVariant(seed, ["Regional Cost Comparison", "State-Specific Planning", "Relocation Reality Check"]) };
    case "institutional":
      return { icon: "shield", label: pickVariant(seed, ["Professional Boundaries", "Public Record Verified", "Practice Standards Clear"]) };
    case "outcome":
      return { icon: "scales", label: pickVariant(seed, ["No False Guarantees", "Authority-Led Decisions", "Realistic Case Framing"]) };
    case "search":
      return { icon: "search", label: pickVariant(seed, ["Find the Right Route", "Search by Real Question", "Navigation Without Guesswork"]) };
    default:
      return { icon: "scan", label: pickVariant(seed, ["Risk Minimization Focus", "Clear Step-by-Step Guidance", "Practical Next-Step Planning"]) };
  }
}

function heroSignalItems(page) {
  const signals = [];
  const add = (icon, label) => addHeroSignal(signals, { icon, label });

  if (page.route === "/") {
    add("shield", "Licensed Brazilian Attorney");
    add("scales", "OAB Registered Lawyer");
    add("spark", "Bilingual Support");
    add("document", "Compliance-First Planning");
  } else if (page.sectionStyle === "consultation") {
    add("form", "Structured First Review");
    add("scan", "Manual Confirmation");
    add("spark", "Bilingual Consultations");
    add("shield", "No False Guarantees");
  } else if (page.sectionStyle === "payment") {
    add("payment", "Transparent Fees Explained");
    add("scan", "Proof Before Scheduling");
    add("route", "36-Hour Timing Rule");
    add("shield", "Privacy Protected");
  } else if (page.sectionStyle === "form") {
    add("form", "Structured Intake");
    add("document", "Facts First");
    add("shield", "Privacy Protected");
    add("scan", "Manual Review");
  } else if (page.sectionStyle === "emergency") {
    add("alert", "Urgency Reviewed First");
    add("responsibilities", "Rights Protection Focus");
    add("whatsapp", "WhatsApp Triage");
    add("shield", "No False Guarantees");
  } else if (page.family === "services") {
    add("scales", "OAB Registered Lawyer");
    add("scan", "Compliance-First Approach");
  } else if (page.family === "process") {
    add("route", "Clear Step-by-Step Guidance");
    add("document", "Deadline and File Review");
  } else if (page.family === "brazil") {
    add("places", "State-Specific Planning");
    add("scan", "Relocation Reality Check");
  } else if (page.family === "about") {
    add("scales", "Brazilian Bar Member");
    add("spark", "English and Portuguese");
    add("quote", "Practice Active Since 2018");
  } else if (page.family === "insights") {
    add("book", "Plain-English Explanations");
    add("document", "Official-Source Orientation");
  } else if (page.family === "legal") {
    add("shield", "Privacy Protected");
    add("scales", "Clear Operational Rules");
  } else {
    add("shield", "Licensed Brazilian Attorney");
    add("spark", "Bilingual Support");
  }

  addHeroSignal(signals, heroPageSpecificSignal(page));

  const seenThemes = new Set();
  for (const topic of page.topics.slice(0, 5)) {
    const profile = topicProfile(topic);
    if (seenThemes.has(profile.theme)) continue;
    seenThemes.add(profile.theme);
    addHeroSignal(signals, heroThemeSignal(profile, `${page.key}:${profile.theme}:hero`));
    if (signals.length >= 5) break;
  }

  const fallbacks = [
    { icon: "document", label: "Document-Based Planning" },
    { icon: "scales", label: "Authority-Led Decisions" },
    { icon: "scan", label: "Risk Minimization Focus" }
  ];
  for (const fallback of fallbacks) {
    addHeroSignal(signals, fallback);
    if (signals.length >= 5) break;
  }

  return signals.slice(0, 5);
}

function heroProofList(page) {
  return heroSignalItems(page).slice(0, 3);
}

function heroPanelItems(page) {
  const signals = heroSignalItems(page);
  const panelItems = signals.slice(3, 5);
  return panelItems.length ? panelItems : signals.slice(1, 3);
}

function heroGlanceItems(page) {
  if (page.route === "/") {
    return [
      ["Professional basis", `Licensed Brazilian attorney, ${LAWYER_FACTS.oab}.`],
      ["Language support", `Consultations and client communication in ${LAWYER_FACTS.languages.join(" and ")}.`],
      ["Working method", "Compliance-first route analysis, document review, and realistic next-step planning."]
    ];
  }

  if (page.sectionStyle === "consultation") {
    return [
      ["Professional basis", `Licensed Brazilian attorney, ${LAWYER_FACTS.oab}.`],
      ["What to send", "Your objective, current status, available documents, and any deadline already in view."],
      ["What to expect", "A structured first review, bilingual support, and no promise of filing or approval."]
    ];
  }

  const base = {
    foundation: [
      ["Client profile", "People planning a move, a filing, or regularization in Brazil."],
      ["Operating model", "Consultation-led, document-based, and handled remotely across Brazil."],
      ["Decision framework", "The focus is on preparation, clarity, and lawful next steps."]
    ],
    services: [
      ["Service mode", "Route analysis, records review, and preparation before filing or authority contact."],
      [
        "Best use",
        page.pageType === "service-child"
          ? "Best when one immigration objective is already in view and needs careful checking."
          : "Best when comparing related pathways before committing to one route."
      ],
      ["Coverage", "Remote client support for matters linked to Brazil immigration and relocation."]
    ],
    process: [
      ["Main focus", "What this stage usually changes in timing, documents, and next-step decisions."],
      ["Best use", "Useful when deadlines, obligations, or document gaps need to be clarified."],
      ["Outcome model", "A clearer file and a better next step, not a promised result."]
    ],
    brazil: [
      ["Reading lens", "Cost, infrastructure, public services, and migration planning read together."],
      ["Best use", "Useful before choosing a city, a region, or a longer-term move strategy."],
      ["Coverage", "National perspective with regional nuance and official references."]
    ],
    about: [
      ["Professional basis", `Brazilian attorney, ${LAWYER_FACTS.oab}.`],
      ["Languages", `${LAWYER_FACTS.languages.join(" and ")} support for international clients.`],
      ["Practice focus", "Immigration guidance with public materials that also reference civil, family, and human-rights matters."]
    ],
    insights: [
      ["Reading lens", "Editorial clarification before a route or filing decision is made."],
      ["Best use", "For readers who need terminology, structure, and context before consulting."],
      ["Use case", "Read first, then move into service pages or intake when needed."]
    ],
    legal: [
      ["Reading lens", "Privacy, payment, consent, access, and contact rules in plain English."],
      ["Best use", "For visitors checking how contact, payment, or intake actually works."],
      ["Use case", "Reference material tied directly to client handling and operational rules."]
    ]
  };
  return base[page.family] || base.foundation;
}

function heroDisplayTitle(page) {
  if (page.route === "/") return "Brazil Immigration Guidance";
  if (page.route === "/services/") return "Brazil Immigration Services";
  if (page.route === "/start-consultation/") return "Request a Consultation";
  return page.title;
}

function heroDisplaySummary(page) {
  if (page.route === "/") {
    return `Visa, residency, citizenship, and relocation guidance in Brazil, led by a licensed Brazilian attorney and OAB-registered lawyer with ${LAWYER_FACTS.languages.join(" and ")} support.`;
  }
  if (page.sectionStyle === "services-home") {
    return "An overview of the main immigration service lines, with clear scope and next-step orientation.";
  }
  if (page.sectionStyle === "service-child" || page.sectionStyle === "service-hub") {
    return "What this route or service usually involves, what clients should prepare, and where the authority keeps the final decision.";
  }
  if (page.sectionStyle === "process") {
    return "What this stage usually means in practice, what often causes delay, and what should be checked next.";
  }
  if (page.sectionStyle === "consultation") {
    return "How to send the first summary of your matter, pay correctly, and move into a structured first review.";
  }
  if (page.sectionStyle === "payment") {
    return "Accepted payment methods, proof instructions, and the manual confirmation workflow for consultations.";
  }
  if (page.sectionStyle === "form") {
    return "A structured intake form for sending the first facts, documents, and route questions.";
  }
  if (page.sectionStyle === "emergency") {
    return "How urgent matters should be raised and when the competent authority should be contacted first.";
  }
  if (page.family === "brazil") {
    return "Relocation guidance that treats Brazil as a set of real regions, costs, and public systems rather than a single generic destination.";
  }
  if (page.family === "about") {
    return `Institutional information about the practice, its standards, public professional record, and how it communicates with prospective clients in ${LAWYER_FACTS.languages.join(" and ")}.`;
  }
  if (page.family === "legal") {
    return "Practical rules on privacy, payment, contact, consent, and access.";
  }
  if (page.family === "insights") {
    return "Plain-English explanations of Brazil immigration concepts before case-specific advice begins.";
  }
  return page.summary;
}

function brandContextNote(page) {
  if (page.family === "services") {
    return "Route selection, record quality, filing sequence, and authority control are reviewed before the next legal step is recommended.";
  }
  if (page.family === "process") {
    return "The process is explained in sequence so timing, documents, compliance, and authority expectations can be understood together.";
  }
  if (page.family === "brazil") {
    return "Relocation planning is tied to legal context, regional variation, and the practical realities of living in Brazil.";
  }
  if (page.family === "legal") {
    return "Operational rules on privacy, payment, consent, and contact are written to be clear before a client proceeds.";
  }
  if (page.family === "insights") {
    return "Plain-English immigration explanations are provided so research can become a clearer and more informed next step.";
  }
  if (page.family === "about") {
    return "Professional identity, standards, and client communication are presented with the restraint expected of an OAB-registered practice.";
  }
  return "Private-client Brazil immigration guidance built around clarity, careful preparation, and realistic next-step planning.";
}

function renderHero(page, hero) {
  const primaryAction = heroPrimaryAction(page);
  const proofItems = heroProofList(page);
  const panelItems = heroPanelItems(page);
  const glanceItems = heroGlanceItems(page);
  const secondaryHref = page.utility ? "#main-content" : "#page-map";
  const secondaryLabel = page.utility ? "Skip to content" : "View sections";
  return `<header class="hero" style="--hero-image:url('${hero.path}')">
    <div class="hero-overlay"></div>
    <div class="container hero-inner">
      <div class="hero-copy">
        <div class="hero-copy__lead">
          <p class="eyebrow">${escapeHtml(page.family.toUpperCase())}</p>
          <p class="hero-kicker">${escapeHtml(heroCollectionLabel(page))}</p>
        </div>
        <h1>${escapeHtml(heroDisplayTitle(page))}</h1>
        <p class="hero-summary">${escapeHtml(heroDisplaySummary(page))}</p>
        <div class="hero-badges" aria-label="Page highlights">
          ${proofItems
            .map(
              (item) => `<span class="hero-badge"><span class="hero-badge__icon" aria-hidden="true">${uiIcon(
                item.icon
              )}</span><span>${escapeHtml(item.label)}</span></span>`
            )
            .join("")}
        </div>
        <div class="hero-actions">
          <a class="btn btn-cta" href="${primaryAction.href}" ${primaryAction.whatsapp ? 'data-whatsapp-click="true"' : 'data-cta-click="true"'}>${escapeHtml(primaryAction.label)}</a>
          <a class="btn btn-secondary" href="${secondaryHref}">${escapeHtml(secondaryLabel)}</a>
        </div>
      </div>
      <div class="hero-meta">
        <div class="hero-panel hero-panel--brand">
          ${renderBrandLockup({ className: "hero-brand-lockup", width: 272, height: 76, tone: "inverse" })}
          <p class="hero-brand-tagline">${escapeHtml(SITE.footerTagline)}</p>
          <p class="hero-brand-note">${escapeHtml(brandContextNote(page))}</p>
        </div>
        <div class="hero-panel hero-panel--signals">
          <strong>Positioning</strong>
          <ul class="hero-panel-list">
            ${panelItems
              .map(
                (item) => `<li class="hero-panel-item">
              <span class="hero-panel-item__icon" aria-hidden="true">${uiIcon(item.icon)}</span>
              <span>${escapeHtml(item.label)}</span>
            </li>`
              )
              .join("")}
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
            ${renderHeadingWithIcon("h2", "Overview", "book")}
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
    while (currentWords < WORD_COUNT_TARGET.min && extraIndex < 16) {
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
      <p class="utility-support">${renderBrandMark({
        className: "utility-support__mark",
        width: 18,
        height: 18,
        decorative: true
      })}<span>${escapeHtml(SITE.footerTagline)}</span></p>
      <div class="utility-actions">
        <div class="lang-switcher lang-switcher--minimal" aria-label="Language switcher">
          <button type="button" class="lang-link active" data-language-toggle="en">EN</button>
          <span aria-hidden="true">|</span>
          <button type="button" class="lang-link" data-language-toggle="pt-BR" ${PT_PRESENT ? "" : "disabled aria-disabled=\"true\""}>PT</button>
        </div>
        <button type="button" class="utility-action utility-action--text" data-open-accessibility="true" aria-controls="accessibility-panel" aria-expanded="false">Accessibility</button>
      </div>
    </div>
  </div>`;
}

function renderAccessibilityPanel() {
  return `<aside class="accessibility-panel" id="accessibility-panel" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="accessibility-title" tabindex="-1">
    <div class="accessibility-panel__inner">
      <div class="panel-header">
        <h2 id="accessibility-title">Accessibility</h2>
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
        <div class="scale-control">
          <span>Color mode</span>
          <div class="inline-actions inline-actions--choices" role="group" aria-label="Color mode">
            <button type="button" class="toggle-button toggle-button--choice" data-accessibility-action="theme" data-accessibility-value="light">Light</button>
            <button type="button" class="toggle-button toggle-button--choice" data-accessibility-action="theme" data-accessibility-value="dark">Dark</button>
            <button type="button" class="toggle-button toggle-button--choice" data-accessibility-action="theme" data-accessibility-value="system">Auto</button>
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
    places:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 1 7 7c0 4.8-5.2 10.7-7 13-1.8-2.3-7-8.2-7-13a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5Z" fill="currentColor"/></svg>',
    process:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h6v4H5V6Zm8 0h6v4h-6V6ZM5 14h6v4H5v-4Zm8 0h6v4h-6v-4Zm-1-3h2v2h-2z" fill="currentColor"/></svg>',
    responsibilities:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v5c0 4.6 3 7.9 8 10 5-2.1 8-5.4 8-10V7l-8-4Zm-1 12.6-3.3-3.3 1.4-1.4 1.9 1.9 4.2-4.2 1.4 1.4-5.6 5.6Z" fill="currentColor"/></svg>',
    aftercare:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-7-10.1C5 7.5 7.1 5 9.9 5c1.4 0 2.5.6 3.1 1.6C13.6 5.6 14.7 5 16.1 5 18.9 5 21 7.5 21 10.9 21 16.6 14 21 14 21h-2Zm-1-10V8H9v3H6v2h3v3h2v-3h3v-2h-3Z" fill="currentColor"/></svg>',
    insights:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-1 7h5l-6 13 1-8H7l6-12Z" fill="currentColor"/></svg>',
    legal:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 5 5v6c0 5 3 8.7 7 11 4-2.3 7-6 7-11V5l-7-3Zm0 3.1 4 1.7v4.3c0 3.5-1.8 6.2-4 8-2.2-1.8-4-4.5-4-8V6.8l4-1.7Z" fill="currentColor"/></svg>'
  };
  return icons[key] || "";
}

function renderFooterPanel(panel) {
  const heading = panel.logo
    ? `<h2 class="footer-brand-title">${renderBrandLockup({
        className: "footer-brand-lockup",
        width: 248,
        height: 69,
        tone: "inverse"
      })}</h2>`
    : `<h2>${panel.icon ? `<span class="footer-heading-icon" aria-hidden="true">${footerIcon(panel.icon)}</span>` : ""}<span>${escapeHtml(panel.title)}</span></h2>`;
  return `<section class="footer-panel footer-panel--${slugify(panel.title)}${panel.accent ? ` footer-panel--${panel.accent}` : ""}">
    <div class="footer-panel__head">
      ${heading}
      ${panel.tagline ? `<p class="footer-brand-tagline">${escapeHtml(panel.tagline)}</p>` : ""}
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
    About: "Profile, governance, standards, and practice information.",
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
          <p>${escapeHtml(descriptions[label] || "Explore the routes listed here.")}</p>
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
            <a class="brand-lockup" href="/" aria-label="Immigrate to Brazil home">
              ${renderBrandLockup({ className: "brand-lockup__image", width: 252, height: 70, tone: "inverse" })}
              <span class="brand-lockup__meta">
                <small>${escapeHtml(SITE.footerTagline)}</small>
              </span>
            </a>
          </div>
          <div class="main-header__center d-none d-xl-flex">
            <a class="main-header__home${page.route === "/" ? " is-active" : ""}" href="/">Home</a>
          </div>
          <div class="main-header__actions">
            ${renderHeaderConsultationCta("d-none d-xl-inline-flex")}
            <button class="navbar-toggler d-xl-none" type="button" data-bs-toggle="collapse" data-bs-target="#site-nav" aria-controls="site-nav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
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
  const placeLabels = new Set(["North", "Northeast", "Central-West", "Southeast", "South", "States", "Cities", "Directory", "Municipalities", "Search"]);
  const responsibilityLabels = new Set([
    "Responsibilities",
    "Rights",
    "Aftercare",
    "Renewal",
    "Permanent",
    "Naturalisation",
    "Compliance",
    "Conversion",
    "Regularization",
    "Planning"
  ]);
  const brazilCoreLinks = NAVIGATION.brazil.filter((item) => !placeLabels.has(item.label));
  const placeLinks = NAVIGATION.brazil.filter((item) => placeLabels.has(item.label));
  const processCoreLinks = NAVIGATION.process.filter((item) => !responsibilityLabels.has(item.label));
  const responsibilityLinks = NAVIGATION.process.filter((item) => responsibilityLabels.has(item.label));
  const panels = [
    {
      title: SITE.name,
      logo: true,
      tagline: SITE.footerTagline,
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
          links: brazilCoreLinks.map((item) => [item.route, item.label])
        }
      ]
    },
    {
      title: "Places",
      icon: "places",
      groups: [
        {
          links: placeLinks.map((item) => [item.route, item.label])
        }
      ]
    },
    {
      title: "Process",
      icon: "process",
      groups: [
        {
          links: processCoreLinks.map((item) => [item.route, item.label])
        }
      ]
    },
    {
      title: "Aftercare",
      icon: "aftercare",
      groups: [
        {
          links: responsibilityLinks.map((item) => [item.route, item.label])
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
      <p class="footer-copyright">${renderBrandMark({
        className: "footer-copyright__mark",
        width: 14,
        height: 14,
        decorative: true
      })}<span>${SITE.copyright}</span></p>
      <p>${SITE.notice}</p>
      <div class="footer-actions">
        <a class="footer-actions__cta" href="/start-consultation/" data-cta-click="true">Start Consultation</a>
      </div>
    </div>
    <div class="container footer-meta">
      <div class="footer-meta__links">
        <a href="/sitemap.xml">Sitemap</a>
        <span>–</span>
        <a href="/robots.txt">Robots</a>
      </div>
      <a class="footer-search-trigger footer-search-trigger--mini" href="/legal/search/" data-search-open="true">
        <span class="footer-search-trigger__icon" aria-hidden="true">${uiIcon("search")}</span>
        <span class="footer-search-trigger__hint">Search this site</span>
      </a>
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
    <span class="floating-whatsapp__avatar-wrap">
      <img src="/assets/images/whatsapp-agent-avatar.svg" alt="" width="52" height="52" />
      <span class="floating-whatsapp__badge" aria-hidden="true">${uiIcon("whatsapp")}</span>
    </span>
    <span class="floating-whatsapp__content">
      <small>Private client channel</small>
      <strong>Chat on WhatsApp</strong>
    </span>
  </a>`;
}

function renderBackToTop() {
  return `<button type="button" class="back-to-top" data-back-to-top="true" aria-label="Back to top">
    <span class="back-to-top__icon" aria-hidden="true">${uiIcon("up")}</span>
  </button>`;
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
      logo: BRAND_ASSETS.logoPng,
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
    foundation: "#52B788",
    services: "#2D6A4F",
    process: "#C7953C",
    brazil: "#40916C",
    about: "#6F4E8C",
    insights: "#CD6C28",
    legal: "#1B4332"
  };
  return colors[page.family] || "#2D6A4F";
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
        accessibility: {
          dyslexiaFont: DYSLEXIA_FONT_STACK,
          themeColors: { light: "#52B788", dark: "#081C15" }
        }
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
  await fs.writeFile(fullPath, content.replace(/[ \t]+$/gm, ""), "utf8");
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

function requiredBrandAssets() {
  return [
    path.join("assets", "logo", "immigrate-to-brazil-logo.svg"),
    path.join("assets", "logo", "immigrate-to-brazil-logo.png"),
    path.join("assets", "logo", "immigrate-to-brazil-logo-transparent.png"),
    path.join("assets", "logo", "immigrate-to-brazil-logo-with-background.png"),
    path.join("assets", "favicons", "favicon-16x16.png"),
    path.join("assets", "favicons", "favicon-32x32.png"),
    path.join("assets", "favicons", "favicon.png"),
    path.join("assets", "favicons", "apple-touch-icon.png"),
    path.join("assets", "favicons", "android-chrome-192x192.png"),
    path.join("assets", "favicons", "android-chrome-512x512.png"),
    path.join("assets", "favicons", "site.webmanifest")
  ];
}

function hasCommittedBrandAssets() {
  return requiredBrandAssets().every((relativePath) => existsSync(path.join(ROOT, relativePath)));
}

function ensureBrandAssets() {
  const brandRun = spawnSync("python3", [path.join("scripts", "generate_brand_assets.py")], {
    cwd: ROOT,
    stdio: "inherit"
  });

  if (brandRun.status === 0) return;

  if (hasCommittedBrandAssets()) {
    console.warn("Brand asset generation failed; using committed brand assets already present in the repository.");
    return;
  }

  ensureOk(false, "Brand asset generation failed and committed brand assets are missing");
}

async function main() {
  ensureOk(PAGES.length >= 150, `Expected at least 150 pages, found ${PAGES.length}`);
  const template = await fs.readFile(TEMPLATE_PATH, "utf8");
  const testimonials = JSON.parse(await fs.readFile(TESTIMONIALS_PATH, "utf8")).reviews;
  ensureBrandAssets();

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
