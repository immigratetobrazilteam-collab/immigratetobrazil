import { describe, expect, it } from 'vitest';

import { brazilianStates } from '../content/curated/states';
import { getLegacyDocument } from '../lib/legacy-loader';
import { buildFaqStateSlug } from '../lib/phase2-routes';
import { buildStateGuideSlug, getStateGuideBySlug } from '../lib/state-guides-content';
import type { Locale } from '../lib/types';

const locales: Locale[] = ['en', 'es', 'pt', 'fr'];

const modernSlugs = new Set([
  '',
  'about',
  'about/about-brazil',
  'about/about-states',
  'about/about-us',
  'accessibility',
  'services',
  'resources-guides-brazil',
  'blog',
  'state-guides',
  'discover',
  'discover/brazilian-states',
  'discover/brazilian-regions',
  'faq',
  'contact',
  'process',
  'home',
  'library',
  'policies',
  'consultation',
  'visa-consultation',
]);

const fixedLegacySlugs = [
  'about/about-brazil/apply-brazil',
  'about/about-brazil/cost-of-living-in-brazil',
  'services/visa',
  'services/visas',
  'services/residencies',
  'services/naturalisation',
  'services/legal',
  'services/immigration-law-services/visas/work',
  'services/immigration-law-services/residencies/permanent',
  'services/immigration-law-services/naturalisation/ordinary',
  'services/travel-services/guided-trips/north',
  'services/services-acre/visas/work-visa',
  'services/services-sao-paulo/visas/work',
  'policies/privacy',
  'policies/terms',
  'policies/cookies',
];

const stateLegacySlugs = brazilianStates.flatMap((state) => [
  `about/about-states/about-${state.slug}`,
  `services/immigrate-to-${state.slug}`,
  `faq/${buildFaqStateSlug(state.slug)}`,
  `contact/contact-${state.slug}`,
]);

const stateGuideSlugs = brazilianStates.map((state) => `state-guides/${buildStateGuideSlug(state.slug)}`);

const allSlugs = [...new Set([...Array.from(modernSlugs), ...fixedLegacySlugs, ...stateLegacySlugs, ...stateGuideSlugs])];

describe('navigation links', () => {
  it('covers all expected menu paths', () => {
    expect(allSlugs.length).toBeGreaterThan(120);
  });

  for (const locale of locales) {
    it(`resolves all configured header/footer links for ${locale}`, async () => {
      const failures: string[] = [];

      await Promise.all(
        allSlugs.map(async (slug) => {
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

      expect(failures).toEqual([]);
    });
  }
});
