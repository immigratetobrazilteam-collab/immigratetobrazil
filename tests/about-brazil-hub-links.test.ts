import { describe, expect, it } from 'vitest';

import routeIndexData from '../content/generated/route-index-lite.json';
import { getAboutBrazilHubRequiredLinkIds } from '../lib/about-brazil-hub';
import { getDiscoverHubIndex } from '../lib/discover-pages-content';
import { getLegacyDocument } from '../lib/legacy-loader';
import { getNavigationMap } from '../lib/navigation-map-content';
import { stripLocaleFromPath } from '../lib/routes';
import { getManagedPageCopy } from '../lib/site-cms-content';
import type { Locale } from '../lib/types';

type RouteIndexEntry = {
  locale: Locale;
  slug: string;
};

const locales: Locale[] = ['en', 'pt'];

const modernSlugs = new Set([
  '',
  'about',
  'about/about-brazil',
  'about/about-brazil/festivals',
  'about/about-brazil/food',
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
  'visa-consultation',
]);

function isExternalHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(href.trim());
}

function normalizeSlug(href: string) {
  const normalized = stripLocaleFromPath(href.trim());
  return normalized.replace(/^\/+/, '');
}

describe('about brazil hub links', () => {
  it('resolves all emitted internal links for en and pt', async () => {
    const routeIndex = routeIndexData as RouteIndexEntry[];

    for (const locale of locales) {
      const pageCopy = getManagedPageCopy<any>(locale, 'aboutBrazilHubPage');
      expect(pageCopy, `missing aboutBrazilHubPage for ${locale}`).toBeTruthy();

      const navMap = getNavigationMap(locale);
      const navHrefs = getAboutBrazilHubRequiredLinkIds()
        .map((id) => navMap.resolveItem(id)?.href)
        .filter((href): href is string => Boolean(href));

      const sectionHrefs = Object.values<any>(pageCopy.sections).map((section) => section.ctaHref);
      const seoHrefs = (pageCopy.seo.internalLinks || []).map((link: { href: string }) => link.href);
      const heroHrefs = [pageCopy.hero.primaryCta.href, pageCopy.hero.secondaryCta.href];

      const discoverHub = await getDiscoverHubIndex(locale);
      const stateSampleHrefs = discoverHub.statePages.slice(0, 5).map((item) => item.pathname);
      const citySampleHrefs = discoverHub.citySamples.slice(0, 5).map((item) => item.pathname);

      const fixedGuideHrefs = [
        '/about/about-brazil/why-brazil',
        '/about/about-brazil/cost-of-living-in-brazil',
        '/about/about-brazil/apply-brazil',
        '/contact',
      ];

      const hrefs = Array.from(
        new Set([
          ...navHrefs,
          ...sectionHrefs,
          ...seoHrefs,
          ...heroHrefs,
          ...stateSampleHrefs,
          ...citySampleHrefs,
          ...fixedGuideHrefs,
        ]),
      );

      const routeSet = new Set(routeIndex.filter((entry) => entry.locale === locale).map((entry) => entry.slug));
      const failures: string[] = [];

      for (const href of hrefs) {
        if (!href || isExternalHref(href)) continue;

        const slug = normalizeSlug(href);
        if (!slug) continue;

        if (modernSlugs.has(slug) || routeSet.has(slug)) {
          continue;
        }

        const doc = await getLegacyDocument(locale, slug.split('/'));
        if (!doc) {
          failures.push(`/${locale}/${slug}`);
        }
      }

      expect(failures, `unresolved hub links for ${locale}`).toEqual([]);
    }
  });
});
