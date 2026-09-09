#!/usr/bin/env python3
"""Run a static SEO, technical, performance, accessibility, schema, and link audit."""

from __future__ import annotations

import argparse
import collections
import json
from pathlib import Path

from maintenance_lib import (
    ROOT,
    add_common_args,
    apply_site_url,
    ensure_dirs,
    normalize_internal_href,
    parse_all_html,
    public_asset_exists,
    read_text,
    rel,
    route_to_url,
    url_is_external,
    write_json_if_changed,
    write_text_if_changed,
)


def add_issue(issues: list[dict[str, str]], severity: str, category: str, path: Path, message: str, recommendation: str) -> None:
    issues.append(
        {
            "severity": severity,
            "category": category,
            "file": rel(path),
            "message": message,
            "recommendation": recommendation,
        }
    )


def audit() -> dict[str, object]:
    docs = parse_all_html()
    issues: list[dict[str, str]] = []
    routes = {doc.route for doc in docs}
    canonicals = collections.defaultdict(list)

    for doc in docs:
        expected_canonical = route_to_url(doc.route)
        if not doc.lang:
            add_issue(issues, "high", "seo", doc.path, "Missing html lang attribute.", "Set lang to en or pt-BR.")
        if not doc.title:
            add_issue(issues, "high", "seo", doc.path, "Missing title element.", "Add a concise unique page title.")
        elif len(doc.title) > 70:
            add_issue(issues, "medium", "seo", doc.path, f"Title is long ({len(doc.title)} characters).", "Shorten the title when it can be done without losing meaning.")
        if not doc.description:
            add_issue(issues, "high", "seo", doc.path, "Missing meta description.", "Add a natural description for search snippets.")
        elif len(doc.description) > 170:
            add_issue(issues, "medium", "seo", doc.path, f"Meta description is long ({len(doc.description)} characters).", "Shorten to roughly 150-160 characters.")
        if not doc.canonical:
            add_issue(issues, "high", "seo", doc.path, "Missing canonical link.", f"Add canonical URL {expected_canonical}.")
        else:
            canonicals[doc.canonical].append(doc.path)
        if len(doc.h1) != 1:
            add_issue(issues, "high", "seo", doc.path, f"Expected one h1, found {len(doc.h1)}.", "Keep one clear h1 per page.")
        duplicate_ids = [item for item, count in collections.Counter(doc.ids).items() if item and count > 1]
        if duplicate_ids:
            add_issue(issues, "medium", "technical", doc.path, f"Duplicate ids: {', '.join(duplicate_ids[:10])}.", "Make ids unique so anchors and scripts target correctly.")
        if "application/ld+json" in doc.text and any(isinstance(item, dict) and item.get("_invalid_json_ld") for item in doc.json_ld):
            add_issue(issues, "high", "schema", doc.path, "Invalid JSON-LD block.", "Repair the structured data JSON.")
        if not doc.json_ld:
            add_issue(issues, "medium", "schema", doc.path, "No JSON-LD structured data found.", "Add WebPage or Article schema where appropriate.")

        head_prefix = doc.text[: min(len(doc.text), 200000)]
        if not __import__("re").search(r"<meta\b(?=[^>]*\bname=[\"']?viewport[\"']?)[^>]*>", head_prefix, flags=__import__("re").I):
            add_issue(issues, "high", "technical", doc.path, "Missing viewport meta tag.", "Add responsive viewport metadata.")
        if len(doc.text) > 900000:
            add_issue(issues, "medium", "performance", doc.path, f"HTML is very large ({len(doc.text):,} bytes).", "Reduce inline CSS/JSON or split noncritical content.")
        if "<style" in doc.text and doc.text.count("<style") > 2:
            add_issue(issues, "low", "performance", doc.path, "Multiple inline style blocks found.", "Keep critical CSS only and move reusable CSS to shared files.")

        for img in doc.images:
            src = img.get("src", "")
            if not img.get("alt"):
                add_issue(issues, "high", "accessibility", doc.path, f"Image missing alt text: {src}", "Add accurate alt text, or alt=\"\" for decorative images.")
            if not img.get("width") or not img.get("height"):
                add_issue(issues, "medium", "performance", doc.path, f"Image missing width/height: {src}", "Add intrinsic dimensions to prevent layout shift.")
            if img.get("loading") != "lazy" and img.get("fetchpriority") != "high":
                add_issue(issues, "low", "performance", doc.path, f"Image lacks lazy loading: {src}", "Use loading=\"lazy\" for non-hero images.")
            if src.startswith("/") and not public_asset_exists(src):
                add_issue(issues, "high", "links", doc.path, f"Missing image asset: {src}", "Restore or correct the asset path.")

        input_ids = set()
        for match in __import__("re").finditer(r"<(?:input|select|textarea)\b[^>]*\bid=[\"']([^\"']+)[\"']", doc.text, flags=__import__("re").I):
            input_ids.add(match.group(1))
        for input_id in sorted(input_ids - doc.labels_for):
            add_issue(issues, "medium", "accessibility", doc.path, f"Form control id has no label: {input_id}", "Add a visible label or aria-label.")
        for text in doc.buttons:
            if not text.strip():
                add_issue(issues, "medium", "accessibility", doc.path, "Button has no readable text.", "Add text, aria-label, or title.")

        for link in doc.links:
            href = link.get("href", "")
            if not href or href.startswith("#"):
                continue
            if url_is_external(href):
                if link.get("target") == "_blank" and "noopener" not in link.get("rel", ""):
                    add_issue(issues, "low", "technical", doc.path, f"External target=_blank link lacks noopener: {href}", "Add rel=\"noopener noreferrer\".")
                continue
            clean = normalize_internal_href(href)
            if clean and clean.startswith("/") and not public_asset_exists(clean):
                add_issue(issues, "high", "links", doc.path, f"Broken internal link or asset: {href}", "Correct the link target or restore the public file.")
        for asset in doc.stylesheets + doc.scripts:
            href = asset.get("href") or asset.get("src") or ""
            if href.startswith("/") and not public_asset_exists(href):
                add_issue(issues, "high", "links", doc.path, f"Missing referenced asset: {href}", "Correct or restore the CSS/JS asset.")

    for canonical, paths in canonicals.items():
        if len(paths) > 1:
            for path in paths:
                add_issue(issues, "medium", "seo", path, f"Canonical is shared by {len(paths)} pages: {canonical}", "Each indexable page should usually have its own canonical URL.")

    counts = collections.Counter(issue["severity"] for issue in issues)
    return {
        "page_count": len(docs),
        "issue_count": len(issues),
        "counts": dict(counts),
        "issues": sorted(issues, key=lambda i: {"high": 0, "medium": 1, "low": 2}.get(i["severity"], 9)),
    }


def markdown_report(data: dict[str, object]) -> str:
    issues = data["issues"]
    lines = [
        "# Site Maintenance Audit",
        "",
        f"- Pages audited: {data['page_count']}",
        f"- Issues found: {data['issue_count']}",
        f"- Severity counts: {json.dumps(data['counts'], sort_keys=True)}",
        "",
        "## Recommendations",
    ]
    if not issues:
        lines.append("- No issues found by the static audit.")
    for issue in issues[:300]:
        lines.extend(
            [
                f"- [{issue['severity'].upper()}] {issue['category']} - `{issue['file']}`",
                f"  - Problem: {issue['message']}",
                f"  - Recommendation: {issue['recommendation']}",
            ]
        )
    if len(issues) > 300:
        lines.append(f"- Report truncated in Markdown. See JSON for {len(issues) - 300} additional issues.")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()
    data = audit()
    if not args.dry_run:
        write_json_if_changed(ROOT / "reports" / "site-audit.json", data)
        write_text_if_changed(ROOT / "reports" / "site-audit.md", markdown_report(data))
    print(f"Audited {data['page_count']} pages; found {data['issue_count']} issues.")
    print(json.dumps(data["counts"], sort_keys=True))
    return 1 if data["counts"].get("high", 0) else 0


if __name__ == "__main__":
    raise SystemExit(main())
