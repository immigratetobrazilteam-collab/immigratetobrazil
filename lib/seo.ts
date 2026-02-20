import type { Metadata } from 'next';

import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';
const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
};

function absolute(pathname: string) {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(clean, BASE_URL).toString();
}

export function createMetadata(options: {
  locale: Locale;
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const { locale, title, description, pathname } = options;

  const normalized = pathname.startsWith(`/${locale}`) ? pathname : `/${locale}${pathname}`;
  const pathWithoutLocale = normalized.replace(/^\/(en|es|pt|fr)/, '') || '/';

  const alternates = {
    en: absolute(`/en${pathWithoutLocale}`),
    es: absolute(`/es${pathWithoutLocale}`),
    pt: absolute(`/pt${pathWithoutLocale}`),
    fr: absolute(`/fr${pathWithoutLocale}`),
  };

  const openGraphLocale = OG_LOCALE_MAP[locale];
  const openGraphAlternates = (Object.entries(OG_LOCALE_MAP) as [Locale, string][])
    .filter(([candidate]) => candidate !== locale)
    .map(([, mappedLocale]) => mappedLocale);

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: absolute(normalized),
      languages: {
        en: alternates.en,
        es: alternates.es,
        pt: alternates.pt,
        fr: alternates.fr,
        'x-default': alternates.en,
      },
    },
    openGraph: {
      title,
      description,
      url: absolute(normalized),
      siteName: siteConfig.brand.name,
      locale: openGraphLocale,
      alternateLocale: openGraphAlternates,
      images: [
        {
          url: absolute(siteConfig.brand.ogImagePath),
          width: 1200,
          height: 630,
          alt: siteConfig.brand.logoAlt,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absolute(siteConfig.brand.ogImagePath)],
    },
  };
}
