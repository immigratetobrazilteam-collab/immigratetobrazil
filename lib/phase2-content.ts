import { stateBySlug, type BrazilianState } from '@/content/curated/states';
import { getPolicyCmsCopy, getStateCmsCopy } from '@/lib/cms-content';
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
    north: 'Region Norte',
    northeast: 'Region Nordeste',
    'central-west': 'Region Centro-Oeste',
    southeast: 'Region Sudeste',
    south: 'Region Sur',
  },
  pt: {
    north: 'Regiao Norte',
    northeast: 'Regiao Nordeste',
    'central-west': 'Regiao Centro-Oeste',
    southeast: 'Regiao Sudeste',
    south: 'Regiao Sul',
  },
};

type TitleDetail = {
  title: string;
  detail: string;
};

type QAItem = {
  q: string;
  a: string;
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

function interpolate(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => vars[key] || '');
}

function interpolateTitleDetail(items: TitleDetail[], vars: Record<string, string>) {
  return items.map((item) => ({
    title: interpolate(item.title, vars),
    detail: interpolate(item.detail, vars),
  }));
}

function interpolateQa(items: QAItem[], vars: Record<string, string>) {
  return items.map((item) => ({
    q: interpolate(item.q, vars),
    a: interpolate(item.a, vars),
  }));
}

function stateTemplateVars(locale: Locale, state: BrazilianState) {
  return {
    state: stateName(state, locale),
    region: regionLabel(state, locale),
    capital: state.capital,
    stateCode: state.code,
  };
}

export function contactStateCopy(locale: Locale, state: BrazilianState) {
  const vars = stateTemplateVars(locale, state);
  const template = getStateCmsCopy(locale, state.slug).contact;

  return {
    title: interpolate(template.title, vars),
    subtitle: interpolate(template.subtitle, vars),
    cards: interpolateTitleDetail(template.cards, vars),
  };
}

export function faqStateCopy(locale: Locale, state: BrazilianState) {
  const vars = stateTemplateVars(locale, state);
  const template = getStateCmsCopy(locale, state.slug).faq;

  return {
    title: interpolate(template.title, vars),
    subtitle: interpolate(template.subtitle, vars),
    qa: interpolateQa(template.qa, vars),
  };
}

export function serviceStateCopy(locale: Locale, state: BrazilianState) {
  const vars = stateTemplateVars(locale, state);
  const template = getStateCmsCopy(locale, state.slug).services;

  return {
    title: interpolate(template.title, vars),
    subtitle: interpolate(template.subtitle, vars),
    modules: interpolateTitleDetail(template.modules, vars),
  };
}

export function blogStateCopy(locale: Locale, state: BrazilianState) {
  const vars = stateTemplateVars(locale, state);
  const template = getStateCmsCopy(locale, state.slug).blog;

  return {
    title: interpolate(template.title, vars),
    subtitle: interpolate(template.subtitle, vars),
    sections: interpolateTitleDetail(template.sections, vars),
  };
}

export function policyCopy(locale: Locale, policy: string) {
  const policyEntry = getPolicyCmsCopy(locale, policy);

  if (policyEntry) {
    return {
      title: policyEntry.title,
      paragraphs: policyEntry.paragraphs,
    };
  }

  const fallback: Record<Locale, string[]> = {
    en: ['Policy content is being updated. Please contact support for the current legal version.'],
    es: ['El contenido de esta politica esta en actualizacion. Contacte soporte para la version legal vigente.'],
    pt: ['O conteudo desta politica esta em atualizacao. Contate o suporte para a versao legal vigente.'],
  };

  return {
    title: policy,
    paragraphs: fallback[locale],
  };
}
