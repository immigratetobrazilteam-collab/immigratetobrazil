#!/usr/bin/env python3
"""Add, commit, and push the repository with a timestamped maintenance message."""

from __future__ import annotations

import argparse
import datetime as dt
import subprocess
import sys

from maintenance_lib import ROOT, run


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--message", default="", help="Commit message. A timestamp is used by default.")
    parser.add_argument("--allow-empty", action="store_true", default=True, help="Allow an empty commit. Enabled by default.")
    parser.add_argument("--no-push", action="store_true", help="Commit but do not push.")
    parser.add_argument("--remote", default="origin", help="Git remote to push.")
    parser.add_argument("--branch", default="", help="Branch to push. Defaults to current branch.")
    args = parser.parse_args()

    stamp = dt.datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
    message = args.message or f"Site maintenance {stamp}"

    print("Adding all repository changes.")
    add = run(["git", "add", "-A"])
    if add.returncode:
        print(add.stdout)
        return add.returncode

    commit_cmd = ["git", "commit", "-m", message]
    if args.allow_empty:
        commit_cmd.insert(2, "--allow-empty")
    print(f"Committing: {message}")
    commit = run(commit_cmd)
    print(commit.stdout)
    if commit.returncode:
        return commit.returncode

    if args.no_push:
        print("Skipping push because --no-push was set.")
        return 0

    branch = args.branch
    if not branch:
        current = run(["git", "branch", "--show-current"])
        if current.returncode:
            print(current.stdout)
            return current.returncode
        branch = current.stdout.strip()
    if not branch:
        print("Could not determine current branch. Pass --branch.")
        return 2
    print(f"Pushing {args.remote} {branch}.")
    push = run(["git", "push", args.remote, branch])
    print(push.stdout)
    return push.returncode


if __name__ == "__main__":
    raise SystemExit(main())
