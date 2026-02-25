#!/usr/bin/env python3
"""
One-command SEO refresh:
1) Regenerate route index used by sitemap sources.
2) Update SEO settings used by app/sitemap.ts + app/robots.ts.
3) Generate a sanitized sitemap preview XML.
4) Regenerate robots.txt with best-practice defaults.
5) Optionally submit sitemap to Google Search Console.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SEO_SETTINGS_PATH = PROJECT_ROOT / "content" / "cms" / "settings" / "seo-settings.json"
ROUTE_INDEX_PATH = PROJECT_ROOT / "content" / "generated" / "route-index.json"
STATE_SOURCE_PATH = PROJECT_ROOT / "content" / "curated" / "states.ts"
ROBOTS_TXT_PATH = PROJECT_ROOT / "robots.txt"
SITEMAP_PREVIEW_PATH = PROJECT_ROOT / "artifacts" / "seo" / "sitemap-preview.xml"


LOCALES = ("en", "es", "pt", "fr")
STATIC_PATHS = (
    "",
    "/about",
    "/about/about-brazil",
    "/about/about-states",
    "/about/about-us",
    "/about/values",
    "/about/mission",
    "/about/story",
    "/services",
    "/process",
    "/contact",
    "/blog",
    "/faq",
    "/policies",
    "/library",
    "/home",
    "/accessibility",
    "/visa-consultation",
    "/resources-guides-brazil",
    "/discover/brazilian-states",
    "/discover/brazilian-regions",
    "/about/about-brazil/apply-brazil",
    "/about/about-brazil/cost-of-living-in-brazil",
    "/about/about-brazil/festivals",
    "/about/about-brazil/food",
)
POLICY_SLUGS = ("privacy", "terms", "cookies", "gdpr", "refund", "disclaimers")
STATE_ROUTE_TEMPLATES = (
    "/contact/contact-{slug}",
    "/faq/faq-{slug}",
    "/services/immigrate-to-{slug}",
    "/blog/blog-{slug}",
)


DEFAULT_SETTINGS = {
    "siteUrl": "https://www.immigratetobrazil.com",
    "sitemapPath": "/sitemap.xml",
    "extraSitemaps": [],
    "excludePathPrefixes": [
        "/admin",
        "/api/admin",
        "/memory-bank",
        "/partials",
        "/useful_scripts",
        "/template.html",
        "/.git",
        "/.env",
    ],
    "excludePathContains": [".bak", ".sql", ".env", "private"],
    "robotsDisallow": [
        "/admin/",
        "/api/admin/",
        "/memory-bank/",
        "/partials/",
        "/useful_scripts/",
        "/template.html",
        "/.git/",
        "/.env",
    ],
}


@dataclass
class SubmitConfig:
    enabled: bool
    site_property: str | None
    sitemap_url: str | None
    access_token: str | None
    service_account_key: str | None
    auto_install_auth_deps: bool


def normalize_site_url(value: str) -> str:
    trimmed = value.strip()
    return trimmed.rstrip("/")


def normalize_path(value: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        return "/"
    if trimmed.startswith("http://") or trimmed.startswith("https://"):
        return trimmed
    return trimmed if trimmed.startswith("/") else f"/{trimmed}"


def unique_list(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=True, indent=2)
        f.write("\n")


def load_state_slugs() -> list[str]:
    if not STATE_SOURCE_PATH.exists():
        return []

    text = STATE_SOURCE_PATH.read_text(encoding="utf-8")
    slugs: list[str] = []
    marker = "slug:"
    for line in text.splitlines():
        if marker not in line:
            continue
        idx = line.find(marker) + len(marker)
        rest = line[idx:].strip()
        if not rest.startswith("'"):
            continue
        rest = rest[1:]
        slug = rest.split("'", 1)[0].strip()
        if slug:
            slugs.append(slug)
    return unique_list(slugs)


def run_command(cmd: list[str]) -> None:
    result = subprocess.run(cmd, cwd=PROJECT_ROOT, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed ({result.returncode}): {' '.join(cmd)}")


def strip_locale_prefix(pathname: str) -> str:
    parts = [p for p in pathname.split("/") if p]
    if not parts:
        return "/"
    if parts[0] in LOCALES:
        remainder = "/".join(parts[1:])
        return f"/{remainder}" if remainder else "/"
    return pathname


def should_exclude(pathname: str, exclude_prefixes: list[str], exclude_contains: list[str]) -> bool:
    normalized = strip_locale_prefix(pathname)
    lowered = normalized.lower()

    for prefix in exclude_prefixes:
        if prefix == "/":
            continue
        normalized_prefix = normalize_path(prefix)
        if normalized == normalized_prefix or normalized.startswith(f"{normalized_prefix}/"):
            return True

    for token in exclude_contains:
        if token and token.lower() in lowered:
            return True

    return False


def build_sitemap_urls(site_url: str, settings: dict) -> list[str]:
    route_index = load_json(ROUTE_INDEX_PATH)
    state_slugs = load_state_slugs()

    candidates: list[str] = []
    for locale in LOCALES:
        for path in STATIC_PATHS:
            candidates.append(f"{site_url}/{locale}{path}")
        for policy in POLICY_SLUGS:
            candidates.append(f"{site_url}/{locale}/policies/{policy}")
        for state_slug in state_slugs:
            for template in STATE_ROUTE_TEMPLATES:
                candidates.append(f"{site_url}/{locale}{template.format(slug=state_slug)}")

    if isinstance(route_index, list):
        for item in route_index:
            if not isinstance(item, dict):
                continue
            locale = str(item.get("locale", "")).strip()
            slug = str(item.get("slug", "")).strip().strip("/")
            if locale in LOCALES and slug:
                candidates.append(f"{site_url}/{locale}/{slug}")

    exclude_prefixes = unique_list([normalize_path(x) for x in settings.get("excludePathPrefixes", []) if x])
    exclude_contains = unique_list([str(x).strip().lower() for x in settings.get("excludePathContains", []) if x])

    deduped: list[str] = []
    seen: set[str] = set()
    for url in candidates:
        canonical = url.rstrip("/")
        if not canonical.startswith("http://") and not canonical.startswith("https://"):
            continue
        if canonical in seen:
            continue
        parsed = urlparse(canonical)
        if should_exclude(parsed.path or "/", exclude_prefixes, exclude_contains):
            continue
        seen.add(canonical)
        deduped.append(canonical)

    return deduped


def build_sitemap_xml(urls: list[str]) -> str:
    lastmod = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        lines.extend(
            [
                "  <url>",
                f"    <loc>{url}</loc>",
                f"    <lastmod>{lastmod}</lastmod>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    lines.append("")
    return "\n".join(lines)


def write_sitemap_preview(urls: list[str], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(build_sitemap_xml(urls), encoding="utf-8")


def resolve_sitemap_urls_for_robots(site_url: str, settings: dict) -> list[str]:
    sitemap_path = normalize_path(str(settings.get("sitemapPath", "/sitemap.xml")))
    urls = [f"{site_url}{sitemap_path}"]
    for extra in settings.get("extraSitemaps", []):
        value = str(extra).strip()
        if not value:
            continue
        if value.startswith("http://") or value.startswith("https://"):
            urls.append(value)
        else:
            urls.append(f"{site_url}{normalize_path(value)}")
    return unique_list(urls)


def write_robots_txt(site_url: str, settings: dict) -> None:
    disallow = unique_list([normalize_path(str(x)) for x in settings.get("robotsDisallow", []) if str(x).strip()])
    sitemap_urls = resolve_sitemap_urls_for_robots(site_url, settings)
    host = urlparse(site_url).netloc
    generated_at = datetime.now(timezone.utc).isoformat()

    lines = [
        f"# Auto-generated by scripts/seo_refresh.py at {generated_at}",
        "User-agent: *",
        "Allow: /",
    ]
    lines.extend(f"Disallow: {path}" for path in disallow)
    lines.extend(f"Sitemap: {url}" for url in sitemap_urls)
    if host:
        lines.append(f"Host: {host}")
    lines.append("")

    ROBOTS_TXT_PATH.write_text("\n".join(lines), encoding="utf-8")


def ensure_google_auth_packages(auto_install: bool) -> None:
    has_service_account = importlib.util.find_spec("google.oauth2.service_account") is not None
    has_google_request = importlib.util.find_spec("google.auth.transport.requests") is not None
    if has_service_account and has_google_request:
        return

    if not auto_install:
        raise RuntimeError(
            "Service-account auth requires google-auth packages. "
            "Install with: python3 -m pip install google-auth google-auth-httplib2"
        )

    install_cmd = [sys.executable, "-m", "pip", "install", "google-auth", "google-auth-httplib2"]
    result = subprocess.run(install_cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        stdout = result.stdout.strip()
        stderr = result.stderr.strip()
        raise RuntimeError(
            "Failed to auto-install google-auth dependencies.\n"
            f"Command: {' '.join(install_cmd)}\n"
            f"stdout: {stdout or '(empty)'}\n"
            f"stderr: {stderr or '(empty)'}"
        )

    has_service_account = importlib.util.find_spec("google.oauth2.service_account") is not None
    has_google_request = importlib.util.find_spec("google.auth.transport.requests") is not None
    if not (has_service_account and has_google_request):
        raise RuntimeError("google-auth packages still unavailable after installation attempt.")


def get_access_token(submit: SubmitConfig) -> str:
    if submit.access_token:
        return submit.access_token

    env_token = (os.environ.get("GSC_ACCESS_TOKEN") or "").strip() or (
        os.environ.get("GOOGLE_ACCESS_TOKEN") or ""
    ).strip()
    if env_token:
        return env_token

    if submit.service_account_key:
        key_path = Path(submit.service_account_key).expanduser()
        if not key_path.is_file():
            raise RuntimeError(
                f"Service-account key file not found: {key_path}. "
                "Use the real path to your downloaded JSON key file."
            )

        ensure_google_auth_packages(submit.auto_install_auth_deps)
        try:
            from google.auth.transport.requests import Request as GoogleRequest
            from google.oauth2.service_account import Credentials
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(
                "Service-account auth requires google-auth packages. "
                "Install with: python3 -m pip install google-auth google-auth-httplib2"
            ) from exc

        creds = Credentials.from_service_account_file(
            str(key_path),
            scopes=["https://www.googleapis.com/auth/webmasters"],
        )
        creds.refresh(GoogleRequest())
        if not creds.token:
            raise RuntimeError("Failed to mint OAuth token from service-account key.")
        return creds.token

    if shutil.which("gcloud"):
        for cmd in (
            ["gcloud", "auth", "print-access-token"],
            ["gcloud", "auth", "application-default", "print-access-token"],
        ):
            result = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, check=False)
            token = result.stdout.strip()
            if result.returncode == 0 and token:
                return token

    raise RuntimeError(
        "Could not obtain Google OAuth token. Provide --access-token, --service-account-key, "
        "or authenticate with gcloud."
    )


def submit_sitemap_to_gsc(submit: SubmitConfig) -> None:
    if not submit.enabled:
        return

    if not submit.site_property:
        raise RuntimeError(
            "--submit-search-console requires --gsc-site-property. "
            "Examples: sc-domain:immigratetobrazil.com or https://www.immigratetobrazil.com/"
        )
    if not submit.sitemap_url:
        raise RuntimeError("--submit-search-console requires --gsc-sitemap-url.")

    token = get_access_token(submit)
    encoded_site = quote(submit.site_property, safe="")
    encoded_sitemap = quote(submit.sitemap_url, safe="")
    endpoint = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{encoded_site}/sitemaps/{encoded_sitemap}"

    request = Request(endpoint, method="PUT", headers={"Authorization": f"Bearer {token}"})
    try:
        with urlopen(request, timeout=30) as response:
            if response.status not in (200, 204):
                raise RuntimeError(f"Unexpected Search Console response status: {response.status}")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Search Console submission failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Search Console submission failed: {exc}") from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Refresh sitemap + robots + optional Google Search Console submission.",
    )
    parser.add_argument("--site-url", help="Canonical site URL, e.g. https://www.immigratetobrazil.com")
    parser.add_argument("--sitemap-path", help="Sitemap path, default /sitemap.xml")
    parser.add_argument("--add-exclude-prefix", action="append", default=[], help="Add sitemap exclusion prefix")
    parser.add_argument("--add-exclude-contains", action="append", default=[], help="Add sitemap exclusion token")
    parser.add_argument("--add-disallow", action="append", default=[], help="Add robots Disallow path")
    parser.add_argument("--skip-route-refresh", action="store_true", help="Skip npm run migrate:routes")
    parser.add_argument("--skip-robots-update", action="store_true", help="Do not rewrite robots.txt")
    parser.add_argument("--skip-sitemap-preview", action="store_true", help="Do not write sitemap preview XML")
    parser.add_argument("--dry-run", action="store_true", help="Show actions without writing files")
    parser.add_argument("--submit-search-console", action="store_true", help="Submit sitemap to Search Console")
    parser.add_argument("--gsc-site-property", help="Search Console property")
    parser.add_argument("--gsc-sitemap-url", help="Full sitemap URL to submit")
    parser.add_argument("--service-account-key", help="Path to Google service-account JSON key")
    parser.add_argument("--access-token", help="Google OAuth access token for Search Console API")
    parser.add_argument(
        "--no-auto-install-auth-deps",
        action="store_true",
        help="Disable automatic installation of google-auth dependencies.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    settings = {**DEFAULT_SETTINGS, **load_json(SEO_SETTINGS_PATH)}

    if args.site_url:
        settings["siteUrl"] = normalize_site_url(args.site_url)
    else:
        settings["siteUrl"] = normalize_site_url(str(settings.get("siteUrl", DEFAULT_SETTINGS["siteUrl"])))

    if args.sitemap_path:
        settings["sitemapPath"] = normalize_path(args.sitemap_path)
    else:
        settings["sitemapPath"] = normalize_path(str(settings.get("sitemapPath", DEFAULT_SETTINGS["sitemapPath"])))

    settings["excludePathPrefixes"] = unique_list(
        [normalize_path(x) for x in settings.get("excludePathPrefixes", []) if str(x).strip()]
        + [normalize_path(x) for x in args.add_exclude_prefix if str(x).strip()]
    )
    settings["excludePathContains"] = unique_list(
        [str(x).strip().lower() for x in settings.get("excludePathContains", []) if str(x).strip()]
        + [str(x).strip().lower() for x in args.add_exclude_contains if str(x).strip()]
    )
    settings["robotsDisallow"] = unique_list(
        [normalize_path(x) for x in settings.get("robotsDisallow", []) if str(x).strip()]
        + [normalize_path(x) for x in args.add_disallow if str(x).strip()]
    )
    settings["extraSitemaps"] = unique_list([str(x).strip() for x in settings.get("extraSitemaps", []) if str(x).strip()])

    if args.dry_run:
        print("DRY RUN: no files will be changed.")

    try:
        if not args.skip_route_refresh:
            print("Running: npm run migrate:routes")
            if not args.dry_run:
                run_command(["npm", "run", "migrate:routes"])

        sitemap_urls = build_sitemap_urls(settings["siteUrl"], settings)
        print(f"Sitemap candidates after filtering: {len(sitemap_urls)} URLs")

        if not args.dry_run:
            save_json(SEO_SETTINGS_PATH, settings)
            print(f"Updated: {SEO_SETTINGS_PATH.relative_to(PROJECT_ROOT)}")

        if not args.skip_sitemap_preview:
            if not args.dry_run:
                write_sitemap_preview(sitemap_urls, SITEMAP_PREVIEW_PATH)
            print(f"Sitemap preview: {SITEMAP_PREVIEW_PATH.relative_to(PROJECT_ROOT)}")

        if not args.skip_robots_update:
            if not args.dry_run:
                write_robots_txt(settings["siteUrl"], settings)
            print(f"Updated: {ROBOTS_TXT_PATH.relative_to(PROJECT_ROOT)}")

        submit = SubmitConfig(
            enabled=bool(args.submit_search_console),
            site_property=(args.gsc_site_property or "").strip() or None,
            sitemap_url=(args.gsc_sitemap_url or "").strip()
            or f"{settings['siteUrl']}{normalize_path(settings['sitemapPath'])}",
            access_token=(args.access_token or "").strip() or None,
            service_account_key=(args.service_account_key or "").strip() or None,
            auto_install_auth_deps=not bool(args.no_auto_install_auth_deps),
        )

        if submit.enabled:
            print("Submitting sitemap to Google Search Console...")
            if not args.dry_run:
                submit_sitemap_to_gsc(submit)
            print("Search Console submission completed.")

    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print("SEO refresh completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
