import type { MetadataRoute } from 'next';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { brazilianStates } from '@/content/curated/states';
import routeIndexData from '@/content/generated/route-index.json';
import { locales } from '@/lib/i18n';
import { buildFaqStateSlug } from '@/lib/phase2-routes';
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
  '/state-guides',
  '/faq',
  '/policies',
  '/library',
  '/home',
  '/accessibility',
  '/consultation',
  '/visa-consultation',
  '/resources-guides-brazil',
  '/discover',
  '/discover/brazilian-states',
  '/discover/brazilian-regions',
  '/about/about-brazil/apply-brazil',
  '/about/about-brazil/cost-of-living-in-brazil',
  '/about/about-brazil/festivals',
  '/about/about-brazil/food',
];

const policySlugs = ['privacy', 'terms', 'cookies', 'gdpr', 'refund', 'disclaimers'];
const dynamicExcludedPrefixes = ['public/', 'api/', '_next/', 'admin/', 'memory-bank/', 'blog/blog-', 'discover/', 'faq/faq-'];
const dynamicExcludedExact = new Set(['sitemap', 'robots', 'template']);

type RouteIndexItem = {
  locale: (typeof locales)[number];
  slug: string;
};

type DiscoverManifest = {
  pageCount: number;
  pages: Array<{
    slug: string;
    pathname: string;
  }>;
};

async function getRouteIndex(): Promise<RouteIndexItem[]> {
  return routeIndexData as RouteIndexItem[];
}

async function getDiscoverManifestSlugs(): Promise<string[]> {
  const manifestPath = path.join(process.cwd(), 'content', 'cms', 'discover-pages', 'en', '_manifest.json');

  try {
    const raw = await readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as DiscoverManifest;

    if (!Array.isArray(parsed.pages)) {
      return [];
    }

    return parsed.pages
      .map((item) => (typeof item?.slug === 'string' ? item.slug : ''))
      .filter((slug) => slug.length > 0);
  } catch {
    return [];
  }
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
  const discoverManagedSlugs = await getDiscoverManifestSlugs();

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
        `/faq/${buildFaqStateSlug(state.slug)}`,
        `/services/immigrate-to-${state.slug}`,
        `/state-guides/everything-you-need-to-know-about-${state.slug}`,
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

    for (const slug of discoverManagedSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/discover/${slug}`,
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
