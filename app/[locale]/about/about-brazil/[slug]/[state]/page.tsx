import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleSchema } from '@/components/article-schema';
import { AboutLegacyRedesign } from '@/components/about-legacy-redesign';
import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { CtaCard } from '@/components/cta-card';
import { getStateName } from '@/content/curated/states';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRouteLinksByPrefix } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import type { Locale } from '@/lib/types';

export const revalidate = 3600;

type CategorySlug = 'festivals' | 'food';

function segmentLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isCategorySlug(value: string): value is CategorySlug {
  return value === 'festivals' || value === 'food';
}

function routeCopy(locale: Locale) {
  return getManagedPageCopyWithFallback(locale, 'aboutBrazilStatePage', {
    hubLabel: 'Back to category',
    fallbackMetaDescription: 'Regional Brazil relocation guidance.',
    fallbackMetaTitleTemplate: '{{state}} | {{brand}}',
    schemaSectionLabelPrefix: 'About Brazil',
    keywordFallback: 'Brazil relocation',
    categoryLabel: {
      festivals: 'Festivals',
      food: 'Food',
    },
  });
}

function stateTitle(locale: Locale, stateSlug: string) {
  return getStateName(stateSlug, locale) || segmentLabel(stateSlug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; state: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug, state } = await params;
  const locale = resolveLocale(rawLocale);

  if (!isCategorySlug(slug)) {
    const localized = routeCopy(locale);
    return createMetadata({
      locale,
      pathname: `/${locale}/about/about-brazil/${slug}/${state}`,
      title: localized.fallbackMetaTitleTemplate
        .replace('{{state}}', segmentLabel(state))
        .replace('{{brand}}', copy[locale].brand),
      description: localized.fallbackMetaDescription,
    });
  }

  const document = await getLegacyDocument(locale, ['about', 'about-brazil', slug, state]);
  const title = document?.title || `${stateTitle(locale, state)} ${routeCopy(locale).categoryLabel[slug]}`;
  const localized = routeCopy(locale);
  const description = document?.description || localized.fallbackMetaDescription;

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-brazil/${slug}/${state}`,
    title: `${title} | ${copy[locale].brand}`,
    description,
  });
}

export default async function AboutBrazilCategoryStatePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; state: string }>;
}) {
  const { locale: rawLocale, slug, state } = await params;
  const locale = resolveLocale(rawLocale);

  if (!isCategorySlug(slug)) {
    notFound();
  }

  const path = `about/about-brazil/${slug}/${state}`;
  const document = await getLegacyDocument(locale, ['about', 'about-brazil', slug, state]);

  if (!document) {
    notFound();
  }

  const localized = routeCopy(locale);
  const relatedLinks = (await getRouteLinksByPrefix(locale, `about/about-brazil/${slug}`, { includePrefixEntry: false, limit: 120 }))
    .filter((link) => link.slug !== path)
    .slice(0, 24);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: copy[locale].nav.home, href: `/${locale}` },
          { name: localized.categoryLabel[slug], href: `/${locale}/about/about-brazil/${slug}` },
          { name: document.heading, href: `/${locale}/about/about-brazil/${slug}/${state}` },
        ]}
      />
      <ArticleSchema
        locale={locale}
        pathname={`/${locale}/about/about-brazil/${slug}/${state}`}
        headline={document.heading}
        description={document.description}
        section={`${localized.schemaSectionLabelPrefix} ${localized.categoryLabel[slug]}`}
        keywords={[state.replace(/-/g, ' '), slug, localized.keywordFallback]}
      />
      <AboutLegacyRedesign
        locale={locale}
        document={document}
        eyebrow={`${localized.categoryLabel[slug]} / ${stateTitle(locale, state)}`}
        hubHref={`/${locale}/about/about-brazil/${slug}`}
        hubLabel={localized.hubLabel}
        relatedLinks={relatedLinks}
      />
      <CtaCard locale={locale} />
    </>
  );
}
