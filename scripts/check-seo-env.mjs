#!/usr/bin/env node

import { loadMergedEnv } from './env-utils.mjs';

const checks = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    required: true,
    hint: 'Set your canonical site URL (example: https://immigratetobrazil.com).',
  },
  {
    key: 'PAGESPEED_API_KEY',
    required: false,
    hint: 'Recommended for `npm run seo:psi` to avoid shared quota 429 errors.',
  },
];

let hasMissingRequired = false;
const envFallbacks = await loadMergedEnv();

for (const check of checks) {
  const value = process.env[check.key] || envFallbacks[check.key];
  const present = typeof value === 'string' && value.trim().length > 0;

  if (present) {
    console.log(`OK   ${check.key} is set`);
    continue;
  }

  if (check.required) {
    hasMissingRequired = true;
    console.error(`MISS ${check.key} is required. ${check.hint}`);
  } else {
    console.warn(`WARN ${check.key} is not set. ${check.hint}`);
  }
}

if (hasMissingRequired) {
  process.exit(1);
}

console.log('SEO env check completed.');
