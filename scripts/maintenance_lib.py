#!/usr/bin/env python3
"""Shared utilities for Immigrate to Brazil maintenance scripts."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
SITE_URL = os.environ.get("SITE_URL", "https://immigratetobrazil.com").rstrip("/")
REPORTS_DIR = ROOT / "reports"
STATE_DIR = ROOT / ".maintenance"
CONFIG_DIR = ROOT / "scripts" / "config"
PUBLIC_DATA_DIR = ROOT / "data"
PT_PUBLIC_DATA_DIR = ROOT / "pt-br" / "data"

SKIP_DIRS = {
    ".git",
    ".github",
    ".maintenance",
    ".venv",
    "__pycache__",
    "node_modules",
    "reports",
    "docs",
    "templates",
}

PUBLIC_FILE_SUFFIXES = {
    ".html",
    ".css",
    ".js",
    ".json",
    ".xml",
    ".txt",
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".avif",
    ".pdf",
    ".webmanifest",
}

TEXT_TAGS_SKIP = {"script", "style", "noscript", "svg", "code", "pre"}
TRANSLATABLE_ATTRS = {"alt", "title", "aria-label", "placeholder", "value", "content"}
META_TRANSLATABLE_NAMES = {"description", "twitter:title", "twitter:description"}
META_TRANSLATABLE_PROPERTIES = {"og:title", "og:description", "og:image:alt"}


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def ensure_dirs() -> None:
    REPORTS_DIR.mkdir(exist_ok=True)
    STATE_DIR.mkdir(exist_ok=True)
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_DIR.mkdir(exist_ok=True)
    PT_PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def write_text_if_changed(path: Path, content: str) -> bool:
    old = read_text(path) if path.exists() else None
    if old == content:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")
    return True


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(read_text(path))
    except json.JSONDecodeError:
        return default


def load_config(name: str, default: Any) -> Any:
    return load_json(CONFIG_DIR / name, default)


def write_json_if_changed(path: Path, data: Any) -> bool:
    return write_text_if_changed(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def now_iso() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def should_skip(path: Path) -> bool:
    parts = set(path.relative_to(ROOT).parts)
    return bool(parts & SKIP_DIRS)


def all_files() -> list[Path]:
    return sorted(p for p in ROOT.rglob("*") if p.is_file() and not should_skip(p))


def public_html_files(include_partials: bool = False) -> list[Path]:
    files = []
    for path in all_files():
        if path.suffix.lower() != ".html":
            continue
        rp = rel(path)
        if not include_partials and not is_indexable_html_path(path):
            continue
        files.append(path)
    return files


def is_indexable_html_path(path: Path) -> bool:
    rp = rel(path)
    name = path.name.lower()
    if rp.startswith("partials/"):
        return False
    if name in {"404.html", "sitemap.html"} or "/404/" in f"/{rp}":
        return False
    if re.search(r"(google|bing|msvalidate|siteauth|verification)", name):
        return False
    return True


def public_asset_exists(url_path: str) -> bool:
    clean = url_path.split("?", 1)[0].split("#", 1)[0]
    if not clean.startswith("/"):
        return True
    target = ROOT / clean.lstrip("/")
    if target.is_dir():
        target = target / "index.html"
    elif not target.exists() and not target.suffix:
        html_target = target.with_suffix(".html")
        if html_target.exists():
            return True
    return target.exists()


def html_path_to_route(path: Path) -> str:
    rp = rel(path)
    if rp == "index.html":
        return "/"
    if rp.endswith("/index.html"):
        return "/" + rp[: -len("index.html")]
    return "/" + rp


def route_to_url(route: str) -> str:
    if route == "/":
        return SITE_URL
    return SITE_URL + route


def route_to_html_path(route: str) -> Path:
    route = route.split("?", 1)[0].split("#", 1)[0]
    if route in {"", "/"}:
        return ROOT / "index.html"
    path = ROOT / route.lstrip("/")
    if route.endswith("/"):
        return path / "index.html"
    return path


@dataclass
class HtmlDoc:
    path: Path
    text: str
    route: str
    lang: str = ""
    title: str = ""
    description: str = ""
    canonical: str = ""
    h1: list[str] = field(default_factory=list)
    ids: list[str] = field(default_factory=list)
    links: list[dict[str, str]] = field(default_factory=list)
    images: list[dict[str, str]] = field(default_factory=list)
    scripts: list[dict[str, str]] = field(default_factory=list)
    stylesheets: list[dict[str, str]] = field(default_factory=list)
    forms: list[dict[str, str]] = field(default_factory=list)
    labels_for: set[str] = field(default_factory=set)
    buttons: list[str] = field(default_factory=list)
    json_ld: list[Any] = field(default_factory=list)


class MetadataParser(HTMLParser):
    def __init__(self, path: Path, text: str) -> None:
        super().__init__(convert_charrefs=True)
        self.doc = HtmlDoc(path=path, text=text, route=html_path_to_route(path))
        self.stack: list[str] = []
        self._capture_title = False
        self._capture_h1 = False
        self._capture_button = False
        self._capture_schema = False
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs_raw: list[tuple[str, str | None]]) -> None:
        attrs = {k.lower(): v or "" for k, v in attrs_raw}
        self.stack.append(tag)
        if tag == "html":
            self.doc.lang = attrs.get("lang", "")
        if "id" in attrs:
            self.doc.ids.append(attrs["id"])
        if tag == "title":
            self._capture_title = True
            self._buffer = []
        elif tag == "h1":
            self._capture_h1 = True
            self._buffer = []
        elif tag == "button":
            self._capture_button = True
            self._buffer = []
        elif tag == "script" and attrs.get("type") == "application/ld+json":
            self._capture_schema = True
            self._buffer = []
        elif tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key == "description":
                self.doc.description = attrs.get("content", "")
        elif tag == "link":
            rel_attr = attrs.get("rel", "").lower()
            if rel_attr == "canonical":
                self.doc.canonical = attrs.get("href", "")
            elif "stylesheet" in rel_attr:
                self.doc.stylesheets.append(attrs)
            elif "alternate" in rel_attr:
                self.doc.links.append({"kind": "alternate", **attrs})
        elif tag == "a" and attrs.get("href"):
            self.doc.links.append(attrs)
        elif tag == "img":
            self.doc.images.append(attrs)
        elif tag == "script":
            self.doc.scripts.append(attrs)
        elif tag == "form":
            self.doc.forms.append(attrs)
        elif tag == "label" and attrs.get("for"):
            self.doc.labels_for.add(attrs["for"])

    def handle_endtag(self, tag: str) -> None:
        data = " ".join("".join(self._buffer).split())
        if tag == "title" and self._capture_title:
            self.doc.title = data
            self._capture_title = False
        elif tag == "h1" and self._capture_h1:
            self.doc.h1.append(data)
            self._capture_h1 = False
        elif tag == "button" and self._capture_button:
            self.doc.buttons.append(data)
            self._capture_button = False
        elif tag == "script" and self._capture_schema:
            try:
                self.doc.json_ld.append(json.loads("".join(self._buffer)))
            except json.JSONDecodeError:
                self.doc.json_ld.append({"_invalid_json_ld": True})
            self._capture_schema = False
        if self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self._capture_title or self._capture_h1 or self._capture_button or self._capture_schema:
            self._buffer.append(data)


def parse_html(path: Path) -> HtmlDoc:
    text = read_text(path)
    parser = MetadataParser(path, text)
    try:
        parser.feed(text)
    except Exception:
        pass
    return parser.doc


def parse_all_html(include_partials: bool = False) -> list[HtmlDoc]:
    return [parse_html(p) for p in public_html_files(include_partials=include_partials)]


def route_group(route: str) -> str:
    clean = route.strip("/")
    if not clean:
        return "home"
    parts = clean.split("/")
    if parts[0] == "pt-br":
        if len(parts) == 1:
            return "pt-br"
        return re.sub(r"[^a-z0-9-]+", "-", "pt-br-" + parts[1].lower()).strip("-")
    if parts[0] == "insights" and len(parts) > 1:
        return re.sub(r"[^a-z0-9-]+", "-", "insights-" + parts[1].lower()).strip("-")
    return re.sub(r"[^a-z0-9-]+", "-", parts[0].lower()).strip("-")


def url_is_external(href: str) -> bool:
    return href.startswith(("http://", "https://", "mailto:", "tel:", "sms:", "whatsapp:"))


def normalize_internal_href(href: str) -> str:
    return href.split("#", 1)[0].split("?", 1)[0]


def retry_urlopen(req: urllib.request.Request | str, timeout: int = 20, tries: int = 3) -> tuple[int, str]:
    last_error = ""
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                body = response.read().decode("utf-8", errors="replace")
                return response.status, body
        except (urllib.error.URLError, TimeoutError) as exc:
            last_error = str(exc)
            time.sleep(min(2**attempt, 8))
    return 0, last_error


def run(cmd: list[str], check: bool = False) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=check)


def git_changed_files() -> set[str]:
    result = run(["git", "status", "--porcelain"])
    changed: set[str] = set()
    for line in result.stdout.splitlines():
        if not line:
            continue
        path = line[3:]
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        changed.add(path)
    return changed


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def print_step(message: str) -> None:
    print(f"[{dt.datetime.now().strftime('%H:%M:%S')}] {message}", flush=True)


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--site-url", default=SITE_URL, help="Canonical site origin. Default: %(default)s")
    parser.add_argument("--dry-run", action="store_true", help="Report intended changes without writing files.")


def apply_site_url(value: str) -> None:
    global SITE_URL
    SITE_URL = value.rstrip("/")


def xml_escape(value: str) -> str:
    return html.escape(value, quote=True)


def today_date() -> str:
    return dt.date.today().isoformat()
