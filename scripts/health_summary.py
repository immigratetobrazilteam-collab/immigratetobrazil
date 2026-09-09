#!/usr/bin/env python3
"""Print a small read-only maintenance health summary."""

from __future__ import annotations

import argparse
import json

from maintenance_common import ROOT, parse_all_html


def load(path, default):
    try:
        return json.loads((ROOT / path).read_text(encoding="utf-8"))
    except Exception:
        return default


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    docs = parse_all_html()
    audit = load("reports/site-audit.json", {})
    validation = load("reports/site-validation.json", {})
    links = load("reports/links.json", {})
    images = load("reports/images.json", {})
    discovery = load("reports/discovery-report.json", {})

    print("Immigrate to Brazil maintenance health")
    print(f"Public pages: {len(docs)}")
    print(f"Audit issues: {audit.get('issue_count', 'not run')} {audit.get('counts', '')}")
    print(f"Validation: {validation.get('error_count', 'not run')} errors, {validation.get('warning_count', 'not run')} warnings")
    print(f"Links: {links.get('broken_count', 'not run')} broken")
    print(f"Images: {images.get('large_count', 'not run')} large, {images.get('missing_count', 'not run')} missing")
    print(f"Discovery changed last run: {len(discovery.get('changed', [])) if discovery else 'not run'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
