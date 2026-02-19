#!/usr/bin/env python3
"""
Generate Spanish (es) and Portuguese (pt) HTML versions and update hreflang.
Uses LibreTranslate (open source) via HTTP API by default.

Usage:
  python3 scripts/translate_hreflang.py
  python3 scripts/translate_hreflang.py --root /home/ash/my-site --base-url https://www.immigratetobrazil.com

Env vars:
  LIBRETRANSLATE_URL (default: https://libretranslate.com)
  LIBRETRANSLATE_API_KEY (optional)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

SKIP_DIRS = {"backups", ".git", "node_modules", "__pycache__", "es", "pt"}
SKIP_TAGS = {"script", "style", "code", "pre", "textarea", "noscript"}
TRANSLATABLE_ATTRS = {"title", "alt", "placeholder", "aria-label"}

LANGUAGES = ["es", "pt"]

CACHE_FILENAME = "translation_cache.json"


def load_cache(cache_path: Path) -> Dict[str, str]:
    if not cache_path.exists():
        return {}
    try:
        return json.loads(cache_path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_cache(cache_path: Path, cache: Dict[str, str]) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def call_libretranslate(text: str, target: str, source: str = "en", retries: int = 3) -> str:
    if not text.strip():
        return text

    url = os.environ.get("LIBRETRANSLATE_URL", "https://libretranslate.com").rstrip("/") + "/translate"
    api_key = os.environ.get("LIBRETRANSLATE_API_KEY")

    payload = {
        "q": text,
        "source": source,
        "target": target,
        "format": "text",
    }
    if api_key:
        payload["api_key"] = api_key

    data = urllib.parse.urlencode(payload).encode("utf-8")
    last_error: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(url, data=data, timeout=30) as response:
                body = response.read().decode("utf-8")
                parsed = json.loads(body)
                return parsed.get("translatedText", text)
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code in {403, 429}:
                raise exc
            time.sleep(0.5 * attempt)
        except Exception as exc:
            last_error = exc
            time.sleep(0.5 * attempt)
    if last_error:
        print(f"Translate failed ({target}): {last_error}")
    return text


def try_argos_translate(text: str, target: str, source: str = "en") -> Optional[str]:
    try:
        import argostranslate.translate as ar_translate
    except Exception:
        return None

    try:
        languages = ar_translate.get_installed_languages()
        from_lang = next((lang for lang in languages if lang.code == source), None)
        to_lang = next((lang for lang in languages if lang.code == target), None)
        if not from_lang or not to_lang:
            return None
        translation = from_lang.get_translation(to_lang)
        return translation.translate(text)
    except Exception:
        return None


class TranslatorHTML(HTMLParser):
    def __init__(self, target_lang: str, cache: Dict[str, str], state: Dict[str, bool]):
        super().__init__(convert_charrefs=False)
        self.target_lang = target_lang
        self.cache = cache
        self.state = state
        self.output: List[str] = []
        self.tag_stack: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        raw = self.get_starttag_text() or ""
        self.tag_stack.append(tag.lower())

        if not attrs:
            self.output.append(raw)
            return

        # Replace selected attributes with translations where appropriate.
        updated = raw
        for name, value in attrs:
            if not value or name.lower() not in TRANSLATABLE_ATTRS:
                continue
            if looks_like_url(value):
                continue
            translated = translate_cached(value, self.target_lang, self.cache, self.state)
            if translated != value:
                # Replace only this attribute value inside the raw tag
                pattern = re.compile(rf"({re.escape(name)}\s*=\s*['\"])({re.escape(value)})(['\"])", re.IGNORECASE)
                updated = pattern.sub(rf"\1{escape_quotes(translated)}\3", updated, count=1)
        self.output.append(updated)

    def handle_endtag(self, tag: str):
        if self.tag_stack:
            self.tag_stack.pop()
        self.output.append(f"</{tag}>")

    def handle_startendtag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        raw = self.get_starttag_text() or ""
        # Treat like start tag for attribute translation, then close.
        if not attrs:
            self.output.append(raw)
            return
        updated = raw
        for name, value in attrs:
            if not value or name.lower() not in TRANSLATABLE_ATTRS:
                continue
            if looks_like_url(value):
                continue
            translated = translate_cached(value, self.target_lang, self.cache, self.state)
            if translated != value:
                pattern = re.compile(rf"({re.escape(name)}\s*=\s*['\"])({re.escape(value)})(['\"])", re.IGNORECASE)
                updated = pattern.sub(rf"\1{escape_quotes(translated)}\3", updated, count=1)
        self.output.append(updated)

    def handle_data(self, data: str):
        if not data.strip():
            self.output.append(data)
            return
        if any(tag in SKIP_TAGS for tag in self.tag_stack):
            self.output.append(data)
            return
        if looks_like_url(data):
            self.output.append(data)
            return
        translated = translate_cached(data, self.target_lang, self.cache, self.state)
        self.output.append(translated)

    def handle_entityref(self, name: str):
        self.output.append(f"&{name};")

    def handle_charref(self, name: str):
        self.output.append(f"&#{name};")

    def handle_comment(self, data: str):
        self.output.append(f"<!--{data}-->")

    def get_output(self) -> str:
        return "".join(self.output)


def escape_quotes(text: str) -> str:
    return text.replace("\"", "&quot;")


def looks_like_url(text: str) -> bool:
    trimmed = text.strip().lower()
    return trimmed.startswith("http://") or trimmed.startswith("https://") or trimmed.startswith("/")


def translate_cached(text: str, target: str, cache: Dict[str, str], state: Dict[str, bool]) -> str:
    key = f"{target}::{text}"
    if key in cache:
        return cache[key]
    translated = text
    if not state.get("libre_blocked"):
        try:
            translated = call_libretranslate(text, target)
        except urllib.error.HTTPError as exc:
            if exc.code in {403, 429}:
                state["libre_blocked"] = True
                print("LibreTranslate blocked or rate-limited. Falling back to Argos if available.")
            else:
                print(f"Translate failed ({target}): {exc}")

    if translated == text:
        argos = try_argos_translate(text, target)
        if argos:
            translated = argos
    cache[key] = translated
    time.sleep(0.05)
    return translated


def preflight_translation(languages: List[str], cache: Dict[str, str], state: Dict[str, bool]) -> None:
    def has_argos_languages() -> bool:
        try:
            import argostranslate.translate as ar_translate
        except Exception:
            return False
        try:
            languages_installed = ar_translate.get_installed_languages()
            codes = {lang.code for lang in languages_installed}
            return "en" in codes and ("es" in codes or "pt" in codes)
        except Exception:
            return False

    if has_argos_languages():
        return

    sample = "Immigrate to Brazil"
    for lang in languages:
        translated = translate_cached(sample, lang, cache, state)
        if translated.strip() != sample:
            return

    print("No working translation backend found.")
    print("Options:")
    print("- Set LIBRETRANSLATE_URL + (optional) LIBRETRANSLATE_API_KEY")
    print("- Install Argos Translate with language packs (en->es, en->pt)")
    raise SystemExit(1)


def update_html_lang(content: str, lang: str) -> str:
    if re.search(r"<html\s+[^>]*lang=", content, re.IGNORECASE):
        return re.sub(r"(<html\s+[^>]*lang=['\"])([^'\"]+)(['\"])", rf"\1{lang}\3", content, flags=re.IGNORECASE)
    return re.sub(r"<html(\s*[^>]*)>", rf"<html\1 lang=\"{lang}\">", content, count=1, flags=re.IGNORECASE)


def insert_hreflang_block(content: str, base_url: str, rel_path: str) -> str:
    rel_path = rel_path.replace("\\", "/")
    if rel_path.endswith("/index.html"):
        rel_path = rel_path[:-10] + "/"
    if rel_path == "index.html":
        rel_path = ""

    base_url = base_url.rstrip("/")
    en_url = f"{base_url}/{rel_path}".replace("//", "/").replace("https:/", "https://")
    es_url = f"{base_url}/es/{rel_path}".replace("//", "/").replace("https:/", "https://")
    pt_url = f"{base_url}/pt/{rel_path}".replace("//", "/").replace("https:/", "https://")

    hreflang_block = (
        f"    <link rel=\"alternate\" hreflang=\"en\" href=\"{en_url}\"/>\n"
        f"    <link rel=\"alternate\" hreflang=\"es\" href=\"{es_url}\"/>\n"
        f"    <link rel=\"alternate\" hreflang=\"pt\" href=\"{pt_url}\"/>\n"
    )

    # Remove existing hreflang links
    content = re.sub(r"\s*<link[^>]+hreflang=['\"][^'\"]+['\"][^>]*>\s*", "\n", content, flags=re.IGNORECASE)

    # Insert before </head>
    return re.sub(r"</head>", hreflang_block + "</head>", content, count=1, flags=re.IGNORECASE)


def iter_html_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.lower().endswith(".html"):
                yield Path(dirpath, name)


def update_language_switcher(root: Path) -> None:
    partial = root / "partials" / "language-switcher.html"
    if not partial.exists():
        return
    content = partial.read_text(encoding="utf-8")
    content = re.sub(r"href=['\"]/pt/['\"]", "href=\"/pt/\"", content)
    content = re.sub(r"href=['\"]/es/['\"]", "href=\"/es/\"", content)
    content = re.sub(r"href=['\"]/['\"]", "href=\"/\"", content)
    partial.write_text(content, encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Translate HTML files and add hreflang.")
    parser.add_argument("--root", default=None, help="Site root. Default: workspace root.")
    parser.add_argument("--base-url", default="https://www.immigratetobrazil.com", help="Base URL for hreflang.")
    parser.add_argument("--max-files", type=int, default=0, help="Limit number of HTML files processed (0 = all).")
    parser.add_argument("--force", action="store_true", help="Re-translate even if target files already exist.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    ROOT = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[1]

    if not ROOT.exists():
        print(f"Error: root does not exist: {ROOT}")
        raise SystemExit(1)

    update_language_switcher(ROOT)

    cache_path = ROOT / "scripts" / CACHE_FILENAME
    cache: Dict[str, str] = load_cache(cache_path)
    state = {"libre_blocked": False}

    preflight_translation(LANGUAGES, cache, state)
    total = 0
    try:
        for html_file in iter_html_files(ROOT):
            total += 1
            rel_path = html_file.relative_to(ROOT).as_posix()

            source = html_file.read_text(encoding="utf-8")
            source = update_html_lang(source, "en")
            source = insert_hreflang_block(source, args.base_url, rel_path)
            html_file.write_text(source, encoding="utf-8")

            for lang in LANGUAGES:
                target_path = ROOT / lang / rel_path
                if not args.force and target_path.exists():
                    continue
                target_path.parent.mkdir(parents=True, exist_ok=True)

                parser = TranslatorHTML(lang, cache, state)
                parser.feed(source)
                translated = parser.get_output()

                translated = update_html_lang(translated, lang)
                translated = insert_hreflang_block(translated, args.base_url, f"{lang}/{rel_path}")
                target_path.write_text(translated, encoding="utf-8")

            if total % 50 == 0:
                print(f"Translated {total} files...")

            if args.max_files and total >= args.max_files:
                break
    except KeyboardInterrupt:
        print("\nInterrupted. Saving cache and exiting...")
    finally:
        save_cache(cache_path, cache)

    print("\nDone.")
    print(f"Total source HTML files processed: {total}")
    print("Generated /es and /pt versions.")
