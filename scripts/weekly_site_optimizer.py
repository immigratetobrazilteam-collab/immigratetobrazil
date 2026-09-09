#!/usr/bin/env python3
"""
Weekly technical optimizer for https://immigratetobrazil.com

Purpose
-------
A deterministic, no-API, no-AI-token weekly audit + safe-fix tool for a large
static HTML site. It scans every public HTML page, reports technical SEO,
schema, hreflang, internal-link, accessibility, performance and analytics
issues, then (with --apply) performs only high-confidence mechanical fixes.

It deliberately DOES NOT rewrite substantive immigration/legal content,
invent credentials/reviews/ratings, or pretend it can do nuanced keyword
research without a search/AI data source.

Recommended weekly command:
    python3 weekly_site_optimizer.py --apply --push

Optional GTM installation:
    python3 weekly_site_optimizer.py --apply --push --gtm-id GTM-XXXXXXX

Audit only:
    python3 weekly_site_optimizer.py

The script uses Python's standard library only.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import html as html_lib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from collections import Counter, defaultdict, deque
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Iterable
from urllib.parse import urlsplit, urlunsplit, unquote


# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

DOMAIN = "https://immigratetobrazil.com"
HOST = "immigratetobrazil.com"
BRAND = "Immigrate to Brazil"
REPORT_DIR = Path("reports")

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
OPTIMIZER_STATE = ROOT / ".weekly-site-optimizer-state.json"
INDEX_MANAGER = ROOT / "scripts" / "site_index_manager.py"

EXCLUDED_DIRS = {
    ".git", ".github", ".idea", ".vscode", "__pycache__", ".pytest_cache",
    ".mypy_cache", ".ruff_cache", ".venv", "venv", "node_modules", "templates",
    "memory-bank", "reports", "scripts", "src", "docs", "path", "vendor",
    "dist", "build", ".cache", ".wrangler", "partials", ".codex-temp",
}

EXCLUDED_HTML_NAMES = {
    "404.html", "500.html", "offline.html", "sitemap.html",
}

PRIVATE_OR_SUPPORT_PREFIXES = (
    "/templates/", "/memory-bank/", "/reports/", "/scripts/", "/src/",
    "/docs/", "/path/", "/node_modules/",
)

TRACKING_PARAM_PREFIXES = ("utm_",)
TRACKING_PARAMS = {"gclid", "fbclid", "msclkid"}

LARGE_HTML_BYTES = 400_000
LARGE_IMAGE_BYTES = 750_000
LARGE_JS_BYTES = 350_000
LARGE_CSS_BYTES = 250_000

MAX_REPORT_EXAMPLES = 25

# Only add this minimal schema when a page has no JSON-LD at all.
WEBSITE_ID = f"{DOMAIN}/#website"


# ---------------------------------------------------------------------------
# OUTPUT
# ---------------------------------------------------------------------------

def ok(msg: str) -> None:
    print(f"✓ {msg}")


def info(msg: str) -> None:
    print(f"• {msg}")


def warn(msg: str) -> None:
    print(f"⚠ {msg}")


def err(msg: str) -> None:
    print(f"✗ {msg}")


def section(title: str) -> None:
    print()
    print("=" * 78)
    print(title)
    print("=" * 78)


def fail(title: str, detail: str = "") -> None:
    section(f"✗ ERROR: {title}")
    if detail:
        print(detail)
    raise SystemExit(1)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(
        description="Audit and safely optimize the ImmigrateToBrazil static site."
    )
    p.add_argument(
        "--apply",
        action="store_true",
        help="Apply high-confidence mechanical fixes. Without this flag: audit only.",
    )
    p.add_argument(
        "--push",
        action="store_true",
        help="After successful validation, commit/push changes and run site_index_manager.py.",
    )
    p.add_argument(
        "--gtm-id",
        default="",
        help="Optional GTM container ID, e.g. GTM-ABC1234. Never invented automatically.",
    )
    p.add_argument(
        "--allow-dirty",
        action="store_true",
        help="Allow starting with an already dirty Git tree (not recommended).",
    )
    p.add_argument(
        "--skip-index-manager",
        action="store_true",
        help="Do not run site_index_manager.py after a successful push.",
    )
    p.add_argument(
        "--max-pages",
        type=int,
        default=0,
        help="Audit only the first N public pages (0 = all). Useful for testing.",
    )
    return p.parse_args()


# ---------------------------------------------------------------------------
# DATA MODELS
# ---------------------------------------------------------------------------

@dataclass
class PageAudit:
    file: str
    url: str
    language: str
    bytes: int
    title: str = ""
    description: str = ""
    canonical: str = ""
    robots: str = ""
    h1_count: int = 0
    h1: str = ""
    h2_count: int = 0
    jsonld_blocks: int = 0
    invalid_jsonld: int = 0
    schema_types: str = ""
    hreflang_en: str = ""
    hreflang_ptbr: str = ""
    hreflang_xdefault: str = ""
    og_title: str = ""
    og_description: str = ""
    og_url: str = ""
    twitter_card: str = ""
    gtm_ids: str = ""
    images: int = 0
    images_missing_alt: int = 0
    images_empty_alt: int = 0
    internal_links: int = 0
    broken_internal_links: int = 0
    http_internal_links: int = 0
    www_internal_links: int = 0
    empty_links: int = 0
    scripts: int = 0
    inline_scripts: int = 0
    stylesheets: int = 0
    has_viewport: bool = False
    has_charset: bool = False
    has_main: bool = False
    exact_content_hash: str = ""
    issues: list[str] = field(default_factory=list)


@dataclass
class Change:
    file: str
    url: str
    category: str
    reason: str
    detail: str


# ---------------------------------------------------------------------------
# REGEXES
# ---------------------------------------------------------------------------

RE_SCRIPT_BLOCK = re.compile(r"<script\b[^>]*>.*?</script\s*>", re.I | re.S)
RE_STYLE_BLOCK = re.compile(r"<style\b[^>]*>.*?</style\s*>", re.I | re.S)
RE_NOSCRIPT_BLOCK = re.compile(r"<noscript\b[^>]*>.*?</noscript\s*>", re.I | re.S)
RE_COMMENT = re.compile(r"<!--.*?-->", re.S)

RE_TITLE = re.compile(r"<title\b[^>]*>(.*?)</title\s*>", re.I | re.S)
RE_H1 = re.compile(r"<h1\b[^>]*>(.*?)</h1\s*>", re.I | re.S)
RE_H2 = re.compile(r"<h2\b[^>]*>(.*?)</h2\s*>", re.I | re.S)
RE_HTML_OPEN = re.compile(r"<html\b([^>]*)>", re.I)
RE_HEAD_CLOSE = re.compile(r"</head\s*>", re.I)
RE_BODY_OPEN = re.compile(r"<body\b([^>]*)>", re.I)
RE_MAIN = re.compile(r"<main\b", re.I)

RE_LINK_TAG = re.compile(r"<link\b[^>]*>", re.I)
RE_META_TAG = re.compile(r"<meta\b[^>]*>", re.I)
RE_IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)
RE_A_TAG = re.compile(r"<a\b[^>]*>", re.I)
RE_SCRIPT_TAG = re.compile(r"<script\b[^>]*>", re.I)
RE_STYLESHEET = re.compile(
    r"<link\b(?=[^>]*\brel\s*=\s*['\"]stylesheet['\"])[^>]*>", re.I
)

RE_JSONLD = re.compile(
    r"<script\b(?=[^>]*\btype\s*=\s*['\"]application/ld\+json['\"])[^>]*>"
    r"(.*?)</script\s*>",
    re.I | re.S,
)

RE_TAG = re.compile(r"<[^>]+>", re.S)
RE_WS = re.compile(r"\s+")

ATTR_RE_TEMPLATE = r"""\b%s\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))"""


# ---------------------------------------------------------------------------
# HTML HELPERS
# ---------------------------------------------------------------------------

def attr(tag: str, name: str) -> str:
    m = re.search(ATTR_RE_TEMPLATE % re.escape(name), tag, re.I)
    if not m:
        return ""
    return next((g for g in m.groups() if g is not None), "")


def strip_tags(value: str) -> str:
    value = RE_SCRIPT_BLOCK.sub(" ", value)
    value = RE_STYLE_BLOCK.sub(" ", value)
    value = RE_NOSCRIPT_BLOCK.sub(" ", value)
    value = RE_COMMENT.sub(" ", value)
    value = RE_TAG.sub(" ", value)
    value = html_lib.unescape(value)
    return RE_WS.sub(" ", value).strip()


def first_tag_by_meta(html: str, key: str, value: str) -> str:
    for tag in RE_META_TAG.findall(html):
        if attr(tag, key).lower() == value.lower():
            return tag
    return ""


def meta_content(html: str, name: str) -> str:
    tag = first_tag_by_meta(html, "name", name)
    return attr(tag, "content") if tag else ""


def property_content(html: str, prop: str) -> str:
    tag = first_tag_by_meta(html, "property", prop)
    return attr(tag, "content") if tag else ""


def link_by_rel(html: str, rel: str, hreflang: str = "") -> str:
    for tag in RE_LINK_TAG.findall(html):
        rel_value = attr(tag, "rel").lower().split()
        if rel.lower() not in rel_value:
            continue
        if hreflang and attr(tag, "hreflang").lower() != hreflang.lower():
            continue
        return tag
    return ""


def title_value(html: str) -> str:
    m = RE_TITLE.search(html)
    return strip_tags(m.group(1)) if m else ""


def h1_values(html: str) -> list[str]:
    return [strip_tags(x) for x in RE_H1.findall(html)]


def has_meta_charset(html: str) -> bool:
    for tag in RE_META_TAG.findall(html):
        if re.search(r"\bcharset\s*=", tag, re.I):
            return True
        if attr(tag, "http-equiv").lower() == "content-type":
            return True
    return False


def normalize_space(value: str) -> str:
    return RE_WS.sub(" ", value).strip()


def safe_text_excerpt(html: str, max_chars: int = 158) -> str:
    # Prefer main content if present.
    main = re.search(r"<main\b[^>]*>(.*?)</main\s*>", html, re.I | re.S)
    source = main.group(1) if main else html

    # Remove noisy structural areas before extracting text.
    for tagname in ("nav", "header", "footer", "aside", "form"):
        source = re.sub(
            rf"<{tagname}\b[^>]*>.*?</{tagname}\s*>",
            " ",
            source,
            flags=re.I | re.S,
        )

    text = strip_tags(source)
    text = re.sub(r"^(Skip to (main )?content\s*)", "", text, flags=re.I)
    text = normalize_space(text)

    if not text:
        return ""

    if len(text) <= max_chars:
        return text

    candidate = text[: max_chars + 1]
    cut = candidate.rfind(" ")
    if cut >= int(max_chars * 0.70):
        candidate = candidate[:cut]

    candidate = candidate.rstrip(" ,;:-")
    if candidate and candidate[-1] not in ".!?":
        candidate += "."

    return candidate


def make_title(h1: str, fallback_slug: str) -> str:
    base = normalize_space(h1) or fallback_slug.replace("-", " ").title() or BRAND
    if BRAND.lower() in base.lower():
        return base[:70].rstrip()
    composed = f"{base} | {BRAND}"
    if len(composed) <= 70:
        return composed
    # Keep page-specific wording instead of truncating the brand into nonsense.
    return base[:70].rstrip(" |-–—")


def inject_before_head_close(html: str, fragment: str) -> str:
    m = RE_HEAD_CLOSE.search(html)
    if not m:
        return html
    return html[:m.start()] + fragment + "\n" + html[m.start():]


def inject_after_body_open(html: str, fragment: str) -> str:
    m = RE_BODY_OPEN.search(html)
    if not m:
        return html
    return html[:m.end()] + "\n" + fragment + html[m.end():]


def replace_or_add_meta(html: str, name: str, content: str) -> tuple[str, bool]:
    replacement = f'<meta name="{name}" content="{html_lib.escape(content, quote=True)}">'
    for tag in RE_META_TAG.findall(html):
        if attr(tag, "name").lower() == name.lower():
            if tag == replacement:
                return html, False
            return html.replace(tag, replacement, 1), True
    return inject_before_head_close(html, "  " + replacement), True


def replace_or_add_property(html: str, prop: str, content: str) -> tuple[str, bool]:
    replacement = f'<meta property="{prop}" content="{html_lib.escape(content, quote=True)}">'
    for tag in RE_META_TAG.findall(html):
        if attr(tag, "property").lower() == prop.lower():
            if tag == replacement:
                return html, False
            return html.replace(tag, replacement, 1), True
    return inject_before_head_close(html, "  " + replacement), True


def replace_or_add_link(
    html: str, rel: str, href: str, hreflang: str = ""
) -> tuple[str, bool]:
    extra = f' hreflang="{hreflang}"' if hreflang else ""
    replacement = (
        f'<link rel="{rel}"{extra} href="{html_lib.escape(href, quote=True)}">'
    )
    for tag in RE_LINK_TAG.findall(html):
        rel_values = attr(tag, "rel").lower().split()
        if rel.lower() not in rel_values:
            continue
        if hreflang and attr(tag, "hreflang").lower() != hreflang.lower():
            continue
        if not hreflang and attr(tag, "hreflang"):
            continue
        if tag == replacement:
            return html, False
        return html.replace(tag, replacement, 1), True
    return inject_before_head_close(html, "  " + replacement), True


def replace_or_add_title(html: str, value: str) -> tuple[str, bool]:
    replacement = f"<title>{html_lib.escape(value)}</title>"
    m = RE_TITLE.search(html)
    if m:
        old = m.group(0)
        if old == replacement:
            return html, False
        return html[:m.start()] + replacement + html[m.end():], True
    return inject_before_head_close(html, "  " + replacement), True


def ensure_html_lang(html: str, lang: str) -> tuple[str, bool]:
    m = RE_HTML_OPEN.search(html)
    if not m:
        return html, False

    full = m.group(0)
    existing = attr(full, "lang")
    if existing.lower() == lang.lower():
        return html, False

    if re.search(r"\blang\s*=", full, re.I):
        new = re.sub(
            ATTR_RE_TEMPLATE % "lang",
            f'lang="{lang}"',
            full,
            count=1,
            flags=re.I,
        )
    else:
        new = full[:-1] + f' lang="{lang}">'

    return html[:m.start()] + new + html[m.end():], True


# ---------------------------------------------------------------------------
# FILE / URL DISCOVERY
# ---------------------------------------------------------------------------

def is_excluded_file(path: Path) -> bool:
    try:
        parts = path.relative_to(ROOT).parts
    except ValueError:
        return True
    return any(part in EXCLUDED_DIRS for part in parts)


def url_for_file(path: Path) -> str | None:
    # GOOGLE VERIFICATION FILE — NEVER A CONTENT PAGE
    # Files such as google55d84a2211a04ae2.html are Search Console
    # verification tokens, not indexable webpages.
    if re.fullmatch(r"google[a-z0-9_-]+\\.html", path.name, re.I):
        return None

    if is_excluded_file(path) or path.name in EXCLUDED_HTML_NAMES:
        return None

    rel_parts = path.relative_to(ROOT).parts

    # HTML verification tokens are crawler-verification files, not content pages.
    if re.fullmatch(r"google[0-9a-f]+\\.html", path.name, re.I):
        return None

    # Directory-based custom 404 templates are not indexable content pages.
    if any(part.lower() == "404" for part in rel_parts[:-1]):
        return None

    rel = path.relative_to(ROOT).as_posix()
    if not rel.endswith(".html"):
        return None

    if rel == "index.html":
        url_path = "/"
    elif rel.endswith("/index.html"):
        url_path = "/" + rel[:-10]
    else:
        url_path = "/" + rel[:-5].rstrip("/") + "/"

    url_path = re.sub(r"/{2,}", "/", url_path)

    if any(url_path.startswith(p) for p in PRIVATE_OR_SUPPORT_PREFIXES):
        return None

    return DOMAIN + url_path


def discover_pages(max_pages: int = 0) -> list[tuple[Path, str]]:
    pages = []
    for path in ROOT.rglob("*.html"):
        url = url_for_file(path)
        if url:
            pages.append((path, url))
    pages.sort(key=lambda x: x[1])
    if max_pages:
        pages = pages[:max_pages]
    if not pages:
        fail("NO PUBLIC HTML PAGES FOUND", "Run from the site repository root.")
    return pages


def language_for_url(url: str) -> str:
    path = urlsplit(url).path
    return "pt-BR" if path == "/pt-br/" or path.startswith("/pt-br/") else "en"


def paired_url(
    path: Path,
    url_map_by_rel: dict[str, str],
) -> tuple[str, str]:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("pt-br/"):
        english_rel = rel[len("pt-br/"):]
        return url_map_by_rel.get(english_rel, ""), url_for_file(path) or ""
    pt_rel = "pt-br/" + rel
    return url_for_file(path) or "", url_map_by_rel.get(pt_rel, "")


def filesystem_target_for_url_path(path: str) -> list[Path]:
    path = unquote(path)
    clean = path.lstrip("/")

    if not clean:
        return [ROOT / "index.html"]

    candidates = [
        ROOT / clean,
        ROOT / clean / "index.html",
    ]

    if clean.endswith("/"):
        candidates.append(ROOT / clean.rstrip("/") / "index.html")
    elif not Path(clean).suffix:
        candidates.append(ROOT / f"{clean}.html")

    return candidates


def internal_target_exists(href: str) -> bool:
    try:
        parsed = urlsplit(href)
    except Exception:
        return True

    if parsed.scheme and parsed.scheme not in ("http", "https"):
        return True

    if parsed.netloc and parsed.netloc not in (
        HOST,
        "www." + HOST,
    ):
        return True

    path = parsed.path or "/"

    # Public special files can be real despite not being HTML.
    direct = ROOT / path.lstrip("/")
    if direct.exists():
        return True

    return any(candidate.exists() for candidate in filesystem_target_for_url_path(path))


# ---------------------------------------------------------------------------
# JSON-LD
# ---------------------------------------------------------------------------

def schema_types_from_obj(obj) -> set[str]:
    found = set()

    def walk(value):
        if isinstance(value, dict):
            t = value.get("@type")
            if isinstance(t, str):
                found.add(t)
            elif isinstance(t, list):
                found.update(x for x in t if isinstance(x, str))
            for v in value.values():
                walk(v)
        elif isinstance(value, list):
            for v in value:
                walk(v)

    walk(obj)
    return found


def minimal_schema(
    url: str,
    title: str,
    description: str,
    lang: str,
) -> str:
    page_id = url.rstrip("/") + "/#webpage" if url != DOMAIN + "/" else DOMAIN + "/#webpage"

    graph = [
        {
            "@type": "WebSite",
            "@id": WEBSITE_ID,
            "url": DOMAIN + "/",
            "name": BRAND,
            "inLanguage": ["en", "pt-BR"],
        },
        {
            "@type": "WebPage",
            "@id": page_id,
            "url": url,
            "name": title,
            "inLanguage": lang,
            "isPartOf": {"@id": WEBSITE_ID},
        },
    ]

    if description:
        graph[1]["description"] = description

    parts = [p for p in urlsplit(url).path.strip("/").split("/") if p]
    # Exclude pt-br locale marker from human breadcrumb labels but preserve URLs.
    if len(parts) >= 2:
        items = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home" if lang == "en" else "Início",
                "item": DOMAIN + ("/pt-br/" if lang == "pt-BR" else "/"),
            }
        ]
        pos = 2
        prefix_parts = []
        for part in parts:
            prefix_parts.append(part)
            if part == "pt-br":
                continue
            label = part.replace("-", " ").replace("_", " ").title()
            item_url = DOMAIN + "/" + "/".join(prefix_parts) + "/"
            items.append(
                {
                    "@type": "ListItem",
                    "position": pos,
                    "name": label,
                    "item": item_url,
                }
            )
            pos += 1

        if len(items) >= 2:
            graph.append(
                {
                    "@type": "BreadcrumbList",
                    "@id": url.rstrip("/") + "/#breadcrumb",
                    "itemListElement": items,
                }
            )

    payload = {
        "@context": "https://schema.org",
        "@graph": graph,
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# PAGE AUDIT
# ---------------------------------------------------------------------------

def content_hash(html: str) -> str:
    # Hash textual page content with scripts/styles/comments stripped.
    text = strip_tags(html)
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def audit_page(
    path: Path,
    url: str,
    all_page_urls: set[str],
) -> PageAudit:
    try:
        raw = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raw = path.read_text(encoding="utf-8", errors="replace")

    lang = language_for_url(url)
    titles = title_value(raw)
    h1s = h1_values(raw)
    h2s = [strip_tags(x) for x in RE_H2.findall(raw)]

    canonical_tag = link_by_rel(raw, "canonical")
    canonical = attr(canonical_tag, "href") if canonical_tag else ""

    hreflangs = {}
    for tag in RE_LINK_TAG.findall(raw):
        if "alternate" in attr(tag, "rel").lower().split() and attr(tag, "hreflang"):
            hreflangs[attr(tag, "hreflang").lower()] = attr(tag, "href")

    schema_types = set()
    invalid_jsonld = 0
    jsonld_blocks = RE_JSONLD.findall(raw)
    for block in jsonld_blocks:
        try:
            obj = json.loads(block.strip())
            schema_types |= schema_types_from_obj(obj)
        except Exception:
            invalid_jsonld += 1

    gtm_ids = sorted(set(re.findall(r"\bGTM-[A-Z0-9]+\b", raw, re.I)))

    images = RE_IMG_TAG.findall(raw)
    images_missing_alt = sum(1 for tag in images if not re.search(r"\balt\s*=", tag, re.I))
    images_empty_alt = sum(
        1 for tag in images
        if re.search(r"\balt\s*=", tag, re.I) and attr(tag, "alt") == ""
    )

    internal_links = 0
    broken_internal = 0
    http_internal = 0
    www_internal = 0
    empty_links = 0

    for tag in RE_A_TAG.findall(raw):
        href = attr(tag, "href").strip()
        if not href:
            empty_links += 1
            continue

        parsed = urlsplit(href)
        is_internal = (
            (not parsed.netloc and (not parsed.scheme))
            or parsed.netloc in (HOST, "www." + HOST)
        )
        if not is_internal:
            continue

        if href.startswith("#") or href.lower().startswith(("mailto:", "tel:", "javascript:")):
            continue

        internal_links += 1

        if href.startswith("http://" + HOST) or href.startswith("http://www." + HOST):
            http_internal += 1

        if "://www." + HOST in href:
            www_internal += 1

        if not internal_target_exists(href):
            broken_internal += 1

    scripts = RE_SCRIPT_TAG.findall(raw)
    inline_scripts = sum(1 for tag in scripts if not attr(tag, "src"))

    audit = PageAudit(
        file=path.relative_to(ROOT).as_posix(),
        url=url,
        language=lang,
        bytes=path.stat().st_size,
        title=titles,
        description=meta_content(raw, "description"),
        canonical=canonical,
        robots=meta_content(raw, "robots"),
        h1_count=len(h1s),
        h1=h1s[0] if h1s else "",
        h2_count=len(h2s),
        jsonld_blocks=len(jsonld_blocks),
        invalid_jsonld=invalid_jsonld,
        schema_types="|".join(sorted(schema_types)),
        hreflang_en=hreflangs.get("en", ""),
        hreflang_ptbr=hreflangs.get("pt-br", ""),
        hreflang_xdefault=hreflangs.get("x-default", ""),
        og_title=property_content(raw, "og:title"),
        og_description=property_content(raw, "og:description"),
        og_url=property_content(raw, "og:url"),
        twitter_card=meta_content(raw, "twitter:card"),
        gtm_ids="|".join(gtm_ids),
        images=len(images),
        images_missing_alt=images_missing_alt,
        images_empty_alt=images_empty_alt,
        internal_links=internal_links,
        broken_internal_links=broken_internal,
        http_internal_links=http_internal,
        www_internal_links=www_internal,
        empty_links=empty_links,
        scripts=len(scripts),
        inline_scripts=inline_scripts,
        stylesheets=len(RE_STYLESHEET.findall(raw)),
        has_viewport=bool(meta_content(raw, "viewport")),
        has_charset=has_meta_charset(raw),
        has_main=bool(RE_MAIN.search(raw)),
        exact_content_hash=content_hash(raw),
    )

    expected_lang = lang.lower()
    html_open = RE_HTML_OPEN.search(raw)
    actual_lang = attr(html_open.group(0), "lang") if html_open else ""

    if not audit.title:
        audit.issues.append("missing_title")
    if not audit.description:
        audit.issues.append("missing_description")
    if not audit.canonical:
        audit.issues.append("missing_canonical")
    elif audit.canonical.rstrip("/") != url.rstrip("/"):
        audit.issues.append("canonical_mismatch")
    if audit.h1_count == 0:
        audit.issues.append("missing_h1")
    if audit.h1_count > 1:
        audit.issues.append("multiple_h1")
    if audit.invalid_jsonld:
        audit.issues.append("invalid_jsonld")
    if not audit.jsonld_blocks:
        audit.issues.append("missing_jsonld")
    if audit.images_missing_alt:
        audit.issues.append("images_missing_alt")
    if audit.broken_internal_links:
        audit.issues.append("broken_internal_links")
    if audit.http_internal_links:
        audit.issues.append("http_internal_links")
    if audit.www_internal_links:
        audit.issues.append("www_internal_links")
    if not audit.has_viewport:
        audit.issues.append("missing_viewport")
    if not audit.has_charset:
        audit.issues.append("missing_charset")
    if not audit.has_main:
        audit.issues.append("missing_main")
    if not actual_lang:
        audit.issues.append("missing_html_lang")
    elif actual_lang.lower() != expected_lang:
        audit.issues.append("html_lang_mismatch")
    if audit.bytes > LARGE_HTML_BYTES:
        audit.issues.append("large_html")

    return audit


# ---------------------------------------------------------------------------
# SAFE FIXES
# ---------------------------------------------------------------------------

def normalize_same_domain_links(raw: str) -> tuple[str, int]:
    """
    Normalize only URL-bearing HTML attributes. Do not replace domain strings
    in prose, scripts, JSON-LD, or legal content.
    """
    replacements = 0
    pattern = re.compile(
        r"(?P<prefix>\\b(?:href|src|action)\\s*=\\s*[\"'])"
        + r"(?P<url>https?://(?:www\\.)?" + re.escape(HOST) + r")"
        + r"(?P<rest>[^\"']*)"
        + r"(?P<quote>[\"'])",
        re.I,
    )

    def repl(match):
        nonlocal replacements
        original_base = match.group("url")
        canonical_base = DOMAIN
        if original_base.rstrip("/").lower() == canonical_base.rstrip("/").lower():
            return match.group(0)
        replacements += 1
        return (
            match.group("prefix")
            + canonical_base
            + match.group("rest")
            + match.group("quote")
        )

    return pattern.sub(repl, raw), replacements


def add_gtm(raw: str, gtm_id: str) -> tuple[str, bool, str]:
    existing = sorted(set(re.findall(r"\bGTM-[A-Z0-9]+\b", raw, re.I)))

    if existing:
        if gtm_id.upper() in [x.upper() for x in existing]:
            return raw, False, "already_present"
        return raw, False, "different_gtm_present"

    head_code = f"""  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
  new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  }})(window,document,'script','dataLayer','{gtm_id}');</script>
  <!-- End Google Tag Manager -->"""

    body_code = f"""<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={gtm_id}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->"""

    out = inject_before_head_close(raw, head_code)
    out = inject_after_body_open(out, body_code)
    return out, out != raw, "installed"


def fix_page(
    path: Path,
    url: str,
    url_map_by_rel: dict[str, str],
    gtm_id: str,
) -> tuple[list[Change], list[str]]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    original = raw
    changes: list[Change] = []
    skipped: list[str] = []

    lang = language_for_url(url)
    rel = path.relative_to(ROOT).as_posix()

    # 1. Normalize same-domain scheme/hostname.
    raw, link_count = normalize_same_domain_links(raw)
    if link_count:
        changes.append(
            Change(rel, url, "links", "Canonicalize same-domain links",
                   f"Normalized {link_count} http/www references to {DOMAIN}")
        )

    # 2. HTML lang.
    new_raw, changed = ensure_html_lang(raw, lang)
    if changed:
        raw = new_raw
        changes.append(
            Change(rel, url, "international", "Correct html lang",
                   f'Set <html lang="{lang}">')
        )

    # 3. Charset.
    if not has_meta_charset(raw):
        m = re.search(r"<head\b[^>]*>", raw, re.I)
        if m:
            raw = raw[:m.end()] + '\n  <meta charset="utf-8">' + raw[m.end():]
            changes.append(
                Change(rel, url, "html", "Add charset", 'Added <meta charset="utf-8">')
            )
        else:
            skipped.append(f"{url}: missing <head>; charset not inserted")

    # 4. Viewport.
    if not meta_content(raw, "viewport"):
        raw = inject_before_head_close(
            raw,
            '  <meta name="viewport" content="width=device-width, initial-scale=1">'
        )
        changes.append(
            Change(rel, url, "mobile", "Add viewport", "Added responsive viewport metadata")
        )

    # 5. Title: only fill missing/empty, never overwrite substantive existing title.
    current_title = title_value(raw)
    h1s = h1_values(raw)
    if not current_title:
        fallback_slug = urlsplit(url).path.strip("/").split("/")[-1] or BRAND
        generated_title = make_title(h1s[0] if h1s else "", fallback_slug)
        raw, did = replace_or_add_title(raw, generated_title)
        if did:
            changes.append(
                Change(rel, url, "seo", "Add missing title", generated_title)
            )
        current_title = generated_title

    # 6. Description: only fill missing.
    current_desc = meta_content(raw, "description")
    if not current_desc:
        generated_desc = safe_text_excerpt(raw)
        if generated_desc:
            raw, did = replace_or_add_meta(raw, "description", generated_desc)
            if did:
                changes.append(
                    Change(rel, url, "seo", "Add missing meta description", generated_desc)
                )
            current_desc = generated_desc
        else:
            skipped.append(f"{url}: could not derive a reliable meta description")

    # 7. Canonical: add when missing. If an existing canonical points elsewhere,
    # report it instead of overwriting a potentially deliberate canonical strategy.
    existing_canonical_tag = link_by_rel(raw, "canonical")
    existing_canonical = attr(existing_canonical_tag, "href") if existing_canonical_tag else ""
    if not existing_canonical:
        raw, did = replace_or_add_link(raw, "canonical", url)
        if did:
            changes.append(
                Change(rel, url, "seo", "Add missing canonical URL", url)
            )
    elif existing_canonical.rstrip("/") != url.rstrip("/"):
        skipped.append(
            f"{url}: canonical points to {existing_canonical}; not auto-overwritten"
        )

    # 8. Robots: absence already means index/follow by default. Never add or
    # overwrite robots directives automatically because indexing policy may be
    # deliberate or controlled by response headers.

    # 9. Open Graph baseline.
    current_title = title_value(raw)
    current_desc = meta_content(raw, "description")

    for prop, value, why in [
        ("og:title", current_title, "Open Graph title"),
        ("og:description", current_desc, "Open Graph description"),
        ("og:url", url, "Open Graph canonical URL"),
        ("og:type", "website", "Open Graph type"),
    ]:
        if value and not property_content(raw, prop):
            raw, did = replace_or_add_property(raw, prop, value)
            if did:
                changes.append(Change(rel, url, "social", f"Add {why}", value))

    # 10. Twitter baseline.
    if not meta_content(raw, "twitter:card"):
        raw, did = replace_or_add_meta(raw, "twitter:card", "summary_large_image")
        if did:
            changes.append(
                Change(rel, url, "social", "Add Twitter card", "summary_large_image")
            )

    if current_title and not meta_content(raw, "twitter:title"):
        raw, did = replace_or_add_meta(raw, "twitter:title", current_title)
        if did:
            changes.append(Change(rel, url, "social", "Add Twitter title", current_title))

    if current_desc and not meta_content(raw, "twitter:description"):
        raw, did = replace_or_add_meta(raw, "twitter:description", current_desc)
        if did:
            changes.append(
                Change(rel, url, "social", "Add Twitter description", current_desc)
            )

    # 11. Hreflang only where exact counterpart exists.
    en_url, pt_url = paired_url(path, url_map_by_rel)
    if en_url and pt_url:
        for hreflang, target in [
            ("en", en_url),
            ("pt-BR", pt_url),
            ("x-default", en_url),
        ]:
            existing_alt = link_by_rel(raw, "alternate", hreflang)
            existing_href = attr(existing_alt, "href") if existing_alt else ""
            if not existing_href:
                raw, did = replace_or_add_link(raw, "alternate", target, hreflang)
                if did:
                    changes.append(
                        Change(
                            rel, url, "international",
                            f"Add missing hreflang {hreflang}", target
                        )
                    )
            elif existing_href.rstrip("/") != target.rstrip("/"):
                skipped.append(
                    f"{url}: existing hreflang {hreflang} points to "
                    f"{existing_href}; not auto-overwritten"
                )
    else:
        skipped.append(
            f"{url}: no deterministic English/pt-BR counterpart; hreflang not fabricated"
        )

    # 12. Minimal truthful JSON-LD only when *none* exists.
    jsonld_blocks = RE_JSONLD.findall(raw)
    if not jsonld_blocks:
        schema = minimal_schema(url, current_title or BRAND, current_desc, lang)
        fragment = (
            '  <script type="application/ld+json">\n'
            + "\n".join("  " + line for line in schema.splitlines())
            + '\n  </script>'
        )
        raw = inject_before_head_close(raw, fragment)
        changes.append(
            Change(
                rel, url, "schema",
                "Add minimal WebSite/WebPage/Breadcrumb JSON-LD",
                "No pre-existing JSON-LD was present; added only factual structural schema"
            )
        )
    else:
        # Existing schema can be richer and should not be overwritten mechanically.
        invalid = 0
        for block in jsonld_blocks:
            try:
                json.loads(block.strip())
            except Exception:
                invalid += 1
        if invalid:
            skipped.append(
                f"{url}: existing JSON-LD is invalid; not auto-rewritten because "
                "doing so could discard factual page-specific schema"
            )

    # 13. GTM only when explicitly supplied.
    if gtm_id:
        raw, did, status = add_gtm(raw, gtm_id)
        if did:
            changes.append(
                Change(rel, url, "analytics", "Install Google Tag Manager", gtm_id)
            )
        elif status == "different_gtm_present":
            skipped.append(
                f"{url}: a different GTM container already exists; not overwritten"
            )

    if raw != original:
        path.write_text(raw, encoding="utf-8")

    return changes, skipped


# ---------------------------------------------------------------------------
# REPOSITORY / SUPPORT AUDIT
# ---------------------------------------------------------------------------

def audit_support_files() -> list[str]:
    issues = []

    required = {
        "robots.txt": ROOT / "robots.txt",
        "sitemap.xml": ROOT / "sitemap.xml",
        "sitemap.html": ROOT / "sitemap.html",
        "llms.txt": ROOT / "llms.txt",
    }

    for label, path in required.items():
        if not path.exists():
            issues.append(f"missing_support_file:{label}")

    robots = ROOT / "robots.txt"
    if robots.exists():
        text = robots.read_text(encoding="utf-8", errors="replace")
        if f"Sitemap: {DOMAIN}/sitemap.xml" not in text:
            issues.append("robots_missing_sitemap_declaration")

        # Detect obvious local contradictions for specific bots.
        for bot in ("GPTBot", "ClaudeBot", "Google-Extended"):
            blocks = re.findall(
                rf"User-agent:\s*{re.escape(bot)}(.*?)(?=\nUser-agent:|\Z)",
                text,
                flags=re.I | re.S,
            )
            combined = "\n".join(blocks)
            if "Disallow: /" in combined and "Allow: /" in combined:
                issues.append(f"robots_possible_conflict:{bot}")

    if (ROOT / ".env").exists():
        issues.append("root_env_file_present_review_git_tracking")

    return issues


def audit_asset_sizes() -> list[tuple[str, int, str]]:
    out = []
    for ext, limit, kind in [
        ("*.js", LARGE_JS_BYTES, "large_js"),
        ("*.css", LARGE_CSS_BYTES, "large_css"),
        ("*.png", LARGE_IMAGE_BYTES, "large_image"),
        ("*.jpg", LARGE_IMAGE_BYTES, "large_image"),
        ("*.jpeg", LARGE_IMAGE_BYTES, "large_image"),
        ("*.webp", LARGE_IMAGE_BYTES, "large_image"),
        ("*.avif", LARGE_IMAGE_BYTES, "large_image"),
    ]:
        for path in ROOT.rglob(ext):
            if is_excluded_file(path):
                continue
            try:
                size = path.stat().st_size
            except OSError:
                continue
            if size > limit:
                out.append((path.relative_to(ROOT).as_posix(), size, kind))
    return sorted(out, key=lambda x: x[1], reverse=True)


# ---------------------------------------------------------------------------
# DUPLICATES / LINK GRAPH
# ---------------------------------------------------------------------------

def duplicate_groups(audits: list[PageAudit], field_name: str) -> dict[str, list[str]]:
    groups = defaultdict(list)
    for a in audits:
        value = getattr(a, field_name)
        if value:
            groups[value.strip().lower()].append(a.url)
    return {k: v for k, v in groups.items() if len(v) > 1}


def exact_content_duplicates(audits: list[PageAudit]) -> dict[str, list[str]]:
    groups = defaultdict(list)
    for a in audits:
        if a.exact_content_hash:
            groups[a.exact_content_hash].append(a.url)
    return {k: v for k, v in groups.items() if len(v) > 1}


# ---------------------------------------------------------------------------
# REPORT WRITING
# ---------------------------------------------------------------------------

def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    keys = list(rows[0].keys())
    with path.open("w", newline="", encoding="utf-8") as handle:
        w = csv.DictWriter(handle, fieldnames=keys)
        w.writeheader()
        w.writerows(rows)


def make_summary(
    audits: list[PageAudit],
    support_issues: list[str],
    asset_issues: list[tuple[str, int, str]],
    changes: list[Change],
    skipped: list[str],
    before_or_after: str,
) -> dict:
    issue_counts = Counter()
    for a in audits:
        issue_counts.update(a.issues)

    duplicate_titles = duplicate_groups(audits, "title")
    duplicate_descriptions = duplicate_groups(audits, "description")
    duplicate_content = exact_content_duplicates(audits)

    all_gtm = Counter()
    for a in audits:
        for x in filter(None, a.gtm_ids.split("|")):
            all_gtm[x] += 1

    summary = {
        "phase": before_or_after,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "pages": len(audits),
        "issue_counts": dict(sorted(issue_counts.items())),
        "duplicate_title_groups": len(duplicate_titles),
        "duplicate_description_groups": len(duplicate_descriptions),
        "exact_content_duplicate_groups": len(duplicate_content),
        "support_issues": support_issues,
        "large_assets": len(asset_issues),
        "gtm_ids": dict(all_gtm),
        "changes_applied": len(changes),
        "items_not_auto_fixed": len(skipped),
    }
    return summary


def write_report_bundle(
    stamp: str,
    audits_before: list[PageAudit],
    audits_after: list[PageAudit],
    support_issues: list[str],
    asset_issues: list[tuple[str, int, str]],
    changes: list[Change],
    skipped: list[str],
) -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    prefix = REPORT_DIR / f"weekly-optimization-{stamp}"

    before_summary = make_summary(
        audits_before, support_issues, asset_issues, [], [], "before"
    )
    after_summary = make_summary(
        audits_after, support_issues, asset_issues, changes, skipped, "after"
    )

    payload = {
        "before": before_summary,
        "after": after_summary,
        "changes": [asdict(x) for x in changes],
        "not_auto_fixed": skipped,
        "large_assets": [
            {"file": f, "bytes": b, "issue": kind}
            for f, b, kind in asset_issues
        ],
    }

    json_path = prefix.with_suffix(".json")
    json_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    page_csv = Path(str(prefix) + "-pages.csv")
    write_csv(page_csv, [asdict(a) | {"issues": "|".join(a.issues)} for a in audits_after])

    changes_csv = Path(str(prefix) + "-changes.csv")
    write_csv(changes_csv, [asdict(x) for x in changes])

    md_path = prefix.with_suffix(".md")

    before_counts = before_summary["issue_counts"]
    after_counts = after_summary["issue_counts"]

    issue_keys = sorted(set(before_counts) | set(after_counts))
    issue_table = "\n".join(
        f"| {key} | {before_counts.get(key, 0)} | {after_counts.get(key, 0)} |"
        for key in issue_keys
    )

    top_assets = "\n".join(
        f"- `{f}` — {b / 1024:.1f} KiB ({kind})"
        for f, b, kind in asset_issues[:MAX_REPORT_EXAMPLES]
    ) or "- None detected above configured thresholds."

    skipped_md = "\n".join(
        f"- {x}" for x in skipped[:100]
    ) or "- None."

    changes_md = "\n".join(
        f"- `{c.file}` — **{c.category}** — {c.reason}: {c.detail}"
        for c in changes[:150]
    ) or "- No production changes were applied."

    md = f"""# Weekly Site Optimization Report

Generated: {dt.datetime.now(dt.timezone.utc).isoformat()}

## Scope

- Pages audited: **{len(audits_after)}**
- Safe production changes applied: **{len(changes)}**
- Items deliberately not auto-fixed: **{len(skipped)}**
- Large assets flagged: **{len(asset_issues)}**

## Before / After Technical Issue Counts

| Issue | Before | After |
|---|---:|---:|
{issue_table}

## Duplicate/Content Signals After Audit

- Duplicate title groups: **{after_summary['duplicate_title_groups']}**
- Duplicate description groups: **{after_summary['duplicate_description_groups']}**
- Exact content duplicate groups: **{after_summary['exact_content_duplicate_groups']}**
- GTM IDs detected: `{json.dumps(after_summary['gtm_ids'], ensure_ascii=False)}`

## Repository / Discovery Issues

{chr(10).join('- ' + x for x in support_issues) if support_issues else '- None detected.'}

## Large Assets

{top_assets}

## Changes Applied

{changes_md}

## Deliberately Not Auto-Fixed

These require editorial, factual, legal, business, privacy, Cloudflare-dashboard,
or other human judgment. The optimizer intentionally leaves them alone.

{skipped_md}

## What this tool does NOT claim to do

- It does not perform live keyword/competitor research.
- It does not rewrite substantive immigration/legal advice.
- It does not invent reviews, ratings, credentials, dates, authors, prices, or claims.
- It does not alter Cloudflare dashboard settings.
- It does not create a Google Tag Manager container ID.
- It does not submit ordinary pages to a nonexistent Google bulk-indexing API.
- It does not automatically merge/delete content based only on heuristics.

"""
    md_path.write_text(md, encoding="utf-8")
    return md_path


# ---------------------------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------------------------

def validate_pages(
    pages: list[tuple[Path, str]],
) -> tuple[list[PageAudit], list[str]]:
    urls = {url for _, url in pages}
    audits = []
    hard_failures = []

    for i, (path, url) in enumerate(pages, 1):
        audit = audit_page(path, url, urls)
        audits.append(audit)

        # Hard failures after fixes.
        if not audit.title:
            hard_failures.append(f"{url}: missing title")
        if not audit.canonical:
            hard_failures.append(f"{url}: missing canonical")

        # Existing canonical mismatches remain audit findings but are not treated
        # as fatal here because the optimizer intentionally refuses to overwrite
        # a potentially deliberate canonical without review.
        if audit.invalid_jsonld:
            # Existing invalid schema is not always safe to rewrite; do not make
            # the entire site undeployable for pre-existing issues.
            pass

        if i % 250 == 0:
            info(f"Validated {i}/{len(pages)} pages")

    return audits, hard_failures


# ---------------------------------------------------------------------------
# GIT / EXECUTION
# ---------------------------------------------------------------------------

def git_available() -> bool:
    return shutil.which("git") is not None and (ROOT / ".git").exists()


def git_status_porcelain() -> str:
    if not git_available():
        return ""
    return subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    ).stdout


def git_head() -> str:
    if not git_available():
        return ""
    return subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    ).stdout.strip()


def run_checked(cmd: list[str]) -> None:
    info("Running: " + " ".join(cmd))
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        fail("COMMAND FAILED", " ".join(cmd))


def commit_and_push(changes: list[Change], report_path: Path) -> None:
    if not git_available():
        fail("GIT NOT AVAILABLE", "Cannot --push without a Git repository.")

    # Reports/state are intentionally not staged. Stage only production files
    # that this optimizer explicitly changed.
    changed_files = sorted({c.file for c in changes})
    for rel in changed_files:
        p = ROOT / rel
        if p.exists():
            subprocess.run(["git", "add", "--", rel], cwd=ROOT, check=False)

    staged = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=ROOT,
    )

    if staged.returncode == 0:
        ok("No optimizer production changes need committing")
    else:
        run_checked(
            ["git", "commit", "-m", "Weekly technical SEO and site optimization"]
        )
        ok("Optimizer changes committed")

    # Push the optimizer changes first so Cloudflare can build them.
    run_checked(["git", "push"])
    ok("Optimizer changes pushed")

    if INDEX_MANAGER.exists():
        section("SITEMAP + INDEXNOW")
        info(
            "Running the existing site_index_manager.py so sitemaps are regenerated "
            "from the committed HTML and IndexNow receives changed URLs."
        )
        run_checked([sys.executable, str(INDEX_MANAGER)])
        ok("Sitemap/IndexNow manager completed")
    else:
        warn(
            "site_index_manager.py was not found. Sitemaps/IndexNow were not "
            "automatically regenerated/submitted."
        )


# ---------------------------------------------------------------------------
# STATE
# ---------------------------------------------------------------------------

def save_optimizer_state(audits: list[PageAudit], report: Path) -> None:
    state = {
        "version": 1,
        "domain": DOMAIN,
        "last_run": dt.datetime.now(dt.timezone.utc).isoformat(),
        "pages": len(audits),
        "content_hashes": {a.url: a.exact_content_hash for a in audits},
        "report": report.as_posix(),
    }
    OPTIMIZER_STATE.write_text(
        json.dumps(state, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# TERMINAL SUMMARY
# ---------------------------------------------------------------------------

def print_issue_summary(audits: list[PageAudit], label: str) -> None:
    counts = Counter()
    for a in audits:
        counts.update(a.issues)

    section(label)
    print(f"Pages: {len(audits)}")
    if not counts:
        print("✓ No configured technical page issues detected.")
        return

    for issue, count in counts.most_common():
        print(f"{count:6d}  {issue}")


def explain_not_done(skipped: list[str], gtm_id: str) -> None:
    section("WHAT WAS NOT AUTO-FIXED — AND WHY")

    permanent = [
        "Substantive legal/immigration copy was not rewritten: a local deterministic "
        "script cannot safely verify nuanced legal facts or search intent.",
        "Existing rich JSON-LD was not overwritten: page-specific schema may contain "
        "facts that must not be discarded or invented.",
        "Broken internal links were reported but not guessed: the intended destination "
        "must be known before changing a link.",
        "Missing image alt text was reported but not fabricated from filenames: alt text "
        "must describe the actual image in context.",
        "Duplicate titles/descriptions were reported rather than mass-rewritten: uniqueness "
        "alone is not enough; intent and content must remain accurate.",
        "Cloudflare dashboard caching/bot/security settings were not changed: this script "
        "only controls repository files.",
        "No Google bulk URL submission was attempted: normal webpages are discovered "
        "through crawlable links and sitemaps; your IndexNow manager handles participating "
        "IndexNow engines.",
    ]

    if not gtm_id:
        permanent.append(
            "Google Tag Manager was not installed because no --gtm-id was supplied. "
            "The script never invents production analytics IDs."
        )

    for item in permanent:
        print("• " + item)

    if skipped:
        print()
        print(f"Page-specific skipped items: {len(skipped)}")
        for x in skipped[:30]:
            print("  - " + x)
        if len(skipped) > 30:
            print(f"  ... and {len(skipped) - 30} more (see report).")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    args = parse_args()

    section("WEEKLY STATIC-SITE OPTIMIZER")
    print(f"Domain:      {DOMAIN}")
    print(f"Repository:  {ROOT}")
    print(f"Mode:        {'AUDIT + SAFE FIX' if args.apply else 'AUDIT ONLY'}")
    print(f"Push:        {'YES' if args.push else 'NO'}")
    print(f"GTM:         {args.gtm_id or 'not supplied'}")

    if args.push and not args.apply:
        fail("--push REQUIRES --apply")

    if args.gtm_id and not re.fullmatch(r"GTM-[A-Z0-9]+", args.gtm_id, re.I):
        fail("INVALID GTM ID", "Expected format similar to GTM-ABC1234.")

    if git_available():
        start_head = git_head()
        dirty = git_status_porcelain()
        info(f"Starting Git commit: {start_head or 'unknown'}")
        if dirty and args.apply and not args.allow_dirty:
            fail(
                "WORKING TREE IS NOT CLEAN",
                "Commit/stash your existing work first, or rerun with --allow-dirty "
                "only if you intentionally want the optimizer to work alongside it.\n\n"
                + dirty[:5000],
            )
        elif dirty:
            warn("Working tree already contains changes; review diffs carefully.")
    elif args.push:
        fail("NO GIT REPOSITORY", "--push requires Git.")

    section("1. DISCOVERING PUBLIC PAGES")
    pages = discover_pages(args.max_pages)
    ok(f"Discovered {len(pages)} public HTML pages")

    page_urls = {url for _, url in pages}
    url_map_by_rel = {
        path.relative_to(ROOT).as_posix(): url for path, url in pages
    }

    section("2. AUDITING EVERY PAGE")
    audits_before = []
    for i, (path, url) in enumerate(pages, 1):
        audits_before.append(audit_page(path, url, page_urls))
        if i % 250 == 0:
            info(f"Audited {i}/{len(pages)} pages")
    ok(f"Audited all {len(audits_before)} pages")

    support_issues = audit_support_files()
    asset_issues = audit_asset_sizes()
    print_issue_summary(audits_before, "3. BEFORE — TECHNICAL FINDINGS")

    # Duplicate summaries.
    dup_titles_before = duplicate_groups(audits_before, "title")
    dup_desc_before = duplicate_groups(audits_before, "description")
    dup_content_before = exact_content_duplicates(audits_before)

    section("4. SITEWIDE STRUCTURAL FINDINGS")
    print(f"Duplicate title groups:        {len(dup_titles_before)}")
    print(f"Duplicate description groups:  {len(dup_desc_before)}")
    print(f"Exact content duplicate groups:{len(dup_content_before)}")
    print(f"Large assets flagged:          {len(asset_issues)}")
    print(f"Support/discovery issues:      {len(support_issues)}")

    for issue in support_issues:
        warn(issue)

    changes: list[Change] = []
    skipped: list[str] = []

    if args.apply:
        section("5. APPLYING SAFE, DETERMINISTIC FIXES")
        for i, (path, url) in enumerate(pages, 1):
            page_changes, page_skipped = fix_page(
                path, url, url_map_by_rel, args.gtm_id
            )
            changes.extend(page_changes)
            skipped.extend(page_skipped)

            if i % 250 == 0:
                info(
                    f"Processed {i}/{len(pages)} pages — "
                    f"{len(changes)} safe changes so far"
                )

        ok(f"Applied {len(changes)} safe changes across the site")
    else:
        info("Audit-only mode: no production files were changed")

    section("6. VALIDATING RESULT")
    audits_after, hard_failures = validate_pages(pages)

    if hard_failures and args.apply:
        for x in hard_failures[:50]:
            err(x)
        fail(
            "POST-FIX VALIDATION FAILED",
            f"{len(hard_failures)} hard validation failures remain after safe fixes. "
            "Nothing will be pushed.",
        )
    elif hard_failures:
        warn(
            f"Audit found {len(hard_failures)} hard technical issue(s); "
            "audit-only mode does not modify or fail deployment."
        )
    else:
        ok("Core post-fix validation passed")
    print_issue_summary(audits_after, "7. AFTER — TECHNICAL FINDINGS")

    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    report_path = write_report_bundle(
        stamp,
        audits_before,
        audits_after,
        support_issues,
        asset_issues,
        changes,
        skipped,
    )
    save_optimizer_state(audits_after, report_path)
    ok(f"Detailed report: {report_path}")

    explain_not_done(skipped, args.gtm_id)

    if args.apply and args.push:
        section("8. COMMIT / DEPLOY / SITEMAP / INDEXNOW")
        commit_and_push(changes, report_path)

    section("FINAL RESULT")
    print(f"Pages audited:              {len(audits_after)}")
    print(f"Safe changes applied:       {len(changes)}")
    print(f"Items not auto-fixed:       {len(skipped)}")
    print(f"Large assets to review:     {len(asset_issues)}")
    print(f"Report:                     {report_path}")
    if args.apply and args.push:
        print("Deployment workflow:         ✓ requested")
        if INDEX_MANAGER.exists() and not args.skip_index_manager:
            print("Sitemap/IndexNow integration:✓ available")
    elif args.apply:
        print("Deployment:                  not requested")
    else:
        print("Production changes:          none (audit-only)")

    print()
    print("✓ WEEKLY OPTIMIZATION RUN COMPLETED")
    print()


if __name__ == "__main__":
    main()
