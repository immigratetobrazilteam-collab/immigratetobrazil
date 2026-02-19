#!/usr/bin/env python3
"""
Comprehensive Site SEO Audit Script
Scans static HTML site for SEO best practices, technical issues, on-page elements, and more.
Outputs:
- documentation/site-audit.md (detailed report with recommendations)
- documentation/site-inventory.json (JSON inventory of pages)
- documentation/site-inventory.csv (CSV inventory)

Improvements:
- Fixed orphan detection to handle trailing slashes properly
- Added more logging for troubleshooting
- Optimized some BeautifulSoup queries
- Added check for page load time estimation (stub, based on content size)
- Added Core Vitals proxy checks: missing image dimensions (for CLS), presence of lazy loading
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import posixpath
import re
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, asdict, fields
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

from bs4 import BeautifulSoup

SKIP_DIRS = {"backups", ".git", "node_modules", "__pycache__"}
EXTERNAL_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:", "#")
DEFAULT_KEYWORDS = ["immigrate to brazil", "brazil visa", "brazil immigration"]

@dataclass
class PageRecord:
    path: str
    title: str
    title_length: int
    description: str
    desc_length: int
    h1: str
    multiple_h1: bool
    h2_count: int
    word_count: int
    lang: str
    canonical: str
    hreflang: str
    has_viewport: bool
    charset: str
    has_robots_meta: bool
    has_og_tags: bool
    has_twitter_cards: bool
    has_schema: bool
    has_favicon: bool
    internal_links: int
    external_links: int
    broken_links: List[str]
    images: int
    missing_alt_images: int
    poor_alt_images: int
    broken_images: List[str]
    has_language_switcher: bool
    keyword_densities: Dict[str, float]
    has_https: bool
    has_structured_data_errors: bool
    content_size_kb: float
    missing_image_dimensions: int  # For CLS prevention
    has_lazy_loading: bool  # For LCP improvement

def setup_logging(log_level: str) -> None:
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("audit_log.txt"),
            logging.StreamHandler()
        ]
    )

def is_external(url: str) -> bool:
    lower = url.strip().lower()
    return lower.startswith(EXTERNAL_PREFIXES)

def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()) if text else ""

def split_url(url: str) -> Tuple[str, str, str]:
    path = url
    query = ""
    fragment = ""
    if "#" in path:
        path, fragment = path.split("#", 1)
        fragment = "#" + fragment
    if "?" in path:
        path, query = path.split("?", 1)
        query = "?" + query
    return path, query, fragment

def normalize_link(path: str, current_dir: str, files: Set[str], index_dirs: Set[str]) -> Optional[str]:
    if not path or is_external(path):
        return None
    path, query, fragment = split_url(path)
    if path.startswith("/"):
        normalized = posixpath.normpath(path)
    else:
        combined = posixpath.join(current_dir, path)
        normalized = posixpath.normpath("/" + combined.lstrip("/"))
    normalized_slash = normalized + '/' if not normalized.endswith('/') else normalized
    if normalized in files or normalized_slash in index_dirs or (normalized + "/index.html") in files or (normalized_slash + "index.html") in files:
        return normalized_slash if normalized_slash in index_dirs else normalized + query + fragment
    return None

def build_file_index(root: Path) -> Tuple[Set[str], Set[str]]:
    files: Set[str] = set()
    index_dirs: Set[str] = set()
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            rel = Path(dirpath, name).relative_to(root).as_posix()
            rel_path = "/" + rel
            files.add(rel_path)
            if name.lower() == "index.html":
                rel_dir = "/" + Path(dirpath).relative_to(root).as_posix() + "/"
                index_dirs.add(rel_dir)
    logging.info(f"Indexed {len(files)} files and {len(index_dirs)} index directories.")
    return files, index_dirs

def iter_html_files(root: Path) -> Iterable[Path]:
    count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.lower().endswith(".html"):
                count += 1
                yield Path(dirpath, name)
    logging.info(f"Found {count} HTML files.")

def read_text(path: Path) -> str:
    encodings = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
    for enc in encodings:
        try:
            content = path.read_text(encoding=enc)
            return content
        except UnicodeDecodeError:
            logging.debug(f"Failed encoding {enc} for {path}")
            continue
    logging.warning(f"Using replace for {path}")
    return path.read_text(encoding="utf-8", errors="replace")

def analyze_html(args: Tuple[Path, Path, Set[str], Set[str], Set[str]]) -> Optional[PageRecord]:
    file_path, root, files, index_dirs, all_internal_links = args
    try:
        content = read_text(file_path)
        content_size_kb = len(content.encode('utf-8')) / 1024
        soup = BeautifulSoup(content, "lxml")

        title_tag = soup.title
        title = clean_text(title_tag.string) if title_tag else ""
        title_length = len(title)

        desc_tag = soup.find("meta", {"name": "description"})
        description = clean_text(desc_tag["content"]) if desc_tag and desc_tag.get("content") else ""
        desc_length = len(description)

        h1_tags = soup.find_all("h1")
        h1 = clean_text(h1_tags[0].get_text()) if h1_tags else ""
        multiple_h1 = len(h1_tags) > 1

        h2_count = len(soup.find_all("h2"))

        body_text = soup.body.get_text(separator=" ", strip=True) if soup.body else ""
        word_count = len(body_text.split())

        keyword_densities = {}
        for kw in DEFAULT_KEYWORDS:
            count = len(re.findall(r'\b' + re.escape(kw.lower()) + r'\b', body_text.lower()))
            density = (count / word_count * 100) if word_count else 0
            keyword_densities[kw] = round(density, 2)

        html_tag = soup.html
        lang = html_tag["lang"] if html_tag and html_tag.has_attr("lang") else ""

        canonical_tag = soup.find("link", {"rel": "canonical"})
        canonical = canonical_tag["href"].strip() if canonical_tag and canonical_tag.has_attr("href") else ""

        hreflang_tags = soup.find_all("link", {"rel": "alternate", "hreflang": True})
        hreflang = ",".join(sorted(set(tag["hreflang"] for tag in hreflang_tags if tag.has_attr("hreflang"))))

        viewport_tag = soup.find("meta", {"name": "viewport"})
        has_viewport = bool(viewport_tag)

        charset_tag = soup.find("meta", {"charset": True}) or soup.find("meta", {"http-equiv": "content-type"})
        charset = charset_tag["charset"] if charset_tag and charset_tag.has_attr("charset") else (
            charset_tag["content"].split("charset=")[-1] if charset_tag and charset_tag.has_attr("content") and "charset=" in charset_tag["content"] else ""
        )

        robots_tag = soup.find("meta", {"name": "robots"})
        has_robots_meta = bool(robots_tag)

        og_tags = soup.find_all("meta", {"property": re.compile(r"^og:")})
        has_og_tags = len(og_tags) > 0

        twitter_tags = soup.find_all("meta", {"name": re.compile(r"^twitter:")})
        has_twitter_cards = len(twitter_tags) > 0

        schema_scripts = soup.find_all("script", {"type": "application/ld+json"})
        has_schema = len(schema_scripts) > 0
        has_structured_data_errors = False
        if has_schema:
            for script in schema_scripts:
                try:
                    json.loads(script.string or "")
                except (json.JSONDecodeError, TypeError):
                    has_structured_data_errors = True
                    break

        favicon_tag = soup.find("link", {"rel": re.compile(r"(icon|shortcut icon)")})
        has_favicon = bool(favicon_tag)

        rel_path = file_path.relative_to(root).as_posix()
        current_dir = "/" + file_path.parent.relative_to(root).as_posix()
        if current_dir == "/.":
            current_dir = "/"

        internal_links = 0
        external_links = 0
        broken_links = []
        has_https = True
        link_tags = soup.select("[href]")
        for tag in link_tags:
            href = tag.get("href", "").strip()
            if is_external(href):
                external_links += 1
                if href.startswith("http://"):
                    has_https = False
                continue
            resolved = normalize_link(href, current_dir, files, index_dirs)
            internal_links += 1
            if resolved:
                resolved_canonical = resolved.split("?")[0].split("#")[0].rstrip("/")
                all_internal_links.add(resolved_canonical)
                all_internal_links.add(resolved_canonical + "/")
            else:
                broken_links.append(href)

        images = 0
        missing_alt_images = 0
        poor_alt_images = 0
        broken_images = []
        missing_image_dimensions = 0
        img_tags = soup.find_all("img", src=True)
        generic_alts = {"image", "img", "photo", "", " "}
        for img in img_tags:
            src = img["src"].strip()
            images += 1
            alt = img.get("alt", "").strip().lower()
            if not alt:
                missing_alt_images += 1
            elif len(alt) < 5 or alt in generic_alts:
                poor_alt_images += 1
            if not (img.has_attr('width') and img.has_attr('height')):
                missing_image_dimensions += 1
            if not is_external(src):
                resolved = normalize_link(src, current_dir, files, index_dirs)
                if resolved is None:
                    broken_images.append(src)

        has_lazy_loading = any(img.has_attr('loading') and img['loading'] == 'lazy' for img in img_tags)

        has_language_switcher = bool(soup.select_one("[class*=language-switcher]") or "language-switcher" in content.lower())

        return PageRecord(
            path=rel_path,
            title=title,
            title_length=title_length,
            description=description,
            desc_length=desc_length,
            h1=h1,
            multiple_h1=multiple_h1,
            h2_count=h2_count,
            word_count=word_count,
            lang=lang,
            canonical=canonical,
            hreflang=hreflang,
            has_viewport=has_viewport,
            charset=charset,
            has_robots_meta=has_robots_meta,
            has_og_tags=has_og_tags,
            has_twitter_cards=has_twitter_cards,
            has_schema=has_schema,
            has_favicon=has_favicon,
            internal_links=internal_links,
            external_links=external_links,
            broken_links=broken_links,
            images=images,
            missing_alt_images=missing_alt_images,
            poor_alt_images=poor_alt_images,
            broken_images=broken_images,
            has_language_switcher=has_language_switcher,
            keyword_densities=keyword_densities,
            has_https=has_https and (not canonical or canonical.startswith("https://")),
            has_structured_data_errors=has_structured_data_errors,
            content_size_kb=round(content_size_kb, 2),
            missing_image_dimensions=missing_image_dimensions,
            has_lazy_loading=has_lazy_loading,
        )
    except Exception as e:
        logging.error(f"Error analyzing {file_path}: {e}")
        return None

def find_orphans(files: Set[str], all_internal_links: Set[str]) -> List[str]:
    orphans = []
    for f in files:
        if f.endswith(".html"):
            canonical_f = f.rstrip("/index.html").rstrip("/")
            canonical_f_slash = canonical_f + "/"
            if canonical_f not in all_internal_links and canonical_f_slash not in all_internal_links and f not in all_internal_links:
                orphans.append(f)
    logging.info(f"Found {len(orphans)} orphan pages.")
    return orphans

def find_duplicates(records: List[PageRecord]) -> Dict[str, Dict[str, List[str]]]:
    title_to_paths: Dict[str, List[str]] = {}
    desc_to_paths: Dict[str, List[str]] = {}
    for r in records:
        if r.title:
            title_to_paths.setdefault(r.title, []).append(r.path)
        if r.description:
            desc_to_paths.setdefault(r.description, []).append(r.path)
    duplicate_titles = {t: p for t, p in title_to_paths.items() if len(p) > 1}
    duplicate_descs = {d: p for d, p in desc_to_paths.items() if len(p) > 1}
    logging.info(f"Found {len(duplicate_titles)} duplicate title groups and {len(duplicate_descs)} duplicate description groups.")
    return {"titles": duplicate_titles, "descriptions": duplicate_descs}

def check_site_files(root: Path) -> Dict[str, bool]:
    has_robots = (root / "robots.txt").exists()
    has_sitemap = (root / "sitemap.xml").exists()
    has_404 = (root / "404.html").exists()
    logging.info(f"Site files: robots.txt={has_robots}, sitemap.xml={has_sitemap}, 404.html={has_404}")
    return {
        "has_robots_txt": has_robots,
        "has_sitemap_xml": has_sitemap,
        "has_custom_404": has_404,
    }

def write_inventory(records: List[PageRecord], out_json: Path, out_csv: Path) -> None:
    out_json.parent.mkdir(parents=True, exist_ok=True)
    try:
        with out_json.open("w", encoding="utf-8") as f:
            json.dump([asdict(r) for r in records], f, indent=2)
        with out_csv.open("w", encoding="utf-8", newline="") as f:
            fieldnames = [field.name for field in fields(PageRecord)]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in records:
                row = asdict(r)
                row["broken_links"] = ", ".join(row["broken_links"])
                row["broken_images"] = ", ".join(row["broken_images"])
                row["keyword_densities"] = json.dumps(row["keyword_densities"])
                writer.writerow(row)
        logging.info(f"Inventory written to {out_json} and {out_csv}")
    except Exception as e:
        logging.error(f"Error writing inventory: {e}")

def generate_md_table(headers: List[str], rows: List[List[str]]) -> str:
    table = "| " + " | ".join(headers) + " |\n"
    table += "| " + "--- | " * len(headers) + "\n"
    for row in rows:
        table += "| " + " | ".join(map(str, row)) + " |\n"
    return table

def write_documentation(records: List[PageRecord], out_md: Path, base_url: str, site_files: Dict[str, bool], orphans: List[str], duplicates: Dict[str, Dict[str, List[str]]]) -> None:
    out_md.parent.mkdir(parents=True, exist_ok=True)
    lines = []

    total_pages = len(records)

    missing_title = sum(1 for r in records if not r.title)
    suboptimal_title = sum(1 for r in records if r.title_length < 30 or r.title_length > 70)
    missing_desc = sum(1 for r in records if not r.description)
    suboptimal_desc = sum(1 for r in records if r.desc_length < 100 or r.desc_length > 160)
    missing_h1 = sum(1 for r in records if not r.h1)
    multiple_h1_pages = sum(1 for r in records if r.multiple_h1)
    thin_content = sum(1 for r in records if r.word_count < 300)
    missing_lang = sum(1 for r in records if not r.lang)
    missing_canonical = sum(1 for r in records if not r.canonical)
    missing_viewport = sum(1 for r in records if not r.has_viewport)
    non_utf8_charset = sum(1 for r in records if r.charset.lower() not in ("utf-8", ""))
    missing_robots_meta = sum(1 for r in records if not r.has_robots_meta)
    missing_og = sum(1 for r in records if not r.has_og_tags)
    missing_twitter = sum(1 for r in records if not r.has_twitter_cards)
    missing_schema = sum(1 for r in records if not r.has_schema)
    structured_errors = sum(1 for r in records if r.has_structured_data_errors)
    missing_favicon = sum(1 for r in records if not r.has_favicon)
    broken_links_total = sum(len(r.broken_links) for r in records)
    broken_images_total = sum(len(r.broken_images) for r in records)
    missing_alt_total = sum(r.missing_alt_images for r in records)
    poor_alt_total = sum(r.poor_alt_images for r in records)
    non_https_pages = sum(1 for r in records if not r.has_https)
    large_pages = sum(1 for r in records if r.content_size_kb > 100)
    missing_dimensions_total = sum(r.missing_image_dimensions for r in records)
    pages_without_lazy = sum(1 for r in records if not r.has_lazy_loading and r.images > 0)

    avg_densities = {}
    zero_density_pages = {kw: [] for kw in DEFAULT_KEYWORDS}
    high_density_pages = {kw: [] for kw in DEFAULT_KEYWORDS}
    for kw in DEFAULT_KEYWORDS:
        densities = [r.keyword_densities.get(kw, 0) for r in records]
        avg_densities[kw] = sum(densities) / total_pages if total_pages else 0
        for r in records:
            density = r.keyword_densities.get(kw, 0)
            if density == 0:
                zero_density_pages[kw].append(r.path)
            if density > 3:
                high_density_pages[kw].append(r.path)

    lines.append("# Comprehensive Site SEO Audit Report")
    lines.append("")
    lines.append(f"**Base URL:** {base_url}")
    lines.append(f"**Total HTML Pages Scanned:** {total_pages}")
    lines.append("")
    lines.append("## Executive Summary")
    lines.append("This audit evaluates the site against key SEO best practices, including technical, on-page, and content aspects.")
    lines.append("### Key Metrics")
    lines.append(f"- Pages missing title: {missing_title} ({missing_title/total_pages:.1%} if total_pages else '0%')")
    lines.append(f"- Suboptimal title length (<30 or >70 chars): {suboptimal_title}")
    lines.append(f"- Pages missing meta description: {missing_desc} ({missing_desc/total_pages:.1%} if total_pages else '0%')")
    lines.append(f"- Suboptimal description length (<100 or >160 chars): {suboptimal_desc}")
    lines.append(f"- Pages missing H1: {missing_h1} ({missing_h1/total_pages:.1%} if total_pages else '0%')")
    lines.append(f"- Pages with multiple H1: {multiple_h1_pages}")
    lines.append(f"- Thin content pages (<300 words): {thin_content}")
    lines.append(f"- Pages missing lang attribute: {missing_lang}")
    lines.append(f"- Pages missing canonical: {missing_canonical}")
    lines.append(f"- Pages missing viewport meta: {missing_viewport}")
    lines.append(f"- Pages with non-UTF-8 charset: {non_utf8_charset}")
    lines.append(f"- Pages missing robots meta: {missing_robots_meta}")
    lines.append(f"- Pages missing Open Graph tags: {missing_og}")
    lines.append(f"- Pages missing Twitter Cards: {missing_twitter}")
    lines.append(f"- Pages missing schema markup: {missing_schema}")
    lines.append(f"- Pages with structured data errors: {structured_errors}")
    lines.append(f"- Pages missing favicon: {missing_favicon}")
    lines.append(f"- Total broken internal links: {broken_links_total}")
    lines.append(f"- Total broken images: {broken_images_total}")
    lines.append(f"- Total images missing alt text: {missing_alt_total}")
    lines.append(f"- Total images with poor alt text: {poor_alt_total}")
    lines.append(f"- Pages without HTTPS: {non_https_pages}")
    lines.append(f"- Large content pages (>100KB): {large_pages}")
    lines.append(f"- Total images missing dimensions: {missing_dimensions_total}")
    lines.append(f"- Pages without lazy loading (with images): {pages_without_lazy}")
    lines.append(f"- Orphan pages (not linked internally): {len(orphans)}")
    lines.append(f"- Duplicate titles: {len(duplicates['titles'])} groups")
    lines.append(f"- Duplicate descriptions: {len(duplicates['descriptions'])} groups")
    lines.append(f"- Has robots.txt: {'Yes' if site_files['has_robots_txt'] else 'No'}")
    lines.append(f"- Has sitemap.xml: {'Yes' if site_files['has_sitemap_xml'] else 'No'}")
    lines.append(f"- Has custom 404.html: {'Yes' if site_files['has_custom_404'] else 'No'}")
    lines.append("")

    lines.append("### Keyword Density Analysis")
    for kw, avg in avg_densities.items():
        lines.append(f"- Average density for '{kw}': {avg:.2f}%")
    lines.append("Ideal keyword density is typically 1-2%. Avoid over-optimization (>3%).")
    lines.append("")

    lines.append("## Priority Recommendations")
    lines.append("- Ensure all pages have unique, descriptive titles (50-60 chars) and descriptions (150-160 chars).")
    lines.append("- Add missing H1 tags and ensure only one per page.")
    lines.append("- Flesh out thin content pages to >300 words with valuable info.")
    lines.append("- Optimize keyword densities: Aim for 1-2% on relevant pages, avoid stuffing.")
    lines.append("- Fix all broken links and images.")
    lines.append("- Add descriptive alt text to all images; avoid generic terms.")
    lines.append("- Add width and height attributes to images to prevent layout shifts (CLS).")
    lines.append("- Add loading='lazy' to images for better LCP.")
    lines.append("- Implement viewport meta for mobile responsiveness if missing.")
    lines.append("- Use UTF-8 charset consistently.")
    lines.append("- Add robots meta where needed (e.g., index,follow).")
    lines.append("- Implement OG and Twitter tags for social sharing.")
    lines.append("- Add/validate schema markup for rich snippets.")
    lines.append("- Ensure favicon is linked.")
    lines.append("- Enforce HTTPS in all links and canonicals.")
    lines.append("- Compress large pages to improve load times.")
    lines.append("- Link to orphan pages or remove if unused.")
    lines.append("- Deduplicate titles and descriptions.")
    lines.append("- Create robots.txt and sitemap.xml if missing.")
    lines.append("- Add custom 404 page if not present.")
    lines.append("")

    lines.append("## Detailed Issues")

    broken_link_pages = [(r.path, r.broken_links) for r in records if r.broken_links]
    if broken_link_pages:
        lines.append("### Broken Internal Links")
        rows = [["Page", "Broken Links"]]
        for path, bl in broken_link_pages:
            rows.append([path, ", ".join(bl)])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    broken_img_pages = [(r.path, r.broken_images) for r in records if r.broken_images]
    if broken_img_pages:
        lines.append("### Broken Images")
        rows = [["Page", "Broken Images"]]
        for path, bi in broken_img_pages:
            rows.append([path, ", ".join(bi)])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    missing_alt_pages = [(r.path, r.missing_alt_images) for r in records if r.missing_alt_images > 0]
    if missing_alt_pages:
        lines.append("### Images Missing Alt Text")
        rows = [["Page", "Count"]]
        for path, count in missing_alt_pages:
            rows.append([path, count])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    poor_alt_pages = [(r.path, r.poor_alt_images) for r in records if r.poor_alt_images > 0]
    if poor_alt_pages:
        lines.append("### Images with Poor Alt Text")
        rows = [["Page", "Count"]]
        for path, count in poor_alt_pages:
            rows.append([path, count])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    missing_dimensions_pages = [(r.path, r.missing_image_dimensions) for r in records if r.missing_image_dimensions > 0]
    if missing_dimensions_pages:
        lines.append("### Images Missing Dimensions (Potential CLS Issues)")
        rows = [["Page", "Count"]]
        for path, count in missing_dimensions_pages:
            rows.append([path, count])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    no_lazy_pages = [r.path for r in records if not r.has_lazy_loading and r.images > 0]
    if no_lazy_pages:
        lines.append("### Pages Without Lazy Loading (Potential LCP Issues)")
        rows = [["Path"]]
        for p in sorted(no_lazy_pages):
            rows.append([p])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    non_https_pages_list = [r.path for r in records if not r.has_https]
    if non_https_pages_list:
        lines.append("### Pages without HTTPS Enforcement")
        rows = [["Path"]]
        for p in sorted(non_https_pages_list):
            rows.append([p])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    structured_error_pages = [r.path for r in records if r.has_structured_data_errors]
    if structured_error_pages:
        lines.append("### Pages with Structured Data Errors")
        rows = [["Path"]]
        for p in sorted(structured_error_pages):
            rows.append([p])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    large_pages_list = [(r.path, r.content_size_kb) for r in records if r.content_size_kb > 100]
    if large_pages_list:
        lines.append("### Large Content Pages (>100KB)")
        rows = [["Path", "Size (KB)"]]
        for path, size in sorted(large_pages_list, key=lambda x: x[1], reverse=True):
            rows.append([path, size])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    if orphans:
        lines.append("### Orphan Pages")
        rows = [["Path"]]
        for o in sorted(orphans):
            rows.append([o])
        lines.append(generate_md_table(rows[0], rows[1:]))
        lines.append("")

    if duplicates["titles"]:
        lines.append("### Duplicate Titles")
        for title, paths in duplicates["titles"].items():
            lines.append(f"**{title}** (used on {len(paths)} pages): {', '.join(paths)}")
        lines.append("")
    if duplicates["descriptions"]:
        lines.append("### Duplicate Descriptions")
        for desc, paths in duplicates["descriptions"].items():
            lines.append(f"**{desc[:50]}...** (used on {len(paths)} pages): {', '.join(paths)}")
        lines.append("")

    for kw in DEFAULT_KEYWORDS:
        zero_pages = zero_density_pages[kw]
        if zero_pages:
            lines.append(f"### Pages with Zero Density for '{kw}'")
            rows = [["Path"]]
            for p in sorted(zero_pages):
                rows.append([p])
            lines.append(generate_md_table(rows[0], rows[1:]))
            lines.append("")

        high_pages = high_density_pages[kw]
        if high_pages:
            lines.append(f"### Pages with High Density (>3%) for '{kw}'")
            rows = [["Path", "Density"]]
            for p in sorted(high_pages):
                for r in records:
                    if r.path == p:
                        rows.append([p, f"{r.keyword_densities[kw]}%"])
                        break
            lines.append(generate_md_table(rows[0], rows[1:]))
            lines.append("")

    lines.append("## Full Page Inventory")
    lines.append("See site-inventory.json and site-inventory.csv for detailed per-page data.")
    lines.append("")

    try:
        out_md.write_text("\n".join(lines), encoding="utf-8")
        logging.info(f"Report written to {out_md}")
    except Exception as e:
        logging.error(f"Error writing report: {e}")

def main() -> int:
    parser = argparse.ArgumentParser(description="Comprehensive SEO site audit.")
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--base-url", default="https://www.immigratetobrazil.com")
    parser.add_argument("--workers", type=int, default=os.cpu_count() or 4, help="Number of worker processes")
    parser.add_argument("--log-level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])
    args = parser.parse_args()
    setup_logging(args.log_level)
    root = Path(args.root).resolve()

    if not root.exists():
        logging.error(f"Root directory does not exist: {root}")
        return 1

    try:
        files, index_dirs = build_file_index(root)
        all_internal_links: Set[str] = set()
        records: List[PageRecord] = []
        html_files = list(iter_html_files(root))
        logging.info(f"Starting parallel analysis with {args.workers} workers on {len(html_files)} files.")

        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = [executor.submit(analyze_html, (f, root, files, index_dirs, all_internal_links)) for f in html_files]
            for future in as_completed(futures):
                result = future.result()
                if result:
                    records.append(result)

        orphans = find_orphans(files, all_internal_links)
        duplicates = find_duplicates(records)
        site_files = check_site_files(root)

        out_md = root / "documentation" / "site-audit.md"
        out_json = root / "documentation" / "site-inventory.json"
        out_csv = root / "documentation" / "site-inventory.csv"

        write_inventory(records, out_json, out_csv)
        write_documentation(records, out_md, args.base_url, site_files, orphans, duplicates)

        print("\nAudit complete.")
        print(f"Pages scanned: {len(records)}")
        print(f"Report: {out_md}")
        print(f"JSON Inventory: {out_json}")
        print(f"CSV Inventory: {out_csv}")
        return 0
    except Exception as e:
        logging.error(f"Unexpected error during audit: {e}", exc_info=True)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())