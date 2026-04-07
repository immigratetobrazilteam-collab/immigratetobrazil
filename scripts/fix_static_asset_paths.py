from pathlib import Path
import os
import re


ROOT = Path(__file__).resolve().parent.parent
ROOT_PREFIXES = ("assets/", "css/", "js/", "data/")
BLOCKED_PREFIXES = (
    "http://",
    "https://",
    "mailto:",
    "tel:",
    "#",
    "data:",
    "javascript:",
    "//",
    "/",
)

ATTR_RE = re.compile(
    r'(?P<attr>\b(?:src|href|content|poster)=)(?P<q>["\'])(?P<val>[^"\']+)(?P=q)',
    re.IGNORECASE,
)
SRCSET_RE = re.compile(
    r'(?P<attr>\bsrcset=)(?P<q>["\'])(?P<val>[^"\']+)(?P=q)',
    re.IGNORECASE,
)
URL_RE = re.compile(
    r'url\((?P<q>["\']?)(?P<val>[^)"\']+)(?P=q)\)',
    re.IGNORECASE,
)


def normalize_value(page: Path, value: str) -> str:
    if value.startswith(BLOCKED_PREFIXES):
        return value

    stripped = value
    while stripped.startswith("./"):
        stripped = stripped[2:]
    while stripped.startswith("../"):
        stripped = stripped[3:]

    if not stripped.startswith(ROOT_PREFIXES):
        return value

    target = ROOT / stripped
    return os.path.relpath(target, page.parent).replace(os.sep, "/")


def replace_srcset_value(page: Path, value: str) -> str:
    items = []
    for part in value.split(","):
        part = part.strip()
        if not part:
            continue
        bits = part.split()
        bits[0] = normalize_value(page, bits[0])
        items.append(" ".join(bits))
    return ", ".join(items)


def process_page(page: Path) -> bool:
    original = page.read_text(encoding="utf-8", errors="ignore")

    def replace_attr(match: re.Match[str]) -> str:
        new_value = normalize_value(page, match.group("val"))
        return (
            f'{match.group("attr")}{match.group("q")}'
            f'{new_value}{match.group("q")}'
        )

    def replace_srcset(match: re.Match[str]) -> str:
        new_value = replace_srcset_value(page, match.group("val"))
        return (
            f'{match.group("attr")}{match.group("q")}'
            f'{new_value}{match.group("q")}'
        )

    def replace_url(match: re.Match[str]) -> str:
        quote = match.group("q") or ""
        new_value = normalize_value(page, match.group("val"))
        return f"url({quote}{new_value}{quote})"

    updated = SRCSET_RE.sub(replace_srcset, original)
    updated = ATTR_RE.sub(replace_attr, updated)
    updated = URL_RE.sub(replace_url, updated)

    if updated == original:
        return False

    page.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    changed = []
    for page in sorted(ROOT.rglob("*.html")):
        if ".git" in page.parts:
            continue
        if process_page(page):
            changed.append(page.relative_to(ROOT).as_posix())

    print(f"changed_files {len(changed)}")
    for rel in changed[:200]:
        print(rel)


if __name__ == "__main__":
    main()
