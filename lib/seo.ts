import type { Metadata } from 'next';

import type { Locale } from '@/lib/types';

const SITE_NAME = 'Immigrate to Brazil';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

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
      siteName: SITE_NAME,
      locale,
      images: [
        {
          url: absolute('/brand/og-image.png'),
          width: 1200,
          height: 630,
          alt: 'Immigrate to Brazil immigration law firm logo',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absolute('/brand/og-image.png')],
    },
  };
}
