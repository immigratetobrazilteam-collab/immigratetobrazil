import { describe, expect, it } from 'vitest';

import { resolveLocale } from '../lib/i18n';
import { localizedPath, stripLocaleFromPath } from '../lib/routes';

describe('routing utilities', () => {
  it('resolves locale safely', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('es')).toBe('es');
    expect(resolveLocale('pt')).toBe('pt');
    expect(resolveLocale('fr')).toBe('fr');
    expect(resolveLocale(undefined)).toBe('en');
  });

  it('builds locale-prefixed paths', () => {
    expect(localizedPath('en', '/contact')).toBe('/en/contact');
    expect(localizedPath('pt', 'blog')).toBe('/pt/blog');
    expect(localizedPath('fr', 'services')).toBe('/fr/services');
    expect(localizedPath('es')).toBe('/es');
  });

  it('strips locale prefix when present', () => {
    expect(stripLocaleFromPath('/en/contact')).toBe('/contact');
    expect(stripLocaleFromPath('/pt/about/about-brazil')).toBe('/about/about-brazil');
    expect(stripLocaleFromPath('/fr/contact')).toBe('/contact');
    expect(stripLocaleFromPath('/services')).toBe('/services');
  });
});
