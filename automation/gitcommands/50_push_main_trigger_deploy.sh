#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit/stash changes before pushing main."
  echo "Tip: use option 7 for one-click release from a work branch."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Switching to main..."
  git checkout main
fi

git pull --ff-only origin main
git push origin main

echo "Main pushed. Cloudflare auto-deploy should trigger from GitHub integration."
