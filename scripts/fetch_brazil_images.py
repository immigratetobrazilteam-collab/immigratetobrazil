#!/usr/bin/env python3
"""
scripts/fetch_brazil_images.py
Fetch up to 10 images per page (section-based) across the entire site. 
Primary source: Pixabay
Fallback: Wikimedia Commons
"""

from __future__ import annotations
import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError as exc:
    raise SystemExit("Missing dependency: requests. Install with `pip install requests`.") from exc

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "scripts" / "image_config.yml"
ASSETS_ROOT = ROOT / "assets" / "brazil" / "sitewide"
METADATA_PATH = ASSETS_ROOT / "image-metadata.json"

EXCLUDE_PATHS = [
    "assets",
    "css",
    "js",
    "data",
    "partials",
    "scripts",
    "i18n",
    "docs",
    "_headers",
    "robots.txt",
]


def slugify(val: str) -> str:
    x = val.strip().lower()
    x = re.sub(r"[^\w\s-]", "", x)
    x = re.sub(r"[\s_]+", "-", x)
    x = re.sub(r"-{2,}", "-", x)
    return x.strip("-")[:100] or "unnamed"


def mkdir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, data: Any) -> None:
    mkdir(path.parent)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def get_config(path: Path = CONFIG_PATH) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"No config found at {path}")
    import yaml
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def filter_page(path: Path) -> bool:
    strpath = str(path)
    if not path.name.endswith(".html"):
        return False
    for ex in EXCLUDE_PATHS:
        if f"/{ex}/" in strpath or path.parts[0] == ex:
            return False
    return True


def find_site_pages() -> List[Path]:
    all_html = [p for p in ROOT.rglob("*.html") if filter_page(p)]
    # Guaranteed index pages and content pages
    return sorted(all_html)


def extract_section_ids(html_text: str) -> List[str]:
    ids = []
    # Section id attributes first
    for match in re.finditer(
        r"<section\b[^>]*\bid\s*=\s*['\"]([^'\"]+)['\"][^>]*>", html_text, flags=re.IGNORECASE
    ):
        ids.append(slugify(match.group(1)))
    if ids:
        return ids

    # fallback to general elements with id
    for match in re.finditer(r"\bid\s*=\s*['\"]([^'\"]+)['\"]", html_text, flags=re.IGNORECASE):
        ids.append(slugify(match.group(1)))
    if ids:
        return ids

    # fallback to headings
    for match in re.finditer(r"<h[23]\b[^>]*>([^<]+)</h[23]>", html_text, flags=re.IGNORECASE):
        ids.append(slugify(match.group(1)))
    return ids


def make_query_variants(page_slug: str, section_slug: str) -> Dict[str, List[str]]:
    base_en = f"{page_slug} {section_slug} Brazil immigration cinematic background"
    base_pt = f"{page_slug} {section_slug} Brasil imigração cinematográfica"
    return {
        "en": [
            base_en,
            f"{section_slug} Brazil lifestyle route city photo",
            f"cinematic {section_slug} Brazil horizon"
        ],
        "pt": [
            base_pt,
            f"{section_slug} Brasil vida urbana rota foto",
            f"cinematográfico {section_slug} Brasil"
        ],
    }


def query_pixabay(api_key: str, query: str, per_page: int = 8) -> List[Dict[str, Any]]:
    url = "https://pixabay.com/api/"
    params = {
        "key": api_key,
        "q": query,
        "image_type": "photo",
        "orientation": "horizontal",
        "safesearch": True,
        "order": "popular",
        "per_page": per_page,
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    return data.get("hits", [])


def query_wikimedia(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url",
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    hits = []
    pages = data.get("query", {}).get("pages", {})
    for page_obj in pages.values():
        imageinfo = page_obj.get("imageinfo")
        if not imageinfo:
            continue
        image = imageinfo[0]
        if image.get("url"):
            hits.append(
                {"id": str(page_obj.get("pageid")), "imageURL": image["url"], "pageURL": f"https://commons.wikimedia.org/wiki?curid={page_obj.get('pageid')}", "tags": query, "user": "Wikimedia Commons", "source": "wikimedia"}
            )
    return hits


def pick_image_candidate(candidates: List[Dict[str, Any]], taken: set) -> Optional[Dict[str, Any]]:
    for item in candidates:
        image_id = str(item.get("id") or item.get("imageURL") or "")
        if not image_id or image_id in taken:
            continue
        image_url = item.get("imageURL") or item.get("webformatURL") or item.get("largeImageURL")
        if not image_url:
            continue
        taken.add(image_id)
        item["imageURL"] = image_url
        return item
    return None


def section_output_path(page_slug: str, section_slug: str, image_id: str, source: str) -> Path:
    name = f"{section_slug}-{source}-{image_id}.jpg"
    return ASSETS_ROOT / page_slug / section_slug / name


def process_page(page_path: Path, conf: Dict[str, Any], taken: set, per_page: int) -> Dict[str, Any]:
    html_text = page_path.read_text(encoding="utf-8", errors="ignore")
    section_ids = extract_section_ids(html_text)[:per_page]
    if not section_ids:
        # fallback page-wide placeholder section
        section_ids = ["main"]
    page_slug = slugify(str(page_path.relative_to(ROOT).with_suffix("")))
    page_meta = {"page": page_slug, "source_file": str(page_path), "image_slots": []}

    queries_map = {}
    for section_slug in section_ids:
        queries_map[section_slug] = make_query_variants(page_slug, section_slug)

    for section_slug in section_ids:
        section_meta = {"section": section_slug, "images": []}
        q_variants = queries_map.get(section_slug, {})
        all_queries = []
        for lang in ["en", "pt"]:
            all_queries.extend(q_variants.get(lang, []))

        found = False
        for q in all_queries:
            if found:
                break
            # pixabay
            for attempt in range(conf["api"].get("retry_attempts", 3)):
                try:
                    hits = query_pixabay(conf["api"]["pixabay_key"], q, per_page=8)
                    candidate = pick_image_candidate(hits, taken)
                    if candidate:
                        candidate["source"] = "pixabay"
                        candidate["query"] = q
                        found = True
                        break
                except Exception:
                    time.sleep(conf["api"].get("retry_delay_seconds", 2))
            if found:
                section_meta["images"].append({
                    "source": "pixabay",
                    "query": q,
                    "id": candidate.get("id"),
                    "imageURL": candidate.get("imageURL"),
                    "pageURL": candidate.get("pageURL"),
                    "alt": f"{page_slug} {section_slug} Brazil immigration background",
                    "description": f"Cinematic Brazil background for {page_slug}/{section_slug} section.",
                })
                dest = section_output_path(page_slug, section_slug, candidate.get("id", "unknown"), candidate["source"])
                mkdir(dest.parent)
                try:
                    response = requests.get(candidate["imageURL"], stream=True, timeout=25)
                    response.raise_for_status()
                    with dest.open("wb") as f:
                        for chunk in response.iter_content(8192):
                            if chunk:
                                f.write(chunk)
                    section_meta["images"][-1]["file_path"] = str(dest.relative_to(ROOT))
                except Exception as e:
                    section_meta["images"][-1]["download_error"] = str(e)
                break

        if not found:
            # fallback creative commons
            for q in all_queries:
                try:
                    hits = query_wikimedia(q, limit=8)
                    candidate = pick_image_candidate(hits, taken)
                    if candidate:
                        candidate["source"] = "wikimedia"
                        candidate["query"] = q
                        found = True
                        section_meta["images"].append({
                            "source": "wikimedia",
                            "query": q,
                            "id": candidate.get("id"),
                            "imageURL": candidate.get("imageURL"),
                            "pageURL": candidate.get("pageURL"),
                            "alt": f"{page_slug} {section_slug} Brazil immigration background",
                            "description": f"Cinematic Brazil background for {page_slug}/{section_slug} section.",
                        })
                        dest = section_output_path(page_slug, section_slug, candidate.get("id", "unknown"), candidate["source"])
                        mkdir(dest.parent)
                        response = requests.get(candidate["imageURL"], stream=True, timeout=25)
                        response.raise_for_status()
                        with dest.open("wb") as f:
                            for chunk in response.iter_content(8192):
                                if chunk:
                                    f.write(chunk)
                        section_meta["images"][-1]["file_path"] = str(dest.relative_to(ROOT))
                        break
                except Exception:
                    continue

        page_meta["image_slots"].append(section_meta)

    return page_meta


def main(section: Optional[str] = None, page_limit: int = 0):
    cfg = get_config()
    api_key = cfg["api"]["pixabay_key"]
    images_per_section = 10
    pages = find_site_pages()
    if page_limit > 0:
        pages = pages[:page_limit]

    taken_ids = set()
    out = {"generated": time.strftime("%Y-%m-%d %H:%M:%S"), "pages": []}

    for page in pages:
        try:
            page_meta = process_page(page, cfg, taken_ids, images_per_section, filter_section=section)
            out["pages"].append(page_meta)
        except Exception as e:
            print(f"[WARN] page {page} error {e}", file=sys.stderr)

    write_json(METADATA_PATH, out)
    print("[INFO] done", METADATA_PATH)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch Brazil background images for site sections.")
    parser.add_argument("--section", help="Limit fetch to only this section ID (sitewide)\n")
    parser.add_argument("--page-limit", type=int, default=0, help="Max pages to process (0 => all)")
    args = parser.parse_args()
    main(section=args.section, page_limit=args.page_limit)