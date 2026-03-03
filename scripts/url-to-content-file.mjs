#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const input = args[0];

if (!input) {
  console.error('Usage: node scripts/url-to-content-file.mjs <url-or-path>');
  process.exit(1);
}

function parsePath(value) {
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return new URL(value).pathname;
    }
  } catch {}
  return value;
}

function normalizePathname(pathname) {
  let p = pathname.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/+$/, '');
  return p || '/';
}

function splitLocale(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];
  const locales = new Set(['en', 'es', 'pt', 'fr']);
  if (locales.has(first)) {
    return { locale: first, route: `/${parts.slice(1).join('/') || ''}`.replace(/\/$/, '') || '/' };
  }
  return { locale: 'en', route: pathname };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fromManifest(manifestPath, route) {
  const json = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const found = (json.pages || []).find((p) => p.pathname === route);
  return found || null;
}

async function main() {
  const rawPath = parsePath(input);
  const pathname = normalizePathname(rawPath);
  const { locale, route } = splitLocale(pathname);

  const result = {
    input,
    locale,
    route,
    bucket: null,
    jsonPath: null,
    sourcePath: null,
    notes: [],
  };

  if (route.startsWith('/discover/')) {
    const slug = route.replace(/^\/discover\/?/, '');
    const filePath = path.join(root, 'content', 'cms', 'discover-pages', locale, `${slug}.json`);
    const enFallback = path.join(root, 'content', 'cms', 'discover-pages', 'en', `${slug}.json`);

    if (await exists(filePath)) {
      const page = JSON.parse(await fs.readFile(filePath, 'utf8'));
      result.bucket = 'discover-pages';
      result.jsonPath = path.relative(root, filePath);
      result.sourcePath = page.sourcePath || null;
    } else if (await exists(enFallback)) {
      const page = JSON.parse(await fs.readFile(enFallback, 'utf8'));
      result.bucket = 'discover-pages (en fallback)';
      result.jsonPath = path.relative(root, enFallback);
      result.sourcePath = page.sourcePath || null;
      result.notes.push(`Locale '${locale}' missing, resolves to EN fallback`);
    }
  }

  if (!result.bucket) {
    const managedManifest = path.join(root, 'content', 'cms', 'managed-legacy', 'en', '_manifest.json');
    const foundManaged = await fromManifest(managedManifest, route);
    if (foundManaged) {
      const candidate = path.join(root, 'content', 'cms', 'managed-legacy', locale, `${foundManaged.slug}.json`);
      const enFallback = path.join(root, 'content', 'cms', 'managed-legacy', 'en', `${foundManaged.slug}.json`);
      result.bucket = 'managed-legacy';

      if (await exists(candidate)) {
        result.jsonPath = path.relative(root, candidate);
      } else if (await exists(enFallback)) {
        result.jsonPath = path.relative(root, enFallback);
        result.notes.push(`Locale '${locale}' missing, resolves to EN fallback`);
      }
      result.sourcePath = foundManaged.sourcePath || null;
    }
  }

  if (!result.bucket) {
    const stateGuidesPath = path.join(root, 'content', 'cms', 'state-guides', `${locale}.json`);
    if (await exists(stateGuidesPath) && route.startsWith('/state-guides/')) {
      const slug = route.replace('/state-guides/', '');
      const file = JSON.parse(await fs.readFile(stateGuidesPath, 'utf8'));
      const found = (file.guides || []).find((g) => g.slug === slug);
      if (found) {
        result.bucket = 'state-guides';
        result.jsonPath = path.relative(root, stateGuidesPath);
        result.sourcePath = found.sourcePath || null;
      }
    }
  }

  if (!result.bucket) {
    result.notes.push('No direct CMS JSON mapping found. Route may be app-only or generated from managedPages/navigation.');
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
