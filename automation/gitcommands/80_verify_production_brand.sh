#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://www.immigratetobrazil.com/en}"
ORIGIN="$(echo "$URL" | sed -E 's#(https?://[^/]+).*#\1#')"

echo "Checking production URL: $URL"
HTML="$(curl -fsSL "$URL")"

has_pattern() {
  local pattern="$1"

  if command -v rg >/dev/null 2>&1; then
    echo "$HTML" | rg -q "$pattern"
  else
    echo "$HTML" | grep -Eq "$pattern"
  fi
}

check() {
  local label="$1"
  local pattern="$2"
  if has_pattern "$pattern"; then
    echo "[OK] $label"
  else
    echo "[MISS] $label"
  fi
}

check_url() {
  local label="$1"
  local asset_url="$2"
  if curl -fsSI "$asset_url" >/dev/null; then
    echo "[OK] $label"
  else
    echo "[MISS] $label"
  fi
}

check "Transparent mark logo referenced" "logo-mark-transparent-512"
check_url "Transparent full logo file" "${ORIGIN}/brand/logo-full-transparent.png"
check "Upgrade notice banner" "Our Website Is Being Upgraded"
check "Manifest linked" "site.webmanifest"
check_url "Android icon 192" "${ORIGIN}/brand/android-chrome-192.png"
check_url "Favicon 16" "${ORIGIN}/brand/favicon-16.png"

echo "Done."
