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
    "site-footer",
    "floating-whatsapp",
    "back-to-top",
    "cookie-banner"
  ];

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
  }

  /* ==========================================================================
   * 05. Partial Fetching and Replacement
   * Fetch-and-replace is used instead of nested injection so the DOM shape
   * stays closer to the original authored layout.
   * ========================================================================== */
  async function loadPartialNode(node) {
    const name = node.getAttribute("data-partial");
    if (!name || !PARTIAL_NAMES.includes(name)) return;
    const response = await fetch(`/partials/${getLocale()}/${name}.html`, { credentials: "same-origin" });
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
