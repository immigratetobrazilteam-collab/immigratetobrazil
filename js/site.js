(function () {
  /* ==========================================================================
   * 01. Shared Site Runtime
   * These behaviors may run more than once after runtime partial injection, so
   * the module keeps its own observer/listener state and idempotent bindings.
   * ========================================================================== */
  const consentKey = "itb-consent";
  let gtmLoaded = false;
  let stickyObserver = null;
  let scrollBound = false;
  let escapeBound = false;
  let outsideClickBound = false;
  let resizeFallbackBound = false;
  let revealObserver = null;

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

  /* ==========================================================================
   * 03. Config and Analytics Helpers
   * ========================================================================== */
  function getConfig() {
    return window.ITB_SITE || {};
  }

  function loadGtm() {
    const config = getConfig();
    if (gtmLoaded || !config.tracking?.gtmId) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${config.tracking.gtmId}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "gtm.js",
      page_title: config.pageTitle,
      page_route: config.pageRoute,
      ga4_id: config.tracking.ga4Id
    });
    window.dataLayer.push({
      event: "page_view",
      page_title: config.pageTitle,
      page_path: config.pageRoute,
      page_location: window.location.href
    });
    gtmLoaded = true;
  }

  function track(eventName, payload) {
    if (!gtmLoaded) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
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
   * Consent gating, GTM loading, and shared analytics click bindings.
   * ========================================================================== */
  function initConsentAndTracking() {
    const config = getConfig();
    if (localStorage.getItem(consentKey) === "accepted") loadGtm();

    const cookieBanner = document.querySelector("[data-cookie-banner]");
    const syncCookieBannerVisibility = () => {
      if (!cookieBanner) return;
      const suppressOnMobileHome =
        document.body.classList.contains("page-home") && window.matchMedia("(max-width: 767px)").matches;
      cookieBanner.hidden = Boolean(localStorage.getItem(consentKey)) || suppressOnMobileHome;
    };

    syncCookieBannerVisibility();

    if (cookieBanner && cookieBanner.dataset.itbBoundConsentViewport !== "true") {
      const viewportQuery = window.matchMedia("(max-width: 767px)");
      const handleViewportChange = () => syncCookieBannerVisibility();

      if (typeof viewportQuery.addEventListener === "function") viewportQuery.addEventListener("change", handleViewportChange);
      else if (typeof viewportQuery.addListener === "function") viewportQuery.addListener(handleViewportChange);

      cookieBanner.dataset.itbBoundConsentViewport = "true";
    }

    document.querySelectorAll("[data-consent]").forEach((button) => {
      if (button.dataset.itbBoundConsent === "true") return;
      button.addEventListener("click", () => {
        const choice = button.getAttribute("data-consent");
        localStorage.setItem(consentKey, choice === "accept" ? "accepted" : "declined");
        syncCookieBannerVisibility();
        if (choice === "accept") {
          loadGtm();
          track("analytics_consent_granted", { page_route: config.pageRoute });
        }
      });
      button.dataset.itbBoundConsent = "true";
    });

    /* Selector-driven event binding keeps shared partial content trackable. */
    const clickBindings = [
      ["[data-whatsapp-click]", "itbBoundWhatsapp", () => ({
        event: "whatsapp_click",
        payload: { page_route: config.pageRoute, page_title: config.pageTitle }
      })],
      ["[data-cta-click]", "itbBoundCta", (node) => ({
        event: "cta_click",
        payload: { page_route: config.pageRoute, cta_text: node.textContent.trim() }
      })],
      ["[data-language-toggle]", "itbBoundLang", (node) => ({
        event: "language_toggle_click",
        payload: { page_route: config.pageRoute, language: node.getAttribute("data-language-toggle") }
      })],
      ["[data-search-open='true']", "itbBoundSearchOpen", () => ({
        event: "search_open",
        payload: { page_route: config.pageRoute }
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

    document.querySelectorAll("form[action*='formspree']").forEach((form) => {
      if (form.dataset.itbBoundForm === "true") return;
      form.addEventListener("submit", () => {
        track("form_submit", {
          page_route: config.pageRoute,
          action: form.getAttribute("action"),
          group: form.getAttribute("data-formspree-group")
        });
      });
      form.dataset.itbBoundForm = "true";
    });
  }

  /* ==========================================================================
   * 10. Client Experience UI
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
   * 11. Scroll-State UI
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
      const showThreshold = Math.max(200, Math.min(360, Math.round(window.innerHeight * 0.35)));
      const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollRatio = Math.max(0, Math.min(1, window.scrollY / scrollableHeight));
      body.classList.toggle("is-scrolled", window.scrollY > 16);
      liveButton?.classList.toggle("is-visible", window.scrollY > showThreshold);
      liveButton?.style.setProperty("--back-to-top-progress", scrollRatio.toFixed(4));
      progressBar?.style.setProperty("--scroll-progress", scrollRatio.toFixed(4));
      progressBar?.classList.toggle("is-active", scrollRatio > 0.01);
    }

    if (!scrollBound) {
      window.addEventListener("scroll", onScroll, { passive: true });
      scrollBound = true;
    }
    onScroll();
  }

  /* ==========================================================================
   * 12. Reveal-On-Scroll
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
   * 13. Shared Icon Refresh
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
   * 14. Sitemap generator control
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
   * 15. Public Init API
   * Used both directly and after runtime partial injection.
   * ========================================================================== */
  function initSite() {
    initStickyMetrics();
    initActiveRouteState();
    initNav();
    initAccordion();
    initConsentAndTracking();
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
