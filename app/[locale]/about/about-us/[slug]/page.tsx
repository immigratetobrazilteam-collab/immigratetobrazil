import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AboutUsSignaturePage } from '@/components/about-us-signature-page';
import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import type { Locale } from '@/lib/types';

export const revalidate = 3600;

function segmentLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function routeCopy(locale: Locale) {
  return getManagedPageCopyWithFallback(locale, 'aboutUsDetailPage', {
    eyebrowPrefix: 'About Us',
    hubLabel: 'About Us hub',
    fallbackMetaDescription: 'Immigration advisory standards, expertise, and client outcome references.',
    fallbackMetaTitleTemplate: '{{label}} | {{brand}}',
  });
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const document = await getLegacyDocument(locale, ['about', 'about-us', slug]);
  const label = segmentLabel(slug);

  if (!document) {
    const localized = routeCopy(locale);
    return createMetadata({
      locale,
      pathname: `/${locale}/about/about-us/${slug}`,
      title: localized.fallbackMetaTitleTemplate
        .replace('{{label}}', label)
        .replace('{{brand}}', copy[locale].brand),
      description: localized.fallbackMetaDescription,
    });
  }

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-us/${slug}`,
    title: `${document.title} | ${copy[locale].brand}`,
    description: document.description,
  });
}

export default async function AboutUsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const path = `about/about-us/${slug}`;
  const document = await getLegacyDocument(locale, ['about', 'about-us', slug]);

  if (!document) {
    notFound();
  }

  const localized = routeCopy(locale);
  const relatedLinks = (await getRelatedRouteLinks(locale, path, 24)).filter((link) => link.slug.startsWith('about/about-us/'));

  return (
    <>
      <AboutUsSignaturePage
        locale={locale}
        slug={slug}
        document={document}
        eyebrow={`${localized.eyebrowPrefix} / ${segmentLabel(slug)}`}
        hubHref={`/${locale}/about/about-us`}
        hubLabel={localized.hubLabel}
        relatedLinks={relatedLinks}
      />
      <CtaCard locale={locale} />
    </>
  );
}
