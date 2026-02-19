#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(root, 'content/generated/route-index.json');

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  'backups',
  '.venv',
  '.vscode',
  'memory-bank',
  'fixer_scripts',
  'useful_scripts',
]);

const SKIP_PREFIXES = ['partials/', 'scripts/', 'documentation/'];

async function walk(dir, items = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(absolute, items);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!relative.endsWith('.html')) continue;
    if (relative.endsWith('.bak') || relative.endsWith('.backup')) continue;
    if (SKIP_PREFIXES.some((prefix) => relative.startsWith(prefix))) continue;

    items.push(relative);
  }

  return items;
}

function normalizeRoute(relativePath) {
  const segments = relativePath.split('/');
  const locale = segments[0] === 'es' || segments[0] === 'pt' ? segments[0] : 'en';
  const trimmed = locale === 'en' ? relativePath : segments.slice(1).join('/');

  let slug = trimmed.replace(/\/index\.html$/i, '').replace(/\.html$/i, '').replace(/\/$/, '');

  if (slug === 'home' || slug === 'home/index' || slug === '') return null;

  if (!slug || slug.includes('.bak') || slug.includes('.backup')) return null;

  return { locale, slug };
}

function extractMetadata(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  const description = (
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)?.[1] || ''
  )
    .replace(/\s+/g, ' ')
    .trim();
  return {
    title,
    description,
  };
}

async function main() {
  const htmlFiles = await walk(root);
  const routeMap = new Map();

  for (const file of htmlFiles) {
    const normalized = normalizeRoute(file);
    if (!normalized) continue;

    const key = `${normalized.locale}:${normalized.slug}`;
    if (routeMap.has(key)) continue;

    let title = '';
    let description = '';

    try {
      const html = await fs.readFile(path.join(root, file), 'utf8');
      const meta = extractMetadata(html);
      title = meta.title;
      description = meta.description;
    } catch {
      // Keep route even if metadata extraction fails.
    }

    routeMap.set(key, {
      locale: normalized.locale,
      slug: normalized.slug,
      sourcePath: file,
      title,
      description,
    });
  }

  const routes = Array.from(routeMap.values()).sort((a, b) => {
    if (a.locale === b.locale) return a.slug.localeCompare(b.slug);
    return a.locale.localeCompare(b.locale);
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(routes, null, 2)}\n`, 'utf8');

  const summary = routes.reduce(
    (acc, route) => {
      acc.total += 1;
      acc[route.locale] += 1;
      return acc;
    },
    { total: 0, en: 0, es: 0, pt: 0 },
  );

  console.log(`Generated route index: ${outputPath}`);
  console.log(`Total routes: ${summary.total}`);
  console.log(`EN: ${summary.en} | ES: ${summary.es} | PT: ${summary.pt}`);
}

main().catch((error) => {
  console.error('Failed to generate route index', error);
  process.exit(1);
});
