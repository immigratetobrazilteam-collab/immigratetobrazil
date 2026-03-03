#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const LOCALES = ['en', 'es', 'pt', 'fr'];

function fail(message) {
  console.error(`State guides validation failed: ${message}`);
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

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  const raw = await readFile(fullPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    fail(`${relativePath} is not valid JSON`);
  }
}

async function getExpectedStateSlugs() {
  const raw = await readFile(path.join(root, 'content/curated/states.ts'), 'utf8');
  const slugs = Array.from(raw.matchAll(/slug:\s*'([^']+)'/g)).map((match) => match[1]);
  const unique = Array.from(new Set(slugs));

  assert(unique.length === 27, 'content/curated/states.ts must expose 27 unique state slugs');
  return unique;
}

function validateHub(relativePath, hub) {
  assert(isObject(hub), `${relativePath} hub must be an object`);
  for (const key of ['eyebrow', 'title', 'subtitle', 'countLabel', 'backToBlogLabel', 'consultationLabel']) {
    assert(isNonEmptyString(hub[key]), `${relativePath} hub.${key} is required`);
  }
}

function validateSection(relativePath, guidePath, section, index) {
  const base = `${relativePath} ${guidePath}.sections[${index}]`;
  assert(isObject(section), `${base} must be an object`);
  assert(isNonEmptyString(section.id), `${base}.id is required`);
  assert(isNonEmptyString(section.heading), `${base}.heading is required`);
  assert(isNonEmptyString(section.summary), `${base}.summary is required`);
  assert(Array.isArray(section.highlights), `${base}.highlights must be an array`);
  section.highlights.forEach((item, itemIndex) => {
    assert(isNonEmptyString(item), `${base}.highlights[${itemIndex}] must be a non-empty string`);
  });

  assert(Array.isArray(section.blocks) && section.blocks.length >= 1, `${base}.blocks must have at least one item`);
  section.blocks.forEach((block, blockIndex) => {
    const blockBase = `${base}.blocks[${blockIndex}]`;
    assert(isObject(block), `${blockBase} must be an object`);
    assert(
      block.type === 'subheading' || block.type === 'paragraph' || block.type === 'list' || block.type === 'note',
      `${blockBase}.type must be subheading|paragraph|list|note`,
    );

    if (block.type === 'subheading' || block.type === 'paragraph') {
      assert(isNonEmptyString(block.text), `${blockBase}.text is required for ${block.type}`);
    }

    if (block.type === 'list') {
      assert(Array.isArray(block.items) && block.items.length >= 1, `${blockBase}.items must have at least one item`);
      block.items.forEach((item, itemIdx) => {
        assert(isNonEmptyString(item), `${blockBase}.items[${itemIdx}] must be a non-empty string`);
      });
    }

    if (block.type === 'note') {
      assert(
        block.tone === 'tip' || block.tone === 'highlight' || block.tone === 'compliance' || block.tone === 'note',
        `${blockBase}.tone must be tip|highlight|compliance|note`,
      );
      assert(isNonEmptyString(block.text), `${blockBase}.text is required for note blocks`);
    }
  });
}

function validateTableOfContents(relativePath, guidePath, tableOfContents, { required }) {
  const base = `${relativePath} ${guidePath}.tableOfContents`;
  if (tableOfContents == null) {
    if (required) {
      assert(false, `${base} is required`);
    }
    return;
  }

  assert(Array.isArray(tableOfContents), `${base} must be an array`);
  if (required) {
    assert(tableOfContents.length >= 8, `${base} must contain at least 8 items`);
  }

  tableOfContents.forEach((item, index) => {
    const itemBase = `${base}[${index}]`;
    assert(isObject(item), `${itemBase} must be an object`);
    assert(isNonEmptyString(item.id), `${itemBase}.id is required`);
    assert(isNonEmptyString(item.label), `${itemBase}.label is required`);
  });
}

function validateFaqItem(relativePath, guidePath, item, index) {
  const base = `${relativePath} ${guidePath}.faq[${index}]`;
  assert(isObject(item), `${base} must be an object`);
  assert(isNonEmptyString(item.question), `${base}.question is required`);
  assert(isNonEmptyString(item.answer), `${base}.answer is required`);
}

function validateCta(relativePath, guidePath, cta) {
  const base = `${relativePath} ${guidePath}.cta`;
  assert(isObject(cta), `${base} must be an object`);
  for (const key of ['title', 'description', 'primaryLabel', 'primaryHref', 'secondaryLabel', 'secondaryHref']) {
    assert(isNonEmptyString(cta[key]), `${base}.${key} is required`);
  }
}

function validateCtaOverride(relativePath, guidePath, cta) {
  const base = `${relativePath} ${guidePath}.cta`;
  assert(isObject(cta), `${base} must be an object`);
  for (const key of ['title', 'description', 'primaryLabel', 'primaryHref', 'secondaryLabel', 'secondaryHref']) {
    if (cta[key] != null) {
      assert(isNonEmptyString(cta[key]), `${base}.${key} must be non-empty when present`);
    }
  }
}

function validateSeo(relativePath, guidePath, seo) {
  const base = `${relativePath} ${guidePath}.seo`;
  assert(isObject(seo), `${base} must be an object`);
  assert(isNonEmptyString(seo.metaTitle), `${base}.metaTitle is required`);
  assert(isNonEmptyString(seo.metaDescription), `${base}.metaDescription is required`);
  assert(Array.isArray(seo.keywords) && seo.keywords.length >= 3, `${base}.keywords must include at least three items`);
  seo.keywords.forEach((item, index) => {
    assert(isNonEmptyString(item), `${base}.keywords[${index}] must be a non-empty string`);
  });
}

function validateSeoOverride(relativePath, guidePath, seo) {
  const base = `${relativePath} ${guidePath}.seo`;
  assert(isObject(seo), `${base} must be an object`);

  if (seo.metaTitle != null) {
    assert(isNonEmptyString(seo.metaTitle), `${base}.metaTitle must be non-empty when present`);
  }

  if (seo.metaDescription != null) {
    assert(isNonEmptyString(seo.metaDescription), `${base}.metaDescription must be non-empty when present`);
  }

  if (seo.keywords != null) {
    assert(Array.isArray(seo.keywords) && seo.keywords.length >= 1, `${base}.keywords must include at least one item when present`);
    seo.keywords.forEach((item, index) => {
      assert(isNonEmptyString(item), `${base}.keywords[${index}] must be a non-empty string`);
    });
  }
}

function validateGuideFull(relativePath, guide, index, expectedStateSlugs) {
  const guidePath = `guides[${index}]`;

  assert(isObject(guide), `${relativePath} ${guidePath} must be an object`);
  assert(isNonEmptyString(guide.stateSlug), `${relativePath} ${guidePath}.stateSlug is required`);
  assert(expectedStateSlugs.has(guide.stateSlug), `${relativePath} ${guidePath}.stateSlug '${guide.stateSlug}' is invalid`);

  const expectedSlug = `everything-you-need-to-know-about-${guide.stateSlug}`;
  assert(guide.slug === expectedSlug, `${relativePath} ${guidePath}.slug must be '${expectedSlug}'`);

  for (const key of ['title', 'heroIntro', 'sourcePath', 'sourceUpdatedLabel', 'owner']) {
    assert(isNonEmptyString(guide[key]), `${relativePath} ${guidePath}.${key} is required`);
  }

  validateTableOfContents(relativePath, guidePath, guide.tableOfContents, { required: true });

  assert(Array.isArray(guide.sections) && guide.sections.length >= 8, `${relativePath} ${guidePath}.sections must contain at least 8 sections`);
  guide.sections.forEach((section, sectionIndex) => validateSection(relativePath, guidePath, section, sectionIndex));

  assert(Array.isArray(guide.faq) && guide.faq.length >= 3, `${relativePath} ${guidePath}.faq must contain at least 3 entries`);
  guide.faq.forEach((item, faqIndex) => validateFaqItem(relativePath, guidePath, item, faqIndex));

  validateCta(relativePath, guidePath, guide.cta);
  validateSeo(relativePath, guidePath, guide.seo);

  assert(guide.status === 'draft' || guide.status === 'published', `${relativePath} ${guidePath}.status must be draft|published`);
  assert(isIsoDate(guide.lastReviewedAt), `${relativePath} ${guidePath}.lastReviewedAt must be YYYY-MM-DD`);
  assert(isPositiveInteger(guide.reviewEveryDays), `${relativePath} ${guidePath}.reviewEveryDays must be a positive integer`);
}

function validateGuideOverride(relativePath, guide, index, expectedStateSlugs) {
  const guidePath = `guides[${index}]`;

  assert(isObject(guide), `${relativePath} ${guidePath} must be an object`);
  assert(isNonEmptyString(guide.stateSlug), `${relativePath} ${guidePath}.stateSlug is required`);
  assert(expectedStateSlugs.has(guide.stateSlug), `${relativePath} ${guidePath}.stateSlug '${guide.stateSlug}' is invalid`);

  if (guide.slug != null) {
    assert(isNonEmptyString(guide.slug), `${relativePath} ${guidePath}.slug must be non-empty if present`);
  }

  for (const key of ['title', 'heroIntro', 'sourcePath', 'sourceUpdatedLabel', 'owner']) {
    if (guide[key] != null) {
      assert(isNonEmptyString(guide[key]), `${relativePath} ${guidePath}.${key} must be non-empty when present`);
    }
  }

  if (guide.sections != null) {
    assert(Array.isArray(guide.sections) && guide.sections.length >= 1, `${relativePath} ${guidePath}.sections must be a non-empty array when present`);
    guide.sections.forEach((section, sectionIndex) => validateSection(relativePath, guidePath, section, sectionIndex));
  }

  if (guide.tableOfContents != null) {
    validateTableOfContents(relativePath, guidePath, guide.tableOfContents, { required: false });
  }

  if (guide.faq != null) {
    assert(Array.isArray(guide.faq) && guide.faq.length >= 1, `${relativePath} ${guidePath}.faq must be a non-empty array when present`);
    guide.faq.forEach((item, faqIndex) => validateFaqItem(relativePath, guidePath, item, faqIndex));
  }

  if (guide.cta != null) {
    validateCtaOverride(relativePath, guidePath, guide.cta);
  }

  if (guide.seo != null) {
    validateSeoOverride(relativePath, guidePath, guide.seo);
  }

  if (guide.status != null) {
    assert(guide.status === 'draft' || guide.status === 'published', `${relativePath} ${guidePath}.status must be draft|published when present`);
  }

  if (guide.lastReviewedAt != null) {
    assert(isIsoDate(guide.lastReviewedAt), `${relativePath} ${guidePath}.lastReviewedAt must be YYYY-MM-DD when present`);
  }

  if (guide.reviewEveryDays != null) {
    assert(isPositiveInteger(guide.reviewEveryDays), `${relativePath} ${guidePath}.reviewEveryDays must be a positive integer when present`);
  }
}

async function main() {
  const expectedStateSlugs = new Set(await getExpectedStateSlugs());

  for (const locale of LOCALES) {
    const relativePath = `content/cms/state-guides/${locale}.json`;
    const file = await readJson(relativePath);

    assert(file.locale === locale, `${relativePath} locale must be '${locale}'`);
    validateHub(relativePath, file.hub);

    assert(Array.isArray(file.guides), `${relativePath} guides must be an array`);

    const seenStateSlugs = new Set();
    for (const [index, guide] of file.guides.entries()) {
      const stateSlug = guide?.stateSlug;
      assert(!seenStateSlugs.has(stateSlug), `${relativePath} has duplicate stateSlug '${stateSlug}'`);
      seenStateSlugs.add(stateSlug);

      if (locale === 'en') {
        validateGuideFull(relativePath, guide, index, expectedStateSlugs);
      } else {
        validateGuideOverride(relativePath, guide, index, expectedStateSlugs);
      }
    }

    if (locale === 'en') {
      assert(file.guides.length === expectedStateSlugs.size, `${relativePath} must contain ${expectedStateSlugs.size} guides`);
      for (const expectedStateSlug of expectedStateSlugs) {
        assert(seenStateSlugs.has(expectedStateSlug), `${relativePath} is missing guide for '${expectedStateSlug}'`);
      }
    }
  }

  console.log('State guides validation passed.');
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
