import { describe, expect, it } from 'vitest';

import { getDiscoverHubCopy, getDiscoverManifest, getDiscoverPage } from '../lib/discover-pages-content';

describe('discover pages content', () => {
  it('loads discover manifest and expected volume', async () => {
    const manifest = await getDiscoverManifest('en');

    expect(manifest.pageCount).toBeGreaterThan(5000);
    expect(manifest.pages.length).toBe(manifest.pageCount);
  });

  it('resolves state and city discover pages with sections', async () => {
    const statePage = await getDiscoverPage('en', ['brazilian-states', 'ac']);
    const cityPage = await getDiscoverPage('en', [
      'brazilian-regions',
      'central-west-region',
      'distrito-federal',
      'move-to-brasilia-the-federal-district-functions-as-a-single-municipality-distrito-federal-brazil',
    ]);

    expect(statePage).not.toBeNull();
    expect(cityPage).not.toBeNull();

    expect(statePage?.sections.length).toBeGreaterThanOrEqual(5);
    expect(cityPage?.sections.length).toBeGreaterThanOrEqual(10);
  });

  it('falls back to english discover pages for locales without overrides', async () => {
    const english = await getDiscoverPage('en', ['brazilian-states', 'ac']);
    const spanish = await getDiscoverPage('es', ['brazilian-states', 'ac']);
    const hubPt = await getDiscoverHubCopy('pt');

    expect(english).not.toBeNull();
    expect(spanish).not.toBeNull();
    expect(spanish?.title).toBe(english?.title);
    expect(hubPt.title.length).toBeGreaterThan(0);
  });
});
