import { mkdir, cp, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const sourceDir = path.join(root, 'content', 'cms');
const outputRoot = path.join(root, 'artifacts', 'cms-backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = path.join(outputRoot, timestamp);

async function listJsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await listJsonFiles(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function hashFile(filePath) {
  const bytes = await readFile(filePath);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await cp(sourceDir, path.join(outputDir, 'cms'), { recursive: true });

  const files = await listJsonFiles(sourceDir);
  const manifestFiles = [];

  for (const filePath of files) {
    const rel = path.relative(root, filePath);
    const fileStat = await stat(filePath);
    manifestFiles.push({
      path: rel,
      size: fileStat.size,
      sha256: await hashFile(filePath),
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: path.relative(root, sourceDir),
    fileCount: manifestFiles.length,
    files: manifestFiles,
  };

  await writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`CMS backup exported to ${path.relative(root, outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
