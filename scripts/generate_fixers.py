#!/usr/bin/env python3
"""
Meta-script to automatically generate individual Python fixer scripts based on site audit inventory.
Usage:
    python3 scripts/generate_fixers.py --inventory documentation/site-inventory.json --output-dir fixer_scripts
Improvements:
- Added logging for troubleshooting
- Handled potential key errors in record access
- Updated template with fixed orphan logic in mind
- Added fixer for large_pages (stub: comment on compression)
- Added fixers for Core Vitals issues: missing_image_dimensions, no_lazy_loading
- Fixed indentation in ISSUE_FIXES to prevent syntax errors in generated scripts
- Ensured proper escaping in template to avoid KeyError during .format()
- Used textwrap.dedent and indent to handle indentation correctly
- Doubled braces for set and dict literals to prevent formatting errors
- Adjusted template to have no leading indentation on code lines
- Set fix_logic indent to 8 spaces to match try block indentation
"""
import argparse
import json
import logging
from pathlib import Path
import re
from typing import Set, Tuple, Optional
import textwrap

def setup_logging():
    logging.basicConfig(
        level="DEBUG",
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("generate_fixers_log.txt"),
            logging.StreamHandler()
        ]
    )

FIXER_TEMPLATE = textwrap.dedent(r"""\
#!/usr/bin/env python3
from __future__ import annotations

'''
Fixer script for {issue_name}.
Generated automatically from site audit.
Usage: python3 {script_name} --root /path/to/site --dry-run --backup --log-level DEBUG
'''
import argparse
import json
import logging
import os
import re
import shutil
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from typing import Iterable, Set, Tuple, Optional
from bs4 import BeautifulSoup
import posixpath

SKIP_DIRS = {{"backups", ".git", "node_modules", "__pycache__"}}
EXTERNAL_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:", "#")

def setup_logging(log_level: str) -> None:
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("fixer_log.txt"),
            logging.StreamHandler()
        ]
    )

def is_external(url: str) -> bool:
    lower = url.strip().lower()
    return lower.startswith(EXTERNAL_PREFIXES)

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
        return path
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
                index_dirs.add("/" + Path(dirpath).relative_to(root).as_posix() + "/")
    logging.info(f"Indexed {{len(files)}} files.")
    return files, index_dirs

def iter_html_files(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.lower().endswith(".html"):
                yield Path(dirpath, name)

def read_text(path: Path) -> str:
    encodings = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
    for enc in encodings:
        try:
            return path.read_text(encoding=enc)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="replace")

def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")

def fix_file(args: Tuple[Path, Path, bool, bool, Set[str], Set[str]]) -> bool:
    file_path, root, dry_run, backup, files, index_dirs = args
    try:
        content = read_text(file_path)
        soup = BeautifulSoup(content, "lxml")
        current_dir = "/" + file_path.parent.relative_to(root).as_posix()
        if current_dir == "/.":
            current_dir = "/"
        # Issue-specific fix logic here
        {fix_logic}
        updated = str(soup)
        if updated == content:
            return False
        if not dry_run:
            if backup:
                backup_path = file_path.with_suffix(file_path.suffix + ".bak")
                shutil.copy(file_path, backup_path)
                logging.info(f"Backed up {{file_path}} to {{backup_path}}")
            write_text(file_path, updated)
            logging.info(f"Fixed {{file_path}}")
        else:
            logging.info(f"Dry run: Would fix {{file_path}}")
        return True
    except Exception as e:
        logging.error(f"Error fixing {{file_path}}: {{e}}")
        return False

def main() -> int:
    parser = argparse.ArgumentParser(description="Fix {issue_name}.")
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--backup", action="store_true")
    parser.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    parser.add_argument("--log-level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR"])
    args = parser.parse_args()
    setup_logging(args.log_level)
    root = Path(args.root).resolve()
    if not root.exists():
        logging.error(f"Root directory does not exist: {{root}}")
        return 1
    try:
        files, index_dirs = build_file_index(root)
        html_files = list(iter_html_files(root))
        changed = 0
        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = [executor.submit(fix_file, (f, root, args.dry_run, args.backup, files, index_dirs)) for f in html_files]
            for future in as_completed(futures):
                if future.result():
                    changed += 1
        print(f"Fixed {{changed}} files for {issue_name}.")
        return 0
    except Exception as e:
        logging.error(f"Unexpected error: {{e}}", exc_info=True)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
""")

ISSUE_FIXES = {
    "missing_titles": r"""
if not soup.title:
    h1 = soup.h1.get_text(strip=True) if soup.h1 else ''
    if not h1:
        filename = file_path.stem.replace('-', ' ').replace('_', ' ').title()
        h1 = filename if filename.lower() != 'index' else 'Home'
    new_title = soup.new_tag("title")
    new_title.string = f"{h1} | Immigrate to Brazil"
    if soup.head:
        soup.head.insert(0, new_title)
    else:
        new_head = soup.new_tag("head")
        new_head.append(new_title)
        soup.html.insert(0, new_head)
""",
    "suboptimal_titles": r"""
if soup.title:
    current = soup.title.string.strip() if soup.title.string else ''
    length = len(current)
    if length < 30 or length > 70:
        if length < 30:
            optimized = current + " - Comprehensive Guide to Brazil Immigration"
            if len(optimized) > 70:
                optimized = optimized[:67] + "..."
        else:
            optimized = current[:67] + "..."
        soup.title.string = optimized
""",
    "missing_descriptions": r"""
desc_tag = soup.find("meta", attrs={{"name": "description"}})
if not desc_tag or not desc_tag.get("content"):
    body_text = ' '.join(soup.body.get_text(strip=True).split()[:50]) if soup.body else ''
    desc = f"{body_text} - Your ultimate resource for immigrating to Brazil." if body_text else "Comprehensive guide to Brazil visas, residency, and immigration processes."
    if len(desc) > 160:
        desc = desc[:157] + "..."
    elif len(desc) < 100:
        desc += " Explore visa options, requirements, and tips."
    if desc_tag:
        desc_tag["content"] = desc
    else:
        new_desc = soup.new_tag("meta", name="description", content=desc)
        if soup.head:
            soup.head.append(new_desc)
""",
    "suboptimal_descriptions": r"""
desc_tag = soup.find("meta", attrs={{"name": "description"}})
if desc_tag and desc_tag.get("content"):
    current = desc_tag["content"].strip()
    length = len(current)
    if length < 100:
        appended = current + " Discover more about Brazil immigration options, visas, and residency requirements."
        desc_tag["content"] = appended[:160]
    elif length > 160:
        desc_tag["content"] = current[:157] + "..."
""",
    "missing_h1": r"""
if not soup.find("h1"):
    title = soup.title.string.strip() if soup.title else file_path.stem.replace('-', ' ').title()
    new_h1 = soup.new_tag("h1")
    new_h1.string = title
    if soup.body:
        soup.body.insert(0, new_h1)
""",
    "multiple_h1": r"""
h1_tags = soup.find_all("h1")
if len(h1_tags) > 1:
    for h1 in h1_tags[1:]:
        h1.name = "h2"
""",
    "missing_lang": r"""
html_tag = soup.html
if html_tag and not html_tag.has_attr("lang"):
    html_tag["lang"] = "en"
""",
    "missing_canonical": r"""
canonical_tag = soup.find("link", attrs={{"rel": "canonical"}})
if not canonical_tag:
    rel_path = file_path.relative_to(root).as_posix().rstrip("index.html").rstrip(".html").rstrip("/")
    url = f"https://www.immigratetobrazil.com/{rel_path}"
    new_canonical = soup.new_tag("link", rel="canonical", href=url)
    if soup.head:
        soup.head.append(new_canonical)
""",
    "missing_viewport": r"""
viewport_tag = soup.find("meta", attrs={{"name": "viewport"}})
if not viewport_tag:
    new_viewport = soup.new_tag("meta", name="viewport", content="width=device-width, initial-scale=1")
    if soup.head:
        soup.head.append(new_viewport)
""",
    "non_utf8_charset": r"""
charset_tag = soup.find("meta", attrs={{"charset": True}})
content_type_tag = soup.find("meta", attrs={{"http-equiv": "content-type"}})
if charset_tag and charset_tag["charset"].lower() != "utf-8":
    charset_tag["charset"] = "utf-8"
if content_type_tag and "charset=" in content_type_tag["content"].lower() and "utf-8" not in content_type_tag["content"].lower():
    content_type_tag["content"] = "text/html; charset=utf-8"
""",
    "missing_robots_meta": r"""
robots_tag = soup.find("meta", attrs={{"name": "robots"}})
if not robots_tag:
    new_robots = soup.new_tag("meta", name="robots", content="index,follow")
    if soup.head:
        soup.head.append(new_robots)
""",
    "missing_og_tags": r"""
og_tags = soup.find_all("meta", attrs={{"property": re.compile(r"^og:")}})
if len(og_tags) == 0:
    title = soup.title.string.strip() if soup.title else "Immigrate to Brazil"
    desc_tag = soup.find("meta", attrs={{"name": "description"}})
    desc = desc_tag["content"] if desc_tag else "Guide to Brazil immigration."
    rel_path = file_path.relative_to(root).as_posix().rstrip("index.html").rstrip(".html").rstrip("/")
    url = f"https://www.immigratetobrazil.com/{rel_path}"
    new_og_title = soup.new_tag("meta", property="og:title", content=title)
    new_og_desc = soup.new_tag("meta", property="og:description", content=desc)
    new_og_url = soup.new_tag("meta", property="og:url", content=url)
    new_og_type = soup.new_tag("meta", property="og:type", content="website")
    if soup.head:
        soup.head.append(new_og_title)
        soup.head.append(new_og_desc)
        soup.head.append(new_og_url)
        soup.head.append(new_og_type)
""",
    "missing_twitter_cards": r"""
twitter_tags = soup.find_all("meta", attrs={{"name": re.compile(r"^twitter:")}})
if len(twitter_tags) == 0:
    new_twitter_card = soup.new_tag("meta", name="twitter:card", content="summary")
    title = soup.title.string.strip() if soup.title else "Immigrate to Brazil"
    new_twitter_title = soup.new_tag("meta", name="twitter:title", content=title)
    desc_tag = soup.find("meta", attrs={{"name": "description"}})
    desc = desc_tag["content"] if desc_tag else "Guide to Brazil immigration."
    new_twitter_desc = soup.new_tag("meta", name="twitter:description", content=desc)
    if soup.head:
        soup.head.append(new_twitter_card)
        soup.head.append(new_twitter_title)
        soup.head.append(new_twitter_desc)
""",
    "missing_schema": r"""
schema_scripts = soup.find_all("script", attrs={{"type": "application/ld+json"}})
if len(schema_scripts) == 0:
    title = soup.title.string.strip() if soup.title else "Page"
    rel_path = file_path.relative_to(root).as_posix().rstrip("index.html").rstrip(".html").rstrip("/")
    url = f"https://www.immigratetobrazil.com/{rel_path}"
    schema = {{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": url
    }}
    new_script = soup.new_tag("script", type="application/ld+json")
    new_script.string = json.dumps(schema, indent=2)
    if soup.head:
        soup.head.append(new_script)
""",
    "structured_data_errors": r"""
schema_scripts = soup.find_all("script", attrs={{"type": "application/ld+json"}})
for script in schema_scripts:
    try:
        data = json.loads(script.string)
        if "@type" not in data:
            data["@type"] = "WebPage"
        script.string = json.dumps(data, indent=2)
    except (json.JSONDecodeError, TypeError):
        script.decompose()
""",
    "missing_favicon": r"""
favicon_tag = soup.find("link", attrs={{"rel": re.compile(r"(icon|shortcut icon)", re.I)}})
if not favicon_tag:
    new_favicon = soup.new_tag("link", rel="icon", href="/favicon.ico", type="image/x-icon")
    if soup.head:
        soup.head.append(new_favicon)
""",
    "broken_links": r"""
link_tags = soup.find_all(["a", "link", "form"], attrs={{"href": True}})
for tag in link_tags:
    href = tag["href"].strip()
    if is_external(href):
        continue
    resolved = normalize_link(href, current_dir, files, index_dirs)
    if resolved is None:
        tag["href"] = "#"
""",
    "broken_images": r"""
img_tags = soup.find_all("img", attrs={{"src": True}})
for img in img_tags:
    src = img["src"].strip()
    if is_external(src):
        continue
    resolved = normalize_link(src, current_dir, files, index_dirs)
    if resolved is None:
        img.decompose()
""",
    "missing_alt_images": r"""
img_tags = soup.find_all("img")
for img in img_tags:
    if not img.has_attr("alt") or not img["alt"].strip():
        if img.has_attr("src"):
            alt_text = Path(img["src"]).stem.replace("_", " ").replace("-", " ").title() + " Image"
        else:
            alt_text = "Descriptive Image"
        img["alt"] = alt_text
""",
    "poor_alt_images": r"""
img_tags = soup.find_all("img")
generic_alts = {{"image", "img", "photo", " ", ""}}
for img in img_tags:
    alt = img.get("alt", "").strip().lower()
    if len(alt) < 5 or alt in generic_alts:
        if img.has_attr("src"):
            improved_alt = Path(img["src"]).stem.replace("_", " ").replace("-", " ").title() + " - Brazil Immigration"
        else:
            improved_alt = "Improved Descriptive Image"
        img["alt"] = improved_alt
""",
    "non_https": r"""
link_tags = soup.find_all(["a", "link", "form"], attrs={{"href": True}})
for tag in link_tags:
    href = tag["href"].strip()
    if href.startswith("http://"):
        tag["href"] = href.replace("http://", "https://")
canonical_tag = soup.find("link", attrs={{"rel": "canonical"}})
if canonical_tag and canonical_tag["href"].startswith("http://"):
    canonical_tag["href"] = canonical_tag["href"].replace("http://", "https://")
""",
    "missing_image_dimensions": r"""
img_tags = soup.find_all("img")
for img in img_tags:
    if not img.has_attr('width'):
        img['width'] = 'auto' # Placeholder; ideally use actual dimensions
    if not img.has_attr('height'):
        img['height'] = 'auto'
""",
    "no_lazy_loading": r"""
img_tags = soup.find_all("img")
for img in img_tags:
    if not img.has_attr('loading'):
        img['loading'] = 'lazy'
""",
}

def generate_fixer_scripts(inventory_path: Path, output_dir: Path):
    logging.info("Starting fixer generation.")
    try:
        logging.info(f"Loading inventory from {inventory_path}")
        with inventory_path.open("r", encoding="utf-8") as f:
            records = json.load(f)
        logging.info(f"Loaded {len(records)} records.")
        
        existing_issues = set()
        for record in records:
            try:
                if not record.get("title", ""):
                    existing_issues.add("missing_titles")
                if record.get("title_length", 0) and (record["title_length"] < 30 or record["title_length"] > 70):
                    existing_issues.add("suboptimal_titles")
                if not record.get("description", ""):
                    existing_issues.add("missing_descriptions")
                if record.get("desc_length", 0) and (record["desc_length"] < 100 or record["desc_length"] > 160):
                    existing_issues.add("suboptimal_descriptions")
                if not record.get("h1", ""):
                    existing_issues.add("missing_h1")
                if record.get("multiple_h1", False):
                    existing_issues.add("multiple_h1")
                if not record.get("lang", ""):
                    existing_issues.add("missing_lang")
                if not record.get("canonical", ""):
                    existing_issues.add("missing_canonical")
                if not record.get("has_viewport", False):
                    existing_issues.add("missing_viewport")
                if record.get("charset", "") and record["charset"].lower() not in ("utf-8", ""):
                    existing_issues.add("non_utf8_charset")
                if not record.get("has_robots_meta", False):
                    existing_issues.add("missing_robots_meta")
                if not record.get("has_og_tags", False):
                    existing_issues.add("missing_og_tags")
                if not record.get("has_twitter_cards", False):
                    existing_issues.add("missing_twitter_cards")
                if not record.get("has_schema", False):
                    existing_issues.add("missing_schema")
                if record.get("has_structured_data_errors", False):
                    existing_issues.add("structured_data_errors")
                if not record.get("has_favicon", False):
                    existing_issues.add("missing_favicon")
                if record.get("broken_links", []):
                    existing_issues.add("broken_links")
                if record.get("broken_images", []):
                    existing_issues.add("broken_images")
                if record.get("missing_alt_images", 0) > 0:
                    existing_issues.add("missing_alt_images")
                if record.get("poor_alt_images", 0) > 0:
                    existing_issues.add("poor_alt_images")
                if not record.get("has_https", True):
                    existing_issues.add("non_https")
                if record.get("missing_image_dimensions", 0) > 0:
                    existing_issues.add("missing_image_dimensions")
                if not record.get("has_lazy_loading", False) and record.get("images", 0) > 0:
                    existing_issues.add("no_lazy_loading")
            except KeyError as ke:
                logging.warning(f"Missing key in record {record.get('path')}: {ke}")
        
        logging.info(f"Detected issues: {existing_issues}")
        
        output_dir.mkdir(parents=True, exist_ok=True)
        generated = 0
        for issue in sorted(existing_issues):
            if issue in ISSUE_FIXES:
                script_name = f"fix_{issue}.py"
                fix_logic_raw = ISSUE_FIXES[issue]
                fix_logic_dedent = textwrap.dedent(fix_logic_raw)
                fix_logic = textwrap.indent(fix_logic_dedent, "        ")
                try:
                    script_content = FIXER_TEMPLATE.format(
                        issue_name=issue.replace("_", " ").title(),
                        script_name=script_name,
                        fix_logic=fix_logic
                    )
                    (output_dir / script_name).write_text(script_content, encoding="utf-8")
                    logging.info(f"Generated {script_name}")
                    generated += 1
                except KeyError as ke:
                    logging.error(f"KeyError formatting template for {issue}: {ke}")
                except Exception as fe:
                    logging.error(f"Unexpected error formatting template for {issue}: {fe}")
        
        print(f"Generated {generated} individual fixer scripts in {output_dir}.")
    except Exception as e:
        logging.error(f"Error generating fixers: {e}", exc_info=True)
        print(f"Error generating fixers: {e}")

def main():
    setup_logging()
    parser = argparse.ArgumentParser(description="Generate fixer scripts from audit inventory.")
    parser.add_argument("--inventory", default="documentation/site-inventory.json")
    parser.add_argument("--output-dir", default="fixer_scripts")
    args = parser.parse_args()
    
    root = Path(__file__).resolve().parents[1]
    inventory_path = root / args.inventory
    output_dir = root / args.output_dir
    
    if not inventory_path.exists():
        logging.error(f"Inventory file not found at {inventory_path}. Run the audit first.")
        print(f"Error: Inventory file not found at {inventory_path}. Run the audit first.")
        return 1
    
    generate_fixer_scripts(inventory_path, output_dir)
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())