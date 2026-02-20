#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" == "main" ]]; then
  echo "You are on main. Switch to a work branch before committing."
  exit 1
fi

if [[ -z "$(git status --porcelain)" ]]; then
  echo "No changes to commit."
  exit 0
fi

STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
COMMIT_MSG="${*:-auto: update ${STAMP}}"

git add -A

ADDED_FILES=$(git diff --cached --name-only --diff-filter=A | wc -l | tr -d ' ')
STAGED_BYTES=$(git diff --cached --name-only -z | xargs -0 -r du -cb | tail -1 | awk '{print $1}')
STAGED_BYTES=${STAGED_BYTES:-0}

if (( ADDED_FILES > 3000 || STAGED_BYTES > 1200000000 )); then
  echo "Safety stop: staged commit is too large."
  echo "Added files: ${ADDED_FILES}, staged bytes: ${STAGED_BYTES}"
  echo "Review with: git status --short"
  echo "Then stage only intended files and commit manually."
  exit 1
fi

git commit -m "$COMMIT_MSG"
echo "Committed on branch: $BRANCH"
