import type { MetadataRoute } from 'next';

import { brazilianStates } from '@/content/curated/states';
import routeIndexData from '@/content/generated/route-index.json';
import { locales } from '@/lib/i18n';
import { getSeoSettings } from '@/lib/seo-settings-content';

const seoSettings = getSeoSettings();
const DEFAULT_BASE_URL = 'https://www.immigratetobrazil.com';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || seoSettings.siteUrl || DEFAULT_BASE_URL).replace(
  /\/+$/,
  '',
);

const staticPaths = [
  '',
  '/about',
  '/about/about-brazil',
  '/about/about-states',
  '/about/about-us',
  '/about/values',
  '/about/mission',
  '/about/story',
  '/services',
  '/process',
  '/contact',
  '/blog',
  '/faq',
  '/policies',
  '/library',
  '/home',
  '/accessibility',
  '/visa-consultation',
  '/resources-guides-brazil',
  '/discover/brazilian-states',
  '/discover/brazilian-regions',
  '/about/about-brazil/apply-brazil',
  '/about/about-brazil/cost-of-living-in-brazil',
  '/about/about-brazil/festivals',
  '/about/about-brazil/food',
];

const policySlugs = ['privacy', 'terms', 'cookies', 'gdpr', 'refund', 'disclaimers'];
const dynamicExcludedPrefixes = ['public/', 'api/', '_next/', 'admin/', 'memory-bank/'];
const dynamicExcludedExact = new Set(['sitemap', 'robots', 'template']);

type RouteIndexItem = {
  locale: (typeof locales)[number];
  slug: string;
};

async function getRouteIndex(): Promise<RouteIndexItem[]> {
  return routeIndexData as RouteIndexItem[];
}

function normalizePath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '/';
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+/, '').replace(/\/+$/, '');
}

function shouldExcludeDynamicSlug(slug: string): boolean {
  if (!slug) return true;
  if (dynamicExcludedExact.has(slug)) return true;
  return dynamicExcludedPrefixes.some((prefix) => slug.startsWith(prefix));
}

function stripLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return '/';
  }

  if (locales.includes(parts[0] as (typeof locales)[number])) {
    const withoutLocale = parts.slice(1).join('/');
    return withoutLocale ? `/${withoutLocale}` : '/';
  }

  return pathname;
}

const excludedPrefixes = Array.from(new Set(seoSettings.excludePathPrefixes.map(normalizePath)));
const excludedContains = Array.from(
  new Set(
    seoSettings.excludePathContains
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0),
  ),
);

function shouldExcludeSitemapUrl(urlValue: string): boolean {
  let pathname = '/';
  try {
    pathname = new URL(urlValue).pathname || '/';
  } catch {
    return true;
  }

  const normalizedPath = stripLocaleFromPath(normalizePath(pathname));
  const loweredPath = normalizedPath.toLowerCase();

  for (const prefix of excludedPrefixes) {
    if (prefix === '/') {
      continue;
    }

    if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  for (const token of excludedContains) {
    if (loweredPath.includes(token)) {
      return true;
    }
  }

  return false;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}${p}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : 0.8,
      });
    }

    for (const state of brazilianStates) {
      const stateRoutes = [
        `/contact/contact-${state.slug}`,
        `/faq/faq-${state.slug}`,
        `/services/immigrate-to-${state.slug}`,
        `/blog/blog-${state.slug}`,
      ];

      for (const route of stateRoutes) {
        entries.push({
          url: `${BASE_URL}/${locale}${route}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    for (const policy of policySlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/policies/${policy}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  const dynamicRoutes = await getRouteIndex();

  for (const route of dynamicRoutes) {
    const normalizedSlug = normalizeSlug(route.slug);
    if (shouldExcludeDynamicSlug(normalizedSlug)) {
      continue;
    }

    entries.push({
      url: `${BASE_URL}/${route.locale}/${normalizedSlug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  const seenUrls = new Set<string>();
  const filtered: MetadataRoute.Sitemap = [];

  for (const entry of entries) {
    const canonicalUrl = entry.url.replace(/\/+$/, '');
    if (seenUrls.has(canonicalUrl)) {
      continue;
    }

    if (shouldExcludeSitemapUrl(canonicalUrl)) {
      continue;
    }

    seenUrls.add(canonicalUrl);
    filtered.push({ ...entry, url: canonicalUrl });
  }

  return filtered;
}
