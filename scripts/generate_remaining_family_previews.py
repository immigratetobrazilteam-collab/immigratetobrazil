#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import textwrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'

@dataclass
class Section:
    title: str
    strap: str
    body: str

@dataclass
class Page:
    route: str
    label: str
    hero_title: str
    hero_summary: str
    sections: list[Section]
    internal_links: list[str]
    resources: list[str]
    end_cta: str


def clean(text: str) -> str:
    return textwrap.dedent(text).strip()


def make_page(route, label, hero_title, hero_summary, sections, internal_links, resources, end_cta):
    return Page(route, label, hero_title, hero_summary, [Section(*s) for s in sections], internal_links, resources, end_cta)

BRAZIL_RESOURCES = [
    'IBGE institutional portal',
    'IBGE Cities and States',
    'Banco Central do Brasil',
    'Federal Government services portal (gov.br)',
]

PROCESS_RESOURCES = [
    'Brazilian Migration Law (Law No. 13.445/2017)',
    'Migration Regulation Decree (Decree No. 9.199/2017)',
    'Policia Federal immigration services',
    'Migration Portal / Ministry of Justice',
]

INSIGHTS_RESOURCES = PROCESS_RESOURCES


def render_doc(title: str, summary: str, structure_notes: list[str], pages: list[Page]) -> str:
    lines = [f'# {title}', '', summary, '', '## Structural Recommendations', '']
    for note in structure_notes:
        lines.append(f'- {note}')
    lines.append('')
    for page in pages:
        lines.extend([f"## `{page.route}` {page.label}", '', '### Hero', '', f'Title: {page.hero_title}', '', f'Summary: {page.hero_summary}', ''])
        for idx, section in enumerate(page.sections, start=1):
            lines.extend([f'### Section {idx}. {section.title}', '', f'Strap: {section.strap}', '', section.body, ''])
        lines.extend(['### Suggested Internal Links', ''])
        for link in page.internal_links:
            lines.append(f'- {link}')
        lines.extend(['', '### Official Resources Block', ''])
        for resource in page.resources:
            lines.append(f'- {resource}')
        lines.extend(['', '### End CTA', '', page.end_cta, ''])
    return '\n'.join(lines).strip() + '\n'


def brazil_hub_page() -> Page:
    sections = [
        ('Overview', 'Brazil should be approached as a planning environment, not a single destination.', clean('''
Brazil is not one relocation experience repeated across a large map. It is a country of different regional economies, housing realities, public-service standards, climates, mobility patterns, and administrative routines. A serious move to Brazil becomes clearer when those variables are reviewed together instead of in isolation.

This hub is designed to organize that review. It brings together the pages that explain how Brazil works in practice so a future move can be planned with more realism, better sequencing, and a stronger connection between lifestyle decisions and immigration strategy.
        ''')),
        ('How To Use Brazil Guidance', 'Good Brazil research moves from country context to place-specific comparison.', clean('''
The most useful reading order is not random. Start with Brazil as a whole, then move into the topic that most affects your decision, and only then narrow the analysis to regions, states, cities, or municipalities. That sequence prevents premature conclusions based on a single cost figure, a single city, or a single anecdote.

The purpose of this family is to reduce noise. It helps you compare Brazil in a structured way before money is committed, before housing is selected, and before immigration decisions are anchored to the wrong assumptions.
        ''')),
        ('The Variables That Matter Most', 'Location, cost, services, and legal position should be read together.', clean('''
A move that looks attractive at a surface level can become difficult very quickly if transport, healthcare, school planning, safety, rental structure, or local administration were not considered early enough. The practical move is to compare the variables that affect daily life and legal continuity at the same time.

Brazil planning is strongest when it links housing, education, healthcare, infrastructure, cost of living, and route timing into one decision process. That is the standard this hub is built to support.
        ''')),
        ('Regions, States, Cities, And Municipalities', 'Place selection should become more precise step by step.', clean('''
Country-level research is useful, but it is never enough on its own. Brazil has strong regional differences, state-level administrative variation, city-level cost and infrastructure gaps, and municipal realities that affect daily administration after arrival. A good plan narrows the geography gradually.

This is why the family is divided between topic pages and place pages. One explains what to compare. The other helps you compare where to live, work, invest, or settle with more discipline.
        ''')),
        ('Daily-Life Systems', 'Relocation quality depends on systems, not only scenery or reputation.', clean('''
People often choose Brazil emotionally and then try to solve practical issues afterwards. The better method is the reverse: understand how healthcare, education, transport, banking, documents, housing, and public administration operate where you intend to live, then test whether the destination still fits.

That shift changes the quality of decision-making. It moves the conversation away from generalized enthusiasm and toward a more stable picture of how life in Brazil will actually function once the move is real.
        ''')),
        ('Cost, Quality, And Infrastructure', 'Price alone is a poor decision tool.', clean('''
A lower monthly cost can hide higher transport dependency, weaker access to services, or greater difficulty maintaining routine after arrival. A higher-cost city may offer stronger infrastructure, better administrative access, and a more efficient start depending on the client profile. The issue is not cheap versus expensive. The issue is suitability.

The topic pages in this family are meant to make those trade-offs visible. They help readers ask not only what Brazil costs, but what that cost buys in a specific place and whether it supports the move they are trying to build.
        ''')),
        ('How Brazil Connects To Immigration Strategy', 'Place decisions and legal decisions influence each other.', clean('''
Where you plan to live in Brazil affects the kind of immigration planning that is realistic. A family move, a retirement project, a business structure, an investment route, or a remote-work relocation all interact differently with the place chosen and the systems available there.

This means relocation research should not be treated as separate from immigration strategy. It should support route fit, timing, and expectations, especially when long-term residence, business activity, or future nationality planning is part of the objective.
        ''')),
        ('Suggested Reading Paths', 'Different profiles should start in different places.', clean('''
A remote worker will usually benefit from reading Brazil, Cost, Housing, Living, Safety, and one or two regional pages before making legal choices. Families often need Brazil, Education, Healthcare, Housing, and region or city comparison first. Investors usually need Investment, Economy, States, Cities, and Planning together.

The right reading path depends on what is driving the move. This hub is designed to let that path stay structured rather than improvised.
        ''')),
        ('What This Family Does Not Replace', 'Research can clarify a move without replacing professional analysis.', clean('''
These pages are meant to improve judgment, not to replace individualized route review. They help you understand Brazil better, compare places more intelligently, and spot practical questions sooner. They do not answer case-specific legal questions on their own.

The transition point is usually clear. Once your reading leads to a real decision about location, route, investment, family planning, or timing, the next step should be structured case analysis rather than more scattered research.
        ''')),
        ('Moving From Research To Decision', 'Good relocation planning ends in a clearer next move.', clean('''
The goal of this hub is not to keep the reader in permanent research mode. The goal is to make Brazil legible enough that a decision can be made with more confidence and less improvisation. By the time you finish this family, you should know which places deserve attention, which risks need closer review, and which questions now require formal guidance.

That is when consultation becomes useful: not at the point of confusion, but at the point where a structured next step is finally possible.
        ''')),
    ]
    return make_page('/brazil/', 'Brazil Hub', 'Brazil guidance for people planning a move with more realism and less guesswork', 'Use this hub to understand Brazil as a relocation environment before narrowing your decision to a region, city, budget, service standard, or immigration pathway.', sections, ['/brazil/brazil/', '/brazil/places/', '/brazil/cost/', '/brazil/living/', '/process/planning/', '/start-consultation/'], BRAZIL_RESOURCES, 'If Brazil is starting to feel less abstract and more real, the right next step is a structured consultation. We use that stage to connect the country research, the place decision, and the immigration route into one coherent plan.')


def places_hub_page() -> Page:
    sections = [
        ('Overview', 'Places should be compared through function, not only reputation.', clean('''
A place in Brazil should not be chosen because it is popular in general conversation. It should be chosen because it fits the practical, legal, financial, and personal realities of the move. Regions, states, cities, and municipalities all change how that fit should be evaluated.

This hub exists to make place comparison more disciplined. It helps readers move from broad impressions to structured place analysis before a lease is signed, a school is chosen, or an immigration route is anchored to the wrong location.
        ''')),
        ('Why Place Selection Changes Outcomes', 'Location influences budget, services, and administrative ease after arrival.', clean('''
The difference between a manageable move and a frustrating one is often geographic rather than legal. The same visa or residence permission can feel very different depending on transport, healthcare access, bureaucracy, cost pressure, language environment, and local infrastructure.

That is why place comparison belongs early in planning. It affects how people work, register, rent, study, access care, and maintain daily stability once they are in Brazil.
        ''')),
        ('Regions First, Then Cities', 'Start broad, then narrow with purpose.', clean('''
It is usually a mistake to jump immediately into city comparison without understanding the larger regional pattern. Regions in Brazil carry their own economic logic, climate, development profile, cultural rhythm, and infrastructure standard. City decisions become stronger when they are made inside that context.

This hub is therefore organized from the larger geographic layer to the smaller one. It helps readers compare regions, then states, then cities and municipalities with better sequencing.
        ''')),
        ('State And Municipal Reality', 'Administrative structure matters after arrival.', clean('''
State and municipal differences are not merely political details. They affect public services, transit systems, documentation routines, local regulation, and how day-to-day life is experienced. A city may look attractive until the administrative reality is considered more closely.

Serious place planning requires attention to these layers. This is particularly important for families, business owners, people with ongoing compliance duties, and anyone building a long-term route in Brazil.
        ''')),
        ('Cost Versus Access', 'A cheaper place is not always an easier place.', clean('''
Place comparison often starts with price, but price is only one part of the decision. Lower rent or lower monthly cost can come with weaker connectivity, fewer services, longer travel times, or reduced access to the institutions a newcomer may need. More expensive places may reduce friction depending on the client profile.

This family is built to keep that trade-off visible. Cost should be measured together with access, not against it.
        ''')),
        ('Climate, Geography, And Infrastructure', 'The physical environment changes the practical experience of the move.', clean('''
Geography influences climate, logistics, transport dependency, utility reliability, and even how a daily routine is built. Brazil is large enough that climate and infrastructure should not be treated as aesthetic background. They are operational variables.

Regional pages in this hub explain those variables so that relocation choices can be made with more realism, especially for families, remote workers, retirees, and investors comparing very different parts of the country.
        ''')),
        ('How To Compare Places Well', 'Good comparison depends on the right criteria, not more browsing.', clean('''
The best place comparison method is to decide which variables matter most for your profile and then hold them constant while comparing options. For some people, the main issue is cost. For others, it is education, healthcare, business environment, safety, or administrative ease.

This hub helps structure that comparison. It turns a vague question such as where in Brazil should I live into a smaller and more workable set of decisions.
        ''')),
        ('How Place Selection Connects To Route Planning', 'Relocation geography and immigration structure should support each other.', clean('''
The place chosen can strengthen or weaken the route being considered. Some profiles need stronger administrative access. Others need sector concentration, family networks, education options, or a more stable long-term base for renewal, permanence, or nationality planning.

Place selection therefore belongs inside immigration planning, not outside it. This hub is meant to keep both sides of that decision connected.
        ''')),
        ('Recommended Navigation Path', 'Use the hub in a deliberate order.', clean('''
A practical order is usually region first, then states or cities, then municipalities, then more specialized pages such as cost or housing if the comparison is narrowing. Directory and Search are most useful once you already know what variable or geography you are trying to locate.

This path keeps the research structured and reduces the temptation to compare disconnected facts that do not actually answer the question of where a life in Brazil should begin.
        ''')),
        ('From Comparison To Decision', 'The point of place research is a shortlist, not permanent uncertainty.', clean('''
By the end of this family, the reader should have a smaller and more realistic shortlist of places rather than a larger pile of impressions. That shortlist is what makes the next step useful. It gives consultation a concrete basis: a real set of options, a real move objective, and a real decision to structure.

That is when the transition from research to planning becomes productive. The place question stops being abstract and becomes part of a workable immigration and relocation plan.
        ''')),
    ]
    return make_page('/brazil/places/', 'Places Hub', 'A structured way to compare regions, states, cities, and municipalities in Brazil', 'Use this hub to choose where in Brazil to focus your relocation analysis so cost, access, infrastructure, and legal practicality can be compared with more discipline.', sections, ['/brazil/north/', '/brazil/northeast/', '/brazil/southeast/', '/brazil/states/', '/brazil/cities/', '/brazil/search/'], BRAZIL_RESOURCES, 'If you already have two or three realistic location options, consultation is where we connect those place choices to route fit, timing, documents, and long-term strategy instead of leaving them as disconnected research notes.')


def brazil_country_page() -> Page:
    sections = [
        ('Overview', 'Brazil should be understood as a system, not a slogan.', clean('''
Brazil attracts people for many reasons, but a successful move depends on understanding how the country actually functions in practice. Size, regional variation, public systems, infrastructure, bureaucracy, and cost differences all shape the lived reality after arrival.

This page gives a country-level view before the analysis becomes more specific. It is meant to help readers understand what Brazil requires as a relocation environment, not only what Brazil promises as an idea.
        ''')),
        ('National Context', 'A country-wide view creates better place decisions later.', clean('''
Before comparing cities or regions, it helps to understand the broader national frame: federal structure, administrative layers, institutional systems, and the scale of difference between one part of Brazil and another. Without that frame, local comparisons are easy to misread.

Country context does not replace local detail, but it prevents local detail from being interpreted without enough perspective.
        ''')),
        ('How Brazil Is Structured', 'Federal, state, and municipal layers all matter.', clean('''
Brazil operates through multiple administrative levels, and each one shapes practical life differently. Federal rules affect immigration. State and municipal realities affect the quality of transport, schools, healthcare, safety, and local bureaucracy after arrival.

A move becomes easier to plan when these layers are treated as connected rather than separate. That is especially important for long-term residence and family-based planning.
        ''')),
        ('Regional Diversity', 'Brazil changes significantly from one region to another.', clean('''
Brazil is too varied to be described honestly through one generic lifestyle narrative. Climate, infrastructure, urban concentration, economic rhythm, and public-service patterns all shift in meaningful ways across the country.

Understanding that diversity early improves both expectations and place selection. It also reduces the risk of choosing a destination for symbolic reasons rather than practical fit.
        ''')),
        ('Daily-Life Systems', 'A move succeeds through systems, not enthusiasm alone.', clean('''
Housing, banking, transport, healthcare, education, communications, and document routines are what determine whether life in Brazil feels stable after arrival. The country page is where those systems start to come into view as one operating environment.

Readers should use this section as a reminder that relocating to Brazil is not only a legal transition. It is also a systems transition.
        ''')),
        ('Economic And Social Reality', 'National opportunity exists alongside real structural variation.', clean('''
Brazil offers real personal and economic opportunities, but they are not evenly distributed and they do not present the same way to every profile. Cost pressure, service access, labor conditions, and administrative ease vary enough that general optimism should always be tested against practical detail.

This is why a country-level reading has to remain grounded. It should clarify reality, not idealize it.
        ''')),
        ('What International Clients Usually Misread', 'The main risk is overgeneralization.', clean('''
Many international readers assume Brazil can be understood quickly through a handful of city names, cost lists, or visa categories. That approach tends to hide regional variation, practical friction, and the way legal decisions interact with place decisions.

A stronger method is to slow the analysis down and organize it. That is what the rest of the Brazil family is meant to support.
        ''')),
        ('How Country Research Supports Immigration Planning', 'Country understanding improves route quality.', clean('''
Immigration planning becomes more accurate when it is tested against the country conditions in which the move will actually happen. A route can be legally viable but practically poor if the place, cost structure, or support systems are misread.

This page therefore belongs at the start of the process. It sets the frame for the more detailed place and topic pages that follow.
        ''')),
        ('Suggested Next Pages', 'The next page should depend on the decision you are actually making.', clean('''
If your main question is where to live, go next to Places, Cost, Housing, and Living. If the move depends on business or capital, move into Investment and Economy. If family routine is the issue, prioritize Healthcare, Education, Safety, and region comparison.

The right sequence is driven by the move objective, not by the order of the menu.
        ''')),
        ('When Brazil Stops Being Abstract', 'A useful country overview should create clearer next questions.', clean('''
By the end of this page, Brazil should feel more concrete. The reader should know which systems require closer attention, which place comparisons matter most, and which decisions now need to be structured with case-specific guidance.

That is the purpose of the country overview: not to answer everything, but to make the next questions smarter and more usable.
        ''')),
    ]
    return make_page('/brazil/brazil/', 'Brazil', 'What Brazil looks like when you plan the move as a real life transition', 'This page gives a country-level view of Brazil so relocation, place selection, and immigration planning can begin with structure instead of broad impressions.', sections, ['/brazil/', '/brazil/places/', '/brazil/cost/', '/brazil/living/', '/brazil/investment/', '/process/planning/'], BRAZIL_RESOURCES, 'If Brazil is already becoming a concrete move rather than a general idea, the next useful step is consultation. We use that stage to connect the country context to your route, place shortlist, and timing.')


def brazil_topic_page(route, label, hero_title, hero_summary, focus, national_frame, regional_frame, access_frame, admin_frame, mistake_frame, profiles, strategy_frame, internal_links, resources):
    sections = [
        ('Overview', f'{label} should be reviewed before commitments are made.', clean(f'''
{label} is one of the topics that can quietly reshape a move to Brazil even when people assume they are already focused on the legal route. In practice, {focus} changes where a move should happen, how much friction it will carry, and whether the day-to-day reality will match the plan.

This page is designed to put {label.lower()} into a relocation framework. It treats the topic as part of the move itself rather than as background information.
        ''')),
        (f'Why {label} Matters Before Moving', 'This issue is easier to manage early than to correct later.', clean(f'''
{label} becomes much harder to solve once location, budget, school plans, business structure, or family routines have already been fixed around the wrong assumptions. Early review usually saves time because it reveals whether the move is aligned with the systems that will support it after arrival.

In other words, {label.lower()} is not a finishing detail. It is part of the initial planning logic of a stable move to Brazil.
        ''')),
        ('National Framework', 'Country-wide structure comes before local comparison.', clean(f'''
At a national level, the main issue is {national_frame}. That broader frame matters because it shapes what is normal, what is exceptional, and what should be tested more closely before a place or route is chosen.

A national view does not solve the local question, but it prevents local observations from being interpreted without enough context.
        ''')),
        ('Regional Variation', 'The topic changes meaning across Brazil.', clean(f'''
Brazil does not offer one uniform experience of {label.lower()}. The practical reality depends on geography, local development, public systems, market conditions, and the concentration of services or opportunities in each part of the country.

This is why regional comparison matters. {regional_frame} should be treated as part of the move decision rather than as optional extra research.
        ''')),
        ('Access, Cost, And Availability', 'The useful question is not only whether it exists, but how it is reached.', clean(f'''
A topic may be available in Brazil in general while still being difficult, slow, or expensive to access in the place a client is considering. That gap matters because relocation quality depends on whether a system can be used consistently, not merely whether it exists somewhere in the country.

{access_frame}. The right planning method is to connect availability to location, routine, and budget at the same time.
        ''')),
        ('Administrative And Legal Considerations', 'Practical topics often carry legal or documentary consequences.', clean(f'''
Even when a page looks practical rather than legal, administrative reality still matters. {admin_frame}. In Brazil, those obligations and systems often become visible only after the move has started, which is exactly why they should be considered sooner.

A controlled move accounts for these requirements before they become urgent.
        ''')),
        ('What People Usually Misunderstand', 'Most planning errors begin with simplification.', clean(f'''
The most common mistake is to treat {label.lower()} as if a general answer exists for the whole country. In reality, the practical answer depends on location, client profile, legal timing, and the type of life being built in Brazil.

{mistake_frame}. Good planning replaces assumption with structure.
        ''')),
        ('Who Should Pay Closest Attention', 'Different profiles feel the same issue in different ways.', clean(f'''
This page matters to many readers, but it becomes especially important for {profiles}. For these profiles, {label.lower()} often stops being a preference question and becomes part of whether the move is realistically sustainable.

That is why profile-based comparison is stronger than generic comparison. It tells you not only what Brazil offers, but what Brazil offers to someone like you.
        ''')),
        ('How It Changes Relocation Strategy', 'A practical topic can alter the entire move plan.', clean(f'''
{strategy_frame}. That may influence place selection, route timing, business decisions, family sequencing, or the order in which preparation should happen.

When this page is used well, it does not only answer a research question. It changes the quality of the plan built from that answer.
        ''')),
        ('Practical Next Step', 'The goal is to move from topic research to a narrower decision.', clean(f'''
After reading this page, the next step should usually be one of three things: narrow the place comparison, clarify the route implications, or move into consultation if the decision is already becoming case-specific. The point is to convert {label.lower()} from a broad subject into a clearer planning variable.

That is the standard this page is built to support: less browsing, more structured movement.
        ''')),
    ]
    return make_page(route, label, hero_title, hero_summary, sections, internal_links, resources, f'If {label.lower()} is now directly affecting your shortlist, your budget, or your immigration route, consultation is where we turn that topic into a practical decision path instead of leaving it as research.')


def region_page(route, label, hero_title, hero_summary, states, economy, costs, infrastructure, climate, services, profiles, internal_links):
    sections = [
        ('Overview', f'{label} should be read as a relocation environment, not only as a map area.', clean(f'''
{label} matters because it changes the practical meaning of a move to Brazil. The region carries its own economic profile, service concentration, climate logic, and urban structure, all of which affect how a relocation will feel after arrival.

This page is meant to help readers decide whether {label.lower()} belongs on their shortlist and, if so, how it should be compared with the rest of the country.
        ''')),
        ('What Defines The Region', 'Regional identity should be understood in practical terms.', clean(f'''
{label} is not only a cultural label. It is a planning category with real consequences for transport, cost, opportunity, public-service access, and the rhythm of daily life. Understanding the region correctly helps prevent city comparisons that ignore the broader context.

The first step is to understand what makes {label.lower()} distinct inside Brazil before looking at smaller geographic choices.
        ''')),
        ('States And Urban Anchors', 'A region becomes clearer when its internal structure is visible.', clean(f'''
{label} is shaped by the states and urban centers that carry most of its administrative, economic, and service weight. In practical terms, that means looking closely at {states} and how their main cities structure the region.

For relocation planning, this internal map matters more than a general regional image. It shows where access and opportunity are actually concentrated.
        ''')),
        ('Economy And Opportunity', 'Regional viability depends on the kind of life being built.', clean(f'''
Economically, {label} should be read through {economy}. That frame is important because it affects job logic, business logic, sector concentration, and the kind of client profile that may thrive there.

A region can be attractive in general terms and still be poorly matched to a specific move objective. Opportunity has to be read through profile, not reputation.
        ''')),
        ('Cost And Living Pattern', 'Regional affordability has to be read with care.', clean(f'''
The cost profile of {label} is usually shaped by {costs}. That does not automatically make it cheaper or harder than other regions in every case, but it does change how housing, transport, and daily routine should be evaluated.

Cost matters most when it is connected to access. A lower figure is useful only if it still supports the life and legal continuity the move requires.
        ''')),
        ('Infrastructure And Connectivity', 'Movement and access shape the quality of relocation.', clean(f'''
In practice, {label} should be compared through {infrastructure}. Infrastructure determines how people work, travel, study, access services, and maintain administrative control after arrival.

That means regional comparison cannot stop at landscape or price. It has to test whether the systems that support daily life are strong enough for the move being planned.
        ''')),
        ('Climate And Geography', 'Physical conditions influence daily routine more than people expect.', clean(f'''
The region is also defined by {climate}. Geography and climate affect comfort, transport, health routine, housing choice, and the pace of daily life after relocation.

Readers should treat these variables as operational rather than decorative. The move has to work inside the physical environment, not only look attractive in it.
        ''')),
        ('Services And Public Systems', 'Regional life is filtered through service access.', clean(f'''
A realistic view of {label} depends on how healthcare, education, transport, banking, and local administration are actually accessed. In this region, the key issue is usually {services}.

Service access is one of the clearest separators between a region that looks possible and a region that is genuinely workable for a specific client profile.
        ''')),
        ('Who Tends To Fit This Region', 'The right region depends on the person, not only on the place.', clean(f'''
{label} tends to make the most sense for {profiles}. That does not mean other profiles should exclude it, but it does mean the region often rewards a particular kind of routine, objective, or tolerance for trade-offs.

A region should therefore be judged by fit, not by popularity. This is where comparison becomes more intelligent.
        ''')),
        ('How To Compare It Properly', 'A region should finish as a shortlist decision, not a vague impression.', clean(f'''
After reading this page, the next move should be to compare {label.lower()} against one or two other realistic options using the same criteria: cost, services, infrastructure, climate, and route suitability. That method keeps the decision controlled.

The goal is not to decide immediately. The goal is to know whether {label.lower()} belongs in the next round of serious planning.
        ''')),
    ]
    return make_page(route, label, hero_title, hero_summary, sections, internal_links, BRAZIL_RESOURCES, f'If {label.lower()} is emerging as a realistic location, consultation is where we test the region against your route, budget, documents, and timeline instead of leaving the choice at the level of preference.')


def structure_page(route, label, hero_title, hero_summary, subject, practical_role, cost_impact, admin_impact, internal_links):
    sections = [
        ('Overview', f'{label} are part of how Brazil should be read before a move is built around the wrong level of analysis.', clean(f'''
{label} matter because they determine how a relocation decision becomes practical. They are not only geographic or administrative labels. They affect where services are delivered, how bureaucracy is handled, and how daily routine is experienced once a person is living in Brazil.

This page explains {subject} in a way that supports relocation planning rather than leaving the term as abstract country knowledge.
        ''')),
        ('Why This Layer Matters', 'Good planning depends on using the right geographic unit.', clean(f'''
Many people compare Brazil at the wrong level. They talk about cities when the real issue is the state. They focus on a municipality when the real comparison belongs at a metropolitan or regional level. The result is usually confusion or false precision.

This page exists to correct that problem. It explains where {label.lower()} sit inside the larger planning structure.
        ''')),
        ('Administrative Function', 'The legal and practical role of this layer should be visible.', clean(f'''
In practical terms, {practical_role}. That matters because administrative structure affects services, public systems, and the speed or complexity of many everyday interactions after arrival.

A move becomes easier to manage when the reader understands what this layer actually controls and what it does not.
        ''')),
        ('Service Delivery Impact', 'The question is not only who governs, but how life is experienced.', clean(f'''
The relevance of {label.lower()} becomes clearer when viewed through service delivery. Education, healthcare, transport, utilities, neighborhood structure, and local documentation routines are all influenced by where a person sits inside Brazil\'s administrative map.

That is why this page belongs in relocation planning. It turns an institutional layer into something more operational.
        ''')),
        ('Cost And Housing Effect', 'Structure influences price, access, and routine.', clean(f'''
{cost_impact}. Readers should therefore avoid comparing price without understanding the geographic layer through which that price is produced.

Cost comparison becomes much more useful when the role of {label.lower()} is understood at the same time.
        ''')),
        ('Mobility And Infrastructure', 'Movement patterns change the quality of the move.', clean('''
Transport, commuting, service concentration, and daily reach often depend less on a national description of Brazil than on this specific layer of organization. That is particularly true when a person is choosing where to live in relation to where work, school, or key services are located.

This is where relocation planning becomes more precise and more realistic.
        ''')),
        ('Administrative Reality After Arrival', 'The move continues after entry, and the local layer matters.', clean(f'''
After arrival, {admin_impact}. These are the kinds of details that rarely appear in generalized Brazil content but often determine whether daily life feels manageable.

That is why this page matters even for readers who think they are only making a place decision. They are also making an administrative decision.
        ''')),
        ('Common Misunderstandings', 'The main error is treating all local units as interchangeable.', clean(f'''
A common misunderstanding is to assume that one city, one state, or one municipality stands in for a larger Brazilian reality. Another is to assume that administrative labels are technical background rather than practical planning tools.

This page is designed to remove that confusion and make comparison more disciplined.
        ''')),
        ('Best Use In Relocation Planning', 'This layer should improve the quality of the shortlist.', clean('''
The best use of this page is to help you decide whether your comparison should happen at the level of region, state, city, or municipality. That choice prevents wasted research and makes later decisions more coherent.

Once the right layer is clear, the move itself becomes easier to structure.
        ''')),
        ('Practical Next Step', 'Use this page to refine the map, then narrow the options.', clean(f'''
After reading this page, the next move is usually to pair it with region or place pages and then test how your shortlist behaves under cost, service, and route pressure. That is how {label.lower()} become useful rather than merely informative.

The aim is not more geography for its own sake. The aim is better relocation judgment.
        ''')),
    ]
    return make_page(route, label, hero_title, hero_summary, sections, internal_links, BRAZIL_RESOURCES, 'If your shortlist still feels too broad, consultation is where we use the right geographic layer to turn it into a workable plan for moving to Brazil.')


def brazil_reference_page(route, label, hero_title, hero_summary, purpose, use_logic, limits, internal_links):
    sections = [
        ('Overview', f'{label} should organize Brazil research rather than add more noise.', clean(f'''
This page exists to make Brazil planning easier to navigate. Its value is not only informational. It is structural. It helps readers move through the country, place, and relocation material with more control and less repetition.

{purpose}
        ''')),
        ('What This Page Is For', 'A planning tool should help narrow the question.', clean('''
A page like this is most useful when the reader already knows the type of decision being made: where to live, what to compare, which topic affects the move most, or which official area needs closer attention. Used correctly, the page shortens the path between research and a clearer next step.

It should therefore be treated as a planning instrument, not as a substitute for judgment.
        ''')),
        ('How To Use It Well', 'The value comes from structured reading rather than random browsing.', clean(f'''
{use_logic}. That sequence matters because the wrong reading order often creates false certainty rather than real clarity.

The strongest use of this page is to reduce unnecessary searching and keep the Brazil research process coherent.
        ''')),
        ('How It Connects To Relocation Decisions', 'Organized information improves practical outcomes.', clean('''
A move to Brazil becomes easier to plan when the right information is found at the right stage. This page should help readers connect country knowledge, place selection, and immigration timing instead of leaving them as separate tracks.

When it works properly, it turns scattered research into a more deliberate planning path.
        ''')),
        ('How It Connects To Place Comparison', 'The question is where the tool adds structure.', clean('''
Pages like this are particularly useful when a reader is moving from broad Brazil reading into a shortlist of regions, states, or cities. They make it easier to hold the right comparison variables together rather than losing them in unrelated detail.

In that sense, this page supports place selection indirectly by improving the quality of the research process around it.
        ''')),
        ('How It Connects To Immigration Planning', 'Research quality influences route quality.', clean('''
Better research does not replace legal analysis, but it does improve the questions brought into legal analysis. When a page like this helps clarify location, timing, systems, or objectives, consultation can begin from a stronger factual base.

That is why this material belongs within the broader immigration and relocation family rather than outside it.
        ''')),
        ('What It Can Clarify', 'A good reference page answers the right kind of uncertainty.', clean('''
The main value here is practical orientation. Readers should leave with a clearer sense of what to compare next, where to look more closely, and which variables are actually relevant to the move they are planning.

That is a meaningful gain. It removes uncertainty without pretending to resolve case-specific legal questions.
        ''')),
        ('What It Does Not Replace', 'Reference material has limits and should say so clearly.', clean(f'''
{limits}. That boundary matters because structured research is useful only when it remains honest about what it can and cannot do.

A clear limit is part of quality. It prevents readers from expecting final answers from a page meant to support orientation.
        ''')),
        ('When It Has Done Its Job', 'The best outcome is a narrower and better question.', clean('''
This page has done its job when the reader finishes with a smaller set of realistic next steps. That may be a more precise place comparison, a more focused topic review, or a decision to move into consultation.

In other words, the point is not to keep the reader circulating. The point is to help the reader progress.
        ''')),
        ('Practical Next Step', 'Use structure, then move.', clean('''
After reading this page, the right move is usually to open the most relevant Brazil or Places pages and continue in a narrower direction. Once the material is no longer merely informative but directly connected to a real move decision, consultation becomes the more useful stage.

That transition is the point this page is built to support.
        ''')),
    ]
    return make_page(route, label, hero_title, hero_summary, sections, internal_links, BRAZIL_RESOURCES, 'If this page has helped you narrow the question but not fully resolve the decision, consultation is the right next step. We use that stage to turn structured research into an actual move plan.')


def build_brazil_pages():
    pages = [brazil_hub_page(), places_hub_page(), brazil_country_page()]
    pages.extend([
        brazil_topic_page('/brazil/investment/', 'Investment', 'How investment changes the way a move to Brazil should be planned', 'This page explains investment in Brazil as a relocation and legal-planning variable, covering capital entry, company structure, route implications, and the sequencing that protects both the move and the investment itself.', 'capital entry, business structure, banking, and route positioning', 'foreign-capital regulation, company setup logic, banking controls, and the way investment activity is documented and structured in Brazil', 'sector concentration, market maturity, city selection, and the difference between an attractive opportunity and a workable operational base', 'access depends on the type of capital, the business model, the city chosen, and the administrative environment in which the investment will actually operate', 'company formation, banking, compliance, tax handling, licensing, and route sequencing all become relevant long before any residency result is in hand', 'the classic mistake is investing first, legalizing later, and discovering too late that the move structure, documentary trail, or banking logic should have been designed in reverse order', 'entrepreneurs, founders, small operators, investors, and families whose move depends on business activity or asset deployment', 'a serious investment decision may change the city shortlist, the route timing, the banking sequence, and even whether the project should begin with due diligence rather than immediate incorporation', ['/brazil/brazil/', '/brazil/economy/', '/brazil/cities/', '/process/planning/', '/start-consultation/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/economy/', 'Economy', 'How the Brazilian economy should be read before you build a move around it', 'This page treats the economy of Brazil as a practical planning environment, connecting inflation, currency, opportunity, sector concentration, and regional variation to the real decisions people make before relocating, working, or investing.', 'income reality, employment logic, currency pressure, and sector opportunity', 'inflation, interest rates, regional concentration of opportunity, labor-market structure, and the difference between national headlines and local economic reality', 'the parts of Brazil that concentrate finance, industry, logistics, agribusiness, tourism, or technology do not produce the same relocation experience or opportunity model', 'the practical issue is how income, cost, and opportunity meet in one place rather than being measured separately', 'economic planning influences business viability, work expectations, exchange-rate pressure, and the realism of a long-term move budget', 'many readers overread macroeconomic headlines and underread the local labor or business conditions that will actually shape daily life after arrival', 'entrepreneurs, investors, remote workers with foreign income, professionals comparing cities, and families trying to understand what kind of economic environment best supports stability', 'economic understanding can change where to live, what budget is realistic, whether local income is necessary, and how much currency fluctuation a move can absorb', ['/brazil/brazil/', '/brazil/cost/', '/brazil/investment/', '/brazil/quality/', '/process/planning/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/quality/', 'Quality', 'How quality of life in Brazil should be evaluated beyond surface impressions', 'This page explains quality of life in Brazil through systems that can actually be used: transport, services, safety patterns, environment, infrastructure, routine, and how all of that varies between different parts of the country.', 'public services, urban comfort, mobility, environmental conditions, and day-to-day stability', 'quality of life in Brazil is distributed unevenly because services, transport, density, environmental conditions, and safety patterns vary significantly across the country', 'regional and city-level differences are especially visible when quality is tested through routine rather than through image or tourism reputation', 'availability matters only when the reader can realistically reach and use the services that define quality in everyday life', 'quality questions often interact with school planning, healthcare access, housing choice, transport dependence, and the legal need to remain stable in one place over time', 'people often confuse beauty or popularity with livability and only later discover the importance of routine, service access, and administrative ease', 'families, retirees, remote workers, and anyone choosing a location primarily for stability rather than for a single business or short-term objective', 'quality-of-life analysis can move a shortlist away from symbolic destinations and toward locations that better support continuity, wellbeing, and long-term residence planning', ['/brazil/brazil/', '/brazil/living/', '/brazil/cost/', '/brazil/safety/', '/brazil/healthcare/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/living/', 'Living', 'What daily life in Brazil looks like once the move is no longer theoretical', 'This page translates Brazil from destination language into daily-life reality, covering routine, administration, mobility, services, language, adaptation, and the practical conditions that make a move feel stable after arrival.', 'routine, administration, communication, mobility, and the rhythm of day-to-day life', 'living in Brazil depends on how transport, housing, services, documents, local administration, and social routine work in the place selected', 'daily-life friction varies strongly between regions, city sizes, and metropolitan structures, which is why broad claims about living in Brazil are usually incomplete', 'the question is not whether daily systems exist, but whether they are accessible enough to support your intended life in the chosen location', 'administrative routine, language exposure, residency continuity, and the need to maintain a stable base all connect living conditions to the legal side of the move', 'a common mistake is to plan the move around one emotional idea of Brazil while leaving routine questions for later', 'people making their first long-term move to Brazil, families building daily routine, and remote workers who need life to function reliably rather than intermittently', 'living analysis usually changes where to settle, how much time to allow for adaptation, and whether the move should begin in a more structured location before expanding later', ['/brazil/brazil/', '/brazil/cost/', '/brazil/housing/', '/brazil/healthcare/', '/brazil/education/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/cost/', 'Cost', 'How to read the cost of life in Brazil without treating one number as the whole answer', 'This page explains the cost of living in Brazil through the lens of housing, exchange-rate pressure, transport, utilities, lifestyle, and regional variation so budgeting becomes more useful before a move is committed.', 'budget design, exchange-rate sensitivity, rent pressure, and regional price variation', 'national cost signals are shaped by housing, inflation, utilities, transport, taxation, and the difference between income earned locally and income earned abroad', 'cost behaves differently across capitals, interior cities, tourist areas, university centers, and family-oriented municipalities', 'a monthly number only becomes meaningful when linked to rent, mobility, healthcare, school planning, and the kind of routine the move requires', 'cost planning affects visa timing, proof-of-means strategy, family sequencing, and how safely someone can enter and maintain life in Brazil', 'many people budget for entry and underbudget for continuity, especially where exchange-rate movement or local rent conditions are involved', 'remote earners, families, retirees, digital nomads, and anyone trying to compare places through monthly sustainability rather than through image', 'good cost analysis often changes the shortlist, the pace of the move, and the order in which legal and practical commitments should be made', ['/brazil/brazil/', '/brazil/living/', '/brazil/housing/', '/brazil/quality/', '/brazil/cities/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/housing/', 'Housing', 'How housing in Brazil should be understood before a move becomes difficult to stabilize', 'This page explains housing in Brazil through rent, contracts, deposits, documentation, local market practice, foreign-buyer questions, and the relationship between where you live and how the rest of the move functions.', 'rent, purchase, deposits, documentation, and local market conditions', 'housing in Brazil is shaped by city-specific rental dynamics, contract practice, guarantor expectations, documentation rules, and the difference between formal and informal market behavior', 'housing conditions vary widely by city size, region, neighborhood logic, and whether the move is family-based, work-based, or investment-linked', 'access depends not only on budget but on documentation, timing, neighborhood fit, and how quickly a newcomer can move from temporary accommodation to stable housing', 'rental records, address stability, and local contractual practice can all affect how cleanly the move is maintained after arrival', 'many newcomers treat housing as a final logistical step instead of one of the central structural pieces of the relocation itself', 'families, long-term residents, retirees, and anyone whose move depends on quickly establishing a stable residential base', 'housing analysis often changes city selection, budget structure, school planning, and the timing of the first months in Brazil', ['/brazil/cost/', '/brazil/living/', '/brazil/cities/', '/brazil/municipalities/', '/process/planning/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/healthcare/', 'Healthcare', 'How healthcare access in Brazil should be read before location and routine are fixed', 'This page explains Brazil healthcare through SUS, private coverage, emergency access, regional variation, continuity of care, and the practical questions that matter most before a move becomes permanent.', 'public and private care, emergency access, insurance, continuity, and geographic availability', 'healthcare in Brazil must be read through SUS, private networks, local availability, and the practical difference between formal access and reliable use', 'availability, speed, and perceived quality vary considerably by region, city size, neighborhood, and income level', 'the issue is rarely healthcare in the abstract; it is whether care that fits your routine, profile, and risk level can actually be reached consistently', 'insurance, document routines, family planning, chronic care needs, and location stability all connect healthcare planning to the broader move strategy', 'people often overfocus on the existence of the public system and underfocus on local access, private alternatives, and continuity for their actual profile', 'families with children, retirees, people with ongoing treatment needs, and anyone for whom health routine is central to relocation stability', 'healthcare analysis can narrow the shortlist sharply and may influence whether a move should begin in a stronger service center before expanding later', ['/brazil/quality/', '/brazil/living/', '/brazil/education/', '/brazil/safety/', '/brazil/places/'], ['IBGE institutional portal', 'IBGE Cities and States', 'Ministry of Health and SUS information', 'Federal Government services portal (gov.br)']),
        brazil_topic_page('/brazil/education/', 'Education', 'How education in Brazil should be planned before a family move becomes difficult to coordinate', 'This page explains education in Brazil through school structure, private versus public options, language considerations, higher education, recognition issues, and planning for dependents or long-term settlement.', 'school options, language environment, recognition, and family planning', 'education in Brazil is structured through public and private systems, local availability, enrollment practice, and the language environment in which children or adults will actually study', 'regional and city differences matter because the strength, accessibility, and style of education options do not look the same across the country', 'the question is not simply whether schools exist, but whether the right type of school or institution is reachable and sustainable for the family or student profile involved', 'school enrollment, documentation, guardianship questions, residence stability, and long-term planning can all interact with the legal side of a move', 'many readers underestimate how strongly education planning can influence where the family should live and when the move should happen', 'families with school-age children, students, academics, and anyone whose move quality depends on education continuity', 'education analysis often changes neighborhood choice, city selection, budget planning, and the preferred sequence of the relocation itself', ['/brazil/living/', '/brazil/healthcare/', '/brazil/housing/', '/brazil/cities/', '/process/planning/'], ['IBGE institutional portal', 'IBGE Cities and States', 'Ministry of Education', 'Federal Government services portal (gov.br)']),
        brazil_topic_page('/brazil/safety/', 'Safety', 'How safety in Brazil should be evaluated without panic, denial, or vague reputation', 'This page explains safety in Brazil through neighborhood logic, mobility pattern, daily routine, public systems, and realistic precaution so relocation decisions are made with more discipline and less noise.', 'risk awareness, neighborhood choice, movement patterns, and realistic precaution', 'safety in Brazil has to be read through place, routine, time of day, mobility habits, and local infrastructure rather than through generalized national fear or reassurance', 'regional and city differences are decisive because safety is experienced locally and often changes substantially inside the same metropolitan area', 'what matters is whether everyday movement, housing location, schooling, work routine, and administrative tasks can happen with an acceptable level of confidence for the specific profile involved', 'safety interacts with housing, transport, school planning, route stability, and the practical question of whether the chosen base supports long-term continuity', 'the common mistake is to use one reputation word as a substitute for structured local comparison', 'families, retirees, remote workers, women relocating alone, and anyone choosing place primarily on the basis of routine stability', 'safety analysis usually changes neighborhood decisions, city selection, and how realistic a shortlist looks once daily life is mapped properly', ['/brazil/quality/', '/brazil/living/', '/brazil/housing/', '/brazil/cities/', '/brazil/places/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/culture/', 'Culture', 'How culture in Brazil affects integration, communication, and the lived experience of the move', 'This page explains Brazilian culture in practical relocation terms, focusing on communication style, social norms, public rhythm, regional differences, and the cultural expectations that affect how a move feels after arrival.', 'communication style, social rhythm, regional identity, and integration expectations', 'culture in Brazil is shaped by regional history, language environment, public life, family structure, and the daily social patterns that influence how people work, communicate, and settle', 'cultural experience varies by region, city scale, local history, and class or professional environment, which is why general descriptions are rarely enough', 'availability here means access to a way of living and relating that fits or challenges the reader\'s own expectations and adaptation style', 'culture affects adaptation, communication, professional interpretation, family comfort, and the realism of integration planning after arrival', 'many readers either romanticize Brazilian culture or reduce it to stereotypes, neither of which supports a stable move', 'people relocating long-term, families thinking about adaptation, professionals entering Brazilian work environments, and anyone whose move depends on integration rather than short-term presence', 'cultural understanding can alter city choice, pacing, expectations around adaptation, and the type of support that makes the early months in Brazil more stable', ['/brazil/living/', '/brazil/festivals/', '/brazil/cuisine/', '/brazil/places/', '/process/planning/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/festivals/', 'Festivals', 'How Brazil\'s festival calendar affects timing, tourism pressure, and the rhythm of life in different places', 'This page explains festivals in Brazil as a practical planning variable, not only a cultural attraction, showing how local calendars influence price, availability, mobility, atmosphere, and place selection.', 'seasonal rhythm, local identity, tourism pressure, and timing-sensitive planning', 'festivals in Brazil are tied to local calendars, municipal identity, tourism flow, and public rhythm in ways that can influence how a destination feels across the year', 'festival experience changes sharply by region, city, season, and the scale of the event in local life', 'what matters is how the calendar affects mobility, accommodation, pricing, routine, and the kind of environment a client will actually encounter', 'timing around festivals can affect accommodation choices, short-term arrival plans, neighborhood experience, and how smoothly the first weeks of a move are managed', 'many readers treat festivals as background culture and miss how much they can change cost, transport, or routine in the chosen location', 'tourism-linked movers, short-term arrivals becoming long-term residents, families timing arrival, and readers comparing atmosphere and city rhythm', 'festival awareness may change arrival timing, temporary accommodation planning, and which places should or should not be entered during high-pressure periods', ['/brazil/culture/', '/brazil/events/', '/brazil/cost/', '/brazil/cities/', '/brazil/places/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/cuisine/', 'Cuisine', 'How Brazilian cuisine and food culture affect daily routine, integration, and place choice', 'This page explains cuisine in Brazil as part of the lived move experience, linking regional food culture, access, market patterns, and daily routine to the practical reality of settling well in a new place.', 'regional food culture, shopping patterns, routine, and day-to-day adaptation', 'cuisine in Brazil reflects agriculture, regional history, climate, and the practical food systems that shape what people buy, cook, and eat in different parts of the country', 'food culture changes meaningfully by region, city size, and local market availability, which is why it can influence quality-of-life fit more than people expect', 'access matters here because daily food routine depends on neighborhood supply, cost, local ingredients, and whether a person\'s dietary habits can be maintained comfortably', 'food routine interacts with budget, neighborhood choice, cultural adaptation, and the realism of everyday life after arrival', 'many readers reduce cuisine to tourism imagery and miss its role in routine, comfort, and integration', 'families, retirees, health-conscious movers, and anyone for whom daily routine and adaptation quality matter strongly', 'cuisine analysis may not decide a route on its own, but it often helps decide which places feel sustainable for the kind of life a client wants to build', ['/brazil/culture/', '/brazil/living/', '/brazil/cost/', '/brazil/cities/', '/brazil/quality/'], BRAZIL_RESOURCES),
        brazil_topic_page('/brazil/events/', 'Events', 'How events in Brazil affect professional opportunity, local rhythm, and relocation timing', 'This page treats events in Brazil as a practical planning category, covering business, cultural, public, and seasonal events that can shape opportunity, networking, travel patterns, and the atmosphere of a place after arrival.', 'professional gatherings, public calendars, local rhythm, and timing-sensitive movement', 'events in Brazil reflect local economic sectors, cultural life, municipal rhythm, and the kinds of professional or social concentration that exist in different places', 'regional and city variation matters because some areas are shaped strongly by recurring event cycles while others are more stable or locally focused', 'access depends on where the events occur, how they affect accommodation or transport, and whether they create real value for the move objective involved', 'events can matter for business networking, market understanding, relocation timing, temporary arrival planning, and how a city is first experienced', 'many readers either ignore events completely or overread them as permanent indicators of what daily life is like all year', 'entrepreneurs, investors, remote professionals seeking networking, and anyone whose move may align with a specific local calendar', 'event awareness can alter timing, city comparison, and the sequence in which exploratory visits or longer-term settlement decisions should happen', ['/brazil/festivals/', '/brazil/culture/', '/brazil/investment/', '/brazil/cities/', '/process/planning/'], BRAZIL_RESOURCES),
        brazil_reference_page('/brazil/guides/', 'Guides', 'Structured Brazil guides for readers who need order before they need advice', 'This page acts as the guide hub for Brazil planning, showing how structured primers can organize country knowledge, place comparison, and relocation variables before the move becomes case-specific.', 'Guides are here to turn broad interest in Brazil into a more disciplined reading path across place, cost, services, culture, and practical relocation issues.', 'Use the guides when you know the move is serious enough to justify a structured reading order but not yet specific enough for individualized route work.', 'Guides can clarify the planning environment, but they cannot replace a review of your own chronology, route fit, documents, or deadlines.', ['/brazil/', '/brazil/places/', '/brazil/cost/', '/insights/guides/', '/start-consultation/']),
        brazil_reference_page('/brazil/faqs/', 'Faqs', 'The Brazil questions people ask before they know what needs deeper analysis', 'This page gathers the recurring questions readers ask about moving to Brazil so early confusion can be reduced before the questions become route-specific, time-sensitive, or document-dependent.', 'FAQs are here to answer the recurring baseline questions about Brazil without forcing every reader into scattered research or premature consultation.', 'Use the FAQ page to settle foundational questions first, then move into the topic or place page that deserves deeper reading.', 'FAQs can clarify patterns and recurring doubts, but they cannot answer live case questions that depend on your specific route, documents, or timing.', ['/brazil/', '/brazil/places/', '/brazil/cost/', '/insights/general/', '/start-consultation/']),
        region_page('/brazil/north/', 'North', 'What the North of Brazil offers and what it demands in practice', 'This page explains the North of Brazil through its states, climate, infrastructure, urban concentration, and practical fit for people comparing the region as a real relocation option rather than a distant idea.', 'Acre, Amapa, Amazonas, Para, Rondonia, Roraima, and Tocantins', 'river logistics, Manaus as a major urban and economic anchor, extractive activity, trade corridors, and a practical relationship with scale and distance', 'distance, logistics, and service concentration can change cost structure and daily convenience depending on the city chosen', 'long distances, uneven connectivity, and the practical importance of choosing the right urban base rather than treating the region as uniform', 'heat, humidity, river geography, distance, and the physical reality of a region shaped strongly by the Amazon basin', 'stronger access usually concentrates in major urban centers while other parts of the region require more deliberate planning around services and movement', 'people drawn to the North for specific work, family, business, research, or lifestyle reasons who are prepared to compare access and distance carefully', ['/brazil/places/', '/brazil/cities/', '/brazil/cost/', '/brazil/living/', '/process/planning/']),
        region_page('/brazil/northeast/', 'Northeast', 'How to compare the Northeast of Brazil beyond tourism and reputation', 'This page explains the Northeast through infrastructure, cost, coastal and inland variation, urban concentration, and the practical realities that matter when the region becomes a serious relocation option.', 'Alagoas, Bahia, Ceara, Maranhao, Paraiba, Pernambuco, Piaui, Rio Grande do Norte, and Sergipe', 'coastal urban centers, tourism-linked economies, strong regional identity, service concentration in specific capitals, and significant variation between metropolitan and interior life', 'the region can look affordable in general terms, but price and quality shift sharply depending on city, neighborhood, and how coastal or interior the routine will be', 'airport access, metropolitan structure, healthcare concentration, and the practical difference between well-connected capitals and thinner service environments', 'warm climate, coastal and interior contrast, seasonal variation, and a strong connection between geography and everyday routine', 'public and private service quality varies meaningfully, which makes city-specific comparison more useful than broad regional enthusiasm', 'remote workers, retirees, families, and lifestyle-driven movers who still want cost, service, and infrastructure compared realistically', ['/brazil/places/', '/brazil/cost/', '/brazil/quality/', '/brazil/cities/', '/brazil/safety/']),
        region_page('/brazil/central-west/', 'Central-West', 'How the Central-West of Brazil should be read as a strategic living and planning region', 'This page explains the Central-West through administrative importance, agribusiness strength, Brasilia, mobility, and the practical fit of the region for people considering it as a real place to settle or structure a move.', 'the Federal District, Goias, Mato Grosso, and Mato Grosso do Sul', 'Brasilia\'s administrative role, agribusiness networks, logistics corridors, and a regional profile shaped by both institutional power and land-based economic activity', 'cost and housing vary significantly between the Federal District, satellite urban areas, agribusiness centers, and smaller cities', 'road dependence, administrative concentration, and the practical difference between highly institutional spaces and more production-oriented localities', 'savannah landscapes, heat, dryness in parts of the year, and a geography that shapes mobility and settlement differently from the coastal regions', 'service access tends to be strongest where administrative or major economic concentration is highest, which makes city choice especially important', 'civil servants, professionals linked to administration, agribusiness actors, and readers comparing strategic rather than purely lifestyle-driven moves', ['/brazil/places/', '/brazil/states/', '/brazil/investment/', '/brazil/economy/', '/process/planning/']),
        region_page('/brazil/southeast/', 'Southeast', 'How the Southeast of Brazil concentrates opportunity, pressure, and infrastructure at the same time', 'This page explains the Southeast through its economic weight, urban complexity, service concentration, and the trade-offs readers should understand before treating the region as the automatic answer for every move.', 'Espirito Santo, Minas Gerais, Rio de Janeiro, and Sao Paulo', 'economic concentration, corporate and professional opportunity, major infrastructure, and large metropolitan environments with strong internal differences', 'the region often offers stronger services and opportunity, but also sharper cost pressure and more demanding housing or mobility trade-offs', 'airport access, institutional concentration, dense metropolitan systems, and the need to compare neighborhoods and city logic carefully rather than relying on region-level assumptions', 'diverse geography with coastal, mountain, and urban environments that shape routine differently across the region', 'service access can be excellent, but quality still depends heavily on city, neighborhood, and budget', 'professionals, founders, families needing strong service infrastructure, and anyone whose move depends on administrative ease or economic concentration', ['/brazil/places/', '/brazil/cost/', '/brazil/quality/', '/brazil/investment/', '/brazil/cities/']),
        region_page('/brazil/south/', 'South', 'How the South of Brazil should be compared through routine, infrastructure, and long-term fit', 'This page explains the South through urban structure, climate, service distribution, mobility, and the practical reasons many readers consider the region when building a stable long-term move to Brazil.', 'Parana, Rio Grande do Sul, and Santa Catarina', 'industrial and service economies, strong urban networks, varied local business environments, and a regional identity often associated with order and routine', 'cost can remain more moderate than parts of the Southeast in some locations, but it varies sharply by city profile, coastline, and service concentration', 'solid urban infrastructure in many areas, strong road networks, and the practical importance of comparing capital cities with secondary cities rather than treating the region as uniform', 'cooler winters, seasonal variation, and a climate profile that feels different from much of the country and therefore matters to adaptation', 'service quality is often a key attraction of the region, but it still needs city-level testing rather than broad assumption', 'families, retirees, remote workers, and long-term movers looking for structured routine, stronger service environments, or different climate conditions', ['/brazil/places/', '/brazil/quality/', '/brazil/cost/', '/brazil/cities/', '/brazil/housing/']),
        structure_page('/brazil/states/', 'States', 'Why Brazilian states matter more than many relocation plans initially assume', 'This page explains the role of Brazilian states in relocation planning so readers can understand how governance, cost, services, and regional logic shift across the country before narrowing to a city.', 'how state-level structure affects relocation decisions', 'states influence taxation context, public systems, policing structure, education frameworks, infrastructure priorities, and regional identity in ways that shape daily life after arrival', 'state-level differences often influence housing markets, labor conditions, public-service quality, and the broad cost profile under which cities operate', 'state logic affects where documents are processed, how public systems are experienced, and how local regulation or service quality is interpreted in practice', ['/brazil/places/', '/brazil/cities/', '/brazil/municipalities/', '/brazil/search/', '/process/planning/']),
        structure_page('/brazil/cities/', 'Cities', 'How Brazilian cities should be compared before one becomes your base', 'This page explains cities in Brazil as the point where cost, mobility, services, housing, and administration become concrete enough to shape a real relocation decision.', 'the role of city-level comparison in a Brazil move', 'cities determine neighborhood logic, transport dependency, access to hospitals and schools, administrative convenience, and the rhythm of daily life more directly than broad regional descriptions do', 'city structure often decides rent level, commute burden, school options, and whether a daily routine feels manageable or exhausting after arrival', 'city choice affects where services are concentrated, how far routine tasks require movement, and how quickly a newcomer can stabilize daily life', ['/brazil/places/', '/brazil/states/', '/brazil/housing/', '/brazil/cost/', '/brazil/safety/']),
        structure_page('/brazil/municipalities/', 'Municipalities', 'How municipalities in Brazil affect daily administration after arrival', 'This page explains municipalities as a practical layer of Brazil planning, showing how local government, service delivery, and everyday administration can change the lived quality of a move even after the city has already been chosen.', 'how municipal structure influences a real move', 'municipalities shape local service delivery, neighborhood administration, sanitation, transit choices, public-space management, and the immediate local environment in which daily life happens', 'municipal boundaries and municipal capacity can affect local cost, service quality, and the stability of day-to-day life more than many readers realize', 'municipal realities often determine how cleanly address-based routines, local services, and everyday bureaucracy actually work after arrival', ['/brazil/places/', '/brazil/cities/', '/brazil/directory/', '/brazil/search/', '/process/aftercare/']),
        brazil_reference_page('/brazil/directory/', 'Directory', 'A structured directory for Brazil planning variables, public systems, and practical reference points', 'This page organizes Brazil planning material into a usable directory so research can stay structured while readers compare regions, systems, and practical relocation variables.', 'The directory is here to categorize the parts of Brazil planning that readers most often need to locate quickly: institutions, practical systems, geographic references, and relocation topics.', 'Use the directory when you already know the kind of information you need but want a cleaner route to it than broad browsing can provide.', 'A directory can point you to the right area of the Brazil family, but it cannot decide which route, place, or timing question applies to your own move.', ['/brazil/', '/brazil/places/', '/brazil/search/', '/brazil/guides/', '/start-consultation/']),
        brazil_reference_page('/brazil/search/', 'Search', 'How to search Brazil planning material without losing the structure of the move', 'This page explains how the Brazil search layer should be used so research remains organized around place, systems, and decision-making instead of turning into a long list of disconnected queries.', 'Search is here to help readers find the right Brazil topic or place page faster once the move question has already started to narrow.', 'Use search when you can already name the variable, region, city, or planning issue you are trying to clarify, and then use the result to return to a structured reading path.', 'Search can help locate the right page, but it cannot replace a coherent planning method or individualized route analysis once the question becomes case-specific.', ['/brazil/', '/brazil/places/', '/brazil/directory/', '/brazil/faqs/', '/start-consultation/']),
    ])
    return pages


def main():
    pages = build_brazil_pages()
    doc = render_doc(
        'Brazil And Places Client Preview',
        'This preview covers the proposed Brazil Hub and Places Hub, plus the existing Brazil family pages rewritten as approval-first client-visible drafts. The current audit shows strong shells and useful topic direction, but too much repeated generic copy. The proposal below keeps the topic architecture while making every page read like a deliberate, publishable Immigrate to Brazil resource.',
        [
            'Add a new `/brazil/` hub above the current `/brazil/brazil/` country overview page.',
            'Add a new `/brazil/places/` hub to organize regional, state, city, and municipal comparison.',
            'Keep `/brazil/brazil/` as the country overview page rather than treating it as the hub.',
            'Reframe `Guides`, `Faqs`, `Directory`, and `Search` as structured research tools for Brazil planning rather than thin utility pages.',
            'Keep the tone practical, Brazil-focused, and immigrant-aware: informative, serious, structured, and never tourism-brochure language.',
        ],
        pages,
    )
    (DOCS / 'brazil-and-places-client-preview.md').write_text(doc, encoding='utf-8')

if __name__ == '__main__':
    main()
