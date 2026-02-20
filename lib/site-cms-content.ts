import enSiteCopy from '@/content/cms/site-copy/en.json';
import esSiteCopy from '@/content/cms/site-copy/es.json';
import frSiteCopy from '@/content/cms/site-copy/fr.json';
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

type UpgradeNoticeCopy = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  body: string;
  whatsappButton: string;
  emailButton: string;
};

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

export type SiteCmsCopy = {
  locale: Locale;
  brand: string;
  nav: NavCopy;
  hero: HeroCopy;
  sections: SectionsCopy;
  cta: CtaCopy;
  contact: ContactCopy;
  footer: FooterCopy;
  headerNavigation: HeaderNavigationCopy;
  footerNavigation: FooterNavigationCopy;
  floatingActions: FloatingActionsCopy;
  upgradeNotice: UpgradeNoticeCopy;
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
  fr: frSiteCopy as SiteCmsCopy,
};

export function getSiteCmsCopy(locale: Locale) {
  return siteCmsCopyByLocale[locale];
}
