(() => {
  'use strict';

  if (window.MoniqueNinaChatbot) return;

  const FORM_ENDPOINT = 'https://formspree.io/f/mnjoqvbb';
  const WHATSAPP_BASE = 'https://api.whatsapp.com/send/?phone=554399614034&text=';
  const STORAGE_KEY = 'monique_nina_chatbot_v1';
  const VALID_LOCALES = new Set(['en', 'pt', 'es', 'fr']);
  const SEARCH_STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'do',
    'for',
    'from',
    'how',
    'i',
    'if',
    'in',
    'is',
    'it',
    'me',
    'my',
    'of',
    'on',
    'or',
    'the',
    'to',
    'we',
    'what',
    'with',
    'you',
    'your'
  ]);
  const LOCALE_LABELS = {
    en: 'English',
    pt: 'Portuguese',
    es: 'Spanish',
    fr: 'French'
  };
  const HOME_PATH = '/index.html';

  const DEFAULT_STATE = {
    serviceId: '',
    customService: '',
    email: '',
    message: '',
    question: '',
    submitted: false,
    submittedAt: '',
    suppressAuto: false
  };

  const SERVICE_OPTIONS = [
    {
      id: 'visa',
      value: 'Visa',
      labels: { en: 'Visa', pt: 'Visto', es: 'Visa', fr: 'Visa' }
    },
    {
      id: 'residency',
      value: 'Residency',
      labels: { en: 'Residency', pt: 'Residencia', es: 'Residencia', fr: 'Residence' }
    },
    {
      id: 'citizenship',
      value: 'Citizenship',
      labels: { en: 'Citizenship', pt: 'Cidadania', es: 'Ciudadania', fr: 'Citoyennete' }
    },
    {
      id: 'family',
      value: 'Family',
      labels: { en: 'Family', pt: 'Familia', es: 'Familia', fr: 'Famille' }
    },
    {
      id: 'civil',
      value: 'Civil',
      labels: { en: 'Civil', pt: 'Civil', es: 'Civil', fr: 'Civil' }
    },
    {
      id: 'human-rights',
      value: 'Human Rights',
      labels: {
        en: 'Human Rights',
        pt: 'Direitos Humanos',
        es: 'Derechos Humanos',
        fr: 'Droits humains'
      }
    },
    {
      id: 'immigrate-to-brazil',
      value: 'Immigrate to Brazil',
      labels: {
        en: 'Immigrate to Brazil',
        pt: 'Imigrar para o Brasil',
        es: 'Inmigrar a Brasil',
        fr: 'Immigrer au Bresil'
      }
    },
    {
      id: 'immigrate-abroad',
      value: 'Immigrate Abroad',
      labels: {
        en: 'Immigrate Abroad',
        pt: 'Imigrar para fora do Brasil',
        es: 'Inmigrar al extranjero',
        fr: 'Immigrer a l etranger'
      }
    },
    {
      id: 'other',
      value: 'Other',
      labels: { en: 'Other', pt: 'Outro', es: 'Otro', fr: 'Autre' }
    }
  ];

  const COPY = {
    en: {
      launcherEyebrow: 'Nina',
      launcherTitle: 'Ask Nina',
      panelSubtitle: 'Quick help with visas, residency, family, civil, and rights.',
      openAria: 'Open Nina legal assistant chatbot',
      closeAria: 'Close Nina chatbot',
      restartAria: 'Restart Nina chatbot',
      minimizeAria: 'Minimize Nina chatbot',
      intro: "Hello! I'm Nina, Monique Fernandes' bot. Can I help you? ...",
      servicePrompt: '',
      otherServiceLabel: 'Other',
      otherServicePlaceholder: 'What do you need?',
      askAria: 'Ask Nina a quick question',
      askPlaceholder: 'Ask Nina',
      askSubmit: 'Go',
      emailLabel: 'Email address',
      emailPlaceholder: 'name@email.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Optional',
      submit: 'Send',
      submitting: 'Sending...',
      thankYou: 'Thanks. We got it.',
      thankYouNote: 'Fastest reply is on WhatsApp.',
      whatsapp: 'WhatsApp',
      finish: 'Close',
      restart: 'Restart',
      openPage: 'Open page',
      routeLead: 'Start here:',
      error:
        'Could not send right now. Continue on WhatsApp or try again.',
      statusSent: 'Lead sent successfully.',
      statusError: 'Lead submission failed.',
      labels: {
        language: 'Language',
        service: 'Service',
        question: 'Question',
        email: 'Email',
        message: 'Message',
        page: 'Page'
      },
      whatsappIntro: 'Hello, I contacted Attorney Fernandes through the website.'
    },
    pt: {
      launcherEyebrow: 'Nina',
      launcherTitle: 'Pergunte a Nina',
      panelSubtitle: 'Ajuda rapida com vistos, residencia, familia, civil e direitos.',
      openAria: 'Abrir chatbot Nina',
      closeAria: 'Fechar chatbot Nina',
      restartAria: 'Reiniciar chatbot Nina',
      minimizeAria: 'Minimizar chatbot Nina',
      intro: 'Ola! Sou Nina, a assistente juridica virtual de Monique Fernandes. Vou ajudar voce a encontrar o servico certo.',
      servicePrompt: '',
      otherServiceLabel: 'Outro',
      otherServicePlaceholder: 'Do que voce precisa?',
      askAria: 'Faca uma pergunta rapida para Nina',
      askPlaceholder: 'Pergunte para Nina',
      askSubmit: 'Ir',
      emailLabel: 'Email',
      emailPlaceholder: 'nome@email.com',
      messageLabel: 'Mensagem',
      messagePlaceholder: 'Opcional',
      submit: 'Enviar',
      submitting: 'Enviando...',
      thankYou: 'Obrigada. Recebemos.',
      thankYouNote: 'A resposta mais rapida e no WhatsApp.',
      whatsapp: 'WhatsApp',
      finish: 'Fechar',
      restart: 'Recomecar',
      openPage: 'Abrir pagina',
      routeLead: 'Comece aqui:',
      error:
        'Nao foi possivel enviar agora. Continue no WhatsApp ou tente de novo.',
      statusSent: 'Lead enviado com sucesso.',
      statusError: 'Falha ao enviar o lead.',
      labels: {
        language: 'Idioma',
        service: 'Servico',
        question: 'Pergunta',
        email: 'Email',
        message: 'Mensagem',
        page: 'Pagina'
      },
      whatsappIntro: 'Ola, entrei em contato com a Advogada Fernandes pelo site.'
    },
    es: {
      launcherEyebrow: 'Nina',
      launcherTitle: 'Pregunta a Nina',
      panelSubtitle: 'Ayuda rapida con visas, residencia, familia, civil y derechos.',
      openAria: 'Abrir chatbot Nina',
      closeAria: 'Cerrar chatbot Nina',
      restartAria: 'Reiniciar chatbot Nina',
      minimizeAria: 'Minimizar chatbot Nina',
      intro: 'Hola! Soy Nina, la asistente legal virtual de Monique Fernandes. Voy a ayudarte a encontrar el servicio correcto.',
      servicePrompt: '',
      otherServiceLabel: 'Otro',
      otherServicePlaceholder: 'Que necesitas?',
      askAria: 'Hazle una pregunta rapida a Nina',
      askPlaceholder: 'Pregunta a Nina',
      askSubmit: 'Ir',
      emailLabel: 'Correo electronico',
      emailPlaceholder: 'nombre@email.com',
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Opcional',
      submit: 'Enviar',
      submitting: 'Enviando...',
      thankYou: 'Gracias. Lo recibimos.',
      thankYouNote: 'La respuesta mas rapida es por WhatsApp.',
      whatsapp: 'WhatsApp',
      finish: 'Cerrar',
      restart: 'Empezar de nuevo',
      openPage: 'Abrir pagina',
      routeLead: 'Empieza aqui:',
      error:
        'No pude enviarlo ahora. Sigue por WhatsApp o intenta otra vez.',
      statusSent: 'Lead enviado correctamente.',
      statusError: 'No se pudo enviar el lead.',
      labels: {
        language: 'Idioma',
        service: 'Servicio',
        question: 'Pregunta',
        email: 'Email',
        message: 'Mensaje',
        page: 'Pagina'
      },
      whatsappIntro: 'Hola, contacte a la Abogada Fernandes a traves del sitio web.'
    },
    fr: {
      launcherEyebrow: 'Nina',
      launcherTitle: 'Demandez a Nina',
      panelSubtitle: 'Aide rapide pour visas, residence, famille, civil et droits.',
      openAria: 'Ouvrir le chatbot Nina',
      closeAria: 'Fermer le chatbot Nina',
      restartAria: 'Reinitialiser le chatbot Nina',
      minimizeAria: 'Reduire le chatbot Nina',
      intro: "Bonjour ! Je suis Nina, l'assistante juridique virtuelle de Monique Fernandes. Je vais vous aider a trouver le bon service.",
      servicePrompt: '',
      otherServiceLabel: 'Autre',
      otherServicePlaceholder: 'De quoi avez-vous besoin ?',
      askAria: 'Posez une question rapide a Nina',
      askPlaceholder: 'Demandez a Nina',
      askSubmit: 'Aller',
      emailLabel: 'Email',
      emailPlaceholder: 'nom@email.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Optionnel',
      submit: 'Envoyer',
      submitting: 'Envoi...',
      thankYou: 'Merci. C est recu.',
      thankYouNote: 'Le plus rapide est WhatsApp.',
      whatsapp: 'WhatsApp',
      finish: 'Fermer',
      restart: 'Recommencer',
      openPage: 'Ouvrir la page',
      routeLead: 'Commencez ici :',
      error:
        "Envoi impossible pour le moment. Continuez sur WhatsApp ou reessayez.",
      statusSent: 'Lead envoye avec succes.',
      statusError: "Echec de l'envoi du lead.",
      labels: {
        language: 'Langue',
        service: 'Service',
        question: 'Question',
        email: 'Email',
        message: 'Message',
        page: 'Page'
      },
      whatsappIntro: "Bonjour, j'ai contacte l'Avocate Fernandes via le site web."
    }
  };

  const QUESTION_ROUTES = {
    documents: {
      id: 'documents',
      path: '/faq-hub.html',
      paths: {
        en: '/faq-hub.html',
        pt: '/pt/document-requirements.html',
        es: '/es/document-requirements.html',
        fr: '/fr/document-requirements.html'
      },
      titles: {
        en: 'Document requirements',
        pt: 'Documentos exigidos',
        es: 'Documentos requeridos',
        fr: 'Documents requis'
      }
    },
    visa: {
      id: 'visa',
      serviceId: 'visa',
      path: '/services/immigration-to-brazil/all-brazilian-visa-services.html',
      titles: {
        en: 'Brazilian visas',
        pt: 'Vistos para o Brasil',
        es: 'Visas para Brasil',
        fr: 'Visas pour le Bresil'
      }
    },
    residency: {
      id: 'residency',
      serviceId: 'residency',
      path: '/services/immigration-to-brazil/all-brazilian-residencies-services.html',
      titles: {
        en: 'Brazilian residencies',
        pt: 'Residencias no Brasil',
        es: 'Residencias en Brasil',
        fr: 'Residences au Bresil'
      }
    },
    citizenship: {
      id: 'citizenship',
      serviceId: 'citizenship',
      path: '/services/immigration-to-brazil/all-brazilian-naturalisation-services.html',
      titles: {
        en: 'Brazilian citizenship',
        pt: 'Cidadania brasileira',
        es: 'Ciudadania brasilena',
        fr: 'Citoyennete bresilienne'
      }
    },
    family: {
      id: 'family',
      serviceId: 'family',
      path: '/services/family/all-family-law-services.html',
      titles: {
        en: 'Family law',
        pt: 'Direito de familia',
        es: 'Derecho de familia',
        fr: 'Droit de la famille'
      }
    },
    civil: {
      id: 'civil',
      serviceId: 'civil',
      path: '/services/civil/all-civil-law-services.html',
      titles: {
        en: 'Civil law',
        pt: 'Direito civil',
        es: 'Derecho civil',
        fr: 'Droit civil'
      }
    },
    humanRights: {
      id: 'human-rights',
      serviceId: 'human-rights',
      path: '/services/human-rights/all-human-rights-services.html',
      titles: {
        en: 'Human rights',
        pt: 'Direitos humanos',
        es: 'Derechos humanos',
        fr: 'Droits humains'
      }
    },
    immigrateToBrazil: {
      id: 'immigrate-to-brazil',
      serviceId: 'immigrate-to-brazil',
      path: '/services/immigration-to-brazil/all-immigration-to-brazil-services.html',
      titles: {
        en: 'Immigrate to Brazil',
        pt: 'Imigrar para o Brasil',
        es: 'Inmigrar a Brasil',
        fr: 'Immigrer au Bresil'
      }
    },
    immigrateAbroad: {
      id: 'immigrate-abroad',
      serviceId: 'immigrate-abroad',
      path: '/services/immigration-abroad-services/all-immigration-abroad-services.html',
      titles: {
        en: 'Immigrate abroad',
        pt: 'Imigrar para fora do Brasil',
        es: 'Inmigrar al extranjero',
        fr: 'Immigrer a l etranger'
      }
    },
    faq: {
      id: 'faq',
      path: '/faq-hub.html',
      titles: {
        en: 'FAQ',
        pt: 'FAQ',
        es: 'FAQ',
        fr: 'FAQ'
      }
    },
    contact: {
      id: 'contact',
      path: '/contact.html',
      titles: {
        en: 'Contact',
        pt: 'Contato',
        es: 'Contacto',
        fr: 'Contact'
      }
    },
    about: {
      id: 'about',
      path: '/about.html',
      titles: {
        en: 'About Attorney Monique Fernandes',
        pt: 'Sobre a advogada Monique Fernandes',
        es: 'Sobre la abogada Monique Fernandes',
        fr: "A propos de l'avocate Monique Fernandes"
      }
    },
    services: {
      id: 'services',
      path: '/services.html',
      titles: {
        en: 'All services',
        pt: 'Todos os servicos',
        es: 'Todos los servicios',
        fr: 'Tous les services'
      }
    }
  };

  const PUBLIC_SEARCH_DOCUMENTS = [
    { id: 'services', routeId: 'services', path: '/services.html' },
    { id: 'faq', routeId: 'faq', path: '/faq-hub.html' },
    {
      id: 'documents',
      routeId: 'documents',
      path: '/faq-hub.html',
      paths: {
        en: '/faq-hub.html',
        pt: '/pt/document-requirements.html',
        es: '/es/document-requirements.html',
        fr: '/fr/document-requirements.html'
      }
    },
    { id: 'contact', routeId: 'contact', path: '/contact.html' },
    { id: 'consultation', routeId: 'contact', path: '/book-consultation.html' },
    { id: 'about', routeId: 'about', path: '/about.html' },
    { id: 'visa', routeId: 'visa', path: '/services/immigration-to-brazil/all-brazilian-visa-services.html' },
    {
      id: 'residency',
      routeId: 'residency',
      path: '/services/immigration-to-brazil/all-brazilian-residencies-services.html'
    },
    {
      id: 'citizenship',
      routeId: 'citizenship',
      path: '/services/immigration-to-brazil/all-brazilian-naturalisation-services.html'
    },
    {
      id: 'immigrate-to-brazil',
      routeId: 'immigrate-to-brazil',
      path: '/services/immigration-to-brazil/all-immigration-to-brazil-services.html'
    },
    {
      id: 'immigrate-abroad',
      routeId: 'immigrate-abroad',
      path: '/services/immigration-abroad-services/all-immigration-abroad-services.html'
    },
    { id: 'family', routeId: 'family', path: '/services/family/all-family-law-services.html' },
    { id: 'civil', routeId: 'civil', path: '/services/civil/all-civil-law-services.html' },
    { id: 'human-rights', routeId: 'human-rights', path: '/services/human-rights/all-human-rights-services.html' }
  ];

  let root = null;
  let panel = null;
  let thread = null;
  let launcher = null;
  let liveRegion = null;
  let teaserButton = null;
  let teaserText = null;
  let typingTimers = { panel: 0, teaser: 0 };
  let eventsBound = false;
  let currentLocale = 'en';
  let currentEnglishPath = HOME_PATH;
  let publicDocumentCache = new Map();
  let state = { ...DEFAULT_STATE };
  let uiState = {
    open: false,
    submitting: false,
    error: '',
    lastStepKey: '',
    questionDraft: '',
    routeHistory: [],
    teaserVisible: false,
    teaserShown: false
  };

  function normalizeLocale(value) {
    return VALID_LOCALES.has(value) ? value : 'en';
  }

  function detectPreferredLocale(fallback = 'en') {
    const browserLocales = [];

    if (Array.isArray(navigator.languages)) browserLocales.push(...navigator.languages);
    if (navigator.language) browserLocales.push(navigator.language);

    for (const locale of browserLocales) {
      const normalized = String(locale || '').toLowerCase();
      if (normalized.startsWith('pt')) return 'pt';
      if (normalized.startsWith('es')) return 'es';
      if (normalized.startsWith('fr')) return 'fr';
      if (normalized.startsWith('en')) return 'en';
    }

    return normalizeLocale(fallback);
  }

  function getLocaleLabel(locale) {
    return LOCALE_LABELS[normalizeLocale(locale)] || LOCALE_LABELS.en;
  }

  function readStorage() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function writeStorage(nextState) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      return true;
    } catch {
      return false;
    }
  }

  function loadState() {
    const raw = readStorage();
    if (!raw) return { ...DEFAULT_STATE };

    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  function persistState() {
    writeStorage(state);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCopy() {
    return COPY[normalizeLocale(currentLocale)] || COPY.en;
  }

  function getOptionById(options, id) {
    return options.find(option => option.id === id) || null;
  }

  function getQuestionRoute(routeId) {
    return QUESTION_ROUTES[routeId] || QUESTION_ROUTES.services;
  }

  function getServiceOption(id) {
    return getOptionById(SERVICE_OPTIONS, id);
  }

  function getLocalizedLabel(option) {
    if (!option) return '';
    const locale = normalizeLocale(currentLocale);
    return option.labels?.[locale] || option.labels?.en || option.value || '';
  }

  function getLocalizedRouteTitle(route) {
    if (!route) return '';
    const locale = normalizeLocale(currentLocale);
    return route.titles?.[locale] || route.titles?.en || '';
  }

  function inferRouteIdFromPath(path) {
    const normalized = String(path || '');

    if (normalized.includes('/document-requirements')) return 'documents';
    if (normalized.includes('/all-brazilian-visa-services') || normalized.includes('/immigration-to-brazil/visas/')) return 'visa';
    if (normalized.includes('/all-brazilian-residencies-services') || normalized.includes('/immigration-to-brazil/residencies/')) {
      return 'residency';
    }
    if (
      normalized.includes('/all-brazilian-naturalisation-services') ||
      normalized.includes('/immigration-to-brazil/citizenship/')
    ) {
      return 'citizenship';
    }
    if (normalized.includes('/all-family-law-services') || normalized.includes('/services/family/')) return 'family';
    if (normalized.includes('/all-civil-law-services') || normalized.includes('/services/civil/')) return 'civil';
    if (normalized.includes('/all-human-rights-services') || normalized.includes('/services/human-rights/')) {
      return 'human-rights';
    }
    if (normalized.includes('/all-immigration-abroad-services') || normalized.includes('/services/immigration-abroad-services/')) {
      return 'immigrate-abroad';
    }
    if (normalized.includes('/all-immigration-to-brazil-services') || normalized.includes('/services/immigration-to-brazil/')) {
      return 'immigrate-to-brazil';
    }
    if (normalized.includes('/faq-hub')) return 'faq';
    if (normalized.includes('/contact') || normalized.includes('/book-consultation')) return 'contact';
    if (normalized.includes('/about')) return 'about';
    return 'services';
  }

  function localizePath(path) {
    const normalized = String(path || '').startsWith('/') ? String(path) : `/${String(path || '')}`;
    return currentLocale === 'en' ? normalized : `/${currentLocale}${normalized}`;
  }

  function resolvePublicPath(record) {
    if (!record) return '/services.html';
    if (record.paths?.[currentLocale]) return record.paths[currentLocale];
    if (record.path) return localizePath(record.path);
    return '/services.html';
  }

  function normalizeSearchText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s/-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function hasKeyword(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  function extractSearchTerms(value) {
    return normalizeSearchText(value)
      .split(' ')
      .filter(term => term.length > 2 && !SEARCH_STOP_WORDS.has(term));
  }

  function getPublicSearchDocuments() {
    const documents = [...PUBLIC_SEARCH_DOCUMENTS];

    if (
      currentEnglishPath &&
      currentEnglishPath !== HOME_PATH &&
      !documents.some(record => record.path === currentEnglishPath)
    ) {
      documents.unshift({
        id: 'current-page',
        routeId: inferRouteIdFromPath(currentEnglishPath),
        path: currentEnglishPath,
        titles: {
          en: document.title,
          pt: document.title,
          es: document.title,
          fr: document.title
        }
      });
    }

    return documents;
  }

  async function fetchPublicDocument(record) {
    const cacheKey = `${currentLocale}:${record.path}`;
    if (publicDocumentCache.has(cacheKey)) return publicDocumentCache.get(cacheKey);

    const candidates = [...new Set([resolvePublicPath(record), record.path])];
    let best = null;

    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { credentials: 'same-origin' });
        if (!response.ok) continue;

        const html = await response.text();
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const title =
          doc.querySelector('title')?.textContent ||
          getLocalizedRouteTitle(getQuestionRoute(record.routeId)) ||
          record.titles?.[currentLocale] ||
          record.titles?.en ||
          '';
        const bodyText = doc.querySelector('main')?.textContent || doc.body?.textContent || '';

        best = {
          ...record,
          title,
          path: record.path,
          normalizedTitle: normalizeSearchText(title),
          normalizedBody: normalizeSearchText(bodyText).slice(0, 28000)
        };
        break;
      } catch (error) {
        console.warn('Nina public search skipped document.', candidate, error);
      }
    }

    if (!best) {
      const fallbackTitle =
        record.titles?.[currentLocale] ||
        record.titles?.en ||
        getLocalizedRouteTitle(getQuestionRoute(record.routeId)) ||
        '';
      best = {
        ...record,
        title: fallbackTitle,
        path: record.path,
        normalizedTitle: normalizeSearchText(fallbackTitle),
        normalizedBody: ''
      };
    }

    publicDocumentCache.set(cacheKey, best);
    return best;
  }

  function scorePublicDocument(question, record) {
    const normalizedQuestion = normalizeSearchText(question);
    const terms = extractSearchTerms(question);
    if (!normalizedQuestion || !terms.length) return 0;

    let score = 0;

    if (record.normalizedTitle && normalizedQuestion.includes(record.normalizedTitle)) score += 12;
    if (record.normalizedBody && normalizedQuestion.includes(record.normalizedBody.slice(0, 80))) score += 2;

    for (const term of terms) {
      if (record.normalizedTitle.includes(term)) score += 7;
      if (record.normalizedBody.includes(term)) score += 2;
      if (record.path.includes(term)) score += 1;
    }

    return score;
  }

  async function searchPublicDocuments(question) {
    const records = await Promise.all(getPublicSearchDocuments().map(fetchPublicDocument));
    const ranked = records
      .map(record => ({ record, score: scorePublicDocument(question, record) }))
      .sort((left, right) => right.score - left.score);

    if (!ranked.length || ranked[0].score < 4) return null;
    return ranked[0].record;
  }

  function isHomePage() {
    return currentEnglishPath === HOME_PATH;
  }

  function getCurrentStepKey() {
    if (state.submitted) return 'submitted';
    if (!state.serviceId) return 'service';
    return 'contact';
  }

  function getTypingDelay(character) {
    if (/[,.!?]/.test(character)) return 190;
    if (character === ' ') return 42;
    return 34;
  }

  function clearTyping(kind) {
    window.clearTimeout(typingTimers[kind]);
    typingTimers[kind] = 0;
  }

  function startTyping(kind, target, fullText, initialDelay = 220) {
    clearTyping(kind);
    if (!target) return;

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      target.textContent = fullText;
      target.classList.remove('is-typing');
      return;
    }

    let index = 0;
    target.textContent = '';
    target.classList.add('is-typing');

    const step = () => {
      index += 1;
      target.textContent = fullText.slice(0, index);

      if (index >= fullText.length) {
        target.classList.remove('is-typing');
        return;
      }

      typingTimers[kind] = window.setTimeout(step, getTypingDelay(fullText.charAt(index - 1)));
    };

    typingTimers[kind] = window.setTimeout(step, initialDelay);
  }

  function clearTeaserTimers() {
    clearTyping('teaser');
  }

  function updateTeaserState() {
    if (!root || !teaserButton || !teaserText) return;

    const shouldShow = uiState.teaserVisible && !uiState.open;
    root.classList.toggle('nina-chatbot--teaser', shouldShow);
    teaserButton.hidden = !shouldShow;
    teaserButton.setAttribute('aria-hidden', String(!shouldShow));
    teaserButton.tabIndex = shouldShow ? 0 : -1;

    if (!shouldShow) {
      teaserText.textContent = '';
      teaserText.classList.remove('is-typing');
    }
  }

  function hideTeaser() {
    clearTeaserTimers();
    uiState.teaserVisible = false;
    updateTeaserState();
  }

  function showTeaser() {
    hideTeaser();
  }

  function detectQuestionRoute(question) {
    const text = normalizeSearchText(question);
    if (!text) return getQuestionRoute('services');

    if (
      hasKeyword(text, [
        'document',
        'documents',
        'paper',
        'papers',
        'apostille',
        'apostilled',
        'translation',
        'translate',
        'criminal record',
        'police record',
        'birth certificate',
        'marriage certificate',
        'requirements',
        'required'
      ])
    ) {
      return getQuestionRoute('documents');
    }

    if (hasKeyword(text, ['citizenship', 'citizen', 'naturalization', 'naturalisation', 'nationality', 'passport'])) {
      return getQuestionRoute('citizenship');
    }

    if (
      hasKeyword(text, [
        'residency',
        'residence',
        'resident',
        'permanent residence',
        'temporary residence',
        'mercosur',
        'family reunion',
        'retiree',
        'digital nomad residence'
      ])
    ) {
      return getQuestionRoute('residency');
    }

    if (
      hasKeyword(text, [
        'visa',
        'tourist',
        'student visa',
        'work visa',
        'business visa',
        'digital nomad visa',
        'transit visa'
      ])
    ) {
      return getQuestionRoute('visa');
    }

    if (
      hasKeyword(text, [
        'family',
        'divorce',
        'marriage',
        'custody',
        'child support',
        'adoption',
        'domestic violence'
      ])
    ) {
      return getQuestionRoute('family');
    }

    if (
      hasKeyword(text, [
        'human rights',
        'refugee',
        'asylum',
        'abuse',
        'violence',
        'discrimination',
        'trafficking'
      ])
    ) {
      return getQuestionRoute('humanRights');
    }

    if (
      hasKeyword(text, [
        'civil',
        'contract',
        'notary',
        'notarization',
        'notarisation',
        'power of attorney',
        'property',
        'lease',
        'cnpj',
        'company'
      ])
    ) {
      return getQuestionRoute('civil');
    }

    if (
      hasKeyword(text, [
        'abroad',
        'outside brazil',
        'outside brasil',
        'portugal',
        'ireland',
        'spain',
        'uk',
        'canada',
        'usa',
        'united states'
      ])
    ) {
      return getQuestionRoute('immigrateAbroad');
    }

    if (hasKeyword(text, ['move to brazil', 'immigrate to brazil', 'live in brazil', 'brazil', 'brasil'])) {
      return getQuestionRoute('immigrateToBrazil');
    }

    if (hasKeyword(text, ['how much', 'price', 'cost', 'fee', 'fees', 'how long', 'faq', 'question'])) {
      return getQuestionRoute('faq');
    }

    if (hasKeyword(text, ['contact', 'whatsapp', 'lawyer', 'attorney', 'human', 'speak', 'talk', 'call', 'team'])) {
      return getQuestionRoute('contact');
    }

    return getQuestionRoute('services');
  }

  function buildAvatarSvg() {
    return `
      <svg class="nina-chatbot__avatar-svg" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ninaHalo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0b8f53"></stop>
            <stop offset="50%" stop-color="#f1cb49"></stop>
            <stop offset="100%" stop-color="#11804f"></stop>
          </linearGradient>
          <linearGradient id="ninaMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f3f3f8"></stop>
            <stop offset="100%" stop-color="#8f97aa"></stop>
          </linearGradient>
          <linearGradient id="ninaFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f6d792"></stop>
            <stop offset="100%" stop-color="#b68a3d"></stop>
          </linearGradient>
          <linearGradient id="ninaFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d0a07b"></stop>
            <stop offset="100%" stop-color="#b68061"></stop>
          </linearGradient>
          <linearGradient id="ninaBrazil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f6d248"></stop>
            <stop offset="100%" stop-color="#d5af2d"></stop>
          </linearGradient>
          <linearGradient id="ninaVisor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#102736"></stop>
            <stop offset="100%" stop-color="#1f465d"></stop>
          </linearGradient>
        </defs>
        <circle class="nina-chatbot__avatar-halo" cx="80" cy="80" r="73" fill="url(#ninaHalo)"></circle>
        <circle cx="80" cy="82" r="63" fill="rgba(18, 24, 30, 0.9)"></circle>
        <circle class="nina-chatbot__avatar-orbit" cx="124" cy="44" r="7" fill="#f4d857"></circle>
        <circle class="nina-chatbot__avatar-orbit nina-chatbot__avatar-orbit--small" cx="39" cy="116" r="5" fill="#24d486"></circle>
        <rect x="72" y="12" width="16" height="18" rx="8" fill="#96a3b2"></rect>
        <path d="M80 12v-8" fill="none" stroke="#96a3b2" stroke-linecap="round" stroke-width="6"></path>
        <circle class="nina-chatbot__avatar-spark" cx="80" cy="4" r="5.5" fill="#58ffd3"></circle>
        <path d="M50 40c8-11 18-16 30-16 12 0 22 5 30 16l-6 10c-7-8-15-12-24-12s-17 4-24 12z" fill="#f5d665"></path>
        <path d="M44 52c4-9 10-14 16-14 4 0 6 3 6 7 0 8-4 15-10 20l-12-3z" fill="#d4b355"></path>
        <path d="M116 52c-4-9-10-14-16-14-4 0-6 3-6 7 0 8 4 15 10 20l12-3z" fill="#d4b355"></path>
        <circle cx="49" cy="79" r="8" fill="#adb6c4"></circle>
        <circle cx="111" cy="79" r="8" fill="#adb6c4"></circle>
        <circle cx="49" cy="79" r="4.2" fill="#f6d248"></circle>
        <circle cx="111" cy="79" r="4.2" fill="#f6d248"></circle>
        <rect x="48" y="36" width="64" height="74" rx="26" fill="url(#ninaMetal)"></rect>
        <path d="M58 43c8-8 15-11 22-11 12 0 22 5 29 15l-5 6c-6-7-14-11-24-11-9 0-16 3-23 10z" fill="#ffffff" opacity="0.36"></path>
        <rect x="54" y="48" width="52" height="30" rx="15" fill="url(#ninaVisor)" stroke="url(#ninaFrame)" stroke-width="3"></rect>
        <path d="M61 54l6-5" fill="none" stroke="#f6d792" stroke-linecap="round" stroke-width="3"></path>
        <path d="M69 55l5-4" fill="none" stroke="#f6d792" stroke-linecap="round" stroke-width="3"></path>
        <path d="M93 55l5-4" fill="none" stroke="#f6d792" stroke-linecap="round" stroke-width="3"></path>
        <path d="M101 54l6-5" fill="none" stroke="#f6d792" stroke-linecap="round" stroke-width="3"></path>
        <rect class="nina-chatbot__avatar-eye" x="63" y="58" width="10" height="6" rx="3" fill="#68ffd7"></rect>
        <rect class="nina-chatbot__avatar-eye" x="87" y="58" width="10" height="6" rx="3" fill="#68ffd7"></rect>
        <rect x="76" y="59" width="8" height="4" rx="2" fill="#b7dbff"></rect>
        <circle cx="60" cy="83" r="4" fill="#f3a4b9"></circle>
        <circle cx="100" cy="83" r="4" fill="#f3a4b9"></circle>
        <path class="nina-chatbot__avatar-mouth" d="M66 86c5 7 23 7 28 0" fill="none" stroke="#5dfff1" stroke-linecap="round" stroke-width="4"></path>
        <rect x="58" y="97" width="44" height="10" rx="5" fill="#aab4c3"></rect>
        <path d="M45 112c8 16 20 26 35 26 15 0 27-10 35-26l-9-11H54z" fill="url(#ninaBrazil)"></path>
        <path d="M68 111h24v28H68z" fill="#168955"></path>
        <path d="M80 115l11 7-11 7-11-7z" fill="#1f67d2"></path>
        <circle cx="80" cy="122" r="4.2" fill="#f6db65"></circle>
        <path d="M53 51l-6 10" fill="none" stroke="#8e98a9" stroke-linecap="round" stroke-width="4"></path>
        <path d="M107 51l6 10" fill="none" stroke="#8e98a9" stroke-linecap="round" stroke-width="4"></path>
      </svg>
    `;
  }

  function createRoot() {
    if (document.getElementById('nina-chatbot-root')) {
      root = document.getElementById('nina-chatbot-root');
      document.body.appendChild(root);
      panel = root.querySelector('[data-nina-panel]');
      thread = root.querySelector('[data-nina-thread]');
      launcher = root.querySelector('[data-nina-launcher="main"]');
      enhanceLauncherMarkup();
      liveRegion = root.querySelector('[data-nina-live]');
      teaserButton = root.querySelector('[data-nina-teaser-button]');
      teaserText = root.querySelector('[data-nina-teaser]');
      return;
    }

    root = document.createElement('section');
    root.id = 'nina-chatbot-root';
    root.className = 'nina-chatbot';
    root.innerHTML = `
      <div class="nina-chatbot__dock">
        <aside class="nina-chatbot__panel" data-nina-panel role="dialog" aria-modal="false" aria-labelledby="nina-chatbot-title" hidden aria-hidden="true">
          <div class="nina-chatbot__panel-shell">
            <header class="nina-chatbot__header">
              <div class="nina-chatbot__brand">
                <div class="nina-chatbot__avatar" aria-hidden="true">${buildAvatarSvg()}</div>
                <div>
                  <p class="nina-chatbot__eyebrow">Chat</p>
                  <h2 class="nina-chatbot__title" id="nina-chatbot-title">Nina</h2>
                  <p class="nina-chatbot__subtitle" data-nina-panel-subtitle></p>
                </div>
              </div>
              <div class="nina-chatbot__header-actions">
                <button class="nina-chatbot__icon-button" type="button" data-nina-action="restart">
                  <span class="visually-hidden" data-nina-restart-label></span>
                  <i class="fas fa-rotate-right" aria-hidden="true"></i>
                </button>
                <button class="nina-chatbot__icon-button" type="button" data-nina-action="close">
                  <span class="visually-hidden" data-nina-close-label></span>
                  <i class="fas fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
            </header>
            <div class="nina-chatbot__thread" data-nina-thread></div>
          </div>
        </aside>
        <button class="nina-chatbot__launcher" type="button" data-nina-launcher="main">
          <span class="nina-chatbot__launcher-ping" aria-hidden="true"></span>
          <span class="nina-chatbot__launcher-avatar" aria-hidden="true">${buildAvatarSvg()}</span>
          <span class="nina-chatbot__launcher-badge" aria-hidden="true"><i class="fas fa-comment-dots"></i></span>
        </button>
        <p class="nina-chatbot__live visually-hidden" data-nina-live aria-live="polite"></p>
      </div>
    `;

    document.body.appendChild(root);

    panel = root.querySelector('[data-nina-panel]');
    thread = root.querySelector('[data-nina-thread]');
    launcher = root.querySelector('[data-nina-launcher="main"]');
    enhanceLauncherMarkup();
    liveRegion = root.querySelector('[data-nina-live]');
    teaserButton = root.querySelector('[data-nina-teaser-button]');
    teaserText = root.querySelector('[data-nina-teaser]');
  }

  function enhanceLauncherMarkup() {
    if (!launcher) return;

    launcher.innerHTML = `
      <span class="nina-chatbot__launcher-ping" aria-hidden="true"></span>
      <span class="nina-chatbot__launcher-shell">
        <span class="nina-chatbot__launcher-copy">
          <span class="nina-chatbot__launcher-eyebrow" data-nina-launcher-eyebrow></span>
          <span class="nina-chatbot__launcher-title" data-nina-launcher-title></span>
        </span>
        <span class="nina-chatbot__launcher-avatar" aria-hidden="true">${buildAvatarSvg()}</span>
      </span>
      <span class="nina-chatbot__launcher-badge" aria-hidden="true"><i class="fas fa-comment-dots"></i></span>
    `;
  }

  function renderQuickReplies(options, currentId, action) {
    return `
      <div class="nina-chatbot__quick-replies" role="group">
        ${options
          .map(option => {
            const isActive = currentId === option.id;
            return `
              <button
                class="nina-chatbot__reply${isActive ? ' is-active' : ''}"
                type="button"
                data-nina-action="${escapeHtml(action)}"
                data-nina-value="${escapeHtml(option.id)}"
              >
                ${escapeHtml(getLocalizedLabel(option))}
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  }

  function renderBubble(content, modifier = 'bot') {
    return `<article class="nina-chatbot__bubble nina-chatbot__bubble--${modifier}">${content}</article>`;
  }

  function renderAskForm(copy) {
    return `
      <form class="nina-chatbot__ask" data-nina-form="question" novalidate>
        <label class="visually-hidden" for="nina-chatbot-question">${escapeHtml(copy.askAria)}</label>
        <input
          id="nina-chatbot-question"
          class="nina-chatbot__ask-input"
          type="text"
          name="question"
          maxlength="220"
          autocomplete="off"
          placeholder="${escapeHtml(copy.askPlaceholder)}"
          value="${escapeHtml(uiState.questionDraft)}"
        />
        <button class="nina-chatbot__ask-submit" type="submit" aria-label="${escapeHtml(copy.askAria)}">
          <i class="fas fa-paper-plane" aria-hidden="true"></i>
        </button>
      </form>
    `;
  }

  function renderRouteHistory(copy) {
    return uiState.routeHistory
      .map(entry => {
        const route = getQuestionRoute(entry.routeId || inferRouteIdFromPath(entry.path));
        const reply = `${copy.routeLead} ${entry.title || getLocalizedRouteTitle(route)}`;
        const targetPath = entry.path || route.path;
        const buttons = [
          `<a class="btn btn-outline-gold rounded-pill px-4" href="${escapeHtml(entry.targetPath || resolvePublicPath({ path: targetPath }))}">${escapeHtml(copy.openPage)}</a>`,
          `<a class="btn btn-success rounded-pill px-4" href="${escapeHtml(buildWhatsappUrl(copy))}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.whatsapp)}</a>`
        ].join('');

        return `
          ${renderBubble(`<p class="nina-chatbot__message">${escapeHtml(entry.question)}</p>`, 'user')}
          ${renderBubble(`<p class="nina-chatbot__message">${escapeHtml(reply)}</p>`)}
          <div class="nina-chatbot__cta-row">${buttons}</div>
        `;
      })
      .join('');
  }

  function renderContactForm(copy) {
    const otherSelected = state.serviceId === 'other';
    return `
      <form class="nina-chatbot__form" data-nina-form="lead" novalidate>
        ${
          otherSelected
            ? `
        <label class="nina-chatbot__field">
          <span class="visually-hidden">${escapeHtml(copy.otherServiceLabel)}</span>
          <input
            type="text"
            name="custom_service"
            maxlength="140"
            ${otherSelected ? 'required' : ''}
            placeholder="${escapeHtml(copy.otherServicePlaceholder)}"
            value="${escapeHtml(state.customService)}"
          />
        </label>
        `
            : ''
        }
        <label class="nina-chatbot__field">
          <span class="visually-hidden">${escapeHtml(copy.emailLabel)}</span>
          <input
            type="email"
            name="email"
            autocomplete="email"
            required
            placeholder="${escapeHtml(copy.emailPlaceholder)}"
            value="${escapeHtml(state.email)}"
          />
        </label>
        <label class="nina-chatbot__field">
          <span class="visually-hidden">${escapeHtml(copy.messageLabel)}</span>
          <textarea
            name="message"
            rows="3"
            maxlength="1200"
            placeholder="${escapeHtml(`${copy.messageLabel} (${copy.messagePlaceholder})`)}"
          >${escapeHtml(state.message)}</textarea>
        </label>
        <input class="nina-chatbot__honeypot" type="text" name="company" tabindex="-1" autocomplete="off" />
        <div class="nina-chatbot__form-actions">
          <button class="btn btn-gold nina-chatbot__submit" type="submit"${uiState.submitting ? ' disabled' : ''}>
            ${escapeHtml(uiState.submitting ? copy.submitting : copy.submit)}
          </button>
        </div>
      </form>
    `;
  }

  function buildWhatsappUrl(copy) {
    const serviceOption = getServiceOption(state.serviceId);
    const lines = [copy.whatsappIntro];
    const customService = state.customService.trim();
    const serviceLabel = serviceOption ? getLocalizedLabel(serviceOption) : '';

    if (state.email.trim()) lines.push(`${copy.labels.email}: ${state.email.trim()}`);
    lines.push(`${copy.labels.language}: ${getLocaleLabel(currentLocale)}`);
    if (serviceOption) {
      lines.push(
        `${copy.labels.service}: ${state.serviceId === 'other' && customService ? `${serviceLabel} - ${customService}` : serviceLabel}`
      );
    }
    if (state.question.trim()) lines.push(`${copy.labels.question}: ${state.question.trim()}`);
    if (state.message.trim()) lines.push(`${copy.labels.message}: ${state.message.trim()}`);

    lines.push(`${copy.labels.page}: ${window.location.href}`);
    return `${WHATSAPP_BASE}${encodeURIComponent(lines.join('\n'))}`;
  }

  function renderThread() {
    if (!thread) return;

    const copy = getCopy();
    const serviceOption = getServiceOption(state.serviceId);
    const introMarkup = !state.serviceId
      ? `<span class="nina-chatbot__typing" data-nina-typing="${escapeHtml(copy.intro)}"></span>`
      : escapeHtml(copy.intro);

    let markup = '';
    markup += renderBubble(`<p class="nina-chatbot__message">${introMarkup}</p>`);
    if (!state.submitted) markup += renderAskForm(copy);
    if (uiState.routeHistory.length) markup += renderRouteHistory(copy);
    markup += serviceOption
      ? renderBubble(`<p class="nina-chatbot__message">${escapeHtml(getLocalizedLabel(serviceOption))}</p>`, 'user')
      : renderQuickReplies(SERVICE_OPTIONS, state.serviceId, 'set-service');

    if (serviceOption && !state.submitted) {
      markup += renderContactForm(copy);
    }

    if (uiState.error) {
      markup += renderBubble(`<p class="nina-chatbot__message">${escapeHtml(copy.error)}</p>`);
      markup += `
        <div class="nina-chatbot__cta-row">
          <a class="btn btn-success rounded-pill px-4" href="${escapeHtml(buildWhatsappUrl(copy))}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(copy.whatsapp)}
          </a>
        </div>
      `;
    }

    if (state.submitted) {
      markup += renderBubble(
        `
          <p class="nina-chatbot__message">${escapeHtml(copy.thankYou)}</p>
          <p class="nina-chatbot__message nina-chatbot__message--muted">${escapeHtml(copy.thankYouNote)}</p>
        `
      );
      markup += `
        <div class="nina-chatbot__cta-row">
          <a class="btn btn-success rounded-pill px-4" href="${escapeHtml(buildWhatsappUrl(copy))}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(copy.whatsapp)}
          </a>
          <button class="btn btn-outline-gold rounded-pill px-4" type="button" data-nina-action="finish">
            ${escapeHtml(copy.finish)}
          </button>
        </div>
      `;
    }

    thread.innerHTML = markup;
    updateStaticLabels(copy);
    updateOpenState();
    initializeTypingAnimation();

    const previousStep = uiState.lastStepKey;
    const nextStep = getCurrentStepKey();
    uiState.lastStepKey = nextStep;

    window.requestAnimationFrame(() => {
      if (!thread) return;
      const behavior = previousStep && previousStep !== nextStep ? 'smooth' : 'auto';
      thread.scrollTo({ top: thread.scrollHeight, behavior });
    });
  }

  function updateStaticLabels(copy) {
    const launcherEyebrows = root.querySelectorAll('[data-nina-launcher-eyebrow]');
    const launcherTitles = root.querySelectorAll('[data-nina-launcher-title]');
    const panelSubtitle = root.querySelector('[data-nina-panel-subtitle]') || root.querySelector('.nina-chatbot__subtitle');
    const restartLabel = root.querySelector('[data-nina-restart-label]');
    const closeLabel = root.querySelector('[data-nina-close-label]');

    launcherEyebrows.forEach((node) => {
      node.textContent = copy.launcherEyebrow || 'Nina';
    });
    launcherTitles.forEach((node) => {
      node.textContent = copy.launcherTitle;
    });
    if (panelSubtitle) panelSubtitle.textContent = copy.panelSubtitle || copy.launcherTitle;
    if (restartLabel) restartLabel.textContent = copy.restartAria;
    if (closeLabel) closeLabel.textContent = copy.closeAria;

    if (launcher) {
      launcher.setAttribute('aria-label', uiState.open ? copy.minimizeAria : copy.openAria);
      launcher.setAttribute('aria-expanded', String(uiState.open));
    }

    if (teaserButton) teaserButton.setAttribute('aria-label', copy.openAria);
  }

  function updateOpenState() {
    if (!root || !panel || !launcher) return;

    root.classList.toggle('nina-chatbot--open', uiState.open);
    panel.setAttribute('aria-hidden', String(!uiState.open));
    panel.hidden = !uiState.open;
    document.body.classList.toggle('nina-chatbot-open', uiState.open);
    document.body.classList.add('has-nina-chatbot');
    updateTeaserState();
  }

  function announce(message) {
    if (liveRegion) liveRegion.textContent = message;
  }

  function initializeTypingAnimation() {
    clearTyping('panel');

    if (!thread || !uiState.open) return;
    const target = thread.querySelector('[data-nina-typing]');
    if (!target) return;

    const fullText = target.getAttribute('data-nina-typing') || '';
    startTyping('panel', target, fullText, 240);
  }

  function openChat() {
    hideTeaser();
    uiState.open = true;
    updateOpenState();
    renderThread();
    focusPrimaryControl();
  }

  function closeChat({ suppressAuto = true } = {}) {
    clearTyping('panel');
    uiState.open = false;
    if (suppressAuto) {
      state.suppressAuto = true;
      persistState();
    }
    updateOpenState();
  }

  function focusPrimaryControl() {
    window.requestAnimationFrame(() => {
      if (!panel || !uiState.open) return;
      const firstInteractive = panel.querySelector(
        'input[name="question"], [data-nina-value], input[name="custom_service"], input[name="email"], textarea[name="message"], button[type="submit"], [data-nina-action="finish"]'
      );
      if (firstInteractive && typeof firstInteractive.focus === 'function') firstInteractive.focus();
    });
  }

  function handleQuickReply(action, value) {
    if (action === 'set-service') {
      state.serviceId = value;
      if (value !== 'other') state.customService = '';
      state.submitted = false;
      state.submittedAt = '';
      uiState.error = '';
      persistState();
      openChat();
      return;
    }
  }

  function resetConversation() {
    const keptSuppress = state.suppressAuto;
    state = {
      ...DEFAULT_STATE,
      suppressAuto: keptSuppress
    };
    uiState.error = '';
    uiState.submitting = false;
    uiState.questionDraft = '';
    uiState.routeHistory = [];
    persistState();
  }

  async function submitLead(form) {
    if (!form) return;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    if (String(formData.get('company') || '').trim()) return;

    state.customService = String(formData.get('custom_service') || '').trim();
    state.email = String(formData.get('email') || '').trim();
    state.message = String(formData.get('message') || '').trim();
    persistState();

    const serviceOption = getServiceOption(state.serviceId);
    uiState.submitting = true;
    uiState.error = '';
    renderThread();
    const submittedAt = new Date().toISOString();
    const payload = new FormData();
    payload.set('source', 'Nina floating chatbot');
    payload.set('page_url', window.location.href);
    payload.set('page_title', document.title);
    payload.set('page_locale', currentLocale);
    payload.set('preferred_language', currentLocale);
    payload.set('preferred_language_display', getLocaleLabel(currentLocale));
    payload.set('selected_service', serviceOption ? serviceOption.value : '');
    payload.set(
      'selected_service_display',
      serviceOption
        ? state.serviceId === 'other' && state.customService
          ? `${getLocalizedLabel(serviceOption)} - ${state.customService}`
          : getLocalizedLabel(serviceOption)
        : ''
    );
    payload.set('custom_service', state.customService);
    payload.set('question', state.question);
    payload.set('email', state.email);
    payload.set('message', state.message);
    payload.set('_replyto', state.email);
    payload.set('submitted_at', submittedAt);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`Lead submission failed with status ${response.status}`);
      }

      state.submitted = true;
      state.submittedAt = submittedAt;
      state.suppressAuto = true;
      uiState.error = '';
      announce(getCopy().statusSent);
    } catch (error) {
      console.error('Nina chatbot lead submission failed.', error);
      uiState.error = getCopy().error;
      announce(getCopy().statusError);
    } finally {
      uiState.submitting = false;
      persistState();
      openChat();
    }
  }

  function scheduleAutoOpen() {
    return;
  }

  function handleClick(event) {
    const target = event.target.closest('[data-nina-action], [data-nina-launcher]');
    if (!target) return;

    if (target.hasAttribute('data-nina-launcher')) {
      if (uiState.open) {
        closeChat({ suppressAuto: true });
      } else {
        openChat();
      }
      return;
    }

    const action = target.getAttribute('data-nina-action');
    const value = target.getAttribute('data-nina-value') || '';

    if (action === 'close' || action === 'finish') {
      closeChat({ suppressAuto: true });
      return;
    }

    if (action === 'restart') {
      resetConversation();
      openChat();
      return;
    }

    if (action === 'set-service') {
      handleQuickReply(action, value);
    }
  }

  async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    if (form.getAttribute('data-nina-form') === 'question') {
      const formData = new FormData(form);
      const question = String(formData.get('question') || '').trim();
      if (!question) return;

      const match =
        (await searchPublicDocuments(question)) ||
        PUBLIC_SEARCH_DOCUMENTS.find(record => record.routeId === detectQuestionRoute(question).id) ||
        PUBLIC_SEARCH_DOCUMENTS[0];
      const routeId = match.routeId || inferRouteIdFromPath(match.path);
      const route = getQuestionRoute(routeId);
      state.question = question;
      uiState.questionDraft = '';
      uiState.routeHistory = [
        ...uiState.routeHistory.slice(-2),
        {
          question,
          routeId,
          path: match.path,
          targetPath: resolvePublicPath(match),
          title:
            match.title ||
            match.titles?.[currentLocale] ||
            match.titles?.en ||
            getLocalizedRouteTitle(route)
        }
      ];

      if (route.serviceId && !state.serviceId) {
        state.serviceId = route.serviceId;
        if (route.serviceId !== 'other') state.customService = '';
      }

      uiState.error = '';
      persistState();
      openChat();
      return;
    }

    if (form.getAttribute('data-nina-form') === 'lead') {
      await submitLead(form);
    }
  }

  function handleInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

    if (target.name === 'question') uiState.questionDraft = target.value;
    if (target.name === 'custom_service') state.customService = target.value;
    if (target.name === 'email') state.email = target.value;
    if (target.name === 'message') state.message = target.value;
    uiState.error = '';
    persistState();
  }

  function handleScroll() {
    return;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && uiState.open) {
      closeChat({ suppressAuto: true });
    }
  }

  function bindEvents() {
    if (!root || eventsBound) return;
    root.addEventListener('click', handleClick);
    root.addEventListener('submit', handleSubmit);
    root.addEventListener('input', handleInput);
    document.addEventListener('keydown', handleKeydown);
    eventsBound = true;
  }

  function init(config = {}) {
    currentLocale = detectPreferredLocale(config.locale);
    currentEnglishPath = typeof config.englishPath === 'string' && config.englishPath ? config.englishPath : HOME_PATH;
    state = loadState();
    uiState = {
      open: false,
      submitting: false,
      error: '',
      lastStepKey: getCurrentStepKey(),
      questionDraft: state.question || '',
      routeHistory: [],
      teaserVisible: false,
      teaserShown: false
    };
    publicDocumentCache = new Map();

    createRoot();
    bindEvents();
    renderThread();
    scheduleAutoOpen();
  }

  window.MoniqueNinaChatbot = { init };
})();
