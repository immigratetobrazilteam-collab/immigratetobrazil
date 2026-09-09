#!/usr/bin/env python3
"""Run the weekly site maintenance workflow from one terminal command."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from maintenance_lib import ROOT, add_common_args, apply_site_url, ensure_dirs, print_step


def run_script(script: str, args: list[str], keep_going: bool) -> tuple[int, str]:
    cmd = [sys.executable, str(ROOT / "scripts" / script), *args]
    print_step("Running " + " ".join(cmd))
    proc = subprocess.run(cmd, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(proc.stdout)
    if proc.returncode and not keep_going:
        raise SystemExit(proc.returncode)
    return proc.returncode, proc.stdout


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    add_common_args(parser)
    parser.add_argument("--skip-translation", action="store_true", help="Do not update pt-br pages.")
    parser.add_argument("--translation-provider", choices=["argos", "google", "openai", "copy"], default="argos")
    parser.add_argument("--submit-indexnow", action="store_true", help="Submit changed URLs when INDEXNOW_KEY is configured.")
    parser.add_argument("--fix", action="store_true", help="Run the safe fixer between audit and validation.")
    parser.add_argument("--skip-image-audit", action="store_true", help="Skip the image audit.")
    parser.add_argument("--publish", action="store_true", help="Run git add/commit/push at the end.")
    parser.add_argument("--keep-going", action="store_true", default=True, help="Continue after nonfatal script failures. Enabled by default.")
    args = parser.parse_args()
    apply_site_url(args.site_url)
    ensure_dirs()

    common = ["--site-url", args.site_url]
    if args.dry_run:
        common.append("--dry-run")
    results: list[tuple[str, int]] = []

    print_step("Starting weekly maintenance")
    if not args.skip_translation:
        code, _ = run_script("generate_portuguese.py", common + ["--provider", args.translation_provider], args.keep_going)
        results.append(("pt-br update", code))
    code, _ = run_script("audit_site.py", common, args.keep_going)
    results.append(("audit", code))
    code, _ = run_script("check_links.py", common, args.keep_going)
    results.append(("links", code))
    if not args.skip_image_audit:
        code, _ = run_script("optimize_images.py", ["--audit-only"], args.keep_going)
        results.append(("images", code))
    if args.fix:
        code, _ = run_script("fix_site.py", common, args.keep_going)
        results.append(("safe fixer", code))
    code, _ = run_script("generate_discovery.py", common, args.keep_going)
    results.append(("discovery", code))
    code, _ = run_script("validate_site.py", common, args.keep_going)
    results.append(("validation", code))
    code, _ = run_script("indexnow.py", common + (["--submit"] if args.submit_indexnow else []), args.keep_going)
    results.append(("indexnow", code))

    if args.publish and not args.dry_run:
        code, _ = run_script("git_save.py", [], args.keep_going)
        results.append(("git publish", code))

    print_step("Weekly maintenance summary")
    failures = 0
    for label, code in results:
        if label == "audit" and code == 1:
            status = "manual review needed"
        else:
            status = "ok" if code == 0 else f"failed ({code})"
        print(f"- {label}: {status}")
        failures += int(code != 0 and not (label == "audit" and code == 1))
    print("Reports: reports/site-audit.md, reports/site-validation.md, reports/links.md, reports/images.md, reports/fix-report.json, reports/discovery-report.json")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
