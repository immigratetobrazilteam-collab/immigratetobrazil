from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run_git(*args: str, capture_output: bool = False) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        capture_output=capture_output,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        if capture_output:
            if completed.stdout:
                print(completed.stdout, end="")
            if completed.stderr:
                print(completed.stderr, end="", file=sys.stderr)
        raise SystemExit(completed.returncode)
    return completed


def git_has_changes() -> bool:
    completed = run_git("status", "--porcelain", capture_output=True)
    return bool(completed.stdout.strip())


def current_branch() -> str:
    completed = run_git("branch", "--show-current", capture_output=True)
    branch = completed.stdout.strip()
    if not branch:
        raise SystemExit("Unable to determine the current branch.")
    return branch


def default_commit_message() -> str:
    return datetime.now().strftime("Update: %Y-%m-%d %H:%M:%S")


def main() -> int:
    parser = argparse.ArgumentParser(description="Commit all repo changes and push the current branch.")
    parser.add_argument("-m", "--message", help="Commit message. Defaults to a timestamped update.")
    parser.add_argument("--allow-empty", action="store_true", help="Create an empty commit when there are no changes.")
    parser.add_argument("--skip-push", action="store_true", help="Create the commit without pushing.")
    parser.add_argument("--remote", default="origin", help="Remote name to push to. Defaults to origin.")
    parser.add_argument("--branch", help="Branch to push. Defaults to the current branch.")
    args = parser.parse_args()

    commit_message = args.message or default_commit_message()
    branch = args.branch or current_branch()

    if git_has_changes():
        print(f"Commit message: {commit_message}")
        run_git("add", "-A")
        run_git("commit", "-m", commit_message)
    elif args.allow_empty:
        print(f"No changes detected. Creating empty commit: {commit_message}")
        run_git("commit", "--allow-empty", "-m", commit_message)
    else:
        print("No changes to commit.")
        return 0

    if args.skip_push:
        print("Skipping push.")
        return 0

    print(f"Pushing {branch} to {args.remote}...")
    run_git("push", args.remote, branch)
    return 0


if __name__ == "__main__":
    sys.exit(main())
