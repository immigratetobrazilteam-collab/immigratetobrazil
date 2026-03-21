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

  const PARTIAL_VERSION = "2026-03-20-shared-disclaimer-v1";

  /* ==========================================================================
   * 03. Locale and Route Helpers
   * ========================================================================== */
  function getLocale() {
    return window.location.pathname.startsWith("/pt-br/") ? "pt-br" : "en";
  }

  function buildLanguageRoutes() {
    const path = window.location.pathname;
    const isPt = path.startsWith("/pt-br/");
    return {
      en: isPt ? path.replace(/^\/pt-br/, "") || "/" : path,
      pt: isPt ? path : `/pt-br${path === "/" ? "/" : path}`
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
    const attrs = [`class="${escapeHtml(action.className || "btn btn-secondary btn-sm")}"`, `href="${escapeHtml(action.href || "#")}"`];
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
          return `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
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
          { className: "btn btn-secondary btn-sm", href: "https://wa.me/5543991324028?text=Hello%2C%20Immigrate%20to%20Brazil%20team!", label: "WhatsApp", track: "whatsapp" }
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
        (card) => `<a class="related-card" href="${escapeHtml(card.href)}">
            <strong>${escapeHtml(card.title)}</strong>
            <span>${escapeHtml(card.description)}</span>
          </a>`
      )
      .join("");
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
      ? `<a class="lang-link" data-language-toggle="en" href="${routes.en}" lang="en" hreflang="en">EN</a>
<span aria-hidden="true">|</span>
<a class="lang-link active" data-language-toggle="pt-BR" href="${routes.pt}" lang="pt-BR" hreflang="pt-BR" aria-current="page">PT</a>`
      : `<a class="lang-link active" data-language-toggle="en" href="${routes.en}" lang="en" hreflang="en" aria-current="page">EN</a>
<span aria-hidden="true">|</span>
<a class="lang-link" data-language-toggle="pt-BR" href="${routes.pt}" lang="pt-BR" hreflang="pt-BR">PT</a>`;
  }

  /* Keeps the home link visually aligned with the current route after injection. */
  function setActiveHomeLink(root) {
    const currentPath = window.location.pathname;
    root.querySelectorAll(".main-header__home").forEach((link) => {
      const isActive = link.getAttribute("href") === currentPath;
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

  /* ==========================================================================
   * 05. Partial Fetching and Replacement
   * Fetch-and-replace is used instead of nested injection so the DOM shape
   * stays closer to the original authored layout.
   * ========================================================================== */
  async function loadPartialNode(node) {
    const name = node.getAttribute("data-partial");
    if (!name || !PARTIAL_NAMES.includes(name)) return;
    const response = await fetch(`/partials/${getLocale()}/${name}.html?v=${encodeURIComponent(PARTIAL_VERSION)}`, {
      credentials: "same-origin",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Failed to load partial: ${name}`);
    const html = await response.text();
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const fragment = template.content;
    hydratePartial(fragment);
    node.replaceWith(fragment);
  }

  /* ==========================================================================
   * 06. Boot Sequence
   * Shared initializers remain idempotent so this can run safely after
   * injection as well as on pages without any partial placeholders.
   * ========================================================================== */
  async function initPartials() {
    const placeholders = [...document.querySelectorAll("[data-partial]")];
    if (!placeholders.length) {
      window.ITB?.initAccessibility?.();
      window.ITB?.initSite?.();
      window.ITB?.initSearch?.();
      return;
    }
    for (const node of placeholders) {
      await loadPartialNode(node);
    }
    window.ITB?.initAccessibility?.();
    window.ITB?.initSite?.();
    window.ITB?.initSearch?.();
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
