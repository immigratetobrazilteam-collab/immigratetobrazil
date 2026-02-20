import enSiteCopy from '@/content/cms/site-copy/en.json';
import esSiteCopy from '@/content/cms/site-copy/es.json';
import ptSiteCopy from '@/content/cms/site-copy/pt.json';
import type { BlogHighlight, Locale, ProcessStep, ServiceCard, StatItem } from '@/lib/types';

type HeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  highlightsTitle: string;
  highlights: string[];
};

type NavCopy = Omit<Record<'home' | 'about' | 'services' | 'process' | 'resources' | 'blog' | 'faq' | 'library' | 'contact', string>, never>;

type HomeContentMapCopy = {
  eyebrow: string;
  heading: string;
  links: Array<{ href: string; label: string }>;
};

type FooterCopy = {
  tagline: string;
  legal: string;
};

type ContactCopy = {
  title: string;
  subtitle: string;
  consultation: string;
  whatsapp: string;
  email: string;
};

type SectionsCopy = {
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

type CtaCopy = {
  title: string;
  subtitle: string;
  button: string;
};

export type SiteCmsCopy = {
  locale: Locale;
  brand: string;
  nav: NavCopy;
  hero: HeroCopy;
  sections: SectionsCopy;
  cta: CtaCopy;
  contact: ContactCopy;
  footer: FooterCopy;
  homeContentMap: HomeContentMapCopy;
  trustStats: StatItem[];
  serviceCards: ServiceCard[];
  processSteps: ProcessStep[];
  blogHighlights: BlogHighlight[];
};

const siteCmsCopyByLocale: Record<Locale, SiteCmsCopy> = {
  en: enSiteCopy as SiteCmsCopy,
  es: esSiteCopy as SiteCmsCopy,
  pt: ptSiteCopy as SiteCmsCopy,
};

export function getSiteCmsCopy(locale: Locale) {
  return siteCmsCopyByLocale[locale];
}
