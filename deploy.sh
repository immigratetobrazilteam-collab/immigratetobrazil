#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"
WRANGLER_LOCAL_CONFIG="${ROOT_DIR}/.wrangler-local"
USE_CF_API_TOKEN="${USE_CF_API_TOKEN:-0}"
WRANGLER_ENV_PREFIX=()

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

# Keep Next.js in standard production mode for builds/deploys.
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=false

if [[ "${USE_CF_API_TOKEN}" != "1" ]]; then
  echo "OAuth mode: forcing Wrangler token environment variables OFF"
  unset CLOUDFLARE_API_TOKEN CF_API_TOKEN CLOUDFLARE_API_KEY
  WRANGLER_ENV_PREFIX=(env -u CLOUDFLARE_API_TOKEN -u CF_API_TOKEN -u CLOUDFLARE_API_KEY)
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
if [[ ! -x "${ROOT_DIR}/node_modules/.bin/tsc" || ! -x "${ROOT_DIR}/node_modules/.bin/next" ]]; then
  echo "Installing dependencies (including devDependencies)"
  npm ci --include=dev
fi
npm run typecheck

echo "Preflight: Cloudflare auth check"
if ! "${WRANGLER_ENV_PREFIX[@]}" npx wrangler whoami; then
  echo
  echo "Cloudflare auth failed."
  echo "Run this once, then re-run ./deploy.sh:"
  echo "  env -u CLOUDFLARE_API_TOKEN -u CF_API_TOKEN -u CLOUDFLARE_API_KEY npx wrangler logout"
  echo "  env -u CLOUDFLARE_API_TOKEN -u CF_API_TOKEN -u CLOUDFLARE_API_KEY npx wrangler login"
  exit 1
fi

echo "Cleaning previous build artifacts"
rm -rf "${ROOT_DIR}/.next" "${ROOT_DIR}/.open-next"

echo "Deploying"
"${WRANGLER_ENV_PREFIX[@]}" npm run deploy

echo
echo "Deployment command completed."
echo "If old UI is still visible, purge Cloudflare cache and hard refresh."
