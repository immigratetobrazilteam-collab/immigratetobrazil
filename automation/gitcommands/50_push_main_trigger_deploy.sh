#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${TOOLS_DIR}/_ssh_helper.sh"

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

ensure_ssh_auth

git pull --ff-only origin main
git push origin main

echo "Main pushed. Cloudflare auto-deploy should trigger from GitHub integration."
