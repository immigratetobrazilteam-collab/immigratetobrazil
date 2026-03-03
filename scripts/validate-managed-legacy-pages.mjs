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

function validateOptionalHybridFields(document, slug) {
  if (document.contentSources != null) {
    assert(Array.isArray(document.contentSources) && document.contentSources.length >= 1, `Invalid contentSources for ${slug}`);
    for (const [index, source] of document.contentSources.entries()) {
      assert(source && typeof source === 'object', `Invalid contentSources[${index}] object for ${slug}`);
      for (const key of ['id', 'title', 'url']) {
        assert(typeof source[key] === 'string' && source[key].trim().length > 0, `Missing contentSources[${index}].${key} for ${slug}`);
      }
    }
  }

  if (document.factuality != null) {
    assert(typeof document.factuality === 'object', `Invalid factuality for ${slug}`);
    for (const key of ['lastVerifiedAt', 'verificationLevel', 'confidence']) {
      assert(
        typeof document.factuality[key] === 'string' && document.factuality[key].trim().length > 0,
        `Missing factuality.${key} for ${slug}`,
      );
    }
  }

  if (document.editorial != null) {
    assert(typeof document.editorial === 'object', `Invalid editorial for ${slug}`);
    for (const key of ['primaryIntent', 'targetPersona']) {
      assert(
        typeof document.editorial[key] === 'string' && document.editorial[key].trim().length > 0,
        `Missing editorial.${key} for ${slug}`,
      );
    }
  }

  if (document.seoV2 != null) {
    assert(typeof document.seoV2 === 'object', `Invalid seoV2 for ${slug}`);
    assert(
      typeof document.seoV2.primaryKeyword === 'string' && document.seoV2.primaryKeyword.trim().length > 0,
      `Missing seoV2.primaryKeyword for ${slug}`,
    );
    assert(Array.isArray(document.seoV2.secondaryKeywords), `Missing seoV2.secondaryKeywords for ${slug}`);
    assert(
      typeof document.seoV2.searchIntent === 'string' && document.seoV2.searchIntent.trim().length > 0,
      `Missing seoV2.searchIntent for ${slug}`,
    );
    assert(
      typeof document.seoV2.snippetAnswer === 'string' && document.seoV2.snippetAnswer.trim().length > 0,
      `Missing seoV2.snippetAnswer for ${slug}`,
    );
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
    validateOptionalHybridFields(document, page.slug);
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
