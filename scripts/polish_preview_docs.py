#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.deepen_preview_docs import Page, bullet_block, format_page, parse_doc


def md(label: str, url: str) -> str:
    return f"[{label}]({url})"


OFFICIAL = {
    "migration_law": md("Brazilian Migration Law", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13445.htm"),
    "migration_decree": md("Migration Regulation Decree", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9199.htm"),
    "pf": md("Policia Federal - Imigracao", "https://www.gov.br/pf/pt-br/assuntos/imigracao/inicio"),
    "migr_portal": md("Portal de Imigracao - Ministerio da Justica", "https://portaldeimigracao.mj.gov.br/pt/"),
    "mre_consular": md("Portal Consular - Ministerio das Relacoes Exteriores", "https://www.gov.br/mre/pt-br/assuntos/portal-consular"),
    "mj": md("Ministerio da Justica e Seguranca Publica", "https://www.gov.br/mj/pt-br"),
    "ibge_cidades": md("IBGE - Cidades do Brasil", "https://cidades.ibge.gov.br/"),
    "ibge_estados": md("IBGE - Cidades e Estados", "https://www.ibge.gov.br/cidades-e-estados"),
    "ibge_mapa": md("IBGE - Mapa Politico do Brasil", "https://www.ibge.gov.br/geociencias/cartas-e-mapas/mapas-de-referencia/15816-politico.html"),
    "ibge_censo": md("IBGE - Censo Demografico 2022", "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html"),
    "sidra_ipca": md("IBGE - SIDRA IPCA", "https://sidra.ibge.gov.br/home/ipca/brasil"),
    "inmet": md("INMET", "https://portal.inmet.gov.br/"),
    "turismo": md("Ministerio do Turismo", "https://www.gov.br/turismo/pt-br"),
    "cultura": md("Ministerio da Cultura", "https://www.gov.br/cultura/pt-br"),
    "saude": md("Ministerio da Saude - SUS", "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/sus"),
    "ans": md("ANS", "https://www.gov.br/ans/pt-br"),
    "mec": md("Ministerio da Educacao", "https://www.gov.br/mec/pt-br"),
    "inep": md("INEP", "https://www.gov.br/inep/pt-br"),
    "transportes": md("Ministerio dos Transportes", "https://www.gov.br/transportes/pt-br"),
    "cidades": md("Ministerio das Cidades", "https://www.gov.br/cidades/pt-br"),
    "esporte": md("Ministerio do Esporte", "https://www.gov.br/esporte/pt-br"),
    "agricultura": md("Ministerio da Agricultura", "https://www.gov.br/agricultura/pt-br"),
    "empresas": md("gov.br - Empresas e Negocios", "https://www.gov.br/empresas-e-negocios/pt-br"),
    "bcb_stats": md("Banco Central do Brasil - Estatisticas", "https://www.bcb.gov.br/estatisticas"),
    "bcb_fx": md("Banco Central do Brasil - Cotacoes", "https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes"),
    "apex": md("ApexBrasil", "https://apexbrasil.com.br/content/apexbrasil/br/pt.html"),
    "receita": md("Receita Federal", "https://www.gov.br/receitafederal/pt-br"),
    "caixa": md("CAIXA", "https://www.caixa.gov.br/Paginas/home-caixa.aspx"),
}


BRAZIL_RESOURCE_MAP = {
    "brazil": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["turismo"], OFFICIAL["inmet"]],
    "investment": [OFFICIAL["apex"], OFFICIAL["empresas"], OFFICIAL["bcb_stats"], OFFICIAL["receita"], OFFICIAL["ibge_cidades"]],
    "economy": [OFFICIAL["bcb_stats"], OFFICIAL["bcb_fx"], OFFICIAL["sidra_ipca"], OFFICIAL["empresas"], OFFICIAL["apex"]],
    "quality": [OFFICIAL["ibge_censo"], OFFICIAL["saude"], OFFICIAL["mec"], OFFICIAL["turismo"], OFFICIAL["inmet"]],
    "living": [OFFICIAL["ibge_cidades"], OFFICIAL["transportes"], OFFICIAL["saude"], OFFICIAL["cultura"], OFFICIAL["turismo"]],
    "cost": [OFFICIAL["sidra_ipca"], OFFICIAL["bcb_fx"], OFFICIAL["ibge_cidades"], OFFICIAL["cidades"], OFFICIAL["ans"]],
    "housing": [OFFICIAL["cidades"], OFFICIAL["caixa"], OFFICIAL["ibge_cidades"], OFFICIAL["transportes"], OFFICIAL["receita"]],
    "healthcare": [OFFICIAL["saude"], OFFICIAL["ans"], OFFICIAL["ibge_cidades"], OFFICIAL["migr_portal"], OFFICIAL["pf"]],
    "education": [OFFICIAL["mec"], OFFICIAL["inep"], OFFICIAL["ibge_cidades"], OFFICIAL["mre_consular"], OFFICIAL["migr_portal"]],
    "safety": [OFFICIAL["mj"], OFFICIAL["pf"], OFFICIAL["ibge_cidades"], OFFICIAL["transportes"], OFFICIAL["turismo"]],
    "culture": [OFFICIAL["cultura"], OFFICIAL["turismo"], OFFICIAL["ibge_censo"], OFFICIAL["ibge_estados"], OFFICIAL["mre_consular"]],
    "festivals": [OFFICIAL["turismo"], OFFICIAL["cultura"], OFFICIAL["esporte"], OFFICIAL["ibge_estados"], OFFICIAL["inmet"]],
    "cuisine": [OFFICIAL["agricultura"], OFFICIAL["turismo"], OFFICIAL["cultura"], OFFICIAL["ibge_censo"], OFFICIAL["ibge_estados"]],
    "events": [OFFICIAL["turismo"], OFFICIAL["cultura"], OFFICIAL["esporte"], OFFICIAL["ibge_cidades"], OFFICIAL["transportes"]],
    "guides": [OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["mre_consular"], OFFICIAL["ibge_cidades"], OFFICIAL["turismo"]],
    "faqs": [OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["mre_consular"]],
    "north": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["inmet"], OFFICIAL["turismo"]],
    "northeast": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["turismo"], OFFICIAL["inmet"]],
    "central-west": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["empresas"], OFFICIAL["inmet"]],
    "southeast": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["bcb_stats"], OFFICIAL["transportes"]],
    "south": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["mec"], OFFICIAL["inmet"]],
    "states": [OFFICIAL["ibge_estados"], OFFICIAL["ibge_mapa"], OFFICIAL["ibge_censo"], OFFICIAL["cidades"], OFFICIAL["turismo"]],
    "cities": [OFFICIAL["ibge_cidades"], OFFICIAL["ibge_censo"], OFFICIAL["transportes"], OFFICIAL["saude"], OFFICIAL["mec"]],
    "municipalities": [OFFICIAL["ibge_cidades"], OFFICIAL["ibge_censo"], OFFICIAL["cidades"], OFFICIAL["transportes"], OFFICIAL["saude"]],
    "directory": [OFFICIAL["ibge_cidades"], OFFICIAL["empresas"], OFFICIAL["pf"], OFFICIAL["migr_portal"], OFFICIAL["turismo"]],
    "search": [OFFICIAL["ibge_cidades"], OFFICIAL["migration_law"], OFFICIAL["pf"], OFFICIAL["migr_portal"], OFFICIAL["mre_consular"]],
}


INSIGHT_HERO = {
    "hub": (
        "Brazil Immigration Insights, Guides, Updates, And FAQs",
        "Use this hub when you want calmer, better-organized reading about Brazil before your case becomes personal. These articles are here to reduce confusion, answer recurring questions, and help research become more useful than endless scrolling.",
    ),
    "general": (
        "Brazil Immigration Basics: Visas, Residency, Documents, And Public Authorities",
        "Start here if you want a clearer understanding of how Brazil immigration is structured before comparing routes, documents, or next steps. The goal is to replace scattered reading with vocabulary that actually supports better decisions.",
    ),
    "visa": (
        "Brazil Visa Insights: Entry Categories, Consulates, Documents, And Timing",
        "Visa research becomes much easier once the purpose of entry is separated from later residence planning. We explain how entry categories work, what consulates actually do, and where people most often confuse the first step with the whole process.",
    ),
    "residency": (
        "Brazil Residency Insights: Continuity, Renewal, Rights, And Long-Term Stay",
        "Residency is where Brazil stops being a trip and starts becoming a legal continuity question. We explain longer-term stay in plain English so readers can understand documents, renewal logic, and authority expectations before a file is under pressure.",
    ),
    "naturalisation": (
        "Brazil Naturalisation Insights: Continuity, Eligibility, Records, And Timing",
        "Naturalisation planning only makes sense when the wider record is being read in sequence. Here we explain citizenship thinking in a calmer, long-term way so readers can see where continuity, records, family history, and timing actually matter.",
    ),
    "process": (
        "Brazil Immigration Process Insights: Strategy, Filing, Approval, And Aftercare",
        "Brazil immigration work becomes easier to understand when it is slowed down into practical stages. We explain how a matter usually moves once it becomes real, where mistakes happen, what each phase is meant to produce, and why sequence matters so much.",
    ),
    "blog": (
        "Brazil Immigration Blog: Evergreen Commentary, Explanations, And Planning Notes",
        "Our blog is where public commentary stays useful over time. It is designed to help readers think more clearly about Brazil, relocation, immigration, and common planning questions without drifting into panic, noise, or empty marketing.",
    ),
    "updates": (
        "Brazil Immigration Updates Explained Calmly",
        "Updates matter, but not every change means immediate disruption. This page is designed to help readers interpret legal and administrative developments with more calm, more context, and a better sense of what actually needs attention.",
    ),
    "guides": (
        "Brazil Guides: Moving, Settling, Documents, And Everyday Questions",
        "These guides are written for readers who need practical orientation before or during a move to Brazil. They connect immigration steps with daily-life reality so the planning process feels more coherent from the beginning.",
    ),
}


INSIGHT_RESOURCE_MAP = {
    "hub": [OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["mre_consular"]],
    "general": [OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["mre_consular"]],
    "visa": [OFFICIAL["mre_consular"], OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["pf"], OFFICIAL["migr_portal"]],
    "residency": [OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["mj"]],
    "naturalisation": [OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["mj"], OFFICIAL["pf"], OFFICIAL["migr_portal"]],
    "process": [OFFICIAL["migration_law"], OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["mre_consular"], OFFICIAL["mj"]],
    "blog": [OFFICIAL["migration_law"], OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["ibge_estados"], OFFICIAL["turismo"]],
    "updates": [OFFICIAL["migration_law"], OFFICIAL["migration_decree"], OFFICIAL["mj"], OFFICIAL["pf"], OFFICIAL["mre_consular"]],
    "guides": [OFFICIAL["migr_portal"], OFFICIAL["pf"], OFFICIAL["mre_consular"], OFFICIAL["ibge_cidades"], OFFICIAL["turismo"]],
}


PROCESS_HERO = {
    "consultation": "Consultation is where scattered facts start becoming an organized immigration question. We explain what this stage is for, what it can realistically clarify, and why a strong consultation often changes the quality of every later step.",
    "assessment": "Assessment is where a situation stops being a guess and starts being read against real chronology, documents, risk, and route fit. We explain why careful assessment usually saves far more time than rushed action.",
    "strategy": "Strategy is where possible routes are compared, sequence is defined, and trade-offs become visible. We explain how structured strategy helps readers move from possibility into direction.",
    "filing": "Filing is not only submission. It is the stage where preparation, sequence, document quality, and timing have to hold together under authority review. We explain how that stage is made stronger before anything is sent.",
    "approval": "Approval is where many readers expect certainty, even though authorities still control the decision and timing. We explain how approval stages really work, what stays outside private control, and what usually comes next.",
    "mistakes": "Mistakes rarely begin as drama. They usually begin as sequence problems, assumptions, partial disclosure, or documents prepared in the wrong order. We explain how those patterns develop and how they can be reduced.",
    "failures": "Failure in immigration work is often more complex than a simple no. It can look like refusal, drift, delay, silence, loss of continuity, or a file that stopped making sense. We explain those patterns here in practical terms.",
    "deadlines": "Deadlines shape risk long before they expire. We explain how timing windows behave in practice, what makes them easier to control, and why many problems begin when time is assumed instead of tracked.",
    "obligations": "Obligations are part of maintaining status, not an afterthought added after approval. We explain how duties, reporting, compliance, and continuity fit into the wider process.",
    "alone": "Many readers try to carry the process alone for longer than is comfortable because they hope more reading will solve what is really a structure problem. We explain where solo navigation is still reasonable and where it usually starts to fail.",
    "transparency": "Transparency matters because immigration work becomes unstable when scope, timing, risk, and responsibility are left vague. We explain how clearer communication protects the process on both sides.",
    "fees": "Fees make more sense when they are read through scope, stage, and value rather than through a single number. We explain how we think about process pricing in a structured way.",
    "refund": "Refund questions need clarity, not guesswork. We explain how stage-based work, fairness, timing, and review logic fit together when a refund request is made.",
    "timeline": "Timelines help when they are realistic, not comforting. We explain what usually shapes immigration timing in Brazil, what can be planned, and what still depends on third parties or public authorities.",
    "aftercare": "Aftercare is where a successful first stage becomes a stable ongoing life in Brazil. We explain why post-approval support, continuity, compliance, and planning matter far more than many people expect.",
    "responsibilities": "Responsibilities become easier to live with when they are clearly shared. We explain what belongs to the client, what belongs to the provider, and what belongs to the legal framework itself.",
    "rights": "Rights matter most when people understand how to use them in practice. We explain the difference between having a legal protection in theory and being able to rely on it confidently in real life.",
    "renewal": "Renewal is often won through earlier discipline. We explain how timing, continuity, records, and obligations shape renewal planning long before the deadline feels close.",
    "permanent": "Permanent status changes the long-term shape of life in Brazil, but it still depends on route fit, continuity, and proper preparation. We explain the practical meaning of that transition here.",
    "naturalisation": "Naturalisation inside the process family is about long-term legal progression rather than only citizenship aspiration. We explain how continuity, records, timing, and expectations interact when that stage comes into view.",
    "compliance": "Compliance is what keeps a good file from slowly becoming a vulnerable one. We explain how alignment, monitoring, documents, and practical discipline protect continuity over time.",
    "conversion": "Conversion is rarely just a paperwork adjustment. It is a transition between positions that has to respect timing, route logic, and documentary coherence. We explain how that works here.",
    "regularization": "Regularization is about bringing a drifting or exposed situation back into a workable legal path. We explain how recovery starts, what readers should stop doing, and where structured support adds the most value.",
    "planning": "Planning is where goals, route fit, documents, timing, and life design begin to align. We explain why strong planning changes the whole feel of a Brazil immigration process.",
}


SERVICE_NAME_MAP = {
    ("advisory", "consultation"): "consultation",
    ("advisory", "strategy"): "strategy advisory",
    ("advisory", "compliance"): "compliance advisory",
    ("advisory", "corporate"): "corporate immigration advisory",
    ("advisory", "representation"): "representation",
    ("defense", "appeals"): "appeals",
    ("defense", "deportation"): "deportation defense",
    ("defense", "expulsion"): "expulsion defense",
    ("defense", "extradition"): "extradition-related defense",
    ("defense", "fines"): "immigration fines defense",
    ("defense", "litigation"): "immigration litigation",
    ("naturalisation", "ordinary"): "ordinary naturalisation",
    ("naturalisation", "extraordinary"): "extraordinary naturalisation",
    ("naturalisation", "provisional"): "provisional naturalisation",
    ("naturalisation", "reacquisition"): "reacquisition of Brazilian nationality",
    ("naturalisation", "renunciation"): "renunciation of Brazilian nationality",
    ("naturalisation", "special"): "special naturalisation",
    ("other", "consular"): "consular support",
    ("other", "records"): "records support",
    ("other", "regularization"): "regularization support",
    ("other", "translation"): "translation support",
    ("visas", "nomad"): "digital nomad visa support",
    ("visas", "business"): "business visa support",
    ("visas", "family"): "family visa support",
    ("visas", "tourist"): "tourist visa guidance",
    ("residencies", "nomad"): "digital nomad residency support",
    ("residencies", "reunion"): "family reunion residency support",
    ("residencies", "work"): "work residency support",
    ("residencies", "investor"): "investor residency support",
}


def write_doc(path: Path, pages: list[Page], heading_lines: list[str]) -> None:
    content = "\n".join(heading_lines + [""] + [format_page(page) for page in pages]).rstrip() + "\n"
    path.write_text(content, encoding="utf-8")


def service_name(page: Page) -> str:
    parts = page.path.strip("/").split("/")
    family = parts[1]
    leaf = parts[-1]
    if len(parts) == 2:
        return parts[-1].replace("-", " ")
    return SERVICE_NAME_MAP.get((family, leaf), leaf.replace("-", " "))


def process_slug(page: Page) -> str:
    return page.path.strip("/").split("/")[-1]


def polish_hub_wording(text: str, collection_label: str) -> str:
    text = text.replace("This section helps narrow that choice.", "The aim is to help you start in the right place without creating more noise.")
    text = text.replace("Use the child pages this way:", f"A good way to move through the {collection_label} in this hub:")
    text = text.replace("child pages", collection_label)
    text = text.replace("child page", "page")
    return text


def insight_theme(slug: str) -> dict[str, object]:
    base = {
        "general": {
            "subject": "Brazil immigration as a whole",
            "reader": "readers who want to understand the system before they start comparing specific routes",
            "difference": "visa, residence authorisation, registration, and citizenship",
            "documents": "civil records, translations, apostilles, chronology, and consistency across names and dates",
            "misunderstandings": [
                "assuming a visa and a long-term residence position are the same thing",
                "believing marriage, investment, or remote work automatically creates status on its own",
                "treating one official page or one anecdote as if it answered every case",
                "underestimating how much document quality shapes later options",
            ],
        },
        "visa": {
            "subject": "Brazil visa logic",
            "reader": "people still deciding how entry to Brazil should be positioned before travel or consular action begins",
            "difference": "purpose of entry, consular review, and what a visa does not settle after arrival",
            "documents": "passport validity, supporting purpose evidence, financial documentation, travel planning, and consistency with the real purpose of entry",
            "misunderstandings": [
                "treating a visa label as if it answered the whole long-term plan",
                "assuming the most attractive route name is automatically the right fit",
                "waiting too long to think about consular timing and supporting documents",
                "using tourism language for a purpose that is really work, family, study, or residence planning",
            ],
        },
        "residency": {
            "subject": "residency in Brazil",
            "reader": "people who are thinking beyond arrival and trying to understand lawful continuity in Brazil",
            "difference": "temporary and permanent positions, renewal logic, and what continuity actually requires",
            "documents": "registrations, civil records, proof of the route basis, renewal-sensitive evidence, and anything that proves continuity over time",
            "misunderstandings": [
                "treating residence as if approval were the end of the process",
                "assuming renewal is automatic when the first grant looked straightforward",
                "underestimating the relationship between residence history and future naturalisation planning",
                "confusing entry permission with long-term lawful stay",
            ],
        },
        "naturalisation": {
            "subject": "Brazilian naturalisation",
            "reader": "people thinking about citizenship as a long-term stage rather than a quick shortcut",
            "difference": "ordinary expectations, continuity, records, and where family or nationality history changes the analysis",
            "documents": "civil records, continuity evidence, residence history, criminal-clearance records, and documents that show the wider history clearly",
            "misunderstandings": [
                "treating citizenship as a standalone application detached from prior residence history",
                "assuming long time in Brazil is enough without checking the quality of the record",
                "forgetting how names, civil status, translations, and old records affect credibility",
                "seeing naturalisation as a quick fix for an unstable earlier file",
            ],
        },
        "process": {
            "subject": "the Brazil immigration process",
            "reader": "people who need to understand how a matter moves from first clarity into real execution",
            "difference": "orientation, strategy, preparation, filing, approval, and aftercare",
            "documents": "chronology, civil records, supporting evidence, communications, deadlines, and the material that becomes important at each phase",
            "misunderstandings": [
                "treating filing as the beginning instead of a later stage built on earlier work",
                "assuming fast movement is always better than structured movement",
                "expecting every stage to answer questions that belong to another one",
                "underestimating the effect of weak communication or partial disclosure",
            ],
        },
    }
    return base[slug]


def build_insight_section(slug: str, title: str, resources: list[str]) -> str:
    theme = insight_theme(slug)
    subject = theme["subject"]
    reader = theme["reader"]
    difference = theme["difference"]
    documents = theme["documents"]
    myths = theme["misunderstandings"]
    res_a = resources[0]
    res_b = resources[1]
    res_c = resources[2]
    res_d = resources[3]

    if title in {"System Overview", "Overview"}:
        return "\n\n".join(
            [
                f"{subject.capitalize()} becomes much easier to understand once it is treated as a structured system rather than as a set of scattered tips. The legal framework matters, public authorities matter, documentation matters, and the order in which questions are asked matters. That is why we write these insights for {reader}.",
                f"In practice, most confusion begins when broad interest turns into urgent reading too quickly. People search for one answer when the real question is layered: part legal, part administrative, part documentary, and part practical. We want this page to slow that down enough that the topic starts feeling readable again.",
                bullet_block(
                    "A better first reading usually clarifies:",
                    [
                        f"the difference between {difference}",
                        "which part of the question can be understood through public information and which part depends on personal facts",
                        f"where official reading should begin, especially with {res_a}, {res_b}, and {res_c}",
                        "why stronger vocabulary often improves decision-making before any consultation is booked",
                    ],
                ),
                "That foundation matters. Once readers understand the shape of the system, they usually stop asking ten unrelated questions and start asking one or two much better ones.",
            ]
        )
    if title in {"Legal Concepts", "Category Families", "Temporary And Permanent", "Eligibility", "Stages"}:
        return "\n\n".join(
            [
                f"The language around {subject} often sounds simpler than it really is. Familiar words are used every day online, but familiar is not the same as precise. Immigration planning becomes far more stable once readers understand the key distinctions early instead of correcting them after documents have already been prepared.",
                f"We use this part of the article to translate the subject into plain but accurate English. The goal is not to impress the reader with legal terminology. It is to show how the categories relate to one another, where they overlap, and where they are not interchangeable.",
                bullet_block(
                    "Useful distinctions to keep in view:",
                    [
                        difference,
                        "eligibility usually depends on facts and evidence, not only on a route name",
                        "the strongest category is usually the one that best matches the real purpose and chronology",
                        f"official references such as {res_a} and {res_b} help more when the concepts are already being read in the right order",
                    ],
                ),
                "This is one of the quiet ways good research saves time. Clear concepts tend to prevent expensive confusion later.",
            ]
        )
    if title in {"Institutions", "Consular Logic", "Authority Interaction", "Authority Logic", "Legal And Administrative Updates", "Authority Practice"}:
        return "\n\n".join(
            [
                f"Public authorities matter because {subject} is not handled by one office with one logic. Consulates, the Ministry of Justice migration portal, and the Policia Federal all sit in the wider picture, but they do not answer the same question. A reader who understands that usually reads official sources with much more confidence.",
                f"We see this confusion constantly in real cases. A person reads consular information when their real question is post-arrival registration. Another person reads a residence reference when the immediate issue is still consular timing. The articles in this family are meant to separate those layers before they turn into mixed signals.",
                bullet_block(
                    "A stronger institutional reading usually helps the reader see:",
                    [
                        f"where {res_c} matters more than {res_d}, and vice versa",
                        "why different authorities review different stages of the same journey",
                        "why official silence on one specific fact does not automatically mean a route is safe or unavailable",
                        "how public guidance and case-specific judgment sit next to each other rather than replacing each other",
                    ],
                ),
                "That institutional map is one of the simplest ways to make Brazil feel less opaque to foreigners.",
            ]
        )
    if title in {"Visa, Residency, And Citizenship", "Route Fit", "Common Route Families", "Family And History", "Planning"}:
        return "\n\n".join(
            [
                f"Most readers reach this point because they are trying to connect a present decision to a longer horizon. That is where {subject} becomes more than a category question. The reader has to ask not only what is possible now, but what kind of continuity, flexibility, and future positioning the choice creates later.",
                f"We write about route fit and long-term planning because short-term logic can be dangerously persuasive on its own. A path can look attractive in isolation and still create friction once family structure, residence continuity, or future naturalisation planning is taken seriously.",
                bullet_block(
                    "A better fit analysis usually asks:",
                    [
                        "what the person is truly trying to build in Brazil over the next several years",
                        "how the current route affects later continuity and options",
                        "whether the supporting documents tell a coherent story for that route",
                        "whether the route still makes sense once real-life timing and family context are included",
                    ],
                ),
                "That is where guidance often becomes valuable. Not because public information failed, but because the question has matured beyond general reading alone.",
            ]
        )
    if title in {"Documentation", "Documents", "Records", "Sources"}:
        return "\n\n".join(
            [
                f"Documentation shapes the future much earlier than most people expect. Long before a file is submitted, documents are already telling a story about identity, chronology, family structure, movement, and purpose. If that story is weak or inconsistent, {subject} often becomes harder to sustain than it first looked on paper.",
                f"We include a strong document focus because so many later setbacks can be traced back to early record issues. That may involve missing civil documents, translation problems, mismatched names, weak chronology, or assumptions that a record will somehow become easier to explain later.",
                bullet_block(
                    "Readers usually need to think about:",
                    [
                        documents,
                        "which documents are foundational and which are only supportive",
                        "how cross-border records should be read together rather than one by one",
                        "why document quality usually matters more than document volume",
                    ],
                ),
                "Once the answer depends heavily on a person’s own records, the issue is usually becoming case-specific even if the reader is still at the research stage.",
            ]
        )
    if title in {"Timing", "Time", "Renewal Logic"}:
        return "\n\n".join(
            [
                f"Timing matters because immigration questions are rarely only about eligibility. They are also about sequence. Good documents prepared too late, good planning done after travel is already fixed, or long-term questions addressed only after a status is already under pressure can all reduce flexibility.",
                f"We encourage readers to think in terms of windows rather than dates alone. A healthy process usually has time for review, document gathering, cross-border coordination, and more than one plausible next move. A weaker process often starts when that margin disappears.",
                bullet_block(
                    "Timing tends to improve when readers can see:",
                    [
                        "which decisions belong before travel or filing and which belong later",
                        "how far in advance supporting documents may need attention",
                        "where renewal or continuity questions should be anticipated rather than discovered late",
                        "why official timelines should be read cautiously rather than as promises",
                    ],
                ),
                "Calmer timing usually produces calmer decisions. That is one reason we keep returning to sequence throughout the site.",
            ]
        )
    if title in {"Common Misunderstandings", "Common Mistakes", "Myths", "Misconceptions", "No Panic", "Instability"}:
        return "\n\n".join(
            [
                f"Misunderstanding is one of the main reasons {subject} feels heavier than it needs to. Most confusion is not caused by carelessness. It comes from incomplete analogies, other people’s timelines, partial reading of official material, or optimistic assumptions that sound reasonable until they meet a real case.",
                f"We prefer to correct those patterns early and calmly. The aim is not to shame readers for not already knowing the system. The aim is to stop repeating the same mistakes once the patterns become visible.",
                bullet_block(
                    "Recurring problems usually include:",
                    myths,
                ),
                "Once those misunderstandings are named, many readers feel immediate relief. The process often stops feeling mysterious and starts feeling more structured.",
            ]
        )
    if title in {"Why This Matters", "Long-Term View", "Context", "Practical Use", "Why Updates Matter", "Service Connection", "Support"}:
        return "\n\n".join(
            [
                f"The value of understanding {subject} is practical rather than academic. Better understanding changes what people compare, what they prepare, what they postpone, and what they stop assuming. In that sense, education is not separate from planning. It is one of the things that makes planning calmer.",
                bullet_block(
                    "Useful signs the article has done its job include:",
                    [
                        "the reader can now describe the real question more clearly",
                        "the next official source to read is easier to choose",
                        "route comparison feels more disciplined and less emotional",
                        "the point at which consultation becomes useful is easier to recognize",
                    ],
                ),
                "That is the wider purpose of the Insights family. We want the public side of the site to genuinely improve the quality of the next decision, even before a service begins.",
            ]
        )
    if title in {"When Reading Stops Being Enough", "Limits", "Current Versus Archived Reading"}:
        return "\n\n".join(
            [
                f"Public reading has limits, and recognizing those limits is part of using it well. General articles are excellent for orientation, vocabulary, comparison, and expectation control. They are not enough once the answer turns on a personal record, a deadline, a refusal, a route comparison based on private facts, or a documentary inconsistency that needs judgment.",
                bullet_block(
                    "General reading has usually reached its limit when:",
                    [
                        "the answer now depends on your own chronology or document set",
                        "you are deciding between two routes that both look plausible at first sight",
                        "an earlier mistake or time-sensitive issue is affecting the decision",
                        "you no longer need more definitions, but a reasoned view on your own case",
                    ],
                ),
                "That boundary is not a failure of the article. It is often proof that the article has done what it should do: bring the real question into focus.",
            ]
        )
    if title == "Next Step":
        return "\n\n".join(
            [
                f"The right next step depends on what changed while you were reading. If the article mainly clarified vocabulary and structure, the next move may simply be to keep reading across the site in a more focused way. If the article surfaced a route comparison, a record problem, or a timing issue that clearly depends on your own facts, consultation is usually the more productive step.",
                bullet_block(
                    "It usually makes sense to reach out when:",
                    [
                        "you can see the issue more clearly but still cannot safely choose the next move",
                        "the question now depends on your own documents, family structure, or travel history",
                        "you suspect an earlier assumption may already have weakened the process",
                        "you want the public explanation translated into a case-specific sequence",
                    ],
                ),
                "That is the handoff we aim for across the site: good public reading first, then structured support when the issue becomes personal.",
            ]
        )
    return ""


def build_editorial_section(slug: str, title: str, resources: list[str]) -> str:
    if slug == "blog":
        mapping = {
            "Overview": "\n\n".join([
                "Our blog is written for readers who want more than news and less than legal theatre. We use it to publish evergreen thinking about Brazil, immigration, relocation, and the kinds of recurring questions that do not disappear just because one update has passed.",
                "That matters because many immigration readers are not looking only for law. They are also looking for orientation, context, examples, and language that makes Brazil feel more readable as a country they may actually live in.",
                bullet_block("The best use of the blog is usually to:", [
                    "build vocabulary before consultation",
                    "compare common planning questions through a calmer lens",
                    "understand how Brazil-related decisions affect one another over time",
                    "move from broad interest into more disciplined research",
                ]),
                "We want the blog to feel useful even to readers who do not reach out immediately. It should still leave them more grounded than when they arrived.",
            ]),
            "Commentary": "\n\n".join([
                "Commentary has value when it improves judgment rather than just expressing a view. That is how we approach it at Immigrate to Brazil. We use commentary to connect public developments, recurring client questions, and everyday Brazil realities in a way that helps people think more clearly.",
                bullet_block("Good commentary usually does at least one of these things:", [
                    "slows down a subject that is being discussed too quickly online",
                    "adds practical context to a legal or administrative issue",
                    "separates one person’s experience from what can responsibly be generalized",
                    "shows how a public topic may affect real planning decisions",
                ]),
                "That is why our commentary stays close to process, culture, and decision quality rather than becoming reactive content for its own sake.",
            ]),
            "Evergreen And Timely": "\n\n".join([
                "Some articles stay useful for years. Others matter because a particular change has made readers uneasy. We try to be honest about that difference. Evergreen posts should help even when the immediate news cycle has faded. Timely posts should still explain what is structural and what is temporary.",
                bullet_block("When we choose topics, we usually ask:", [
                    "will this help readers next month as well as today",
                    "does this answer a recurring real-world question about Brazil",
                    "is the subject broad enough for public education and specific enough to be useful",
                    "can we write it in a way that remains calm even if the topic is timely",
                ]),
                "That balance is part of what makes a content library trustworthy over time.",
            ]),
            "Editorial Standards": "\n\n".join([
                "Editorial standards matter because immigration content can easily become either too vague or too certain. We work against both problems. Our aim is plain-English explanation that stays accurate, structured, and transparent about its limits.",
                bullet_block("In practice, that means:", [
                    "no promise of outcomes that belong to authorities",
                    "clear distinction between general education and case-specific guidance",
                    "careful use of official sources such as " + resources[0] + " and " + resources[1],
                    "a preference for clarity, sequence, and practical relevance over sensational phrasing",
                ]),
                "Readers deserve a site that respects both their intelligence and the seriousness of immigration decisions.",
            ]),
            "Practical Use": "\n\n".join([
                "The blog is most useful when it is read in connection with a real question. That question might be about moving to Brazil, comparing cities, understanding a route family, or getting more realistic about what a process will actually require.",
                bullet_block("A productive reading habit is usually to:", [
                    "start with one article that matches the immediate concern",
                    "open one related guide or insight page rather than five scattered tabs",
                    "notice what has become clearer and what has become more personal",
                    "move to consultation when the article has narrowed the real issue down",
                ]),
                "That is how we try to use public content as part of a real support journey rather than as isolated reading.",
            ]),
            "Sources": "\n\n".join([
                "Whenever a post touches legal or administrative reality, the strongest public anchors are official ones. That is why we link readers toward government portals and institutional references where they are useful, even though those sources often need context to be read well.",
                bullet_block("Useful official anchors often include:", resources[:4]),
                "A public article becomes stronger when the reader knows where the formal references sit and how they differ from commentary.",
            ]),
            "Context": "\n\n".join([
                "Context is one of the most underestimated parts of good Brazil content. Law matters, but so do city choice, housing, routine, language, family structure, work pattern, and long-term plans. Public content becomes more useful when those layers are connected.",
                bullet_block("That wider context often includes:", [
                    "how immigration decisions affect everyday life in Brazil",
                    "how Brazil differs from what readers may know from tourism or short stays",
                    "how place, culture, and bureaucracy interact in ordinary life",
                    "why planning improves when legal and practical layers are read together",
                ]),
                "We keep returning to context because decisions are rarely made inside one category alone.",
            ]),
            "Service Connection": "\n\n".join([
                "Public content should not pressure people into services, but it should make the value of guidance easier to recognize. That is the approach we take. A good article often does not end by saying book now. It ends by making the reader clearer about whether general reading is still enough.",
                bullet_block("Consultation usually becomes more useful when:", [
                    "a post has clarified the subject but not resolved the personal decision",
                    "the reader now sees multiple plausible options and needs them compared",
                    "documents, timing, or prior steps are becoming decisive",
                    "the issue has moved from public reading into private judgment",
                ]),
                "That boundary is where education and service meet in a healthy way.",
            ]),
            "Limits": "\n\n".join([
                "No blog post can substitute for a controlled review of facts and documents. That limit is part of responsible publishing, not a weakness in the content. Public writing can explain, calm, orient, and compare. It cannot decide route fit on incomplete personal information.",
                bullet_block("That limit becomes especially important when:", [
                    "a reader is already under a deadline",
                    "the issue involves refusals, status problems, or documentary inconsistencies",
                    "the answer depends on relationship evidence, travel history, or cross-border records",
                    "the real need is a judgment call rather than another explanation",
                ]),
                "We keep this limit visible because the site should be honest about where public content stops.",
            ]),
            "Next Step": "\n\n".join([
                "If an article has helped you name the real question more clearly, it has already done important work. The next step is simply to decide whether that question still belongs to public reading or whether it now depends on your own facts and documents.",
                bullet_block("A useful next move is usually one of two things:", [
                    "continue reading one more closely related article or guide",
                    "book a consultation once the issue has clearly become personal",
                ]),
                "That is how we want the blog to function: as a calmer and more intelligent front door into Brazil-related decision-making.",
            ]),
        }
        return mapping[title]
    if slug == "updates":
        mapping = {
            "Overview": "\n\n".join([
                "Updates deserve calm reading. People often assume that every legal or administrative change immediately transforms their own case, but that is rarely true. Some updates are structural. Some are narrow. Some affect one route family more than another. Some change public wording without changing the practical result as much as readers fear.",
                bullet_block("That is why our updates page focuses on:", [
                    "what changed in formal terms",
                    "who is most likely to be affected",
                    "what remains the same",
                    "when a personal review becomes more useful than more speculation",
                ]),
                "Our job in public content is to help readers interpret change without amplifying confusion.",
            ]),
            "What Changes": "\n\n".join([
                "A useful update article begins by distinguishing the core change from the surrounding noise. Sometimes the change is a legal text. Sometimes it is a procedural adjustment. Sometimes it is an authority practice shift. The article is stronger when that difference is clear from the beginning.",
                bullet_block("Readers usually need to know:", [
                    "whether the change is legal, administrative, or practical",
                    "which stage of the process it affects",
                    "whether it creates a new opportunity, a new limit, or simply new wording",
                    "how quickly the change is likely to matter in real files",
                ]),
                "That first distinction often does more to calm people than any reassurance could.",
            ]),
            "Legal And Administrative Updates": "\n\n".join([
                "Legal updates and administrative updates are related, but they are not the same. A law or decree creates one level of change. Administrative interpretation, practice, portals, forms, or scheduling behavior can create another. Good update reading keeps both layers visible.",
                bullet_block("Official anchors matter here, especially:", resources[:4]),
                "This is one of the reasons we avoid dramatic language around updates. Readers usually need interpretation, not panic.",
            ]),
            "Authority Practice": "\n\n".join([
                "Authority practice can change how a file feels even when the formal law has not shifted much at all. That may involve documentation habits, appointment expectations, how certain evidence is read in practice, or the rhythm of a specific public body.",
                bullet_block("A careful update reading usually asks:", [
                    "which authority is actually affected",
                    "whether the practice change is local, national, temporary, or durable",
                    "whether the change affects first-time filings, renewals, or both",
                    "how much of the change can be confirmed publicly and how much remains practical observation",
                ]),
                "That level of care helps readers avoid overreacting to partial information.",
            ]),
            "Why Updates Matter": "\n\n".join([
                "Updates matter because sequence matters. When a person is planning a move, gathering documents, or deciding between routes, even a narrow procedural change can affect timing or strategy. But good update reading also prevents overcorrection. Not every update requires a complete rethink.",
                bullet_block("Updates become especially relevant when:", [
                    "a filing or appointment is close",
                    "a route is already being compared in real time",
                    "documents are being prepared and the evidentiary standard may have shifted",
                    "the person is relying on older online content without checking whether it is still current",
                ]),
                "That is why we treat update interpretation as part of decision quality, not just content production.",
            ]),
            "Instability": "\n\n".join([
                "The feeling of instability often comes less from the update itself and more from how readers encounter it. One message says everything changed. Another says nothing changed. A third cites an old rule. Good content has to make room for that emotional reality while still bringing the topic back to evidence.",
                bullet_block("A steadier response usually comes from:", [
                    "reading the update against the official source instead of a secondhand summary alone",
                    "checking which authority or route family is actually involved",
                    "remembering that a change in one stage does not necessarily change the whole journey",
                    "moving to case-specific review if the update truly affects your next action",
                ]),
                "Calm is part of process quality. It helps people think more clearly under change.",
            ]),
            "How We Explain Them": "\n\n".join([
                "We explain updates by separating text, practice, effect, and next-step relevance. That means showing readers what changed formally, what may change practically, who should care most, and where the update still needs to be read in context rather than isolation.",
                bullet_block("Our approach is usually to explain:", [
                    "the official basis of the update",
                    "the practical level at which readers may feel it",
                    "the boundaries of what public content can conclude",
                    "the point at which a private review becomes the safer next move",
                ]),
                "This keeps the update useful instead of merely urgent-sounding.",
            ]),
            "No Panic": "\n\n".join([
                "No panic does not mean no action. It means proportionate action. Many readers need permission to slow down, verify the source, and ask the narrower question before they restructure an entire plan around one headline.",
                bullet_block("A disciplined response is usually to:", [
                    "identify the exact part of the process the update touches",
                    "check the official source before relying on commentary",
                    "avoid assuming universal effect from one narrow change",
                    "seek guidance if the update directly affects a pending personal decision",
                ]),
                "That is the tone we want this page to set: calm, serious, and structured.",
            ]),
            "Current Versus Archived Reading": "\n\n".join([
                "Archived content still has value, but only if it is read as context rather than as current instruction. Brazil immigration reading improves when readers learn to notice dates, source authority, and whether an older explanation has been overtaken by later law, practice, or procedure.",
                bullet_block("When comparing older and newer material, check:", [
                    "the publication date",
                    "the authority behind the text",
                    "whether the issue is legal, administrative, or practical",
                    "whether the older content is still useful for context even if not for present action",
                ]),
                "That habit alone can save readers from a surprising amount of confusion.",
            ]),
            "Next Step": "\n\n".join([
                "If an update has made your situation feel more urgent, the next step is not automatically to act faster. The next step is to act more clearly. Sometimes that means reading the official source more carefully. Sometimes it means comparing one more relevant page. Sometimes it means moving to consultation because the update now touches your own case directly.",
                bullet_block("Structured next steps usually include:", [
                    "verifying the official source",
                    "checking whether the update actually affects your stage or route",
                    "avoiding broad assumptions based on partial summaries",
                    "booking case-specific guidance if the update now changes your own timing or documentation decisions",
                ]),
                "That is the standard we aim for: useful interpretation that leads to better judgment rather than faster anxiety.",
            ]),
        }
        return mapping[title]
    if slug == "guides":
        mapping = {
            "Overview": "\n\n".join([
                "Guides are where research becomes practical. They are written for readers who are moving toward Brazil, arriving in Brazil, or already here and trying to make the first months feel more orderly. We use this page to connect immigration thinking to daily-life reality rather than treating them as separate subjects.",
                bullet_block("Good guides usually help readers with:", [
                    "moving sequence and first-step planning",
                    "documents and record control",
                    "settling tasks that affect stability after arrival",
                    "the everyday questions that sit next to immigration decisions",
                ]),
                "We want these guides to feel usable, not just informative.",
            ]),
            "Practical Guidance": "\n\n".join([
                "Practical guidance matters because relocation stress often comes from ordinary details rather than dramatic legal problems. Housing, language, transport, phones, healthcare, schools, CPF, banking, and document organization all affect how Brazil feels once the move becomes real.",
                bullet_block("That is why our guides usually focus on:", [
                    "what needs to happen first",
                    "what can wait until later",
                    "what is easier to organize before arrival",
                    "where guidance becomes more useful than improvisation",
                ]),
                "A calmer move is usually the result of better order rather than more hustle.",
            ]),
            "Before The Move": "\n\n".join([
                "The period before a move to Brazil is when sequencing can save the most trouble. Readers often focus on flights and city excitement first, but the stronger early questions are usually about route fit, documents, budget, accommodation strategy, language expectations, and how the first weeks will be financed and structured.",
                bullet_block("Before the move, it is usually worth clarifying:", [
                    "which documents still need attention before travel",
                    "how the first address or housing arrangement will work",
                    "what must be done quickly after arrival",
                    "which assumptions about cost or routine still need checking",
                ]),
                "Those early answers often shape whether the move feels coherent or chaotic.",
            ]),
            "After Arrival": "\n\n".join([
                "After arrival, Brazil quickly stops being an idea and starts becoming a daily system. That is when routines, registration-sensitive tasks, housing realities, transport, healthcare access, and Portuguese start affecting confidence in a more immediate way.",
                bullet_block("The first phase after arrival often involves:", [
                    "getting organized around address, documents, and local routines",
                    "understanding which obligations are time-sensitive and which are not",
                    "choosing which daily-life systems need attention first",
                    "building a steadier rhythm instead of trying to solve everything in one week",
                ]),
                "That adjustment period is normal. Good guidance helps make it more manageable.",
            ]),
            "Documents": "\n\n".join([
                "Documents remain central in guides because so many everyday tasks in Brazil depend on keeping records organized and readable. Even when the guide is not about filing itself, document quality still affects banking, housing, family administration, school conversations, and later immigration stages.",
                bullet_block("Useful document habits usually include:", [
                    "keeping digital and physical copies organized early",
                    "tracking translations, apostilles, and originals carefully",
                    "not waiting until the last minute to discover missing civil records",
                    "understanding which documents matter for legal continuity and which matter mainly for daily administration",
                ]),
                "Good document habits make the rest of the move feel more stable than people often expect.",
            ]),
            "Daily-Life Questions": "\n\n".join([
                "Daily-life questions often determine whether someone feels they are really settling into Brazil or only passing through it. These questions are not secondary. They shape comfort, cost, energy, and whether the move still feels like the right decision after the novelty fades.",
                bullet_block("Common daily-life questions usually involve:", [
                    "how to manage housing and neighborhood fit",
                    "how to build routine around transport, shopping, and services",
                    "how language affects ordinary confidence",
                    "how families, remote workers, retirees, and students experience Brazil differently",
                ]),
                "That human layer is part of why we write guides at all.",
            ]),
            "Mistakes": "\n\n".join([
                "Guide-based mistakes are often simple but costly: arriving without the right document order, underestimating housing friction, assuming tourism experience predicts daily life, or postponing important tasks until stress is already high. We prefer to name those patterns gently and early.",
                bullet_block("Common avoidable mistakes include:", [
                    "planning arrival around excitement rather than sequence",
                    "treating one city visit as if it answered the whole place question",
                    "underestimating language and local process habits",
                    "leaving critical records or budget planning too late",
                ]),
                "A useful guide should help readers avoid repeating those patterns without making the move sound frightening.",
            ]),
            "Service Connection": "\n\n".join([
                "Guides are often the point where readers realize they no longer need only information. They need structure. That does not mean every guide should push a service. It means the guide should make the value of structured support easier to recognize when the issue becomes personal, time-sensitive, or document-heavy.",
                bullet_block("Support usually becomes more useful when:", [
                    "the guide has clarified the issue but not solved the personal decision",
                    "multiple moving parts now need to be coordinated together",
                    "documents, deadlines, or prior mistakes are affecting the move",
                    "the difference between a smooth move and a stressful move now depends on sequence rather than more reading",
                ]),
                "That is the bridge we want these guides to create.",
            ]),
            "Limits": "\n\n".join([
                "Even the strongest guide has limits. Public guidance can explain, orient, and compare. It cannot substitute for a personal review of facts, documents, deadlines, or vulnerabilities in the file. Keeping that limit visible is part of making the content trustworthy.",
                bullet_block("Guide reading usually reaches its limit when:", [
                    "the question turns on your own chronology or documents",
                    "the route is plausible but still uncertain",
                    "there is urgency, prior error, or authority exposure",
                    "the next move needs judgment rather than another article",
                ]),
                "That is often the moment where structured consultation becomes more efficient than continued browsing.",
            ]),
            "Next Step": "\n\n".join([
                "A guide has done its job when it leaves you calmer and more decisive. The next step may be to read one closely related page, compare cities or routes with more discipline, or bring the question into consultation now that the practical issue is clearly defined.",
                bullet_block("Useful next moves often include:", [
                    "checking one official source linked on the page",
                    "opening the most relevant sibling article instead of starting a new random search",
                    "deciding which part of the move still needs structure",
                    "booking guidance once the issue has become clearly personal",
                ]),
                "That is the reading rhythm we want across the site: orientation first, then disciplined action.",
            ]),
        }
        return mapping[title]
    return ""


def polish_insights_page(page: Page) -> Page:
    slug = "hub" if page.path == "/insights/" else page.path.strip("/").split("/")[-1]
    page.hero_title, page.hero_summary = INSIGHT_HERO[slug]
    page.resources = INSIGHT_RESOURCE_MAP[slug]
    if slug == "hub":
        page.sections = [
            ("Section 1. Overview", "\n\n".join([
                "The Insights hub is where Brazil-related reading becomes more structured. It brings together evergreen explainers, FAQ-style answers, practical guides, and calm commentary so readers can understand Brazil more clearly before their own case requires individual review.",
                "We designed this part of the site for people who are still building understanding. Some want to know how Brazil immigration works. Others want better context on residency, naturalisation, process, or everyday planning. Many simply need one place to start without falling into contradictory tabs and low-quality summaries.",
                bullet_block("A useful way to think about this hub is:", [
                    "General for basics and system vocabulary",
                    "Visa for entry and consular logic",
                    "Residency for longer-term stay and continuity",
                    "Naturalisation for citizenship planning",
                    "Process for how a real file moves in practice",
                    "Blog, Updates, and Guides for deeper reading around Brazil and relocation",
                ]),
                "We want this hub to feel like a reliable reading desk, not a content maze.",
            ])),
            ("Section 2. Explore The Reading Paths", "\n\n".join([
                "Different readers need different entry points. A first-time reader is often better served by the General page or the Guides page. Someone already comparing routes may get more value from Visa or Residency. Someone following regulatory discussion may want Updates or the Blog first.",
                bullet_block("A strong reading path often looks like this:", [
                    "start with the page that matches the real question, not the most dramatic one",
                    "open one adjacent page to deepen the issue rather than five unrelated ones",
                    "use official sources when you need the formal anchor, but use these pages for context and interpretation",
                    "move to consultation once the answer clearly depends on your own facts or records",
                ]),
                "That reading discipline saves time and usually leaves the reader calmer as well.",
            ])),
            ("Section 3. How To Read These Pages", "\n\n".join([
                "The best way to use the Insights family is to read for structure rather than for isolated answers. Brazil becomes more understandable when the reader can see how law, public authorities, documents, place, timing, and long-term planning connect to one another instead of sitting in separate boxes.",
                bullet_block("A good reading method is usually to:", [
                    "identify the real decision first",
                    "read one article slowly enough to improve vocabulary and orientation",
                    "follow the internal links into one related page only",
                    "notice when the subject has shifted from public education into private judgment",
                ]),
                "That shift is important. It helps readers know when more reading is useful and when it is simply delaying a clearer next step.",
            ])),
            ("Section 4. What Insights Are For", "\n\n".join([
                "These articles are meant to do three things well: explain Brazil in plain but serious language, answer recurring questions without false certainty, and prepare readers for better decisions later. They are not meant to imitate individualized advice. They are meant to make individualized advice more focused when it becomes necessary.",
                bullet_block("In practice, that means:", [
                    "clear explanation of public systems and common terminology",
                    "useful boundaries around what a public page can and cannot resolve",
                    "honest acknowledgment of uncertainty where authority discretion still matters",
                    "encouragement toward consultation only when the issue has genuinely become personal",
                ]),
                "That balance matters to us because trust is easier to build when the public content is genuinely useful on its own.",
            ])),
            ("Section 5. Best Next Step", "\n\n".join([
                "If you are still orienting yourself, the best next step is simply to open the article that most closely matches your real question and keep narrowing from there. If you already know the question clearly but the answer now depends on your own documents, relationship history, route fit, or timing, the next step is usually consultation.",
                bullet_block("Consultation tends to make sense once:", [
                    "you are comparing real options rather than reading broadly",
                    "a personal record or deadline is now driving the answer",
                    "an earlier mistake may already be affecting the process",
                    "you want the public explanation translated into a real sequence for your case",
                ]),
                "That is the handoff we aim for across the site: strong public orientation first, structured private guidance second.",
            ])),
        ]
        page.end_cta = "Read the article that matches the real question on your mind, and reach out when the answer now depends on your own chronology, route fit, documents, or deadlines."
        return page
    new_sections = []
    for title, _body in page.sections:
        name = title.split(". ", 1)[1] if ". " in title else title
        if slug in {"blog", "updates", "guides"}:
            body = build_editorial_section(slug, name, page.resources)
        else:
            body = build_insight_section(slug, name, page.resources)
        new_sections.append((title, body))
    page.sections = new_sections
    page.end_cta = "If this article has made the issue clearer, the next step is to decide whether you still need public reading or whether the question now depends on your own records, timing, or route comparison. When it does, consultation becomes the safer next move."
    return page


def polish_brazil_page(page: Page) -> Page:
    slug = page.path.strip("/").split("/")[-1]
    page.resources = BRAZIL_RESOURCE_MAP.get(slug, page.resources)
    if page.path == "/brazil/":
        page.sections = [
            ("Section 1. Overview", "\n\n".join([
                "Brazil is easiest to misunderstand when it is treated as one mood, one trip, or one city. In reality, Brazil is a vast country with strong regional differences in climate, cost, infrastructure, pace, and social rhythm. This hub exists to help readers approach Brazil as a real place to plan around rather than a broad fantasy.",
                "We built this family to support the moment where attraction starts becoming decision-making. Readers come here to compare lifestyle questions, understand regions, think more realistically about cost and quality of life, and explore how Brazil may fit work, family, retirement, business, or remote living.",
                bullet_block("This hub is most useful when you want to understand:", [
                    "how Brazil differs from one region to another",
                    "what everyday life may look like beyond tourism",
                    "how cost, housing, education, healthcare, and safety interact",
                    "which questions should be answered before choosing a city or immigration path",
                ]),
                "The goal is not to reduce Brazil to a checklist. It is to make the country feel more readable for someone who is seriously considering a future here.",
            ])),
            ("Section 2. Explore The Main Topics", "\n\n".join([
                "The pages inside this hub are organized around the questions foreigners most often ask before or during a move. Some pages explain Brazil at the country level. Others focus on practical life, costs, safety, education, or the regional differences that become decisive once a shortlist begins to form.",
                bullet_block("A strong reading path often starts with:", [
                    "Brazil for country-level understanding",
                    "Quality, Living, and Cost for daily-life realism",
                    "Places for regional comparison",
                    "Healthcare, Education, and Housing for family or long-term planning",
                    "Investment and Economy for readers connecting Brazil to business or capital decisions",
                ]),
                "You do not need to read everything. The most useful approach is to start with the question that is already shaping your decision.",
            ])),
            ("Section 3. How To Use This Hub", "\n\n".join([
                "The strongest way to use the Brazil hub is to move from broad understanding into narrower comparison. Start with the pages that help you answer country-level fit, then move into regions, cities, cost, and everyday systems. That order usually produces better judgment than starting with one city and trying to force the whole country to match it.",
                bullet_block("A practical reading order is often:", [
                    "country first",
                    "region or place second",
                    "daily-life systems third",
                    "route and consultation once the move starts becoming real",
                ]),
                "That sequence helps readers protect enthusiasm while still bringing planning quality up to the level the move deserves.",
            ])),
            ("Section 4. Reading Lens", "\n\n".join([
                "Brazil rarely answers one question at a time. A city decision is also a cost decision. A cost decision is also a housing and routine decision. A housing decision may affect school choice, safety habits, transport, healthcare access, and how sustainable remote work feels. A good reading lens keeps those layers connected.",
                bullet_block("When more than one page feels relevant, ask:", [
                    "which issue is most urgent right now",
                    "which issue will shape the decision after that",
                    "which issue is still public research and which is becoming personal planning",
                    "whether the move now needs structured support rather than more browsing alone",
                ]),
                "That is where Immigrate to Brazil adds value: not by flattening Brazil, but by helping readers organize the parts that matter most to their real move.",
            ])),
            ("Section 5. Best Next Step", "\n\n".join([
                "If you are still deciding whether Brazil fits you at all, keep reading within this family and use the official resources on each page to deepen the research. If you already know that Brazil is serious for you, and the question has become which city, which route, which timing, or which long-term plan makes the most sense, consultation is usually the stronger next step.",
                bullet_block("Consultation often makes sense when:", [
                    "city choice and immigration route now need to be read together",
                    "budget, family, work, and long-term continuity all affect the same decision",
                    "you need someone to help compare options instead of only describing them",
                    "you want the Brazil research translated into an actual relocation plan",
                ]),
                "That is the transition this hub is designed to support: from interest in Brazil to a more disciplined, confident next move.",
            ])),
        ]
        page.end_cta = "Open the Brazil topic that matches the decision you are trying to make next, and reach out when the move now depends on route, city, budget, family context, or long-term planning being tested together."
    if page.path == "/brazil/places/":
        page.sections = [
            ("Section 1. Overview", "\n\n".join([
                "Place is where Brazil becomes real. The same person may thrive in one city and feel completely misaligned in another. Climate, infrastructure, safety habits, housing patterns, social rhythm, healthcare access, education options, transport, and language environment all shift enough across Brazil that place choice deserves its own structured hub.",
                "We created the Places family to help readers compare regions and place scales more carefully. Some will be drawn to major capitals. Others will prefer mid-sized cities or municipalities with a different pace. What matters is not choosing the most famous place. It is choosing the place that actually supports the life being built.",
                bullet_block("The pages inside this hub help readers compare:", [
                    "regions such as the North, Northeast, Southeast, South, and Central-West",
                    "the difference between states, cities, and municipalities",
                    "place-based trade-offs in climate, cost, services, and routine",
                    "why one city’s public image should not stand in for the whole region",
                ]),
                "That kind of place literacy often changes the quality of a Brazil move more than any single article about visas ever could.",
            ])),
            ("Section 2. Explore The Main Topics", "\n\n".join([
                "The Places hub is designed to move readers from broad geography into more practical comparison. Regional pages help with identity, climate, and economic pattern. The States, Cities, and Municipalities pages help narrow the scale. Directory and Search are there to make navigation easier once the shortlist is starting to form.",
                bullet_block("A useful way to move through this hub is:", [
                    "start with the region if your shortlist is still broad",
                    "move to states or cities if you already know the region",
                    "use municipalities when neighborhood, metro-area, or service access differences are becoming important",
                    "use directory and search when you want to locate related guidance faster",
                ]),
                "This helps people compare Brazil in a way that is operational, not just aspirational.",
            ])),
            ("Section 3. How To Use This Hub", "\n\n".join([
                "Place comparison works best when readers hold routine in view. A shortlist should not only reflect beauty or reputation. It should also reflect budget, housing, family needs, medical access, flights, work pattern, weather tolerance, and how much urban intensity or quiet the person actually wants.",
                bullet_block("A strong place comparison usually asks:", [
                    "what the daily routine needs to look like",
                    "what services or infrastructure are essential",
                    "what climate and pace feel sustainable over time",
                    "how the place fits the route and life stage being considered",
                ]),
                "The hub is here to help people ask those questions early enough for the answers to be useful.",
            ])),
            ("Section 4. Reading Lens", "\n\n".join([
                "No place should be judged in isolation from the life it is supposed to support. A city that is excellent for one remote worker may be a poor fit for a family with school-age children. A low-cost municipality may create transport or healthcare trade-offs that matter more than the rent. A lively capital may feel energizing for one person and exhausting for another.",
                bullet_block("A mature reading lens keeps asking:", [
                    "fit for whom",
                    "fit for which routine",
                    "fit at which budget",
                    "fit for which stage of life in Brazil",
                ]),
                "That kind of comparison protects readers from choosing the place they admired most online instead of the place that actually fits them best.",
            ])),
            ("Section 5. Best Next Step", "\n\n".join([
                "If you are still comparing places broadly, keep using the region and place-scale pages to narrow the shortlist. If the shortlist is already small and the next question is how city choice interacts with immigration route, family structure, work, or long-term stability, the more useful next step is usually consultation.",
                bullet_block("Structured guidance is especially useful when:", [
                    "two or three places all still look plausible",
                    "the right route may depend on where and how you plan to live",
                    "family, healthcare, education, or budget trade-offs are becoming decisive",
                    "you want place research translated into a practical relocation sequence",
                ]),
                "That is how this hub is meant to work: first comparison, then clearer decision-making.",
            ])),
        ]
        page.end_cta = "Open the region, state, city, or municipality page that most closely matches your shortlist, and contact us when place choice now needs to be read together with immigration route, daily routine, or long-term planning."
    return page


def polish_process_page(page: Page) -> Page:
    slug = process_slug(page)
    if page.path == "/process/":
        page.sections = [
            (
                title,
                polish_hub_wording(body, "process pages").replace(
                    "People often know the route label they are interested in, but not the order, responsibilities, risks, deadlines, or aftercare questions that make the route stable in real life.",
                    "People often know the outcome they want, but not the order, responsibilities, risks, deadlines, or aftercare questions that make the process stable in real life.",
                ),
            )
            for title, body in page.sections
        ]
        return page
    page.hero_summary = PROCESS_HERO.get(slug, page.hero_summary)
    page.sections = [
        (title, body.replace("route label they are interested in", "result they want to reach").replace("This page explains", "We explain"))
        for title, body in page.sections
    ]
    return page


def polish_services_page(page: Page) -> Page:
    parts = page.path.strip("/").split("/")
    if len(parts) <= 2:
        page.sections = [(title, polish_hub_wording(body, "service pages")) for title, body in page.sections]
        if page.path == "/services/visas/":
            page.end_cta = page.end_cta.replace("if the route label sounds right", "if the category seems close")
        return page
    family = parts[1]
    leaf = parts[-1]
    display = service_name(page)
    route_or_service = "path" if family in {"visas", "residencies", "naturalisation"} else "service"
    hero = {
        "advisory": f"{display.capitalize()} is where clarity becomes structured action. We explain who usually benefits from it, what it helps resolve, how we approach it at Immigrate to Brazil, and what tends to change once the situation is finally being read in the right order.",
        "defense": f"{display.capitalize()} requires calmer judgment under pressure. We explain when urgency is real, how we stabilize the situation, what records usually matter first, and where legal structure becomes essential.",
        "naturalisation": f"{display.capitalize()} should be read through continuity, records, timing, and long-range legal planning rather than hope alone. We explain how we approach that work at Immigrate to Brazil and what usually changes once the path is reviewed properly.",
        "other": f"{display.capitalize()} often looks secondary until it starts slowing everything else down. We explain what this support covers, where it fits in the wider process, and how it helps make a Brazil file more executable in practice.",
        "residencies": f"{display.capitalize()} matters when lawful stay in Brazil is becoming a real life question rather than a broad idea. We explain who this support is for, how the route is usually read, where people get stuck, and how we help bring structure to it.",
        "visas": f"{display.capitalize()} only works well when the purpose of entry, the documents, and the later plan still make sense together. We explain how we approach that support at Immigrate to Brazil so the route can be judged more carefully from the start.",
    }
    page.hero_summary = hero.get(family, page.hero_summary)

    fixed_sections = []
    for title, body in page.sections:
        text = body
        raw_leaf = leaf.replace("-", " ")
        text = text.replace(f"{raw_leaf} stage", display)
        text = text.replace(f"{raw_leaf} support", display)
        text = text.replace(f"{raw_leaf} route", display)
        text = text.replace(f"{raw_leaf} matter", display)
        text = text.replace(f"{raw_leaf.capitalize()} stage", display.capitalize())
        text = text.replace(f"{raw_leaf.capitalize()} support", display.capitalize())
        text = text.replace(f"{raw_leaf.capitalize()} route", display.capitalize())
        text = text.replace(f"{raw_leaf.capitalize()} matter", display.capitalize())
        text = re.sub(r"\b([A-Za-z][A-Za-z -]+?) support support\b", r"\1 support", text)
        text = re.sub(r"\b([A-Za-z][A-Za-z -]+?) matter matters\b", r"\1 matters", text)
        text = text.replace("that a a familiar", "that a familiar")
        text = text.replace("route label alone", "a familiar category name alone")
        text = text.replace("treating the route label as if it were the whole strategy", "treating the first familiar category name as if it settled the whole strategy")
        text = text.replace("what this route is genuinely designed to cover", f"what this {route_or_service} is actually meant to solve")
        text = text.replace("how this route behaves", f"how this {route_or_service} works in practice")
        text = text.replace("how this route connects", f"how this {route_or_service} connects")
        text = text.replace("the route label", "the category name")
        text = text.replace("This page explains how we handle", "We explain how we approach")
        text = text.replace("support is designed for", "is designed for")
        fixed_sections.append((title, text))
    page.sections = fixed_sections
    return page


def polish_doc(path_str: str) -> None:
    path = ROOT / path_str
    pages = parse_doc(path)
    polished: list[Page] = []
    for page in pages:
        if page.path.startswith("/insights"):
            polished.append(polish_insights_page(page))
        elif page.path.startswith("/brazil"):
            polished.append(polish_brazil_page(page))
        elif page.path.startswith("/process"):
            polished.append(polish_process_page(page))
        elif page.path.startswith("/services"):
            polished.append(polish_services_page(page))
        else:
            polished.append(page)
    heading_lines = path.read_text(encoding="utf-8").splitlines()
    preamble: list[str] = []
    for line in heading_lines:
        if line.startswith("## /"):
            break
        preamble.append(line)
    write_doc(path, polished, preamble)


def main() -> None:
    for doc in [
        "docs/services-family-client-preview.md",
        "docs/process-and-aftercare-client-preview.md",
        "docs/brazil-and-places-client-preview.md",
        "docs/insights-client-preview.md",
    ]:
        polish_doc(doc)


if __name__ == "__main__":
    main()
