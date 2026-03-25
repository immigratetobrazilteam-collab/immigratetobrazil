#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREVIEW_PATH = ROOT / "docs" / "legal-pages-client-preview.md"
ROUTES_ROOT = ROOT / "content" / "en" / "routes"
LEGAL_ROOT = ROUTES_ROOT / "legal"

THEME_COLOR = "#1B4332"
EMAIL = "immigratetobrazilteam@gmail.com"
PHONE = "+55 43 99132-4028"
WHATSAPP_URL = "https://wa.me/5543991324028?text=Hello%2C%20Immigrate%20to%20Brazil%20team!"
LOGO_MAIN = "/assets/logo/immigrate-to-brazil-logo.png"
LOGO_TRANSPARENT = "/assets/logo/immigrate-to-brazil-logo-transparent.png"

SECTION_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5a2.5 2.5 0 0 0-2.5-2.5H5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5V15h10.5c.53 0 1.04.13 1.5.36V4H7.5Zm-2.5 15h12.5c1.38 0 2.5 1.12 2.5 2.5H7.5A2.5 2.5 0 0 1 5 19Z" fill="currentColor"/>'
    "</svg>"
)
FAQ_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm2.2-7.4c0 1.15-.7 1.8-1.54 2.36-.8.53-1.16.9-1.16 1.54v.5h-2v-.74c0-1.37.74-2.19 1.72-2.86.73-.5.98-.84.98-1.34 0-.78-.56-1.32-1.48-1.32-.93 0-1.6.4-2.2 1.08l-1.46-1.26C8.06 7.12 9.28 6.3 10.98 6.3c1.96 0 3.22 1.22 3.22 2.8Z" fill="currentColor"/>'
    "</svg>"
)
COMPASS_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true">'
    '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"/>'
    "</svg>"
)

RESOURCE_MAP = {
    "Brazilian Migration Law": {
        "href": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13445.htm",
        "title": "Brazilian Migration Law (Law No. 13.445/2017)",
        "description": "Primary statutory framework for migration, admission, residence, rights, duties, and administrative measures in Brazil.",
    },
    "Migration Regulation Decree": {
        "href": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9199.htm",
        "title": "Migration Regulation Decree (Decree No. 9.199/2017)",
        "description": "Regulatory decree used to interpret procedures, authorities, documentation logic, and migration administration.",
    },
    "LGPD": {
        "href": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
        "title": "LGPD (Law No. 13.709/2018)",
        "description": "Brazilian General Data Protection Law, relevant to privacy, lawful bases, rights, and data governance.",
    },
    "ANPD FAQ": {
        "href": "https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes/perguntas-frequentes",
        "title": "ANPD Frequently Asked Questions",
        "description": "National Data Protection Authority guidance on data-subject rights, interpretation, and compliance.",
    },
    "ANPD petition route": {
        "href": "https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao-titular-de-dados/denuncia-peticao-de-titular",
        "title": "ANPD Petition Route",
        "description": "Official ANPD route for data-subject petitions and complaints under the Brazilian privacy framework.",
    },
    "Decree No. 7.962/2013": {
        "href": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm",
        "title": "Decree No. 7.962/2013",
        "description": "Brazilian e-commerce decree governing transparency, information duties, and online consumer relations.",
    },
    "Ministry of Justice consumer guidance": {
        "href": "https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line",
        "title": "Ministry of Justice Consumer Guidance",
        "description": "Official guidance on withdrawal rights and online consumer protection in Brazil.",
    },
    "European Commission data protection overview": {
        "href": "https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en",
        "title": "European Commission GDPR Overview",
        "description": "Institutional European reference page explaining the GDPR framework and personal-data protections.",
    },
    "European Commission international transfers overview": {
        "href": "https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en",
        "title": "European Commission International Transfers Overview",
        "description": "Institutional reference page covering GDPR international-transfer context and adequacy decisions.",
    },
    "Gov.br accessibility page": {
        "href": "https://www.gov.br/pt-br/acessibilidade",
        "title": "Gov.br Accessibility",
        "description": "Government accessibility page covering digital inclusion and access standards in the Brazilian public environment.",
    },
    "Governo Digital accessibility tools": {
        "href": "https://www.gov.br/governodigitallogin/pt-br/acessibilidade-e-usuario/acessibilidade-digital/ferramentas",
        "title": "Governo Digital Accessibility Tools",
        "description": "Official digital-government accessibility tools and support references.",
    },
    "Governo Digital accessibility guide": {
        "href": "https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/guiaboaspraaticasparaacessibilidadedigital.pdf",
        "title": "Governo Digital Accessibility Guide",
        "description": "Official digital accessibility guide covering standards and practical implementation guidance.",
    },
    "Policia Federal immigration portal": {
        "href": "https://www.gov.br/pf/pt-br/assuntos/imigracao",
        "title": "Policia Federal Immigration Portal",
        "description": "Official federal police immigration portal for registration, migration procedures, and authority-side guidance.",
    },
}

LEGAL_NOTICE_ROUTE_MAP = {
    "Privacy Policy": "/legal/privacy/",
    "Cookies Policy": "/legal/cookies/",
    "Terms & Conditions": "/legal/terms/",
    "Payment Terms": "/legal/payment/",
    "Refund Policy": "/legal/refund/",
    "Form & Intake Policy": "/legal/form/",
    "GDPR Notice": "/legal/gdpr/",
    "LGPD Notice": "/legal/lgpd/",
    "Accessibility Statement": "/legal/accessibility/",
    "Disclaimer & Legal Notice": "/legal/disclaimer/",
    "Emergency Resources": "/legal/emergency/",
}

SEARCH_SHORTCUT_ROUTE_MAP = {
    "Services": "/services/",
    "Visas": "/services/visas/",
    "Residencies": "/services/residencies/",
    "Naturalisation": "/services/naturalisation/",
    "Defense": "/services/defense/",
    "About": "/about/about/",
    "Legal Hub": "/legal/",
    "Privacy Policy": "/legal/privacy/",
    "Payment Terms": "/legal/payment/",
    "Refund Policy": "/legal/refund/",
}

RECOVERY_ROUTE_MAP = {
    "Legal Hub": "/legal/",
    "Services": "/services/",
    "Consultation": "/services/advisory/consultation/",
    "About": "/about/about/",
    "Client pathways": "/about/clients/",
    "Search": "/legal/search/",
}


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


def strip_ticks(value: str) -> str:
    value = clean_text(value)
    if value.startswith("`") and value.endswith("`"):
        return value[1:-1]
    return value


def slug_from_route(route: str) -> str:
    if route == "/legal/":
        return "hub"
    return route.strip("/").split("/")[-1]


def route_dir(route: str) -> Path:
    if route == "/":
        return ROUTES_ROOT / "root"
    return ROUTES_ROOT / route.strip("/")


def page_key(route: str) -> str:
    return f"legal-{slug_from_route(route)}"


def title_suffix(title: str, route: str) -> str:
    if route == "/legal/404/":
        return "Page Not Found | Immigrate to Brazil"
    if route == "/legal/":
        return "Legal Notices | Immigrate to Brazil"
    return f"{title} | Legal Information | Immigrate to Brazil"


def noindex_route(route: str) -> bool:
    return route in {"/legal/search/", "/legal/404/"}


def body_class(route: str) -> str:
    slug = slug_from_route(route)
    if route == "/legal/":
        return "site-root page-legal-hub family-legal style-legal"
    return f"site-root page-legal-{slug} family-legal style-{slug}"


def render_inline(value: str) -> str:
    value = clean_text(value)
    escaped = html.escape(value, quote=False)
    escaped = re.sub(r"`([^`]+)`", lambda m: f"<code>{html.escape(clean_text(m.group(1)))}</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<strong>{html.escape(clean_text(m.group(1)))}</strong>", escaped)
    escaped = escaped.replace(
        EMAIL,
        f'<a href="mailto:{EMAIL}">{EMAIL}</a>',
    )
    escaped = escaped.replace(
        PHONE,
        f'<a href="https://wa.me/5543991324028?text=Hello%2C%20Immigrate%20to%20Brazil%20team!">{PHONE}</a>',
    )
    return escaped


LIST_RE = re.compile(r"^(\s*)([-*]|\d+\.)\s+(.*)$")


def render_list(lines: list[str], start: int, indent: int = 0) -> tuple[str, int]:
    items: list[tuple[str, list[str] | None]] = []
    list_type = None
    i = start
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        match = LIST_RE.match(line)
        if not match:
            break
        current_indent = len(match.group(1))
        marker = match.group(2)
        text = match.group(3)
        if current_indent < indent:
            break
        if current_indent > indent:
            break
        if list_type is None:
            list_type = "ol" if marker.endswith(".") and marker[:-1].isdigit() else "ul"
        continuation: list[str] = []
        nested_html = None
        i += 1
        blank_gap = False
        while i < len(lines):
            next_line = lines[i]
            if not next_line.strip():
                blank_gap = True
                i += 1
                continue
            next_match = LIST_RE.match(next_line)
            if next_match and len(next_match.group(1)) == indent:
                break
            if next_match and len(next_match.group(1)) > indent:
                nested_html, i = render_list(lines, i, len(next_match.group(1)))
                continue
            if blank_gap:
                break
            continuation.append(clean_text(next_line.strip()))
            i += 1
        item_text = text
        if continuation:
            item_text = f"{text} {' '.join(continuation)}"
        items.append((item_text, [nested_html] if nested_html else None))
    tag = list_type or "ul"
    html_items = []
    for text, nested in items:
        inner = render_inline(text)
        if nested:
            inner += "".join(nested)
        html_items.append(f"<li>{inner}</li>")
    return f"<{tag}>\n{''.join(html_items)}\n</{tag}>", i


def render_markdownish(source: str) -> tuple[str, str | None]:
    lines = [line.rstrip() for line in source.strip().splitlines()]
    blocks: list[str] = []
    strap = None
    i = 0
    while i < len(lines):
        raw_line = lines[i]
        line = clean_text(raw_line.strip())
        if not line:
            i += 1
            continue
        if line.startswith("**Lead:**"):
            strap = strip_ticks(line.split("**Lead:**", 1)[1].strip())
            i += 1
            continue
        if line.startswith("**Strap:**"):
            strap = strip_ticks(line.split("**Strap:**", 1)[1].strip())
            i += 1
            continue
        line_match = LIST_RE.match(raw_line)
        if line_match:
            list_html, i = render_list(lines, i, len(line_match.group(1)))
            blocks.append(list_html)
            continue
        paragraph_lines = [line]
        i += 1
        while i < len(lines):
            next_line = clean_text(lines[i].strip())
            if not next_line:
                break
            if next_line.startswith("**Lead:**") or next_line.startswith("**Strap:**") or LIST_RE.match(lines[i]):
                break
            paragraph_lines.append(next_line)
            i += 1
        paragraph = " ".join(paragraph_lines)
        blocks.append(f"<p>{render_inline(paragraph)}</p>")
    return "\n".join(blocks), strap


def parse_cards(block: str) -> list[dict[str, str]]:
    cards = []
    lines = [line.rstrip() for line in block.strip().splitlines() if line.strip()]
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("- "):
            label = strip_ticks(line[2:].strip())
            value = ""
            if i + 1 < len(lines) and lines[i + 1].startswith("  - "):
                value = strip_ticks(lines[i + 1].strip()[2:].strip())
                i += 1
            cards.append({"label": label, "value": value})
        i += 1
    return cards


def parse_hero(block: str) -> dict:
    hero = {"badges": []}
    lines = [line.rstrip() for line in block.strip().splitlines() if line.strip()]
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("- Hero badges:"):
            i += 1
            while i < len(lines) and lines[i].startswith("  - "):
                hero["badges"].append(strip_ticks(lines[i].strip()[2:].strip()))
                i += 1
            continue
        if line.startswith("- "):
            if ":" not in line[2:]:
                i += 1
                continue
            key, value = line[2:].split(":", 1)
            hero[key.strip().lower().replace(" ", "_")] = strip_ticks(value.strip())
        i += 1
    return hero


def parse_faq(block: str) -> list[dict[str, str]]:
    items = []
    lines = [line.rstrip() for line in block.strip().splitlines() if line.strip()]
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("- "):
            question = strip_ticks(line[2:].strip())
            answer = ""
            if i + 1 < len(lines) and lines[i + 1].startswith("  - "):
                answer = strip_ticks(lines[i + 1].strip()[2:].strip())
                i += 1
            items.append({"question": question, "answer": answer})
        i += 1
    return items


def parse_list_block(block: str) -> list[str]:
    values = []
    for line in block.strip().splitlines():
        line = clean_text(line.rstrip())
        if line.startswith("- "):
            values.append(strip_ticks(line[2:].strip()))
    return values


def extract_block(content: str, start: str, end_markers: list[str]) -> str:
    start_idx = content.find(start)
    if start_idx == -1:
        return ""
    start_idx += len(start)
    end_positions = [content.find(marker, start_idx) for marker in end_markers if content.find(marker, start_idx) != -1]
    end_idx = min(end_positions) if end_positions else len(content)
    return content[start_idx:end_idx].strip()


def parse_sections(block: str) -> list[dict]:
    pattern = re.compile(
        r"^#### Section (?P<number>\d+)\. (?P<title>.+?)\n\n(?P<body>.*?)(?=^#### Section \d+\. |\Z)",
        re.M | re.S,
    )
    sections = []
    for match in pattern.finditer(block.strip()):
        sections.append(
            {
                "number": int(match.group("number")),
                "title": clean_text(match.group("title")),
                "body": clean_text(match.group("body").strip()),
            }
        )
    return sections


def parse_preview() -> list[dict]:
    text = PREVIEW_PATH.read_text(encoding="utf-8")
    pattern = re.compile(
        r"^## \d+\. `(?P<route>/[^`]+/)` (?P<label>.+?)\n(?P<body>.*?)(?=^---\n\n## \d+\. `|^## 15\. |\Z)",
        re.M | re.S,
    )
    pages = []
    for match in pattern.finditer(text):
        route = match.group("route")
        content = match.group("body")
        hero_block = extract_block(content, "#### Hero\n\n", ["#### Hero glance cards"])
        glance_block = extract_block(content, "#### Hero glance cards\n\n", ["### Main content"])
        main_block = extract_block(content, "### Main content\n\n", ["### FAQ block", "### Internal links", "### Official resources"])
        faq_block = extract_block(content, "### FAQ block\n\n", ["### Internal links", "### Official resources"])
        internal_block = extract_block(content, "### Internal links\n\n", ["### Official resources", "---"])
        resources_block = extract_block(content, "### Official resources\n\n", ["---"])
        hero = parse_hero(hero_block)
        pages.append(
            {
                "route": route,
                "label": clean_text(match.group("label")),
                "hero": hero,
                "glance_cards": parse_cards(glance_block),
                "sections": parse_sections(main_block),
                "faq": parse_faq(faq_block) if faq_block else [],
                "internal_links": parse_list_block(internal_block) if internal_block else [],
                "official_resources": parse_list_block(resources_block) if resources_block else [],
            }
        )
    return pages


def existing_route_data() -> dict[str, dict]:
    data = {}
    for path in ROUTES_ROOT.rglob("page.json"):
        route = "/" + str(path.parent.relative_to(ROUTES_ROOT)).replace("\\", "/").strip("/") + "/"
        if route == "/root/":
            route = "/"
        data[route] = json.loads(path.read_text(encoding="utf-8"))
    return data


def hero_image_for(route: str, existing: dict[str, dict]) -> dict:
    if route in existing:
        page = existing[route]
        return {
            "src": page["meta"]["preloadImage"],
            "og_alt": page["social"]["ogImageAlt"],
        }
    return {
        "src": "/assets/images/heroes/legal/brazil-brasilia-national-congress-gdpr.webp",
        "og_alt": "Hero image for the Legal Notices page showing the National Congress complex in Brasilia in central-west Brazil.",
    }


def route_title_for_related(route: str, preview_pages: dict[str, dict], existing: dict[str, dict]) -> tuple[str, str]:
    if route in preview_pages:
        title = preview_pages[route]["hero"].get("h1", preview_pages[route]["label"])
        desc = preview_pages[route]["hero"].get("summary", "")
        return title, desc
    if route in existing:
        page = existing[route]
        title = page.get("runtime", {}).get("pageTitle") or page.get("meta", {}).get("title", "").split("|")[0].strip()
        desc = page.get("meta", {}).get("description", "")
        return title, desc
    label = route.strip("/").split("/")[-1].replace("-", " ").title() or "Home"
    return label, f"Go to {label} within the Immigrate to Brazil platform."


def route_card(route: str, preview_pages: dict[str, dict], existing: dict[str, dict]) -> dict:
    title, description = route_title_for_related(route, preview_pages, existing)
    image = hero_image_for(route, existing)
    return {
        "href": route,
        "title": title,
        "description": description,
        "image_src": image["src"],
        "image_alt": image["og_alt"],
    }


def hero_action_href(label: str, route: str) -> str:
    mapping = {
        "Review legal notices": "#legal-notices-menu",
        "Start consultation": "/start-consultation/",
        "Submit a privacy request": "#consultation-form",
        "View LGPD notice": "/legal/lgpd/",
        "Read privacy policy": "/legal/privacy/",
        "Open accessibility statement": "/legal/accessibility/",
        "Open disclaimer": "/legal/disclaimer/",
        "Payment support": "#consultation-form",
        "Open refund policy": "/legal/refund/",
        "Request refund review": "#consultation-form",
        "Open payment terms": "/legal/payment/",
        "Complete the intake form": "/start-consultation/",
        "Read cookies policy": "/legal/cookies/",
        "Read terms": "/legal/terms/",
        "Open terms": "/legal/terms/",
        "Open search": "/legal/search/",
        "View LGPD notice": "/legal/lgpd/",
        "Open LGPD notice": "/legal/lgpd/",
        "Send LGPD request": "#consultation-form",
        "Report accessibility issue": "#consultation-form",
        "Request alternative access": f"mailto:{EMAIL}",
        "Contact emergency line": WHATSAPP_URL,
        "View defense services": "/services/defense/",
        "Open legal hub": "/legal/",
        "Go Home": "/",
        "Complete intake form": "/start-consultation/",
        "Submit privacy request": "#consultation-form",
        "Read disclaimer": "/legal/disclaimer/",
        "Send payment enquiry": "#consultation-form",
    }
    if label in {"Search the site", "Search"}:
        return "#site-search" if route == "/legal/search/" else "/legal/search/"
    return mapping.get(label, "/start-consultation/")


def end_cta_heading(route: str) -> str:
    if route == "/legal/404/":
        return "Need the correct next route?"
    if route == "/legal/search/":
        return "Need a direct next step?"
    if route == "/legal/emergency/":
        return "Need direct operational contact?"
    return "Need case-specific guidance?"


def end_cta_text(route: str) -> str:
    if route == "/legal/404/":
        return (
            "A missing page should not interrupt the next useful step. Use consultation if the matter needs structured assessment, "
            "or contact us on WhatsApp if the route problem affects timing or an active matter."
        )
    if route == "/legal/search/":
        return (
            "Search helps reduce route friction. Consultation becomes the better step when the issue is clear but the correct route, records, "
            "or sequence still need case-specific assessment."
        )
    if route == "/legal/emergency/":
        return (
            "Emergency guidance is triage guidance. Use consultation when the matter requires structured review, and use WhatsApp when urgent operational context "
            "must be communicated quickly."
        )
    return (
        "These legal notices define how Immigrate to Brazil operates. Consultation applies that framework to your chronology, documents, timing, and next legal or procedural step."
    )


def render_brand_wordmark(inverse: bool = False, seo_alt: str | None = None) -> str:
    classes = "brand-wordmark hero-brand-lockup"
    if inverse:
        classes += " brand-wordmark--inverse"
    alt = seo_alt or "Immigrate to Brazil logo for immigration advisory, legal compliance guidance, and consultation support in Brazil"
    return (
        f'<span class="{classes}" aria-label="Immigrate to Brazil brand wordmark and logo">'
        f'<img class="brand-wordmark__mark" src="{LOGO_TRANSPARENT if inverse else LOGO_MAIN}" '
        f'alt="{html.escape(alt)}" width="56" height="56" loading="lazy" decoding="async" />'
        '<span class="brand-wordmark__text">'
        '<span class="brand-wordmark__line brand-wordmark__line--top">Immigrate</span>'
        '<span class="brand-wordmark__line brand-wordmark__line--bottom">to Brazil</span>'
        "</span>"
        "</span>"
    )


def render_hero(page: dict, image: dict) -> str:
    hero = page["hero"]
    primary = hero_action_href(hero.get("primary_cta", "Start consultation"), page["route"])
    secondary = hero_action_href(hero.get("secondary_cta", "Read privacy policy"), page["route"])
    signals = hero.get("badges", [])[:2]
    signals = signals if signals else ["Structured legal notice", "Case-specific support available"]
    seo_alt = f"Immigrate to Brazil logo for the {hero.get('h1', page['label'])} page, Brazil immigration advisory, consultation, and legal compliance guidance"
    glance_html = "\n".join(
        f"""<article class="hero-glance-card">
            <span>{html.escape(card['label'])}</span>
            <strong>{render_inline(card['value'])}</strong>
          </article>"""
        for card in page["glance_cards"]
    )
    badges_html = "".join(
        f'<span class="hero-badge"><span class="hero-badge__icon" aria-hidden="true">{COMPASS_ICON}</span><span>{html.escape(badge)}</span></span>'
        for badge in hero.get("badges", [])
    )
    signals_html = "".join(
        f"""<li class="hero-panel-item">
              <span class="hero-panel-item__icon" aria-hidden="true">{COMPASS_ICON}</span>
              <span>{html.escape(signal)}</span>
            </li>"""
        for signal in signals
    )
    return f"""
<header class="hero" style="--hero-image:url('{image['src']}')">
      <img class="hero-media" src="{image['src']}" alt="{html.escape(image['og_alt'])}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" />
    <div class="hero-overlay"></div>
<div class="container hero-inner">
      <div class="hero-copy">
        <div class="hero-copy__lead">
          <p class="eyebrow">{html.escape(hero.get('eyebrow', 'LEGAL'))}</p>
          <p class="hero-kicker">{html.escape(hero.get('kicker', 'Legal notices and operating rules'))}</p>
        </div>
        <h1>{html.escape(hero.get('h1', page['label']))}</h1>
        <p class="hero-summary">{html.escape(hero.get('summary', ''))}</p>
        <div class="hero-badges" aria-label="Page highlights">
          {badges_html}
        </div>
<div class="hero-actions">
          <a class="btn btn-cta" href="{primary}" data-cta-click="true">{html.escape(hero.get('primary_cta', 'Start consultation'))}</a>
          <a class="btn btn-secondary" href="{secondary}">{html.escape(hero.get('secondary_cta', 'Read privacy policy'))}</a>
        </div>
      </div>
<div class="hero-meta">
        <div class="hero-panel hero-panel--brand">
          {render_brand_wordmark(inverse=True, seo_alt=seo_alt)}
          <p class="hero-brand-tagline">Supporting Immigrants - Promoting Brazil</p>
          <p class="hero-brand-note">{html.escape(hero.get('brand_note', ''))}</p>
        </div>
<div class="hero-panel hero-panel--signals">
          <strong>Positioning</strong>
          <ul class="hero-panel-list">
            {signals_html}
          </ul>
        </div>
      </div>
    </div>
<div class="container hero-glance">
      {glance_html}
    </div>
  </header>
""".strip()


def render_intro(section: dict) -> str:
    body_html, strap = render_markdownish(section["body"])
    lead = strap or section["title"]
    return f"""
          <section class="content-block intro-block" id="section-{section['number']}-{slugify(section['title'])}">
            <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>{html.escape(section['title'])}</span></h2>
            <p class="lead">{render_inline(lead)}</p>
  {body_html}
          </section>
""".rstrip()


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", clean_text(value).lower()).strip("-")
    return slug or "section"


def render_standard_section(section: dict, variant: str) -> str:
    body_html, strap = render_markdownish(section["body"])
    strap_html = f'<p class="section-strap">{render_inline(strap)}</p>' if strap else ""
    return f"""
  <section class="content-block flow-section topic-section topic-section--{variant}" id="section-{section['number']}-{slugify(section['title'])}" data-topic="{html.escape(section['title'])}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Section {section['number']:02d}</p>
        <h2>{html.escape(section['title'])}</h2>
        {strap_html}
      </div>
<div class="topic-section__body">
        {body_html}
      </div>
    </div>
  </section>
""".rstrip()


def render_info_cards(title: str, strap: str, cards: list[dict], anchor_id: str) -> str:
    card_items = []
    for card in cards:
        href = card["href"]
        description = render_inline(card["description"])
        image_src = card.get("image_src", LOGO_MAIN)
        image_alt = card.get(
            "image_alt",
            f"Immigrate to Brazil logo associated with the {card['title']} route, legal navigation, compliance guidance, and consultation support",
        )
        card_items.append(
            f"""<article class="info-card">
              <img src="{image_src}" alt="{html.escape(image_alt)}" width="640" height="360" loading="lazy" decoding="async" style="display:block;width:100%;height:160px;object-fit:cover;border-radius:1rem;margin-bottom:0.95rem;" />
              <img class="brand-wordmark__mark" src="{LOGO_MAIN}" alt="Immigrate to Brazil logo for legal navigation, consultation support, and compliance guidance" width="64" height="64" loading="lazy" decoding="async" />
              <h3>{html.escape(card['title'])}</h3>
              <p>{description}</p>
              <p><a class="btn btn-secondary btn-sm" href="{href}">Open page</a></p>
            </article>"""
        )
    return f"""
  <section class="content-block highlight-block" id="{anchor_id}">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>{html.escape(title)}</span></h2>
      <p>{render_inline(strap)}</p>
      <div class="card-grid compact">
        {''.join(card_items)}
      </div>
    </section>
""".rstrip()


def render_search_block() -> str:
    return f"""
  <section class="content-block search-results-shell" id="site-search">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{COMPASS_ICON}</span><span>Search the site</span></h2>
      <form class="search-inline-form" action="/legal/search/" method="GET" data-search-form="true">
        <label class="visually-hidden" for="legal-search-query">Search term</label>
        <input id="legal-search-query" name="q" type="search" placeholder="Search this site" required />
        <button type="submit">
          <span class="search-inline-form__submit-icon" aria-hidden="true">{COMPASS_ICON}</span>
          <span>Search</span>
        </button>
      </form>
<div id="search-results" data-search-results="true" aria-live="polite"></div>
    </section>
""".rstrip()


def render_faq(page: dict) -> str:
    if not page["faq"]:
        return ""
    items = []
    page_id = page_key(page["route"])
    for index, item in enumerate(page["faq"]):
        expanded = "true" if index == 0 else "false"
        collapsed = "" if index == 0 else "collapsed"
        show = "show" if index == 0 else ""
        items.append(
            f"""<div class="accordion-item">
            <h3 class="accordion-header" data-faq-question="true">
              <button class="accordion-button {collapsed}" type="button" data-bs-toggle="collapse" data-bs-target="#faq-{page_id}-{index}" aria-expanded="{expanded}">
                {html.escape(item['question'])}
              </button>
            </h3>
            <div id="faq-{page_id}-{index}" class="accordion-collapse collapse {show}" data-bs-parent="#faq-accordion-{page_id}">
              <div class="accordion-body">{render_inline(item['answer'])}</div>
            </div>
          </div>"""
        )
    return f"""
  <section class="faq-block" id="faq" data-faq="true">
    <div class="section-head">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{FAQ_ICON}</span><span>Frequently asked questions</span></h2>
      <p>Short answers about how Immigrate to Brazil handles this topic and what clients usually need to know before proceeding.</p>
    </div>
<div class="accordion" id="faq-accordion-{page_id}">
      {''.join(items)}
    </div>
  </section>
""".rstrip()


def render_end_cta(route: str, title: str) -> str:
    logo_alt = (
        f"Immigrate to Brazil logo for {title.lower()}, Brazil immigration consultation, legal compliance guidance, and case-specific advisory support"
    )
    return f"""
  <section class="lead-form-block" id="consultation-form">
    <div class="section-head">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>{html.escape(end_cta_heading(route))}</span></h2>
      <p>{html.escape(end_cta_text(route))}</p>
    </div>
    <div class="card-grid compact">
      <article class="info-card">
        <img class="brand-wordmark__mark" src="{LOGO_MAIN}" alt="{html.escape(logo_alt)}" width="72" height="72" loading="lazy" decoding="async" />
        <h3>Immigrate to Brazil</h3>
        <p>Professional, transparent, immigrant-friendly support built around chronology, documentation, compliance, and controlled next steps.</p>
      </article>
      <article class="info-card">
        <h3>Book consultation</h3>
        <p>Move from public legal notice to case-specific route assessment, document review, and strategy.</p>
        <p><a class="btn btn-cta btn-sm" href="/start-consultation/" data-cta-click="true">Start Consultation</a></p>
      </article>
      <article class="info-card">
        <h3>Contact on WhatsApp</h3>
        <p>Use WhatsApp if you need faster operational clarification, urgency signaling, or routing support.</p>
        <p><a class="btn btn-secondary btn-sm" href="{WHATSAPP_URL}">WhatsApp</a></p>
      </article>
    </div>
  </section>
""".rstrip()


def render_main_sections(page: dict, preview_pages: dict[str, dict], existing: dict[str, dict]) -> str:
    sections = page["sections"]
    pieces = [render_intro(sections[0])]
    if page["route"] == "/legal/search/":
        pieces.append(render_search_block())

    variants = ["frame", "band", "split"]
    for offset, section in enumerate(sections[1:], start=1):
        title = section["title"]
        lower_title = title.lower()
        anchor_id = f"section-{section['number']}-{slugify(title)}"
        if page["route"] == "/legal/" and lower_title == "legal notices menu":
            cards = []
            for label, route in LEGAL_NOTICE_ROUTE_MAP.items():
                card = route_card(route, preview_pages, existing)
                card["title"] = label
                cards.append(card)
            strap = "Each legal page governs a specific operational area."
            pieces.append(render_info_cards(title, strap, cards, "legal-notices-menu"))
            continue
        if page["route"] == "/legal/search/" and lower_title == "route shortcuts":
            cards = []
            for label, route in SEARCH_SHORTCUT_ROUTE_MAP.items():
                card = route_card(route, preview_pages, existing)
                card["title"] = label
                cards.append(card)
            pieces.append(render_info_cards(title, "Use verified shortcuts that point to actual pages inside the current site structure.", cards, anchor_id))
            continue
        if page["route"] == "/legal/404/" and lower_title == "recovery routes":
            cards = []
            for label, route in RECOVERY_ROUTE_MAP.items():
                description_map = {
                    "Legal Hub": "Access legal pages, policies, and compliance structure.",
                    "Services": "Overview of immigration pathways and execution support.",
                    "Consultation": "Entry point for case-specific assessment and guidance.",
                    "About": "Methodology and service structure.",
                    "Client pathways": "Relevant information for ongoing or new matters.",
                    "Search": "Locate specific content within the current structure.",
                }
                card = route_card(route, preview_pages, existing)
                card["title"] = label
                card["description"] = description_map[label]
                cards.append(card)
            pieces.append(render_info_cards(title, "Use verified recovery routes instead of trial-and-error navigation.", cards, anchor_id))
            continue
        pieces.append(render_standard_section(section, variants[(offset - 1) % len(variants)]))
    return "\n\n".join(pieces)


def render_body(page: dict, image: dict, preview_pages: dict[str, dict], existing: dict[str, dict]) -> str:
    hero_html = render_hero(page, image)
    main_sections = render_main_sections(page, preview_pages, existing)
    faq_html = render_faq(page)
    end_cta = render_end_cta(page["route"], page["hero"].get("h1", page["label"]))
    include_disclaimer = page["route"] != "/legal/404/"
    disclaimer_html = '\n\n        <div data-partial="disclaimer"></div>' if include_disclaimer else ""
    return f"""


    <div data-partial="gtm-noscript"></div>

  <div data-partial="utility-bar"></div>

  <div data-partial="accessibility-panel"></div>

  <div data-partial="site-navigation"></div>

  <div data-partial="breadcrumbs"></div>

{hero_html}

  <!-- Section: Main Content -->
  <main id="main-content" class="site-main" data-page-key="{page_key(page['route'])}">
      <div class="container main-shell main-shell--intro">

        <!-- Section: Content Column -->
        <article class="content-column">

{main_sections}
        </article>

        <div data-partial="sidebar-shell"></div>
      </div>
<div class="container">
        <div data-partial="official-resources"></div>
  <div data-partial="related-links"></div>
{faq_html}

{end_cta}{disclaimer_html}
      </div>
    </main>

        <div data-partial="site-footer"></div>

  <div data-partial="floating-whatsapp"></div>

  <div data-partial="back-to-top"></div>
  <div data-partial="cookie-banner"></div>
""".rstrip() + "\n"


def build_shell(page: dict, preview_pages: dict[str, dict], existing: dict[str, dict]) -> dict:
    title = page["hero"].get("h1", page["label"])
    shell = {
        "breadcrumbs": [
            {"label": "Home", "href": "/"},
            {"label": title, "current": True},
        ],
        "sidebar": {
            "brand": {"note": page["hero"].get("brand_note", "")},
            "nextStep": {
                "lead": "Use consultation for case-specific review, or WhatsApp for operational clarification and route support.",
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
                "note": "Representation, filing strategy, and timing remain case-specific and follow review of chronology, documents, and procedural posture.",
            },
        },
        "officialResources": [RESOURCE_MAP[name] for name in page["official_resources"] if name in RESOURCE_MAP],
        "relatedLinks": [
            route_card(route, preview_pages, existing)
            for route in dict.fromkeys(page["internal_links"])
        ],
    }
    return shell


def build_page_json(page: dict, image: dict, preview_pages: dict[str, dict], existing: dict[str, dict]) -> dict:
    title = page["hero"].get("h1", page["label"])
    browser_title = title_suffix(title, page["route"])
    summary = page["hero"].get("summary", "")
    if page["route"] == "/legal/":
        runtime_title = "Legal Notices"
    elif page["route"] == "/legal/404/":
        runtime_title = "Page Not Found"
    else:
        runtime_title = title
    robots = "noindex,follow" if noindex_route(page["route"]) else "index,follow"
    return {
        "route": page["route"],
        "lang": "en",
        "bodyClass": body_class(page["route"]),
        "meta": {
            "themeColor": THEME_COLOR,
            "description": summary,
            "robots": robots,
            "title": browser_title,
            "preloadImage": image["src"],
        },
        "social": {
            "ogType": "website",
            "ogTitle": browser_title,
            "ogDescription": summary,
            "ogImage": f"https://immigratetobrazil.com{image['src']}",
            "ogImageAlt": image["og_alt"],
            "twitterCard": "summary_large_image",
            "twitterTitle": browser_title,
            "twitterDescription": summary,
            "twitterImage": f"https://immigratetobrazil.com{image['src']}",
            "twitterImageAlt": image["og_alt"],
        },
        "runtime": {
            "pageTitle": runtime_title,
            "pageFamily": "legal",
        },
        "shell": build_shell(page, preview_pages, existing),
    }


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    pages = parse_preview()
    preview_pages = {page["route"]: page for page in pages}
    existing = existing_route_data()

    for page in pages:
        route = page["route"]
        page_dir = route_dir(route)
        page_dir.mkdir(parents=True, exist_ok=True)
        image = hero_image_for(route, existing)
        body_html = render_body(page, image, preview_pages, existing)
        page_json = build_page_json(page, image, preview_pages, existing)
        (page_dir / "body.html").write_text(body_html, encoding="utf-8")
        write_json(page_dir / "page.json", page_json)
        existing[route] = page_json

    print(f"Rewrote {len(pages)} legal routes from the approved preview.")


if __name__ == "__main__":
    main()
