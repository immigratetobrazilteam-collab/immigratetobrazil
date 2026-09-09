#!/usr/bin/env python3
"""Prepare and optionally submit IndexNow updates for changed public pages."""

from __future__ import annotations

import argparse

from discovery import indexnow_candidates, public_pages, submit_indexnow
from maintenance_common import ROOT, add_common_args, apply_site_url, ensure_dirs, write_json_if_changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    parser.add_argument("--submit", action="store_true", help="Submit pending URLs when INDEXNOW_KEY is configured.")
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()

    urls = [] if args.dry_run else indexnow_candidates(public_pages())
    result = submit_indexnow(urls) if args.submit and not args.dry_run else {"submitted": False, "urls": urls}
    if not args.dry_run:
        write_json_if_changed(ROOT / "reports" / "indexnow-report.json", result)
    print(f"IndexNow URLs pending: {len(urls)}")
    if args.submit:
        print(f"Submitted: {result.get('submitted')}")
        if result.get("reason"):
            print(f"Reason: {result['reason']}")
        if result.get("status"):
            print(f"HTTP status: {result['status']}")
    else:
        print("Use --submit with INDEXNOW_KEY set to submit these URLs.")
    return 0 if not args.submit or result.get("submitted") or not urls else 1


if __name__ == "__main__":
    raise SystemExit(main())
