import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/lib/site-config';
import { getSiteSettings } from '@/lib/site-settings-content';

describe('site settings', () => {
  it('loads cms-managed site settings file', () => {
    const settings = getSiteSettings();
    expect(settings.contact.formspreeEndpoint).toContain('formspree.io');
    expect(settings.brand.logoMarkPath.startsWith('/')).toBe(true);
  });

  it('exposes contact and brand values through runtime config', () => {
    expect(siteConfig.contact.whatsappLink).toContain('wa.me');
    expect(siteConfig.brand.logoAlt.length).toBeGreaterThan(10);
  });
});
