#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseDir = path.join(root, 'content', 'cms', 'discover-pages');

function fail(message) {
  console.error(`Discover pages validation failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    fail(`${path.relative(root, filePath)} is not valid JSON`);
  }
}

function validateHub(relativePath, data) {
  assert(isObject(data), `${relativePath} must be an object`);
  for (const key of ['locale', 'eyebrow', 'title', 'subtitle', 'countLabel', 'browseStatesLabel', 'browseRegionsLabel', 'consultationLabel']) {
    assert(isNonEmptyString(data[key]), `${relativePath} ${key} must be a non-empty string`);
  }
}

function validatePageShape(relativePath, page) {
  assert(isObject(page), `${relativePath} must be an object`);
  for (const key of ['slug', 'pathname', 'title', 'heroIntro', 'sourcePath', 'sourceUpdatedLabel', 'owner', 'status', 'lastReviewedAt']) {
    assert(isNonEmptyString(page[key]), `${relativePath} ${key} must be a non-empty string`);
  }

  assert(Array.isArray(page.tableOfContents) && page.tableOfContents.length >= 1, `${relativePath} tableOfContents must have at least one item`);
  for (const [index, item] of page.tableOfContents.entries()) {
    assert(isObject(item), `${relativePath} tableOfContents[${index}] must be an object`);
    assert(isNonEmptyString(item.id), `${relativePath} tableOfContents[${index}].id is required`);
    assert(isNonEmptyString(item.label), `${relativePath} tableOfContents[${index}].label is required`);
  }

  assert(Array.isArray(page.sections) && page.sections.length >= 1, `${relativePath} sections must have at least one section`);
  for (const [index, section] of page.sections.entries()) {
    assert(isObject(section), `${relativePath} sections[${index}] must be an object`);
    for (const key of ['id', 'heading', 'summary']) {
      assert(isNonEmptyString(section[key]), `${relativePath} sections[${index}].${key} is required`);
    }

    assert(Array.isArray(section.highlights), `${relativePath} sections[${index}].highlights must be an array`);
    assert(Array.isArray(section.blocks) && section.blocks.length >= 1, `${relativePath} sections[${index}].blocks must have at least one item`);

    for (const [blockIndex, block] of section.blocks.entries()) {
      assert(isObject(block), `${relativePath} sections[${index}].blocks[${blockIndex}] must be an object`);
      assert(
        block.type === 'subheading' || block.type === 'paragraph' || block.type === 'list' || block.type === 'note',
        `${relativePath} sections[${index}].blocks[${blockIndex}].type is invalid`,
      );

      if (block.type === 'subheading' || block.type === 'paragraph') {
        assert(isNonEmptyString(block.text), `${relativePath} sections[${index}].blocks[${blockIndex}].text is required`);
      }

      if (block.type === 'list') {
        assert(Array.isArray(block.items) && block.items.length >= 1, `${relativePath} sections[${index}].blocks[${blockIndex}].items must be non-empty`);
      }

      if (block.type === 'note') {
        assert(
          block.tone === 'tip' || block.tone === 'highlight' || block.tone === 'compliance' || block.tone === 'note',
          `${relativePath} sections[${index}].blocks[${blockIndex}].tone is invalid`,
        );
        assert(isNonEmptyString(block.text), `${relativePath} sections[${index}].blocks[${blockIndex}].text is required`);
      }
    }
  }

  assert(Array.isArray(page.faq), `${relativePath} faq must be an array`);
  for (const [index, item] of page.faq.entries()) {
    assert(isObject(item), `${relativePath} faq[${index}] must be an object`);
    assert(isNonEmptyString(item.question), `${relativePath} faq[${index}].question is required`);
    assert(isNonEmptyString(item.answer), `${relativePath} faq[${index}].answer is required`);
  }

  assert(isObject(page.seo), `${relativePath} seo must be an object`);
  assert(isNonEmptyString(page.seo.metaTitle), `${relativePath} seo.metaTitle is required`);
  assert(isNonEmptyString(page.seo.metaDescription), `${relativePath} seo.metaDescription is required`);
  assert(Array.isArray(page.seo.keywords) && page.seo.keywords.length >= 3, `${relativePath} seo.keywords must have at least 3 entries`);

  assert(isObject(page.cta), `${relativePath} cta must be an object`);
  for (const key of ['title', 'description', 'primaryLabel', 'primaryHref', 'secondaryLabel', 'secondaryHref']) {
    assert(isNonEmptyString(page.cta[key]), `${relativePath} cta.${key} is required`);
  }

  assert(isObject(page.taxonomy), `${relativePath} taxonomy must be an object`);
  assert(isNonEmptyString(page.taxonomy.type), `${relativePath} taxonomy.type is required`);
  assert(Array.isArray(page.taxonomy.segments), `${relativePath} taxonomy.segments must be an array`);

  assert(typeof page.reviewEveryDays === 'number' && Number.isFinite(page.reviewEveryDays) && page.reviewEveryDays > 0, `${relativePath} reviewEveryDays must be a positive number`);
}

async function main() {
  const manifestPath = path.join(baseDir, 'en', '_manifest.json');
  const manifest = await readJson(manifestPath);

  assert(isObject(manifest), 'en/_manifest.json must be an object');
  assert(typeof manifest.pageCount === 'number' && manifest.pageCount > 5000, 'en/_manifest.json pageCount must be > 5000');
  assert(Array.isArray(manifest.pages), 'en/_manifest.json pages must be an array');
  assert(manifest.pageCount === manifest.pages.length, 'en/_manifest.json pageCount must match pages length');

  const seen = new Set();

  for (const [index, entry] of manifest.pages.entries()) {
    assert(isObject(entry), `en/_manifest.json pages[${index}] must be an object`);
    assert(isNonEmptyString(entry.slug), `en/_manifest.json pages[${index}].slug is required`);
    assert(!seen.has(entry.slug), `en/_manifest.json duplicate slug '${entry.slug}'`);
    seen.add(entry.slug);

    const pagePath = path.join(baseDir, 'en', `${entry.slug}.json`);
    await access(pagePath).catch(() => fail(`missing page file for slug '${entry.slug}'`));

    const page = await readJson(pagePath);
    validatePageShape(path.relative(root, pagePath), page);
  }

  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const hubPath = path.join(baseDir, locale, '_hub.json');
    await access(hubPath).catch(() => fail(`missing ${locale}/_hub.json`));
    const hubData = await readJson(hubPath);
    validateHub(path.relative(root, hubPath), hubData);
  }

  console.log(`Discover pages validation passed (${manifest.pageCount} pages).`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
