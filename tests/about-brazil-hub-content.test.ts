import { describe, expect, it } from 'vitest';

import { getManagedPageCopy } from '../lib/site-cms-content';
import type { Locale } from '../lib/types';

const locales: Locale[] = ['en', 'pt'];

const requiredSectionKeys = ['discover', 'living', 'regions', 'states', 'cities', 'culture', 'guides'];

describe('about brazil hub managed copy', () => {
  it('provides the hub contract for both locales', () => {
    for (const locale of locales) {
      const pageCopy = getManagedPageCopy<any>(locale, 'aboutBrazilHubPage');
      expect(pageCopy, `missing aboutBrazilHubPage for ${locale}`).toBeTruthy();

      expect(pageCopy.seo.metaTitleTemplate.length).toBeGreaterThan(0);
      expect(pageCopy.seo.metaDescription.length).toBeGreaterThan(0);
      expect(pageCopy.hero.title.length).toBeGreaterThan(0);
      expect(pageCopy.hero.subtitle.length).toBeGreaterThan(0);
      expect(pageCopy.hero.primaryCta.href.startsWith('/')).toBe(true);
      expect(pageCopy.hero.secondaryCta.href.startsWith('/')).toBe(true);
      expect(pageCopy.hero.statChips.length).toBeGreaterThanOrEqual(3);

      for (const key of requiredSectionKeys) {
        const section = pageCopy.sections[key];
        expect(section, `missing section ${key} for ${locale}`).toBeTruthy();
        expect(section.eyebrow.length).toBeGreaterThan(0);
        expect(section.title.length).toBeGreaterThan(0);
        expect(section.subtitle.length).toBeGreaterThan(0);
        expect(section.ctaLabel.length).toBeGreaterThan(0);
        expect(section.ctaHref.startsWith('/')).toBe(true);
        expect(typeof section.itemDescriptions).toBe('object');
      }

      expect(pageCopy.labels.jumpNavTitle.length).toBeGreaterThan(0);
      expect(pageCopy.labels.updatedLabel.length).toBeGreaterThan(0);
      expect(pageCopy.labels.linksTitle.length).toBeGreaterThan(0);
      expect(pageCopy.fallbacks.eventsHref.startsWith('/')).toBe(true);
      expect(pageCopy.fallbacks.housingHref.startsWith('/')).toBe(true);
    }
  });
});
