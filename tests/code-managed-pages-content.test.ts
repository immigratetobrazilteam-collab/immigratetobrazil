import { describe, expect, it } from 'vitest';

import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';

describe('code-managed pages content', () => {
  it('loads consultation and portal copy for both locales', () => {
    const en = getCodeManagedPagesCopy('en');
    const pt = getCodeManagedPagesCopy('pt');

    expect(en.consultationPage.heroTitle.length).toBeGreaterThan(0);
    expect(pt.consultationPage.heroTitle.length).toBeGreaterThan(0);
    expect(en.clientPortalPage.heroTitle.length).toBeGreaterThan(0);
    expect(pt.clientPortalPage.heroTitle.length).toBeGreaterThan(0);
  });

  it('contains navigation search copy and payment methods', () => {
    const en = getCodeManagedPagesCopy('en');

    expect(en.searchPage.searchButton).toBe('Search');
    expect(en.paymentMethods.methods.length).toBeGreaterThanOrEqual(4);
    expect(en.calendlyEmbed.title.length).toBeGreaterThan(0);
  });
});
