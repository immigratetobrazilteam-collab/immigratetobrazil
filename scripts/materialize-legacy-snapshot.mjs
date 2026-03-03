#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const legacyRef = process.env.LEGACY_SOURCE_REF || 'HEAD~1';
const outDir = path.resolve(root, process.env.LEGACY_SNAPSHOT_DIR || '.legacy-snapshot');

const legacyFolders = [
  'about',
  'accessibility',
  'blog',
  'consultation',
  'contact',
  'discover',
  'es',
  'faq',
  'home',
  'policies',
  'pt',
  'resources-guides-brazil',
  'services',
  'visa-consultation',
];

function gitPathExists(ref, targetPath) {
  const check = spawnSync('git', ['cat-file', '-e', `${ref}:${targetPath}`], {
    cwd: root,
    encoding: 'utf8',
  });
  return check.status === 0;
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const existingFolders = legacyFolders.filter((targetPath) => gitPathExists(legacyRef, targetPath));
  if (!existingFolders.length) {
    throw new Error(`No configured legacy folders exist in ref "${legacyRef}".`);
  }

  const archive = spawnSync('git', ['archive', '--format=tar', legacyRef, ...existingFolders], {
    cwd: root,
    encoding: null,
    maxBuffer: 1024 * 1024 * 1024,
  });

  if (archive.status !== 0) {
    const stderr = archive.stderr ? archive.stderr.toString('utf8') : '';
    throw new Error(`git archive failed for ref "${legacyRef}": ${stderr || 'unknown error'}`);
  }

  const untar = spawnSync('tar', ['-xf', '-', '-C', outDir], {
    cwd: root,
    input: archive.stdout,
    encoding: null,
    maxBuffer: 1024 * 1024 * 1024,
  });

  if (untar.status !== 0) {
    const stderr = untar.stderr ? untar.stderr.toString('utf8') : '';
    throw new Error(`tar extract failed: ${stderr || 'unknown error'}`);
  }

  let htmlCount = 0;
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.html')) htmlCount += 1;
    }
  }

  await walk(outDir);

  console.log(`Legacy snapshot materialized.`);
  console.log(`- Ref: ${legacyRef}`);
  console.log(`- Directory: ${outDir}`);
  console.log(`- Included folders: ${existingFolders.join(', ')}`);
  console.log(`- HTML files: ${htmlCount}`);
}

main().catch((error) => {
  console.error('Failed to materialize legacy snapshot.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
