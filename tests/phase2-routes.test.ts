import { describe, expect, it } from 'vitest';

import { extractStateSlug, isPolicySlug, routePatternFromSlug } from '../lib/phase2-routes';

describe('phase2-routes', () => {
  it('extracts valid state slugs by route type', () => {
    expect(extractStateSlug('contact', 'contact-sao-paulo')).toBe('sao-paulo');
    expect(extractStateSlug('faq', 'faq-amazonas')).toBe('amazonas');
    expect(extractStateSlug('services', 'immigrate-to-rio-de-janeiro')).toBe('rio-de-janeiro');
    expect(extractStateSlug('blog', 'blog-parana')).toBe('parana');
  });

  it('rejects invalid patterns and unknown states', () => {
    expect(extractStateSlug('contact', 'faq-amazonas')).toBeNull();
    expect(extractStateSlug('services', 'immigrate-to-atlantis')).toBeNull();
    expect(extractStateSlug('blog', 'blog-')).toBeNull();
  });

  it('detects policy slugs', () => {
    expect(isPolicySlug('privacy')).toBe(true);
    expect(isPolicySlug('terms')).toBe(true);
    expect(isPolicySlug('unknown')).toBe(false);
  });

  it('maps route patterns from slug', () => {
    expect(routePatternFromSlug('contact-sao-paulo')).toBe('contact');
    expect(routePatternFromSlug('faq-acre')).toBe('faq');
    expect(routePatternFromSlug('immigrate-to-goias')).toBe('services');
    expect(routePatternFromSlug('blog-pernambuco')).toBe('blog');
    expect(routePatternFromSlug('foo')).toBe('unknown');
  });
});
