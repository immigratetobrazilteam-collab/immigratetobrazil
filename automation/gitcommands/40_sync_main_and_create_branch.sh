#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${TOOLS_DIR}/_ssh_helper.sh"

cd "$ROOT_DIR"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <new-branch-name>"
  echo "Example: $0 feature/new-contact-copy"
  exit 1
fi

NEW_BRANCH="$1"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes first."
  exit 1
fi

ensure_ssh_auth

git checkout main
git pull --ff-only origin main
git checkout -b "$NEW_BRANCH"

echo "Created and switched to branch: $NEW_BRANCH"
