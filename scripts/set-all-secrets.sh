#!/usr/bin/env bash
set -euo pipefail

REPO="immigratetobrazilteam-collab/immigratetobrazil"
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE not found"
  exit 1
fi

# skip comments & empty lines
grep -v '^\s*#' "$ENV_FILE" | sed '/^\s*$/d' | while IFS= read -r line; do
  # ignore lines without =
  [[ "$line" != *=* ]] && continue
  KEY=${line%%=*}
  VAL=${line#*=}

  # skip placeholder or clearly local-only values if you wish
  if [[ -z "$VAL" ]]; then
    echo "Skipping empty $KEY"
    continue
  fi

  echo "Setting secret $KEY"
  gh secret set "$KEY" --body "$VAL" --repo "$REPO"
done
