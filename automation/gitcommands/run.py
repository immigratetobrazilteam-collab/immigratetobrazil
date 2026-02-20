#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "automation" / "gitcommands"

MENU = {
    "1": ("Start live dev server", "10_start_live_dev.sh"),
    "2": ("Commit current branch", "20_commit_current_branch.sh"),
    "3": ("Push current branch", "30_push_current_branch.sh"),
    "4": ("Create new branch from main", "40_sync_main_and_create_branch.sh"),
    "5": ("Push main (trigger Cloudflare)", "50_push_main_trigger_deploy.sh"),
    "6": ("Merge branch into main + push", "60_merge_branch_into_main_and_push.sh"),
    "7": ("One-click release current branch -> main (commit + merge + push)", "70_release_current_branch_to_main.sh"),
}


def run_cmd(cmd):
    subprocess.run(cmd, cwd=ROOT, check=True)


def main():
    print("\nGit/Deploy Runner")
    print(f"Repo: {ROOT}\n")
    for key, (label, _) in MENU.items():
        print(f"{key}. {label}")

    choice = input("\nChoose an option: ").strip()
    if choice not in MENU:
        print("Invalid option")
        sys.exit(1)

    label, script = MENU[choice]
    script_path = TOOLS / script
    args = ["bash", str(script_path)]

    if choice == "4":
        branch = input("New branch name: ").strip()
        if not branch:
            print("Branch name is required")
            sys.exit(1)
        args.append(branch)
    elif choice == "6":
        branch = input("Branch to merge into main: ").strip()
        if not branch:
            print("Branch name is required")
            sys.exit(1)
        args.append(branch)

    print(f"\nRunning: {label}\n")
    try:
        run_cmd(args)
        print("\nDone.")
    except subprocess.CalledProcessError as err:
        print(f"\nCommand failed (exit {err.returncode}).")
        print("Fix the message shown above, then run the menu again.")
        sys.exit(err.returncode)
    except KeyboardInterrupt:
        print("\nCanceled.")
        sys.exit(130)


if __name__ == "__main__":
    main()
