#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

async function walkJson(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkJson(full, out);
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function rel(p) { return path.relative(root, p); }

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    checks: {},
    failures: [],
  };

  const managedRoot = path.join(root, 'content/cms/managed-legacy/en');
  const discoverRoot = path.join(root, 'content/cms/discover-pages/en');

  const managedManifest = JSON.parse(await fs.readFile(path.join(managedRoot, '_manifest.json'), 'utf8'));
  const discoverManifest = JSON.parse(await fs.readFile(path.join(discoverRoot, '_manifest.json'), 'utf8'));

  const managedFiles = (await walkJson(managedRoot)).filter((f) => path.basename(f) !== '_manifest.json');
  const discoverFiles = (await walkJson(discoverRoot)).filter((f) => !path.basename(f).startsWith('_'));

  const managedManifestSet = new Set((managedManifest.pages || []).map((p) => `${p.slug}.json`));
  const managedFileSet = new Set(managedFiles.map((f) => rel(f).replace(/^content\/cms\/managed-legacy\/en\//, '')));

  const discoverManifestSet = new Set((discoverManifest.pages || []).map((p) => `${p.slug}.json`));
  const discoverFileSet = new Set(discoverFiles.map((f) => rel(f).replace(/^content\/cms\/discover-pages\/en\//, '')));

  const managedMissingFiles = [...managedManifestSet].filter((f) => !managedFileSet.has(f));
  const managedUnindexedFiles = [...managedFileSet].filter((f) => !managedManifestSet.has(f));
  const discoverMissingFiles = [...discoverManifestSet].filter((f) => !discoverFileSet.has(f));
  const discoverUnindexedFiles = [...discoverFileSet].filter((f) => !discoverManifestSet.has(f));

  report.checks.managedLegacy = {
    manifestCount: managedManifest.pages?.length || 0,
    fileCount: managedFiles.length,
    missingFiles: managedMissingFiles.length,
    unindexedFiles: managedUnindexedFiles.length,
  };
  report.checks.discover = {
    manifestCount: discoverManifest.pages?.length || 0,
    fileCount: discoverFiles.length,
    missingFiles: discoverMissingFiles.length,
    unindexedFiles: discoverUnindexedFiles.length,
  };

  const thinManaged = [];
  for (const file of managedFiles) {
    const json = JSON.parse(await fs.readFile(file, 'utf8'));
    const sectionCount = Array.isArray(json.sections) ? json.sections.length : 0;
    const paragraphCount = (json.sections || []).reduce((acc, s) => acc + (Array.isArray(s.paragraphs) ? s.paragraphs.filter(Boolean).length : 0), 0);
    if (sectionCount < 3 || paragraphCount < 6) {
      thinManaged.push(rel(file));
    }
  }

  const thinDiscover = [];
  for (const file of discoverFiles) {
    const json = JSON.parse(await fs.readFile(file, 'utf8'));
    const sectionCount = Array.isArray(json.sections) ? json.sections.length : 0;
    const blockCount = (json.sections || []).reduce((acc, s) => acc + (Array.isArray(s.blocks) ? s.blocks.length : 0), 0);
    if (sectionCount < 4 || blockCount < 8) {
      thinDiscover.push(rel(file));
    }
  }

  report.checks.population = {
    thinManaged: thinManaged.length,
    thinDiscover: thinDiscover.length,
  };

  if (managedMissingFiles.length || managedUnindexedFiles.length || discoverMissingFiles.length || discoverUnindexedFiles.length) {
    report.failures.push('Manifest/file mismatch detected');
  }
  if (thinManaged.length || thinDiscover.length) {
    report.failures.push('Under-populated pages detected');
  }

  const outDir = path.join(root, 'artifacts/content-coverage');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'content-usage-audit.json'), JSON.stringify(report, null, 2) + '\n');

  console.log(JSON.stringify(report, null, 2));
  console.log(`Audit written: ${rel(path.join(outDir, 'content-usage-audit.json'))}`);

  if (report.failures.length) {
    fail(`Content usage audit failed: ${report.failures.join('; ')}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
