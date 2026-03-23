#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ABOUT_DIR = ROOT / "content" / "en" / "routes" / "about"

HEADER_RE = re.compile(r"<header class=\"hero\".*?</header>", re.S)
INTRO_RE = re.compile(r"<section class=\"content-block intro-block\">.*?</section>", re.S)
PROFILE_RE = re.compile(r"<section class=\"content-block profile-block\">.*?</section>", re.S)
TOPIC_RE = re.compile(
    r"<section class=\"(?P<class>[^\"]*topic-section[^\"]*)\" id=\"(?P<id>topic-[^\"]+)\"(?: data-topic=\"[^\"]*\")?>.*?</section>",
    re.S,
)
SUPP_RE = re.compile(
    r"<section class=\"(?P<class>[^\"]*supplemental[^\"]*topic-section[^\"]*)\" id=\"(?P<id>expansion-\d+)\"(?: data-topic=\"[^\"]*\")?>.*?</section>",
    re.S,
)
FORM_INTRO_RE = re.compile(
    r"(<section class=\"lead-form-block\".*?<div class=\"section-head\">\s*<h2 class=\"section-title\">.*?</h2>\s*<p>)(.*?)(</p>)",
    re.S,
)
TESTIMONIAL_STRIP_RE = re.compile(r"<section class=\"content-block testimonial-strip\">.*?</section>", re.S)
TESTIMONIAL_TITLE_RE = re.compile(r"(<h2 class=\"section-title\">.*?<span>)(.*?)(</span></h2>)", re.S)
TESTIMONIAL_NOTE_RE = re.compile(r"(<p class=\"small-note\">)(.*?)(</p>)", re.S)

KICKER_RE = re.compile(r"(<p class=\"hero-kicker\">)(.*?)(</p>)", re.S)
SUMMARY_RE = re.compile(r"(<p class=\"hero-summary\">)(.*?)(</p>)", re.S)
BRAND_NOTE_RE = re.compile(r"(<p class=\"hero-brand-note\">)(.*?)(</p>)", re.S)
BADGE_TEXT_RE = re.compile(r"(<span class=\"hero-badge\">.*?</svg></span><span>)(.*?)(</span></span>)", re.S)
PANEL_ITEM_RE = re.compile(r"(<span class=\"hero-panel-item__icon\".*?</svg></span>\s*<span>)(.*?)(</span>)", re.S)
GLANCE_LABEL_RE = re.compile(r"(<article class=\"hero-glance-card\">\s*<span>)(.*?)(</span>)", re.S)
GLANCE_TEXT_RE = re.compile(r"(<article class=\"hero-glance-card\">\s*<span>.*?</span>\s*<strong>)(.*?)(</strong>)", re.S)

INTRO_ICON = """<span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5a2.5 2.5 0 0 0-2.5-2.5H5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5V15h10.5c.53 0 1.04.13 1.5.36V4H7.5Zm-2.5 15h12.5c1.38 0 2.5 1.12 2.5 2.5H7.5A2.5 2.5 0 0 1 5 19Z" fill="currentColor"/></svg></span>"""
TOPIC_ICON = """<span class="section-title__icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 5 5v6c0 5 3 8.7 7 11 4-2.3 7-6 7-11V5l-7-3Zm0 3.2 4 1.7v4.2c0 3.4-1.8 6-4 7.8-2.2-1.8-4-4.4-4-7.8V6.9l4-1.7Z" fill="currentColor"/></svg></span>"""


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def sec(title: str, kicker: str, strap: str, p1: str, p2: str, why: str, keep: str) -> dict[str, str]:
    return {
        "title": title,
        "kicker": kicker,
        "strap": strap,
        "p1": p1,
        "p2": p2,
        "why": why,
        "keep": keep,
    }


def hero(kicker: str, summary: str, glances: list[tuple[str, str]], brand_note: str) -> dict[str, object]:
    return {
        "kicker": kicker,
        "summary": summary,
        "badges": ["Clear English support", "Careful guidance", "Practical next steps"],
        "signals": ["Human-first support", "Clients need clear direction"],
        "glances": glances,
        "brand_note": brand_note,
    }


EXP_A = sec(
    "How we communicate",
    "How communication feels",
    "Clear English, direct answers, and steady guidance.",
    "Clients should not have to decode vague language or guess what a provider really means. We communicate in plain English so people understand where they stand, what still needs review, and what the next useful step should be.",
    "Good communication is part of the service itself. When the process is explained clearly, clients can make better decisions and feel more confident about moving forward.",
    "Clear communication reduces confusion.",
    "You should leave each step understanding what happens next.",
)
EXP_B = sec(
    "How support stays clear",
    "How the process stays steady",
    "Clear scope creates a calmer client experience.",
    "Support works best when the client understands what is being reviewed now, what belongs later, and what still needs deeper analysis. Clear scope protects the process from false assumptions and wasted effort.",
    "That clarity also makes it easier to work together. Everyone knows what the current stage is for, what support is being provided, and what the next decision depends on.",
    "Clarity protects both trust and timing.",
    "A better process starts with a clear scope.",
)
EXP_C = sec(
    "What trust looks like in practice",
    "How confidence is built",
    "Trust is built through consistency, not slogans.",
    "Clients usually trust a service when communication is steady, boundaries are clear, and the guidance feels realistic rather than exaggerated. That is especially important in immigration and relocation matters, where the cost of a wrong assumption can be high.",
    "Trust is also built by helping clients feel more oriented after contact than before it. The goal is not simply to sound professional. The goal is to be useful, careful, and dependable.",
    "Trust grows from clarity and consistency.",
    "Clients need to feel safer, not more uncertain, after contact.",
)
EXP_D = sec(
    "How clients assess fit",
    "Why people move forward",
    "Most people contact us when they are tired of guessing.",
    "Clients usually decide to move forward when they understand that the real problem is no longer lack of information. It is lack of direction. They need someone to help them narrow the issue, compare options properly, and avoid acting in the wrong order.",
    "That is where support becomes valuable. A better next step often matters more than having ten more pages of general information.",
    "Direction matters more than volume.",
    "A clear next step is usually worth more than more research.",
)
EXP_E = sec(
    "Why boundaries build trust",
    "How responsible guidance works",
    "Good support does not pretend every question has an instant answer.",
    "Careful boundaries protect clients from false confidence. They make it clear what can be said at a general level, what still depends on review, and when more focused support is needed before a decision is made.",
    "That approach is reassuring because it is honest. Clients deserve support that is careful enough to separate general guidance from case-specific conclusions.",
    "Boundaries protect the quality of the guidance.",
    "Honest limits are part of trustworthy service.",
)
EXP_F = sec(
    "How we coordinate support",
    "How the moving parts connect",
    "Many Brazil-related matters involve more than one moving part.",
    "A client may be dealing with immigration questions, timing concerns, family planning, translation issues, business decisions, or practical relocation steps at the same time. We help connect those pieces so the process feels more coherent.",
    "That coordination reduces the risk of treating each issue in isolation and missing how one decision affects another.",
    "Connected decisions need connected support.",
    "The goal is to reduce fragmentation and wrong turns.",
)
EXP_G = sec(
    "What happens after first contact",
    "What follows the first message",
    "The first message should lead to clarity, not more guesswork.",
    "After an enquiry is received, the goal is to understand what the client is actually trying to solve, how urgent the matter is, and what kind of next step will be most useful. Sometimes that means consultation first. Sometimes it means narrowing the question before anything else.",
    "The important point is that the first reply should move the client closer to a workable path, not leave them with another vague answer.",
    "First contact should create direction.",
    "A good first step should reduce uncertainty.",
)
EXP_H = sec(
    "How decisions are guided",
    "How we reduce wrong turns",
    "Better decisions usually come from better sequencing.",
    "Many client problems come from acting too early, spending money in the wrong order, or relying on the wrong source. We guide decisions by focusing on what matters now, what can wait, and what needs to be reviewed before commitment.",
    "This helps clients move more carefully and avoid building the process on assumptions that later become expensive to fix.",
    "Good sequencing reduces avoidable mistakes.",
    "The order of action matters.",
)
EXP_I = sec(
    "What clients should expect",
    "What the experience should feel like",
    "Clients should know what kind of experience they are stepping into.",
    "Clients should expect clear language, realistic guidance, practical next steps, and support that respects how important these decisions often are. The process should feel steady, understandable, and careful.",
    "They should also expect honesty about limits, timing, and the difference between general guidance and what still needs proper review.",
    "Expectation-setting is part of good service.",
    "Clear expectations make the whole process stronger.",
)


PAGES: dict[str, dict[str, object]] = {
    "clients": {
        "hero": hero(
            "Who we help",
            "We help international clients who want clear answers, trusted support, and a calmer way to handle immigration, relocation, and life changes connected to Brazil.",
            [
                ("Who this page is for", "People trying to understand whether their situation matches the kinds of clients we usually support."),
                ("What clients need", "Clarity, realistic next steps, and support that connects immigration with real-life decisions."),
                ("Best next move", "If your situation sounds familiar, contact us before making decisions in the wrong order."),
            ],
            "This page is here to help you see whether your situation sounds like the kind of support Immigrate to Brazil is built to provide.",
        ),
        "intro": {
            "lead": "Not every client is trying to solve the same problem.",
            "p1": "Some clients are planning a move. Some are protecting family life. Some are building a business, changing status, or trying to regularize a difficult situation. This page is here to help you see whether your case sounds like the kind of support we provide.",
            "p2": "What our clients usually have in common is not one route label. It is the need for clear guidance, practical next steps, and a service they can actually understand and trust.",
        },
        "topics": [
            sec("Client Categories", "Who we serve", "The people who usually contact Immigrate to Brazil.", "Our clients include digital nomads, remote professionals, families, investors, business owners, retirees, students, skilled workers, and people facing Brazil-related cross-border questions. Some are planning early. Others already feel pressure from timing, uncertainty, or a difficult situation.", "What they are looking for is not just general information. They want to understand where they stand, what type of support makes sense, and how to move forward without wasting time or trusting the wrong person.", "Different profiles bring different risks and goals.", "The right support starts with your real situation, not a generic category."),
            sec("Individuals", "Solo clients and independent movers", "Support for people planning a move on their own.", "Many clients are moving to Brazil as individuals. They may be remote workers, freelancers, students, early-stage planners, or people changing life direction. Their first challenge is often not paperwork. It is figuring out which questions matter before money and timing start pulling them in the wrong direction.", "We help individual clients slow the process down where needed, compare options more carefully, and build a clearer path based on their goals, timing, and practical reality.", "Independent clients often carry every decision alone.", "Early clarity can prevent expensive wrong turns later."),
            sec("Families", "Family life and cross-border decisions", "Support when relationships, timing, and stability all matter at once.", "Family-related situations often involve more than one legal or practical question at the same time. Clients may be trying to live together in Brazil, understand how family relationships affect immigration planning, coordinate documents across countries, or move forward after a major family change.", "We help families approach these situations with more structure and less panic. The goal is to create a clearer sequence, reduce confusion, and support decisions that protect stability rather than add more pressure.", "Family matters need calm coordination.", "The safest family decisions are usually the clearest ones."),
            sec("Companies", "Business clients and professional moves", "Support for investors, founders, employers, and corporate-linked clients.", "Some clients come to us because Brazil is part of a business decision. That may involve investment, company activity, work-related relocation, executive planning, or a move where business goals and immigration questions affect each other.", "These clients usually need support that is organized, realistic, and commercially aware. We help bring order to the moving parts so business decisions, immigration planning, and practical next steps support each other instead of competing with each other.", "Business timing and immigration timing often overlap.", "A strong plan connects legal and practical goals."),
            sec("Geographic Scope", "From abroad and from within Brazil", "We support people at different stages of the move.", "Some clients contact us long before they arrive in Brazil. Others are already here and need help understanding what comes next, what has become urgent, or how to recover from confusion or delay.", "The support needs are different in each case, but the goal is the same: help the client understand their current position, reduce guesswork, and move toward the most useful next step.", "Where you are in the process changes what matters most.", "Good support starts with your present reality, not a generic timeline."),
            sec("Typical Needs", "What clients are usually trying to solve", "The questions people usually bring before they contact us.", "Typical client needs include understanding the right route, knowing whether timing is becoming urgent, preparing for consultation, deciding whether a situation needs legal review, coordinating translations or records, and reducing the risk of paying the wrong provider at the wrong stage.", "In many cases, the client is also trying to understand how several issues connect: immigration, business, family, relocation, and everyday practical life. That is exactly where clear guidance becomes valuable.", "Most clients are solving more than one question at once.", "The goal is not more noise. The goal is a workable next step."),
        ],
        "supplements": [
            EXP_A,
            EXP_B,
            EXP_C,
            EXP_D,
            EXP_E,
            sec("What international clients usually worry about", "Common concerns", "The most common fear is making the wrong move too early.", "Clients often worry about choosing the wrong route, trusting the wrong source, missing timing, or spending money in the wrong order. These fears are normal, especially when advice online is inconsistent or incomplete.", "Part of our role is to reduce that pressure by helping clients separate what is urgent from what is simply noisy, and by giving them a clearer path through the uncertainty.", "Naming the real worry helps reduce it.", "The right support should make the situation feel more manageable."),
            EXP_G,
            sec("How we reduce wrong turns", "How better decisions are made", "A better process usually starts with fewer assumptions.", "We help clients compare options properly, question advice that sounds too easy, and avoid acting on a route or plan that has not been tested against their real situation.", "That does not remove every challenge, but it can remove many avoidable mistakes that come from haste, confusion, or incomplete information.", "Avoidable mistakes usually start with avoidable assumptions.", "Good support often saves trouble before anything formal begins."),
            EXP_I,
        ],
        "form_intro": "Tell us who you are, what you are planning, and what still feels unclear. We review every enquiry manually and reply with the most useful next step.",
    },
    "compliance": {
        "hero": hero(
            "How we protect clarity, care, and proper boundaries",
            "Compliance is part of how we protect clients, handle information carefully, and keep support aligned with what each stage actually requires.",
            [
                ("What this covers", "How we handle boundaries, records, privacy, and service coordination responsibly."),
                ("Why it matters", "Clients need to know how support stays careful before they trust a provider with important decisions."),
                ("Best next step", "Use this page to understand how we work, then contact us if your situation needs a clearer review."),
            ],
            "This page explains the standards that help clients feel safer when they share information, ask questions, and move into more serious support.",
        ),
        "intro": {
            "lead": "Compliance is not a hidden internal detail. It is part of what makes support trustworthy.",
            "p1": "Clients need to know that a provider takes boundaries, privacy, communication, and record handling seriously. That matters even more in immigration and relocation matters, where confusion or carelessness can create bigger problems later.",
            "p2": "For us, compliance is not just about formal rules. It is also about how support is delivered: carefully, clearly, and in a way that protects the client from unnecessary risk or false confidence.",
        },
        "topics": [
            sec("Legal Compliance Framework", "How support stays aligned", "A careful service needs a clear framework.", "We work on the basis that support should stay aligned with the kind of matter the client is dealing with, the stage they are in, and the limits of what can responsibly be said before deeper review.", "That framework protects clients because it reduces improvised advice, blurred boundaries, and the pressure to sound certain before the facts are fully understood.", "A clear framework protects the quality of the guidance.", "Careful service starts with careful boundaries."),
            sec("Immigration Law Alignment", "Why immigration support must stay grounded", "Support should match the real structure of the matter.", "Clients often come with mixed information from online sources, informal advice, or assumptions borrowed from someone else's case. We take a different approach. Support should be grounded in the client's real goals, timing, and situation, not in generic internet confidence.", "That is why we focus on alignment before action. Clients need to understand whether a route, a timing choice, or a next step actually fits their case before they commit to it.", "Wrong assumptions create avoidable risk.", "Clarity comes before commitment."),
            sec("OAB Compliance", "Professional restraint and responsible communication", "Clients deserve a service that takes professional boundaries seriously.", "We do not believe trust is built by overselling, making promises, or speaking as if every answer is obvious before the facts are reviewed. Professional restraint is part of a trustworthy client experience.", "That means clients should expect careful language, realistic expectations, and support that respects the seriousness of immigration, family, business, and cross-border decisions.", "Responsible communication is part of professional safety.", "Reassurance should never depend on exaggeration."),
            sec("Data Protection (LGPD)", "How client information is treated", "Privacy matters from the first message onward.", "Clients often need to share sensitive context before they can get useful guidance. That is why information handling must be careful, limited to what is needed, and tied to a real service purpose rather than treated casually.", "Good privacy practice is not only technical. It is also relational. Clients should feel that their information is being handled with respect, restraint, and common sense at every stage.", "Trust includes knowing your information is treated carefully.", "Share what is needed, not everything at once."),
            sec("Documentation Control", "Accuracy protects the whole process", "Small inconsistencies often create bigger problems later.", "In immigration and relocation matters, names, dates, translations, records, and timing often need to line up across more than one context. Clients can feel overwhelmed by that, especially when documents come from different countries or systems.", "We take documentation control seriously because order and accuracy reduce avoidable friction. Good support helps the client understand what needs to stay consistent and why it matters.", "Accuracy strengthens trust and readiness.", "A strong process depends on a coherent file."),
        ],
        "supplements": [
            sec("How we communicate about risk and responsibility", "How we explain sensitive issues", "Clients should understand what matters before the risk becomes larger.", "We communicate about compliance in plain language so clients can understand which issues are small, which are sensitive, and which need timely attention. This helps reduce panic while still respecting the seriousness of the process.", "The point is not to frighten clients with rules. The point is to help them see what should be taken seriously and how better organization can protect them.", "Clear communication turns compliance into something usable.", "Clients need clarity, not alarm."),
            EXP_B,
            sec("What careful service looks like in practice", "How clients experience quality", "Carefulness should feel visible, not hidden.", "Clients should notice that support is organized, communication is measured, and the process is not being pushed forward with artificial certainty. Those small signs often tell you a great deal about whether the service can be trusted.", "In practice, careful service means fewer rushed assumptions, clearer follow-up, and better protection against avoidable errors.", "Care shows up in the way the work is handled.", "Good service should feel steady and controlled."),
            sec("How clients stay organized over time", "Looking beyond one step", "Compliance is often about continuity, not one moment.", "Some issues only become visible later, after the initial excitement of a move or approval has passed. That is why clients benefit from understanding how to keep their records, responsibilities, and next steps organized over time.", "We help clients think beyond the immediate question so they are less likely to be surprised by something that should have been tracked earlier.", "Long-term order protects short-term progress.", "What happens later can still affect what was achieved earlier."),
            EXP_E,
            sec("How support fits with legal-provider work", "How the support model stays clear", "Clients should understand how the pieces connect.", "Some matters require broader guidance and coordination. Others require more formal legal review. Clients are better protected when those roles are understood clearly instead of being blurred together in a way that creates confusion.", "Our approach is to make that distinction clearer so the client understands what kind of help is being provided and why.", "Clear roles reduce misunderstanding.", "Different levels of support should be easy to understand."),
            sec("What happens when something changes", "How the process adapts", "Changes are common, which is why careful follow-through matters.", "Clients sometimes contact us because something has changed: timing, family structure, work plans, records, urgency, or confidence in the route they first considered. A compliance-minded service needs to handle those changes without losing clarity.", "That means reassessing what matters now, what assumptions should be revisited, and what needs to be handled more carefully going forward.", "A change in facts can change the right next step.", "Good support adjusts when reality changes."),
            EXP_C,
            sec("How clients stay ahead instead of reacting", "The value of early clarity", "The strongest compliance habit is early clarity.", "Clients are usually safer when they understand the process early, keep important details visible, and ask for guidance before a small issue becomes a bigger one.", "A compliance-minded approach is not about fear. It is about helping people act sooner, more clearly, and with less guesswork.", "Prevention is often calmer than recovery.", "The best time to create order is before confusion grows."),
            EXP_I,
        ],
        "form_intro": "Use this form if you need clearer guidance on compliance, record handling, privacy, or a situation that feels more sensitive than it first appeared.",
    },
    "stories": {
        "hero": hero(
            "Real client situations",
            "These stories are illustrative examples based on common client situations. They show how support can help people move from confusion to a clearer next step.",
            [
                ("Who this helps", "People who want to know whether their situation sounds familiar and whether support could make the process safer and clearer."),
                ("What you will see", "Situation, action, result, and what the client learned from getting proper guidance."),
                ("Best next step", "If one of these stories sounds close to your situation, contact us before making avoidable decisions alone."),
            ],
            "Use these stories to recognize common patterns, not to compare yourself to a template. The next step should still be based on your actual situation.",
        ),
        "intro": {
            "lead": "Clients often arrive feeling overloaded, uncertain, or pulled in different directions by conflicting information.",
            "p1": "These stories are written to help you recognize common patterns in Brazil-related moves and decisions. Each one shows how the right kind of support can create clarity, reduce wrong turns, and make the next step easier to understand.",
            "p2": "They are not guarantees or direct testimonials. They are practical examples of the kinds of situations Immigrate to Brazil helps clients think through more carefully.",
        },
        "topics": [
            sec("General Case Scenarios", "Story 1", "A remote professional wanted to move to Brazil without building the plan on guesswork.", "He was earning from clients abroad and had already spent weeks reading conflicting explanations about visas, banking, taxes, and how to stay in Brazil longer-term. The more he read, the less certain he felt, and he was close to paying for services in the wrong order simply because he wanted to move quickly.", "Immigrate to Brazil helped him slow down, compare the options more realistically, and separate the real questions from the internet noise. The immediate result was not a rushed commitment, but a clearer plan and more confidence about what should happen first.", "A popular route is not always the right route.", "Good support helps you move in the right order."),
            sec("Immigration Pathway Examples", "Story 2", "A couple needed clarity on how to build family stability in Brazil.", "They were trying to understand family-related options, foreign records, timing, and how to reduce the risk of mistakes that could slow down their plans to live together in Brazil. What they had was information. What they did not have was confidence.", "Immigrate to Brazil helped turn the issue into a sequence instead of a cloud of worries. The couple understood what mattered first, what could wait, and what kind of support was actually needed. The result was a calmer and more workable family plan.", "Family situations need calm coordination.", "Clarity is often the first form of stability."),
            sec("Procedural Descriptions", "Story 3", "An investor wanted to avoid mixing business risk with immigration confusion.", "He was serious about Brazil and ready to commit time and money, but he was receiving mixed messages about company formation, immigration planning, property questions, and what needed to happen first. He did not want to build the move on the wrong assumptions.", "Immigrate to Brazil helped him approach the decision strategically. Instead of treating business setup, immigration planning, and relocation logistics as separate questions, he got a more coherent picture of how they affected each other and where to focus first.", "Business decisions and immigration decisions should support each other.", "A good plan connects the moving parts."),
            sec("Common Situations Observed", "Story 4", "A retiree wanted peace of mind, not bureaucratic stress.", "She wanted to understand whether life in Brazil could work comfortably and what kind of support would help her avoid getting lost in online opinions, practical uncertainty, and important details she might not realize were important.", "Immigrate to Brazil helped make the process feel more human and more manageable. Instead of being pushed toward fast decisions, she got clearer timing, clearer priorities, and more peace of mind about how to move forward carefully.", "Long-term moves need calm planning.", "Peace of mind usually comes from better structure."),
            sec("Informational Context", "Story 5", "A skilled worker needed clarity before timing became the real problem.", "A work-related opportunity was real, but the timing was tight and the situation involved employer questions, personal relocation concerns, and real fear that delay or bad assumptions could create a larger problem.", "Immigrate to Brazil helped bring order to the issue before urgency turned into disorganization. By clarifying the immediate question, the practical sequence, and where better support mattered most, the client moved forward with more control and less pressure.", "When timing is tight, clarity matters even more.", "The right first step can change the whole experience."),
        ],
        "supplements": [
            sec("What these stories have in common", "A shared pattern", "Different situations, same need for clarity.", "Each story begins in a different place, but the same pattern appears again and again: too much noise, too many assumptions, and no reliable sequence for what should happen next.", "The value of support is often not just technical guidance. It is helping the client feel more certain about what matters first.", "Pattern recognition reduces overwhelm.", "Clarity is often the first real result."),
            sec("Why people usually contact us", "The real reason contact happens", "Most people reach out when they are tired of guessing.", "Clients usually contact Immigrate to Brazil when they feel stuck between options, unsure which provider to trust, or worried about making an expensive mistake.", "At that point, the issue is rarely lack of information. It is lack of clarity.", "Support becomes valuable when uncertainty starts affecting real decisions.", "If the process is starting to feel noisy, it may be time to ask for help."),
            sec("What a consultation can change", "How clearer direction begins", "A good consultation improves the quality of the next decision.", "For many clients, consultation is the moment where scattered concerns start turning into a more realistic plan. The goal is not to hear more words. The goal is to leave with better direction.", "That change in direction often lowers stress because the client no longer feels forced to solve everything alone.", "A clearer next step changes the whole tone of the process.", "Better direction is often the first real relief."),
            sec("How support reduces risk", "What it protects clients from", "Support helps prevent avoidable mistakes.", "A client may still need patience and proper review, but support can reduce the risk of acting too early, paying the wrong provider, or building the move on a false assumption.", "That kind of protection matters even before anything formal is filed or submitted.", "Prevention is one of the strongest forms of support.", "The best correction is often the one you never need later."),
            EXP_E,
            sec("When family, work, and business overlap", "Why many real cases do not fit one label", "Many real cases do not fit one simple label.", "A client may be moving for work while also bringing family. Another may be investing while also thinking about long-term residence and everyday practical life. Real situations often cross more than one category.", "That is why support becomes more valuable when it treats the client's situation as one connected story rather than several unrelated topics.", "Connected problems need connected thinking.", "Your case may be more than one category, and that is normal."),
            EXP_G,
            sec("How support reduces stress", "Why understanding matters so much", "People handle difficult processes better when they understand them.", "What clients often remember most is not a technical explanation. It is the moment the process finally started making sense in real life terms.", "That is why plain English and direct communication should be part of the service, not just decoration around it.", "Understanding lowers stress.", "Clarity is one of the most reassuring parts of good service."),
            sec("What these stories should leave you feeling", "The purpose of the page", "Hopeful, but grounded.", "These stories should feel encouraging, but not because they promise neat outcomes. They should feel encouraging because they show how clearer guidance can change the quality of the next decision.", "That is the real point of the page: to help you recognize that better support can lead to calmer clients, stronger preparation, and safer next steps.", "Reassurance should still feel responsible.", "Hope and realism can exist together."),
            EXP_I,
        ],
        "form_intro": "If one of these situations sounds familiar, tell us what is happening and what you need help understanding first. We review each enquiry manually and guide you toward the most practical next step.",
    },
    "whyus": {
        "hero": hero(
            "Why clients choose us",
            "Clients choose Immigrate to Brazil when they want clear communication, careful guidance, and support that feels more human than generic.",
            [
                ("What this page explains", "Why clients choose our approach instead of continuing to guess or manage everything alone."),
                ("What matters most", "Clarity, trust, better sequencing, and support that feels calm instead of generic."),
                ("Best next move", "If you are deciding whether our style of support fits you, this page is designed to answer that directly."),
            ],
            "This page answers a simple question: why trust this company with something as important as a move to Brazil?",
        ),
        "intro": {
            "lead": "This page should answer a simple question: why trust us with something this important?",
            "p1": "Clients usually contact Immigrate to Brazil because they want a better way to approach Brazil-related decisions. They want support that feels clear, careful, and genuinely useful rather than broad, vague, or impersonal.",
            "p2": "What follows is not a list of slogans. It is an explanation of the choices that make the experience feel steadier and easier to trust.",
        },
        "topics": [
            sec("Structural Approach to Cases", "We start with the real situation", "Good support begins with the client, not the loudest route label.", "We do not believe in pushing people into the most popular visa, residency, or service category before understanding what they are actually trying to achieve. The starting point is always the client's real life: goals, timing, family context, business context, and what currently feels unclear or risky.", "That structural approach matters because it reduces guesswork and helps the support feel more personal, more relevant, and more responsible.", "The structure of the first conversation shapes the quality of everything after it.", "A strong process starts with the client's real situation."),
            sec("Organization of Procedures", "We bring order to moving parts", "Many matters feel difficult simply because they feel scattered.", "Brazil-related moves often involve timing, records, consultations, practical relocation decisions, translations, family planning, or business considerations all at once. Organizing those moving parts is part of what makes support useful.", "We focus on helping clients see what belongs first, what should wait, and how several decisions affect each other so the process feels more manageable.", "Order reduces overwhelm.", "A clearer sequence usually makes the next step easier to trust."),
            sec("Documentation Methodology", "Accuracy matters because small details often carry real risk", "Strong preparation is usually built on coherence.", "Names, dates, translations, relationships between documents, and timing all affect how stable a file feels. Clients often sense that documents matter, but they may not yet know how much clarity and consistency can shape the whole process.", "We take documentation methodology seriously because coherent records reduce avoidable friction and make the next decision easier to approach with confidence.", "Accuracy supports stability.", "Better document handling often prevents larger problems later."),
            sec("Communication Structure", "Clear English, clear next steps", "Support should be understandable, not impressive-looking and vague.", "Clients should not need to decode jargon or guess what a provider is really trying to say. We communicate in direct, careful English so people can understand what matters now, what still needs review, and what the most useful next step may be.", "That communication structure is part of the value of the service itself because it changes how confidently a client can act.", "Clear communication improves decisions.", "The explanation should feel usable in real life."),
            sec("Compliance Orientation", "We think beyond the first answer", "A good first step still needs to support what comes after it.", "Many providers focus only on the first route label or first milestone. We try to help clients think beyond that point so the process stays coherent over time and avoidable mistakes are less likely to appear later.", "That compliance orientation means helping clients understand the wider sequence, not only the immediate question.", "Longer-term thinking protects short-term progress.", "The best support often looks slightly ahead of the current problem."),
            sec("Scope Limitations", "We do not overpromise", "Responsible guidance stays honest about what it can and cannot say yet.", "No honest provider should pretend to control every outcome or to know every answer before the facts are properly reviewed. We would rather help clients make better decisions than give them false comfort through exaggerated claims.", "That limit is not a weakness. It is part of what makes the support more trustworthy and more useful when decisions become serious.", "Honest limits build stronger trust.", "Reassurance should still feel responsible."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I],
        "form_intro": "Use this form if you want clear direction, careful support, and a practical next step based on your real situation rather than guesswork.",
    },
    "ethics": {
        "hero": hero(
            "How trust is protected",
            "Ethics matters because clients need support they can trust with important life decisions, sensitive information, and real uncertainty.",
            [
                ("What matters most", "Clients should feel respected, informed, and safer after contact, not pressured or misled."),
                ("How ethics shows up", "In careful communication, honest limits, and support that treats people with seriousness and respect."),
                ("Best next move", "If trust matters to you as much as speed, this page explains the kind of service experience we aim to provide."),
            ],
            "This page explains the ethical principles behind the way we communicate, guide decisions, and protect the client experience.",
        ),
        "intro": {
            "lead": "Ethics should feel visible in the way a service behaves.",
            "p1": "People do not usually contact a provider thinking about ethics in abstract terms. They feel it through the way they are spoken to, the honesty of the answers, the care taken with their information, and the realism of the guidance they receive.",
            "p2": "For us, ethics means giving clients support that is careful, truthful, respectful, and grounded in what can actually be said responsibly.",
        },
        "topics": [
            sec("Ethical Principles", "The foundation of the service", "Support should be honest, careful, and respectful from the start.", "Our ethical approach begins with a simple principle: important decisions deserve careful guidance. Clients should not be pushed by hype, vague confidence, or answers that sound reassuring only because they ignore complexity.", "Instead, support should help people understand their situation more clearly and make decisions with better judgment, stronger boundaries, and more confidence in what is actually known.", "Ethical support protects clients from false confidence.", "Truthfulness matters more than sounding impressive."),
            sec("Professional Conduct", "How ethical service behaves in practice", "Professional conduct should feel calm, steady, and dependable.", "Clients should be able to expect responsible communication, careful follow-through, and a tone that respects how significant immigration and relocation decisions often are. Good conduct is not just politeness. It is part of how trust is maintained.", "It also means staying measured when a situation is stressful, urgent, or emotionally loaded. Professional conduct helps clients feel steadier because the service itself stays steady.", "Behavior shapes trust as much as technical knowledge.", "The service should feel calm even when the situation is not."),
            sec("Confidentiality Obligations", "How sensitive matters are treated", "Confidentiality is part of feeling safe enough to ask for help.", "Clients often need to discuss family, business, status, financial, or personal questions before they can get useful direction. That requires care. Information should be handled with restraint and with a clear purpose.", "A respectful service does not treat sensitive details casually. It understands that people often reach out at vulnerable moments and need to know they are being taken seriously.", "Care with information is part of care for the client.", "Sensitive matters should be treated with restraint and purpose."),
            sec("Conflict of Interest Handling", "Why independence matters", "Clients need confidence that the guidance is actually for them.", "Conflicts are not always dramatic. Sometimes they appear as blurred roles, divided loyalties, or incentives that do not serve the client's real interests. Ethical service means paying attention to those pressures instead of pretending they do not exist.", "Good conflict handling protects judgment. It helps ensure that advice, coordination, and next-step guidance remain aligned with what is best for the client rather than what is simply convenient.", "Clear judgment depends on clear loyalties.", "Clients deserve support that is guided by their real interests."),
            sec("Client Relationship Boundaries", "Why clear limits are part of trust", "Boundaries keep support honest and useful.", "Ethical relationships are clearer when the client understands what is being offered now, what still depends on review, and what should not be assumed from a first contact or a public page.", "Those boundaries may feel slower at first, but they are usually what protects the client from being misled by false certainty or the wrong expectations.", "Clear limits make the service safer.", "Boundaries are part of care, not a lack of care."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I, EXP_C],
        "form_intro": "Use this form if you want support that feels careful, direct, and trustworthy, and if you want to explain your situation before making assumptions about the next step.",
    },
    "governance": {
        "hero": hero(
            "How the company stays organized",
            "Governance is about how support stays accountable, coordinated, and clear for clients who need reliable help with Brazil-related decisions.",
            [
                ("What governance means here", "How the company organizes support so clients get clearer communication and more dependable follow-through."),
                ("Why clients care", "A well-run service reduces confusion, delays, and avoidable misunderstandings."),
                ("Best next move", "If you want to know how support is structured before you commit, this page is designed to answer that."),
            ],
            "This page explains how structure, oversight, and coordination help the client experience feel more dependable.",
        ),
        "intro": {
            "lead": "Good governance makes a human service feel dependable.",
            "p1": "Clients may not use the word governance when they first arrive, but they feel the difference immediately. Clear roles, clear decisions, and clear follow-through make a service easier to trust.",
            "p2": "For us, governance is not about sounding formal. It is about making sure support stays organized, accountable, and aligned with what the client actually needs.",
        },
        "topics": [
            sec("Organizational Structure", "How the company is set up to help", "Support works better when the structure is understandable.", "Immigrate to Brazil is designed as a human-first bridge for international clients who need a clearer way into Brazilian systems. That means support is organized around guidance, coordination, and helping clients reach the right kind of next step.", "A clear structure matters because clients should understand what kind of service they are entering, how different kinds of support fit together, and where real responsibility sits at each stage.", "Structure reduces uncertainty.", "Clients should be able to understand how the service is organized."),
            sec("Roles and Responsibilities", "Why clear roles protect the process", "People feel safer when responsibilities are not blurred.", "Clients need to know who is helping them, what kind of help is being provided, and how different roles connect. Clear responsibilities reduce duplication, confusion, and the risk of assumptions filling the gaps.", "That clarity also helps the client know where to bring questions, what kind of answer to expect, and how the support around them is being coordinated.", "Clear roles reduce friction.", "Responsibility should never feel vague to the client."),
            sec("Decision-Making Process", "How next steps are chosen", "Good decisions should be grounded in the client's real situation.", "We do not believe in forcing clients into a pre-written path. A better process starts by understanding the facts, goals, timing, and practical reality of the matter before the next step is chosen.", "That decision-making approach matters because it helps avoid generic answers and makes the support feel more personal, more careful, and more useful.", "Better decisions start with better context.", "The next step should fit the client, not a template."),
            sec("Oversight Mechanisms", "How quality is protected", "Dependable service needs internal checks, not just good intentions.", "Oversight means paying attention to consistency, clarity, and whether support is actually being delivered in the careful way clients were promised. It is one of the reasons a service feels stable instead of improvised.", "From the client's point of view, this usually shows up as steadier communication, clearer expectations, and fewer avoidable disconnects between what was said and what happens next.", "Consistency protects trust.", "A strong service should not depend on improvisation alone."),
            sec("Administrative Coordination", "How practical support holds the process together", "Many client experiences improve or fail on coordination.", "Administrative coordination matters because clients often need help keeping information, timelines, follow-up, and practical details connected. Without it, even a sensible plan can start to feel disjointed.", "When coordination is strong, the process feels more understandable and less scattered. That is especially valuable for international clients managing Brazil-related decisions from different time zones, countries, or life situations.", "Coordination makes support usable.", "The client experience is shaped by how well the practical details are handled."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_F, EXP_E, EXP_G, EXP_H, EXP_D, EXP_I, EXP_C],
        "form_intro": "Use this form if you want to understand how support is organized around your situation and what kind of next step would make the process clearer.",
    },
    "mission": {
        "hero": hero(
            "Why the company exists",
            "Our mission is to make moving through Brazil-related decisions clearer, safer, and more human for international clients.",
            [
                ("Core mission", "Reduce confusion, improve trust, and help international clients move forward more carefully."),
                ("Why it matters", "People often need a better path into Brazil, not just more information about Brazil."),
                ("Best next move", "If you want to understand the values behind the service before contacting us, start here."),
            ],
            "This page explains what Immigrate to Brazil is trying to change for clients and why that matters in real life.",
        ),
        "intro": {
            "lead": "A mission should tell clients what changes because the company exists.",
            "p1": "Immigrate to Brazil exists because too many people face the same problems when they try to move here: scattered information, bad advice, pressure to decide too quickly, and uncertainty about who to trust.",
            "p2": "Our mission is to reduce that confusion and create a more understandable, more human, and more trustworthy path for international clients who need Brazil explained clearly.",
        },
        "topics": [
            sec("Defined Purpose", "What the company is here to do", "The purpose is to make the process clearer and safer.", "We are here to help clients move through Brazil-related decisions with more confidence and less guesswork. That includes immigration planning, relocation guidance, and the practical support people often need before they can move forward sensibly.", "The deeper purpose is not just to answer isolated questions. It is to reduce confusion and help people make better choices at important stages of their move.", "Purpose shapes the quality of the service.", "Clients should feel the mission in the way the support works."),
            sec("Role in Immigration Context", "Where we fit in the client's journey", "We are built to be a bridge, not a barrier.", "Many clients do not know where to start, which route fits, or what kind of support they need first. Our role is to make that first stage clearer and help connect people to the right kind of next step.", "In practice, this means turning broad uncertainty into something more structured, more understandable, and more manageable.", "A good starting point changes the whole journey.", "Support is often most valuable at the moment things still feel unclear."),
            sec("Approach to Service Delivery", "How the mission becomes a client experience", "The way support is delivered should reflect the mission itself.", "We believe service should feel professional, warm, direct, and calm. Clients should not be buried in jargon or pressured by language that sounds confident but leaves them more confused.", "That is why we focus on plain English, careful structure, and next-step guidance that feels usable in real life.", "Delivery matters as much as intention.", "A strong mission should be visible in the client experience."),
            sec("Legal Boundaries of Activity", "Why the mission still needs honest limits", "Support becomes safer when its boundaries are visible.", "Our mission is not served by pretending every question can be answered instantly or every situation can be solved with a public explanation. Honest limits are part of responsible client care.", "Those boundaries help protect clients from false certainty and make it easier to tell the difference between general guidance, coordination support, and issues that need deeper review.", "Boundaries protect the mission from becoming vague promises.", "Trust is stronger when the limits are clear."),
            sec("Relationship to Applicable Law", "Why real-world decisions still need grounding", "A good mission does not float above reality.", "Brazil-related decisions still depend on real procedures, real authorities, real facts, and real timing. The mission of the company is to help clients approach that reality more clearly, not to replace it with a softer story.", "That is why we care so much about clarity. People need support that respects the real structure of the decision they are making.", "A helpful mission still has to stay grounded.", "Good intentions only matter when they stay connected to reality."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I, EXP_C],
        "form_intro": "Use this form if you want support that feels aligned with clarity, careful guidance, and a more human path through a Brazil-related decision.",
    },
    "philosophy": {
        "hero": hero(
            "How we think about support",
            "Our philosophy is simple: people make better Brazil decisions when they understand the process clearly and feel supported by careful guidance.",
            [
                ("Core idea", "Better support begins with better understanding, not louder advice."),
                ("Why clients care", "Philosophy matters when it changes the way decisions are explained and sequenced."),
                ("Best next move", "If you want to understand how we approach judgment, clarity, and timing, this page is the right place to start."),
            ],
            "This page explains the ideas that shape how we guide decisions, handle records, and help clients move forward more carefully.",
        ),
        "intro": {
            "lead": "Philosophy matters when it shapes real client experience.",
            "p1": "People usually feel a provider's philosophy before they ever name it. They feel it in the pace of the guidance, the honesty of the answers, the level of care taken with records, and whether they are being helped to think clearly or simply pushed toward a label.",
            "p2": "Our philosophy is built around clarity, careful sequencing, and guidance that respects both the seriousness of the process and the real life behind it.",
        },
        "topics": [
            sec("Approach to Legal Interpretation", "How we think about judgment", "Interpretation should serve clarity, not confusion.", "When people are dealing with Brazil-related decisions, they do not need more noise. They need guidance that is grounded, realistic, and careful about what is known, what is uncertain, and what still needs proper review.", "Our approach is to avoid overstating certainty and to focus instead on helping the client understand the structure of the issue in a way that supports better judgment.", "Careful interpretation protects better decisions.", "The strongest answer is often the clearest one, not the boldest one."),
            sec("Perspective on Immigration Procedures", "How we view the process itself", "Procedures are part of life change, not just administrative tasks.", "Immigration procedures matter because they shape real lives, family plans, work opportunities, and long-term stability. Treating them like abstract bureaucracy often makes the client experience harder than it needs to be.", "We view procedures as something clients should understand in practical terms, so the process feels more manageable and less intimidating.", "Understanding lowers unnecessary stress.", "Procedure matters more when people understand what it means in real life."),
            sec("Method of Case Handling", "How we move from confusion to action", "A good method starts by slowing down the wrong kind of urgency.", "Many clients arrive with too much conflicting information and too little structure. Our method is to clarify the actual objective, sort the relevant issues, and help the client understand what belongs now and what does not.", "That case-handling style matters because better sequencing often changes the entire quality of the decision that follows.", "Method shapes outcome quality even before formal steps begin.", "The right order often matters more than the fastest order."),
            sec("Position on Documentation", "Why records matter so much", "Documents are not just paperwork. They tell the story of the matter.", "Records often decide whether a process feels coherent or fragile. Dates, names, translations, and supporting material need to make sense together, especially when the client is working across languages or jurisdictions.", "We take documentation seriously because a clearer file usually leads to a clearer process, fewer avoidable mistakes, and a calmer client experience.", "Coherence protects the whole process.", "A better file often means a better next step."),
            sec("View on Compliance", "Why support should not stop at the first milestone", "A process is only as strong as what happens after the first success.", "Many people focus on the first approval, first answer, or first milestone and overlook the importance of what follows. Our philosophy is that good support should help clients think beyond the immediate moment and stay more organized over time.", "That does not mean turning every issue into a problem. It means helping people avoid being surprised later by something that should have been visible earlier.", "Long-term clarity is part of short-term care.", "Good support looks ahead as well as forward."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_H, EXP_E, EXP_F, EXP_G, EXP_D, EXP_I, EXP_C],
        "form_intro": "Use this form if you want guidance that feels careful, realistic, and clear enough to help you make a better next decision.",
    },
    "profile": {
        "hero": hero(
            "Your bridge to Brazil",
            "Immigrate to Brazil is designed to be a practical, trusted starting point for international clients who want Brazil explained clearly and handled with care.",
            [
                ("What this page answers", "What kind of support Immigrate to Brazil provides and how that support is designed for international clients."),
                ("Why profile matters", "Clients need to know the kind of experience they are stepping into before they commit to a provider."),
                ("Best next move", "If you are deciding whether our approach fits you, this page gives the clearest overview."),
            ],
            "This page explains the kind of service experience we are built to provide and why that matters for clients planning a move to Brazil.",
        ),
        "intro": {
            "lead": "This page should answer what kind of support experience clients are stepping into.",
            "p1": "Immigrate to Brazil is not just a collection of public pages. It is a company built to help international clients move through Brazilian systems with more clarity, better coordination, and less guesswork.",
            "p2": "The profile matters because people are not only choosing a topic. They are choosing the kind of support experience they want around that topic.",
        },
        "topics": [
            sec("Professional Identification", "How the company is positioned", "Clients should understand the identity of the service they are contacting.", "Immigrate to Brazil is positioned as a human-first guide and coordinator for people dealing with Brazil-related immigration, relocation, and cross-border decisions. The goal is to make the first step clearer and the overall process more understandable.", "That identity matters because international clients often need one place to start before they know which route, provider, or level of support makes the most sense.", "Clear identity helps clients assess fit.", "You should understand what kind of service you are contacting."),
            sec("Areas of Practice", "What kinds of support the company is built around", "The service should feel broad enough for real life, but clear enough to be useful.", "Immigrate to Brazil supports immigration planning, relocation questions, consultation preparation, coordination support, translation accuracy, and the practical next steps people often need when they are building a life linked to Brazil.", "This matters because real clients rarely arrive with only one perfectly isolated issue. They usually need help connecting several decisions without losing clarity.", "Real client problems often cross more than one category.", "Support should match real life, not only a page label."),
            sec("Immigration Focus", "Why the service is built for international clients", "International clients need Brazil explained clearly, not just described.", "The company is built around the needs of English-speaking international clients who want Brazilian immigration and relocation matters translated into plain, practical guidance. Many clients are not only dealing with rules. They are dealing with uncertainty, distance, and the risk of trusting the wrong source.", "That focus shapes the whole experience: clearer language, more careful pacing, and guidance that tries to connect the legal and practical sides of the move.", "The focus shapes the quality of the communication.", "International clients need explanation they can actually use."),
            sec("Types of Legal Matters", "How legal topics connect to broader support", "Legal matters often appear alongside practical questions.", "Clients may be dealing with visas, residencies, naturalisation, family-linked moves, investor planning, business-related questions, regularization issues, or situations that overlap with wider relocation concerns.", "What matters most is not memorizing categories. It is understanding which part of the situation needs attention first and what kind of support makes sense at that stage.", "Categories matter less than clarity.", "The next step should match the real pressure point in the situation."),
            sec("Jurisdiction and Scope", "Why support boundaries still matter", "Clients should understand where guidance begins and how support is shaped.", "Part of good profile information is helping clients understand the limits of public information and the difference between general guidance, coordination support, and issues that need deeper legal review.", "Those boundaries help protect the client from false assumptions and make it easier to decide when simple orientation is enough and when something more serious is needed.", "Clear scope protects trust.", "Knowing the limits of public information is part of making a safer decision."),
            sec("Languages of Service", "Why language is central to the experience", "Language clarity changes how supported clients feel.", "For many international clients, language is one of the biggest practical barriers in Brazil-related matters. Clear English support matters because it turns a confusing process into one that feels more understandable and less isolating.", "Language is not a small detail. It affects whether the client can ask good questions, understand the explanation, and feel confident about the next step being suggested.", "Language is part of access to support.", "The clearer the communication, the easier it is to make better decisions."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I],
        "form_intro": "Use this form if you want to understand whether this kind of support experience fits your situation and what the most useful next step should be.",
    },
    "regulatory": {
        "hero": hero(
            "How legal-provider boundaries and formal authorities fit in",
            "Clients should understand how legal-provider roles, authorities, and formal processes connect to the support we provide.",
            [
                ("Why this page matters", "Clients need to know what is under our control, what depends on authorities, and why careful boundaries protect them."),
                ("How it helps", "It explains formal limits without burying the client in legal language."),
                ("Best next move", "Use this page to understand the framework, then contact us about your actual situation."),
            ],
            "This page is about regulatory clarity in client language, not about turning the site into a law database.",
        ),
        "intro": {
            "lead": "Regulatory clarity helps clients understand what depends on us, what depends on formal review, and what depends on authorities.",
            "p1": "People often feel lost because they cannot see the difference between general support, formal legal work, and the authority decisions that ultimately shape many Brazil-related matters.",
            "p2": "This page exists to make those boundaries clearer in direct client language, so clients can move forward with more realistic expectations.",
        },
        "topics": [
            sec("Applicable Laws", "Why the formal framework still matters", "Support needs to stay grounded in the real framework behind the process.", "Clients do not need a public page full of legal citations to understand an important truth: Brazil-related immigration and cross-border matters sit inside real formal frameworks that shape what is possible, when it is possible, and how carefully decisions should be made.", "Our role is to help clients approach that framework more clearly, not to pretend it can be replaced by simplified internet answers.", "A real framework still shapes the decision.", "Clarity is stronger when it stays grounded in reality."),
            sec("Immigration Regulations", "Why route and timing still have to fit", "Labels are not enough. Fit matters.", "A route may sound promising on the surface, but if the timing, facts, or practical situation do not align, the client can easily end up spending money or energy in the wrong order.", "That is why we keep returning to fit. Good support helps clients understand not only what a category is called, but whether it makes sense for them in real life.", "Fit matters more than labels.", "The route has to match the client's reality."),
            sec("Competent Authorities", "Who actually decides formal outcomes", "Clients should know where authority really sits.", "Part of staying honest with clients is making clear that official bodies and formal authorities control many outcomes that no provider can promise in advance. This matters because it protects people from overconfidence and from services that pretend to control things they do not control.", "Understanding the role of authorities helps clients ask better questions and evaluate claims more carefully.", "Authority sits outside marketing language.", "No responsible support should blur who really makes official decisions."),
            sec("OAB Framework", "Why professional boundaries still matter", "Professional frameworks protect the client as well as the process.", "Clients are better protected when legal-provider roles, communication standards, and professional limits are taken seriously. That does not mean the site has to feel cold or inaccessible. It means support can stay clear, careful, and responsible.", "For international clients, this usually feels like steadier language, fewer exaggerated claims, and a clearer idea of what kind of help is actually being provided.", "Professional limits support trustworthy service.", "Reassurance should not depend on blurred boundaries."),
            sec("Administrative Rules", "Why practical process details still matter", "Administrative reality can shape the client experience as much as the route itself.", "Appointments, records, follow-up, timelines, and procedural details often matter more than clients expect. The practical side of a Brazil-related matter is one of the reasons people need better sequencing and clearer support.", "We try to explain those realities in a way that keeps the client oriented instead of overwhelmed.", "Administrative detail often affects the whole process.", "Practical clarity is part of good regulatory clarity."),
            sec("Legal Limitations", "Why honest limits are reassuring", "No serious support should promise what it cannot control.", "Legal and regulatory limitations can sound restrictive, but they are also protective. They help clients understand what still depends on facts, what still needs proper review, and why public guidance has limits.", "Those limits are not a weakness in the service. They are part of what makes it more trustworthy and safer to rely on.", "Limits protect the quality of the support.", "Honest boundaries are part of responsible client care."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I, EXP_C],
        "form_intro": "Use this form if you want help understanding how formal rules, authorities, and support boundaries connect to your actual situation.",
    },
    "results": {
        "hero": hero(
            "What responsible results language looks like",
            "The results that matter most are clearer decisions, better preparation, less confusion, and a safer path through Brazil-related questions.",
            [
                ("What results means here", "Not promises of approval, but stronger decisions, better readiness, and more confidence in the next step."),
                ("Why it matters", "Clients need hope without being misled by guarantees that no one should make."),
                ("Best next move", "Use this page to understand how we speak about outcomes responsibly."),
            ],
            "This page explains what clients can realistically work toward without turning results into promises.",
        ),
        "intro": {
            "lead": "Results should be described responsibly.",
            "p1": "People naturally want to know what kind of outcome they can work toward. The problem is that many providers answer that question in a way that sounds certain before the facts, timing, and formal review are even clear.",
            "p2": "We take a different approach. Results language should help clients understand what good support can improve without pretending to control what authorities or future facts will decide.",
        },
        "topics": [
            sec("Nature of Administrative Outcomes", "What results often mean in practice", "A good result often starts before any formal outcome exists.", "For many clients, one of the first real results is clarity: understanding the route more realistically, seeing the risks more clearly, and knowing what the next step should be instead of acting blindly.", "Formal outcomes still matter, but better preparation, stronger sequencing, and calmer decision-making are often the things that make those later stages more manageable.", "Good results often begin with better direction.", "Outcome quality is shaped long before the final decision arrives."),
            sec("Factors Affecting Decisions", "Why no two outcomes are identical", "Timing, facts, and readiness all shape what is possible.", "Client situations vary in goals, records, urgency, family context, work history, financial planning, and practical readiness. Those differences matter because they affect both the strength of a case and the way the process should be handled.", "Responsible support takes those variables seriously instead of speaking as if every client can expect the same experience or result.", "Different facts lead to different outcomes.", "The quality of the decision depends on the quality of the fit."),
            sec("Variability of Processes", "Why the path can still change", "Even good preparation does not make every process identical.", "Clients should know that Brazil-related matters can vary in pace, complexity, and how smooth or difficult a process feels. Good support helps reduce avoidable problems, but it does not make the formal world perfectly predictable.", "That is why we focus on helping clients stay clearer and better prepared rather than pretending variability does not exist.", "Variation is normal, not a sign that support failed.", "Preparation matters, even when the process still changes shape."),
            sec("Case Dependency", "Why your situation still has to be reviewed on its own facts", "Real support should stay specific to the client.", "Public examples, testimonials, or route descriptions can be useful for orientation, but they do not replace the need to understand your own situation on its own terms.", "Case dependency matters because better support starts when the client stops trying to fit themselves into someone else's story and starts working from their own facts, timing, and goals.", "Your case deserves its own judgment.", "Public guidance is a starting point, not a substitute for real review."),
            sec("Limitations of Predictability", "Why honest uncertainty is part of trustworthy support", "Responsible support does not hide uncertainty.", "It is tempting to promise certainty because certainty sells. But in real Brazil-related matters, predictability has limits. Authorities, timing, client facts, and changing circumstances all affect the final shape of an outcome.", "We would rather give clients a stronger process, clearer expectations, and more realistic confidence than temporary comfort built on promises no one should make.", "Honest uncertainty protects trust.", "Real reassurance should still feel responsible."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_H, EXP_G, EXP_I, EXP_C, EXP_D],
        "form_intro": "Use this form if you want a clearer, more realistic view of what your situation may require and what kind of progress is actually possible to work toward.",
    },
    "standards": {
        "hero": hero(
            "How careful service becomes visible",
            "Standards are what make a service feel careful, organized, and reliable from the client's point of view.",
            [
                ("What standards do", "They turn good intentions into dependable client experience."),
                ("Why clients care", "Standards shape whether the process feels clear, careful, and coherent."),
                ("Best next move", "If you want to know how service quality is protected, start here."),
            ],
            "This page explains the standards that shape the quality, consistency, and readability of the support clients receive.",
        ),
        "intro": {
            "lead": "Clients may not use the word standards, but they feel the difference when standards are present.",
            "p1": "A service with clear standards usually feels more organized, more understandable, and more trustworthy. A service without them often feels improvised, inconsistent, or harder to rely on.",
            "p2": "Our standards are there to protect the clarity and quality of the client experience, not to add formality for its own sake.",
        },
        "topics": [
            sec("Documentation Standards", "How the file stays coherent", "A strong process usually depends on a strong record set.", "Documentation standards matter because names, dates, translations, and supporting material often need to align across several stages and contexts. When the record is disorganized, the client experience usually becomes more stressful.", "Good standards help protect against avoidable inconsistency and make it easier for the client to understand what needs attention and why.", "Clear records support clearer decisions.", "A coherent file reduces avoidable problems later."),
            sec("Internal Procedures", "Why organized handling matters", "Internal order often decides whether the client experience feels calm or chaotic.", "Internal procedures are what help keep communication, follow-up, review, and next steps aligned instead of fragmented. Clients may never see every procedure directly, but they feel the result in whether the service feels steady and understandable.", "A well-handled process is easier to trust because it feels less improvised and more intentional.", "Internal order protects the client experience.", "The best processes usually feel simple because they are organized well."),
            sec("Quality Control Measures", "How quality is protected over time", "Quality should not depend on luck.", "Strong services usually have ways to check consistency, reduce avoidable mistakes, and notice when something needs clearer handling. Quality control is how a service protects clients from the cost of preventable confusion.", "That protection matters because in Brazil-related matters, even small misunderstandings can affect timing, confidence, or the next step.", "Quality should be protected deliberately.", "Preventable confusion should be caught early whenever possible."),
            sec("Review Processes", "Why not every answer should be rushed forward", "Good review protects clients from premature decisions.", "Some situations can be answered quickly. Others need more care. Review matters because it helps separate what can be clarified immediately from what should not be pushed into a fast answer before the facts are properly understood.", "That review culture helps clients because it protects them from false certainty and gives the process a better foundation.", "Review supports better judgment.", "Speed is not the same thing as clarity."),
            sec("Consistency Framework", "How the service stays recognizably careful", "Clients should not get a different standard every time they make contact.", "Consistency matters because trust grows when the tone, process, and quality of support feel stable across different pages, questions, and stages of contact.", "A consistency framework helps make sure the client experience stays aligned with the same principles: clarity, care, organization, and realistic guidance.", "Consistency builds confidence.", "A dependable experience should feel dependable throughout the process."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_H, EXP_E, EXP_F, EXP_G, EXP_I, EXP_C, EXP_D],
        "form_intro": "Use this form if you want support that feels organized, consistent, and careful enough to trust with an important Brazil-related decision.",
    },
    "story": {
        "hero": hero(
            "Why this company was built",
            "This page tells the story of why Immigrate to Brazil exists and why the company is built around clarity, trust, and practical support for international clients.",
            [
                ("What this page explains", "Why the company started, how it grew, and what shaped its current direction."),
                ("Why it matters", "A company story should help clients understand the experience and values behind the service."),
                ("Best next move", "If you want to understand the thinking behind the business, start here."),
            ],
            "The story matters because it helps explain why the company focuses so strongly on trust, communication, and better sequencing for people moving toward Brazil.",
        ),
        "intro": {
            "lead": "A company story should help clients understand what experience shaped the service.",
            "p1": "Immigrate to Brazil did not begin as a desire to publish more generic information about immigration. It grew out of a much simpler need: too many people were trying to make Brazil-related decisions while feeling confused, isolated, or pushed in the wrong direction.",
            "p2": "The story matters because the kind of service you experience is always shaped by the reason it was built in the first place.",
        },
        "topics": [
            sec("Origin of the Practice", "Where it started", "The company began as a response to confusion, not as a branding exercise.", "The original problem was clear: international clients were trying to understand Brazilian systems through fragmented information, unreliable sources, and communication that often felt hard to trust.", "Immigrate to Brazil began from the idea that people needed a more human and more understandable starting point before they could make sensible decisions.", "Origin shapes purpose.", "A service usually solves the problem it was created to answer."),
            sec("Development Timeline", "How the service grew", "Growth happened by responding to what clients actually needed.", "What started as help with early questions and route confusion grew into a broader support model because clients often needed more than isolated answers. They needed coordination, clearer communication, and help connecting practical life decisions with immigration and relocation questions.", "That growth matters because it explains why the company now works across several stages of the client journey instead of staying at the level of generic orientation alone.", "Growth often follows real client need.", "A stronger service usually comes from listening to what clients keep struggling with."),
            sec("Expansion of Services", "Why the support became broader", "Real client needs usually extend beyond one narrow question.", "Over time, it became clear that people moving toward Brazil were not only asking about legal categories. They were also trying to understand next steps, timing, relocation questions, records, translation accuracy, family plans, and how all of those issues connected.", "Expanding the service meant building a more realistic support model around the way international clients actually experience the process.", "Broader support often reflects real-world complexity.", "The process is rarely only one question."),
            sec("Evolution of Focus", "Why the company is now so clearly client-centered", "The focus sharpened around the needs of international clients.", "As the company developed, the focus became more specific: support for international clients who want Brazil explained in clear English, handled carefully, and connected to real life rather than abstract information.", "That evolution matters because it turned the business away from generic topic coverage and toward a service experience designed for clarity, trust, and next-step guidance.", "Focus improves usefulness.", "The clearer the audience, the more useful the support can become."),
            sec("Current Structure", "What the company is today", "Today the company acts as a bridge into Brazil-related support.", "Immigrate to Brazil now operates as a human-first bridge for international clients who need clearer guidance, trusted coordination, and better support around immigration, relocation, and practical life decisions linked to Brazil.", "That current structure reflects the whole story: a service built not to impress clients with information, but to help them move forward more safely and with more confidence.", "The present structure should make the story visible.", "A good company story should still be visible in the service today."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I, EXP_C],
        "form_intro": "Use this form if you want to move from general interest to a clearer conversation about your own situation and the next step that makes sense for you.",
    },
    "testimonials": {
        "hero": hero(
            "What client feedback helps show",
            "These testimonials are here to show how clients describe the experience of working with Immigrate to Brazil: clearer, calmer, and more supported.",
            [
                ("What to look for", "Patterns in what clients value: clarity, responsiveness, honesty, and support that feels human."),
                ("Why it matters", "Testimonials are useful when they help you understand the experience, not when they are used as hype."),
                ("Best next move", "If the themes feel like what you need, tell us about your situation and we will help you find the next step."),
            ],
            "This page is designed to help you understand how clients describe the service experience, not to pressure you with exaggerated praise.",
        ),
        "intro": {
            "lead": "Testimonials should build trust without sounding promotional.",
            "p1": "Client feedback matters because it shows how support is felt from the outside: whether communication was clear, whether the service felt responsive, and whether the process became easier to understand.",
            "p2": "This page is meant to give you that kind of context without pretending that every client has the same situation, the same path, or the same outcome.",
        },
        "testimonial_strip": {
            "title": "Client feedback records",
            "notes": [
                "These feedback records are shown to help you understand how clients describe the service experience. They should be read as individual reflections, not as guarantees.",
                "Every client situation depends on its own facts, timing, documents, and official review. The value of these records is in the themes they reveal: clarity, care, responsiveness, and trust.",
            ],
        },
        "topics": [
            sec("Nature of Statements", "What the feedback usually says", "The most meaningful feedback is often about the experience, not the drama.", "Clients usually comment on whether communication was understandable, whether they felt listened to, and whether the process made more sense after support began. Those are strong signals because they speak directly to the real need behind many enquiries.", "Feedback of that kind is more valuable than inflated language because it tells you what it may actually feel like to work with us.", "Experience-based feedback is the most useful kind.", "Clarity and trust are often the strongest recurring themes."),
            sec("Context of Feedback", "Where client comments usually come from", "Feedback should be understood in context.", "Some feedback comes from early-stage clarity, some from consultation, and some from longer support relationships. The context matters because different clients value different parts of the process.", "Understanding the context helps you read feedback more intelligently and see whether the themes match what you are personally looking for.", "Context helps feedback stay honest.", "Not every client values the exact same part of the service."),
            sec("Format of Presentation", "Why excerpts are grouped by theme", "Presentation should support understanding, not performance.", "Testimonials are easier to use when they are grouped around themes like trust, clarity, responsiveness, and support. That way, clients can understand what kind of experience the feedback points to instead of reading isolated comments without structure.", "The goal is to help you assess fit, not to overwhelm you with praise.", "Good presentation keeps feedback useful.", "A testimonial page should help you judge fit more clearly."),
            sec("Representational Limitations", "Why testimonials should not be treated as promises", "No testimonial should be read as a guarantee.", "Client feedback can show what the experience felt like, but it cannot promise that another person with a different situation will experience the same path or outcome. Real cases still depend on their own facts, timing, and formal review.", "Keeping that limit visible is part of using testimonials responsibly and respectfully.", "Limits protect trust.", "Feedback is context, not certainty."),
            sec("Neutrality Clarification", "What this page is and is not trying to do", "Feedback should support trust without replacing judgment.", "This page is not here to tell you that every client feels the same or that positive feedback is enough on its own. It is here to show how clients often describe the support when it has felt clearer, calmer, and more human.", "The best use of testimonials is still practical: they help you decide whether the style of support sounds like the kind of experience you want around an important Brazil-related decision.", "Testimonials should inform, not manipulate.", "Use feedback to assess fit, not to suspend judgment."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_G],
        "form_intro": "Use this form if the themes you see here match the kind of support you want and you would like to explain your own situation in clear terms.",
    },
    "values": {
        "hero": hero(
            "What shapes the way we support clients",
            "Our values shape how support feels in practice: clear, careful, respectful, and grounded in real client needs.",
            [
                ("Why values matter", "Clients feel values in the way a service behaves, not just in the way it describes itself."),
                ("What these values affect", "Communication, accuracy, confidentiality, and the honesty of the guidance itself."),
                ("Best next move", "If you want to understand what principles shape the support, start here."),
            ],
            "This page explains the values behind the way we communicate, organize work, and guide people through important Brazil-related decisions.",
        ),
        "intro": {
            "lead": "Values matter when they change how clients are treated.",
            "p1": "A values page should not feel like a list of abstract ideals. It should help clients understand how the service is likely to feel in practice and why certain choices are made the way they are.",
            "p2": "For us, values shape communication, judgment, organization, and the quality of support clients receive around important Brazil-related decisions.",
        },
        "topics": [
            sec("Legal Integrity", "Why honesty sits at the center of the service", "Integrity matters most when the process is uncertain.", "Clients often reach out because they are already dealing with mixed messages, incomplete advice, or pressure to move too quickly. Legal integrity matters because it keeps support grounded in what can actually be said responsibly.", "That integrity is visible in careful language, realistic expectations, and a refusal to build trust on exaggeration.", "Integrity protects the quality of the guidance.", "Honest support is often the most reassuring kind."),
            sec("Accuracy in Documentation", "Why details deserve respect", "Accuracy is not administrative perfectionism. It is protection.", "In Brazil-related matters, records, names, dates, and supporting materials often need to align across several stages. Small inconsistencies can create larger problems later if they are ignored or handled casually.", "We value accuracy because it helps keep the client safer, the process clearer, and the next steps more reliable.", "Accuracy protects readiness.", "Details matter because real outcomes are built on them."),
            sec("Procedural Consistency", "Why steadiness matters", "A client experience should not feel random from one step to the next.", "Consistency matters because clients often feel more stressed when the process seems to change tone, pace, or logic unexpectedly. Procedural consistency helps the support feel more coherent and dependable.", "That steadiness also supports trust because the client can see that the service is being handled with care rather than improvisation.", "Consistency reduces unnecessary stress.", "A dependable process should feel dependable all the way through."),
            sec("Transparency in Communication", "Why clarity is one of the strongest values we can offer", "Clients deserve direct language and honest context.", "Transparency means explaining what is known, what still needs review, and what should not be assumed from public information or an early-stage conversation.", "That kind of communication helps people make better choices because it replaces fog, jargon, and vague reassurance with something more usable.", "Transparent communication improves judgment.", "Clarity is one of the most practical values a client can receive."),
            sec("Confidentiality", "Why respect includes information handling", "People need to feel safe enough to explain what is really happening.", "Clients often contact us at moments that feel sensitive, stressful, or uncertain. Confidentiality matters because support cannot work properly if the client feels exposed or unsure how their information will be treated.", "We value confidentiality because respect is not only about tone. It is also about how the client's situation is held and handled.", "Respect includes how information is treated.", "People need confidence before they can speak openly."),
            sec("Regulatory Compliance", "Why values still need formal discipline", "Good values become stronger when they are supported by clear boundaries.", "Regulatory compliance matters because values alone are not enough if the support does not also respect professional limits, formal roles, and the realities of how Brazil-related decisions are actually handled.", "That discipline helps keep the service trustworthy because it ties intention to responsible practice.", "Discipline protects the value system itself.", "Strong values should still feel grounded and responsible."),
        ],
        "supplements": [EXP_A, EXP_B, EXP_C, EXP_D, EXP_E, EXP_F, EXP_G, EXP_H, EXP_I],
        "form_intro": "Use this form if you want support shaped by clarity, respect, careful communication, and better next-step guidance rather than pressure or guesswork.",
    },
    "lawyer": {
        "hero": hero(
            "How legal support works through Immigrate to Brazil",
            "Legal guidance is available through Immigrate to Brazil in a way that feels clearer, more coordinated, and easier for international clients to understand.",
            [
                ("What this page explains", "How legal support is delivered through Immigrate to Brazil and who helps make that support clear and organized."),
                ("What clients usually want to know", "Who provides legal services, how communication works in English, and how coordination stays human and practical."),
                ("Best next move", "If you are not sure whether your situation needs legal guidance yet, contact us and we will help you narrow that down."),
            ],
            "This is the only About page where we introduce the named service providers who support legal, administrative, and translation-related client work.",
        ),
        "intro": {
            "lead": "International clients often want two things at once: real legal support and communication they can actually understand.",
            "p1": "This page explains how legal guidance works through Immigrate to Brazil and why that matters for clients dealing with Brazilian immigration, family-related, and cross-border decisions. The goal is not to impress you with a long biography. The goal is to help you understand how support is delivered and who is involved.",
            "p2": "Legal guidance needs to be clear, careful, and coordinated. For many clients, that means feeling that the legal side and the practical side of the process are connected instead of scattered across different conversations.",
        },
        "profile": {
            "title": "Legal support through Immigrate to Brazil",
            "facts": [
                ("Licensed Brazilian legal service provider", "Monique Fernandes"),
                ("Administration and translation support", "Irish Ashlyn"),
                ("Languages of support", "English and Portuguese"),
                ("Client focus", "Brazil-related immigration, cross-border, and practical coordination matters"),
            ],
        },
        "topics": [
            sec("Full Identification", "Who provides legal support here", "Clients should understand who provides legal guidance and in what role.", "Monique Fernandes supports Immigrate to Brazil as a licensed Brazilian lawyer service provider. She is not presented here as the owner of the company, but as the lawyer who can support legal aspects of Brazil-related client matters through the wider company structure.", "That distinction matters because clients deserve clarity about who is acting in a legal capacity, how support is organized, and how the company helps make the client experience easier to follow.", "Role clarity builds trust.", "Clients should understand both the legal role and the company role."),
            sec("Academic Background", "Why training matters to clients", "Formal legal training matters most when it becomes understandable support.", "As a licensed Brazilian lawyer, Monique brings formal legal training into immigration and related cross-border client matters. For most clients, the question is not whether legal education exists in the abstract. It is whether that training becomes practical guidance they can actually understand and use.", "That is why this page focuses on how legal training shows up in the client experience: clearer explanation, more careful framing of risk, and better judgment about what should happen next.", "Training matters when it improves the quality of the guidance.", "Clients need legal support they can actually follow in real life."),
            sec("Professional Qualifications", "What the legal role means in practice", "The legal role should feel real, not ceremonial.", "Professional qualification matters because some situations need more than general orientation. They need legal judgment, careful review, and a clearer sense of what formal support or legal direction may be appropriate.", "Through Immigrate to Brazil, that legal role is positioned in a way that remains understandable for international clients. The aim is not to overwhelm people with legal terminology, but to make qualified support more accessible and easier to navigate.", "Clients need to know when legal review matters.", "Professional support should feel accessible, not distant."),
            sec("Areas of Practice", "Where legal guidance becomes relevant", "Brazil-related matters often cross more than one area of life.", "Legal support through Immigrate to Brazil may connect to immigration, family-related, civil, or cross-border questions, depending on what the client is trying to solve. Many real situations do not fit into only one category, which is why broad understanding around Brazil-related matters can be valuable.", "For the client, what matters most is not memorizing categories. It is knowing whether the situation may require legal guidance and how that guidance fits into the wider support they are receiving.", "Real cases often do not fit one simple label.", "Support should match the client's real situation, not a narrow category."),
            sec("Immigration Experience", "How legal support helps in immigration matters", "Immigration questions often need more than generic information.", "Clients reach out about visas, residencies, naturalisation, family-linked moves, regularization, and cross-border questions that affect how they can plan life in Brazil. Legal experience matters because these questions often involve risk, timing, and decisions that should not be guessed at.", "Through Immigrate to Brazil, that experience is translated into clearer English guidance, better sequencing, and a calmer way for international clients to understand what may matter in their case.", "Experience becomes useful when it improves decisions.", "Clients need more than labels. They need guidance they can trust."),
            sec("Languages", "Why language clarity matters", "Good legal support should still feel understandable.", "Clear English support matters because many international clients are trying to understand Brazilian systems while also dealing with stress, deadlines, family plans, or business pressure. Legal guidance is only useful if the client can actually understand the explanation and the next step.", "That is also where coordination with administrative and translation support becomes valuable. Clarity is not just about translation. It is about helping the client feel oriented instead of lost.", "Language clarity is part of service quality.", "Support should feel human and understandable, not distant or technical."),
        ],
        "supplements": [
            sec("How legal support is delivered through Immigrate to Brazil", "How the model works", "The legal side and the client side should feel connected.", "Legal support through the company is designed to feel coordinated rather than fragmented. Clients should be able to understand when a matter needs legal guidance, how that fits into the wider process, and how to move from uncertainty toward the right next step.", "This model matters because many international clients do not want to manage legal, practical, and communication problems separately. They want one clearer path through them.", "Coordination makes legal guidance easier to use.", "Clients benefit when the legal and practical sides of support stay connected."),
            sec("What clients can expect from coordinated support", "How the experience should feel", "Clients should feel guided, not shuffled between disconnected roles.", "A coordinated model helps clients experience clearer communication, more understandable next steps, and better continuity from first contact onward. That continuity is especially valuable when the matter is stressful or involves several moving parts.", "It also helps people feel that someone is paying attention to the whole picture rather than only one technical fragment.", "Continuity lowers stress.", "The client experience should feel joined up, not fragmented."),
            sec("Meet Irish Ashlyn", "Administration, reception, and translation accuracy support", "Practical support often shapes how safe the process feels.", "Irish Ashlyn supports Immigrate to Brazil with administration, reception, translation accuracy, and client coordination. Her background in teaching and business administration supports the kind of communication and organization international clients often need when they are trying to understand Brazilian systems clearly.", "That role matters because many clients do not just need a legal answer. They also need the process around that answer to feel clearer, more organized, and easier to follow.", "Strong administration is part of strong client care.", "Practical support often determines how manageable the process feels."),
            sec("How administration and translation support protect accuracy", "How practical support reduces confusion", "Accuracy is often protected in the details.", "Many client difficulties begin when names, explanations, expectations, or records stop lining up clearly across languages and stages. Administration and translation-accuracy support help reduce those points of friction.", "That support is valuable because it makes the process easier to follow, helps clients feel better oriented, and protects the overall quality of communication.", "Good administration protects clarity.", "Small details often shape the whole experience."),
            sec("Company and provider boundaries", "Why the distinction matters", "Clients should understand what the company does and what formal legal service means.", "Clear boundaries make the support model easier to trust. The company provides a human-first structure for guidance, coordination, and practical support, while formal legal guidance is provided through the licensed lawyer service provider where that level of help is needed.", "Making that distinction visible protects the client from confusion and keeps expectations more realistic from the start.", "Clarity about roles protects trust.", "Different parts of support should be easy to understand."),
            sec("How clients experience clear English support", "Why international clients value this page", "A legal process feels less intimidating when the communication is clear.", "Many international clients choose Immigrate to Brazil because they want Brazilian support that does not leave them lost in legal jargon or vague language. English-first clarity helps people understand where they stand and what needs attention.", "This matters because support is not only about technical correctness. It is also about whether the client can actually use the guidance to make a better decision.", "Understanding changes the quality of the decision.", "Clear language is part of real support."),
            sec("When legal review becomes important", "How clients know when the issue is more serious", "Some questions need deeper review before action is taken.", "Clients often start with general uncertainty, but some situations quickly become more sensitive because of family consequences, timing, risk, regularization issues, or the importance of the decision being made.", "A key part of legal support is helping the client recognize when the matter should not be handled by guesswork alone and when more serious review is the safer path.", "Good judgment includes knowing when deeper review matters.", "If the issue feels too important to guess at, it probably is."),
            sec("How support stays organized across stages", "Why coordination matters after the first answer", "Support often needs to stay coherent over time.", "Many matters do not end with one conversation. Questions evolve, records need attention, and different types of support may become relevant at different moments. Coordination helps clients experience the process as one path rather than several disconnected moments.", "That kind of organization is especially reassuring for people managing Brazil-related decisions from abroad or across multiple life changes at once.", "Organization creates continuity.", "The process should still make sense as it develops."),
            sec("Why clients value coordinated human support", "What makes this page different", "People often need support that feels more human than a standard legal directory.", "Clients usually want to know they are dealing with real people who understand the stress, uncertainty, and practical weight of a move to Brazil. Coordinated support helps legal guidance feel more approachable without making it less serious.", "That is one of the reasons this page matters. It shows not only who provides support, but how that support is meant to feel from the client's side.", "Human support makes difficult decisions easier to approach.", "Clients often need reassurance and clarity at the same time."),
            sec("What to do if you are not sure what kind of help you need", "How to start without having every answer yet", "You do not need to arrive already knowing the exact legal path.", "Many clients contact Immigrate to Brazil before they know whether the situation needs legal guidance, broader coordination support, or simply a clearer first review. That uncertainty is normal.", "The most useful first move is often to explain the real situation and let the next step be guided by the actual facts rather than by internet assumptions or pressure to decide too quickly.", "Early clarity is often the most valuable first result.", "You do not need to have a perfect label before you reach out."),
        ],
        "form_intro": "Use this form if you want to explain your situation in clear terms and understand whether the next step should involve legal guidance, broader coordination support, or a clearer first review.",
    },
}


def render_intro(spec: dict[str, str]) -> str:
    return f"""
          <section class="content-block intro-block">
            <h2 class="section-title">{INTRO_ICON}<span>Overview</span></h2>
            <p class="lead">{esc(spec["lead"])}</p>
            <p>{esc(spec["p1"])}</p>
            <p>{esc(spec["p2"])}</p>
          </section>""".rstrip()


def render_section(class_attr: str, section_id: str, spec: dict[str, str]) -> str:
    return f"""
  <section class="{class_attr}" id="{section_id}" data-topic="{esc(spec["title"])}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">{esc(spec["kicker"])}</p>
        <h2>{esc(spec["title"])}</h2>
        <p class="section-strap">{esc(spec["strap"])}</p>
      </div>
      <div class="topic-section__body">
        <p>{esc(spec["p1"])}</p>
        <p>{esc(spec["p2"])}</p>
      </div>
      <aside class="topic-section__aside" aria-label="{esc(spec["title"])} quick notes">
        <div class="topic-note">
          <strong>Why it matters</strong>
          <span>{esc(spec["why"])}</span>
        </div>
        <div class="topic-note">
          <strong>What to keep in view</strong>
          <span>{esc(spec["keep"])}</span>
        </div>
      </aside>
    </div>
  </section>""".rstrip()


def render_profile(spec: dict[str, object]) -> str:
    facts = "\n".join(f'<div><strong>{esc(k)}</strong><span>{esc(v)}</span></div>' for k, v in spec["facts"])
    return f"""
          <section class="content-block profile-block">
            <h2 class="section-title">{TOPIC_ICON}<span>{esc(spec["title"])}</span></h2>
            <div class="fact-sheet">
              {facts}
            </div>
          </section>""".rstrip()


def rewrite_testimonial_strip(block: str, spec: dict[str, object]) -> str:
    block = TESTIMONIAL_TITLE_RE.sub(lambda m: f"{m.group(1)}{esc(spec['title'])}{m.group(3)}", block, count=1)
    block = replace_seq(TESTIMONIAL_NOTE_RE, block, list(spec["notes"]))
    return block


def replace_seq(pattern: re.Pattern[str], text: str, values: list[str]) -> str:
    it = iter(values)
    return pattern.sub(lambda m: f"{m.group(1)}{esc(next(it))}{m.group(3)}", text, count=len(values))


def rewrite_header(block: str, spec: dict[str, object]) -> str:
    block = KICKER_RE.sub(lambda m: f"{m.group(1)}{esc(spec['kicker'])}{m.group(3)}", block, count=1)
    block = SUMMARY_RE.sub(lambda m: f"{m.group(1)}{esc(spec['summary'])}{m.group(3)}", block, count=1)
    block = BRAND_NOTE_RE.sub(lambda m: f"{m.group(1)}{esc(spec['brand_note'])}{m.group(3)}", block, count=1)
    block = replace_seq(BADGE_TEXT_RE, block, list(spec["badges"]))
    block = replace_seq(PANEL_ITEM_RE, block, list(spec["signals"]))
    block = replace_seq(GLANCE_LABEL_RE, block, [label for label, _ in spec["glances"]])
    block = replace_seq(GLANCE_TEXT_RE, block, [text for _, text in spec["glances"]])
    return block


def main() -> None:
    updated = 0
    for slug, spec in PAGES.items():
        body_path = ABOUT_DIR / slug / "body.html"
        text = body_path.read_text()

        header_match = HEADER_RE.search(text)
        if not header_match:
            raise ValueError(f"Hero not found in {body_path}")
        text = text[: header_match.start()] + rewrite_header(header_match.group(0), spec["hero"]) + text[header_match.end() :]

        intro_match = INTRO_RE.search(text)
        if not intro_match:
            raise ValueError(f"Intro block not found in {body_path}")
        text = text[: intro_match.start()] + render_intro(spec["intro"]) + text[intro_match.end() :]

        if "profile" in spec:
            profile_match = PROFILE_RE.search(text)
            if not profile_match:
                raise ValueError(f"Profile block not found in {body_path}")
            text = text[: profile_match.start()] + render_profile(spec["profile"]) + text[profile_match.end() :]

        if "testimonial_strip" in spec:
            strip_match = TESTIMONIAL_STRIP_RE.search(text)
            if not strip_match:
                raise ValueError(f"Testimonial strip not found in {body_path}")
            text = text[: strip_match.start()] + rewrite_testimonial_strip(strip_match.group(0), spec["testimonial_strip"]) + text[strip_match.end() :]

        topics = list(TOPIC_RE.finditer(text))
        if len(topics) != len(spec["topics"]):
            raise ValueError(f"Topic mismatch in {body_path}: expected {len(spec['topics'])}, found {len(topics)}")
        rebuilt = []
        last = 0
        for match, section_spec in zip(topics, spec["topics"]):
            rebuilt.append(text[last:match.start()])
            rebuilt.append(render_section(match.group("class"), match.group("id"), section_spec))
            last = match.end()
        rebuilt.append(text[last:])
        text = "".join(rebuilt)

        supplements = list(SUPP_RE.finditer(text))
        if len(supplements) != len(spec["supplements"]):
            raise ValueError(f"Supplement mismatch in {body_path}: expected {len(spec['supplements'])}, found {len(supplements)}")
        rebuilt = []
        last = 0
        for match, section_spec in zip(supplements, spec["supplements"]):
            rebuilt.append(text[last:match.start()])
            rebuilt.append(render_section(match.group("class"), match.group("id"), section_spec))
            last = match.end()
        rebuilt.append(text[last:])
        text = "".join(rebuilt)

        text = FORM_INTRO_RE.sub(lambda m: f"{m.group(1)}{esc(spec['form_intro'])}{m.group(3)}", text, count=1)
        body_path.write_text(text)
        updated += 1

    print(f"Rewrote {updated} About page bodies.")


if __name__ == "__main__":
    main()
