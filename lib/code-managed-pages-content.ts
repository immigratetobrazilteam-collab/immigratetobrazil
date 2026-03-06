import enCodeManagedPages from '@/content/cms/code-managed-pages/en.json';
import ptCodeManagedPages from '@/content/cms/code-managed-pages/pt.json';
import { getMasterLocaleSection } from '@/lib/master-cms-content';
import type { Locale } from '@/lib/types';

export type ManagedOption = { value: string; label: string };

export type ConsultationPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  includesTitle: string;
  includesItems: string[];
  whoTitle: string;
  whoItems: string[];
  whyTitle: string;
  whyItems: string[];
  formTitle: string;
  formIntro: string;
  formFields: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    nationality: string;
    goal: string;
    visaInterest: string;
    situation: string;
    documents: string;
    selectPlaceholder: string;
  };
  visaOptions: ManagedOption[];
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
  spamMessage: string;
  paymentGateTitle: string;
  paymentGateBody: string;
  bookingFlowTitle: string;
  bookingFlowSteps: string[];
  calendlyTitle: string;
  calendlyBody: string;
  docReminderTitle: string;
  docReminderBody: string;
  docReminderExtra: string;
  docFormTitle: string;
  docFormSubtitle: string;
  docFormFields: {
    name: string;
    email: string;
    file: string;
    notes: string;
  };
  docFormSubmitLabel: string;
  docFormSubmittingLabel: string;
  docFormSuccessMessage: string;
  docFormErrorMessage: string;
  whatsappTitle: string;
  whatsappBody: string;
  whatsappButton: string;
};

export type ClientPortalPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  uploadTitle: string;
  uploadSubtitle: string;
  uploadFields: {
    name: string;
    email: string;
    caseRef: string;
    documents: string;
    notes: string;
  };
  uploadSubmit: string;
  uploadSuccess: string;
  formsTitle: string;
  formsSubtitle: string;
  formsFields: {
    name: string;
    email: string;
    phone: string;
    country: string;
    processStage: string;
    info: string;
  };
  formsSubmit: string;
  formsSuccess: string;
  bookingTitle: string;
  bookingIntro: string;
  bookingSteps: string[];
  whatsappHelp: string;
  whatsappButton: string;
  reminderTitle: string;
  reminderWarning: string;
  reminderFormTitle: string;
  reminderFormFields: {
    name: string;
    email: string;
    file: string;
    notes: string;
  };
  reminderSubmit: string;
  reminderSuccess: string;
  emergencyTitle: string;
  emergencyLabelEmail: string;
  emergencyLabelPhone: string;
  emergencyMessage: string;
  submittingLabel: string;
  spam: string;
  error: string;
};

export type BookStrategyConsultationPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  benefitsTitle: string;
  benefits: string[];
  deliverablesTitle: string;
  deliverables: string[];
  formTitle: string;
  formSubtitle: string;
  fields: {
    name: string;
    email: string;
    phone: string;
    country: string;
    goal: string;
    details: string;
  };
  submit: string;
  submitting: string;
  success: string;
  error: string;
  spam: string;
};

export type EmailUsNoticePageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  howItWorksTitle: string;
  howItWorks: string[];
  formTitle: string;
  formSubtitle: string;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    file: string;
  };
  submit: string;
  submitting: string;
  success: string;
  error: string;
  spam: string;
};

export type SearchPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  staticModeNotice: string;
  quickLinks: {
    services: string;
    states: string;
    library: string;
  };
};

export type PaymentMethodsCopy = {
  title: string;
  subtitle: string;
  receiver: string;
  methods: Array<{
    id: 'paypal' | 'wise' | 'pix' | 'payoneer';
    label: string;
    instructions: string;
    iconLabel: string;
  }>;
};

export type CalendlyEmbedCopy = {
  title: string;
  description: string;
};

export type CodeManagedPagesCopy = {
  locale: Locale;
  consultationPage: ConsultationPageCopy;
  clientPortalPage: ClientPortalPageCopy;
  bookStrategyConsultationPage: BookStrategyConsultationPageCopy;
  emailUsNoticePage: EmailUsNoticePageCopy;
  searchPage: SearchPageCopy;
  paymentMethods: PaymentMethodsCopy;
  calendlyEmbed: CalendlyEmbedCopy;
};

const codeManagedPagesByLocale: Record<Locale, CodeManagedPagesCopy> = {
  en: getMasterLocaleSection<CodeManagedPagesCopy>('codeManagedPages', 'en', enCodeManagedPages as CodeManagedPagesCopy),
  pt: getMasterLocaleSection<CodeManagedPagesCopy>('codeManagedPages', 'pt', ptCodeManagedPages as CodeManagedPagesCopy),
};

export function getCodeManagedPagesCopy(locale: Locale): CodeManagedPagesCopy {
  return codeManagedPagesByLocale[locale] || codeManagedPagesByLocale.en;
}
