#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <branch-to-merge>"
  echo "Example: $0 workbench/ongoing-edits"
  exit 1
fi

SOURCE_BRANCH="$1"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit/stash first."
  echo "Tip: use option 7 for one-click release from your current work branch."
  exit 1
fi

git checkout main
git pull --ff-only origin main
git merge --no-ff "$SOURCE_BRANCH"
git push origin main

echo "Merged $SOURCE_BRANCH into main and pushed. Cloudflare auto-deploy should start."
