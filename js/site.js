(function () {
  /* ==========================================================================
   * 01. Shared Site Runtime
   * These behaviors may run more than once after runtime partial injection, so
   * the module keeps its own observer/listener state and idempotent bindings.
   * ========================================================================== */
  const consentKey = "itb-consent";
  const attributionSessionKey = "itb-attribution";
  const emailCaptureEndpoint = "https://formspree.io/f/xdawygld";
  const exitIntentSessionKey = "itb-insights-exit-intent-seen";
  const scrollDepthMilestones = [25, 50, 75, 90];
  let analyticsBootstrapped = false;
  let analyticsConfigured = false;
  let pageViewTracked = false;
  let trackedScrollMilestones = new Set();
  let stickyObserver = null;
  let scrollBound = false;
  let escapeBound = false;
  let outsideClickBound = false;
  let resizeFallbackBound = false;
  let revealObserver = null;
  let insightsLeadArmTimer = null;
  let insightsLeadArmed = false;
  let insightsLeadMouseBound = false;
  let insightsLeadDelegateBound = false;
  let insightsLeadFocusRestore = null;

  /* ==========================================================================
   * 02. Page Map Assets
   * Localized copy and inline SVGs for the sticky page map module.
   * ========================================================================== */
  const pageMapLocale = {
    en: {
      title: "Quick navigation",
      strap: "Move directly to the question that matters."
    },
    pt: {
      title: "Navegacao rapida",
      strap: "Dirija-se diretamente a pergunta que importa."
    }
  };
  const pageMapArrowIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.2 5.3 6 6-6 6-1.4-1.4 3.6-3.6H4v-2h11.4l-3.6-3.6 1.4-1.4Z" fill="currentColor"/></svg>';
  const pageMapCompassIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"/></svg>';
  const iconLibrary = {
    archive:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v3H5V5Zm1 5h12v9H6v-9Zm3 2v2h6v-2H9Zm0 4v1h4v-1H9Z" fill="currentColor"/></svg>',
    award:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 9.7 6.6 4.6 7.3l3.7 3.6-.9 5.1L12 13.8l4.6 2.2-.9-5.1 3.7-3.6-5.1-.7L12 2Zm-2 16h4l2 4H8l2-4Z" fill="currentColor"/></svg>',
    balance:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v2h4.1l2.4 4.2A2.8 2.8 0 0 1 17 13h-4v7h3v2H8v-2h3v-7H7a2.8 2.8 0 0 1-2.5-3.8L6.9 5H11V3Zm-3.2 4-1.4 2.5c-.3.5.1 1.2.7 1.2h3.8L9.5 7H7.8Zm6.7 0 1.4 3.7h3.8c.6 0 1-.7.7-1.2L19 7h-4.5Z" fill="currentColor"/></svg>',
    book:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5a2.5 2.5 0 0 0-2.5-2.5H5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5V15h10.5c.53 0 1.04.13 1.5.36V4H7.5Zm-2.5 15h12.5c1.38 0 2.5 1.12 2.5 2.5H7.5A2.5 2.5 0 0 1 5 19Z" fill="currentColor"/></svg>',
    chat:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.3 3.22A1 1 0 0 1 4 17.42V5.5Zm4 3.5a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Zm0-3a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H8Z" fill="currentColor"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.55 18.2 4.8 13.45l1.41-1.41 3.34 3.33 8.24-8.24 1.41 1.42-9.65 9.65Z" fill="currentColor"/></svg>',
    city:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l5-2v14H4Zm7 0V4l7 3v13h-7Zm2-11v2h2V9h-2Zm0 4v2h2v-2h-2ZM6 10v2h1v-2H6Zm0 4v2h1v-2H6Z" fill="currentColor"/></svg>',
    coin:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4.42 0 8 1.79 8 4s-3.58 4-8 4-8-1.79-8-4 3.58-4 8-4Zm-8 6v4c0 2.21 3.58 4 8 4s8-1.79 8-4V9c-1.74 1.34-4.71 2-8 2s-6.26-.66-8-2Zm0 6v2c0 2.21 3.58 4 8 4s8-1.79 8-4v-2c-1.74 1.34-4.71 2-8 2s-6.26-.66-8-2Z" fill="currentColor"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2V2Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM5 8h14V6H5v2Zm3 4h3v3H8v-3Z" fill="currentColor"/></svg>',
    compass: pageMapCompassIcon,
    document:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7V3Zm2 2v14h8V9h-4V5H9Zm2 7h4v2h-4v-2Zm0 4h4v2h-4v-2Zm0-8h1v2h-1V8Z" fill="currentColor"/></svg>',
    family:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm8 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 10c-2.76 0-5 1.57-5 3.5V17h10v-3.5C13 11.57 10.76 10 8 10Zm8 1c-1.08 0-2.05.28-2.79.74.67.73 1.08 1.66 1.08 2.76V17H21v-2c0-2.21-2.24-4-5-4Z" fill="currentColor"/></svg>',
    globe:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.12a15.7 15.7 0 0 0-1.19-4.17A8.02 8.02 0 0 1 18.93 11ZM12 4.07c.78 1.01 1.67 3.02 1.94 5.93h-3.88C10.33 7.09 11.22 5.08 12 4.07ZM9.38 6.83A15.7 15.7 0 0 0 8.19 11H5.07a8.02 8.02 0 0 1 4.31-4.17ZM5.07 13h3.12c.16 1.5.57 2.95 1.19 4.17A8.02 8.02 0 0 1 5.07 13Zm6.93 6.93c-.78-1.01-1.67-3.02-1.94-5.93h3.88c-.27 2.91-1.16 4.92-1.94 5.93Zm2.62-2.76c.62-1.22 1.03-2.67 1.19-4.17h3.12a8.02 8.02 0 0 1-4.31 4.17Z" fill="currentColor"/></svg>',
    guide:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5a1 1 0 1 0-2 0v5c0 .27.1.52.29.71l3 3a1 1 0 1 0 1.42-1.42L13 11.59V7Z" fill="currentColor"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-7-10.1C5 7.5 7.1 5 9.9 5c1.4 0 2.5.6 3.1 1.6C13.6 5.6 14.7 5 16.1 5 18.9 5 21 7.5 21 10.9 21 16.6 14 21 14 21h-2Z" fill="currentColor"/></svg>',
    home:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 6v11h-5v-6H9v6H4V9l8-6Z" fill="currentColor"/></svg>',
    link:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-2.1 2.1-1.4-1.4 2.1-2.1a1 1 0 1 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l2.1-2.1 1.4 1.4-2.1 2.1a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z" fill="currentColor"/></svg>',
    map:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.2 9 3 3 5.2v15.6L9 18l6 2.8 6-2.2V3L15 5.2Zm-8 .7 2-.7v10.9l-2 .7V5.9Zm8 12.9-4-1.9V6.1l4 1.9v10.8Zm2-.3V7.2l2-.7v11.3l-2 .7Z" fill="currentColor"/></svg>',
    news:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12a2 2 0 0 1 2 2v10a4 4 0 0 0 .25 1.4A3 3 0 0 1 17 20H7a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2Zm2 3v2h8V7H7Zm0 4v2h8v-2H7Zm0 4v2h5v-2H7Z" fill="currentColor"/></svg>',
    passport:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h8a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 2v14h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H8Zm4 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM9 15c.84-1 1.93-1.5 3-1.5S14.16 14 15 15v1H9v-1Z" fill="currentColor"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5.25 3.44 10.03 8 11 4.56-.97 8-5.75 8-11V5l-8-3Zm3.78 7.72-4.5 4.5a1 1 0 0 1-1.42 0l-1.64-1.64a1 1 0 1 1 1.42-1.42l.93.93 3.79-3.8a1 1 0 0 1 1.42 1.43Z" fill="currentColor"/></svg>',
    star:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.46 6.03.88-4.36 4.24 1.03 5.98L12 16.7l-5.4 2.84 1.03-5.98L3.27 9.34l6.03-.88L12 3Z" fill="currentColor"/></svg>',
    user:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4.4 0 8 2.2 8 4.8V21H4v-3.2C4 15.2 7.6 13 12 13Z" fill="currentColor"/></svg>',
    workflow:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h5v4H5V5Zm9 0h5v4h-5V5Zm-4 5h4v4h-4v-4Zm-5 5h5v4H5v-4Zm9 0h5v4h-5v-4Zm-7-4h10v2H7v-2Zm4-4h2v3h-2V7Zm0 7h2v3h-2v-3Z" fill="currentColor"/></svg>'
  };
  const iconTones = {
    archive: { background: "rgba(125, 89, 58, 0.24)", color: "#f2d7b0" },
    award: { background: "rgba(176, 132, 61, 0.2)", color: "#f3d37d" },
    balance: { background: "rgba(120, 79, 62, 0.22)", color: "#f0c6a1" },
    book: { background: "rgba(98, 74, 46, 0.2)", color: "#f1d6a6" },
    chat: { background: "rgba(46, 102, 95, 0.24)", color: "#9fe0d4" },
    check: { background: "rgba(59, 107, 86, 0.24)", color: "#a6e5bf" },
    city: { background: "rgba(75, 93, 135, 0.24)", color: "#c3d4ff" },
    coin: { background: "rgba(133, 97, 40, 0.24)", color: "#ffd47d" },
    calendar: { background: "rgba(101, 83, 131, 0.24)", color: "#d8c5ff" },
    compass: { background: "rgba(67, 97, 132, 0.24)", color: "#bcd8ff" },
    document: { background: "rgba(114, 93, 69, 0.24)", color: "#efd8bb" },
    family: { background: "rgba(117, 73, 95, 0.24)", color: "#f3bfd7" },
    globe: { background: "rgba(42, 102, 95, 0.24)", color: "#99e0d1" },
    guide: { background: "rgba(58, 78, 120, 0.24)", color: "#bad0ff" },
    heart: { background: "rgba(125, 58, 81, 0.24)", color: "#ffbfd1" },
    home: { background: "rgba(91, 82, 66, 0.24)", color: "#f3d9b5" },
    link: { background: "rgba(63, 87, 126, 0.24)", color: "#bfd5ff" },
    map: { background: "rgba(47, 92, 72, 0.24)", color: "#aee2c2" },
    news: { background: "rgba(110, 80, 54, 0.24)", color: "#f1cf9c" },
    passport: { background: "rgba(62, 81, 136, 0.24)", color: "#bfd0ff" },
    shield: { background: "rgba(100, 75, 119, 0.24)", color: "#d6c0ff" },
    star: { background: "rgba(135, 98, 48, 0.24)", color: "#ffd67e" },
    user: { background: "rgba(97, 69, 84, 0.24)", color: "#f4c8d8" },
    workflow: { background: "rgba(63, 95, 126, 0.24)", color: "#bcd8ff" }
  };
  const iconCycle = [
    "compass",
    "balance",
    "document",
    "chat",
    "passport",
    "shield",
    "map",
    "globe",
    "coin",
    "award",
    "guide",
    "calendar",
    "workflow",
    "family",
    "home",
    "city",
    "archive",
    "news",
    "heart",
    "user",
    "link",
    "book",
    "star",
    "check"
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  const iconAlternatives = {
    archive: ["document", "calendar", "link", "book"],
    award: ["star", "check", "user"],
    balance: ["shield", "document", "guide", "award"],
    book: ["guide", "document", "news", "archive"],
    calendar: ["guide", "archive", "document", "news"],
    chat: ["globe", "user", "guide", "workflow"],
    check: ["shield", "award", "document", "workflow"],
    city: ["map", "globe", "home"],
    coin: ["award", "document", "guide"],
    compass: ["guide", "map", "globe", "workflow"],
    document: ["workflow", "book", "archive", "link"],
    family: ["heart", "user", "home"],
    globe: ["map", "link", "guide", "home"],
    guide: ["calendar", "workflow", "compass", "book"],
    heart: ["family", "chat", "globe"],
    home: ["map", "family", "globe"],
    link: ["document", "guide", "globe", "map"],
    map: ["globe", "city", "compass", "home"],
    news: ["book", "archive", "document"],
    passport: ["compass", "document", "globe", "guide"],
    shield: ["balance", "check", "award", "document"],
    star: ["award", "heart", "guide"],
    user: ["chat", "family", "award"],
    workflow: ["document", "guide", "compass", "link"]
  };
  const insightsLeadLocale = {
    en: {
      inlineEyebrow: "Private email briefing",
      inlineTitle: "Get updates by email without the noise",
      inlineSummary:
        "Attorney-led Brazil immigration insights, major legal updates, and calmer next-step notes for people seriously considering Brazil.",
      inlineChips: ["Email updates", "Attorney-led", "Premium guidance"],
      inlinePoints: [
        "Useful updates when rules, routes, or planning conditions actually matter.",
        "A calmer email stream for readers comparing visas, residency, naturalisation, and relocation.",
        "A direct handoff to Nina whenever you want faster route guidance before booking."
      ],
      cards: [
        {
          icon: "news",
          title: "What arrives",
          body: "Clear legal updates, better reading paths, and practical signals when a Brazil move gets more real."
        },
        {
          icon: "chat",
          title: "Need an answer sooner?",
          body: "Nina can point you toward the best route family or page before you leave the site."
        }
      ],
      modalEyebrow: "Before you go",
      modalTitle: "Take the Brazil move brief with you",
      modalSummary:
        "Leave with one better next step: get the premium email briefing or ask Nina what route to explore first.",
      modalChips: ["Brazil brief", "Nina concierge", "No spam flood"],
      modalPoints: [
        "Useful Brazil updates instead of generic marketing blasts.",
        "Better orientation around visas, residency, citizenship, and relocation.",
        "A faster path into Nina if you want live guidance right now."
      ],
      modalDismiss: "Continue reading",
      formIntroInline: "Get updates by email",
      formIntroModal: "Send me the briefing",
      formCopy: "Useful updates only. No clutter, no panic, and no endless drip campaign.",
      nameLabel: "Name (optional)",
      namePlaceholder: "How should we call you?",
      emailLabel: "Email",
      emailPlaceholder: "you@domain.com",
      submitInline: "Join the briefing",
      submitModal: "Send updates",
      ninaButton: "Talk to Nina",
      closeLabel: "Close offer",
      sending: "Sending...",
      error: "We could not submit right now. Please try again in a moment.",
      successEyebrow: "You're in",
      successTitle: "Watch your inbox",
      successBody:
        "We will send thoughtful Brazil updates, practical next steps, and the occasional note when something important changes.",
      successNina: "Talk to Nina now",
      successClose: "Close",
      subjectInline: "Insights email briefing | EN",
      subjectModal: "Exit-intent email briefing | EN",
      messageInline: "Requested the premium email briefing from an insights page.",
      messageModal: "Requested the premium email briefing from the exit-intent offer."
    },
    pt: {
      inlineEyebrow: "Briefing privado por e-mail",
      inlineTitle: "Receba atualizacoes por e-mail sem ruido",
      inlineSummary:
        "Insights juridicos sobre imigracao para o Brasil, atualizacoes realmente importantes e proximos passos mais claros para quem esta levando o plano a serio.",
      inlineChips: ["Atualizacoes por e-mail", "Conteudo juridico", "Orientacao premium"],
      inlinePoints: [
        "Avisos uteis quando regras, rotas ou condicoes de planejamento realmente mudarem.",
        "Um fluxo de e-mails mais calmo para quem compara vistos, residencia, naturalizacao e mudanca.",
        "Acesso direto a Nina sempre que voce quiser orientacao mais rapida antes de agendar."
      ],
      cards: [
        {
          icon: "news",
          title: "O que chega",
          body: "Atualizacoes juridicas claras, melhores caminhos de leitura e sinais praticos quando a mudanca para o Brasil fica mais concreta."
        },
        {
          icon: "chat",
          title: "Precisa de algo antes?",
          body: "A Nina pode apontar a melhor familia de rota ou pagina antes de voce sair do site."
        }
      ],
      modalEyebrow: "Antes de sair",
      modalTitle: "Leve o briefing da sua mudanca para o Brasil",
      modalSummary:
        "Saia com um proximo passo melhor: receba o briefing premium por e-mail ou pergunte para a Nina qual rota explorar primeiro.",
      modalChips: ["Briefing Brasil", "Concierge Nina", "Sem enxurrada"],
      modalPoints: [
        "Atualizacoes uteis sobre o Brasil em vez de marketing generico.",
        "Mais clareza sobre vistos, residencia, cidadania e mudanca.",
        "Um caminho mais rapido para falar com a Nina agora mesmo."
      ],
      modalDismiss: "Continuar lendo",
      formIntroInline: "Receber atualizacoes por e-mail",
      formIntroModal: "Quero receber o briefing",
      formCopy: "So enviamos atualizacoes uteis. Sem excesso, sem alarmismo e sem campanha cansativa.",
      nameLabel: "Nome (opcional)",
      namePlaceholder: "Como devemos chamar voce?",
      emailLabel: "E-mail",
      emailPlaceholder: "voce@dominio.com",
      submitInline: "Entrar no briefing",
      submitModal: "Receber atualizacoes",
      ninaButton: "Falar com a Nina",
      closeLabel: "Fechar oferta",
      sending: "Enviando...",
      error: "Nao foi possivel enviar agora. Tente novamente em instantes.",
      successEyebrow: "Pronto",
      successTitle: "Fique de olho no seu e-mail",
      successBody:
        "Vamos enviar atualizacoes relevantes sobre o Brasil, proximos passos praticos e avisos ocasionais quando algo importante mudar.",
      successNina: "Falar com a Nina agora",
      successClose: "Fechar",
      subjectInline: "Briefing por e-mail dos insights | PT",
      subjectModal: "Briefing por e-mail de saida | PT",
      messageInline: "Solicitou o briefing premium por e-mail em uma pagina de insights.",
      messageModal: "Solicitou o briefing premium por e-mail na oferta de saida."
    }
  };

  /* ==========================================================================
   * 03. Config and Analytics Helpers
   * ========================================================================== */
  function getConfig() {
    return window.ITB_SITE || {};
  }

  function getTrackingConfig() {
    const tracking = getConfig().tracking || {};
    return {
      ga4Id: typeof tracking.ga4Id === "string" ? tracking.ga4Id.trim() : ""
    };
  }

  function sanitizeAnalyticsValue(value, maxLength = 120) {
    if (value == null) return "";
    return String(value).trim().replace(/\s+/g, " ").slice(0, maxLength);
  }

  function cleanAnalyticsPayload(payload) {
    return Object.fromEntries(
      Object.entries(payload || {}).filter(([, value]) => {
        if (value == null) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      })
    );
  }

  function readSessionJson(key) {
    try {
      const raw = window.sessionStorage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeSessionJson(key, value) {
    try {
      if (value == null) {
        window.sessionStorage?.removeItem(key);
        return;
      }
      window.sessionStorage?.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures in stricter privacy modes.
    }
  }

  function getSiteLocale() {
    const lang = sanitizeAnalyticsValue(document.documentElement.lang || "", 16).toLowerCase();
    return lang || "en";
  }

  function getDeviceType() {
    const ua = (navigator.userAgent || "").toLowerCase();
    const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    if (/ipad|tablet/.test(ua)) return "tablet";
    if (/mobi|iphone|ipod|android.+mobile/.test(ua)) return "mobile";
    if (width > 0 && width < 768) return "mobile";
    if (width > 0 && width < 1100) return "tablet";
    return "desktop";
  }

  function getReferrerHost() {
    if (!document.referrer) return "";
    try {
      return sanitizeAnalyticsValue(new URL(document.referrer).host, 120);
    } catch {
      return "";
    }
  }

  function readCurrentAttribution() {
    const params = new URLSearchParams(window.location.search || "");
    return cleanAnalyticsPayload({
      utm_source: sanitizeAnalyticsValue(params.get("utm_source")),
      utm_medium: sanitizeAnalyticsValue(params.get("utm_medium")),
      utm_campaign: sanitizeAnalyticsValue(params.get("utm_campaign")),
      utm_term: sanitizeAnalyticsValue(params.get("utm_term")),
      utm_content: sanitizeAnalyticsValue(params.get("utm_content")),
      utm_id: sanitizeAnalyticsValue(params.get("utm_id")),
      referrer_host: getReferrerHost(),
      landing_route: normalizeRoute(window.location.pathname),
      landing_url: window.location.href,
      has_gclid: params.has("gclid") ? 1 : undefined,
      has_fbclid: params.has("fbclid") ? 1 : undefined
    });
  }

  function getStoredAttribution() {
    return cleanAnalyticsPayload(readSessionJson(attributionSessionKey) || {});
  }

  function getAttributionContext() {
    return cleanAnalyticsPayload({
      ...getStoredAttribution(),
      ...readCurrentAttribution()
    });
  }

  function persistAttributionContext() {
    const next = getAttributionContext();
    if (Object.keys(next).length) writeSessionJson(attributionSessionKey, next);
    return next;
  }

  function buildAnalyticsContext(payload) {
    const config = getConfig();
    return cleanAnalyticsPayload({
      page_route: config.pageRoute || normalizeRoute(window.location.pathname),
      page_title: sanitizeAnalyticsValue(config.pageTitle || document.title || "", 200),
      page_family: sanitizeAnalyticsValue(config.pageFamily || "", 80),
      locale: getSiteLocale(),
      device_type: getDeviceType(),
      ...getAttributionContext(),
      ...(payload || {})
    });
  }

  function describeLink(node) {
    if (!node) return {};
    const href = sanitizeAnalyticsValue(node.getAttribute("href") || "", 300);
    let destinationHost = "";
    let destinationPath = href;

    if (href) {
      try {
        const url = new URL(href, window.location.origin);
        destinationHost = sanitizeAnalyticsValue(url.host, 120);
        destinationPath = sanitizeAnalyticsValue(`${url.pathname}${url.search}`, 300);
      } catch {
        destinationPath = href;
      }
    }

    return cleanAnalyticsPayload({
      destination_host: destinationHost,
      destination_path: destinationPath,
      link_text: sanitizeAnalyticsValue(node.textContent || "", 120)
    });
  }

  function inferFormKind(form) {
    if (!form) return "general";
    if (form.matches("[data-search-form='true']")) return "search";
    if (form.hasAttribute("data-itb-email-capture")) return "email_capture";
    if (form.hasAttribute("data-newsletter-signup")) return "newsletter";
    if (form.hasAttribute("data-comments-form")) return "comment";
    if (form.matches("form[action*='formspree']")) return "lead";
    return "general";
  }

  function describeForm(form) {
    if (!form) return {};
    const action = sanitizeAnalyticsValue(form.getAttribute("action") || "", 300);
    let actionHost = "";
    let actionPath = action;

    if (action) {
      try {
        const url = new URL(action, window.location.origin);
        actionHost = sanitizeAnalyticsValue(url.host, 120);
        actionPath = sanitizeAnalyticsValue(url.pathname, 200);
      } catch {
        actionPath = action;
      }
    }

    return cleanAnalyticsPayload({
      form_kind: inferFormKind(form),
      form_group: sanitizeAnalyticsValue(form.getAttribute("data-formspree-group") || "", 120),
      form_mode: sanitizeAnalyticsValue(form.getAttribute("data-itb-email-capture-mode") || "", 80),
      form_id: sanitizeAnalyticsValue(form.id || "", 120),
      form_name: sanitizeAnalyticsValue(form.getAttribute("name") || "", 120),
      form_method: sanitizeAnalyticsValue((form.getAttribute("method") || "get").toLowerCase(), 12),
      form_action_host: actionHost,
      form_action_path: actionPath,
      form_field_count: form.querySelectorAll("input, select, textarea").length || undefined
    });
  }

  function getCanonicalUrl() {
    const canonical = document.querySelector("link[rel='canonical']")?.getAttribute("href") || "";
    if (canonical) return canonical;
    return window.location.href;
  }

  function getReferrerUrl() {
    return document.referrer || "";
  }

  function getReferrerDomain() {
    const referrer = getReferrerUrl();
    if (!referrer) return "";
    try {
      return new URL(referrer).hostname;
    } catch {
      return "";
    }
  }

  function getLandingContext() {
    const stored = getStoredAttribution();
    return {
      landing_route: stored.landing_route || normalizeRoute(window.location.pathname),
      landing_url: stored.landing_url || window.location.href
    };
  }

  function attributionFieldValues() {
    const params = new URLSearchParams(window.location.search || "");
    const config = getConfig();
    const landing = getLandingContext();
    return cleanAnalyticsPayload({
      site_domain: window.location.hostname || "immigratetobrazil.com",
      current_url: window.location.href,
      canonical_url: getCanonicalUrl(),
      page_route: config.pageRoute || normalizeRoute(window.location.pathname),
      page_title: config.pageTitle || document.title || "",
      page_language: getSiteLocale(),
      page_family: config.pageFamily || "",
      referrer_url: getReferrerUrl(),
      referrer_domain: getReferrerDomain(),
      landing_url: landing.landing_url,
      landing_route: landing.landing_route,
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
      utm_id: params.get("utm_id") || "",
      gclid: params.get("gclid") || "",
      fbclid: params.get("fbclid") || "",
      msclkid: params.get("msclkid") || "",
      device_type: getDeviceType(),
      viewport_width: String(window.innerWidth || document.documentElement.clientWidth || ""),
      viewport_height: String(window.innerHeight || document.documentElement.clientHeight || ""),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      submitted_at: new Date().toISOString()
    });
  }

  function ensureHiddenField(form, name) {
    let input = [...form.querySelectorAll("input")].find((field) => field.getAttribute("name") === name);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.dataset.itbAttribution = name;
      form.prepend(input);
    }
    return input;
  }

  function autofillFormAttribution(form) {
    if (!form) return;
    const values = attributionFieldValues();
    const trackedNames = new Set([
      ...Object.keys(values),
      ...[...form.querySelectorAll("[data-itb-attribution]")].map((input) => input.getAttribute("name")).filter(Boolean)
    ]);

    trackedNames.forEach((name) => {
      const input = ensureHiddenField(form, name);
      const nextValue = values[name] || input.value || "";
      input.value = nextValue;
    });
  }

  function buildWhatsAppMessage(node) {
    const config = getConfig();
    const route = config.pageRoute || normalizeRoute(window.location.pathname);
    const title = sanitizeAnalyticsValue(config.pageTitle || document.title || "Immigrate to Brazil", 160);
    const isPt = getSiteLocale().startsWith("pt");
    if (isPt) {
      return `Ola, vim da pagina ${title} (${route}) em immigratetobrazil.com e gostaria de falar com a advogada Monique.`;
    }
    return `Hello, I came from ${title} (${route}) on immigratetobrazil.com and would like to talk to attorney Monique.`;
  }

  function enhanceWhatsAppLink(node) {
    const href = node?.getAttribute("href") || "";
    if (!href || !/(api\.whatsapp\.com|wa\.me)/i.test(href)) return;
    node.setAttribute("data-whatsapp-click", "true");
    if (!node.hasAttribute("rel")) node.setAttribute("rel", "noopener noreferrer");
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set("text", buildWhatsAppMessage(node));
      node.setAttribute("href", url.toString());
    } catch {
      // Leave non-standard URLs untouched apart from the tracking attribute.
    }
  }

  function enhanceContactFormsAndLinks() {
    document.querySelectorAll("a[href*='api.whatsapp.com'], a[href*='wa.me']").forEach(enhanceWhatsAppLink);
    document.querySelectorAll("form[action*='formspree.io/f/']").forEach((form) => autofillFormAttribution(form));
  }

  function buildConsentState(granted) {
    return {
      ad_storage: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied"
    };
  }

  function bootstrapAnalytics() {
    const { ga4Id } = getTrackingConfig();
    if (analyticsBootstrapped || !ga4Id) return;
    if (window.__ITB_GA_BOOTSTRAPPED__ === true && typeof window.gtag === "function") {
      analyticsBootstrapped = true;
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };

    window.gtag("set", "ads_data_redaction", true);
    window.gtag("consent", "default", {
      ...buildConsentState(false),
      wait_for_update: 500
    });
    window.gtag("js", new Date());

    if (!document.querySelector(`script[data-itb-analytics="ga4"][src*="${ga4Id}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
      script.dataset.itbAnalytics = "ga4";
      document.head.appendChild(script);
    }

    window.__ITB_GA_BOOTSTRAPPED__ = true;
    analyticsBootstrapped = true;
  }

  function configureAnalytics() {
    const config = getConfig();
    const { ga4Id } = getTrackingConfig();
    if (!ga4Id) return;

    bootstrapAnalytics();
    if (window.__ITB_GA_CONFIGURED__ === true && typeof window.gtag === "function") {
      analyticsConfigured = true;
      return;
    }
    if (analyticsConfigured || typeof window.gtag !== "function") return;

    window.gtag("config", ga4Id, {
      send_page_view: false,
      page_title: config.pageTitle || document.title || "",
      page_path: config.pageRoute || window.location.pathname,
      page_location: window.location.href
    });

    window.__ITB_GA_CONFIGURED__ = true;
    analyticsConfigured = true;
  }

  function updateAnalyticsConsent(granted) {
    const { ga4Id } = getTrackingConfig();
    if (!ga4Id) return;
    if (!granted && !analyticsBootstrapped) return;

    bootstrapAnalytics();
    if (typeof window.gtag !== "function") return;

    window.gtag("consent", "update", buildConsentState(granted));
  }

  function analyticsEnabled() {
    return analyticsConfigured && typeof window.gtag === "function";
  }

  function trackPageView() {
    const config = getConfig();
    if (!analyticsEnabled() || pageViewTracked) return;

    window.gtag("event", "page_view", {
      ...buildAnalyticsContext({
        page_title: config.pageTitle || document.title || "",
        page_path: config.pageRoute || window.location.pathname,
        page_location: window.location.href
      })
    });
    pageViewTracked = true;
  }

  function track(eventName, payload) {
    if (!analyticsEnabled()) return;
    window.gtag("event", eventName, buildAnalyticsContext(payload));
  }

  /* ==========================================================================
   * 04. Page Map Text and ID Helpers
   * ========================================================================== */
  function normalizePageMapText(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function shortenPageMapLabel(label) {
    const words = label
      .replace(/[/:|()[\],]+/g, " ")
      .split(" ")
      .filter(Boolean);
    const leadingStopWords = new Set(["a", "an", "and", "for", "how", "of", "or", "the", "what", "when", "where", "which", "who", "why"]);
    let start = 0;

    while (start < words.length - 1 && leadingStopWords.has(words[start].toLowerCase())) start += 1;

    return words.slice(start, Math.min(words.length, start + 3)).join(" ") || label;
  }

  function getPageMapEntryLabel(section) {
    const kicker = normalizePageMapText(findPageMapKicker(section)?.textContent || "");
    if (isUsablePageMapKicker(kicker)) return kicker;
    const heading = findPageMapHeading(section);
    return shortenPageMapLabel(normalizePageMapText(heading?.textContent || ""));
  }

  function slugifyPageMapLabel(label) {
    return (
      label
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section"
    );
  }

  function getPageMapLocaleCopy() {
    return (document.documentElement.lang || "").toLowerCase().startsWith("pt") ? pageMapLocale.pt : pageMapLocale.en;
  }

  /* Only direct section headings inside content should appear in quick navigation. */
  function findPageMapKicker(section) {
    return [...section.querySelectorAll(".section-kicker")].find((kicker) => kicker.closest("section") === section) || null;
  }

  function isUsablePageMapKicker(kicker) {
    if (!kicker) return false;
    if (/\d/.test(kicker)) return false;
    if (/^(section|step|part|chapter)\b/i.test(kicker)) return false;
    return kicker.split(" ").filter(Boolean).length <= 3;
  }

  function findPageMapHeading(section) {
    return [...section.querySelectorAll("h2")].find((heading) => heading.closest("section") === section) || null;
  }

  function isEligiblePageMapSection(section) {
    if (!(section instanceof HTMLElement)) return false;
    if (section.closest(".sidebar-column, .sidebar-card, .page-map")) return false;
    if (section.matches(".page-map, .site-disclaimer")) return false;
    if (section.matches(".highlight-block, .search-results-shell, .faq-block, .lead-form-block, .related-block")) return false;
    if (section.id && ["hub-menu", "about-menu", "legal-notices-menu", "site-search", "faq", "consultation-form"].includes(section.id)) return false;
    if (section.hidden || section.getAttribute("aria-hidden") === "true") return false;
    const heading = findPageMapHeading(section);
    const label = normalizePageMapText(heading?.textContent || "");
    if (!label) return false;
    return true;
  }

  function findPageMapSections(main) {
    const contentColumn = main.querySelector(".content-column");
    if (!contentColumn) return [];

    return [...contentColumn.children].filter(
      (node) => node instanceof HTMLElement && node.tagName === "SECTION" && isEligiblePageMapSection(node)
    );
  }

  function createPageMapIdState(root) {
    const owners = new Map();
    root.querySelectorAll("[id]").forEach((node) => {
      const id = node.id.trim();
      if (id && !owners.has(id)) owners.set(id, node);
    });
    return { claimed: new Set(), owners };
  }

  function ensurePageMapSectionId(section, label, state) {
    const currentId = section.id.trim();
    if (currentId && state.owners.get(currentId) === section && !state.claimed.has(currentId)) {
      state.claimed.add(currentId);
      return currentId;
    }
    const base = `section-${slugifyPageMapLabel(label)}`;
    let candidate = base;
    let suffix = 2;
    while (
      state.claimed.has(candidate) ||
      (state.owners.has(candidate) && state.owners.get(candidate) !== section)
    ) {
      candidate = `${base}-${suffix++}`;
    }
    section.id = candidate;
    state.claimed.add(candidate);
    state.owners.set(candidate, section);
    return candidate;
  }

  /* ==========================================================================
   * 05. Page Map Rendering
   * Builds the sidebar page map from visible, content-owned sections.
   * ========================================================================== */
  function buildPageMap() {
    const main = document.getElementById("main-content");
    const mapCard = document.querySelector(".sidebar-card--map");
    if (!main || !mapCard) return;

    const state = createPageMapIdState(document);
    const entries = findPageMapSections(main)
      .flatMap((section) => {
        const heading = findPageMapHeading(section);
        const headingText = normalizePageMapText(heading?.textContent || "");
        const label = getPageMapEntryLabel(section);
        if (!label) return [];
        return [{ id: ensurePageMapSectionId(section, headingText || label, state), label }];
      });

    if (!entries.length) {
      mapCard.hidden = true;
      return;
    }

    const copy = getPageMapLocaleCopy();
    mapCard.hidden = false;
    mapCard.innerHTML = `<section class="page-map page-map--compact" id="page-map">
  <div class="page-map__head">
    <h2 class="section-title page-map__title"><span class="section-title__icon" aria-hidden="true">${pageMapCompassIcon}</span><span>${escapeHtml(copy.title)}</span></h2>
    <p>${escapeHtml(copy.strap)}</p>
  </div>
  <div class="page-map__links">
    ${entries
      .map(
        (entry) =>
          `<a class="page-map__link" href="#${escapeHtml(entry.id)}"><span class="page-map__icon" aria-hidden="true">${pageMapArrowIcon}</span><span>${escapeHtml(entry.label)}</span></a>`
      )
      .join("")}
  </div>
</section>`;
  }

  /* ==========================================================================
   * 06. Sticky Header Metrics
   * Sticky offset metrics are shared with CSS through custom properties.
   * ========================================================================== */
  function initStickyMetrics() {
    const utilityBar = document.querySelector(".utility-bar");
    const mainNav = document.querySelector(".main-nav");
    const docEl = document.documentElement;

    function updateStickyMetrics() {
      docEl.style.setProperty("--utility-bar-height", `${utilityBar ? Math.round(utilityBar.getBoundingClientRect().height) : 0}px`);
      docEl.style.setProperty("--main-nav-height", `${mainNav ? Math.round(mainNav.getBoundingClientRect().height) : 0}px`);
    }

    updateStickyMetrics();
    window.ITB = window.ITB || {};
    window.ITB.updateStickyMetrics = updateStickyMetrics;

    if (stickyObserver) stickyObserver.disconnect();
    if ("ResizeObserver" in window) {
      stickyObserver = new ResizeObserver(updateStickyMetrics);
      if (utilityBar) stickyObserver.observe(utilityBar);
      if (mainNav) stickyObserver.observe(mainNav);
    } else if (!resizeFallbackBound) {
      window.addEventListener("resize", updateStickyMetrics);
      resizeFallbackBound = true;
    }
  }

  function normalizeRoute(route) {
    let normalized = String(route || "").trim();
    if (!normalized) return "/";

    try {
      normalized = new URL(normalized, window.location.origin).pathname || normalized;
    } catch (error) {
      // Leave relative paths untouched when URL parsing is not needed.
    }

    normalized = normalized.replace(/\/index\.html?$/i, "/");
    normalized = normalized.replace(/\/{2,}/g, "/");
    if (!normalized.startsWith("/")) normalized = `/${normalized}`;
    if (normalized !== "/" && !/\.[a-z0-9]+$/i.test(normalized) && !normalized.endsWith("/")) normalized += "/";
    return normalized || "/";
  }

  /* Exact-route activation keeps the centered Home link accurate across partial-driven pages. */
  function initActiveRouteState() {
    const currentRoute = normalizeRoute(getConfig().pageRoute || window.location.pathname);

    document.querySelectorAll("[data-itb-route]").forEach((node) => {
      const targetRoute = normalizeRoute(node.getAttribute("data-itb-route"));
      const isActive = targetRoute === currentRoute;
      node.classList.toggle("is-active", isActive);

      if (isActive) node.setAttribute("aria-current", "page");
      else if (node.getAttribute("aria-current") === "page") node.removeAttribute("aria-current");
    });
  }

  /* ==========================================================================
   * 07. Navigation Behavior
   * Main navigation and desktop dropdown behavior.
   * ========================================================================== */
  function initNav() {
    const navbarToggle = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.getElementById("site-nav");
    const dropdowns = document.querySelectorAll(".main-nav .nav-item.dropdown");
    const mobileGroups = document.querySelectorAll(".mobile-nav-group");

    function setNavOpen(isOpen) {
      if (!navbarToggle || !navbarCollapse) return;
      navbarCollapse.classList.toggle("show", isOpen);
      navbarToggle.setAttribute("aria-expanded", String(isOpen));
      window.requestAnimationFrame(() => window.ITB?.updateStickyMetrics?.());
    }

    if (navbarToggle && navbarToggle.dataset.itbBoundNav !== "true") {
      navbarToggle.addEventListener("click", () => {
        setNavOpen(!navbarCollapse?.classList.contains("show"));
      });
      navbarToggle.dataset.itbBoundNav = "true";
    }

    navbarCollapse?.querySelectorAll("a").forEach((link) => {
      if (link.dataset.itbBoundNavLink === "true") return;
      link.addEventListener("click", () => {
        if (window.innerWidth < 1200) setNavOpen(false);
      });
      link.dataset.itbBoundNavLink = "true";
    });

    mobileGroups.forEach((group) => {
      const summary = group.querySelector("summary");
      if (!summary || summary.dataset.itbBoundMobileSummary === "true") return;
      summary.addEventListener("click", (event) => {
        if (window.innerWidth >= 1200) return;
        event.preventDefault();
        const willOpen = !group.open;
        mobileGroups.forEach((otherGroup) => {
          if (otherGroup !== group) otherGroup.open = false;
        });
        group.open = willOpen;
      });
      summary.dataset.itbBoundMobileSummary = "true";
    });

    function closeDropdowns(except) {
      dropdowns.forEach((dropdown) => {
        if (except && dropdown === except) return;
        dropdown.classList.remove("show");
        dropdown.querySelector(".dropdown-menu")?.classList.remove("show");
        dropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
    }

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      const menu = dropdown.querySelector(".dropdown-menu");
      if (!toggle || !menu || toggle.dataset.itbBoundDropdown === "true") return;
      toggle.addEventListener("click", (event) => {
        if (window.innerWidth < 1200) return;
        event.preventDefault();
        const open = dropdown.classList.contains("show");
        if (open) {
          closeDropdowns();
          return;
        }
        closeDropdowns(dropdown);
        dropdown.classList.add("show");
        menu.classList.add("show");
        toggle.setAttribute("aria-expanded", "true");
      });
      toggle.dataset.itbBoundDropdown = "true";
    });

    if (!outsideClickBound) {
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".main-nav")) {
          document.querySelectorAll(".main-nav .nav-item.dropdown").forEach((dropdown) => {
            dropdown.classList.remove("show");
            dropdown.querySelector(".dropdown-menu")?.classList.remove("show");
            dropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
          });
        }
      });
      outsideClickBound = true;
    }

    if (!escapeBound) {
      window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        document.querySelectorAll(".main-nav .nav-item.dropdown").forEach((dropdown) => {
          dropdown.classList.remove("show");
          dropdown.querySelector(".dropdown-menu")?.classList.remove("show");
          dropdown.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
        });
        document.getElementById("site-nav")?.classList.remove("show");
        document.querySelector(".navbar-toggler")?.setAttribute("aria-expanded", "false");
      });
      escapeBound = true;
    }
  }

  /* ==========================================================================
   * 08. Accordion Behavior
   * Implemented without relying on Bootstrap's JS runtime.
   * ========================================================================== */
  function initAccordion() {
    function closeAccordion(panel) {
      panel.classList.remove("show");
      const button = document.querySelector(`[data-bs-target="#${panel.id}"]`);
      button?.classList.add("collapsed");
      button?.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll(".accordion-button[data-bs-target]").forEach((button) => {
      if (button.dataset.itbBoundAccordion === "true") return;
      const targetSelector = button.getAttribute("data-bs-target");
      const panel = targetSelector ? document.querySelector(targetSelector) : null;
      if (!panel) return;
      button.addEventListener("click", () => {
        const open = panel.classList.contains("show");
        const parentSelector = panel.getAttribute("data-bs-parent");
        if (parentSelector) {
          document.querySelectorAll(`${parentSelector} .accordion-collapse.show`).forEach((openPanel) => {
            if (openPanel !== panel) closeAccordion(openPanel);
          });
        }
        panel.classList.toggle("show", !open);
        button.classList.toggle("collapsed", open);
        button.setAttribute("aria-expanded", String(!open));
      });
      button.dataset.itbBoundAccordion = "true";
    });
  }

  /* ==========================================================================
   * 09. Consent and Analytics Bindings
   * Consent-aware GA4 loading and shared analytics click bindings.
   * ========================================================================== */
  function initConsentAndTracking() {
    const config = getConfig();
    persistAttributionContext();
    enhanceContactFormsAndLinks();
    const storedConsent = localStorage.getItem(consentKey);
    if (storedConsent === "accepted") {
      configureAnalytics();
      updateAnalyticsConsent(true);
      persistAttributionContext();
      trackPageView();
    }

    const cookieBanner = document.querySelector("[data-cookie-banner]");
    const syncCookieBannerVisibility = () => {
      if (!cookieBanner) return;
      cookieBanner.hidden = Boolean(localStorage.getItem(consentKey));
    };

    const applyConsentChoice = (choice, source = "manual") => {
      const accepted = choice === "accept";
      localStorage.setItem(consentKey, accepted ? "accepted" : "declined");
      syncCookieBannerVisibility();
      if (accepted) {
        configureAnalytics();
        updateAnalyticsConsent(true);
        persistAttributionContext();
        track(source === "auto" ? "analytics_consent_auto_accepted" : "analytics_consent_granted", {
          consent_source: source
        });
        trackPageView();
      } else {
        updateAnalyticsConsent(false);
        track("analytics_consent_declined", { consent_source: source });
      }
    };

    syncCookieBannerVisibility();

    if (cookieBanner && cookieBanner.dataset.itbBoundConsentViewport !== "true") {
      const viewportQuery = window.matchMedia("(max-width: 767px)");
      const handleViewportChange = () => {
        syncCookieBannerVisibility();
      };

      if (typeof viewportQuery.addEventListener === "function") viewportQuery.addEventListener("change", handleViewportChange);
      else if (typeof viewportQuery.addListener === "function") viewportQuery.addListener(handleViewportChange);

      cookieBanner.dataset.itbBoundConsentViewport = "true";
    }

    document.querySelectorAll("[data-consent]").forEach((button) => {
      if (button.dataset.itbBoundConsent === "true") return;
      button.addEventListener("click", () => {
        const choice = button.getAttribute("data-consent");
        applyConsentChoice(choice === "accept" ? "accept" : "decline");
      });
      button.dataset.itbBoundConsent = "true";
    });

    /* Selector-driven event binding keeps shared partial content trackable. */
    const clickBindings = [
      ["[data-whatsapp-click]", "itbBoundWhatsapp", (node) => ({
        event: "whatsapp_click",
        payload: describeLink(node)
      })],
      ["[data-cta-click]", "itbBoundCta", (node) => ({
        event: "cta_click",
        payload: {
          cta_text: sanitizeAnalyticsValue(node.textContent.trim(), 120),
          ...describeLink(node)
        }
      })],
      ["[data-language-toggle]", "itbBoundLang", (node) => ({
        event: "language_toggle_click",
        payload: { selected_language: sanitizeAnalyticsValue(node.getAttribute("data-language-toggle") || "", 16) }
      })],
      ["[data-search-open='true']", "itbBoundSearchOpen", () => ({
        event: "search_open",
        payload: {}
      })]
    ];

    clickBindings.forEach(([selector, flag, build]) => {
      document.querySelectorAll(selector).forEach((node) => {
        if (node.dataset[flag] === "true") return;
        node.addEventListener("click", () => {
          const data = build(node);
          track(data.event, data.payload);
        });
        node.dataset[flag] = "true";
      });
    });

    document.querySelectorAll("[data-autofill-current-page='route']").forEach((input) => {
      if (input.value) return;
      input.value = config.pageRoute || window.location.pathname;
    });

    document.querySelectorAll("[data-autofill-current-page='title']").forEach((input) => {
      if (input.value) return;
      input.value = config.pageTitle || document.title || "";
    });

    document.querySelectorAll("form").forEach((form) => {
      if (form.dataset.itbBoundFormStart !== "true") {
        const handleFormStart = () => {
          if (form.dataset.itbTrackedFormStart === "true") return;
          form.dataset.itbTrackedFormStart = "true";
          track("form_start", describeForm(form));
        };

        form.addEventListener("focusin", handleFormStart, true);
        form.addEventListener("input", handleFormStart, true);
        form.dataset.itbBoundFormStart = "true";
      }

      if (form.dataset.itbBoundFormSubmit === "true") return;
      form.addEventListener("submit", () => {
        autofillFormAttribution(form);
        track("form_submit", describeForm(form));
      });
      form.dataset.itbBoundFormSubmit = "true";
    });
  }

  /* ==========================================================================
   * 10. Insights Lead Capture
   * Premium inline capture and exit-intent support for insights pages.
   * ========================================================================== */
  function getLocaleCode() {
    return (document.documentElement.lang || "").toLowerCase().startsWith("pt") ? "pt" : "en";
  }

  function getInsightsLeadCopy() {
    return getLocaleCode() === "pt" ? insightsLeadLocale.pt : insightsLeadLocale.en;
  }

  function readSessionItem(key) {
    try {
      return window.sessionStorage?.getItem(key) || "";
    } catch {
      return "";
    }
  }

  function writeSessionItem(key, value) {
    try {
      window.sessionStorage?.setItem(key, value);
    } catch {
      // Ignore storage failures in stricter privacy modes.
    }
  }

  function isInsightsLeadPage() {
    const route = normalizeRoute(getConfig().pageRoute || window.location.pathname);
    if (document.body.classList.contains("family-insights")) return true;
    return route === "/insights/" || route.startsWith("/insights/") || route === "/pt-br/insights/" || route.startsWith("/pt-br/insights/");
  }

  function buildInsightsLeadCards(copy) {
    return copy.cards
      .map(
        (card) => `<article class="insights-lead-capture__card">
  <span class="insights-lead-capture__card-icon" aria-hidden="true">${iconLibrary[card.icon] || iconLibrary.news}</span>
  <div class="insights-lead-capture__card-copy">
    <strong>${escapeHtml(card.title)}</strong>
    <p>${escapeHtml(card.body)}</p>
  </div>
</article>`
      )
      .join("");
  }

  function buildInsightsLeadHiddenFields(mode, copy) {
    const isPt = getLocaleCode() === "pt";
    const locale = isPt ? "pt-br" : "en";
    const suffix = isPt ? "pt" : "en";
    const isModal = mode === "modal";

    return `
      <input type="hidden" name="_subject" value="${escapeHtml(isModal ? copy.subjectModal : copy.subjectInline)}" />
      <input type="hidden" name="form_name" value="${escapeHtml(isModal ? `insights-exit-briefing-${suffix}` : `insights-email-briefing-${suffix}`)}" />
      <input type="hidden" name="lead_source" value="${escapeHtml(isModal ? "insights-exit-intent" : "insights-inline-briefing")}" />
      <input type="hidden" name="page_context" value="${escapeHtml(isModal ? "insights-exit-intent-briefing" : "insights-inline-email-briefing")}" />
      <input type="hidden" name="page_route" value="" data-autofill-current-page="route" />
      <input type="hidden" name="page_title" value="" data-autofill-current-page="title" />
      <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
      <input type="hidden" name="message" value="${escapeHtml(isModal ? copy.messageModal : copy.messageInline)}" />
    `;
  }

  function buildInsightsLeadForm(mode, copy) {
    const isModal = mode === "modal";
    const group = getLocaleCode() === "pt" ? (isModal ? "insights-exit-pt" : "insights-briefing-pt") : isModal ? "insights-exit-en" : "insights-briefing-en";
    const source = isModal ? "exit-modal" : "inline-cta";

    return `<form action="${escapeHtml(emailCaptureEndpoint)}" method="post" class="download-gateway__form insights-lead-capture__form" data-itb-email-capture="true" data-itb-email-capture-mode="${escapeHtml(mode)}" data-formspree-group="${escapeHtml(group)}" novalidate>
  ${buildInsightsLeadHiddenFields(mode, copy)}
  <div class="insights-lead-capture__form-head">
    <p class="insights-lead-capture__form-eyebrow">${escapeHtml(isModal ? copy.formIntroModal : copy.formIntroInline)}</p>
    <p class="insights-lead-capture__form-copy">${escapeHtml(copy.formCopy)}</p>
  </div>
  <label>
    ${escapeHtml(copy.nameLabel)}
    <input name="full_name" type="text" placeholder="${escapeHtml(copy.namePlaceholder)}" autocomplete="name" />
  </label>
  <label>
    ${escapeHtml(copy.emailLabel)}
    <input name="email" type="email" inputmode="email" required aria-required="true" placeholder="${escapeHtml(copy.emailPlaceholder)}" autocomplete="email" />
  </label>
  <div class="insights-lead-capture__actions">
    <button type="submit" class="btn btn-primary">${escapeHtml(isModal ? copy.submitModal : copy.submitInline)}</button>
    <button type="button" class="btn btn-secondary" data-itb-open-nina="true" data-itb-nina-source="${escapeHtml(source)}">${escapeHtml(copy.ninaButton)}</button>
  </div>
  <p class="insights-lead-capture__status" data-itb-email-capture-status></p>
</form>`;
  }

  function buildInsightsLeadSuccess(mode, copy) {
    const isModal = mode === "modal";
    return `<div class="insights-lead-capture__success">
  <p class="download-gateway__eyebrow">${escapeHtml(copy.successEyebrow)}</p>
  <h3>${escapeHtml(copy.successTitle)}</h3>
  <p>${escapeHtml(copy.successBody)}</p>
  <div class="insights-lead-capture__actions insights-lead-capture__actions--success">
    <button type="button" class="btn btn-primary" data-itb-open-nina="true" data-itb-nina-source="${escapeHtml(isModal ? "exit-success" : "inline-success")}">${escapeHtml(copy.successNina)}</button>
    ${isModal ? `<button type="button" class="btn btn-secondary" data-itb-exit-close="true">${escapeHtml(copy.successClose)}</button>` : ""}
  </div>
</div>`;
  }

  function buildInsightsInlineLead(copy) {
    return `<section class="insights-lead-capture download-gateway download-gateway--newsletter" data-itb-insights-lead="inline" aria-labelledby="insights-lead-title">
  <div class="download-gateway__shell insights-lead-capture__shell">
    <div class="download-gateway__content insights-lead-capture__content">
      <p class="download-gateway__eyebrow">${escapeHtml(copy.inlineEyebrow)}</p>
      <h2 id="insights-lead-title">${escapeHtml(copy.inlineTitle)}</h2>
      <p class="download-gateway__summary">${escapeHtml(copy.inlineSummary)}</p>
      <div class="download-gateway__meta">
        ${copy.inlineChips.map((chip) => `<span class="download-gateway__chip">${escapeHtml(chip)}</span>`).join("")}
      </div>
      <ul class="download-gateway__points">
        ${copy.inlinePoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="insights-lead-capture__cards">
        ${buildInsightsLeadCards(copy)}
      </div>
    </div>
    ${buildInsightsLeadForm("inline", copy)}
  </div>
</section>`;
  }

  function buildInsightsExitModal(copy) {
    return `<div class="insights-exit-modal" data-itb-exit-modal hidden>
  <button type="button" class="insights-exit-modal__backdrop" data-itb-exit-close="true" aria-label="${escapeHtml(copy.closeLabel)}"></button>
  <div class="insights-exit-modal__frame" role="dialog" aria-modal="true" aria-labelledby="insights-exit-title" aria-describedby="insights-exit-summary">
    <button type="button" class="insights-exit-modal__close" data-itb-exit-close="true" aria-label="${escapeHtml(copy.closeLabel)}">
      <span aria-hidden="true">&times;</span>
    </button>
    <section class="insights-lead-capture insights-lead-capture--modal download-gateway download-gateway--newsletter">
      <div class="download-gateway__shell insights-lead-capture__shell">
        <div class="download-gateway__content insights-lead-capture__content">
          <p class="download-gateway__eyebrow">${escapeHtml(copy.modalEyebrow)}</p>
          <h2 id="insights-exit-title">${escapeHtml(copy.modalTitle)}</h2>
          <p id="insights-exit-summary" class="download-gateway__summary">${escapeHtml(copy.modalSummary)}</p>
          <div class="download-gateway__meta">
            ${copy.modalChips.map((chip) => `<span class="download-gateway__chip">${escapeHtml(chip)}</span>`).join("")}
          </div>
          <ul class="download-gateway__points">
            ${copy.modalPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <div class="insights-lead-capture__cards">
            ${buildInsightsLeadCards(copy)}
          </div>
          <div class="insights-lead-capture__modal-actions">
            <button type="button" class="btn btn-secondary" data-itb-open-nina="true" data-itb-nina-source="exit-modal">${escapeHtml(copy.ninaButton)}</button>
            <button type="button" class="btn btn-ghost" data-itb-exit-close="true">${escapeHtml(copy.modalDismiss)}</button>
          </div>
        </div>
        ${buildInsightsLeadForm("modal", copy)}
      </div>
    </section>
  </div>
</div>`;
  }

  function createMarkupNode(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  function ensureInsightsInlineLead() {
    if (!isInsightsLeadPage() || document.querySelector("[data-itb-insights-lead='inline']")) return;

    const main = document.getElementById("main-content");
    if (!main) return;

    const section = createMarkupNode(buildInsightsInlineLead(getInsightsLeadCopy()));
    if (!section) return;

    const anchor = main.querySelector("[data-partial='official-resources'], [data-partial='related-links'], .lead-form-block, [data-partial='disclaimer']");
    if (anchor?.parentElement) {
      anchor.parentElement.insertBefore(section, anchor);
      return;
    }

    const container = document.createElement("div");
    container.className = "container";
    container.appendChild(section);
    main.appendChild(container);
  }

  function ensureInsightsExitModal() {
    if (!isInsightsLeadPage()) return null;
    const existing = document.querySelector("[data-itb-exit-modal]");
    if (existing) return existing;

    const modal = createMarkupNode(buildInsightsExitModal(getInsightsLeadCopy()));
    if (!modal) return null;
    document.body.appendChild(modal);
    return modal;
  }

  function bindInsightsLeadForms() {
    document.querySelectorAll("[data-itb-email-capture='true']").forEach((form) => {
      if (form.dataset.itbBoundEmailCapture === "true") return;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitInsightsLeadForm(form).catch((error) => console.error(error));
      });
      form.dataset.itbBoundEmailCapture = "true";
    });
  }

  async function submitInsightsLeadForm(form) {
    if (!form || form.dataset.state === "submitting") return;

    const mode = form.getAttribute("data-itb-email-capture-mode") || "inline";
    const copy = getInsightsLeadCopy();
    const statusNode = form.querySelector("[data-itb-email-capture-status]");
    const submitButton = form.querySelector("button[type='submit']");
    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }

    form.dataset.state = "submitting";
    if (submitButton) submitButton.disabled = true;
    if (statusNode) statusNode.textContent = copy.sending;

    autofillFormAttribution(form);
    const payload = new FormData(form);
    payload.set("page_route", getConfig().pageRoute || window.location.pathname);
    payload.set("page_title", getConfig().pageTitle || document.title || "");

    try {
      const response = await fetch(form.getAttribute("action") || emailCaptureEndpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Lead capture failed with status ${response.status}`);

      writeSessionItem(exitIntentSessionKey, "captured");
      form.dataset.state = "success";
      form.innerHTML = buildInsightsLeadSuccess(mode, copy);
      track("form_submit_success", describeForm(form));
      track("insights_email_capture_submitted", {
        capture_mode: mode
      });
    } catch (error) {
      console.error(error);
      form.dataset.state = "error";
      if (submitButton) submitButton.disabled = false;
      if (statusNode) statusNode.textContent = copy.error;
      track("form_submit_error", {
        ...describeForm(form),
        capture_mode: mode
      });
    }
  }

  function bindAtlasConsultationForms() {
    document.querySelectorAll("[data-itb-atlas-form='true']").forEach((form) => {
      if (form.dataset.itbBoundAtlasForm === "true") return;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitAtlasConsultationForm(form).catch((error) => console.error(error));
      });
      form.dataset.itbBoundAtlasForm = "true";
    });
  }

  function buildAtlasConsultationSuccess() {
    return `
      <div class="atlas-form-success" data-itb-atlas-form-success="true">
        <p class="atlas-form-success__eyebrow">Request received</p>
        <h3>Thank you for taking this next step with Monique Fernandes.</h3>
        <p>Your consultation request and any uploaded documents have been sent for manual review. If the matter is urgent, you can use WhatsApp after submitting to flag timing concerns.</p>
        <div class="atlas-form-success__actions">
          <a class="btn btn-secondary btn-sm" href="https://api.whatsapp.com/send/?phone=554399614034&text=Hello+I+would+like+to+talk+to+attorney+Monique&type=phone_number&app_absent=0">Open WhatsApp</a>
          <a class="btn btn-outline btn-sm" href="/process/consultation/">Read about consultations</a>
        </div>
      </div>
    `;
  }

  async function submitAtlasConsultationForm(form) {
    if (!form || form.dataset.state === "submitting") return;

    const statusNode = form.querySelector("[data-itb-atlas-form-status]");
    const submitButton = form.querySelector("button[type='submit']");
    if (typeof form.reportValidity === "function" && !form.reportValidity()) {
      return;
    }

    form.dataset.state = "submitting";
    if (submitButton) submitButton.disabled = true;
    if (statusNode) statusNode.textContent = "Sending your consultation request to Monique Fernandes...";

    autofillFormAttribution(form);
    const payload = new FormData(form);
    payload.set("page_route", getConfig().pageRoute || window.location.pathname);
    payload.set("page_title", getConfig().pageTitle || document.title || "");

    try {
      const response = await fetch(form.getAttribute("action") || "https://formspree.io/f/xdawygld", {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Atlas consultation failed with status ${response.status}`);

      form.dataset.state = "success";
      form.innerHTML = buildAtlasConsultationSuccess();
      track("form_submit_success", describeForm(form));
      track("atlas_consultation_submitted", {
        form_group: sanitizeAnalyticsValue(form.getAttribute("data-formspree-group") || "about-atlas-consultation-en", 120)
      });
    } catch (error) {
      console.error(error);
      form.dataset.state = "error";
      if (submitButton) submitButton.disabled = false;
      if (statusNode) {
        statusNode.textContent = "Something went wrong while sending the request. Please try again or use WhatsApp if the matter is urgent.";
      }
      track("form_submit_error", {
        ...describeForm(form),
        form_group: sanitizeAnalyticsValue(form.getAttribute("data-formspree-group") || "about-atlas-consultation-en", 120)
      });
    }
  }

  function initAtlasConsultationForm() {
    bindAtlasConsultationForms();
  }

  function isInsightsExitModalOpen() {
    const modal = document.querySelector("[data-itb-exit-modal]");
    return Boolean(modal && !modal.hidden);
  }

  function openInsightsExitModal(source = "exit-intent") {
    const modal = ensureInsightsExitModal();
    if (!modal || isInsightsExitModalOpen()) return;

    insightsLeadArmed = false;
    writeSessionItem(exitIntentSessionKey, "shown");
    insightsLeadFocusRestore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    document.body.classList.add("insights-exit-modal-open");
    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      const focusTarget = modal.querySelector("input[name='email'], .insights-exit-modal__close");
      if (focusTarget instanceof HTMLElement) focusTarget.focus();
    });
    track("insights_exit_intent_opened", {
      page_route: getConfig().pageRoute,
      source
    });
  }

  function closeInsightsExitModal() {
    const modal = document.querySelector("[data-itb-exit-modal]");
    if (!modal || modal.hidden) return;

    modal.classList.remove("is-open");
    document.body.classList.remove("insights-exit-modal-open");
    window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) modal.hidden = true;
    }, 180);

    const restoreTarget = insightsLeadFocusRestore;
    insightsLeadFocusRestore = null;
    if (restoreTarget instanceof HTMLElement && restoreTarget.isConnected) {
      window.requestAnimationFrame(() => restoreTarget.focus());
    }
  }

  async function openNinaFromLead(source) {
    let opened = false;
    if (typeof window.ITB?.openAshaChat !== "function" && typeof window.ITB?.loadAshaChat === "function") {
      await window.ITB.loadAshaChat();
    }
    if (typeof window.ITB?.openAshaChat === "function") opened = window.ITB.openAshaChat();
    if (!opened) {
      const launcher = document.querySelector("[data-nina-launcher]");
      if (launcher instanceof HTMLElement) {
        launcher.click();
        opened = true;
      }
    }

    track("insights_nina_open_requested", {
      page_route: getConfig().pageRoute,
      source: source || "unknown",
      available: opened ? "true" : "false"
    });
  }

  function bindInsightsLeadDelegates() {
    if (insightsLeadDelegateBound) return;

    document.addEventListener("click", (event) => {
      const closeButton = event.target.closest("[data-itb-exit-close='true'], [data-itb-exit-close]");
      if (closeButton) {
        event.preventDefault();
        closeInsightsExitModal();
        return;
      }

      const ninaButton = event.target.closest("[data-itb-open-nina='true'], [data-itb-open-nina]");
      if (!ninaButton) return;
      event.preventDefault();
      if (isInsightsExitModalOpen()) closeInsightsExitModal();
      void openNinaFromLead(ninaButton.getAttribute("data-itb-nina-source") || "lead-capture");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isInsightsExitModalOpen()) closeInsightsExitModal();
    });

    insightsLeadDelegateBound = true;
  }

  function armInsightsExitIntent() {
    if (!isInsightsLeadPage() || readSessionItem(exitIntentSessionKey)) return;

    window.clearTimeout(insightsLeadArmTimer);
    insightsLeadArmed = false;
    insightsLeadArmTimer = window.setTimeout(() => {
      insightsLeadArmed = true;
    }, 7000);

    if (insightsLeadMouseBound) return;
    document.addEventListener("mouseout", (event) => {
      if (!isInsightsLeadPage() || readSessionItem(exitIntentSessionKey)) return;
      if (!insightsLeadArmed || window.innerWidth < 1024 || !window.matchMedia("(pointer: fine)").matches) return;
      if (event.relatedTarget || event.toElement) return;
      if (typeof event.clientY === "number" && event.clientY <= 18) openInsightsExitModal("pointer-exit");
    });
    insightsLeadMouseBound = true;
  }

  function initInsightsLeadCapture() {
    if (!isInsightsLeadPage()) return;
    ensureInsightsInlineLead();
    ensureInsightsExitModal();
    bindInsightsLeadForms();
    bindInsightsLeadDelegates();
    armInsightsExitIntent();
  }

  /* ==========================================================================
   * 11. Services Directory Rendering
   * Renders the premium service atlas from page-local JSON so EN/PT pages can
   * share one predictable card layout without duplicating dozens of card blocks.
   * ========================================================================== */
  function initServicesDirectory() {
    const dataNode = document.getElementById("services-directory-data");
    if (!dataNode || dataNode.dataset.itbServicesRendered === "true") return;
    const isPt = document.documentElement.lang?.toLowerCase().startsWith("pt");

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function slugify(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function localizeInternalHref(value) {
      const href = String(value || "").trim();
      if (!href.startsWith("/") || href.startsWith("/pt-br/") || !isPt) return href;
      return href === "/" ? "/pt-br/" : `/pt-br${href}`;
    }

    function appendConsultationSubject(value, subject, serviceLabel) {
      const href = localizeInternalHref(value);
      if (!href) return href;
      try {
        const url = new URL(href, window.location.origin);
        if (subject && !url.searchParams.get("consultation_subject")) {
          url.searchParams.set("consultation_subject", subject);
        }
        if (serviceLabel && !url.searchParams.get("service_label")) {
          url.searchParams.set("service_label", serviceLabel);
        }
        return `${url.pathname}${url.search}${url.hash}`;
      } catch {
        return href;
      }
    }

    function buildReadLabel(familyKey, label) {
      const templates = {
        visas: isPt ? `Ver detalhes de ${label}` : `See ${label} details`,
        residencies: isPt ? `Ver caminho de ${label}` : `Review ${label} pathway`,
        naturalisation: isPt ? `Ver critérios de ${label}` : `Read ${label} criteria`,
        defense: isPt ? `Ver resposta para ${label}` : `Open ${label} overview`,
        support: isPt ? `Ver apoio de ${label}` : `See ${label} support`,
        advisory: isPt ? `Explorar ${label}` : `Explore ${label} guidance`
      };
      return templates[familyKey] || (isPt ? `Ver ${label}` : `See ${label}`);
    }

    function buildConsultLabel(label) {
      return isPt ? `Agendar consulta sobre ${label}` : `Discuss ${label}`;
    }

    let directoryData;
    try {
      directoryData = JSON.parse(dataNode.textContent || "{}");
    } catch (error) {
      console.error("Could not parse services directory data.", error);
      return;
    }

    const families = directoryData.families || {};
    const exploreLabel = directoryData.exploreLabel || "Explore service";
    const consultLabel = directoryData.consultLabel || "Book consultation";

    Object.entries(families).forEach(([familyKey, family]) => {
      const services = Array.isArray(family?.services) ? family.services : [];
      document.querySelectorAll(`[data-services-directory-grid="${familyKey}"]`).forEach((grid) => {
        if (grid.dataset.itbServicesRendered === "true") return;

        grid.innerHTML = services
          .map((service) => {
            const label = service.label || "";
            const slug = service.slug || slugify(label);
            const readLabel = service.readLabel || buildReadLabel(familyKey, label);
            const consultationSubject =
              service.consultationSubject || `${isPt ? "Consulta" : "Consultation request"} | ${label} | All Services`;
            const consultationHref = appendConsultationSubject(
              service.consultationHref,
              consultationSubject,
              label
            );
            const readHref = localizeInternalHref(service.href || "#");
            const imageSrc =
              service.imageSrc || `/assets/images/services/all/${escapeHtml(familyKey)}/${escapeHtml(slug)}.jpg`;
            const imageAlt =
              service.imageAlt ||
              `${label} service image for Brazilian immigration legal support and strategic planning.`;
            const imageWidth = Number.isFinite(service.imageWidth) ? service.imageWidth : 1200;
            const imageHeight = Number.isFinite(service.imageHeight) ? service.imageHeight : 800;
            const iconSrc = service.iconSrc || `/assets/icons/services/all/${escapeHtml(slug)}.svg`;
            const consultButtonLabel = service.consultLabel || buildConsultLabel(label);

            return `<article class="services-directory-card services-directory-card--${escapeHtml(familyKey)}">
  <figure class="services-directory-card__media">
    <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" width="${escapeHtml(
              imageWidth
            )}" height="${escapeHtml(imageHeight)}" loading="lazy" decoding="async" />
  </figure>
  <div class="services-directory-card__top">
    <span class="services-directory-card__icon" aria-hidden="true">
      <img src="${escapeHtml(iconSrc)}" alt="" width="24" height="24" loading="lazy" decoding="async" />
    </span>
  </div>
  <h3><a href="${escapeHtml(readHref)}" aria-label="${escapeHtml(`${exploreLabel}: ${label}`)}">${escapeHtml(
              label
            )}</a></h3>
  <p>${escapeHtml(service.description)}</p>
  <div class="services-directory-card__actions">
    <a class="btn btn-secondary btn-sm services-directory-card__read" href="${escapeHtml(readHref)}" aria-label="${escapeHtml(
              `${exploreLabel}: ${label}`
            )}">${escapeHtml(readLabel)}</a>
    <a class="btn btn-cta btn-sm services-directory-card__consult" href="${escapeHtml(
              consultationHref
            )}" data-cta-click="true" aria-label="${escapeHtml(`${consultLabel}: ${label}`)}">${escapeHtml(
              consultButtonLabel
            )}</a>
  </div>
</article>`;
          })
          .join("");

        grid.dataset.itbServicesRendered = "true";
      });
    });

    dataNode.dataset.itbServicesRendered = "true";
  }

  /* ==========================================================================
   * 12. Consultation Query Prefill
   * Service-aware CTAs can carry an exact service value plus an optional topic
   * hint so the consultation forms open with useful context already selected.
   * ========================================================================== */
  function initConsultationPrefill() {
    const params = new URLSearchParams(window.location.search);
    const rawService = params.get("service_interest");
    const rawTopic = params.get("topic_interest");
    const rawSubject = params.get("consultation_subject") || params.get("_subject");
    const rawServiceLabel = params.get("service_label");
    if (!rawService && !rawTopic && !rawSubject && !rawServiceLabel) return;

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    const aliasMap = {
      "digital nomad visa": "Nomad Visa",
      "educational exchange visa": "Exchange Visa",
      "family reunion residency": "Reunion Residency",
      "retirement residency": "Retiree Residency",
      "citizenship": "Not sure yet",
      "naturalisation": "Not sure yet",
      "naturalization": "Not sure yet",
      "advisory": "Not sure yet",
      "residency": "Not sure yet",
      "corporate immigration": "Corporate",
      "deportation defense": "Deportation",
      "expulsion defense": "Expulsion",
      "extradition defense": "Extradition",
      "consular records": "Consular",
      "regularisation": "Regularization",
      "renunciation of nationality": "Renunciation Naturalisation",
      "reacquisition of nationality": "Reacquisition Naturalisation"
    };

    const normalizedService = normalize(rawService);
    const fallbackService = aliasMap[normalizedService] || rawService;
    const topicValue = rawTopic || (fallbackService === "Not sure yet" && rawService ? rawService : "");

    document.querySelectorAll("form").forEach((form) => {
      const select = form.querySelector("select[name='service_interest']");
      if (select) {
        const options = [...select.options];
        const matched = options.find((option) => normalize(option.value) === normalize(fallbackService));
        const unsure = options.find((option) => normalize(option.value) === "not sure yet");
        if (matched) select.value = matched.value;
        else if (unsure && (rawService || rawTopic)) select.value = unsure.value;
      }

      const topicInput = form.querySelector("input[name='topic_interest']");
      if (topicInput) topicInput.value = topicValue;

      const subjectInput = form.querySelector("input[name='_subject']");
      if (subjectInput && rawSubject) subjectInput.value = rawSubject;

      const serviceLabelInput = form.querySelector("input[name='service_label']");
      if (serviceLabelInput) serviceLabelInput.value = rawServiceLabel || rawService || topicValue;
    });
  }

  /* ==========================================================================
   * 13. Client Experience UI
   * Applies value-based color grading to the 0-10 scale and staggers proof bars.
   * ========================================================================== */
  function initClientExperienceUi() {
    const scorePalette = [
      "#5a2027",
      "#6a252c",
      "#792a30",
      "#873334",
      "#904634",
      "#966031",
      "#90762f",
      "#768130",
      "#5b8732",
      "#447b35",
      "#2f6239"
    ];

    function toneFor(value, fallbackIndex) {
      const index = Number.isFinite(value) ? Math.max(0, Math.min(scorePalette.length - 1, value)) : fallbackIndex;
      return scorePalette[index] || scorePalette[scorePalette.length - 1];
    }

    document.querySelectorAll(".client-scale-guide__numbers span").forEach((node, index) => {
      const value = Number.parseInt(node.textContent.trim(), 10);
      node.style.setProperty("--score-tone", toneFor(value, index));
    });

    document.querySelectorAll(".feedback-score-option").forEach((option, index) => {
      const label = option.querySelector("span");
      const value = Number.parseInt(label?.textContent.trim() || "", 10);
      option.style.setProperty("--score-tone", toneFor(value, index % scorePalette.length));
    });

    document.querySelectorAll(".client-indicator-bar").forEach((bar, index) => {
      bar.style.setProperty("--proof-delay", `${Math.min(index, 9) * 85}ms`);
    });
  }

  /* ==========================================================================
   * 14. Scroll-State UI
   * Floating back-to-top behavior and sticky-shell scroll classes.
   * ========================================================================== */
  function initBackToTop() {
    const body = document.body;
    const button = document.querySelector("[data-back-to-top='true']");
    let progressBar = document.querySelector("[data-scroll-progress='true']");

    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.className = "scroll-progress";
      progressBar.setAttribute("data-scroll-progress", "true");
      progressBar.setAttribute("aria-hidden", "true");
      document.body.appendChild(progressBar);
    }

    if (button && button.dataset.itbBoundBackToTop !== "true") {
      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: body.classList.contains("reduced-motion") ? "auto" : "smooth" });
      });
      button.dataset.itbBoundBackToTop = "true";
    }

    function onScroll() {
      const liveButton = document.querySelector("[data-back-to-top='true']");
      const showThreshold = Math.max(160, Math.min(320, Math.round(window.innerHeight * 0.24)));
      const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollRatio = Math.max(0, Math.min(1, window.scrollY / scrollableHeight));
      body.classList.toggle("is-scrolled", window.scrollY > 16);
      liveButton?.classList.toggle("is-visible", window.scrollY > showThreshold);
      liveButton?.style.setProperty("--back-to-top-progress", scrollRatio.toFixed(4));
      progressBar?.style.setProperty("--scroll-progress", scrollRatio.toFixed(4));
      progressBar?.classList.toggle("is-active", scrollRatio > 0.01);

      const scrollPercent = Math.round(scrollRatio * 100);
      scrollDepthMilestones.forEach((milestone) => {
        if (scrollPercent < milestone || trackedScrollMilestones.has(milestone)) return;
        trackedScrollMilestones.add(milestone);
        track("scroll_depth", { scroll_percent: milestone });
      });
    }

    if (!scrollBound) {
      window.addEventListener("scroll", onScroll, { passive: true });
      scrollBound = true;
    }
    onScroll();
    window.requestAnimationFrame(() => window.requestAnimationFrame(onScroll));
    window.addEventListener("load", onScroll, { once: true });
  }

  /* ==========================================================================
   * 15. Reveal-On-Scroll
   * Footer sections stay out to avoid partial-load visibility issues.
   * ========================================================================== */
  function initRevealTargets() {
    const body = document.body;
    const revealTargets = [
      ...document.querySelectorAll(
        ".content-block, .official-resources, .faq-block, .related-block, .download-gateway, .client-proof-band, .client-proof-stage, .hero-panel, .hero-glance-card, .sidebar-card, .marker, .info-card, .resource-card, .related-card, .quote-card"
      )
    ];
    revealTargets.forEach((node) => node.classList.add("reveal"));

    if (revealObserver) revealObserver.disconnect();
    if (!body.classList.contains("reduced-motion") && "IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: "12% 0px 18% 0px" }
      );
      const preloadBoundary = window.innerHeight * 1.18;
      revealTargets.forEach((node) => {
        if (node.getBoundingClientRect().top <= preloadBoundary) node.classList.add("is-visible");
        else revealObserver.observe(node);
      });
    } else {
      revealTargets.forEach((node) => node.classList.add("is-visible"));
    }
  }

  /* ==========================================================================
   * 16. Shared Icon Refresh
   * Replaces repeated generic SVGs with context-aware icons after partial load.
   * ========================================================================== */
  function initIconRefresh() {
    const pageUsed = new Set(
      [...document.querySelectorAll("[data-itb-icon-key]")]
        .map((node) => node.dataset.itbIconKey)
        .filter(Boolean)
    );

    function normalizeIconLabel(label) {
      return String(label || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    function iconKeyFromText(label, fallback = "compass") {
      const text = normalizeIconLabel(label);
      if (/source date|data de origem|published|updated|calendar|\bdate\b/.test(text)) return "calendar";
      if (/archive|history|historico|arquivo|original source/.test(text)) return "archive";
      if (/rewrite|rewritten|new domain|migrated to|site migration|migracao do dominio|reescrit|domain refresh/.test(text)) return "link";
      if (/about|sobre|lawyer|attorney|advogad|profile|perfil|monique|testimonial|depoimento|story|mission|missao|value|valor|ethic|etica|why us|why work|quem somos/.test(text)) return "user";
      if (/humanitarian|humanitario|care|cuidado|health|saude|refuge|refug|asylum/.test(text)) return "heart";
      if (/legal|law|guidance|orientacao|rights|direitos|obligation|obrigac|ethic|etica|justice|representa/.test(text)) return "balance";
      if (/approval|approved|aprovad|compliance|cumprimento|defense|defesa|appeal|recurso|deport|expuls|extrad|fine|multa|litigation|litig|protect|protec|regulariz/.test(text)) return "shield";
      if (/assessment|avaliac|eligib|route review|review route|fit|compare|comparison|which route|qual rota/.test(text)) return "compass";
      if (/filing|application|prepare|preparation|preparac|document|record|registro|form|formulario|paperwork|case file|dossier/.test(text)) return "document";
      if (/follow up|followup|aftercare|ongoing|renewal|renov|timeline|prazo|deadline|planning|planejamento|strategy|estrategia|process|processo|route|rota|sequence|sequencia|next step|proximo passo/.test(text)) return "workflow";
      if (/english|portuguese|portugues|bilingual|language|idioma|communication|comunicacao|translation|traduc|speak|fala/.test(text)) return "chat";
      if (/abroad|international|internacional|global|cross border|overseas|outside brazil|fora do brasil|remote|remoto/.test(text)) return "globe";
      if (/consult|consulta|talk|whatsapp|contact|contato|support|suporte|atendimento|call|message|mensagem/.test(text)) return "chat";
      if (/award|proof|prova|result|resultado|trust|confianca|recognition|reconhecimento|credential|credencial/.test(text)) return "award";
      if (/blog|update|atualiz|fyi|news|noticia|insight/.test(text)) return "news";
      if (/book|overview|visao geral|guide|guia|faq|perguntas|read|reading|resource|recurso|official|oficial|reference|referencia/.test(text)) return "book";
      if (/brazil|brasil|country|pais|living|morar|culture|cultura|economy|economia|investment|investimento|quality|qualidade/.test(text)) return "globe";
      if (/city|cidade|state|estado|municipal|municipio|region|regiao|north|norte|south|sul|northeast|nordeste|southeast|sudeste|central west|centro oeste|place|local|location/.test(text)) return "map";
      if (/cost|custo|fee|taxa|payment|pagamento|refund|reembolso|price|preco|budget|orcamento|financial|financeir/.test(text)) return "coin";
      if (/education|educac|study|estudo|student|estudante|research|pesquisa|school|escola/.test(text)) return "book";
      if (/family|familia|children|crianc|parent|spouse|conjuge/.test(text)) return "family";
      if (/home|casa|housing|moradia|permanent|permanente|residenc|residencia|settle/.test(text)) return "home";
      if (/related|relacionad|link|connect|conexao|domain|dominio/.test(text)) return "link";
      if (/directory|diretorio|atlas|mapa|map/.test(text)) return "map";
      if (/naturalisation|naturalization|naturaliz|citizenship|cidadania|passport|passaporte|visa|visto|entry|entrada|consular|tourist|turist|nomad|nomade/.test(text)) return "passport";
      if (/featured|destaque|festival|evento|event|celebrat/.test(text)) return "star";
      if (/success|sucesso|check|ready|pronto|clear|claro|verified|verificado/.test(text)) return "check";
      if (/city|cidade/.test(text)) return "city";
      return fallback;
    }

    function resolveUniqueIconKey(key, used) {
      if (!used.has(key) && !pageUsed.has(key)) return key;

      const alternates = iconAlternatives[key] || [];
      const freshAlternate = alternates.find((candidate) => !used.has(candidate) && !pageUsed.has(candidate));
      if (freshAlternate) return freshAlternate;

      const localAlternate = alternates.find((candidate) => !used.has(candidate));
      if (localAlternate) return localAlternate;

      const freshCycle = iconCycle.find((candidate) => !used.has(candidate) && !pageUsed.has(candidate));
      if (freshCycle) return freshCycle;

      return iconCycle.find((candidate) => !used.has(candidate)) || key;
    }

    function applyTone(node, key) {
      const tone = iconTones[key];
      if (!tone) return;
      node.style.color = tone.color;
      if (
        node.classList.contains("hero-panel-item__icon") ||
        node.classList.contains("hero-badge__icon") ||
        node.classList.contains("page-map__icon")
      ) {
        node.style.background = tone.background;
      }
    }

    function assignIcons(selector, textSelector, fallback) {
      document.querySelectorAll(selector).forEach((node) => {
        const parent = node.parentElement;
        const group = parent?.parentElement;
        const siblings = group ? [...group.querySelectorAll(selector)] : [node];
        const used = new Set(siblings.map((iconNode) => iconNode.dataset.itbIconKey).filter(Boolean));

        siblings.forEach((iconNode) => {
          if (iconNode.dataset.itbIconBound === "true") return;
          const item = iconNode.parentElement;
          const labelNode = textSelector ? item?.querySelector(textSelector) : item;
          const label = labelNode?.textContent?.trim() || item?.textContent?.trim() || "";
          let key = iconKeyFromText(label, fallback);
          key = resolveUniqueIconKey(key, used);
          used.add(key);
          pageUsed.add(key);
          iconNode.innerHTML = iconLibrary[key] || iconLibrary[fallback];
          applyTone(iconNode, key);
          iconNode.dataset.itbIconKey = key;
          iconNode.dataset.itbIconBound = "true";
        });
      });
    }

    assignIcons(".hero-panel-list .hero-panel-item__icon", "span:last-child", "check");
    assignIcons(".hero-badges .hero-badge__icon", "span:last-child", "compass");
    assignIcons(".section-title__icon", "span:last-child", "book");
    assignIcons(".page-map__icon", "span:last-child", "link");
  }

  /* ==========================================================================
   * 17. Sitemap generator control
   * Adds a client-friendly trigger in the footer for local/dev mode.
   * ========================================================================== */
  function initSitemapGenerator() {
    const button = document.getElementById("generate-sitemap-button");
    const status = document.getElementById("sitemap-status");
    if (!button || !status || button.dataset.itbBoundSitemap === "true") return;

    button.addEventListener("click", async () => {
      status.textContent = "Requesting sitemap refresh...";
      try {
        // This endpoint is expected to be handled by deployment or local build tooling.
        const resp = await fetch("/__refresh_sitemap", { method: "POST", credentials: "same-origin" });
        if (resp.ok) {
          status.textContent = "Sitemap refreshed. Fetch /sitemap.xml to confirm.";
          return;
        }
        status.textContent = "Could not refresh sitemap from runtime endpoint. Run `npm run generate:sitemap`.";
      } catch (error) {
        console.error(error);
        status.textContent = "Sitemap generator endpoint is unavailable. Run `npm run generate:sitemap` manually.";
      }
    });

    button.dataset.itbBoundSitemap = "true";
  }

  /* ==========================================================================
   * 18. Public Init API
   * Used both directly and after runtime partial injection.
   * ========================================================================== */
  function initSite() {
    initStickyMetrics();
    initActiveRouteState();
    initNav();
    initAccordion();
    initServicesDirectory();
    initInsightsLeadCapture();
    initAtlasConsultationForm();
    initConsentAndTracking();
    initConsultationPrefill();
    initClientExperienceUi();
    buildPageMap();
    initBackToTop();
    initRevealTargets();
    initIconRefresh();
    initSitemapGenerator();
  }

  /* Shared runtime API registration and non-partial fallback boot. */
  window.ITB = window.ITB || {};
  window.ITB.initSite = initSite;

  if (!window.__ITB_PARTIALS_ACTIVE__) initSite();
})();
