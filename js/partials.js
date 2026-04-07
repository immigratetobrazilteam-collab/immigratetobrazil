(function () {
  /* ==========================================================================
   * 01. Runtime Partial Loader
   * Replaces placeholder nodes with locale-aware shared HTML partials and then
   * re-runs the shared JS initializers once the shell is present in the DOM.
   * ========================================================================== */
  window.__ITB_PARTIALS_ACTIVE__ = true;

  /* ==========================================================================
   * 02. Allowed Shared Partials
   * ========================================================================== */
  const PARTIAL_NAMES = [
    "gtm-noscript",
    "utility-bar",
    "accessibility-panel",
    "site-navigation",
    "breadcrumbs",
    "sidebar-shell",
    "official-resources",
    "related-links",
    "site-footer",
    "disclaimer",
    "floating-whatsapp",
    "back-to-top",
    "cookie-banner",
    "search-results",
    "newsletter-signup",
    "pagination",
    "social-sharing",
    "loading-state",
    "error-page",
    "comments-system",
    "testimonials",
    "next-steps"
  ];

  const PARTIAL_VERSION = "2026-04-07-nina-chatbot-v4";
  const URL_ATTRS = ["href", "src", "action", "poster"];
  const ABSOLUTE_URL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i;
  const sharedScriptPromises = new Map();

  /* ==========================================================================
   * 03. Locale and Route Helpers
   * ========================================================================== */
  function getCanonicalPath() {
    const canonical = document.querySelector("link[rel='canonical']")?.getAttribute("href");
    if (!canonical) return null;
    try {
      return new URL(canonical).pathname || "/";
    } catch {
      return null;
    }
  }

  function normalizeSitePath(pathname) {
    if (!pathname) return "/";
    let clean = String(pathname).trim();
    if (!clean) return "/";
    clean = clean.replace(/\/index\.html$/i, "/");
    if (!clean.startsWith("/")) clean = `/${clean}`;
    if (!clean.endsWith("/") && !/\.[a-z0-9]+$/i.test(clean)) clean = `${clean}/`;
    return clean;
  }

  function getSitePath() {
    return normalizeSitePath(getCanonicalPath() || window.location.pathname || "/");
  }

  function getRootPrefix() {
    const parts = getSitePath().replace(/^\/|\/$/g, "").split("/").filter(Boolean);
    return parts.length ? "../".repeat(parts.length) : "./";
  }

  function getLocale() {
    const path = getSitePath();
    return path === "/pt-br/" || path.startsWith("/pt-br/") ? "pt-br" : "en";
  }

  function resolveSiteUrl(value) {
    if (!value) return value;
    const raw = String(value);
    if (ABSOLUTE_URL_RE.test(raw)) return raw;
    if (!raw.startsWith("/")) return raw;
    return `${getRootPrefix()}${raw.replace(/^\/+/, "")}`;
  }

  function resolveStyleUrls(value) {
    return String(value).replace(/url\((['"]?)\/([^'")]+)\1\)/g, (_match, quote, path) => {
      const wrappedQuote = quote || "";
      return `url(${wrappedQuote}${resolveSiteUrl(`/${path}`)}${wrappedQuote})`;
    });
  }

  function rewriteSrcset(value) {
    return value
      .split(",")
      .map((entry) => {
        const trimmed = entry.trim();
        if (!trimmed) return trimmed;
        const [url, descriptor] = trimmed.split(/\s+/, 2);
        if (!url?.startsWith("/")) return trimmed;
        return [resolveSiteUrl(url), descriptor].filter(Boolean).join(" ");
      })
      .join(", ");
  }

  function rewriteNodeUrls(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll("*").forEach((node) => {
      URL_ATTRS.forEach((attr) => {
        const value = node.getAttribute(attr);
        if (!value?.startsWith("/")) return;
        if (attr === "href" || attr === "action") node.setAttribute("data-itb-route", value);
        node.setAttribute(attr, resolveSiteUrl(value));
      });

      const srcset = node.getAttribute("srcset");
      if (srcset?.includes("/")) node.setAttribute("srcset", rewriteSrcset(srcset));

      const style = node.getAttribute("style");
      if (style?.includes("url(")) node.setAttribute("style", resolveStyleUrls(style));
    });
  }

  function buildLanguageRoutes() {
    const path = getSitePath();
    const isPt = path === "/pt-br/" || path.startsWith("/pt-br/");
    return {
      en: isPt ? normalizeSitePath(path.replace(/^\/pt-br/, "") || "/") : path,
      pt: isPt ? path : normalizeSitePath(`/pt-br${path === "/" ? "/" : path}`)
    };
  }

  function getShellConfig() {
    return window.ITB_SITE?.shell || {};
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderActionAttributes(action) {
    const href = resolveSiteUrl(action.href || "#");
    const attrs = [
      `class="${escapeHtml(action.className || "btn btn-secondary btn-sm")}"`,
      `href="${escapeHtml(href)}"`
    ];
    if ((action.href || "").startsWith("/")) attrs.push(`data-itb-route="${escapeHtml(action.href)}"`);
    if (action.track === "cta") attrs.push('data-cta-click="true"');
    if (action.track === "whatsapp") attrs.push('data-whatsapp-click="true"');
    return attrs.join(" ");
  }

  function hydrateBreadcrumbs(root) {
    const nav = root.querySelector("[data-breadcrumbs='true']");
    if (!nav) return;
    const items = getShellConfig().breadcrumbs || [];
    if (!items.length) {
      nav.hidden = true;
      return;
    }

    const list = nav.querySelector("ol");
    if (!list) return;
    list.innerHTML = items
      .map((item) => {
        if (item.href && !item.current) {
          return `<li><a href="${escapeHtml(resolveSiteUrl(item.href))}" data-itb-route="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
        }
        return `<li aria-current="page">${escapeHtml(item.label)}</li>`;
      })
      .join("");
  }

  function hydrateSidebarShell(root) {
    const sidebar = root.querySelector(".sidebar-column");
    if (!sidebar) return;

    const sidebarConfig = getShellConfig().sidebar || {};
    const brandNote = sidebar.querySelector(".sidebar-card--brand .sidebar-note");
    if (brandNote) {
      brandNote.textContent = sidebarConfig.brand?.note || "";
      brandNote.parentElement.hidden = !brandNote.textContent.trim();
    }

    const actionCard = sidebar.querySelector(".sidebar-card--action");
    if (actionCard) {
      const title = actionCard.querySelector(".section-title span:nth-child(2)");
      const lead = actionCard.querySelector("p:not(.sidebar-note)");
      const actions = actionCard.querySelector(".sidebar-actions");
      const note = actionCard.querySelector(".sidebar-note");
      const actionConfig = sidebarConfig.nextStep || {};

      const defaultNextStep = {
        title: "Next steps",
        lead: "Immigration Consultation",
        actions: [
          { className: "btn btn-cta btn-sm", href: "/start-consultation/", label: "Start Consultation", track: "cta" },
          { className: "btn btn-secondary btn-sm", href: "https://api.whatsapp.com/send/?phone=554399614034&text=Hello+I+would+like+to+talk+to+attorney+Monique&type=phone_number&app_absent=0", label: "WhatsApp", track: "whatsapp" }
        ],
        note: "Your pathway to Brazil."
      };

      const nextStep = {
        title: actionConfig.title?.trim() ? actionConfig.title : defaultNextStep.title,
        lead: actionConfig.lead?.trim() ? actionConfig.lead : defaultNextStep.lead,
        actions: Array.isArray(actionConfig.actions) && actionConfig.actions.length ? actionConfig.actions : defaultNextStep.actions,
        note: actionConfig.note?.trim() ? actionConfig.note : defaultNextStep.note
      };

      if (title) title.textContent = nextStep.title;
      if (lead) lead.textContent = nextStep.lead;
      if (actions) {
        actions.innerHTML = nextStep.actions
          .map((action) => `<a ${renderActionAttributes(action)}>${escapeHtml(action.label)}</a>`)
          .join("");
      }
      if (note) note.textContent = nextStep.note;

      const hasActionContent =
        Boolean(nextStep.lead?.trim()) ||
        Boolean(nextStep.note?.trim()) ||
        Boolean(nextStep.actions?.length);
      actionCard.hidden = !hasActionContent;
    }
  }

  function hydrateOfficialResources(root) {
    const section = root.querySelector("[data-official-resources='true']");
    if (!section) return;
    const cards = getShellConfig().officialResources || [];
    const grid = section.querySelector(".resource-grid");
    if (!grid || !cards.length) {
      section.hidden = true;
      return;
    }

    grid.innerHTML = cards
      .map(
        (card) => `<article class="resource-card">
            <h3><a href="${escapeHtml(card.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.title)}</a></h3>
            <p>${escapeHtml(card.description)}</p>
          </article>`
      )
      .join("");
  }

  function hydrateRelatedLinks(root) {
    const section = root.querySelector("[data-related-links='true']");
    if (!section) return;
    const cards = getShellConfig().relatedLinks || [];
    const grid = section.querySelector(".related-grid");
    if (!grid || !cards.length) {
      section.hidden = true;
      return;
    }

    grid.innerHTML = cards
      .map(
        (card) => `<a class="related-card" href="${escapeHtml(resolveSiteUrl(card.href))}" data-itb-route="${escapeHtml(card.href)}">
            ${card.image_src ? `<img class="related-card__media" src="${escapeHtml(card.image_src)}" alt="${escapeHtml(card.image_alt || card.title)}" loading="lazy" decoding="async" />` : ""}
            <strong>${escapeHtml(card.title)}</strong>
            <span>${escapeHtml(card.description)}</span>
          </a>`
      )
      .join("");
  }

  function createLanguageLink(route, label, lang, isActive) {
    const currentAttr = isActive ? ' aria-current="page"' : "";
    const activeClass = isActive ? " active" : "";
    return `<a class="lang-link${activeClass}" data-language-toggle="${escapeHtml(lang)}" data-itb-route="${escapeHtml(route)}" href="${escapeHtml(
      resolveSiteUrl(route)
    )}" lang="${escapeHtml(lang)}" hreflang="${escapeHtml(lang)}"${currentAttr}>${escapeHtml(label)}</a>`;
  }

  /* ==========================================================================
   * 04. Post-Injection Hydration
   * ========================================================================== */
  function updateLanguageSwitcher(root) {
    const switcher = root.querySelector(".lang-switcher");
    if (!switcher) return;
    const routes = buildLanguageRoutes();
    const isPt = getLocale() === "pt-br";
    switcher.setAttribute("aria-label", isPt ? "Alternador de idioma" : "Language switcher");
    switcher.innerHTML = isPt
      ? `${createLanguageLink(routes.en, "EN", "en", false)}
<span aria-hidden="true">|</span>
${createLanguageLink(routes.pt, "PT", "pt-BR", true)}`
      : `${createLanguageLink(routes.en, "EN", "en", true)}
<span aria-hidden="true">|</span>
${createLanguageLink(routes.pt, "PT", "pt-BR", false)}`;
  }

  function setActiveHomeLink(root) {
    const currentPath = getSitePath();
    root.querySelectorAll(".main-header__home").forEach((link) => {
      const linkRoute = normalizeSitePath(link.getAttribute("data-itb-route") || "");
      const isActive = Boolean(linkRoute) && linkRoute === currentPath;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function hydratePartial(root) {
    updateLanguageSwitcher(root);
    setActiveHomeLink(root);
    hydrateBreadcrumbs(root);
    hydrateSidebarShell(root);
    hydrateOfficialResources(root);
    hydrateRelatedLinks(root);
  }

  window.ITB_URLS = window.ITB_URLS || {
    getSitePath,
    getLocale,
    getRootPrefix,
    normalizeSitePath,
    resolveSiteUrl,
    rewriteNodeUrls
  };

  /* ==========================================================================
   * 05. Partial Fetching and Replacement
   * Fetch-and-replace is used instead of nested injection so the DOM shape
   * stays closer to the original authored layout.
   * ========================================================================== */
  async function loadPartialNode(node) {
    const name = node.getAttribute("data-partial");
    if (!name || !PARTIAL_NAMES.includes(name)) return;
    const response = await fetch(resolveSiteUrl(`/partials/${getLocale()}/${name}.html?v=${encodeURIComponent(PARTIAL_VERSION)}`), {
      credentials: "same-origin",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Failed to load partial: ${name}`);
    const html = await response.text();
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const fragment = template.content;
    rewriteNodeUrls(fragment);
    hydratePartial(fragment);
    node.replaceWith(fragment);
  }

  function ensureSharedScript(name, src) {
    if (!name || !src) return Promise.resolve();
    if (sharedScriptPromises.has(name)) return sharedScriptPromises.get(name);

    const existing = document.querySelector(`script[data-itb-shared-script="${name}"]`);
    if (existing?.dataset.loaded === "true") return Promise.resolve();

    const pending = new Promise((resolve, reject) => {
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Failed to load shared script: ${name}`)), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.defer = true;
      script.dataset.itbSharedScript = name;
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          resolve();
        },
        { once: true }
      );
      script.addEventListener("error", () => reject(new Error(`Failed to load shared script: ${name}`)), { once: true });
      document.head.appendChild(script);
    }).finally(() => {
      sharedScriptPromises.delete(name);
    });

    sharedScriptPromises.set(name, pending);
    return pending;
  }

  function ensureGlobalUtilityPlaceholders() {
    const body = document.body;
    if (!body) return;

    const requiredPartials = [
      { name: "floating-whatsapp", selector: ".floating-whatsapp" },
      { name: "back-to-top", selector: "[data-back-to-top='true']" },
      { name: "cookie-banner", selector: "[data-cookie-banner='true']" }
    ];

    const insertionPoint = body.querySelector("script");
    requiredPartials.forEach(({ name, selector }) => {
      if (body.querySelector(`[data-partial="${name}"]`) || body.querySelector(selector)) return;
      const placeholder = document.createElement("div");
      placeholder.setAttribute("data-partial", name);
      if (insertionPoint) body.insertBefore(placeholder, insertionPoint);
      else body.appendChild(placeholder);
    });
  }

  /* ==========================================================================
   * 06. Boot Sequence
   * Shared initializers remain idempotent so this can run safely after
   * injection as well as on pages without any partial placeholders.
   * ========================================================================== */
  async function initPartials() {
    ensureGlobalUtilityPlaceholders();
    await ensureSharedScript("asha-chat", resolveSiteUrl(`/js/asha-chat.js?v=${encodeURIComponent(PARTIAL_VERSION)}`));
    const placeholders = [...document.querySelectorAll("[data-partial]")];
    if (!placeholders.length) {
      window.ITB?.initAccessibility?.();
      window.ITB?.initSite?.();
      window.ITB?.initSearch?.();
      window.ITB?.initAshaChat?.();
      return;
    }
    for (const node of placeholders) {
      await loadPartialNode(node);
    }
    window.ITB?.initAccessibility?.();
    window.ITB?.initSite?.();
    window.ITB?.initSearch?.();
    window.ITB?.initAshaChat?.();
  }

  /* ==========================================================================
   * 07. DOM-Ready Bootstrap
   * ========================================================================== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initPartials().catch((error) => console.error(error));
    });
  } else {
    initPartials().catch((error) => console.error(error));
  }
})();
