import enPageCopy from '@/content/cms/page-copy/en.json';
import ptPageCopy from '@/content/cms/page-copy/pt.json';
import { getMasterLocaleSection } from '@/lib/master-cms-content';
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

type ContactPageCopy = {
  formTitle: string;
  formSubtitle: string;
  stateArchiveTitle: string;
  stateArchiveSubtitle: string;
};

type PageCmsCopy = {
  locale: Locale;
  applyBrazil: ApplyBrazilCopy;
  costOfLivingBrazil: CostOfLivingBrazilCopy;
  resourcesGuidesBrazil: ResourcesGuidesBrazilCopy;
  visaConsultation: VisaConsultationCopy;
  contactPage: ContactPageCopy;
};

const pageCmsCopyByLocale: Record<Locale, PageCmsCopy> = {
  en: getMasterLocaleSection<PageCmsCopy>('pageCopy', 'en', enPageCopy as PageCmsCopy),
  pt: getMasterLocaleSection<PageCmsCopy>('pageCopy', 'pt', ptPageCopy as PageCmsCopy),
};

export function getPageCmsCopy(locale: Locale) {
  return pageCmsCopyByLocale[locale];
}
