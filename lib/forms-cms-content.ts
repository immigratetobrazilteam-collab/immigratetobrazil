import enForms from '@/content/cms/forms/en.json';
import ptForms from '@/content/cms/forms/pt.json';
import { getMasterLocaleSection } from '@/lib/master-cms-content';
import type { Locale } from '@/lib/types';

export type ManagedOption = { value: string; label: string };

export type FormsCmsCopy = {
  locale: Locale;
  serviceSelect: {
    label: string;
    placeholder: string;
    options: ManagedOption[];
  };
  endpoints: {
    generalContact: string;
    consultation: string;
    consultationDocuments: string;
    clientPortalUpload: string;
    clientPortalForms: string;
    clientPortalReminder: string;
    strategyConsultation: string;
    emailNotice: string;
  };
  uploadFallback: {
    blockedMessage: string;
    emailLabel: string;
    whatsappLabel: string;
  };
};

const formsByLocale: Record<Locale, FormsCmsCopy> = {
  en: getMasterLocaleSection<FormsCmsCopy>('forms', 'en', enForms as FormsCmsCopy),
  pt: getMasterLocaleSection<FormsCmsCopy>('forms', 'pt', ptForms as FormsCmsCopy),
};

export function getFormsCmsCopy(locale: Locale): FormsCmsCopy {
  return formsByLocale[locale] || formsByLocale.en;
}
