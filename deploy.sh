#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"
WRANGLER_LOCAL_CONFIG="${ROOT_DIR}/.wrangler-local"
USE_CF_API_TOKEN="${USE_CF_API_TOKEN:-0}"

mkdir -p "${WRANGLER_LOCAL_CONFIG}"
export XDG_CONFIG_HOME="${WRANGLER_LOCAL_CONFIG}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: .env.local not found at ${ENV_FILE}"
  exit 1
fi

echo "Loading environment from .env.local"
while IFS= read -r line || [[ -n "${line}" ]]; do
  # Skip empty lines and comments.
  [[ -z "${line// }" ]] && continue
  [[ "${line}" =~ ^[[:space:]]*# ]] && continue
  [[ "${line}" != *"="* ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  # Trim surrounding whitespace in key.
  key="$(echo -n "${key}" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
  [[ -z "${key}" ]] && continue

  export "${key}=${value}"
done < "${ENV_FILE}"

if [[ "${USE_CF_API_TOKEN}" != "1" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "OAuth mode: ignoring CLOUDFLARE_API_TOKEN from .env.local"
  unset CLOUDFLARE_API_TOKEN
fi

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  token_len="$(echo -n "${CLOUDFLARE_API_TOKEN}" | wc -c | tr -d ' ')"
  if [[ "${token_len}" -lt 20 ]]; then
    echo "WARNING: CLOUDFLARE_API_TOKEN appears invalid (length ${token_len})."
    echo "Unsetting token to avoid malformed Authorization header."
    unset CLOUDFLARE_API_TOKEN
  fi
fi

echo "Preflight: npm run typecheck"
npm run typecheck

echo "Preflight: Cloudflare auth check"
if ! npx wrangler whoami; then
  echo
  echo "Cloudflare auth failed."
  echo "Run this once, then re-run ./deploy.sh:"
  echo "  npx wrangler logout"
  echo "  npx wrangler login"
  exit 1
fi

echo "Deploying"
npm run deploy

echo
echo "Deployment command completed."
echo "If old UI is still visible, purge Cloudflare cache and hard refresh."
