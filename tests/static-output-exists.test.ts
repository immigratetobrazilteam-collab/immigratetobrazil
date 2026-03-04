import { describe, expect, it } from 'vitest';

import enMap from '../content/cms/navigation-map/en.json';
import { getLegacyDocument } from '../lib/legacy-loader';
import { getStateGuideBySlug } from '../lib/state-guides-content';
import type { Locale } from '../lib/types';

const locales: Locale[] = ['en', 'pt'];

const modernSlugs = new Set([
  '',
  'about',
  'about/about-brazil',
  'about/about-states',
  'about/about-us',
  'about/mission',
  'about/story',
  'about/values',
  'accessibility',
  'blog',
  'client-portal',
  'consultation',
  'discover',
  'discover/brazilian-regions',
  'discover/brazilian-regions/north-region',
  'discover/brazilian-regions/northeast-region',
  'discover/brazilian-regions/central-west-region',
  'discover/brazilian-regions/southeast-region',
  'discover/brazilian-regions/south-region',
  'discover/brazilian-states',
  'faq',
  'home',
  'library',
  'policies',
  'process',
  'resources-guides-brazil',
  'search',
  'services',
  'state-guides',
  'sitemap.xml',
  'visa-consultation',
]);

function internalSlugsFromMap() {
  return enMap.registry
    .map((item) => item.href)
    .filter((href) => href.startsWith('/') && !href.startsWith('//') && href !== '/robots.txt')
    .map((href) => href.replace(/^\//, ''));
}

describe('mapped navigation routes resolve', () => {
  it('resolves all mapped hrefs for all locales', async () => {
    const slugs = Array.from(new Set(internalSlugsFromMap()));

    for (const locale of locales) {
      const failures: string[] = [];

      await Promise.all(
        slugs.map(async (slug) => {
          if (slug === 'sitemap.xml') return;
          if (modernSlugs.has(slug)) return;

          if (slug.startsWith('state-guides/')) {
            const guideSlug = slug.replace(/^state-guides\//, '');
            const guide = getStateGuideBySlug(locale, guideSlug);
            if (!guide) {
              failures.push(`/${locale}/${slug}`);
            }
            return;
          }

          const doc = await getLegacyDocument(locale, slug.split('/'));
          if (!doc) {
            failures.push(`/${locale}/${slug}`);
          }
        }),
      );

      expect(failures, `Unresolved mapped links for ${locale}`).toEqual([]);
    }
  }, 30000);
});
