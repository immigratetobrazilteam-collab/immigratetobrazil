import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { MetadataRoute } from 'next';

import { brazilianStates } from '@/content/curated/states';
import { locales } from '@/lib/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

const staticPaths = [
  '',
  '/about',
  '/about/about-brazil',
  '/about/about-states',
  '/about/about-us',
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
];

const policySlugs = ['privacy', 'terms', 'cookies', 'gdpr', 'refund', 'disclaimers'];

type RouteIndexItem = {
  locale: 'en' | 'es' | 'pt' | 'fr';
  slug: string;
};

async function getRouteIndex(): Promise<RouteIndexItem[]> {
  const indexPath = path.join(process.cwd(), 'content/generated/route-index.json');

  try {
    const raw = await readFile(indexPath, 'utf8');
    const parsed = JSON.parse(raw) as RouteIndexItem[];
    return parsed.slice(0, 10000);
  } catch {
    return [];
  }
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
    entries.push({
      url: `${BASE_URL}/${route.locale}/${route.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
