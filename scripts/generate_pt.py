from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import html
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.parse import urlencode as form_urlencode
from urllib.request import Request, urlopen

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
GENERATOR_VERSION = "2026-04-08-pt-br-v8"
TRANSLATION_MEMORY_VERSION = "2026-04-08-hybrid-cache-v2"
BASE_RUNTIME_MODULES = ("bs4",)
ARGOS_RUNTIME_MODULES = ("argostranslate.package", "argostranslate.translate")
DEFAULT_PROVIDER = os.environ.get("ITB_PT_PROVIDER", "hybrid").strip().lower() or "hybrid"
GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
GOOGLE_SPLIT_TOKEN = "ZXQITBSPLITQXZ"
GOOGLE_BATCH_CHAR_LIMIT = max(500, int(os.environ.get("ITB_PT_GOOGLE_BATCH_CHARS", "3500")))
GOOGLE_MAX_RETRIES = max(1, int(os.environ.get("ITB_PT_GOOGLE_MAX_RETRIES", "5")))
GOOGLE_REQUEST_TIMEOUT = max(5, int(os.environ.get("ITB_PT_GOOGLE_TIMEOUT", "60")))
GOOGLE_WORKERS = max(1, int(os.environ.get("ITB_PT_GOOGLE_WORKERS", "4")))
PT_SITE_NAME = "Imigre para o Brasil"
PT_WORDMARK_TOP = "Imigre"
PT_WORDMARK_BOTTOM = "para o Brasil"
PT_BR_NORMALIZATION_RULES = (
    (r"\bImmigrate to Brazil\b", PT_SITE_NAME),
    (r"\bImmigrate to Brasil\b", PT_SITE_NAME),
    (r"\bConsulta de Livro\b", "Agendar consulta"),
    (r"\bConsulta do Livro\b", "Agendar consulta"),
    (r"\bConsulta para Livro\b", "Agendar consulta"),
    (r"\bConsulta de agendamento\b", "Agendar consulta"),
    (r"\bContato em WhatsApp\b", "Contato pelo WhatsApp"),
    (
        r"\bUse WhatsApp se precisar de esclarecimentos operacionais mais rápidos antes de escolher o próximo passo\.",
        "Use o WhatsApp se precisar de um esclarecimento rápido antes de decidir o próximo passo.",
    ),
    (
        r"\bUse a consulta para comparação de rotas, revisão cronológica, planejamento de documentos e orientações mais claras sobre os próximos passos\.",
        "Use a consulta para comparar caminhos possíveis, revisar o histórico do caso, organizar documentos e receber orientação clara sobre os próximos passos.",
    ),
    (
        r"\bOrientação estruturada para imigração, relocação, planejamento de longo prazo e decisões mais tranquilas sobre Brasil\.",
        "Orientação estruturada sobre imigração, mudança para o Brasil, planejamento de longo prazo e decisões mais seguras.",
    ),
    (
        r"\bA representação, a estratégia de arquivamento e o julgamento legal individualizado dependem da rota, da cronologia e do registro de apoio\.",
        "A estratégia jurídica, o protocolo do pedido e a análise individual do caso dependem da via escolhida, do histórico e da documentação de apoio.",
    ),
    (r"\bUso de leitura\b", "Como usar esta leitura"),
    (r"\bArquivar fam[ií]lia\b", "Categoria do arquivo"),
    (r"\bFoco de arquivo\b", "Foco do arquivo"),
    (r"\bIngest[aã]o\b", "Triagem"),
    (r"\bingest[aã]o\b", "triagem"),
    (r"\bApoiando Imigrantes - Promovendo Brasil\b", "Apoiando imigrantes - promovendo o Brasil"),
    (r"\bApoiando Imigrantes - Promovendo o Brasil\b", "Apoiando imigrantes - promovendo o Brasil"),
    (r"\bApoiando imigrantes - promovendo Brasil\b", "Apoiando imigrantes - promovendo o Brasil"),
    (r"\bConsulta Privada\b", "Consulta particular"),
    (r"\bConsulta privada\b", "Consulta particular"),
    (r"\bImigrar para o logotipo Brasil\b", "Logotipo do Imigre para o Brasil"),
    (r"\bLogotipo Imigrar para o Brasil\b", "Logotipo do Imigre para o Brasil"),
    (r"\bLogotipo Immigrate to Brasil\b", "Logotipo do Imigre para o Brasil"),
    (r"\bImigrar para imagem principal da consulta Brasil\b", "Imagem principal da consulta do Imigre para o Brasil"),
    (r"\bImigre para imagem principal da consulta Brasil\b", "Imagem principal da consulta do Imigre para o Brasil"),
    (r"\bPratica juridica\b", "Prática jurídica"),
    (r"\bpratica juridica\b", "prática jurídica"),
    (r"\bBrasil servi[cç]os jur[ií]dicos e de consultoria em imigra[cç][aã]o\b", "Serviços jurídicos e de consultoria em imigração para o Brasil"),
    (r"\badvogada de imigração Brasilian\b", "advogada de imigração brasileira"),
    (r"\bBrasilian advogada de imigração\b", "advogada brasileira de imigração"),
    (r"\bBrasilian advogada\b", "advogada brasileira"),
    (r"\bBrasilian advogado de imigração\b", "advogada de imigração para o Brasil"),
    (r"\bcidadania Brasilian\b", "cidadania brasileira"),
    (r"\blei de imigração Brasiliana\b", "lei de imigração brasileira"),
    (r"\blado Brasilian\b", "lado brasileiro"),
    (r"\bBrasilians\b", "brasileiros"),
    (r"\bBrasilianos\b", "brasileiros"),
    (r"\bBrasiliano\b", "brasileiro"),
    (r"\bBrasiliana\b", "brasileira"),
    (r"\bem Brasil\b", "no Brasil"),
    (r"\bpara Brasil\b", "para o Brasil"),
    (r"\bde Brasil\b", "do Brasil"),
    (r"\bleitura pública\b", "conteúdo público"),
    (r"\bregistro de apoio\b", "documentação de apoio"),
    (r"\bdocumentos comprovantes\b", "documentos de apoio"),
    (r"\bplanejamento de entrada\b", "planejamento da entrada no Brasil"),
    (r"\bcomparação de rotas\b", "comparação de caminhos possíveis"),
    (r"\brevisão cronológica\b", "revisão do histórico do caso"),
    (r"\bplanejamento imigratório\b", "planejamento migratório"),
    (r"\btiming consular\b", "prazos consulares"),
    (r"\bEm termos práticos, esta página é sobre\b", "Na prática, esta página trata de"),
    (r"\bEm termos práticos, esta página explica\b", "Na prática, esta página mostra"),
    (r"\ba conteúdo público\b", "o conteúdo público"),
    (r"\bLeitura relacionada neste site\b", "Leituras relacionadas neste site"),
    (r"\bLeia o artigo\b", "Ler artigo"),
    (r"\bo próximo passo é rever a questão\b", "o próximo passo é analisar a questão"),
    (r"\bPasse do conteúdo público para a consulta\b", "Saia do conteúdo público e parta para a consulta"),
    (r"\bPass[eé] da leitura pública para a consulta\b", "Saia do conteúdo público e parta para a consulta"),
    (r"\bEsta página traz pesquisas anteriores sobre vistos\b", "Esta página reorganiza conteúdo anterior sobre vistos"),
    (r"\bEsta página traz pesquisas anteriores sobre cidadania\b", "Esta página reorganiza conteúdo anterior sobre cidadania"),
    (r"\bEsta página traz pesquisas anteriores sobre residência\b", "Esta página reorganiza conteúdo anterior sobre residência"),
    (r"\bBest Next Step\b", "Melhor próximo passo"),
    (r"\bHow To Use This Hub\b", "Como usar este hub"),
    (r"\bReading Lens\b", "Lente de leitura"),
    (r"\bEvergreen And Timely\b", "Conteúdo duradouro e atual"),
    (r"\bTracking on Filing\b", "Rastreamento do arquivamento"),
    (r"\bTiming\b", "Tempo"),
    (r"\bpano de fundo Brasil para a seção\b", "pano de fundo para a seção"),
    (r"\bplano de fundo Brasil para a seção\b", "plano de fundo para a seção"),
    (r"\bfundo Brasil para a seção\b", "fundo para a seção"),
    (r"\bem um formato mais claro\b", "de forma mais clara"),
    (
        r"Esta página reorganiza conteúdo anterior sobre vistos em um formato de planejamento da entrada no Brasil mais claro para Imigrar para o Brasil\.",
        "Esta página reorganiza conteúdo anterior sobre vistos para facilitar o planejamento da entrada no Brasil.",
    ),
    (r"\bFactos\b", "Fatos"),
    (r"\bfactos\b", "fatos"),
    (r"\bRegistos\b", "Registros"),
    (r"\bregistos\b", "registros"),
    (r"\bRegisto\b", "Registro"),
    (r"\bregisto\b", "registro"),
    (r"\bPlaneamento\b", "Planejamento"),
    (r"\bplaneamento\b", "planejamento"),
    (r"\bComprovativo\b", "Comprovante"),
    (r"\bcomprovativo\b", "comprovante"),
    (r"\bComprovativos\b", "Comprovantes"),
    (r"\bcomprovativos\b", "comprovantes"),
    (r"\bObjectivo\b", "Objetivo"),
    (r"\bobjectivo\b", "objetivo"),
    (r"\bObjectivos\b", "Objetivos"),
    (r"\bobjectivos\b", "objetivos"),
    (r"\bAfecta\b", "Afeta"),
    (r"\bafecta\b", "afeta"),
    (r"\bAfectam\b", "Afetam"),
    (r"\bafectam\b", "afetam"),
    (r"\bAfectar\b", "Afetar"),
    (r"\bafectar\b", "afetar"),
    (r"\bo Brasilian\b", "o brasileiro"),
    (r"\ba Brasilian\b", "a brasileira"),
    (r"\bos Brasilian\b", "os brasileiros"),
    (r"\bas Brasilian\b", "as brasileiras"),
    (r"\bum Brasilian\b", "um brasileiro"),
    (r"\buma Brasilian\b", "uma brasileira"),
    (r"\bem Brasilian\b", "no Brasil"),
    (r"\bTempo entre Brasilian e etapas estrangeiras\b", "Tempo entre etapas brasileiras e estrangeiras"),
    (r"\bBrasilian os municípios\b", "Os municípios brasileiros"),
    (r"\bdo Brasilian do exterior\b", "brasileiras no exterior"),
    (r"\bpratica juridica\b", "prática jurídica"),
    (r"\bPratica juridica\b", "Prática jurídica"),
    (r"\bbrasileira lei de imigração\b", "lei de imigração brasileira"),
    (r"\bcronometragem\b", "prazo"),
    (r"\bAs advogadas Monique e Monique Fernandes explicam\b", "Monique Fernandes explica"),
    (r"\bA advogada Monique e Monique Fernandes explica\b", "Monique Fernandes explica"),
    (r"\bMonique e Monique Fernandes\b", "Monique Fernandes"),
    (r"\bonde Brasil a vida\b", "onde a vida no Brasil"),
    (r"\bAs perguntas Brasil\b", "As perguntas sobre o Brasil"),
    (r"\bperguntas Brasil\b", "perguntas sobre o Brasil"),
    (r"\bsobre Brasil\b", "sobre o Brasil"),
    (r"\bseu assunto Brasil\b", "seu assunto relacionado ao Brasil"),
    (r"\bassunto Brasil\b", "assunto relacionado ao Brasil"),
    (r"\badmiração por Brasil\b", "admiração pelo Brasil"),
    (r"\bA advogada(?: de imigração)? Monique Fernandes e a advogada(?: de imigração)? Monique Fernandes explicam\b", "Monique Fernandes explica"),
    (r"\bAs advogadas(?: de imigração)? Monique Fernandes e a advogada(?: de imigração)? Monique Fernandes explicam\b", "Monique Fernandes explica"),
    (r"\bA advogada Monique Fernandes e a advogada(?: de imigração)? Monique Fernandes explicam\b", "Monique Fernandes explica"),
    (r"\bAs advogadas Monique Fernandes e a advogada(?: de imigração)? Monique Fernandes explicam\b", "Monique Fernandes explica"),
    (r"\bBrasilian cidadãos\b", "cidadãos brasileiros"),
    (r"\bBrasilian advogado\b", "advogada brasileira"),
    (r"\bimigração Brasil\b", "imigração para o Brasil"),
    (r"\bresidência Brasil\b", "residência para o Brasil"),
    (r"\bvisto Brasil\b", "visto para o Brasil"),
    (r"\b(Norte|Nordeste|Centro-Oeste|Sudeste|Sul) Brasil\b", r"\1 do Brasil"),
    (r"\b(norte|nordeste|centro-oeste|sudeste|sul) Brasil\b", r"\1 do Brasil"),
)
BRAZILIAN_PREFIX_NOUN_MAP = {
    "Autorização": "Autorização",
    "autorização": "autorização",
    "Cidades": "Cidades",
    "cidades": "cidades",
    "Culture": "Cultura",
    "culture": "cultura",
    "Cuisine": "Culinária",
    "cuisine": "culinária",
    "Cultura": "Cultura",
    "cultura": "cultura",
    "Estados": "Estados",
    "estados": "estados",
    "municípios": "municípios",
    "Municípios": "Municípios",
    "Requisitos": "Requisitos",
    "requisitos": "requisitos",
    "States": "Estados",
    "states": "estados",
}
BRAZILIAN_STOPWORDS = {
    "a",
    "ao",
    "as",
    "com",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "entre",
    "na",
    "nas",
    "no",
    "nos",
    "o",
    "os",
    "para",
    "por",
    "sem",
    "sob",
    "um",
    "uma",
}

I18N_DIR = ROOT / "i18n" / "pt-br"
GLOSSARY_PATH = I18N_DIR / "glossary.json"
OVERRIDES_PATH = I18N_DIR / "overrides.json"
MEMORY_PATH = I18N_DIR / "translation-memory.json"
MANIFEST_PATH = I18N_DIR / "manifest.json"
TRANSLATION_REQUIREMENTS_PATH = ROOT / "requirements-pt-translation.txt"
PARTIALS_EN_DIR = ROOT / "partials" / "en"
PARTIALS_PT_DIR = ROOT / "partials" / "pt-br"

BeautifulSoup = None
Comment = None
HTML_PARSER = "html.parser"

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
    ("meta", {"name": "author"}, "content"),
    ("meta", {"name": "description"}, "content"),
    ("meta", {"property": "og:description"}, "content"),
    ("meta", {"property": "og:image:alt"}, "content"),
    ("meta", {"property": "og:site_name"}, "content"),
    ("meta", {"name": "twitter:description"}, "content"),
    ("meta", {"name": "twitter:image:alt"}, "content"),
)

TITLE_ATTRIBUTE_TRANSLATORS = (
    ("meta", {"property": "og:title"}, "content"),
    ("meta", {"name": "twitter:title"}, "content"),
)

TEXT_ATTRIBUTES = (
    "aria-label",
    "placeholder",
    "title",
    "alt",
    "data-nav-label",
    "data-topic",
    "data-section-image-alt",
    "data-section-image-description",
)
SAME_SITE_HOSTS = {"immigratetobrazil.com", "www.immigratetobrazil.com"}
SHARED_SCHEMA_FRAGMENT_PREFIXES = (
    "organization",
    "website",
    "contact-primary",
    "legal-practice",
    "person-",
    "service-family-",
    "service-",
    "catalog-",
    "place-brazil",
)

LANG_SWITCHER_RE = re.compile(
    r"(?P<indent>[ \t]*)<div class=\"lang-switcher lang-switcher--minimal\" aria-label=\"Language switcher\">[\s\S]*?</div>",
    re.MULTILINE,
)
CANONICAL_BLOCK_RE = re.compile(
    r"(?P<indent>[ \t]*)<link rel=\"canonical\" href=\"[^\"]+\" />\n(?:(?P=indent)<link rel=\"alternate\" hreflang=\"[^\"]+\" href=\"[^\"]+\" />\n)*",
    re.MULTILINE,
)
WINDOW_CONFIG_RE = re.compile(r"window\.ITB_SITE\s*=\s*(\{.*?\});", re.DOTALL)


def import_translation_runtime_modules() -> None:
    global BeautifulSoup, Comment, HTML_PARSER

    if BeautifulSoup is not None and Comment is not None:
        return

    import importlib

    bs4 = importlib.import_module("bs4")
    try:
        importlib.import_module("lxml")
        HTML_PARSER = "lxml"
    except ImportError:
        HTML_PARSER = "html.parser"
    BeautifulSoup = bs4.BeautifulSoup
    Comment = bs4.Comment


def current_runtime_has_base_runtime() -> bool:
    try:
        import_translation_runtime_modules()
    except ImportError:
        return False
    return True


def runtime_supports_modules(executable: str, modules: tuple[str, ...]) -> bool:
    probe = f"import importlib; [importlib.import_module(module) for module in {list(modules)!r}]"
    try:
        completed = subprocess.run(
            [executable, "-c", probe],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    except OSError:
        return False
    return completed.returncode == 0


def missing_modules_for_runtime(executable: str) -> list[str]:
    missing: list[str] = []
    for module in BASE_RUNTIME_MODULES:
        if not runtime_supports_modules(executable, (module,)):
            missing.append(module)
    return missing


def discover_local_python_runtimes() -> list[str]:
    candidates: list[str] = []
    seen: set[str] = set()

    for pattern in (".venv", ".venv-*", ".venv*", "venv", "venv-*", "venv*"):
        for directory in sorted(ROOT.glob(pattern), key=lambda item: item.name):
            python_path = directory / "bin" / "python"
            candidate = str(python_path)
            if not python_path.exists() or candidate in seen:
                continue
            seen.add(candidate)
            candidates.append(candidate)

    return candidates


def candidate_python_runtimes() -> list[str]:
    candidates: list[str] = []

    for candidate in (
        os.path.join(os.environ.get("VIRTUAL_ENV", ""), "bin", "python") if os.environ.get("VIRTUAL_ENV") else None,
        os.environ.get("ITB_TRANSLATE_PYTHON"),
        *discover_local_python_runtimes(),
        shutil.which("python3"),
        shutil.which("python"),
    ):
        if not candidate:
            continue
        if candidate not in candidates:
            candidates.append(candidate)

    return candidates


def install_hint_for(executable: str) -> str:
    requirements_target = TRANSLATION_REQUIREMENTS_PATH.relative_to(ROOT).as_posix()
    return (
        f"`{executable} -m pip install -r {requirements_target}` "
        f"from {ROOT}"
    )


def ensure_base_runtime() -> None:
    if current_runtime_has_base_runtime():
        return

    current = Path(sys.executable).absolute()
    checked: list[str] = []

    for candidate in candidate_python_runtimes():
        candidate_path = Path(candidate).absolute()
        if not candidate_path.exists():
            continue

        # A venv Python can resolve to the same underlying system interpreter
        # while still carrying a different site-packages environment, so compare
        # the actual executable path instead of the resolved target.
        if candidate_path == current:
            continue

        checked.append(str(candidate_path))
        if not runtime_supports_modules(str(candidate_path), BASE_RUNTIME_MODULES):
            continue

        print(
            f"Interpreter {sys.executable} is missing PT HTML parsing dependencies; re-running with {candidate_path}.",
            file=sys.stderr,
            flush=True,
        )
        os.execv(str(candidate_path), [str(candidate_path), str(Path(__file__).resolve()), *sys.argv[1:]])

    checked_display = ", ".join(checked) if checked else "none"
    missing_display = ", ".join(missing_modules_for_runtime(str(current))) or "unknown"
    raise RuntimeError(
        f"Missing PT translation dependencies in {sys.executable}: {missing_display}. "
        f"Checked alternate Python runtimes: {checked_display}. "
        f"Install them with {install_hint_for(sys.executable)}, or rerun with a Python interpreter "
        "that already has BeautifulSoup available."
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
    with tempfile.NamedTemporaryFile("w", encoding="utf8", dir=path.parent, delete=False) as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")
        temp_name = handle.name
    os.replace(temp_name, path)


def load_translation_memory(path: Path, *, provider: str) -> dict[str, str]:
    payload = load_json(path, {})
    if not isinstance(payload, dict):
        return {}

    if "_meta" in payload or "entries" in payload:
        meta = payload.get("_meta", {})
        entries = payload.get("entries", {})
        version = str(meta.get("version", ""))
        cached_provider = str(meta.get("provider", ""))
        if (
            version == TRANSLATION_MEMORY_VERSION
            and cached_provider == provider
            and isinstance(entries, dict)
        ):
            return {key: value for key, value in entries.items() if isinstance(key, str) and isinstance(value, str)}
        print(
            f"Discarding stale translation memory cache from {path.name} "
            f"(version={version or 'unknown'}, provider={cached_provider or 'unknown'}).",
            flush=True,
        )
        return {}

    if payload:
        print(
            f"Discarding legacy translation memory from {path.name} so the {provider} provider can rebuild clean PT-BR text.",
            flush=True,
        )
    return {}


def write_translation_memory(path: Path, entries: dict[str, str], *, provider: str) -> None:
    write_json(
        path,
        {
            "_meta": {
                "generator_version": GENERATOR_VERSION,
                "provider": provider,
                "version": TRANSLATION_MEMORY_VERSION,
            },
            "entries": entries,
        },
    )


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
                if entry.name in IGNORED_DIRS or entry.name.startswith(".venv") or entry.name.startswith("venv"):
                    continue
                walk(entry)
                continue
            if entry.name != "index.html":
                continue
            route_files.append((route_from_file(entry), entry))

    walk(ROOT)
    return sorted(route_files, key=lambda item: item[0])


def discover_english_partials() -> list[tuple[str, Path]]:
    if not PARTIALS_EN_DIR.exists():
        return []
    return sorted(
        ((entry.name, entry) for entry in PARTIALS_EN_DIR.iterdir() if entry.is_file() and entry.suffix == ".html"),
        key=lambda item: item[0],
    )


def normalize_translatable_text(value: str) -> str:
    normalized = value.strip()
    for _ in range(4):
        decoded = html.unescape(normalized)
        if decoded == normalized:
            break
        normalized = decoded
    return normalized.strip()


def adjective_for_brazilian_noun(noun: str) -> str:
    lower = noun.lower()
    if lower.endswith(("ções", "sões", "dades", "gens", "agens", "tudes", "ices", "izes", "as")):
        return "brasileiras"
    if lower.endswith(("ção", "são", "dade", "gem", "agem", "tude", "ice", "iz", "a")):
        return "brasileira"
    if lower.endswith("s"):
        return "brasileiros"
    return "brasileiro"


def normalize_brazilian_phrases(value: str) -> str:
    def replace_postfixed(match: re.Match) -> str:
        noun = match.group("noun")
        if noun.lower() in BRAZILIAN_STOPWORDS:
            return match.group(0)
        return f"{noun} {adjective_for_brazilian_noun(noun)}"

    def replace_prefixed(match: re.Match) -> str:
        noun = match.group("noun")
        mapped = BRAZILIAN_PREFIX_NOUN_MAP.get(noun)
        if not mapped:
            return match.group(0)
        return f"{mapped} {adjective_for_brazilian_noun(mapped)}"

    normalized = re.sub(r"\b(?P<noun>[A-Za-zÀ-ÿ-]+)\s+Brasilian(?:a|as|o|os)?\b", replace_postfixed, value)
    normalized = re.sub(r"\bBrasilian(?:a|as|o|os)?\s+(?P<noun>[A-Za-zÀ-ÿ-]+)\b", replace_prefixed, normalized)
    return normalized


def should_skip_translation(value: str) -> bool:
    clean = normalize_translatable_text(value)
    if not clean:
        return True
    if clean in {"EN", "PT"}:
        return True
    if not re.search(r"[A-Za-z]", clean):
        return True
    if re.fullmatch(r"[A-Z0-9/&+_.\- ]{2,}", clean):
        compact = re.sub(r"[^A-Z]", "", clean)
        if len(clean.split()) == 1 and len(compact) <= 4:
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
    netloc = parts.netloc.lower()
    if netloc not in {"wa.me", "api.whatsapp.com", "www.whatsapp.com"}:
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


def is_same_site_url(value: str) -> bool:
    try:
        parts = urlsplit(value)
    except ValueError:
        return False
    if not parts.scheme and not parts.netloc and value.startswith("/"):
        return True
    return bool(parts.netloc and parts.netloc.lower() in SAME_SITE_HOSTS)


def is_shared_schema_fragment(fragment: str) -> bool:
    return any(
        fragment == prefix or fragment.startswith(prefix)
        for prefix in SHARED_SCHEMA_FRAGMENT_PREFIXES
    )


def localize_schema_id(value: str) -> str:
    if not value or not is_same_site_url(value):
        return value

    try:
        parts = urlsplit(value)
    except ValueError:
        return value

    fragment = parts.fragment or ""
    path_value = parts.path or "/"

    if fragment and path_value in {"", "/"} and is_shared_schema_fragment(fragment):
        normalized_path = parts.path or ""
        return urlunsplit((parts.scheme, parts.netloc, normalized_path, parts.query, parts.fragment))

    return localize_internal_url(value)


def current_runtime_has_argos_runtime() -> bool:
    return runtime_supports_modules(sys.executable, ARGOS_RUNTIME_MODULES)


def google_joined_separator() -> str:
    return f"\n\n{GOOGLE_SPLIT_TOKEN}\n\n"


def google_split_translations(value: str) -> list[str]:
    return [item.strip() for item in re.split(rf"\s*{GOOGLE_SPLIT_TOKEN}\s*", value)]


class GoogleTranslateEngine:
    def __init__(self) -> None:
        self.batch_char_limit = GOOGLE_BATCH_CHAR_LIMIT
        self.max_retries = GOOGLE_MAX_RETRIES
        self.request_timeout = GOOGLE_REQUEST_TIMEOUT
        self.workers = GOOGLE_WORKERS

    def translate(self, value: str) -> str:
        return self._translate_text(value)

    def translate_many(self, values: list[str]) -> list[str]:
        if not values:
            return []

        translated_values: list[str] = []
        batch: list[str] = []
        batch_chars = 0
        separator = google_joined_separator()
        grouped_batches: list[list[str]] = []

        for value in values:
            projected = len(value) if not batch else batch_chars + len(separator) + len(value)
            if batch and projected > self.batch_char_limit:
                grouped_batches.append(batch)
                batch = []
                batch_chars = 0
            batch.append(value)
            batch_chars = len(value) if len(batch) == 1 else batch_chars + len(separator) + len(value)

        if batch:
            grouped_batches.append(batch)

        if len(grouped_batches) == 1 or self.workers == 1:
            for grouped_batch in grouped_batches:
                translated_values.extend(self._translate_batch(grouped_batch))
            return translated_values

        with ThreadPoolExecutor(max_workers=self.workers) as executor:
            for translated_batch in executor.map(self._translate_batch, grouped_batches):
                translated_values.extend(translated_batch)

        return translated_values

    def _translate_batch(self, values: list[str]) -> list[str]:
        if len(values) == 1:
            return [self.translate(values[0])]

        joined = google_joined_separator().join(values)
        translated = self._translate_text(joined)
        split_values = google_split_translations(translated)
        if len(split_values) != len(values):
            return [self.translate(value) for value in values]
        return split_values

    def _translate_text(self, value: str) -> str:
        params = form_urlencode(
            [("client", "gtx"), ("sl", "en"), ("tl", "pt-BR"), ("dt", "t"), ("q", value)],
            doseq=True,
        )
        request = Request(f"{GOOGLE_TRANSLATE_URL}?{params}", headers={"User-Agent": "Mozilla/5.0"})

        for attempt in range(1, self.max_retries + 1):
            try:
                with urlopen(request, timeout=self.request_timeout) as response:
                    payload = json.loads(response.read().decode("utf8"))
                segments = payload[0] if payload and isinstance(payload[0], list) else []
                translated = "".join(segment[0] for segment in segments if segment and segment[0] is not None).strip()
                if translated:
                    return translated
                raise RuntimeError("Google Translate returned an empty response.")
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as error:
                if attempt == self.max_retries:
                    raise RuntimeError(f"Google Translate request failed after {attempt} attempts: {error}") from error
                time.sleep(min(2 ** (attempt - 1), 8))


class ArgosEngine:
    def __init__(self) -> None:
        if not current_runtime_has_argos_runtime():
            raise RuntimeError(
                f"Argos Translate is not available in {sys.executable}. "
                "Use the `google` or `hybrid` provider, or install Argos in this interpreter."
            )
        try:
            import argostranslate.package as argos_package
            import argostranslate.settings as argos_settings
            import argostranslate.translate as argos_translate
            from argostranslate.translate import ctranslate2
        except ImportError as error:
            raise RuntimeError(
                "Missing Argos Translate modules in the active interpreter."
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


class HybridTranslateEngine:
    def __init__(self) -> None:
        self.google = GoogleTranslateEngine()
        self.argos: ArgosEngine | None = None
        if current_runtime_has_argos_runtime():
            try:
                self.argos = ArgosEngine()
            except RuntimeError:
                self.argos = None

    def translate(self, value: str) -> str:
        try:
            return self.google.translate(value)
        except RuntimeError:
            if self.argos is not None:
                return self.argos.translate(value)
            raise

    def translate_many(self, values: list[str]) -> list[str]:
        try:
            return self.google.translate_many(values)
        except RuntimeError:
            if self.argos is not None:
                return self.argos.translate_many(values)
            raise


class PtGenerator:
    def __init__(
        self,
        force: bool = False,
        resume: bool = False,
        clear_memory: bool = False,
        provider: str = DEFAULT_PROVIDER,
        routes: set[str] | None = None,
    ) -> None:
        ensure_base_runtime()
        self.force = force
        self.resume = resume
        self.provider = provider
        self.routes = routes or set()
        self.glossary = load_json(GLOSSARY_PATH, {})
        self.overrides = load_json(OVERRIDES_PATH, {"global": {}, "routes": {}})
        self.memory = load_translation_memory(MEMORY_PATH, provider=self.provider)
        self.manifest = load_json(MANIFEST_PATH, {"generator_version": GENERATOR_VERSION, "routes": {}, "partials": {}})
        self.manifest.setdefault("routes", {})
        self.manifest.setdefault("partials", {})
        self._engine = None

        if clear_memory:
            self.memory = {}
            write_translation_memory(MEMORY_PATH, self.memory, provider=self.provider)

    @property
    def engine(self):
        if self._engine is None:
            if self.provider == "google":
                self._engine = GoogleTranslateEngine()
            elif self.provider == "argos":
                self._engine = ArgosEngine()
            elif self.provider == "hybrid":
                self._engine = HybridTranslateEngine()
            else:
                raise RuntimeError(f"Unsupported PT translation provider: {self.provider}")
        return self._engine

    def config_hash_for(self, route: str) -> str:
        payload = {
            "generator_version": GENERATOR_VERSION,
            "provider": self.provider,
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
        for pattern, replacement in PT_BR_NORMALIZATION_RULES:
            cleaned = re.sub(pattern, replacement, cleaned)
        cleaned = normalize_brazilian_phrases(cleaned)
        return cleaned.strip()

    def localize_brand_wordmarks(self, soup: BeautifulSoup) -> None:
        for top_line in soup.select(".brand-wordmark__line--top"):
            top_line.string = PT_WORDMARK_TOP
        for bottom_line in soup.select(".brand-wordmark__line--bottom"):
            bottom_line.string = PT_WORDMARK_BOTTOM

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
            write_translation_memory(MEMORY_PATH, self.memory, provider=self.provider)

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
            translated = self.clean_translation(self.memory[source])
            self.memory[source] = translated
        else:
            protected, placeholders = self.protect_glossary_terms(source)
            translated = self.engine.translate(protected)
            translated = self.restore_glossary_terms(translated, placeholders)
            translated = self.clean_translation(translated)
            self.memory[source] = translated

        translated = self.clean_translation(translated)
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

    def collect_shell_strings(self, value, bucket: set[str], key: str = "") -> None:
        if isinstance(value, dict):
            for item_key, item_value in value.items():
                self.collect_shell_strings(item_value, bucket, item_key)
            return
        if isinstance(value, list):
            for item in value:
                self.collect_shell_strings(item, bucket, key)
            return
        if not isinstance(value, str):
            return
        if key in {"track", "className", "image_src", "src", "logo", "icon"}:
            return
        if key == "href":
            return
        if value.startswith("/assets/"):
            return
        if value.startswith("http://") or value.startswith("https://"):
            return
        bucket.add(value)

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
            if data.get("shell"):
                self.collect_shell_strings(data["shell"], values)
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

    def translate_json_ld_value(self, value, route: str, key: str = "", parent: dict | None = None):
        if isinstance(value, dict):
            return {
                item_key: self.translate_json_ld_value(item_value, route, item_key, value)
                for item_key, item_value in value.items()
            }
        if isinstance(value, list):
            if key == "availableLanguage":
                return value
            return [self.translate_json_ld_value(item, route, key, parent) for item in value]
        if not isinstance(value, str):
            return value

        parent_id = ""
        if isinstance(parent, dict):
            parent_id = parent.get("@id", "")
        parent_is_shared = bool(parent_id and is_shared_schema_fragment(urlsplit(parent_id).fragment or ""))

        if key in {"@context", "@type", "query-input", "logo", "email", "telephone"}:
            return value
        if key == "@id":
            return localize_schema_id(value)
        if key == "inLanguage":
            return "pt-BR"
        if key == "availableLanguage":
            return value
        if key in {"url", "target"} and parent_is_shared:
            return value
        if key in {"url", "item", "target"}:
            return localize_internal_url(value)
        if key == "sameAs":
            return localize_whatsapp_url(
                value, lambda text: normalize_translatable_text(self.translate_text(text, route))
            )
        if value.startswith("http://") or value.startswith("https://"):
            return localize_whatsapp_url(
                localize_internal_url(value),
                lambda text: normalize_translatable_text(self.translate_text(text, route)),
            )
        return normalize_translatable_text(self.translate_text(value, route))

    def translate_shell_value(self, value, route: str, key: str = ""):
        if isinstance(value, dict):
            return {item_key: self.translate_shell_value(item_value, route, item_key) for item_key, item_value in value.items()}
        if isinstance(value, list):
            return [self.translate_shell_value(item, route, key) for item in value]
        if not isinstance(value, str):
            return value
        if key in {"track", "className", "image_src", "src", "logo", "icon"}:
            return value
        if key == "href":
            return localize_whatsapp_url(
                localize_internal_url(value),
                lambda text: normalize_translatable_text(self.translate_text(text, route)),
            )
        if value.startswith("/assets/"):
            return value
        if value.startswith("http://") or value.startswith("https://"):
            return localize_whatsapp_url(
                localize_internal_url(value),
                lambda text: normalize_translatable_text(self.translate_text(text, route)),
            )
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
            if payload.get("consultationPolicy"):
                payload["consultationPolicy"] = self.translate_shell_value(payload["consultationPolicy"], route)
            if payload.get("practice"):
                payload["practice"] = self.translate_shell_value(payload["practice"], route)
            replacement = f"window.ITB_SITE = {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};"
            script.string.replace_with(WINDOW_CONFIG_RE.sub(lambda _match: replacement, script.string, count=1))
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
            tag["href"] = localize_whatsapp_url(
                localize_internal_url(tag["href"]),
                lambda text: normalize_translatable_text(self.translate_text(text, "")),
            )

        for form in soup.find_all(action=True):
            form["action"] = localize_whatsapp_url(
                localize_internal_url(form["action"]),
                lambda text: normalize_translatable_text(self.translate_text(text, "")),
            )

    def localize_form_metadata(self, soup: BeautifulSoup, route: str) -> None:
        for form in soup.find_all("form"):
            group = form.get("data-formspree-group")
            if group:
                form["data-formspree-group"] = re.sub(r"-en\b", "-pt", group)

        for input_tag in soup.find_all("input"):
            name = (input_tag.get("name") or "").strip()
            if not name or not input_tag.has_attr("value"):
                continue
            value = str(input_tag.get("value") or "")
            if not value:
                continue

            if name == "form_name":
                input_tag["value"] = re.sub(r"-en\b", "-pt", value)
            elif name == "_subject":
                translated = normalize_translatable_text(self.translate_text(value, route))
                input_tag["value"] = re.sub(r"\|\s*EN\b", "| PT", translated)
            elif name in {"message", "feedback_scope"}:
                input_tag["value"] = normalize_translatable_text(self.translate_text(value, route))
            elif name == "page_route":
                input_tag["value"] = localize_internal_url(value)
            elif name == "page_title":
                input_tag["value"] = self.translate_title_like(value, route)

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
        soup = BeautifulSoup(source_html, HTML_PARSER)
        self.prime_translations(soup, route)
        self.patch_head_metadata(soup, route)
        self.patch_language_switcher(soup, route)
        self.rewrite_internal_links(soup)
        self.localize_form_metadata(soup, route)
        self.patch_json_ld(soup, route)
        self.patch_window_config(soup, route)
        self.translate_attributes(soup, route)
        self.translate_dom_text(soup, route)
        self.localize_brand_wordmarks(soup)

        rendered_nodes: list[str] = []
        for node in soup.contents:
            if isinstance(node, Comment):
                rendered_nodes.append(f"<!--{node}-->")
                continue
            if isinstance(node, str):
                normalized = node.strip()
                if not normalized or normalized.lower() == "html":
                    continue
            rendered_nodes.append(str(node))
        rendered = "".join(rendered_nodes)
        comment = (
            f"<!-- Generated pt-BR page from {route}. Edit the English HTML source or "
            "i18n/pt-br/overrides.json, then rerun "
            "npm run translate:pt. -->"
        )
        return f"<!DOCTYPE html>\n{comment}\n{rendered}\n"

    def render_pt_fragment(self, source_html: str, key: str) -> str:
        soup = BeautifulSoup(source_html, HTML_PARSER)
        self.prime_translations(soup, key)
        self.rewrite_internal_links(soup)
        self.localize_form_metadata(soup, key)
        self.translate_attributes(soup, key)
        self.translate_dom_text(soup, key)
        self.localize_brand_wordmarks(soup)

        rendered_nodes: list[str] = []
        for node in soup.contents:
            if isinstance(node, Comment):
                rendered_nodes.append(f"<!--{node}-->")
                continue
            if getattr(node, "name", None) == "html" and getattr(node, "body", None) is not None:
                for child in node.body.contents:
                    if isinstance(child, str) and not child.strip():
                        continue
                    rendered_nodes.append(str(child))
                continue
            if isinstance(node, str) and not node.strip():
                continue
            rendered_nodes.append(str(node))
        return "".join(rendered_nodes).rstrip() + "\n"

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

    def prune_removed_partials(self, current_partials: set[str]) -> None:
        stale_partials = [name for name in self.manifest.get("partials", {}) if name not in current_partials]
        for name in stale_partials:
            target_file = PARTIALS_PT_DIR / name
            if target_file.exists():
                target_file.unlink()
            self.manifest["partials"].pop(name, None)

    def persist_state(self) -> None:
        self.manifest["generator_version"] = GENERATOR_VERSION
        write_translation_memory(MEMORY_PATH, self.memory, provider=self.provider)
        write_json(MANIFEST_PATH, self.manifest)

    def generate(self) -> tuple[int, int, int, int, int]:
        route_files = discover_english_routes()
        current_routes = {route for route, _ in route_files}
        self.prune_removed_routes(current_routes)
        partial_files = discover_english_partials()
        current_partials = {name for name, _ in partial_files}
        self.prune_removed_partials(current_partials)

        patched_english = 0
        generated_pt = 0
        skipped_cached = 0
        generated_partials = 0
        skipped_cached_partials = 0
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

        print(f"Using PT translation provider: {self.provider}.", flush=True)
        print(f"Prepared {len(prepared_routes)} English routes for pt-BR generation.", flush=True)
        global_strings: set[str] = set()
        for route, source_html in prepared_routes:
            soup = BeautifulSoup(source_html, HTML_PARSER)
            global_strings.update(self.collect_page_strings(soup))

        prepared_partials: list[tuple[str, str]] = []
        for name, file_path in partial_files:
            source_html = file_path.read_text(encoding="utf8")
            prepared_partials.append((name, source_html))
            soup = BeautifulSoup(source_html, HTML_PARSER)
            global_strings.update(self.collect_page_strings(soup))

        print(f"Collected {len(global_strings)} unique strings for translation.", flush=True)
        self.translate_missing_global(sorted(global_strings))

        if self.force and self.resume:
            print("Resume mode is enabled for this full-site PT run.", flush=True)

        for route, source_html in prepared_routes:
            target_route = pt_route(route)
            target_file = route_to_file(target_route)
            target_file.parent.mkdir(parents=True, exist_ok=True)

            source_hash = sha256_text(source_html + self.config_hash_for(route))
            manifest_entry = self.manifest.get("routes", {}).get(route, {})

            cache_matches = manifest_entry.get("source_hash") == source_hash and target_file.exists()

            if (not self.force and cache_matches) or (self.force and self.resume and cache_matches):
                skipped_cached += 1
                continue

            rendered_html = self.render_pt_html(source_html, route)
            target_file.write_text(rendered_html, encoding="utf8")
            self.manifest.setdefault("routes", {})[route] = {
                "pt_route": target_route,
                "source_hash": source_hash,
            }
            self.persist_state()
            generated_pt += 1
            if generated_pt % 10 == 0:
                print(f"Generated {generated_pt}/{len(prepared_routes)} pt-BR pages...", flush=True)

        PARTIALS_PT_DIR.mkdir(parents=True, exist_ok=True)
        for name, source_html in prepared_partials:
            target_file = PARTIALS_PT_DIR / name
            partial_key = f"partial::{name}"
            source_hash = sha256_text(source_html + self.config_hash_for(partial_key))
            manifest_entry = self.manifest.get("partials", {}).get(name, {})
            cache_matches = manifest_entry.get("source_hash") == source_hash and target_file.exists()

            if (not self.force and cache_matches) or (self.force and self.resume and cache_matches):
                skipped_cached_partials += 1
                continue

            rendered_html = self.render_pt_fragment(source_html, partial_key)
            target_file.write_text(rendered_html, encoding="utf8")
            self.manifest.setdefault("partials", {})[name] = {
                "source_hash": source_hash,
            }
            self.persist_state()
            generated_partials += 1

        if prepared_partials:
            print(
                f"Generated {generated_partials}/{len(prepared_partials)} pt-BR partials and skipped "
                f"{skipped_cached_partials} cached partials.",
                flush=True,
            )

        self.persist_state()
        return patched_english, generated_pt, skipped_cached, generated_partials, skipped_cached_partials


def normalize_route_input(route: str) -> str:
    normalized = route.strip()
    if not normalized:
        return "/"
    if not normalized.startswith("/"):
        normalized = f"/{normalized}"
    if normalized != "/" and not normalized.endswith("/"):
        normalized = f"{normalized}/"
    return normalized


def print_runtime_doctor() -> None:
    print("PT translation runtime check")
    print(f"Current interpreter: {sys.executable}")
    print(f"Workspace: {ROOT}")
    print(f"Requirements file: {TRANSLATION_REQUIREMENTS_PATH}")
    print(f"Default provider: {DEFAULT_PROVIDER}")

    candidates = candidate_python_runtimes()
    if not candidates:
        print("No candidate Python runtimes found.")
    else:
        print("Candidate runtimes:")
        for candidate in candidates:
            missing = missing_modules_for_runtime(candidate)
            argos_status = "argos ready" if runtime_supports_modules(candidate, ARGOS_RUNTIME_MODULES) else "argos optional"
            status = "ready" if not missing else f"missing {', '.join(missing)}"
            marker = " (current)" if Path(candidate).absolute() == Path(sys.executable).absolute() else ""
            print(f"- {candidate}: {status}; {argos_status}{marker}")

    try:
        sample = GoogleTranslateEngine().translate("Start Consultation")
        print(f"Google provider check: ok ({sample})")
    except RuntimeError as error:
        print(f"Google provider check: failed ({error})")

    print("Install missing packages with:")
    print(f"  {install_hint_for(sys.executable)}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate pt-BR static pages from the handwritten English HTML site.")
    parser.add_argument("--force", action="store_true", help="Regenerate every pt-BR page instead of only changed pages.")
    parser.add_argument(
        "--resume",
        action="store_true",
        help="When used with --force, skip routes already regenerated with the same source/config hash.",
    )
    parser.add_argument(
        "--clear-memory",
        action="store_true",
        help="Clear the translation-memory cache before running. Useful after major glossary or global override changes.",
    )
    parser.add_argument(
        "--doctor",
        action="store_true",
        help="Print Python runtime and dependency status for the PT translator, then exit.",
    )
    parser.add_argument(
        "--provider",
        default=DEFAULT_PROVIDER,
        choices=("hybrid", "google", "argos"),
        help="Translation provider to use. `hybrid` prefers Google Translate and falls back to Argos if available.",
    )
    parser.add_argument(
        "--route",
        action="append",
        default=[],
        help="Only process one route, for example /about/clients/ . Can be used more than once.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.doctor:
        print_runtime_doctor()
        return 0

    I18N_DIR.mkdir(parents=True, exist_ok=True)
    normalized_routes = {normalize_route_input(route) for route in args.route}
    generator = PtGenerator(
        force=args.force,
        resume=args.resume,
        clear_memory=args.clear_memory,
        provider=args.provider,
        routes=normalized_routes,
    )
    patched_english, generated_pt, skipped_cached, generated_partials, skipped_cached_partials = generator.generate()
    print(
        f"Patched {patched_english} English pages, generated {generated_pt} pt-BR pages, "
        f"skipped {skipped_cached} cached routes, generated {generated_partials} pt-BR partials, "
        f"and skipped {skipped_cached_partials} cached partials."
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error
