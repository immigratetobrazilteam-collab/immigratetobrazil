#!/usr/bin/env python3
"""Apply safe automated fixes from the static audit."""

from __future__ import annotations

import argparse
import re

from audit_site import audit
from maintenance_lib import (
    ROOT,
    add_common_args,
    apply_site_url,
    ensure_dirs,
    html_path_to_route,
    parse_html,
    public_html_files,
    read_text,
    route_to_url,
    write_json_if_changed,
    write_text_if_changed,
)


def safe_fix_html(text: str, path) -> tuple[str, list[str], list[str]]:
    changed: list[str] = []
    skipped: list[str] = []
    doc = parse_html(path)
    lang = "pt-BR" if html_path_to_route(path).startswith("/pt-br/") else "en"

    if re.search(r"<html\b(?![^>]*\blang=)", text, flags=re.I):
        text = re.sub(r"<html\b", f'<html lang="{lang}"', text, count=1, flags=re.I)
        changed.append("added html lang")
    if "name=\"viewport\"" not in text[:5000] and "name=viewport" not in text[:5000]:
        text = re.sub(r"(<meta\s+charset=[^>]+>)", r'\1\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />', text, count=1, flags=re.I)
        changed.append("added viewport meta")
    if "name=\"robots\"" not in text[:10000] and "name=robots" not in text[:10000]:
        text = re.sub(r"(<meta\s+name=[\"']description[\"'][^>]*>)", r'\1\n<meta name="robots" content="index,follow" />', text, count=1, flags=re.I)
        changed.append("added robots meta")
    if not doc.canonical and "</title>" in text.lower():
        canonical = route_to_url(html_path_to_route(path))
        text = re.sub(r"(</title>)", rf'\1\n<link rel="canonical" href="{canonical}" />', text, count=1, flags=re.I)
        changed.append("added canonical")

    def add_noopener(match: re.Match[str]) -> str:
        tag = match.group(0)
        if "rel=" in tag.lower():
            return tag
        changed.append("added noopener to external target blank link")
        return tag[:-1] + ' rel="noopener noreferrer">'

    text = re.sub(r"<a\b(?=[^>]*\btarget=[\"']_blank[\"'])(?=[^>]*\bhref=[\"']https?://)[^>]*>", add_noopener, text, flags=re.I)

    def add_lazy(match: re.Match[str]) -> str:
        tag = match.group(0)
        low = tag.lower()
        if " loading=" in low or "fetchpriority=\"high\"" in low or "fetchpriority='high'" in low:
            return tag
        changed.append("added lazy loading to image")
        return tag[:-1] + ' loading="lazy">'

    text = re.sub(r"<img\b[^>]*>", add_lazy, text, flags=re.I)

    if len(doc.h1) != 1:
        skipped.append("h1 count requires editorial judgment")
    if not doc.description:
        skipped.append("missing meta description requires editorial copy")
    for image in doc.images:
        if not image.get("alt"):
            skipped.append(f"image alt requires human description: {image.get('src', '')}")
    if not doc.json_ld:
        skipped.append("schema creation requires page-specific meaning")
    return text, changed, skipped


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()

    changed_files: list[dict[str, object]] = []
    skipped: dict[str, list[str]] = {}
    for path in public_html_files(include_partials=False):
        original = read_text(path)
        fixed, changes, local_skipped = safe_fix_html(original, path)
        if local_skipped:
            skipped[str(path.relative_to(ROOT))] = local_skipped
        if changes and fixed != original:
            if not args.dry_run:
                write_text_if_changed(path, fixed)
            changed_files.append({"file": str(path.relative_to(ROOT)), "changes": changes})

    post_audit = audit()
    report = {"changed_files": changed_files, "skipped": skipped, "post_audit_counts": post_audit["counts"]}
    if not args.dry_run:
        write_json_if_changed(ROOT / "reports" / "fix-report.json", report)
    print(f"Safe fixer complete: {len(changed_files)} files changed, {sum(len(v) for v in skipped.values())} items skipped.")
    print("Skipped items are in reports/fix-report.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
