import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

import { deepMergeWithFallback, getMasterPath } from '@/lib/master-cms-content';
import type { LegacyDocument, Locale } from '@/lib/types';

type ManagedLegacyPage = LegacyDocument & {
  slug: string;
  pathname: string;
  owner?: string;
  status?: 'draft' | 'published';
  lastReviewedAt?: string;
};

type ManagedLegacyManifest = {
  locale: string;
  generatedAt: string;
  pageCount: number;
  countsByPrefix: Record<string, number>;
  aliases: Record<string, string>;
  pages: Array<{
    slug: string;
    pathname: string;
    sourcePath: string;
    title: string;
  }>;
};

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'cms', 'managed-legacy');

function normalizeSlugInput(value: string | string[]) {
  // Defensive normalization so route params cannot escape content root.
  const raw = Array.isArray(value) ? value.join('/') : value;
  const cleaned = raw
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('/');

  if (!cleaned) return '';
  if (cleaned.includes('..')) return '';
  if (!/^[-a-z0-9/]+$/u.test(cleaned)) return '';
  return cleaned;
}

function filePathForSlug(locale: Locale, slug: string) {
  const relative = slug ? `${slug}.json` : '__root__.json';
  return path.join(CONTENT_ROOT, locale, relative);
}

const readJson = cache(async (absolutePath: string) => {
  const raw = await readFile(absolutePath, 'utf8');
  return JSON.parse(raw) as unknown;
});

async function loadJsonIfExists<T>(absolutePath: string): Promise<T | null> {
  try {
    return (await readJson(absolutePath)) as T;
  } catch {
    return null;
  }
}

function mapManagedPageToLegacyDocument(page: Partial<ManagedLegacyPage>): LegacyDocument {
  return {
    sourcePath: page.sourcePath || '',
    title: page.title || '',
    description: page.description || '',
    heading: page.heading || page.title || '',
    heroImage: page.heroImage,
    heroImageAlt: page.heroImageAlt,
    sections: Array.isArray(page.sections) ? page.sections : [],
    bullets: Array.isArray(page.bullets) ? page.bullets : [],
  };
}

export const getManagedLegacyManifest = cache(async (): Promise<ManagedLegacyManifest | null> => {
  // EN manifest is canonical for aliases/slugs.
  const manifestPath = path.join(CONTENT_ROOT, 'en', '_manifest.json');
  const fileManifest = await loadJsonIfExists<ManagedLegacyManifest>(manifestPath);
  const masterManifest = getMasterPath(['managedLegacyOverrides', 'manifest']);

  if (fileManifest) {
    return deepMergeWithFallback(fileManifest, masterManifest);
  }

  return (masterManifest as ManagedLegacyManifest | null) || null;
});

export async function getManagedLegacyDocument(locale: Locale, slugInput: string | string[]): Promise<LegacyDocument | null> {
  const normalizedSlug = normalizeSlugInput(slugInput);
  if (!normalizedSlug) return null;

  const manifest = await getManagedLegacyManifest();
  // Old legacy slugs can map to new canonical slugs through manifest aliases.
  const canonicalSlug = manifest?.aliases?.[normalizedSlug] || normalizedSlug;
  const englishOverride = getMasterPath(['managedLegacyOverrides', 'pagesByLocale', 'en', canonicalSlug]);
  const localeOverride = getMasterPath(['managedLegacyOverrides', 'pagesByLocale', locale, canonicalSlug]);

  // First try locale-specific file.
  const localPath = filePathForSlug(locale, canonicalSlug);
  const local = await loadJsonIfExists<ManagedLegacyPage>(localPath);
  if (local) {
    const merged = deepMergeWithFallback(deepMergeWithFallback(local, englishOverride), localeOverride);
    return mapManagedPageToLegacyDocument(merged as Partial<ManagedLegacyPage>);
  }

  // Fallback to EN when locale copy does not exist.
  const englishPath = filePathForSlug('en', canonicalSlug);
  const english = await loadJsonIfExists<ManagedLegacyPage>(englishPath);
  if (english) {
    const merged = deepMergeWithFallback(deepMergeWithFallback(english, englishOverride), localeOverride);
    return mapManagedPageToLegacyDocument(merged as Partial<ManagedLegacyPage>);
  }

  const overrideOnly = deepMergeWithFallback(
    deepMergeWithFallback({} as Partial<ManagedLegacyPage>, englishOverride),
    localeOverride,
  );
  if (Object.keys(overrideOnly as Record<string, unknown>).length > 0) {
    return mapManagedPageToLegacyDocument(overrideOnly as Partial<ManagedLegacyPage>);
  }

  return null;
}
