#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${TOOLS_DIR}/_ssh_helper.sh"

cd "$ROOT_DIR"

STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
COMMIT_MSG="${*:-${STAMP}}"
CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "You are on main. Switch to a working branch first, then run this option."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  git add -A

  ADDED_FILES=$(git diff --cached --name-only --diff-filter=A | wc -l | tr -d ' ')
  STAGED_BYTES=$(git diff --cached --name-only -z | xargs -0 -r du -cb | tail -1 | awk '{print $1}')
  STAGED_BYTES=${STAGED_BYTES:-0}

  if (( ADDED_FILES > 3000 || STAGED_BYTES > 1200000000 )); then
    echo "Safety stop: staged commit is too large."
    echo "Added files: ${ADDED_FILES}, staged bytes: ${STAGED_BYTES}"
    echo "Review with: git status --short"
    exit 1
  fi

  git commit -m "$COMMIT_MSG"
  echo "Committed current branch changes."
else
  echo "No local changes to commit on $CURRENT_BRANCH."
fi

ensure_ssh_auth

git push -u origin "$CURRENT_BRANCH"

git checkout main
git pull --ff-only origin main
git merge --no-ff "$CURRENT_BRANCH"
git push origin main

git checkout "$CURRENT_BRANCH"

echo "Released $CURRENT_BRANCH to main and pushed. Cloudflare auto-deploy should trigger."
