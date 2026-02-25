#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

async function readEnvFile(relativePath) {
  try {
    const raw = await readFile(path.join(ROOT, relativePath), 'utf8');
    return raw;
  } catch {
    return '';
  }
}

function parseDotenv(text) {
  const out = {};
  const lines = text.split(/\r?\n/g);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

async function loadEnvFallbacks() {
  const [localText, envText] = await Promise.all([readEnvFile('.env.local'), readEnvFile('.env')]);
  return {
    ...parseDotenv(envText),
    ...parseDotenv(localText),
  };
}

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
const envFallbacks = await loadEnvFallbacks();

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
