from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run(*args: str) -> None:
    completed = subprocess.run(args, cwd=ROOT)
    if completed.returncode != 0:
        raise SystemExit(completed.returncode)


def git_has_changes() -> bool:
    completed = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return bool(completed.stdout.strip())


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh static data, run checks, and push main.")
    parser.add_argument("--message", help="Commit message. If omitted, a default is used.")
    parser.add_argument("--skip-push", action="store_true", help="Commit without pushing.")
    args = parser.parse_args()

    run("npm", "run", "check")
    run("node", "scripts/qa-matrix.js")
    run("node", "scripts/lighthouse-audit.js")

    if not git_has_changes():
        print("No changes to commit.")
        return 0

    run("git", "add", "-A")
    message = args.message or "Update static site release"
    run("git", "commit", "-m", message)
    if not args.skip_push:
        run("git", "push", "origin", "main")
    return 0


if __name__ == "__main__":
    sys.exit(main())
