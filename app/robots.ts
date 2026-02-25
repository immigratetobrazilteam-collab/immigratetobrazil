import type { MetadataRoute } from 'next';

import { getSeoSettings } from '@/lib/seo-settings-content';

const seoSettings = getSeoSettings();
const DEFAULT_BASE_URL = 'https://www.immigratetobrazil.com';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || seoSettings.siteUrl || DEFAULT_BASE_URL).replace(
  /\/+$/,
  '',
);

function normalizePath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '/';
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function resolveSitemapUrls(): string[] {
  const urls = [
    `${BASE_URL}${normalizePath(seoSettings.sitemapPath)}`,
    ...seoSettings.extraSitemaps.map((pathOrUrl) =>
      pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
        ? pathOrUrl
        : `${BASE_URL}${normalizePath(pathOrUrl)}`,
    ),
  ];

  return Array.from(new Set(urls));
}

function resolveHost(): string | undefined {
  try {
    return new URL(BASE_URL).host;
  } catch {
    return undefined;
  }
}

export default function robots(): MetadataRoute.Robots {
  const sitemapUrls = resolveSitemapUrls();

  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: seoSettings.robotsDisallow,
    },
    host: resolveHost(),
    sitemap: sitemapUrls.length === 1 ? sitemapUrls[0] : sitemapUrls,
  };
}
