import type { Locale, NavLink } from '@/lib/types';

export const locales: Locale[] = ['en', 'es', 'pt', 'fr'];
export const defaultLocale: Locale = 'en';

interface LocaleCopy {
  brand: string;
  nav: Omit<Record<'home' | 'about' | 'services' | 'process' | 'resources' | 'blog' | 'faq' | 'library' | 'contact', string>, never>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    highlightsTitle: string;
    highlights: string[];
  };
  sections: {
    servicesTitle: string;
    servicesSubtitle: string;
    processTitle: string;
    processSubtitle: string;
    trustTitle: string;
    migrationTitle: string;
    migrationSubtitle: string;
    blogTitle: string;
    blogSubtitle: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  contact: {
    title: string;
    subtitle: string;
    consultation: string;
    whatsapp: string;
    email: string;
  };
  footer: {
    tagline: string;
    legal: string;
  };
}

export const copy: Record<Locale, LocaleCopy> = {
  en: {
    brand: 'Immigrate to Brazil',
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      process: 'Process',
      resources: 'Resources',
      blog: 'Insights',
      faq: 'FAQ',
      library: 'All Pages',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Trusted Immigration Advisory',
      title: 'A modern path to Brazil residency, visas, and legal certainty',
      subtitle:
        'Premium relocation strategy built for families, investors, remote professionals, and retirees who want compliant, low-risk immigration execution.',
      primaryCta: 'Book Strategy Consultation',
      secondaryCta: 'Explore Services',
      highlightsTitle: 'What this platform now unlocks',
      highlights: [
        'Unified access to modern and legacy immigration pages',
        'State-by-state service, blog, FAQ, and contact coverage',
        'Structured legal process with quality and compliance controls',
      ],
    },
    sections: {
      servicesTitle: 'Immigration services designed for legal clarity',
      servicesSubtitle:
        'From visa selection to documentation and post-arrival setup, every workflow is structured, auditable, and multilingual.',
      processTitle: 'How the engagement works',
      processSubtitle:
        'A documented, accountable process with transparent milestones and compliance checkpoints.',
      trustTitle: 'Trust markers clients expect from premium advisory firms',
      migrationTitle: 'Legacy content migration system',
      migrationSubtitle:
        'Existing static pages are now bridged into a modern route architecture so scale is no longer limited by manual HTML duplication.',
      blogTitle: 'Recent guidance and updates',
      blogSubtitle: 'Operational insights for visas, residencies, local onboarding, and legal documentation.',
    },
    cta: {
      title: 'Ready to formalize your Brazil move with confidence?',
      subtitle: 'Start with a paid strategy session and receive a concrete roadmap for your profile.',
      button: 'Start Consultation',
    },
    contact: {
      title: 'Talk to an advisor',
      subtitle: 'Share your profile and timeline. We reply with availability and scope within one business day.',
      consultation: 'Consultation Desk',
      whatsapp: 'Secure WhatsApp',
      email: 'Client Email',
    },
    footer: {
      tagline: 'Immigration advisory focused on compliance, documentation quality, and execution certainty.',
      legal: 'Information provided is general guidance and not legal representation until engagement is confirmed.',
    },
  },
  es: {
    brand: 'Inmigrar a Brasil',
    nav: {
      home: 'Inicio',
      about: 'Nosotros',
      services: 'Servicios',
      process: 'Proceso',
      resources: 'Recursos',
      blog: 'Guías',
      faq: 'FAQ',
      library: 'Todas las páginas',
      contact: 'Contacto',
    },
    hero: {
      eyebrow: 'Asesoría Migratoria Confiable',
      title: 'Un camino moderno para residencia, visas y seguridad legal en Brasil',
      subtitle:
        'Estrategia premium para familias, inversionistas, profesionales remotos y jubilados que necesitan ejecución migratoria con bajo riesgo.',
      primaryCta: 'Reservar Consulta Estratégica',
      secondaryCta: 'Ver Servicios',
      highlightsTitle: 'Qué habilita esta plataforma',
      highlights: [
        'Acceso unificado a páginas modernas y heredadas',
        'Cobertura por estado para servicios, blog, FAQ y contacto',
        'Proceso legal estructurado con controles de calidad y cumplimiento',
      ],
    },
    sections: {
      servicesTitle: 'Servicios migratorios con claridad legal',
      servicesSubtitle:
        'Desde la elección de visa hasta la documentación y la llegada, cada flujo está estructurado, auditado y en varios idiomas.',
      processTitle: 'Cómo funciona el proceso',
      processSubtitle:
        'Proceso documentado y transparente con hitos y controles de cumplimiento.',
      trustTitle: 'Indicadores de confianza esperados en asesoría premium',
      migrationTitle: 'Sistema moderno para migrar contenido legado',
      migrationSubtitle:
        'Las páginas estáticas existentes ahora se integran en una arquitectura escalable sin duplicación manual de HTML.',
      blogTitle: 'Guías y actualizaciones recientes',
      blogSubtitle: 'Información operativa sobre visas, residencias y documentación local.',
    },
    cta: {
      title: '¿Listo para planificar tu mudanza a Brasil con certeza?',
      subtitle: 'Empieza con una sesión estratégica y recibe una hoja de ruta concreta para tu perfil.',
      button: 'Iniciar Consulta',
    },
    contact: {
      title: 'Habla con un asesor',
      subtitle: 'Comparte tu perfil y fecha objetivo. Respondemos con disponibilidad y alcance en un día hábil.',
      consultation: 'Mesa de Consultas',
      whatsapp: 'WhatsApp Seguro',
      email: 'Correo de Clientes',
    },
    footer: {
      tagline: 'Asesoría migratoria enfocada en cumplimiento, calidad documental y ejecución confiable.',
      legal: 'La información es orientación general y no constituye representación legal hasta confirmar el servicio.',
    },
  },
  pt: {
    brand: 'Imigrar para o Brasil',
    nav: {
      home: 'Início',
      about: 'Sobre',
      services: 'Serviços',
      process: 'Processo',
      resources: 'Recursos',
      blog: 'Conteúdos',
      faq: 'FAQ',
      library: 'Todas as páginas',
      contact: 'Contato',
    },
    hero: {
      eyebrow: 'Consultoria Migratória de Confiança',
      title: 'Um sistema moderno para residência, vistos e segurança jurídica no Brasil',
      subtitle:
        'Estratégia premium para famílias, investidores, profissionais remotos e aposentados que precisam de execução migratória com previsibilidade.',
      primaryCta: 'Agendar Consulta Estratégica',
      secondaryCta: 'Explorar Serviços',
      highlightsTitle: 'O que esta plataforma habilita',
      highlights: [
        'Acesso unificado a páginas modernas e legadas',
        'Cobertura por estado para serviços, blog, FAQ e contato',
        'Processo jurídico estruturado com controle de qualidade e conformidade',
      ],
    },
    sections: {
      servicesTitle: 'Serviços migratórios com clareza jurídica',
      servicesSubtitle:
        'Da escolha do visto à documentação e instalação, cada fluxo é estruturado, auditável e multilíngue.',
      processTitle: 'Como funciona o atendimento',
      processSubtitle:
        'Processo documentado com marcos transparentes e controles de conformidade.',
      trustTitle: 'Indicadores de confiança esperados em consultoria premium',
      migrationTitle: 'Sistema para migração de conteúdo legado',
      migrationSubtitle:
        'As páginas estáticas existentes agora são conectadas a uma arquitetura moderna e escalável.',
      blogTitle: 'Atualizações e orientações recentes',
      blogSubtitle: 'Insights operacionais sobre vistos, residências, integração local e documentação.',
    },
    cta: {
      title: 'Pronto para organizar sua mudança para o Brasil com segurança?',
      subtitle: 'Comece com uma sessão estratégica e receba um roteiro objetivo para o seu perfil.',
      button: 'Iniciar Consulta',
    },
    contact: {
      title: 'Fale com um consultor',
      subtitle: 'Envie seu perfil e prazo. Respondemos com disponibilidade e escopo em até um dia útil.',
      consultation: 'Central de Consultoria',
      whatsapp: 'WhatsApp Seguro',
      email: 'E-mail de Atendimento',
    },
    footer: {
      tagline: 'Consultoria migratória focada em conformidade, qualidade documental e execução segura.',
      legal: 'As informações são orientações gerais e não constituem representação jurídica sem contratação formal.',
    },
  },
  fr: {
    brand: 'Immigrer au Brésil',
    nav: {
      home: 'Accueil',
      about: 'À propos',
      services: 'Services',
      process: 'Processus',
      resources: 'Ressources',
      blog: 'Guides',
      faq: 'FAQ',
      library: 'Toutes les pages',
      contact: 'Contact',
    },
    hero: {
      eyebrow: "Conseil en immigration de confiance",
      title: 'Une voie moderne vers la résidence, les visas et la sécurité juridique au Brésil',
      subtitle:
        "Stratégie premium conçue pour les familles, investisseurs, professionnels à distance et retraités qui recherchent une exécution migratoire conforme et à faible risque.",
      primaryCta: 'Réserver une consultation stratégique',
      secondaryCta: 'Voir les services',
      highlightsTitle: 'Ce que la plateforme permet',
      highlights: [
        'Accès unifié aux pages modernes et historiques',
        'Couverture par État pour services, blog, FAQ et contact',
        'Processus juridique structuré avec contrôle qualité et conformité',
      ],
    },
    sections: {
      servicesTitle: 'Des services d’immigration conçus pour la clarté juridique',
      servicesSubtitle:
        'Du choix du visa à la documentation et à l’installation, chaque workflow est structuré, auditable et multilingue.',
      processTitle: 'Comment se déroule l’accompagnement',
      processSubtitle:
        'Un processus documenté et transparent avec des jalons clairs et des contrôles de conformité.',
      trustTitle: 'Indicateurs de confiance attendus d’un cabinet premium',
      migrationTitle: 'Système de migration du contenu historique',
      migrationSubtitle:
        "Les pages statiques existantes sont intégrées dans une architecture moderne pour passer à l’échelle sans duplication HTML manuelle.",
      blogTitle: 'Guides et mises à jour récentes',
      blogSubtitle: 'Informations opérationnelles sur les visas, résidences, installation locale et documentation.',
    },
    cta: {
      title: 'Prêt à organiser votre installation au Brésil avec confiance ?',
      subtitle: 'Commencez par une session stratégique et recevez une feuille de route concrète pour votre profil.',
      button: 'Commencer la consultation',
    },
    contact: {
      title: 'Parler à un conseiller',
      subtitle: 'Partagez votre profil et votre calendrier. Nous répondons sous un jour ouvré avec disponibilité et périmètre.',
      consultation: 'Pôle Consultation',
      whatsapp: 'WhatsApp sécurisé',
      email: 'Email client',
    },
    footer: {
      tagline: 'Conseil en immigration axé sur la conformité, la qualité documentaire et la fiabilité d’exécution.',
      legal: 'Les informations fournies sont générales et ne constituent pas une représentation juridique sans engagement formel.',
    },
  },
};

export function resolveLocale(input?: string): Locale {
  if (!input) return defaultLocale;
  return locales.includes(input as Locale) ? (input as Locale) : defaultLocale;
}

export function localeNavLinks(locale: Locale): NavLink[] {
  const t = copy[locale].nav;
  return [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/services`, label: t.services },
    { href: `/${locale}/resources-guides-brazil`, label: t.resources },
    { href: `/${locale}/blog`, label: t.blog },
    { href: `/${locale}/library`, label: t.library },
    { href: `/${locale}/contact`, label: t.contact },
  ];
}
