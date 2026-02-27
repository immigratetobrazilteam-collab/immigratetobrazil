#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const now = new Date(process.env.EDITORIAL_REFERENCE_DATE || Date.now());
const failOnStale = process.env.EDITORIAL_FAIL_ON_STALE === 'true';

function parseDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function daysBetween(from, to) {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function evaluateItem(item) {
  const status = item.status || 'published';
  if (status !== 'published') {
    return { stale: false, reason: 'draft' };
  }

  const reviewed = parseDate(item.lastReviewedAt);
  const cadence = Number(item.reviewEveryDays || 0);

  if (!reviewed || !Number.isFinite(cadence) || cadence <= 0) {
    return { stale: true, reason: 'missing-review-metadata', dueDate: null, daysOverdue: null };
  }

  const dueDate = new Date(reviewed);
  dueDate.setDate(dueDate.getDate() + cadence);

  if (dueDate.getTime() < now.getTime()) {
    return {
      stale: true,
      reason: 'review-overdue',
      dueDate: dueDate.toISOString().slice(0, 10),
      daysOverdue: daysBetween(dueDate, now),
    };
  }

  return {
    stale: false,
    reason: 'in-window',
    dueDate: dueDate.toISOString().slice(0, 10),
    daysOverdue: 0,
  };
}

async function walkJsonFiles(baseDir, output = []) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      await walkJsonFiles(absolute, output);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name.startsWith('_')) continue;
    output.push(absolute);
  }
  return output;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function collectManagedLegacyItems() {
  const baseDir = path.join(root, 'content', 'cms', 'managed-legacy', 'en');
  const files = await walkJsonFiles(baseDir);
  const items = [];

  for (const file of files) {
    const json = await readJson(file);
    items.push({
      bucket: 'managed-legacy',
      slug: json.slug || path.relative(baseDir, file).replace(/\\/g, '/').replace(/\.json$/i, ''),
      sourcePath: json.sourcePath || '',
      owner: json.owner || '',
      status: json.status || 'published',
      lastReviewedAt: json.lastReviewedAt || '',
      reviewEveryDays: json.reviewEveryDays || 0,
      jsonPath: file,
      liveUrl: `/en/${(json.slug || '').replace(/^\/+/, '')}`,
    });
  }

  return items;
}

async function collectDiscoverItems() {
  const baseDir = path.join(root, 'content', 'cms', 'discover-pages', 'en');
  const files = await walkJsonFiles(baseDir);
  const items = [];

  for (const file of files) {
    const json = await readJson(file);
    items.push({
      bucket: 'discover-pages',
      slug: json.slug || path.relative(baseDir, file).replace(/\\/g, '/').replace(/\.json$/i, ''),
      sourcePath: json.sourcePath || '',
      owner: json.owner || '',
      status: json.status || 'published',
      lastReviewedAt: json.lastReviewedAt || '',
      reviewEveryDays: json.reviewEveryDays || 0,
      jsonPath: file,
      liveUrl: `/en${json.pathname || '/discover'}`,
    });
  }

  return items;
}

async function collectStateGuideItems() {
  const filePath = path.join(root, 'content', 'cms', 'state-guides', 'en.json');
  const json = await readJson(filePath);
  const guides = Array.isArray(json.guides) ? json.guides : [];
  return guides.map((guide) => ({
    bucket: 'state-guides',
    slug: guide.slug,
    sourcePath: guide.sourcePath || '',
    owner: guide.owner || '',
    status: guide.status || 'published',
    lastReviewedAt: guide.lastReviewedAt || '',
    reviewEveryDays: guide.reviewEveryDays || 0,
    jsonPath: filePath,
    liveUrl: `/en/state-guides/${guide.slug}`,
  }));
}

async function main() {
  const [managedLegacy, discover, stateGuides] = await Promise.all([
    collectManagedLegacyItems(),
    collectDiscoverItems(),
    collectStateGuideItems(),
  ]);

  const allItems = [...managedLegacy, ...discover, ...stateGuides];
  const evaluated = allItems.map((item) => ({ ...item, audit: evaluateItem(item) }));

  const stale = evaluated.filter((item) => item.audit.stale);
  stale.sort((a, b) => (b.audit.daysOverdue || 0) - (a.audit.daysOverdue || 0));

  const countsByBucket = evaluated.reduce((acc, item) => {
    acc[item.bucket] = (acc[item.bucket] || 0) + 1;
    return acc;
  }, {});

  const staleByBucket = stale.reduce((acc, item) => {
    acc[item.bucket] = (acc[item.bucket] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    generatedAt: new Date().toISOString(),
    referenceDate: now.toISOString().slice(0, 10),
    totals: {
      pages: evaluated.length,
      stale: stale.length,
    },
    countsByBucket,
    staleByBucket,
    stale,
  };

  const outDir = path.join(root, 'artifacts', 'editorial');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'stale-report.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const md = [];
  md.push('# Editorial Stale Content Report');
  md.push('');
  md.push(`- Generated: ${summary.generatedAt}`);
  md.push(`- Reference date: ${summary.referenceDate}`);
  md.push(`- Total pages: ${summary.totals.pages}`);
  md.push(`- Stale pages: ${summary.totals.stale}`);
  md.push('');
  md.push('## Counts by bucket');
  md.push('');
  for (const [bucket, count] of Object.entries(countsByBucket).sort((a, b) => a[0].localeCompare(b[0]))) {
    const staleCount = staleByBucket[bucket] || 0;
    md.push(`- ${bucket}: ${count} total, ${staleCount} stale`);
  }
  md.push('');
  md.push('## Top stale pages');
  md.push('');
  md.push('| Bucket | Slug | Days Overdue | Last Reviewed | Cadence | JSON | Live |');
  md.push('|---|---|---:|---|---:|---|---|');
  for (const item of stale.slice(0, 500)) {
    md.push(
      `| ${item.bucket} | \`${item.slug}\` | ${item.audit.daysOverdue ?? '-'} | ${item.lastReviewedAt || '-'} | ${item.reviewEveryDays || '-'} | [json](${item.jsonPath}) | [${item.liveUrl}](${item.liveUrl}) |`,
    );
  }
  await fs.writeFile(path.join(outDir, 'stale-report.md'), `${md.join('\n')}\n`, 'utf8');

  console.log(`Editorial stale check complete.`);
  console.log(`- Total pages: ${evaluated.length}`);
  console.log(`- Stale pages: ${stale.length}`);
  console.log(`- Report: ${path.join(outDir, 'stale-report.md')}`);

  if (failOnStale && stale.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('editorial stale check failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

