from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]


COMMON = {
    "migration_law": "[Lei de Migracao — Lei 13.445/2017](https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2017/Lei/L13445.htm)",
    "migration_decree": "[Decreto 9.199/2017](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/D9199.htm)",
    "pf": "[Policia Federal — Migracao](https://www.gov.br/pf/pt-br/assuntos/carta-de-servicos/migracao)",
    "itamaraty": "[Ministerio das Relacoes Exteriores](https://www.gov.br/mre/pt-br)",
    "ibge_states": "[IBGE — Cidades e Estados](https://www.ibge.gov.br/cidades-e-estados)",
    "ibge_map": "[IBGE — Mapa politico do Brasil](https://www.ibge.gov.br/geociencias/cartas-e-mapas/mapas-de-referencia/15816-politico.html)",
    "ibge_census": "[IBGE — Censo Demografico 2022](https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html)",
    "tourism": "[Ministerio do Turismo](https://www.gov.br/turismo/pt-br)",
    "health": "[Ministerio da Saude — SUS](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/sus)",
    "ans": "[ANS — Saude Suplementar](https://www.gov.br/ans/pt-br)",
    "mec": "[Ministerio da Educacao](https://www.gov.br/mec/pt-br)",
    "inep": "[INEP](https://www.gov.br/inep/pt-br)",
    "economy": "[gov.br — Empresas e Negocios](https://www.gov.br/empresas-e-negocios/pt-br)",
    "bcb": "[Banco Central do Brasil — Estatisticas](https://www.bcb.gov.br/estatisticas)",
    "apex": "[ApexBrasil](https://apexbrasil.com.br/)",
    "culture": "[Ministerio da Cultura](https://www.gov.br/cultura/pt-br)",
    "security": "[Ministerio da Justica e Seguranca Publica](https://www.gov.br/mj)",
    "inmet": "[INMET](https://portal.inmet.gov.br/)",
}


SERVICE_LABELS = {
    "nomad": "digital nomad route",
    "investor": "investor route",
    "reunion": "family reunion route",
    "work": "work-related route",
    "student": "student route",
    "study": "study route",
    "tourist": "tourist entry route",
    "business": "business-visit route",
    "cplp": "CPLP residence route",
    "mercosul": "Mercosul residence route",
    "health": "health-linked route",
    "humanitarian": "humanitarian route",
    "retiree": "retiree route",
    "religious": "religious route",
    "research": "research route",
    "youth": "youth route",
    "volunteer": "volunteer route",
    "exchange": "exchange route",
    "educational": "educational route",
    "skilled": "skilled residence route",
    "family": "family-linked route",
    "medical": "medical route",
    "startup": "startup route",
    "ordinary": "ordinary naturalisation path",
    "extraordinary": "extraordinary naturalisation path",
    "special": "special naturalisation path",
    "provisional": "provisional naturalisation path",
    "renunciation": "renunciation matter",
    "reacquisition": "reacquisition matter",
    "appeals": "appeal matter",
    "deportation": "deportation exposure",
    "expulsion": "expulsion exposure",
    "extradition": "extradition-related matter",
    "fines": "immigration fines matter",
    "litigation": "immigration litigation matter",
    "translation": "translation support",
    "regularization": "regularization support",
    "records": "records support",
    "consular": "consular support",
    "consultation": "consultation stage",
    "strategy": "strategy stage",
    "representation": "representation support",
    "corporate": "corporate support",
    "compliance": "compliance support",
}


BRAZIL_FACTS = {
    "brazil": ["largest country in South America by area", "26 states plus the Federal District", "Portuguese as the official language", "major regional diversity in climate and economy"],
    "investment": ["large domestic market", "regional variation in opportunity", "strong role for services, tourism, agribusiness, and real estate", "need for due diligence and structure"],
    "economy": ["largest economy in Latin America", "important role for services and agribusiness", "currency and inflation as real planning variables", "regional concentration of opportunity"],
    "quality": ["strong role for climate and social life", "quality varies by city and budget", "public and private services coexist", "quality of life is highly place-dependent"],
    "living": ["daily life differs greatly between megacities and mid-sized cities", "social routine matters strongly", "transport and housing shape comfort", "adaptation depends on realism and language"],
    "cost": ["exchange rate matters for foreign-income households", "housing is often the biggest monthly variable", "city and neighborhood differences are major", "budget resilience matters more than one average number"],
    "housing": ["renting can involve guarantee and documentation questions", "condominium fees matter", "neighborhood choice is often decisive", "property purchase should not be confused with immigration strategy"],
    "healthcare": ["SUS matters to all residents", "private care is a major planning factor", "city-level quality differences matter", "navigation and language affect access"],
    "education": ["public and private systems differ strongly", "language matters for fit and continuity", "city choice affects school options", "higher education can matter to route planning too"],
    "safety": ["safety varies sharply by city and neighborhood", "routine and habit matter", "media perception can distort reality", "place-specific reading is essential"],
    "culture": ["regional cultural expression is strong", "music and food are central to daily life", "language shapes belonging", "Brazilian identity is plural rather than uniform"],
    "festivals": ["Carnaval is only one festival family", "regional calendars matter", "music and community are central", "festival life affects tourism and local identity"],
    "cuisine": ["rice and beans remain a core staple pattern", "regional dishes differ strongly", "street food is part of urban rhythm", "food is also a social practice"],
    "events": ["music and sport shape public life", "city calendars differ greatly", "business and cultural events both matter", "events change how a city feels over time"],
    "guides": ["good guides reduce sequence mistakes", "first-month tasks are often underestimated", "documentation stress usually comes from weak order", "support matters when general information stops being enough"],
    "faqs": ["visa and residency questions recur constantly", "cost and safety are common concerns", "language and work questions are highly profile-specific", "plain-English clarity reduces avoidable confusion"],
    "north": ["Amazonian geography matters", "river and air logistics shape life", "heat and humidity are significant", "urban centers like Manaus and Belem play unique roles"],
    "northeast": ["strong tourism and hospitality presence", "major coastal capitals matter", "regional identity is powerful", "climate and infrastructure vary between coast and interior"],
    "central-west": ["Brasilia as the federal capital", "agribusiness and logistics weight", "cerrado landscape and seasonal rhythm", "different pace of urban life"],
    "southeast": ["major concentration of business and services", "large airport and transport networks", "wide cost differences within one region", "strong city variety from global metros to mid-sized centers"],
    "south": ["cooler subtropical climate", "mid-sized city strength", "education, health, and technology hubs in selected centers", "different rhythm from tropical-coastal expectations"],
    "states": ["state-level comparison adds administrative reality", "state identity shapes culture and services", "states help narrow the shortlist", "state context affects city interpretation"],
    "cities": ["city choice shapes daily life more than country image", "scale changes routine and transport", "healthcare and schools vary by city", "urban feel matters as much as reputation"],
    "municipalities": ["metro and municipal boundaries change daily experience", "neighboring cities can feel very different", "administrative boundaries affect services", "fine-grained research improves city choice"],
    "directory": ["organized reading saves time", "categories help reduce scattered research", "location-aware filtering matters", "directory use is stronger when tied to a real shortlist"],
    "search": ["good search reduces noise", "filters help narrow efficiently", "keyword discipline matters", "search has limits once the issue becomes personal"],
}


PROCESS_KEYWORDS = {
    "consultation": "clarity, timing, real context, and what the process needs next",
    "assessment": "facts, documents, route viability, and realistic positioning",
    "strategy": "pathway comparison, sequencing, timing, and structured direction",
    "filing": "preparation quality, document control, submission sequence, and risk reduction",
    "approval": "authority review, expectation control, variability, and next steps",
    "mistakes": "common errors, sequence problems, and preventable friction",
    "failures": "refusals, stalled matters, weak preparation, and recovery options",
    "deadlines": "windows, limits, control, and timing discipline",
    "obligations": "maintenance duties, compliance, and continuity after key steps",
    "alone": "the limits of self-navigation in complex immigration matters",
    "transparency": "communication, boundaries, candor, and realistic expectations",
    "fees": "scope, stage-based value, payment logic, and cost clarity",
    "refund": "eligibility, limitations, fairness, and review logic",
    "timeline": "stages, variability, delays, and planning discipline",
    "aftercare": "continuity, stability, compliance, and life after the initial stage",
    "responsibilities": "roles, cooperation, timing, and shared accountability",
    "rights": "protections, access, awareness, and what can reasonably be expected",
    "renewal": "continuity, timing, preparation, and avoiding avoidable breaks",
    "permanent": "longer-term stability, eligibility, and what permanent status really changes",
    "naturalisation": "citizenship planning, documentary continuity, and long-range thinking",
    "compliance": "ongoing alignment, monitoring, and keeping the file healthy over time",
    "conversion": "transition from one position to another with proper sequence",
    "regularization": "correction, stabilization, and rebuilding a workable path",
    "planning": "goals, stages, route fit, and forward sequencing",
}


INSIGHT_FOCUS = {
    "general": "Brazil immigration structure, terminology, institutions, and the broad distinctions that help people ask better questions",
    "visa": "entry categories, consular logic, route fit, and why visa labels often mislead readers who have only broad information",
    "residency": "longer-term stay, continuity, obligations, and the practical difference between entry and building life in Brazil",
    "naturalisation": "citizenship thinking, continuity, records, and long-term legal planning",
    "process": "how immigration work moves from understanding into strategy, preparation, filing, and aftercare",
    "blog": "editorial reading that helps turn immigration confusion into better judgment",
    "updates": "change-aware reading, why updates matter, and how to interpret them responsibly",
    "guides": "step-by-step educational content that sits between broad reading and case-specific support",
}


@dataclass
class Page:
    path: str
    hero_title: str
    hero_summary: str
    links: list[str]
    resources: list[str]
    sections: list[tuple[str, str]]
    end_cta: str


def parse_doc(path: Path) -> list[Page]:
    lines = path.read_text().splitlines()
    pages: list[Page] = []
    i = 0
    while i < len(lines):
        if not lines[i].startswith("## /"):
            i += 1
            continue
        route = lines[i][3:].strip()
        i += 1
        while i < len(lines) and lines[i] == "":
            i += 1
        assert lines[i] == "**Hero Title**"
        hero_title = lines[i + 1]
        i += 3
        assert lines[i] == "**Hero Summary**"
        hero_summary = lines[i + 1]
        i += 3
        assert lines[i] == "**Page-Specific Internal Links**"
        i += 1
        links: list[str] = []
        while i < len(lines) and lines[i].startswith("- "):
            links.append(lines[i][2:])
            i += 1
        while i < len(lines) and lines[i] == "":
            i += 1
        assert lines[i] == "**Official / Government / Institutional Resources**"
        i += 1
        resources: list[str] = []
        while i < len(lines) and lines[i].startswith("- "):
            resources.append(lines[i][2:])
            i += 1
        while i < len(lines) and lines[i] == "":
            i += 1
        assert lines[i] == "**Client-Facing Draft**"
        i += 1
        while i < len(lines) and lines[i] == "":
            i += 1
        sections: list[tuple[str, str]] = []
        while i < len(lines) and lines[i] != "**End CTA**" and not lines[i].startswith("## /"):
            if lines[i].startswith("### "):
                title = lines[i][4:]
                i += 1
                body: list[str] = []
                while i < len(lines) and not lines[i].startswith("### ") and lines[i] != "**End CTA**" and not lines[i].startswith("## /"):
                    body.append(lines[i])
                    i += 1
                sections.append((title, "\n".join(body).strip()))
            else:
                i += 1
        assert lines[i] == "**End CTA**"
        i += 1
        cta_lines: list[str] = []
        while i < len(lines) and not lines[i].startswith("## /"):
            cta_lines.append(lines[i])
            i += 1
        end_cta = "\n".join(cta_lines).strip()
        pages.append(Page(route, hero_title, hero_summary, links, resources, sections, end_cta))
    return pages


def format_page(page: Page) -> str:
    lines = [f"## {page.path}", "", "**Hero Title**", page.hero_title, "", "**Hero Summary**", page.hero_summary, "", "**Page-Specific Internal Links**"]
    lines += [f"- {x}" for x in page.links]
    lines += ["", "**Official / Government / Institutional Resources**"]
    lines += [f"- {x}" for x in page.resources]
    lines += ["", "**Client-Facing Draft**", ""]
    for title, body in page.sections:
        lines += [f"### {title}", "", body, ""]
    lines += ["**End CTA**", page.end_cta, ""]
    return "\n".join(lines)


def title_tail(title: str) -> str:
    return title.split(". ", 1)[1] if ". " in title else title


def slug(path: str) -> str:
    return path.strip("/").split("/")[-1]


def is_hub(page: Page) -> bool:
    return len(page.path.strip("/").split("/")) == 1 or page.path in {"/services/", "/services/advisory/", "/services/defense/", "/services/naturalisation/", "/services/other/", "/services/residencies/", "/services/visas/", "/insights/", "/process/", "/brazil/places/"}


SECTION_TEMPLATES_BRAZIL = {
    "Overview": "This opening section should explain why the topic matters before a person chooses a city, a route, or a lifestyle expectation.",
    "Identity": "Identity sections should show how Brazil feels socially and culturally, not only how it looks from abroad.",
    "Regions": "Regional comparison matters because Brazil often stops making sense when readers assume one city or one trip can stand in for the whole country.",
    "Lifestyle": "Lifestyle sections should explain what the day-to-day rhythm actually depends on: climate, city scale, budget, community, and routine.",
    "Opportunities": "Opportunity sections should be read against the reader’s real profile rather than against optimistic headlines.",
    "Climate": "Climate sections should help the reader connect weather and environmental comfort to real long-term fit.",
    "Diversity": "Diversity sections should show why Brazil contains many overlapping realities rather than one flat national story.",
    "Accessibility": "Accessibility sections should explain how language, systems, planning, and route fit affect whether Brazil feels genuinely workable.",
    "Perception": "Perception sections should correct broad assumptions and help the reader hold emotional attraction and practical reality together.",
    "Future": "Future sections should help the reader think in a long-range way rather than only react to present emotion.",
    "Sectors": "Sector sections should show where opportunity tends to cluster and why the label of a sector is never enough by itself.",
    "Entry": "Entry sections should explain sequence: what sensible first steps look like before money, documents, or commitments go too far.",
    "Structure": "Structure sections should make clear why legal, commercial, and operational alignment matter so early.",
    "Risks": "Risk sections should reduce naivety without pushing the reader into fear.",
    "Returns": "Returns sections should help the reader compare financial return, lifestyle return, and management burden more honestly.",
    "Industries": "Industry sections should help explain why certain cities or regions matter for certain profiles.",
    "Employment": "Employment sections should connect the labor reality to language, sector, place, and income source.",
    "Currency": "Currency sections should translate exchange-rate ideas into daily life and planning consequences.",
    "Trade": "Trade sections should explain why some regions feel strategically different from others.",
    "Regional Differences": "Regional-difference sections should reinforce that broad national averages rarely answer a real relocation question.",
    "Business Climate": "Business-climate sections should connect opportunity to bureaucracy, tax reality, and local execution.",
    "Challenges": "Challenge sections should name trade-offs clearly enough that the page remains credible.",
    "Growth": "Growth sections should translate macro growth into what a relocating reader can actually do with the information.",
    "Relevance For Immigrants": "Relevance sections should connect the topic to the reader’s own move rather than leaving it at a country level.",
    "Environment": "Environment sections should connect nature and space to routine, comfort, and location fit.",
    "Community": "Community sections should explain how belonging is built, not only how it is imagined.",
    "Flexibility": "Flexibility sections should show why many readers are attracted to Brazil’s pace while still naming what supports that feeling in practice.",
    "Comparison": "Comparison sections should help readers compare trade-offs with maturity rather than search for a perfect country.",
    "Affordability": "Affordability sections should resist one-size-fits-all claims and instead explain what really changes the budget.",
    "Variation": "Variation sections should reinforce why city and regional reading matter so much in Brazil.",
    "Conclusion": "Conclusion sections should help readers understand who the topic tends to fit and what should be explored next.",
    "Routine": "Routine sections should make daily life visible in practical terms.",
    "Social Life": "Social-life sections should show why human connection is part of Brazil’s attraction for many readers.",
    "Work Style": "Work-style sections should explain how local culture, sector, and income model affect the experience.",
    "Mobility": "Mobility sections should connect transport and geography to everyday comfort.",
    "Services": "Services sections should explain how public and private systems affect life on the ground.",
    "Pace": "Pace sections should help the reader picture how time and rhythm feel in different parts of Brazil.",
    "Adaptation": "Adaptation sections should normalize transition and show what makes it easier.",
    "Benefits": "Benefit sections should remain concrete rather than generic.",
    "Reality": "Reality sections should keep the page honest enough to be useful.",
    "Housing": "Housing sections should connect shelter to budget, routine, and emotional stability.",
    "Food": "Food sections should connect cost and culture rather than treating food as only a budget line.",
    "Transport": "Transport sections should connect mobility to cost, routine, and city fit.",
    "Healthcare": "Healthcare sections should connect services to age, family structure, and location choice.",
    "Education": "Education sections should connect schools and universities to continuity and long-term planning.",
    "Budgeting": "Budgeting sections should encourage margin, not minimum-case optimism.",
    "Types": "Type sections should explain why housing form or city form changes the lived experience.",
    "Renting": "Renting sections should explain what foreigners often underestimate in local housing practice.",
    "Buying": "Buying sections should show where ownership differs from relocation strategy.",
    "Locations": "Location sections should explain why the address layer matters as much as the city label.",
    "Costs": "Cost sections should unpack hidden or secondary costs rather than only headline prices.",
    "Contracts": "Contract sections should help the reader see where assumptions should give way to structure.",
    "Advice": "Advice sections should feel like steady guidance rather than pressure to decide fast.",
    "Public": "Public-system sections should explain what the public layer is and what it can realistically mean in practice.",
    "Private": "Private-option sections should help readers compare value, access, and expectations.",
    "Quality": "Quality sections should explain why quality varies and how to read that variation more intelligently.",
    "Access": "Access sections should connect entitlement, location, language, and navigation.",
    "Insurance": "Insurance sections should explain where plans matter and how they sit alongside the wider system.",
    "Cities": "City sections should help readers move from abstract geography into lived urban choices.",
    "Higher": "Higher-education sections should connect study paths to longer-term life planning.",
    "Language": "Language sections should explain how Portuguese shapes confidence, access, and integration.",
    "Expats": "Expat sections should help readers compare foreign-family expectations with local reality.",
    "Precautions": "Precaution sections should help readers become prepared without becoming fearful.",
    "Expat View": "Expat-view sections should show what foreigners often notice first and what they only notice later.",
    "Balance": "Balance sections should close the page with realism and perspective.",
    "Traditions": "Tradition sections should show how history becomes visible in ordinary public life.",
    "Music": "Music sections should connect sound, social life, identity, and city atmosphere.",
    "Social Norms": "Social-norm sections should explain how the country communicates and builds trust.",
    "Daily Life": "Daily-life sections should show how culture becomes visible outside major landmarks or events.",
    "Integration": "Integration sections should encourage humility, language effort, and long-term settlement habits.",
    "Richness": "Richness sections should leave the reader with a fuller sense of why culture matters to the relocation decision.",
    "Carnaval": "Carnaval sections should keep the page from reducing Brazil’s festival life to one symbol alone.",
    "Regional": "Regional sections should highlight how local identity changes the meaning of the topic across the country.",
    "Tourism": "Tourism sections should connect the topic to local economy and the foreigner’s first entry point into Brazil.",
    "Calendar": "Calendar sections should make the year-round rhythm more visible.",
    "Experience": "Experience sections should speak to what the reader might actually feel on the ground.",
    "Impact": "Impact sections should explain why the topic matters socially, culturally, or economically.",
    "Staples": "Staple sections should make ordinary Brazilian life easier to picture.",
    "Street": "Street sections should bring the reader closer to informal and everyday city experience.",
    "Dining": "Dining sections should connect taste to social rhythm and city life.",
    "Favorites": "Favorite sections should give the reader entry points into the topic without flattening it.",
    "Cultural": "Cultural sections should show where events and institutions deepen the experience of a city.",
    "Nightlife": "Nightlife sections should explain city energy, routine, and fit for different profiles.",
    "Frequency": "Frequency sections should help the reader picture how often the topic actually appears in ordinary life.",
    "Variety": "Variety sections should show how broad the range is across Brazil.",
    "Relocation": "Relocation sections should connect country knowledge to actual moving steps.",
    "Settling": "Settling sections should explain the often underestimated first weeks and first months.",
    "Documentation": "Documentation sections should connect paperwork to everyday planning and sequencing.",
    "Mistakes": "Mistake sections should name predictable errors gently but clearly.",
    "Tips": "Tips sections should save time and friction rather than just list observations.",
    "Support": "Support sections should clarify when guidance becomes more valuable than more solo reading.",
    "Visas": "Visa sections should answer common route-level questions without crossing into individualized legal advice.",
    "Residency": "Residency sections should explain how longer-term stay questions emerge from lifestyle interest.",
    "Cost": "Cost sections should connect money concerns back to the wider life decision.",
    "Work": "Work sections should connect labor reality to language, place, and route."
}


SECTION_TEMPLATES_SERVICE = {
    "Overview": "This section should define what the service actually is and where it sits in the wider immigration journey.",
    "Who Usually Seeks This Service": "This section should help the reader recognize their own starting situation honestly.",
    "What This Service Helps Clarify": "This section should explain the decision-quality value of the service, not only its label.",
    "When It Usually Makes Sense": "This section should show when the timing is right for this kind of support.",
    "When Another Service May Be Better First": "This section should show maturity by explaining where this service is not the first best step.",
    "Common Patterns And Pain Points": "This section should name the problems that typically bring people here.",
    "How We Handle The Work": "This section should reveal your method and make the service feel operational.",
    "Legal, Language, And Service Boundaries": "This section should keep the tone OAB-aware and professionally clear.",
    "What People Usually Feel Before And After": "This section should humanize the process without becoming casual.",
    "What Happens Next": "This section should explain how this service links to the next stage.",
    "When Urgency Is Real": "This section should name the signs that the matter has become time-sensitive.",
    "Who This Service Is For": "This section should clarify profile fit under pressure.",
    "What Usually Creates Exposure": "This section should explain how risk tends to build in practice.",
    "What Not To Do": "This section should warn against self-defeating reactions.",
    "How We Stabilise The Situation": "This section should show how structure returns to a destabilized matter.",
    "Documentation And Chronology": "This section should explain why records and timing become decisive.",
    "Legal Representation And Boundaries": "This section should explain where formal legal handling begins.",
    "What Clients Usually Feel": "This section should acknowledge stress, fear, confusion, or fatigue honestly.",
    "Best Next Step": "This section should point toward the safest next move, not the loudest one.",
}


SECTION_TEMPLATES_PROCESS = {
    "Purpose": "This section should explain why the stage exists and what it is meant to change.",
    "Who": "This section should clarify which readers are usually at this stage and why.",
    "Timing": "This section should explain why time and order matter here.",
    "Format": "This section should describe how the stage tends to be handled in practice.",
    "Scope": "This section should draw boundaries around what this stage can and cannot do.",
    "Clarity": "This section should explain how confusion is reduced at this stage.",
    "Outcomes": "This section should explain what a good version of this stage actually produces.",
    "Value": "This section should connect the stage to avoided mistakes and stronger decision quality.",
    "Expectations": "This section should keep the reader grounded about what support can realistically change.",
    "Next Steps": "This section should connect the stage to what follows.",
    "Context": "This section should explain why the wider situation matters to the stage.",
    "Factors": "This section should identify the variables that usually shape the analysis.",
    "Evaluation": "This section should show how assessment differs from assumption.",
    "Positioning": "This section should explain how the case is framed more realistically.",
    "Risks": "This section should name what can weaken the process if ignored.",
    "Findings": "This section should explain what useful findings normally look like.",
    "Direction": "This section should show how clearer direction emerges from the stage.",
    "Overview": "This section should define the stage in plain but operational terms.",
    "Stages": "This section should explain the internal parts of the process.",
    "Sequence": "This section should explain why order is not interchangeable.",
    "Flow": "This section should show how the matter moves across stages.",
    "Milestones": "This section should name the points where progress becomes clearer.",
    "Complexity": "This section should explain why some matters need more structure than others.",
    "Coordination": "This section should explain how moving parts are kept aligned.",
    "Progression": "This section should show how the process moves forward without overpromising.",
    "Structure": "This section should explain why structure is protective rather than cosmetic.",
    "Outcomes": "This section should define stronger outcomes beyond approval alone.",
    "Situations": "This section should explain the real scenarios readers may recognize.",
    "Causes": "This section should explain why the issue tends to arise.",
    "Assumptions": "This section should show which false assumptions create trouble.",
    "Missteps": "This section should name the common wrong moves gently but clearly.",
    "Examples": "This section should turn abstraction into recognizable patterns.",
    "Impact": "This section should show why the issue matters in lived terms.",
    "Correction": "This section should explain how recovery usually begins.",
    "Prevention": "This section should show what would have reduced the risk earlier.",
    "Lessons": "This section should leave the reader with better judgment, not just warning.",
    "Duties": "This section should explain responsibilities without sounding punitive.",
    "Compliance": "This section should show how alignment is maintained over time.",
    "Reporting": "This section should show where information flow matters.",
    "Maintenance": "This section should explain the upkeep side of immigration status.",
    "Requirements": "This section should show what must stay visible to avoid instability.",
    "Continuity": "This section should show why consistency matters after the first milestone.",
    "Accountability": "This section should define who owns which part of the work.",
    "Reality": "This section should compare expectation with the real experience of the stage.",
    "Challenges": "This section should explain what people find difficult when they try to navigate alone.",
    "Limitations": "This section should name where self-navigation tends to break down.",
    "Comparison": "This section should show the difference between solo navigation and structured support.",
    "Decision": "This section should help the reader judge when to keep going alone and when not to.",
    "Communication": "This section should explain how clarity is maintained during the process.",
    "Honesty": "This section should explain why candor matters more than comfort in process work.",
    "Disclosure": "This section should show why full facts matter to good support.",
    "Trust": "This section should connect transparency to confidence, not only tone.",
    "Stages": "This section should explain why each paid stage exists separately.",
    "Scope": "This section should show what payment actually covers.",
    "Payment": "This section should explain how financial clarity supports process clarity.",
    "Conditions": "This section should explain when different fee or refund rules apply.",
    "Eligibility": "This section should show how approval or denial of a refund or next step is judged.",
    "Limitations": "This section should explain where fairness stops short of automatic reversibility.",
    "Review": "This section should explain how requests are evaluated rather than presumed.",
    "Resolution": "This section should explain what a realistic resolution looks like.",
    "Factors": "This section should show what usually changes timelines in practice.",
    "Variability": "This section should explain why timelines cannot be treated as fixed promises.",
    "Delays": "This section should explain where delay comes from and what it changes.",
    "Control": "This section should separate what can be controlled from what cannot.",
    "Transition": "This section should explain the change from one stage of life or status into another.",
    "Guidance": "This section should show how support continues once the first objective is reached.",
    "Planning": "This section should explain why aftercare and long-term thinking matter early too.",
    "Stability": "This section should show how the process becomes more durable after guidance.",
    "Roles": "This section should define who is responsible for what in a way that feels fair and usable.",
    "Client": "This section should explain what the client contributes to a workable file.",
    "Provider": "This section should explain what support is and is not responsible for.",
    "Cooperation": "This section should show why immigration work is collaborative even when guided professionally.",
    "Accuracy": "This section should explain why factual accuracy remains a live duty, not a one-time task.",
    "Protections": "This section should explain what protections exist without overclaiming them.",
    "Access": "This section should explain how rights become usable in practice.",
    "Status": "This section should show how rights relate to the person’s legal position.",
    "Entitlements": "This section should explain where expectations are legitimate and where they are not.",
    "Application": "This section should connect abstract rights to real use cases.",
    "Requirements": "This section should explain what must be preserved to renew or progress safely.",
    "Preparation": "This section should explain why later stages are often won earlier through better preparation.",
    "Eligibility": "This section should explain what makes the path viable and what can weaken it.",
    "Pathway": "This section should explain how the path is normally structured and where it connects to other stages.",
    "Benefits": "This section should explain what the status changes in real life.",
    "Timeline": "This section should explain why patience and sequence remain relevant.",
    "Monitoring": "This section should explain how the file stays healthy over time.",
}


SECTION_TEMPLATES_INSIGHTS = {
    "System Overview": "This section should explain the broad architecture of the system in plain English.",
    "Legal Concepts": "This section should translate legal language into usable reader language.",
    "Institutions": "This section should show which public bodies do what and why that changes the question being asked.",
    "Visa, Residency, And Citizenship": "This section should slow down the distinction between core status categories.",
    "Documentation": "This section should explain why records and evidence matter even before route choice is final.",
    "Authority Logic": "This section should explain where state discretion and procedure shape the outcome.",
    "Common Misunderstandings": "This section should correct recurring errors without becoming dismissive.",
    "Why This Matters": "This section should explain why foundational understanding changes later decisions.",
    "When Reading Stops Being Enough": "This section should help the reader know when they have reached the limit of general research.",
    "Next Step": "This section should connect the insight page to stronger next questions or consultation.",
}


def template_for(mapping: dict[str, str], name: str, fallback: str) -> str:
    return mapping.get(name, fallback)


def append_once(text: str, extra: str) -> str:
    if extra in text:
        head = text.split(extra)[0].rstrip()
        return f"{head} {extra}".strip()
    return f"{text} {extra}".strip()


def brazil_subject(s: str) -> str:
    mapping = {
        "brazil": "Brazil",
        "investment": "investment in Brazil",
        "economy": "Brazil's economy",
        "quality": "quality of life in Brazil",
        "living": "daily life in Brazil",
        "cost": "the cost of living in Brazil",
        "housing": "housing in Brazil",
        "healthcare": "healthcare in Brazil",
        "education": "education in Brazil",
        "safety": "safety in Brazil",
        "culture": "Brazilian culture",
        "festivals": "festival life in Brazil",
        "cuisine": "Brazilian cuisine",
        "events": "events in Brazil",
        "guides": "practical planning for Brazil",
        "faqs": "Brazil-related decision-making",
        "north": "North Brazil",
        "northeast": "Northeast Brazil",
        "central-west": "Central-West Brazil",
        "southeast": "Southeast Brazil",
        "south": "South Brazil",
        "states": "Brazilian states",
        "cities": "Brazilian cities",
        "municipalities": "Brazilian municipalities",
        "directory": "Brazil-focused research",
        "search": "researching Brazil efficiently",
    }
    return mapping.get(s, s.replace("-", " "))


def direct_hub_intro(family_intro: str, name: str) -> str:
    if name == "Overview":
        return family_intro
    if "Explore" in name:
        return "The categories inside this hub are arranged so the reader can move from a broad question into a more specific one without losing context along the way."
    if "How To Use" in name:
        return "The most useful way to read this hub is in sequence: identify the real question first, narrow the category second, and only then move into the page that best fits the present stage."
    if "Reading Lens" in name:
        return "A better reading lens usually changes the quality of the next decision. The point here is to replace scattered browsing with a more deliberate route through the material."
    if "What" in name and "For" in name:
        return "These pages work best when they are used as orientation rather than as a substitute for the whole process. Their role is to make the subject clearer before the personal facts need to be tested directly."
    if "Best Next Step" in name:
        return "The right next step depends on whether the reader still needs orientation or already needs a more personal and structured review."
    return "This hub is designed to help the reader move with more structure rather than more noise."


def direct_hub_detail(name: str) -> str:
    if name == "Overview":
        return "A strong hub should leave the reader more oriented, not more overwhelmed. It should make the internal structure of the site easier to understand and make the next click feel intentional rather than random."
    if "Explore" in name:
        return "Different readers arrive with different priorities: some care first about services, others about Brazil as a country, others about process, risk, or long-term planning. Grouping pages clearly helps all of them reach a better starting point faster."
    if "How To Use" in name:
        return "Good sequencing matters even at the reading stage. People usually make better decisions when they stop trying to read everything at once and instead follow the path that matches their current concern."
    if "Reading Lens" in name:
        return "That lens matters because most immigration and relocation confusion comes less from a total absence of information and more from reading the right information in the wrong order or with the wrong expectations."
    if "What" in name and "For" in name:
        return "The aim is not to flatten the subject into simple slogans. It is to give the reader enough clarity that the next conversation, whether with us or within their own planning, becomes more precise."
    if "Best Next Step" in name:
        return "Once several pages start intersecting around the same real-life decision, general reading has usually done its job and a consultation becomes the more efficient next move."
    return "The hub should make the site feel more structured and more trustworthy before the reader ever reaches a form."


def direct_brazil_intro(name: str, s: str) -> str:
    subject = brazil_subject(s)
    mapping = {
        "Overview": f"{subject} becomes much easier to judge when it is approached as a real lived environment rather than as a vague idea or a short-term impression.",
        "Identity": f"What defines {subject} in practice goes well beyond image. Social rhythm, language, history, regional culture, and public life all shape how it actually feels.",
        "Regions": f"Regional comparison is one of the most useful ways to understand {subject}, because location changes climate, economy, pace, infrastructure, and everyday experience.",
        "Lifestyle": f"{subject.capitalize()} is felt most clearly in ordinary routine: where people live, how they move, how social life works, and whether the place supports the kind of day-to-day rhythm they want.",
        "Opportunities": f"Opportunity inside {subject} is rarely generic. It usually depends on profile, place, timing, and whether the person is looking for work, business, family life, retirement, or remote flexibility.",
        "Climate": f"Climate affects long-term fit in {subject} far more than many readers expect. It shapes comfort, housing, health, routine, and where a person can genuinely imagine living well.",
        "Diversity": f"{subject.capitalize()} makes more sense when diversity is treated as a central fact rather than a side note. Different histories, accents, food cultures, and local identities change the whole feel of the experience.",
        "Accessibility": f"{subject.capitalize()} can feel emotionally accessible very quickly, but practical accessibility depends on language, systems, planning, and whether the move is grounded in reality.",
        "Perception": f"Perception often shifts as research deepens. What begins as attraction to {subject} usually becomes a more serious comparison between image, systems, routine, and long-term fit.",
        "Future": f"The future of {subject} matters because many readers are not comparing a holiday, but a possible next chapter of life.",
        "Sectors": f"Sectors matter because investment in Brazil is rarely about one national headline. It depends on where the opportunity sits and what kind of structure it actually needs.",
        "Entry": f"Entry into investment in Brazil is usually stronger when it is paced and sequenced correctly from the beginning.",
        "Structure": f"Structure matters in Brazil because commercial, legal, and practical execution rarely sit in separate boxes for very long.",
        "Risks": f"Risk needs to be named plainly in {subject}. Good planning is rarely about fear; it is about respecting what the environment requires.",
        "Returns": f"Returns in {subject} should be measured against time, cost, management effort, and long-term goals rather than against optimism alone.",
        "Industries": f"Industry structure helps explain why some parts of Brazil feel full of opportunity while others feel stronger for lifestyle than for work or business.",
        "Employment": f"Employment in {subject} needs to be read through language, place, and income model rather than through a single national assumption.",
        "Currency": f"Currency is one of the quiet forces shaping life in {subject}. It influences budget, confidence, and whether the move feels more stable or more exposed over time.",
        "Trade": f"Trade can feel distant from personal relocation, but it explains why certain cities and regions matter strategically in {subject}.",
        "Regional Differences": f"Regional differences are one of the main reasons broad headlines rarely answer a real question about {subject}.",
        "Business Climate": f"Business climate matters because it shapes whether an opportunity in {subject} feels workable in practice rather than only attractive in theory.",
        "Growth": f"Growth is most useful when it helps the reader understand where {subject} may become more compelling over time and for whom.",
        "Relevance For Immigrants": f"What matters most is not only what {subject} looks like on paper, but what it means for someone actually trying to build life there.",
        "Environment": f"Environment is one of the strongest reasons people feel drawn to {subject}, but it matters most when it supports real comfort rather than only admiration.",
        "Community": f"Community often determines whether {subject} feels welcoming in a lasting way rather than only exciting at first.",
        "Flexibility": f"Flexibility is part of what attracts many readers to {subject}, especially when they are comparing a more open or less compressed way of living.",
        "Comparison": f"Comparison becomes useful when it clarifies trade-offs around {subject} instead of trying to declare one place universally better than another.",
        "Affordability": f"Affordability in {subject} depends less on one headline number and more on income source, city choice, housing, and expectations.",
        "Variation": f"Variation is one of the defining realities of {subject}. A broad answer often becomes much more useful once the local differences are taken seriously.",
        "Conclusion": f"The most useful conclusion about {subject} is usually not absolute. It is a clearer sense of who tends to fit, what needs more checking, and what kind of life the move may support.",
        "Routine": f"Routine is where {subject} stops being abstract and starts becoming lived reality.",
        "Social Life": f"Social life is one of the reasons many readers feel emotionally drawn to {subject}, but it becomes meaningful only when it is understood in daily, not only symbolic, terms.",
        "Work Style": f"Work style inside {subject} depends heavily on city, sector, language, and whether income is local or international.",
        "Mobility": f"Mobility changes the feel of life in {subject} more than many first-time readers expect.",
        "Services": f"Everyday services are a major part of whether {subject} feels easy to live in or more tiring to navigate.",
        "Pace": f"Pace is one of the most noticeable differences readers often feel when comparing {subject} with other countries.",
        "Adaptation": f"Adaptation to {subject} usually happens step by step. It is rarely a single turning point.",
        "Benefits": f"The benefits of {subject} are strongest when they are named concretely rather than romantically.",
        "Reality": f"Reality matters because even the most attractive version of {subject} still includes systems, trade-offs, and decisions that need structure.",
        "Housing": f"Housing often shapes the emotional and financial feel of {subject} more than people first expect.",
        "Food": f"Food in {subject} is part of both the budget and the culture, which is why it matters more than a simple cost line.",
        "Transport": f"Transport affects whether daily life in {subject} feels fluid, tiring, expensive, or more sustainable over time.",
        "Healthcare": f"Healthcare should be read as part of long-term life in {subject}, not as a secondary detail left for later.",
        "Education": f"Education becomes a central question in {subject} when the move involves children, students, language transition, or long-term planning.",
        "Budgeting": f"Budgeting for {subject} works best when it leaves room for variation rather than only for best-case assumptions.",
        "Types": f"Type matters because not all versions of {subject} feel the same in lived practice.",
        "Renting": f"Renting in {subject} often becomes easier once readers understand the local logic rather than importing assumptions from another country.",
        "Buying": f"Buying in {subject} needs to be approached as its own decision with its own consequences, not as an automatic extension of relocation desire.",
        "Locations": f"Location inside {subject} can matter as much as the broader city or region label.",
        "Costs": f"Costs matter because the real price of living in {subject} is often shaped by more than the first obvious number.",
        "Contracts": f"Contracts are where clarity becomes practical in {subject}.",
        "Challenges": f"Challenges deserve to be named honestly because they often explain why one version of {subject} works well and another does not.",
        "Advice": f"Useful advice about {subject} should feel steady and usable rather than pushy.",
        "Public": f"The public layer of {subject} matters because it shapes what is available regardless of private spending power.",
        "Private": f"Private options in {subject} often matter to readers thinking about comfort, continuity, and control.",
        "Quality": f"Quality inside {subject} becomes more meaningful once it is linked to location, network, and daily use rather than only reputation.",
        "Access": f"Access in {subject} depends on more than entitlement. It also depends on navigation, geography, and language.",
        "Insurance": f"Insurance becomes relevant in {subject} when the reader starts planning for continuity rather than only arrival.",
        "Cities": f"Cities are where {subject} becomes concrete. That is usually where a country-level question turns into a life-level question.",
        "Higher": f"Higher education can change how {subject} is read, especially for students and families thinking beyond the first step.",
        "Language": f"Language shapes whether {subject} feels legible and manageable over time.",
        "Expats": f"Foreign families and long-term newcomers often experience {subject} differently from short-term visitors, which is why the expat lens matters.",
        "Precautions": f"Precautions help people live in {subject} more confidently when they are practical rather than fear-driven.",
        "Expat View": f"Expat experience often reveals what the first attraction to {subject} did not yet show.",
        "Balance": f"Balance matters because {subject} is best judged without either denial or alarmism.",
        "Traditions": f"Traditions reveal how {subject} carries history into ordinary public and family life.",
        "Music": f"Music helps explain the emotional and social texture of {subject} far better than many summaries do.",
        "Social Norms": f"Social norms influence whether {subject} feels legible, welcoming, and easy to navigate.",
        "Daily Life": f"Daily life is where the deeper character of {subject} becomes visible.",
        "Integration": f"Integration usually determines whether {subject} feels temporary or genuinely lived.",
        "Richness": f"The richness of {subject} is one reason it stays attractive to people who want more than convenience.",
        "Carnaval": f"Carnaval is one of the most visible symbols of Brazil, but understanding it properly also helps readers understand what celebration means here.",
        "Regional": f"Regional variation is often the reason festival life or cultural life in {subject} feels so broad and layered.",
        "Tourism": f"Tourism often becomes the first way foreigners encounter {subject}, but it should not be the only lens through which they judge it.",
        "Calendar": f"The calendar helps readers understand whether {subject} feels seasonally intense or consistently alive.",
        "Experience": f"Experience matters because many readers are comparing not just facts, but what it might feel like to be there.",
        "Impact": f"Impact helps explain why the topic matters to community, identity, or local economy.",
        "Staples": f"Staples are a useful way to understand what everyday life in {subject} actually tastes and feels like.",
        "Street": f"Street life often reveals the practical and social side of {subject} more clearly than formal descriptions do.",
        "Dining": f"Dining helps explain how {subject} balances everyday life, celebration, and public culture.",
        "Favorites": f"Popular favorites often help readers enter {subject} more easily, but they make most sense when connected to region and habit.",
        "Cultural": f"Cultural life helps many readers understand why some cities inside {subject} feel deeper or more sustaining over time.",
        "Nightlife": f"Nightlife says a lot about the energy, rhythm, and social codes of {subject}.",
        "Frequency": f"Frequency matters because it changes whether {subject} feels occasionally exciting or consistently alive.",
        "Variety": f"Variety is one of the reasons {subject} often resists simple description.",
        "Relocation": f"Relocation guidance becomes more useful when it turns admiration for {subject} into a clearer first sequence.",
        "Settling": f"Settling is often the stage where the reality of {subject} either starts feeling manageable or starts feeling heavier than expected.",
        "Documentation": f"Documentation affects how smoothly {subject} can be turned from idea into real move.",
        "Mistakes": f"Mistakes around {subject} usually come from sequence, assumption, or overconfidence rather than from bad intent.",
        "Tips": f"Useful tips make {subject} feel more navigable without pretending it is simple.",
        "Support": f"Support becomes valuable when the reader no longer needs more impressions, but clearer decisions.",
        "Visas": f"Visa questions are often the first legal questions readers ask once {subject} begins to feel like a real possibility.",
        "Residency": f"Residency questions usually appear once the reader starts thinking beyond a short stay and toward real continuity.",
        "Cost": f"Cost concerns often sit underneath much of the reader’s thinking about {subject}.",
        "Work": f"Work questions change the feel of {subject} quickly because they affect route, city, budget, and daily routine.",
    }
    return mapping.get(name, f"{subject.capitalize()} becomes easier to understand when the subject is connected to real life rather than to general impression alone.")


def direct_service_intro(name: str, route_label: str, family_desc: str) -> str:
    rl = route_label.capitalize()
    mapping = {
        "Overview": f"{rl} support is designed for people who need more than a label or a quick answer. It is the point where the matter is examined with more structure so the next step can be chosen with better judgment.",
        "Who Usually Seeks This Service": f"People usually reach {route_label} support when the situation is no longer simple enough for broad online guidance and not yet stable enough to move forward confidently alone.",
        "What This Service Helps Clarify": f"The real value of {route_label} support is not only information. It is clearer direction around chronology, documents, route fit, timing, and the practical shape of the next move.",
        "When It Usually Makes Sense": f"{rl} support usually makes the most sense when the reader can already see the issue becoming real and wants to avoid building the process on assumptions.",
        "When Another Service May Be Better First": f"{rl} support is not automatically the first best step. In some situations, a simpler orientation stage, records work, or a more urgent legal response needs to come first.",
        "Common Patterns And Pain Points": f"By the time people reach {route_label} support, they are often carrying the same frustrations: too much information, unclear comparison, conflicting advice, or the sense that an earlier step may already have weakened the process.",
        "How We Handle The Work": f"We handle {route_label} in a structured way. The aim is to bring facts, records, timing, and communication into one clear sequence rather than letting the case drift under pressure.",
        "Legal, Language, And Service Boundaries": f"Good {route_label} support depends on clear boundaries. Readers deserve to know what support can improve, what requires formal legal engagement, and what still remains under authority control.",
        "What People Usually Feel Before And After": f"Many people arrive at {route_label} support carrying more uncertainty than they want to admit. A well-structured review usually changes that feeling long before any formal outcome is reached.",
        "What Happens Next": f"After {route_label} support, the next step is usually clearer than it was before. The process may move into strategy, representation, preparation, or a more measured pause while the facts are brought into better order.",
        "When Urgency Is Real": f"In defense matters, urgency is usually visible before anyone says the word out loud. Timing, authority contact, and exposure all become more sensitive once the matter has already moved beyond a routine stage.",
        "Who This Service Is For": f"This kind of defense support is for people whose situation now requires careful legal positioning, steadier communication, and stronger control over chronology and records.",
        "What Usually Creates Exposure": f"Exposure usually builds when sequence, status, deadlines, or authority communication are allowed to drift without enough structure.",
        "What Not To Do": f"The wrong reaction can make a pressured matter heavier very quickly. That is why this stage needs plain guidance on what not to do as much as on what to do.",
        "How We Stabilise The Situation": f"Stabilising a pressured matter usually begins with facts, chronology, record control, and a realistic reading of what the competent authority can and cannot do next.",
        "Documentation And Chronology": f"In higher-risk matters, documents and chronology are not background details. They often become the backbone of whether the situation can be repositioned safely.",
        "Legal Representation And Boundaries": f"Representation matters most when it is clearly defined. The reader should understand where private guidance ends and where formal legal handling properly begins.",
        "What Clients Usually Feel": f"In these matters, clients usually feel pressure before they feel clarity. Naming that reality honestly is part of what makes the support feel credible.",
        "Best Next Step": f"The best next step is usually the safest one: the move that protects chronology, reduces exposure, and avoids turning urgency into improvisation.",
    }
    return mapping.get(name, f"{rl} support exists to improve {family_desc} before the matter becomes harder to correct or explain.")


def direct_process_intro(name: str, stage: str, focus: str) -> str:
    stage_name = stage.replace("-", " ")
    mapping = {
        "Overview": f"{stage_name.capitalize()} is best understood as a real stage in the process, not just a word people use when they are unsure what happens next.",
        "Purpose": f"{stage_name.capitalize()} exists to change the quality of the process, not only to add one more step to it.",
        "Who": f"This stage usually matters to people whose situation has become specific enough that sequence, documents, or route fit can no longer be handled casually.",
        "Timing": f"Timing matters here because a good step taken too late can still create avoidable friction, and a rushed step taken too early can weaken the whole process.",
        "Format": f"In practice, {stage_name} works best when the facts are visible, the communication is structured, and the stage is given enough room to do its job properly.",
        "Scope": f"Scope matters because many readers need to know what this stage can genuinely improve and what it does not resolve by itself.",
        "Clarity": f"Clarity is often the first real result of {stage_name}. Once the stage is handled well, the matter usually starts to feel more manageable even before anything formal is filed or decided.",
        "Outcomes": f"The most useful outcomes of {stage_name} are often stronger positioning, clearer expectation, and a better next step rather than dramatic promises.",
        "Value": f"The value of {stage_name} often appears in what it prevents: weak sequence, bad assumptions, repeated work, or avoidable stress later in the process.",
        "Expectations": f"Expectations improve when readers understand what {stage_name} can change and what still remains outside direct control.",
        "Next Steps": f"{stage_name.capitalize()} is strongest when it connects cleanly to the stage that follows rather than leaving the matter suspended in uncertainty.",
        "Context": f"Context matters here because immigration questions rarely sit in isolation. Timing, records, family situation, and previous steps all change how {stage_name} should be read.",
        "Factors": f"Several factors usually shape this stage at once, which is why good process work often feels more structured than a reader first expected.",
        "Evaluation": f"Evaluation matters because a route or assumption often feels stronger before the facts are truly reviewed than after they are placed in order.",
        "Positioning": f"Positioning changes the quality of the whole file. A matter that is clearly positioned usually becomes easier to explain, prepare, and move forward.",
        "Risks": f"Risk becomes easier to manage when it is named early. That is one reason this stage deserves more honesty than reassurance.",
        "Findings": f"Useful findings are rarely dramatic. They usually take the form of clearer strengths, clearer weaknesses, and a more realistic path forward.",
        "Direction": f"Direction is one of the most practical results of structured process work. It reduces drift and helps later decisions feel less improvised.",
        "Stages": f"Process work makes more sense when its internal stages are visible rather than collapsed into one blurred idea of “help.”",
        "Sequence": f"Sequence matters because immigration problems often come not from one impossible rule, but from steps taken in the wrong order.",
        "Flow": f"Flow is how the process becomes readable. It helps the reader see how one stage is meant to support the next.",
        "Milestones": f"Milestones give the process shape. Without them, it becomes much harder to judge whether the matter is actually progressing or only consuming attention.",
        "Complexity": f"Complexity should be acknowledged, not dramatized. Some matters require more structure because they involve more moving parts, not because they are inherently unmanageable.",
        "Coordination": f"Coordination becomes important the moment several documents, deadlines, institutions, or jurisdictions have to keep moving in the same direction.",
        "Progression": f"Progression is strongest when it remains controlled rather than rushed. That usually makes the experience calmer as well as more effective.",
        "Structure": f"Structure is not an added feature of immigration work. It is often the thing that keeps a viable path from becoming a messy one.",
        "Situations": f"These situations tend to feel isolated when people are inside them, but in practice many readers recognize the same patterns once they are named clearly.",
        "Causes": f"The cause of a process problem is often less dramatic than the reader fears. Weak sequence, partial facts, or early assumptions usually do more damage than one single event.",
        "Assumptions": f"Assumptions become expensive when they are allowed to drive the next move without being tested against the real structure of the case.",
        "Missteps": f"Missteps are often understandable, especially when the person was trying to keep moving with incomplete information.",
        "Examples": f"Examples help because they turn a vague warning into something the reader can actually recognize in their own situation.",
        "Impact": f"Impact is easiest to understand when the reader can see how the issue changes time, cost, confidence, and later options.",
        "Correction": f"Correction usually begins by slowing the process down enough to see what really happened and what still remains workable.",
        "Prevention": f"Prevention matters because most process friction is lighter to avoid than to repair.",
        "Lessons": f"The best lesson is usually not fear. It is stronger judgment about what should happen differently next time.",
        "Duties": f"Duties matter because a process stays stable only when the responsibilities attached to it remain visible over time.",
        "Compliance": f"Compliance is less about formality than about keeping the process aligned with what the route or status actually requires.",
        "Reporting": f"Reporting matters where information, change, or contact with authorities can affect continuity.",
        "Maintenance": f"Maintenance is part of real immigration life. Status becomes much more stable when it is cared for rather than assumed to be self-sustaining.",
        "Requirements": f"Requirements stay important even after an early milestone is reached. That is one reason process work does not end as quickly as many readers hope.",
        "Continuity": f"Continuity often separates a strong process from a fragile one. It keeps later stages from being weakened by earlier inconsistency.",
        "Accountability": f"Accountability improves the process because everyone understands what depends on them and what does not.",
        "Challenges": f"Challenges become easier to handle once they are named as part of the process rather than treated as evidence that the whole path is failing.",
        "Limitations": f"Limitations matter because not every issue can be solved by more effort alone. Some require a different stage, a different kind of support, or a different expectation.",
        "Comparison": f"Comparison helps the reader decide whether the present way of handling the matter is still workable or already producing too much friction.",
        "Decision": f"Decision points usually feel easier once the real options and trade-offs are visible rather than guessed at.",
        "Communication": f"Communication changes the process more than many readers expect. Clear communication often prevents problems that no later correction fully removes.",
        "Honesty": f"Honesty matters because a process can only be structured around facts that are actually on the table.",
        "Disclosure": f"Disclosure matters because hidden or softened facts often return later in a more expensive form.",
        "Trust": f"Trust in process work usually grows from clarity and consistency rather than from comfort alone.",
        "Payment": f"Payment becomes easier to understand when it is tied clearly to scope, stages, and what is actually being delivered.",
        "Conditions": f"Conditions matter because not every payment or refund question is judged the same way at every stage.",
        "Eligibility": f"Eligibility matters because whether a step, refund, or progression is available usually depends on context rather than on label alone.",
        "Review": f"Review is where fairness and structure meet. It helps explain why requests are considered rather than assumed.",
        "Resolution": f"Resolution should feel realistic. Readers need to know what a reasonable outcome looks like once the facts are reviewed.",
        "Factors": f"Several factors usually push the timeline, scope, or risk in one direction or another. Seeing them clearly often changes the next decision.",
        "Variability": f"Variability matters because timelines and outcomes rarely behave as fixed promises.",
        "Delays": f"Delays are frustrating, but they become easier to plan around when the source of delay is understood clearly.",
        "Control": f"Control becomes easier when the reader can distinguish what belongs to planning from what belongs to authority timing.",
        "Transition": f"Transition stages deserve care because they often decide whether the next position feels stable or improvised.",
        "Guidance": f"Guidance matters after a milestone because the process often changes form rather than simply ending.",
        "Planning": f"Planning helps the reader connect the present step with what they may want or need later.",
        "Stability": f"Stability is one of the most valuable outcomes of a well-handled process. It changes how the whole experience feels.",
        "Roles": f"Roles need to be clear or cooperation becomes weaker and more frustrating than it needs to be.",
        "Client": f"The client’s role matters because good support still depends on good factual cooperation.",
        "Provider": f"The provider’s role matters because readers deserve clarity about what support is responsible for and what remains outside that scope.",
        "Cooperation": f"Cooperation often determines whether the process feels aligned or repeatedly interrupted.",
        "Accuracy": f"Accuracy protects the process because errors in facts, dates, or records usually echo forward into later stages.",
        "Protections": f"Protections matter because readers often need to know what can reasonably be expected from the system and from the process around them.",
        "Access": f"Access matters most when the reader understands how rights or entitlements become usable in practice.",
        "Status": f"Status changes the whole frame of the process, which is why readers need a clear understanding of what position they actually hold.",
        "Entitlements": f"Entitlements need to be described carefully so expectations remain realistic as well as empowering.",
        "Application": f"Application matters because abstract rights or duties only become useful once they are connected to real situations.",
        "Preparation": f"Preparation often decides the quality of the later stage before that later stage even begins.",
        "Pathway": f"Pathway language is useful only when the reader can see how the path is actually meant to unfold.",
        "Benefits": f"Benefits become more meaningful when they are tied to real-life changes rather than left as formal labels.",
        "Monitoring": f"Monitoring matters because a process stays healthy through attention, not through hope alone.",
    }
    return mapping.get(name, f"{stage_name.capitalize()} becomes easier to navigate when {focus} are explained in practical rather than abstract terms.")


def direct_insight_intro(name: str, focus: str) -> str:
    mapping = {
        "System Overview": "Brazil immigration becomes much easier to understand once the reader can see the system as a structure of roles, stages, and distinctions rather than a list of isolated routes.",
        "Legal Concepts": "Legal concepts often sound familiar until a reader tries to rely on them in a real immigration question.",
        "Institutions": "Different institutions play different roles in Brazil immigration, and many readers only realize how important that is after they have already become confused.",
        "Visa, Residency, And Citizenship": "Visa, residency, and citizenship are related ideas, but they are not interchangeable. Much confusion begins when they are treated as if they were.",
        "Documentation": "Documentation matters long before filing. It often shapes whether a route stays coherent once the process becomes real.",
        "Authority Logic": "Authority logic matters because no private service controls the final decision, and the reader usually needs to understand where discretion and procedure truly sit.",
        "Common Misunderstandings": "Common misunderstandings are often structural rather than purely legal. People usually get lost because they are asking the right question at the wrong level.",
        "Why This Matters": "Foundational understanding matters because it changes the quality of every later question.",
        "When Reading Stops Being Enough": "General reading is useful until the issue starts depending on personal chronology, documents, deadlines, or route comparison.",
        "Next Step": "A strong next step in research is usually the one that turns broad understanding into a better question rather than into more noise.",
    }
    return mapping.get(name, f"{name} matters because clearer immigration understanding always begins with better framing.")


def second_brazil(name: str, facts: list[str]) -> str:
    if name in {"Overview", "Conclusion", "Future"}:
        return f"The wider frame matters here. Useful anchors include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. Those details help show why Brazil is often judged too quickly through one trip, one city, or one online summary, when the real decision usually depends on how the larger picture holds together over time."
    if name in {"Identity", "Culture", "Traditions", "Music", "Social Norms", "Daily Life", "Richness", "Community"}:
        return f"That human dimension becomes clearer once the reader can connect it to real anchors such as {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. These are not decorative details. They affect how people build trust, belong, and decide whether the social rhythm of a place actually fits them."
    if name in {"Regions", "Regional", "Regional Differences", "Cities", "Location", "Locations", "Variation"}:
        return f"Geography and variation need to stay visible. Useful anchors here include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. They matter because a good Brazil decision almost always improves when readers stop asking for one generic answer and start comparing different local realities honestly."
    if name in {"Lifestyle", "Routine", "Pace", "Benefits", "Reality", "Adaptation", "Experience"}:
        return f"What matters most here is ordinary life, not only exciting moments. Useful anchors include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. Those details help connect emotion to routine, which is often the difference between liking Brazil and living well in Brazil."
    if name in {"Cost", "Housing", "Transport", "Healthcare", "Education", "Services", "Budgeting", "Access", "Insurance", "Public", "Private", "Quality"}:
        return f"The practical side matters here. Useful anchors include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. These are the details that usually determine whether a move still feels coherent after the first burst of excitement passes."
    if name in {"Opportunities", "Sectors", "Industries", "Employment", "Trade", "Business Climate", "Growth", "Relevance For Immigrants"}:
        return f"The economic story needs to stay grounded. Useful anchors include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. Opportunity in Brazil is real, but it depends heavily on region, sector, timing, language, and whether the reader’s actual profile matches the opportunity they imagine."
    if name in {"Risks", "Challenges", "Precautions", "Balance"}:
        return f"The aim is to reduce naivety without replacing it with fear. Useful anchors include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. They help show that good planning is usually not about avoiding Brazil, but about respecting what Brazil requires."
    return f"Useful anchors here include {facts[0]}, {facts[1]}, {facts[2]}, and {facts[3]}. They matter because Brazil is not one uniform experience. What looks attractive in a video or a short trip may function very differently once daily-life systems start to matter."


def second_service(name: str, route_label: str, family_desc: str) -> str:
    if "Who" in name:
        return f"People usually reach {route_label} work in recognizable circumstances. The point here is to help the reader see those circumstances clearly enough to judge fit without forcing a match that is not really there."
    if "When" in name:
        return f"Timing matters here. Readers need to see what usually triggers the need for {route_label} support, what tends to happen when people wait too long, and how this stage connects to the rest of the process."
    if "Common" in name or "Pain" in name or "Exposure" in name or "Not To Do" in name:
        return f"What tends to go wrong in practice deserves plain language. Readers usually trust the service more when the page acknowledges the mistakes, pressure points, and emotional misjudgments that often bring them here."
    if "How We Handle" in name or "Stabilise" in name or "Documentation" in name:
        return f"Our method should feel visible here. Immigrate to Brazil reviews chronology, records, timing, and practical fit in a way that brings order back into the matter and makes the next step easier to trust."
    if "Legal" in name or "Boundaries" in name:
        return f"Professional boundaries need to stay visible. The reader should understand what support can do, where formal legal representation begins, why English-language clarity matters, and why no honest immigration service should imply control over authority decisions."
    if "Feel" in name:
        return f"The human side of the process matters here. Clients often arrive overloaded, uncertain, embarrassed by earlier mistakes, or simply tired of trying to decode everything alone. Naming that reality usually makes the service feel more trustworthy, not less professional."
    if "Next" in name:
        return f"After {route_label} support, the path usually becomes easier to see. The next move may be consultation, records work, representation, filing preparation, or simply a more deliberate pause while the case is brought into better order."
    return f"{route_label.capitalize()} support needs to feel real in these pages. That means connecting the service directly to chronology, documents, timing, communication, and the practical pressure people are usually under by the time they reach us."


def second_process(name: str, focus: str) -> str:
    if name in {"Who", "Context", "Situations", "Reality"}:
        return f"The reader should be able to recognize their own position more accurately here. That means showing who usually reaches this stage, what the surrounding context tends to look like, and how {focus} begin to matter once the process is no longer theoretical."
    if name in {"Timing", "Deadlines", "Timeline", "Sequence", "Stages", "Flow", "Milestones", "Progression"}:
        return f"Sequence needs to stay visible here. The reader should understand what usually comes before this point, what tends to happen here, and why weak timing is one of the fastest ways for {focus} to become heavier, slower, or more expensive to repair."
    if name in {"Scope", "Value", "Expectations", "Outcomes", "Benefits"}:
        return f"What matters most here is separating what this stage can realistically improve from what still remains under authority control. That distinction is what keeps process confidence grounded rather than inflated."
    if name in {"Risks", "Mistakes", "Failures", "Challenges", "Missteps", "Limitations"}:
        return f"The destabilizing patterns need to be named clearly. Many problems come less from one dramatic event and more from drift: bad order, partial facts, weak documentation, or decisions made under pressure without enough structure."
    if name in {"Correction", "Recovery", "Regularization", "Conversion"}:
        return f"Recovery needs to feel possible without sounding easy. In many situations it is possible, but it usually depends on chronology, documentation, honest disclosure, and a willingness to stop improvising."
    if name in {"Communication", "Transparency", "Disclosure", "Trust"}:
        return f"Clarity changes the stability of the process. Facts, boundaries, and expectations that are spelled out clearly usually make the file more coherent and the next decisions more reliable."
    if name in {"Roles", "Responsibilities", "Client", "Provider", "Cooperation", "Accountability"}:
        return f"Shared responsibility should be visible here. Immigration work improves when the client understands what they must provide, what support is responsible for, and how cooperation affects pace and quality."
    return f"What matters here is showing how {focus} behave in practice, not only in theory. That means connecting the stage to chronology, documents, expectations, and the way the process feels when it is handled with more discipline."


def second_insight(name: str, focus: str) -> str:
    if name in {"Institutions", "Authority Logic"}:
        return f"What matters here is understanding who does what and why that distinction changes the question being asked. Many immigration questions look different once the reader can see whether the issue is consular, administrative, documentary, or authority-controlled."
    if name in {"Legal Concepts", "System Overview", "Visa, Residency, And Citizenship"}:
        return f"The terminology needs to slow down here. Readers usually struggle because familiar words often carry more specific legal meaning than they first expect, and {focus} only become easier once those distinctions are made visible."
    if name in {"Documentation", "Common Misunderstandings"}:
        return f"This is usually where confusion begins. Many weak decisions come from treating route labels, checklists, or broad summaries as if they were enough without understanding what documents or facts will actually have to support the route later."
    if name in {"Why This Matters", "When Reading Stops Being Enough", "Next Step"}:
        return f"The explanation should point somewhere useful. Good insight content does not end with knowledge alone; it helps the reader understand when more reading is useful and when the issue has become too personal or document-sensitive for broad guidance to carry it further."
    return f"The aim here is to translate {focus} into plain English while still respecting the point where simplification becomes misleading."


def bullet_block(title: str, items: list[str]) -> str:
    return f"**{title}**\n" + "\n".join(f"- {item}" for item in items)


def natural_join(items: list[str]) -> str:
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def fact_sentence(text: str) -> str:
    return text[:1].upper() + text[1:] + "."


def link_summary(label: str) -> str:
    normalized = label.replace(" Hub", "").replace(" Services", "")
    mapping = {
        "Advisory": "clarity, route comparison, and early-stage structuring",
        "Defense": "urgent, exposed, or high-risk immigration matters",
        "Naturalisation": "citizenship planning and long-term continuity",
        "Other": "supporting work that keeps the main process usable",
        "Residencies": "longer-term stay, continuity, and status stability",
        "Visas": "entry routes, consular preparation, and pre-arrival logic",
        "Consultation": "first-stage review of route fit, timing, and priorities",
        "Assessment": "structured reading of facts, records, and viability",
        "Strategy": "route comparison, sequence, and practical planning",
        "Compliance": "ongoing alignment, document hygiene, and prevention of avoidable exposure",
        "Corporate": "business-linked immigration structure and commercial alignment",
        "Representation": "defined authority-facing handling and formal communication support",
        "Filing": "preparation, submission control, and documentary alignment",
        "Approval": "expectation control, next steps, and continuity planning",
        "Aftercare": "post-approval guidance, continuity, and life-after-filing questions",
        "Renewal": "timing, continuity, and preparation for keeping status stable",
        "Rights": "rights, protections, and what status means in practice",
        "Fees": "scope, payment structure, and financial clarity across stages",
        "Brazil": "country-level understanding before a move becomes real",
        "Investment": "market opportunity, structure, and risk awareness",
        "Economy": "macro context that affects work, business, and budgeting",
        "Quality": "quality-of-life trade-offs across different parts of Brazil",
        "Living": "daily routine, social rhythm, and practical adaptation",
        "Cost": "monthly planning, exchange-rate impact, and realistic budgets",
        "Places Hub": "regional and city comparison before choosing where to live",
        "Places": "regional and city comparison before choosing where to live",
        "Blog": "editorial reading that turns immigration confusion into better judgment",
        "Guides": "step-by-step practical reading before and after the move",
        "General": "foundational immigration concepts in plain English",
        "Visa": "entry logic, route fit, and consular distinctions",
        "Residency": "continuity, obligations, and longer-term stay",
        "Process": "how immigration work moves from understanding into execution",
        "Process Consultation": "first-stage review of route fit, timing, and priorities",
        "Consultation": "first-stage review of route fit, timing, and priorities",
        "Updates": "change-aware reading without panic or guesswork",
    }
    return mapping.get(label, mapping.get(normalized, f"more focused reading about {normalized.lower()}"))


def hub_context(page: Page) -> dict[str, str]:
    route = page.path.rstrip("/")
    mapping = {
        "/services": {
            "hero": "Choose the service family that matches the real stage of your Brazil matter. We group our work by route type, urgency, and function so you can move toward the right support with more clarity and less guesswork.",
            "overview": "Immigrate to Brazil organizes services around the way real matters develop. Some readers need route clarification. Others need filing support, residence planning, naturalisation strategy, urgent defense, or a supporting service that keeps the file coherent. This hub is the fastest way to understand those families before you commit to the wrong starting point.",
            "closing": "Our goal here is not to push every reader into the same service. It is to help you identify the page that matches your real pressure point so any later consultation starts from a stronger place.",
        },
        "/services/advisory": {
            "hero": "Use this hub when the route is still being clarified, compared, or structured. Advisory work is where uncertainty becomes a clearer plan before formal filing or legal execution begins.",
            "overview": "Advisory services sit at the front of the process. They are designed for people who need better judgment before they need more movement. That may mean clarifying route fit, comparing options, organizing chronology, or making sure the file is aligned before money, deadlines, or emotion push the process too far ahead.",
            "closing": "A strong advisory stage saves time because it prevents weak sequence later. That is why we treat this family as practical groundwork, not as optional decoration around the process.",
        },
        "/services/defense": {
            "hero": "Use this hub when the matter is already sensitive, urgent, or exposed. Defense work is about stabilizing the situation, protecting chronology, and making sure the next move is careful rather than reactive.",
            "overview": "Defense services exist for the moments when immigration matters stop feeling theoretical. A refusal, notice, fine, risk of removal, or contentious authority interaction changes the quality of the situation immediately. This hub helps readers identify the kind of exposure they are dealing with and the category of support most likely to protect the process.",
            "closing": "In defense matters, the best next step is usually the one that reduces improvisation. The purpose of this hub is to help you recognize that point early.",
        },
        "/services/naturalisation": {
            "hero": "Use this hub when the question is no longer only about staying in Brazil, but about citizenship, continuity, records, and long-term legal position.",
            "overview": "Naturalisation services belong to a later and more strategic stage of the immigration journey. They depend on history, lawful continuity, civil records, language, timing, and the way earlier stages were handled. This hub helps readers distinguish the citizenship paths that may matter to them and the kind of preparation each one usually requires.",
            "closing": "Citizenship planning is strongest when it begins before the file is under pressure. That is why these pages focus on continuity, records, and long-range structure rather than only on outcomes.",
        },
        "/services/other": {
            "hero": "Use this hub for supporting services that often make the main immigration path workable in practice. These are the pieces people underestimate until documents, translations, consular steps, or regularization issues start slowing everything else down.",
            "overview": "Not every immigration problem is solved by choosing a route. Many matters depend on underlying support work: civil records, certified translations, consular handling, or regularization of a file that is not yet clean enough to progress safely. This hub groups those supporting services so the reader can identify what needs to be fixed, gathered, or aligned first.",
            "closing": "Supporting work is often where stability begins. When these foundations are weak, even a good main route can become harder to execute.",
        },
        "/services/residencies": {
            "hero": "Use this hub when the main question is lawful longer-term stay in Brazil. Residence routes are where continuity, registration, obligations, and life planning start to matter more than simple entry.",
            "overview": "Residence services are for people planning to build continuity in Brazil rather than only arrive. That may happen through family, work, treaty routes, retirement, humanitarian grounds, study, investment, or other specific categories. This hub helps readers compare those residence families in a more practical way before they confuse labels with fit.",
            "closing": "Residence planning is usually stronger when the route is judged against daily life, documents, and longer-term consequences rather than only against the first attractive label.",
        },
        "/services/visas": {
            "hero": "Use this hub when the main question is entry, consular preparation, or short-to-medium-term route fit. Visa pages help readers understand purpose, sequence, documents, and the logic behind each category.",
            "overview": "Visa services are often where Brazil planning becomes real for the first time. They translate a broad idea of travel, work, family, business, study, or remote life into an actual entry route that has to make sense on paper as well as in real life. This hub groups those entry routes so the reader can compare them with more structure.",
            "closing": "A visa is rarely just a label. It is a legal route tied to purpose, documents, timing, and later consequences. That is why these pages focus on fit, not only on attraction.",
        },
        "/brazil": {
            "hero": "Start here when you want to understand Brazil as a country you may actually build a life around. This hub connects lifestyle research, regional comparison, and relocation planning so country-level interest can turn into a more grounded decision.",
            "overview": "Brazil is easiest to misunderstand when it is treated as one mood, one city, or one travel experience. The country is large, regionally diverse, and full of differences in climate, cost, pace, infrastructure, and social rhythm. This hub helps readers compare those realities before they choose a place, a budget, or an immigration path.",
            "closing": "We use the Brazil family to help readers replace broad fascination with clearer planning. That makes later conversations about route, city, and timing much more productive.",
        },
        "/brazil/places": {
            "hero": "Use this hub when the main question is where in Brazil life might fit you best. The pages inside it help compare regions, cities, and local realities instead of treating the whole country as one generic destination.",
            "overview": "Place choice changes the practical meaning of a move to Brazil. Climate, services, transport, cost, culture, education, healthcare, and social rhythm all shift by region and city. This hub helps narrow the shortlist before emotional attraction hardens into a decision that has not yet been tested against routine.",
            "closing": "For many readers, place is the bridge between admiration and planning. The point of this hub is to make that bridge more realistic and more useful.",
        },
        "/process": {
            "hero": "Use this hub to understand how immigration work actually moves: from consultation and assessment into strategy, filing, approval, aftercare, and long-term continuity.",
            "overview": "Process confusion is one of the biggest sources of avoidable stress in immigration matters. People often know the route label they are interested in, but not the order, responsibilities, risks, deadlines, or aftercare questions that make the route stable in real life. This hub explains those stages so the overall journey feels more readable.",
            "closing": "We treat process clarity as part of the service itself. When the stages are visible, decisions usually become calmer and more disciplined.",
        },
        "/insights": {
            "hero": "Use this hub when you want better immigration understanding before individualized advice begins. The goal is to reduce confusion, improve vocabulary, and make research more useful instead of more overwhelming.",
            "overview": "Insights pages are where we slow Brazil immigration down and explain it in plain English. They are not substitutes for case-specific analysis, but they do help readers understand the legal language, public institutions, route distinctions, and common misunderstandings that often block good decisions at the research stage.",
            "closing": "We want these pages to leave readers more informed, more realistic, and better prepared for a later consultation if one becomes necessary.",
        },
    }
    return mapping[route]


def hub_section_body(page: Page, name: str, ctx: dict[str, str]) -> str:
    primary_links = page.links[:5]
    bullet_links = primary_links or page.links[:5]
    bullets = [f"{label}: {link_summary(label)}." for label in bullet_links]
    if name == "Overview":
        return "\n\n".join(
            [
                ctx["overview"],
                "We designed this hub to give readers a calmer first layer of orientation. Instead of jumping between unrelated pages, you can start with the family that matches your actual question and move inward from there with more confidence.",
                bullet_block("Inside this hub you can usually begin with:", bullets),
                ctx["closing"],
            ]
        )
    if "Explore" in name:
        return "\n\n".join(
            [
                "Different readers arrive with different priorities. Some need a broad explanation. Others already know the family of issue they are dealing with but still need a better starting point inside it. This section helps narrow that choice.",
                bullet_block("Use the child pages this way:", bullets),
                "If two or three child pages all feel relevant at once, that is usually a sign that the issue has matured beyond simple browsing and may benefit from structured consultation.",
            ]
        )
    if "How To Use" in name or "How To Read" in name:
        return "\n\n".join(
            [
                "The strongest way to use this hub is to read in sequence rather than in fragments. Start with the page that matches your present stage, then open neighboring pages only if they genuinely answer the next question instead of creating more noise.",
                bullet_block(
                    "A practical reading order usually looks like this:",
                    [
                        "identify the real decision first, such as route choice, place choice, filing, risk, or aftercare",
                        "open the child page that fits that decision most directly",
                        "use one adjacent page to compare or deepen understanding",
                        "move to consultation when the answer starts depending on your own facts, records, or timing",
                    ],
                ),
                "This is how we keep the site useful without pretending every question can be resolved through solo reading alone.",
            ]
        )
    if "Why Process Clarity Matters" in name:
        return "\n\n".join(
            [
                "Process clarity matters because many immigration problems begin long before any formal refusal or delay. They begin when people act in the wrong order, underestimate supporting documents, or assume that one completed step means the whole route is now secure.",
                bullet_block(
                    "Clear process understanding usually improves:",
                    [
                        "timing between stages",
                        "quality of documents and chronology",
                        "expectations about authority control and delay",
                        "confidence in what should happen next",
                    ],
                ),
                "When the process is readable, the experience usually becomes calmer as well as more efficient.",
            ]
        )
    if "What These Pages Are Designed To Do" in name or "What Insights Are For" in name:
        return "\n\n".join(
            [
                "These pages are written to do one job well: reduce confusion without pretending to replace individualized review. We want readers to leave with better questions, clearer terminology, and a more reliable sense of where their situation fits.",
                bullet_block(
                    "In practice, that means:",
                    [
                        "plain-English explanation of the main distinctions that affect decisions",
                        "honest boundaries around what a public page can and cannot resolve",
                        "links into the next page or next service when general reading stops being enough",
                        "a calmer path into consultation for readers who do need case-specific support",
                    ],
                ),
                "A site can be helpful without sounding certain where certainty would be misleading. That balance matters to us.",
            ]
        )
    if "If You Are Between Categories" in name or "Reading Lens" in name:
        return "\n\n".join(
            [
                "It is common to feel as if your situation overlaps more than one category. A family-based move can also involve work. A residence question can also be a place-choice question. A filing problem can also be a records problem. That overlap does not mean you are lost; it usually means the matter has several moving parts that need to be put in the right order.",
                bullet_block(
                    "Use this reading lens when more than one page seems relevant:",
                    [
                        "choose the page that matches the most urgent pressure point first",
                        "then open the page that affects the decision after that",
                        "treat overlapping pages as connected, not competing",
                        "reach out once the overlap is being driven by your own chronology or documents",
                    ],
                ),
                "Our role is to help separate those layers so the process becomes more coherent instead of more crowded.",
            ]
        )
    if "Best Next Step" in name:
        return "\n\n".join(
            [
                "The best next step depends on whether you still need orientation or already need a personal review. If the question is still broad, the right move is usually to open the most relevant child page and keep narrowing. If the question already depends on your documents, deadlines, travel history, family structure, or route comparison, the better move is usually consultation.",
                bullet_block(
                    "A consultation usually makes sense when:",
                    [
                        "you are between two or more possible routes",
                        "you think an earlier step may already have weakened the process",
                        "timing or deadlines are starting to matter",
                        "the answer now depends on facts that are too specific for a public page",
                    ],
                ),
                "We built these hubs so readers can move toward the right next step with less hesitation and more structure.",
            ]
        )
    return "\n\n".join([ctx["overview"], bullet_block("Useful starting points:", bullets), ctx["closing"]])


def expand_hub(page: Page, family_intro: str) -> Page:
    del family_intro
    ctx = hub_context(page)
    page.hero_summary = ctx["hero"]
    page.sections = [(title, hub_section_body(page, title_tail(title), ctx)) for title, _ in page.sections]
    page.end_cta = {
        "/services": "Open the service family that best matches your current situation, or book a consultation if the route, risk, or next step is still unclear.",
        "/services/advisory": "If you are still defining the route, start with consultation. If you already know the kind of advisory support you need, open that page and continue from there.",
        "/services/defense": "If the matter is urgent, exposed, or already affecting your legal position, move to the relevant defense page and contact us quickly for structured next-step guidance.",
        "/services/naturalisation": "If citizenship is already part of your planning horizon, open the path that matches your history and use consultation when the answer depends on records, continuity, or route comparison.",
        "/services/other": "Use the supporting page that matches the foundation your file is missing, and reach out when records, translations, consular steps, or regularization issues need structured handling.",
        "/services/residencies": "Open the residence route that best matches your real purpose in Brazil, and use consultation if you are choosing between categories or thinking about long-term continuity.",
        "/services/visas": "Open the visa route that best matches your purpose of entry, and use consultation if the route label sounds right but the practical fit is still uncertain.",
        "/brazil": "Open the topic or place that matches your next decision, and reach out when your move depends on legal route, budget, family context, or long-term planning.",
        "/brazil/places": "Open the region or place category that fits your shortlist, and contact us when your decision now depends on immigration route, family needs, or long-term settlement planning.",
        "/process": "Open the process page that matches your current stage, then reach out when the next move depends on deadlines, chronology, or route comparison that cannot be resolved by general reading alone.",
        "/insights": "Read the insight page that matches the question you are trying to understand, then reach out when the issue depends on your own chronology, route fit, documents, or authority exposure.",
    }.get(page.path.rstrip("/"), page.end_cta.splitlines()[0])
    return page


def resources_for_brazil(page_slug: str) -> list[str]:
    base = [COMMON["ibge_states"], COMMON["ibge_map"], COMMON["tourism"], COMMON["pf"], COMMON["itamaraty"]]
    if page_slug in {"investment", "economy"}:
        return [COMMON["economy"], COMMON["bcb"], COMMON["apex"], COMMON["ibge_states"], COMMON["pf"]]
    if page_slug == "healthcare":
        return [COMMON["health"], COMMON["ans"], COMMON["ibge_states"], COMMON["security"], COMMON["tourism"]]
    if page_slug == "education":
        return [COMMON["mec"], COMMON["inep"], COMMON["ibge_states"], COMMON["itamaraty"], COMMON["tourism"]]
    if page_slug == "culture":
        return [COMMON["culture"], COMMON["tourism"], COMMON["ibge_states"], COMMON["ibge_census"], COMMON["itamaraty"]]
    if page_slug == "safety":
        return [COMMON["security"], COMMON["ibge_states"], COMMON["pf"], COMMON["tourism"], COMMON["itamaraty"]]
    if page_slug in {"brazil", "north", "northeast", "central-west", "southeast", "south"}:
        return [COMMON["ibge_states"], COMMON["ibge_map"], COMMON["ibge_census"], COMMON["tourism"], COMMON["inmet"]]
    return base


def expand_brazil(page: Page) -> Page:
    s = slug(page.path)
    facts = BRAZIL_FACTS.get(s, ["regional variation", "daily-life fit", "cost and services", "good planning sequence"])
    page.resources = resources_for_brazil(s)
    if is_hub(page):
        return expand_hub(page, "")
    subject = brazil_subject(s)
    page.hero_summary = {
        "brazil": "Brazil is best understood as a set of regions, systems, cultures, and everyday realities rather than a single generic destination. We explain those layers so readers can turn admiration for Brazil into a more grounded relocation decision.",
        "investment": "Investment in Brazil can be attractive, but it only becomes useful when market interest is matched with structure, due diligence, and a realistic reading of region, sector, and timing.",
        "economy": "Brazil's economy affects work, business, purchasing power, and long-term planning. We explain the practical side of that economic picture for readers considering a life, project, or move here.",
        "quality": "Quality of life in Brazil is real, but it is highly place-dependent. Climate, cost, community, services, and routine all shape whether Brazil feels sustainable over time.",
        "living": "Daily life in Brazil changes a great deal by city, region, and budget. We explain what routine, rhythm, social life, and adaptation can actually look like on the ground.",
        "cost": "Cost of living in Brazil cannot be reduced to one headline number. We break it into housing, transport, healthcare, food, education, and lifestyle so planning can become more realistic.",
        "housing": "Housing choices shape whether a move to Brazil feels stable, expensive, or exhausting. We explain the practical realities of renting, buying, neighborhood choice, and local housing expectations.",
        "healthcare": "Healthcare in Brazil combines public access, private options, strong local variation, and planning questions that matter to individuals and families alike.",
        "education": "Education planning in Brazil depends on city choice, language, budget, age, and long-term goals. We explain the main systems and the practical questions foreign families often need to ask.",
        "safety": "Safety in Brazil deserves a realistic explanation rather than either denial or fear. We look at how location, routine, awareness, and city choice shape the lived experience.",
        "culture": "Brazilian culture is one of the country’s strongest attractions, but it is also one of its most regionally varied realities. We explain the habits, rhythms, and social texture that people feel in everyday life.",
        "festivals": "Festival life in Brazil reveals far more than a calendar of parties. It shows regional identity, community life, music, tourism, and the emotional energy that draws many foreigners here in the first place.",
        "cuisine": "Brazilian cuisine is everyday, regional, social, and far more diverse than a short list of famous dishes. We explain how food helps readers understand daily life as well as culture.",
        "events": "Events in Brazil shape how cities feel, how communities gather, and how foreigners often experience the country beyond formal institutions and paperwork.",
        "guides": "These Brazil guides are designed to make planning more practical: first steps, common mistakes, settling tasks, and the everyday questions that appear before and after arrival.",
        "faqs": "Brazil questions often repeat because the same confusions repeat: cost, safety, language, work, residency, and how life actually works on the ground. We answer them in a structured way here.",
        "places": "Brazil only becomes fully understandable when place enters the conversation. This page helps readers compare regions, cities, and local realities rather than relying on one broad national image.",
        "north": "North Brazil has its own geography, logistics, climate, and urban rhythm. We explain what makes the region distinctive for readers considering travel, living, or investment.",
        "northeast": "Northeast Brazil brings together strong regional identity, major coastal capitals, tourism, and very different realities between one city and another.",
        "central-west": "Central-West Brazil combines the federal capital, agribusiness influence, interior geography, and a pace of life that often surprises readers who imagine Brazil only through the coast.",
        "southeast": "Southeast Brazil concentrates business, infrastructure, and some of the country’s most diverse urban experiences. It is often the entry point for foreigners, but never a single reality.",
        "south": "South Brazil is often associated with cooler weather, mid-sized city life, and a different rhythm from tropical stereotypes. We explain what that means in practical terms.",
        "states": "State-level comparison helps readers move from country-wide fascination to more realistic shortlists. State identity affects services, culture, administration, and how cities are experienced.",
        "cities": "City choice shapes daily life in Brazil more than national image does. We explain how scale, housing, transport, safety, services, and social rhythm change from one city to another.",
        "municipalities": "Municipal boundaries matter more than many readers expect. They affect schools, services, taxation, commuting, and the ordinary feel of daily life.",
        "directory": "The directory is here to help readers locate useful topics, categories, and place-based information with more speed and less scattered browsing.",
        "search": "Search works best when the reader already knows the kind of question they are trying to answer. We explain how to use it more efficiently and when search has reached its limit.",
    }.get(s, f"We explain {subject} in practical terms so readers can connect research about Brazil to real planning decisions.")
    sections: list[tuple[str, str]] = []
    for title, _ in page.sections:
        name = title_tail(title)
        fact_line = natural_join(facts)
        if name == "Overview":
            body = "\n\n".join(
                [
                    f"{subject.capitalize()} only becomes useful as a planning topic when it is connected to real decisions. Many readers arrive with admiration, curiosity, or a shortlist already forming in their minds, but they still need a clearer frame for how geography, climate, cost, services, culture, and routine interact over time.",
                    f"In our work, we encourage people to read {subject} as a lived reality rather than a travel impression. That means looking at how one choice affects the next: place affects cost, cost affects housing, housing affects routine, routine affects language learning and integration, and all of those factors influence whether Brazil still feels right once the move becomes real.",
                    bullet_block(
                        "Useful anchors to keep in view:",
                        [
                            fact_sentence(facts[0]),
                            fact_sentence(facts[1]),
                            fact_sentence(facts[2]),
                            f"Official baseline references include {page.resources[0]} and {page.resources[1]}.",
                        ],
                    ),
                    "This is one of the reasons we write these Brazil pages in depth. They are meant to help readers move from broad attraction toward more disciplined planning without pretending that public country guidance can resolve a personal immigration strategy on its own.",
                ]
            )
        elif name in {"Identity", "Culture", "Traditions", "Music", "Social Norms", "Daily Life", "Richness", "Community", "Diversity"}:
            body = "\n\n".join(
                [
                    f"{subject.capitalize()} has a human dimension that cannot be reduced to scenery or reputation. Social rhythm, openness, regional identity, family structure, language, food, music, and public life all shape how Brazil is actually experienced once someone is here for more than a short visit.",
                    f"This matters because belonging is rarely built by paperwork alone. People tend to settle more successfully when they understand the tone of everyday interaction, the role of Portuguese, the importance of local custom, and the fact that cultural experience in Brazil changes greatly from one region and city to another.",
                    bullet_block(
                        "What readers usually need to picture more clearly:",
                        [
                            fact_sentence(facts[0]),
                            fact_sentence(facts[1]),
                            fact_sentence(facts[2]),
                            "Cultural fit often affects confidence, friendship, and long-term stability more than people first expect.",
                        ],
                    ),
                    "When we help clients compare places in Brazil, we never treat culture as a decorative extra. It is part of how a city or region will actually feel in daily life.",
                ]
            )
        elif name in {"Regions", "Regional", "Regional Differences", "Cities", "Location", "Locations", "Variation", "Population"}:
            body = "\n\n".join(
                [
                    f"Regional comparison is one of the most important parts of understanding {subject}. Brazil does not reward broad assumptions. Climate, infrastructure, housing markets, urban scale, transport, and social rhythm shift enough between regions and cities that a good decision usually depends on local reading rather than national stereotypes.",
                    f"That is why we encourage readers to compare place honestly. A city that feels ideal for remote work may be less attractive for a family with young children. A region that looks affordable on paper may require trade-offs in flights, specialist healthcare, schools, or language support. This wider frame becomes clearer when the reader remembers {fact_line}.",
                    bullet_block(
                        "Useful place-based reminders:",
                        [
                            "One city cannot stand in for the whole country.",
                            "Regional identity affects daily life, not only tourism.",
                            "Administrative boundaries can change services, taxes, and commuting patterns.",
                            f"Use official references such as {page.resources[0]} and {page.resources[1]} when narrowing the shortlist.",
                        ],
                    ),
                    "For many people, the right Brazil decision appears only after the place question is slowed down properly.",
                ]
            )
        elif name in {"Lifestyle", "Routine", "Social Life", "Pace", "Benefits", "Reality", "Experience", "Flexibility", "Comparison"}:
            body = "\n\n".join(
                [
                    f"Daily life is where {subject} stops being an idea and starts becoming a real test of fit. People often fall in love with Brazil through weather, energy, beauty, or social warmth, but a sustainable move depends just as much on routine: commuting, noise, safety habits, school runs, work rhythm, household costs, and whether the social pace matches the life being built.",
                    f"We encourage readers to think in terms of ordinary months rather than exceptional days. A strong lifestyle decision is not about whether Brazil can feel exciting. It is about whether it can feel coherent on a Monday morning, in the rainy season, during school enrollment, while dealing with documents, or while maintaining work across borders.",
                    bullet_block(
                        "Questions that usually make the topic clearer:",
                        [
                            "What kind of daily routine are you trying to build?",
                            "How much movement, community, and pace do you want around you?",
                            "How does your budget change the version of Brazil you are actually considering?",
                            "Would the place still feel right outside a holiday or honeymoon phase?",
                        ],
                    ),
                    "That is why our Brazil guidance always links lifestyle to place, cost, work pattern, and long-term immigration goals rather than treating it as a mood alone.",
                ]
            )
        elif name in {"Opportunities", "Sectors", "Industries", "Employment", "Trade", "Business Climate", "Growth", "Relevance For Immigrants", "Returns"}:
            body = "\n\n".join(
                [
                    f"Economic opportunity in {subject} is real, but it is never evenly distributed. Sector, city, language, professional network, regulatory structure, and timing all influence whether a market looks promising in theory and whether it is workable in practice for a foreigner or relocating family.",
                    f"We prefer to frame opportunity in a disciplined way. That means separating macro interest from operational reality: who the local customer is, what region supports the activity, how documentation and corporate structure may affect execution, and what lifestyle or immigration route would actually support the project once it is underway.",
                    bullet_block(
                        "A more realistic opportunity lens usually includes:",
                        [
                            fact_sentence(facts[0]),
                            fact_sentence(facts[1]),
                            "Language, local relationships, and due diligence often shape outcomes as much as the headline sector itself.",
                            f"Official starting points for deeper reading include {page.resources[0]} and {page.resources[1]}.",
                        ],
                    ),
                    "This is where country knowledge and service guidance start to overlap. The right opportunity question is not only whether Brazil looks attractive, but whether the planned move, business, or investment can actually be executed with structure.",
                ]
            )
        elif name in {"Climate", "Environment"}:
            body = "\n\n".join(
                [
                    f"Climate matters because it changes comfort, cost, routine, and place fit over time. Brazil contains tropical heat, humid equatorial conditions, drier seasonal patterns, cooler southern winters, and local microclimates that can make one shortlist feel very different from another once daily life begins.",
                    f"Readers often underestimate the practical side of climate. Temperature affects housing choices, transport habits, healthcare routines, energy use, children’s schedules, and whether a city feels restorative or exhausting after the first months.",
                    bullet_block(
                        "Why climate deserves real attention:",
                        [
                            "Weather patterns influence routine more than short trips reveal.",
                            "Heat, humidity, rainfall, and seasonal variation change by region and elevation.",
                            f"{page.resources[-1]} is a useful official starting point when comparing conditions.",
                            "The best place for one person’s body and work style may be the wrong place for another’s.",
                        ],
                    ),
                    "In our experience, climate becomes one of the clearest long-term filters once readers stop treating Brazil as if it had one single weather profile.",
                ]
            )
        elif name in {"Accessibility", "Access", "Services", "Housing", "Food", "Transport", "Healthcare", "Education", "Budgeting", "Types", "Renting", "Buying", "Costs", "Contracts", "Public", "Private", "Insurance", "Higher", "Language", "Expats", "Advice"}:
            body = "\n\n".join(
                [
                    f"The practical side of {subject} is where a move either becomes manageable or starts to strain. Public and private systems coexist in Brazil, documentation standards vary, and local habits around contracts, payments, healthcare, schooling, and everyday services are not always intuitive for foreigners at the beginning.",
                    f"That is why we write these sections with a planning lens. Readers need to know what usually creates friction, which details affect stability, and how everyday systems change from one city or region to another. A good decision here is rarely about the cheapest or most famous option. It is about fit, continuity, and whether the arrangement still works after arrival.",
                    bullet_block(
                        "What usually deserves closer attention:",
                        [
                            fact_sentence(facts[0]),
                            fact_sentence(facts[1]),
                            "Language and local process habits often affect access as much as legal entitlement does.",
                            "Strong planning compares cost, convenience, risk, and long-term sustainability together.",
                        ],
                    ),
                    "This is one of the places where Immigrate to Brazil adds value beyond inspiration. We help readers connect the practical systems of living in Brazil to the route, city, and lifestyle they are considering.",
                ]
            )
        elif name in {"Risks", "Challenges", "Precautions", "Awareness", "Balance", "Perception"}:
            body = "\n\n".join(
                [
                    f"{subject.capitalize()} deserves a realistic reading that is neither romanticized nor alarmist. Every move involves trade-offs, and Brazil is no exception. The country can offer beauty, energy, warmth, and opportunity while also requiring stronger attention to sequence, local variation, personal safety habits, and practical planning.",
                    f"We believe readers make better decisions when risk is named calmly. Good planning is not the opposite of enthusiasm. It is what protects enthusiasm from turning into disappointment later.",
                    bullet_block(
                        "A balanced way to read the risks is to ask:",
                        [
                            "Which risks belong to place choice rather than to the whole country?",
                            "Which risks can be reduced through routine, documentation, or budget planning?",
                            "Which concerns are based on real local variation and which are based on oversimplified narratives?",
                            f"Which official references, such as {page.resources[0]} or {page.resources[1]}, help replace guesswork with better evidence?",
                        ],
                    ),
                    "That steadier lens is part of our wider approach. We want readers to feel encouraged by Brazil, but we also want them to feel prepared for the realities that make a move sustainable.",
                ]
            )
        elif name in {"Future", "Conclusion"}:
            body = "\n\n".join(
                [
                    f"The future value of {subject} depends on whether today’s attraction can be turned into a stable longer-term plan. For many readers, that means thinking beyond arrival and asking how cost, language, services, work, family, and immigration continuity will feel over the next several years rather than only the next several months.",
                    f"We encourage this longer lens because Brazil rewards planning that is both hopeful and disciplined. It is easier to stay enthusiastic about the move when the practical questions have been answered early and honestly.",
                    bullet_block(
                        "A strong long-range reading usually asks:",
                        [
                            "whether the place still fits once novelty fades",
                            "how current decisions affect later residence or citizenship goals",
                            "what level of language, budget, and service access will be needed to feel stable",
                            "which official references and local comparisons still need to be checked before committing fully",
                        ],
                    ),
                    "That future-facing view is part of how we help readers move from inspiration to durable planning.",
                ]
            )
        else:
            body = "\n\n".join(
                [
                    f"{subject.capitalize()} becomes more useful when it is connected to a real planning decision instead of being treated as a standalone topic. Readers usually get the most value from this subject when they compare it with place, budget, routine, and immigration timing rather than reading it in isolation.",
                    f"In practice, the topic usually opens wider questions: where in Brazil the fit is strongest, what trade-offs are acceptable, what sequence should come first, and whether the move still makes sense once daily life and long-term responsibilities are included.",
                    bullet_block(
                        "Useful reminders for this topic:",
                        [
                            fact_sentence(facts[0]),
                            fact_sentence(facts[1]),
                            f"Official references such as {page.resources[0]} and {page.resources[1]} are useful when you want to go deeper.",
                            "A good Brazil decision normally survives comparison, not only attraction.",
                        ],
                    ),
                    "That is the wider purpose of these pages: to help readers turn interest in Brazil into a more informed and more confident next step.",
                ]
            )
        sections.append((title, body))
    page.sections = sections
    page.end_cta = "If this page is changing how you think about Brazil, the next step is to turn that research into a real plan. Book a consultation when city choice, budget, family context, work pattern, or immigration route now need to be tested together, or contact us on WhatsApp if you want help understanding what to compare next."
    return page


def expand_services(page: Page) -> Page:
    parts = page.path.strip("/").split("/")
    family = parts[1] if len(parts) > 1 else "services"
    page.resources = [
        COMMON["migration_law"],
        COMMON["migration_decree"],
        COMMON["pf"],
        COMMON["itamaraty"],
        COMMON["security"],
    ]
    if is_hub(page):
        return expand_hub(page, "")
    leaf = parts[-1]
    route_label = SERVICE_LABELS.get(leaf, leaf.replace("-", " "))
    family_desc = {
        "advisory": "clarity, route comparison, chronology control, and early-stage decision quality",
        "defense": "urgency, exposure, chronology protection, and careful legal positioning",
        "naturalisation": "citizenship continuity, records, timing, and long-range legal planning",
        "other": "supporting work that makes the main immigration path executable in practice",
        "residencies": "lawful longer-term stay, registration, continuity, and stable life planning in Brazil",
        "visas": "entry logic, purpose fit, consular preparation, and pre-arrival structure",
    }.get(family, "route fit, process structure, and stronger next-step planning")
    page.hero_summary = f"This page explains how we handle {route_label} matters at Immigrate to Brazil: who usually needs this support, what risks and misunderstandings commonly appear, how the process is structured, and what usually changes once the route is reviewed with more care."

    def service_context() -> dict[str, str]:
        if family == "advisory":
            mapping = {
                "consultation": {
                    "audience": "people who need a first structured review before choosing a route or taking the next step",
                    "focus": "clarity, route fit, timing, and what should happen next",
                    "documents": "chronology, current status, key facts, and the questions that are blocking progress",
                    "not_fit": "matters that already require urgent legal defense or a highly specific filing response before a broad review",
                    "cross": "travel history, language clarity, and the fact that readers often arrive after conflicting online research",
                },
                "strategy": {
                    "audience": "people comparing routes, timing, or longer-term outcomes rather than only asking whether one path is possible",
                    "focus": "option comparison, sequencing, and structured decision-making",
                    "documents": "records that show continuity, personal goals, family structure, and route-sensitive facts",
                    "not_fit": "cases that still need basic orientation or, at the other extreme, cases that are already in urgent defense territory",
                    "cross": "family, business, tax, travel, and location planning questions that affect route choice",
                },
                "compliance": {
                    "audience": "people who want to make sure the file, route, and ongoing conduct remain aligned with legal and procedural requirements",
                    "focus": "alignment, record hygiene, timing control, and prevention of avoidable exposure",
                    "documents": "registrations, deadlines, past filings, supporting evidence, and any obligations attached to the route",
                    "not_fit": "purely exploratory readers who still need route orientation before compliance work becomes meaningful",
                    "cross": "ongoing duties, reporting, renewal risk, and the effect of weak records over time",
                },
                "corporate": {
                    "audience": "companies, founders, investors, and professionals whose Brazil plans involve commercial structure as well as immigration planning",
                    "focus": "corporate alignment, immigration implications, and execution that reflects real business activity",
                    "documents": "corporate records, investment plans, contracts, ownership structure, and timing between business and immigration steps",
                    "not_fit": "simple personal routes that do not depend on commercial structure",
                    "cross": "multiple jurisdictions, entity formation, commercial risk, and coordination between business and immigration timelines",
                },
                "representation": {
                    "audience": "people who already understand the issue but need a more formal and structured channel for communication, coordination, or legal handling",
                    "focus": "clear scope, authority-facing discipline, and steadier control over the file",
                    "documents": "the operative record, prior communications, deadlines, and the material required for the defined representation stage",
                    "not_fit": "matters that still need basic orientation before representation can be sensibly defined",
                    "cross": "language precision, chronology control, and the distinction between advisory support and formal legal engagement",
                },
            }
            return mapping.get(leaf, mapping["consultation"])
        if family == "defense":
            mapping = {
                "appeals": {
                    "audience": "people facing refusal, adverse decisions, or outcomes that may need structured challenge",
                    "focus": "grounds, timing, evidence, and whether an appeal path is viable",
                    "documents": "the decision itself, chronology, prior filings, and the record that may support correction",
                    "not_fit": "situations where there is still no actual decision to review",
                    "cross": "deadlines, argument quality, and the difference between disappointment and appealable defect",
                },
                "deportation": {
                    "audience": "people facing removal exposure, overstay consequences, or authority pressure around status in Brazil",
                    "focus": "stabilization, chronology, legal position, and urgent next moves",
                    "documents": "entries, exits, notices, registrations, and any communication with authorities",
                    "not_fit": "purely hypothetical fears not linked to an actual status problem",
                    "cross": "timing, authority contact, travel history, and immediate risk management",
                },
                "expulsion": {
                    "audience": "people facing very serious immigration exposure connected to public-order or legal allegations",
                    "focus": "legal positioning, procedural protection, and careful handling under pressure",
                    "documents": "official notices, criminal or administrative records, identity records, and chronology",
                    "not_fit": "routine immigration questions that do not involve serious sanction exposure",
                    "cross": "legal defense strategy, institutional process, and the need for formal representation",
                },
                "extradition": {
                    "audience": "people dealing with cross-border legal exposure where immigration, criminal, and international process concerns overlap",
                    "focus": "high-stakes legal coordination, chronology protection, and specialist handling",
                    "documents": "court or authority documents, identity records, chronology, and any material relevant to the foreign request",
                    "not_fit": "ordinary immigration route planning",
                    "cross": "international cooperation, legal urgency, and the limits of public guidance in high-risk matters",
                },
                "fines": {
                    "audience": "people who have received immigration-related fines, penalties, or registration issues and need to understand consequence and correction",
                    "focus": "status exposure, payment or challenge logic, and regularization implications",
                    "documents": "fine notices, authority communications, travel history, and registration records",
                    "not_fit": "readers who only want broad route exploration",
                    "cross": "deadlines, documentation, and the effect of fines on later continuity",
                },
                "litigation": {
                    "audience": "people whose immigration matter now requires court-facing or contentious legal handling",
                    "focus": "legal structure, evidence, and disciplined procedural progression",
                    "documents": "the operative file, relevant notices, prior decisions, and any evidentiary material needed for the contentious stage",
                    "not_fit": "matters that can still be resolved through non-contentious planning alone",
                    "cross": "court timelines, legal representation, and high-quality chronology control",
                },
            }
            return mapping.get(leaf, mapping["appeals"])
        if family == "naturalisation":
            mapping = {
                "ordinary": {
                    "audience": "people planning citizenship through the ordinary naturalisation path and needing stronger continuity review",
                    "focus": "eligibility, lawful history, records, timing, and long-term preparation",
                    "documents": "civil records, residence history, registrations, and the material proving continuity and eligibility",
                    "not_fit": "readers whose residence history is still too early or too unstable for citizenship planning to be the immediate focus",
                    "cross": "family records, translations, criminal-clearance history, and long-range sequencing",
                },
                "extraordinary": {
                    "audience": "people exploring whether an extraordinary naturalisation path may apply to their history in Brazil",
                    "focus": "exceptional eligibility, long-duration continuity, and careful interpretation of the route",
                    "documents": "long-term residence evidence, identity records, civil status records, and continuity material",
                    "not_fit": "people who still need to stabilize basic residence history before looking at extraordinary paths",
                    "cross": "historic records, continuity gaps, and the need for careful legal reading of the route",
                },
                "provisional": {
                    "audience": "people dealing with a provisional citizenship stage or a transitional position that needs clearer next-step handling",
                    "focus": "what the provisional stage means, what it does not mean yet, and how to move properly from there",
                    "documents": "the current citizenship or residence record, supporting civil documents, and any continuity evidence tied to the provisional stage",
                    "not_fit": "simple first-time route exploration detached from an actual transitional status",
                    "cross": "timing, continuity, and how transitional status affects later certainty",
                },
                "reacquisition": {
                    "audience": "former Brazilian citizens or connected individuals who need to understand whether reacquisition is possible and how it is structured",
                    "focus": "status history, legal consequences of prior loss, and the route back into citizenship where available",
                    "documents": "proof of prior nationality status, civil records, identity documents, and any material related to the loss event",
                    "not_fit": "people who have never held Brazilian nationality and need an ordinary or special path instead",
                    "cross": "cross-border history, foreign citizenship issues, and long-range legal consequences",
                },
                "renunciation": {
                    "audience": "people considering renunciation and needing a careful review of consequences before any irreversible step is taken",
                    "focus": "effect, risk, long-term legal consequence, and whether renunciation is truly the right move",
                    "documents": "proof of current nationality status, linked foreign citizenship records, and the reasons renunciation is being considered",
                    "not_fit": "readers who are still only exploring abstract citizenship questions",
                    "cross": "family, inheritance, travel, residence, and future-positioning consequences that should be weighed carefully",
                },
                "special": {
                    "audience": "people exploring a special naturalisation path with specific eligibility characteristics",
                    "focus": "route fit, legal interpretation, documentary support, and realistic expectation management",
                    "documents": "civil records, residence records, route-specific evidence, and any material tied to the claimed basis",
                    "not_fit": "cases that are better read through ordinary residence progression first",
                    "cross": "special eligibility factors, procedural interpretation, and the quality of records over time",
                },
            }
            return mapping.get(leaf, mapping["ordinary"])
        if family == "other":
            mapping = {
                "consular": {
                    "audience": "people dealing with embassies, consulates, appointments, legalizations, or foreign-side process stages before or during a Brazil matter",
                    "focus": "consular sequence, documentary readiness, and practical coordination",
                    "documents": "consular forms, civil records, legalized documents, translations, and appointment-related materials",
                    "not_fit": "readers who do not yet know the underlying route or legal objective",
                    "cross": "country-specific practice, appointment delays, document legalization, and communication across borders",
                },
                "records": {
                    "audience": "people whose main problem is not route choice but the quality, consistency, or availability of records",
                    "focus": "civil documentation, chronology, and the record layer that supports the rest of the process",
                    "documents": "birth, marriage, divorce, criminal-clearance, name-change, and identity records",
                    "not_fit": "readers hoping records work will replace proper route analysis altogether",
                    "cross": "translations, apostilles, multiple jurisdictions, and consistency across old and new records",
                },
                "regularization": {
                    "audience": "people who need to correct, stabilize, or rebuild an immigration position that has drifted or broken down",
                    "focus": "recovery, viable options, chronology control, and risk reduction",
                    "documents": "current status records, travel history, prior filings, notices, and any evidence needed to rebuild the file",
                    "not_fit": "clean first-time applications that do not involve correction or stabilization",
                    "cross": "deadlines, disclosure, exposure, and the difference between fixable issues and false reassurance",
                },
                "translation": {
                    "audience": "people whose process depends on documents being legible, valid, and correctly presented across languages",
                    "focus": "language accuracy, sworn translation needs, and keeping the file consistent across jurisdictions",
                    "documents": "civil records, corporate documents, supporting evidence, and route-critical foreign-language material",
                    "not_fit": "people who still need to determine which documents matter at all before translation begins",
                    "cross": "sworn translation requirements, certification standards, and sequence between translation and filing",
                },
            }
            return mapping.get(leaf, mapping["records"])
        if family in {"residencies", "visas"}:
            route_type = "residence route" if family == "residencies" else "visa route"
            if leaf == "nomad":
                return {
                    "audience": "remote workers, founders, consultants, and internationally paid professionals who want Brazil to fit their work reality lawfully and sustainably",
                    "focus": f"{route_type} fit for foreign-source income, documentation quality, and how the move works beyond the label of a digital nomad life",
                    "documents": "income evidence, contracts, company records, travel planning, and consistency between the route and real work pattern",
                    "not_fit": "people whose main plan depends on local Brazilian employment, family sponsorship, or a different purpose altogether",
                    "cross": "remote work structure, tax questions, international banking evidence, and city choice for long-term routine",
                }
            if leaf in {"investor", "startup", "business"}:
                return {
                    "audience": "investors, founders, and business-minded readers whose Brazil plans depend on capital, commercial structure, or entrepreneurship",
                    "focus": f"{route_type} planning that aligns immigration with real business substance rather than assumptions",
                    "documents": "corporate records, investment evidence, contracts, business plans, and chronology between commercial and immigration steps",
                    "not_fit": "people whose plans are actually better framed through work, family, or retirement routes",
                    "cross": "due diligence, corporate formation, long-term management, and the difference between enthusiasm and legal structure",
                }
            if leaf in {"reunion", "family"}:
                return {
                    "audience": "couples, spouses, partners, parents, children, and dependents planning a family-linked move or longer-term stay in Brazil",
                    "focus": f"{route_type} planning around family relationship evidence, timing, and practical life organization",
                    "documents": "civil records, relationship evidence, translations, and any material proving the family link clearly and consistently",
                    "not_fit": "situations where the family link is not yet stable or where another route more accurately reflects the real purpose",
                    "cross": "dependents, children, marriage or partnership records, multiple jurisdictions, and real-life timing around the move",
                }
            if leaf in {"work", "skilled"}:
                return {
                    "audience": "professionals, employers, and sponsored workers whose Brazil plans depend on labor, skill, and employer-linked structure",
                    "focus": f"{route_type} planning tied to employment reality, sponsorship logic, and documentary alignment",
                    "documents": "employment offers, contracts, employer records, qualifications, and supporting civil documentation",
                    "not_fit": "people whose work plans are still hypothetical or whose purpose fits family, study, or remote-income routes better",
                    "cross": "employer coordination, qualifications, labor expectations, and timing between offer, filing, and travel",
                }
            if leaf in {"student", "study", "educational"}:
                return {
                    "audience": "students and families planning study-linked time in Brazil through schools, universities, or structured educational programs",
                    "focus": f"{route_type} planning that connects study purpose, enrollment reality, and long-term continuity",
                    "documents": "acceptance or enrollment material, civil records, financial evidence, and documents tied to the education provider",
                    "not_fit": "readers whose main aim is work, remote income, or family residence rather than study",
                    "cross": "academic calendars, language, family planning, and whether study is a first stage or a longer-term pathway",
                }
            if leaf in {"exchange", "research", "volunteer", "religious", "youth"}:
                return {
                    "audience": "people whose Brazil plans depend on a specific institution, mission, exchange, research activity, or structured social purpose",
                    "focus": f"{route_type} fit for purpose-based stays where institutional alignment and documentation matter greatly",
                    "documents": "institutional letters, program records, identity documents, funding or support evidence, and civil documentation",
                    "not_fit": "readers trying to use a purpose-based route as a substitute for a route that better matches work, family, or investment reality",
                    "cross": "institutional coordination, program dates, translations, and the gap between official purpose and real-life intentions",
                }
            if leaf in {"cplp", "mercosul", "humanitarian"}:
                return {
                    "audience": "people whose route may be affected by regional, treaty, or humanitarian logic rather than ordinary category comparison",
                    "focus": f"{route_type} interpretation where nationality, policy framework, and documentation history matter heavily",
                    "documents": "identity records, nationality proof, civil documentation, and any route-specific evidence tied to the applicable framework",
                    "not_fit": "readers whose route is better understood through employment, family, or investment logic",
                    "cross": "policy updates, documentary consistency, and the importance of reading the route through the correct legal framework",
                }
            if leaf == "retiree":
                return {
                    "audience": "retirees and later-life movers looking for lawful stay in Brazil connected to pension or income continuity",
                    "focus": f"{route_type} planning around income proof, city fit, healthcare, and long-term stability",
                    "documents": "income evidence, civil records, identity documents, and material tied to residence planning after arrival",
                    "not_fit": "people whose main purpose is active employment, study, or investment structure",
                    "cross": "healthcare, budget, housing, and the difference between holiday attraction and everyday life planning",
                }
            if leaf in {"health", "medical"}:
                return {
                    "audience": "people whose Brazil process is connected to treatment, healthcare needs, or medically linked travel and stay questions",
                    "focus": f"{route_type} planning where documentation, timing, and practical support need to be handled carefully",
                    "documents": "medical records, supporting letters, identity documents, and route-relevant financial or logistical material",
                    "not_fit": "readers whose purpose is better described by tourism or ordinary residence planning",
                    "cross": "treatment timelines, family support, healthcare access, and how urgency changes planning quality",
                }
            if leaf in {"tourist", "transit"}:
                return {
                    "audience": "travelers who need to understand the limits, purpose, and practical expectations of short-stay entry rather than longer-term continuity",
                    "focus": f"{route_type} logic around purpose, duration, and avoiding misuse of a short-stay category",
                    "documents": "travel records, passport validity, onward planning, and any evidence tied to the stated purpose of entry",
                    "not_fit": "people whose real plan is residence, local work, family establishment, or another longer-term purpose",
                    "cross": "travel timing, onward movement, and the difference between simple entry and later status planning",
                }
            if leaf in {"artistic", "journalist", "sports", "diplomatic"}:
                return {
                    "audience": "people whose route is tied to a specialized professional, official, or event-based purpose",
                    "focus": f"{route_type} interpretation for specialized categories where the exact purpose of stay matters significantly",
                    "documents": "institutional letters, contracts, credentials, official invitations, and supporting civil records",
                    "not_fit": "people trying to fit a general move into a specialized category that does not reflect the real purpose",
                    "cross": "institutional sponsorship, event timing, documentary precision, and later transition questions",
                }
            return {
                "audience": "readers who believe this route may match the real purpose of their move and want to test that assumption more carefully",
                "focus": f"{route_type} fit, documentary preparation, and the practical difference between a route label and a workable plan",
                "documents": "civil records, identity material, route-specific evidence, and the documents needed to keep chronology coherent",
                "not_fit": "situations where another route better reflects the true purpose, timing, or long-term objective",
                "cross": "family, language, timing, travel history, and the way route choice affects later continuity",
            }
        return {
            "audience": "people who need a more structured and realistic reading of this route or service",
            "focus": family_desc,
            "documents": "the records, chronology, and evidence that actually support the route in practice",
            "not_fit": "situations where the issue still needs broader orientation before route-specific work makes sense",
            "cross": "timing, language, and the interaction between documents and real-life plans",
        }

    ctx = service_context()

    def service_section_body(name: str) -> str:
        if name == "Overview":
            return "\n\n".join(
                [
                    f"{route_label.capitalize()} support is designed for {ctx['audience']}. In our work, this type of matter usually becomes important once the reader realizes that a route label alone is not enough. The process also depends on fit, chronology, documents, timing, and the way the move is actually meant to function in Brazil.",
                    f"We approach {route_label} with a structured service model. That means slowing the issue down, identifying the real legal or procedural purpose, checking whether the route matches the facts, and making sure the next step supports the wider plan instead of only solving one immediate question.",
                    bullet_block(
                        "What this service usually helps address:",
                        [
                            ctx["focus"].capitalize() + ".",
                            "Whether the documents and chronology support the route as claimed.",
                            "Where the main risks, misunderstandings, or weak assumptions sit.",
                            "What should happen next if the route is viable and what should change if it is not.",
                        ],
                    ),
                    "Our aim is not to make the route sound easy. It is to make it legible, workable, and aligned with the reality the client is actually trying to build.",
                ]
            )
        if "Who" in name:
            return "\n\n".join(
                [
                    f"We usually provide {route_label} support for {ctx['audience']}. The common thread is not only the route itself, but the fact that the person now needs a clearer and more disciplined reading of how that route behaves in practice.",
                    bullet_block(
                        "Common situations include:",
                        [
                            "the route looks promising, but the client is not yet sure it truly matches the facts",
                            "there is real pressure around timing, travel, family, work, or relocation planning",
                            "online research has produced broad knowledge but not enough confidence to proceed",
                            "the client wants to avoid spending money or emotional energy on the wrong first move",
                        ],
                    ),
                    "A strong fit is less about optimism and more about whether the route matches the person’s real purpose, documents, and next-stage plans.",
                ]
            )
        if "Clarify" in name or "Meant To Cover" in name or "Why People Choose" in name or "Why This Supporting Service Matters" in name:
            return "\n\n".join(
                [
                    f"The main value of {route_label} support is clarity. People usually come to us because they need more than a summary of eligibility. They need to understand how this route behaves, what it is genuinely designed to cover, and why it may be stronger or weaker than another option.",
                    f"In practice, the route often raises wider questions about {ctx['cross']}. Those questions matter because a route can sound attractive at first and still be the wrong foundation once the full file is reviewed.",
                    bullet_block(
                        "We usually help clarify:",
                        [
                            "the real purpose the route is meant to serve",
                            "which facts strengthen or weaken it",
                            "what documentation will have to carry the route later",
                            "how this route connects to longer-term plans in Brazil",
                        ],
                    ),
                    "That clearer reading is often what changes the quality of the whole process. It replaces enthusiasm or fear with a more informed decision.",
                ]
            )
        if "When" in name and "Not" not in name and "Another" not in name and "Stops" not in name:
            return "\n\n".join(
                [
                    f"{route_label.capitalize()} support usually makes the most sense once the issue is real enough that sequence matters. That may be before travel, before filing, after an offer or relationship is in place, when a business plan is moving, or when continuity questions are starting to affect the future value of the route.",
                    bullet_block(
                        "Timing is usually strongest when:",
                        [
                            "the client already has enough facts to compare options honestly",
                            "documents can still be prepared before pressure turns into haste",
                            "a wrong step would create cost, delay, or unnecessary exposure",
                            "the move is becoming practical rather than only aspirational",
                        ],
                    ),
                    "Good timing does not mean rushing. It means starting the route-specific work before the file becomes harder to stabilize.",
                ]
            )
        if "Another Service" in name or "Another Route" in name or "Not Yet" in name or "Stops Being" in name:
            return "\n\n".join(
                [
                    f"{route_label.capitalize()} is not automatically the right answer just because it is the route a reader first heard about. Some situations need consultation before route selection, some need records or translation work first, and some are better served by a different family altogether.",
                    f"In our view, it is better to define that boundary clearly than to stretch a route beyond what it is designed to do. The route may not be the right fit where {ctx['not_fit']}.",
                    bullet_block(
                        "Signs another starting point may be better include:",
                        [
                            "the stated purpose of the move does not really match the route label",
                            "the necessary records are not yet clear or available",
                            "the matter has become urgent enough that defense or regularization must come first",
                            "a different route would create stronger continuity over time",
                        ],
                    ),
                    "That kind of honesty is part of how we protect both the client and the process.",
                ]
            )
        if "Common" in name or "Exposure" in name or "Mistakes" in name or "Problems" in name or "Issues" in name or "Not To Do" in name:
            return "\n\n".join(
                [
                    f"Most {route_label} problems do not begin with one dramatic mistake. They usually begin with drift: weak sequence, incomplete understanding, documents gathered in the wrong order, or assumptions that sounded reasonable until they had to survive scrutiny.",
                    f"The pressure points in these matters often sit around {ctx['documents']}. Once those foundations are weak, the route becomes harder to explain and more vulnerable to delay, correction, or disappointment.",
                    bullet_block(
                        "Recurring problems we see include:",
                        [
                            "treating the route label as if it were the whole strategy",
                            "moving ahead before the documentary record is consistent",
                            "underestimating translations, civil records, or chronology gaps",
                            "expecting speed or certainty where authority review still controls the outcome",
                        ],
                    ),
                    "Naming these patterns early is one of the simplest ways to reduce future friction.",
                ]
            )
        if "How We Handle" in name or "Stabilise" in name or "Evaluate" in name or "Approach" in name or "Structure" in name or "Prepare" in name:
            return "\n\n".join(
                [
                    f"We handle {route_label} through structure rather than improvisation. We begin by reading the facts as they actually are, not as the client hopes they will look later. From there we review chronology, documents, route fit, timing, and any linked issues that could affect the strength of the case.",
                    f"Once the matter is clearer, we organize the work into a usable sequence. That may involve gathering or correcting records, refining the legal reading of the route, preparing the client for the next stage, or coordinating the support work that keeps the file coherent.",
                    bullet_block(
                        "Our working method usually includes:",
                        [
                            "controlled review of the core facts and chronology",
                            "identification of route strengths, weaknesses, and pressure points",
                            f"attention to {ctx['documents']}",
                            "clear explanation of what we can handle, what the client needs to provide, and what remains under authority control",
                        ],
                    ),
                    "We want the process to feel calmer after support begins, not louder. That usually happens when the file is finally being handled in the right order.",
                ]
            )
        if "Cross-Border" in name or "Language" in name:
            return "\n\n".join(
                [
                    f"{route_label.capitalize()} often becomes more complex because the matter does not sit inside one country or one language alone. Travel history, foreign-issued documents, family records, work structures, and communication needs can all affect how the route should be prepared and explained.",
                    f"We work with this layer carefully because cross-border friction often hides in small details: name consistency, date logic, translation quality, terminology, or the gap between how a client describes the route and how the route must be supported on paper.",
                    bullet_block(
                        "Cross-border and language issues commonly involve:",
                        [
                            ctx["cross"].capitalize() + ".",
                            "civil records or contracts issued under different standards",
                            "the need for clear English explanation while still respecting Portuguese legal and administrative reality",
                            "timing coordination between foreign and Brazilian steps",
                        ],
                    ),
                    "This is one reason our service style puts so much weight on structured explanation. Readers need to understand not only the route, but how the route behaves across borders and languages.",
                ]
            )
        if "Legal" in name or "Boundaries" in name or "Expectations" in name:
            return "\n\n".join(
                [
                    f"We are careful about boundaries in {route_label} work. Readers deserve clarity about what support can improve, what requires formal legal engagement, and what remains outside any private provider’s control because the final decision sits with the competent authority.",
                    f"That boundary matters for trust. It keeps the service honest, protects expectations, and helps the client understand the difference between structured preparation and guaranteed outcome.",
                    bullet_block(
                        "In practical terms, that means:",
                        [
                            "we explain the route, the documents, the process, and the pressure points with as much clarity as possible",
                            "where legal representation is required, it should be defined through proper scope and formal agreement",
                            "we do not treat general guidance as a substitute for authority decisions or case-specific legal guarantees",
                            "strong communication in English helps decision-making, but it does not replace the need to respect Brazilian legal and administrative standards",
                        ],
                    ),
                    "That professional discipline is part of how we keep the process useful, credible, and OAB-aware.",
                ]
            )
        if "Feel" in name or "Changes After" in name:
            return "\n\n".join(
                [
                    f"By the time people reach {route_label} support, they are often carrying more pressure than they first admit. Some feel confused after too much reading. Some are embarrassed by an earlier mistake. Others are simply tired of not knowing whether the route truly fits.",
                    f"A well-handled review usually changes that emotional landscape before it changes anything formal. The client often leaves with a more stable sense of where they stand, what is realistic, and what should happen next.",
                    bullet_block(
                        "What usually changes after structured guidance:",
                        [
                            "the route feels clearer and less abstract",
                            "the next step becomes easier to justify and schedule",
                            "documents and timing stop feeling like separate problems",
                            "confidence becomes more grounded because it is tied to structure rather than hope alone",
                        ],
                    ),
                    "That shift matters. Immigration work feels very different once the client can see a real sequence instead of a collection of disconnected worries.",
                ]
            )
        if "Next" in name:
            return "\n\n".join(
                [
                    f"After {route_label} support, the right next step is usually much clearer than it was at the beginning. Sometimes the matter moves into filing preparation, representation, or a connected supporting service. Sometimes it becomes obvious that a different route or a different sequence is needed before anything else should happen.",
                    bullet_block(
                        "The next stage often involves:",
                        [
                            "confirming route fit against the real facts",
                            "gathering or correcting the records that will support the route",
                            "moving into the next service stage only once scope is clear",
                            "using consultation or legal engagement where the matter becomes more personal, urgent, or document-sensitive",
                        ],
                    ),
                    "Our goal is to leave the client with a next step that is clearer, calmer, and better aligned than the one they had before they reached us.",
                ]
            )
        return "\n\n".join(
            [
                f"{route_label.capitalize()} support exists to improve {family_desc}. We explain it in practical terms so the reader can judge fit, risk, and timing with more realism.",
                bullet_block(
                    "Key considerations include:",
                    [
                        ctx["focus"].capitalize() + ".",
                        f"Attention to {ctx['documents']}.",
                        "Clear boundaries around what support can change and what remains under authority control.",
                        "A calmer, more structured next step after the route has been reviewed properly.",
                    ],
                ),
                "That is the standard we aim to bring to every service page: clarity, structure, and language that feels usable before the client even reaches out.",
            ]
        )

    page.sections = [(title, service_section_body(title_tail(title))) for title, _ in page.sections]
    page.end_cta = f"If {route_label} feels close to your situation, the next step is to have the route reviewed against your real chronology, documents, timing, and practical goals. Book a consultation for structured assessment, or contact us on WhatsApp if you want help understanding whether this is the right starting point."
    return page


def expand_process(page: Page) -> Page:
    s = slug(page.path)
    page.resources = [
        COMMON["migration_law"],
        COMMON["migration_decree"],
        COMMON["pf"],
        COMMON["itamaraty"],
        COMMON["security"],
    ]
    if is_hub(page):
        return expand_hub(page, "")
    focus = PROCESS_KEYWORDS.get(s, "sequence, clarity, and stronger next-step judgment")
    stage_label = s.replace("-", " ")
    page.hero_summary = f"This page explains how {stage_label} works in practice at Immigrate to Brazil: why the stage matters, what commonly goes wrong, how we usually structure it, and what a stronger next step looks like once the facts are organized properly."

    def process_section_body(name: str) -> str:
        if name == "Overview":
            return "\n\n".join(
                [
                    f"{stage_label.capitalize()} is not just a label inside the process. It is a real stage that affects timing, cost, documentation, expectation, and emotional pressure. Readers usually arrive here because something in the process has become concrete enough that broad reading is no longer enough.",
                    f"When we explain {stage_label}, we focus on how {focus} behave in real matters. We want readers to understand not only what the stage is called, but what it changes, what it depends on, and what can go wrong when it is rushed or misunderstood.",
                    bullet_block(
                        "A useful way to read this stage is to ask:",
                        [
                            "what should already be clear before this stage begins",
                            "what this stage is supposed to produce",
                            "which documents or facts become decisive here",
                            "what later problems become lighter when this stage is handled properly",
                        ],
                    ),
                    "That is the wider purpose of the Process family: to make the immigration journey readable enough that clients can move with more control and less guesswork.",
                ]
            )
        if name in {"Purpose", "Value", "Outcomes", "Benefits"}:
            return "\n\n".join(
                [
                    f"The purpose of {stage_label} is to improve the quality of what happens next. In immigration work, a strong stage does not only create motion. It creates better sequence, better judgment, and fewer avoidable weaknesses later on.",
                    f"When this stage is handled well, the benefit is often visible before any formal result arrives. The file becomes clearer, the next move is easier to justify, and the client usually understands the process with much less anxiety.",
                    bullet_block(
                        "Strong outcomes at this stage usually include:",
                        [
                            "clearer positioning of the matter",
                            "better alignment between facts, documents, and expectations",
                            "reduced likelihood of avoidable errors later",
                            "a more credible next step than the one the client had before",
                        ],
                    ),
                    "We treat that improvement in process quality as a real result in its own right, not as a secondary benefit.",
                ]
            )
        if name in {"Who", "Context", "Situations", "Reality"}:
            return "\n\n".join(
                [
                    f"This stage usually matters to people whose matter has become specific enough that timing, chronology, documents, or comparison can no longer be treated casually. The surrounding context often matters as much as the stage label itself: family pressure, travel plans, deadlines, prior mistakes, or uncertainty about route fit can all change how the stage should be handled.",
                    bullet_block(
                        "Readers often recognize themselves here when:",
                        [
                            "the next move now feels consequential rather than hypothetical",
                            "a previous step may already have created some friction",
                            "more reading is producing more confusion instead of more direction",
                            "the answer depends on personal facts rather than on general description",
                        ],
                    ),
                    "That recognition is useful. It helps people stop treating the matter as a purely informational problem and start treating it as a process that needs structure.",
                ]
            )
        if name in {"Timing", "Deadlines", "Windows", "Limits", "Timeline", "Sequence", "Stages", "Flow", "Milestones", "Progression", "Time"}:
            return "\n\n".join(
                [
                    f"Timing matters because immigration processes are rarely forgiving of weak sequence. A good document gathered too late or a good decision taken in the wrong order can still produce delay, cost, or avoidable exposure. That is why {stage_label} has to be understood as part of a chain rather than as an isolated step.",
                    f"In our work, we try to make the sequence visible. Clients usually feel calmer once they can see what should happen before this stage, what belongs inside it, and what should follow only after it has been handled properly.",
                    bullet_block(
                        "Timing discipline usually improves when:",
                        [
                            "the stage is linked clearly to the one before it and after it",
                            "deadlines and practical preparation windows are mapped early",
                            "documents are gathered with sequence in mind rather than in panic",
                            "expectations reflect authority timing rather than wishful estimates",
                        ],
                    ),
                    "This is one of the main reasons structured support feels different from improvised progress. The order becomes readable, and that changes the whole experience.",
                ]
            )
        if name == "Format":
            return "\n\n".join(
                [
                    f"The format of {stage_label} matters because readers need to know how the stage is actually handled. A stage becomes much easier to trust when the person understands what preparation happens before it, how the interaction is structured, what materials are useful to bring into it, and what kind of output should reasonably come out of it.",
                    f"In our work, format is part of risk control. A well-run stage has enough structure to surface the important facts without overwhelming the client or drifting into topics that belong to a later phase.",
                    bullet_block(
                        "A strong format usually includes:",
                        [
                            "clear preparation expectations",
                            "enough time and scope to identify the real pressure points",
                            "plain-English explanation rather than rushed jargon",
                            "a usable takeaway that can support the next stage",
                        ],
                    ),
                    "That is why we pay attention not only to what the stage covers, but to how it is delivered.",
                ]
            )
        if name == "Scope":
            return "\n\n".join(
                [
                    f"Scope protects the value of {stage_label}. Without clear scope, people start expecting one stage to do the work of three. That usually creates frustration, weak preparation, and a blurred understanding of what has actually been reviewed versus what still needs to be handled later.",
                    f"We define scope so the client knows what this stage can realistically improve, what depends on later work, and what still remains under authority control regardless of how well the stage is handled.",
                    bullet_block(
                        "Clear scope usually helps separate:",
                        [
                            "orientation from execution",
                            "analysis from formal legal representation",
                            "the current stage from later filing or aftercare work",
                            "what is being assessed now from what still requires supporting documents or further steps",
                        ],
                    ),
                    "That boundary does not reduce value. It makes the value of the stage much easier to trust.",
                ]
            )
        if name in {"Format", "Scope", "Preparation", "Submission", "Structure", "Coordination", "Tracking", "Process", "Planning", "Monitoring"}:
            return "\n\n".join(
                [
                    f"{stage_label.capitalize()} works best when the practical shape of the stage is visible. That includes what is being reviewed or prepared, what materials need to be in place, how communication is handled, and where the limits of the stage sit so no one assumes more than it can deliver.",
                    f"We structure the stage deliberately because process quality is often built through ordinary discipline: complete records, clear chronology, controlled communication, and realistic pacing. That may not sound dramatic, but it is exactly what keeps a viable path from becoming messy.",
                    bullet_block(
                        "A well-structured stage usually includes:",
                        [
                            "clear scope and responsibility",
                            "document and chronology control",
                            "coordination between client tasks and provider tasks",
                            "a defined handoff into the next stage rather than a vague ending",
                        ],
                    ),
                    "When those elements are visible, the client usually understands not only what is happening, but why the process is moving the way it is.",
                ]
            )
        if name == "Outcomes":
            return "\n\n".join(
                [
                    f"The outcome of {stage_label} is not only a feeling that something happened. A good stage leaves the matter in a measurably stronger position: clearer route fit, better sequence, stronger records, more realistic expectation, or a safer next move.",
                    f"This matters because immigration work is often judged too narrowly. Some of the best outcomes happen before any authority decision, simply because the process has stopped drifting and started moving with more logic.",
                    bullet_block(
                        "Useful outcomes often include:",
                        [
                            "a clearer reading of strengths and weaknesses",
                            "a better-defined next step",
                            "reduced exposure to predictable mistakes",
                            "greater confidence because the file is more coherent",
                        ],
                    ),
                    "We want the client to feel the difference between motion and progress. Strong outcomes are usually a sign of the second, not only the first.",
                ]
            )
        if name == "Value":
            return "\n\n".join(
                [
                    f"The value of {stage_label} often appears in what it prevents. It prevents weak sequence, repeated work, avoidable spending, and decisions made with the wrong level of confidence. That preventative value is easy to underestimate until a person has already felt the cost of disorder elsewhere in the process.",
                    f"We explain value in these terms because it keeps the stage tied to real life. Readers are not looking for abstractions. They want to know whether this stage will reduce confusion, improve judgment, and protect the wider process from unnecessary damage.",
                    bullet_block(
                        "In practical terms, value often shows up as:",
                        [
                            "better use of time",
                            "more reliable document preparation",
                            "clearer expectations around risk and authority control",
                            "a more stable path into the next stage",
                        ],
                    ),
                    "That is why we treat process value as operational rather than symbolic. It should improve the work, not just describe it.",
                ]
            )
        if name == "Expectations":
            return "\n\n".join(
                [
                    f"Expectations matter because immigration work can feel personal and urgent at the same time. Without clear expectations, people often assume that support can remove authority discretion, speed up external timelines, or compensate entirely for missing records and weak sequence. None of those assumptions helps the client.",
                    f"We prefer to ground expectations early. That makes the process steadier, protects trust, and helps the client judge outcomes more fairly against the reality of the stage.",
                    bullet_block(
                        "A healthier expectation framework usually includes:",
                        [
                            "clarity about what this stage can improve",
                            "clarity about what still depends on third parties or authorities",
                            "understanding that good preparation strengthens a path without guaranteeing it",
                            "recognition that process quality and final outcome are related but not identical",
                        ],
                    ),
                    "When expectations are honest, the client usually feels less whiplash later in the process.",
                ]
            )
        if name in {"Clarity", "Findings", "Direction", "Selection", "Alignment", "Comparison", "Options", "Pathways", "Evaluation", "Positioning", "Criteria", "Review"}:
            return "\n\n".join(
                [
                    f"A core function of {stage_label} is to replace vague possibility with clearer direction. That usually happens when the facts are read in order, the route or stage is tested against reality, and the client can finally see what is strong, what is weak, and what belongs to the next move.",
                    f"We think of this as disciplined clarification. It is not only about gathering information. It is about organizing information into a form that supports decisions instead of multiplying uncertainty.",
                    bullet_block(
                        "What stronger clarity usually reveals:",
                        [
                            "which option or sequence best fits the facts",
                            "which risk points deserve attention before moving forward",
                            "what evidence or preparation is still missing",
                            "what expectation is reasonable and what expectation needs to be corrected",
                        ],
                    ),
                    "That kind of clarity is often the point where the process starts feeling manageable again.",
                ]
            )
        if name in {"Risks", "Mistakes", "Failures", "Challenges", "Missteps", "Consequences", "Delays", "Confusion", "Limitations", "Instability"}:
            return "\n\n".join(
                [
                    f"Risk in immigration work is often cumulative rather than dramatic. Matters become heavier when assumptions go untested, sequence weakens, facts stay partial, or deadlines are allowed to narrow without enough control. By the time the client feels the pressure, the process may already be carrying unnecessary weight.",
                    f"We prefer to describe those risks plainly. Good support does not remove every uncertainty, but it does reduce the number of problems that come from preventable disorder.",
                    bullet_block(
                        "Recurring destabilizing patterns include:",
                        [
                            "acting before the route or stage has been positioned clearly",
                            "weak or inconsistent documents",
                            "expecting authority decisions to behave like fixed timelines",
                            "treating one completed step as if it had solved the wider process",
                        ],
                    ),
                    "Seeing those patterns earlier usually gives the client more room to recover than they expected.",
                ]
            )
        if name in {"Correction", "Recovery", "Regularization", "Conversion", "Transition", "Support"}:
            return "\n\n".join(
                [
                    f"Recovery inside the process usually begins by slowing the matter down enough to see what is still workable. That may involve correction of chronology, rebuilding the record, stabilizing expectations, or moving the file into a different stage or route than originally planned.",
                    f"We approach recovery with realism. Some problems are fixable. Some require a different sequence. Some demand urgent legal attention. What matters first is replacing improvisation with a clearer map of what is still possible.",
                    bullet_block(
                        "A useful recovery mindset usually includes:",
                        [
                            "honest disclosure of what has already happened",
                            "careful review of the current record rather than denial of the problem",
                            "priority to the step that reduces exposure first",
                            "willingness to change route, pace, or expectations where needed",
                        ],
                    ),
                    "That is why we treat recovery as a structured process in its own right rather than a quick correction added on top of a weak file.",
                ]
            )
        if name in {"Communication", "Transparency", "Honesty", "Disclosure", "Trust"}:
            return "\n\n".join(
                [
                    f"Communication changes the quality of {stage_label} more than many people expect. The process becomes more stable when facts are disclosed clearly, expectations are named honestly, and everyone involved understands the boundary between what can be prepared and what still depends on authority control.",
                    bullet_block(
                        "In practice, transparency usually means:",
                        [
                            "saying what is known and what still needs to be confirmed",
                            "not softening facts that may later matter to the route",
                            "keeping scope, timing, and risk visible",
                            "using plain language so the client understands the process they are inside",
                        ],
                    ),
                    "We treat that communication style as part of the service itself. It builds trust because it makes the file more readable, not because it simply sounds reassuring.",
                ]
            )
        if name in {"Roles", "Responsibilities", "Client", "Provider", "Cooperation", "Accountability", "Duties", "Maintenance", "Requirements", "Compliance", "Reporting", "Continuity", "Status", "Entitlements", "Protections", "Access", "Rights"}:
            return "\n\n".join(
                [
                    f"{stage_label.capitalize()} stays stronger when responsibilities remain visible. Some obligations belong to the client, such as accuracy, timely response, and document provision. Some belong to the provider, such as process structure, communication discipline, and defined support within scope. Some belong to the wider legal framework and cannot be negotiated away.",
                    f"That distribution matters because immigration continuity is rarely passive. It depends on cooperation, maintenance, and a realistic understanding of what rights or obligations actually attach to the current stage or status.",
                    bullet_block(
                        "Shared process discipline usually requires:",
                        [
                            "accurate facts and usable records from the client",
                            "clear process guidance and boundary-setting from the provider",
                            "attention to ongoing obligations, deadlines, and status conditions",
                            "awareness that legal rights become practical only when they are understood and used correctly",
                        ],
                    ),
                    "We want these pages to make that shared responsibility feel usable rather than punitive. Clear roles usually make the process calmer for everyone involved.",
                ]
            )
        if name == "Next Steps":
            return "\n\n".join(
                [
                    f"The next step after {stage_label} should feel more defined than it did before this stage was understood. In a strong process, this is where uncertainty narrows: the route is clearer, the file is more organized, or the client now knows whether to proceed, pause, correct, or escalate.",
                    bullet_block(
                        "A sensible next step often involves:",
                        [
                            "confirming the strongest available route or stage",
                            "gathering the documents that now clearly matter",
                            "moving into the next service stage only once scope is visible",
                            "using consultation or legal engagement when the matter has become too personal or sensitive for public guidance",
                        ],
                    ),
                    "That is the standard we aim for at Immigrate to Brazil. Even before outcomes are decided, the process itself should feel more stable, more readable, and more deliberate.",
                ]
            )
        return "\n\n".join(
            [
                f"{stage_label.capitalize()} matters because {focus} shape whether a Brazil immigration process feels orderly or exposed. We explain the stage in practical terms so readers can judge where they are more honestly.",
                bullet_block(
                    "Useful questions at this stage include:",
                    [
                        "what is actually under control right now",
                        "which facts or documents now matter most",
                        "how this stage affects the one that follows",
                        "whether the matter has reached the point where structured support adds more value than more solo reading",
                    ],
                ),
                "That is the lens we try to bring to every process page: operational clarity, calmer expectations, and better next-step judgment.",
            ]
        )

    page.sections = [(title, process_section_body(title_tail(title))) for title, _ in page.sections]
    page.end_cta = f"If {stage_label} is the stage you are in now, the next step is to review the process against your real facts, documents, timing, and obligations. Book a consultation for structured guidance, or contact us on WhatsApp if you need help deciding which stage should come next."
    return page


def expand_insights(page: Page) -> Page:
    s = slug(page.path)
    page.resources = [
        COMMON["migration_law"],
        COMMON["migration_decree"],
        COMMON["pf"],
        COMMON["itamaraty"],
        COMMON["security"],
    ]
    if is_hub(page):
        return expand_hub(page, "")
    focus = INSIGHT_FOCUS.get(s, "foundational immigration understanding before case-specific guidance begins")
    page.hero_summary = f"This page explains {focus} in plain English so readers can understand the system more clearly before their own facts, documents, or timing require individualized review."

    def insight_section_body(name: str) -> str:
        if name in {"System Overview", "Overview", "What Changes", "Practical Guidance"}:
            return "\n\n".join(
                [
                    "Brazil immigration becomes easier to understand once the system is treated as a structure rather than as a list of route labels. Many readers arrive with broad familiarity but still do not know how institutions, route categories, documents, and later stages fit together in practice.",
                    f"We explain {focus} this way because stronger vocabulary leads to stronger decisions. Once the reader can name the real layer of the problem, they usually stop searching for ten contradictory answers to ten different questions.",
                    bullet_block(
                        "A clearer overview usually helps the reader see:",
                        [
                            "which part of the system they are actually trying to understand",
                            "why one route label does not answer the whole process question",
                            "where official sources sit inside the wider picture",
                            "when general understanding is enough and when a personal review is needed",
                        ],
                    ),
                    "That educational layer matters to us. It makes later consultation more focused and reduces the confusion that often starts long before any formal filing.",
                ]
            )
        if name in {"Legal Concepts", "Category Families", "Visa, Residency, And Citizenship", "Temporary And Permanent", "Eligibility"}:
            return "\n\n".join(
                [
                    "Legal language often sounds simpler than it really is. Words like visa, residency, permanent status, citizenship, route, eligibility, and regularization are familiar enough to feel intuitive, but in practice they carry precise consequences that change how a case should be read.",
                    f"Our goal in this section is to translate {focus} into language that remains accurate without becoming technical for its own sake. That means showing how the concepts relate to one another instead of leaving them as disconnected definitions.",
                    bullet_block(
                        "What usually becomes clearer here:",
                        [
                            "which status categories are related but not interchangeable",
                            "how route families differ in purpose and consequence",
                            "why eligibility is usually conditional on facts and evidence, not only on category label",
                            "why long-term planning improves when terminology is correct early",
                        ],
                    ),
                    "This is one of the most practical forms of clarity we can offer on a public page. Correct language prevents many later mistakes.",
                ]
            )
        if name in {"Institutions", "Authority Logic", "Consular Logic", "Authority Interaction", "Legal And Administrative Updates", "Authority Practice"}:
            return "\n\n".join(
                [
                    "Different public bodies do different things in Brazil immigration, and many readers only realize how much that matters after they have already become confused. A consulate, the Polícia Federal, a ministry, a registry, and a court do not answer the same question or apply the same logic at the same stage.",
                    f"That distinction is part of what we mean by {focus}. Good research improves when the reader stops asking one institution’s question in another institution’s language.",
                    bullet_block(
                        "A better institutional reading usually clarifies:",
                        [
                            "who decides what and at which stage",
                            "why authority discretion remains central even in a well-prepared case",
                            "how consular, administrative, and documentary issues differ from one another",
                            f"why official references such as {page.resources[2]} and {page.resources[3]} should be read in context rather than isolation",
                        ],
                    ),
                    "Once that institutional map is visible, the process usually becomes far less mysterious.",
                ]
            )
        if name in {"Documentation", "Documents", "Records", "Sources"}:
            return "\n\n".join(
                [
                    "Documentation matters earlier than many readers think. Long before any filing, documents shape whether a route remains coherent, whether chronology is believable, and whether the story the client is telling can actually be supported when the process becomes formal.",
                    f"We include this part of {focus} because weak documentation is one of the most common reasons a route that looked simple in theory starts feeling unstable in practice.",
                    bullet_block(
                        "Readers usually need to think about:",
                        [
                            "which records will later have to prove the route or status clearly",
                            "where translations, certifications, or cross-border inconsistencies may appear",
                            "how timing affects the validity and usefulness of a document set",
                            "why document quality and chronology are often inseparable",
                        ],
                    ),
                    "This is also where many people begin to see the limit of general research. Once the answer depends on their own documents, the matter is already becoming personal.",
                ]
            )
        if name in {"Common Misunderstandings", "Common Mistakes", "Misunderstandings", "Misconceptions", "Myths", "No Panic"}:
            return "\n\n".join(
                [
                    "Many recurring Brazil immigration misunderstandings are not caused by bad intent. They come from treating one useful fragment of information as if it were the whole picture. A route label gets mistaken for a guaranteed path. One person’s experience gets mistaken for a rule. A government page gets read without the context needed to understand where it fits.",
                    f"We address those misunderstandings because {focus} become much easier to navigate once the reader can see where confusion usually begins.",
                    bullet_block(
                        "Common misunderstandings often include:",
                        [
                            "assuming route names explain eligibility by themselves",
                            "treating short-term entry and longer-term continuity as the same question",
                            "believing that all problems can be solved by more reading rather than by better sequencing",
                            "expecting official updates to change every case in the same way",
                        ],
                    ),
                    "Correcting those misunderstandings early is one of the best ways to reduce unnecessary fear and unnecessary optimism at the same time.",
                ]
            )
        if name in {"Why This Matters", "Long-Term View", "Context", "Service Connection", "Limits", "When Reading Stops Being Enough", "Support", "Next Step", "Current Versus Archived Reading"}:
            return "\n\n".join(
                [
                    f"The value of understanding {focus} is not academic. It changes the quality of the next decision. Readers who understand the structure usually compare routes more realistically, ask better questions, and notice earlier when the matter has crossed from public information into case-specific judgment.",
                    bullet_block(
                        "General reading has usually reached its limit when:",
                        [
                            "the answer now depends on your own chronology or records",
                            "you are comparing two routes that both seem plausible",
                            "timing, deadlines, or prior mistakes are affecting the decision",
                            "you need a judgment call rather than one more definition",
                        ],
                    ),
                    "That is where consultation becomes useful. Not because the public page failed, but because it did its job: it brought the issue into sharper focus.",
                ]
            )
        return "\n\n".join(
            [
                f"We use this section to explain {focus} in a way that leaves the reader more informed and less scattered. The aim is practical understanding, not legal theater.",
                bullet_block(
                    "A useful reading lens here is to ask:",
                    [
                        "what category of question is really being asked",
                        "which institution or stage the issue belongs to",
                        "what facts or documents would later become relevant",
                        "whether the matter is still general enough for educational reading alone",
                    ],
                ),
                "That is the wider standard of the Insights family: plain-English explanation that respects both the reader’s intelligence and the limits of general guidance.",
            ]
        )

    page.sections = [(title, insight_section_body(title_tail(title))) for title, _ in page.sections]
    page.end_cta = "If this insight has clarified the subject, the next step is to test that understanding against your own facts, documents, or timeline once the issue becomes personal. Book a consultation for case-specific review, or contact us on WhatsApp if you want help deciding whether general reading has reached its limit."
    return page


def rewrite_file(path_str: str, family: str, intro_lines: Iterable[str]) -> None:
    path = ROOT / path_str
    pages = parse_doc(path)
    transformed: list[Page] = []
    for page in pages:
        if family == "brazil":
            transformed.append(expand_brazil(page))
        elif family == "services":
            transformed.append(expand_services(page))
        elif family == "process":
            transformed.append(expand_process(page))
        elif family == "insights":
            transformed.append(expand_insights(page))
        else:
            raise ValueError(f"Unknown family: {family}")
    content = "\n".join(list(intro_lines) + [""] + [format_page(page) for page in transformed]).rstrip() + "\n"
    path.write_text(content)


def main() -> None:
    rewrite_file(
        "docs/services-family-client-preview.md",
        "services",
        [
            "# Services Family Client Preview",
            "",
            "This preview doc is the expanded long-form rewrite for the Services family. The aim in this pass is to make each section feel much more like near-finished client-facing copy: longer, more structured, more useful before consultation, and clearer about how Immigrate to Brazil actually helps in practice.",
            "",
            "Drafting choices in this version:",
            "- hub pages remain navigation-first, but with stronger strategic guidance",
            "- service pages now emphasize what the service is, who it fits, how the process feels, and where guidance adds value",
            "- the tone stays OAB-aware, structured, human, and non-sensational",
        ],
    )
    rewrite_file(
        "docs/brazil-and-places-client-preview.md",
        "brazil",
        [
            "# Brazil And Places Client Preview",
            "",
            "This preview doc is the expanded long-form rewrite for the Brazil and Places families. In this pass the pages are intentionally much richer: more factual, more explanatory, more inspiring, and more clearly connected to the decisions a future immigrant or relocating reader actually needs to make.",
            "",
            "Drafting choices in this version:",
            "- hub pages remain catalogue-style so they keep guiding the reader inward",
            "- Brazil pages are longer, more informative, and more useful for SEO and research confidence",
            "- official external resources are included to support deeper reading",
            "- the tone remains warm and encouraging, but structured rather than bloggy",
        ],
    )
    rewrite_file(
        "docs/process-and-aftercare-client-preview.md",
        "process",
        [
            "# Process And Aftercare Client Preview",
            "",
            "This preview doc is the expanded long-form rewrite for the Process and Aftercare family. The goal is to explain how the process actually behaves in practice, what each stage changes, and why structured support often makes the experience calmer and more coherent.",
            "",
            "Drafting choices in this version:",
            "- the process hub stays overview-oriented rather than becoming a giant article",
            "- child pages now read more like detailed stage explainers than short plan notes",
            "- timing, obligations, rights, responsibilities, fees, and aftercare are treated as real process questions",
        ],
    )
    rewrite_file(
        "docs/insights-client-preview.md",
        "insights",
        [
            "# Insights Client Preview",
            "",
            "This preview doc is the expanded long-form rewrite for the Insights family. The educational pages are now written to stand more firmly on their own: longer, clearer, and more useful to a real reader before case-specific advice begins.",
            "",
            "Drafting choices in this version:",
            "- the hub remains a structured reading catalogue",
            "- child pages now feel more like genuine explainers than placeholders",
            "- the tone stays educational, evergreen, and careful about the boundary between general understanding and individualized advice",
        ],
    )


if __name__ == "__main__":
    main()
