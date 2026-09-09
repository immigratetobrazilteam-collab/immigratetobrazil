#!/usr/bin/env python3
"""Dedicated internal-link checker for the static site."""

from __future__ import annotations

import argparse
import json
import posixpath
import urllib.parse
from pathlib import Path

from maintenance_common import ROOT, add_common_args, apply_site_url, ensure_dirs, parse_all_html, rel, write_json_if_changed, write_text_if_changed


def resolve_href(page_path: Path, href: str) -> tuple[Path | None, str]:
    parsed = urllib.parse.urlsplit(href)
    if parsed.scheme in {"http", "https", "mailto", "tel", "sms", "whatsapp"}:
        return None, "external"
    if not href or href.startswith("#") or parsed.scheme:
        return None, "skipped"
    raw_path = urllib.parse.unquote(parsed.path)
    if raw_path.startswith("/"):
        target = ROOT / raw_path.lstrip("/")
    else:
        base_dir = page_path.parent
        target = (base_dir / raw_path).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            return target, "outside-root"
    if target.is_dir():
        target = target / "index.html"
    elif not target.suffix:
        index_target = target / "index.html"
        html_target = target.with_suffix(".html")
        if index_target.exists():
            target = index_target
        elif html_target.exists():
            target = html_target
    return target, parsed.fragment


def page_ids(path: Path) -> set[str]:
    return set(__import__("re").findall(r"\bid=[\"']([^\"']+)[\"']", path.read_text(encoding="utf-8", errors="replace")))


def check_links() -> dict[str, object]:
    broken = []
    checked = 0
    id_cache: dict[Path, set[str]] = {}
    for doc in parse_all_html(include_partials=True):
        for link in doc.links:
            href = link.get("href", "")
            target, fragment = resolve_href(doc.path, href)
            if target is None:
                continue
            checked += 1
            if not target.exists():
                broken.append({"file": rel(doc.path), "href": href, "reason": "target missing", "resolved": str(target)})
                continue
            if fragment and target.suffix.lower() == ".html":
                ids = id_cache.setdefault(target, page_ids(target))
                if fragment not in ids:
                    broken.append({"file": rel(doc.path), "href": href, "reason": "fragment missing", "resolved": rel(target)})
    return {"checked": checked, "broken_count": len(broken), "broken": broken}


def markdown(data: dict[str, object]) -> str:
    lines = ["# Internal Link Report", "", f"- Links checked: {data['checked']}", f"- Broken links: {data['broken_count']}", ""]
    for item in data["broken"][:300]:
        lines.append(f"- `{item['file']}` -> `{item['href']}`: {item['reason']}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()
    data = check_links()
    if not args.dry_run:
        write_json_if_changed(ROOT / "reports" / "links.json", data)
        write_text_if_changed(ROOT / "reports" / "links.md", markdown(data))
    print(f"Checked {data['checked']} internal links; broken: {data['broken_count']}.")
    return 1 if data["broken_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
