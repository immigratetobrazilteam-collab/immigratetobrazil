#!/usr/bin/env python3
"""Check and install optional maintenance dependencies."""

from __future__ import annotations

import argparse
import importlib.util
import subprocess
import sys

from maintenance_common import ROOT, ensure_dirs, write_json_if_changed

PACKAGES = [
    ("bs4", "beautifulsoup4"),
    ("lxml", "lxml"),
    ("PIL", "pillow"),
    ("argostranslate", "argostranslate"),
]


def installed(import_name: str) -> bool:
    return importlib.util.find_spec(import_name) is not None


def pip_install(package: str) -> tuple[bool, str]:
    proc = subprocess.run([sys.executable, "-m", "pip", "install", "--user", package], text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return proc.returncode == 0, proc.stdout[-3000:]


def install_argos_model() -> tuple[bool, str]:
    try:
        import argostranslate.package
        import argostranslate.translate

        argostranslate.package.update_package_index()
        available = argostranslate.package.get_available_packages()
        match = next((pkg for pkg in available if pkg.from_code == "en" and pkg.to_code == "pt"), None)
        if not match:
            return False, "Argos English to Portuguese package was not found in the package index."
        path = match.download()
        argostranslate.package.install_from_path(path)
        return True, "Installed Argos English to Portuguese model."
    except Exception as exc:
        return False, str(exc)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-only", action="store_true", help="Do not install missing packages.")
    parser.add_argument("--skip-argos-model", action="store_true", help="Do not download/install Argos model.")
    args = parser.parse_args()
    ensure_dirs()

    results = []
    for import_name, package in PACKAGES:
        ok = installed(import_name)
        detail = "already installed" if ok else "missing"
        if not ok and not args.check_only:
            ok, detail = pip_install(package)
        results.append({"package": package, "import": import_name, "ok": ok, "detail": detail})
        print(f"{package}: {'ok' if ok else 'missing'}")

    argos_ok = False
    argos_detail = "skipped"
    if installed("argostranslate") and not args.skip_argos_model and not args.check_only:
        argos_ok, argos_detail = install_argos_model()
        print(f"argos en->pt model: {'ok' if argos_ok else 'not installed'}")
    report = {"packages": results, "argos_model": {"ok": argos_ok, "detail": argos_detail}}
    write_json_if_changed(ROOT / "reports" / "bootstrap-dependencies.json", report)
    return 0 if all(item["ok"] for item in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
