#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacyRoot = path.resolve(root, process.env.LEGACY_SOURCE_ROOT || '.legacy-snapshot');
const minRetentionRatio = Number(process.env.MIN_RETENTION_RATIO || 0.55);
const failOnLowRetention = process.env.RETENTION_FAIL_ON_LOW === 'true';

function decodeHtmlEntities(input) {
  if (!input) return '';
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function cleanText(input) {
  return decodeHtmlEntities(String(input || ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(html) {
  return cleanText(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function extractMainFragment(html) {
  const explicitMain = html.match(/<main[^>]*id=["']main-content["'][^>]*>([\s\S]*?)<\/main>/i);
  if (explicitMain?.[1]) return explicitMain[1];

  const mainMatches = Array.from(html.matchAll(/<main[^>]*>([\s\S]*?)<\/main>/gi)).map((match) => match[1] || '');
  if (mainMatches.length) {
    mainMatches.sort((a, b) => b.length - a.length);
    return mainMatches[0];
  }

  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  return body || html;
}

function countWords(value) {
  const text = cleanText(value);
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function flattenManagedPage(page) {
  const parts = [
    page.title,
    page.description,
    page.heading,
    ...(page.sections || []).flatMap((section) => [section.title, ...(section.paragraphs || [])]),
    ...(page.bullets || []),
  ];
  return cleanText(parts.filter(Boolean).join(' '));
}

function flattenDiscoverPage(page) {
  const parts = [
    page.title,
    page.heroIntro,
    page.sourceUpdatedLabel,
    ...(page.tableOfContents || []).flatMap((item) => [item.label]),
    ...(page.sections || []).flatMap((section) => [
      section.heading,
      section.summary,
      ...(section.highlights || []),
      ...(section.blocks || []).flatMap((block) => (block.type === 'list' ? block.items || [] : [block.text])),
    ]),
    ...(page.faq || []).flatMap((item) => [item.question, item.answer]),
  ];
  return cleanText(parts.filter(Boolean).join(' '));
}

function flattenStateGuidePage(page) {
  const parts = [
    page.title,
    page.heroIntro,
    page.sourceUpdatedLabel,
    ...(page.tableOfContents || []).flatMap((item) => [item.label]),
    ...(page.sections || []).flatMap((section) => [
      section.heading,
      section.summary,
      ...(section.highlights || []),
      ...(section.blocks || []).flatMap((block) => (block.type === 'list' ? block.items || [] : [block.text])),
    ]),
    ...(page.faq || []).flatMap((item) => [item.question, item.answer]),
  ];
  return cleanText(parts.filter(Boolean).join(' '));
}

async function gatherEntries() {
  const entries = [];

  const managedManifest = await readJson(path.join(root, 'content/cms/managed-legacy/en/_manifest.json'));
  for (const item of managedManifest.pages || []) {
    entries.push({
      bucket: 'managed-legacy',
      sourcePath: item.sourcePath,
      slug: item.slug,
      jsonPath: path.join(root, 'content/cms/managed-legacy/en', `${item.slug}.json`),
      flatten: flattenManagedPage,
      liveUrl: `/en${item.pathname}`,
    });
  }

  const discoverManifest = await readJson(path.join(root, 'content/cms/discover-pages/en/_manifest.json'));
  for (const item of discoverManifest.pages || []) {
    entries.push({
      bucket: 'discover-pages',
      sourcePath: item.sourcePath,
      slug: item.slug,
      jsonPath: path.join(root, 'content/cms/discover-pages/en', `${item.slug}.json`),
      flatten: flattenDiscoverPage,
      liveUrl: `/en${item.pathname}`,
    });
  }

  const stateGuides = await readJson(path.join(root, 'content/cms/state-guides/en.json'));
  for (const guide of stateGuides.guides || []) {
    entries.push({
      bucket: 'state-guides',
      sourcePath: guide.sourcePath,
      slug: guide.slug,
      jsonPath: path.join(root, 'content/cms/state-guides/en.json'),
      flatten: () => flattenStateGuidePage(guide),
      liveUrl: `/en/state-guides/${guide.slug}`,
    });
  }

  return entries;
}

async function main() {
  const entries = await gatherEntries();
  const generatedAt = new Date().toISOString();
  const sampleLimit = Number(process.env.RETENTION_SAMPLE_LIMIT || 0);

  const missingSources = [];
  const retentionRows = [];

  const selected = sampleLimit > 0 ? entries.slice(0, sampleLimit) : entries;
  for (const entry of selected) {
    const legacyPath = path.join(legacyRoot, entry.sourcePath);
    const legacyHtml = await readTextIfExists(legacyPath);
    if (!legacyHtml) {
      missingSources.push(entry);
      continue;
    }

    const jsonData = await readJson(entry.jsonPath);
    const managedText = entry.flatten(jsonData);
    const mainFragment = extractMainFragment(legacyHtml);
    const oldWords = countWords(stripHtml(mainFragment));
    const newWords = countWords(managedText);
    const ratio = oldWords > 0 ? newWords / oldWords : 0;

    retentionRows.push({
      bucket: entry.bucket,
      sourcePath: entry.sourcePath,
      slug: entry.slug,
      jsonPath: entry.jsonPath,
      liveUrl: entry.liveUrl,
      oldWords,
      newWords,
      retentionRatio: Number(ratio.toFixed(4)),
      belowThreshold: ratio < minRetentionRatio,
    });
  }

  retentionRows.sort((a, b) => a.retentionRatio - b.retentionRatio);
  const belowThreshold = retentionRows.filter((row) => row.belowThreshold);

  const countsByBucket = retentionRows.reduce((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] || 0) + 1;
    return acc;
  }, {});

  const report = {
    generatedAt,
    legacyRoot,
    totalChecked: retentionRows.length,
    totalExpected: selected.length,
    missingSourceCount: missingSources.length,
    threshold: minRetentionRatio,
    belowThresholdCount: belowThreshold.length,
    countsByBucket,
    belowThreshold: belowThreshold.slice(0, 500),
    missingSources: missingSources.slice(0, 500).map((item) => ({
      bucket: item.bucket,
      sourcePath: item.sourcePath,
      jsonPath: item.jsonPath,
      liveUrl: item.liveUrl,
    })),
    rows: retentionRows,
  };

  const outDir = path.join(root, 'artifacts', 'content-retention');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'retention-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const md = [];
  md.push('# Content Retention Report');
  md.push('');
  md.push(`- Generated: ${generatedAt}`);
  md.push(`- Legacy root: ${legacyRoot}`);
  md.push(`- Checked: ${retentionRows.length}/${selected.length}`);
  md.push(`- Missing sources: ${missingSources.length}`);
  md.push(`- Threshold: ${minRetentionRatio}`);
  md.push(`- Below threshold: ${belowThreshold.length}`);
  md.push('');
  md.push('## Bucket Counts');
  md.push('');
  for (const [bucket, count] of Object.entries(countsByBucket).sort((a, b) => a[0].localeCompare(b[0]))) {
    md.push(`- ${bucket}: ${count}`);
  }
  md.push('');
  md.push('## Lowest Retention (Top 200)');
  md.push('');
  md.push('| Bucket | Source | Retention | Old Words | New Words | JSON | Live |');
  md.push('|---|---|---:|---:|---:|---|---|');
  for (const row of retentionRows.slice(0, 200)) {
    md.push(
      `| ${row.bucket} | \`${row.sourcePath}\` | ${row.retentionRatio.toFixed(3)} | ${row.oldWords} | ${row.newWords} | [json](${row.jsonPath}) | [${row.liveUrl}](${row.liveUrl}) |`,
    );
  }
  await fs.writeFile(path.join(outDir, 'retention-report.md'), `${md.join('\n')}\n`, 'utf8');

  console.log(`Retention audit complete.`);
  console.log(`- Checked: ${retentionRows.length}`);
  console.log(`- Missing sources: ${missingSources.length}`);
  console.log(`- Below threshold: ${belowThreshold.length} (threshold ${minRetentionRatio})`);
  console.log(`- Report: ${path.join(outDir, 'retention-report.md')}`);

  if (failOnLowRetention && (belowThreshold.length > 0 || missingSources.length > 0)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Failed to run content retention audit.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
