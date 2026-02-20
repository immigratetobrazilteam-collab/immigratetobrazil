import enSiteCopy from '@/content/cms/site-copy/en.json';
import esSiteCopy from '@/content/cms/site-copy/es.json';
import frSiteCopy from '@/content/cms/site-copy/fr.json';
import ptSiteCopy from '@/content/cms/site-copy/pt.json';
import type { Locale, NavLink } from '@/lib/types';

export const locales: Locale[] = ['en', 'es', 'pt', 'fr'];
export const defaultLocale: Locale = 'en';

type CmsLink = {
  href: string;
  label: string;
};

type RegionLabelsCopy = {
  north: string;
  northeast: string;
  centralWest: string;
  southeast: string;
  south: string;
};

type HeaderNavigationCopy = {
  brandTagline: string;
  allPagesButton: string;
  quickLinks: CmsLink[];
  menuLabels: {
    aboutBrazil: string;
    aboutStates: string;
    services: string;
    resources: string;
    discover: string;
    blogByState: string;
    faqByState: string;
    contactByState: string;
  };
  sectionLabels: {
    aboutBrazil: string;
    aboutStates: string;
    servicesCore: string;
    servicesStates: string;
    resourcesHubs: string;
    resourcesPolicy: string;
    discoverRegions: string;
    discoverStates: string;
    blogStates: string;
    faqStates: string;
    contactChannels: string;
    contactStates: string;
  };
  regionLabels: RegionLabelsCopy;
  links: {
    aboutBrazilHub: string;
    applyBrazil: string;
    costOfLiving: string;
    aboutStatesHub: string;
    aboutUs: string;
    values: string;
    mission: string;
    story: string;
    visaServices: string;
    visaCategories: string;
    residencyServices: string;
    naturalisationServices: string;
    legalServices: string;
    homeArchive: string;
    policies: string;
    cookies: string;
    disclaimers: string;
    gdpr: string;
    privacy: string;
    refund: string;
    terms: string;
    xmlSitemap: string;
    discoverRegionsHub: string;
    discoverStatesHub: string;
    blogByStateHub: string;
    faqByStateHub: string;
    contactByStateHub: string;
  };
};

type FooterNavigationCopy = {
  dropdownTitle: string;
  aboutUsPagesTitle: string;
  aboutBrazilPagesTitle: string;
  supportTitle: string;
  stateAbout: string;
  stateServices: string;
  stateContact: string;
  stateBlog: string;
  stateFaq: string;
  allPages: string;
  aboutUsHub: string;
  aboutBrazilHub: string;
  festivalsHub: string;
  foodHub: string;
  aboutBrazilCoreTitle: string;
  aboutBrazilFestivalsTitle: string;
  aboutBrazilFoodTitle: string;
  menuAboutBrazil: string;
  menuAboutStates: string;
  menuServices: string;
  menuResources: string;
  menuDiscover: string;
  menuBlog: string;
  menuFaq: string;
  menuContact: string;
  contactBoxTitle: string;
  rightsReserved: string;
};

type FloatingActionsCopy = {
  whatsapp: string;
  whatsappTag: string;
  top: string;
};

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
  headerNavigation: HeaderNavigationCopy;
  footerNavigation: FooterNavigationCopy;
  floatingActions: FloatingActionsCopy;
}

const enCopy = enSiteCopy as LocaleCopy;
const esCopy = esSiteCopy as LocaleCopy;
const ptCopy = ptSiteCopy as LocaleCopy;
const frCopy = frSiteCopy as LocaleCopy;

export const copy: Record<Locale, LocaleCopy> = {
  en: enCopy,
  es: esCopy,
  pt: ptCopy,
  fr: frCopy,
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
