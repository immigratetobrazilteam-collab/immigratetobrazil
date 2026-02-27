#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentRoot = path.join(root, 'content', 'cms', 'managed-legacy', 'en');
const manifestPath = path.join(contentRoot, '_manifest.json');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  assert(await fileExists(manifestPath), 'Managed legacy manifest is missing.');
  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  assert(Array.isArray(manifest.pages), 'Manifest pages must be an array.');
  assert(typeof manifest.pageCount === 'number', 'Manifest pageCount must be a number.');
  assert(manifest.pageCount === manifest.pages.length, 'Manifest pageCount does not match pages length.');

  const slugs = new Set();
  const requiredPrefixes = new Set(['about', 'faq', 'policies', 'services', 'contact', 'home', 'resources-guides-brazil', 'accessibility']);
  const prefixHits = new Map();

  for (const page of manifest.pages) {
    assert(typeof page.slug === 'string' && page.slug.length > 0, 'Invalid page slug in manifest.');
    assert(!slugs.has(page.slug), `Duplicate managed page slug: ${page.slug}`);
    slugs.add(page.slug);

    const prefix = page.slug.split('/')[0];
    prefixHits.set(prefix, (prefixHits.get(prefix) || 0) + 1);

    const filePath = path.join(contentRoot, `${page.slug}.json`);
    assert(await fileExists(filePath), `Missing managed page file for slug: ${page.slug}`);

    const pageRaw = await fs.readFile(filePath, 'utf8');
    const document = JSON.parse(pageRaw);
    assert(typeof document.title === 'string' && document.title.trim().length > 0, `Missing title for ${page.slug}`);
    assert(Array.isArray(document.sections) && document.sections.length > 0, `Missing sections for ${page.slug}`);
  }

  for (const prefix of requiredPrefixes) {
    assert(prefixHits.has(prefix), `Missing managed pages for prefix: ${prefix}`);
  }

  const faqCanonical = manifest.pages.filter((page) => /^faq\/yourfaqsabout[a-z0-9]+answeredbyimmigratetobrazil$/u.test(page.slug));
  assert(faqCanonical.length === 27, `Expected 27 canonical FAQ state pages, found ${faqCanonical.length}.`);

  const aliases = manifest.aliases || {};
  const faqAliases = Object.keys(aliases).filter((key) => key.startsWith('faq/faq-'));
  assert(faqAliases.length === 27, `Expected 27 FAQ aliases, found ${faqAliases.length}.`);

  console.log(`Managed legacy validation passed (${manifest.pageCount} pages).`);
}

main().catch((error) => {
  console.error('Managed legacy validation failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
