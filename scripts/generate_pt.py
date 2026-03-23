from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from bs4 import BeautifulSoup, Comment


CPU_COUNT = os.cpu_count() or 4
os.environ.setdefault("ARGOS_DEVICE_TYPE", "cpu")
os.environ.setdefault("ARGOS_INTER_THREADS", str(min(8, CPU_COUNT)))
os.environ.setdefault("ARGOS_BATCH_SIZE", "4096")
os.environ.setdefault("ARGOS_COMPUTE_TYPE", "int8")
os.environ.setdefault("ITB_PT_ENABLE_BATCH", "1")
os.environ.setdefault("ITB_PT_MICRO_BATCH_SIZE", "16")


ROOT = Path(__file__).resolve().parents[1]
SITE_DOMAIN = "https://immigratetobrazil.com"
PT_PREFIX = "/pt-br"
GENERATOR_VERSION = "2026-03-19-pt-br-v2"

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
    "content",
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
    "title",
}

ATTRIBUTE_TRANSLATORS = (
    ("meta", {"name": "description"}, "content"),
    ("meta", {"property": "og:description"}, "content"),
    ("meta", {"name": "twitter:description"}, "content"),
)

TITLE_ATTRIBUTE_TRANSLATORS = (
    ("meta", {"property": "og:title"}, "content"),
    ("meta", {"name": "twitter:title"}, "content"),
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


def current_runtime_has_argos() -> bool:
    try:
        import argostranslate.package  # noqa: F401
        import argostranslate.translate  # noqa: F401
    except ImportError:
        return False
    return True


def runtime_supports_argos(executable: str) -> bool:
    completed = subprocess.run(
        [executable, "-c", "import argostranslate.package, argostranslate.translate"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return completed.returncode == 0


def candidate_python_runtimes() -> list[str]:
    candidates: list[str] = []

    preferred = os.environ.get("ITB_TRANSLATE_PYTHON")
    if preferred:
        candidates.append(preferred)

    for candidate in (
        shutil.which("python3"),
        shutil.which("python"),
        str(ROOT / ".venv" / "bin" / "python"),
    ):
        if not candidate:
            continue
        if candidate not in candidates:
            candidates.append(candidate)

    return candidates


def ensure_argos_runtime() -> None:
    if current_runtime_has_argos():
        return

    current = Path(sys.executable).resolve()
    checked: list[str] = []

    for candidate in candidate_python_runtimes():
        candidate_path = Path(candidate)
        if not candidate_path.exists():
            continue

        try:
            resolved = candidate_path.resolve()
        except OSError:
            resolved = candidate_path

        if resolved == current:
            continue

        checked.append(str(candidate_path))
        if not runtime_supports_argos(str(candidate_path)):
            continue

        print(
            f"Interpreter {sys.executable} is missing Argos Translate; re-running with {candidate_path}.",
            file=sys.stderr,
            flush=True,
        )
        os.execv(str(candidate_path), [str(candidate_path), str(Path(__file__).resolve()), *sys.argv[1:]])

    checked_display = ", ".join(checked) if checked else "none"
    raise RuntimeError(
        f"Missing Argos Translate in {sys.executable}. Checked alternate Python runtimes: {checked_display}. "
        "Install it with `python3 -m pip install --user argostranslate translatehtml`, "
        "or rerun with the Python interpreter that already has Argos installed."
    )


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


def is_within_brand_wordmark(tag) -> bool:
    if tag is None:
        return False
    classes = tag.get("class") or []
    return "brand-wordmark" in classes or tag.find_parent(class_="brand-wordmark") is not None


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
        ensure_argos_runtime()
        try:
            import argostranslate.package as argos_package
            import argostranslate.settings as argos_settings
            import argostranslate.translate as argos_translate
            from argostranslate.translate import ctranslate2
        except ImportError as error:
            raise RuntimeError(
                "Missing Argos Translate. Install it with `python3 -m pip install --user argostranslate translatehtml`."
            ) from error

        self.argos_package = argos_package
        self.argos_settings = argos_settings
        self.argos_translate = argos_translate
        self.ctranslate2 = ctranslate2
        self.argos_settings.device = os.environ["ARGOS_DEVICE_TYPE"]
        self.argos_settings.inter_threads = int(os.environ["ARGOS_INTER_THREADS"])
        self.argos_settings.batch_size = int(os.environ["ARGOS_BATCH_SIZE"])
        self.argos_settings.compute_type = os.environ["ARGOS_COMPUTE_TYPE"]
        self.argos_settings.beam_size = 1
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

    def _underlying_translation(self):
        return self.translation.underlying if hasattr(self.translation, "underlying") else self.translation

    def _ensure_model_loaded(self):
        underlying = self._underlying_translation()
        if getattr(underlying, "translator", None) is None:
            underlying.translator = self.ctranslate2.Translator(
                str(underlying.pkg.package_path / "model"),
                device=self.argos_settings.device,
                inter_threads=self.argos_settings.inter_threads,
                intra_threads=self.argos_settings.intra_threads,
                compute_type=self.argos_settings.compute_type,
            )
        return underlying

    def translate_many(self, values: list[str]) -> list[str]:
        if not values:
            return []

        underlying = self._ensure_model_loaded()
        tokenized = [underlying.pkg.tokenizer.encode(value) for value in values]
        translated_batches = underlying.translator.translate_batch(
            tokenized,
            target_prefix=[[underlying.pkg.target_prefix]] * len(tokenized) if underlying.pkg.target_prefix != "" else None,
            replace_unknowns=True,
            max_batch_size=max(self.argos_settings.batch_size, 4096),
            batch_type="tokens",
            beam_size=1,
            num_hypotheses=1,
            length_penalty=0.2,
            return_scores=False,
        )

        translated_values: list[str] = []
        for batch in translated_batches:
            value = underlying.pkg.tokenizer.decode(batch.hypotheses[0])
            if underlying.pkg.target_prefix != "" and value.startswith(underlying.pkg.target_prefix):
                value = value[len(underlying.pkg.target_prefix) :]
            if value.startswith(" "):
                value = value[1:]
            translated_values.append(value)
        return translated_values


class PtGenerator:
    def __init__(self, force: bool = False, routes: set[str] | None = None) -> None:
        self.force = force
        self.routes = routes or set()
        self.glossary = load_json(GLOSSARY_PATH, {})
        self.overrides = load_json(OVERRIDES_PATH, {"global": {}, "routes": {}})
        self.memory = load_json(MEMORY_PATH, {})
        self.manifest = load_json(MANIFEST_PATH, {"generator_version": GENERATOR_VERSION, "routes": {}})
        self._engine: ArgosEngine | None = None

    @property
    def engine(self) -> ArgosEngine:
        if self._engine is None:
            self._engine = ArgosEngine()
        return self._engine

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

    def translate_missing_batch(self, route: str, values: list[str]) -> None:
        self._translate_missing(values, route=route, respect_route_overrides=True)

    def translate_missing_global(self, values: list[str]) -> None:
        self._translate_missing(values, route="", respect_route_overrides=False)

    def _translate_missing(self, values: list[str], route: str, respect_route_overrides: bool) -> None:
        pending_sources: list[str] = []
        pending_inputs: list[str] = []
        placeholder_sets: list[dict[str, str]] = []

        for source in values:
            if should_skip_translation(source):
                continue
            clean = normalize_translatable_text(source)
            if not clean:
                continue
            has_override = self.lookup_override(route, clean) is not None if respect_route_overrides else clean in self.overrides.get("global", {})
            if has_override or clean in self.memory:
                continue
            protected, placeholders = self.protect_glossary_terms(clean)
            pending_sources.append(clean)
            pending_inputs.append(protected)
            placeholder_sets.append(placeholders)

        if not pending_inputs:
            return

        chunk_size = 256
        batch_enabled = os.environ.get("ITB_PT_ENABLE_BATCH", "1").strip().lower() in {"1", "true", "yes", "on"}
        micro_batch_size = max(1, int(os.environ.get("ITB_PT_MICRO_BATCH_SIZE", "16")))
        total_chunks = (len(pending_inputs) + chunk_size - 1) // chunk_size
        for start in range(0, len(pending_inputs), chunk_size):
            input_chunk = pending_inputs[start : start + chunk_size]
            source_chunk = pending_sources[start : start + chunk_size]
            placeholder_chunk = placeholder_sets[start : start + chunk_size]
            chunk_number = (start // chunk_size) + 1
            print(
                f"Translating chunk {chunk_number}/{total_chunks} ({len(input_chunk)} strings)...",
                flush=True,
            )
            if batch_enabled:
                translated_chunk: list[str] = []
                for micro_start in range(0, len(input_chunk), micro_batch_size):
                    micro_chunk = input_chunk[micro_start : micro_start + micro_batch_size]
                    try:
                        translated_chunk.extend(self.engine.translate_many(micro_chunk))
                    except Exception:
                        translated_chunk.extend([self.engine.translate(value) for value in micro_chunk])
            else:
                translated_chunk = [self.engine.translate(value) for value in input_chunk]

            for source, translated, placeholders in zip(source_chunk, translated_chunk, placeholder_chunk):
                restored = self.restore_glossary_terms(translated, placeholders)
                self.memory[source] = self.clean_translation(restored)
            write_json(MEMORY_PATH, self.memory)

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

    def collect_json_ld_strings(self, value, bucket: set[str], key: str = "") -> None:
        if isinstance(value, dict):
            for item_key, item_value in value.items():
                self.collect_json_ld_strings(item_value, bucket, item_key)
            return
        if isinstance(value, list):
            for item in value:
                self.collect_json_ld_strings(item, bucket, key)
            return
        if not isinstance(value, str):
            return
        if key in {"@context", "@type", "@id", "query-input", "logo", "email", "telephone", "url", "item", "target", "sameAs"}:
            return
        bucket.add(value)

    def collect_title_like_strings(self, value: str, bucket: set[str]) -> None:
        source = normalize_translatable_text(value)
        if not source:
            return
        if "|" not in source:
            bucket.add(value)
            return
        for part in source.split("|"):
            clean_part = part.strip()
            if clean_part:
                bucket.add(clean_part)

    def collect_page_strings(self, soup: BeautifulSoup) -> set[str]:
        values: set[str] = set()

        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            self.collect_title_like_strings(title_tag.string, values)

        for tag_name, attrs, attribute in ATTRIBUTE_TRANSLATORS:
            tag = soup.find(tag_name, attrs=attrs)
            if tag and tag.get(attribute):
                values.add(tag[attribute])

        for tag_name, attrs, attribute in TITLE_ATTRIBUTE_TRANSLATORS:
            tag = soup.find(tag_name, attrs=attrs)
            if tag and tag.get(attribute):
                self.collect_title_like_strings(tag[attribute], values)

        for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
            if not script.string:
                continue
            try:
                data = json.loads(script.string)
            except json.JSONDecodeError:
                continue
            self.collect_json_ld_strings(data, values)

        for script in soup.find_all("script"):
            if not script.string or "window.ITB_SITE" not in script.string:
                continue
            match = WINDOW_CONFIG_RE.search(script.string)
            if not match:
                continue
            data = json.loads(match.group(1))
            if data.get("pageTitle"):
                values.add(data["pageTitle"])
            contact = data.get("contact") or {}
            whatsapp_url = contact.get("whatsappUrl")
            if whatsapp_url:
                try:
                    params = dict(parse_qsl(urlsplit(whatsapp_url).query, keep_blank_values=True))
                except ValueError:
                    params = {}
                if params.get("text"):
                    values.add(params["text"])

        for tag in soup.find_all(True):
            if tag.find_parent(class_="lang-switcher") is not None or "lang-switcher" in (tag.get("class") or []):
                continue
            if tag.get("aria-hidden") == "true":
                continue
            for attribute in TEXT_ATTRIBUTES:
                if tag.has_attr(attribute) and tag[attribute].strip():
                    values.add(tag[attribute])

        for node in soup.find_all(string=True):
            if isinstance(node, Comment):
                continue
            parent = node.parent
            if parent is None or parent.name in TEXT_SKIP_TAGS:
                continue
            if is_within_brand_wordmark(parent):
                continue
            if parent.find_parent(class_="lang-switcher") is not None or parent.get("data-language-toggle"):
                continue
            if parent.get("aria-hidden") == "true":
                continue
            if not should_skip_translation(str(node)):
                values.add(str(node))

        return values

    def prime_translations(self, soup: BeautifulSoup, route: str) -> None:
        self.translate_missing_batch(route, sorted(self.collect_page_strings(soup)))

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

    def translate_shell_value(self, value, route: str, key: str = ""):
        if isinstance(value, dict):
            return {item_key: self.translate_shell_value(item_value, route, item_key) for item_key, item_value in value.items()}
        if isinstance(value, list):
            return [self.translate_shell_value(item, route, key) for item in value]
        if not isinstance(value, str):
            return value
        if key in {"track", "className"}:
            return value
        if key == "href":
            return localize_internal_url(value)
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
            if payload.get("shell"):
                payload["shell"] = self.translate_shell_value(payload["shell"], route)
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
            title_tag.string.replace_with(self.translate_title_like(title_tag.string, route))

        for tag_name, attrs, attribute in ATTRIBUTE_TRANSLATORS:
            tag = soup.find(tag_name, attrs=attrs)
            if tag and tag.get(attribute):
                tag[attribute] = normalize_translatable_text(self.translate_text(tag[attribute], route))

        for tag_name, attrs, attribute in TITLE_ATTRIBUTE_TRANSLATORS:
            tag = soup.find(tag_name, attrs=attrs)
            if tag and tag.get(attribute):
                tag[attribute] = normalize_translatable_text(self.translate_title_like(tag[attribute], route))

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
            if is_within_brand_wordmark(parent):
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
        self.prime_translations(soup, route)
        self.patch_head_metadata(soup, route)
        self.patch_language_switcher(soup, route)
        self.rewrite_internal_links(soup)
        self.patch_json_ld(soup, route)
        self.patch_window_config(soup, route)
        self.translate_attributes(soup, route)
        self.translate_dom_text(soup, route)

        rendered = soup.decode(formatter="html")
        rendered = re.sub(r"^\s*<!DOCTYPE[^>]*>\s*", "", rendered, count=1, flags=re.IGNORECASE)
        comment = (
            f"<!-- Generated pt-BR page from {route}. Edit the English content source under content/en/ or "
            "i18n/pt-br/overrides.json, then rerun "
            "npm run translate:pt. -->"
        )
        return f"<!DOCTYPE html>\n{comment}\n{rendered}\n"

    def translate_title_like(self, original: str, route: str) -> str:
        source = normalize_translatable_text(original)
        if "|" not in source:
            return self.translate_text(original, route)

        translated_parts: list[str] = []
        for part in source.split("|"):
            translated_parts.append(normalize_translatable_text(self.translate_text(part.strip(), route)))
        return preserve_outer_whitespace(original, " | ".join(translated_parts))

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
        prepared_routes: list[tuple[str, str]] = []

        for route, file_path in route_files:
            if self.routes and route not in self.routes:
                continue

            source_html = file_path.read_text(encoding="utf8")
            patched_html = self.patch_english_html(source_html, route)
            if patched_html != source_html:
                file_path.write_text(patched_html, encoding="utf8")
                source_html = patched_html
                patched_english += 1

            prepared_routes.append((route, source_html))

        print(f"Prepared {len(prepared_routes)} English routes for pt-BR generation.", flush=True)
        global_strings: set[str] = set()
        for route, source_html in prepared_routes:
            soup = BeautifulSoup(source_html, "lxml")
            global_strings.update(self.collect_page_strings(soup))

        print(f"Collected {len(global_strings)} unique strings for translation.", flush=True)
        self.translate_missing_global(sorted(global_strings))

        for route, source_html in prepared_routes:
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
            if generated_pt % 10 == 0:
                print(f"Generated {generated_pt}/{len(prepared_routes)} pt-BR pages...", flush=True)

        self.manifest["generator_version"] = GENERATOR_VERSION
        write_json(MEMORY_PATH, self.memory)
        write_json(MANIFEST_PATH, self.manifest)
        return patched_english, generated_pt


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate pt-BR static pages from the English content-driven build output.")
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
