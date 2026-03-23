#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTES_ROOT = ROOT / "content" / "en" / "routes"

DOCS = [
    ROOT / "docs" / "services-family-client-preview.md",
    ROOT / "docs" / "brazil-and-places-client-preview.md",
    ROOT / "docs" / "process-and-aftercare-client-preview.md",
    ROOT / "docs" / "insights-client-preview.md",
]

EMAIL = "immigratetobrazilteam@gmail.com"
PHONE = "+55 43 99132-4028"
WHATSAPP_URL = "https://wa.me/5543991324028?text=Hello%2C%20Immigrate%20to%20Brazil%20team!"
LOGO_MAIN = "/assets/logo/immigrate-to-brazil-logo.png"
LOGO_TRANSPARENT = "/assets/logo/immigrate-to-brazil-logo-transparent.png"

THEME_BY_FAMILY = {
    "services": "#2D6A4F",
    "brazil": "#40916C",
    "process": "#C7953C",
    "insights": "#CD6C28",
}

TITLE_SUFFIX = {
    "services": "Brazil Immigration Services",
    "brazil": "Brazil Guidance",
    "process": "Brazil Immigration Process",
    "insights": "Brazil Insights",
}

EYEBROW = {
    "services": "SERVICES",
    "brazil": "BRAZIL",
    "process": "PROCESS",
    "insights": "INSIGHTS",
}

STYLE_BY_FAMILY = {
    "services": "style-service-child",
    "brazil": "style-brazil",
    "process": "style-process",
    "insights": "style-insight",
}

SECTION_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5a2.5 2.5 0 0 0-2.5-2.5H5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5V15h10.5c.53 0 1.04.13 1.5.36V4H7.5Zm-2.5 15h12.5c1.38 0 2.5 1.12 2.5 2.5H7.5A2.5 2.5 0 0 1 5 19Z" fill="currentColor"/>'
    "</svg>"
)
COMPASS_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"/>'
    "</svg>"
)
LIST_RE = re.compile(r"^(\s*)([-*]|\d+\.)\s+(.*)$")


class Page:
    def __init__(self, path: str, hero_title: str, hero_summary: str, links: list[str], resources: list[str], sections: list[tuple[str, str]], end_cta: str) -> None:
        self.path = path
        self.hero_title = hero_title
        self.hero_summary = hero_summary
        self.links = links
        self.resources = resources
        self.sections = sections
        self.end_cta = end_cta


def parse_doc(path: Path) -> list[Page]:
    lines = path.read_text(encoding="utf-8").splitlines()
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
        pages.append(Page(route, hero_title, hero_summary, links, resources, sections, "\n".join(cta_lines).strip()))
    return pages


def clean_text(value: str) -> str:
    return (
        value.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2026", "...")
        .strip()
    )


def slugify(value: str) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def render_inline(value: str) -> str:
    value = clean_text(value)
    escaped = html.escape(value, quote=False)
    escaped = re.sub(r"`([^`]+)`", lambda m: f"<code>{html.escape(clean_text(m.group(1)))}</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<strong>{html.escape(clean_text(m.group(1)))}</strong>", escaped)
    escaped = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: f'<a href="{html.escape(clean_text(m.group(2)))}">{html.escape(clean_text(m.group(1)))}</a>', escaped)
    escaped = escaped.replace(EMAIL, f'<a href="mailto:{EMAIL}">{EMAIL}</a>')
    escaped = escaped.replace(PHONE, f'<a href="{WHATSAPP_URL}">{PHONE}</a>')
    return escaped


def render_list(lines: list[str], start: int, indent: int = 0) -> tuple[str, int]:
    items: list[str] = []
    tag = "ul"
    i = start
    while i < len(lines):
        line = lines[i]
        match = LIST_RE.match(line)
        if not match:
            break
        current_indent = len(match.group(1))
        if current_indent != indent:
            break
        if match.group(2).endswith("."):
            tag = "ol"
        items.append(f"<li>{render_inline(match.group(3))}</li>")
        i += 1
    return f"<{tag}>\n{''.join(items)}\n</{tag}>", i


def render_markdownish(source: str) -> str:
    lines = [line.rstrip() for line in source.strip().splitlines()]
    blocks: list[str] = []
    i = 0
    while i < len(lines):
        raw = lines[i]
        line = clean_text(raw.strip())
        if not line:
            i += 1
            continue
        list_match = LIST_RE.match(raw)
        if list_match:
            html_list, i = render_list(lines, i, len(list_match.group(1)))
            blocks.append(html_list)
            continue
        paragraph_lines = [line]
        i += 1
        while i < len(lines):
            nxt = clean_text(lines[i].strip())
            if not nxt or LIST_RE.match(lines[i]):
                break
            paragraph_lines.append(nxt)
            i += 1
        blocks.append(f"<p>{render_inline(' '.join(paragraph_lines))}</p>")
    return "\n".join(blocks)


def existing_route_data() -> dict[str, dict]:
    data = {}
    for path in ROUTES_ROOT.rglob("page.json"):
        route = "/" + str(path.parent.relative_to(ROUTES_ROOT)).replace("\\", "/").strip("/") + "/"
        if route == "/root/":
            route = "/"
        data[route] = json.loads(path.read_text(encoding="utf-8"))
    return data


def family_for(route: str) -> str:
    return route.strip("/").split("/")[0]


def route_dir(route: str) -> Path:
    if route == "/":
        return ROUTES_ROOT
    return ROUTES_ROOT / route.strip("/")


def route_url(route: str) -> str:
    return "https://immigratetobrazil.com" if route == "/" else f"https://immigratetobrazil.com{route}"


def route_to_pt(route: str) -> str:
    return "/pt-br/" if route == "/" else f"/pt-br{route}"


def ensure_ascii_json(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def parse_md_link(item: str) -> tuple[str, str]:
    match = re.match(r"\[(.+?)\]\((.+?)\)", item)
    if match:
        return clean_text(match.group(1)), clean_text(match.group(2))
    return clean_text(item), ""


RESOURCE_DESCRIPTIONS = {
    "Brazilian Migration Law": "Primary statutory framework for migration, admission, residence, rights, and duties in Brazil.",
    "Migration Regulation Decree": "Regulatory decree used to interpret migration procedures, authorities, and administrative logic.",
    "Portal de Imigracao - Ministerio da Justica": "Official migration portal with public guidance on authorisations and immigration administration.",
    "Policia Federal - Imigracao": "Federal Police portal for registration, migration documentation, and post-arrival obligations.",
    "Portal Consular - Ministerio das Relacoes Exteriores": "Official consular portal with entry, visa, and consular reference information.",
    "IBGE - Cidades do Brasil": "Official municipal profiles, indicators, and local statistics from IBGE.",
    "IBGE - Cidades e Estados": "Official IBGE portal for state and municipal reference information.",
    "IBGE - Mapa Politico do Brasil": "Official political map reference for states, federal district, and national territorial organization.",
    "IBGE - Censo Demografico 2022": "Official demographic baseline for population, territory, and place comparison.",
    "IBGE - SIDRA IPCA": "Official public inflation and consumer-price reference data from IBGE.",
    "INMET": "Official weather and climate reference portal for Brazil.",
    "Ministerio do Turismo": "Official tourism portal covering destinations, sectors, and destination context.",
    "Ministerio da Cultura": "Official public reference for culture policy, programs, and institutional information.",
    "Ministerio da Saude - SUS": "Official public-health reference portal for the Brazilian health system.",
    "ANS": "Official regulator for private health insurance and supplementary health services in Brazil.",
    "Ministerio da Educacao": "Official reference for national education policy and public-education structure.",
    "INEP": "Official education indicator and assessment institution for Brazilian education data.",
    "Ministerio dos Transportes": "Official transport and logistics portal useful for mobility and infrastructure context.",
    "Ministerio das Cidades": "Official urban-development and housing policy reference portal.",
    "Ministerio do Esporte": "Official sports and event-related public reference portal.",
    "Ministerio da Agricultura": "Official agriculture portal with sector, production, and food-chain context.",
    "gov.br - Empresas e Negocios": "Official business and entrepreneurship portal for companies and business operations in Brazil.",
    "Banco Central do Brasil - Estatisticas": "Official macroeconomic and financial statistics portal from the Brazilian Central Bank.",
    "Banco Central do Brasil - Cotacoes": "Official exchange-rate and currency quotation portal from the Brazilian Central Bank.",
    "ApexBrasil": "Official trade and investment promotion agency for Brazil.",
    "Receita Federal": "Official federal tax and fiscal-administration portal.",
    "CAIXA": "Official CAIXA portal for banking, housing, and public-finance service information.",
    "Ministerio da Justica e Seguranca Publica": "Official justice and public-security portal with federal institutional references.",
}


def resource_item(item: str) -> dict:
    title, href = parse_md_link(item)
    return {
        "href": href,
        "title": title,
        "description": RESOURCE_DESCRIPTIONS.get(title, f"Official public reference for {title.lower()}."),
    }


def normalize_label(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", clean_text(value).lower()).strip()


def build_lookup(existing: dict[str, dict], preview_pages: dict[str, Page]) -> dict[str, str]:
    lookup: dict[str, str] = {
        "services hub": "/services/",
        "advisory hub": "/services/advisory/",
        "defense hub": "/services/defense/",
        "naturalisation hub": "/services/naturalisation/",
        "other services hub": "/services/other/",
        "residencies hub": "/services/residencies/",
        "visas hub": "/services/visas/",
        "brazil hub": "/brazil/",
        "places hub": "/brazil/places/",
        "process hub": "/process/",
        "insights hub": "/insights/",
        "consultation": "/start-consultation/",
        "process consultation": "/process/consultation/",
        "process strategy": "/process/strategy/",
        "process planning": "/process/planning/",
        "process failures": "/process/failures/",
        "about why us": "/about/whyus/",
        "services corporate": "/services/advisory/corporate/",
        "services naturalisation": "/services/naturalisation/",
        "services residencies": "/services/residencies/",
        "services visas": "/services/visas/",
        "residencies investor": "/services/residencies/investor/",
    }
    for route, data in existing.items():
        title = data.get("runtime", {}).get("pageTitle")
        if title:
            lookup.setdefault(normalize_label(title), route)
        slug = route.strip("/").split("/")[-1] if route != "/" else "home"
        lookup.setdefault(normalize_label(slug.replace("-", " ")), route)
    for route, page in preview_pages.items():
        last = route.strip("/").split("/")[-1] if route != "/" else "home"
        lookup.setdefault(normalize_label(last.replace("-", " ")), route)
        lookup.setdefault(normalize_label(page.hero_title), route)
    return lookup


def image_for(route: str, family: str, existing: dict[str, dict]) -> dict:
    fallback_route = {
        "services": "/services/",
        "brazil": "/brazil/brazil/",
        "process": "/process/consultation/",
        "insights": "/insights/general/",
    }.get(family, "/")
    data = existing.get(route) or existing.get(fallback_route) or next(iter(existing.values()))
    image_schema = next((item for item in data.get("schemas", []) if item.get("@type") == "ImageObject"), None) or {}
    return {
        "src": data["meta"]["preloadImage"],
        "alt": data["social"]["ogImageAlt"],
        "schema": image_schema,
    }


def existing_page_title(route: str, existing: dict[str, dict], page: Page) -> str:
    data = existing.get(route)
    if data:
        return data.get("runtime", {}).get("pageTitle") or clean_text(data.get("meta", {}).get("title", "").split("|")[0])
    if route == "/insights/":
        return "Insights"
    if route == "/brazil/places/":
        return "Places"
    return clean_text(page.hero_title.split(":")[0])


def render_brand_wordmark(inverse: bool, alt: str) -> str:
    classes = "brand-wordmark hero-brand-lockup"
    if inverse:
        classes += " brand-wordmark--inverse"
    image_src = LOGO_TRANSPARENT if inverse else LOGO_MAIN
    return (
        f'<span class="{classes}" aria-label="Immigrate to Brazil brand wordmark and logo">'
        f'<img class="brand-wordmark__mark" src="{image_src}" alt="{html.escape(alt)}" width="56" height="56" loading="lazy" decoding="async" />'
        '<span class="brand-wordmark__text">'
        '<span class="brand-wordmark__line brand-wordmark__line--top">Immigrate</span>'
        '<span class="brand-wordmark__line brand-wordmark__line--bottom">to Brazil</span>'
        "</span>"
        "</span>"
    )


def section_title_only(title: str) -> str:
    return title.split(". ", 1)[1] if ". " in title else title


def first_sentence(text: str) -> str:
    cleaned = clean_text(re.sub(r"\s+", " ", re.sub(r"\*\*([^*]+)\*\*", r"\1", text)))
    cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
    if "." in cleaned:
        return cleaned.split(".", 1)[0].strip() + "."
    return cleaned[:180]


def render_hero(page: Page, family: str, image: dict) -> str:
    badges = page.links[:6]
    badge_html = "".join(
        f'<span class="hero-badge"><span class="hero-badge__icon" aria-hidden="true">{COMPASS_ICON}</span><span>{html.escape(clean_text(label))}</span></span>'
        for label in badges
    )
    logo_alt = f"Immigrate to Brazil logo for the {page.hero_title} page, Brazil immigration, relocation, and consultation support"
    glance_cards = []
    for title, body in page.sections[:3]:
        glance_cards.append(
            f"""<article class="hero-glance-card">
            <span>{html.escape(section_title_only(title))}</span>
            <strong>{html.escape(first_sentence(body))}</strong>
          </article>"""
        )
    while len(glance_cards) < 3:
        glance_cards.append(
            """<article class="hero-glance-card">
            <span>Next step</span>
            <strong>Book a consultation when the public reading now needs to be tested against your real facts and plans.</strong>
          </article>"""
        )
    return f"""
<header class="hero" style="--hero-image:url('{image['src']}')">
      <img class="hero-media" src="{image['src']}" alt="{html.escape(image['alt'])}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" />
    <div class="hero-overlay"></div>
<div class="container hero-inner">
      <div class="hero-copy">
        <div class="hero-copy__lead">
          <p class="eyebrow">{EYEBROW[family]}</p>
          <p class="hero-kicker">Immigrate to Brazil</p>
        </div>
        <h1>{html.escape(page.hero_title)}</h1>
        <p class="hero-summary">{html.escape(page.hero_summary)}</p>
        <div class="hero-badges" aria-label="Page highlights">
          {badge_html}
        </div>
<div class="hero-actions">
          <a class="btn btn-cta" href="/start-consultation/" data-cta-click="true">Book Consultation</a>
          <a class="btn btn-secondary" href="{WHATSAPP_URL}">WhatsApp</a>
        </div>
      </div>
<div class="hero-meta">
        <div class="hero-panel hero-panel--brand">
          {render_brand_wordmark(True, logo_alt)}
          <p class="hero-brand-tagline">Supporting Immigrants - Promoting Brazil</p>
          <p class="hero-brand-note">{html.escape(page.hero_summary)}</p>
        </div>
<div class="hero-panel hero-panel--signals">
          <strong>Focus</strong>
          <ul class="hero-panel-list">
            {''.join(f'<li class="hero-panel-item"><span class="hero-panel-item__icon" aria-hidden="true">{COMPASS_ICON}</span><span>{html.escape(clean_text(label))}</span></li>' for label in badges[:2])}
          </ul>
        </div>
      </div>
    </div>
<div class="container hero-glance">
      {''.join(glance_cards)}
    </div>
  </header>""".rstrip()


def render_intro(section: tuple[str, str], idx: int = 1) -> str:
    title, body = section
    heading = section_title_only(title)
    return f"""
          <section class="content-block intro-block" id="section-{idx}-{slugify(heading)}">
            <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>{html.escape(heading)}</span></h2>
            {render_markdownish(body)}
          </section>""".rstrip()


def render_section(section: tuple[str, str], idx: int, variant: str) -> str:
    title, body = section
    heading = section_title_only(title)
    return f"""
  <section class="content-block flow-section topic-section {variant}" id="section-{idx}-{slugify(heading)}" data-topic="{html.escape(heading)}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Section {idx:02d}</p>
        <h2>{html.escape(heading)}</h2>
      </div>
      <div class="topic-section__body">
        {render_markdownish(body)}
      </div>
    </div>
  </section>""".rstrip()


def card_for_route(route: str, preview_map: dict[str, Page], existing: dict[str, dict]) -> dict | None:
    if route == "/start-consultation/":
        return {
            "href": route,
            "title": "Start Consultation",
            "description": "Structured intake for route analysis, chronology review, and immigration planning in Brazil.",
            "image_src": "/assets/images/heroes/process/brazil-lencois-maranhenses-consultation.webp",
            "image_alt": "Immigrate to Brazil consultation hero image for structured immigration planning.",
        }
    data = existing.get(route)
    if data:
        return {
            "href": route,
            "title": data.get("runtime", {}).get("pageTitle") or clean_text(data.get("meta", {}).get("title", "").split("|")[0]),
            "description": clean_text(data.get("meta", {}).get("description", "")),
            "image_src": data["meta"]["preloadImage"],
            "image_alt": data["social"]["ogImageAlt"],
        }
    page = preview_map.get(route)
    if not page:
        return None
    image = image_for(route, family_for(route), existing)
    return {
        "href": route,
        "title": existing_page_title(route, existing, page),
        "description": clean_text(page.hero_summary),
        "image_src": image["src"],
        "image_alt": image["alt"],
    }


def render_hub_menu(page: Page, preview_map: dict[str, Page], existing: dict[str, dict], route_lookup: dict[str, str]) -> str:
    cards = []
    for label in page.links:
        route = route_lookup.get(normalize_label(label))
        if not route:
            continue
        card = card_for_route(route, preview_map, existing)
        if not card:
            continue
        cards.append(
            f"""<article class="info-card">
              <img src="{card['image_src']}" alt="{html.escape(card['image_alt'])}" width="640" height="360" loading="lazy" decoding="async" style="display:block;width:100%;height:160px;object-fit:cover;border-radius:1rem;margin-bottom:0.95rem;" />
              <img class="brand-wordmark__mark" src="{LOGO_MAIN}" alt="Immigrate to Brazil logo for page navigation, consultation support, and Brazil information" width="64" height="64" loading="lazy" decoding="async" />
              <h3>{html.escape(card['title'])}</h3>
              <p>{html.escape(card['description'])}</p>
              <p><a class="btn btn-secondary btn-sm" href="{card['href']}">Open page</a></p>
            </article>"""
        )
    return f"""
  <section class="content-block highlight-block" id="hub-menu">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>Explore this hub</span></h2>
      <p>Use the cards below to move directly into the page that best matches the question, route, place, or stage you are trying to understand next.</p>
      <div class="card-grid compact">
        {''.join(cards)}
      </div>
    </section>""".rstrip()


def is_hub(page: Page) -> bool:
    parts = page.path.strip("/").split("/")
    return len(parts) == 1 or page.path in {"/services/", "/services/advisory/", "/services/defense/", "/services/naturalisation/", "/services/other/", "/services/residencies/", "/services/visas/", "/process/", "/insights/", "/brazil/places/"}


def render_body(page: Page, preview_map: dict[str, Page], existing: dict[str, dict], route_lookup: dict[str, str]) -> str:
    family = family_for(page.path)
    image = image_for(page.path, family, existing)
    intro = render_intro(page.sections[0], 1) if page.sections else ""
    variants = ["topic-section--split", "topic-section--frame", "topic-section--band"]
    section_html = [render_section(section, idx, variants[(idx - 2) % len(variants)]) for idx, section in enumerate(page.sections[1:], start=2)]
    hub_menu = render_hub_menu(page, preview_map, existing, route_lookup) if is_hub(page) else ""
    logo_alt = f"Immigrate to Brazil logo for the {page.hero_title} page, consultation booking, WhatsApp contact, and Brazil immigration support"
    cta = f"""
  <section class="lead-form-block" id="consultation-form">
    <div class="section-head">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>Ready for the next step?</span></h2>
      <p>{html.escape(clean_text(page.end_cta))}</p>
    </div>
    <div class="card-grid compact">
      <article class="info-card">
        <img class="brand-wordmark__mark" src="{LOGO_MAIN}" alt="{html.escape(logo_alt)}" width="72" height="72" loading="lazy" decoding="async" />
        <h3>Immigrate to Brazil</h3>
        <p>Structured guidance for immigration, relocation, long-term planning, and calmer decisions about Brazil.</p>
      </article>
      <article class="info-card">
        <h3>Book consultation</h3>
        <p>Use consultation for route comparison, chronology review, document planning, and clearer next-step guidance.</p>
        <p><a class="btn btn-cta btn-sm" href="/start-consultation/" data-cta-click="true">Book consultation</a></p>
      </article>
      <article class="info-card">
        <h3>Contact on WhatsApp</h3>
        <p>Use WhatsApp if you need faster operational clarification before choosing the next move.</p>
        <p><a class="btn btn-secondary btn-sm" href="{WHATSAPP_URL}">WhatsApp</a></p>
      </article>
    </div>
  </section>""".rstrip()
    return f"""


    <div data-partial="gtm-noscript"></div>

  <div data-partial="utility-bar"></div>

  <div data-partial="accessibility-panel"></div>

  <div data-partial="site-navigation"></div>

  <div data-partial="breadcrumbs"></div>

{render_hero(page, family, image)}

  <main id="main-content" class="site-main" data-page-key="{family}-{slugify(page.path.strip('/').replace('/', '-'))}">
      <div class="container main-shell main-shell--intro">

        <article class="content-column">
{intro}
{hub_menu}
{''.join(section_html)}
        </article>

        <div data-partial="sidebar-shell"></div>
      </div>
<div class="container">
        <div data-partial="official-resources"></div>
  <div data-partial="related-links"></div>
{cta}

        <div data-partial="disclaimer"></div>
      </div>
    </main>

        <div data-partial="site-footer"></div>

  <div data-partial="floating-whatsapp"></div>
""".rstrip() + "\n"


def body_class(route: str, family: str, existing: dict[str, dict]) -> str:
    if route in existing:
        return existing[route]["bodyClass"]
    slug = route.strip("/").replace("/", "-") or family
    return f"site-root page-{slugify(slug)} family-{family} {STYLE_BY_FAMILY[family]}"


def meta_title(page: Page, family: str, existing: dict[str, dict]) -> str:
    if page.path in existing:
        return existing[page.path]["meta"]["title"]
    runtime_title = existing_page_title(page.path, existing, page)
    return f"{runtime_title} | {TITLE_SUFFIX[family]} | Immigrate to Brazil"


def description(page: Page) -> str:
    return clean_text(page.hero_summary)


def breadcrumb_items(page: Page) -> list[dict]:
    parts = [part for part in page.path.strip("/").split("/") if part]
    items = [{"label": "Home", "href": "/"}]
    built = ""
    for idx, part in enumerate(parts):
        built += f"/{part}"
        href = built + "/"
        label = part.replace("-", " ").title()
        current = idx == len(parts) - 1
        if href == "/services/":
            label = "Services"
        elif href == "/brazil/":
            label = "Brazil"
        elif href == "/process/":
            label = "Process"
        elif href == "/insights/":
            label = "Insights"
        items.append({"label": label, **({"current": True} if current else {"href": href})})
    return items


def breadcrumb_schema(page: Page) -> dict:
    elements = [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://immigratetobrazil.com"}]
    parts = [part for part in page.path.strip("/").split("/") if part]
    built = ""
    pos = 2
    for part in parts:
        built += f"/{part}"
        href = built + "/"
        elements.append({"@type": "ListItem", "position": pos, "name": part.replace("-", " ").title(), "item": route_url(href)})
        pos += 1
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": elements}


def faq_schema(page: Page, runtime_title: str, family: str) -> dict:
    label = runtime_title
    if family == "services":
        questions = [
            (f"Who usually benefits from {label.lower()} support?", f"We use this page to explain who usually needs {label.lower()} support, what situations often fit it, and when another starting point may be better first."),
            (f"Does this page replace case-specific legal advice on {label.lower()}?", "No. The page is designed to improve general understanding and decision quality, but real strategy still depends on your own facts, documents, timing, and route fit."),
            (f"When should I contact Immigrate to Brazil about {label.lower()}?", "It usually makes sense to reach out when the route, service, or next step now depends on your own chronology, records, urgency, or long-term planning."),
        ]
    elif family == "brazil":
        questions = [
            (f"How can this page help me plan {label.lower()} more realistically?", "The goal is to connect attraction to Brazil with more grounded planning around place, cost, services, routine, and long-term fit."),
            (f"Is this page meant to replace personalized relocation or immigration planning for {label.lower()}?", "No. It is meant to make your research stronger before your own route, documents, city choice, or family context require individualized support."),
            (f"When does it make sense to contact Immigrate to Brazil after reading about {label.lower()}?", "It usually makes sense once your Brazil research is no longer broad and now depends on route, city, budget, family, or long-term planning decisions being tested together."),
        ]
    elif family == "process":
        questions = [
            (f"What is the practical value of understanding {label.lower()}?", "Understanding the stage usually improves sequence, expectation control, document quality, and the next decision you take inside the wider immigration process."),
            (f"Does this page mean my process is already in trouble?", "Not necessarily. Many readers use these pages simply to understand the stage better before acting. They become even more useful when timing, documents, or prior steps are starting to matter."),
            (f"When should {label.lower()} move from public reading into consultation?", "That usually happens when the answer now depends on your own facts, deadlines, records, or route comparison rather than on general explanation alone."),
        ]
    else:
        questions = [
            (f"Is this page on {label.lower()} meant as general guidance or individual advice?", "It is written as structured public guidance designed to improve understanding before your own facts, documents, or timing require individual review."),
            (f"How should I use this article on {label.lower()}?", "The strongest approach is to use it for orientation, vocabulary, and comparison, then move to consultation when the issue becomes personal or document-sensitive."),
            (f"When does reading about {label.lower()} stop being enough?", "Reading usually reaches its limit when the answer depends on your own chronology, route fit, deadlines, or records rather than on general public information."),
        ]
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in questions
        ],
    }


def image_schema(page: Page, image: dict) -> dict:
    schema = image["schema"]
    return {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "@id": f"{route_url(page.path)}#hero-image",
        "name": schema.get("name", f"{page.hero_title} hero image"),
        "description": schema.get("description", f"SEO hero image for the {page.hero_title} page on Immigrate to Brazil."),
        "caption": schema.get("caption", image["alt"]),
        "keywords": schema.get("keywords", f"{page.hero_title}, Immigrate to Brazil, Brazil"),
        "contentUrl": route_url(image["src"]),
        "url": route_url(image["src"]),
        "thumbnailUrl": route_url(image["src"]),
        "representativeOfPage": True,
        "inLanguage": "en",
    }


def resolve_related_routes(page: Page, route_lookup: dict[str, str]) -> list[str]:
    routes = []
    family = family_for(page.path)
    if page.path not in {f"/{family}/", "/brazil/places/"}:
        routes.append(f"/{family}/")
    for label in page.links:
        route = route_lookup.get(normalize_label(label))
        if route and route != page.path and route not in routes:
            routes.append(route)
    if "/start-consultation/" not in routes:
        routes.append("/start-consultation/")
    return routes[:6]


def page_json(page: Page, preview_map: dict[str, Page], existing: dict[str, dict], route_lookup: dict[str, str]) -> dict:
    family = family_for(page.path)
    image = image_for(page.path, family, existing)
    runtime_title = existing_page_title(page.path, existing, page)
    related = [card_for_route(route, preview_map, existing) for route in resolve_related_routes(page, route_lookup)]
    related = [item for item in related if item]
    existing_data = existing.get(page.path, {})
    og_type = "article" if family in {"brazil", "insights"} else "website"
    return {
        "route": page.path,
        "lang": "en",
        "bodyClass": body_class(page.path, family, existing),
        "meta": {
            "themeColor": THEME_BY_FAMILY[family],
            "description": description(page),
            "robots": "index,follow",
            "title": meta_title(page, family, existing),
            "preloadImage": image["src"],
        },
        "social": {
            "ogType": og_type,
            "ogTitle": meta_title(page, family, existing),
            "ogDescription": description(page),
            "ogImage": route_url(image["src"]),
            "ogImageAlt": image["alt"],
            "twitterCard": "summary_large_image",
            "twitterTitle": meta_title(page, family, existing),
            "twitterDescription": description(page),
            "twitterImage": route_url(image["src"]),
            "twitterImageAlt": image["alt"],
        },
        "runtime": {
            "pageTitle": runtime_title,
            "pageFamily": family,
        },
        "schemas": [
            breadcrumb_schema(page),
            {
                "@context": "https://schema.org",
                "@type": "WebPage" if is_hub(page) else ("LegalService" if family == "services" else "Article"),
                "name": runtime_title,
                "description": description(page),
                "url": route_url(page.path),
                "mainEntityOfPage": route_url(page.path),
                **({"provider": {"@id": "https://immigratetobrazil.com#organization"}} if family == "services" else {}),
            },
            faq_schema(page, runtime_title, family),
            image_schema(page, image),
        ],
        "shell": {
            "breadcrumbs": breadcrumb_items(page),
            "sidebar": {
                "brand": {
                    "note": description(page),
                },
                "nextStep": {
                    "lead": first_sentence(page.end_cta),
                    "actions": [
                        {
                            "className": "btn btn-cta btn-sm",
                            "href": "/start-consultation/",
                            "label": "Start Consultation",
                            "track": "cta",
                        },
                        {
                            "className": "btn btn-secondary btn-sm",
                            "href": WHATSAPP_URL,
                            "label": "WhatsApp",
                            "track": "whatsapp",
                        },
                    ],
                    "note": "Representation, filing strategy, and individualized legal judgment depend on the route, chronology, and supporting record.",
                },
            },
            "officialResources": [resource_item(item) for item in page.resources],
            "relatedLinks": related,
            **({"hreflangAlternates": existing_data.get("shell", {}).get("hreflangAlternates")} if existing_data.get("shell", {}).get("hreflangAlternates") else {}),
        },
    }


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> None:
    existing = existing_route_data()
    pages: list[Page] = []
    for doc in DOCS:
        pages.extend(parse_doc(doc))
    preview_map = {page.path: page for page in pages}
    route_lookup = build_lookup(existing, preview_map)

    for page in pages:
        route_path = route_dir(page.path)
        write_text(route_path / "body.html", render_body(page, preview_map, existing, route_lookup))
        write_text(route_path / "page.json", ensure_ascii_json(page_json(page, preview_map, existing, route_lookup)))


if __name__ == "__main__":
    main()
