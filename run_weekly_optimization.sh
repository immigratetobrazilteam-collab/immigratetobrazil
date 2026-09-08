#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -f ".venv/bin/activate" ]; then
    source ".venv/bin/activate"
fi

echo
echo "======================================================================"
echo "IMMIGRATE TO BRAZIL — WEEKLY OPTIMIZATION"
echo "======================================================================"
echo
echo "This run will:"
echo "  • audit the entire public static site"
echo "  • apply safe technical SEO fixes"
echo "  • verify Google Tag Manager"
echo "  • validate the result"
echo "  • commit and push successful changes"
echo "  • regenerate XML sitemaps"
echo "  • deploy through the normal Git/Cloudflare workflow"
echo "  • submit changed/deleted URLs through IndexNow"
echo

python3 weekly_site_optimizer.py \
    --apply \
    --push \
    --gtm-id "${GTM_ID:-GTM-MN4RB6TP}"
