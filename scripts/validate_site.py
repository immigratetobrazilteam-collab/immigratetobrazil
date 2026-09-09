#!/usr/bin/env python3
"""Validate public site files after maintenance changes."""

from __future__ import annotations

import argparse
import collections
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from maintenance_lib import (
    ROOT,
    add_common_args,
    apply_site_url,
    all_files,
    ensure_dirs,
    normalize_internal_href,
    parse_all_html,
    is_indexable_html_path,
    public_asset_exists,
    rel,
    url_is_external,
    write_json_if_changed,
    write_text_if_changed,
)


def validate() -> dict[str, object]:
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    def add(target: list[dict[str, str]], path: Path, message: str) -> None:
        target.append({"file": rel(path), "message": message})

    for path in all_files():
        if path.suffix.lower() == ".json":
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except Exception as exc:
                add(errors, path, f"Invalid JSON: {exc}")
        elif path.suffix.lower() == ".xml":
            try:
                ET.parse(path)
            except Exception as exc:
                add(errors, path, f"Invalid XML: {exc}")

    docs = parse_all_html(include_partials=True)
    for doc in docs:
        lowered = doc.text.lower()
        if "<!doctype html" not in lowered and not rel(doc.path).startswith("partials/"):
            add(warnings, doc.path, "Missing <!doctype html>.")
        if len(re.findall(r"<html\b", lowered)) > 1:
            add(errors, doc.path, "Multiple html start tags.")
        if len(re.findall(r"<head\b", lowered)) != len(re.findall(r"</head\s*>", lowered)) and not rel(doc.path).startswith("partials/"):
            add(errors, doc.path, "Unbalanced head tags.")
        if len(re.findall(r"<body\b", lowered)) != len(re.findall(r"</body\s*>", lowered)) and not rel(doc.path).startswith("partials/"):
            add(errors, doc.path, "Unbalanced body tags.")
        if not doc.canonical and is_indexable_html_path(doc.path):
            add(errors, doc.path, "Missing canonical link.")
        for item, count in collections.Counter(doc.ids).items():
            if item and count > 1:
                add(warnings, doc.path, f"Duplicate id: {item}")
        for link in doc.links:
            href = link.get("href", "")
            if not href or href.startswith("#") or url_is_external(href):
                continue
            clean = normalize_internal_href(href)
            if clean.startswith("/") and not public_asset_exists(clean):
                add(errors, doc.path, f"Broken internal reference: {href}")
        for image in doc.images:
            src = image.get("src", "")
            if src.startswith("/") and not public_asset_exists(src):
                add(errors, doc.path, f"Missing image asset: {src}")
        for asset in doc.stylesheets + doc.scripts:
            href = asset.get("href") or asset.get("src") or ""
            if href.startswith("/") and not public_asset_exists(href):
                add(errors, doc.path, f"Missing asset: {href}")

    return {"error_count": len(errors), "warning_count": len(warnings), "errors": errors, "warnings": warnings}


def markdown_report(data: dict[str, object]) -> str:
    lines = [
        "# Site Validation Report",
        "",
        f"- Errors: {data['error_count']}",
        f"- Warnings: {data['warning_count']}",
        "",
    ]
    if data["errors"]:
        lines.append("## Errors")
        for item in data["errors"][:300]:
            lines.append(f"- `{item['file']}`: {item['message']}")
    if data["warnings"]:
        lines.append("")
        lines.append("## Warnings")
        for item in data["warnings"][:300]:
            lines.append(f"- `{item['file']}`: {item['message']}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()
    data = validate()
    if not args.dry_run:
        write_json_if_changed(ROOT / "reports" / "site-validation.json", data)
        write_text_if_changed(ROOT / "reports" / "site-validation.md", markdown_report(data))
    print(f"Validation complete: {data['error_count']} errors, {data['warning_count']} warnings.")
    return 1 if data["error_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
