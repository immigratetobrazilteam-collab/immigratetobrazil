#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const managedRoot = path.join(root, 'content', 'cms', 'managed-legacy', 'en');
const discoverRoot = path.join(root, 'content', 'cms', 'discover-pages', 'en');
const siteCopyPath = path.join(root, 'content', 'cms', 'site-copy', 'en.json');

const genericPhrases = [
  'Eligibility check',
  'This page outlines key checkpoints',
  'Visa, residency, housing, and daily-life guidance tailored for',
  'Legacy discover source migrated to managed content',
];

function fail(message) {
  console.error(`Rewritten content validation failed: ${message}`);
  process.exit(1);
}

function assert(cond, message) {
  if (!cond) fail(message);
}

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (entry.isFile() && full.endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

function textIncludesGeneric(text) {
  const input = String(text || '').toLowerCase();
  return genericPhrases.find((phrase) => input.includes(phrase.toLowerCase()));
}

function validateSources(page, rel) {
  assert(Array.isArray(page.contentSources) && page.contentSources.length >= 3, `${rel} contentSources must contain at least 3 records`);
  for (const [idx, src] of page.contentSources.entries()) {
    assert(src && typeof src === 'object', `${rel} contentSources[${idx}] must be object`);
    for (const key of ['id', 'title', 'url', 'publisher']) {
      assert(typeof src[key] === 'string' && src[key].trim(), `${rel} contentSources[${idx}].${key} is required`);
    }
  }

  assert(page.factuality && typeof page.factuality === 'object', `${rel} factuality object required`);
  assert(typeof page.factuality.lastVerifiedAt === 'string' && page.factuality.lastVerifiedAt, `${rel} factuality.lastVerifiedAt required`);
  assert(typeof page.factuality.verificationLevel === 'string' && page.factuality.verificationLevel, `${rel} factuality.verificationLevel required`);
  assert(typeof page.factuality.confidence === 'string' && page.factuality.confidence, `${rel} factuality.confidence required`);

  assert(page.editorial && typeof page.editorial === 'object', `${rel} editorial object required`);
  assert(typeof page.editorial.primaryIntent === 'string' && page.editorial.primaryIntent, `${rel} editorial.primaryIntent required`);
  assert(typeof page.editorial.targetPersona === 'string' && page.editorial.targetPersona, `${rel} editorial.targetPersona required`);

  assert(page.seoV2 && typeof page.seoV2 === 'object', `${rel} seoV2 object required`);
  assert(typeof page.seoV2.primaryKeyword === 'string' && page.seoV2.primaryKeyword, `${rel} seoV2.primaryKeyword required`);
  assert(Array.isArray(page.seoV2.secondaryKeywords) && page.seoV2.secondaryKeywords.length >= 3, `${rel} seoV2.secondaryKeywords must have >= 3 items`);
}

async function main() {
  const managedFiles = (await walk(managedRoot)).filter((file) => !file.endsWith('_manifest.json'));
  const discoverFiles = (await walk(discoverRoot)).filter((file) => !path.basename(file).startsWith('_'));

  for (const file of managedFiles) {
    const rel = path.relative(root, file);
    const page = JSON.parse(await fs.readFile(file, 'utf8'));
    const marker = textIncludesGeneric(`${page.description || ''} ${(page.sections || []).flatMap((s) => s.paragraphs || []).join(' ')}`);
    assert(!marker, `${rel} still contains generic marker '${marker}'`);
    assert(Array.isArray(page.sections) && page.sections.length >= 3, `${rel} must have at least 3 sections`);

    if (String(page.slug || '').startsWith('services/')) {
      const titles = new Set((page.sections || []).map((s) => String(s.title || '').toLowerCase()));
      for (const required of ['eligibility and scope', 'required documents', 'process roadmap', 'timelines and cost framework', 'risk controls and legal escalation', 'important disclaimer']) {
        assert(titles.has(required), `${rel} missing required service section '${required}'`);
      }
    }

    validateSources(page, rel);
  }

  const introCounts = new Map();
  for (const file of discoverFiles) {
    const rel = path.relative(root, file);
    const page = JSON.parse(await fs.readFile(file, 'utf8'));
    const marker = textIncludesGeneric(`${page.heroIntro || ''} ${page.sourceUpdatedLabel || ''}`);
    assert(!marker, `${rel} still contains generic marker '${marker}'`);

    assert(typeof page.heroIntro === 'string' && page.heroIntro.length >= 100, `${rel} heroIntro must be >=100 chars`);
    validateSources(page, rel);

    const key = page.heroIntro.trim().toLowerCase();
    introCounts.set(key, (introCounts.get(key) || 0) + 1);
  }

  for (const [intro, count] of introCounts.entries()) {
    if (count > 120) {
      fail(`discover heroIntro duplication too high (${count}) for intro snippet: ${intro.slice(0, 80)}...`);
    }
  }

  const site = JSON.parse(await fs.readFile(siteCopyPath, 'utf8'));
  const managedPages = site.managedPages || {};
  for (const [key, value] of Object.entries(managedPages)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue;
    }
    validateSources(value, `site-copy/en.json managedPages.${key}`);
  }

  console.log(`Rewritten content validation passed: ${managedFiles.length} managed pages, ${discoverFiles.length} discover pages.`);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
