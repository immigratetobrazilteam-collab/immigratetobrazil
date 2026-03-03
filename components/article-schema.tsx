import type { Locale } from '@/lib/types';

type ArticleSchemaProps = {
  locale: Locale;
  pathname: string;
  headline: string;
  description: string;
  section?: string;
  keywords?: string[];
};

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com').replace(/\/+$/, '');

function toAbsolute(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BASE_URL}${normalized}`;
}

export function ArticleSchema({ locale, pathname, headline, description, section, keywords }: ArticleSchemaProps) {
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: locale,
    mainEntityOfPage: toAbsolute(pathname),
    headline,
    description,
    articleSection: section,
    keywords: keywords && keywords.length ? keywords.join(', ') : undefined,
    wordCount,
    publisher: {
      '@type': 'Organization',
      name: 'Immigrate to Brazil',
      url: BASE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

