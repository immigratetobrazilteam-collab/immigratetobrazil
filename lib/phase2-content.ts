import { stateBySlug, type BrazilianState } from '@/content/curated/states';
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

export function contactStateCopy(locale: Locale, state: BrazilianState) {
  const name = stateName(state, locale);
  const region = regionLabel(state, locale);

  if (locale === 'es') {
    return {
      title: `Contacto migratorio para ${name}`,
      subtitle: `Soporte estratégico para perfiles que desean establecerse en ${name} (${region}), con operación base en ${state.capital}.`,
      cards: [
        { title: 'Diagnóstico inicial', detail: 'Revisión de perfil, objetivo migratorio y nivel de riesgo documental.' },
        { title: 'Ruta estatal', detail: `Plan de ejecución adaptado a procesos locales de ${name}.` },
        { title: 'Coordinación operativa', detail: 'Checklist, traducciones y agenda de presentación con control de plazos.' },
      ],
    };
  }

  if (locale === 'pt') {
    return {
      title: `Contato migratório para ${name}`,
      subtitle: `Suporte estratégico para perfis que desejam se estabelecer em ${name} (${region}), com base operacional em ${state.capital}.`,
      cards: [
        { title: 'Diagnóstico inicial', detail: 'Revisão de perfil, objetivo migratório e nível de risco documental.' },
        { title: 'Rota estadual', detail: `Plano de execução adaptado aos fluxos locais de ${name}.` },
        { title: 'Coordenação operacional', detail: 'Checklist, traduções e agenda de protocolo com controle de prazos.' },
      ],
    };
  }

  return {
    title: `Immigration contact for ${name}`,
    subtitle: `Strategic support for relocation profiles targeting ${name} (${region}), with base operations centered on ${state.capital}.`,
    cards: [
      { title: 'Initial assessment', detail: 'Profile review, immigration objective mapping, and document risk scoring.' },
      { title: 'State-level route', detail: `Execution plan aligned to ${name}'s local operational realities.` },
      { title: 'Operational coordination', detail: 'Checklist ownership, translation workflow, and filing timeline control.' },
    ],
  };
}

export function faqStateCopy(locale: Locale, state: BrazilianState) {
  const name = stateName(state, locale);

  if (locale === 'es') {
    return {
      title: `FAQ de inmigración para ${name}`,
      subtitle: 'Preguntas comunes para planificación, documentación y regularización migratoria.',
      qa: [
        { q: `¿Puedo iniciar mi proceso antes de mudarme a ${name}?`, a: 'Sí. La estrategia documental y gran parte de la preparación puede hacerse de forma remota.' },
        { q: '¿Cuánto tarda un caso típico?', a: 'Depende de categoría, documentación y agenda de autoridades. El plan incluye márgenes de seguridad.' },
        { q: '¿Ofrecen apoyo post-llegada?', a: 'Sí. Incluye fases de CPF, registro migratorio y coordinación de instalación local.' },
      ],
    };
  }

  if (locale === 'pt') {
    return {
      title: `FAQ de imigração para ${name}`,
      subtitle: 'Perguntas comuns sobre planejamento, documentação e regularização migratória.',
      qa: [
        { q: `Posso iniciar o processo antes de mudar para ${name}?`, a: 'Sim. A estratégia documental e boa parte da preparação podem ser feitas de forma remota.' },
        { q: 'Quanto tempo leva um caso típico?', a: 'Depende da categoria, documentação e agenda dos órgãos. O plano inclui margem de segurança.' },
        { q: 'Há suporte pós-chegada?', a: 'Sim. Inclui etapas de CPF, registro migratório e coordenação de instalação local.' },
      ],
    };
  }

  return {
    title: `Immigration FAQ for ${name}`,
    subtitle: 'Frequent questions for planning, documentation, and legal regularization.',
    qa: [
      { q: `Can I start the process before relocating to ${name}?`, a: 'Yes. Document architecture and major preparation steps can be completed remotely.' },
      { q: 'How long does a typical case take?', a: 'It depends on category, evidence quality, and authority timelines. We model a conservative schedule.' },
      { q: 'Do you provide post-arrival support?', a: 'Yes. We cover CPF, immigration registration, and practical onboarding phases.' },
    ],
  };
}

export function serviceStateCopy(locale: Locale, state: BrazilianState) {
  const name = stateName(state, locale);

  if (locale === 'es') {
    return {
      title: `Servicios para inmigrar a ${name}`,
      subtitle: 'Migración de la página estatal hacia una plantilla moderna con control operacional.',
      modules: [
        { title: 'Estrategia de visa', detail: 'Elegibilidad y ruta legal según perfil familiar, laboral o inversionista.' },
        { title: 'Ejecución de residencia', detail: 'Gestión integral de solicitud y documentación crítica.' },
        { title: 'Integración local', detail: `Plan de llegada y estabilización para vivir en ${name}.` },
      ],
    };
  }

  if (locale === 'pt') {
    return {
      title: `Serviços para imigrar para ${name}`,
      subtitle: 'Migração da página estadual para um template moderno com controle operacional.',
      modules: [
        { title: 'Estratégia de visto', detail: 'Elegibilidade e rota jurídica conforme perfil familiar, profissional ou investidor.' },
        { title: 'Execução de residência', detail: 'Gestão completa de protocolo e documentação crítica.' },
        { title: 'Integração local', detail: `Plano de chegada e estabilização para viver em ${name}.` },
      ],
    };
  }

  return {
    title: `Services to immigrate to ${name}`,
    subtitle: 'State migration page rebuilt into the modern architecture with operational governance.',
    modules: [
      { title: 'Visa strategy', detail: 'Eligibility mapping and legal route selection by profile.' },
      { title: 'Residency execution', detail: 'End-to-end filing management and document quality control.' },
      { title: 'Local integration', detail: `Arrival and stabilization plan for living in ${name}.` },
    ],
  };
}

export function blogStateCopy(locale: Locale, state: BrazilianState) {
  const name = stateName(state, locale);

  if (locale === 'es') {
    return {
      title: `Guía estratégica para vivir en ${name}`,
      subtitle: `Contenido migrado del blog estatal para ${name}, actualizado al nuevo sistema editorial.`,
      sections: [
        { title: 'Contexto local', detail: `Resumen operativo de costo, servicios y dinámica de instalación en ${name}.` },
        { title: 'Riesgos y oportunidades', detail: 'Qué validar antes de firmar contratos o iniciar compromisos financieros.' },
        { title: 'Ejecución recomendada', detail: 'Secuencia práctica para llegada, regularización y adaptación.' },
      ],
    };
  }

  if (locale === 'pt') {
    return {
      title: `Guia estratégico para viver em ${name}`,
      subtitle: `Conteúdo migrado do blog estadual de ${name}, agora no novo sistema editorial.`,
      sections: [
        { title: 'Contexto local', detail: `Resumo operacional de custo, serviços e dinâmica de instalação em ${name}.` },
        { title: 'Riscos e oportunidades', detail: 'O que validar antes de assumir contratos ou compromissos financeiros.' },
        { title: 'Execução recomendada', detail: 'Sequência prática para chegada, regularização e adaptação.' },
      ],
    };
  }

  return {
    title: `Strategic relocation guide for ${name}`,
    subtitle: `State-focused legacy blog content for ${name} migrated into the modern publishing architecture.`,
    sections: [
      { title: 'Local context', detail: `Operational summary on cost, services, and onboarding dynamics in ${name}.` },
      { title: 'Risk and opportunity map', detail: 'What to validate before contract commitments or financial decisions.' },
      { title: 'Execution sequence', detail: 'Practical order of operations for arrival, regularization, and stabilization.' },
    ],
  };
}

export function policyCopy(locale: Locale, policy: string) {
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
