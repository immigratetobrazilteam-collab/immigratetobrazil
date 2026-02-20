#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" == "main" ]]; then
  echo "You are on main. Use option 5 when ready to deploy."
  exit 1
fi

git push -u origin "$BRANCH"
echo "Pushed branch: $BRANCH"
