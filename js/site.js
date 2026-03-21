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
    const words = label.split(' ');
    return words[0] || label;
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
  function findPageMapHeading(section) {
    return [...section.querySelectorAll("h2")].find((heading) => heading.closest("section") === section) || null;
  }

  function isEligiblePageMapSection(section) {
    if (!(section instanceof HTMLElement)) return false;
    if (section.closest(".sidebar-column, .sidebar-card, .page-map")) return false;
    if (section.matches(".page-map, .site-disclaimer")) return false;
    if (section.hidden || section.getAttribute("aria-hidden") === "true") return false;
    const heading = findPageMapHeading(section);
    const label = normalizePageMapText(heading?.textContent || "");
    if (!label) return false;
    // Exclude specific sections that appear weird
    if (label.toLowerCase().includes("official resources") || label.toLowerCase().includes("see also")) return false;
    return true;
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
    let hasPrimaryForm = false;
    const entries = [...main.querySelectorAll("section")]
      .filter(isEligiblePageMapSection)
      .flatMap((section) => {
        if (section.matches(".lead-form-block")) {
          if (hasPrimaryForm) return [];
          hasPrimaryForm = true;
        }
        const heading = findPageMapHeading(section);
        const label = normalizePageMapText(heading?.textContent || "");
        if (!label) return [];
        return [{ id: ensurePageMapSectionId(section, label, state), label: shortenPageMapLabel(label) }];
      });

    if (!entries.length) {
      mapCard.hidden = true;
      return;
    }

    // Add manual entries for partials
    entries.push({ id: 'official-resources', label: 'Official' });
    entries.push({ id: 'testimonials', label: 'See' });
    entries.push({ id: 'newsletter-signup', label: 'Updates' });
    entries.push({ id: 'social-sharing', label: 'Share' });
    entries.push({ id: 'disclaimer', label: 'Disclaimer' });

    const copy = getPageMapLocaleCopy();
    mapCard.hidden = false;
    mapCard.innerHTML = `<section class="page-map page-map--compact" id="page-map">
  <div class="page-map__head">
    <h2 class="section-title page-map__title"><span class="section-title__icon" aria-hidden="true">${pageMapCompassIcon}</span><span>${copy.title}</span></h2>
    <p>${copy.strap}</p>
  </div>
  <div class="page-map__links">
    ${entries
      .map(
        (entry) =>
          `<a class="page-map__link" href="#${entry.id}"><span class="page-map__icon" aria-hidden="true">${pageMapArrowIcon}</span><span>${entry.label}</span></a>`
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
        closeDropdowns(dropdown);
        if (!open) {
          dropdown.classList.add("show");
          menu.classList.add("show");
          toggle.setAttribute("aria-expanded", "true");
        }
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
    if (cookieBanner && !localStorage.getItem(consentKey)) cookieBanner.hidden = false;

    document.querySelectorAll("[data-consent]").forEach((button) => {
      if (button.dataset.itbBoundConsent === "true") return;
      button.addEventListener("click", () => {
        const choice = button.getAttribute("data-consent");
        localStorage.setItem(consentKey, choice === "accept" ? "accepted" : "declined");
        if (cookieBanner) cookieBanner.hidden = true;
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
   * 10. Scroll-State UI
   * Floating back-to-top behavior and sticky-shell scroll classes.
   * ========================================================================== */
  function initBackToTop() {
    const body = document.body;
    const button = document.querySelector("[data-back-to-top='true']");
    if (button && button.dataset.itbBoundBackToTop !== "true") {
      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: body.classList.contains("reduced-motion") ? "auto" : "smooth" });
      });
      button.dataset.itbBoundBackToTop = "true";
    }

    function onScroll() {
      const liveButton = document.querySelector("[data-back-to-top='true']");
      body.classList.toggle("is-scrolled", window.scrollY > 16);
      liveButton?.classList.toggle("is-visible", window.scrollY > 420);
    }

    if (!scrollBound) {
      window.addEventListener("scroll", onScroll, { passive: true });
      scrollBound = true;
    }
    onScroll();
  }

  /* ==========================================================================
   * 11. Reveal-On-Scroll
   * Footer sections stay out to avoid partial-load visibility issues.
   * ========================================================================== */
  function initRevealTargets() {
    const body = document.body;
    const revealTargets = [
      ...document.querySelectorAll(
        ".content-block, .official-resources, .faq-block, .related-block, .hero-panel, .hero-glance-card, .sidebar-card, .marker, .info-card, .resource-card, .related-card, .quote-card"
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
   * 12. Sitemap generator control
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
   * 13. Public Init API
   * Used both directly and after runtime partial injection.
   * ========================================================================== */
  function initSite() {
    initStickyMetrics();
    initNav();
    initAccordion();
    initConsentAndTracking();
    buildPageMap();
    initBackToTop();
    initRevealTargets();
    initSitemapGenerator();
  }

  /* Shared runtime API registration and non-partial fallback boot. */
  window.ITB = window.ITB || {};
  window.ITB.initSite = initSite;

  if (!window.__ITB_PARTIALS_ACTIVE__) initSite();
})();
