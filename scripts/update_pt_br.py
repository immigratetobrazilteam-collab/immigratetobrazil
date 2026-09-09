#!/usr/bin/env python3
"""Generate or update Brazilian Portuguese pages from English HTML source pages."""

from __future__ import annotations

import argparse
import importlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from maintenance_lib import (
    ROOT,
    STATE_DIR,
    TEXT_TAGS_SKIP,
    TRANSLATABLE_ATTRS,
    add_common_args,
    apply_site_url,
    ensure_dirs,
    html_path_to_route,
    public_html_files,
    read_text,
    route_to_url,
    write_json_if_changed,
    write_text_if_changed,
    is_indexable_html_path,
    load_config,
)


def ensure_package(import_name: str, package_name: str) -> bool:
    try:
        importlib.import_module(import_name)
        return True
    except ImportError:
        print(f"Missing optional dependency {package_name}; attempting user install.")
        result = subprocess.run([sys.executable, "-m", "pip", "install", "--user", package_name], text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        if result.returncode:
            print(result.stdout[-2000:])
            return False
        importlib.invalidate_caches()
        try:
            importlib.import_module(import_name)
            return True
        except ImportError:
            return False


class Translator:
    def __init__(self, provider: str) -> None:
        self.provider = provider
        self.cache_path = STATE_DIR / "pt-br-translation-cache.json"
        self.cache = json.loads(self.cache_path.read_text(encoding="utf-8")) if self.cache_path.exists() else {}
        self.glossary = load_config("translation_glossary.json", {})
        self.overrides = load_config("translation_overrides.json", {})
        self.available = False
        self.reason = ""
        if provider == "openai":
            self.available = bool(os.environ.get("OPENAI_API_KEY"))
            self.reason = "" if self.available else "OPENAI_API_KEY is not set"
        elif provider == "argos":
            self.available = ensure_package("argostranslate", "argostranslate")
            self.reason = "" if self.available else "argostranslate could not be installed"
        elif provider == "google":
            self.available = ensure_package("deep_translator", "deep-translator")
            self.reason = "" if self.available else "deep-translator could not be installed"
        elif provider == "copy":
            self.available = True
        else:
            self.reason = f"Unknown provider: {provider}"

    def save(self) -> None:
        write_json_if_changed(self.cache_path, self.cache)

    def translate(self, text: str) -> str:
        clean = " ".join(text.split())
        if not clean or not re.search(r"[A-Za-z]", clean):
            return text
        if clean in self.overrides:
            return self.overrides[clean]
        key = f"{self.provider}:{clean}"
        if key in self.cache:
            return self.cache[key]
        if self.provider == "copy":
            return text
        for attempt in range(3):
            try:
                if self.provider == "google":
                    from deep_translator import GoogleTranslator

                    translated = GoogleTranslator(source="en", target="pt").translate(clean)
                elif self.provider == "argos":
                    translated = self.translate_argos(clean)
                else:
                    translated = self.translate_openai(clean)
                if translated:
                    translated = self.apply_glossary(translated)
                    self.cache[key] = translated
                    return translated
            except Exception as exc:
                self.reason = str(exc)
                time.sleep(min(2**attempt, 8))
        return text

    def apply_glossary(self, text: str) -> str:
        for english, portuguese in sorted(self.glossary.items(), key=lambda item: len(item[0]), reverse=True):
            text = re.sub(re.escape(english), portuguese, text, flags=re.I)
        return text

    def translate_argos(self, text: str) -> str:
        import argostranslate.translate

        installed = argostranslate.translate.get_installed_languages()
        source = next((lang for lang in installed if lang.code == "en"), None)
        target = next((lang for lang in installed if lang.code == "pt"), None)
        if not source or not target:
            raise RuntimeError("Argos English to Portuguese model is not installed. Run scripts/bootstrap_dependencies.py.")
        translation = source.get_translation(target)
        return translation.translate(text)

    def translate_openai(self, text: str) -> str:
        payload = {
            "model": os.environ.get("OPENAI_TRANSLATION_MODEL", "gpt-4o-mini"),
            "input": [
                {
                    "role": "system",
                    "content": "Translate from English to natural Brazilian Portuguese. Preserve names, URLs, code-like tokens, email addresses, phone numbers, and legal references. Return only the translation.",
                },
                {"role": "user", "content": text},
            ],
        }
        req = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
        chunks: list[str] = []
        for item in data.get("output", []):
            for content in item.get("content", []):
                if content.get("type") in {"output_text", "text"}:
                    chunks.append(content.get("text", ""))
        return " ".join(chunks).strip()


def source_pages() -> list[Path]:
    pages = []
    for path in public_html_files(include_partials=True):
        route = html_path_to_route(path)
        rp = path.relative_to(ROOT).as_posix()
        if route.startswith("/pt-br/") or rp.startswith("pt-br/"):
            continue
        if rp.startswith("sitemaps/") or rp.startswith("docs/"):
            continue
        if not rp.startswith("partials/en/") and not is_indexable_html_path(path):
            continue
        pages.append(path)
    return sorted(pages)


def target_for(source: Path) -> Path:
    rp = source.relative_to(ROOT).as_posix()
    if rp == "index.html":
        return ROOT / "pt-br" / "index.html"
    if rp.startswith("partials/en/"):
        return ROOT / rp.replace("partials/en/", "partials/pt-br/", 1)
    return ROOT / "pt-br" / rp


def localize_url(value: str, target_route: str) -> str:
    if value.startswith("https://immigratetobrazil.com"):
        parsed = value.replace("https://immigratetobrazil.com", "", 1)
        if not parsed.startswith("/pt-br/"):
            parsed = "/pt-br" + (parsed if parsed.startswith("/") else "/" + parsed)
        return "https://immigratetobrazil.com" + parsed
    if value.startswith("/") and not value.startswith(("/pt-br/", "/assets/", "/css/", "/js/", "/data/", "/sitemaps/")):
        return "/pt-br" + value
    return value


def update_alternates(soup, source_route: str, target_route: str) -> None:
    for html_tag in soup.find_all("html"):
        html_tag["lang"] = "pt-BR"
    for tag in soup.find_all("link", rel=lambda value: value and "canonical" in value):
        tag["href"] = route_to_url(target_route)
    alternates = soup.find_all("link", rel=lambda value: value and "alternate" in value)
    for tag in alternates:
        hreflang = (tag.get("hreflang") or "").lower()
        if hreflang == "en":
            tag["href"] = route_to_url(source_route)
        elif hreflang == "pt-br":
            tag["href"] = route_to_url(target_route)
        elif hreflang == "x-default":
            tag["href"] = route_to_url(source_route)


def should_translate_attr(tag, attr: str) -> bool:
    if attr != "content":
        return True
    name = (tag.get("name") or "").lower()
    prop = (tag.get("property") or "").lower()
    return name in {"description", "twitter:title", "twitter:description"} or prop in {"og:title", "og:description", "og:image:alt"}


def translate_html(source: Path, translator: Translator) -> tuple[str, list[str]]:
    if not ensure_package("bs4", "beautifulsoup4"):
        return read_text(source), ["beautifulsoup4 unavailable; copied source without translation"]
    from bs4 import BeautifulSoup, Comment, NavigableString

    source_route = html_path_to_route(source)
    target_route = html_path_to_route(target_for(source))
    soup = BeautifulSoup(read_text(source), "html.parser")
    update_alternates(soup, source_route, target_route)

    skipped: list[str] = []
    if translator.provider == "copy":
        skipped.append("translation provider is copy; structure and URLs were localized only")
    elif not translator.available:
        skipped.append(f"translation provider unavailable: {translator.reason}")
    else:
        for node in list(soup.find_all(string=True)):
            if isinstance(node, Comment):
                continue
            parent = node.parent.name.lower() if node.parent and node.parent.name else ""
            if parent in TEXT_TAGS_SKIP:
                continue
            raw = str(node)
            if not raw.strip() or not re.search(r"[A-Za-z]", raw):
                continue
            translated = translator.translate(raw)
            node.replace_with(NavigableString(translated if raw.strip() == raw else raw.replace(raw.strip(), translated)))
        for tag in soup.find_all(True):
            for attr in list(tag.attrs):
                if attr not in TRANSLATABLE_ATTRS or not should_translate_attr(tag, attr):
                    continue
                value = tag.get(attr)
                if isinstance(value, str) and value.strip() and re.search(r"[A-Za-z]", value):
                    tag[attr] = translator.translate(value)

    for tag in soup.find_all(["a", "form"]):
        attr = "href" if tag.name == "a" else "action"
        value = tag.get(attr)
        if value:
            tag[attr] = localize_url(value, target_route)
    for tag in soup.find_all(["meta"], property="og:url"):
        tag["content"] = route_to_url(target_route)
    return str(soup).replace("><", ">\n<"), skipped


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    parser.add_argument("--provider", choices=["argos", "google", "openai", "copy"], default=os.environ.get("PT_BR_TRANSLATION_PROVIDER", "argos"))
    parser.add_argument("--limit", type=int, default=0, help="Limit pages for testing.")
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()

    translator = Translator(args.provider)
    pages = source_pages()
    if args.limit:
        pages = pages[: args.limit]
    changed: list[str] = []
    skipped: dict[str, list[str]] = {}
    if not translator.available and args.provider != "copy":
        print(f"Translation provider unavailable: {translator.reason}. No pages will be overwritten.")
        write_json_if_changed(ROOT / "reports" / "pt-br-update-report.json", {"changed": [], "skipped": {"all": [translator.reason]}})
        return 2
    for source in pages:
        target = target_for(source)
        content, local_skipped = translate_html(source, translator)
        if local_skipped:
            skipped[str(target.relative_to(ROOT))] = local_skipped
        if args.dry_run:
            continue
        if write_text_if_changed(target, content):
            changed.append(str(target.relative_to(ROOT)))
    translator.save()
    write_json_if_changed(ROOT / "reports" / "pt-br-update-report.json", {"changed": changed, "skipped": skipped, "provider": args.provider, "source_pages": len(pages)})
    print(f"Portuguese update complete: {len(changed)} files changed from {len(pages)} source pages using {args.provider}.")
    if skipped:
        print("Skipped details are in reports/pt-br-update-report.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
