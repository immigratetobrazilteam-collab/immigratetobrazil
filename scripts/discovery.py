#!/usr/bin/env python3
"""Generate sitemaps, robots.txt, llms.txt, AI route manifests, and IndexNow updates."""

from __future__ import annotations

import argparse
import json
import os
import datetime as dt
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

from maintenance_lib import (
    PUBLIC_DATA_DIR,
    PT_PUBLIC_DATA_DIR,
    ROOT,
    STATE_DIR,
    add_common_args,
    apply_site_url,
    ensure_dirs,
    file_hash,
    git_changed_files,
    html_path_to_route,
    load_json,
    parse_all_html,
    print_step,
    retry_urlopen,
    route_group,
    route_to_url,
    today_date,
    write_json_if_changed,
    write_text_if_changed,
    xml_escape,
)


def public_pages() -> list[dict[str, str]]:
    docs = sorted(parse_all_html(), key=lambda d: d.route)
    pages = []
    for doc in docs:
        if doc.route.startswith("/partials/"):
            continue
        canonical = doc.canonical or route_to_url(doc.route)
        pages.append(
            {
                "route": doc.route,
                "url": route_to_url(doc.route),
                "canonical": canonical,
                "title": doc.title,
                "description": doc.description,
                "lang": doc.lang or ("pt-BR" if doc.route.startswith("/pt-br/") else "en"),
                "source": str(doc.path.relative_to(ROOT)),
                "group": route_group(doc.route),
                "lastmod": lastmod_for_path(doc.path),
            }
        )
    return pages


def lastmod_for_path(path: Path) -> str:
    result = __import__("subprocess").run(
        ["git", "log", "-1", "--format=%cI", "--", str(path.relative_to(ROOT))],
        cwd=ROOT,
        text=True,
        stdout=__import__("subprocess").PIPE,
        stderr=__import__("subprocess").DEVNULL,
    )
    value = result.stdout.strip()
    if value:
        try:
            return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).date().isoformat()
        except ValueError:
            pass
    return dt.datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()


def sitemap_urlset(pages: list[dict[str, str]]) -> str:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for page in pages:
        lines.extend(
            [
                "  <url>",
                f"    <loc>{xml_escape(page['url'])}</loc>",
                f"    <lastmod>{page['lastmod']}</lastmod>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def sitemap_index(groups: list[str]) -> str:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for group in groups:
        lines.extend(["  <sitemap>", f"    <loc>{route_to_url('/sitemaps/sitemap-' + group + '.xml')}</loc>", "  </sitemap>"])
    lines.append("</sitemapindex>")
    return "\n".join(lines) + "\n"


def generate_sitemaps(pages: list[dict[str, str]], dry_run: bool) -> list[str]:
    changed: list[str] = []
    grouped: dict[str, list[dict[str, str]]] = {}
    for page in pages:
        grouped.setdefault(page["group"], []).append(page)
    sitemaps_dir = ROOT / "sitemaps"
    if not dry_run:
        sitemaps_dir.mkdir(exist_ok=True)
        expected = {sitemaps_dir / f"sitemap-{group}.xml" for group in grouped}
        for stale in sorted(sitemaps_dir.glob("sitemap-*.xml")):
            if stale not in expected:
                stale.unlink()
                changed.append(str(stale.relative_to(ROOT)) + " removed")
    for group, group_pages in sorted(grouped.items()):
        path = sitemaps_dir / f"sitemap-{group}.xml"
        if dry_run:
            continue
        if write_text_if_changed(path, sitemap_urlset(group_pages)):
            changed.append(str(path.relative_to(ROOT)))
    if not dry_run and write_text_if_changed(ROOT / "sitemap.xml", sitemap_index(sorted(grouped))):
        changed.append("sitemap.xml")
    return changed


def generate_robots(dry_run: bool) -> bool:
    content = f"""# Immigrate to Brazil robots.txt
# Public services, professional profile, articles, images, CSS, and JavaScript are crawlable.
# Repository, reports, and non-public support files are excluded.

User-agent: Googlebot
User-agent: Bingbot
User-agent: OAI-SearchBot
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: CCBot
User-agent: Google-Extended
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /sitemaps/
Allow: /sitemap.html
Allow: /data/ai-route-manifest.json
Allow: /data/search-index.json
Allow: /pt-br/data/search-index.json
Disallow: /docs/
Disallow: /reports/
Disallow: /.maintenance/

User-agent: *
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /sitemaps/
Allow: /sitemap.html
Allow: /data/ai-route-manifest.json
Allow: /data/search-index.json
Allow: /pt-br/data/search-index.json
Disallow: /docs/
Disallow: /reports/
Disallow: /.maintenance/

Sitemap: {route_to_url('/sitemap.xml')}
"""
    return False if dry_run else write_text_if_changed(ROOT / "robots.txt", content)


def generate_llms(pages: list[dict[str, str]], dry_run: bool) -> bool:
    core = [p for p in pages if p["route"].count("/") <= 2 and not p["route"].startswith("/pt-br/")]
    pt = [p for p in pages if p["route"].startswith("/pt-br/") and p["route"].count("/") <= 3]
    lines = [
        "# Immigrate to Brazil",
        "",
        "> Brazil immigration guidance, services, and consultation resources led by attorney Monique Fernandes for international clients in English and Brazilian Portuguese.",
        "",
        "## Primary Routes",
    ]
    for page in core[:80]:
        label = page["title"] or page["route"]
        desc = f": {page['description']}" if page["description"] else ""
        lines.append(f"- [{label}]({page['url']}){desc}")
    lines.extend(["", "## Brazilian Portuguese Routes"])
    for page in pt[:80]:
        label = page["title"] or page["route"]
        desc = f": {page['description']}" if page["description"] else ""
        lines.append(f"- [{label}]({page['url']}){desc}")
    lines.extend(
        [
            "",
            "## Discovery Files",
            f"- [XML sitemap index]({route_to_url('/sitemap.xml')})",
            f"- [AI route manifest]({route_to_url('/data/ai-route-manifest.json')})",
            f"- [English search index]({route_to_url('/data/search-index.json')})",
            f"- [Portuguese search index]({route_to_url('/pt-br/data/search-index.json')})",
            "",
            "## Contact",
            "- Email: moniquefadv@gmail.com",
        ]
    )
    return False if dry_run else write_text_if_changed(ROOT / "llms.txt", "\n".join(lines) + "\n")


def generate_sitemap_html(pages: list[dict[str, str]], dry_run: bool) -> bool:
    groups: dict[str, list[dict[str, str]]] = {}
    for page in pages:
        groups.setdefault(page["group"], []).append(page)
    lines = [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="utf-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1" />',
        "<title>Sitemap | Immigrate to Brazil</title>",
        f'<link rel="canonical" href="{route_to_url("/sitemap.html")}" />',
        '<meta name="robots" content="index,follow" />',
        "</head>",
        "<body>",
        "<main>",
        "<h1>Immigrate to Brazil sitemap</h1>",
    ]
    for group in sorted(groups):
        lines.append(f"<h2>{xml_escape(group.replace('-', ' ').title())}</h2>")
        lines.append("<ul>")
        for page in groups[group]:
            label = page["title"] or page["route"]
            lines.append(f'<li><a href="{xml_escape(page["route"])}">{xml_escape(label)}</a></li>')
        lines.append("</ul>")
    lines.extend(["</main>", "</body>", "</html>", ""])
    return False if dry_run else write_text_if_changed(ROOT / "sitemap.html", "\n".join(lines))


def generate_ai_files(pages: list[dict[str, str]], dry_run: bool) -> list[str]:
    changed: list[str] = []
    manifest = {
        "site": route_to_url("/"),
        "generated_at": today_date(),
        "routes": pages,
    }
    search_en = [
        {"url": p["url"], "route": p["route"], "title": p["title"], "description": p["description"], "lang": p["lang"]}
        for p in pages
        if not p["route"].startswith("/pt-br/")
    ]
    search_pt = [
        {"url": p["url"], "route": p["route"], "title": p["title"], "description": p["description"], "lang": p["lang"]}
        for p in pages
        if p["route"].startswith("/pt-br/")
    ]
    if dry_run:
        return changed
    for path, data in [
        (PUBLIC_DATA_DIR / "ai-route-manifest.json", manifest),
        (PUBLIC_DATA_DIR / "search-index.json", search_en),
        (PT_PUBLIC_DATA_DIR / "search-index.json", search_pt),
    ]:
        if write_json_if_changed(path, data):
            changed.append(str(path.relative_to(ROOT)))
    return changed


def current_html_hashes() -> dict[str, str]:
    return {str(path.relative_to(ROOT)): file_hash(path) for path in sorted(ROOT.rglob("*.html")) if ".git" not in path.parts}


def indexnow_candidates(pages: list[dict[str, str]]) -> list[str]:
    old = load_json(STATE_DIR / "indexnow-state.json", {})
    new = current_html_hashes()
    changed_paths = {path for path, digest in new.items() if old.get(path) != digest}
    deleted_paths = set(old) - set(new)
    git_changed = git_changed_files()
    page_by_source = {page["source"]: page["url"] for page in pages}
    urls = []
    for page in pages:
        src = page["source"]
        if src in changed_paths or src in git_changed:
            urls.append(page["url"])
    for src in deleted_paths:
        if src in page_by_source:
            urls.append(page_by_source[src])
        elif src.endswith("index.html"):
            route = "/" + src[: -len("index.html")]
            urls.append(route_to_url(route))
        elif src.endswith(".html"):
            urls.append(route_to_url("/" + src))
    write_json_if_changed(STATE_DIR / "indexnow-state.json", new)
    write_json_if_changed(PUBLIC_DATA_DIR / "indexnow-pending.json", {"generated_at": today_date(), "urls": urls, "deleted_sources": sorted(deleted_paths)})
    return sorted(set(urls))


def submit_indexnow(urls: list[str]) -> dict[str, object]:
    key = os.environ.get("INDEXNOW_KEY", "").strip()
    if not key or not urls:
        return {"submitted": False, "reason": "INDEXNOW_KEY not set or no changed URLs", "urls": urls}
    key_file = ROOT / f"{key}.txt"
    write_text_if_changed(key_file, key + "\n")
    payload = {
        "host": urllib.parse.urlparse(route_to_url("/")).netloc,
        "key": key,
        "keyLocation": route_to_url(f"/{key}.txt"),
        "urlList": urls,
    }
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    status, body = retry_urlopen(req)
    return {"submitted": bool(status and status < 300), "status": status, "body": body[:500], "urls": urls}


def validate_xml_files() -> None:
    ET.parse(ROOT / "sitemap.xml")
    for path in (ROOT / "sitemaps").glob("*.xml"):
        ET.parse(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    parser.add_argument("--submit-indexnow", action="store_true", help="Submit changed URLs if INDEXNOW_KEY is set.")
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()

    print_step("Scanning public HTML routes")
    pages = public_pages()
    changed: list[str] = []
    print_step(f"Found {len(pages)} public HTML pages")
    changed += generate_sitemaps(pages, args.dry_run)
    if generate_robots(args.dry_run):
        changed.append("robots.txt")
    if generate_llms(pages, args.dry_run):
        changed.append("llms.txt")
    if generate_sitemap_html(pages, args.dry_run):
        changed.append("sitemap.html")
    changed += generate_ai_files(pages, args.dry_run)
    pending = [] if args.dry_run else indexnow_candidates(pages)
    indexnow = submit_indexnow(pending) if args.submit_indexnow and not args.dry_run else {"submitted": False, "urls": pending}
    if not args.dry_run:
        validate_xml_files()
        write_json_if_changed(ROOT / "reports" / "discovery-report.json", {"changed": changed, "indexnow": indexnow, "page_count": len(pages)})
    print_step(f"Discovery complete: {len(changed)} files changed, {len(pending)} IndexNow URLs pending")
    if changed:
        print("\n".join(f"changed: {item}" for item in changed))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
