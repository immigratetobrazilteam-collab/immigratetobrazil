#!/usr/bin/env python3

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

DOMAIN = "https://immigratetobrazil.com"
HOST = "immigratetobrazil.com"
INDEXNOW_KEY = "5a29773fe3784da8a6b211c9620769d9"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
SITEMAPS_DIR = ROOT / "sitemaps"
SITEMAP_INDEX = ROOT / "sitemap.xml"
SITEMAP_HTML = ROOT / "sitemap.html"
INDEXNOW_KEY_FILE = ROOT / f"{INDEXNOW_KEY}.txt"
STATE_FILE = ROOT / ".indexnow-sitemap-state.json"
SITEMAP_PREFIX = "sitemap-"
INDEXNOW_BATCH_SIZE = 10000

EXCLUDED_DIRS = {
    ".git", ".github", ".idea", ".vscode", "__pycache__",
    "node_modules", "templates", "memory-bank", "reports",
    "scripts", "src", "docs", "path", "vendor", "dist",
    "build", ".cache", ".wrangler", "partials", ".codex-temp",
}

EXCLUDED_HTML_FILES = {
    "sitemap.html",
    "404.html",
    "500.html",
    "offline.html",
}

EXCLUDED_URL_PREFIXES = (
    "/templates/",
    "/memory-bank/",
    "/reports/",
    "/scripts/",
    "/src/",
    "/docs/",
    "/path/",
    "/node_modules/",
)

def ok(msg):
    print(f"✓ {msg}")

def info(msg):
    print(f"• {msg}")

def warn(msg):
    print(f"⚠ {msg}")

def fail(msg, detail=""):
    print()
    print("=" * 72)
    print(f"✗ ERROR: {msg}")
    print("=" * 72)
    if detail:
        print(detail)
    print()
    sys.exit(1)

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--no-git", action="store_true")
    p.add_argument("--skip-indexnow", action="store_true")
    p.add_argument("--force-all", action="store_true")
    p.add_argument("--wait-seconds", type=int, default=240)
    return p.parse_args()

def run_command(cmd):
    try:
        return subprocess.run(
            cmd,
            check=True,
            text=True,
            capture_output=True,
        )
    except FileNotFoundError:
        fail("COMMAND NOT FOUND", cmd[0])
    except subprocess.CalledProcessError as exc:
        fail(
            "COMMAND FAILED",
            f"Command: {' '.join(cmd)}\n\n"
            f"STDOUT:\n{exc.stdout}\n\n"
            f"STDERR:\n{exc.stderr}",
        )

def fetch(url, timeout=30):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "ImmigrateToBrazil-SitemapManager/2.0",
            "Accept": "*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status, response.read(), dict(response.headers)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read(), dict(exc.headers)
    except Exception as exc:
        return 0, str(exc).encode(), {}

def file_sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()

def xml_escape(value):
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )

def slug(value):
    value = re.sub(r"[^a-zA-Z0-9_-]+", "-", value).strip("-").lower()
    return value or "misc"

def is_excluded_path(path):
    try:
        parts = path.relative_to(ROOT).parts
    except ValueError:
        return True
    return any(part in EXCLUDED_DIRS for part in parts)

def path_to_url(path):
    # GOOGLE VERIFICATION FILE — NEVER IN SITEMAP
    # Search Console verification HTML must remain publicly reachable,
    # but it is not a content URL and must not enter XML sitemaps.
    if re.fullmatch(r"google[a-z0-9_-]+\\.html", path.name, re.I):
        return None

    if is_excluded_path(path):
        return None

    if path.name in EXCLUDED_HTML_FILES:
        return None

    rel_parts = path.relative_to(ROOT).parts

    # Verification token HTML is not a search-result content page.
    if re.fullmatch(r"google[0-9a-f]+\\.html", path.name, re.I):
        return None

    # Custom 404 templates must never enter XML sitemaps.
    if any(part.lower() == "404" for part in rel_parts[:-1]):
        return None

    rel = path.relative_to(ROOT).as_posix()

    if not rel.endswith(".html"):
        return None

    if rel == "index.html":
        url_path = "/"
    elif rel.endswith("/index.html"):
        url_path = "/" + rel[:-10]
    else:
        url_path = "/" + rel[:-5].rstrip("/") + "/"

    url_path = re.sub(r"/{2,}", "/", url_path)

    if any(url_path.startswith(prefix) for prefix in EXCLUDED_URL_PREFIXES):
        return None

    return DOMAIN + url_path

def discover_pages():
    pages = []

    for path in ROOT.rglob("*.html"):
        url = path_to_url(path)
        if url:
            pages.append((path, url))

    pages.sort(key=lambda pair: pair[1])

    if not pages:
        fail(
            "NO PUBLIC HTML PAGES FOUND",
            "Run this script from the root of the static website repository.",
        )

    return pages

def git_lastmod(path):
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cI", "--", str(path.relative_to(ROOT))],
            cwd=ROOT,
            check=False,
            text=True,
            capture_output=True,
        )
        value = result.stdout.strip()
        if value:
            parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.date().isoformat()
    except Exception:
        pass
    return None

def lastmod_for_file(path):
    git_date = git_lastmod(path)
    if git_date:
        return git_date
    return dt.datetime.fromtimestamp(
        path.stat().st_mtime,
        tz=dt.timezone.utc,
    ).date().isoformat()

def classify_group(url):
    path = url.removeprefix(DOMAIN).strip("/")

    if not path:
        return "home"

    parts = path.split("/")

    if parts[0] == "pt-br":
        if len(parts) >= 3 and parts[1] == "insights":
            return f"pt-br-insights-{slug(parts[2])}"
        if len(parts) >= 2:
            return f"pt-br-{slug(parts[1])}"
        return "pt-br"

    if parts[0] == "insights":
        if len(parts) >= 2:
            return f"insights-{slug(parts[1])}"
        return "insights"

    return slug(parts[0])

def build_urlset(entries):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for source_path, url in entries:
        lines += [
            "  <url>",
            f"    <loc>{xml_escape(url)}</loc>",
            f"    <lastmod>{lastmod_for_file(source_path)}</lastmod>",
            "  </url>",
        ]

    lines.append("</urlset>")
    return "\n".join(lines) + "\n"

def build_sitemap_index(child_files):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for path in sorted(child_files, key=lambda p: p.name):
        lines += [
            "  <sitemap>",
            f"    <loc>{xml_escape(f'{DOMAIN}/sitemaps/{path.name}')}</loc>",
            "  </sitemap>",
        ]

    lines.append("</sitemapindex>")
    return "\n".join(lines) + "\n"

def generate_xml_sitemaps(pages):
    groups = defaultdict(list)

    for page in pages:
        groups[classify_group(page[1])].append(page)

    SITEMAPS_DIR.mkdir(parents=True, exist_ok=True)

    for old in SITEMAPS_DIR.glob(f"{SITEMAP_PREFIX}*.xml"):
        old.unlink()

    child_files = []

    for group_name, entries in sorted(groups.items()):
        target = SITEMAPS_DIR / f"{SITEMAP_PREFIX}{group_name}.xml"
        target.write_text(build_urlset(entries), encoding="utf-8")
        child_files.append(target)

    SITEMAP_INDEX.write_text(
        build_sitemap_index(child_files),
        encoding="utf-8",
    )

    ok(f"Generated {len(child_files)} child XML sitemaps")
    ok("Generated sitemap.xml sitemap index")

def page_label(url):
    path = url.removeprefix(DOMAIN).strip("/")
    if not path:
        return "Home"
    last = path.split("/")[-1]
    return last.replace("-", " ").replace("_", " ").title()

def build_html_sitemap(pages):
    grouped = defaultdict(list)

    for _, url in pages:
        grouped[classify_group(url)].append(url)

    sections = []

    for group, urls in sorted(grouped.items()):
        links = []
        for url in sorted(urls):
            links.append(
                f'      <li><a href="{html.escape(url)}">'
                f"{html.escape(page_label(url))}</a></li>"
            )

        sections.append(
            "  <section>\n"
            f"    <h2>{html.escape(group.replace('-', ' ').title())}</h2>\n"
            "    <ul>\n"
            + "\n".join(links)
            + "\n    </ul>\n"
            "  </section>"
        )

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sitemap | Immigrate to Brazil</title>
  <meta name="description" content="Browse the public pages and resources available on Immigrate to Brazil.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="{DOMAIN}/sitemap.html">
</head>
<body>
<main>
  <h1>Website Sitemap</h1>
  <p>Browse the public pages and resources available on Immigrate to Brazil.</p>
{chr(10).join(sections)}
</main>
</body>
</html>
"""

def generate_html_sitemap(pages):
    SITEMAP_HTML.write_text(
        build_html_sitemap(pages),
        encoding="utf-8",
    )
    ok("Generated sitemap.html")

def ensure_indexnow_key():
    INDEXNOW_KEY_FILE.write_text(INDEXNOW_KEY, encoding="utf-8")

    if INDEXNOW_KEY_FILE.read_text(encoding="utf-8").strip() != INDEXNOW_KEY:
        fail("INDEXNOW KEY FILE INVALID")

    ok("IndexNow key file ready")

def build_current_state(pages):
    urls = {}

    for source_path, url in pages:
        urls[url] = {
            "sha256": file_sha256(source_path),
            "source": source_path.relative_to(ROOT).as_posix(),
        }

    return {
        "version": 2,
        "domain": DOMAIN,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "urls": urls,
    }

def load_previous_state():
    if not STATE_FILE.exists():
        return None

    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except Exception as exc:
        warn(f"Could not read previous state: {exc}")
        return None

    if data.get("domain") != DOMAIN:
        warn("Previous state belongs to another domain.")
        return None

    return data

def determine_changes(previous, current, force_all):
    current_urls = current["urls"]

    if force_all or previous is None:
        return sorted(current_urls), [], []

    previous_urls = previous.get("urls", {})

    added = []
    changed = []

    for url, meta in current_urls.items():
        if url not in previous_urls:
            added.append(url)
        elif previous_urls[url].get("sha256") != meta.get("sha256"):
            changed.append(url)

    deleted = sorted(set(previous_urls) - set(current_urls))

    return sorted(added), sorted(changed), deleted

def save_state(state):
    STATE_FILE.write_text(
        json.dumps(state, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    ok("Saved current URL state")

def ensure_git_repository():
    result = subprocess.run(
        ["git", "rev-parse", "--is-inside-work-tree"],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )

    if result.returncode != 0:
        fail(
            "NOT A GIT REPOSITORY",
            "Run this script from the repository root.",
        )

    ok("Git repository detected")

def git_commit_and_push():
    ensure_git_repository()

    run_command(
        [
            "git",
            "add",
            "sitemap.xml",
            "sitemap.html",
            "sitemaps",
            INDEXNOW_KEY_FILE.name,
        ]
    )

    staged = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=ROOT,
    )

    if staged.returncode == 0:
        ok("Generated discovery files already committed")
        return False

    run_command(
        [
            "git",
            "commit",
            "-m",
            "Update sitemaps and IndexNow discovery files",
        ]
    )
    ok("Git commit successful")

    run_command(["git", "push"])
    ok("Git push successful")

    return True

def live_sitemap_url_count():
    status, body, _ = fetch(f"{DOMAIN}/sitemap.xml")

    if status != 200:
        return None

    try:
        root = ET.fromstring(body)
    except ET.ParseError:
        return None

    children = []

    for el in root.iter():
        if el.tag.endswith("loc") and el.text:
            children.append(el.text.strip())

    found = set()

    for child_url in children:
        status, child_body, _ = fetch(child_url)

        if status != 200:
            return None

        try:
            child_root = ET.fromstring(child_body)
        except ET.ParseError:
            return None

        for el in child_root.iter():
            if el.tag.endswith("loc") and el.text:
                url = el.text.strip()
                if url.startswith(DOMAIN):
                    found.add(url)

    return len(found)

def wait_for_live(expected_count, max_seconds):
    deadline = time.time() + max_seconds
    key_url = f"{DOMAIN}/{INDEXNOW_KEY}.txt"

    while time.time() < deadline:
        key_status, key_body, _ = fetch(key_url)

        key_ok = (
            key_status == 200
            and key_body.decode("utf-8", errors="replace").strip() == INDEXNOW_KEY
        )

        sitemap_count = live_sitemap_url_count()
        sitemap_ok = sitemap_count == expected_count

        if key_ok and sitemap_ok:
            ok("Latest deployment is live")
            ok("IndexNow key verified")
            ok(f"Live sitemap contains {expected_count} URLs")
            return

        left = max(0, int(deadline - time.time()))
        info(f"Waiting for Cloudflare deployment... {left}s remaining")
        time.sleep(10)

    fail(
        "LIVE DEPLOYMENT VERIFICATION FAILED",
        "The live key and/or sitemap did not match the newly generated site.\n"
        "IndexNow was not submitted.",
    )

def submit_indexnow(urls):
    if not urls:
        ok("No URLs need IndexNow submission")
        return []

    codes = []

    for offset in range(0, len(urls), INDEXNOW_BATCH_SIZE):
        batch = urls[offset:offset + INDEXNOW_BATCH_SIZE]

        payload = {
            "host": HOST,
            "key": INDEXNOW_KEY,
            "keyLocation": f"{DOMAIN}/{INDEXNOW_KEY}.txt",
            "urlList": batch,
        }

        req = urllib.request.Request(
            INDEXNOW_ENDPOINT,
            data=json.dumps(payload).encode("utf-8"),
            method="POST",
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "ImmigrateToBrazil-SitemapManager/2.0",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                code = response.status
                body = response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            code = exc.code
            body = exc.read().decode("utf-8", errors="replace")
        except Exception as exc:
            fail("INDEXNOW NETWORK ERROR", str(exc))

        codes.append(code)

        if code == 200:
            ok(f"IndexNow accepted {len(batch)} URLs")
        elif code == 202:
            ok(f"IndexNow received {len(batch)} URLs; validation may be pending")
        elif code == 400:
            fail("INDEXNOW HTTP 400", "Bad request")
        elif code == 403:
            fail(
                "INDEXNOW HTTP 403",
                f"Check key file: {DOMAIN}/{INDEXNOW_KEY}.txt",
            )
        elif code == 422:
            fail("INDEXNOW HTTP 422", "Host/URL/key combination rejected")
        elif code == 429:
            fail("INDEXNOW HTTP 429", "Too many requests; try again later")
        else:
            fail(f"INDEXNOW HTTP {code}", body)

    return codes

def main():
    args = parse_args()

    print()
    print("=" * 72)
    print("IMMIGRATE TO BRAZIL — SITEMAP + INDEXNOW MANAGER")
    print("=" * 72)
    print()

    pages = discover_pages()
    ok(f"Discovered {len(pages)} public HTML pages")

    current_state = build_current_state(pages)
    previous_state = load_previous_state()

    first_run = previous_state is None

    if first_run:
        info("First tracked run: full site will be submitted")
    else:
        ok("Previous state loaded")

    added, changed, deleted = determine_changes(
        previous_state,
        current_state,
        args.force_all,
    )

    print()
    print("Changes detected:")
    print(f"  New:      {len(added)}")
    print(f"  Changed:  {len(changed)}")
    print(f"  Deleted:  {len(deleted)}")
    print()

    if args.dry_run:
        print("DRY RUN — nothing written or submitted")
        return

    generate_xml_sitemaps(pages)
    generate_html_sitemap(pages)
    ensure_indexnow_key()

    if not args.no_git:
        pushed = git_commit_and_push()

        if pushed:
            wait_for_live(len(pages), args.wait_seconds)
        else:
            info("No generated-file Git changes to push")
            wait_for_live(len(pages), args.wait_seconds)
    else:
        warn("Git push/live-deployment check skipped")

    if args.force_all or first_run:
        urls_to_submit = sorted(current_state["urls"])
    else:
        urls_to_submit = sorted(set(added + changed + deleted))

    if args.skip_indexnow:
        warn("IndexNow submission skipped")
        codes = []
    else:
        codes = submit_indexnow(urls_to_submit)

    if args.skip_indexnow or not urls_to_submit or all(c in (200, 202) for c in codes):
        save_state(current_state)
    else:
        fail(
            "STATE NOT UPDATED",
            "IndexNow did not fully succeed, so old state was preserved.",
        )

    print()
    print("=" * 72)
    print("FINAL REPORT")
    print("=" * 72)
    print(f"Current URLs:              {len(pages)}")
    print(f"New URLs:                  {len(added)}")
    print(f"Changed URLs:              {len(changed)}")
    print(f"Deleted URLs:              {len(deleted)}")
    print(f"IndexNow URLs submitted:   {0 if args.skip_indexnow else len(urls_to_submit)}")
    print()
    print(f"Sitemap:     {DOMAIN}/sitemap.xml")
    print(f"HTML sitemap:{DOMAIN}/sitemap.html")
    print(f"Key file:    {DOMAIN}/{INDEXNOW_KEY}.txt")
    print()

    if not urls_to_submit:
        print("✓ EVERYTHING CURRENT — NOTHING NEEDED SUBMISSION")
    elif args.skip_indexnow:
        print("✓ SITEMAPS UPDATED — INDEXNOW SKIPPED")
    else:
        print("✓ SITEMAPS UPDATED AND INDEXNOW SUBMISSION SUCCEEDED")

    print("=" * 72)

if __name__ == "__main__":
    main()
