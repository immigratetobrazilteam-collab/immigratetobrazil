#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_PATH = path.join(ROOT, 'scripts/translation_cache.json');
const DEFAULT_SOURCE_LOCALE = 'en';
const DEFAULT_TARGET_LOCALES = ['es', 'pt', 'fr'];
const DEFAULT_SCOPE = 'managedPages';
const DEFAULT_MODE = 'copy';
const DEFAULT_FILE_PREFIX = 'content/cms/site-copy';

function parseArgs(argv) {
  const options = {
    source: DEFAULT_SOURCE_LOCALE,
    targets: [...DEFAULT_TARGET_LOCALES],
    mode: DEFAULT_MODE,
    scope: DEFAULT_SCOPE,
    filePrefix: DEFAULT_FILE_PREFIX,
    dryRun: false,
    check: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--check') {
      options.check = true;
      continue;
    }

    if (arg.startsWith('--source=')) {
      options.source = arg.slice('--source='.length).trim();
      continue;
    }

    if (arg.startsWith('--targets=')) {
      const raw = arg.slice('--targets='.length);
      options.targets = raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith('--mode=')) {
      options.mode = arg.slice('--mode='.length).trim();
      continue;
    }

    if (arg.startsWith('--scope=')) {
      options.scope = arg.slice('--scope='.length).trim();
      continue;
    }

    if (arg.startsWith('--file-prefix=')) {
      options.filePrefix = arg.slice('--file-prefix='.length).trim();
      continue;
    }
  }

  return options;
}

function printUsage() {
  console.log(`Usage:
  node scripts/sync-site-copy-locales.mjs [options]

Options:
  --source=en                 Source locale file (default: en)
  --targets=es,pt,fr          Target locales to write
  --mode=copy|translate       copy = clone English strings, translate = use LibreTranslate
  --scope=managedPages|all    managedPages only, or all top-level site-copy fields except locale
  --file-prefix=content/cms/site-copy
  --dry-run                   Print summary without writing files
  --check                     Exit non-zero if target files would change

Environment variables for translation mode:
  LIBRETRANSLATE_URL          Default: https://libretranslate.com
  LIBRETRANSLATE_API_KEY      Optional
`);
}

function assertValidOptions(options) {
  if (!options.source) {
    throw new Error('Missing source locale.');
  }

  if (!Array.isArray(options.targets) || options.targets.length === 0) {
    throw new Error('No target locales provided.');
  }

  if (!['copy', 'translate'].includes(options.mode)) {
    throw new Error(`Unsupported mode '${options.mode}'. Use copy or translate.`);
  }

  if (!['managedPages', 'all'].includes(options.scope)) {
    throw new Error(`Unsupported scope '${options.scope}'. Use managedPages or all.`);
  }
}

function resolveLocaleFile(filePrefix, locale) {
  return path.join(ROOT, `${filePrefix}/${locale}.json`);
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readCache() {
  try {
    const raw = await readFile(CACHE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function keyShouldSkipTranslation(key) {
  return (
    key === 'locale' ||
    key === 'slug' ||
    key === 'id' ||
    key === 'href' ||
    key === 'hrefPath' ||
    key === 'prefix' ||
    key.endsWith('Path')
  );
}

function valueShouldSkipTranslation(value) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return true;
  return false;
}

function tokeniseTemplates(value) {
  const tokens = [];
  const text = value.replace(/{{\s*[^}]+\s*}}/g, (match) => {
    const key = `[[TOKEN_${tokens.length}]]`;
    tokens.push({ key, value: match });
    return key;
  });
  return { text, tokens };
}

function restoreTemplates(value, tokens) {
  let out = value;
  for (const token of tokens) {
    out = out.replaceAll(token.key, token.value);
  }
  return out;
}

async function translateString(text, sourceLocale, targetLocale, cache) {
  const cacheKey = `site-copy:${sourceLocale}:${targetLocale}:${text}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const endpoint = `${(process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com').replace(/\/+$/, '')}/translate`;
  const payload = {
    q: text,
    source: sourceLocale,
    target: targetLocale,
    format: 'text',
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    payload.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate ${response.status}`);
  }

  const data = await response.json();
  const translated = typeof data.translatedText === 'string' && data.translatedText.trim().length > 0 ? data.translatedText : text;
  cache[cacheKey] = translated;
  return translated;
}

async function cloneOrTranslate(value, context) {
  const { mode, sourceLocale, targetLocale, cache, stats } = context;

  if (Array.isArray(value)) {
    const out = [];
    for (let idx = 0; idx < value.length; idx += 1) {
      out.push(await cloneOrTranslate(value[idx], { ...context, keyPath: [...context.keyPath, `[${idx}]`] }));
    }
    return out;
  }

  if (isObject(value)) {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = await cloneOrTranslate(child, { ...context, keyPath: [...context.keyPath, key], currentKey: key });
    }
    return out;
  }

  if (typeof value !== 'string') {
    return value;
  }

  stats.totalStrings += 1;
  if (mode !== 'translate') {
    return value;
  }

  if (keyShouldSkipTranslation(context.currentKey || '') || valueShouldSkipTranslation(value)) {
    stats.skippedStrings += 1;
    return value;
  }

  const { text, tokens } = tokeniseTemplates(value);

  try {
    const translated = await translateString(text, sourceLocale, targetLocale, cache);
    stats.translatedStrings += 1;
    return restoreTemplates(translated, tokens);
  } catch {
    stats.failedStrings += 1;
    return value;
  }
}

function buildSourceSlice(sourceJson, scope) {
  if (scope === 'managedPages') {
    return { managedPages: sourceJson.managedPages || {} };
  }

  const out = {};
  for (const [key, value] of Object.entries(sourceJson)) {
    if (key === 'locale') continue;
    out[key] = value;
  }
  return out;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  assertValidOptions(options);

  const sourceFile = resolveLocaleFile(options.filePrefix, options.source);
  const sourceJson = await readJson(sourceFile);
  const sourceSlice = buildSourceSlice(sourceJson, options.scope);
  const cache = await readCache();

  const summary = [];
  const outOfSyncLocales = [];

  for (const targetLocale of options.targets) {
    if (targetLocale === options.source) {
      continue;
    }

    const targetFile = resolveLocaleFile(options.filePrefix, targetLocale);
    const targetJson = await readJson(targetFile);
    const stats = {
      locale: targetLocale,
      totalStrings: 0,
      translatedStrings: 0,
      skippedStrings: 0,
      failedStrings: 0,
    };

    const translatedSlice = await cloneOrTranslate(sourceSlice, {
      mode: options.mode,
      sourceLocale: options.source,
      targetLocale,
      cache,
      stats,
      keyPath: [],
      currentKey: '',
    });

    const nextJson = { ...targetJson, ...translatedSlice, locale: targetLocale };
    const changed = JSON.stringify(targetJson) !== JSON.stringify(nextJson);

    if (options.check && changed) {
      outOfSyncLocales.push(targetLocale);
    }

    if (!options.dryRun && !options.check) {
      await writeFile(targetFile, `${JSON.stringify(nextJson, null, 2)}\n`, 'utf8');
    }

    summary.push(stats);
  }

  if (options.mode === 'translate' && !options.dryRun) {
    await writeCache(cache);
  }

  for (const item of summary) {
    console.log(
      `[${item.locale}] strings=${item.totalStrings} translated=${item.translatedStrings} skipped=${item.skippedStrings} failed=${item.failedStrings}`,
    );
  }

  if (options.dryRun) {
    console.log('Dry run complete. No files were written.');
  }

  if (options.check) {
    if (outOfSyncLocales.length) {
      console.error(`Locale sync drift detected: ${outOfSyncLocales.join(', ')}`);
      process.exit(1);
    }
    console.log('Locale sync check passed. No drift detected.');
  }
}

main().catch((error) => {
  console.error('sync-site-copy-locales failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
