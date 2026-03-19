(function () {
  const config = window.ITB_SITE || {};
  const body = document.body;
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

  function setNavOpen(isOpen) {
    if (!navbarToggle || !navbarCollapse) return;
    navbarCollapse.classList.toggle("show", isOpen);
    navbarToggle.setAttribute("aria-expanded", String(isOpen));
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
  onScroll();

  const revealTargets = document.querySelectorAll(
    ".content-block, .official-resources, .faq-block, .related-block, .hero-panel, .hero-glance-card, .sidebar-card, .quick-scan__panel, .marker, .info-card, .resource-card, .related-card, .quote-card, .footer-panel, .footer-bottom, .footer-meta"
  );
  revealTargets.forEach((node, index) => {
    node.classList.add("reveal");
    node.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 40, 200)}ms`);
  });

  if (!body.classList.contains("reduced-motion") && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach((node) => observer.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
  }
})();
