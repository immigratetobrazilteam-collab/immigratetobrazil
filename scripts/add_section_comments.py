#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IGNORED_DIRS = {
    ".git",
    ".cache",
    ".codacy",
    ".github",
    "assets",
    "css",
    "data",
    "docs",
    "i18n",
    "js",
    "memory-bank",
    "node_modules",
    "reports",
    "scripts",
    "templates",
}

GENERATED_COMMENT_PREFIX = "<!-- Section:"
OPENING_TAG_RE = re.compile(
    r"^(\s*)<(html|head|body|section|header|main|footer|nav|aside|article|form|div|script|noscript|blockquote|a|label|input|button)\b",
    re.IGNORECASE,
)
ATTRIBUTE_RE = re.compile(r'([a-zA-Z_:][-a-zA-Z0-9_:.]*)=(["\'])(.*?)\2')
HEADING_RE = re.compile(r"<h([1-6])[^>]*>([\s\S]*?)</h\1>", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
SPLIT_PATTERNS = (
    re.compile(
        r"(</(?:section|header|main|footer|nav|aside|article|form|blockquote|div)>)\s*(?=<(?:section|header|main|footer|nav|aside|article|form|blockquote|div|a|button|label)\b)",
        re.IGNORECASE,
    ),
    re.compile(r"(<meta\b[^>]*?/>)\s*(?=<(?:meta|link|script|title)\b)", re.IGNORECASE),
    re.compile(r"(<link\b[^>]*?/>)\s*(?=<(?:meta|link|script|title)\b)", re.IGNORECASE),
    re.compile(r"(</title>)\s*(?=<(?:meta|link|script|title)\b)", re.IGNORECASE),
    re.compile(r"(</script>)\s*(?=<(?:meta|link|script|title)\b)", re.IGNORECASE),
)

ROLE_LABELS = {
    "en": {
        "document_structure": "Document Structure",
        "core_metadata": "Core Metadata",
        "title": "Title",
        "canonical_alternates": "Canonical And Language Alternates",
        "preloaded_assets": "Preloaded Assets",
        "favicons_manifest": "Favicons And Manifest",
        "stylesheets": "Stylesheets",
        "open_graph": "Open Graph Metadata",
        "twitter_meta": "Twitter Metadata",
        "structured_data": "Structured Data",
        "site_runtime_config": "Site Runtime Config",
        "tag_manager_fallback": "Tag Manager Fallback",
        "utility_bar": "Utility Bar",
        "language_switcher": "Language Switcher",
        "accessibility_panel": "Accessibility Panel",
        "reading_guide": "Reading Guide",
        "site_navigation": "Site Navigation",
        "mobile_navigation": "Mobile Navigation",
        "breadcrumb_navigation": "Breadcrumb Navigation",
        "hero": "Hero",
        "hero_copy": "Hero Copy",
        "hero_actions": "Hero Actions",
        "hero_meta": "Hero Meta",
        "hero_glance": "Hero Glance",
        "hero_glance_card": "Hero Glance Card",
        "main_content": "Main Content",
        "content_column": "Content Column",
        "introduction": "Introduction",
        "highlights": "Highlights",
        "timeline": "Timeline",
        "testimonials": "Testimonials",
        "trust_markers": "Trust Markers",
        "page_map": "Page Map",
        "official_resources": "Official Resources",
        "related_links": "Related Links",
        "faq": "FAQ",
        "consultation_form": "Consultation Form",
        "disclaimer": "Disclaimer",
        "call_to_action": "Call To Action",
        "topic": "Topic",
        "supplemental": "Supplemental",
        "topic_shell": "Topic Shell",
        "topic_heading": "Topic Heading",
        "topic_body": "Topic Body",
        "topic_aside": "Topic Aside",
        "topic_note": "Topic Note",
        "sidebar_column": "Sidebar Column",
        "sidebar_card": "Sidebar Card",
        "resource_card": "Resource Card",
        "related_card": "Related Card",
        "info_card": "Info Card",
        "quote_card": "Quote Card",
        "faq_item": "FAQ Item",
        "inquiry_form": "Inquiry Form",
        "hidden_form_metadata": "Hidden Form Metadata",
        "form_group": "Form Group",
        "form_note": "Form Note",
        "site_footer": "Site Footer",
        "footer_panel": "Footer Panel",
        "footer_actions": "Footer Actions",
        "footer_group": "Footer Group",
        "footer_bottom": "Footer Bottom",
        "footer_meta": "Footer Meta",
        "floating_whatsapp": "Floating WhatsApp",
        "back_to_top": "Back To Top",
        "site_scripts": "Site Scripts",
        "brand": "Brand",
        "quick_navigation": "Quick Navigation",
        "at_a_glance": "At A Glance",
        "recommended_next_step": "Recommended Next Step",
        "links": "Links",
        "contact_details": "Contact Details",
    },
    "pt": {
        "document_structure": "Estrutura do Documento",
        "core_metadata": "Metadados Principais",
        "title": "Titulo",
        "canonical_alternates": "Canonical e Idiomas Alternativos",
        "preloaded_assets": "Recursos Precarregados",
        "favicons_manifest": "Favicons e Manifesto",
        "stylesheets": "Folhas de Estilo",
        "open_graph": "Metadados Open Graph",
        "twitter_meta": "Metadados do Twitter",
        "structured_data": "Dados Estruturados",
        "site_runtime_config": "Configuracao do Site",
        "tag_manager_fallback": "Fallback do Tag Manager",
        "utility_bar": "Barra Utilitaria",
        "language_switcher": "Alternador de Idioma",
        "accessibility_panel": "Painel de Acessibilidade",
        "reading_guide": "Guia de Leitura",
        "site_navigation": "Navegacao do Site",
        "mobile_navigation": "Navegacao Movel",
        "breadcrumb_navigation": "Navegacao de Breadcrumb",
        "hero": "Hero",
        "hero_copy": "Conteudo do Hero",
        "hero_actions": "Acoes do Hero",
        "hero_meta": "Detalhes do Hero",
        "hero_glance": "Destaques do Hero",
        "hero_glance_card": "Cartao de Destaque do Hero",
        "main_content": "Conteudo Principal",
        "content_column": "Coluna de Conteudo",
        "introduction": "Introducao",
        "highlights": "Destaques",
        "timeline": "Linha do Tempo",
        "testimonials": "Depoimentos",
        "trust_markers": "Marcadores de Confianca",
        "page_map": "Mapa da Pagina",
        "official_resources": "Recursos Oficiais",
        "related_links": "Links Relacionados",
        "faq": "FAQ",
        "consultation_form": "Formulario de Consulta",
        "disclaimer": "Aviso Legal",
        "call_to_action": "Chamada Para Acao",
        "topic": "Topico",
        "supplemental": "Suplementar",
        "topic_shell": "Estrutura do Topico",
        "topic_heading": "Cabecalho do Topico",
        "topic_body": "Corpo do Topico",
        "topic_aside": "Notas do Topico",
        "topic_note": "Nota do Topico",
        "sidebar_column": "Coluna Lateral",
        "sidebar_card": "Cartao Lateral",
        "resource_card": "Cartao de Recurso",
        "related_card": "Cartao Relacionado",
        "info_card": "Cartao Informativo",
        "quote_card": "Cartao de Citacao",
        "faq_item": "Item do FAQ",
        "inquiry_form": "Formulario de Envio",
        "hidden_form_metadata": "Metadados Ocultos do Formulario",
        "form_group": "Grupo do Formulario",
        "form_note": "Nota do Formulario",
        "site_footer": "Rodape do Site",
        "footer_panel": "Painel do Rodape",
        "footer_actions": "Acoes do Rodape",
        "footer_group": "Grupo do Rodape",
        "footer_bottom": "Base do Rodape",
        "footer_meta": "Meta do Rodape",
        "floating_whatsapp": "WhatsApp Flutuante",
        "back_to_top": "Voltar ao Topo",
        "site_scripts": "Scripts do Site",
        "brand": "Marca",
        "quick_navigation": "Navegacao Rapida",
        "at_a_glance": "De Relance",
        "recommended_next_step": "Proxima Etapa Recomendada",
        "links": "Links",
        "contact_details": "Detalhes de Contato",
    },
}

CLASS_ROLE_KEYS = {
    "mobile-nav-section": "mobile_navigation",
    "intro-block": "introduction",
    "highlight-block": "highlights",
    "timeline-block": "timeline",
    "testimonial-strip": "testimonials",
    "trust-marker-block": "trust_markers",
    "page-map": "page_map",
    "official-resources": "official_resources",
    "related-block": "related_links",
    "faq-block": "faq",
    "lead-form-block": "consultation_form",
    "site-disclaimer": "disclaimer",
    "cta-pair": "call_to_action",
}

SIDEBAR_VARIANT_KEYS = {
    "map": "quick_navigation",
    "facts": "at_a_glance",
    "brand": "brand",
    "action": "recommended_next_step",
}


@dataclass
class CommentSpec:
    text: str = ""
    dedupe_key: str = ""
    number_key: str = ""
    title: str = ""


def discover_html_files(root: Path) -> list[Path]:
    html_files: list[Path] = []

    def walk(directory: Path) -> None:
        for entry in sorted(directory.iterdir(), key=lambda item: item.name):
            if entry.is_dir():
                if entry.name in IGNORED_DIRS:
                    continue
                walk(entry)
                continue
            if entry.suffix.lower() == ".html":
                html_files.append(entry)

    walk(root)
    return html_files


def role(lang: str, key: str) -> str:
    return ROLE_LABELS[lang][key]


def humanize_token(value: str) -> str:
    tokens = [token for token in re.split(r"[-_]+", value.strip()) if token]
    humanized: list[str] = []
    for token in tokens:
        if token.isupper():
            humanized.append(token)
        elif len(token) <= 4 and token.upper() in {"FAQ", "FAQS", "GDPR", "LGPD", "OAB", "CPLP", "BRT"}:
            humanized.append(token.upper())
        else:
            humanized.append(token.capitalize())
    return " ".join(humanized)


def clean_text(value: str) -> str:
    without_tags = TAG_RE.sub(" ", value)
    unescaped = html.unescape(without_tags)
    return WHITESPACE_RE.sub(" ", unescaped).strip()


def normalize_label(value: str) -> str:
    text = clean_text(value)
    if not text:
        return ""
    return text.replace("–", "-")


def extract_attributes(line: str) -> dict[str, str]:
    attributes: dict[str, str] = {}
    for name, _, value in ATTRIBUTE_RE.findall(line):
        attributes[name.lower()] = value
    return attributes


def split_classes(value: str) -> list[str]:
    return [item for item in value.split() if item]


def find_variant(classes: list[str], prefix: str) -> str | None:
    for class_name in classes:
        if class_name.startswith(prefix):
            return class_name[len(prefix) :]
    return None


def detect_language(text: str) -> str:
    return "pt" if re.search(r'<html\b[^>]*\blang=["\']pt-BR["\']', text, re.IGNORECASE) else "en"


def find_following_tag_text(lines: list[str], start_index: int, tag_names: tuple[str, ...], max_lines: int = 18) -> str:
    end_index = min(len(lines), start_index + max_lines)
    chunk = "\n".join(lines[start_index:end_index])
    for tag_name in tag_names:
        match = re.search(rf"<{tag_name}\b[^>]*>([\s\S]*?)</{tag_name}>", chunk, re.IGNORECASE)
        if match:
            text = normalize_label(match.group(1))
            if text:
                return text
    return ""


def find_following_heading(lines: list[str], start_index: int, max_lines: int = 24) -> str:
    end_index = min(len(lines), start_index + max_lines)
    chunk = "\n".join(lines[start_index:end_index])
    match = HEADING_RE.search(chunk)
    if not match:
        return ""
    return normalize_label(match.group(2))


def find_form_label_text(lines: list[str], start_index: int, max_lines: int = 8) -> str:
    end_index = min(len(lines), start_index + max_lines)
    chunk = "\n".join(lines[start_index:end_index])
    match = re.search(r"<label[^>]*>([\s\S]*?)(?:<input\b|<select\b|<textarea\b)", chunk, re.IGNORECASE)
    if not match:
        return ""
    return normalize_label(match.group(1))


def footer_group_title(lines: list[str], start_index: int, lang: str) -> str:
    end_index = min(len(lines), start_index + 18)
    chunk = "\n".join(lines[start_index:end_index])
    if "footer-contact-list" in chunk:
        return role(lang, "contact_details")
    if "<ul" in chunk:
        return role(lang, "links")
    return ""


def sidebar_card_title(classes: list[str], lines: list[str], start_index: int, lang: str) -> str:
    heading = find_following_heading(lines, start_index, max_lines=12)
    if heading:
        return heading
    variant = find_variant(classes, "sidebar-card--")
    if variant and variant in SIDEBAR_VARIANT_KEYS:
        return role(lang, SIDEBAR_VARIANT_KEYS[variant])
    return ""


def footer_panel_title(classes: list[str], lines: list[str], start_index: int, lang: str) -> str:
    heading = find_following_heading(lines, start_index, max_lines=12)
    if heading:
        return heading
    variant = find_variant(classes, "footer-panel--")
    if variant and variant != "brand":
        return humanize_token(variant)
    return "Immigrate to Brazil"


def prefixed_label(lang: str, key: str, title: str) -> str:
    base = role(lang, key)
    return f"{base} - {title}" if title else base


def simple_role(lang: str, key: str, dedupe_key: str | None = None) -> CommentSpec:
    return CommentSpec(text=role(lang, key), dedupe_key=dedupe_key or key)


def simple_text(text: str, dedupe_key: str) -> CommentSpec:
    return CommentSpec(text=text, dedupe_key=dedupe_key)


def numbered_role(number_key: str, title: str = "") -> CommentSpec:
    return CommentSpec(number_key=number_key, title=title)


def head_group_for_line(line: str, lang: str) -> CommentSpec | None:
    stripped = line.strip()
    if not stripped or stripped.startswith("<!--"):
        return None
    if stripped.startswith("<html"):
        return simple_role(lang, "document_structure")
    if stripped.startswith("<meta"):
        attributes = extract_attributes(line)
        meta_name = attributes.get("name", "")
        meta_property = attributes.get("property", "")
        if meta_property.startswith("og:"):
            return simple_role(lang, "open_graph")
        if meta_name.startswith("twitter:"):
            return simple_role(lang, "twitter_meta")
        return simple_role(lang, "core_metadata")
    if stripped.startswith("<title"):
        return simple_role(lang, "title")
    if stripped.startswith("<link"):
        attributes = extract_attributes(line)
        rel = attributes.get("rel", "").lower()
        if rel == "canonical" or rel == "alternate":
            return simple_role(lang, "canonical_alternates")
        if rel == "preload":
            return simple_role(lang, "preloaded_assets")
        if rel in {"icon", "apple-touch-icon", "manifest"}:
            return simple_role(lang, "favicons_manifest")
        if rel == "stylesheet":
            return simple_role(lang, "stylesheets")
    if stripped.startswith('<script type="application/ld+json"'):
        return simple_role(lang, "structured_data")
    if stripped.startswith("<script"):
        return simple_role(lang, "site_runtime_config")
    return None


def body_comment_for_line(lines: list[str], index: int, lang: str) -> CommentSpec | None:
    line = lines[index]
    match = OPENING_TAG_RE.match(line)
    if not match:
        return None

    tag_name = match.group(2).lower()
    attributes = extract_attributes(line)
    classes = split_classes(attributes.get("class", ""))
    tag_id = attributes.get("id", "").strip()

    if tag_name == "body":
        return None

    if tag_name == "noscript":
        return simple_role(lang, "tag_manager_fallback")

    if tag_name == "nav":
        if "breadcrumbs" in classes or attributes.get("data-breadcrumbs") == "true":
            return simple_role(lang, "breadcrumb_navigation")
        if "main-nav" in classes:
            return simple_role(lang, "site_navigation")
        return None

    if tag_name == "header" and "hero" in classes:
        return simple_role(lang, "hero")

    if tag_name == "main":
        return simple_role(lang, "main_content")

    if tag_name == "footer" and "site-footer" in classes:
        return simple_role(lang, "site_footer")

    if tag_name == "div":
        if "utility-bar" in classes:
            return simple_role(lang, "utility_bar")
        if "lang-switcher" in classes:
            return simple_role(lang, "language_switcher")
        if "reading-guide" in classes:
            return simple_role(lang, "reading_guide")
        if "hero-copy" in classes:
            return simple_role(lang, "hero_copy")
        if "hero-actions" in classes:
            return simple_role(lang, "hero_actions")
        if "hero-meta" in classes:
            return simple_role(lang, "hero_meta")
        if "hero-glance" in classes:
            return simple_role(lang, "hero_glance")
        if "topic-section__shell" in classes:
            return simple_role(lang, "topic_shell")
        if "topic-section__heading" in classes:
            return simple_role(lang, "topic_heading")
        if "topic-section__body" in classes:
            return simple_role(lang, "topic_body")
        if "topic-note" in classes:
            return numbered_role("topic_note", find_following_tag_text(lines, index, ("strong",), max_lines=6))
        if "accordion-item" in classes:
            return numbered_role("faq_item", find_following_tag_text(lines, index, ("button",), max_lines=10))
        if "form-note" in classes:
            return simple_role(lang, "form_note")
        if "footer-panel__actions" in classes or "footer-actions" in classes:
            return simple_role(lang, "footer_actions")
        if "footer-panel__group" in classes:
            return numbered_role("footer_group", footer_group_title(lines, index, lang))
        if "container" in classes and "footer-bottom" in classes:
            return simple_role(lang, "footer_bottom")
        if "container" in classes and "footer-meta" in classes:
            return simple_role(lang, "footer_meta")
        return None

    if tag_name == "aside":
        if "accessibility-panel" in classes:
            return simple_role(lang, "accessibility_panel")
        if "topic-section__aside" in classes:
            return simple_role(lang, "topic_aside")
        if "sidebar-column" in classes:
            return simple_role(lang, "sidebar_column")
        return None

    if tag_name == "section":
        if "sidebar-card" in classes:
            return numbered_role("sidebar_card", sidebar_card_title(classes, lines, index, lang))
        if "footer-panel" in classes:
            title = footer_panel_title(classes, lines, index, lang)
            dedupe = find_variant(classes, "footer-panel--") or title
            return simple_text(prefixed_label(lang, "footer_panel", title), f"footer_panel:{dedupe}")
        if "topic-section" in classes:
            title = find_following_heading(lines, index, max_lines=18) or normalize_label(attributes.get("data-topic", ""))
            if "supplemental" in classes:
                return numbered_role("supplemental", title)
            return simple_text(prefixed_label(lang, "topic", title), f"topic:{tag_id or title}")
        for class_name, role_key in CLASS_ROLE_KEYS.items():
            if class_name in classes:
                return simple_role(lang, role_key)
        if tag_id == "faq":
            return simple_role(lang, "faq")
        if tag_id == "consultation-form":
            return simple_role(lang, "consultation_form")
        if tag_id == "page-map":
            return simple_role(lang, "page_map")
        return None

    if tag_name == "article":
        if "content-column" in classes:
            return simple_role(lang, "content_column")
        if "hero-glance-card" in classes:
            return numbered_role("hero_glance_card", find_following_tag_text(lines, index, ("span",), max_lines=6))
        if "info-card" in classes:
            return numbered_role("info_card", find_following_tag_text(lines, index, ("h3",), max_lines=6))
        if "resource-card" in classes:
            return numbered_role("resource_card", find_following_tag_text(lines, index, ("h3",), max_lines=8))
        return None

    if tag_name == "blockquote" and "quote-card" in classes:
        title = find_following_tag_text(lines, index, ("footer",), max_lines=8)
        if not title:
            title = find_following_tag_text(lines, index, ("p",), max_lines=6)
            if title:
                title = " ".join(title.split()[:6])
        return numbered_role("quote_card", title)

    if tag_name == "a":
        if "floating-whatsapp" in classes:
            return simple_role(lang, "floating_whatsapp")
        if "related-card" in classes:
            return numbered_role("related_card", find_following_tag_text(lines, index, ("strong",), max_lines=6))
        return None

    if tag_name == "form" and "lead-form" in classes:
        return simple_role(lang, "inquiry_form")

    if tag_name == "label":
        return numbered_role("form_group", find_form_label_text(lines, index))

    if tag_name == "input" and attributes.get("type", "").lower() == "hidden":
        return simple_role(lang, "hidden_form_metadata")

    if tag_name == "button":
        if "back-to-top" in classes or attributes.get("data-back-to-top") == "true":
            return simple_role(lang, "back_to_top")
        return None

    if tag_name == "script":
        src = attributes.get("src", "")
        if src in {"/js/search.js", "/js/accessibility.js", "/js/site.js"}:
            return simple_role(lang, "site_scripts")
        return None

    if tag_name == "html":
        return simple_role(lang, "document_structure")

    return None


def normalize_joins(text: str) -> str:
    updated = text
    previous = None
    while updated != previous:
        previous = updated
        for pattern in SPLIT_PATTERNS:
            updated = pattern.sub(r"\1\n", updated)
    return updated


def collapse_blank_lines(lines: list[str]) -> list[str]:
    collapsed: list[str] = []
    blank_run = 0
    for line in lines:
        if line.strip():
            blank_run = 0
            collapsed.append(line.rstrip())
            continue
        blank_run += 1
        if blank_run <= 2:
            collapsed.append("")
    return collapsed


def render_numbered_label(lang: str, key: str, number: int, title: str) -> str:
    base = role(lang, key)
    suffix = f" - {title}" if title else ""
    return f"{base} {number:02d}{suffix}"


def annotate_html(text: str) -> str:
    lang = detect_language(text)
    normalized = normalize_joins(text)
    lines = normalized.splitlines()
    output: list[str] = []
    counts: defaultdict[str, int] = defaultdict(int)
    last_dedupe_key = ""
    in_head = False

    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith(GENERATED_COMMENT_PREFIX):
            continue

        if stripped.startswith("<head"):
            in_head = True
        if stripped.startswith("</head"):
            in_head = False

        comment = head_group_for_line(line, lang) if in_head or stripped.startswith("<html") else body_comment_for_line(lines, index, lang)

        if comment:
            if comment.number_key:
                counts[comment.number_key] += 1
                comment_text = render_numbered_label(lang, comment.number_key, counts[comment.number_key], comment.title)
                dedupe_key = ""
            else:
                comment_text = comment.text
                dedupe_key = comment.dedupe_key

            if not dedupe_key or dedupe_key != last_dedupe_key:
                indent_match = OPENING_TAG_RE.match(line)
                indent = indent_match.group(1) if indent_match else ""
                if output and output[-1].strip():
                    output.append("")
                output.append(f"{indent}<!-- Section: {comment_text} -->")
            if dedupe_key:
                last_dedupe_key = dedupe_key
            else:
                last_dedupe_key = ""
        elif stripped:
            # Preserve grouped comment suppression only across blank lines and same-type groups.
            pass

        output.append(line.rstrip())

    collapsed = collapse_blank_lines(output)
    rendered = "\n".join(collapsed)
    if text.endswith("\n"):
        rendered += "\n"
    return rendered


def main() -> int:
    parser = argparse.ArgumentParser(description="Add deep hidden section comments and spacing to HTML page files.")
    parser.add_argument(
        "--path",
        action="append",
        default=[],
        help="Optional file or directory path to process. Can be used more than once.",
    )
    args = parser.parse_args()

    requested_paths = [Path(item).resolve() for item in args.path]
    if requested_paths:
        html_files: list[Path] = []
        for item in requested_paths:
            if item.is_dir():
                html_files.extend(discover_html_files(item))
            elif item.suffix.lower() == ".html" and item.exists():
                html_files.append(item)
        files = sorted({path for path in html_files})
    else:
        files = discover_html_files(ROOT)

    updated_files = 0
    for file_path in files:
        original = file_path.read_text(encoding="utf8")
        annotated = annotate_html(original)
        if annotated == original:
            continue
        file_path.write_text(annotated, encoding="utf8")
        updated_files += 1

    print(f"Updated {updated_files} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
