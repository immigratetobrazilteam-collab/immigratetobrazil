import { getSiteCmsCopy } from '@/lib/site-cms-content';
import type { Locale, NavLink } from '@/lib/types';

export const locales: Locale[] = ['en', 'es', 'pt'];
export const defaultLocale: Locale = 'en';

export interface LocaleCopy {
  brand: string;
  nav: Omit<Record<'home' | 'about' | 'services' | 'process' | 'resources' | 'blog' | 'faq' | 'library' | 'contact', string>, never>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    highlightsTitle: string;
    highlights: string[];
  };
  sections: {
    servicesTitle: string;
    servicesSubtitle: string;
    processTitle: string;
    processSubtitle: string;
    trustTitle: string;
    migrationTitle: string;
    migrationSubtitle: string;
    blogTitle: string;
    blogSubtitle: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  contact: {
    title: string;
    subtitle: string;
    consultation: string;
    whatsapp: string;
    email: string;
  };
  footer: {
    tagline: string;
    legal: string;
  };
}

function extractLocaleCopy(locale: Locale): LocaleCopy {
  const site = getSiteCmsCopy(locale);
  return {
    brand: site.brand,
    nav: site.nav,
    hero: site.hero,
    sections: site.sections,
    cta: site.cta,
    contact: site.contact,
    footer: site.footer,
  };
}

export const copy: Record<Locale, LocaleCopy> = {
  en: extractLocaleCopy('en'),
  es: extractLocaleCopy('es'),
  pt: extractLocaleCopy('pt'),
};

export function resolveLocale(input?: string): Locale {
  if (!input) return defaultLocale;
  return locales.includes(input as Locale) ? (input as Locale) : defaultLocale;
}

export function localeNavLinks(locale: Locale): NavLink[] {
  const t = copy[locale].nav;
  return [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/services`, label: t.services },
    { href: `/${locale}/resources-guides-brazil`, label: t.resources },
    { href: `/${locale}/blog`, label: t.blog },
    { href: `/${locale}/library`, label: t.library },
    { href: `/${locale}/contact`, label: t.contact },
  ];
}
