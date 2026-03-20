(function () {
  const config = window.ITB_SITE || {};
  const body = document.body;
  const docEl = document.documentElement;
  const consentKey = "itb-consent";
  const analyticsAccepted = localStorage.getItem(consentKey) === "accepted";
  let gtmLoaded = false;

  function loadGtm() {
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

  if (analyticsAccepted) {
    loadGtm();
  }

  function track(eventName, payload) {
    if (!gtmLoaded) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
  }

  const navbarToggle = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.getElementById("site-nav");
  const utilityBar = document.querySelector(".utility-bar");
  const mainNav = document.querySelector(".main-nav");

  function updateStickyMetrics() {
    const utilityHeight = utilityBar ? Math.round(utilityBar.getBoundingClientRect().height) : 0;
    const navHeight = mainNav ? Math.round(mainNav.getBoundingClientRect().height) : 0;
    docEl.style.setProperty("--utility-bar-height", `${utilityHeight}px`);
    docEl.style.setProperty("--main-nav-height", `${navHeight}px`);
  }

  function setNavOpen(isOpen) {
    if (!navbarToggle || !navbarCollapse) return;
    navbarCollapse.classList.toggle("show", isOpen);
    navbarToggle.setAttribute("aria-expanded", String(isOpen));
    window.requestAnimationFrame(updateStickyMetrics);
  }

  updateStickyMetrics();

  if ("ResizeObserver" in window) {
    const stickyObserver = new ResizeObserver(() => {
      updateStickyMetrics();
    });
    if (utilityBar) stickyObserver.observe(utilityBar);
    if (mainNav) stickyObserver.observe(mainNav);
  } else {
    window.addEventListener("resize", updateStickyMetrics);
  }

  navbarToggle?.addEventListener("click", () => {
    setNavOpen(!navbarCollapse?.classList.contains("show"));
  });

  navbarCollapse?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1200) {
        setNavOpen(false);
      }
    });
  });

  const dropdowns = document.querySelectorAll(".main-nav .nav-item.dropdown");

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
    if (!toggle || !menu) return;

    function openDropdown() {
      closeDropdowns(dropdown);
      dropdown.classList.add("show");
      menu.classList.add("show");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
      dropdown.classList.remove("show");
      menu.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", (event) => {
      if (window.innerWidth < 1200) return;
      event.preventDefault();
      if (dropdown.classList.contains("show")) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".main-nav")) {
      closeDropdowns();
    }
  });

  function closeAccordion(panel) {
    panel.classList.remove("show");
    const button = document.querySelector(`[data-bs-target="#${panel.id}"]`);
    button?.classList.add("collapsed");
    button?.setAttribute("aria-expanded", "false");
  }

  document.querySelectorAll(".accordion-button[data-bs-target]").forEach((button) => {
    const targetSelector = button.getAttribute("data-bs-target");
    if (!targetSelector) return;
    const panel = document.querySelector(targetSelector);
    if (!panel) return;

    button.addEventListener("click", () => {
      const isOpen = panel.classList.contains("show");
      const parentSelector = panel.getAttribute("data-bs-parent");
      if (parentSelector) {
        document.querySelectorAll(`${parentSelector} .accordion-collapse.show`).forEach((openPanel) => {
          if (openPanel !== panel) closeAccordion(openPanel);
        });
      }
      panel.classList.toggle("show", !isOpen);
      button.classList.toggle("collapsed", isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdowns();
      setNavOpen(false);
    }
  });

  const cookieBanner = document.querySelector("[data-cookie-banner]");
  if (cookieBanner && !localStorage.getItem(consentKey)) {
    cookieBanner.hidden = false;
  }

  document.querySelectorAll("[data-consent]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.getAttribute("data-consent");
      localStorage.setItem(consentKey, choice === "accept" ? "accepted" : "declined");
      cookieBanner.hidden = true;
      if (choice === "accept") {
        loadGtm();
        track("analytics_consent_granted", { page_route: config.pageRoute });
      }
    });
  });

  document.querySelectorAll("[data-whatsapp-click]").forEach((link) => {
    link.addEventListener("click", () => {
      track("whatsapp_click", { page_route: config.pageRoute, page_title: config.pageTitle });
    });
  });

  document.querySelectorAll("[data-cta-click]").forEach((link) => {
    link.addEventListener("click", () => {
      track("cta_click", { page_route: config.pageRoute, cta_text: link.textContent.trim() });
    });
  });

  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      track("language_toggle_click", {
        page_route: config.pageRoute,
        language: button.getAttribute("data-language-toggle")
      });
    });
  });

  document.querySelectorAll("form[action*='formspree']").forEach((form) => {
    form.addEventListener("submit", () => {
      track("form_submit", {
        page_route: config.pageRoute,
        action: form.getAttribute("action"),
        group: form.getAttribute("data-formspree-group")
      });
    });
  });

  document.querySelectorAll("[data-search-open='true']").forEach((link) => {
    link.addEventListener("click", () => {
      track("search_open", { page_route: config.pageRoute });
    });
  });

  const backToTop = document.querySelector("[data-back-to-top='true']");
  const onScroll = () => {
    body.classList.toggle("is-scrolled", window.scrollY > 16);
    if (window.scrollY > 420) {
      backToTop?.classList.add("is-visible");
    } else {
      backToTop?.classList.remove("is-visible");
    }
  };

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: body.classList.contains("reduced-motion") ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", updateStickyMetrics);
  onScroll();

  const pageMapLocale = {
    en: {
      title: "Quick navigation",
      strap: "Move directly to the question that matters."
    },
    pt: {
      title: "Navega\u00e7\u00e3o r\u00e1pida",
      strap: "Dirija-se directamente \u00e0 pergunta que importa."
    }
  };
  const pageMapArrowIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.2 5.3 6 6-6 6-1.4-1.4 3.6-3.6H4v-2h11.4l-3.6-3.6 1.4-1.4Z" fill="currentColor"/></svg>';
  const pageMapCompassIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 5.3-6.2 2.5-2.5 6.2 6.2-2.5 2.5-6.2Zm-4.05 4.05 1 1-2.3.92.92-2.3.38.38Z" fill="currentColor"/></svg>';

  function normalizePageMapText(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function slugifyPageMapLabel(label) {
    const slug = label
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "section";
  }

  function getPageMapLocaleCopy() {
    return (docEl.lang || "").toLowerCase().startsWith("pt") ? pageMapLocale.pt : pageMapLocale.en;
  }

  function findPageMapHeading(section) {
    return [...section.querySelectorAll("h2")].find((heading) => heading.closest("section") === section);
  }

  function isEligiblePageMapSection(section) {
    if (!(section instanceof HTMLElement)) return false;
    if (section.closest(".sidebar-column, .sidebar-card, .page-map")) return false;
    if (section.matches(".page-map, .site-disclaimer")) return false;
    if (section.hidden || section.getAttribute("aria-hidden") === "true") return false;
    const heading = findPageMapHeading(section);
    if (!heading) return false;
    return Boolean(normalizePageMapText(heading.textContent || ""));
  }

  function createPageMapIdState(root) {
    const owners = new Map();
    root.querySelectorAll("[id]").forEach((node) => {
      const id = node.id.trim();
      if (id && !owners.has(id)) owners.set(id, node);
    });
    return {
      claimed: new Set(),
      owners
    };
  }

  function reservePageMapId(candidate, state, section) {
    return state.claimed.has(candidate) || (state.owners.has(candidate) && state.owners.get(candidate) !== section);
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
    while (reservePageMapId(candidate, state, section)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    section.id = candidate;
    state.claimed.add(candidate);
    state.owners.set(candidate, section);
    return candidate;
  }

  function collectPageMapEntries(main) {
    const idState = createPageMapIdState(document);
    let hasPrimaryForm = false;

    return [...main.querySelectorAll("section")]
      .filter(isEligiblePageMapSection)
      .flatMap((section) => {
        if (section.matches(".lead-form-block")) {
          if (hasPrimaryForm) {
            const currentId = section.id.trim();
            if (currentId === "consultation-form" && idState.owners.get(currentId) !== section) {
              ensurePageMapSectionId(section, "consultation-form follow up", idState);
            }
            return [];
          }
          hasPrimaryForm = true;
        }

        const heading = findPageMapHeading(section);
        const label = normalizePageMapText(heading?.textContent || "");
        if (!label) return [];

        const id = ensurePageMapSectionId(section, label, idState);
        return id ? [{ id, label }] : [];
      });
  }

  function createPageMapHead(copy) {
    const head = document.createElement("div");
    head.className = "page-map__head";

    const title = document.createElement("h2");
    title.className = "section-title page-map__title";

    const icon = document.createElement("span");
    icon.className = "section-title__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = pageMapCompassIcon;

    const titleText = document.createElement("span");
    titleText.textContent = copy.title;

    title.append(icon, titleText);

    const strap = document.createElement("p");
    strap.textContent = copy.strap;

    head.append(title, strap);
    return head;
  }

  function createPageMapLink(entry) {
    const link = document.createElement("a");
    link.className = "page-map__link";
    link.href = `#${entry.id}`;

    const icon = document.createElement("span");
    icon.className = "page-map__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = pageMapArrowIcon;

    const label = document.createElement("span");
    label.textContent = entry.label;

    link.append(icon, label);
    return link;
  }

  function ensurePageMapContainer(copy) {
    const mapCard = document.querySelector(".sidebar-card--map");
    if (!mapCard) return null;

    let pageMap = mapCard.querySelector(".page-map");
    if (!pageMap) {
      pageMap = document.createElement("section");
      pageMap.className = "page-map page-map--compact";
      pageMap.id = "page-map";
      mapCard.replaceChildren(pageMap);
    }

    if (!pageMap.querySelector(".page-map__head")) {
      pageMap.append(createPageMapHead(copy));
    }

    let links = pageMap.querySelector(".page-map__links");
    if (!links) {
      links = document.createElement("div");
      links.className = "page-map__links";
      pageMap.append(links);
    }

    return { mapCard, links };
  }

  function buildPageMap() {
    const main = document.getElementById("main-content");
    if (!main) return;

    const entries = collectPageMapEntries(main);
    const copy = getPageMapLocaleCopy();
    const container = ensurePageMapContainer(copy);
    if (!container) return;

    container.links.replaceChildren(...entries.map(createPageMapLink));
    container.mapCard.hidden = entries.length === 0;
  }

  buildPageMap();

  const revealTargets = [
    ...document.querySelectorAll(
      ".content-block, .official-resources, .faq-block, .related-block, .hero-panel, .hero-glance-card, .sidebar-card, .marker, .info-card, .resource-card, .related-card, .quote-card, .footer-panel, .footer-bottom, .footer-meta"
    )
  ];

  function revealNearViewport() {
    const preloadBoundary = window.innerHeight * 1.18;
    revealTargets.forEach((node) => {
      if (node.classList.contains("is-visible")) return;
      if (node.getBoundingClientRect().top <= preloadBoundary) {
        node.classList.add("is-visible");
      }
    });
  }

  revealTargets.forEach((node) => {
    node.classList.add("reveal");
  });

  if (!body.classList.contains("reduced-motion") && "IntersectionObserver" in window) {
    revealNearViewport();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "12% 0px 18% 0px"
      }
    );

    revealTargets.forEach((node) => {
      if (!node.classList.contains("is-visible")) {
        observer.observe(node);
      }
    });
  } else {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
  }
})();
