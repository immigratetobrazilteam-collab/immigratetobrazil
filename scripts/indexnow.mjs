#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadMergedEnv } from './env-utils.mjs';

const ROOT = process.cwd();
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

function parseArgs(argv) {
  const out = {
    command: 'help',
    urls: [],
    file: '',
    sitemap: false,
    limit: 100,
    dryRun: false,
  };

  if (argv[0]) {
    out.command = argv[0];
  }

  for (const arg of argv.slice(1)) {
    if (arg === '--help' || arg === '-h') {
      out.command = 'help';
      continue;
    }
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (arg === '--sitemap') {
      out.sitemap = true;
      continue;
    }
    if (arg.startsWith('--url=')) {
      const value = arg.slice('--url='.length);
      out.urls.push(
        ...value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      );
      continue;
    }
    if (arg.startsWith('--file=')) {
      out.file = arg.slice('--file='.length).trim();
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const value = Number(arg.slice('--limit='.length).trim());
      if (Number.isFinite(value) && value > 0) {
        out.limit = Math.floor(value);
      }
    }
  }

  return out;
}

function printUsage() {
  console.log(`IndexNow helper

Usage:
  node scripts/indexnow.mjs key
  node scripts/indexnow.mjs submit --url=/en/about,/en/services
  node scripts/indexnow.mjs submit --file=tmp/indexnow-urls.txt
  node scripts/indexnow.mjs submit --sitemap --limit=200

Required env:
  NEXT_PUBLIC_SITE_URL
  INDEXNOW_API_KEY
`);
}

async function loadEnv() {
  const merged = await loadMergedEnv();

  const siteUrl = String(merged.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  const key = String(merged.INDEXNOW_API_KEY || '').trim();
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required for IndexNow.');
  }
  if (!key) {
    throw new Error('INDEXNOW_API_KEY is required for IndexNow.');
  }

  const site = new URL(siteUrl);
  const keyFilename = `${key}.txt`;
  const keyLocation = `${site.origin}/${keyFilename}`;

  return {
    site,
    siteUrl: site.origin,
    key,
    keyFilename,
    keyLocation,
  };
}

function normalizeInputUrl(input, siteOrigin) {
  const value = input.trim();
  if (!value) return null;

  if (value.startsWith('/')) {
    return `${siteOrigin}${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${siteOrigin}/${value.replace(/^\/+/, '')}`;
}

async function collectUrls(options, siteOrigin, siteHost) {
  const urls = new Set();

  for (const raw of options.urls) {
    const normalized = normalizeInputUrl(raw, siteOrigin);
    if (normalized) urls.add(normalized);
  }

  if (options.file) {
    const filePath = path.isAbsolute(options.file) ? options.file : path.join(ROOT, options.file);
    const raw = await readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/g)) {
      const normalized = normalizeInputUrl(line, siteOrigin);
      if (normalized) urls.add(normalized);
    }
  }

  if (options.sitemap) {
    const sitemapUrl = `${siteOrigin}/sitemap.xml`;
    const response = await fetch(sitemapUrl, { headers: { Accept: 'application/xml,text/xml' } });
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${sitemapUrl} -> ${response.status}`);
    }
    const xml = await response.text();
    const matcher = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = matcher.exec(xml)) !== null) {
      const normalized = normalizeInputUrl(match[1], siteOrigin);
      if (normalized) urls.add(normalized);
      if (urls.size >= options.limit) break;
    }
  }

  const filtered = [];
  for (const url of urls) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.host !== siteHost) continue;
    filtered.push(parsed.toString());
  }

  return filtered.slice(0, options.limit);
}

async function ensureKeyFile(env) {
  const publicDir = path.join(ROOT, 'public');
  await mkdir(publicDir, { recursive: true });
  const target = path.join(publicDir, env.keyFilename);
  await writeFile(target, `${env.key}\n`, 'utf8');
  console.log(`IndexNow key file written: ${path.relative(ROOT, target)}`);
  console.log(`Expected public URL: ${env.keyLocation}`);
}

async function verifyLiveKeyFile(env) {
  const response = await fetch(env.keyLocation, {
    headers: { Accept: 'text/plain, */*' },
  });

  const body = await response.text();
  const bodyTrimmed = body.trim();
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  if (!response.ok) {
    throw new Error(`Key file URL returned ${response.status}: ${env.keyLocation}`);
  }

  if (bodyTrimmed !== env.key) {
    const preview = bodyTrimmed.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(
      `Key file mismatch at ${env.keyLocation}. Expected exact key text, got: "${preview || '[empty]'}"`,
    );
  }

  if (!contentType.includes('text/plain')) {
    console.warn(`WARN key file content-type is "${contentType}" (expected text/plain).`);
  }

  console.log(`Live key verification passed: ${env.keyLocation}`);
}

async function submitUrls(env, options) {
  await verifyLiveKeyFile(env);
  const urls = await collectUrls(options, env.siteUrl, env.site.host);
  if (!urls.length) {
    throw new Error('No URLs provided. Use --url, --file, or --sitemap.');
  }

  const payload = {
    host: env.site.host,
    key: env.key,
    keyLocation: env.keyLocation,
    urlList: urls,
  };

  console.log(`Prepared ${urls.length} URL(s) for IndexNow submission.`);
  console.log(`Key location: ${env.keyLocation}`);

  if (options.dryRun) {
    console.log('Dry run enabled. Payload preview:');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json, text/plain, */*',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  console.log(`IndexNow response: ${response.status}`);
  if (body.trim()) {
    console.log(body.slice(0, 400));
  }

  if (!response.ok) {
    throw new Error(`IndexNow submission failed (${response.status})`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === 'help') {
    printUsage();
    return;
  }

  const env = await loadEnv();

  if (options.command === 'key') {
    await ensureKeyFile(env);
    return;
  }

  if (options.command === 'submit') {
    await ensureKeyFile(env);
    await submitUrls(env, options);
    return;
  }

  throw new Error(`Unknown command: ${options.command}`);
}

main().catch((error) => {
  console.error('indexnow failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
