import enLegacyOverrides from '@/content/cms/legacy-overrides/en.json';
import esLegacyOverrides from '@/content/cms/legacy-overrides/es.json';
import frLegacyOverrides from '@/content/cms/legacy-overrides/fr.json';
import ptLegacyOverrides from '@/content/cms/legacy-overrides/pt.json';
import type { Locale } from '@/lib/types';

type LegacyUiLink = {
  href: string;
  label: string;
};

export type LegacyUiCopy = {
  keyPointsTitle: string;
  pathTitle: string;
  relatedPagesTitle: string;
  exploreTitle: string;
  sourceLabel: string;
  exploreLinks: LegacyUiLink[];
};

export type LegacyPageOverride = {
  slug: string;
  title?: string;
  description?: string;
  heading?: string;
  sourcePath?: string;
  heroImage?: string;
  heroImageAlt?: string;
  sections?: Array<{
    title: string;
    paragraphs: string[];
  }>;
  bullets?: string[];
};

type LegacyOverridesFile = {
  locale: Locale;
  ui: LegacyUiCopy;
  pages: LegacyPageOverride[];
};

const overridesByLocale: Record<Locale, LegacyOverridesFile> = {
  en: enLegacyOverrides as LegacyOverridesFile,
  es: esLegacyOverrides as LegacyOverridesFile,
  pt: ptLegacyOverrides as LegacyOverridesFile,
  fr: frLegacyOverrides as LegacyOverridesFile,
};

function normalizeSlug(input: string) {
  const cleaned = input.trim().replace(/^\/+|\/+$/g, '');
  const segments = cleaned.split('/').filter(Boolean);
  if (!segments.length) return '';
  if (['en', 'es', 'pt', 'fr'].includes(segments[0])) {
    return segments.slice(1).join('/');
  }
  return segments.join('/');
}

export function getLegacyCmsCopy(locale: Locale) {
  return overridesByLocale[locale];
}

export function getLegacyPageOverride(locale: Locale, slug: string): LegacyPageOverride | null {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;

  const file = overridesByLocale[locale];
  return file.pages.find((page) => normalizeSlug(page.slug) === normalized) || null;
}
