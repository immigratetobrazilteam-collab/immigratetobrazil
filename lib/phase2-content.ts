import { stateBySlug, type BrazilianState } from '@/content/curated/states';
import { getPolicyCmsCopy, getStateCmsCopy } from '@/lib/cms-content';
import { getManagedPageCopy } from '@/lib/site-cms-content';
import type { Locale } from '@/lib/types';

const regionLabels: Record<Locale, Record<BrazilianState['region'], string>> = {
  en: {
    north: 'North Region',
    northeast: 'Northeast Region',
    'central-west': 'Central-West Region',
    southeast: 'Southeast Region',
    south: 'South Region',
  },
  es: {
    north: 'Región Norte',
    northeast: 'Región Nordeste',
    'central-west': 'Región Centro-Oeste',
    southeast: 'Región Sudeste',
    south: 'Región Sur',
  },
  pt: {
    north: 'Região Norte',
    northeast: 'Região Nordeste',
    'central-west': 'Região Centro-Oeste',
    southeast: 'Região Sudeste',
    south: 'Região Sul',
  },
  fr: {
    north: 'Région Nord',
    northeast: 'Région Nord-Est',
    'central-west': 'Région Centre-Ouest',
    southeast: 'Région Sud-Est',
    south: 'Région Sud',
  },
};

export function getStateOrNull(stateSlug: string) {
  return stateBySlug.get(stateSlug) ?? null;
}

export function stateName(state: BrazilianState, locale: Locale) {
  return state[locale];
}

export function regionLabel(state: BrazilianState, locale: Locale) {
  return regionLabels[locale][state.region];
}

type TokenName = 'state' | 'region' | 'capital';

function tokenMap(state: BrazilianState, locale: Locale): Record<TokenName, string> {
  return {
    state: stateName(state, locale),
    region: regionLabel(state, locale),
    capital: state.capital,
  };
}

function renderTextTemplate(input: string, state: BrazilianState, locale: Locale) {
  const tokens = tokenMap(state, locale);
  return input.replace(/{{\s*(state|region|capital)\s*}}/g, (_match, key: TokenName) => tokens[key]);
}

function renderTitleDetailItems(
  items: Array<{ title: string; detail: string }>,
  state: BrazilianState,
  locale: Locale,
) {
  return items.map((item) => ({
    title: renderTextTemplate(item.title, state, locale),
    detail: renderTextTemplate(item.detail, state, locale),
  }));
}

function renderFaqItems(items: Array<{ q: string; a: string }>, state: BrazilianState, locale: Locale) {
  return items.map((item) => ({
    q: renderTextTemplate(item.q, state, locale),
    a: renderTextTemplate(item.a, state, locale),
  }));
}

export function contactStateCopy(locale: Locale, state: BrazilianState) {
  const cms = getStateCmsCopy(locale, state.slug).contact;
  return {
    title: renderTextTemplate(cms.title, state, locale),
    subtitle: renderTextTemplate(cms.subtitle, state, locale),
    cards: renderTitleDetailItems(cms.cards, state, locale),
  };
}

export function faqStateCopy(locale: Locale, state: BrazilianState) {
  const cms = getStateCmsCopy(locale, state.slug).faq;
  return {
    title: renderTextTemplate(cms.title, state, locale),
    subtitle: renderTextTemplate(cms.subtitle, state, locale),
    qa: renderFaqItems(cms.qa, state, locale),
  };
}

export function serviceStateCopy(locale: Locale, state: BrazilianState) {
  const cms = getStateCmsCopy(locale, state.slug).services;
  return {
    title: renderTextTemplate(cms.title, state, locale),
    subtitle: renderTextTemplate(cms.subtitle, state, locale),
    modules: renderTitleDetailItems(cms.modules, state, locale),
  };
}

export function blogStateCopy(locale: Locale, state: BrazilianState) {
  const cms = getStateCmsCopy(locale, state.slug).blog;
  return {
    title: renderTextTemplate(cms.title, state, locale),
    subtitle: renderTextTemplate(cms.subtitle, state, locale),
    sections: renderTitleDetailItems(cms.sections, state, locale),
  };
}

export function policyCopy(locale: Locale, policy: string) {
  const managedPolicyEntries = getManagedPageCopy<
    Array<{
      slug: string;
      title: string;
      paragraphs: string[];
    }>
  >(locale, 'policyEntries');

  const managedPolicy = managedPolicyEntries?.find((entry) => entry.slug === policy);
  if (managedPolicy?.title && Array.isArray(managedPolicy.paragraphs) && managedPolicy.paragraphs.length >= 1) {
    return {
      title: managedPolicy.title,
      paragraphs: managedPolicy.paragraphs,
    };
  }

  const cmsPolicy = getPolicyCmsCopy(locale, policy);
  if (cmsPolicy) {
    return cmsPolicy;
  }

  const labels: Record<string, Record<Locale, string>> = {
    privacy: { en: 'Privacy Policy', es: 'Política de Privacidad', pt: 'Política de Privacidade', fr: 'Politique de confidentialité' },
    terms: { en: 'Terms of Service', es: 'Términos del Servicio', pt: 'Termos de Serviço', fr: "Conditions d'utilisation" },
    cookies: { en: 'Cookies Policy', es: 'Política de Cookies', pt: 'Política de Cookies', fr: 'Politique des cookies' },
    gdpr: { en: 'Data Protection Notice', es: 'Aviso de Protección de Datos', pt: 'Aviso de Proteção de Dados', fr: 'Avis de protection des données' },
    refund: { en: 'Refund Policy', es: 'Política de Reembolsos', pt: 'Política de Reembolso', fr: 'Politique de remboursement' },
    disclaimers: { en: 'Legal Disclaimers', es: 'Avisos Legales', pt: 'Avisos Legais', fr: 'Mentions légales' },
  };

  const title = labels[policy]?.[locale] || policy;

  const defaultText: Record<Locale, string[]> = {
    en: [
      'This policy page has been migrated into the modern architecture with standardized legal structure.',
      'Information on this website is general and does not create attorney-client representation unless explicitly confirmed by contract.',
      'Policy details should be reviewed periodically as legal and operational frameworks evolve.',
    ],
    es: [
      'Esta política fue migrada al nuevo sistema con estructura legal estandarizada.',
      'La información publicada es general y no constituye representación legal sin contrato formal.',
      'El contenido debe revisarse periódicamente por cambios normativos u operativos.',
    ],
    pt: [
      'Esta política foi migrada para o novo sistema com estrutura jurídica padronizada.',
      'As informações são gerais e não constituem representação jurídica sem contrato formal.',
      'O conteúdo deve ser revisado periodicamente por mudanças normativas ou operacionais.',
    ],
    fr: [
      'Cette politique a été migrée vers le nouveau système avec une structure juridique standardisée.',
      "Les informations publiées sont générales et ne constituent pas une représentation juridique sans contrat formel.",
      'Le contenu doit être revu régulièrement selon les changements réglementaires ou opérationnels.',
    ],
  };

  return {
    title,
    paragraphs: defaultText[locale],
  };
}
