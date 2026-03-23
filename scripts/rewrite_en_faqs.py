#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROUTES_DIR = ROOT / "content" / "en" / "routes"

BUTTON_RE = re.compile(r'(<button class="accordion-button[^>]*>\s*)(.*?)(\s*</button>)', re.S)
BODY_RE = re.compile(r'(<div class="accordion-body">)(.*?)(</div>)', re.S)
INTRO_RE = re.compile(
    r'(<section class="faq-block".*?<div class="section-head">\s*<h2 class="section-title">.*?</h2>\s*<p>)(.*?)(</p>)',
    re.S,
)


def nice_title(title: str) -> str:
    return {"Gdpr": "GDPR", "Lgpd": "LGPD", "Faqs": "FAQs"}.get(title, title)


def lower_title(title: str) -> str:
    return nice_title(title).lower()


def service_hub_label(slug: str) -> str:
    return {
        "advisory": "advisory support",
        "defense": "defense and urgent-matter support",
        "naturalisation": "naturalisation and citizenship planning",
        "other": "supporting services",
        "residencies": "residency options",
        "visas": "visa options",
    }.get(slug, slug.replace("-", " "))


def brazil_topic(slug: str, title: str) -> str:
    return {
        "brazil": "planning a move to Brazil as a whole",
        "investment": "investment planning in Brazil",
        "economy": "economic planning for a move to Brazil",
        "quality": "quality of life in Brazil",
        "living": "everyday life in Brazil",
        "cost": "cost planning in Brazil",
        "housing": "housing decisions in Brazil",
        "healthcare": "healthcare planning in Brazil",
        "education": "education planning in Brazil",
        "safety": "safety planning in Brazil",
        "culture": "adapting to culture in Brazil",
        "festivals": "planning around festivals in Brazil",
        "cuisine": "food and daily life in Brazil",
        "events": "events and community life in Brazil",
        "guides": "using Brazil guidance well",
        "faqs": "common Brazil planning questions",
        "places": "choosing where to live in Brazil",
        "north": "the North region of Brazil",
        "northeast": "the Northeast region of Brazil",
        "central-west": "the Central-West region of Brazil",
        "southeast": "the Southeast region of Brazil",
        "south": "the South region of Brazil",
        "states": "choosing a state in Brazil",
        "cities": "choosing a city in Brazil",
        "directory": "finding trusted local resources in Brazil",
        "municipalities": "local bureaucracy in Brazil",
        "search": "finding the right Brazil information",
    }.get(slug, f"{lower_title(title)} in Brazil")


def process_topic(slug: str, title: str) -> str:
    return {
        "consultation": "the consultation stage",
        "assessment": "assessment",
        "strategy": "strategy",
        "filing": "filing",
        "approval": "approval",
        "mistakes": "avoiding common mistakes",
        "failures": "recovering after setbacks",
        "deadlines": "deadline planning",
        "obligations": "ongoing obligations",
        "alone": "deciding whether to handle things alone",
        "transparency": "clear expectations and transparency",
        "fees": "pricing and scope discussions",
        "refund": "refund expectations",
        "timeline": "timeline planning",
        "aftercare": "aftercare",
        "responsibilities": "responsibilities",
        "rights": "rights questions",
        "renewal": "renewal planning",
        "permanent": "permanent residence planning",
        "naturalisation": "naturalisation planning",
        "compliance": "long-term compliance",
        "conversion": "status conversion",
        "regularization": "regularization",
        "planning": "long-term planning",
    }.get(slug, lower_title(title))


def insights_topic(slug: str, title: str) -> str:
    return {
        "general": "Brazil immigration in general",
        "visa": "visa planning",
        "residency": "residency planning",
        "naturalisation": "naturalisation planning",
        "process": "the immigration process",
        "blog": "practical Brazil guidance",
        "updates": "rule changes and updates",
        "guides": "detailed guidance",
    }.get(slug, lower_title(title))


def about_topic(slug: str, title: str) -> str:
    return {
        "about": "how Immigrate to Brazil works",
        "profile": "how Immigrate to Brazil supports clients",
        "mission": "the company mission",
        "philosophy": "the company approach",
        "story": "why Immigrate to Brazil exists",
        "values": "the company values",
        "whyus": "why clients choose Immigrate to Brazil",
        "results": "the kinds of outcomes clients work toward",
        "stories": "typical client situations",
        "clients": "who Immigrate to Brazil helps",
        "testimonials": "client feedback",
        "governance": "how support is organized",
        "compliance": "how support stays careful and compliant",
        "ethics": "ethical standards",
        "standards": "service standards",
        "regulatory": "how legal-provider boundaries work",
        "lawyer": "how legal support works through Immigrate to Brazil",
    }.get(slug, lower_title(title))


def legal_topic(slug: str, title: str) -> str:
    return {
        "payment": "payment and confirmation",
        "form": "the contact form",
        "emergency": "urgent situations",
        "search": "finding the right page",
        "privacy": "your information",
        "cookies": "site cookies",
        "terms": "site use and service boundaries",
        "refund": "refund rules",
        "gdpr": "GDPR rights",
        "lgpd": "LGPD rights",
        "accessibility": "site accessibility",
        "disclaimer": "the limits of general information",
    }.get(slug, lower_title(title))


def faq(q: str, a: str) -> dict[str, str]:
    return {"question": q, "answer": a}


def home_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "How do I know which Immigrate to Brazil service fits my situation?",
            "You do not need to know the exact route before you contact us. We help clients understand what they are trying to solve, what options may fit, and what the most useful next step should be.",
        ),
        faq(
            "What kinds of clients does Immigrate to Brazil usually help?",
            "We support international clients including remote workers, families, investors, retirees, students, skilled professionals, and people dealing with Brazil-related cross-border decisions.",
        ),
        faq(
            "Can I contact Immigrate to Brazil before I have everything figured out?",
            "Yes. Many clients get in touch at the stage where they are still comparing options, worrying about timing, or trying to avoid a costly wrong turn. Early clarity is often part of the value.",
        ),
        faq(
            "Does Immigrate to Brazil only help with legal questions?",
            "No. Some clients need legal guidance, while others need broader support with relocation planning, coordination, translation accuracy, or understanding how different parts of the move connect.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually. From there, the next step may be a consultation, a request for more context, or guidance on how to move forward more carefully based on your situation.",
        ),
    ]


def start_consultation_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Is a consultation the right first step if I am not sure which route fits me?",
            "Yes. Many people book a consultation because they need clarity before choosing a route, paying for the wrong service, or moving too quickly without understanding the bigger picture.",
        ),
        faq(
            "What can Immigrate to Brazil help me understand in a consultation?",
            "A consultation can help you understand which options may fit, what risks or timing issues matter most, what should happen first, and where more focused support may be needed afterward.",
        ),
        faq(
            "Do I need every document ready before I book?",
            "No. You do not need a perfect file before booking. What helps most is a clear summary of your situation, your main questions, and any key documents or timing details you already have.",
        ),
        faq(
            "How does booking and confirmation work?",
            "Consultation requests are reviewed manually. Payment, proof, and scheduling are handled in sequence, and a time is only treated as confirmed after manual confirmation in writing.",
        ),
        faq(
            "What happens after the consultation?",
            "After the consultation, the next step depends on your situation. That may mean moving into a clearer plan, preparing for a service, gathering more information, or deciding that a different direction makes more sense.",
        ),
    ]


def services_root_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "How do I know which Immigrate to Brazil service fits my situation?",
            "You do not need to arrive already knowing whether you need a visa, residency, naturalisation, defense, advisory, or supporting service. We help clients narrow that down more clearly.",
        ),
        faq(
            "Can I contact Immigrate to Brazil if I am still comparing options?",
            "Yes. Many clients reach out while they are still deciding which route, sequence, or type of support makes the most sense. That kind of early clarity is one of the main reasons people contact us.",
        ),
        faq(
            "Does Immigrate to Brazil help with both legal and practical coordination questions?",
            "Yes. Some matters are mainly legal. Others involve planning, timing, translation, relocation support, or understanding how several decisions affect each other. We help clients see the whole picture more clearly.",
        ),
        faq(
            "What kind of clients usually use Immigrate to Brazil services?",
            "We support international clients including remote workers, families, investors, retirees, students, skilled professionals, and people facing urgent or uncertain Brazil-related situations.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually, and the next step depends on what you are trying to solve. That may mean a consultation, a request for clarification, or guidance toward the most useful service path.",
        ),
    ]


def service_hub_faqs(label: str) -> list[dict[str, str]]:
    return [
        faq(
            f"Can Immigrate to Brazil help me understand which {label} option fits my situation?",
            f"Yes. The first step is usually to understand your goals, timing, and current position so the right direction becomes clearer before you commit to a path in {label}.",
        ),
        faq(
            f"What kind of support does Immigrate to Brazil provide for {label} matters?",
            f"We help clients understand options, reduce confusion, prepare next steps, and coordinate the right kind of support around {label} in a calmer and more organized way.",
        ),
        faq(
            f"What happens after I contact Immigrate to Brazil about {label} support?",
            f"Your enquiry is reviewed manually. From there, the next step may be clarifying details, recommending a consultation, or guiding you toward the most useful action based on your situation and the {label} issue you are facing.",
        ),
    ]


def service_detail_topic(parent: str, title: str) -> str:
    lower = lower_title(title)
    if parent in {"visas", "residencies", "naturalisation"}:
        return lower
    if parent == "advisory":
        return f"{lower} support"
    if parent == "defense":
        return lower
    if parent == "other":
        return f"{lower} support"
    return lower


def service_detail_faqs(parent: str, title: str) -> list[dict[str, str]]:
    topic = service_detail_topic(parent, title)
    if parent in {"visas", "residencies", "naturalisation"}:
        return [
            faq(
                f"Can Immigrate to Brazil help me decide whether {topic} fits my situation?",
                f"Yes. Many clients reach out before they know whether {topic} is the right route. We help clarify fit, timing, risk, and what should be reviewed before you move forward.",
            ),
            faq(
                f"Do I need everything ready before contacting Immigrate to Brazil about {topic}?",
                "No. You do not need a perfect file before making contact. Often the first value is understanding what matters most, what can wait, and what kind of support will actually help.",
            ),
            faq(
                f"How does Immigrate to Brazil support clients with {topic}?",
                f"We help clients understand options, prepare next steps, reduce avoidable mistakes, and coordinate the right support around {topic} in clear English and practical terms.",
            ),
            faq(
                f"Can Immigrate to Brazil help if I am comparing {topic} with other options?",
                f"Yes. Good guidance often means comparing {topic} with other possible directions so you do not build the process around the wrong assumption.",
            ),
            faq(
                f"What happens after I contact Immigrate to Brazil about {topic}?",
                f"Your enquiry is reviewed manually, and the next step depends on your situation. That may mean a consultation, a request for more context, or guidance on the safest next move around {topic}.",
            ),
        ]
    if parent == "advisory":
        return [
            faq(
                f"Can Immigrate to Brazil help me understand whether I need {topic}?",
                f"Yes. Many clients contact us because they know something needs attention but are not yet sure what level of {topic} makes sense. We help clarify that before the wrong step is taken.",
            ),
            faq(
                f"What kind of clients usually contact Immigrate to Brazil about {topic}?",
                f"Clients usually reach out about {topic} when they want clearer direction, better timing, and calmer support before a problem becomes more complicated.",
            ),
            faq(
                f"Do I need everything ready before I ask for {topic}?",
                "No. Early contact is often useful precisely because the client still needs help identifying priorities, understanding risk, and deciding what should happen first.",
            ),
            faq(
                f"What does Immigrate to Brazil actually do in a {topic} matter?",
                f"We help clients understand the situation, reduce confusion, prepare next steps, and coordinate the kind of support that makes {topic} more manageable in practice.",
            ),
            faq(
                f"What happens after I contact Immigrate to Brazil about {topic}?",
                f"Your enquiry is reviewed manually. The next step may be a consultation, a request for more detail, or guidance on the most useful way to approach {topic}.",
            ),
        ]
    if parent == "defense":
        return [
            faq(
                f"Can Immigrate to Brazil help if I am dealing with {topic}?",
                f"Yes. Clients often reach out in {topic} situations because they need calm, clear direction before urgency or confusion makes the situation harder to manage.",
            ),
            faq(
                f"Should I contact Immigrate to Brazil early even if the {topic} situation still feels unclear?",
                "Yes. Early guidance can help you understand urgency, reduce avoidable mistakes, and decide what information or support matters first.",
            ),
            faq(
                f"What kind of support does Immigrate to Brazil provide in {topic} matters?",
                f"We help clients bring order to the situation, understand the real priority, and move toward a safer next step with clearer communication and better coordination.",
            ),
            faq(
                f"Can Immigrate to Brazil help me understand timing and next steps in a {topic} situation?",
                f"Yes. In stressful situations, one of the main forms of support is turning confusion into a clear sequence so you can see what needs attention now and what should happen next.",
            ),
            faq(
                f"What happens after I contact Immigrate to Brazil about {topic}?",
                f"Your enquiry is reviewed manually, and the next step depends on urgency, timing, and what you are dealing with. That may mean consultation, follow-up questions, or direction toward the most useful immediate action.",
            ),
        ]
    return [
        faq(
            f"Can Immigrate to Brazil help me understand whether I need {topic}?",
            f"Yes. Many clients contact us before they know exactly what type of {topic} support they need. We help clarify whether it matters now and how it connects to the wider process.",
        ),
        faq(
            f"How does Immigrate to Brazil help with {topic} in practice?",
            f"We help clients understand the issue, reduce confusion, prepare next steps, and keep supporting tasks like {topic} from creating bigger problems later.",
        ),
        faq(
            f"Do I need everything ready before I contact you about {topic}?",
            "No. Early contact is often useful because it helps clients understand what is urgent, what can wait, and what type of support will actually help.",
        ),
        faq(
            f"Can {topic} affect bigger immigration or relocation decisions?",
            f"Yes. Supporting issues like {topic} often affect timing, readiness, and how smoothly a larger immigration or relocation plan can move forward.",
        ),
        faq(
            f"What happens after I contact Immigrate to Brazil about {topic}?",
            f"Your enquiry is reviewed manually, and the next step may be clarification, consultation, or guidance on how {topic} should be handled within the bigger picture of your move.",
        ),
    ]


def about_default_faqs(topic: str) -> list[dict[str, str]]:
    return [
        faq(
            f"What does this page show about {topic}?",
            f"This page is meant to help you understand how Immigrate to Brazil approaches {topic}, what kind of support philosophy sits behind it, and why that matters for clients who want clearer guidance.",
        ),
        faq(
            "Can I contact Immigrate to Brazil even if I am still unsure what I need?",
            "Yes. Many clients reach out while they are still trying to understand their situation, compare options, or decide what kind of support makes the most sense.",
        ),
        faq(
            "Does this page replace case-specific guidance?",
            "No. These pages help you understand how we work and what we value, but real next steps still depend on your facts, timing, and goals.",
        ),
        faq(
            "What kind of clients is this usually relevant for?",
            "It is usually relevant for international clients who want clear English communication, practical support, and a more trustworthy way to approach Brazil-related decisions.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually, and the next step depends on your situation. That may mean consultation, clarification, or guidance on what should happen first.",
        ),
    ]


def about_clients_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Who does Immigrate to Brazil usually help?",
            "We support international clients including remote workers, families, investors, retirees, students, skilled professionals, and people dealing with Brazil-related cross-border decisions.",
        ),
        faq(
            "Can Immigrate to Brazil help me even if I do not know which route fits me yet?",
            "Yes. Many clients contact us because they are still trying to understand which route or type of support fits their situation. That early clarity is often one of the most valuable parts of the process.",
        ),
        faq(
            "Do you only help with one type of client?",
            "No. We work with a range of client profiles, and the support is shaped around the real situation rather than forcing everyone into one template.",
        ),
        faq(
            "What if my situation does not fit neatly into one category?",
            "That is common. Many real cases overlap across family, work, business, timing, and relocation questions. We help clients see the bigger picture instead of treating each piece in isolation.",
        ),
        faq(
            "What happens after I contact Immigrate to Brazil?",
            "Your enquiry is reviewed manually, and the next step depends on what you are trying to solve. That may mean a consultation, a clarification request, or guidance on the safest next move.",
        ),
    ]


def about_whyus_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Why do clients choose Immigrate to Brazil instead of handling everything alone?",
            "Clients usually choose us because they want clearer guidance, better sequencing, and support that feels careful and human rather than confusing or generic.",
        ),
        faq(
            "What makes Immigrate to Brazil different from a general information site?",
            "We do more than explain topics. We help clients connect those topics to their real situation, reduce wrong turns, and move toward a practical next step.",
        ),
        faq(
            "Will Immigrate to Brazil tell me honestly if I need a different route or a deeper review?",
            "Yes. Good support includes saying when a different direction, timing, or level of help may be better than the one you first had in mind.",
        ),
        faq(
            "Can Immigrate to Brazil help with both legal and practical coordination questions?",
            "Yes. Many clients need help with legal direction, timing, translation, relocation planning, and understanding how several decisions affect each other.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually. The next step may be a consultation, a request for more context, or guidance toward the most useful action based on your situation.",
        ),
    ]


def about_stories_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What does Immigrate to Brazil actually help with?",
            "We help international clients understand their options, make better decisions, and move forward with clearer support around immigration, relocation, and practical next steps connected to life in Brazil.",
        ),
        faq(
            "Do I need to know exactly which route fits me before I contact you?",
            "No. Many clients contact us because they are not sure which route makes sense. Part of the value is helping you understand what fits your situation and what should be reviewed first.",
        ),
        faq(
            "Can you help me if I am still outside Brazil?",
            "Yes. Many clients contact us while planning from abroad, while others are already in Brazil and need help understanding what comes next. Support can be useful at both stages.",
        ),
        faq(
            "Do you only help with legal matters?",
            "No. Some clients need legal guidance, while others need broader support with relocation planning, coordination, translation accuracy, or understanding how several parts of the move connect.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually, and the next step depends on your situation. That may be a consultation, a clarification request, or guidance on what should happen first.",
        ),
    ]


def about_testimonials_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What do these testimonials show about Immigrate to Brazil?",
            "They show the kinds of things clients value most: clarity, responsiveness, honest guidance, and support that makes the process feel more manageable.",
        ),
        faq(
            "Do the testimonials guarantee the same result for me?",
            "No. Every situation depends on its own facts, timing, and formal review. Testimonials show the client experience, not a promise of identical outcomes.",
        ),
        faq(
            "Can I still contact Immigrate to Brazil if my situation is different from the examples I have read?",
            "Yes. Most real cases are not identical. The point is to understand how we support clients, then apply that support to your own circumstances.",
        ),
        faq(
            "What matters most before I decide whether to work with Immigrate to Brazil?",
            "What matters most is whether you want clear English communication, careful support, realistic guidance, and a calmer way to approach Brazil-related decisions.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually, and the next step depends on what you are trying to solve. That may mean consultation, clarification, or guidance toward the most useful action.",
        ),
    ]


def about_results_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What kind of results can Immigrate to Brazil help clients work toward?",
            "We help clients work toward clearer decisions, better preparation, less confusion, and a safer path through immigration and relocation questions. Good results often start with better direction.",
        ),
        faq(
            "Does Immigrate to Brazil guarantee approvals or outcomes?",
            "No. No responsible service should guarantee outcomes that depend on authorities, formal review, or facts that still need to be assessed.",
        ),
        faq(
            "What does a strong result usually look like for a client?",
            "Often it means fewer wrong turns, better timing, better preparation, clearer expectations, and more confidence about what should happen next.",
        ),
        faq(
            "Can Immigrate to Brazil help even if I feel behind or confused right now?",
            "Yes. Many clients reach out because they feel uncertain or overloaded. One of the main goals is to create order and clarity before the situation becomes more difficult.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually, and the next step depends on your situation. That may mean consultation, clarification, or guidance on the safest next move.",
        ),
    ]


def about_lawyer_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "How does legal support work through Immigrate to Brazil?",
            "When legal guidance is needed, support is coordinated through the company so clients can understand what kind of help is required and how the next step should be approached.",
        ),
        faq(
            "Can I contact Immigrate to Brazil even if I am not sure whether I need legal support yet?",
            "Yes. Many clients contact us before they know whether the issue needs legal guidance, broader coordination support, or a clearer first review.",
        ),
        faq(
            "Can I receive support in clear English?",
            "Yes. Clear English communication is one of the main reasons international clients contact Immigrate to Brazil, especially when they want to understand Brazilian systems without confusion.",
        ),
        faq(
            "Does this page mean every matter starts with the same kind of legal service?",
            "No. The right level of support depends on the facts, timing, and what you are actually trying to solve. Good guidance starts by clarifying that first.",
        ),
        faq(
            "What happens after I send an enquiry?",
            "Your enquiry is reviewed manually, and the next step may be consultation, clarification, or guidance toward the most appropriate type of support for your situation.",
        ),
    ]


def about_page_faqs(slug: str, title: str) -> list[dict[str, str]]:
    if slug == "clients":
        return about_clients_faqs()
    if slug == "whyus":
        return about_whyus_faqs()
    if slug == "stories":
        return about_stories_faqs()
    if slug == "testimonials":
        return about_testimonials_faqs()
    if slug == "results":
        return about_results_faqs()
    if slug == "lawyer":
        return about_lawyer_faqs()
    return about_default_faqs(about_topic(slug, title))


def brazil_faqs(slug: str, title: str) -> list[dict[str, str]]:
    topic = brazil_topic(slug, title)
    return [
        faq(
            f"Can Immigrate to Brazil help me use this information for {topic}?",
            f"Yes. These pages are meant to help you think more clearly about {topic}, and we can help connect that thinking to immigration, relocation, and next-step planning.",
        ),
        faq(
            f"Do I need to decide everything about {topic} before I contact Immigrate to Brazil?",
            "No. Many clients reach out while they are still comparing options. Part of the support is helping you narrow decisions down more safely and with better context.",
        ),
        faq(
            f"Can Immigrate to Brazil help with both immigration and practical relocation questions related to {topic}?",
            "Yes. Many real moves involve both. We help clients think about how legal steps, timing, and day-to-day planning affect each other.",
        ),
        faq(
            f"What kind of clients usually need help with {topic}?",
            f"Remote workers, families, investors, retirees, students, and professionals often need help connecting {topic} to a real move rather than treating it as abstract research.",
        ),
        faq(
            "What happens after I contact Immigrate to Brazil?",
            "Your enquiry is reviewed manually, and the next step depends on what you are trying to decide. That may mean clarification, consultation, or guidance toward the most useful next action.",
        ),
    ]


def process_faqs(slug: str, title: str) -> list[dict[str, str]]:
    topic = process_topic(slug, title)
    return [
        faq(
            f"How can Immigrate to Brazil help at {topic}?",
            f"We help clients understand what {topic} means in practice, what usually goes wrong, and what kind of support makes the next decision clearer.",
        ),
        faq(
            f"Do I need everything ready before getting help with {topic}?",
            "No. Many clients reach out because they are unsure what belongs now and what belongs later. Early guidance often prevents wasted time and wrong turns.",
        ),
        faq(
            f"Can Immigrate to Brazil help if something has already gone wrong around {topic}?",
            "Yes. We can help bring order to a situation, clarify the real priority, and guide you toward the safest next step based on what is happening now.",
        ),
        faq(
            f"What does good support usually change at {topic}?",
            "It usually creates clearer sequencing, better expectations, and less avoidable stress. The value is not just more information, but better direction.",
        ),
        faq(
            "What happens after I contact Immigrate to Brazil?",
            f"Your enquiry is reviewed manually, and the next step may be a consultation, a request for more context, or guidance on how to move forward more carefully with {topic}.",
        ),
    ]


def insights_faqs(slug: str, title: str, count: int) -> list[dict[str, str]]:
    topic = insights_topic(slug, title)
    items = [
        faq(
            f"Can Immigrate to Brazil help me apply {topic} to my own situation?",
            f"Yes. These pages give general orientation, but we can help connect {topic} to your actual plans, risks, timing, and next steps.",
        ),
        faq(
            f"Do I need a consultation if I am still only researching {topic}?",
            f"Not always. But if {topic} is affecting a real decision, a consultation can help you stop guessing and understand what actually matters in your case.",
        ),
        faq(
            f"Can Immigrate to Brazil help me compare {topic} with other options?",
            "Yes. Many clients are not choosing between one obvious path and no path; they are choosing between several possibilities. We help make that comparison clearer.",
        ),
        faq(
            "What happens after I contact Immigrate to Brazil?",
            f"Your enquiry is reviewed manually and the next step depends on what you are trying to decide. That may mean clarification, consultation, or guidance on what to review first around {topic}.",
        ),
        faq(
            "Will Immigrate to Brazil tell me honestly if this is not the right direction?",
            "Yes. Part of good guidance is saying when a different route, timing, or strategy may be better than the one you first had in mind.",
        ),
    ]
    return items[:count]


def legal_payment_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Which payment methods does Immigrate to Brazil accept?",
            "Consultations and agreed services may be paid through PIX, PayPal, Payoneer, Wise, direct bank transfer, Bitcoin, or USDT. Some methods require current written details before payment is sent.",
        ),
        faq(
            "When does Immigrate to Brazil treat a consultation as confirmed?",
            "A consultation is only confirmed after payment has been verified, matched to the enquiry, and confirmed manually in writing. Payment alone is not treated as a confirmed booking.",
        ),
        faq(
            "What proof should I send after paying Immigrate to Brazil?",
            "Send a clear screenshot, receipt, or transfer record showing the amount, date, sender, and any reference that helps identify the payment. Clear proof allows faster confirmation.",
        ),
        faq(
            "Can I arrange bank transfer, Bitcoin, or USDT with Immigrate to Brazil?",
            "Yes, but those methods should be arranged first. Use only current written details shared directly for your payment, not outdated screenshots or forwarded wallet information.",
        ),
        faq(
            "What should I do if my timing is urgent?",
            "Contact the team before paying if your timing is urgent. The 36-hour scheduling rule still applies, and it is better to confirm what is realistic before sending funds.",
        ),
    ]


def legal_form_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What should I include when I contact Immigrate to Brazil through the form?",
            "Share the clearest short summary you can: what you are trying to solve, what is urgent, and any timing or background details that matter most.",
        ),
        faq(
            "Do I need to know my exact route before I submit the form?",
            "No. Many clients use the form because they are still trying to understand what route or type of support fits their situation.",
        ),
        faq(
            "Can I use the form if my matter is urgent?",
            "Yes, but if the situation is genuinely urgent, it is best to make that clear in the message and use the emergency contact path where appropriate.",
        ),
        faq(
            "What happens after the form is submitted?",
            "Your submission is reviewed manually, and the next step depends on your situation. That may mean clarification, consultation, or guidance toward the most useful action.",
        ),
        faq(
            "Can I contact Immigrate to Brazil another way if needed?",
            "Yes. Email and WhatsApp may also be used where appropriate, especially if you need to follow up, clarify something quickly, or ask about urgency.",
        ),
    ]


def legal_emergency_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What kinds of situations should be sent through the emergency route?",
            "Use the emergency route for situations where delay may create a bigger problem and you need a faster first review of what should happen next.",
        ),
        faq(
            "What should I send first if my situation is urgent?",
            "Start with a short clear summary of what is happening, why the matter feels urgent, and any immediate date, notice, or event that makes timing important.",
        ),
        faq(
            "Can Immigrate to Brazil help if I do not have every detail yet?",
            "Yes. In urgent matters, the first step is often understanding the immediate priority before everything is perfectly organized.",
        ),
        faq(
            "Does emergency contact guarantee immediate representation or an outcome?",
            "No. Emergency contact is a faster way to begin the first review of the situation. It does not guarantee a specific result or bypass the need for proper assessment.",
        ),
        faq(
            "What happens after the team receives an emergency message?",
            "The message is reviewed manually, and the next step depends on the urgency, timing, and type of support that appears to be needed.",
        ),
    ]


def legal_search_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What if I am not sure which page or service fits my situation?",
            "That is common. Use search to narrow things down, but contact the team if you still feel uncertain about which route or type of support is the right one.",
        ),
        faq(
            "Can Immigrate to Brazil still help if I cannot find the right page?",
            "Yes. The site is there to guide you, not to force you to solve everything alone. If search is not giving you a clear answer, that is a good reason to contact us.",
        ),
        faq(
            "Should I contact the team instead of continuing to search?",
            "If the issue is already affecting a real decision, timing, or concern, direct contact is often more useful than staying in research mode for too long.",
        ),
        faq(
            "Can Immigrate to Brazil help me narrow down the right route after I search?",
            "Yes. Search can help you find likely topics, but we can help you connect those topics to your actual situation and next step.",
        ),
        faq(
            "What happens after I send an enquiry from the search page?",
            "Your enquiry is reviewed manually, and the next step may be clarification, consultation, or direction toward the page or service path that best fits your situation.",
        ),
    ]


def legal_privacy_faqs(topic_label: str) -> list[dict[str, str]]:
    return [
        faq(
            f"How does Immigrate to Brazil handle {topic_label} if I contact the team?",
            f"We handle {topic_label} with care, clear internal boundaries, and the aim of using only what is reasonably needed to review or support your enquiry.",
        ),
        faq(
            "What information do I usually need to share to get help?",
            "That depends on your situation. Usually, the first step is a short practical summary, not every possible document or detail all at once.",
        ),
        faq(
            "Can I ask questions before sending sensitive details?",
            "Yes. If you are unsure what to share first, contact the team and explain that you want to understand the safest way to proceed.",
        ),
        faq(
            "Does Immigrate to Brazil share my information automatically?",
            "No. Information is not treated casually. Any sharing should be tied to the service context and handled with clear purpose and care.",
        ),
        faq(
            f"How can I ask for clarification about {topic_label}?",
            "You can contact the team directly if you need more clarity about how your information is handled or what is appropriate to send at the current stage.",
        ),
    ]


def legal_cookies_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Does Immigrate to Brazil use cookies in a way I should know about before contacting the team?",
            "Yes. Cookie use should be transparent so you understand how the site works before deciding how you want to use it or contact the team.",
        ),
        faq(
            "Can I use the site without accepting every type of cookie?",
            "In most cases, yes. The aim is to keep site use as clear and respectful as possible while explaining what is essential and what may be optional.",
        ),
        faq(
            "Does cookie use affect how I contact or work with Immigrate to Brazil?",
            "Cookie settings mainly affect site behavior, not the core question of whether you can contact the team for guidance or support.",
        ),
        faq(
            "What if I want more clarity before using the site further?",
            "If anything about site behavior, privacy, or consent feels unclear, you can contact the team for clarification before proceeding.",
        ),
        faq(
            "Where can I ask questions about privacy or cookie use?",
            "You can contact the team directly if you want a clearer explanation of how cookie-related choices connect to site use and contact options.",
        ),
    ]


def legal_terms_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "What should I understand before using the site or contacting Immigrate to Brazil?",
            "You should understand that the site provides general information and contact pathways, while case-specific guidance depends on your actual facts and a proper review.",
        ),
        faq(
            "Does the website create a client relationship by itself?",
            "No. Reading the site or sending a first message does not by itself create a formal client relationship.",
        ),
        faq(
            "Can I rely on the site instead of case-specific guidance?",
            "The site is useful for orientation, but important decisions should be based on your actual situation rather than general public information alone.",
        ),
        faq(
            "How does Immigrate to Brazil handle third-party services or links?",
            "Third-party services or links may be relevant, but they do not replace direct guidance on your own situation or create control over outside services.",
        ),
        faq(
            "What should I do if I need clarification before using a service?",
            "Contact the team directly. It is better to clarify expectations early than to proceed on the basis of guesswork.",
        ),
    ]


def legal_refund_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "When should I ask about refund rules?",
            "You should ask before proceeding if anything about payment boundaries, cancellation, or service stages feels unclear.",
        ),
        faq(
            "Does Immigrate to Brazil explain payment boundaries before work begins?",
            "That is the goal. Clients should understand how payment and refund boundaries work before they commit, not only after a problem arises.",
        ),
        faq(
            "Can I ask questions about refund terms before paying?",
            "Yes. If you need clarity first, ask. Clear expectations are part of a safer and more professional service relationship.",
        ),
        faq(
            "How are refund requests handled?",
            "Requests are handled through a review of the specific payment and service stage involved, rather than through assumptions or informal promises.",
        ),
        faq(
            "Where should I contact the team about a refund or payment concern?",
            "Use the contact details provided for the site or the relevant payment-related page so the issue can be reviewed properly.",
        ),
    ]


def legal_accessibility_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Can I contact Immigrate to Brazil if I need help accessing the site?",
            "Yes. If a page, form, or feature is making access difficult, you can contact the team directly and explain the barrier.",
        ),
        faq(
            "What if an accessibility issue makes it harder to use a page or form?",
            "Let the team know. The goal is to make it easier for you to continue, not to leave you blocked by the site itself.",
        ),
        faq(
            "Can I still reach the team another way?",
            "Yes. If one route is difficult, other contact methods may still be available for practical follow-up.",
        ),
        faq(
            "Does Immigrate to Brazil want feedback on accessibility barriers?",
            "Yes. Accessibility feedback is useful because it helps identify what should be improved for real users.",
        ),
        faq(
            "What happens after I report an accessibility issue?",
            "The issue can be reviewed, and the team can respond with the most practical next step or an alternative way to keep the process moving.",
        ),
    ]


def legal_disclaimer_faqs() -> list[dict[str, str]]:
    return [
        faq(
            "Does the information on this site replace case-specific guidance from Immigrate to Brazil?",
            "No. The site is meant to guide and inform, but real decisions should still be based on your specific facts, timing, and proper review.",
        ),
        faq(
            "When should I contact the team instead of relying on general information?",
            "You should contact the team when the topic affects a real decision, deadline, payment, family plan, business step, or anything else where guesswork could create a problem.",
        ),
        faq(
            "Does reading the site create a client relationship?",
            "No. Public information and a first enquiry do not by themselves create a formal client relationship.",
        ),
        faq(
            "Can Immigrate to Brazil guarantee results or outcomes?",
            "No. No responsible service should promise outcomes that depend on authorities, formal review, or facts that still need assessment.",
        ),
        faq(
            "What should I do if I need guidance for my own situation?",
            "Contact the team directly so your situation can be reviewed in context and the next step can be based on your actual needs.",
        ),
    ]


def legal_default_faqs(topic: str) -> list[dict[str, str]]:
    return [
        faq(
            f"How does Immigrate to Brazil handle {topic}?",
            f"The aim is to handle {topic} clearly, carefully, and in a way that helps clients understand what matters before they proceed.",
        ),
        faq(
            f"What should I know about {topic} before using the site or contacting the team?",
            f"You should understand how {topic} affects the way you use the site, share information, or move forward with support.",
        ),
        faq(
            "Can I ask questions before proceeding?",
            "Yes. If anything about the page or the process feels unclear, it is better to ask before moving forward than to rely on assumptions.",
        ),
        faq(
            "Does this page change how support is provided in my case?",
            "It helps explain the boundaries and operating approach, but the support you receive still depends on your situation and the next step that is appropriate for you.",
        ),
        faq(
            "What if I still need clarification?",
            "Contact the team directly. If the issue matters to your decision, it is worth clarifying in plain language before you proceed.",
        ),
    ]


def legal_page_faqs(slug: str, title: str) -> list[dict[str, str]]:
    if slug == "payment":
        return legal_payment_faqs()
    if slug == "form":
        return legal_form_faqs()
    if slug == "emergency":
        return legal_emergency_faqs()
    if slug == "search":
        return legal_search_faqs()
    if slug in {"privacy", "gdpr", "lgpd"}:
        return legal_privacy_faqs(legal_topic(slug, title))
    if slug == "cookies":
        return legal_cookies_faqs()
    if slug == "terms":
        return legal_terms_faqs()
    if slug == "refund":
        return legal_refund_faqs()
    if slug == "accessibility":
        return legal_accessibility_faqs()
    if slug == "disclaimer":
        return legal_disclaimer_faqs()
    return legal_default_faqs(legal_topic(slug, title))


def faq_intro(route: str, family: str, title: str) -> str:
    if family == "legal":
        return "Short answers about how Immigrate to Brazil handles this topic and what clients usually need to know before proceeding."
    if family == "about" and title in {"Why Us", "Clients", "Stories", "Results", "Testimonials"}:
        return "Short answers about how Immigrate to Brazil works, who we help, and how clients usually move forward."
    return "Short answers about how Immigrate to Brazil can help with this topic."


def build_faqs(route: str, title: str, family: str, count: int) -> list[dict[str, str]]:
    parts = [part for part in route.strip("/").split("/") if part]
    title = nice_title(title)

    if route == "/":
        return home_faqs()[:count]
    if route == "/start-consultation/":
        return start_consultation_faqs()[:count]
    if family == "services":
        if route == "/services/":
            return services_root_faqs()[:count]
        if len(parts) == 2:
            return service_hub_faqs(service_hub_label(parts[1]))[:count]
        if len(parts) >= 3:
            return service_detail_faqs(parts[1], title)[:count]
    if family == "about" and len(parts) >= 2:
        return about_page_faqs(parts[1], title)[:count]
    if family == "brazil" and len(parts) >= 2:
        return brazil_faqs(parts[1], title)[:count]
    if family == "process" and len(parts) >= 2:
        return process_faqs(parts[1], title)[:count]
    if family == "insights" and len(parts) >= 2:
        return insights_faqs(parts[1], title, count)
    if family == "legal" and len(parts) >= 2:
        return legal_page_faqs(parts[1], title)[:count]
    return home_faqs()[:count]


def rewrite_body(body_path: Path, faqs: list[dict[str, str]], intro_text: str) -> bool:
    text = body_path.read_text()
    button_matches = list(BUTTON_RE.finditer(text))
    body_matches = list(BODY_RE.finditer(text))
    if not button_matches or not body_matches:
        return False
    if len(button_matches) != len(faqs) or len(body_matches) != len(faqs):
        raise ValueError(f"FAQ count mismatch in {body_path}: buttons={len(button_matches)}, bodies={len(body_matches)}, faqs={len(faqs)}")

    if INTRO_RE.search(text):
        text = INTRO_RE.sub(
            lambda m: f"{m.group(1)}{html.escape(intro_text, quote=False)}{m.group(3)}",
            text,
            count=1,
        )

    questions = iter(f["question"] for f in faqs)
    text = BUTTON_RE.sub(
        lambda m: f"{m.group(1)}{html.escape(next(questions), quote=False)}{m.group(3)}",
        text,
        count=len(faqs),
    )
    answers = iter(f["answer"] for f in faqs)
    text = BODY_RE.sub(
        lambda m: f"{m.group(1)}{html.escape(next(answers), quote=False)}{m.group(3)}",
        text,
        count=len(faqs),
    )

    body_path.write_text(text)
    return True


def rewrite_page_json(page_json_path: Path, faqs: list[dict[str, str]]) -> bool:
    data = json.loads(page_json_path.read_text())
    changed = False
    for schema in data.get("schemas", []):
        if schema.get("@type") == "FAQPage":
            schema["mainEntity"] = [
                {
                    "@type": "Question",
                    "name": item["question"],
                    "acceptedAnswer": {"@type": "Answer", "text": item["answer"]},
                }
                for item in faqs
            ]
            changed = True
    if changed:
        page_json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    return changed


def main() -> None:
    updated = 0
    for page_json_path in sorted(ROUTES_DIR.rglob("page.json")):
        data = json.loads(page_json_path.read_text())
        faq_schema = next((schema for schema in data.get("schemas", []) if schema.get("@type") == "FAQPage"), None)
        if not faq_schema:
            continue

        route = data.get("route", "")
        title = data.get("runtime", {}).get("pageTitle", "")
        family = data.get("runtime", {}).get("pageFamily", "")
        count = len(faq_schema.get("mainEntity", []))
        faqs = build_faqs(route, title, family, count)
        intro_text = faq_intro(route, family, nice_title(title))
        body_path = page_json_path.with_name("body.html")

        changed_body = rewrite_body(body_path, faqs, intro_text)
        changed_json = rewrite_page_json(page_json_path, faqs)
        if changed_body or changed_json:
            updated += 1

    print(f"Rewrote FAQs for {updated} English route sources.")


if __name__ == "__main__":
    main()
