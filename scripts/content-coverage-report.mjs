#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locale = process.env.CONTENT_COVERAGE_LOCALE || 'en';
const outDir = path.join(root, 'artifacts', 'content-coverage');
const siteBase = String(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function liveUrl(pathname) {
  return `${siteBase}/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

async function main() {
  const rows = [];

  const managedManifest = await readJson(path.join(root, 'content/cms/managed-legacy', locale, '_manifest.json'));
  for (const page of managedManifest.pages || []) {
    rows.push({
      bucket: 'managed-legacy',
      slug: page.slug,
      sourcePath: page.sourcePath,
      jsonPath: `content/cms/managed-legacy/${locale}/${page.slug}.json`,
      pathname: page.pathname,
    });
  }

  const discoverManifest = await readJson(path.join(root, 'content/cms/discover-pages', locale, '_manifest.json'));
  for (const page of discoverManifest.pages || []) {
    rows.push({
      bucket: 'discover-pages',
      slug: page.slug,
      sourcePath: page.sourcePath,
      jsonPath: `content/cms/discover-pages/${locale}/${page.slug}.json`,
      pathname: page.pathname,
    });
  }

  const stateGuides = await readJson(path.join(root, 'content/cms/state-guides', `${locale}.json`));
  for (const guide of stateGuides.guides || []) {
    rows.push({
      bucket: 'state-guides',
      slug: guide.slug,
      sourcePath: guide.sourcePath,
      jsonPath: `content/cms/state-guides/${locale}.json`,
      pathname: `/state-guides/${guide.slug}`,
    });
  }

  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  const countsByBucket = rows.reduce((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] || 0) + 1;
    return acc;
  }, {});

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'content-coverage.json'), `${JSON.stringify({ locale, total: rows.length, countsByBucket, rows }, null, 2)}\n`);

  const md = [];
  md.push('# Content Coverage Report');
  md.push('');
  md.push(`- Locale: ${locale}`);
  md.push(`- Generated: ${new Date().toISOString()}`);
  md.push(`- Total pages: ${rows.length}`);
  md.push('');
  md.push('## Counts');
  md.push('');
  for (const [bucket, count] of Object.entries(countsByBucket).sort((a, b) => a[0].localeCompare(b[0]))) {
    md.push(`- ${bucket}: ${count}`);
  }
  md.push('');
  md.push('## Page Map');
  md.push('');
  md.push('| Bucket | Slug | Source | JSON | Live |');
  md.push('|---|---|---|---|---|');
  for (const row of rows) {
    md.push(
      `| ${row.bucket} | \`${row.slug}\` | \`${row.sourcePath}\` | [${row.jsonPath}](/home/ash/immigratetobrazil-repo/${row.jsonPath}) | [${row.pathname}](${liveUrl(row.pathname)}) |`,
    );
  }

  await fs.writeFile(path.join(outDir, 'content-coverage.md'), `${md.join('\n')}\n`);

  console.log(`Content coverage report written: ${path.join(outDir, 'content-coverage.md')}`);
  console.log(`Total pages: ${rows.length}`);
}

main().catch((error) => {
  console.error('Failed to generate content coverage report.');
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
