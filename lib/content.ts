import type { BlogHighlight, Locale, ProcessStep, ServiceCard, StatItem } from '@/lib/types';

const trustStats: Record<Locale, StatItem[]> = {
  en: [
    { value: '8k+', label: 'Legacy pages now supported through dynamic routing' },
    { value: '3', label: 'Built-in languages (EN, ES, PT)' },
    { value: '27', label: 'State-level strategy coverage' },
    { value: '24/7', label: 'Secure lead intake pipeline availability' },
  ],
  fr: [
    { value: '8k+', label: 'Legacy pages now supported through dynamic routing' },
    { value: '3', label: 'Built-in languages (EN, ES, PT, FR)' },
    { value: '27', label: 'State-level strategy coverage' },
    { value: '24/7', label: 'Secure lead intake pipeline availability' },
  ],
  es: [
    { value: '8k+', label: 'Páginas heredadas soportadas por rutas dinámicas' },
    { value: '3', label: 'Idiomas integrados (EN, ES, PT)' },
    { value: '27', label: 'Cobertura estratégica por estado' },
    { value: '24/7', label: 'Disponibilidad de captación segura de clientes' },
  ],
  pt: [
    { value: '8k+', label: 'Páginas legadas atendidas por rotas dinâmicas' },
    { value: '3', label: 'Idiomas nativos (EN, ES, PT)' },
    { value: '27', label: 'Cobertura estratégica por estado' },
    { value: '24/7', label: 'Disponibilidade do funil seguro de atendimento' },
  ],
};

const serviceCards: Record<Locale, ServiceCard[]> = {
  en: [
    {
      slug: 'visa-strategy',
      title: 'Visa Strategy and Eligibility',
      description:
        'Profile-led visa mapping for work, investor, digital nomad, family, retirement, and special categories.',
      highlights: ['Risk scoring', 'Document matrix', 'Timeline forecast'],
    },
    {
      slug: 'residency-execution',
      title: 'Residency Application Execution',
      description:
        'End-to-end management of submissions, supporting records, sworn translations, and procedural follow-through.',
      highlights: ['Checklist control', 'Case ownership', 'Compliance monitoring'],
    },
    {
      slug: 'post-arrival',
      title: 'Post-Arrival Integration',
      description:
        'Operational setup for CPF, CRNM/RNE, housing, schooling, banking, and local onboarding pathways.',
      highlights: ['Relocation workflow', 'Partner referrals', 'Settlement playbook'],
    },
  ],
  fr: [
    {
      slug: 'visa-strategy',
      title: 'Visa Strategy and Eligibility',
      description:
        'Profile-led visa mapping for work, investor, digital nomad, family, retirement, and special categories.',
      highlights: ['Risk scoring', 'Document matrix', 'Timeline forecast'],
    },
    {
      slug: 'residency-execution',
      title: 'Residency Application Execution',
      description:
        'End-to-end management of submissions, supporting records, sworn translations, and procedural follow-through.',
      highlights: ['Checklist control', 'Case ownership', 'Compliance monitoring'],
    },
    {
      slug: 'post-arrival',
      title: 'Post-Arrival Integration',
      description:
        'Operational setup for CPF, CRNM/RNE, housing, schooling, banking, and local onboarding pathways.',
      highlights: ['Relocation workflow', 'Partner referrals', 'Settlement playbook'],
    },
  ],
  es: [
    {
      slug: 'visa-strategy',
      title: 'Estrategia de Visa y Elegibilidad',
      description:
        'Mapeo de visa según perfil para trabajo, inversión, nómada digital, familia, jubilación y categorías especiales.',
      highlights: ['Evaluación de riesgo', 'Matriz documental', 'Pronóstico de plazos'],
    },
    {
      slug: 'residency-execution',
      title: 'Ejecución de Residencia',
      description:
        'Gestión integral de solicitud, registros de soporte, traducciones juradas y seguimiento del proceso.',
      highlights: ['Control de checklist', 'Responsable de caso', 'Monitoreo de cumplimiento'],
    },
    {
      slug: 'post-arrival',
      title: 'Integración Post-Llegada',
      description:
        'Configuración operativa para CPF, CRNM/RNE, vivienda, educación, banca y adaptación local.',
      highlights: ['Flujo de relocalización', 'Red de aliados', 'Guía de instalación'],
    },
  ],
  pt: [
    {
      slug: 'visa-strategy',
      title: 'Estratégia de Visto e Elegibilidade',
      description:
        'Mapeamento de visto por perfil para trabalho, investimento, nômade digital, família, aposentadoria e categorias especiais.',
      highlights: ['Pontuação de risco', 'Matriz documental', 'Projeção de prazo'],
    },
    {
      slug: 'residency-execution',
      title: 'Execução de Residência',
      description:
        'Gestão completa da solicitação, documentação de suporte, traduções juramentadas e acompanhamento processual.',
      highlights: ['Controle de checklist', 'Gestão de caso', 'Monitoramento de conformidade'],
    },
    {
      slug: 'post-arrival',
      title: 'Integração Pós-Chegada',
      description:
        'Estruturação operacional para CPF, CRNM/RNE, moradia, escola, banco e integração local.',
      highlights: ['Fluxo de relocação', 'Rede de parceiros', 'Playbook de estabelecimento'],
    },
  ],
};

const processSteps: Record<Locale, ProcessStep[]> = {
  en: [
    {
      title: 'Strategy Intake',
      description: 'We audit profile, goals, timeline, and dependencies to define the legally viable immigration path.',
    },
    {
      title: 'Document Architecture',
      description: 'All required records are mapped with source authority, translation status, and validity windows.',
    },
    {
      title: 'Submission and Tracking',
      description: 'Applications are filed with structured QA and status tracking until adjudication milestones.',
    },
    {
      title: 'Arrival and Stabilization',
      description: 'Post-approval support covers registration, practical setup, and continuity planning.',
    },
  ],
  fr: [
    {
      title: 'Strategy Intake',
      description: 'We audit profile, goals, timeline, and dependencies to define the legally viable immigration path.',
    },
    {
      title: 'Document Architecture',
      description: 'All required records are mapped with source authority, translation status, and validity windows.',
    },
    {
      title: 'Submission and Tracking',
      description: 'Applications are filed with structured QA and status tracking until adjudication milestones.',
    },
    {
      title: 'Arrival and Stabilization',
      description: 'Post-approval support covers registration, practical setup, and continuity planning.',
    },
  ],
  es: [
    {
      title: 'Diagnóstico Estratégico',
      description: 'Auditamos perfil, objetivos, plazos y dependencias para definir la ruta migratoria viable.',
    },
    {
      title: 'Arquitectura Documental',
      description: 'Se mapea cada documento con entidad emisora, traducción y vigencia.',
    },
    {
      title: 'Presentación y Seguimiento',
      description: 'La solicitud se presenta con control de calidad y seguimiento hasta hitos de decisión.',
    },
    {
      title: 'Llegada y Estabilización',
      description: 'Soporte posterior para registros, adaptación práctica y continuidad del plan.',
    },
  ],
  pt: [
    {
      title: 'Diagnóstico Estratégico',
      description: 'Auditamos perfil, objetivos, prazo e dependências para definir a rota migratória viável.',
    },
    {
      title: 'Arquitetura Documental',
      description: 'Cada documento é mapeado com órgão emissor, tradução e prazo de validade.',
    },
    {
      title: 'Protocolo e Acompanhamento',
      description: 'O processo é protocolado com controle de qualidade e rastreio até cada marco.',
    },
    {
      title: 'Chegada e Estabilização',
      description: 'Apoio pós-aprovação para registros, estruturação prática e continuidade.',
    },
  ],
};

const blogHighlights: Record<Locale, BlogHighlight[]> = {
  en: [
    {
      slug: 'visa-document-quality',
      title: 'Why documentation quality beats speed in immigration filings',
      summary: 'A practical framework for reducing denial risk before submission.',
    },
    {
      slug: 'state-selection-framework',
      title: 'How to select the right Brazilian state for your relocation profile',
      summary: 'A location matrix balancing cost, legal workflows, and integration factors.',
    },
    {
      slug: 'residency-to-citizenship-roadmap',
      title: 'Residency-to-citizenship planning: milestones and blind spots',
      summary: 'A multi-year strategy for legal continuity and long-term residence goals.',
    },
  ],
  fr: [
    {
      slug: 'visa-document-quality',
      title: 'Why documentation quality beats speed in immigration filings',
      summary: 'A practical framework for reducing denial risk before submission.',
    },
    {
      slug: 'state-selection-framework',
      title: 'How to select the right Brazilian state for your relocation profile',
      summary: 'A location matrix balancing cost, legal workflows, and integration factors.',
    },
    {
      slug: 'residency-to-citizenship-roadmap',
      title: 'Residency-to-citizenship planning: milestones and blind spots',
      summary: 'A multi-year strategy for legal continuity and long-term residence goals.',
    },
  ],
  es: [
    {
      slug: 'visa-document-quality',
      title: 'Por qué la calidad documental supera la velocidad en migración',
      summary: 'Marco práctico para reducir riesgo de rechazo antes de presentar.',
    },
    {
      slug: 'state-selection-framework',
      title: 'Cómo elegir el estado correcto en Brasil para tu perfil',
      summary: 'Matriz de ubicación entre costo, procesos legales e integración.',
    },
    {
      slug: 'residency-to-citizenship-roadmap',
      title: 'Ruta de residencia a ciudadanía: hitos y puntos ciegos',
      summary: 'Estrategia de varios años para continuidad legal y objetivos de largo plazo.',
    },
  ],
  pt: [
    {
      slug: 'visa-document-quality',
      title: 'Por que a qualidade documental supera a velocidade no processo migratório',
      summary: 'Estrutura prática para reduzir risco de indeferimento antes do protocolo.',
    },
    {
      slug: 'state-selection-framework',
      title: 'Como escolher o estado ideal no Brasil para seu perfil',
      summary: 'Matriz de localização com custo, fluxo jurídico e integração local.',
    },
    {
      slug: 'residency-to-citizenship-roadmap',
      title: 'Roteiro de residência para cidadania: marcos e riscos ocultos',
      summary: 'Estratégia plurianual para continuidade legal e objetivos de longo prazo.',
    },
  ],
};

export function getTrustStats(locale: Locale) {
  return trustStats[locale];
}

export function getServiceCards(locale: Locale) {
  return serviceCards[locale];
}

export function getProcessSteps(locale: Locale) {
  return processSteps[locale];
}

export function getBlogHighlights(locale: Locale) {
  return blogHighlights[locale];
}
