import { cache } from 'react';

import { getLegacyPageOverride, type LegacyPageOverride } from '@/lib/legacy-cms-content';
import { getManagedLegacyDocument } from '@/lib/managed-legacy-content';
import { getLocaleRoutes, routeTitle } from '@/lib/route-index';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import type { LegacyDocument, Locale } from '@/lib/types';

function normalizeLegacyImage(src?: string) {
  if (!src) return undefined;
  if (src.startsWith('/assets/')) return src.replace('/assets/', '/legacy-assets/');
  if (src.startsWith('assets/')) return `/legacy-assets/${src.slice('assets/'.length)}`;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return src;
  return `/${src}`;
}

function fallbackCopy(locale: Locale) {
  return getManagedPageCopyWithFallback(locale, 'legacySyntheticDocument', {
    overview: 'Overview',
    nextSteps: 'Next Steps',
    fallbackDescription:
      'Immigration guidance for Brazil focused on requirements, documentation quality, and timeline planning.',
    paragraphOne:
      'This page outlines key checkpoints for this route, including eligibility, process structure, and practical considerations.',
    paragraphTwo:
      'Review eligibility, prepare supporting documents, and validate your strategy with a professional consultation.',
  });
}

async function buildSyntheticDocument(locale: Locale, slug: string[]): Promise<LegacyDocument | null> {
  const joined = slug.join('/');
  const routes = await getLocaleRoutes(locale);
  const entry = routes.find((route) => route.slug === joined);
  if (!entry) return null;

  const copy = fallbackCopy(locale);
  const title = routeTitle(entry);
  const description = entry.description?.trim() || copy.fallbackDescription;
  const bullets = joined
    .split('/')
    .filter(Boolean)
    .slice(-6)
    .map((segment) => segment.replace(/-/g, ' '))
    .filter(Boolean);

  return {
    sourcePath: entry.sourcePath || joined,
    title,
    description,
    heading: title,
    heroImage: undefined,
    heroImageAlt: title,
    sections: [
      {
        title: copy.overview,
        paragraphs: [description, copy.paragraphOne],
      },
      {
        title: copy.nextSteps,
        paragraphs: [copy.paragraphTwo],
      },
    ],
    bullets: bullets.length ? bullets : [title, description],
  };
}

function slugToTitle(slug: string) {
  const parts = slug
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/^(about|blog|contact|faq)-/, '')
        .replace(/^immigrate-to-/, '')
        .replace(/-index$/, '')
        .replace(/-/g, ' ')
        .trim(),
    )
    .filter(Boolean);

  const last = parts[parts.length - 1] || 'Page';
  return last.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeOverrideImage(src?: string) {
  if (!src?.trim()) return undefined;
  return normalizeLegacyImage(src.trim());
}

function applyLegacyOverride(
  locale: Locale,
  slug: string[],
  base: LegacyDocument | null,
  override: LegacyPageOverride | null,
): LegacyDocument | null {
  if (!base && !override) return null;

  const joinedSlug = slug.join('/');
  const fallback = fallbackCopy(locale);
  const fallbackTitle = slugToTitle(joinedSlug);
  const title = override?.title?.trim() || base?.title || fallbackTitle;
  const description = override?.description?.trim() || base?.description || fallback.fallbackDescription;
  const heading = override?.heading?.trim() || base?.heading || title;
  const sourcePath = override?.sourcePath?.trim() || base?.sourcePath || joinedSlug || 'cms-override';
  const heroImage = normalizeOverrideImage(override?.heroImage) || base?.heroImage;
  const heroImageAlt = override?.heroImageAlt?.trim() || base?.heroImageAlt || heading;
  const sections =
    override?.sections?.filter((section) => section.title?.trim() && section.paragraphs?.length)?.map((section) => ({
      title: section.title.trim(),
      paragraphs: section.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean),
    })) || base?.sections || [];
  const bullets = override?.bullets?.map((item) => item.trim()).filter(Boolean) || base?.bullets || [];

  const resolvedSections = sections.length
    ? sections
    : [
        {
          title: fallback.overview,
          paragraphs: [description, fallback.paragraphOne],
        },
        {
          title: fallback.nextSteps,
          paragraphs: [fallback.paragraphTwo],
        },
      ];

  const resolvedBullets = bullets.length ? bullets : [title, description];

  return {
    sourcePath,
    title,
    description,
    heading,
    heroImage,
    heroImageAlt,
    sections: resolvedSections,
    bullets: resolvedBullets,
  };
}

export const getLegacyDocument = cache(async (locale: Locale, slug: string[]): Promise<LegacyDocument | null> => {
  const override = getLegacyPageOverride(locale, slug.join('/'));
  const managed = await getManagedLegacyDocument(locale, slug);
  if (managed) {
    return applyLegacyOverride(locale, slug, managed, override);
  }

  const synthetic = await buildSyntheticDocument(locale, slug);
  return applyLegacyOverride(locale, slug, synthetic, override);
});
