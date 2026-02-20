#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://www.immigratetobrazil.com/en}"

echo "Checking production URL: $URL"
HTML="$(curl -fsSL "$URL")"

check() {
  local label="$1"
  local pattern="$2"
  if echo "$HTML" | rg -q "$pattern"; then
    echo "[OK] $label"
  else
    echo "[MISS] $label"
  fi
}

check "Transparent mark logo" "logo-mark-transparent-512"
check "Transparent full logo" "logo-full-transparent"
check "Upgrade notice banner" "Our Website Is Being Upgraded"
check "Manifest linked" "site.webmanifest"
check "Android icon 192" "android-chrome-192"
check "Favicon 16" "favicon-16"

echo "Done."
