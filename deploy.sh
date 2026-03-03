#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"

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

echo "Preflight: npm run typecheck"
if [[ ! -x "${ROOT_DIR}/node_modules/.bin/tsc" || ! -x "${ROOT_DIR}/node_modules/.bin/next" ]]; then
  echo "Installing dependencies (including devDependencies)"
  npm ci --include=dev
fi
npm run typecheck

echo "Cleaning previous build artifacts"
rm -rf "${ROOT_DIR}/.next" "${ROOT_DIR}/out"

echo "Building static export"
npm run build:static

echo "Deploying to Cloudflare Pages"
npx wrangler pages deploy out

echo
echo "Deployment command completed successfully."
echo "Your site is now live at https://immigratetobrazil.com"
