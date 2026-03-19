from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from bs4 import BeautifulSoup, Comment


ROOT = Path(__file__).resolve().parents[1]
SITE_DOMAIN = "https://immigratetobrazil.com"
PT_PREFIX = "/pt-br"
GENERATOR_VERSION = "2026-03-19-pt-br-v1"

I18N_DIR = ROOT / "i18n" / "pt-br"
GLOSSARY_PATH = I18N_DIR / "glossary.json"
OVERRIDES_PATH = I18N_DIR / "overrides.json"
MEMORY_PATH = I18N_DIR / "translation-memory.json"
MANIFEST_PATH = I18N_DIR / "manifest.json"

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
    "pt-br",
    "reports",
    "scripts",
    "templates",
}

TEXT_SKIP_TAGS = {
    "script",
    "style",
    "noscript",
    "svg",
    "path",
    "code",
    "pre",
}

ATTRIBUTE_TRANSLATORS = (
    ("meta", {"name": "description"}, "content"),
    ("meta", {"property": "og:title"}, "content"),
    ("meta", {"property": "og:description"}, "content"),
    ("meta", {"name": "twitter:title"}, "content"),
    ("meta", {"name": "twitter:description"}, "content"),
)

TEXT_ATTRIBUTES = ("aria-label", "placeholder", "title", "alt")
SAME_SITE_HOSTS = {"immigratetobrazil.com", "www.immigratetobrazil.com"}

LANG_SWITCHER_RE = re.compile(
    r"(?P<indent>[ \t]*)<div class=\"lang-switcher lang-switcher--minimal\" aria-label=\"Language switcher\">[\s\S]*?</div>",
    re.MULTILINE,
)
CANONICAL_BLOCK_RE = re.compile(
    r"(?P<indent>[ \t]*)<link rel=\"canonical\" href=\"[^\"]+\" />\n(?:(?P=indent)<link rel=\"alternate\" hreflang=\"[^\"]+\" href=\"[^\"]+\" />\n)*",
    re.MULTILINE,
)
WINDOW_CONFIG_RE = re.compile(r"window\.ITB_SITE\s*=\s*(\{.*?\});", re.DOTALL)


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf8")).hexdigest()


def load_json(path: Path, default):
    if not path.exists():
        return default
    with path.open("r", encoding="utf8") as handle:
        return json.load(handle)


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")


def route_from_file(file_path: Path) -> str:
    if file_path == ROOT / "index.html":
        return "/"
    relative = file_path.relative_to(ROOT).parent.as_posix()
    return f"/{relative}/"


def english_url(route: str) -> str:
    return SITE_DOMAIN if route == "/" else f"{SITE_DOMAIN}{route}"


def pt_route(route: str) -> str:
    if route == "/":
        return "/pt-br/"
    return f"{PT_PREFIX}{route}"


def pt_url(route: str) -> str:
    return f"{SITE_DOMAIN}{pt_route(route)}"


def route_to_file(route: str) -> Path:
    if route == "/":
        return ROOT / "index.html"
    return ROOT / route.strip("/") / "index.html"


def discover_english_routes() -> list[tuple[str, Path]]:
    route_files: list[tuple[str, Path]] = []

    def walk(directory: Path) -> None:
        for entry in sorted(directory.iterdir(), key=lambda item: item.name):
            if entry.is_dir():
                if entry.name in IGNORED_DIRS:
                    continue
                walk(entry)
                continue
            if entry.name != "index.html":
                continue
            route_files.append((route_from_file(entry), entry))

    walk(ROOT)
    return sorted(route_files, key=lambda item: item[0])


def normalize_translatable_text(value: str) -> str:
    return value.strip()


def should_skip_translation(value: str) -> bool:
    clean = normalize_translatable_text(value)
    if not clean:
        return True
    if clean in {"EN", "PT"}:
        return True
    if not re.search(r"[A-Za-z]", clean):
        return True
    if re.fullmatch(r"[A-Z0-9/&+_.\- ]{2,}", clean):
        return True
    if clean.startswith("http://") or clean.startswith("https://"):
        return True
    if "@" in clean and " " not in clean:
        return True
    return False


def preserve_outer_whitespace(original: str, translated_core: str) -> str:
    match = re.match(r"^(\s*)(.*?)(\s*)$", original, re.DOTALL)
    if not match:
        return translated_core
    return f"{match.group(1)}{translated_core}{match.group(3)}"


def localize_whatsapp_url(url: str, translate_text_fn) -> str:
    try:
        parts = urlsplit(url)
    except ValueError:
        return url
    if "wa.me" not in parts.netloc:
        return url
    params = dict(parse_qsl(parts.query, keep_blank_values=True))
    if "text" in params and params["text"].strip():
        params["text"] = translate_text_fn(params["text"])
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(params), parts.fragment))


def looks_like_file(path_value: str) -> bool:
    return bool(re.search(r"/[^/]+\.[A-Za-z0-9]+$", path_value))


def localize_internal_url(url: str) -> str:
    if not url or url.startswith("#"):
        return url
    try:
        parts = urlsplit(url)
    except ValueError:
        return url

    if parts.scheme in {"mailto", "tel", "javascript", "data"}:
        return url

    if parts.netloc and parts.netloc.lower() not in SAME_SITE_HOSTS:
        return url

    path_value = parts.path or "/"
    if not path_value.startswith("/"):
        return url
    if path_value.startswith("/pt-br/") or path_value == "/pt-br/":
        return url
    if path_value in {"/robots.txt", "/sitemap.xml", "/404.html"}:
        return url
    if path_value.startswith("/assets/") or path_value.startswith("/css/") or path_value.startswith("/js/"):
        return url
    if looks_like_file(path_value):
        return url

    localized_path = pt_route(path_value if path_value.endswith("/") or path_value == "/" else f"{path_value}/")
    if path_value != "/" and not parts.path.endswith("/"):
        localized_path = localized_path.rstrip("/")

    if parts.netloc:
        return urlunsplit((parts.scheme, parts.netloc, localized_path, parts.query, parts.fragment))
    return urlunsplit(("", "", localized_path, parts.query, parts.fragment))


class ArgosEngine:
    def __init__(self) -> None:
        try:
            import argostranslate.package as argos_package
            import argostranslate.translate as argos_translate
        except ImportError as error:
            raise RuntimeError(
                "Missing Argos Translate. Install it with `python3 -m pip install --user argostranslate translatehtml`."
            ) from error

        self.argos_package = argos_package
        self.argos_translate = argos_translate
        self.translation = self._ensure_translation()

    def _ensure_translation(self):
        translation = self._find_installed_translation()
        if translation:
            return translation

        self.argos_package.update_package_index()
        packages = self.argos_package.get_available_packages()
        candidates = [
            package
            for package in packages
            if package.from_code.lower().startswith("en") and package.to_code.lower().startswith("pt")
        ]
        if not candidates:
            raise RuntimeError("No English to Portuguese Argos model is available from the package index.")

        candidates.sort(
            key=lambda package: (
                0 if package.to_code.lower() == "pt_br" else 1,
                0 if "brazil" in (package.to_name or "").lower() else 1,
                package.to_code,
            )
        )
        download_path = candidates[0].download()
        self.argos_package.install_from_path(download_path)

        translation = self._find_installed_translation()
        if not translation:
            raise RuntimeError("Argos model installed, but no English to Portuguese translation was found.")
        return translation

    def _find_installed_translation(self):
        installed_languages = self.argos_translate.get_installed_languages()
        from_languages = [language for language in installed_languages if language.code.lower().startswith("en")]
        to_languages = [language for language in installed_languages if language.code.lower().startswith("pt")]

        preferred = sorted(
            to_languages,
            key=lambda language: (
                0 if language.code.lower() == "pt_br" else 1,
                0 if "brazil" in language.name.lower() else 1,
                language.code,
            ),
        )

        for from_language in from_languages:
            for to_language in preferred:
                translation = from_language.get_translation(to_language)
                if translation:
                    return translation
        return None

    def translate(self, value: str) -> str:
        return self.translation.translate(value)


class PtGenerator:
    def __init__(self, force: bool = False, routes: set[str] | None = None) -> None:
        self.force = force
        self.routes = routes or set()
        self.glossary = load_json(GLOSSARY_PATH, {})
        self.overrides = load_json(OVERRIDES_PATH, {"global": {}, "routes": {}})
        self.memory = load_json(MEMORY_PATH, {})
        self.manifest = load_json(MANIFEST_PATH, {"generator_version": GENERATOR_VERSION, "routes": {}})
        self.engine = ArgosEngine()

    def config_hash_for(self, route: str) -> str:
        payload = {
            "generator_version": GENERATOR_VERSION,
            "glossary": self.glossary,
            "global_overrides": self.overrides.get("global", {}),
            "route_overrides": self.overrides.get("routes", {}).get(route, {}),
        }
        return sha256_text(json.dumps(payload, ensure_ascii=False, sort_keys=True))

    def lookup_override(self, route: str, source: str) -> str | None:
        route_overrides = self.overrides.get("routes", {}).get(route, {})
        if source in route_overrides:
            return route_overrides[source]
        return self.overrides.get("global", {}).get(source)

    def protect_glossary_terms(self, value: str) -> tuple[str, dict[str, str]]:
        protected = value
        placeholders: dict[str, str] = {}
        for index, (source, target) in enumerate(sorted(self.glossary.items(), key=lambda item: len(item[0]), reverse=True)):
            if source not in protected:
                continue
            token = f"ZXQITBTERM{index}QXZ"
            protected = protected.replace(source, token)
            placeholders[token] = target
        return protected, placeholders

    def restore_glossary_terms(self, value: str, placeholders: dict[str, str]) -> str:
        restored = value
        for token, replacement in placeholders.items():
            restored = restored.replace(token, replacement)
        return restored

    def clean_translation(self, value: str) -> str:
        cleaned = value.replace(" ,", ",").replace(" .", ".").replace(" :", ":").replace(" ;", ";")
        cleaned = cleaned.replace(" !", "!").replace(" ?", "?")
        cleaned = re.sub(r"\s{2,}", " ", cleaned)
        return cleaned.strip()

    def translate_text(self, original: str, route: str) -> str:
        if should_skip_translation(original):
            return original

        source = normalize_translatable_text(original)
        if not source:
            return original

        override = self.lookup_override(route, source)
        if override is not None:
            translated = override
        elif source in self.memory:
            translated = self.memory[source]
        else:
            protected, placeholders = self.protect_glossary_terms(source)
            translated = self.engine.translate(protected)
            translated = self.restore_glossary_terms(translated, placeholders)
            translated = self.clean_translation(translated)
            self.memory[source] = translated

        return preserve_outer_whitespace(original, translated)

    def translate_json_ld_value(self, value, route: str, key: str = ""):
        if isinstance(value, dict):
            return {item_key: self.translate_json_ld_value(item_value, route, item_key) for item_key, item_value in value.items()}
        if isinstance(value, list):
            return [self.translate_json_ld_value(item, route, key) for item in value]
        if not isinstance(value, str):
            return value

        if key in {"@context", "@type", "@id", "query-input", "logo", "email", "telephone"}:
            return value
        if key in {"url", "item", "target"}:
            return localize_internal_url(value)
        if key == "sameAs":
            return value
        if value.startswith("http://") or value.startswith("https://"):
            return localize_internal_url(value)
        return normalize_translatable_text(self.translate_text(value, route))

    def patch_window_config(self, soup: BeautifulSoup, route: str) -> None:
        for script in soup.find_all("script"):
            if not script.string or "window.ITB_SITE" not in script.string:
                continue
            match = WINDOW_CONFIG_RE.search(script.string)
            if not match:
                continue
            payload = json.loads(match.group(1))
            payload["pageRoute"] = pt_route(route)
            payload["pageTitle"] = normalize_translatable_text(self.translate_text(payload.get("pageTitle", ""), route))
            contact = payload.get("contact") or {}
            if contact.get("whatsappUrl"):
                contact["whatsappUrl"] = localize_whatsapp_url(
                    contact["whatsappUrl"], lambda text: normalize_translatable_text(self.translate_text(text, route))
                )
            payload["contact"] = contact
            replacement = f"window.ITB_SITE = {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};"
            script.string.replace_with(WINDOW_CONFIG_RE.sub(replacement, script.string, count=1))
            return

    def patch_json_ld(self, soup: BeautifulSoup, route: str) -> None:
        for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
            if not script.string:
                continue
            data = json.loads(script.string)
            translated = self.translate_json_ld_value(data, route)
            script.string.replace_with(json.dumps(translated, ensure_ascii=False, separators=(",", ":")))

    def patch_head_metadata(self, soup: BeautifulSoup, route: str) -> None:
        html_tag = soup.find("html")
        if html_tag:
            html_tag["lang"] = "pt-BR"

        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            title_tag.string.replace_with(self.translate_text(title_tag.string, route))

        for tag_name, attrs, attribute in ATTRIBUTE_TRANSLATORS:
            tag = soup.find(tag_name, attrs=attrs)
            if tag and tag.get(attribute):
                tag[attribute] = normalize_translatable_text(self.translate_text(tag[attribute], route))

        og_url = soup.find("meta", attrs={"property": "og:url"})
        if og_url:
            og_url["content"] = pt_url(route)

        canonical = None
        for link in soup.find_all("link"):
            rel_values = [value.lower() for value in (link.get("rel") or [])]
            if "canonical" in rel_values:
                canonical = link
                break

        for link in list(soup.find_all("link")):
            rel_values = [value.lower() for value in (link.get("rel") or [])]
            if "alternate" in rel_values and link.has_attr("hreflang"):
                link.decompose()

        head = soup.head
        if canonical:
            canonical["href"] = pt_url(route)
            insert_after = canonical
        else:
            insert_after = None

        alternate_specs = [
            ("en", english_url(route)),
            ("pt-BR", pt_url(route)),
            ("x-default", english_url(route)),
        ]

        for hreflang, href in alternate_specs:
            tag = soup.new_tag("link")
            tag["rel"] = "alternate"
            tag["hreflang"] = hreflang
            tag["href"] = href
            if insert_after is not None:
                insert_after.insert_after(tag)
                insert_after = tag
            elif head is not None:
                head.append(tag)
                insert_after = tag

    def patch_language_switcher(self, soup: BeautifulSoup, route: str) -> None:
        switcher = soup.select_one(".lang-switcher.lang-switcher--minimal")
        if not switcher:
            return
        switcher.clear()
        switcher["aria-label"] = "Alternador de idioma"

        en_link = soup.new_tag("a", href=route)
        en_link["class"] = ["lang-link"]
        en_link["data-language-toggle"] = "en"
        en_link["lang"] = "en"
        en_link["hreflang"] = "en"
        en_link.string = "EN"

        divider = soup.new_tag("span")
        divider["aria-hidden"] = "true"
        divider.string = "|"

        pt_link = soup.new_tag("a", href=pt_route(route))
        pt_link["class"] = ["lang-link", "active"]
        pt_link["data-language-toggle"] = "pt-BR"
        pt_link["lang"] = "pt-BR"
        pt_link["hreflang"] = "pt-BR"
        pt_link["aria-current"] = "page"
        pt_link.string = "PT"

        switcher.append(en_link)
        switcher.append(divider)
        switcher.append(pt_link)

    def rewrite_internal_links(self, soup: BeautifulSoup) -> None:
        for tag in soup.find_all(href=True):
            if tag.has_attr("data-language-toggle"):
                continue
            if tag.name == "link":
                continue
            tag["href"] = localize_internal_url(tag["href"])

        for form in soup.find_all(action=True):
            form["action"] = localize_internal_url(form["action"])

    def translate_attributes(self, soup: BeautifulSoup, route: str) -> None:
        for tag in soup.find_all(True):
            if tag.select_one(".lang-switcher.lang-switcher--minimal"):
                continue
            for attribute in TEXT_ATTRIBUTES:
                if tag.has_attr(attribute) and tag[attribute].strip():
                    tag[attribute] = self.translate_text(tag[attribute], route)

    def translate_dom_text(self, soup: BeautifulSoup, route: str) -> None:
        for node in soup.find_all(string=True):
            if isinstance(node, Comment):
                continue
            parent = node.parent
            if parent is None or parent.name in TEXT_SKIP_TAGS:
                continue
            if parent.find_parent(class_="lang-switcher") is not None or parent.get("data-language-toggle"):
                continue
            if parent.get("aria-hidden") == "true":
                continue
            original = str(node)
            if should_skip_translation(original):
                continue
            translated = self.translate_text(original, route)
            if translated != original:
                node.replace_with(translated)

    def render_pt_html(self, source_html: str, route: str) -> str:
        soup = BeautifulSoup(source_html, "lxml")
        self.patch_head_metadata(soup, route)
        self.patch_language_switcher(soup, route)
        self.rewrite_internal_links(soup)
        self.patch_json_ld(soup, route)
        self.patch_window_config(soup, route)
        self.translate_attributes(soup, route)
        self.translate_dom_text(soup, route)

        rendered = soup.decode(formatter="html")
        comment = (
            f"<!-- Generated pt-BR page from {route}. Edit the English HTML or i18n/pt-br/overrides.json, then rerun "
            "npm run translate:pt. -->"
        )
        return f"<!DOCTYPE html>\n{comment}\n{rendered}\n"

    def patch_english_html(self, html: str, route: str) -> str:
        def replace_canonical(match: re.Match) -> str:
            indent = match.group("indent")
            return (
                f'{indent}<link rel="canonical" href="{english_url(route)}" />\n'
                f'{indent}<link rel="alternate" hreflang="en" href="{english_url(route)}" />\n'
                f'{indent}<link rel="alternate" hreflang="pt-BR" href="{pt_url(route)}" />\n'
                f'{indent}<link rel="alternate" hreflang="x-default" href="{english_url(route)}" />\n'
            )

        def replace_switcher(match: re.Match) -> str:
            indent = match.group("indent")
            return (
                f'{indent}<div class="lang-switcher lang-switcher--minimal" aria-label="Language switcher">\n'
                f'{indent}  <a class="lang-link active" data-language-toggle="en" href="{route}" lang="en" hreflang="en" aria-current="page">EN</a>\n'
                f'{indent}  <span aria-hidden="true">|</span>\n'
                f'{indent}  <a class="lang-link" data-language-toggle="pt-BR" href="{pt_route(route)}" lang="pt-BR" hreflang="pt-BR">PT</a>\n'
                f"{indent}</div>"
            )

        updated = CANONICAL_BLOCK_RE.sub(replace_canonical, html, count=1)
        updated = LANG_SWITCHER_RE.sub(replace_switcher, updated, count=1)
        return updated

    def prune_removed_routes(self, current_routes: set[str]) -> None:
        stale_routes = [route for route in self.manifest.get("routes", {}) if route not in current_routes]
        for route in stale_routes:
            target_file = route_to_file(pt_route(route))
            if target_file.exists():
                target_file.unlink()
            self.manifest["routes"].pop(route, None)

    def generate(self) -> tuple[int, int]:
        route_files = discover_english_routes()
        current_routes = {route for route, _ in route_files}
        self.prune_removed_routes(current_routes)

        patched_english = 0
        generated_pt = 0

        for route, file_path in route_files:
            if self.routes and route not in self.routes:
                continue

            source_html = file_path.read_text(encoding="utf8")
            patched_html = self.patch_english_html(source_html, route)
            if patched_html != source_html:
                file_path.write_text(patched_html, encoding="utf8")
                source_html = patched_html
                patched_english += 1

            target_route = pt_route(route)
            target_file = route_to_file(target_route)
            target_file.parent.mkdir(parents=True, exist_ok=True)

            source_hash = sha256_text(source_html + self.config_hash_for(route))
            manifest_entry = self.manifest.get("routes", {}).get(route, {})

            if not self.force and manifest_entry.get("source_hash") == source_hash and target_file.exists():
                continue

            rendered_html = self.render_pt_html(source_html, route)
            target_file.write_text(rendered_html, encoding="utf8")
            self.manifest.setdefault("routes", {})[route] = {
                "pt_route": target_route,
                "source_hash": source_hash,
            }
            generated_pt += 1

        self.manifest["generator_version"] = GENERATOR_VERSION
        write_json(MEMORY_PATH, self.memory)
        write_json(MANIFEST_PATH, self.manifest)
        return patched_english, generated_pt


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate pt-BR static pages from the English HTML source.")
    parser.add_argument("--force", action="store_true", help="Regenerate every pt-BR page instead of only changed pages.")
    parser.add_argument(
        "--route",
        action="append",
        default=[],
        help="Only process one route, for example /about/clients/ . Can be used more than once.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    I18N_DIR.mkdir(parents=True, exist_ok=True)
    generator = PtGenerator(force=args.force, routes=set(args.route))
    patched_english, generated_pt = generator.generate()
    print(f"Patched {patched_english} English pages and generated {generated_pt} pt-BR pages.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
