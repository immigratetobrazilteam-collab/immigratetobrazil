import type { Locale, NavLink } from '@/lib/types';

export const locales: Locale[] = ['en', 'es', 'pt'];
export const defaultLocale: Locale = 'en';

interface LocaleCopy {
  brand: string;
  nav: Omit<Record<'home' | 'about' | 'services' | 'process' | 'blog' | 'contact', string>, never>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
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
      blog: 'Insights',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Trusted Immigration Advisory',
      title: 'A modern path to Brazil residency, visas, and legal certainty',
      subtitle:
        'Premium relocation strategy built for families, investors, remote professionals, and retirees who want compliant, low-risk immigration execution.',
      primaryCta: 'Book Strategy Consultation',
      secondaryCta: 'Explore Services',
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
      blog: 'Guías',
      contact: 'Contacto',
    },
    hero: {
      eyebrow: 'Asesoría Migratoria Confiable',
      title: 'Un camino moderno para residencia, visas y seguridad legal en Brasil',
      subtitle:
        'Estrategia premium para familias, inversionistas, profesionales remotos y jubilados que necesitan ejecución migratoria con bajo riesgo.',
      primaryCta: 'Reservar Consulta Estratégica',
      secondaryCta: 'Ver Servicios',
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
      blog: 'Conteúdos',
      contact: 'Contato',
    },
    hero: {
      eyebrow: 'Consultoria Migratória de Confiança',
      title: 'Um sistema moderno para residência, vistos e segurança jurídica no Brasil',
      subtitle:
        'Estratégia premium para famílias, investidores, profissionais remotos e aposentados que precisam de execução migratória com previsibilidade.',
      primaryCta: 'Agendar Consulta Estratégica',
      secondaryCta: 'Explorar Serviços',
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
    { href: `/${locale}/process`, label: t.process },
    { href: `/${locale}/blog`, label: t.blog },
    { href: `/${locale}/contact`, label: t.contact },
  ];
}
