import { describe, expect, it } from 'vitest';

import { getLegacyDocument } from '../lib/legacy-loader';

describe('legacy loader path compatibility', () => {
  it('resolves about-states alias paths without about- prefix', async () => {
    const doc = await getLegacyDocument('en', ['about', 'about-states', 'acre']);
    expect(doc).not.toBeNull();
    expect(doc?.sourcePath).toContain('about/about-states/about-acre.html');
  });

  it('resolves service slugs that map to legacy trailing-dash filenames', async () => {
    const doc = await getLegacyDocument('en', ['services', 'immigrate-to-acre']);
    expect(doc).not.toBeNull();
    expect(doc?.sourcePath).toMatch(/services\/immigrate-to-acre-?\.html/);
  });

  it('resolves home archive and accessibility pages', async () => {
    const homeDoc = await getLegacyDocument('en', ['home', 'immigratetobrazil-index']);
    const a11yDoc = await getLegacyDocument('en', ['accessibility']);

    expect(homeDoc).not.toBeNull();
    expect(homeDoc?.sourcePath).toContain('home/immigratetobrazil-index.html');
    expect(a11yDoc).not.toBeNull();
    expect(a11yDoc?.sourcePath).toContain('accessibility/index.html');
  });
});
