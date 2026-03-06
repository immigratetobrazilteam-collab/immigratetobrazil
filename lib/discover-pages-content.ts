import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

import { deepMergeWithFallback, getMasterPath } from '@/lib/master-cms-content';
import type { Locale } from '@/lib/types';

export type DiscoverContentBlock =
  | {
      type: 'subheading';
      text: string;
    }
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'list';
      items: string[];
    }
  | {
      type: 'note';
      tone: 'tip' | 'highlight' | 'compliance' | 'note';
      text: string;
    };

export type DiscoverSection = {
  id: string;
  heading: string;
  summary: string;
  highlights: string[];
  blocks: DiscoverContentBlock[];
};

export type DiscoverFaqItem = {
  question: string;
  answer: string;
};

export type DiscoverPage = {
  slug: string;
  pathname: string;
  title: string;
  heroIntro: string;
  heroImage?: string;
  heroImageAlt?: string;
  sourcePath: string;
  sourceUpdatedLabel: string;
  tableOfContents: Array<{ id: string; label: string }>;
  sections: DiscoverSection[];
  faq: DiscoverFaqItem[];
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  taxonomy: {
    type: string;
    depth: number;
    segments: string[];
  };
  owner: string;
  status: 'draft' | 'published';
  lastReviewedAt: string;
  reviewEveryDays: number;
};

export type DiscoverManifestItem = {
  slug: string;
  pathname: string;
  title: string;
  heroIntro: string;
  sourcePath: string;
  taxonomy: {
    type: string;
    depth: number;
    segments: string[];
  };
  sectionCount: number;
  faqCount: number;
};

export type DiscoverManifest = {
  locale: string;
  generatedAt: string;
  pageCount: number;
  statsByType: Record<string, number>;
  pages: DiscoverManifestItem[];
};

export type DiscoverHubCopy = {
  locale: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  countLabel: string;
  browseStatesLabel: string;
  browseRegionsLabel: string;
  consultationLabel: string;
};

export type DiscoverHubIndex = {
  locale: string;
  generatedAt: string;
  pageCount: number;
  statePages: DiscoverManifestItem[];
  citySamples: DiscoverManifestItem[];
};

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'cms', 'discover-pages');

const fallbackHubCopy: DiscoverHubCopy = {
  locale: 'en',
  eyebrow: 'Discover library',
  title: 'Discover Brazil by state, region, and city',
  subtitle: 'Managed discover pages migrated from legacy HTML with no partial dependencies.',
  countLabel: '{{count}} discover pages',
  browseStatesLabel: 'Browse states',
  browseRegionsLabel: 'Browse regions',
  consultationLabel: 'Book a consultation',
};

function normalizeSlugInput(value: string | string[]) {
  // Normalize route params into filesystem-safe slugs.
  const raw = Array.isArray(value) ? value.join('/') : value;

  const cleaned = raw
    .split('/')
    .map((segment) => segment.trim())
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

export function discoverPathFromSlug(slug: string) {
  return slug ? `/discover/${slug}` : '/discover';
}

export async function getDiscoverPage(locale: Locale, slugInput: string | string[]): Promise<DiscoverPage | null> {
  const slug = normalizeSlugInput(slugInput);

  // The discover root route is custom and not sourced from legacy page content.
  if (!slug) {
    return null;
  }

  const englishOverride = getMasterPath(['discoverOverrides', 'pagesByLocale', 'en', slug]);
  const localeOverride = getMasterPath(['discoverOverrides', 'pagesByLocale', locale, slug]);

  // Locale-first lookup.
  const localPath = filePathForSlug(locale, slug);
  const local = await loadJsonIfExists<DiscoverPage>(localPath);
  if (local) {
    return deepMergeWithFallback(deepMergeWithFallback(local, englishOverride), localeOverride);
  }

  // EN fallback keeps discover pages available even when locale file is missing.
  const englishPath = filePathForSlug('en', slug);
  const english = await loadJsonIfExists<DiscoverPage>(englishPath);
  if (english) {
    return deepMergeWithFallback(deepMergeWithFallback(english, englishOverride), localeOverride);
  }

  const overrideOnly = deepMergeWithFallback(
    deepMergeWithFallback({} as Partial<DiscoverPage>, englishOverride),
    localeOverride,
  );

  if (Object.keys(overrideOnly as Record<string, unknown>).length > 0) {
    return overrideOnly as DiscoverPage;
  }

  return null;
}

export async function getDiscoverManifest(_locale: Locale): Promise<DiscoverManifest> {
  void _locale;
  // EN manifest is canonical for static param generation.
  const englishManifestPath = path.join(CONTENT_ROOT, 'en', '_manifest.json');
  const english = await loadJsonIfExists<DiscoverManifest>(englishManifestPath);
  const masterManifest = getMasterPath(['discoverOverrides', 'manifest']);

  if (english) {
    return deepMergeWithFallback(english, masterManifest);
  }

  const fallback: DiscoverManifest = {
      locale: 'en',
      generatedAt: new Date(0).toISOString(),
      pageCount: 0,
      statsByType: {},
      pages: [],
  };

  return deepMergeWithFallback(fallback, masterManifest);
}

export async function getDiscoverLabels(locale: Locale): Promise<Record<string, string>> {
  const localPath = path.join(CONTENT_ROOT, locale, '_labels.json');
  const local = await loadJsonIfExists<Record<string, string>>(localPath);
  const englishMasterLabels = getMasterPath(['discoverOverrides', 'labelsByLocale', 'en']);
  const localeMasterLabels = getMasterPath(['discoverOverrides', 'labelsByLocale', locale]);
  const englishPath = path.join(CONTENT_ROOT, 'en', '_labels.json');
  const english = (await loadJsonIfExists<Record<string, string>>(englishPath)) || {};
  const base = local || english;

  return deepMergeWithFallback(
    deepMergeWithFallback(base, englishMasterLabels),
    localeMasterLabels,
  );
}

export async function getDiscoverHubIndex(locale: Locale): Promise<DiscoverHubIndex> {
  const localPath = path.join(CONTENT_ROOT, locale, '_hub-index.json');
  const local = await loadJsonIfExists<DiscoverHubIndex>(localPath);
  const englishPath = path.join(CONTENT_ROOT, 'en', '_hub-index.json');
  const english = await loadJsonIfExists<DiscoverHubIndex>(englishPath);
  const fallback: DiscoverHubIndex = {
    locale,
    generatedAt: new Date(0).toISOString(),
    pageCount: 0,
    statePages: [],
    citySamples: [],
  };

  const base = local || english || fallback;
  const englishMasterIndex = getMasterPath(['discoverOverrides', 'hubIndexByLocale', 'en']);
  const localeMasterIndex = getMasterPath(['discoverOverrides', 'hubIndexByLocale', locale]);

  return deepMergeWithFallback(
    deepMergeWithFallback(base, englishMasterIndex),
    localeMasterIndex,
  );
}

export async function getDiscoverHubCopy(locale: Locale): Promise<DiscoverHubCopy> {
  const localPath = path.join(CONTENT_ROOT, locale, '_hub.json');
  const local = await loadJsonIfExists<Partial<DiscoverHubCopy>>(localPath);
  const englishMasterHub = getMasterPath(['discoverOverrides', 'hubByLocale', 'en']);
  const localeMasterHub = getMasterPath(['discoverOverrides', 'hubByLocale', locale]);
  const applyMasterOverrides = (base: DiscoverHubCopy): DiscoverHubCopy =>
    deepMergeWithFallback(
      deepMergeWithFallback(base, englishMasterHub),
      localeMasterHub,
    );

  if (local) {
    // Merge locale hub copy over safe fallback defaults.
    const merged: DiscoverHubCopy = {
      locale: local.locale || locale,
      eyebrow: local.eyebrow || fallbackHubCopy.eyebrow,
      title: local.title || fallbackHubCopy.title,
      subtitle: local.subtitle || fallbackHubCopy.subtitle,
      countLabel: local.countLabel || fallbackHubCopy.countLabel,
      browseStatesLabel: local.browseStatesLabel || fallbackHubCopy.browseStatesLabel,
      browseRegionsLabel: local.browseRegionsLabel || fallbackHubCopy.browseRegionsLabel,
      consultationLabel: local.consultationLabel || fallbackHubCopy.consultationLabel,
    };
    return applyMasterOverrides(merged);
  }

  const englishPath = path.join(CONTENT_ROOT, 'en', '_hub.json');
  const english = await loadJsonIfExists<Partial<DiscoverHubCopy>>(englishPath);

  if (english) {
    // EN hub fallback if locale-specific hub copy is absent.
    const merged: DiscoverHubCopy = {
      locale: english.locale || 'en',
      eyebrow: english.eyebrow || fallbackHubCopy.eyebrow,
      title: english.title || fallbackHubCopy.title,
      subtitle: english.subtitle || fallbackHubCopy.subtitle,
      countLabel: english.countLabel || fallbackHubCopy.countLabel,
      browseStatesLabel: english.browseStatesLabel || fallbackHubCopy.browseStatesLabel,
      browseRegionsLabel: english.browseRegionsLabel || fallbackHubCopy.browseRegionsLabel,
      consultationLabel: english.consultationLabel || fallbackHubCopy.consultationLabel,
    };
    return applyMasterOverrides(merged);
  }

  return applyMasterOverrides(fallbackHubCopy);
}
