import enPolicies from '@/content/cms/policies/en.json';
import esPolicies from '@/content/cms/policies/es.json';
import ptPolicies from '@/content/cms/policies/pt.json';
import enStateCopy from '@/content/cms/state-copy/en.json';
import esStateCopy from '@/content/cms/state-copy/es.json';
import ptStateCopy from '@/content/cms/state-copy/pt.json';
import type { Locale } from '@/lib/types';

type TitleDetail = {
  title: string;
  detail: string;
};

type QAItem = {
  q: string;
  a: string;
};

type ContactCopy = {
  title: string;
  subtitle: string;
  cards: TitleDetail[];
};

type FaqCopy = {
  title: string;
  subtitle: string;
  qa: QAItem[];
};

type ServiceCopy = {
  title: string;
  subtitle: string;
  modules: TitleDetail[];
};

type BlogCopy = {
  title: string;
  subtitle: string;
  sections: TitleDetail[];
};

type StateTemplates = {
  contact: ContactCopy;
  faq: FaqCopy;
  services: ServiceCopy;
  blog: BlogCopy;
};

type StateOverride = {
  slug: string;
  contact?: Partial<ContactCopy>;
  faq?: Partial<FaqCopy>;
  services?: Partial<ServiceCopy>;
  blog?: Partial<BlogCopy>;
};

type StateCopyFile = {
  locale: Locale;
  templates: StateTemplates;
  overrides: StateOverride[];
};

type PolicyEntry = {
  slug: string;
  title: string;
  paragraphs: string[];
};

type PolicyFile = {
  locale: Locale;
  policies: PolicyEntry[];
};

const stateCopyByLocale: Record<Locale, StateCopyFile> = {
  en: enStateCopy as StateCopyFile,
  es: esStateCopy as StateCopyFile,
  pt: ptStateCopy as StateCopyFile,
};

const policiesByLocale: Record<Locale, PolicyFile> = {
  en: enPolicies as PolicyFile,
  es: esPolicies as PolicyFile,
  pt: ptPolicies as PolicyFile,
};

function mergeContact(template: ContactCopy, override?: Partial<ContactCopy>): ContactCopy {
  return {
    title: override?.title || template.title,
    subtitle: override?.subtitle || template.subtitle,
    cards: override?.cards?.length ? override.cards : template.cards,
  };
}

function mergeFaq(template: FaqCopy, override?: Partial<FaqCopy>): FaqCopy {
  return {
    title: override?.title || template.title,
    subtitle: override?.subtitle || template.subtitle,
    qa: override?.qa?.length ? override.qa : template.qa,
  };
}

function mergeServices(template: ServiceCopy, override?: Partial<ServiceCopy>): ServiceCopy {
  return {
    title: override?.title || template.title,
    subtitle: override?.subtitle || template.subtitle,
    modules: override?.modules?.length ? override.modules : template.modules,
  };
}

function mergeBlog(template: BlogCopy, override?: Partial<BlogCopy>): BlogCopy {
  return {
    title: override?.title || template.title,
    subtitle: override?.subtitle || template.subtitle,
    sections: override?.sections?.length ? override.sections : template.sections,
  };
}

export function getStateCmsCopy(locale: Locale, stateSlug: string) {
  const file = stateCopyByLocale[locale];
  const override = file.overrides.find((entry) => entry.slug === stateSlug);

  return {
    contact: mergeContact(file.templates.contact, override?.contact),
    faq: mergeFaq(file.templates.faq, override?.faq),
    services: mergeServices(file.templates.services, override?.services),
    blog: mergeBlog(file.templates.blog, override?.blog),
  };
}

export function getPolicyCmsCopy(locale: Locale, slug: string) {
  return policiesByLocale[locale].policies.find((policy) => policy.slug === slug) || null;
}

export function getAllPolicySlugs() {
  return Array.from(new Set(policiesByLocale.en.policies.map((policy) => policy.slug)));
}
