import enPageCopy from '@/content/cms/page-copy/en.json';
import esPageCopy from '@/content/cms/page-copy/es.json';
import ptPageCopy from '@/content/cms/page-copy/pt.json';
import type { Locale } from '@/lib/types';

type TitleDetail = {
  title: string;
  detail: string;
};

type ApplyBrazilCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: TitleDetail[];
  checklistTitle: string;
  checklist: string[];
  buttonLabel: string;
};

type CostOfLivingBrazilCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: TitleDetail[];
};

type ResourcesGuidesBrazilCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: TitleDetail[];
  legacyArchiveTitle: string;
  legacyArchiveSubtitle: string;
};

type VisaConsultationCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  blocks: TitleDetail[];
};

type PageCmsCopy = {
  locale: Locale;
  applyBrazil: ApplyBrazilCopy;
  costOfLivingBrazil: CostOfLivingBrazilCopy;
  resourcesGuidesBrazil: ResourcesGuidesBrazilCopy;
  visaConsultation: VisaConsultationCopy;
};

const pageCmsCopyByLocale: Record<Locale, PageCmsCopy> = {
  en: enPageCopy as PageCmsCopy,
  es: esPageCopy as PageCmsCopy,
  pt: ptPageCopy as PageCmsCopy,
};

export function getPageCmsCopy(locale: Locale) {
  return pageCmsCopyByLocale[locale];
}
