import enGuides from '@/content/cms/state-guides/en.json';
import esGuides from '@/content/cms/state-guides/es.json';
import frGuides from '@/content/cms/state-guides/fr.json';
import ptGuides from '@/content/cms/state-guides/pt.json';
import type { Locale } from '@/lib/types';

export type StateGuideStatus = 'draft' | 'published';

export type StateGuideContentBlock =
  | {
      type: 'subheading';
      text: string;
    }
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'list';
      items: string[];
    }
  | {
      type: 'note';
      tone: 'tip' | 'highlight' | 'compliance' | 'note';
      text: string;
    };

export type StateGuideSection = {
  id: string;
  heading: string;
  summary: string;
  highlights: string[];
  blocks: StateGuideContentBlock[];
};

export type StateGuideFaqItem = {
  question: string;
  answer: string;
};

export type StateGuideCta = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type StateGuideSeo = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

export type StateGuide = {
  stateSlug: string;
  slug: string;
  title: string;
  heroIntro: string;
  sourcePath: string;
  sourceUpdatedLabel: string;
  tableOfContents: Array<{ id: string; label: string }>;
  sections: StateGuideSection[];
  faq: StateGuideFaqItem[];
  cta: StateGuideCta;
  seo: StateGuideSeo;
  owner: string;
  status: StateGuideStatus;
  lastReviewedAt: string;
  reviewEveryDays: number;
};

export type StateGuideHubCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  countLabel: string;
  backToBlogLabel: string;
  consultationLabel: string;
};

type StateGuideOverride = {
  stateSlug: string;
  slug?: string;
  title?: string;
  heroIntro?: string;
  sourcePath?: string;
  sourceUpdatedLabel?: string;
  tableOfContents?: Array<{ id: string; label: string }>;
  sections?: StateGuideSection[];
  faq?: StateGuideFaqItem[];
  cta?: Partial<StateGuideCta>;
  seo?: Partial<StateGuideSeo>;
  owner?: string;
  status?: StateGuideStatus;
  lastReviewedAt?: string;
  reviewEveryDays?: number;
};

type StateGuideLocaleFile = {
  locale: Locale;
  hub: Partial<StateGuideHubCopy>;
  guides: StateGuideOverride[];
};

const guidesByLocale: Record<Locale, StateGuideLocaleFile> = {
  en: enGuides as StateGuideLocaleFile,
  es: esGuides as StateGuideLocaleFile,
  pt: ptGuides as StateGuideLocaleFile,
  fr: frGuides as StateGuideLocaleFile,
};

const englishGuides = (guidesByLocale.en.guides || []) as unknown as StateGuide[];
const englishGuideByState = new Map(englishGuides.map((guide) => [guide.stateSlug, guide]));
const englishGuideBySlug = new Map(englishGuides.map((guide) => [guide.slug, guide]));

const fallbackHub: StateGuideHubCopy = {
  eyebrow: 'State migration guides',
  title: 'Everything you need to know about each Brazilian state',
  subtitle:
    'A managed library of 27 state-by-state immigration guides extracted from your legacy blog content and rebuilt for the new design system.',
  countLabel: '{{count}} state guides',
  backToBlogLabel: 'Back to blog',
  consultationLabel: 'Book a consultation',
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function mergeHubCopy(locale: Locale): StateGuideHubCopy {
  const englishHub = guidesByLocale.en.hub || {};
  const localHub = guidesByLocale[locale].hub || {};

  const fromEnglish: StateGuideHubCopy = {
    eyebrow: isNonEmptyString(englishHub.eyebrow) ? englishHub.eyebrow : fallbackHub.eyebrow,
    title: isNonEmptyString(englishHub.title) ? englishHub.title : fallbackHub.title,
    subtitle: isNonEmptyString(englishHub.subtitle) ? englishHub.subtitle : fallbackHub.subtitle,
    countLabel: isNonEmptyString(englishHub.countLabel) ? englishHub.countLabel : fallbackHub.countLabel,
    backToBlogLabel: isNonEmptyString(englishHub.backToBlogLabel) ? englishHub.backToBlogLabel : fallbackHub.backToBlogLabel,
    consultationLabel: isNonEmptyString(englishHub.consultationLabel)
      ? englishHub.consultationLabel
      : fallbackHub.consultationLabel,
  };

  return {
    eyebrow: isNonEmptyString(localHub.eyebrow) ? localHub.eyebrow : fromEnglish.eyebrow,
    title: isNonEmptyString(localHub.title) ? localHub.title : fromEnglish.title,
    subtitle: isNonEmptyString(localHub.subtitle) ? localHub.subtitle : fromEnglish.subtitle,
    countLabel: isNonEmptyString(localHub.countLabel) ? localHub.countLabel : fromEnglish.countLabel,
    backToBlogLabel: isNonEmptyString(localHub.backToBlogLabel) ? localHub.backToBlogLabel : fromEnglish.backToBlogLabel,
    consultationLabel: isNonEmptyString(localHub.consultationLabel) ? localHub.consultationLabel : fromEnglish.consultationLabel,
  };
}

function mergeCta(base: StateGuideCta, override?: Partial<StateGuideCta>): StateGuideCta {
  if (!override) return base;

  return {
    title: isNonEmptyString(override.title) ? override.title : base.title,
    description: isNonEmptyString(override.description) ? override.description : base.description,
    primaryLabel: isNonEmptyString(override.primaryLabel) ? override.primaryLabel : base.primaryLabel,
    primaryHref: isNonEmptyString(override.primaryHref) ? override.primaryHref : base.primaryHref,
    secondaryLabel: isNonEmptyString(override.secondaryLabel) ? override.secondaryLabel : base.secondaryLabel,
    secondaryHref: isNonEmptyString(override.secondaryHref) ? override.secondaryHref : base.secondaryHref,
  };
}

function mergeSeo(base: StateGuideSeo, override?: Partial<StateGuideSeo>): StateGuideSeo {
  if (!override) return base;

  return {
    metaTitle: isNonEmptyString(override.metaTitle) ? override.metaTitle : base.metaTitle,
    metaDescription: isNonEmptyString(override.metaDescription) ? override.metaDescription : base.metaDescription,
    keywords: Array.isArray(override.keywords) && override.keywords.length ? override.keywords : base.keywords,
  };
}

function mergeGuide(base: StateGuide, override?: StateGuideOverride): StateGuide {
  if (!override) return base;

  return {
    stateSlug: base.stateSlug,
    slug: isNonEmptyString(override.slug) ? override.slug : base.slug,
    title: isNonEmptyString(override.title) ? override.title : base.title,
    heroIntro: isNonEmptyString(override.heroIntro) ? override.heroIntro : base.heroIntro,
    sourcePath: isNonEmptyString(override.sourcePath) ? override.sourcePath : base.sourcePath,
    sourceUpdatedLabel: isNonEmptyString(override.sourceUpdatedLabel) ? override.sourceUpdatedLabel : base.sourceUpdatedLabel,
    tableOfContents:
      Array.isArray(override.tableOfContents) && override.tableOfContents.length
        ? override.tableOfContents
        : base.tableOfContents,
    sections: Array.isArray(override.sections) && override.sections.length ? override.sections : base.sections,
    faq: Array.isArray(override.faq) && override.faq.length ? override.faq : base.faq,
    cta: mergeCta(base.cta, override.cta),
    seo: mergeSeo(base.seo, override.seo),
    owner: isNonEmptyString(override.owner) ? override.owner : base.owner,
    status: override.status === 'draft' || override.status === 'published' ? override.status : base.status,
    lastReviewedAt: isNonEmptyString(override.lastReviewedAt) ? override.lastReviewedAt : base.lastReviewedAt,
    reviewEveryDays:
      typeof override.reviewEveryDays === 'number' && Number.isFinite(override.reviewEveryDays) && override.reviewEveryDays > 0
        ? override.reviewEveryDays
        : base.reviewEveryDays,
  };
}

function overrideMapForLocale(locale: Locale) {
  const overrides = guidesByLocale[locale].guides || [];
  return new Map(overrides.map((override) => [override.stateSlug, override]));
}

function withLocaleOverrides(locale: Locale): StateGuide[] {
  if (locale === 'en') {
    return englishGuides;
  }

  const overrides = overrideMapForLocale(locale);
  return englishGuides.map((guide) => mergeGuide(guide, overrides.get(guide.stateSlug)));
}

export function buildStateGuideSlug(stateSlug: string) {
  return `everything-you-need-to-know-about-${stateSlug}`;
}

export function stateGuidePathBySlug(slug: string) {
  return `/state-guides/${slug}`;
}

export function stateGuidePathByState(stateSlug: string) {
  return `/state-guides/${buildStateGuideSlug(stateSlug)}`;
}

export function getStateGuideHubCopy(locale: Locale) {
  return mergeHubCopy(locale);
}

export function getAllStateGuides(locale: Locale, options?: { includeDraft?: boolean }) {
  const includeDraft = options?.includeDraft ?? false;
  const guides = withLocaleOverrides(locale);
  if (includeDraft) return guides;
  return guides.filter((guide) => guide.status === 'published');
}

export function getAllStateGuideSlugs(options?: { includeDraft?: boolean }) {
  const includeDraft = options?.includeDraft ?? false;
  if (includeDraft) {
    return englishGuides.map((guide) => guide.slug);
  }

  return englishGuides.filter((guide) => guide.status === 'published').map((guide) => guide.slug);
}

export function getStateGuideBySlug(locale: Locale, slug: string) {
  const englishGuide = englishGuideBySlug.get(slug);
  if (!englishGuide) return null;

  if (locale === 'en') return englishGuide;

  const localized = overrideMapForLocale(locale).get(englishGuide.stateSlug);
  return mergeGuide(englishGuide, localized);
}

export function getStateGuideByStateSlug(locale: Locale, stateSlug: string) {
  const englishGuide = englishGuideByState.get(stateSlug);
  if (!englishGuide) return null;

  if (locale === 'en') return englishGuide;

  const localized = overrideMapForLocale(locale).get(stateSlug);
  return mergeGuide(englishGuide, localized);
}
