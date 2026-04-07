/* =======================================================
   main.js - Shared site behaviors
   - Top utility bar (accessibility + language)
   - Shared header/footer loading
   - Accessibility persistence
   - Breadcrumbs
   - Service page enhancement sections
   ======================================================= */
(() => {
  'use strict';

  const SITE_ORIGIN = 'https://monique-fernandes.com';
  const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr'];
  const A11Y_STORAGE_KEY = 'monique_a11y_settings_v1';
  const LOCALE_STORAGE_KEY = 'monique_locale_preference_v1';
  const NEWSLETTER_FORM_ENDPOINT = 'https://formspree.io/f/myknwjlq';
  const NEWSLETTER_DOWNLOAD_PATH = '/assets/downloads/marketing/monique-fernandes-newsletter.pdf';
  const NEWSLETTER_DOWNLOAD_FILENAME = 'monique-fernandes-newsletter.pdf';
  const EBOOK_GUIDE_DOWNLOAD_PATH = '/assets/downloads/marketing/brazil-immigration-guide-immigration-attorney-brazil.pdf';
  const EBOOK_GUIDE_DOWNLOAD_FILENAME = 'brazil-immigration-guide-immigration-attorney-brazil.pdf';
  const RESIDENCY_GUIDE_DOWNLOAD_PATH = '/assets/downloads/marketing/taking-care-of-your-brazilian-residency-permit.pdf';
  const RESIDENCY_GUIDE_DOWNLOAD_FILENAME = 'taking-care-of-your-brazilian-residency-permit.pdf';
  const WHATSAPP_CONSULT_URL = 'https://wa.me/554399614034?text=Hello%20Dr.%20Monique,%20I%20downloaded%20your%20newsletter%20and%20would%20like%20to%20book%20a%20consultation.';
  const BLOG_LANDING_PATH = '/insights.html';
  const BLOG_LOCALE_STUB_PATH = '/blog.html';
  const LEGAL_NEWS_LANDING_PATH = '/legal-news-updates.html';
  const LEGAL_INSIGHTS_STUB_PATH = '/legal-insights.html';
  const LOCAL_PREVIEW_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);
  const COUNTRY_LANGUAGE_BADGE_OVERRIDES = {
    iw: 'HE',
    'zh-cn': 'ZH'
  };

  const DEFAULT_A11Y_SETTINGS = {
    theme: 'dark',
    fontScale: 100,
    dyslexia: false,
    autism: false,
    blind: false,
    highContrast: false,
    grayscale: false,
    colorProfile: 'none'
  };

  const I18N = {
    en: {
      'brand.tagline': 'Brazilian Attorney for International Clients',

      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.services_overview': 'Practice',
      'nav.services_all': 'All',
      'nav.services_civil': 'Civil',
      'nav.services_family': 'Family',
      'nav.services_human_rights': 'Rights',
      'nav.services_brazil': 'Immigrate to Brazil',
      'nav.services_visas': 'Visas',
      'nav.services_residency': 'Residency',
      'nav.services_citizenship': 'Citizenship',
      'nav.services_other': 'Other',
      'nav.services_abroad': 'Abroad',
      'nav.resources': 'Resources',
      'nav.resources_hub': 'Hub',
      'nav.knowledge': 'Knowledge',
      'nav.glossary': 'Glossary',
      'nav.faq': 'FAQ',
      'nav.journey': 'Journey',
      'nav.practice': 'Practice',
      'nav.docs': 'Docs',
      'nav.blog': 'Blog',
      'nav.fyi': 'FYI',
      'nav.insights': 'Insights',
      'nav.news': 'News',
      'nav.ebook': 'Ebook',
      'nav.search': 'Search',
      'nav.consultation': 'Book Consultation',
      'nav.payment': 'Pay',
      'nav.feedback': 'Feedback',
      'nav.contact': 'Contact',
      'nav.book_cta': 'Book Consultation',

      'footer.tagline': 'Immigration, Civil, Family and Human Rights Law',
      'footer.description':
        'Trusted Brazilian attorney for immigration, civil, family, and human rights legal representation for clients in Brazil and abroad, with clear strategy and bilingual support.',
      'footer.main': 'Main',
      'footer.core': 'Core',
      'footer.law': 'Law',
      'footer.learn': 'Learn',
      'footer.client': 'Client',
      'footer.contact_social': 'Contact',
      'footer.privacy': 'Privacy',
      'footer.consultation': 'Consultation',
      'footer.newsletter': 'Newsletter',
      'footer.sitemap': 'Sitemap',
      'footer.robots': 'Robots',
      'footer.copyright': '© 2018 - <span id="footer-year"></span> Monique Fernandes. All rights reserved.',

      'utility.accessibility': 'Accessibility',

      'lang.en': 'EN',
      'lang.pt': 'PT',
      'lang.es': 'ES',
      'lang.fr': 'FR',

      'a11y.dyslexia': 'Dyslexia-friendly reading',
      'a11y.autism': 'Autism-friendly low stimulus',
      'a11y.blind': 'Blind/screen reader focus',
      'a11y.contrast': 'High contrast',
      'a11y.grayscale': 'Grayscale mode',
      'a11y.color_profile': 'Color-blind profile',
      'a11y.default': 'Default',
      'a11y.protanopia': 'Protanopia-friendly',
      'a11y.deuteranopia': 'Deuteranopia-friendly',
      'a11y.tritanopia': 'Tritanopia-friendly',
      'a11y.text_size': 'Text size',
      'a11y.theme': 'Theme mode',
      'a11y.theme_dark': 'Dark',
      'a11y.theme_light': 'Light',
      'a11y.reset': 'Reset accessibility settings'
    },

    pt: {
      'brand.tagline': 'Advogada Brasileira para Clientes Internacionais',

      'nav.home': 'Inicio',
      'nav.about': 'Sobre',
      'nav.services': 'Servicos',
      'nav.services_overview': 'Pratica',
      'nav.services_all': 'Todos',
      'nav.services_civil': 'Civil',
      'nav.services_family': 'Familia',
      'nav.services_human_rights': 'Direitos',
      'nav.services_brazil': 'Imigrar para o Brasil',
      'nav.services_visas': 'Vistos',
      'nav.services_residency': 'Residencia',
      'nav.services_citizenship': 'Cidadania',
      'nav.services_other': 'Outros',
      'nav.services_abroad': 'Exterior',
      'nav.resources': 'Recursos',
      'nav.resources_hub': 'Hub',
      'nav.knowledge': 'Conhecimento',
      'nav.glossary': 'Glossario',
      'nav.faq': 'FAQ',
      'nav.journey': 'Jornada',
      'nav.practice': 'Pratica',
      'nav.docs': 'Docs',
      'nav.blog': 'Blog',
      'nav.fyi': 'FYI',
      'nav.insights': 'Insights',
      'nav.news': 'Noticias',
      'nav.ebook': 'Ebook',
      'nav.search': 'Busca',
      'nav.consultation': 'Agendar Consulta',
      'nav.payment': 'Pagar',
      'nav.feedback': 'Feedback',
      'nav.contact': 'Contato',
      'nav.book_cta': 'Agendar Consulta',

      'footer.tagline': 'Imigracao, Direito Civil, Familia e Direitos Humanos',
      'footer.description':
        'Representacao juridica confiavel com foco em imigracao, direito civil, familia e direitos humanos para clientes no Brasil e no exterior, com estrategia clara e suporte bilingue.',
      'footer.main': 'Menu',
      'footer.core': 'Base',
      'footer.law': 'Areas',
      'footer.learn': 'Recursos',
      'footer.client': 'Cliente',
      'footer.contact_social': 'Contato',
      'footer.privacy': 'Privacidade',
      'footer.consultation': 'Consulta',
      'footer.newsletter': 'Newsletter',
      'footer.sitemap': 'Mapa do Site',
      'footer.robots': 'Robots',
      'footer.copyright': '© 2018 - <span id="footer-year"></span> Monique Fernandes. Todos os direitos reservados.',

      'utility.accessibility': 'Acessibilidade',

      'lang.en': 'EN',
      'lang.pt': 'PT',
      'lang.es': 'ES',
      'lang.fr': 'FR',

      'a11y.dyslexia': 'Leitura amigavel para dislexia',
      'a11y.autism': 'Modo com baixo estimulo',
      'a11y.blind': 'Foco para leitores de tela',
      'a11y.contrast': 'Alto contraste',
      'a11y.grayscale': 'Modo escala de cinza',
      'a11y.color_profile': 'Perfil para daltonismo',
      'a11y.default': 'Padrao',
      'a11y.protanopia': 'Amigavel para protanopia',
      'a11y.deuteranopia': 'Amigavel para deuteranopia',
      'a11y.tritanopia': 'Amigavel para tritanopia',
      'a11y.text_size': 'Tamanho do texto',
      'a11y.theme': 'Modo de tema',
      'a11y.theme_dark': 'Escuro',
      'a11y.theme_light': 'Claro',
      'a11y.reset': 'Redefinir acessibilidade'
    },

    es: {
      'brand.tagline': 'Abogada Brasileña para Clientes Internacionales',

      'nav.home': 'Inicio',
      'nav.about': 'Sobre',
      'nav.services': 'Servicios',
      'nav.services_overview': 'Practica',
      'nav.services_all': 'Todos',
      'nav.services_civil': 'Civil',
      'nav.services_family': 'Familia',
      'nav.services_human_rights': 'Derechos',
      'nav.services_brazil': 'Inmigrar a Brasil',
      'nav.services_visas': 'Visas',
      'nav.services_residency': 'Residencia',
      'nav.services_citizenship': 'Ciudadania',
      'nav.services_other': 'Otros',
      'nav.services_abroad': 'Exterior',
      'nav.resources': 'Recursos',
      'nav.resources_hub': 'Hub',
      'nav.knowledge': 'Conocimiento',
      'nav.glossary': 'Glosario',
      'nav.faq': 'FAQ',
      'nav.journey': 'Ruta',
      'nav.practice': 'Practica',
      'nav.docs': 'Docs',
      'nav.blog': 'Blog',
      'nav.fyi': 'FYI',
      'nav.insights': 'Analisis',
      'nav.news': 'Noticias',
      'nav.ebook': 'Ebook',
      'nav.search': 'Buscar',
      'nav.consultation': 'Reservar Consulta',
      'nav.payment': 'Pagar',
      'nav.feedback': 'Feedback',
      'nav.contact': 'Contacto',
      'nav.book_cta': 'Reservar Consulta',

      'footer.tagline': 'Inmigracion, Derecho Civil, Familia y Derechos Humanos',
      'footer.description':
        'Representacion legal confiable con enfoque en inmigracion, derecho civil, familia y derechos humanos para clientes en Brasil y en el extranjero, con estrategia clara y apoyo bilingue.',
      'footer.main': 'Menu',
      'footer.core': 'Base',
      'footer.law': 'Areas',
      'footer.learn': 'Recursos',
      'footer.client': 'Cliente',
      'footer.contact_social': 'Contacto',
      'footer.privacy': 'Privacidad',
      'footer.consultation': 'Consulta',
      'footer.newsletter': 'Boletin',
      'footer.sitemap': 'Mapa del Sitio',
      'footer.robots': 'Robots',
      'footer.copyright': '© 2018 - <span id="footer-year"></span> Monique Fernandes. Todos los derechos reservados.',

      'utility.accessibility': 'Accesibilidad',

      'lang.en': 'EN',
      'lang.pt': 'PT',
      'lang.es': 'ES',
      'lang.fr': 'FR',

      'a11y.dyslexia': 'Lectura amigable para dislexia',
      'a11y.autism': 'Modo de bajo estimulo',
      'a11y.blind': 'Enfoque para lector de pantalla',
      'a11y.contrast': 'Alto contraste',
      'a11y.grayscale': 'Modo en escala de grises',
      'a11y.color_profile': 'Perfil para daltonismo',
      'a11y.default': 'Predeterminado',
      'a11y.protanopia': 'Compatible con protanopia',
      'a11y.deuteranopia': 'Compatible con deuteranopia',
      'a11y.tritanopia': 'Compatible con tritanopia',
      'a11y.text_size': 'Tamano del texto',
      'a11y.theme': 'Modo de tema',
      'a11y.theme_dark': 'Oscuro',
      'a11y.theme_light': 'Claro',
      'a11y.reset': 'Restablecer accesibilidad'
    },

    fr: {
      'brand.tagline': 'Avocate brésilienne pour les clients internationaux',

      'nav.home': 'Accueil',
      'nav.about': 'Apropos',
      'nav.services': 'Services',
      'nav.services_overview': 'Pratique',
      'nav.services_all': 'Tous',
      'nav.services_civil': 'Civil',
      'nav.services_family': 'Famille',
      'nav.services_human_rights': 'Droits',
      'nav.services_brazil': 'Immigrer au Bresil',
      'nav.services_visas': 'Visas',
      'nav.services_residency': 'Residence',
      'nav.services_citizenship': 'Citoyennete',
      'nav.services_other': 'Autres',
      'nav.services_abroad': 'Etranger',
      'nav.resources': 'Ressources',
      'nav.resources_hub': 'Hub',
      'nav.knowledge': 'Savoir',
      'nav.glossary': 'Glossaire',
      'nav.faq': 'FAQ',
      'nav.journey': 'Parcours',
      'nav.practice': 'Pratique',
      'nav.docs': 'Docs',
      'nav.blog': 'Blog',
      'nav.fyi': 'FYI',
      'nav.insights': 'Analyses',
      'nav.news': 'Actualites',
      'nav.ebook': 'Ebook',
      'nav.search': 'Recherche',
      'nav.consultation': 'Reserver Consultation',
      'nav.payment': 'Paiement',
      'nav.feedback': 'Feedback',
      'nav.contact': 'Contact',
      'nav.book_cta': 'Reserver Consultation',

      'footer.tagline': 'Immigration, Droit Civil, Famille et Droits Humains',
      'footer.description':
        'Representation juridique fiable axee sur immigration, droit civil, famille et droits humains pour les clients au Bresil et a l etranger, avec une strategie claire et un support bilingue.',
      'footer.main': 'Menu',
      'footer.core': 'Base',
      'footer.law': 'Domaines',
      'footer.learn': 'Ressources',
      'footer.client': 'Client',
      'footer.contact_social': 'Contact',
      'footer.privacy': 'Confidentialite',
      'footer.consultation': 'Consultation',
      'footer.newsletter': 'Newsletter',
      'footer.sitemap': 'Plan du Site',
      'footer.robots': 'Robots',
      'footer.copyright': '© 2018 - <span id="footer-year"></span> Monique Fernandes. Tous droits reserves.',

      'utility.accessibility': 'Accessibilite',

      'lang.en': 'EN',
      'lang.pt': 'PT',
      'lang.es': 'ES',
      'lang.fr': 'FR',

      'a11y.dyslexia': 'Lecture adaptee a la dyslexie',
      'a11y.autism': 'Mode faible stimulation',
      'a11y.blind': 'Mode lecteur d ecran',
      'a11y.contrast': 'Contraste eleve',
      'a11y.grayscale': 'Mode niveaux de gris',
      'a11y.color_profile': 'Profil daltonisme',
      'a11y.default': 'Defaut',
      'a11y.protanopia': 'Compatible protanopie',
      'a11y.deuteranopia': 'Compatible deuteranopie',
      'a11y.tritanopia': 'Compatible tritanopie',
      'a11y.text_size': 'Taille du texte',
      'a11y.theme': 'Mode de theme',
      'a11y.theme_dark': 'Sombre',
      'a11y.theme_light': 'Clair',
      'a11y.reset': 'Reinitialiser l accessibilite'
    }
  };

  let a11ySettings = loadA11ySettings();
  let serviceCatalogPromise = null;
  let serviceMediaPromise = null;
  let sitemapPathSetPromise = null;
  let ninaChatbotPromise = null;

  const CATEGORY_PLAYBOOK = {
    'civil-law': {
      audience: 'Individuals, families, and businesses that need enforceable documentation, civil protection, and compliant legal acts in Brazil.',
      outcomes: 'Lower procedural risk, cleaner evidence, stronger documentation, and clearer legal positioning before negotiation or litigation.',
      documents: [
        'Government-issued ID and CPF or equivalent registry details',
        'Existing contracts, records, notices, or official certificates',
        'Proof of timeline, payments, communications, and losses',
        'Apostille/legalization or translation where cross-border use is needed'
      ],
      process: [
        'Case triage and legal objective definition',
        'Document audit, correction plan, and evidence matrix',
        'Drafting, negotiation, filing, or defensive strategy execution',
        'Authority, registry, or counterparty follow-up and closure steps'
      ]
    },
    'family-law': {
      audience: 'Parents, spouses, children, and guardians handling civil status, protection, custody, support, and family recognition matters.',
      outcomes: 'Structured family rights strategy, validated records, child-centered planning, and stronger cross-border enforceability.',
      documents: [
        'Identity and civil status records (birth, marriage, divorce, guardianship)',
        'Evidence of relationship, support, residence, or parental responsibilities',
        'Court or authority decisions already issued in Brazil or abroad',
        'Translated and legalized foreign records when applicable'
      ],
      process: [
        'Legal status mapping and urgent-protection screening',
        'Document and evidence alignment to the correct legal route',
        'Filing, negotiation, mediation, or representation actions',
        'Post-decision implementation and compliance guidance'
      ]
    },
    'human-rights': {
      audience: 'People and communities seeking legal protection against abuse, discrimination, exploitation, or status insecurity.',
      outcomes: 'Rights-focused legal strategy, protective measures, and documented pathways for administrative or judicial protection.',
      documents: [
        'Identity and migration status records when available',
        'Incident reports, medical/psychological records, and witness evidence',
        'Authority communications, denials, or procedural notices',
        'Country-condition or risk evidence for protection-based cases'
      ],
      process: [
        'Risk assessment and immediate protection planning',
        'Evidence preservation and rights framing',
        'Petitions, protective requests, or strategic filings',
        'Monitoring, appeals, and long-term legal safeguarding'
      ]
    },
    'brazilian-visas': {
      audience:
        'Foreign nationals planning lawful entry to Brazil for work, family, study, investment, humanitarian, or other legal purposes, with route-specific eligibility checks before filing.',
      outcomes:
        'Better category fit, cleaner documentation flow, stronger pre-filing validation, and lower refusal risk before consular or authority review.',
      documents: [
        'Passport validity and travel-history details',
        'Purpose-specific records (employment, enrollment, investment, family ties)',
        'Criminal background and civil certificates where required',
        'Consultation-based checklist to verify translation, apostille, and consular requirements case by case'
      ],
      process: [
        'Eligibility screening and correct visa-route selection',
        'Document readiness and legalization plan',
        'Application drafting, review, and submission strategy',
        'Pre-arrival compliance and post-entry transition planning'
      ]
    },
    'brazilian-residencies': {
      audience: 'Foreign nationals converting legal grounds into temporary or long-term residence in Brazil.',
      outcomes: 'Residence strategy aligned with legal basis, timeline, and documentary evidence to reduce status risk.',
      documents: [
        'Current immigration status and entry documentation',
        'Ground-specific proof (family, work, study, investment, humanitarian, etc.)',
        'Updated civil records and background documents',
        'Registry and authority forms prepared for local filing'
      ],
      process: [
        'Residency legal-basis confirmation and timing plan',
        'Evidence curation and file-quality control',
        'Application execution with authority follow-up',
        'Renewal, conversion, and long-term compliance strategy'
      ]
    },
    naturalisation: {
      audience: 'Residents and eligible applicants pursuing Brazilian nationality pathways or renunciation procedures.',
      outcomes: 'Eligibility certainty, complete filing package, and procedural continuity through decision and post-decision steps.',
      documents: [
        'Residence history, status continuity, and legal-presence evidence',
        'Civil status records and identity continuity documents',
        'Language, integration, and legal-compliance evidence where required',
        'Prior nationality and consular records for special pathways'
      ],
      process: [
        'Naturalisation route qualification and strategic readiness review',
        'File assembly and legal narrative preparation',
        'Submission, procedural responses, and tracking',
        'Post-decision registration, passport, or nationality next steps'
      ]
    },
    'other-services': {
      audience: 'Clients facing procedural complications, sanctions, appeals, consular demands, or cross-border documentary barriers.',
      outcomes: 'Clear corrective strategy, stronger procedural defense, and better legal continuity across authorities and jurisdictions.',
      documents: [
        'Official notifications, denials, fines, or procedural records',
        'Identity and status history files',
        'Supporting evidence for correction, appeal, or defense',
        'Certified translations and document-authenticity chain'
      ],
      process: [
        'Diagnostic review of procedural bottlenecks',
        'Correction or defense architecture',
        'Targeted administrative/judicial action where needed',
        'Monitoring outcomes and stabilizing legal status'
      ]
    },
    'immigration-abroad': {
      audience: 'Individuals and families comparing immigration pathways outside Brazil and needing a legal roadmap before committing.',
      outcomes: 'Jurisdiction-aware planning, realistic expectations, and cleaner execution with country-specific legal sequencing.',
      documents: [
        'Passport and travel-history records',
        'Work, family, education, or investment evidence',
        'Civil records and background checks',
        'Translation/legalization set for the destination country'
      ],
      process: [
        'Country-route comparison and objective prioritization',
        'Eligibility and risk screening for target pathways',
        'Documentation and filing sequence planning',
        'Jurisdiction-aware legal support roadmap'
      ]
    },
    default: {
      audience: 'Clients who need structured legal guidance before filing, negotiating, or responding to authorities.',
      outcomes: 'Clear legal pathway, reduced avoidable errors, and stronger procedural consistency.',
      documents: [
        'Identity, status, and timeline records',
        'Supporting legal and financial documentation',
        'Authority notices or procedural communications',
        'Translated and legalized records where applicable'
      ],
      process: [
        'Legal objective and risk assessment',
        'Document preparation and strategy definition',
        'Execution of filing, drafting, or representation steps',
        'Follow-up, response handling, and next-stage planning'
      ]
    }
  };

  let abroadGuidesPromise = null;
  const insightsFeedPromises = {};
  const RELATED_INSIGHTS_FALLBACK_IMAGE =
    '/assets/img/profile/blog/photo.lawyer.professional.trusted.BAR.OAB.Brazil.attorney.help.how-to.png';

  function ensureAbroadGuides() {
    if (globalThis.ABROAD_GUIDES) return Promise.resolve(globalThis.ABROAD_GUIDES);
    if (abroadGuidesPromise) return abroadGuidesPromise;

    abroadGuidesPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="/js/abroad-guides.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(globalThis.ABROAD_GUIDES || {}), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load /js/abroad-guides.js')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = '/js/abroad-guides.js';
      script.async = true;
      script.addEventListener('load', () => resolve(globalThis.ABROAD_GUIDES || {}), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load /js/abroad-guides.js')), { once: true });
      document.head.appendChild(script);
    }).catch(err => {
      abroadGuidesPromise = null;
      throw err;
    });

    return abroadGuidesPromise;
  }

  function ensureNinaChatbot() {
    if (window.MoniqueNinaChatbot) return Promise.resolve(window.MoniqueNinaChatbot);
    if (ninaChatbotPromise) return ninaChatbotPromise;

    ninaChatbotPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="/js/nina-chatbot.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.MoniqueNinaChatbot || {}), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load /js/nina-chatbot.js')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = '/js/nina-chatbot.js';
      script.async = true;
      script.addEventListener('load', () => resolve(window.MoniqueNinaChatbot || {}), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load /js/nina-chatbot.js')), { once: true });
      document.head.appendChild(script);
    }).catch(error => {
      ninaChatbotPromise = null;
      throw error;
    });

    return ninaChatbotPromise;
  }

  async function initializeNinaChatbot(locale, englishPath) {
    try {
      const chatbot = await ensureNinaChatbot();
      if (chatbot && typeof chatbot.init === 'function') {
        chatbot.init({ locale, englishPath });
      }
    } catch (error) {
      console.error('Failed to initialize Nina chatbot.', error);
    }
  }

  function loadInsightsFeed(locale) {
    const safeLocale = locale === 'pt' || locale === 'es' || locale === 'fr' ? locale : 'en';
    if (insightsFeedPromises[safeLocale]) return insightsFeedPromises[safeLocale];

    insightsFeedPromises[safeLocale] = (async () => {
      const primary = safeLocale === 'en' ? '/data/insights-feed.json' : `/data/insights-feed.${safeLocale}.json`;
      let response = await fetch(primary, { cache: 'no-cache' });
      if (!response.ok && safeLocale !== 'en') {
        response = await fetch('/data/insights-feed.json', { cache: 'no-cache' });
      }
      if (!response.ok) throw new Error(`Failed to load insights feed: ${response.status}`);
      return response.json();
    })().catch(error => {
      insightsFeedPromises[safeLocale] = null;
      throw error;
    });

    return insightsFeedPromises[safeLocale];
  }

  function humanizeCountryName(slug) {
    return String(slug || '')
      .replace(/\.html$/i, '')
      .split(/[-_]+/)
      .filter(Boolean)
      .map(part => {
        const upper = part.toUpperCase();
        if (upper === 'UK') return 'UK';
        if (upper === 'USA') return 'USA';
        if (upper === 'UAE') return 'UAE';
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function inferLeadGenMeta(englishPath) {
    const path = normalizePageHref(englishPath || '');
    const leaf = path.split('/').filter(Boolean).pop() || '';

    if (path === '/services/immigration-to-brazil/by-country/index.html') {
      return {
        pageGroup: 'country_landing_index',
        hub: 'immigrate-to-brazil',
        subHub: 'country-landing',
        countryName: '',
        primaryHubs: ['brazilian-visas', 'brazilian-residencies', 'brazilian-naturalisation', 'other-immigration-services'],
        readMoreHref: '/blog.html?collection=immigrate-to-brazil'
      };
    }

    if (path.startsWith('/services/immigration-to-brazil/by-country/')) {
      return {
        pageGroup: 'country_landing',
        hub: 'immigrate-to-brazil',
        subHub: 'country-landing',
        countryName: humanizeCountryName(leaf),
        primaryHubs: ['brazilian-visas', 'brazilian-residencies', 'brazilian-naturalisation', 'other-immigration-services'],
        readMoreHref: '/blog.html?collection=immigrate-to-brazil'
      };
    }

    const routes = [
      {
        match: value =>
          value === '/services/civil/all-civil-law-services.html' || value.startsWith('/services/civil/'),
        meta: {
          pageGroup: 'service',
          hub: 'civil',
          subHub: '',
          primaryHubs: ['civil-law'],
          readMoreHref: '/blog.html?hub=civil-law'
        }
      },
      {
        match: value =>
          value === '/services/family/all-family-law-services.html' || value.startsWith('/services/family/'),
        meta: {
          pageGroup: 'service',
          hub: 'family',
          subHub: '',
          primaryHubs: ['family-law'],
          readMoreHref: '/blog.html?hub=family-law'
        }
      },
      {
        match: value =>
          value === '/services/human-rights/all-human-rights-services.html' || value.startsWith('/services/human-rights/'),
        meta: {
          pageGroup: 'service',
          hub: 'human-rights',
          subHub: '',
          primaryHubs: ['human-rights'],
          readMoreHref: '/blog.html?hub=human-rights'
        }
      },
      {
        match: value =>
          value === '/services/immigration-abroad-services/all-immigration-abroad-services.html' ||
          value.startsWith('/services/immigration-abroad-services/'),
        meta: {
          pageGroup: 'service',
          hub: 'immigration-abroad',
          subHub: '',
          primaryHubs: ['immigration-abroad'],
          readMoreHref: '/blog.html?hub=immigration-abroad'
        }
      },
      {
        match: value => value === '/services/immigration-to-brazil/all-immigration-to-brazil-services.html',
        meta: {
          pageGroup: 'service_hub',
          hub: 'immigrate-to-brazil',
          subHub: '',
          primaryHubs: ['brazilian-visas', 'brazilian-residencies', 'brazilian-naturalisation', 'other-immigration-services'],
          readMoreHref: '/blog.html?collection=immigrate-to-brazil'
        }
      },
      {
        match: value =>
          value === '/services/immigration-to-brazil/all-brazilian-visa-services.html' ||
          value.startsWith('/services/immigration-to-brazil/visas/'),
        meta: {
          pageGroup: 'service',
          hub: 'immigrate-to-brazil',
          subHub: 'visas',
          primaryHubs: ['brazilian-visas'],
          readMoreHref: '/blog.html?hub=brazilian-visas'
        }
      },
      {
        match: value =>
          value === '/services/immigration-to-brazil/all-brazilian-residencies-services.html' ||
          value.startsWith('/services/immigration-to-brazil/residencies/'),
        meta: {
          pageGroup: 'service',
          hub: 'immigrate-to-brazil',
          subHub: 'residencies',
          primaryHubs: ['brazilian-residencies'],
          readMoreHref: '/blog.html?hub=brazilian-residencies'
        }
      },
      {
        match: value =>
          value === '/services/immigration-to-brazil/all-brazilian-naturalisation-services.html' ||
          value.startsWith('/services/immigration-to-brazil/citizenship/'),
        meta: {
          pageGroup: 'service',
          hub: 'immigrate-to-brazil',
          subHub: 'naturalisation',
          primaryHubs: ['brazilian-naturalisation'],
          readMoreHref: '/blog.html?hub=brazilian-naturalisation'
        }
      },
      {
        match: value =>
          value === '/services/immigration-to-brazil/all-brazilian-other-services.html' ||
          value.startsWith('/services/immigration-to-brazil/other/'),
        meta: {
          pageGroup: 'service',
          hub: 'immigrate-to-brazil',
          subHub: 'other-immigration',
          primaryHubs: ['other-immigration-services'],
          readMoreHref: '/blog.html?hub=other-immigration-services'
        }
      }
    ];

    for (const route of routes) {
      if (route.match(path)) return { ...route.meta, countryName: '' };
    }

    return null;
  }

  function buildRelatedInsightsItems(items, primaryHubs, limit = 20) {
    const list = Array.isArray(items) ? items : [];
    const seen = new Set();
    const result = [];
    const addItems = hubKeys => {
      list.forEach(item => {
        if (!hubKeys.includes(item.hub)) return;
        const key = `${item.url || ''}::${item.title || item.titleShort || ''}`;
        if (seen.has(key)) return;
        seen.add(key);
        result.push(item);
      });
    };

    addItems(primaryHubs);
    if (result.length < limit) addItems(['faq']);
    if (result.length < limit) addItems(['news']);

    return result
      .sort((a, b) => Date.parse(b.date || '1970-01-01') - Date.parse(a.date || '1970-01-01'))
      .slice(0, limit);
  }

  function sanitizeInsightExcerptText(value) {
    return String(value || '')
      .replace(
        /This legal guidance summarizes core eligibility criteria, document requirements, process steps, timeline expectations, and practical risk controls for safer filing decisions\.\.\./gi,
        'This legal guidance summarizes core eligibility criteria, process steps, timeline expectations, and practical risk controls for safer filing decisions...'
      )
      .replace(/\bdocument requirements\b/gi, 'pre-consultation points')
      .replace(/\brequired documents\b/gi, 'supporting information')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  async function injectRelatedInsightsSection(locale, englishPath) {
    const meta = inferLeadGenMeta(englishPath);
    if (!meta) return;
    if (document.getElementById('related-insights-updates')) return;

    let payload;
    try {
      payload = await loadInsightsFeed(locale);
    } catch {
      return;
    }

    const items = buildRelatedInsightsItems(payload?.items || [], meta.primaryHubs || [], 20);
    if (!items.length) return;

    const copyByLocale = {
      en: {
        kicker: 'Related insights and updates',
        title: 'Continue reading with recent posts',
        subtitle:
          meta.pageGroup === 'country_landing'
            ? `Short updates that support planning a move from ${meta.countryName} to Brazil.`
            : 'Helpful posts and updates connected to this legal topic.',
        readMore: 'Read more posts',
        readPost: 'Open post'
      },
      pt: {
        kicker: 'Insights e atualizacoes relacionadas',
        title: 'Continue lendo com publicacoes recentes',
        subtitle: 'Conteudo util ligado a este tema juridico.',
        readMore: 'Ler mais publicacoes',
        readPost: 'Abrir publicacao'
      },
      es: {
        kicker: 'Insights y actualizaciones relacionadas',
        title: 'Siga leyendo con publicaciones recientes',
        subtitle: 'Contenido util relacionado con este tema legal.',
        readMore: 'Leer mas publicaciones',
        readPost: 'Abrir publicacion'
      },
      fr: {
        kicker: 'Insights et actualites liees',
        title: 'Continuer avec des publications recentes',
        subtitle: 'Contenu utile lie a ce sujet juridique.',
        readMore: 'Lire plus de publications',
        readPost: 'Ouvrir la publication'
      }
    };
    const copy = copyByLocale[locale] || copyByLocale.en;
    const dateLocaleByLang = { en: 'en-US', pt: 'pt-BR', es: 'es-ES', fr: 'fr-FR' };
    const formatDate = value => {
      const parsed = new Date(value || '');
      if (Number.isNaN(parsed.getTime())) return '';
      return parsed.toLocaleDateString(dateLocaleByLang[locale] || 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    const cards = items
      .map(item => {
        const href = localizeHref(item.url || '/blog.html', locale);
        const image = item.image || RELATED_INSIGHTS_FALLBACK_IMAGE;
        return `
          <div class="col-6 col-md-4 col-xl-2">
            <article class="insight-feed-card h-100">
              <a class="insight-feed-card__image-link" href="${escapeHtml(href)}">
                <img class="insight-feed-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(item.imageAlt || item.title || 'Legal insight preview')}" loading="lazy" decoding="async"/>
              </a>
              <div class="insight-feed-card__body">
                <p class="insight-feed-card__meta mb-2">
                  <span class="insight-feed-card__hub">${escapeHtml(item.hubLabel || item.hub || 'Insight')}</span>
                  <span class="insight-feed-card__dot" aria-hidden="true">•</span>
                  <time datetime="${escapeHtml(item.date || '')}">${escapeHtml(formatDate(item.date))}</time>
                </p>
                <h3 class="insight-feed-card__title h5 mb-2"><a href="${escapeHtml(href)}">${escapeHtml(item.titleShort || item.title || 'Legal update')}</a></h3>
                <p class="insight-feed-card__excerpt mb-3">${escapeHtml(sanitizeInsightExcerptText(item.excerptShort || item.excerpt || ''))}</p>
                <a class="insight-feed-card__read" href="${escapeHtml(href)}">${escapeHtml(copy.readPost)}</a>
              </div>
            </article>
          </div>
        `;
      })
      .join('');

    const section = document.createElement('section');
    section.id = 'related-insights-updates';
    section.className = 'py-5';
    section.innerHTML = `
      <div class="container-xxl">
        <div class="enhancement-shell related-insights-shell">
          <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <div>
              <p class="section-kicker mb-2">${escapeHtml(copy.kicker)}</p>
              <h2 class="h3 mb-2">${escapeHtml(copy.title)}</h2>
              <p class="mb-0">${escapeHtml(copy.subtitle)}</p>
            </div>
            <a class="btn btn-outline-gold rounded-pill px-4" href="${escapeHtml(localizeHref(meta.readMoreHref, locale))}">${escapeHtml(copy.readMore)}</a>
          </div>
          <div class="row g-4">
            ${cards}
          </div>
        </div>
      </div>
    `;

    const footerContainer = document.getElementById('footer-container');
    const target = document.querySelector('#main-content') || document.querySelector('main');
    if (footerContainer) {
      footerContainer.insertAdjacentElement('beforebegin', section);
    } else if (target) {
      target.appendChild(section);
    } else {
      document.body.appendChild(section);
    }
  }

  function injectThemeAssets() {
    const oldLux = document.getElementById('bootswatch-lux-theme');
    if (oldLux) oldLux.remove();

    if (!document.querySelector('link[href="/css/style.css"], link[href$="/css/style.css"]')) {
      const theme = document.createElement('link');
      theme.rel = 'stylesheet';
      theme.href = '/css/style.css';
      document.head.appendChild(theme);
    }

    if (!document.getElementById('premium-fonts')) {
      const fonts = document.createElement('link');
      fonts.id = 'premium-fonts';
      fonts.rel = 'stylesheet';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap';
      document.head.appendChild(fonts);
    }

    if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"], link[href*="all.min.css"]')) {
      const icons = document.createElement('link');
      icons.rel = 'stylesheet';
      icons.href = '/assets/vendor/fontawesome/css/all.min.css';
      document.head.appendChild(icons);
    }
  }

  function normalizePageScaffold() {
    const body = document.body;
    if (!body) return;

    body.classList.add('site-page');
    if (!body.classList.contains('text-cream') && !body.classList.contains('text-white')) {
      body.classList.add('text-cream');
    }

    const sections = document.querySelectorAll('main > section, body > section');
    sections.forEach(section => {
      if (
        section.classList.contains('hero-section') ||
        section.classList.contains('page-hero') ||
        section.classList.contains('header-section') ||
        section.classList.contains('hero')
      ) {
        return;
      }

      if (!section.className.includes('bg-')) {
        section.classList.add('page-surface');
      }
    });

    const mainSections = Array.from(document.querySelectorAll('main > section'));
    mainSections.forEach((section, index) => {
      if (index < 2) return;
      if (
        section.classList.contains('hero-section') ||
        section.classList.contains('page-hero') ||
        section.classList.contains('header-section') ||
        section.classList.contains('hero')
      ) {
        return;
      }
      section.classList.add('cv-auto');
    });
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function loadA11ySettings() {
    const raw = readStorage(A11Y_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_A11Y_SETTINGS };
    const parsed = safeJsonParse(raw, DEFAULT_A11Y_SETTINGS);
    return { ...DEFAULT_A11Y_SETTINGS, ...parsed };
  }

  function saveA11ySettings() {
    writeStorage(A11Y_STORAGE_KEY, JSON.stringify(a11ySettings));
  }

  function applyA11ySettings() {
    document.documentElement.style.fontSize = `${a11ySettings.fontScale}%`;
    document.documentElement.classList.toggle('theme-light', a11ySettings.theme === 'light');

    document.body.classList.toggle('a11y-dyslexia', a11ySettings.dyslexia);
    document.body.classList.toggle('a11y-autism', a11ySettings.autism);
    document.body.classList.toggle('a11y-blind', a11ySettings.blind);
    document.body.classList.toggle('a11y-high-contrast', a11ySettings.highContrast);
    document.body.classList.toggle('a11y-grayscale', a11ySettings.grayscale);

    document.body.classList.remove('a11y-protanopia', 'a11y-deuteranopia', 'a11y-tritanopia');
    if (a11ySettings.colorProfile !== 'none') {
      document.body.classList.add(`a11y-${a11ySettings.colorProfile}`);
    }
  }

  function resetA11ySettings() {
    a11ySettings = { ...DEFAULT_A11Y_SETTINGS };
    saveA11ySettings();
    applyA11ySettings();
    syncA11yControls();
  }

  function ensureContainer(id, prepend = false) {
    let element = document.getElementById(id);
    if (element) return element;

    element = document.createElement('div');
    element.id = id;

    if (prepend) {
      document.body.prepend(element);
    } else {
      document.body.appendChild(element);
    }

    return element;
  }

  async function loadComponent(file, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    const candidates = [`/${file}`, file];

    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { cache: 'no-cache' });
        if (!response.ok) continue;
        container.innerHTML = await response.text();
        return true;
      } catch {
        // Continue to next candidate
      }
    }

    console.error(`Failed to fetch component: ${file}`);
    return false;
  }

  async function loadLocalizedComponent(file, locale, containerId) {
    const orderedFiles = locale === 'en' ? [file] : [`${locale}/${file}`, file];

    for (const candidate of orderedFiles) {
      const loaded = await loadComponent(candidate, containerId);
      if (loaded) return true;
    }

    return false;
  }

  function detectLocaleAndPath(pathname) {
    let locale = 'en';
    let path = pathname || '/';

    if (!path.startsWith('/')) path = `/${path}`;

    const localeMatch = path.match(/^\/(pt|es|fr)(\/.*|$)/i);
    if (localeMatch) {
      locale = localeMatch[1].toLowerCase();
      path = localeMatch[2] || '/';
    }

    if (path === '/') path = '/index.html';

    if (!path.endsWith('.html')) {
      path = path.endsWith('/') ? `${path}index.html` : `${path}.html`;
    }

    return { locale, englishPath: path };
  }

  function stripOrigin(href) {
    if (!href) return href;
    if (href.startsWith(SITE_ORIGIN)) return href.slice(SITE_ORIGIN.length);
    if (href.startsWith(window.location.origin)) return href.slice(window.location.origin.length);
    return href;
  }

  function splitHref(href) {
    const value = stripOrigin(href || '');
    const hashIndex = value.indexOf('#');
    const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
    const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
    const queryIndex = withoutHash.indexOf('?');
    const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
    const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
    return { path, query, hash };
  }

  function toPublicPath(path) {
    let normalized = path || '/index.html';
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;

    if (normalized === '/index.html') return '/';
    if (normalized.endsWith('/index.html')) return `${normalized.slice(0, -'/index.html'.length).replace(/\/+$/, '')}/`;
    if (normalized.endsWith('.html')) return normalized.slice(0, -5);
    return normalized;
  }

  function normalizeFilePath(pathname, stripLocale = false) {
    let normalized = pathname || '/';
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;

    if (stripLocale) {
      normalized = normalized.replace(/^\/(pt|es|fr)(?=\/|$)/i, '');
      if (normalized === '') normalized = '/';
    }

    if (normalized === '/') return '/index.html';
    if (normalized === '/blog' || normalized === '/blog.html') return BLOG_LANDING_PATH;
    if (normalized === '/legal-insights' || normalized === LEGAL_INSIGHTS_STUB_PATH) return LEGAL_NEWS_LANDING_PATH;

    if (normalized.endsWith('/')) {
      const trimmed = normalized.slice(0, -1);
      if (trimmed === '') return '/index.html';
      const depth = trimmed.split('/').filter(Boolean).length;
      return depth <= 1 ? `${trimmed}.html` : `${normalized}index.html`;
    }

    if (!normalized.endsWith('.html')) {
      normalized = `${normalized}.html`;
    }

    return normalized;
  }

  function isLocalPreviewEnvironment() {
    const { protocol, hostname } = window.location;
    return (
      protocol === 'file:' ||
      LOCAL_PREVIEW_HOSTNAMES.has((hostname || '').toLowerCase()) ||
      /\.local$/i.test(hostname || '')
    );
  }

  function normalizeNavigableFilePath(path) {
    let normalized = path || '/index.html';
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;

    if (normalized === '/') return '/index.html';

    const localeRootMatch = normalized.match(/^\/(pt|es|fr)(?:\/)?$/i);
    if (localeRootMatch) {
      return `/${localeRootMatch[1].toLowerCase()}/index.html`;
    }

    return normalizeLocalizedPath(normalized);
  }

  function toNavigablePath(path) {
    const normalized = normalizeNavigableFilePath(path);
    return isLocalPreviewEnvironment() ? normalized : toPublicPath(normalized);
  }

  function shouldNormalizeLocalPreviewHref(href) {
    if (!isLocalPreviewEnvironment()) return false;
    if (!shouldLocalizeHref(href)) return false;

    const candidate = stripOrigin(href || '');
    return candidate.startsWith('/');
  }

  function normalizeLocalPreviewHref(href) {
    const { path, query, hash } = splitHref(href);
    return `${normalizeNavigableFilePath(path || '/index.html')}${query}${hash}`;
  }

  function buildLocaleHref(targetLocale, englishPath) {
    const normalized = englishPath.startsWith('/') ? englishPath : `/${englishPath}`;
    const page = normalizePageHref(normalized || '/index.html');

    if (page === BLOG_LANDING_PATH) {
      return targetLocale === 'en' ? toNavigablePath(page) : toNavigablePath(`/${targetLocale}${BLOG_LOCALE_STUB_PATH}`);
    }

    if (targetLocale === 'en') return toNavigablePath(page);
    return toNavigablePath(`/${targetLocale}${page}`);
  }

  function shouldLocalizeHref(href) {
    if (!href) return false;

    const candidate = stripOrigin(href);
    if (!candidate) return false;

    if (
      candidate.startsWith('http://') ||
      candidate.startsWith('https://') ||
      candidate.startsWith('mailto:') ||
      candidate.startsWith('tel:') ||
      candidate.startsWith('javascript:') ||
      candidate.startsWith('data:') ||
      candidate.startsWith('#')
    ) {
      return false;
    }

    const { path } = splitHref(candidate);
    const absolute = path.startsWith('/') ? path : `/${path}`;
    const noLocale = absolute.replace(/^\/(pt|es|fr)(?=\/|$)/i, '');

    if (
      noLocale.startsWith('/assets/') ||
      noLocale.startsWith('/css/') ||
      noLocale.startsWith('/js/') ||
      noLocale.startsWith('/favicon/') ||
      noLocale.startsWith('/data/') ||
      noLocale.startsWith('/partials/')
    ) {
      return false;
    }

    if (noLocale === '/robots.txt' || noLocale === '/sitemap.xml') return false;

    return true;
  }

  function normalizePageHref(href) {
    const { path } = splitHref(href);
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return normalizeFilePath(normalized, true);
  }

  function normalizeLocalizedPath(pathname) {
    return normalizeFilePath(pathname, false);
  }

  async function loadSitemapPathSet() {
    if (sitemapPathSetPromise) return sitemapPathSetPromise;

    sitemapPathSetPromise = (async () => {
      const response = await fetch('/sitemap.xml', { cache: 'no-cache' });
      if (!response.ok) return null;

      const raw = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(raw, 'application/xml');
      if (xml.querySelector('parsererror')) return null;

      const set = new Set();
      xml.querySelectorAll('url > loc').forEach(node => {
        const value = (node.textContent || '').trim();
        if (!value) return;

        try {
          const url = new URL(value, SITE_ORIGIN);
          set.add(normalizeLocalizedPath(url.pathname));
        } catch {
          // Skip malformed sitemap entries.
        }
      });

      return set.size ? set : null;
    })().catch(() => null);

    return sitemapPathSetPromise;
  }

  async function loadServiceCatalog() {
    if (serviceCatalogPromise) return serviceCatalogPromise;

    serviceCatalogPromise = fetch('/data/service-catalog.json', { cache: 'no-cache' })
      .then(response => (response.ok ? response.json() : null))
      .catch(() => null);

    return serviceCatalogPromise;
  }

  async function loadServiceMedia() {
    if (serviceMediaPromise) return serviceMediaPromise;

    serviceMediaPromise = fetch('/data/service-media.json', { cache: 'no-cache' })
      .then(response => (response.ok ? response.json() : null))
      .catch(() => null);

    return serviceMediaPromise;
  }

  function flattenServiceCatalog(catalog) {
    if (!catalog || !Array.isArray(catalog.categories)) return [];
    return catalog.categories.flatMap(category =>
      (category.services || []).map(service => ({
        ...service,
        categoryId: category.id || 'default',
        categoryName: category.name || 'Legal Services',
        categoryHub: category.hub || '/services.html'
      }))
    );
  }

  function inferCategoryFromPath(pathname) {
    if (pathname.startsWith('/services/civil/')) return 'civil-law';
    if (pathname.startsWith('/services/family/')) return 'family-law';
    if (pathname.startsWith('/services/human-rights/')) return 'human-rights';
    if (pathname.startsWith('/services/immigration-to-brazil/visas/')) return 'brazilian-visas';
    if (pathname.startsWith('/services/immigration-to-brazil/all-brazilian-visa-')) return 'brazilian-visas';
    if (pathname.startsWith('/services/immigration-to-brazil/residencies/')) return 'brazilian-residencies';
    if (pathname.startsWith('/services/immigration-to-brazil/all-brazilian-residencies-')) return 'brazilian-residencies';
    if (pathname.startsWith('/services/immigration-to-brazil/citizenship/')) return 'naturalisation';
    if (pathname.startsWith('/services/immigration-to-brazil/all-brazilian-naturalisation-')) return 'naturalisation';
    if (pathname.startsWith('/services/immigration-to-brazil/other/')) return 'other-services';
    if (pathname.startsWith('/services/immigration-to-brazil/all-brazilian-other-')) return 'other-services';
    if (pathname.startsWith('/services/immigration-abroad-services/')) return 'immigration-abroad';
    return 'default';
  }

  function resolveServiceEntry(pathname, flattenedCatalog) {
    if (!flattenedCatalog.length) return null;
    return flattenedCatalog.find(item => normalizePageHref(item.path) === normalizePageHref(pathname)) || null;
  }

  function absoluteUrl(pathname) {
    try {
      return new URL(pathname, SITE_ORIGIN).toString();
    } catch {
      return SITE_ORIGIN;
    }
  }

  function readMetaContent(selector) {
    return document.querySelector(selector)?.getAttribute('content')?.trim() || '';
  }

  function upsertJsonLd(id, payload) {
    if (!payload) return;

    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(payload);
  }

  function extractAccordionFaqEntries(limit = 8) {
    const entries = [];
    const seen = new Set();

    document.querySelectorAll('.accordion-item').forEach(item => {
      if (entries.length >= limit) return;

      const question = item.querySelector('.accordion-button, .accordion-header button')?.textContent?.replace(/\s+/g, ' ').trim();
      const answer = item.querySelector('.accordion-body')?.textContent?.replace(/\s+/g, ' ').trim();
      if (!question || !answer) return;

      const key = `${question}|${answer}`;
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ q: question, a: answer });
    });

    return entries;
  }

  function inferAbroadSlug(pathname) {
    const match = pathname.match(/\/services\/immigration-abroad-services\/([^/.]+)(?:\.html)?\/?$/i);
    if (!match) return null;
    const slug = match[1].toLowerCase();
    if (slug === 'all-immigration-abroad-services' || slug === 'immigration-abroad-services' || slug === 'book-consultation') {
      return null;
    }
    return slug;
  }

  function serviceFaqPairs(serviceName, categoryName, locale = 'en') {
    const byLocale = {
      en: [
        {
          q: `How does ${serviceName} usually start?`,
          a: `${serviceName} starts with consultation so the facts, timing, risks, and legal objective can be reviewed before advice or representation begins.`
        },
        {
          q: `Why is consultation required before legal advice in ${categoryName}?`,
          a: 'Even similar matters can require different strategies. Consultation clarifies the route, the main risks, and whether representation should move forward.'
        },
        {
          q: `Can ${serviceName} begin while I am outside Brazil?`,
          a: `Yes. Many ${serviceName.toLowerCase()} matters can begin remotely with consultation, strategy review, and next-step planning before any in-person step is needed.`
        },
        {
          q: 'What should I explain during consultation?',
          a: 'Explain your objective, the main facts, the timing involved, and any authority contact or urgency already affecting the matter.'
        },
        {
          q: 'How can Monique help before I take the next legal step?',
          a: 'Monique can review route fit, identify risks early, and define a more reliable strategy before filing, negotiating, or contacting authorities.'
        },
        {
          q: 'Can related family or cross-border issues be discussed together?',
          a: 'Yes. If the matter overlaps with family, status, or international issues, consultation can define how those points affect the overall strategy.'
        },
        {
          q: 'What if my case looks similar to another case?',
          a: 'Legal matters that look similar at first can still require different strategies once the facts, timing, and risks are reviewed individually.'
        },
        {
          q: 'What can I expect after consultation?',
          a: 'You can expect a clearer understanding of the legal route, the main risks involved, and the next step that makes sense for your situation.'
        },
        {
          q: 'Can Monique support more complex developments later on?',
          a: 'Yes. If the matter becomes more complex, the strategy can be adjusted and later representation can be discussed after consultation.'
        },
        {
          q: 'Is online legal support available for this service?',
          a: 'Yes. Consultation, preparation, and strategy discussions can often be handled remotely with structured communication.'
        }
      ],
      pt: [
        {
          q: `Como o servico ${serviceName} normalmente comeca?`,
          a: `O ${serviceName} comeca com consulta para revisar fatos, prazo, riscos e objetivo juridico antes de iniciar orientacao ou representacao.`
        },
        {
          q: `Por que a consulta e necessaria antes da orientacao juridica em ${categoryName}?`,
          a: 'Casos parecidos podem exigir estrategias diferentes. A consulta esclarece a rota, os riscos e se a representacao deve avancar.'
        },
        {
          q: `Posso iniciar ${serviceName} estando fora do Brasil?`,
          a: `Sim. Muitos casos podem comecar remotamente com consulta, revisao estrategica e definicao do proximo passo antes de qualquer etapa presencial.`
        },
        {
          q: 'O que devo explicar na consulta?',
          a: 'Explique seu objetivo, os fatos principais, o prazo envolvido e qualquer urgencia ou contato com autoridade ja existente.'
        },
        {
          q: 'Como a Monique ajuda antes do proximo passo juridico?',
          a: 'A Monique revisa a adequacao da rota, identifica riscos cedo e define uma estrategia mais segura antes de protocolo, negociacao ou contato com autoridade.'
        },
        {
          q: 'Questoes familiares ou internacionais podem entrar na mesma consulta?',
          a: 'Sim. Se o caso se conecta com familia, status ou situacoes internacionais, a consulta pode alinhar esses pontos na estrategia juridica.'
        },
        {
          q: 'E se meu caso parecer igual ao de outra pessoa?',
          a: 'Mesmo casos parecidos podem exigir estrategias diferentes depois da analise individual de fatos, prazo e riscos.'
        },
        {
          q: 'O que acontece depois da consulta?',
          a: 'Depois da consulta, voce tera mais clareza sobre a rota juridica, os principais riscos e o proximo passo adequado para a sua situacao.'
        },
        {
          q: 'A Monique pode atuar se o caso ficar mais complexo?',
          a: 'Sim. Se a situacao evoluir, a estrategia pode ser ajustada e a representacao pode ser discutida depois da consulta.'
        },
        {
          q: 'Existe atendimento online para este servico?',
          a: 'Sim. Consulta, preparacao e estrategia podem ser conduzidas online em muitos casos.'
        }
      ],
      es: [
        {
          q: `Como suele comenzar el servicio ${serviceName}?`,
          a: `El ${serviceName} comienza con consulta para revisar hechos, plazos, riesgos y objetivo legal antes de iniciar orientacion o representacion.`
        },
        {
          q: `Por que la consulta es necesaria antes de la orientacion legal en ${categoryName}?`,
          a: 'Casos parecidos pueden exigir estrategias distintas. La consulta aclara la ruta, los riesgos y si la representacion debe avanzar.'
        },
        {
          q: `Puedo iniciar ${serviceName} estando fuera de Brasil?`,
          a: `Si. Muchas etapas pueden comenzar a distancia con consulta, revision estrategica y definicion del siguiente paso antes de cualquier actuacion presencial.`
        },
        {
          q: 'Que debo explicar durante la consulta?',
          a: 'Explique su objetivo, los hechos principales, el plazo involucrado y cualquier urgencia o contacto previo con autoridades.'
        },
        {
          q: 'Como ayuda Monique antes del siguiente paso legal?',
          a: 'Monique revisa la ruta, identifica riesgos temprano y define una estrategia mas segura antes de presentar, negociar o contactar autoridades.'
        },
        {
          q: 'Pueden tratarse temas familiares o internacionales en la misma consulta?',
          a: 'Si. Si el asunto se conecta con familia, estatus o temas internacionales, la consulta puede alinear esos puntos dentro de la estrategia legal.'
        },
        {
          q: 'Que pasa si mi caso parece igual al de otra persona?',
          a: 'Incluso casos que parecen iguales pueden requerir estrategias distintas despues de revisar hechos, plazos y riesgos de manera individual.'
        },
        {
          q: 'Que puedo esperar despues de la consulta?',
          a: 'Puede esperar mas claridad sobre la ruta legal, los riesgos principales y el siguiente paso que mejor encaja con su situacion.'
        },
        {
          q: 'Monique puede ayudar si el asunto se vuelve mas complejo?',
          a: 'Si. Si el asunto evoluciona, la estrategia puede ajustarse y la representacion puede evaluarse despues de la consulta.'
        },
        {
          q: 'Hay soporte legal online para este servicio?',
          a: 'Si. Consulta, preparacion y estrategia pueden gestionarse online en muchos casos.'
        }
      ],
      fr: [
        {
          q: `Comment le service ${serviceName} commence-t-il en general ?`,
          a: `Le ${serviceName} commence par une consultation afin de revoir les faits, les delais, les risques et l objectif juridique avant tout conseil ou toute representation.`
        },
        {
          q: `Pourquoi la consultation est-elle necessaire avant le conseil juridique en ${categoryName} ?`,
          a: 'Des dossiers qui se ressemblent peuvent exiger des strategies differentes. La consultation clarifie la voie, les risques et la suite eventuelle de la representation.'
        },
        {
          q: `Puis-je commencer ${serviceName} depuis l etranger ?`,
          a: `Oui. Beaucoup d etapes peuvent commencer a distance avec consultation, revue strategique et definition du prochain mouvement avant toute presence sur place.`
        },
        {
          q: 'Que faut-il expliquer pendant la consultation ?',
          a: 'Expliquez votre objectif, les faits principaux, le calendrier concerne et toute urgence ou contact prealable avec une autorite.'
        },
        {
          q: 'Comment Monique aide-t-elle avant le prochain pas juridique ?',
          a: 'Monique verifie la bonne voie, identifie les risques rapidement et definit une strategie plus sure avant depot, negociation ou contact avec une autorite.'
        },
        {
          q: 'Les questions familiales ou internationales peuvent-elles etre traitees ensemble ?',
          a: 'Oui. Si le dossier touche a la famille, au statut ou a un contexte international, la consultation peut aligner ces points dans une seule strategie.'
        },
        {
          q: 'Et si mon dossier ressemble a celui d une autre personne ?',
          a: 'Des dossiers apparemment proches peuvent quand meme exiger des strategies differentes apres revue individuelle des faits, delais et risques.'
        },
        {
          q: 'Que peut-on attendre apres la consultation ?',
          a: 'Vous pouvez attendre plus de clarte sur la voie juridique, les risques principaux et le prochain pas adapte a votre situation.'
        },
        {
          q: 'Monique peut-elle intervenir si le dossier devient plus complexe ?',
          a: 'Oui. Si le dossier evolue, la strategie peut etre ajustee et la representation peut etre discutee apres la consultation.'
        },
        {
          q: 'Le support juridique en ligne est-il disponible ?',
          a: 'Oui. La consultation, la preparation et la strategie peuvent souvent etre gerees en ligne.'
        }
      ]
    };
    return byLocale[locale] || byLocale.en;
  }

  function localizeHref(href, locale) {
    const { query, hash } = splitHref(href);
    const englishHref = normalizePageHref(href);

    let localizedPath = '';
    if (englishHref === BLOG_LANDING_PATH && locale !== 'en') {
      localizedPath = toNavigablePath(`/${locale}${BLOG_LOCALE_STUB_PATH}`);
    } else {
      localizedPath = locale === 'en' ? toNavigablePath(englishHref) : toNavigablePath(`/${locale}${englishHref}`);
    }
    return `${localizedPath}${query}${hash}`;
  }

  function localizeSharedComponentLinks(locale) {
    const containers = [
      document.getElementById('header-container'),
      document.getElementById('footer-container'),
      document.getElementById('top-utility-container')
    ];

    containers.forEach(container => {
      if (!container) return;

      container.querySelectorAll('a[href]').forEach(link => {
        if (link.hasAttribute('data-locale') || link.hasAttribute('data-no-locale')) return;

        const originalHref = link.getAttribute('href') || '';
        if (!shouldLocalizeHref(originalHref)) return;

        link.setAttribute('href', localizeHref(originalHref, locale));
      });
    });
  }

  function localizeDocumentLinks(locale) {
    document.querySelectorAll('a[href]').forEach(link => {
      if (link.hasAttribute('data-locale') || link.hasAttribute('data-no-locale')) return;
      if (link.closest('#top-utility-container [data-locale]')) return;

      const href = link.getAttribute('href') || '';
      if (!shouldLocalizeHref(href)) return;

      link.setAttribute('href', localizeHref(href, locale));
    });
  }

  function normalizeLinksForLocalPreview() {
    if (!isLocalPreviewEnvironment()) return;

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!shouldNormalizeLocalPreviewHref(href)) return;

      link.setAttribute('href', normalizeLocalPreviewHref(href));
    });
  }

  function getText(locale, key) {
    const dictionary = I18N[locale] || I18N.en;
    return dictionary[key] || I18N.en[key] || null;
  }

  function applyTranslations(locale) {
    document.documentElement.setAttribute('lang', locale);

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translated = getText(locale, key);
      if (translated) element.textContent = translated;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translated = getText(locale, key);
      if (translated) element.innerHTML = translated;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translated = getText(locale, key);
      if (translated) element.setAttribute('placeholder', translated);
    });

    const labels = {
      en: 'Switch language to English',
      pt: 'Switch language to Portuguese',
      es: 'Switch language to Spanish',
      fr: 'Switch language to French'
    };

    document.querySelectorAll('[data-locale]').forEach(item => {
      const code = item.getAttribute('data-locale');
      if (!SUPPORTED_LOCALES.includes(code)) return;
      item.setAttribute('aria-label', labels[code]);
      item.setAttribute('lang', code);
      item.setAttribute('hreflang', code);
    });
  }

  function withTimeout(promise, fallback, timeoutMs = 1200) {
    return new Promise(resolve => {
      const timer = setTimeout(() => resolve(fallback), timeoutMs);
      promise
        .then(value => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(() => {
          clearTimeout(timer);
          resolve(fallback);
        });
    });
  }

  function localeFallbackCandidates(targetLocale, englishPath) {
    const normalized = normalizePageHref(englishPath || '/index.html');
    const candidates = [buildLocaleHref(targetLocale, normalized)];

    if (normalized.startsWith('/services/immigration-to-brazil/by-country/')) {
      candidates.push(buildLocaleHref(targetLocale, '/services/immigration-to-brazil/all-immigration-to-brazil-services.html'));
      candidates.push(buildLocaleHref(targetLocale, '/services.html'));
    } else if (normalized.startsWith('/services/')) {
      candidates.push(buildLocaleHref(targetLocale, '/services.html'));
    } else if (normalized.startsWith('/legal-knowledge-center/')) {
      candidates.push(buildLocaleHref(targetLocale, '/legal-knowledge-center.html'));
    } else if (normalized.startsWith('/blog/')) {
      candidates.push(buildLocaleHref(targetLocale, '/blog.html'));
    } else if (normalized.startsWith('/insights/')) {
      candidates.push(buildLocaleHref(targetLocale, '/legal-knowledge-center.html'));
    } else if (normalized.startsWith('/contact')) {
      candidates.push(buildLocaleHref(targetLocale, '/contact.html'));
    } else if (normalized.startsWith('/about')) {
      candidates.push(buildLocaleHref(targetLocale, '/about.html'));
    }

    candidates.push(buildLocaleHref(targetLocale, '/index.html'));
    return [...new Set(candidates)];
  }

  async function resolveLocaleHref(href, targetLocale) {
    const safeHref = href || buildLocaleHref(targetLocale, '/index.html');
    const hrefParts = splitHref(safeHref);
    const pathToTest = normalizeLocalizedPath(hrefParts.path || safeHref);
    const englishPath = normalizePageHref(hrefParts.path || safeHref);
    const localeFallback = buildLocaleHref(targetLocale, '/index.html');
    const localeCandidates = localeFallbackCandidates(targetLocale, englishPath);

    const sitemapPaths = await loadSitemapPathSet();
    if (sitemapPaths) {
      if (sitemapPaths.has(pathToTest)) return safeHref;

      const fallbackFromSitemap = localeCandidates.find(candidate =>
        sitemapPaths.has(normalizeLocalizedPath(splitHref(candidate).path || candidate))
      );
      return fallbackFromSitemap || localeFallback;
    }

    try {
      const response = await fetch(pathToTest, { method: 'HEAD', cache: 'no-cache' });
      if (response.ok || response.status === 405) return safeHref;
    } catch {
      return localeFallback;
    }

    for (const candidate of localeCandidates) {
      const candidatePath = normalizeLocalizedPath(splitHref(candidate).path || candidate);
      try {
        const response = await fetch(candidatePath, { method: 'HEAD', cache: 'no-cache' });
        if (response.ok || response.status === 405) return candidate;
      } catch {
        // Continue fallback probing.
      }
    }

    return localeFallback;
  }

  function setLocaleItemState(item, isCurrent) {
    item.classList.toggle('active', isCurrent);
    if (isCurrent) {
      item.setAttribute('aria-current', 'true');
    } else {
      item.removeAttribute('aria-current');
    }
  }

  function countryLanguageSwitcherEntries(currentLocale, englishPath) {
    const body = document.body;
    if (!body || !body.classList.contains('country-landing-page')) return null;

    const sourcePath = normalizePageHref(body.getAttribute('data-country-source-path') || englishPath || '');
    const officialLocale = (body.getAttribute('data-country-official-locale') || '').trim();
    const officialPath = (body.getAttribute('data-country-official-path') || '').trim();
    const officialLabel = (body.getAttribute('data-country-official-label') || officialLocale.toUpperCase()).trim();
    const officialLanguage = (body.getAttribute('data-country-official-language') || officialLabel).trim();
    const officialBadge =
      COUNTRY_LANGUAGE_BADGE_OVERRIDES[officialLocale.toLowerCase()] ||
      ((officialLocale.split('-')[0] || officialLocale).trim() || officialLabel).slice(0, 3).toUpperCase();
    const pageVariant = (body.getAttribute('data-country-page-variant') || '').trim().toLowerCase();
    if (!sourcePath || sourcePath === '/services/immigration-to-brazil/by-country/index.html') return null;
    if (!officialLocale || !officialPath || !officialLabel) return null;

    const entries = [
      {
        key: 'en',
        label: 'EN',
        href: buildLocaleHref('en', sourcePath),
        ariaLabel: 'Switch language to English',
        lang: 'en',
        hreflang: 'en',
        active: pageVariant === 'en' || (!pageVariant && currentLocale === 'en')
      },
      {
        key: 'pt',
        label: 'PT',
        href: buildLocaleHref('pt', sourcePath),
        ariaLabel: 'Switch language to Portuguese',
        lang: 'pt',
        hreflang: 'pt',
        active: pageVariant === 'pt' || (!pageVariant && currentLocale === 'pt')
      },
      {
        key: officialLocale,
        label: officialBadge,
        href: toNavigablePath(officialPath),
        ariaLabel: `Switch language to ${officialLanguage}`,
        lang: officialLocale,
        hreflang: officialLocale,
        active:
          pageVariant === 'official' ||
          pageVariant === officialLocale ||
          (!pageVariant && currentLocale === officialLocale)
      }
    ];

    const seen = new Set();
    return entries.filter(entry => {
      const dedupeKey = entry.href;
      if (seen.has(dedupeKey) || !entry.href) return false;
      seen.add(dedupeKey);
      return true;
    });
  }

  function initializeCountryLanguageSwitcher(entries) {
    const localeItems = Array.from(document.querySelectorAll('[data-locale]'));
    if (!localeItems.length) return false;

    localeItems.forEach((item, index) => {
      const entry = entries[index];
      if (!entry) {
        item.hidden = true;
        item.style.display = 'none';
        item.removeAttribute('href');
        item.removeAttribute('aria-current');
        item.classList.remove('active');
        return;
      }

      item.hidden = false;
      item.style.removeProperty('display');
      item.textContent = entry.label;
      item.classList.toggle('utility-lang-link--wide', entry.label.length > 2);
      item.removeAttribute('data-i18n');
      item.setAttribute('data-locale', entry.key);
      item.setAttribute('href', entry.href);
      item.setAttribute('aria-label', entry.ariaLabel);
      item.setAttribute('lang', entry.lang);
      item.setAttribute('hreflang', entry.hreflang);
      item.setAttribute('data-locale-href', entry.href);
      setLocaleItemState(item, entry.active);

      item.addEventListener('click', event => {
        if (entry.active) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        if (entry.key === 'en' || entry.key === 'pt') {
          writeStorage(LOCALE_STORAGE_KEY, entry.key);
        }
        window.location.assign(entry.href);
      });
    });

    return true;
  }

  function syncCountryOfficialDocumentLanguage() {
    const body = document.body;
    if (!body) return;
    if ((body.getAttribute('data-country-page-variant') || '').trim().toLowerCase() !== 'official') return;

    const officialLocale = (body.getAttribute('data-country-official-locale') || '').trim();
    if (!officialLocale) return;
    document.documentElement.setAttribute('lang', officialLocale);
  }

  async function filterCountryLanguageSwitcherEntries(entries) {
    const filtered = [];

    for (const entry of entries) {
      if (entry.key === 'en' || entry.key === 'pt') {
        filtered.push(entry);
        continue;
      }

      try {
        const target = splitHref(entry.href).path || entry.href;
        const response = await fetch(normalizeNavigableFilePath(target), { method: 'HEAD', cache: 'no-cache' });
        if (response.ok || response.status === 405) {
          filtered.push(entry);
        }
      } catch {
        // Skip unavailable country-language variants.
      }
    }

    return filtered;
  }

  async function initLanguageSwitcher(currentLocale, englishPath) {
    const countryEntries = countryLanguageSwitcherEntries(currentLocale, englishPath);
    if (countryEntries?.length) {
      const availableEntries = await filterCountryLanguageSwitcherEntries(countryEntries);
      initializeCountryLanguageSwitcher(availableEntries);
      return;
    }

    document.querySelectorAll('[data-locale]').forEach(item => {
      const targetLocale = item.getAttribute('data-locale');
      if (!SUPPORTED_LOCALES.includes(targetLocale)) return;

      const targetHref = buildLocaleHref(targetLocale, englishPath);
      item.setAttribute('href', targetHref);
      item.setAttribute('data-locale-href', targetHref);
      setLocaleItemState(item, targetLocale === currentLocale);

      item.addEventListener('click', async event => {
        if (targetLocale === currentLocale) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        writeStorage(LOCALE_STORAGE_KEY, targetLocale);
        const safeTarget = await withTimeout(resolveLocaleHref(targetHref, targetLocale), targetHref);
        window.location.assign(safeTarget);
      });
    });
  }

  function syncA11yControls() {
    const mapping = [
      ['a11y-dyslexia', 'dyslexia'],
      ['a11y-autism', 'autism'],
      ['a11y-blind', 'blind'],
      ['a11y-high-contrast', 'highContrast'],
      ['a11y-grayscale', 'grayscale']
    ];

    mapping.forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (input) input.checked = Boolean(a11ySettings[key]);
    });

    const profile = document.getElementById('a11y-color-profile');
    if (profile) profile.value = a11ySettings.colorProfile;

    document.querySelectorAll('[data-font-scale]').forEach(button => {
      const target = Number(button.getAttribute('data-font-scale'));
      button.classList.toggle('active', target === Number(a11ySettings.fontScale));
    });

    document.querySelectorAll('[data-theme-mode]').forEach(button => {
      const mode = button.getAttribute('data-theme-mode');
      button.classList.toggle('active', mode === a11ySettings.theme);
    });
  }

  function initAccessibilityControls() {
    const toggle = document.getElementById('a11y-toggle');
    const panel = document.getElementById('a11y-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });

    const toggles = [
      ['a11y-dyslexia', 'dyslexia'],
      ['a11y-autism', 'autism'],
      ['a11y-blind', 'blind'],
      ['a11y-high-contrast', 'highContrast'],
      ['a11y-grayscale', 'grayscale']
    ];

    toggles.forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener('change', () => {
        a11ySettings[key] = input.checked;
        saveA11ySettings();
        applyA11ySettings();
      });
    });

    const profile = document.getElementById('a11y-color-profile');
    if (profile) {
      profile.addEventListener('change', () => {
        a11ySettings.colorProfile = profile.value;
        saveA11ySettings();
        applyA11ySettings();
      });
    }

    document.querySelectorAll('[data-font-scale]').forEach(button => {
      button.addEventListener('click', () => {
        a11ySettings.fontScale = Number(button.getAttribute('data-font-scale'));
        saveA11ySettings();
        applyA11ySettings();
        syncA11yControls();
      });
    });

    document.querySelectorAll('[data-theme-mode]').forEach(button => {
      button.addEventListener('click', () => {
        a11ySettings.theme = button.getAttribute('data-theme-mode');
        saveA11ySettings();
        applyA11ySettings();
        syncA11yControls();
      });
    });

    const reset = document.getElementById('a11y-reset');
    if (reset) reset.addEventListener('click', resetA11ySettings);

    syncA11yControls();
  }

  function injectSkipLink() {
    if (document.querySelector('.skip-to-content')) return;

    const link = document.createElement('a');
    link.className = 'skip-to-content';
    link.href = '#main-content';
    link.textContent = 'Skip to main content';
    document.body.prepend(link);
  }

  function ensureMainLandmark() {
    let main = document.querySelector('main#main-content');
    if (main) return;

    main = document.querySelector('main') || document.querySelector('section, article, .container, .hero-section');
    if (!main) return;

    main.id = 'main-content';
    main.setAttribute('role', 'main');
  }

  function classifyPageType(englishPath) {
    const normalized = normalizePageHref(englishPath);

    if (normalized === '/index.html') return 'home';
    if (normalized === '/about.html') return 'about';
    if (normalized === '/contact.html') return 'contact';
    if (normalized === '/client-feedback.html') return 'feedback';
    if (normalized === '/blog.html' || normalized === '/insights.html') return 'blog';
    if (normalized === '/services.html') return 'services';

    if (
      normalized === '/resources.html' ||
      normalized === '/legal-knowledge-center.html' ||
      normalized === '/legal-glossary.html' ||
      normalized === '/faq-hub.html' ||
      normalized === '/client-journey.html' ||
      normalized === '/practice-areas.html' ||
      normalized === '/search.html'
    ) {
      return 'resources';
    }

    if (normalized.startsWith('/services/')) {
      return isServiceDetailPage(normalized) ? 'service-detail' : 'service-hub';
    }

    return 'content';
  }

  function applyPageContext(englishPath) {
    const body = document.body;
    if (!body) return;

    const pageType = classifyPageType(englishPath);
    body.dataset.pageType = pageType;

    const staleClasses = [...body.classList].filter(name => name.startsWith('page-'));
    staleClasses.forEach(name => body.classList.remove(name));
    body.classList.add(`page-${pageType}`);
  }

  function stripCommentArtifacts() {
    const body = document.body;
    if (!body) return;

    const knownArtifacts = new Set([
      'Google Tag Manager',
      'End Google Tag Manager',
      'Final do Google Tag Manager',
      'Fin de Google Tag Manager',
      'Mettre fin a Google Tag Manager'
    ]);

    const markerPattern =
      /(google tag manager|hero|mobile hero|desktop hero|top spacing|main section|blog feed section|instagram section|contact form section|scripts|header|footer|post)\b/i;
    const headingLikeArtifacts =
      /^(=+\s*)?(hero|mobile|desktop|top spacing|main section|blog feed section|instagram section|contact form section|scripts|header|footer|post)(\s*=+)?$/i;

    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const targets = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = (node.nodeValue || '').trim();
      const parent = node.parentElement;
      if (!value) continue;

      const normalized = value
        .replace(/<!--|-->/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const upperRatio = normalized
        ? (normalized.replace(/[^A-Z]/g, '').length / Math.max(normalized.replace(/[^A-Za-z]/g, '').length, 1))
        : 0;
      const looksLikeCommentHeading =
        parent &&
        ['BODY', 'DIV', 'SECTION', 'MAIN', 'HEADER', 'FOOTER'].includes(parent.tagName) &&
        normalized.length <= 160 &&
        (headingLikeArtifacts.test(normalized) || markerPattern.test(normalized) || upperRatio >= 0.8);

      if (
        knownArtifacts.has(normalized) ||
        value.startsWith('<!--') ||
        value.endsWith('-->') ||
        looksLikeCommentHeading
      ) {
        targets.push(node);
      }
    }

    targets.forEach(node => {
      if (!node.parentNode) return;
      const cleaned = (node.nodeValue || '').replace(/<!--/g, '').replace(/-->/g, '').trim();
      if (!cleaned || knownArtifacts.has(cleaned) || markerPattern.test(cleaned)) {
        node.parentNode.removeChild(node);
      } else {
        node.nodeValue = cleaned;
      }
    });
  }

  function sanitizeBrokenMarkupArtifacts() {
    document.querySelectorAll('img').forEach(image => {
      [...image.attributes].forEach(attribute => {
        const validName = /^[a-zA-Z_:][a-zA-Z0-9:._-]*$/.test(attribute.name);
        if (!validName || attribute.name === 'div') {
          image.removeAttribute(attribute.name);
        }
      });

      const currentAlt = (image.getAttribute('alt') || '').trim();
      if (!currentAlt) return;

      const cleanedAlt = currentAlt
        .replace(/\s+class\s*=\s*img-fluid/gi, '')
        .replace(/\s+div\s*=\s*["']?\s*$/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (cleanedAlt !== currentAlt) {
        image.setAttribute('alt', cleanedAlt);
      }
    });
  }

  function enforceHeadingTone() {
    document.querySelectorAll('main h1, main h2').forEach(heading => {
      if (heading.classList.contains('text-white') || heading.classList.contains('text-cream')) return;
      heading.classList.add('text-gold');
    });
  }

  function replaceYearsExperienceCopy(locale) {
    const copy = {
      en: 'Legal practice since 2018',
      pt: 'Atuacao juridica desde 2018',
      es: 'Practica legal desde 2018',
      fr: 'Pratique juridique depuis 2018'
    };

    const replacement = copy[locale] || copy.en;
    const patterns = [
      /\b8\s*\+?\s*years?\s*(of\s*)?experience\b/gi,
      /\b\d{1,2}\s*\+?\s*years?\s*(of\s*)?experience\b/gi
    ];

    document.querySelectorAll('main h1, main h2, main h3, main p, main li, main small, main span').forEach(node => {
      if (node.children.length > 0) return;
      const original = node.textContent || '';
      if (!original.trim()) return;

      let updated = original;
      patterns.forEach(pattern => {
        updated = updated.replace(pattern, replacement);
      });

      if (updated !== original) node.textContent = updated;
    });
  }

  function enrichLogoAltText() {
    const logoSrcPattern = /\/assets\/img\/logo\/brazil-immigration-expert-monique\.jpg$/i;
    const fallbackAlt = 'Monique Fernandes law crest logo for immigration, civil, family, and human rights services';

    document.querySelectorAll('img').forEach((image, index) => {
      const src = image.getAttribute('src') || '';
      if (!logoSrcPattern.test(src)) return;

      let alt = fallbackAlt;
      if (image.closest('.utility-brand-icon-left')) alt = 'Monique Fernandes crest logo left emblem in header brand';
      if (image.closest('.utility-brand-icon-right')) alt = 'Monique Fernandes crest logo right emblem in header brand';
      if (image.classList.contains('footer-brand-logo')) alt = 'Monique Fernandes footer crest logo for bilingual legal services';
      if (image.classList.contains('footer-mini-logo')) alt = 'Monique Fernandes compact footer crest logo mark';
      if (image.classList.contains('home-signature-logo')) alt = 'Monique Fernandes signature crest logo in homepage services section';
      if (!image.closest('.utility-brand-icon-left') && !image.closest('.utility-brand-icon-right') && !image.classList.contains('footer-brand-logo') && !image.classList.contains('footer-mini-logo') && !image.classList.contains('home-signature-logo')) {
        alt = `${fallbackAlt} variant ${index + 1}`;
      }

      image.setAttribute('alt', alt);
    });
  }

  function ensureContextualImageAltText() {
    const heading = (document.querySelector('main h1')?.textContent || document.title || 'Legal service')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[|].*$/, '')
      .slice(0, 90);

    document.querySelectorAll('main img').forEach((image, index) => {
      const current = (image.getAttribute('alt') || '').trim();
      if (current) return;
      image.setAttribute('alt', `${heading} image ${index + 1} for legal guidance by Monique Fernandes`);
    });
  }

  function heroTrustCopy(locale) {
    const copy = {
      en: [
        { icon: 'fa-scale-balanced', label: 'Legal Consultancy', seo: 'Legal consultancy icon for strategic case planning' },
        { icon: 'fa-shield-alt', label: 'Licensed Attorney', seo: 'Licensed attorney trust icon for regulated legal representation' },
        { icon: 'fa-heart', label: 'Personalised Support', seo: 'Personalised support icon for client-focused legal care' },
        { icon: 'fa-globe', label: 'International Scope', seo: 'International scope icon for cross-border legal assistance' },
        { icon: 'fa-language', label: 'Bilingual Support', seo: 'Bilingual support icon for multilingual legal communication' },
        { icon: 'fa-video', label: 'Online Services', seo: 'Online legal services icon for remote consultations' }
      ],
      pt: [
        { icon: 'fa-scale-balanced', label: 'Consultoria Juridica', seo: 'Icone de consultoria juridica para estrategia de caso' },
        { icon: 'fa-shield-alt', label: 'Advogada Licenciada', seo: 'Icone de advogada licenciada para representacao legal' },
        { icon: 'fa-heart', label: 'Suporte Personalizado', seo: 'Icone de suporte personalizado para atendimento juridico' },
        { icon: 'fa-globe', label: 'Escopo Internacional', seo: 'Icone de escopo internacional para casos transfronteiricos' },
        { icon: 'fa-language', label: 'Atendimento Bilingue', seo: 'Icone de atendimento bilingue para comunicacao clara' },
        { icon: 'fa-video', label: 'Servicos Online', seo: 'Icone de servicos online para consultas remotas' }
      ],
      es: [
        { icon: 'fa-scale-balanced', label: 'Consultoria Legal', seo: 'Icono de consultoria legal para estrategia de casos' },
        { icon: 'fa-shield-alt', label: 'Abogada Licenciada', seo: 'Icono de abogada licenciada para representacion legal' },
        { icon: 'fa-heart', label: 'Soporte Personalizado', seo: 'Icono de soporte personalizado para atencion juridica' },
        { icon: 'fa-globe', label: 'Alcance Internacional', seo: 'Icono de alcance internacional para asuntos migratorios' },
        { icon: 'fa-language', label: 'Soporte Bilingue', seo: 'Icono de soporte bilingue para comunicacion multilingue' },
        { icon: 'fa-video', label: 'Servicios Online', seo: 'Icono de servicios online para consultas remotas' }
      ],
      fr: [
        { icon: 'fa-scale-balanced', label: 'Conseil Juridique', seo: 'Icone conseil juridique pour la strategie de dossier' },
        { icon: 'fa-shield-alt', label: 'Avocate Agreee', seo: 'Icone avocate agreee pour representation legale' },
        { icon: 'fa-heart', label: 'Soutien Personnalise', seo: 'Icone soutien personnalise pour accompagnement client' },
        { icon: 'fa-globe', label: 'Portee Internationale', seo: 'Icone portee internationale pour dossiers transfrontaliers' },
        { icon: 'fa-language', label: 'Support Bilingue', seo: 'Icone support bilingue pour communication multilingue' },
        { icon: 'fa-video', label: 'Services en Ligne', seo: 'Icone services en ligne pour consultations a distance' }
      ]
    };
    return copy[locale] || copy.en;
  }

  function ensureHeroTrustSignals(locale, englishPath) {
    if (!englishPath.startsWith('/services/')) return;

    const copy = heroTrustCopy(locale);
    document.querySelectorAll('main .hero-section').forEach(hero => {
      if (hero.querySelector('.hero-trust-grid')) return;

      const heroText = (hero.textContent || '').toLowerCase();
      if (/licensed attorney|advogada licenciada|abogada licenciada|avocate agreee/.test(heroText)) return;

      const target = hero.querySelector('.container');
      if (!target) return;

      const grid = document.createElement('div');
      grid.className = 'hero-trust-grid';
      grid.setAttribute('aria-label', 'Legal trust indicators');
      grid.innerHTML = copy
        .map(
          item => `
            <span class="hero-trust-item" aria-label="${escapeHtml(item.seo)}" title="${escapeHtml(item.seo)}">
              <i class="fas ${escapeHtml(item.icon)}" aria-hidden="true"></i>
              <span>${escapeHtml(item.label)}</span>
            </span>
          `
        )
        .join('');

      target.appendChild(grid);
    });
  }

  function ensureHeroScrollIndicators(locale) {
    const labels = {
      en: 'Scroll to main content',
      pt: 'Rolar para o conteudo principal',
      es: 'Desplazarse al contenido principal',
      fr: 'Defiler vers le contenu principal'
    };
    const ariaLabel = labels[locale] || labels.en;

    document.querySelectorAll('main .hero-section').forEach(hero => {
      const scrollTarget =
        [...hero.parentElement.children].find(
          sibling => sibling !== hero && sibling.tagName === 'SECTION' && !sibling.classList.contains('hero-section')
        ) || null;
      if (!scrollTarget) return;

      const bindIndicator = indicator => {
        if (!indicator || indicator.dataset.scrollBound === 'true') return;
        indicator.dataset.scrollBound = 'true';
        indicator.setAttribute('aria-label', ariaLabel);
        indicator.setAttribute('title', ariaLabel);
        indicator.setAttribute('role', 'button');
        indicator.setAttribute('tabindex', '0');
        indicator.removeAttribute('onclick');

        const handler = event => {
          event.preventDefault();
          scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        indicator.addEventListener('click', handler);
        indicator.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          handler(event);
        });
      };

      let indicator = hero.querySelector('.scroll-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = '<i class="fas fa-arrow-down" aria-hidden="true"></i>';
        hero.querySelector('.container')?.appendChild(indicator);
      }

      bindIndicator(indicator);
    });
  }

  function initializeHeaderInteractions() {
    if (window.bootstrap) {
      document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        bootstrap.Dropdown.getOrCreateInstance(toggle);
      });
    }

    if (window.bootstrap) {
      const desktop = window.matchMedia('(min-width: 1200px)');
      const hoverReady = window.matchMedia('(hover: hover) and (pointer: fine)');
      let openGroup = null;

      const closeGroupImmediately = group => {
        if (!group) return;
        const toggle = group.querySelector('.service-group-toggle');
        if (!toggle) return;
        bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
        group.classList.remove('show');
        const menu = group.querySelector('.service-group-menu');
        if (menu) menu.classList.remove('show');
      };

      document.querySelectorAll('.site-header .service-group').forEach(group => {
        const toggle = group.querySelector('.service-group-toggle');
        if (!toggle) return;

        const dropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
        let closeTimer = null;
        const canHoverOpen = () => desktop.matches && hoverReady.matches;

        const clearPendingClose = () => {
          if (!closeTimer) return;
          clearTimeout(closeTimer);
          closeTimer = null;
        };

        const openMenu = () => {
          if (!canHoverOpen()) return;
          clearPendingClose();
          if (openGroup && openGroup !== group) closeGroupImmediately(openGroup);
          dropdown.show();
          openGroup = group;
        };

        const closeMenu = immediate => {
          if (!canHoverOpen()) return;
          clearPendingClose();
          if (immediate) {
            closeGroupImmediately(group);
            if (openGroup === group) openGroup = null;
            return;
          }

          closeTimer = window.setTimeout(() => {
            closeGroupImmediately(group);
            if (openGroup === group) openGroup = null;
          }, 0);
        };

        group.addEventListener('mouseenter', openMenu);
        group.addEventListener('mouseleave', () => closeMenu(false));
        toggle.addEventListener('mouseenter', openMenu);
        group.addEventListener('focusin', openMenu);
        group.addEventListener('focusout', event => {
          const nextTarget = event.relatedTarget;
          if (nextTarget && group.contains(nextTarget)) return;
          closeMenu(true);
        });
      });
    }

    const navbarCollapse = document.getElementById('mainNav');
    if (!navbarCollapse || !window.bootstrap) return;

    document.querySelectorAll('#mainNav .nav-link, #mainNav .dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        // Keep mobile dropdown groups open when toggling section headers.
        if (link.classList.contains('dropdown-toggle') || link.getAttribute('data-bs-toggle') === 'dropdown') return;
        if (!navbarCollapse.classList.contains('show')) return;
        bootstrap.Collapse.getOrCreateInstance(navbarCollapse).hide();
      });
    });
  }

  function setActiveNavigation(englishPath) {
    const current = normalizePageHref(englishPath);
    const resourcePaths = new Set([
      '/resources.html',
      '/legal-knowledge-center.html',
      '/legal-glossary.html',
      '/faq-hub.html',
      '/client-journey.html',
      '/practice-areas.html',
      '/search.html',
      '/immigrationebook.html',
      '/legal-insights.html',
      '/legal-news-updates.html'
    ]);

    document.querySelectorAll('.site-header a.nav-link, .site-header .dropdown-item').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!shouldLocalizeHref(href)) return;
      const linkPath = normalizePageHref(href);
      const prefix = (link.getAttribute('data-match-prefix') || '').trim();
      const group = (link.getAttribute('data-match-group') || '').trim();

      let matchesPrefix = false;
      if (prefix) {
        const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
        const noLocalePrefix = normalizedPrefix.replace(/^\/(pt|es|fr)(?=\/|$)/i, '');
        const comparablePrefix = noLocalePrefix.endsWith('/') ? noLocalePrefix : `${noLocalePrefix}/`;
        matchesPrefix = current.startsWith(comparablePrefix);
      }

      let matchesGroup = false;
      if (group === 'resources') {
        matchesGroup = resourcePaths.has(current);
      }

      const isActive = linkPath === current || matchesPrefix || matchesGroup;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function initializeBackToTop() {
    let button = document.getElementById('back-to-top');

    if (!button) {
      button = document.createElement('button');
      button.id = 'back-to-top';
      button.type = 'button';
      button.className = 'btn btn-gold position-fixed bottom-0 end-0 m-4 shadow';
      button.style.zIndex = '1080';
      button.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
      button.setAttribute('aria-label', 'Back to top');
      document.body.appendChild(button);
    }

    button.classList.remove('d-none');

    if (button.dataset.backToTopBound !== 'true') {
      button.dataset.backToTopBound = 'true';
      button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const updateVisibility = () => {
      const isVisible = window.scrollY >= 260;
      button.classList.toggle('is-visible', isVisible);
      button.classList.toggle('show', isVisible);
      button.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    };

    if (button.dataset.backToTopScrollBound !== 'true') {
      button.dataset.backToTopScrollBound = 'true';
      let ticking = false;
      const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          updateVisibility();
          ticking = false;
        });
      };

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
    }

    updateVisibility();
  }

  function ensureFloatingActionsStack() {
    let stack = document.getElementById('floating-actions-stack');

    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'floating-actions-stack';
      stack.className = 'floating-actions-stack';
      document.body.appendChild(stack);
    } else {
      document.body.appendChild(stack);
    }

    const nina = document.getElementById('nina-chatbot-root');
    const whatsapp = document.querySelector('.whatsapp-super-float, .whatsapp-float');
    const backToTop = document.getElementById('back-to-top');

    if (nina) stack.appendChild(nina);
    if (whatsapp) stack.appendChild(whatsapp);
    if (backToTop) stack.appendChild(backToTop);
  }

  function initializeAOS() {
    if (window.__monique_aos_initialized__) return;
    if (!document.querySelector('[data-aos]')) return;

    window.__monique_aos_initialized__ = true;
    document.documentElement.classList.add('aos-ready');
  }

  function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        const href = anchor.getAttribute('href');
        if (!href || href.length < 2) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initializePremiumHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const applyState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    };

    if (header.dataset.premiumHeaderBound !== 'true') {
      header.dataset.premiumHeaderBound = 'true';
      let ticking = false;
      const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          applyState();
          ticking = false;
        });
      };

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
    }

    applyState();
  }

  function shouldReduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function progressLabelCopy(locale) {
    const copy = {
      en: 'Page progress',
      pt: 'Progresso da pagina',
      es: 'Progreso de la pagina',
      fr: 'Progression de la page'
    };

    return copy[locale] || copy.en;
  }

  function initializePageProgress(locale) {
    if (document.querySelector('.page-progress')) return;
    if ((document.documentElement.scrollHeight || 0) < 2200) return;

    const progress = document.createElement('div');
    progress.className = 'page-progress';
    progress.setAttribute('aria-label', progressLabelCopy(locale));
    progress.innerHTML = '<span class="page-progress__bar"></span>';
    document.body.appendChild(progress);

    const bar = progress.querySelector('.page-progress__bar');
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
  }

  function initializeRevealSystem() {
    document.body?.classList.add('motion-ready');

    const selectors = [
      'main > section',
      '[data-aos]',
      '.editorial-cluster-card',
      '.practice-focus-card',
      '.process-step',
      '.service-card',
      '.service-hub-panel',
      '.service-hub-service-card',
      '.service-hub-process-step',
      '.service-hub-resource-card',
      '.service-hub-faq-card',
      '.insight-feed-card',
      '.service-related-card',
      '.enhancement-card',
      '.resources-start-card',
      '.resources-format-card',
      '.resources-topic-card'
    ];

    const targets = [...document.querySelectorAll(selectors.join(', '))].filter(node => {
      if (node.matches('.hero-section, .page-hero, .hero, .auto-breadcrumb')) return false;
      if (node.classList.contains('reveal-in')) return false;
      return node.getBoundingClientRect().height > 24;
    });

    if (!targets.length) return;

    const revealTarget = node => {
      if (!node || node.classList.contains('reveal-in')) return;
      node.classList.add('reveal-in');
    };

    const revealVisibleTargets = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      targets.forEach(node => {
        const rect = node.getBoundingClientRect();
        const inViewport = rect.bottom > 0 && rect.top < viewportHeight * 0.94;
        if (inViewport) revealTarget(node);
      });
    };

    targets.forEach((node, index) => {
      if (node.dataset.revealReady !== 'true') {
        node.dataset.revealReady = 'true';
      }
      if (!node.classList.contains('reveal-ready')) {
        node.classList.add('reveal-ready');
      }
      if (!node.style.getPropertyValue('--reveal-delay')) {
        node.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 32}ms`);
      }
    });

    if (shouldReduceMotion() || !('IntersectionObserver' in window)) {
      targets.forEach(node => node.classList.add('reveal-in'));
      return;
    }

    revealVisibleTargets();
    window.requestAnimationFrame(revealVisibleTargets);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          revealTarget(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px 12% 0px',
        threshold: 0.04
      }
    );

    targets.forEach(node => observer.observe(node));
    window.__siteRevealObservers = window.__siteRevealObservers || [];
    window.__siteRevealObservers.push(observer);
  }

  function initializeInteractiveSurfaces() {
    const selectors = [
      '.home-hero__stage',
      '.about-page-home-hero .home-hero__stage',
      '.service-hub-shell',
      '.services-catalogue-hero',
      '.resources-hero-grid'
    ];

    const surfaces = [...document.querySelectorAll(selectors.join(', '))].filter(node => node.dataset.surfacePremiumBound !== 'true');
    if (!surfaces.length) return;

    surfaces.forEach(surface => {
      surface.dataset.surfacePremiumBound = 'true';
      surface.dataset.surfaceSpotlight = 'true';
      surface.classList.add('surface-spotlight');

      if (shouldReduceMotion()) return;

      const state = {
        currentX: 50,
        currentY: 20,
        targetX: 50,
        targetY: 20,
        frame: 0
      };

      const render = () => {
        state.currentX += (state.targetX - state.currentX) * 0.22;
        state.currentY += (state.targetY - state.currentY) * 0.22;
        surface.style.setProperty('--spotlight-x', `${state.currentX.toFixed(2)}%`);
        surface.style.setProperty('--spotlight-y', `${state.currentY.toFixed(2)}%`);

        if (Math.abs(state.targetX - state.currentX) < 0.08 && Math.abs(state.targetY - state.currentY) < 0.08) {
          state.frame = 0;
          if (!surface.matches(':hover, :focus-within')) {
            surface.classList.remove('is-spotlight-active');
          }
          return;
        }

        state.frame = window.requestAnimationFrame(render);
      };

      const start = () => {
        if (state.frame) return;
        state.frame = window.requestAnimationFrame(render);
      };

      surface.addEventListener('pointermove', event => {
        const bounds = surface.getBoundingClientRect();
        state.targetX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 100;
        state.targetY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 100;
        surface.classList.add('is-spotlight-active');
        start();
      });

      surface.addEventListener('pointerleave', () => {
        state.targetX = 50;
        state.targetY = 20;
        start();
      });
    });
  }

  function initializePremiumCtas() {
    const selectors = [
      '.hero-section .btn-gold',
      '.page-hero .btn-gold',
      '.hero .btn-gold',
      '.home-hero .btn-gold',
      '.service-hero .btn-gold',
      '.consultation-cta-box .btn',
      '.consultation-cta-button'
    ];

    const targets = [...document.querySelectorAll(selectors.join(', '))].filter(node => node.dataset.premiumCtaBound !== 'true');
    if (!targets.length) return;

    targets.forEach(button => {
      button.dataset.premiumCtaBound = 'true';
      button.classList.add('premium-cta-button');

      if (shouldReduceMotion()) return;

      const state = {
        currentX: 0,
        currentY: 0,
        currentScale: 1,
        targetX: 0,
        targetY: 0,
        targetScale: 1,
        frame: 0
      };

      const render = () => {
        state.currentX += (state.targetX - state.currentX) * 0.24;
        state.currentY += (state.targetY - state.currentY) * 0.24;
        state.currentScale += (state.targetScale - state.currentScale) * 0.22;

        button.style.setProperty('--premium-shift-x', `${state.currentX.toFixed(2)}px`);
        button.style.setProperty('--premium-shift-y', `${state.currentY.toFixed(2)}px`);
        button.style.setProperty('--premium-scale', state.currentScale.toFixed(3));

        if (
          Math.abs(state.targetX - state.currentX) < 0.05 &&
          Math.abs(state.targetY - state.currentY) < 0.05 &&
          Math.abs(state.targetScale - state.currentScale) < 0.003
        ) {
          state.frame = 0;
          return;
        }

        state.frame = window.requestAnimationFrame(render);
      };

      const start = () => {
        if (state.frame) return;
        state.frame = window.requestAnimationFrame(render);
      };

      button.addEventListener('pointermove', event => {
        const bounds = button.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) - 0.5;
        const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) - 0.5;
        state.targetX = x * 4.2;
        state.targetY = y * 3.2;
        state.targetScale = 1.008;
        start();
      });

      button.addEventListener('pointerleave', () => {
        state.targetX = 0;
        state.targetY = 0;
        state.targetScale = 1;
        start();
      });
    });
  }

  function initializePremiumMedia() {
    const selectors = [
      '.home-hero__stage img',
      '.services-catalogue-hero-shell img',
      '.service-hub-shell img',
      '.resources-hero-grid img',
      '.service-card img',
      '.editorial-cluster-card img',
      '.insight-feed-card img',
      '.service-related-card img',
      '.post-card img'
    ];

    const images = [...document.querySelectorAll(selectors.join(', '))].filter(image => image.dataset.premiumMediaBound !== 'true');
    if (!images.length) return;

    const observeVisibility = !shouldReduceMotion() && 'IntersectionObserver' in window;
    const observer = observeVisibility
      ? new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (!entry.isIntersecting) return;
              entry.target.dataset.premiumMediaVisible = 'true';
              if (entry.target.dataset.premiumMediaLoaded === 'true') {
                window.requestAnimationFrame(() => entry.target.classList.add('is-ready'));
              }
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: '18% 0px 18% 0px', threshold: 0.01 }
        )
      : null;

    images.forEach(image => {
      image.dataset.premiumMediaBound = 'true';
      image.classList.add('premium-media');

      const markReady = () => {
        image.dataset.premiumMediaLoaded = 'true';
        if (image.dataset.premiumMediaVisible === 'true') {
          window.requestAnimationFrame(() => image.classList.add('is-ready'));
        }
      };

      if (image.complete) {
        markReady();
      } else {
        image.addEventListener('load', markReady, { once: true });
        image.addEventListener('error', markReady, { once: true });
      }

      if (observer) {
        observer.observe(image);
      } else {
        image.dataset.premiumMediaVisible = 'true';
        if (image.dataset.premiumMediaLoaded === 'true') {
          window.requestAnimationFrame(() => image.classList.add('is-ready'));
        }
      }
    });
  }

  function initializeSectionDividers() {
    const dividers = [...document.querySelectorAll('.section-divider, .gold-line')].filter(node => node.dataset.dividerBound !== 'true');
    if (!dividers.length) return;

    dividers.forEach(divider => {
      divider.dataset.dividerBound = 'true';
      divider.classList.add('divider-ready');
    });

    if (shouldReduceMotion() || !('IntersectionObserver' in window)) {
      dividers.forEach(divider => divider.classList.add('divider-in'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('divider-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '16% 0px 8% 0px', threshold: 0.01 }
    );

    dividers.forEach(divider => observer.observe(divider));
  }

  function normalizeSearchTerm(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function labelTextForField(locale, field) {
    const byLocale = {
      en: {
        name: 'Full name',
        email: 'Email address',
        phone: 'Phone / WhatsApp',
        area: 'Legal area',
        message: 'Case details'
      },
      pt: {
        name: 'Nome completo',
        email: 'E-mail',
        phone: 'Telefone / WhatsApp',
        area: 'Área jurídica',
        message: 'Detalhes do caso'
      },
      es: {
        name: 'Nombre completo',
        email: 'Correo electrónico',
        phone: 'Teléfono / WhatsApp',
        area: 'Área jurídica',
        message: 'Detalles del caso'
      },
      fr: {
        name: 'Nom complet',
        email: 'E-mail',
        phone: 'Téléphone / WhatsApp',
        area: 'Domaine juridique',
        message: 'Détails du dossier'
      }
    };

    const dictionary = byLocale[locale] || byLocale.en;
    const explicit = field.getAttribute('data-field-label');
    if (explicit) return explicit;

    const placeholder = (field.getAttribute('placeholder') || '').replace(/\s*\*+\s*/g, '').trim();
    if (placeholder) return placeholder;

    const mapped = dictionary[field.name || ''];
    if (mapped) return mapped;

    if (field.tagName === 'TEXTAREA') return dictionary.message;
    if (field.tagName === 'SELECT') return dictionary.area;
    return 'Field';
  }

  function ensureVisibleFieldLabels(locale) {
    const forms = document.querySelectorAll('.funnel-page form');
    if (!forms.length) return;

    let generatedCount = 0;

    forms.forEach(form => {
      const fields = form.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, select'
      );

      fields.forEach(field => {
        if (field.labels && field.labels.length) return;

        const parent = field.parentElement;
        if (!parent) return;

        const fieldId = field.id || `auto-field-${++generatedCount}`;
        field.id = fieldId;

        const label = document.createElement('label');
        label.className = 'form-field__label';
        label.htmlFor = fieldId;
        label.textContent = labelTextForField(locale, field);

        if (parent === form) {
          const wrapper = document.createElement('div');
          wrapper.className = 'form-field';
          parent.insertBefore(wrapper, field);
          wrapper.append(label, field);
          return;
        }

        if (!parent.querySelector(`label[for="${fieldId}"]`)) {
          parent.classList.add('form-field');
          parent.insertBefore(label, field);
        }
      });
    });
  }

  function initializeCountryDirectory(locale, englishPath) {
    if (englishPath !== '/services/immigration-to-brazil/by-country/index.html') return;
    if (document.querySelector('[data-country-tiles]')) return;

    const panel = document.querySelector('.country-landing-panel');
    const chipRow = panel?.querySelector('.d-flex.flex-wrap.gap-2');
    if (!panel || !chipRow || chipRow.dataset.directoryEnhanced === 'true') return;

    const copy = {
      en: {
        label: 'Search countries',
        placeholder: 'Start typing a country name',
        available: (shown, total) => (shown === total ? `${total} countries available.` : `${shown} of ${total} countries shown.`),
        empty: 'No countries match this search.'
      },
      pt: {
        label: 'Pesquisar países',
        placeholder: 'Comece a digitar o nome do país',
        available: (shown, total) => (shown === total ? `${total} países disponíveis.` : `${shown} de ${total} países exibidos.`),
        empty: 'Nenhum país corresponde a esta pesquisa.'
      },
      es: {
        label: 'Buscar países',
        placeholder: 'Empieza a escribir el nombre del país',
        available: (shown, total) => (shown === total ? `${total} países disponibles.` : `${shown} de ${total} países mostrados.`),
        empty: 'Ningún país coincide con esta búsqueda.'
      },
      fr: {
        label: 'Rechercher des pays',
        placeholder: 'Commencez à saisir le nom du pays',
        available: (shown, total) => (shown === total ? `${total} pays disponibles.` : `${shown} pays affichés sur ${total}.`),
        empty: 'Aucun pays ne correspond à cette recherche.'
      }
    }[locale] || {
      label: 'Search countries',
      placeholder: 'Start typing a country name',
      available: (shown, total) => (shown === total ? `${total} countries available.` : `${shown} of ${total} countries shown.`),
      empty: 'No countries match this search.'
    };

    const countries = Array.from(chipRow.querySelectorAll('a.resource-link-chip')).map(link => ({
      href: link.getAttribute('href') || '#',
      label: (link.textContent || '').trim()
    }));

    if (!countries.length) return;

    chipRow.dataset.directoryEnhanced = 'true';

    const controls = document.createElement('div');
    controls.className = 'country-directory-controls';

    const search = document.createElement('div');
    search.className = 'country-directory-search';

    const searchLabel = document.createElement('label');
    searchLabel.className = 'form-field__label';
    searchLabel.textContent = copy.label;
    searchLabel.htmlFor = 'country-directory-search';

    const searchInput = document.createElement('input');
    searchInput.className = 'form-control';
    searchInput.id = 'country-directory-search';
    searchInput.type = 'search';
    searchInput.placeholder = copy.placeholder;
    searchInput.autocomplete = 'off';

    const count = document.createElement('p');
    count.className = 'country-directory-count mb-0';

    search.append(searchLabel, searchInput);
    controls.append(search, count);

    const groups = document.createElement('div');
    groups.className = 'country-directory-groups';

    chipRow.replaceWith(groups);
    panel.insertBefore(controls, groups);

    const collator = new Intl.Collator(locale === 'en' ? 'en' : locale, { sensitivity: 'base' });

    function renderDirectory() {
      const query = normalizeSearchTerm(searchInput.value);
      const visible = countries
        .filter(item => !query || normalizeSearchTerm(item.label).includes(query))
        .sort((a, b) => collator.compare(a.label, b.label));

      count.textContent = copy.available(visible.length, countries.length);
      groups.innerHTML = '';

      if (!visible.length) {
        const empty = document.createElement('div');
        empty.className = 'country-directory-empty';
        empty.textContent = copy.empty;
        groups.appendChild(empty);
        return;
      }

      const byLetter = new Map();
      visible.forEach(item => {
        const letter = normalizeSearchTerm(item.label).charAt(0).toUpperCase() || '#';
        if (!byLetter.has(letter)) byLetter.set(letter, []);
        byLetter.get(letter).push(item);
      });

      Array.from(byLetter.keys())
        .sort(collator.compare)
        .forEach(letter => {
          const section = document.createElement('section');
          section.className = 'country-directory-group';

          const heading = document.createElement('h2');
          heading.className = 'country-directory-group__title';
          heading.textContent = letter;

          const chips = document.createElement('div');
          chips.className = 'd-flex flex-wrap gap-2';

          byLetter.get(letter).forEach(item => {
            const link = document.createElement('a');
            link.className = 'resource-link-chip';
            link.href = item.href;
            link.textContent = item.label;
            chips.appendChild(link);
          });

          section.append(heading, chips);
          groups.appendChild(section);
        });
    }

    searchInput.addEventListener('input', renderDirectory);
    renderDirectory();
  }

  function initializeHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let t = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      const styles = getComputedStyle(document.documentElement);
      const wine = styles.getPropertyValue('--wine-900').trim() || '#210910';

      context.clearRect(0, 0, width, height);
      context.fillStyle = wine;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < 3; i += 1) {
        context.beginPath();
        context.moveTo(0, height * 0.58 + Math.sin(t + i) * 18);

        for (let x = 0; x <= width; x += 10) {
          const y = height * 0.58 + Math.sin(x * 0.011 + t + i) * (14 + i * 4);
          context.lineTo(x, y);
        }

        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();

        context.fillStyle = `${wine}${i === 0 ? 'c8' : i === 1 ? '96' : '62'}`;
        context.fill();
      }

      t += 0.015;
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  function contactFormCopy(locale) {
    const copy = {
      en: {
        invalid: 'Please fill all required fields.',
        sending: 'Sending...',
        success: 'Message sent successfully.',
        error: 'There was an error while submitting. Please try again.'
      },
      pt: {
        invalid: 'Preencha todos os campos obrigatorios.',
        sending: 'Enviando...',
        success: 'Mensagem enviada com sucesso.',
        error: 'Ocorreu um erro ao enviar. Tente novamente.'
      },
      es: {
        invalid: 'Complete todos los campos obligatorios.',
        sending: 'Enviando...',
        success: 'Mensaje enviado con exito.',
        error: 'Hubo un error al enviar. Intente otra vez.'
      },
      fr: {
        invalid: 'Veuillez remplir tous les champs obligatoires.',
        sending: 'Envoi...',
        success: 'Message envoye avec succes.',
        error: 'Une erreur est survenue pendant lenvoi. Reessayez.'
      }
    };

    return copy[locale] || copy.en;
  }

  function setPremiumFormState(form, state) {
    if (!form) return;

    const nodes = [
      form,
      form.closest('.site-form-shell'),
      form.closest('.service-hub-form-shell')
    ].filter(Boolean);

    nodes.forEach(node => {
      node.classList.remove('is-pending', 'is-success', 'is-error');
      if (state) node.classList.add(`is-${state}`);
    });
  }

  function setStatusTone(status, tone) {
    if (!status) return;
    status.classList.remove('is-loading', 'is-success', 'is-error');
    if (tone) status.classList.add(`is-${tone}`);
  }

  function updatePremiumFieldState(field) {
    if (!field) return;

    const value = typeof field.value === 'string' ? field.value.trim() : field.value;
    const hasValue = Boolean(value);
    field.classList.toggle('is-filled', hasValue);
    field.classList.toggle('is-empty', !hasValue);
  }

  function initializePremiumForms() {
    document.querySelectorAll('form').forEach(form => {
      const fields = [
        ...form.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, select'
        )
      ];

      if (!fields.length || form.dataset.premiumFormBound === 'true') return;
      form.dataset.premiumFormBound = 'true';
      form.classList.add('premium-form');

      fields.forEach(field => {
        updatePremiumFieldState(field);

        field.addEventListener('focus', () => {
          field.classList.add('is-focused');
        });

        field.addEventListener('blur', () => {
          field.classList.remove('is-focused');
          updatePremiumFieldState(field);
        });

        field.addEventListener('input', () => {
          field.classList.remove('is-invalid');
          if (field.value?.trim()) field.classList.add('is-valid');
          else field.classList.remove('is-valid');
          updatePremiumFieldState(field);
        });

        field.addEventListener('change', () => {
          if (field.value?.trim()) field.classList.add('is-valid');
          updatePremiumFieldState(field);
        });
      });
    });
  }

  function initializeContactForm(locale) {
    const form = document.getElementById('contact-form');
    if (!form) return;
    if (form.dataset.contactBound === 'true') return;
    form.dataset.contactBound = 'true';

    const copy = contactFormCopy(locale);
    let status = form.querySelector('[data-contact-status]');

    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status mt-3 mb-0';
      status.setAttribute('data-contact-status', 'true');
      form.appendChild(status);
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const requiredFields = form.querySelectorAll('input[required], textarea[required]');
      let valid = true;
      let firstInvalidField = null;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('is-invalid');
          field.classList.remove('is-valid');
          if (!firstInvalidField) firstInvalidField = field;
        } else {
          field.classList.remove('is-invalid');
          field.classList.add('is-valid');
        }
      });

      if (!valid) {
        setPremiumFormState(form, 'error');
        status.textContent = copy.invalid;
        setStatusTone(status, 'error');
        firstInvalidField?.focus();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const original = submitButton ? submitButton.innerHTML : '';
      setPremiumFormState(form, 'pending');
      status.textContent = copy.sending;
      setStatusTone(status, 'loading');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${copy.sending}`;
      }

      try {
        const response = await fetch('https://formspree.io/f/myzlnerw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });

        if (!response.ok) throw new Error('Submission failed');

        setPremiumFormState(form, 'success');
        status.textContent = copy.success;
        setStatusTone(status, 'success');
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid, .is-filled').forEach(field => {
          field.classList.remove('is-valid', 'is-invalid', 'is-filled');
        });
      } catch {
        setPremiumFormState(form, 'error');
        status.textContent = copy.error;
        setStatusTone(status, 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = original;
        }
      }
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || '').trim());
  }

  function triggerDownload(path, filename) {
    window.moniqueAnalytics?.trackFileDownload({
      file_url: path,
      file_name: filename,
      download_method: 'scripted_download'
    });

    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function newsletterCopy(locale) {
    const copy = {
      en: {
        title: 'Get The Newsletter PDF',
        subtitle: 'Insights, travel motivation, Brazil opportunities, and legal updates.',
        placeholder: 'Your email',
        submit: 'Download',
        sending: 'Sending...',
        thanks: 'Thank you. Your download is starting now.',
        invalid: 'Enter a valid email to unlock the PDF.',
        error: 'Could not submit now. Please try again.',
        linkIssue: 'Open newsletter',
        linkWhatsapp: 'Book on WhatsApp',
        badge: 'Newsletter'
      },
      pt: {
        title: 'Baixe A Newsletter Em PDF',
        subtitle: 'Insights, motivacao para viajar, oportunidades no Brasil e atualizacoes legais.',
        placeholder: 'Seu email',
        submit: 'Baixar',
        sending: 'Enviando...',
        thanks: 'Obrigada. O download comecara agora.',
        invalid: 'Informe um email valido para liberar o PDF.',
        error: 'Nao foi possivel enviar agora. Tente novamente.',
        linkIssue: 'Abrir newsletter',
        linkWhatsapp: 'Agendar no WhatsApp',
        badge: 'Newsletter'
      },
      es: {
        title: 'Descargue El Newsletter En PDF',
        subtitle: 'Insights, motivacion para viajar, oportunidades en Brasil y actualizaciones legales.',
        placeholder: 'Su correo',
        submit: 'Descargar',
        sending: 'Enviando...',
        thanks: 'Gracias. Su descarga comenzara ahora.',
        invalid: 'Ingrese un correo valido para desbloquear el PDF.',
        error: 'No se pudo enviar ahora. Intente de nuevo.',
        linkIssue: 'Abrir newsletter',
        linkWhatsapp: 'Reservar por WhatsApp',
        badge: 'Newsletter'
      },
      fr: {
        title: 'Telechargez La Newsletter En PDF',
        subtitle: 'Insights, motivation voyage, opportunites au Bresil et mises a jour juridiques.',
        placeholder: 'Votre email',
        submit: 'Telecharger',
        sending: 'Envoi...',
        thanks: 'Merci. Votre telechargement commence maintenant.',
        invalid: 'Entrez un email valide pour debloquer le PDF.',
        error: 'Envoi impossible pour le moment. Reessayez.',
        linkIssue: 'Ouvrir la newsletter',
        linkWhatsapp: 'Reserver sur WhatsApp',
        badge: 'Newsletter'
      }
    };

    return copy[locale] || copy.en;
  }

  function bindNewsletterDownloadForm(form, locale, sourceLabel = 'newsletter-form') {
    if (!form || form.dataset.newsletterBound === 'true') return;
    form.dataset.newsletterBound = 'true';

    const copy = newsletterCopy(locale);
    const submit = form.querySelector('button[type="submit"]');
    const emailField = form.querySelector('input[type="email"], input[name="email"]');
    let status = form.querySelector('[data-newsletter-status]');

    if (!status) {
      status = document.createElement('p');
      status.className = 'newsletter-status mb-0 mt-2';
      status.setAttribute('data-newsletter-status', 'true');
      form.appendChild(status);
    }

    const originalButton = submit ? submit.innerHTML : '';
    form.setAttribute('action', NEWSLETTER_FORM_ENDPOINT);
    form.addEventListener('submit', async event => {
      event.preventDefault();

      if (!emailField) return;
      const email = emailField.value.trim().toLowerCase();

      if (!isValidEmail(email)) {
        status.textContent = copy.invalid;
        setPremiumFormState(form, 'error');
        setStatusTone(status, 'error');
        emailField.classList.add('is-invalid');
        emailField.classList.remove('is-valid');
        emailField.focus();
        return;
      }

      status.textContent = '';
      setPremiumFormState(form, 'pending');
      setStatusTone(status, 'loading');
      emailField.classList.remove('is-invalid');
      emailField.classList.add('is-valid');

      if (submit) {
        submit.disabled = true;
        submit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${copy.sending}`;
      }

      const payload = new FormData(form);
      payload.set('email', email);
      payload.set('_subject', 'Newsletter download lead');
      payload.set('source_page', window.location.pathname);
      payload.set('source_form', sourceLabel);
      payload.set('locale', locale);
      payload.set('newsletter_list', 'newsletter');
      payload.set('requested_asset', NEWSLETTER_DOWNLOAD_PATH);
      try {
        const response = await fetch(NEWSLETTER_FORM_ENDPOINT, {
          method: 'POST',
          body: payload,
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('newsletter-submit-failed');

        setPremiumFormState(form, 'success');
        setStatusTone(status, 'success');
        status.innerHTML = `
          ${copy.thanks}
          <a href="${WHATSAPP_CONSULT_URL}" target="_blank" rel="noopener noreferrer">${copy.linkWhatsapp}</a>
        `;

        triggerDownload(NEWSLETTER_DOWNLOAD_PATH, NEWSLETTER_DOWNLOAD_FILENAME);
        form.reset();
        emailField.classList.remove('is-filled');
      } catch {
        setPremiumFormState(form, 'error');
        status.textContent = copy.error;
        setStatusTone(status, 'error');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = originalButton || copy.submit;
        }
      }
    });
  }

  function initializeNewsletterDownloadBar(locale) {
    if (document.getElementById('newsletter-download-bar')) return;

    const copy = newsletterCopy(locale);
    const issueHref = '/annual-newsletter-2025.html';
    const shell = document.createElement('aside');
    shell.id = 'newsletter-download-bar';
    shell.className = 'newsletter-download-bar';
    shell.setAttribute('aria-label', 'Newsletter download bar');
    shell.innerHTML = `
      <div class="newsletter-download-inner">
        <p class="newsletter-badge mb-0">${copy.badge}</p>
        <div class="newsletter-copy">
          <p class="newsletter-title mb-0">${copy.title}</p>
          <p class="newsletter-subtitle mb-0">${copy.subtitle}</p>
        </div>
        <form class="newsletter-mini-form" action="${NEWSLETTER_FORM_ENDPOINT}" method="POST" data-newsletter-download-form="true">
          <input type="email" name="email" autocomplete="email" placeholder="${copy.placeholder}" required aria-label="${copy.placeholder}">
          <button type="submit" class="btn btn-gold">${copy.submit}</button>
          <input type="hidden" name="topic" value="Newsletter PDF download">
          <input type="hidden" name="target_file" value="${NEWSLETTER_DOWNLOAD_PATH}">
          <p class="newsletter-status mb-0" data-newsletter-status="true"></p>
        </form>
        <div class="newsletter-links">
          <a href="${issueHref}">${copy.linkIssue}</a>
          <a href="${WHATSAPP_CONSULT_URL}" target="_blank" rel="noopener noreferrer">${copy.linkWhatsapp}</a>
        </div>
      </div>
    `;

    document.body.appendChild(shell);
    document.body.classList.add('has-newsletter-bar');
    const form = shell.querySelector('form[data-newsletter-download-form]');
    bindNewsletterDownloadForm(form, locale, 'sticky-bar');
  }

  function initializeNewsletterForms(locale) {
    document.querySelectorAll('form[data-newsletter-download-form]').forEach((form, index) => {
      const source = form.getAttribute('data-newsletter-source') || `inline-${index + 1}`;
      bindNewsletterDownloadForm(form, locale, source);
    });
  }

  function ebookGuideCopy(locale) {
    const copy = {
      en: {
        sending: 'Sending...',
        button: 'Download Now',
        done: 'Download started. Check your downloads folder.',
        invalid: 'Enter a valid email address before downloading.'
      },
      pt: {
        sending: 'Enviando...',
        button: 'Baixar agora',
        done: 'Download iniciado. Confira sua pasta de downloads.',
        invalid: 'Informe um email valido antes de baixar.'
      },
      es: {
        sending: 'Enviando...',
        button: 'Descargar ahora',
        done: 'Descarga iniciada. Revise su carpeta de descargas.',
        invalid: 'Ingrese un correo valido antes de descargar.'
      },
      fr: {
        sending: 'Envoi...',
        button: 'Telecharger',
        done: 'Telechargement demarre. Verifiez votre dossier de telechargements.',
        invalid: 'Entrez un email valide avant le telechargement.'
      }
    };
    return copy[locale] || copy.en;
  }

  function initializeEbookGuideForms(locale) {
    const englishPath = normalizePageHref(window.location.pathname);
    const forms = new Set(
      [...document.querySelectorAll('form#ebookForm, form#ebookFormCTA, form[data-ebook-download-form="true"]')]
    );

    if (englishPath === '/immigrationebook.html') {
      document.querySelectorAll('form[action*="formspree.io/f/myzlnerw"]').forEach(form => forms.add(form));
    }

    [...forms].forEach((form, index) => {
      if (form.dataset.ebookBound === 'true') return;
      form.dataset.ebookBound = 'true';

      const copy = ebookGuideCopy(locale);
      const action = form.getAttribute('action') || 'https://formspree.io/f/myzlnerw';
      const emailField = form.querySelector('input[type="email"], input[name="email"]');
      const submit = form.querySelector('button[type="submit"], #ebookButton');
      const source = form.getAttribute('data-ebook-source') || `ebook-form-${index + 1}`;
      const requestedAsset = form.getAttribute('data-download-path') || EBOOK_GUIDE_DOWNLOAD_PATH;
      const requestedFilename = form.getAttribute('data-download-filename') || EBOOK_GUIDE_DOWNLOAD_FILENAME;
      const requestedSubject = form.getAttribute('data-download-subject') || 'Ebook guide download lead';
      const status = document.createElement('p');
      status.className = 'small mt-2 mb-0';
      status.setAttribute('data-ebook-status', 'true');

      if (submit && !submit.nextElementSibling?.matches?.('[data-ebook-status]')) {
        submit.insertAdjacentElement('afterend', status);
      } else if (!form.querySelector('[data-ebook-status]')) {
        form.appendChild(status);
      }

      const activeStatus = form.querySelector('[data-ebook-status]') || status;
      const originalButton = submit ? submit.innerHTML : '';

      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!emailField) return;

        const email = (emailField.value || '').trim().toLowerCase();
        if (!isValidEmail(email)) {
          activeStatus.textContent = copy.invalid;
          setPremiumFormState(form, 'error');
          setStatusTone(activeStatus, 'error');
          emailField.classList.add('is-invalid');
          emailField.classList.remove('is-valid');
          emailField.focus();
          return;
        }

        activeStatus.textContent = '';
        setPremiumFormState(form, 'pending');
        setStatusTone(activeStatus, 'loading');
        emailField.classList.remove('is-invalid');
        emailField.classList.add('is-valid');

        if (submit) {
          submit.disabled = true;
          submit.innerHTML = `<span class=\"spinner-border spinner-border-sm me-2\" aria-hidden=\"true\"></span>${copy.sending}`;
        }

        const payload = new FormData(form);
        payload.set('email', email);
        payload.set('_subject', requestedSubject);
        payload.set('source_page', window.location.pathname);
        payload.set('source_form', source);
        payload.set('locale', locale);
        payload.set('requested_asset', requestedAsset);

        try {
          await fetch(action, {
            method: 'POST',
            body: payload,
            headers: { Accept: 'application/json' }
          });
        } catch {
          // Download should not depend on the lead endpoint.
        }

        triggerDownload(requestedAsset, requestedFilename);
        setPremiumFormState(form, 'success');
        setStatusTone(activeStatus, 'success');
        activeStatus.textContent = copy.done;
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = copy.button;
          submit.classList.remove('btn-success');
          submit.classList.add('btn-gold');
        }
      });
    });
  }

  function homeServicesShowcaseCopy(locale) {
    const copy = {
      en: {
        title: 'Detailed Service Catalogue',
        subtitle: 'Browse the full practice inventory across immigration, civil, family, human rights, and international matters.',
        cta: 'View service details'
      },
      pt: {
        title: 'Todos os Servicos Juridicos por Area',
        subtitle: 'Civil, familia, direitos humanos, vistos, residencias, cidadania e imigracao internacional.',
        cta: 'Ver detalhes do servico'
      },
      es: {
        title: 'Todos los Servicios Legales por Area',
        subtitle: 'Civil, familia, derechos humanos, visas, residencias, ciudadania e inmigracion internacional.',
        cta: 'Ver detalles del servicio'
      },
      fr: {
        title: 'Tous les Services Juridiques par Domaine',
        subtitle: 'Civil, famille, droits humains, visas, residences, citoyennete et immigration internationale.',
        cta: 'Voir les details du service'
      }
    };
    return copy[locale] || copy.en;
  }

  const HOME_SERVICE_TAB_CATEGORY = {
    civil: 'civil-law',
    family: 'family-law',
    'human-rights': 'human-rights',
    visas: 'brazilian-visas',
    residencies: 'brazilian-residencies',
    naturalisation: 'naturalisation',
    other: 'other-services',
    abroad: 'immigration-abroad'
  };

  const HOME_MISSING_SERVICE_IMAGE_BY_PATH = {
    '/services/civil/damages.html':
      '/assets/img/profile/services/all-legal-services/damages-brazil-civil-law-legal-claims-for-damages.webp',
    '/services/civil/professional-registration.html':
      '/assets/img/profile/services/all-legal-services/professional-registration-brazil-civil-law-legal-registration-for-professions.webp',
    '/services/immigration-to-brazil/residencies/cultural-exchange.html':
      '/assets/img/profile/services/all-legal-services/cultural-exchange-residency-brazil-immigration-law-long-term-legal-status-for-exchange-program-participants.webp',
    '/services/immigration-to-brazil/residencies/scientific-research.html':
      '/assets/img/profile/services/all-legal-services/scientific-research-residency-brazil-immigration-law-residence-permit-for-research-and-innovation.webp',
    '/services/immigration-to-brazil/citizenship/renouncing.html':
      '/assets/img/profile/services/all-legal-services/citizenship-renunciation-brazil-immigration-law-legal-process-to-renounce-brazilian-nationality.webp'
  };

  const SERVICE_CARD_ALIAS_BY_PATH = {
    '/services/immigration-to-brazil/residencies/cultural-exchange.html':
      '/services/immigration-to-brazil/residencies/educational-exchange.html',
    '/services/immigration-to-brazil/residencies/scientific-research.html':
      '/services/immigration-to-brazil/residencies/scientific.html',
    '/services/immigration-to-brazil/citizenship/renouncing.html':
      '/services/immigration-to-brazil/citizenship/renunciation.html'
  };

  const SERVICE_CATALOGUE_CATEGORY_FEATURED_PATH = {
    'civil-law': '/services/civil/apostille.html',
    'family-law': '/services/family/divorce.html',
    'human-rights': '/services/human-rights/refugee.html',
    'brazilian-visas': '/services/immigration-to-brazil/visas/digital-nomad.html',
    'brazilian-residencies': '/services/immigration-to-brazil/residencies/family-reunion.html',
    naturalisation: '/services/immigration-to-brazil/citizenship/ordinary.html',
    'other-services': '/services/immigration-to-brazil/other/consular-services.html',
    'immigration-abroad': '/services/immigration-abroad-services/europe.html'
  };

  const SERVICE_CATALOGUE_MANUAL_FALLBACKS = {
    '/services/civil/damages.html': {
      image: '/assets/img/profile/services/all-legal-services/damages-brazil-civil-law-legal-claims-for-damages.webp',
      names: {
        en: 'Damages',
        pt: 'Danos',
        es: 'Danos',
        fr: 'Dommages'
      },
      summaries: {
        en: 'Claims for material and moral damages.',
        pt: 'Pedidos de indenizacao por danos materiais e morais.',
        es: 'Reclamaciones por danos materiales y morales.',
        fr: 'Demandes d indemnisation pour dommages materiels et moraux.'
      }
    },
    '/services/civil/professional-registration.html': {
      image:
        '/assets/img/profile/services/all-legal-services/professional-registration-brazil-civil-law-legal-registration-for-professions.webp',
      names: {
        en: 'Professional Registration',
        pt: 'Registro Profissional',
        es: 'Registro Profesional',
        fr: 'Enregistrement Professionnel'
      },
      summaries: {
        en: 'Support with CREA, CRM, OAB and other validations.',
        pt: 'Suporte com CREA, CRM, OAB e outras validacoes profissionais.',
        es: 'Apoyo con CREA, CRM, OAB y otras validaciones profesionales.',
        fr: 'Support pour CREA, CRM, OAB et autres validations professionnelles.'
      }
    }
  };

  function inferHomeServiceImage(servicePath) {
    const normalized = normalizePageHref(servicePath);
    if (HOME_MISSING_SERVICE_IMAGE_BY_PATH[normalized]) {
      return HOME_MISSING_SERVICE_IMAGE_BY_PATH[normalized];
    }
    const inferredAsset = inferServiceCardAssetPath(normalized);
    return inferredAsset || '/assets/img/og-image.jpg';
  }

  function serviceCatalogueCategoryImageAlt(categoryName, locale) {
    const altByLocale = {
      en: `Representative image for ${categoryName} legal services in Brazil`,
      pt: `Imagem representativa de ${categoryName} para servicos juridicos no Brasil`,
      es: `Imagen representativa de ${categoryName} para servicios juridicos en Brasil`,
      fr: `Image representative de ${categoryName} pour les services juridiques au Bresil`
    };
    return altByLocale[locale] || altByLocale.en;
  }

  function resolveServiceMediaRecord(serviceMedia, servicePath) {
    const normalizedPath = normalizePageHref(servicePath || '');
    const aliasPath = SERVICE_CARD_ALIAS_BY_PATH[normalizedPath];
    return serviceMedia?.services?.[normalizedPath] || serviceMedia?.services?.[aliasPath] || null;
  }

  function inferServiceCardAssetPath(servicePath) {
    const normalizedPath = normalizePageHref(servicePath || '');
    const resolvedPath = SERVICE_CARD_ALIAS_BY_PATH[normalizedPath] || normalizedPath;
    const pathParts = resolvedPath.split('/').filter(Boolean);
    if (pathParts[0] !== 'services' || pathParts.length < 3) return '';

    const slug = pathParts[pathParts.length - 1].replace(/\.html$/i, '');
    const directory = pathParts.slice(1, -1).join('/');
    if (!slug || !directory) return '';

    return `/assets/img/services/cards/${directory}/${slug}.webp`;
  }

  function getServiceCatalogueCategoryMedia(categoryId, serviceMedia, locale, categoryName) {
    const featuredServicePath = SERVICE_CATALOGUE_CATEGORY_FEATURED_PATH[categoryId];
    const record = resolveServiceMediaRecord(serviceMedia, featuredServicePath);
    const image = record?.image || inferServiceCardAssetPath(featuredServicePath) || '/assets/img/og-image.jpg';
    const alt = record?.alts?.[locale] || record?.alts?.en || serviceCatalogueCategoryImageAlt(categoryName, locale);

    return {
      image,
      alt
    };
  }

  function getServiceCatalogueMedia(serviceMedia, servicePath, locale, serviceName, categoryName, categoryId) {
    const normalizedPath = normalizePageHref(servicePath || '');
    const manualFallback = SERVICE_CATALOGUE_MANUAL_FALLBACKS[normalizedPath];
    const record = resolveServiceMediaRecord(serviceMedia, normalizedPath);
    if (record && record.image) {
      return {
        image: record.image,
        alt: record.alts?.[locale] || record.alts?.en || `${serviceName} legal service in ${categoryName}`,
        name: record.names?.[locale] || record.names?.en || serviceName,
        summary: record.summaries?.[locale] || record.summaries?.en || ''
      };
    }

    const altByLocale = {
      en: `${serviceName} legal service image in ${categoryName}`,
      pt: `Imagem do servico ${serviceName} em ${categoryName}`,
      es: `Imagen del servicio ${serviceName} en ${categoryName}`,
      fr: `Image du service ${serviceName} en ${categoryName}`
    };

    return {
      image:
        manualFallback?.image ||
        inferServiceCardAssetPath(normalizedPath) ||
        getServiceCatalogueCategoryMedia(categoryId, serviceMedia, locale, categoryName).image ||
        '/assets/img/og-image.jpg',
      alt: altByLocale[locale] || altByLocale.en,
      name: manualFallback?.names?.[locale] || manualFallback?.names?.en || serviceName,
      summary: manualFallback?.summaries?.[locale] || manualFallback?.summaries?.en || ''
    };
  }

  function serviceCatalogueCopy(locale) {
    const copy = {
      en: {
        kicker: 'Services',
        title: 'Find the legal service that matches your situation',
        lead:
          'Start with the practice area, open the service page that fits your legal matter, and continue to consultation before advice or representation begins.',
        overviewKicker: 'Service overview',
        overviewTitle: 'Choose a service hub and continue to consultation',
        overviewSummary:
          'Use the catalogue to identify the right legal route, then open the service page that best matches your situation.',
        indexLabel: 'Jump to a service hub',
        jumpToCluster: 'Open services',
        openCategory: 'Open hub',
        viewDetails: 'Open service page',
        ctaTitle: 'Need help choosing the right service?',
        ctaText:
          'A consultation is the first step before legal advice or representation. Use it to identify the strongest legal route for your situation.',
        ctaPrimary: 'Book Consultation',
        ctaSecondary: 'WhatsApp Message',
        serviceUnit: 'service pages',
        stats: {
          categories: 'Service clusters',
          services: 'Service pages',
          support: 'Attorney-led'
        }
      },
      pt: {
        kicker: 'Servicos',
        title: 'Encontre o servico juridico que corresponde a sua situacao',
        lead:
          'Comece pela area, abra a pagina do servico mais adequada ao seu caso e siga para a consulta antes de qualquer orientacao ou representacao.',
        overviewKicker: 'Visao dos servicos',
        overviewTitle: 'Escolha um hub e siga para a consulta',
        overviewSummary:
          'Use o catalogo para identificar a rota juridica correta e abrir a pagina de servico mais adequada para a sua situacao.',
        indexLabel: 'Ir para um hub',
        jumpToCluster: 'Abrir servicos',
        openCategory: 'Abrir hub',
        viewDetails: 'Abrir pagina do servico',
        ctaTitle: 'Precisa identificar o servico certo?',
        ctaText:
          'A consulta e o primeiro passo antes da orientacao ou representacao juridica. Use a consulta para definir a rota mais adequada.',
        ctaPrimary: 'Agendar Consulta',
        ctaSecondary: 'Mensagem no WhatsApp',
        serviceUnit: 'paginas de servico',
        stats: {
          categories: 'Clusters de servico',
          services: 'Paginas de servico',
          support: 'Catalogo com estrategia'
        }
      },
      es: {
        kicker: 'Servicios',
        title: 'Encuentre el servicio legal que corresponde a su situacion',
        lead:
          'Empiece por el area, abra la pagina del servicio que mejor encaja con su asunto y siga a la consulta antes de la orientacion o representacion.',
        overviewKicker: 'Panorama de servicios',
        overviewTitle: 'Elija un hub y siga hacia la consulta',
        overviewSummary:
          'Use el catalogo para identificar la ruta legal correcta y abrir la pagina de servicio mas adecuada para su situacion.',
        indexLabel: 'Ir a un hub',
        jumpToCluster: 'Abrir servicios',
        openCategory: 'Abrir hub',
        viewDetails: 'Abrir pagina del servicio',
        ctaTitle: 'Necesita elegir el servicio correcto?',
        ctaText:
          'La consulta es el primer paso antes de la orientacion o representacion legal. Utilicela para definir la ruta mas adecuada.',
        ctaPrimary: 'Reservar Consulta',
        ctaSecondary: 'Mensaje por WhatsApp',
        serviceUnit: 'paginas de servicio',
        stats: {
          categories: 'Clusters de servicio',
          services: 'Paginas de servicio',
          support: 'Catalogo con estrategia'
        }
      },
      fr: {
        kicker: 'Services',
        title: 'Trouvez le service juridique adapte a votre situation',
        lead:
          'Commencez par le domaine, ouvrez la page de service la plus adaptee a votre dossier, puis passez a la consultation avant tout conseil ou toute representation.',
        overviewKicker: 'Vue des services',
        overviewTitle: 'Choisissez un hub puis passez a la consultation',
        overviewSummary:
          'Utilisez le catalogue pour identifier la bonne voie juridique puis ouvrir la page de service la plus adaptee a votre situation.',
        indexLabel: 'Aller vers un hub',
        jumpToCluster: 'Ouvrir les services',
        openCategory: 'Ouvrir le hub',
        viewDetails: 'Ouvrir la page de service',
        ctaTitle: 'Besoin de choisir le bon service ?',
        ctaText:
          'La consultation est la premiere etape avant tout conseil ou toute representation juridique. Utilisez-la pour definir la voie la plus adaptee.',
        ctaPrimary: 'Reserver une consultation',
        ctaSecondary: 'Message WhatsApp',
        serviceUnit: 'pages de service',
        stats: {
          categories: 'Clusters de service',
          services: 'Pages de service',
          support: 'Catalogue guide par avocat'
        }
      }
    };
    return copy[locale] || copy.en;
  }

  function serviceCategoryCopy(categoryId, locale) {
    const base = {
      en: {
        'civil-law': {
          name: 'Civil Law',
          summary: 'Documentation, contracts, registrations, property, damages, and formal civil legal acts in Brazil.'
        },
        'family-law': {
          name: 'Family Law',
          summary: 'Marriage, divorce, custody, inheritance, paternity, adoption, and family protection matters.'
        },
        'human-rights': {
          name: 'Human Rights',
          summary: 'Protection-focused legal support where dignity, safety, identity, or status are at stake.'
        },
        'brazilian-visas': {
          name: 'Brazilian Visas',
          summary: 'Entry routes, temporary visas, special permissions, and consular strategy for Brazil.'
        },
        'brazilian-residencies': {
          name: 'Brazilian Residencies',
          summary: 'Residence authorization routes for family, work, study, humanitarian, and long-term status planning.'
        },
        naturalisation: {
          name: 'Brazilian Naturalisation',
          summary: 'Citizenship strategy, eligibility analysis, and naturalisation pathways under Brazilian law.'
        },
        'other-services': {
          name: 'Other Services',
          summary: 'Consular support, fines, appeals, criminal records, deportation defense, and adjacent immigration matters.'
        },
        'immigration-abroad': {
          name: 'Immigration Abroad',
          summary: 'International relocation strategy for Brazilians planning legal migration routes outside Brazil.'
        }
      },
      pt: {
        'civil-law': {
          name: 'Direito Civil',
          summary: 'Documentacao, contratos, registros, propriedade, indenizacao e atos civis formais no Brasil.'
        },
        'family-law': {
          name: 'Direito de Familia',
          summary: 'Casamento, divorcio, guarda, sucessao, paternidade, adocao e protecao familiar.'
        },
        'human-rights': {
          name: 'Direitos Humanos',
          summary: 'Atuacao juridica focada em dignidade, seguranca, identidade e protecao de direitos.'
        },
        'brazilian-visas': {
          name: 'Vistos Brasileiros',
          summary: 'Rotas de entrada, vistos temporarios, permissoes especiais e estrategia consular para o Brasil.'
        },
        'brazilian-residencies': {
          name: 'Residencias Brasileiras',
          summary: 'Autorizacoes de residencia para familia, trabalho, estudo, protecao humanitaria e permanencia.'
        },
        naturalisation: {
          name: 'Naturalizacao Brasileira',
          summary: 'Planejamento de cidadania, analise de elegibilidade e rotas de naturalizacao.'
        },
        'other-services': {
          name: 'Outros Servicos',
          summary: 'Suporte consular, multas, recursos, antecedentes e outras demandas migratorias.'
        },
        'immigration-abroad': {
          name: 'Imigracao para o Exterior',
          summary: 'Planejamento de mudanca e estrategia juridica para brasileiros que desejam imigrar.'
        }
      },
      es: {
        'civil-law': {
          name: 'Derecho Civil',
          summary: 'Documentacion, contratos, registros, propiedad, danos y actos civiles formales en Brasil.'
        },
        'family-law': {
          name: 'Derecho de Familia',
          summary: 'Matrimonio, divorcio, custodia, herencia, paternidad, adopcion y proteccion familiar.'
        },
        'human-rights': {
          name: 'Derechos Humanos',
          summary: 'Apoyo legal centrado en dignidad, seguridad, identidad y proteccion.'
        },
        'brazilian-visas': {
          name: 'Visas Brasileñas',
          summary: 'Rutas de entrada, visas temporales, permisos especiales y estrategia consular para Brasil.'
        },
        'brazilian-residencies': {
          name: 'Residencias Brasileñas',
          summary: 'Rutas de residencia por familia, trabajo, estudio, proteccion humanitaria y permanencia.'
        },
        naturalisation: {
          name: 'Naturalizacion Brasileña',
          summary: 'Estrategia de ciudadania, elegibilidad y rutas de naturalizacion bajo la ley brasileña.'
        },
        'other-services': {
          name: 'Otros Servicios',
          summary: 'Apoyo consular, multas, apelaciones, antecedentes y asuntos migratorios complementarios.'
        },
        'immigration-abroad': {
          name: 'Inmigracion al Exterior',
          summary: 'Estrategia de migracion internacional para brasileños que planean vivir fuera de Brasil.'
        }
      },
      fr: {
        'civil-law': {
          name: 'Droit Civil',
          summary: 'Documents, contrats, enregistrements, propriete, dommages et actes civils formels au Bresil.'
        },
        'family-law': {
          name: 'Droit de la Famille',
          summary: 'Mariage, divorce, garde, succession, paternite, adoption et protection familiale.'
        },
        'human-rights': {
          name: 'Droits Humains',
          summary: 'Accompagnement juridique axe sur la dignite, la securite, l identite et la protection.'
        },
        'brazilian-visas': {
          name: 'Visas Bresiliens',
          summary: 'Routes d entree, visas temporaires, permissions speciales et strategie consulaire pour le Bresil.'
        },
        'brazilian-residencies': {
          name: 'Residences Bresiliennes',
          summary: 'Routes de residence pour famille, travail, etudes, protection humanitaire et sejour durable.'
        },
        naturalisation: {
          name: 'Naturalisation Bresilienne',
          summary: 'Strategie de citoyennete, analyse d eligibilite et voies de naturalisation.'
        },
        'other-services': {
          name: 'Autres Services',
          summary: 'Support consulaire, amendes, recours, antecedents et questions migratoires connexes.'
        },
        'immigration-abroad': {
          name: 'Immigration a l Etranger',
          summary: 'Strategie de migration internationale pour les Bresiliens qui souhaitent s installer hors du Bresil.'
        }
      }
    };
    return (base[locale] && base[locale][categoryId]) || base.en[categoryId] || { name: 'Legal Services', summary: '' };
  }

  function serviceCategoryIcon(categoryId) {
    const iconByCategory = {
      'civil-law': 'fa-scale-balanced',
      'family-law': 'fa-people-roof',
      'human-rights': 'fa-hand-holding-heart',
      'brazilian-visas': 'fa-passport',
      'brazilian-residencies': 'fa-house-flag',
      naturalisation: 'fa-certificate',
      'other-services': 'fa-briefcase',
      'immigration-abroad': 'fa-earth-americas'
    };
    return iconByCategory[categoryId] || 'fa-scale-balanced';
  }

  function serviceSlugFromPath(servicePath) {
    const match = String(servicePath || '').match(/\/([^/]+)\.html$/);
    return match ? match[1] : '';
  }

  function serviceItemIcon(service, categoryId) {
    const slug = serviceSlugFromPath(service?.path);
    const iconBySlug = {
      apostille: 'fa-stamp',
      cnpj: 'fa-building',
      contracts: 'fa-file-signature',
      cpf: 'fa-id-card',
      damages: 'fa-money-bill-wave',
      debt: 'fa-hand-holding-dollar',
      defences: 'fa-shield-halved',
      indemnification: 'fa-sack-dollar',
      leasing: 'fa-key',
      licenses: 'fa-certificate',
      'name-change': 'fa-signature',
      notarization: 'fa-pen-nib',
      property: 'fa-house',
      'power-of-attorney': 'fa-file-signature',
      'professional-registration': 'fa-id-badge',
      adoption: 'fa-children',
      alimony: 'fa-wallet',
      birth: 'fa-baby',
      custody: 'fa-child-reaching',
      divorce: 'fa-heart-crack',
      'domestic-violence': 'fa-shield-heart',
      'foreign-divorce': 'fa-globe',
      guardianship: 'fa-hands-holding-child',
      'hague-convention': 'fa-scale-balanced',
      inheritance: 'fa-scroll',
      marriage: 'fa-ring',
      'marriage-by-proxy': 'fa-link',
      paternity: 'fa-dna',
      prenup: 'fa-file-contract',
      'stable-union': 'fa-house',
      asylum: 'fa-person-shelter',
      children: 'fa-child',
      disability: 'fa-wheelchair',
      discrimination: 'fa-scale-balanced',
      gender: 'fa-venus-mars',
      indigenous: 'fa-tree',
      lgbtq: 'fa-rainbow',
      'lgbtq-plus': 'fa-rainbow',
      privacy: 'fa-user-shield',
      refugee: 'fa-hand-holding-heart',
      trafficking: 'fa-shield-halved',
      workers: 'fa-helmet-safety',
      artistic: 'fa-masks-theater',
      business: 'fa-briefcase',
      'educational-exchange': 'fa-graduation-cap',
      'digital-nomad': 'fa-laptop',
      diplomatic: 'fa-building-columns',
      family: 'fa-people-roof',
      humanitarian: 'fa-hand-holding-heart',
      investor: 'fa-chart-line',
      journalist: 'fa-newspaper',
      medical: 'fa-briefcase-medical',
      religious: 'fa-place-of-worship',
      research: 'fa-microscope',
      retiree: 'fa-umbrella-beach',
      sports: 'fa-futbol',
      startup: 'fa-rocket',
      student: 'fa-graduation-cap',
      tourist: 'fa-camera',
      transit: 'fa-route',
      volunteer: 'fa-handshake-angle',
      work: 'fa-helmet-safety',
      cplp: 'fa-globe',
      'family-reunion': 'fa-people-roof',
      'health-treatment': 'fa-briefcase-medical',
      'scientific-research': 'fa-microscope',
      'skilled-worker': 'fa-helmet-safety',
      study: 'fa-graduation-cap',
      extraordinary: 'fa-certificate',
      ordinary: 'fa-certificate',
      provisional: 'fa-hourglass-half',
      special: 'fa-star',
      renouncing: 'fa-arrow-right-from-bracket',
      reacquisition: 'fa-rotate-left',
      appeals: 'fa-gavel',
      'consular-services': 'fa-building-columns',
      'criminal-records': 'fa-fingerprint',
      deportation: 'fa-plane-departure',
      extradition: 'fa-gavel',
      expulsion: 'fa-plane-departure',
      fines: 'fa-receipt',
      translation: 'fa-language',
      africa: 'fa-earth-africa',
      asia: 'fa-earth-asia',
      europe: 'fa-earth-europe',
      mercosul: 'fa-earth-americas',
      uk: 'fa-landmark',
      usa: 'fa-flag-usa'
    };
    return iconBySlug[slug] || serviceCategoryIcon(categoryId);
  }

  function buildServicesCatalogueMarkup(catalog, locale, serviceMedia) {
    const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
    const copy = serviceCatalogueCopy(locale);
    const allServices = flattenServiceCatalog(catalog);

    const indexMarkup = categories
      .map(category => {
        const categoryCopy = serviceCategoryCopy(category.id, locale);
        return `<a class="services-catalogue-index__link" href="#catalogue-${escapeHtml(category.id)}">${escapeHtml(categoryCopy.name)}</a>`;
      })
      .join('');

    const overviewCards = categories
      .map(category => {
        const categoryCopy = serviceCategoryCopy(category.id, locale);
        const categoryMedia = getServiceCatalogueCategoryMedia(category.id, serviceMedia, locale, categoryCopy.name);
        const serviceCount = Array.isArray(category.services) ? category.services.length : 0;
        const categoryIcon = serviceCategoryIcon(category.id);

        return `
          <article class="services-category-card">
            <div class="services-category-card__media">
              <img
                src="${escapeHtml(categoryMedia.image)}"
                alt="${escapeHtml(categoryMedia.alt)}"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="services-category-card__body">
              <div class="services-category-card__heading">
                <span class="services-category-card__icon" aria-hidden="true"><i class="fas ${categoryIcon}"></i></span>
                <div>
                  <p class="services-category-card__eyebrow mb-2">${escapeHtml(categoryCopy.name)}</p>
                  <h2 class="services-category-card__title h3">${escapeHtml(categoryCopy.name)}</h2>
                </div>
              </div>
              <p class="services-category-card__summary mb-0">${escapeHtml(categoryCopy.summary)}</p>
              <div class="services-category-card__footer">
                <span class="services-category-card__count">${escapeHtml(`${serviceCount} ${copy.serviceUnit}`)}</span>
                <a class="btn btn-outline-gold rounded-pill px-3" href="#catalogue-${escapeHtml(category.id)}">${escapeHtml(copy.jumpToCluster)}</a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    const sectionsMarkup = categories
      .map(category => {
        const categoryCopy = serviceCategoryCopy(category.id, locale);
        const hubHref = localizeHref(category.hub || '/services.html', locale);
        const servicesMarkup = (category.services || [])
          .map((service, index) => {
            const serviceIcon = serviceItemIcon(service, category.id);
            const serviceCardMedia = getServiceCatalogueMedia(
              serviceMedia,
              service.path,
              locale,
              service.name,
              categoryCopy.name,
              category.id
            );
            const localizedServiceName = serviceCardMedia.name || service.name;
            const localizedServiceSummary =
              serviceCardMedia.summary || service.summary || `${localizedServiceName} legal support in Brazil.`;
            return `
              <article class="services-catalogue-item">
                <div class="services-catalogue-item__media">
                  <img
                    src="${escapeHtml(serviceCardMedia.image)}"
                    alt="${escapeHtml(serviceCardMedia.alt)}"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="services-catalogue-item__body">
                  <div class="services-catalogue-item__top">
                    <span class="services-catalogue-item__index">${String(index + 1).padStart(2, '0')}</span>
                    <span class="services-catalogue-item__icon" aria-hidden="true"><i class="fas ${serviceIcon}"></i></span>
                  </div>
                  <h3 class="services-catalogue-item__title h5">${escapeHtml(localizedServiceName)}</h3>
                  <p class="services-catalogue-item__summary mb-2">${escapeHtml(localizedServiceSummary)}</p>
                  <p class="services-catalogue-item__meta mb-0">${escapeHtml(categoryCopy.name)}</p>
                  <a class="services-catalogue-item__link" href="${escapeHtml(localizeHref(service.path, locale))}">
                    ${escapeHtml(copy.viewDetails)} <i aria-hidden="true" class="fas fa-arrow-right"></i>
                  </a>
                </div>
              </article>
            `;
          })
          .join('');

        return `
          <section class="services-catalogue-section" id="catalogue-${escapeHtml(category.id)}">
            <div class="services-catalogue-section__header">
              <div>
                <p class="services-catalogue-section__eyebrow mb-2">${escapeHtml(categoryCopy.name)}</p>
                <h2 class="services-catalogue-section__title h2">${escapeHtml(categoryCopy.name)}</h2>
                <p class="services-catalogue-section__summary mb-0">${escapeHtml(categoryCopy.summary)}</p>
              </div>
              <a class="btn btn-outline-gold rounded-pill px-4" href="${escapeHtml(hubHref)}">${escapeHtml(copy.openCategory)}</a>
            </div>
            <div class="services-catalogue-section__grid">
              ${servicesMarkup}
            </div>
          </section>
        `;
      })
      .join('');

    return `
      <div class="services-catalogue-app">
        <section class="services-catalogue-overview" id="services-catalogue-overview">
          <p class="services-catalogue-section__eyebrow mb-2">${escapeHtml(copy.overviewKicker)}</p>
          <h2 class="h2 mb-3">${escapeHtml(copy.overviewTitle)}</h2>
          <p class="services-catalogue-section__summary mb-0">${escapeHtml(copy.overviewSummary)}</p>
          <div class="services-catalogue-index" aria-label="${escapeHtml(copy.indexLabel)}">
            ${indexMarkup}
          </div>
          <div class="services-category-grid">
            ${overviewCards}
          </div>
        </section>
        ${sectionsMarkup}
        <section class="services-catalogue-cta">
          <div class="services-catalogue-cta__copy">
            <p class="services-catalogue-section__eyebrow mb-2">${escapeHtml(copy.kicker)}</p>
            <h2 class="h2 mb-2">${escapeHtml(copy.ctaTitle)}</h2>
            <p class="services-catalogue-section__summary mb-0">${escapeHtml(copy.ctaText)}</p>
          </div>
          <div class="d-grid d-sm-flex gap-3">
            <a class="btn btn-gold rounded-pill px-4" href="${escapeHtml(localizeHref('/book-consultation.html', locale))}">${escapeHtml(copy.ctaPrimary)}</a>
            <a class="btn btn-success rounded-pill px-4" href="https://wa.me/554399614034" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.ctaSecondary)}</a>
          </div>
        </section>
      </div>
    `;
  }

  function scrollToServicesCatalogueTarget() {
    let requestedId = 'services-catalogue-overview';
    if (window.location.hash) {
      try {
        requestedId = decodeURIComponent(window.location.hash.slice(1)) || requestedId;
      } catch {
        requestedId = 'services-catalogue-overview';
      }
    }

    const scrollTarget =
      document.getElementById(requestedId) || document.getElementById('services-catalogue-overview');

    if (!scrollTarget) return;

    const alignTarget = () => {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.requestAnimationFrame(() => {
      alignTarget();
      window.setTimeout(alignTarget, 250);
    });
  }

  async function initializeServicesCataloguePage(locale, englishPath) {
    if (englishPath !== '/services.html') return;

    const heroShell = document.querySelector('.services-catalogue-hero-shell');
    const app = document.getElementById('services-catalogue-app');
    if (!heroShell || !app) return;

    const [catalog, serviceMedia] = await Promise.all([loadServiceCatalog(), loadServiceMedia()]);
    if (!catalog || !Array.isArray(catalog.categories)) return;

    const copy = serviceCatalogueCopy(locale);
    const categories = catalog.categories;
    const allServices = flattenServiceCatalog(catalog);

    heroShell.innerHTML = `
      <p class="section-kicker mb-2">${escapeHtml(copy.kicker)}</p>
      <h1 class="display-4 display-lg-3 fw-bold text-gold mb-3">${escapeHtml(copy.title)}</h1>
      <p class="services-catalogue-hero__lead mb-0">${escapeHtml(copy.lead)}</p>
      <div class="services-catalogue-hero__stats" aria-label="Catalogue statistics">
        <article class="services-catalogue-stat">
          <strong>${escapeHtml(String(categories.length))}</strong>
          <span>${escapeHtml(copy.stats.categories)}</span>
        </article>
        <article class="services-catalogue-stat">
          <strong>${escapeHtml(String(allServices.length))}</strong>
          <span>${escapeHtml(copy.stats.services)}</span>
        </article>
        <article class="services-catalogue-stat">
          <strong>100%</strong>
          <span>${escapeHtml(copy.stats.support)}</span>
        </article>
      </div>
    `;

    app.innerHTML = buildServicesCatalogueMarkup(catalog, locale, serviceMedia);

    if (window.scrollY <= 24) {
      scrollToServicesCatalogueTarget();
    }
  }

  function buildMissingHomeServiceCard(service, categoryName, locale, ctaText) {
    const imageSrc = inferHomeServiceImage(service.path);
    const altByLocale = {
      en: `${service.name} legal support in ${categoryName}`,
      pt: `${service.name} servico juridico em ${categoryName}`,
      es: `${service.name} servicio legal en ${categoryName}`,
      fr: `${service.name} service juridique en ${categoryName}`
    };
    const summaryByLocale = {
      en: service.summary || `${service.name} legal service support in Brazil.`,
      pt: `${service.name}: suporte juridico especializado para este servico.`,
      es: `${service.name}: apoyo juridico especializado para este servicio.`,
      fr: `${service.name} : accompagnement juridique specialise pour ce service.`
    };
    const imageAlt = altByLocale[locale] || altByLocale.en;
    const summary = summaryByLocale[locale] || summaryByLocale.en;
    const card = document.createElement('div');
    card.className = 'col-md-4 col-lg-3';
    card.innerHTML = `
      <div class="service-card p-4 text-center border border-gold rounded bg-burgundy">
        <img alt="${escapeHtml(imageAlt)}" class="img-fluid mb-3" src="${escapeHtml(imageSrc)}" loading="lazy" decoding="async"/>
        <h3 class="fs-4 text-gold fw-bold mb-3">${escapeHtml(service.name)}</h3>
        <p class="text-light">${escapeHtml(summary)}</p>
        <a class="btn btn-outline-gold btn-lg text-white" href="${escapeHtml(localizeHref(service.path, locale))}">${escapeHtml(ctaText)}</a>
      </div>
    `;
    return card;
  }

  async function enhanceHomeServicesShowcase(locale, englishPath) {
    if (englishPath !== '/index.html') return;

    const tabs = document.getElementById('servicesTab');
    const tabContent = document.getElementById('servicesTabContent');
    if (!tabs || !tabContent) return;

    const section = tabs.closest('section');
    if (section) {
      section.classList.add('home-services-showcase');
      const heading = section.querySelector('h2');
      const copy = homeServicesShowcaseCopy(locale);
      if (heading) heading.textContent = copy.title;
      if (!section.querySelector('.home-services-showcase-intro')) {
        const intro = document.createElement('p');
        intro.className = 'home-services-showcase-intro text-center text-cream mb-4';
        intro.textContent = copy.subtitle;
        if (heading) heading.insertAdjacentElement('afterend', intro);
      }

      const narrativeTarget = document.getElementById('home-practice-catalog-anchor');
      if (narrativeTarget && section.previousElementSibling !== narrativeTarget) {
        narrativeTarget.insertAdjacentElement('afterend', section);
      }
    }

    const catalog = await loadServiceCatalog();
    if (!catalog || !Array.isArray(catalog.categories)) return;
    const categoryById = new Map(catalog.categories.map(category => [category.id, category]));
    const ctaText = homeServicesShowcaseCopy(locale).cta;

    Object.entries(HOME_SERVICE_TAB_CATEGORY).forEach(([paneId, categoryId]) => {
      const pane = tabContent.querySelector(`#${paneId}`);
      const category = categoryById.get(categoryId);
      if (!pane || !category) return;

      const row = pane.querySelector('.row.g-4, .row');
      if (!row) return;

      const existingLinks = new Set(
        [...row.querySelectorAll('a[href]')]
          .map(link => normalizePageHref(link.getAttribute('href') || ''))
          .filter(Boolean)
      );

      (category.services || []).forEach(service => {
        const normalizedPath = normalizePageHref(service.path || '');
        if (!normalizedPath || existingLinks.has(normalizedPath)) return;

        const card = buildMissingHomeServiceCard(service, category.name || 'Legal Services', locale, ctaText);
        row.appendChild(card);
        existingLinks.add(normalizedPath);
      });
    });
  }

  async function injectHomeBlogPreview(locale, englishPath) {
    if (englishPath !== '/index.html') return;
    if (document.getElementById('home-blog-preview')) return;

    let payload = null;
    const feedUrl = locale === 'en' ? '/data/insights-feed.json' : `/data/insights-feed.${locale}.json`;
    try {
      let response = await fetch(feedUrl, { cache: 'no-cache' });
      if (!response.ok && locale !== 'en') {
        response = await fetch('/data/insights-feed.json', { cache: 'no-cache' });
      }
      if (!response.ok) return;
      payload = await response.json();
    } catch {
      return;
    }

    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (!items.length) return;

    const copyByLocale = {
      en: {
        kicker: 'Knowledge and Updates',
        title: 'Browse Legal Insights by Topic',
        subtitle:
          'Show more posts directly on the homepage, switch to the legal topic that matters to you, and keep the newest guidance first.',
        openBlog: 'Open Blog',
        allPosts: 'All Posts',
        sortLabel: 'Order',
        sortNewest: 'Newest first',
        sortOldest: 'Oldest first',
        countSuffix: 'posts',
        showingPrefix: 'Showing',
        loadMore: 'Load More Posts',
        readPost: 'Read post',
        fallbackMeta: 'Legal Insight'
      },
      pt: {
        kicker: 'Conteudo e Atualizacoes',
        title: 'Navegue pelos Insights Juridicos por Tema',
        subtitle:
          'Mostre mais publicacoes na pagina inicial, troque para o tema juridico mais relevante e mantenha o conteudo mais recente primeiro.',
        openBlog: 'Abrir Blog',
        allPosts: 'Todas as Publicacoes',
        sortLabel: 'Ordem',
        sortNewest: 'Mais recentes',
        sortOldest: 'Mais antigas',
        countSuffix: 'publicacoes',
        showingPrefix: 'Mostrando',
        loadMore: 'Carregar mais publicacoes',
        readPost: 'Ler publicacao',
        fallbackMeta: 'Insight Juridico'
      },
      es: {
        kicker: 'Contenido y Actualizaciones',
        title: 'Explore los Insights Legales por Tema',
        subtitle:
          'Muestre muchas mas publicaciones en la pagina inicial, cambie al tema legal que le interese y mantenga primero las mas recientes.',
        openBlog: 'Abrir Blog',
        allPosts: 'Todas las Publicaciones',
        sortLabel: 'Orden',
        sortNewest: 'Mas recientes',
        sortOldest: 'Mas antiguas',
        countSuffix: 'publicaciones',
        showingPrefix: 'Mostrando',
        loadMore: 'Cargar mas publicaciones',
        readPost: 'Leer publicacion',
        fallbackMeta: 'Insight Legal'
      },
      fr: {
        kicker: 'Contenu et Actualites',
        title: 'Parcourir les Insights Juridiques par Theme',
        subtitle:
          'Affichez beaucoup plus de publications sur la page d accueil, basculez vers le theme juridique utile et gardez les plus recentes en premier.',
        openBlog: 'Ouvrir le Blog',
        allPosts: 'Toutes les Publications',
        sortLabel: 'Ordre',
        sortNewest: 'Plus recentes',
        sortOldest: 'Plus anciennes',
        countSuffix: 'publications',
        showingPrefix: 'Affichage',
        loadMore: 'Charger plus de publications',
        readPost: 'Lire la publication',
        fallbackMeta: 'Insight Juridique'
      }
    };
    const copy = copyByLocale[locale] || copyByLocale.en;
    const dateLocaleByLang = {
      en: 'en-US',
      pt: 'pt-BR',
      es: 'es-ES',
      fr: 'fr-FR'
    };
    const categoryOrder = [
      'brazilian-naturalisation',
      'brazilian-residencies',
      'brazilian-visas',
      'civil-law',
      'family-law',
      'human-rights',
      'immigration-abroad',
      'news',
      'other-immigration-services'
    ];
    const normalizedItems = items
      .map(item => {
        const normalizedUrl = normalizePageHref(item.url || '');
        return {
          ...item,
          url: normalizedUrl || item.url || '/blog.html',
          hub: item.hub || '',
          hubLabel: item.hubLabel || item.hub || copy.fallbackMeta,
          image: item.image || '/assets/img/og-image.jpg'
        };
      })
      .filter(item => categoryOrder.includes(item.hub));
    const deduped = [];
    const seen = new Set();
    normalizedItems.forEach(item => {
      const key = `${item.url || ''}::${String(item.titleShort || item.title || '').trim().toLowerCase()}`;
      if (!item.url || seen.has(key)) return;
      seen.add(key);
      deduped.push(item);
    });
    const sortItems = (list, sortMode) =>
      list.slice().sort((a, b) => {
        const aDate = Date.parse(a.date || '1970-01-01');
        const bDate = Date.parse(b.date || '1970-01-01');
        return sortMode === 'oldest' ? aDate - bDate : bDate - aDate;
      });
    const formatDate = value => {
      const parsed = new Date(value || '');
      if (Number.isNaN(parsed.getTime())) return '';
      return parsed.toLocaleDateString(dateLocaleByLang[locale] || 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    const sorted = sortItems(deduped, 'newest');
    const hubs = categoryOrder
      .map(key => {
        const matches = sorted.filter(item => item.hub === key);
        if (!matches.length) return null;
        return {
          key,
          label: matches[0].hubLabel || key,
          count: matches.length
        };
      })
      .filter(Boolean);
    const batchSize = 20;
    let activeHub = 'all';
    let sortMode = 'newest';
    let visibleCount = batchSize;
    const localizePath = path => localizeHref(path, locale);
    const countLabel = count => `${count} ${copy.countSuffix}`;
    const buildCards = list =>
      list
        .map(
        item => `
          <article class="home-blog-card">
            <a class="home-blog-image-link" href="${localizePath(item.url || '/blog.html')}">
              <img src="${escapeHtml(item.image || '/assets/img/og-image.jpg')}" alt="${escapeHtml(item.imageAlt || item.title || 'Legal blog post preview')}" loading="lazy">
            </a>
            <div class="home-blog-card-body">
              <p class="home-blog-meta">
                <span>${escapeHtml(item.hubLabel || copy.fallbackMeta)}</span>
                <span aria-hidden="true">•</span>
                <time datetime="${escapeHtml(item.date || '')}">${escapeHtml(formatDate(item.date))}</time>
              </p>
              <h3><a href="${localizePath(item.url || '/blog.html')}">${escapeHtml(item.titleShort || item.title || 'Legal insight')}</a></h3>
              <p>${escapeHtml(sanitizeInsightExcerptText(item.excerptShort || item.excerpt || ''))}</p>
              <a class="home-blog-read" href="${localizePath(item.url || '/blog.html')}">${escapeHtml(copy.readPost)}</a>
            </div>
          </article>
        `
        )
        .join('');

    const section = document.createElement('section');
    section.id = 'home-blog-preview';
    section.className = 'home-blog-preview py-6 py-lg-8';
    section.innerHTML = `
      <div class="container-xxl">
        <div class="home-blog-shell">
          <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <div class="home-blog-heading">
              <p class="home-blog-kicker mb-1">${escapeHtml(copy.kicker)}</p>
              <h2 class="mb-2">${escapeHtml(copy.title)}</h2>
              <p class="home-blog-intro mb-0">${escapeHtml(copy.subtitle)}</p>
            </div>
            <a class="btn btn-outline-gold rounded-pill px-4" href="${localizePath('/blog.html')}">${escapeHtml(copy.openBlog)}</a>
          </div>
          <div class="home-blog-toolbar">
            <div class="home-blog-tabs" role="tablist" aria-label="${escapeHtml(copy.title)}">
              <button class="home-blog-tab is-active" type="button" data-hub="all">${escapeHtml(copy.allPosts)} <span>${escapeHtml(countLabel(sorted.length))}</span></button>
              ${hubs
                .map(
                  hub => `<button class="home-blog-tab" type="button" data-hub="${escapeHtml(hub.key)}">${escapeHtml(hub.label)} <span>${escapeHtml(countLabel(hub.count))}</span></button>`
                )
                .join('')}
            </div>
            <div class="home-blog-controls">
              <label class="home-blog-sort-label" for="home-blog-sort">${escapeHtml(copy.sortLabel)}</label>
              <select class="form-select home-blog-sort-select" id="home-blog-sort">
                <option value="newest">${escapeHtml(copy.sortNewest)}</option>
                <option value="oldest">${escapeHtml(copy.sortOldest)}</option>
              </select>
            </div>
          </div>
          <p class="home-blog-results-count mb-3" aria-live="polite"></p>
          <div class="home-blog-grid"></div>
          <div class="home-blog-actions" hidden>
            <button class="btn btn-outline-gold rounded-pill px-4 home-blog-load-more" type="button">${escapeHtml(copy.loadMore)}</button>
          </div>
        </div>
      </div>
    `;

    const grid = section.querySelector('.home-blog-grid');
    const tabs = Array.from(section.querySelectorAll('.home-blog-tab'));
    const resultsCount = section.querySelector('.home-blog-results-count');
    const sortSelect = section.querySelector('#home-blog-sort');
    const loadMoreButton = section.querySelector('.home-blog-load-more');
    const currentList = () => {
      const scoped = activeHub === 'all' ? deduped : deduped.filter(item => item.hub === activeHub);
      return sortItems(scoped, sortMode);
    };
    const renderCards = () => {
      const list = currentList();
      const visibleItems = list.slice(0, visibleCount);
      if (grid) grid.innerHTML = buildCards(visibleItems);
      if (resultsCount) {
        resultsCount.textContent = `${copy.showingPrefix} ${Math.min(visibleCount, list.length)} of ${list.length} ${copy.countSuffix}`;
      }
      if (loadMoreButton) {
        const allVisible = visibleCount >= list.length;
        loadMoreButton.disabled = allVisible;
        loadMoreButton.parentElement.hidden = allVisible;
      }
      tabs.forEach(tab => {
        const selected = (tab.getAttribute('data-hub') || 'all') === activeHub;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activeHub = tab.getAttribute('data-hub') || 'all';
        visibleCount = batchSize;
        renderCards();
      });
    });

    sortSelect?.addEventListener('change', event => {
      sortMode = event.target.value === 'oldest' ? 'oldest' : 'newest';
      visibleCount = batchSize;
      renderCards();
    });

    loadMoreButton?.addEventListener('click', () => {
      const list = currentList();
      visibleCount = Math.min(visibleCount + batchSize, list.length);
      renderCards();
    });

    renderCards();

    const target =
      document.getElementById('home-resource-capture') ||
      document.querySelector('#main-content .home-services-showcase') ||
      document.getElementById('servicesTab')?.closest('section');
    if (target) {
      target.insertAdjacentElement('afterend', section);
      return;
    }

    const main = document.getElementById('main-content');
    if (main) main.appendChild(section);
  }

  function buildBreadcrumbSchema() {
    const items = [];
    const breadcrumbItems = document.querySelectorAll('.auto-breadcrumb .breadcrumb-item');
    if (!breadcrumbItems.length) return null;

    breadcrumbItems.forEach((item, index) => {
      const link = item.querySelector('a');
      const name = link?.textContent?.trim() || item.textContent?.trim();
      if (!name) return;

      const url = link ? absoluteUrl(link.getAttribute('href') || '/') : absoluteUrl(window.location.pathname);
      items.push({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: url
      });
    });

    if (!items.length) return null;

    return {
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  }

  function buildLegalServiceProviderSchema() {
    return {
      '@type': 'LegalService',
      '@id': `${SITE_ORIGIN}/#legalservice`,
      name: 'Monique Fernandes Law',
      url: SITE_ORIGIN,
      telephone: '+554399614034',
      areaServed: [
        { '@type': 'Country', name: 'Brazil' },
        { '@type': 'Place', name: 'International' }
      ],
      availableLanguage: ['English', 'Portuguese'],
      sameAs: [
        'https://www.instagram.com/moniquefadv/',
        'https://www.facebook.com/moniquefadv/',
        'https://br.linkedin.com/in/moniquefadv/en'
      ]
    };
  }

  async function initializeServiceStructuredData(locale, englishPath) {
    const normalized = normalizePageHref(englishPath);
    if (normalized !== '/services.html' && !normalized.startsWith('/services/')) return;

    const [catalog, serviceMedia] = await Promise.all([loadServiceCatalog(), loadServiceMedia()]);
    if (!catalog || !Array.isArray(catalog.categories)) return;

    const currentUrl = absoluteUrl(window.location.pathname);
    const provider = buildLegalServiceProviderSchema();
    const breadcrumb = buildBreadcrumbSchema();
    const metaDescription = readMetaContent('meta[name="description"]');
    const ogImage = readMetaContent('meta[property="og:image"]');
    const firstImage = document.querySelector('main img')?.getAttribute('src') || '';
    const pageImage = absoluteUrl(ogImage || firstImage || '/assets/img/og-image.jpg');
    const graph = [provider];
    if (breadcrumb) graph.push(breadcrumb);

    if (normalized === '/services.html') {
      const copy = serviceCatalogueCopy(locale);
      const categories = catalog.categories.map((category, index) => {
        const categoryCopy = serviceCategoryCopy(category.id, locale);
        return {
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(localizeHref(category.hub || '/services.html', locale)),
          name: categoryCopy.name,
          description: categoryCopy.summary
        };
      });

      graph.push({
        '@type': 'CollectionPage',
        name: copy.title,
        url: currentUrl,
        description: metaDescription || copy.lead,
        image: pageImage,
        isPartOf: SITE_ORIGIN,
        about: { '@id': `${SITE_ORIGIN}/#legalservice` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: categories
        }
      });
    } else if (isServiceDetailPage(normalized)) {
      const flattenedCatalog = flattenServiceCatalog(catalog);
      const serviceEntry = resolveServiceEntry(normalized, flattenedCatalog);
      const categoryId = serviceEntry?.categoryId || inferCategoryFromPath(normalized);
      const categoryCopy = serviceCategoryCopy(categoryId, locale);
      const localizedService = getServiceCatalogueMedia(
        serviceMedia,
        normalized,
        locale,
        serviceEntry?.name || formatServiceTitleFromPath(normalized),
        categoryCopy.name
      );
      const pageTitle =
        document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() ||
        localizedService.name ||
        serviceEntry?.name ||
        formatServiceTitleFromPath(normalized);
      const description =
        localizedService.summary ||
        serviceEntry?.summary ||
        metaDescription ||
        `Legal support for ${pageTitle.toLowerCase()} with attorney-led preparation, documentation review, and structured case strategy.`;
      const faqEntries = extractAccordionFaqEntries(8);

      graph.push({
        '@type': 'Service',
        name: pageTitle,
        serviceType: categoryCopy.name,
        category: categoryCopy.name,
        description,
        url: currentUrl,
        image: pageImage,
        provider: { '@id': `${SITE_ORIGIN}/#legalservice` },
        areaServed: { '@type': 'Country', name: 'Brazil' },
        availableLanguage: ['English', 'Portuguese']
      });

      if (faqEntries.length) {
        graph.push({
          '@type': 'FAQPage',
          mainEntity: faqEntries.map(item => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a
            }
          }))
        });
      }
    } else {
      const categoryId = inferCategoryFromPath(normalized);
      const categoryCopy = serviceCategoryCopy(categoryId, locale);
      let services = flattenServiceCatalog(catalog).filter(item => item.categoryId === categoryId);
      if (!services.length && normalized.startsWith('/services/immigration-to-brazil/')) {
        const brazilCatalogIds = ['brazilian-visas', 'brazilian-residencies', 'naturalisation', 'other-services'];
        services = flattenServiceCatalog(catalog).filter(item => brazilCatalogIds.includes(item.categoryId));
      }
      const pageTitle =
        document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() ||
        categoryCopy.name ||
        'Legal Services';
      const description =
        metaDescription ||
        categoryCopy.summary ||
        'Browse attorney-led legal services with clear category structure and direct access to detailed service pages.';

      graph.push({
        '@type': 'CollectionPage',
        name: pageTitle,
        url: currentUrl,
        description,
        image: pageImage,
        about: { '@id': `${SITE_ORIGIN}/#legalservice` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: services.map((service, index) => {
            const serviceCardMedia = getServiceCatalogueMedia(
              serviceMedia,
              service.path,
              locale,
              service.name,
              categoryCopy.name
            );
            return {
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(localizeHref(service.path, locale)),
              name: serviceCardMedia.name || service.name,
              description: serviceCardMedia.summary || service.summary || ''
            };
          })
        }
      });
    }

    upsertJsonLd('services-structured-data', {
      '@context': 'https://schema.org',
      '@graph': graph
    });
  }

  function breadcrumbLabel(segment, locale) {
    const labels = {
      en: {
        about: 'About',
        blog: 'Blog',
        contact: 'Contact',
        'book-consultation': 'Book Consultation',
        'legal-knowledge-center': 'Legal Knowledge Center',
        faq: 'FAQ',
        glossary: 'Glossary',
        fyi: 'FYI',
        insights: 'Insights',
        services: getText('en', 'nav.services') || 'Services',
        civil: serviceCategoryCopy('civil-law', 'en').name,
        family: serviceCategoryCopy('family-law', 'en').name,
        'human-rights': serviceCategoryCopy('human-rights', 'en').name,
        'immigration-to-brazil': 'Immigration to Brazil',
        'immigration-abroad-services': serviceCategoryCopy('immigration-abroad', 'en').name,
        visas: 'Visas',
        residencies: 'Residencies',
        citizenship: 'Citizenship',
        other: serviceCategoryCopy('other-services', 'en').name,
        'all-legal-services': 'All Legal Services'
      },
      pt: {
        about: 'Sobre',
        blog: getText('pt', 'nav.blog') || 'Blog',
        contact: getText('pt', 'nav.contact') || 'Contato',
        'book-consultation': getText('pt', 'nav.book_cta') || 'Agendar Consulta',
        'legal-knowledge-center': 'Centro de Conhecimento Juridico',
        faq: 'Perguntas Frequentes',
        glossary: 'Glossario',
        fyi: getText('pt', 'nav.fyi') || 'FYI',
        insights: getText('pt', 'nav.insights') || 'Insights',
        services: getText('pt', 'nav.services') || 'Servicos',
        civil: serviceCategoryCopy('civil-law', 'pt').name,
        family: serviceCategoryCopy('family-law', 'pt').name,
        'human-rights': serviceCategoryCopy('human-rights', 'pt').name,
        'immigration-to-brazil': 'Imigracao para o Brasil',
        'immigration-abroad-services': serviceCategoryCopy('immigration-abroad', 'pt').name,
        visas: 'Vistos',
        residencies: 'Residencias',
        citizenship: 'Naturalizacao',
        other: serviceCategoryCopy('other-services', 'pt').name,
        'all-legal-services': 'Todos os Servicos Juridicos'
      },
      es: {
        about: 'Sobre',
        blog: getText('es', 'nav.blog') || 'Blog',
        contact: getText('es', 'nav.contact') || 'Contacto',
        'book-consultation': getText('es', 'nav.book_cta') || 'Reservar Consulta',
        'legal-knowledge-center': 'Centro de Conocimiento Juridico',
        faq: 'Preguntas Frecuentes',
        glossary: 'Glosario',
        fyi: getText('es', 'nav.fyi') || 'FYI',
        insights: getText('es', 'nav.insights') || 'Insights',
        services: getText('es', 'nav.services') || 'Servicios',
        civil: serviceCategoryCopy('civil-law', 'es').name,
        family: serviceCategoryCopy('family-law', 'es').name,
        'human-rights': serviceCategoryCopy('human-rights', 'es').name,
        'immigration-to-brazil': 'Inmigracion a Brasil',
        'immigration-abroad-services': serviceCategoryCopy('immigration-abroad', 'es').name,
        visas: 'Visas',
        residencies: 'Residencias',
        citizenship: 'Naturalizacion',
        other: serviceCategoryCopy('other-services', 'es').name,
        'all-legal-services': 'Todos los Servicios Legales'
      },
      fr: {
        about: 'A propos',
        blog: getText('fr', 'nav.blog') || 'Blog',
        contact: getText('fr', 'nav.contact') || 'Contact',
        'book-consultation': getText('fr', 'nav.book_cta') || 'Reserver une consultation',
        'legal-knowledge-center': 'Centre de connaissances juridiques',
        faq: 'FAQ',
        glossary: 'Glossaire',
        fyi: getText('fr', 'nav.fyi') || 'FYI',
        insights: getText('fr', 'nav.insights') || 'Insights',
        services: getText('fr', 'nav.services') || 'Services',
        civil: serviceCategoryCopy('civil-law', 'fr').name,
        family: serviceCategoryCopy('family-law', 'fr').name,
        'human-rights': serviceCategoryCopy('human-rights', 'fr').name,
        'immigration-to-brazil': 'Immigration au Bresil',
        'immigration-abroad-services': serviceCategoryCopy('immigration-abroad', 'fr').name,
        visas: 'Visas',
        residencies: 'Residences',
        citizenship: 'Naturalisation',
        other: serviceCategoryCopy('other-services', 'fr').name,
        'all-legal-services': 'Tous les Services Juridiques'
      }
    };

    if (labels[locale]?.[segment]) return labels[locale][segment];

    return segment
      .replace('.html', '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function currentBreadcrumbLabel(locale, englishPath) {
    if (englishPath === '/services.html') return getText(locale, 'nav.services') || 'Services';

    const heading = document.querySelector('main h1')?.textContent?.replace(/\s+/g, ' ').trim();
    if (heading) return heading;

    const title = document.title.replace(/\s*\|\s*Monique Fernandes Law\s*$/i, '').trim();
    if (title) return title;

    return breadcrumbLabel(serviceSlugFromPath(englishPath), locale);
  }

  function breadcrumbHref(segments, index) {
    const current = `/${segments.slice(0, index + 1).join('/')}`;

    const map = {
      '/services': '/services.html',
      '/services/civil': '/services/civil/all-civil-law-services.html',
      '/services/family': '/services/family/all-family-law-services.html',
      '/services/human-rights': '/services/human-rights/all-human-rights-services.html',
      '/services/immigration-to-brazil': '/services/immigration-to-brazil/all-immigration-to-brazil-services.html',
      '/services/immigration-to-brazil/visas': '/services/immigration-to-brazil/all-brazilian-visa-services.html',
      '/services/immigration-to-brazil/residencies': '/services/immigration-to-brazil/all-brazilian-residencies-services.html',
      '/services/immigration-to-brazil/citizenship': '/services/immigration-to-brazil/all-brazilian-naturalisation-services.html',
      '/services/immigration-to-brazil/other': '/services/immigration-to-brazil/all-brazilian-other-services.html',
      '/services/immigration-abroad-services': '/services/immigration-abroad-services/all-immigration-abroad-services.html'
    };

    return map[current] || null;
  }

  function initializeBreadcrumbs(locale, englishPath) {
    if (document.querySelector('.auto-breadcrumb')) return;
    if (englishPath === '/index.html') return;

    const pathWithoutExt = englishPath.replace(/\.html$/, '');
    const segments = pathWithoutExt.split('/').filter(Boolean);
    if (!segments.length) return;

    const nav = document.createElement('nav');
    nav.className = 'auto-breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');

    const container = document.createElement('div');
    container.className = 'container-xxl';

    const list = document.createElement('ol');
    list.className = 'breadcrumb mb-0 py-2';

    const home = document.createElement('li');
    home.className = 'breadcrumb-item';
    home.innerHTML = `<a href="${locale === 'en' ? '/index.html' : `/${locale}/index.html`}">${escapeHtml(
      getText(locale, 'nav.home') || 'Home'
    )}</a>`;
    list.appendChild(home);

    segments.forEach((segment, index) => {
      const item = document.createElement('li');
      const isLast = index === segments.length - 1;
      item.className = `breadcrumb-item${isLast ? ' active' : ''}`;

      if (isLast) {
        item.setAttribute('aria-current', 'page');
        item.textContent = currentBreadcrumbLabel(locale, englishPath);
      } else {
        const href = breadcrumbHref(segments, index);
        if (href) {
          const localized = locale === 'en' ? href : `/${locale}${href}`;
          item.innerHTML = `<a href="${localized}">${escapeHtml(breadcrumbLabel(segment, locale))}</a>`;
        } else {
          item.textContent = breadcrumbLabel(segment, locale);
        }
      }

      list.appendChild(item);
    });

    container.appendChild(list);
    nav.appendChild(container);

    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      headerContainer.insertAdjacentElement('afterend', nav);
    } else {
      document.body.prepend(nav);
    }
  }

  function isServiceDetailPage(pathname) {
    if (!pathname.includes('/services/')) return false;

    const file = pathname.split('/').pop() || '';
    if (!file.endsWith('.html')) return false;
    if (file.startsWith('all-') || file.endsWith('-services.html')) return false;

    return true;
  }

  function isServiceHubPage(pathname) {
    if (!pathname.includes('/services/')) return false;

    const file = pathname.split('/').pop() || '';
    if (!file.endsWith('.html')) return false;

    return file.startsWith('all-') || file.endsWith('-services.html');
  }

  function formatServiceTitleFromPath(pathname) {
    const file = pathname.split('/').pop() || '';

    return file
      .replace('.html', '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function normalizeRelatedServiceMatch(pathname) {
    const publicPath = toPublicPath(normalizePageHref(pathname || '/'));
    if (!publicPath || publicPath === '/') return '/';
    return publicPath.replace(/\/+$/, '');
  }

  function resolveRelatedServices(pathname, mapData) {
    if (!mapData) return [];

    const normalizedPath = normalizeRelatedServiceMatch(pathname);
    const sanitize = paths =>
      [...new Set((paths || []).filter(Boolean))].filter(path => normalizeRelatedServiceMatch(path) !== normalizedPath);

    const overrides = mapData.overrides || {};
    const overrideEntry = Object.entries(overrides).find(([key]) => normalizeRelatedServiceMatch(key) === normalizedPath);
    if (overrideEntry) {
      return sanitize(overrideEntry[1]);
    }

    const rules = mapData.rules || [];
    const rule = rules.find(item => normalizedPath.startsWith(normalizeRelatedServiceMatch(item.prefix)));
    if (rule && rule.related) {
      return sanitize(rule.related);
    }

    return sanitize(mapData.fallback || []);
  }

  function relatedLabel(pathname) {
    const file = pathname.split('/').pop() || pathname;

    return file
      .replace('.html', '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function serviceAuthorityCopy(locale) {
    const copy = {
      en: {
        attorneyEyebrow: 'About Monique',
        attorneyTitle: 'Legal guidance from Monique Fernandes',
        attorneyItems: [
          'Monique Fernandes is a Brazilian attorney serving clients since 2018.',
          'She is registered under OAB/PR 108.616 and focuses on immigration, civil, family, and human-rights matters connected to Brazil.',
          'Clients in Brazil and abroad can work with her in English or Portuguese and receive remote support when appropriate.'
        ],
        expectationsEyebrow: 'What you can expect',
        expectationsTitle: 'How Monique approaches this type of matter',
        expectationsItems: [
          'Careful review of the facts, timing, and likely authority expectations before major steps are taken.',
          'Clear communication about risks, route fit, and practical next steps.',
          'Confidential handling of sensitive facts and realistic legal guidance without promises of a guaranteed result.'
        ],
        note:
          'If you need legal advice for your specific situation, begin with a confidential consultation based on the facts, timing, and legal objective involved.'
      },
      pt: {
        attorneyEyebrow: 'Autoridade profissional',
        attorneyTitle: 'Quem conduz este servico',
        attorneyItems: [
          'Advogada Monique Fernandes, advogada brasileira atendendo clientes desde 2018.',
          'OAB/PR 108.616, com foco em imigracao, direito civil, familia e direitos humanos ligados ao Brasil.',
          'Atendimento em ingles e portugues, com suporte remoto para clientes no Brasil e no exterior.'
        ],
        expectationsEyebrow: 'Confianca e expectativas',
        expectationsTitle: 'O que o cliente pode esperar',
        expectationsItems: [
          'Orientacao clara sobre fatos, prazos e exigencias provaveis da autoridade.',
          'Tratamento confidencial de historicos privados e fatos sensiveis compartilhados na analise.',
          'Sem garantia de resultado: a orientacao juridica depende dos fatos e da analise da autoridade.'
        ],
        note:
          'Se voce precisa de orientacao juridica para o seu caso, o primeiro passo e a consulta confidencial.'
      },
      es: {
        attorneyEyebrow: 'Autoridad profesional',
        attorneyTitle: 'Quien presta este servicio',
        attorneyItems: [
          'Abogada Monique Fernandes, abogada brasilena que atiende clientes desde 2018.',
          'OAB/PR 108.616, con enfoque en inmigracion, derecho civil, familia y derechos humanos vinculados con Brasil.',
          'Atencion en ingles y portugues, con soporte remoto para clientes en Brasil y en el extranjero.'
        ],
        expectationsEyebrow: 'Confianza y expectativas',
        expectationsTitle: 'Lo que el cliente puede esperar',
        expectationsItems: [
          'Orientacion clara sobre hechos, tiempos y exigencias probables de la autoridad.',
          'Manejo confidencial de historias privadas y hechos sensibles compartidos en la revision legal.',
          'Sin garantia de resultado: la orientacion legal depende de los hechos y de la revision de la autoridad.'
        ],
        note:
          'Si necesita orientacion legal para su caso, el primer paso es la consulta confidencial.'
      },
      fr: {
        attorneyEyebrow: 'Autorite professionnelle',
        attorneyTitle: 'Qui assure ce service',
        attorneyItems: [
          'Avocate Monique Fernandes, avocate bresilienne au service des clients depuis 2018.',
          'OAB/PR 108.616, avec une pratique axee sur immigration, droit civil, famille et droits humains lies au Bresil.',
          'Communication en anglais et portugais, avec accompagnement a distance pour les clients au Bresil et a l etranger.'
        ],
        expectationsEyebrow: 'Confiance et attentes',
        expectationsTitle: 'Ce que les clients peuvent attendre',
        expectationsItems: [
          'Des conseils clairs sur les faits, les delais et les attentes probables des autorites.',
          'Un traitement confidentiel des histoires privees et faits sensibles partages pendant l analyse.',
          'Aucun resultat n est garanti: l orientation juridique depend des faits et de l examen de l autorite.'
        ],
        note:
          'Si vous avez besoin dun conseil juridique pour votre situation, commencez par une consultation confidentielle.'
      }
    };

    return copy[locale] || copy.en;
  }

  function consultationFlowCopy(locale) {
    const copy = {
      en: {
        navLinks: [
          { href: '/index.html', label: 'Home' },
          { href: '/services.html', label: 'Services' },
          { href: '/about.html', label: 'About' },
          { href: '/contact.html', label: 'Contact' },
          { href: '/book-consultation.html', label: 'Book Consultation' }
        ],
        book: 'Book Consultation',
        startWithConsultation: 'Start with Consultation',
        requestConsultation: 'Request Consultation',
        whatsapp: 'WhatsApp Message',
        openServicePage: 'Open service page',
        startKicker: 'Consultation comes first',
        startTitleDetail: 'Legal advice for {service} starts with consultation',
        startTitleHub: 'Consultation is the first step before choosing the legal route',
        startTextDetail:
          'Before Monique Fernandes can provide legal advice or representation for {service}, consultation is required. The consultation allows the facts, timing, and strategy to be reviewed responsibly.',
        startTextHub:
          'Service hubs help you understand the available routes. Legal advice and representation still begin with consultation, because the facts and timing have to be reviewed individually.',
        analogy:
          'A doctor does not begin treatment before an appointment. A lawyer does not begin legal advice before consultation.',
        points: [
          'Understand the situation and the objective involved',
          'Review the legal route, risks, and timing',
          'Define the strongest next legal step'
        ],
        midKicker: 'Why consultation matters',
        midTitle: 'Each legal matter needs individual review',
        midText:
          'Even matters that look similar at first may require different legal strategies. Consultation is how the route is defined carefully and responsibly.',
        endKicker: 'Next step',
        endTitle: 'Consultation before the next legal move',
        endText:
          'General information helps explain the service. Consultation is the step that turns that information into guidance for your specific situation.',
        whoTitle: 'Who usually uses this service',
        whyTitle: 'Why consultation helps',
        whyText:
          'Consultation reduces avoidable mistakes by clarifying the route, the main risks, and what should happen next before filings or commitments are made.',
        roadmapTitle: 'How legal work usually begins',
        roadmapSteps: [
          'Review the facts, timing, and legal objective',
          'Define the strongest route and the main legal risks',
          'Prepare the next action, filing, or representation step',
          'Follow the matter with clear communication and next-step guidance'
        ],
        faqTitle: 'Questions people often ask before consultation',
        relatedTitle: 'Related services',
        allServices: 'All legal services',
        categoryHubSuffix: 'hub',
        formKicker: 'Consultation request',
        formTitle: 'Request consultation about {service}',
        formText:
          'Consultation is the first step before legal advice or representation. Explain your objective, timing, and the result you are trying to achieve.',
        formNote:
          'If you are unsure which route fits best, say that directly. The consultation can clarify the correct service from the facts.'
      },
      pt: {
        navLinks: [
          { href: '/index.html', label: 'Inicio' },
          { href: '/services.html', label: 'Servicos' },
          { href: '/about.html', label: 'Sobre' },
          { href: '/contact.html', label: 'Contato' },
          { href: '/book-consultation.html', label: 'Agendar Consulta' }
        ],
        book: 'Agendar Consulta',
        startWithConsultation: 'Comecar com Consulta',
        requestConsultation: 'Solicitar Consulta',
        whatsapp: 'Mensagem no WhatsApp',
        openServicePage: 'Abrir pagina do servico',
        startKicker: 'A consulta vem primeiro',
        startTitleDetail: 'A orientacao juridica em {service} comeca com consulta',
        startTitleHub: 'A consulta e o primeiro passo antes de definir a rota juridica',
        startTextDetail:
          'Antes que Monique Fernandes possa orientar ou representar em {service}, a consulta e necessaria. A consulta permite revisar fatos, prazo e estrategia com responsabilidade.',
        startTextHub:
          'Os hubs ajudam a entender as rotas disponiveis. A orientacao juridica e a representacao ainda comecam pela consulta, porque fatos e prazo precisam de analise individual.',
        analogy:
          'Um medico nao inicia o tratamento antes da consulta. Uma advogada nao inicia a orientacao juridica antes da consulta.',
        points: [
          'Entender a situacao e o objetivo envolvido',
          'Revisar a rota juridica, os riscos e o prazo',
          'Definir o proximo passo juridico mais forte'
        ],
        midKicker: 'Por que a consulta importa',
        midTitle: 'Cada caso precisa de analise individual',
        midText:
          'Mesmo situacoes parecidas podem exigir estrategias diferentes. E na consulta que a rota e definida com cuidado e responsabilidade.',
        endKicker: 'Proximo passo',
        endTitle: 'Consulta antes do proximo movimento juridico',
        endText:
          'A informacao geral ajuda a explicar o servico. A consulta transforma essa informacao em orientacao para a sua situacao especifica.',
        whoTitle: 'Quem costuma usar este servico',
        whyTitle: 'Por que a consulta ajuda',
        whyText:
          'A consulta reduz erros evitaveis ao esclarecer a rota, os principais riscos e o que deve acontecer antes de protocolo ou decisao importante.',
        roadmapTitle: 'Como o trabalho juridico normalmente comeca',
        roadmapSteps: [
          'Revisar fatos, prazo e objetivo juridico',
          'Definir a rota mais forte e os riscos principais',
          'Preparar a proxima acao, protocolo ou representacao',
          'Acompanhar o caso com comunicacao clara e orientacao'
        ],
        faqTitle: 'Perguntas comuns antes da consulta',
        relatedTitle: 'Servicos relacionados',
        allServices: 'Todos os servicos juridicos',
        categoryHubSuffix: 'hub',
        formKicker: 'Pedido de consulta',
        formTitle: 'Solicitar consulta sobre {service}',
        formText:
          'A consulta e o primeiro passo antes da orientacao ou representacao juridica. Explique seu objetivo, o prazo e o resultado que voce busca.',
        formNote:
          'Se voce ainda nao souber qual rota se encaixa melhor, diga isso diretamente. A consulta pode identificar o servico correto pelos fatos.'
      },
      es: {
        navLinks: [
          { href: '/index.html', label: 'Inicio' },
          { href: '/services.html', label: 'Servicios' },
          { href: '/about.html', label: 'Sobre' },
          { href: '/contact.html', label: 'Contacto' },
          { href: '/book-consultation.html', label: 'Reservar Consulta' }
        ],
        book: 'Reservar Consulta',
        startWithConsultation: 'Comenzar con Consulta',
        requestConsultation: 'Solicitar Consulta',
        whatsapp: 'Mensaje por WhatsApp',
        openServicePage: 'Abrir pagina del servicio',
        startKicker: 'La consulta va primero',
        startTitleDetail: 'La orientacion legal en {service} comienza con consulta',
        startTitleHub: 'La consulta es el primer paso antes de definir la ruta legal',
        startTextDetail:
          'Antes de que Monique Fernandes pueda orientar o representar en {service}, la consulta es necesaria. La consulta permite revisar hechos, plazo y estrategia con responsabilidad.',
        startTextHub:
          'Los hubs ayudan a entender las rutas disponibles. La orientacion legal y la representacion siguen comenzando con consulta, porque los hechos y los plazos deben revisarse individualmente.',
        analogy:
          'Un medico no inicia el tratamiento antes de una cita. Una abogada no inicia la orientacion legal antes de la consulta.',
        points: [
          'Entender la situacion y el objetivo involucrado',
          'Revisar la ruta legal, los riesgos y el plazo',
          'Definir el siguiente paso legal mas fuerte'
        ],
        midKicker: 'Por que importa la consulta',
        midTitle: 'Cada asunto necesita revision individual',
        midText:
          'Incluso asuntos que parecen parecidos pueden exigir estrategias distintas. La consulta es donde la ruta se define con cuidado y responsabilidad.',
        endKicker: 'Siguiente paso',
        endTitle: 'Consulta antes del siguiente movimiento legal',
        endText:
          'La informacion general ayuda a explicar el servicio. La consulta convierte esa informacion en orientacion para su situacion especifica.',
        whoTitle: 'Quien suele usar este servicio',
        whyTitle: 'Por que ayuda la consulta',
        whyText:
          'La consulta reduce errores evitables al aclarar la ruta, los riesgos principales y lo que debe ocurrir antes de presentar o tomar una decision importante.',
        roadmapTitle: 'Como suele comenzar el trabajo legal',
        roadmapSteps: [
          'Revisar hechos, plazos y objetivo legal',
          'Definir la ruta mas fuerte y los riesgos principales',
          'Preparar la siguiente accion, presentacion o representacion',
          'Acompanar el asunto con comunicacion clara y orientacion'
        ],
        faqTitle: 'Preguntas comunes antes de la consulta',
        relatedTitle: 'Servicios relacionados',
        allServices: 'Todos los servicios legales',
        categoryHubSuffix: 'hub',
        formKicker: 'Solicitud de consulta',
        formTitle: 'Solicitar consulta sobre {service}',
        formText:
          'La consulta es el primer paso antes de la orientacion o representacion legal. Explique su objetivo, el plazo y el resultado que intenta alcanzar.',
        formNote:
          'Si aun no sabe que ruta encaja mejor, digalo directamente. La consulta puede identificar el servicio correcto a partir de los hechos.'
      },
      fr: {
        navLinks: [
          { href: '/index.html', label: 'Accueil' },
          { href: '/services.html', label: 'Services' },
          { href: '/about.html', label: 'A propos' },
          { href: '/contact.html', label: 'Contact' },
          { href: '/book-consultation.html', label: 'Reserver une consultation' }
        ],
        book: 'Reserver une consultation',
        startWithConsultation: 'Commencer par une consultation',
        requestConsultation: 'Demander une consultation',
        whatsapp: 'Message WhatsApp',
        openServicePage: 'Ouvrir la page de service',
        startKicker: 'La consultation vient dabord',
        startTitleDetail: 'Le conseil juridique en {service} commence par une consultation',
        startTitleHub: 'La consultation est la premiere etape avant de definir la voie juridique',
        startTextDetail:
          'Avant que Monique Fernandes puisse conseiller ou representer en {service}, la consultation est necessaire. Elle permet de revoir les faits, les delais et la strategie de maniere responsable.',
        startTextHub:
          'Les hubs aident a comprendre les voies disponibles. Le conseil juridique et la representation commencent quand meme par une consultation, car les faits et les delais doivent etre analyses individuellement.',
        analogy:
          'Un medecin ne commence pas un traitement avant un rendez-vous. Une avocate ne commence pas le conseil juridique avant la consultation.',
        points: [
          'Comprendre la situation et l objectif',
          'Revoir la voie juridique, les risques et le calendrier',
          'Definir le prochain pas juridique le plus solide'
        ],
        midKicker: 'Pourquoi la consultation compte',
        midTitle: 'Chaque dossier demande une analyse individuelle',
        midText:
          'Meme des situations apparemment proches peuvent exiger des strategies differentes. La consultation est lendroit ou la voie est definie avec prudence.',
        endKicker: 'Prochaine etape',
        endTitle: 'Consultation avant le prochain mouvement juridique',
        endText:
          'Les informations generales aident a expliquer le service. La consultation transforme ces informations en orientation pour votre situation particuliere.',
        whoTitle: 'Qui utilise generalement ce service',
        whyTitle: 'Pourquoi la consultation aide',
        whyText:
          'La consultation reduit les erreurs evitables en clarifiant la voie, les risques principaux et ce qui doit se passer avant tout depot ou engagement important.',
        roadmapTitle: 'Comment le travail juridique commence en general',
        roadmapSteps: [
          'Revoir les faits, les delais et l objectif juridique',
          'Definir la voie la plus solide et les principaux risques',
          'Preparer la prochaine action, le depot ou la representation',
          'Suivre le dossier avec une communication claire et des prochaines etapes'
        ],
        faqTitle: 'Questions frequentes avant la consultation',
        relatedTitle: 'Services lies',
        allServices: 'Tous les services juridiques',
        categoryHubSuffix: 'hub',
        formKicker: 'Demande de consultation',
        formTitle: 'Demander une consultation sur {service}',
        formText:
          'La consultation est la premiere etape avant tout conseil ou toute representation juridique. Expliquez votre objectif, le delai et le resultat recherche.',
        formNote:
          'Si vous ne savez pas encore quelle voie convient le mieux, dites-le directement. La consultation peut identifier le bon service a partir des faits.'
      }
    };

    return copy[locale] || copy.en;
  }

  function formatTemplate(template, replacements) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => replacements?.[key] || '');
  }

  function normalizeSeoCoreNavigation(locale) {
    const copy = consultationFlowCopy(locale);

    document.querySelectorAll('.seo-core-nav').forEach(nav => {
      nav.innerHTML = copy.navLinks
        .map(link => `<a href="${escapeHtml(localizeHref(link.href, locale))}">${escapeHtml(link.label)}</a>`)
        .join(' · ');
      nav.classList.add('seo-core-nav--minimal');
    });
  }

  function normalizeLeadGenerationButtons(locale, englishPath) {
    const copy = consultationFlowCopy(locale);
    const consultationHref = localizeHref('/book-consultation.html', locale);

    document.querySelectorAll('a.btn, button.btn, .service-card a.btn').forEach(button => {
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;

      if (/^WhatsApp(?:\s+Now)?$/i.test(text)) {
        button.textContent = copy.whatsapp;
        return;
      }

      if (
        /^Contact Us$/i.test(text) ||
        /^Consult the Attorney\b/i.test(text) ||
        /^Schedule a consultation/i.test(text) ||
        /^Book a Consultation\b/i.test(text) ||
        /^Start your .*inquiry$/i.test(text)
      ) {
        button.textContent = copy.book;
        if (button.tagName === 'A') button.setAttribute('href', consultationHref);
        return;
      }

      if (button.closest('.service-card')) {
        button.textContent = copy.openServicePage;
      }
    });

    if (isServiceDetailPage(englishPath) || isServiceHubPage(englishPath)) {
      document
        .querySelectorAll(
          '.hero-section a[href="/contact"], .hero-section a[href="/contact.html"], .service-hub-actions a[href="/contact"], .service-hub-actions a[href="/contact.html"]'
        )
        .forEach(anchor => {
          anchor.setAttribute('href', consultationHref);
          anchor.textContent = copy.book;
        });
    }
  }

  function cleanServiceHubDocumentPrompts(locale, englishPath) {
    return;
  }

  function normalizeServiceCopyPhrases(locale, englishPath) {
    if (!isServiceDetailPage(englishPath) && !isServiceHubPage(englishPath)) return;

    const main = document.getElementById('main-content') || document.querySelector('main');
    if (!main) return;

    const nodes = main.querySelectorAll('h2, h3, h4, p, li, a, span');
    nodes.forEach(node => {
      const original = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!original) return;

      let next = original
        .replace(/^Who this page is for$/i, 'Who this service is for')
        .replace(/^Use this page when you need$/i, 'Use this service when you need')
        .replace(/^Use this page if you need help with$/i, 'Use this service if you need help with')
        .replace(/^What this page covers$/i, 'What this service covers')
        .replace(/^Typical situations for this page$/i, 'Typical situations for this service')
        .replace(/^Why this page matters$/i, 'Why this legal planning matters')
        .replace(/^Can this page be used for cross-border family cases\?$/i, 'Can this service help with cross-border family cases?')
        .replace(/instead of this page\./gi, 'instead of that route.')
        .replace(/^Review document requirements$/i, 'Start with consultation')
        .replace(/^See document requirements$/i, 'Start with consultation')
        .replace(/^Open document requirements$/i, 'Book Consultation')
        .replace(
          /See the broader document guide page if you need a faster sense of which records are usually material before filing\./gi,
          'Consultation helps clarify the route, the main risks, and the strongest next legal step before filing.'
        )
        .replace(
          /If you are still organizing records, use the broader document guide before sending the intake form\./gi,
          'If the route is still unclear, mention that directly in the message so the consultation can identify the best next legal step.'
        )
        .replace(/Ignoring legalization and translation standards required abroad\./gi, 'Ignoring important cross-border formalities and timing standards required abroad.')
        .replace(/Missing post-arrival deadlines for registration or renewal\./gi, 'Missing important deadlines connected to the legal route.')
        .replace(/Document checklist with legalization and sequencing priorities\./gi, 'Case-planning roadmap with sequencing priorities.')
        .replace(/Execution roadmap for pre-travel and post-arrival compliance\./gi, 'Execution roadmap for the legal route and its timing.')
        .replace(
          /Country choice, objective, legal route, civil records, background checks, translations, apostilles, timing, and post-arrival expectations\./gi,
          'Country choice, objective, legal route, timing, practical requirements, and the next legal stages connected to the move.'
        )
        .replace(
          /The timing of filing, travel, family movement, and post-arrival obligations should be viewed as one strategy, not isolated steps\./gi,
          'The timing of filing, travel, family movement, and the main legal stages should be viewed as one strategy, not isolated steps.'
        )
        .replace(
          /Compilation of required documents according to official specifications and authentication requirements\./gi,
          'Organization of the supporting records and information needed for the legal route and official review.'
        )
        .replace(/^Prepare required documents and forms \(online where available\)\.$/i, 'Prepare the supporting records and forms needed for the legal route involved.')
        .replace(/Preparing required documents/gi, 'Preparing the supporting records')
        .replace(/Submitting required documents/gi, 'Submitting the supporting records')
        .replace(
          /Assisting in compiling and organizing required documents, handling apostilles and translations, and preparing evidence of persecution for submission\./gi,
          'Assisting with the legal presentation of the case, organizing the supporting records, and preparing the evidence needed for submission.'
        )
        .replace(
          /Applications are submitted to the immigration authorities with required documents by law, including proof of prior family reunification, residence period, etc\./gi,
          'Applications are submitted to the immigration authorities with the supporting information required by law, including proof of prior family reunification and residence period.'
        )
        .replace(
          /^Incomplete documentation or failure to provide the required documents\.$/i,
          'Incomplete information or failure to provide the supporting records relevant to the case.'
        )
        .replace(
          /Dr\. Monique Fernandes compiles and organizes all required documents, handles apostilles and sworn translations(?: if needed)?, and prepares /gi,
          'Monique Fernandes reviews and organizes the supporting records relevant to the case and prepares '
        )
        .replace(
          /The process involves filling out the online visa application form, gathering required documents such as papers from the religious institution, and submitting them at a Brazilian consulate\. The consulate may request additional documents or an interview\./gi,
          'The process involves the visa application, the supporting information related to the religious route, and consular review. The consulate may request additional information or an interview.'
        )
        .replace(
          /The process involves filling out the visa application form online, gathering required documents such as passport, proof of income \(retirement or pension statements\), health insurance valid in Brazil, police clearance certificate, and submitting them at a Brazilian consulate\./gi,
          'The process involves the visa application, the supporting information related to the retiree route, and consular review.'
        )
        .replace(/\brequired documents\b/gi, 'supporting records and information')
        .replace(/\bdocument requirements\b/gi, 'pre-consultation guidance');

      if (next !== original) {
        node.textContent = next;
      }
    });
  }

  function reframeServiceHubForms(locale, englishPath) {
    if (!isServiceHubPage(englishPath)) return;

    const copy = consultationFlowCopy(locale);
    const serviceHeading = document.querySelector('h1')?.textContent?.trim() || 'Legal service';
    const formattedTitle = formatTemplate(copy.formTitle, { service: serviceHeading });

    document.querySelectorAll('.service-hub-form-shell form').forEach(form => {
      form.setAttribute('data-form-title', formattedTitle);
      const subject = form.querySelector('input[name="_subject"]');
      if (subject) subject.value = `${formattedTitle}: New inquiry`;

      const submit = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submit) submit.textContent = copy.requestConsultation;
    });

    const kicker = document.querySelector('#service-inquiry-form .service-hub-section-head .section-kicker');
    const heading = document.querySelector('#service-inquiry-form .service-hub-section-head h2');
    const text = document.querySelector('#service-inquiry-form .service-hub-section-head p');
    const note = document.querySelector('.service-hub-form-note p');

    if (kicker) kicker.textContent = copy.formKicker;
    if (heading) heading.textContent = formattedTitle;
    if (text) text.textContent = copy.formText;
    if (note) note.textContent = copy.formNote;
  }

  function buildConsultationIntroMarkup(copy, serviceHeading, isHub, locale) {
    const consultationHref = localizeHref('/book-consultation.html', locale);
    const whatsappHref = 'https://wa.me/554399614034';
    const title = isHub
      ? copy.startTitleHub
      : formatTemplate(copy.startTitleDetail, {
          service: serviceHeading
        });
    const text = isHub
      ? copy.startTextHub
      : formatTemplate(copy.startTextDetail, {
          service: serviceHeading
        });

    return `
      <div class="container-xxl">
        <div class="enhancement-shell consultation-flow-band__shell">
          <div class="consultation-flow-grid">
            <div>
              <p class="section-kicker mb-2">${escapeHtml(copy.startKicker)}</p>
              <h2 class="h3 text-gold mb-3">${escapeHtml(title)}</h2>
              <p class="mb-3">${escapeHtml(text)}</p>
              <p class="mb-0 consultation-flow-band__analogy">${escapeHtml(copy.analogy)}</p>
            </div>
            <div class="consultation-flow-points">
              ${copy.points
                .map(
                  point => `
                    <article class="consultation-flow-point">
                      <i aria-hidden="true" class="fas fa-check-circle"></i>
                      <p class="mb-0">${escapeHtml(point)}</p>
                    </article>
                  `
                )
                .join('')}
            </div>
          </div>
          <div class="d-flex flex-wrap gap-3 mt-4">
            <a class="btn btn-gold rounded-pill px-4" href="${escapeHtml(consultationHref)}">${escapeHtml(copy.book)}</a>
            <a class="btn btn-success rounded-pill px-4" href="${escapeHtml(whatsappHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.whatsapp)}</a>
          </div>
        </div>
      </div>
    `;
  }

  function insertConsultationFlowBands(locale, englishPath) {
    const detailPage = isServiceDetailPage(englishPath);
    const hubPage = isServiceHubPage(englishPath);
    if (!detailPage && !hubPage) return;

    const main = document.getElementById('main-content');
    if (!main) return;

    const copy = consultationFlowCopy(locale);
    const serviceHeading =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('.service-hub-title')?.textContent?.trim() ||
      formatServiceTitleFromPath(englishPath);
    const hero = main.querySelector(hubPage ? '.service-hub-hero' : '.hero-section');

    if (hero && !document.getElementById('consultation-entry-intro')) {
      const startBand = document.createElement('section');
      startBand.id = 'consultation-entry-intro';
      startBand.className = 'consultation-flow-band consultation-flow-band--start py-5';
      startBand.innerHTML = buildConsultationIntroMarkup(copy, serviceHeading, hubPage, locale);
      hero.insertAdjacentElement('afterend', startBand);
    }

    if (!document.getElementById('consultation-entry-mid')) {
      const sections = Array.from(main.querySelectorAll(':scope > section')).filter(section => {
        if (section.id === 'consultation-entry-intro' || section.id === 'consultation-entry-mid') return false;
        return !section.matches('[data-official-resources]');
      });
      const candidate =
        sections.find(section => /process|pathway|solution|how/i.test(section.querySelector('h2, h3')?.textContent || '')) ||
        sections[Math.min(4, Math.max(sections.length - 2, 0))];

      if (candidate) {
        const midBand = document.createElement('section');
        midBand.id = 'consultation-entry-mid';
        midBand.className = 'consultation-flow-band consultation-flow-band--mid py-5';
        midBand.innerHTML = `
          <div class="container-xxl">
            <div class="consultation-flow-inline">
              <div>
                <p class="section-kicker mb-2">${escapeHtml(copy.midKicker)}</p>
                <h2 class="h4 text-gold mb-2">${escapeHtml(copy.midTitle)}</h2>
                <p class="mb-0">${escapeHtml(copy.midText)}</p>
              </div>
              <a class="btn btn-gold rounded-pill px-4" href="${escapeHtml(localizeHref('/book-consultation.html', locale))}">${escapeHtml(copy.book)}</a>
            </div>
          </div>
        `;
        candidate.insertAdjacentElement('afterend', midBand);
      }
    }
  }

  async function initializeServiceEnhancementSection(locale, englishPath) {
    if (!isServiceDetailPage(englishPath)) return;
    if (inferAbroadSlug(englishPath)) return;
    if (document.getElementById('service-enhancement')) return;

    let mapData = null;

    try {
      const response = await fetch('/data/related-services.json', { cache: 'no-cache' });
      if (response.ok) mapData = await response.json();
    } catch {
      mapData = null;
    }

    const catalog = await loadServiceCatalog();
    const flattenedCatalog = flattenServiceCatalog(catalog);
    const serviceEntry = resolveServiceEntry(englishPath, flattenedCatalog);
    const serviceHeading = document.querySelector('h1')?.textContent?.trim() || serviceEntry?.name || formatServiceTitleFromPath(englishPath);
    const serviceSummary =
      serviceEntry?.summary || `General information on ${serviceHeading.toLowerCase()} and how consultation helps define the right legal route.`;
    const categoryId = serviceEntry?.categoryId || inferCategoryFromPath(englishPath);
    const categoryName = serviceEntry?.categoryName || 'Legal Services';
    const categoryHubPath = serviceEntry?.categoryHub || '/services.html';
    let playbook = CATEGORY_PLAYBOOK[categoryId] || CATEGORY_PLAYBOOK.default;
    const isDigitalNomadVisa =
      englishPath === '/services/immigration-to-brazil/visas/digital-nomad.html' ||
      englishPath === '/services/immigration-to-brazil/residencies/digital-nomad.html';

    if (isDigitalNomadVisa) {
      playbook = {
        ...playbook,
        audience:
          'Remote workers, freelancers, founders, and digital professionals earning outside Brazil who need lawful entry and stay planning under the Digital Nomad route.',
        outcomes:
          'Correct route qualification for remote work in Brazil, clearer strategy, and lower avoidable risk through case-specific planning.'
      };
    }
    const related = resolveRelatedServices(englishPath, mapData).slice(0, 6);
    const faqPairs = serviceFaqPairs(serviceHeading, categoryName, locale);
    const flowCopy = consultationFlowCopy(locale);
    const trustCopy = serviceAuthorityCopy(locale);

    const section = document.createElement('section');
    section.id = 'service-enhancement';
    section.className = 'service-enhancement py-5';

    const relatedCards = related.length
      ? related
          .map(path => {
            const href = locale === 'en' ? path : `/${locale}${path}`;
            return `
              <div class="col-12 col-md-6 col-lg-4">
                <a href="${href}" class="service-related-card d-block h-100">
                  <h3 class="h6 mb-0">${relatedLabel(path)}</h3>
                </a>
              </div>
            `;
          })
          .join('')
      : `
          <div class="col-12">
            <p class="mb-0">${escapeHtml(flowCopy.relatedTitle)} will appear here shortly.</p>
          </div>
        `;

    const processMarkup = flowCopy.roadmapSteps
      .map(
        (step, index) => `
          <div class="service-enhancement-step mb-3">
            <h4>${index + 1}. ${escapeHtml(step)}</h4>
            <p class="small mb-0">${escapeHtml(step)}</p>
          </div>
        `
      )
      .join('');

    const faqMarkup = faqPairs
      .map(
        (item, index) => `
          <div class="accordion-item border border-gold rounded-3 overflow-hidden mb-2">
            <h3 class="accordion-header" id="serviceFaqHeading${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#serviceFaqCollapse${index}" aria-expanded="false" aria-controls="serviceFaqCollapse${index}">
                ${escapeHtml(item.q)}
              </button>
            </h3>
            <div id="serviceFaqCollapse${index}" class="accordion-collapse collapse" data-bs-parent="#serviceEnhancementFaq" aria-labelledby="serviceFaqHeading${index}">
              <div class="accordion-body">${escapeHtml(item.a)}</div>
            </div>
          </div>
        `
      )
      .join('');

    const consultationHref = localizeHref('/book-consultation.html', locale);
    const contactHref = localizeHref('/contact.html', locale);
    const servicesHref = localizeHref('/services.html', locale);
    const categoryHubHref = localizeHref(categoryHubPath, locale);
    const contactLabel = getText(locale, 'nav.contact') || 'Contact';

    section.innerHTML = `
      <div class="container-xxl">
        <div class="enhancement-shell">
          <p class="service-enhancement-kicker mb-1">${escapeHtml(categoryName)}</p>
          <h2 class="display-6 mb-3">${escapeHtml(flowCopy.endTitle)}</h2>
          <p class="lead mb-4">${escapeHtml(flowCopy.endText)}</p>

          <div class="row g-4 mb-4">
            <div class="col-12 col-md-6 col-lg-3">
              <article class="enhancement-card h-100">
                <h3 class="h6">${escapeHtml(flowCopy.whoTitle)}</h3>
                <p class="small mb-0">${escapeHtml(playbook.audience)}</p>
              </article>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <article class="enhancement-card h-100">
                <h3 class="h6">${escapeHtml(flowCopy.whyTitle)}</h3>
                <p class="small mb-0">${escapeHtml(flowCopy.whyText)}</p>
              </article>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <article class="enhancement-card h-100">
                <h3 class="h6">${escapeHtml(trustCopy.expectationsTitle)}</h3>
                <p class="small mb-0">${escapeHtml(trustCopy.expectationsItems[0] || serviceSummary)}</p>
              </article>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <article class="enhancement-card h-100">
                <h3 class="h6">${escapeHtml(flowCopy.startKicker)}</h3>
                <p class="small mb-0">${escapeHtml(flowCopy.analogy)}</p>
              </article>
            </div>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-12 col-lg-6">
              <article class="authority-card h-100">
                <p class="authority-card__eyebrow mb-2">${escapeHtml(trustCopy.attorneyEyebrow)}</p>
                <h3 class="h4 text-gold mb-3">${escapeHtml(trustCopy.attorneyTitle)}</h3>
                <ul class="authority-list mb-0">
                  ${trustCopy.attorneyItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
              </article>
            </div>
            <div class="col-12 col-lg-6">
              <article class="authority-card h-100">
                <p class="authority-card__eyebrow mb-2">${escapeHtml(trustCopy.expectationsEyebrow)}</p>
                <h3 class="h4 text-gold mb-3">${escapeHtml(trustCopy.expectationsTitle)}</h3>
                <ul class="authority-list mb-0">
                  ${trustCopy.expectationsItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
              </article>
            </div>
            <div class="col-12">
              <article class="authority-card authority-card--soft service-authority-note">
                <p class="mb-0">${escapeHtml(trustCopy.note)}</p>
              </article>
            </div>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-12 col-lg-7">
              <div class="service-enhancement-playbook h-100">
                <h3 class="h5 mb-3">${escapeHtml(flowCopy.roadmapTitle)}</h3>
                ${processMarkup}
              </div>
            </div>
            <div class="col-12 col-lg-5">
              <div class="service-enhancement-playbook h-100">
                <h3 class="h5 mb-3">${escapeHtml(flowCopy.endKicker)}</h3>
                <p class="small mb-3">${escapeHtml(serviceSummary)}</p>
                <p class="small mb-0">${escapeHtml(trustCopy.note)}</p>
              </div>
            </div>
          </div>

          <h3 class="h5 mb-3">${escapeHtml(flowCopy.faqTitle)}</h3>
          <div class="accordion mb-4" id="serviceEnhancementFaq">
            ${faqMarkup}
          </div>

          <h3 class="h5 mb-3">${escapeHtml(flowCopy.relatedTitle)}</h3>
          <div class="row g-3 mb-4">
            ${relatedCards}
          </div>

          <h3 class="h5 mb-3">${escapeHtml(flowCopy.startWithConsultation)}</h3>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <a href="${categoryHubHref}" class="service-resource-chip">${escapeHtml(categoryName)} ${escapeHtml(flowCopy.categoryHubSuffix)}</a>
            <a href="${servicesHref}" class="service-resource-chip">${escapeHtml(flowCopy.allServices)}</a>
          </div>

          <div class="d-flex flex-wrap gap-3">
            <a href="${consultationHref}" class="btn btn-gold rounded-pill px-4">${escapeHtml(flowCopy.book)}</a>
            <a href="https://wa.me/554399614034" class="btn btn-success rounded-pill px-4" target="_blank" rel="noopener noreferrer">${escapeHtml(flowCopy.whatsapp)}</a>
            <a href="${contactHref}" class="btn btn-outline-gold rounded-pill px-4">${escapeHtml(contactLabel)}</a>
          </div>
        </div>
      </div>
    `;

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      footerContainer.insertAdjacentElement('beforebegin', section);
    } else {
      document.body.appendChild(section);
    }
  }

  async function initializeAbroadGuideSection(locale, englishPath) {
    const slug = inferAbroadSlug(englishPath);
    if (!slug) return;
    if (document.getElementById('abroad-guide')) return;

    let guides;
    try {
      guides = await ensureAbroadGuides();
    } catch {
      return;
    }
    const guide = guides?.[slug];
    if (!guide) return;

    const localizePath = path => (locale === 'en' ? path : `/${locale}${path}`);
    document.body.classList.add(`country-theme-${slug}`);

    const servicesList = [
      {
        label: 'Visa route strategy and category comparison',
        href: '/services/immigration-to-brazil/all-brazilian-visa-services.html'
      },
      {
        label: 'Residency pathway planning and conversion readiness',
        href: '/services/immigration-to-brazil/all-brazilian-residencies-services.html'
      },
      {
        label: 'Naturalisation and long-term status planning',
        href: '/services/immigration-to-brazil/all-brazilian-naturalisation-services.html'
      },
      {
        label: 'Consular services and cross-border procedural support',
        href: '/services/immigration-to-brazil/other/consular-services.html'
      },
      {
        label: 'Cross-border filing coordination',
        href: '/services/immigration-to-brazil/other/translation.html'
      },
      {
        label: 'Appeals and procedural defense in complex cases',
        href: '/services/immigration-to-brazil/other/appeals.html'
      }
    ];

    const servicesMarkup = servicesList
      .map(
        item => `
          <li>
            <a href="${localizePath(item.href)}">${escapeHtml(item.label)}</a>
          </li>
        `
      )
      .join('');

    const faqMarkup = (guide.faqs || [])
      .map(
        (item, index) => `
          <div class="accordion-item border border-gold rounded-3 overflow-hidden mb-2">
            <h3 class="accordion-header" id="abroadFaqHeading${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#abroadFaqCollapse${index}" aria-expanded="false" aria-controls="abroadFaqCollapse${index}">
                ${escapeHtml(item.q)}
              </button>
            </h3>
            <div id="abroadFaqCollapse${index}" class="accordion-collapse collapse" data-bs-parent="#abroadGuideFaq" aria-labelledby="abroadFaqHeading${index}">
              <div class="accordion-body">${escapeHtml(item.a)}</div>
            </div>
          </div>
        `
      )
      .join('');

    const section = document.createElement('section');
    section.id = 'abroad-guide';
    section.className = 'py-5';
    section.innerHTML = `
      <div class="container-xxl abroad-guide-shell">
        <div class="enhancement-shell">
          <p class="service-enhancement-kicker mb-1">Immigration Abroad Guide</p>
          <h2 class="display-6 mb-3">General information on immigrating to ${escapeHtml(guide.countryLabel)} with Monique Fernandes</h2>
          <p class="lead mb-4">${escapeHtml(guide.summary)}</p>

          <div class="row g-3 mb-4">
            <div class="col-12 col-lg-6">
              <article class="abroad-guide-card h-100">
                <h3 class="h5">Overview and quality of life</h3>
                <p class="small mb-0">${escapeHtml(guide.qualityOfLife)}</p>
              </article>
            </div>
            <div class="col-12 col-lg-6">
              <article class="abroad-guide-card h-100">
                <h3 class="h5">Economy and legal opportunity</h3>
                <p class="small mb-0">${escapeHtml(guide.economy)} ${escapeHtml(guide.opportunities)}</p>
              </article>
            </div>
            <div class="col-12 col-lg-6">
              <article class="abroad-guide-card h-100">
                <h3 class="h5">Housing and settlement planning</h3>
                <p class="small mb-0">${escapeHtml(guide.housing)}</p>
              </article>
            </div>
            <div class="col-12 col-lg-6">
              <article class="abroad-guide-card h-100">
                <h3 class="h5">Geography, mobility, and tourism</h3>
                <p class="small mb-0">${escapeHtml(guide.geography)} ${escapeHtml(guide.tourism)}</p>
              </article>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-12 col-lg-6">
              <article class="abroad-guide-card h-100">
                <h3 class="h5">Monique's legal services for ${escapeHtml(guide.countryLabel)}</h3>
                <ul class="small mb-0 abroad-guide-service-list">
                  ${servicesMarkup}
                </ul>
              </article>
            </div>
            <div class="col-12 col-lg-6">
              <article class="abroad-guide-card h-100">
                <h3 class="h5">Cross-border strategy priorities</h3>
                <ul class="small mb-0">
                  <li>Choose the correct legal route before travel or filing.</li>
                  <li>Align documentation, translation, and legalization standards early.</li>
                  <li>Coordinate visa, residency, and long-term status planning as one roadmap.</li>
                  <li>Track deadlines, renewals, and authority responses to protect legal continuity.</li>
                </ul>
              </article>
            </div>
          </div>

          <h3 class="h5 mb-3">Frequently asked questions about ${escapeHtml(guide.countryLabel)} immigration</h3>
          <div class="accordion mb-4" id="abroadGuideFaq">
            ${faqMarkup}
          </div>

          <div class="d-flex flex-wrap gap-3">
            <a href="${localizePath('/services/immigration-abroad-services/book-consultation.html')}" class="btn btn-gold rounded-pill px-4">Book immigration-abroad consultation</a>
            <a href="${localizePath('/book-consultation.html')}" class="btn btn-outline-gold rounded-pill px-4">Book full legal consultation</a>
            <a href="${localizePath('/services/immigration-abroad-services/all-immigration-abroad-services.html')}" class="btn btn-outline-gold rounded-pill px-4">View all immigration-abroad services</a>
            <a href="${localizePath('/contact.html')}" class="btn btn-outline-gold rounded-pill px-4">Contact legal team</a>
          </div>
        </div>
      </div>
    `;

    const main = document.getElementById('main-content');
    if (!main) return;

    const coreNav = main.querySelector('.seo-core-nav');
    const spacer = coreNav ? coreNav.nextElementSibling : null;

    if (spacer) {
      spacer.insertAdjacentElement('afterend', section);
    } else if (coreNav) {
      coreNav.insertAdjacentElement('afterend', section);
    } else {
      main.prepend(section);
    }
  }

  function normalizeHeadingHierarchyStyles() {
    document.querySelectorAll('main h2.h5, main h2.h6').forEach(heading => {
      heading.classList.remove('h5', 'h6');
      heading.classList.add('h3', 'text-gold');
    });

    document.querySelectorAll('main h3.h5, main h3.h6').forEach(heading => {
      heading.classList.remove('h5', 'h6');
      heading.classList.add('h4', 'text-gold');
    });
  }

  function emphasizeHeadingFirstWord() {
    const candidates = document.querySelectorAll('main h1, main h2, main h3');
    const wordPattern = /^(\s*)([A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)?)([\s\S]*)$/;

    candidates.forEach(heading => {
      if (heading.querySelector('.heading-first-word')) return;
      if (heading.closest('.accordion-button')) return;

      const firstNode = heading.firstChild;
      if (!firstNode || firstNode.nodeType !== Node.TEXT_NODE) return;

      const raw = firstNode.nodeValue || '';
      const match = raw.match(wordPattern);
      if (!match) return;

      const [, leadingSpace, firstWord, remainder] = match;
      if (!firstWord) return;

      const wrapper = document.createElement('span');
      wrapper.className = 'heading-first-word text-gold';
      wrapper.textContent = firstWord;

      const fragment = document.createDocumentFragment();
      if (leadingSpace) fragment.appendChild(document.createTextNode(leadingSpace));
      fragment.appendChild(wrapper);
      if (remainder) fragment.appendChild(document.createTextNode(remainder));
      heading.replaceChild(fragment, firstNode);
    });
  }

  function highlightMoniqueName() {
    const roots = [
      document.getElementById('top-utility-container'),
      document.getElementById('header-container'),
      document.querySelector('main'),
      document.getElementById('footer-container')
    ].filter(Boolean);

    const regex = /(Dr\.?\s+Monique Fernandes|Monique Fernandes|Monique)/gi;
    const invalidParents = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION']);

    roots.forEach(root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const targets = [];

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!parent || invalidParents.has(parent.tagName)) continue;
        const text = node.nodeValue || '';
        regex.lastIndex = 0;
        if (!regex.test(text)) continue;
        targets.push(node);
      }

      targets.forEach(node => {
        const text = node.nodeValue || '';
        regex.lastIndex = 0;
        let cursor = 0;
        const fragment = document.createDocumentFragment();
        let match;

        while ((match = regex.exec(text))) {
          const [value] = match;
          const start = match.index;
          if (start > cursor) {
            fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
          }
          const span = document.createElement('span');
          span.className = 'text-gold monique-name';
          span.textContent = value;
          fragment.appendChild(span);
          cursor = start + value.length;
        }

        if (cursor < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(cursor)));
        }

        if (node.parentNode) {
          node.parentNode.replaceChild(fragment, node);
        }
      });
    });
  }

  function removeInstagramBlocks() {
    document.querySelectorAll('.instagram-section').forEach(section => section.remove());

    document.querySelectorAll('iframe[src*="instagram.com"]').forEach(frame => {
      const wrapper = frame.closest('section, article, .container, .row, .col-12');
      if (wrapper && wrapper.closest('main')) {
        wrapper.remove();
      } else {
        frame.remove();
      }
    });

    document.querySelectorAll('main h1, main h2, main h3, main p, main div').forEach(element => {
      const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (!/live from @moniquefadv/i.test(text)) return;
      const section = element.closest('section');
      if (section) section.remove();
    });
  }

  function removeNewsletterOpenLinks() {
    const newsletterHrefPattern = /\/(?:[a-z]{2}\/)?newsletter\.html(?:[?#].*)?$/i;

    document.querySelectorAll('a[href]').forEach(anchor => {
      const href = (anchor.getAttribute('href') || '').trim();
      if (!newsletterHrefPattern.test(href)) return;
      if (anchor.closest('#newsletter-inline-section')) return;
      anchor.remove();
    });
  }

  function removeFreshnessPolicyText() {
    document.querySelectorAll('p, li, div, small').forEach(node => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (!/freshness policy/i.test(text)) return;
      if (!/date-sensitive guidance/i.test(text)) return;
      node.remove();
    });
  }

  function replaceLegacyGuidePhrases() {
    const replacements = [
      { pattern: /\bComplete planning guide\b/gi, value: 'General information on' },
      { pattern: /\bComprehensive guide\b/gi, value: 'General information on' }
    ];

    document.querySelectorAll('main h1, main h2, main h3, main p, main a, main span').forEach(node => {
      if (node.children.length > 0) return;
      let text = node.textContent || '';
      let changed = false;
      replacements.forEach(item => {
        const next = text.replace(item.pattern, item.value);
        if (next !== text) {
          text = next;
          changed = true;
        }
      });
      if (changed) node.textContent = text;
    });
  }

  function standardizeSimpleContactForms() {
    document.querySelectorAll('form').forEach(form => {
      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="message"]');
      if (!nameInput || !emailInput || !messageInput) return;

      const hasFullConsultFields = form.querySelector('input[name="phone"], select[name="area"]');
      if (hasFullConsultFields) return;

      form.classList.add('row', 'g-3');
      [nameInput, emailInput, messageInput].forEach(field => {
        field.classList.add('form-control', 'form-control-lg', 'bg-transparent', 'border-gold', 'text-cream');
      });
      if (!messageInput.getAttribute('rows') || Number(messageInput.getAttribute('rows')) < 5) {
        messageInput.setAttribute('rows', '5');
      }

      const submit = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submit) {
        submit.classList.add('btn', 'btn-gold', 'rounded-pill', 'px-4');
      }
    });
  }

  function initializeServiceHubForms() {
    document.querySelectorAll('[data-formspree-subject-form]').forEach(form => {
      const subjectSelect = form.querySelector('[data-formspree-subject-source]');
      const subjectTarget = form.querySelector('input[name="_subject"]');
      const formTitle = form.getAttribute('data-form-title') || document.title || 'New legal inquiry';
      const otherWrap = form.querySelector('[data-other-service-wrap]');
      const otherInput = otherWrap ? otherWrap.querySelector('input, textarea') : null;

      const syncSubject = () => {
        const selectedOption =
          subjectSelect && subjectSelect.selectedIndex >= 0
            ? subjectSelect.options[subjectSelect.selectedIndex]
            : null;
        const selectedLabel = selectedOption ? (selectedOption.textContent || '').trim() : '';
        if (subjectTarget) {
          subjectTarget.value = selectedLabel
            ? `${formTitle}: ${selectedLabel}`
            : `${formTitle}: New inquiry`;
        }

        if (!otherWrap || !otherInput) return;
        const selectedValue = subjectSelect ? String(subjectSelect.value || '').toLowerCase() : '';
        const revealOther =
          selectedValue.includes("don't know") ||
          selectedValue.includes('do not know') ||
          selectedValue.includes("don't see") ||
          selectedValue.includes('not listed') ||
          selectedValue === 'other';

        otherWrap.classList.toggle('d-none', !revealOther);
        otherInput.required = revealOther;
      };

      if (subjectSelect) {
        subjectSelect.addEventListener('change', syncSubject);
      }

      syncSubject();
    });
  }

  function repairBrokenContactForms() {
    document.querySelectorAll('form[action*="formspree"]').forEach(form => {
      const hasName = form.querySelector('input[name="name"]');
      const hasEmail = form.querySelector('input[name="email"]');
      const hasMessage = form.querySelector('textarea[name="message"]');
      if (!hasName || (hasEmail && hasMessage)) return;

      const section = form.closest('section');
      if (!section) return;

      const outsideField = selector =>
        [...section.querySelectorAll(selector)].find(node => !form.contains(node));

      const email = outsideField('input[name="email"]');
      const message = outsideField('textarea[name="message"]');
      const submit = outsideField('button[type="submit"], input[type="submit"]');

      [email, message, submit].forEach(node => {
        if (node) form.appendChild(node);
      });

      if (!form.closest('.container') && section.querySelector('.container')) {
        section.querySelector('.container').appendChild(form);
      }
    });
  }

  function fixTemplatePlaceholderLinks() {
    const replacements = [
      { token: '{{HUB_URL}}', value: '/legal-knowledge-center.html' },
      { token: '{{SERVICE_URL}}', value: '/services.html' },
      { token: '{{PRIMARY_HUB}}', value: 'index' },
      { token: '%7B%7BHUB_URL%7D%7D', value: '/legal-knowledge-center.html' },
      { token: '%7B%7BSERVICE_URL%7D%7D', value: '/services.html' }
    ];

    document.querySelectorAll('a[href]').forEach(anchor => {
      let href = anchor.getAttribute('href') || '';
      replacements.forEach(item => {
        if (href.includes(item.token)) href = item.value;
      });
      href = href.replace(/\/blog\/\{\{PRIMARY_HUB\}\}\.html/gi, '/blog.html');
      anchor.setAttribute('href', href);
    });

    document.querySelectorAll('[data-service-url], [data-hub-url]').forEach(element => {
      const serviceUrl = element.getAttribute('data-service-url') || '';
      if (serviceUrl.includes('{{SERVICE_URL}}')) {
        element.setAttribute('data-service-url', '/services.html');
      }
      const hubUrl = element.getAttribute('data-hub-url') || '';
      if (hubUrl.includes('{{HUB_URL}}')) {
        element.setAttribute('data-hub-url', '/legal-knowledge-center.html');
      }
    });
  }

  function removeFloatingNewsletterBar() {
    const bar = document.getElementById('newsletter-download-bar');
    if (bar) bar.remove();
    document.body.classList.remove('has-newsletter-bar');
  }

  function injectInlineNewsletterSection(locale) {
    if (document.getElementById('newsletter-inline-section')) return;
    if (normalizePageHref(window.location.pathname) === '/newsletter.html') return;

    const copy = newsletterCopy(locale);
    const section = document.createElement('section');
    section.id = 'newsletter-inline-section';
    section.className = 'py-5';
    section.innerHTML = `
      <div class="container-xxl">
        <div class="enhancement-shell">
          <h2 class="h3 text-gold mb-2">${copy.title}</h2>
          <p class="mb-3">${copy.subtitle} Enter your email to unlock the download.</p>
          <form class="newsletter-mini-form" action="${NEWSLETTER_FORM_ENDPOINT}" method="POST" data-newsletter-download-form="true" data-newsletter-source="inline-sitewide">
            <input type="email" name="email" autocomplete="email" placeholder="${copy.placeholder}" required aria-label="${copy.placeholder}">
            <button type="submit" class="btn btn-gold">${copy.submit}</button>
            <input type="hidden" name="topic" value="Newsletter PDF download">
            <input type="hidden" name="target_file" value="${NEWSLETTER_DOWNLOAD_PATH}">
            <p class="newsletter-status mb-0" data-newsletter-status="true"></p>
          </form>
        </div>
      </div>
    `;

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      footerContainer.insertAdjacentElement('beforebegin', section);
    } else {
      document.body.appendChild(section);
    }
  }

  function injectExperienceSince2018(locale, englishPath) {
    if (englishPath !== '/about.html') return;
    if (document.getElementById('experience-since-2018')) return;

    const copy = {
      en: 'Legal practice since 2018',
      pt: 'Atuacao juridica desde 2018',
      es: 'Practica legal desde 2018',
      fr: 'Pratique juridique depuis 2018'
    };

    const badge = document.createElement('p');
    badge.id = 'experience-since-2018';
    badge.className = 'small text-gold fw-semibold mt-3 mb-0';
    badge.textContent = copy[locale] || copy.en;

    const target = document.querySelector('main .hero-section .container h1, main .hero-section .container h2');
    if (target) {
      target.insertAdjacentElement('afterend', badge);
    }
  }

  function ensureDocumentRequirementsConsultCta(locale, englishPath) {
    return;
  }

  function removeBlogCoreServicesSection(englishPath) {
    const normalized = normalizePageHref(englishPath || '');
    if (normalized !== '/blog.html' && normalized !== '/insights.html') return;
    const heading = [...document.querySelectorAll('main h2')].find(item =>
      /Explore Core Immigration Services/i.test(item.textContent || '')
    );
    if (!heading) return;
    const section = heading.closest('section');
    if (section) section.remove();
  }

  function feedbackQuestionDefinitions(locale) {
    const copy = {
      en: [
        ['service', 'Service', "How would you rate Monique's service overall?"],
        ['responsiveness', 'Responsiveness', "How would you rate Monique's responsiveness and attentiveness to your questions or requests?"],
        ['expertise', 'Expertise', "How would you rate Monique's legal knowledge and competence in handling your matter?"],
        ['communication', 'Communication', 'How clearly did Monique explain legal procedures, options, and advice?'],
        ['updates', 'Updates', 'How satisfied were you with the frequency and clarity of updates regarding your case?'],
        ['understanding', 'Understanding', 'How well did Monique understand your goals and what you wanted to achieve?'],
        ['respect', 'Respect', 'Did you feel respected and professionally treated throughout the process?'],
        ['transparency', 'Transparency', 'How clear was the information regarding legal fees, estimates, and costs?'],
        ['satisfaction', 'Satisfaction', 'Overall, how satisfied are you with the service provided by Monique?'],
        ['recommendation', 'Recommendation', 'How likely are you to recommend Monique to friends, family, or colleagues?'],
        ['average_score', 'Average Score', 'What overall 0-10 score would you give Monique based on your full experience?']
      ]
    };

    return copy[locale] || copy.en;
  }

  function feedbackScoreColor(score) {
    const palette = [
      '#7b1818',
      '#99211b',
      '#b93a24',
      '#cf5b23',
      '#d8821d',
      '#dca61a',
      '#c5ba1c',
      '#a2c231',
      '#77bb37',
      '#3f9a2c',
      '#1f6f1b'
    ];

    return palette[Math.max(0, Math.min(palette.length - 1, Number(score)))];
  }

  function buildFeedbackQuestionMarkup(metric, label, prompt) {
    const options = Array.from({ length: 11 }, (_, score) => {
      const inputId = `feedback-${metric}-${score}`;
      return `
        <label class="feedback-score-option" style="--score-color:${feedbackScoreColor(score)}" for="${inputId}">
          <input id="${inputId}" name="${escapeHtml(metric)}" required type="radio" value="${score}">
          <span>${score}</span>
        </label>
      `;
    }).join('');

    return `
      <fieldset class="feedback-question">
        <legend>${escapeHtml(label)}</legend>
        <p>${escapeHtml(prompt)}</p>
        <div class="feedback-scale-wrap">
          <div aria-label="${escapeHtml(label)} score options from 0 to 10" class="feedback-scale" role="radiogroup">
            ${options}
          </div>
        </div>
      </fieldset>
    `;
  }

  function initializeFeedbackPage(locale, englishPath) {
    if (englishPath !== '/client-feedback.html') return;

    const form = document.getElementById('feedback-form');
    const ratingsContainer = document.getElementById('feedback-rating-groups');
    const nextInput = document.getElementById('feedback-next');
    const thankYou = document.getElementById('feedback-thank-you');
    const formShell = document.getElementById('feedback-form-shell');
    if (!form || !ratingsContainer || !nextInput || !formShell) return;

    if (!ratingsContainer.children.length) {
      ratingsContainer.innerHTML = feedbackQuestionDefinitions(locale)
        .map(([metric, label, prompt]) => buildFeedbackQuestionMarkup(metric, label, prompt))
        .join('');
    }

    nextInput.value = `${window.location.origin}/client-feedback.html?submitted=1`;

    const params = new URLSearchParams(window.location.search);
    if (params.get('submitted') === '1') {
      thankYou?.removeAttribute('hidden');
      form.setAttribute('hidden', 'hidden');
      formShell.classList.add('feedback-form-shell--submitted');
      window.setTimeout(() => {
        thankYou?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

  function ensureBlogFeedExperience(locale, englishPath) {
    const normalized = normalizePageHref(englishPath || '');
    if (normalized !== '/blog.html' && normalized !== '/insights.html') return;

    const copyByLocale = {
      en: {
        title: 'Brazil Immigration Legal Insights',
        subtitle:
          'Browse all insights by legal hub, search by topic, and keep scrolling to reveal more posts.',
        toolbar: 'Find Insights by Hub and Topic',
        search: 'Search by keyword, topic, visa, residency, citizenship...',
        count: 'Loading insights...',
        sortLabel: 'Sort posts',
        sortNewest: 'Newest first',
        sortOldest: 'Oldest first',
        sortAZ: 'Title A-Z',
        sortZA: 'Title Z-A',
        loadMore: 'Load More Insights'
      },
      pt: {
        title: 'Insights Juridicos sobre Imigracao no Brasil',
        subtitle:
          'Veja todos os insights por area juridica, pesquise por tema e role para revelar mais publicacoes.',
        toolbar: 'Encontrar Insights por Area e Tema',
        search: 'Buscar por palavra-chave, tema, visto, residencia, cidadania...',
        count: 'Carregando insights...',
        sortLabel: 'Ordenar publicacoes',
        sortNewest: 'Mais recentes',
        sortOldest: 'Mais antigas',
        sortAZ: 'Titulo A-Z',
        sortZA: 'Titulo Z-A',
        loadMore: 'Carregar mais insights'
      },
      es: {
        title: 'Insights Legales sobre Inmigracion en Brasil',
        subtitle:
          'Explore todos los insights por area legal, busque por tema y siga bajando para revelar mas publicaciones.',
        toolbar: 'Encontrar Insights por Area y Tema',
        search: 'Buscar por palabra clave, tema, visa, residencia, ciudadania...',
        count: 'Cargando insights...',
        sortLabel: 'Ordenar publicaciones',
        sortNewest: 'Mas recientes',
        sortOldest: 'Mas antiguas',
        sortAZ: 'Titulo A-Z',
        sortZA: 'Titulo Z-A',
        loadMore: 'Cargar mas insights'
      },
      fr: {
        title: 'Insights Juridiques sur l Immigration au Bresil',
        subtitle:
          'Parcourez tous les insights par domaine, recherchez par sujet et faites defiler pour en voir davantage.',
        toolbar: 'Trouver des Insights par Domaine et Sujet',
        search: 'Rechercher par mot-cle, sujet, visa, residence, citoyennete...',
        count: 'Chargement des insights...',
        sortLabel: 'Trier les publications',
        sortNewest: 'Plus recentes',
        sortOldest: 'Plus anciennes',
        sortAZ: 'Titre A-Z',
        sortZA: 'Titre Z-A',
        loadMore: 'Charger plus d insights'
      }
    };
    const copy = copyByLocale[locale] || copyByLocale.en;

    let section = document.getElementById('blog-feed');
    if (!section) {
      const main = document.getElementById('main-content') || document.querySelector('main');
      if (!main) return;
      section = document.createElement('section');
      section.id = 'blog-feed';
      const footer = document.getElementById('footer-container');
      if (footer && footer.parentNode === document.body) {
        main.appendChild(section);
      } else {
        main.appendChild(section);
      }
    }

    if (!document.getElementById('insights-grid')) {
      const headingTag = document.querySelector('main h1') ? 'h2' : 'h1';
      section.className = 'py-6 py-lg-8 bg-dark-grey';
      section.innerHTML = `
        <div class="container">
          <div class="text-center mb-6" data-aos="fade-up">
            <${headingTag} class="display-5 fw-bold text-gold mb-3">${escapeHtml(copy.title)}</${headingTag}>
            <p class="mx-auto mb-0" style="max-width: 760px;">${escapeHtml(copy.subtitle)}</p>
            <div class="gold-line mx-auto"></div>
          </div>
          <div class="insights-toolbar mb-4" data-aos="fade-up" data-aos-delay="80">
            <h2 class="h4 text-gold mb-3">${escapeHtml(copy.toolbar)}</h2>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <p class="mb-0 fw-semibold text-gold" id="insights-count">${escapeHtml(copy.count)}</p>
              <label class="visually-hidden" for="insights-search">${escapeHtml(copy.toolbar)}</label>
              <input class="form-control insights-search-input" id="insights-search" placeholder="${escapeHtml(copy.search)}" type="search"/>
            </div>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <label class="small fw-semibold mb-0 text-gold" for="insights-sort">${escapeHtml(copy.sortLabel)}</label>
              <select class="form-select insights-sort-select" id="insights-sort">
                <option value="newest">${escapeHtml(copy.sortNewest)}</option>
                <option value="oldest">${escapeHtml(copy.sortOldest)}</option>
                <option value="title-asc">${escapeHtml(copy.sortAZ)}</option>
                <option value="title-desc">${escapeHtml(copy.sortZA)}</option>
              </select>
            </div>
            <div class="insights-hub-pages mb-3" id="insights-hub-pages"></div>
            <div class="insights-chip-wrap" id="insights-hub-filters"></div>
          </div>
          <div class="row g-4" data-aos="fade-up" data-aos-delay="140" id="insights-grid"></div>
          <div class="text-center mt-4">
            <button class="btn btn-outline-gold rounded-pill px-4" id="insights-load-more" type="button">${escapeHtml(copy.loadMore)}</button>
          </div>
        </div>
      `;
    }

    if (!document.getElementById('blog-feed-jsonld')) {
      const jsonld = document.createElement('script');
      jsonld.type = 'application/ld+json';
      jsonld.id = 'blog-feed-jsonld';
      jsonld.textContent = '{"@context":"https://schema.org","@type":"ItemList","name":"Brazil Immigration Insights Feed","itemListElement":[]}';
      document.body.appendChild(jsonld);
    }

    if (section.getAttribute('data-static-blog-feed') === 'true') return;

    if (!document.querySelector('script[src="/js/blog-feed.js"]')) {
      const script = document.createElement('script');
      script.src = '/js/blog-feed.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  async function syncKnowledgeHubDates() {
    if (!window.location.pathname.includes('/legal-knowledge-center/')) return;

    const { locale, englishPath } = detectLocaleAndPath(window.location.pathname);
    const normalizeSearchText = value =>
      (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    const localizeInsightPath = path => {
      const normalized = normalizePageHref(path || '');
      if (!normalized || normalized === '/index.html') return '';
      return locale === 'en' ? normalized : `/${locale}${normalized}`;
    };
    const isLatestUpdatesHeading = text => {
      const normalized = normalizeSearchText(text);
      return (
        normalized.includes('latest updates in this hub') ||
        normalized.includes('ultimas atualizacoes neste hub') ||
        normalized.includes('ultimas actualizaciones en este centro') ||
        normalized.includes('ultimas actualizaciones en este hub') ||
        normalized.includes('dernieres mises a jour dans ce hub')
      );
    };
    const isGenericUpdateLink = href => {
      const normalized = normalizePageHref(href || '');
      return (
        normalized === '/blog.html' ||
        normalized === '/insights.html' ||
        normalized === '/faq-hub.html' ||
        normalized === '/legal-knowledge-center.html' ||
        normalized === '/index.html'
      );
    };
    const normalizeTitleKey = value => normalizeSearchText(value).replace(/\s+/g, ' ').trim();

    let feed = null;
    try {
      const response = await fetch('/data/insights-feed.json', { cache: 'no-cache' });
      if (!response.ok) return;
      feed = await response.json();
    } catch {
      return;
    }

    const items = Array.isArray(feed?.items) ? feed.items : [];
    if (!items.length) return;

    const dateByPath = new Map();
    const titleToItem = new Map();
    const hubMatch = englishPath.match(/^\/legal-knowledge-center\/([^/]+)\.html$/);
    const currentHub = hubMatch ? hubMatch[1] : '';
    const itemsInCurrentHub = currentHub ? items.filter(item => item?.hub === currentHub) : items;

    items.forEach(item => {
      if (!item?.url) return;
      const normalizedUrl = normalizePageHref(item.url);
      if (item?.date) dateByPath.set(normalizedUrl, item.date);

      const titleKey = normalizeTitleKey(item.title || '');
      if (titleKey && !titleToItem.has(titleKey)) titleToItem.set(titleKey, item);
      const shortTitleKey = normalizeTitleKey(item.titleShort || '');
      if (shortTitleKey && !titleToItem.has(shortTitleKey)) titleToItem.set(shortTitleKey, item);
    });

    const latestHeading = [...document.querySelectorAll('main article h2')].find(item =>
      isLatestUpdatesHeading(item.textContent || '')
    );
    if (!latestHeading) return;

    const article = latestHeading.closest('article');
    if (!article) return;

    const englishFallbackLinksByIndex = new Map();
    if (locale !== 'en') {
      try {
        const response = await fetch(englishPath, { cache: 'no-cache' });
        if (response.ok) {
          const raw = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(raw, 'text/html');
          const fallbackHeading = [...doc.querySelectorAll('main article h2')].find(node =>
            isLatestUpdatesHeading(node.textContent || '')
          );
          const fallbackArticle = fallbackHeading?.closest('article');
          fallbackArticle?.querySelectorAll('li').forEach((row, index) => {
            const fallbackLink = row.querySelector('a[href]');
            if (!fallbackLink) return;
            const fallbackHref = fallbackLink.getAttribute('href') || '';
            if (isGenericUpdateLink(fallbackHref)) return;
            englishFallbackLinksByIndex.set(index, normalizePageHref(fallbackHref));
          });
        }
      } catch {
        // Best-effort fallback only.
      }
    }

    const dateList = [];
    article.querySelectorAll('li span.small').forEach(stamp => stamp.remove());

    article.querySelectorAll('li').forEach((row, index) => {
      const link = row.querySelector('a[href]');
      if (!link) {
        row.childNodes.forEach(node => {
          if (node.nodeType !== Node.TEXT_NODE) return;
          node.nodeValue = (node.nodeValue || '').replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*/g, ' ');
        });
        return;
      }

      let href = link.getAttribute('href') || '';
      let key = normalizePageHref(href);

      if (isGenericUpdateLink(href)) {
        const labelKey = normalizeTitleKey(link.textContent || '');
        const preferred = itemsInCurrentHub.find(item => {
          const titleKey = normalizeTitleKey(item.title || '');
          const shortTitleKey = normalizeTitleKey(item.titleShort || '');
          return labelKey && (labelKey === titleKey || labelKey === shortTitleKey);
        });
        const matched = preferred || titleToItem.get(labelKey);

        if (matched?.url) {
          key = normalizePageHref(matched.url);
          href = localizeInsightPath(matched.url);
        } else {
          const fallbackPath = englishFallbackLinksByIndex.get(index);
          if (fallbackPath) {
            key = fallbackPath;
            href = localizeInsightPath(fallbackPath);
          }
        }
      }

      if (href && href !== link.getAttribute('href')) {
        link.setAttribute('href', href);
      }

      const resolvedDate = dateByPath.get(key);
      if (resolvedDate) dateList.push(resolvedDate);

      row.childNodes.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.nodeValue = (node.nodeValue || '').replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*/g, ' ');
      });
    });

    if (!dateList.length) return;
    const mostRecent = dateList.slice().sort((a, b) => (a < b ? 1 : -1))[0];
    document.querySelectorAll('[data-last-updated]').forEach(node => {
      node.setAttribute('data-last-updated', mostRecent);
    });
  }

  async function ensureHubMostRequestedServices(locale, englishPath) {
    const match = englishPath.match(/^\/legal-knowledge-center\/([^/]+)\.html$/);
    if (!match) return;

    const hubToCategory = {
      'civil-law': 'civil-law',
      'family-law': 'family-law',
      'human-rights': 'human-rights',
      'brazilian-visas': 'brazilian-visas',
      'brazilian-residencies': 'brazilian-residencies',
      'brazilian-naturalisation': 'naturalisation',
      'other-immigration-services': 'other-services',
      'immigration-abroad': 'immigration-abroad'
    };

    const categoryId = hubToCategory[match[1]];
    if (!categoryId) return;

    const heading = [...document.querySelectorAll('main article h2')].find(item =>
      /Most Requested Services/i.test(item.textContent || '')
    );
    if (!heading) return;
    const article = heading.closest('article');
    if (!article) return;

    const catalog = await loadServiceCatalog();
    const services = flattenServiceCatalog(catalog).filter(item => item.categoryId === categoryId);
    if (!services.length) return;

    const list = document.createElement('div');
    list.className = 'd-flex flex-wrap gap-2';
    services.forEach((service, index) => {
      const anchor = document.createElement('a');
      anchor.className = 'btn btn-outline-gold rounded-pill';
      if (index === 0) anchor.classList.add('most-requested-primary');
      anchor.href = locale === 'en' ? service.path : `/${locale}${service.path}`;
      anchor.textContent = service.name;
      list.appendChild(anchor);
    });

    const oldList = article.querySelector('ul, .d-flex.flex-wrap.gap-2');
    if (oldList) {
      oldList.replaceWith(list);
    } else {
      heading.insertAdjacentElement('afterend', list);
    }
  }

  function injectAbroadNumbeoNote(englishPath) {
    const slug = inferAbroadSlug(englishPath);
    if (!slug) return;
    if (document.getElementById('abroad-numbeo-note')) return;

    const numbeoUrls = {
      africa: 'https://www.numbeo.com/cost-of-living/region_rankings_current.jsp?region=002',
      asia: 'https://www.numbeo.com/cost-of-living/region_rankings_current.jsp?region=142',
      europe: 'https://www.numbeo.com/cost-of-living/region_rankings_current.jsp?region=150',
      mercosul: 'https://www.numbeo.com/cost-of-living/region_rankings_current.jsp?region=005',
      uk: 'https://www.numbeo.com/cost-of-living/country_result.jsp?country=United+Kingdom',
      usa: 'https://www.numbeo.com/cost-of-living/country_result.jsp?country=United+States'
    };

    const host = document.querySelector('main .hero-section .container-xxl, main .hero-section .container');
    if (!host) return;

    const note = document.createElement('p');
    note.id = 'abroad-numbeo-note';
    note.className = 'small opacity-80 mb-0';
    note.innerHTML = `Quality of Life (Numbeo): compare cost, safety, rent, and healthcare indicators before choosing your city. <a href="${numbeoUrls[slug] || 'https://www.numbeo.com'}" target="_blank" rel="noopener noreferrer">View Numbeo data</a>.`;
    host.appendChild(note);
  }

  function ensureAbroadGuideCompleteness(locale, englishPath) {
    const slug = inferAbroadSlug(englishPath);
    if (!slug) return;

    const shell = document.querySelector('#abroad-guide .enhancement-shell');
    if (!shell) return;

    const country =
      document.querySelector('#abroad-guide h1')?.textContent?.replace(/\s+/g, ' ').trim() || 'this destination';
    const copyByLocale = {
      en: {
        title: 'Country Guide Essentials',
        cards: [
          {
            h: 'History and legal context',
            p: 'Understand historical and regulatory context before choosing your immigration route.'
          },
          {
            h: 'Culture, food, and adaptation',
            p: 'Daily life, communication style, and cultural adaptation planning reduce relocation friction.'
          },
          {
            h: 'Why move, work, travel, and live there',
            p: 'Align your objective with practical reality: work market, cost profile, and lifestyle fit.'
          },
          {
            h: 'How Monique helps at each stage',
            p: 'Route strategy, evidence planning, and legal risk control from Brazil to destination.'
          }
        ]
      },
      pt: {
        title: 'Elementos Essenciais do Guia de Pais',
        cards: [
          {
            h: 'Historia e contexto juridico',
            p: 'Entenda o contexto historico e regulatorio antes de escolher sua rota migratoria.'
          },
          {
            h: 'Cultura, comida e adaptacao',
            p: 'Planejar rotina, comunicacao e adaptacao cultural reduz atritos na mudanca.'
          },
          {
            h: 'Por que mudar, trabalhar, viajar e viver',
            p: 'Alinhe objetivo com realidade pratica: mercado de trabalho, custos e estilo de vida.'
          },
          {
            h: 'Como Monique ajuda em cada etapa',
            p: 'Estrategia de rota, planejamento documental e controle de risco juridico.'
          }
        ]
      },
      es: {
        title: 'Elementos Esenciales de la Guia del Pais',
        cards: [
          {
            h: 'Historia y contexto legal',
            p: 'Comprenda el contexto historico y regulatorio antes de elegir su ruta migratoria.'
          },
          {
            h: 'Cultura, comida y adaptacion',
            p: 'Planear rutina, comunicacion y adaptacion cultural reduce friccion al reubicarse.'
          },
          {
            h: 'Por que mudarse, trabajar, viajar y vivir alli',
            p: 'Alinee su objetivo con la realidad: mercado laboral, costos y estilo de vida.'
          },
          {
            h: 'Como Monique ayuda en cada etapa',
            p: 'Estrategia de ruta, plan documental y control de riesgo legal.'
          }
        ]
      },
      fr: {
        title: 'Elements Essentiels du Guide Pays',
        cards: [
          {
            h: 'Histoire et contexte juridique',
            p: 'Comprenez le contexte historique et reglementaire avant de choisir votre route migratoire.'
          },
          {
            h: 'Culture, cuisine et adaptation',
            p: 'Planifier la vie quotidienne et ladaptation culturelle reduit les frictions de relocalisation.'
          },
          {
            h: 'Pourquoi partir, travailler, voyager et vivre la-bas',
            p: 'Alignez votre objectif avec la realite: marche du travail, couts et style de vie.'
          },
          {
            h: 'Comment Monique aide a chaque etape',
            p: 'Strategie de route, plan documentaire et controle des risques juridiques.'
          }
        ]
      }
    };
    const copy = copyByLocale[locale] || copyByLocale.en;

    if (!shell.querySelector('#abroad-guide-essentials')) {
      const cardsMarkup = copy.cards
        .map(
          card => `
            <div class="col-12 col-md-6">
              <article class="abroad-guide-card h-100">
                <h2 class="h3 text-gold">${escapeHtml(card.h)}</h2>
                <p class="small mb-0">${escapeHtml(card.p)}</p>
              </article>
            </div>
          `
        )
        .join('');

      const block = document.createElement('div');
      block.id = 'abroad-guide-essentials';
      block.className = 'mb-4';
      block.innerHTML = `
        <h2 class="h4 text-gold mb-3">${escapeHtml(copy.title)}</h2>
        <div class="row g-3">
          ${cardsMarkup}
        </div>
      `;

      const faqHeading = [...shell.querySelectorAll('h2, h3')].find(node =>
        /frequently asked|perguntas|preguntas|questions/i.test(node.textContent || '')
      );
      if (faqHeading) {
        faqHeading.insertAdjacentElement('beforebegin', block);
      } else {
        shell.appendChild(block);
      }
    }

    const accordion = shell.querySelector('.accordion[id^="abroadGuideFaq"]');
    if (!accordion) return;

    const existing = accordion.querySelectorAll('.accordion-item').length;
    if (existing >= 10) return;

    const extraFaqByLocale = {
      en: [
        {
          q: `Can Monique review my route options for ${country}?`,
          a: 'Yes. You can receive a route comparison with strengths, risks, and evidence priorities.'
        },
        {
          q: 'Can Monique help with document sequencing before filing?',
          a: 'Yes. Document order, translation, and legalization sequence can be organized before submission.'
        },
        {
          q: 'Can consultation include family members in one strategy?',
          a: 'Yes. Family plans can be coordinated to reduce contradictions and timeline conflicts.'
        },
        {
          q: 'Can Monique assist after refusal or delay?',
          a: 'Yes. Refusal analysis and procedural response planning are available case by case.'
        }
      ],
      pt: [
        {
          q: `A Monique pode revisar minhas opcoes de rota para ${country}?`,
          a: 'Sim. Voce recebe comparacao de rotas com pontos fortes, riscos e prioridades documentais.'
        },
        {
          q: 'A Monique ajuda no sequenciamento de documentos antes do protocolo?',
          a: 'Sim. Ordem documental, traducao e legalizacao podem ser organizadas antes da submissao.'
        },
        {
          q: 'A consulta pode incluir familiares em uma estrategia unica?',
          a: 'Sim. O planejamento familiar pode ser coordenado para reduzir conflitos de prazo.'
        },
        {
          q: 'A Monique pode atuar apos negativa ou demora?',
          a: 'Sim. Analise de negativa e planejamento de resposta processual sao avaliados por caso.'
        }
      ],
      es: [
        {
          q: `Monique puede revisar mis opciones de ruta para ${country}?`,
          a: 'Si. Recibe comparacion de rutas con fortalezas, riesgos y prioridades de evidencia.'
        },
        {
          q: 'Monique ayuda con la secuencia documental antes de presentar?',
          a: 'Si. Orden documental, traduccion y legalizacion pueden organizarse antes del envio.'
        },
        {
          q: 'La consulta puede incluir familiares en una sola estrategia?',
          a: 'Si. La planificacion familiar puede coordinarse para reducir conflictos de tiempos.'
        },
        {
          q: 'Monique puede asistir tras una negativa o demora?',
          a: 'Si. El analisis de negativa y la respuesta procesal se planifican segun cada caso.'
        }
      ],
      fr: [
        {
          q: `Monique peut-elle revoir mes options de route pour ${country} ?`,
          a: 'Oui. Vous recevez une comparaison des routes avec risques, points forts et priorites de preuves.'
        },
        {
          q: 'Monique aide-t-elle a ordonner les documents avant depot ?',
          a: 'Oui. Sequence documentaire, traduction et legalisation peuvent etre preparees en amont.'
        },
        {
          q: 'La consultation peut-elle inclure la famille dans une strategie unique ?',
          a: 'Oui. La planification familiale peut etre coordonnee pour reduire les conflits de calendrier.'
        },
        {
          q: 'Monique peut-elle intervenir apres refus ou retard ?',
          a: 'Oui. Analyse du refus et strategie de reponse procedurale sont traites selon le dossier.'
        }
      ]
    };
    const extras = extraFaqByLocale[locale] || extraFaqByLocale.en;
    const baseId = accordion.id || `abroadGuideFaq-${slug}`;
    if (!accordion.id) accordion.id = baseId;
    const needed = Math.min(10 - existing, extras.length);

    for (let i = 0; i < needed; i += 1) {
      const faq = extras[i];
      const idx = existing + i;
      const headingId = `${baseId}-extra-heading-${idx}`;
      const collapseId = `${baseId}-extra-collapse-${idx}`;
      const item = document.createElement('div');
      item.className = 'accordion-item border border-gold rounded-3 overflow-hidden mb-2';
      item.innerHTML = `
        <h3 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
            ${escapeHtml(faq.q)}
          </button>
        </h3>
        <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#${baseId}" aria-labelledby="${headingId}">
          <div class="accordion-body">${escapeHtml(faq.a)}</div>
        </div>
      `;
      accordion.appendChild(item);
    }
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffledBySeed(items, seed) {
    const rand = mulberry32(seed);
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildReviewsExperienceSection(featured) {
    const cards = featured
      .map(
        item => `
          <article class="reviews-showcase-card">
            <div class="reviews-showcase-stars" aria-hidden="true">★★★★★</div>
            <p class="reviews-showcase-text">"${escapeHtml(item.text)}"</p>
            <p class="reviews-showcase-author">- ${escapeHtml(item.author || 'Verified Client')}</p>
          </article>
        `
      )
      .join('');

    const section = document.createElement('section');
    section.id = 'reviews-experience';
    section.className = 'reviews-experience-section';
    section.setAttribute('aria-label', 'Client review highlights');
    section.innerHTML = `
      <div class="container-xxl">
        <div class="reviews-showcase-shell">
          <p class="reviews-showcase-kicker">Client Experience</p>
          <h2 class="reviews-showcase-title">Trusted Legal Support, Reviewed by Clients</h2>
          <p class="reviews-showcase-subtitle">A selection of feedback from clients who received Monique's legal services.</p>
          <div class="reviews-showcase-grid">
            ${cards}
          </div>
        </div>
      </div>
    `;
    return section;
  }

  async function initializeGlobalReviewsTicker(locale) {
    if (document.getElementById('reviews-experience')) return;

    try {
      const response = await fetch('/data/google-reviews.approved.json', { cache: 'no-cache' });
      if (!response.ok) return;
      const payload = await response.json();
      const reviews = Array.isArray(payload.reviews) ? payload.reviews.filter(item => item && item.text) : [];
      if (!reviews.length) return;

      const now = new Date();
      const week = `${now.getUTCFullYear()}-W${Math.ceil(((now - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)}`;
      const pathSeed = `${window.location.pathname}|${week}|${locale}`;
      const ordered = shuffledBySeed(reviews, hashString(pathSeed));
      const items = ordered.slice(0, Math.min(ordered.length, 24));
      const featured = items.slice(0, 3);
      const experienceSection = buildReviewsExperienceSection(featured);

      const footerContainer = document.getElementById('footer-container');
      if (footerContainer) {
        footerContainer.insertAdjacentElement('beforebegin', experienceSection);
      } else {
        document.body.appendChild(experienceSection);
      }
    } catch (error) {
      // Non-blocking enhancement.
    }
  }

  async function initializeClientIndicatorsBar(locale) {
    if (document.getElementById('client-indicators-bar')) return;

    let payload = null;
    try {
      const response = await fetch('/data/client-indicators.json', { cache: 'no-cache' });
      if (!response.ok) return;
      payload = await response.json();
    } catch {
      return;
    }

    const metrics = Array.isArray(payload?.metrics) ? payload.metrics : [];
    if (!metrics.length) return;

    const copyByLocale = {
      en: {
        kicker: '',
        title: 'Client Indicators',
        summary: 'From feedback submitted. To submit your confidential feedback, click the Feedback button.',
        button: getText('en', 'nav.feedback') || 'Feedback'
      },
      pt: {
        kicker: '',
        title: 'Indicadores de clientes',
        summary: 'Com base nos feedbacks enviados. Para enviar seu feedback confidencial, clique no botao de Feedback.',
        button: getText('pt', 'nav.feedback') || 'Feedback'
      },
      es: {
        kicker: '',
        title: 'Indicadores de clientes',
        summary: 'A partir de los comentarios enviados. Para enviar su comentario confidencial, haga clic en el boton de Feedback.',
        button: getText('es', 'nav.feedback') || 'Feedback'
      },
      fr: {
        kicker: '',
        title: 'Indicateurs clients',
        summary: 'A partir des retours envoyes. Pour envoyer votre retour confidentiel, cliquez sur le bouton Feedback.',
        button: getText('fr', 'nav.feedback') || 'Feedback'
      }
    };
    const copy = copyByLocale[locale] || copyByLocale.en;
    const iconByMetric = {
      service: 'fa-hand-holding-heart',
      responsiveness: 'fa-bolt',
      expertise: 'fa-scale-balanced',
      communication: 'fa-comments',
      updates: 'fa-bell',
      understanding: 'fa-ear-listen',
      respect: 'fa-handshake-angle',
      transparency: 'fa-eye',
      satisfaction: 'fa-face-smile',
      recommendation: 'fa-thumbs-up',
      'average-score': 'fa-chart-line'
    };
    const averageMetric = metrics.find(item => item?.id === 'average-score') || null;
    const visibleMetrics = metrics.filter(item => item?.id !== 'average-score');

    const section = document.createElement('section');
    section.id = 'client-indicators-bar';
    section.className = 'client-indicators-bar';
    section.setAttribute('aria-label', 'Client service indicators');
    section.innerHTML = `
      <div class="container-xxl">
        <div class="client-indicators-shell">
          <div class="client-indicators-head">
            <div class="client-indicators-head-main">
              <div class="client-indicators-copy">
                ${copy.kicker ? `<p class="client-indicators-kicker mb-1">${escapeHtml(copy.kicker)}</p>` : ''}
                <h2 class="client-indicators-title">${escapeHtml(copy.title)}</h2>
                <p class="client-indicators-summary mb-0">${escapeHtml(copy.summary)}</p>
              </div>
              ${averageMetric ? `
                <div class="client-indicators-average" aria-label="${escapeHtml(averageMetric.label || 'Average score')}">
                  <span class="client-indicators-average__label">${escapeHtml(averageMetric.label || 'Average score')}</span>
                  <strong class="client-indicators-average__value">${escapeHtml(averageMetric.score || '')}</strong>
                </div>
              ` : ''}
            </div>
            <a class="btn btn-outline-gold rounded-pill px-4 client-indicators-cta" data-no-locale="true" href="${escapeHtml(payload?.ctaPath || '/client-feedback.html')}">${escapeHtml(copy.button)}</a>
          </div>
          <div class="client-indicators-track" tabindex="0">
            ${visibleMetrics
              .map(
                item => `
                  <article class="client-indicator-chip${item.id === 'average-score' ? ' client-indicator-chip--highlight' : ''}">
                    <span class="client-indicator-chip__icon" aria-hidden="true"><i class="fas ${iconByMetric[item.id] || 'fa-star'}"></i></span>
                    <span class="client-indicator-chip__label">${escapeHtml(item.label || 'Score')}</span>
                    <strong class="client-indicator-chip__value">${escapeHtml(item.score || '')}</strong>
                  </article>
                `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    const reviews = document.getElementById('reviews-experience');
    const footerContainer = document.getElementById('footer-container');
    if (reviews) {
      reviews.insertAdjacentElement('afterend', section);
      return;
    }

    if (footerContainer) {
      footerContainer.insertAdjacentElement('beforebegin', section);
      return;
    }

    document.body.appendChild(section);
  }

  function footerAuthorityCopy(locale) {
    const copy = {
      en: {
        ariaLabel: 'Why clients trust Monique Fernandes',
        items: [
          { label: 'Bar registration', value: 'OAB/BAR Registered Attorney' },
          { label: 'In practice', value: 'Since 2018' },
          { label: 'Languages', value: 'English and Portuguese' },
          { label: 'Service jurisdiction', value: 'Brazil with remote worldwide support' }
        ],
        note:
          'If you need guidance for your specific situation, book a confidential consultation with Attorney Monique Fernandes for personalised legal advice tailored to you.'
      },
      pt: {
        ariaLabel: 'Sinais profissionais de confianca',
        items: [
          { label: 'Registro', value: 'OAB/PR 108.616' },
          { label: 'Atuacao', value: 'Desde 2018' },
          { label: 'Idiomas', value: 'Ingles e portugues' },
          { label: 'Atendimento', value: 'Jurisdicao Brasil com suporte remoto' }
        ],
        note:
          'O conteudo do site e informativo e nao substitui orientacao juridica para o seu caso. Comece com uma consulta confidencial para receber analise baseada nos seus fatos.'
      },
      es: {
        ariaLabel: 'Senales profesionales de confianza',
        items: [
          { label: 'Registro', value: 'OAB/PR 108.616' },
          { label: 'Practica', value: 'Desde 2018' },
          { label: 'Idiomas', value: 'Ingles y portugues' },
          { label: 'Atencion', value: 'Jurisdiccion Brasil con soporte remoto' }
        ],
        note:
          'El contenido del sitio es informativo y no sustituye orientacion legal para su caso. Comience con una consulta confidencial para recibir analisis basado en sus hechos.'
      },
      fr: {
        ariaLabel: 'Signaux professionnels de confiance',
        items: [
          { label: 'Inscription', value: 'OAB/PR 108.616' },
          { label: 'Pratique', value: 'Depuis 2018' },
          { label: 'Langues', value: 'Anglais et portugais' },
          { label: 'Service', value: 'Juridiction Bresil avec accompagnement a distance' }
        ],
        note:
          'Le contenu du site est informatif et ne remplace pas un conseil juridique pour votre dossier. Commencez par une consultation confidentielle pour une analyse fondee sur vos faits.'
      }
    };

    return copy[locale] || copy.en;
  }

  function initializeFooterAuthorityStrip(locale) {
    const footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.footer-authority-strip')) return;

    const container = footer.querySelector('.container-xxl');
    if (!container) return;

    const footerBottom = footer.querySelector('.footer-bottom');
    const copy = footerAuthorityCopy(locale);
    const strip = document.createElement('div');
    strip.className = 'footer-authority-strip';
    strip.setAttribute('aria-label', copy.ariaLabel);
    strip.innerHTML = `
      <div class="footer-authority-strip__grid">
        ${copy.items
          .map(
            item => `
              <article class="footer-authority-pill">
                <span class="footer-authority-pill__label">${escapeHtml(item.label)}</span>
                <strong class="footer-authority-pill__value">${escapeHtml(item.value)}</strong>
              </article>
            `
          )
          .join('')}
      </div>
      <p class="footer-authority-note mb-0">${escapeHtml(copy.note)}</p>
    `;

    if (footerBottom) {
      footerBottom.insertAdjacentElement('beforebegin', strip);
      return;
    }

    container.appendChild(strip);
  }

  function updateFooterYear() {
    const year = document.getElementById('footer-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  async function boot() {
    injectThemeAssets();
    normalizePageScaffold();
    applyA11ySettings();
    stripCommentArtifacts();
    sanitizeBrokenMarkupArtifacts();

    injectSkipLink();
    ensureContainer('top-utility-container', true);
    ensureMainLandmark();

    const locationInfo = detectLocaleAndPath(window.location.pathname);
    const suppressDirectoryEnhancements = locationInfo.englishPath === '/services/immigration-to-brazil/by-country/index.html';
    applyPageContext(locationInfo.englishPath);
    initializeBreadcrumbs(locationInfo.locale, locationInfo.englishPath);
    const breadcrumb = buildBreadcrumbSchema();
    if (breadcrumb) {
      upsertJsonLd('breadcrumb-structured-data', {
        '@context': 'https://schema.org',
        ...breadcrumb
      });
    }

    await loadLocalizedComponent('top-utility.html', locationInfo.locale, 'top-utility-container');
    applyTranslations(locationInfo.locale);
    await initLanguageSwitcher(locationInfo.locale, locationInfo.englishPath);
    initAccessibilityControls();

    await Promise.all([
      loadLocalizedComponent('header.html', locationInfo.locale, 'header-container'),
      loadLocalizedComponent('footer.html', locationInfo.locale, 'footer-container')
    ]);

    applyTranslations(locationInfo.locale);
    localizeSharedComponentLinks(locationInfo.locale);
    localizeDocumentLinks(locationInfo.locale);
    syncCountryOfficialDocumentLanguage();
    normalizeLinksForLocalPreview();
    await initializeNinaChatbot(locationInfo.locale, locationInfo.englishPath);
    initializeFooterAuthorityStrip(locationInfo.locale);

    initializeHeaderInteractions();
    setActiveNavigation(locationInfo.englishPath);
    normalizeSeoCoreNavigation(locationInfo.locale);
    reframeServiceHubForms(locationInfo.locale, locationInfo.englishPath);
    cleanServiceHubDocumentPrompts(locationInfo.locale, locationInfo.englishPath);
    normalizeServiceCopyPhrases(locationInfo.locale, locationInfo.englishPath);
    insertConsultationFlowBands(locationInfo.locale, locationInfo.englishPath);

    await initializeServiceEnhancementSection(locationInfo.locale, locationInfo.englishPath);
    await initializeAbroadGuideSection(locationInfo.locale, locationInfo.englishPath);
    await enhanceHomeServicesShowcase(locationInfo.locale, locationInfo.englishPath);
    await injectHomeBlogPreview(locationInfo.locale, locationInfo.englishPath);
    await initializeServicesCataloguePage(locationInfo.locale, locationInfo.englishPath);
    await initializeServiceStructuredData(locationInfo.locale, locationInfo.englishPath);
    if (!suppressDirectoryEnhancements) {
      await injectRelatedInsightsSection(locationInfo.locale, locationInfo.englishPath);
    }
    initializeFeedbackPage(locationInfo.locale, locationInfo.englishPath);
    if (!suppressDirectoryEnhancements) {
      await initializeGlobalReviewsTicker(locationInfo.locale);
      await initializeClientIndicatorsBar(locationInfo.locale);
    }
    await ensureHubMostRequestedServices(locationInfo.locale, locationInfo.englishPath);
    normalizeLeadGenerationButtons(locationInfo.locale, locationInfo.englishPath);
    await syncKnowledgeHubDates();
    localizeDocumentLinks(locationInfo.locale);

    normalizeHeadingHierarchyStyles();
    enforceHeadingTone();
    replaceYearsExperienceCopy(locationInfo.locale);
    emphasizeHeadingFirstWord();
    highlightMoniqueName();
    removeInstagramBlocks();
    removeNewsletterOpenLinks();
    removeFreshnessPolicyText();
    replaceLegacyGuidePhrases();
    repairBrokenContactForms();
    standardizeSimpleContactForms();
    initializeServiceHubForms();
    fixTemplatePlaceholderLinks();
    injectExperienceSince2018(locationInfo.locale, locationInfo.englishPath);
    ensureDocumentRequirementsConsultCta(locationInfo.locale, locationInfo.englishPath);
    removeBlogCoreServicesSection(locationInfo.englishPath);
    ensureBlogFeedExperience(locationInfo.locale, locationInfo.englishPath);
    injectAbroadNumbeoNote(locationInfo.englishPath);
    ensureAbroadGuideCompleteness(locationInfo.locale, locationInfo.englishPath);
    ensureHeroTrustSignals(locationInfo.locale, locationInfo.englishPath);
    ensureHeroScrollIndicators(locationInfo.locale);
    enrichLogoAltText();
    ensureContextualImageAltText();
    ensureExternalResourcesScript();

    initializeAOS();
    initializeSmoothScroll();
    initializePremiumHeader();
    initializeBackToTop();
    ensureFloatingActionsStack();
    initializeHeroCanvas();
    initializeContactForm(locationInfo.locale);
    removeFloatingNewsletterBar();
    if (!suppressDirectoryEnhancements) {
      injectInlineNewsletterSection(locationInfo.locale);
    }
    initializeNewsletterForms(locationInfo.locale);
    initializeEbookGuideForms(locationInfo.locale);
    ensureVisibleFieldLabels(locationInfo.locale);
    initializePremiumForms();
    initializeCountryDirectory(locationInfo.locale, locationInfo.englishPath);
    const refreshPageExperience = () => {
      initializePageProgress(locationInfo.locale);
      initializeSectionDividers();
      initializeInteractiveSurfaces();
      initializePremiumCtas();
      initializePremiumMedia();
      initializeRevealSystem();
    };

    refreshPageExperience();
    window.setTimeout(refreshPageExperience, 1600);
    window.setTimeout(ensureFloatingActionsStack, 120);
    window.setTimeout(ensureFloatingActionsStack, 700);
    window.addEventListener('load', () => window.setTimeout(refreshPageExperience, 260), { once: true });
    window.addEventListener('load', () => window.setTimeout(ensureFloatingActionsStack, 260), { once: true });
    updateFooterYear();
    window.setTimeout(fixTemplatePlaceholderLinks, 700);

    const scrollArrow = document.getElementById('scroll-arrow');
    if (scrollArrow) {
      scrollArrow.addEventListener('click', () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      });
    }
  }

  function ensureExternalResourcesScript() {
    const pageLang = (document.documentElement.lang || '').toLowerCase();
    if (pageLang && !pageLang.startsWith('en')) return;
    if (!document.querySelector('[data-official-resources], [data-external-resources]')) return;
    if (document.querySelector('script[data-external-resources-script="true"], script[src="/js/external-resources.js"]')) return;

    const script = document.createElement('script');
    script.src = '/js/external-resources.js';
    script.defer = true;
    script.setAttribute('data-external-resources-script', 'true');
    document.head.appendChild(script);
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
