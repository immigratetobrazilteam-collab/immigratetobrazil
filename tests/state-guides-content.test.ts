import { describe, expect, it } from 'vitest';

import { brazilianStates } from '../content/curated/states';
import {
  buildStateGuideSlug,
  getAllStateGuides,
  getStateGuideBySlug,
  getStateGuideHubCopy,
  stateGuidePathByState,
} from '../lib/state-guides-content';

describe('state guides content', () => {
  it('contains one published English guide for each Brazilian state', () => {
    const guides = getAllStateGuides('en');

    expect(guides).toHaveLength(27);

    const stateSlugSet = new Set(guides.map((guide) => guide.stateSlug));
    const expectedStateSlugSet = new Set(brazilianStates.map((state) => state.slug));

    expect(stateSlugSet).toEqual(expectedStateSlugSet);

    for (const guide of guides) {
      expect(guide.slug).toBe(buildStateGuideSlug(guide.stateSlug));
      expect(guide.tableOfContents.length).toBeGreaterThanOrEqual(8);
      expect(guide.sections.length).toBeGreaterThanOrEqual(8);
      expect(guide.sections.some((section) => section.blocks.length >= 1)).toBe(true);
      expect(guide.faq.length).toBeGreaterThanOrEqual(3);
      expect(guide.status).toBe('published');
    }
  });

  it('falls back to English guide content when locale overrides are not provided', () => {
    const slug = buildStateGuideSlug('acre');

    const english = getStateGuideBySlug('en', slug);
    const spanish = getStateGuideBySlug('es', slug);
    const portuguese = getStateGuideBySlug('pt', slug);

    expect(english).not.toBeNull();
    expect(spanish).not.toBeNull();
    expect(portuguese).not.toBeNull();

    expect(spanish?.title).toBe(english?.title);
    expect(portuguese?.heroIntro).toBe(english?.heroIntro);
  });

  it('exposes localized hub copy and stable state-guide routes', () => {
    const hubEn = getStateGuideHubCopy('en');
    const hubPt = getStateGuideHubCopy('pt');

    expect(hubEn.title.length).toBeGreaterThan(0);
    expect(hubPt.title.length).toBeGreaterThan(0);
    expect(stateGuidePathByState('acre')).toBe('/state-guides/everything-you-need-to-know-about-acre');
  });
});
