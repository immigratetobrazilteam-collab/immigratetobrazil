import { describe, expect, it } from 'vitest';

import { getManagedLegacyDocument, getManagedLegacyManifest } from '../lib/managed-legacy-content';

describe('managed legacy content', () => {
  it('loads manifest with expected section coverage', async () => {
    const manifest = await getManagedLegacyManifest();
    expect(manifest).not.toBeNull();
    expect(manifest?.pageCount).toBeGreaterThan(2500);
    expect(manifest?.countsByPrefix?.services).toBeGreaterThan(2000);
    expect(manifest?.countsByPrefix?.about).toBeGreaterThan(50);
  });

  it('resolves FAQ canonical and legacy alias slugs', async () => {
    const canonical = await getManagedLegacyDocument('en', ['faq', 'yourfaqsaboutacreansweredbyimmigratetobrazil']);
    const alias = await getManagedLegacyDocument('en', ['faq', 'faq-acre']);

    expect(canonical).not.toBeNull();
    expect(alias).not.toBeNull();
    expect(canonical?.sourcePath).toBe('faq/faq-acre.html');
    expect(alias?.sourcePath).toBe('faq/faq-acre.html');
  });

  it('loads nested service documents', async () => {
    const document = await getManagedLegacyDocument('en', ['services', 'services-mato-grosso', 'naturalisation', 'derivative']);
    expect(document).not.toBeNull();
    expect(document?.sections.length).toBeGreaterThan(10);
    expect(document?.sourcePath).toBe('services/services-mato-grosso/naturalisation/derivative.html');
  });
});
