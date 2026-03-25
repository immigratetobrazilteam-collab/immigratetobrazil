#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREVIEW_PATH = ROOT / "docs" / "about-pages-client-preview.md"
ROUTES_ROOT = ROOT / "content" / "en" / "routes"
ABOUT_ROOT = ROUTES_ROOT / "about"

THEME_COLOR = "#6F4E8C"
EMAIL = "immigratetobrazilteam@gmail.com"
PHONE = "+55 43 99132-4028"
WHATSAPP_URL = "https://wa.me/5543991324028?text=Hello%2C%20Immigrate%20to%20Brazil%20team!"
LOGO_MAIN = "/assets/logo/immigrate-to-brazil-logo.png"
LOGO_TRANSPARENT = "/assets/logo/immigrate-to-brazil-logo-transparent.png"

ACTIVE_ROUTES = [
    "/about/",
    "/about/profile/",
    "/about/about/",
    "/about/mission/",
    "/about/philosophy/",
    "/about/story/",
    "/about/values/",
    "/about/lawyer/",
    "/about/whyus/",
    "/about/results/",
    "/about/stories/",
    "/about/clients/",
    "/about/testimonials/",
    "/about/ethics/",
]

REMOVED_ROUTES = [
    "/about/governance/",
    "/about/compliance/",
    "/about/standards/",
    "/about/regulatory/",
]

RELATED_REPLACEMENTS = {
    "/about/governance/": "/about/profile/",
    "/about/compliance/": "/about/ethics/",
    "/about/standards/": "/about/values/",
    "/about/regulatory/": "/about/lawyer/",
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
ROUTE_BLOCK_RE = re.compile(
    r"^## `(?P<route>/about(?:/[^`]+)?/)` (?P<label>.+?)\n(?P<body>.*?)(?=^## `|^## Removal Notes|\Z)",
    re.M | re.S,
)
SECTION_RE = re.compile(
    r"^#### Section (?P<number>\d+)\. (?P<title>.+?)\n\n(?P<body>.*?)(?=^#### Section \d+\. |\Z)",
    re.M | re.S,
)
GENERIC_SECTION_RE = re.compile(
    r"^#{3,4} Section (?P<number>\d+)\. (?P<title>.+?)\n\n(?P<body>.*?)(?=^#{3,4} Section \d+\. |\Z)",
    re.M | re.S,
)

RESOURCE_MAP = {
    "Brazilian Migration Law": {
        "title": "Brazilian Migration Law (Law No. 13.445/2017)",
        "description": "Primary statutory framework for migration, admission, residence, rights, duties, and administrative measures in Brazil.",
    },
    "Migration Regulation Decree": {
        "title": "Migration Regulation Decree (Decree No. 9.199/2017)",
        "description": "Regulatory decree used to interpret procedures, authorities, documentation logic, and migration administration.",
    },
    "Policia Federal immigration portal": {
        "title": "Policia Federal Immigration Portal",
        "description": "Official federal police immigration portal for migration procedures, registration guidance, and authority-side updates.",
    },
    "Ministry of Justice immigration portal": {
        "title": "Migration Portal - Ministry of Justice",
        "description": "Official Ministry of Justice migration portal with immigration guidance, institutional references, and route-level public information.",
    },
}

CHIP_ROUTE_MAP = {
    "profile": "/about/profile/",
    "about": "/about/about/",
    "mission": "/about/mission/",
    "philosophy": "/about/philosophy/",
    "story": "/about/story/",
    "values": "/about/values/",
    "lawyer": "/about/lawyer/",
    "why us": "/about/whyus/",
    "results": "/about/results/",
    "stories": "/about/stories/",
    "clients": "/about/clients/",
    "testimonials": "/about/testimonials/",
    "ethics": "/about/ethics/",
    "services": "/services/",
    "visas": "/services/visas/",
    "naturalisation": "/services/naturalisation/",
    "services defense": "/services/defense/",
    "legal form": "/legal/form/",
    "legal terms": "/legal/terms/",
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
    if route == "/about/":
        return "hub"
    return route.strip("/").split("/")[-1]


def route_dir(route: str) -> Path:
    if route == "/about/":
        return ABOUT_ROOT
    return ABOUT_ROOT / slug_from_route(route)


def body_class(route: str) -> str:
    slug = slug_from_route(route)
    style = "style-lawyer" if slug == "lawyer" else "style-about"
    page_slug = "about-hub" if route == "/about/" else f"about-{slug}"
    return f"site-root page-{page_slug} family-about {style}"


def route_url(route: str) -> str:
    return "https://immigratetobrazil.com" if route == "/" else f"https://immigratetobrazil.com{route}"


def route_to_pt(route: str) -> str:
    return "/pt-br/" if route == "/" else f"/pt-br{route}"


def slugify(value: str) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def ensure_ascii_json(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def render_inline(value: str) -> str:
    value = clean_text(value)
    escaped = html.escape(value, quote=False)
    escaped = re.sub(r"`([^`]+)`", lambda m: f"<code>{html.escape(clean_text(m.group(1)))}</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<strong>{html.escape(clean_text(m.group(1)))}</strong>", escaped)
    escaped = escaped.replace(EMAIL, f'<a href="mailto:{EMAIL}">{EMAIL}</a>')
    escaped = escaped.replace(PHONE, f'<a href="{WHATSAPP_URL}">{PHONE}</a>')
    return escaped


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
        if line.startswith("Lead:"):
            strap = strip_ticks(line.split("Lead:", 1)[1].strip())
            if not strap:
                i += 1
                while i < len(lines):
                    nxt = clean_text(lines[i].strip())
                    if not nxt:
                        i += 1
                        continue
                    strap = strip_ticks(nxt)
                    i += 1
                    break
                continue
            i += 1
            continue
        if line.startswith("Strap:"):
            strap = strip_ticks(line.split("Strap:", 1)[1].strip())
            if not strap:
                i += 1
                while i < len(lines):
                    nxt = clean_text(lines[i].strip())
                    if not nxt:
                        i += 1
                        continue
                    strap = strip_ticks(nxt)
                    i += 1
                    break
                continue
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
            if next_line.startswith("Lead:") or next_line.startswith("Strap:") or LIST_RE.match(lines[i]):
                break
            paragraph_lines.append(next_line)
            i += 1
        blocks.append(f"<p>{render_inline(' '.join(paragraph_lines))}</p>")
    return "\n".join(blocks), strap


def extract_block(content: str, start: str, end_markers: list[str]) -> str:
    start_idx = content.find(start)
    if start_idx == -1:
        return ""
    start_idx += len(start)
    end_positions = []
    for marker in end_markers:
        idx = content.find(marker, start_idx)
        if idx != -1:
            end_positions.append(idx)
    end_idx = min(end_positions) if end_positions else len(content)
    return content[start_idx:end_idx].strip()


def parse_hero(block: str) -> dict:
    hero = {"chips": []}
    lines = [line.rstrip() for line in block.strip().splitlines() if line.strip()]
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line == "Hero chips:":
            i += 1
            while i < len(lines) and lines[i].strip().startswith("- "):
                hero["chips"].append(strip_ticks(lines[i].strip()[2:].strip()))
                i += 1
            continue
        if ":" in line:
            key, value = line.split(":", 1)
            value = strip_ticks(value.strip())
            if not value:
                collected = []
                i += 1
                while i < len(lines):
                    nxt = lines[i].strip()
                    if not nxt:
                        if collected:
                            break
                        i += 1
                        continue
                    if nxt == "Hero chips:" or re.match(r"^[A-Za-z][A-Za-z /&-]*:\s*", nxt):
                        i -= 1
                        break
                    collected.append(strip_ticks(nxt))
                    i += 1
                value = " ".join(collected)
            hero[key.strip().lower()] = value
        i += 1
    return hero


def parse_end_cta(block: str) -> dict:
    result = {}
    lines = [line.rstrip() for line in block.strip().splitlines()]
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or ":" not in line:
            i += 1
            continue
        key, value = line.split(":", 1)
        value = strip_ticks(value.strip())
        if not value:
            collected = []
            i += 1
            while i < len(lines):
                nxt = lines[i].strip()
                if not nxt:
                    if collected:
                        break
                    i += 1
                    continue
                if re.match(r"^[A-Za-z][A-Za-z /&-]*:\s*", nxt):
                    i -= 1
                    break
                collected.append(strip_ticks(nxt))
                i += 1
            value = " ".join(collected)
        result[key.strip().lower().replace(" ", "_")] = value
        i += 1
    return result


def parse_sections_from_pattern(block: str, pattern: re.Pattern[str]) -> list[dict]:
    sections = []
    for match in pattern.finditer(block.strip()):
        body_html, strap = render_markdownish(match.group("body").strip())
        sections.append(
            {
                "number": int(match.group("number")),
                "title": clean_text(match.group("title")),
                "strap": strap,
                "raw": match.group("body").strip(),
                "html": body_html,
            }
        )
    return sections


def parse_sections(block: str) -> list[dict]:
    return parse_sections_from_pattern(block, SECTION_RE)


def parse_links(block: str) -> list[str]:
    values = []
    for raw in block.strip().splitlines():
        line = raw.strip()
        if line.startswith("- "):
            values.append(strip_ticks(line[2:].strip()))
    return values


def parse_resources(block: str) -> list[dict]:
    resources = []
    for raw in block.strip().splitlines():
        line = raw.strip()
        if not line.startswith("- "):
            continue
        match = re.match(r"- (.+?) - `(.+?)`$", line)
        if not match:
            continue
        label = clean_text(match.group(1))
        href = clean_text(match.group(2))
        resource = RESOURCE_MAP.get(label, {"title": label, "description": f"Official public reference for {label.lower()}."}).copy()
        resource["href"] = href
        resources.append(resource)
    return resources


def parse_preview() -> dict[str, dict]:
    text = PREVIEW_PATH.read_text(encoding="utf-8")
    pages = {}
    for match in ROUTE_BLOCK_RE.finditer(text):
        route = match.group("route")
        if route not in ACTIVE_ROUTES:
            continue
        body = match.group("body")
        hero = parse_hero(extract_block(body, "### Hero preview\n\n", ["### Main content", "### Section 1. Overview"]))
        if route == "/about/":
            hub_sections = parse_sections_from_pattern(body, GENERIC_SECTION_RE)
            sections = [section for section in hub_sections if section["number"] <= 3]
            internal = parse_links(next((section["raw"] for section in hub_sections if section["number"] == 4), ""))
            resources = parse_resources(next((section["raw"] for section in hub_sections if section["number"] == 5), ""))
            end_cta = parse_end_cta(next((section["raw"] for section in hub_sections if section["number"] == 6), ""))
        else:
            main = extract_block(body, "### Main content\n\n", ["### Suggested internal links", "### Official resources", "### End CTA"])
            sections = parse_sections(main)
            internal = parse_links(extract_block(body, "### Suggested internal links\n\n", ["### Official resources", "### End CTA"]))
            resources = parse_resources(extract_block(body, "### Official resources\n\n", ["### End CTA", "## `", "## Removal Notes"]))
            end_cta = parse_end_cta(extract_block(body, "### End CTA\n\n", ["## `", "## Removal Notes", "## Recommended Approval Order"]))
        pages[route] = {
            "route": route,
            "label": clean_text(match.group("label")),
            "hero": hero,
            "sections": sections,
            "internal_links": internal,
            "resources": resources,
            "end_cta": end_cta,
        }
    missing = [route for route in ACTIVE_ROUTES if route not in pages]
    if missing:
        raise ValueError(f"Missing preview data for routes: {missing}")
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
    fallback = existing.get("/about/about/") or next(iter(existing.values()))
    page = existing.get(route, fallback)
    return {
        "src": page["meta"]["preloadImage"],
        "og_alt": page["social"]["ogImageAlt"],
    }


def route_title_desc(route: str, preview_pages: dict[str, dict], existing: dict[str, dict]) -> tuple[str, str]:
    if route in preview_pages:
        page = preview_pages[route]
        return page["hero"].get("title", page["label"]), page["hero"].get("summary", "")
    if route in existing:
        page = existing[route]
        title = page.get("runtime", {}).get("pageTitle") or page.get("meta", {}).get("title", "").split("|")[0].strip()
        description = page.get("meta", {}).get("description", "")
        return title, description
    label = route.strip("/").split("/")[-1].replace("-", " ").title() or "Home"
    return label, f"Go to {label} within the Immigrate to Brazil platform."


def route_card(route: str, preview_pages: dict[str, dict], existing: dict[str, dict]) -> dict:
    title, description = route_title_desc(route, preview_pages, existing)
    image = hero_image_for(route, existing)
    return {
        "href": route,
        "title": title,
        "description": description,
        "image_src": image["src"],
        "image_alt": image["og_alt"],
    }


def chip_href(label: str) -> str | None:
    return CHIP_ROUTE_MAP.get(clean_text(label).lower())


def hero_action_href(label: str) -> str:
    normalized = clean_text(label).lower()
    if "whatsapp" in normalized:
        return WHATSAPP_URL
    if "consultation" in normalized:
        return "/start-consultation/"
    return "/start-consultation/"


def render_brand_wordmark(inverse: bool = False, alt: str | None = None) -> str:
    classes = "brand-wordmark hero-brand-lockup"
    if inverse:
        classes += " brand-wordmark--inverse"
    image_src = LOGO_TRANSPARENT if inverse else LOGO_MAIN
    image_alt = alt or "Immigrate to Brazil logo for Brazil immigration advisory, relocation planning, and consultation support"
    return (
        f'<span class="{classes}" aria-label="Immigrate to Brazil brand wordmark and logo">'
        f'<img class="brand-wordmark__mark" src="{image_src}" alt="{html.escape(image_alt)}" width="56" height="56" loading="lazy" decoding="async" />'
        '<span class="brand-wordmark__text">'
        '<span class="brand-wordmark__line brand-wordmark__line--top">Immigrate</span>'
        '<span class="brand-wordmark__line brand-wordmark__line--bottom">to Brazil</span>'
        "</span>"
        "</span>"
    )


def derive_glance_cards(page: dict) -> list[dict]:
    if page["route"] == "/about/":
        return [
            {"label": "What this family covers", "value": "Profile, mission, philosophy, story, values, legal integration, client fit, and trust signals across the company."},
            {"label": "How to use it", "value": "Start with the hub, then move into the page that best matches the question you are trying to answer before engaging support."},
            {"label": "Best next move", "value": "Use consultation if you want the company method applied to your own chronology, route, and documentation context."},
        ]
    sections = page["sections"]
    cards = []
    for section in sections[:3]:
        cards.append(
            {
                "label": section["title"],
                "value": section["strap"] or f"Structured explanation of {section['title'].lower()} within the Immigrate to Brazil company profile.",
            }
        )
    while len(cards) < 3:
        cards.append({"label": "Next step", "value": "Consultation applies this page to your own case, timing, and documentation context."})
    return cards


def render_hero(page: dict, image: dict) -> str:
    hero = page["hero"]
    badges = hero.get("chips", [])[:6]
    badge_html = "".join(
        f'<a class="hero-badge" href="{chip_href(badge) or "/about/"}"><span class="hero-badge__icon" aria-hidden="true">{COMPASS_ICON}</span><span>{html.escape(badge)}</span></a>'
        for badge in badges
    )
    signal_html = "".join(
        f"""<li class="hero-panel-item">
              <span class="hero-panel-item__icon" aria-hidden="true">{COMPASS_ICON}</span>
              <span>{html.escape(signal)}</span>
            </li>"""
        for signal in (badges[:2] or ["Structured company profile", "Brazil-focused immigration support"])
    )
    glance_html = "\n".join(
        f"""<article class="hero-glance-card">
            <span>{html.escape(card['label'])}</span>
            <strong>{html.escape(card['value'])}</strong>
          </article>"""
        for card in derive_glance_cards(page)
    )
    logo_alt = f"Immigrate to Brazil logo for the {hero.get('title', page['label'])} page, Brazil immigration advisory, relocation planning, and consultation support"
    return f"""
<header class="hero" style="--hero-image:url('{image['src']}')">
      <img class="hero-media" src="{image['src']}" alt="{html.escape(image['og_alt'])}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" />
    <div class="hero-overlay"></div>
<div class="container hero-inner">
      <div class="hero-copy">
        <div class="hero-copy__lead">
          <p class="eyebrow">ABOUT</p>
          <p class="hero-kicker">{html.escape(hero.get('badge', 'About Immigrate to Brazil'))}</p>
        </div>
        <h1>{html.escape(hero.get('title', page['label']))}</h1>
        <p class="hero-summary">{html.escape(hero.get('summary', ''))}</p>
        <div class="hero-badges" aria-label="Page highlights">
          {badge_html}
        </div>
<div class="hero-actions">
          <a class="btn btn-cta" href="{hero_action_href(page['end_cta'].get('primary_cta', 'Book a consultation'))}" data-cta-click="true">{html.escape(page['end_cta'].get('primary_cta', 'Book a consultation'))}</a>
          <a class="btn btn-secondary" href="{hero_action_href(page['end_cta'].get('secondary_cta', 'Contact on WhatsApp'))}">{html.escape(page['end_cta'].get('secondary_cta', 'Contact on WhatsApp'))}</a>
        </div>
      </div>
<div class="hero-meta">
        <div class="hero-panel hero-panel--brand">
          {render_brand_wordmark(inverse=True, alt=logo_alt)}
          <p class="hero-brand-tagline">Supporting Immigrants - Promoting Brazil</p>
          <p class="hero-brand-note">{html.escape(hero.get('summary', ''))}</p>
        </div>
<div class="hero-panel hero-panel--signals">
          <strong>Positioning</strong>
          <ul class="hero-panel-list">
            {signal_html}
          </ul>
        </div>
      </div>
    </div>
<div class="container hero-glance">
      {glance_html}
    </div>
  </header>""".rstrip()


def render_intro(section: dict) -> str:
    lead_html = f'\n            <p class="lead">{html.escape(section["strap"])}</p>' if section.get("strap") else ""
    return f"""
          <section class="content-block intro-block" id="section-{section['number']}-{slugify(section['title'])}">
            <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>{html.escape(section['title'])}</span></h2>{lead_html}
            {section['html']}
          </section>""".rstrip()


def render_section(section: dict, variant: str) -> str:
    strap = f'\n        <p class="section-strap">{html.escape(section["strap"])}</p>' if section.get("strap") else ""
    return f"""
  <section class="content-block flow-section topic-section {variant}" id="section-{section['number']}-{slugify(section['title'])}" data-topic="{html.escape(section['title'])}">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Section {section['number']:02d}</p>
        <h2>{html.escape(section['title'])}</h2>{strap}
      </div>
      <div class="topic-section__body">
        {section['html']}
      </div>
    </div>
  </section>""".rstrip()


def render_hub_menu(preview_pages: dict[str, dict], existing: dict[str, dict]) -> str:
    cards = []
    for route in ACTIVE_ROUTES:
        if route == "/about/":
            continue
        card = route_card(route, preview_pages, existing)
        cards.append(
            f"""<article class="info-card">
              <img src="{card['image_src']}" alt="{html.escape(card['image_alt'])}" width="640" height="360" loading="lazy" decoding="async" style="display:block;width:100%;height:160px;object-fit:cover;border-radius:1rem;margin-bottom:0.95rem;" />
              <img class="brand-wordmark__mark" src="{LOGO_MAIN}" alt="Immigrate to Brazil logo for about-page navigation, company information, and Brazil immigration advisory support" width="64" height="64" loading="lazy" decoding="async" />
              <h3>{html.escape(card['title'])}</h3>
              <p>{html.escape(card['description'])}</p>
              <p><a class="btn btn-secondary btn-sm" href="{card['href']}">Open page</a></p>
            </article>"""
        )
    return """
  <section class="content-block highlight-block" id="about-menu">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{icon}</span><span>Explore the company</span></h2>
      <p>Use the About Hub as a structured menu into the company profile, method, people, and trust framework of Immigrate to Brazil.</p>
      <div class="card-grid compact">
        {cards}
      </div>
    </section>""".format(icon=SECTION_ICON, cards="".join(cards)).rstrip()


def render_about_hub_content(preview_pages: dict[str, dict], existing: dict[str, dict]) -> str:
    intro = f"""
          <section class="content-block intro-block" id="section-1-overview">
            <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>Overview</span></h2>
            <p class="lead">About is where we explain the company behind the process.</p>
            <p>This hub brings together the full About family of Immigrate to Brazil so visitors can understand who we are, how we work, what defines our method, how legal and advisory stages connect, and why our process is built around clarity, structure, and disciplined progression.</p>
            <p>Immigration decisions are easier to assess when the company behind them is visible. This hub is designed to make that visibility practical. It gives you a structured route into our profile, mission, philosophy, story, values, legal structure, client fit, and trust framework before you rely on us for anything case-specific.</p>
          </section>""".rstrip()
    section_two = f"""
  <section class="content-block flow-section topic-section topic-section--split" id="section-2-explore-the-company" data-topic="Explore the company">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Section 02</p>
        <h2>Explore the company</h2>
        <p class="section-strap">Use the pages below as a structured company menu.</p>
      </div>
      <div class="topic-section__body">
        <p>The About family is not meant to be read as disconnected brand pages. Each page answers a different company-level question: profile explains identity, mission explains purpose, philosophy explains judgment, story explains origin, values explain standards, lawyer explains legal structure, and the remaining pages explain fit, results, experience, client types, and ethics.</p>
        <p>Use the card menu below to move directly into the page that matches the question you are trying to answer. If you are unsure where to begin, start with Profile, About, Mission, and Why Us.</p>
      </div>
    </div>
  </section>""".rstrip()
    section_three = f"""
  <section class="content-block flow-section topic-section topic-section--frame" id="section-3-how-this-family-is-organized" data-topic="How this family is organized">
    <div class="topic-section__shell">
      <div class="topic-section__heading">
        <p class="section-kicker">Section 03</p>
        <h2>How this family is organized</h2>
        <p class="section-strap">Three layers explain the company from identity to trust.</p>
      </div>
      <div class="topic-section__body">
        <p>We have organized the About family into three clear layers so the company can be understood in sequence rather than through scattered impressions.</p>
        <ul>
          <li>company identity: Profile, About, Mission, Philosophy, Story, and Values explain who we are and how we think</li>
          <li>process and trust: Why Us, Results, Stories, Clients, and Testimonials explain how the method feels in practice and who it serves</li>
          <li>legal and professional structure: Lawyer and Ethics explain how legal work, responsibility, and professional boundaries fit into the company model</li>
        </ul>
        <p>Together, these pages are designed to give you a complete and publishable company profile, not just a set of marketing fragments.</p>
      </div>
    </div>
  </section>""".rstrip()
    return "\n".join([intro, section_two, render_hub_menu(preview_pages, existing), section_three])


def render_end_cta(page: dict) -> str:
    title = page["end_cta"].get("title", "Need a structured next step?")
    lead = page["end_cta"].get("lead", "Use consultation for case-specific guidance, or WhatsApp for faster operational clarification.")
    logo_alt = f"Immigrate to Brazil logo for the {page['hero'].get('title', page['label'])} page, Brazil immigration consultation, route analysis, and bilingual support"
    return f"""

  <section class="lead-form-block" id="consultation-form">
    <div class="section-head">
      <h2 class="section-title"><span class="section-title__icon" aria-hidden="true">{SECTION_ICON}</span><span>{html.escape(title)}</span></h2>
      <p>{html.escape(lead)}</p>
    </div>
    <div class="card-grid compact">
      <article class="info-card">
        <img class="brand-wordmark__mark" src="{LOGO_MAIN}" alt="{html.escape(logo_alt)}" width="72" height="72" loading="lazy" decoding="async" />
        <h3>Immigrate to Brazil</h3>
        <p>Professional, transparent, immigrant-friendly support built around clarity, structure, sequencing, and carefully managed next steps.</p>
      </article>
      <article class="info-card">
        <h3>Book consultation</h3>
        <p>Use consultation for route fit, chronology review, document analysis, and structured planning tailored to your situation.</p>
        <p><a class="btn btn-cta btn-sm" href="/start-consultation/" data-cta-click="true">Book a consultation</a></p>
      </article>
      <article class="info-card">
        <h3>Contact on WhatsApp</h3>
        <p>Use WhatsApp if you need faster operational clarification, urgency signaling, or help understanding the correct route.</p>
        <p><a class="btn btn-secondary btn-sm" href="{WHATSAPP_URL}">WhatsApp</a></p>
      </article>
    </div>
  </section>""".rstrip()


def render_body(page: dict, preview_pages: dict[str, dict], existing: dict[str, dict]) -> str:
    image = hero_image_for(page["route"], existing)
    sections = page["sections"]
    if page["route"] == "/about/":
        article_html = render_about_hub_content(preview_pages, existing)
    else:
        intro = render_intro(sections[0]) if sections else ""
        variants = ["topic-section--split", "topic-section--frame", "topic-section--band"]
        main_sections = []
        for idx, section in enumerate(sections[1:], start=1):
            main_sections.append(render_section(section, variants[(idx - 1) % len(variants)]))
        article_html = intro + "".join(main_sections)
    return f"""


    <div data-partial="gtm-noscript"></div>

  <div data-partial="utility-bar"></div>

  <div data-partial="accessibility-panel"></div>

  <div data-partial="site-navigation"></div>

  <div data-partial="breadcrumbs"></div>

{render_hero(page, image)}

  <main id="main-content" class="site-main" data-page-key="about-{slug_from_route(page['route'])}">
      <div class="container main-shell main-shell--intro">

        <article class="content-column">
{article_html}
        </article>

        <div data-partial="sidebar-shell"></div>
      </div>
<div class="container">
        <div data-partial="official-resources"></div>
  <div data-partial="related-links"></div>
{render_end_cta(page)}

        <div data-partial="disclaimer"></div>
      </div>
    </main>

        <div data-partial="site-footer"></div>

  <div data-partial="floating-whatsapp"></div>
""".rstrip() + "\n"


def title_suffix(page: dict) -> str:
    if page["route"] == "/about/":
        return "About | Immigrate to Brazil"
    return f"{page['label']} | About Immigrate to Brazil | Immigrate to Brazil"


def description_for(page: dict) -> str:
    return clean_text(page["hero"].get("summary", ""))


def breadcrumbs_for(page: dict) -> list[dict]:
    if page["route"] == "/about/":
        return [
            {"label": "Home", "href": "/"},
            {"label": "About", "current": True},
        ]
    return [
        {"label": "Home", "href": "/"},
        {"label": "About", "href": "/about/"},
        {"label": page["label"], "current": True},
    ]


def related_routes_for(page: dict) -> list[str]:
    routes = []
    if page["route"] != "/about/":
        routes.append("/about/")
    routes.extend(page["internal_links"])
    deduped = []
    for route in routes:
        if route not in deduped:
            deduped.append(route)
    return deduped[:6]


def page_json(page: dict, preview_pages: dict[str, dict], existing: dict[str, dict]) -> dict:
    image = hero_image_for(page["route"], existing)
    page_title = "About" if page["route"] == "/about/" else page["label"]
    related = [route_card(route, preview_pages, existing) for route in related_routes_for(page)]
    return {
        "route": page["route"],
        "lang": "en",
        "bodyClass": body_class(page["route"]),
        "meta": {
            "themeColor": THEME_COLOR,
            "description": description_for(page),
            "robots": "index,follow",
            "title": title_suffix(page),
            "preloadImage": image["src"],
        },
        "social": {
            "ogType": "website",
            "ogTitle": title_suffix(page),
            "ogDescription": description_for(page),
            "ogImage": route_url(image["src"]),
            "ogImageAlt": image["og_alt"],
            "twitterCard": "summary_large_image",
            "twitterTitle": title_suffix(page),
            "twitterDescription": description_for(page),
            "twitterImage": route_url(image["src"]),
            "twitterImageAlt": image["og_alt"],
        },
        "runtime": {
            "pageTitle": page_title,
            "pageFamily": "about",
        },
        "shell": {
            "breadcrumbs": breadcrumbs_for(page),
            "sidebar": {
                "brand": {
                    "note": clean_text(page["hero"].get("summary", "")),
                },
                "nextStep": {
                    "lead": page["end_cta"].get("lead", "Use consultation for case-specific guidance, or WhatsApp for operational clarification."),
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
                    "note": "Representation, filing strategy, and route execution remain case-specific and follow review of chronology, documents, and timing.",
                },
            },
            "officialResources": page["resources"],
            "relatedLinks": related,
        },
    }


def replace_legal_related_links(preview_pages: dict[str, dict], existing: dict[str, dict]) -> int:
    updated = 0
    for path in (ROUTES_ROOT / "legal").rglob("page.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        links = data.get("shell", {}).get("relatedLinks", [])
        for item in links:
            href = item.get("href")
            if href in RELATED_REPLACEMENTS:
                card = route_card(RELATED_REPLACEMENTS[href], preview_pages, existing)
                item.update(card)
                changed = True
            elif href == "/about/about/" and data.get("route") in {"/legal/404/", "/legal/search/"}:
                card = route_card("/about/", preview_pages, existing)
                item.update(card)
                changed = True
        if changed:
            path.write_text(ensure_ascii_json(data), encoding="utf-8")
            updated += 1
    for body_path in [
        ROUTES_ROOT / "legal" / "404" / "body.html",
        ROUTES_ROOT / "legal" / "search" / "body.html",
    ]:
        if not body_path.exists():
            continue
        text = body_path.read_text(encoding="utf-8")
        text = text.replace('href="/about/about/"', 'href="/about/"')
        body_path.write_text(text, encoding="utf-8")
    return updated


def main() -> None:
    preview_pages = parse_preview()
    existing = existing_route_data()

    for route in ACTIVE_ROUTES:
        page = preview_pages[route]
        target_dir = route_dir(route)
        write_text(target_dir / "page.json", ensure_ascii_json(page_json(page, preview_pages, existing)))
        write_text(target_dir / "body.html", render_body(page, preview_pages, existing))

    for route in REMOVED_ROUTES:
        target_dir = route_dir(route)
        for name in ("page.json", "body.html"):
            target = target_dir / name
            if target.exists():
                target.unlink()

    updated_legal = replace_legal_related_links(preview_pages, existing)
    print(f"Rebuilt {len(ACTIVE_ROUTES)} English About pages and updated {updated_legal} English legal route files.")


if __name__ == "__main__":
    main()
