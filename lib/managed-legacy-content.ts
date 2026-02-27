import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

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

export const getManagedLegacyManifest = cache(async (): Promise<ManagedLegacyManifest | null> => {
  const manifestPath = path.join(CONTENT_ROOT, 'en', '_manifest.json');
  return loadJsonIfExists<ManagedLegacyManifest>(manifestPath);
});

export async function getManagedLegacyDocument(locale: Locale, slugInput: string | string[]): Promise<LegacyDocument | null> {
  const normalizedSlug = normalizeSlugInput(slugInput);
  if (!normalizedSlug) return null;

  const manifest = await getManagedLegacyManifest();
  const canonicalSlug = manifest?.aliases?.[normalizedSlug] || normalizedSlug;

  const localPath = filePathForSlug(locale, canonicalSlug);
  const local = await loadJsonIfExists<ManagedLegacyPage>(localPath);
  if (local) {
    return {
      sourcePath: local.sourcePath,
      title: local.title,
      description: local.description,
      heading: local.heading,
      heroImage: local.heroImage,
      heroImageAlt: local.heroImageAlt,
      sections: local.sections,
      bullets: local.bullets,
    };
  }

  const englishPath = filePathForSlug('en', canonicalSlug);
  const english = await loadJsonIfExists<ManagedLegacyPage>(englishPath);
  if (!english) return null;

  return {
    sourcePath: english.sourcePath,
    title: english.title,
    description: english.description,
    heading: english.heading,
    heroImage: english.heroImage,
    heroImageAlt: english.heroImageAlt,
    sections: english.sections,
    bullets: english.bullets,
  };
}
