(function () {
  /* ==========================================================================
   * 01. Accessibility Runtime
   * Persists user preferences, applies state to the document, and keeps the
   * panel safe to re-initialize after runtime partial injection.
   * ========================================================================== */
  const storageKey = "itb-accessibility";
  const minTextScale = 0.2;
  const maxTextScale = 2;
  const textScaleStep = 0.1;
  const motionMedia = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const themeMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  let lastFocusedElement = null;
  let pointerBound = false;
  let clickOutsideBound = false;
  let escapeBound = false;
  let motionBound = false;
  let themeBound = false;

  /* ==========================================================================
   * 02. Default State Model
   * ========================================================================== */
  const defaultState = {
    textScale: 1,
    theme: "dark",
    contrast: false,
    invert: false,
    grayscale: false,
    dyslexia: false,
    links: false,
    headings: false,
    guide: false,
    images: false,
    motion: motionMedia ? motionMedia.matches : false
  };

  /* ==========================================================================
   * 03. Primitive State Helpers
   * ========================================================================== */
  function clampTextScale(value) {
    return Math.min(maxTextScale, Math.max(minTextScale, value));
  }

  function normalizeTheme(value) {
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  }

  function readStoredState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  /* ==========================================================================
   * 04. Runtime State and DOM Access
   * ========================================================================== */
  const storedState = readStoredState();
  const state = {
    ...defaultState,
    ...storedState,
    theme: normalizeTheme(typeof storedState.theme === "string" ? storedState.theme : defaultState.theme),
    textScale: Number.isFinite(storedState.textScale) ? clampTextScale(storedState.textScale) : defaultState.textScale
  };

  /* DOM lookup is centralized because partial injection can recreate these nodes. */
  function getNodes() {
    return {
      panel: document.getElementById("accessibility-panel"),
      body: document.body,
      guide: document.querySelector("[data-reading-guide='true']"),
      textScaleValue: document.querySelector("[data-text-scale-value='true']"),
      openButtons: document.querySelectorAll("[data-open-accessibility='true']"),
      closeButtons: document.querySelectorAll("[data-close-accessibility='true']")
    };
  }

  /* ==========================================================================
   * 05. Persistence and UI Sync
   * ========================================================================== */
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }

  /* Buttons reflect current state on every apply cycle. */
  function syncButtons() {
    document.querySelectorAll("[data-accessibility-action]").forEach((button) => {
      const action = button.getAttribute("data-accessibility-action");
      if (action === "theme") {
        const active = state.theme === normalizeTheme(button.getAttribute("data-accessibility-value"));
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
        return;
      }
      const keyMap = {
        contrast: "contrast",
        invert: "invert",
        grayscale: "grayscale",
        dyslexia: "dyslexia",
        links: "links",
        headings: "headings",
        guide: "guide",
        images: "images",
        motion: "motion"
      };
      const key = keyMap[action];
      const active = key ? Boolean(state[key]) : false;
      if (key) {
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      }
    });
  }

  /* ==========================================================================
   * 06. Theme and Guide Helpers
   * ========================================================================== */
  function resolvedTheme() {
    if (state.theme === "dark") return "dark";
    if (state.theme === "light") return "light";
    return themeMedia?.matches ? "dark" : "light";
  }

  function setGuidePosition(y, guide) {
    if (!guide) return;
    guide.style.top = `${Math.max(0, Math.round(y))}px`;
  }

  /* ==========================================================================
   * 07. State Application
   * Applies the current accessibility state to document classes, variables,
   * and live panel controls.
   * ========================================================================== */
  function apply() {
    const { body, guide, textScaleValue } = getNodes();
    if (!body) return;

    const theme = resolvedTheme();
    body.classList.toggle("theme-light", theme === "light");
    body.classList.toggle("theme-dark", theme === "dark");
    body.dataset.themePreference = state.theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const themeColor = window.ITB_SITE?.accessibility?.themeColors?.[theme];
    if (themeColor) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);

    document.documentElement.style.setProperty("--text-scale", String(state.textScale));
    document.documentElement.style.setProperty(
      "--dyslexia-font",
      window.ITB_SITE?.accessibility?.dyslexiaFont || '"OpenDyslexic","Atkinson Hyperlegible","Trebuchet MS",sans-serif'
    );

    body.classList.toggle("a11y-contrast", state.contrast);
    body.classList.toggle("a11y-invert", state.invert);
    body.classList.toggle("a11y-grayscale", state.grayscale);
    body.classList.toggle("a11y-dyslexia", state.dyslexia);
    body.classList.toggle("a11y-links", state.links);
    body.classList.toggle("a11y-headings", state.headings);
    body.classList.toggle("a11y-hide-images", state.images);
    body.classList.toggle("reduced-motion", state.motion);
    guide?.classList.toggle("is-active", state.guide);
    if (state.guide) setGuidePosition(window.innerHeight * 0.35, guide);
    if (textScaleValue) textScaleValue.textContent = `${Math.round(state.textScale * 100)}%`;
    syncButtons();
  }

  /* Panel open/close behavior with focus return support. */
  function setPanelOpen(isOpen) {
    const { panel, body, openButtons } = getNodes();
    if (!panel || !body) return;
    panel.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    body.classList.toggle("is-accessibility-open", isOpen);
    openButtons.forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));
    if (isOpen) {
      lastFocusedElement = document.activeElement;
      panel.focus();
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  /* Returns the runtime to its baseline accessibility state. */
  function resetState() {
    Object.assign(state, defaultState, {
      textScale: 1,
      theme: "dark",
      motion: motionMedia ? motionMedia.matches : false
    });
  }

  /* ==========================================================================
   * 08. Event Binding and Init
   * Event listeners are dataset-guarded or singleton-bound.
   * ========================================================================== */
  function initAccessibility() {
    const { panel, openButtons, closeButtons } = getNodes();

    openButtons.forEach((button) => {
      if (button.dataset.itbBoundA11yOpen === "true") return;
      button.addEventListener("click", () => setPanelOpen(true));
      button.dataset.itbBoundA11yOpen = "true";
    });

    closeButtons.forEach((button) => {
      if (button.dataset.itbBoundA11yClose === "true") return;
      button.addEventListener("click", () => setPanelOpen(false));
      button.dataset.itbBoundA11yClose = "true";
    });

    document.querySelectorAll("[data-accessibility-action]").forEach((button) => {
      if (button.dataset.itbBoundA11yAction === "true") return;
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-accessibility-action");
        const value = button.getAttribute("data-accessibility-value");
        if (action === "text-increase") state.textScale = clampTextScale(+(state.textScale + textScaleStep).toFixed(2));
        if (action === "text-decrease") state.textScale = clampTextScale(+(state.textScale - textScaleStep).toFixed(2));
        if (action === "theme") state.theme = normalizeTheme(value);
        if (action === "contrast") state.contrast = !state.contrast;
        if (action === "invert") state.invert = !state.invert;
        if (action === "grayscale") state.grayscale = !state.grayscale;
        if (action === "dyslexia") state.dyslexia = !state.dyslexia;
        if (action === "links") state.links = !state.links;
        if (action === "headings") state.headings = !state.headings;
        if (action === "guide") state.guide = !state.guide;
        if (action === "images") state.images = !state.images;
        if (action === "motion") state.motion = !state.motion;
        if (action === "reset") resetState();
        persist();
        apply();
      });
      button.dataset.itbBoundA11yAction = "true";
    });

    /* Reading-guide pointer tracking is global and only bound once. */
    if (!pointerBound) {
      document.addEventListener("pointermove", (event) => {
        if (!state.guide) return;
        setGuidePosition(event.clientY, getNodes().guide);
      });
      pointerBound = true;
    }

    if (!clickOutsideBound) {
      document.addEventListener("click", (event) => {
        const livePanel = getNodes().panel;
        if (!livePanel || livePanel.getAttribute("aria-hidden") === "true") return;
        if (event.target.closest("#accessibility-panel") || event.target.closest("[data-open-accessibility='true']")) return;
        setPanelOpen(false);
      });
      clickOutsideBound = true;
    }

    /* Global escape handling closes the panel from anywhere. */
    if (!escapeBound) {
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setPanelOpen(false);
      });
      escapeBound = true;
    }

    /* System preference listeners only take over when the user has not explicitly overridden them. */
    if (motionMedia && !motionBound) {
      const onMotionChange = (event) => {
        const stored = readStoredState();
        if (typeof stored.motion === "boolean") return;
        state.motion = event.matches;
        apply();
      };
      if (typeof motionMedia.addEventListener === "function") motionMedia.addEventListener("change", onMotionChange);
      else if (typeof motionMedia.addListener === "function") motionMedia.addListener(onMotionChange);
      motionBound = true;
    }

    if (themeMedia && !themeBound) {
      const onThemeChange = () => {
        if (state.theme === "system") apply();
      };
      if (typeof themeMedia.addEventListener === "function") themeMedia.addEventListener("change", onThemeChange);
      else if (typeof themeMedia.addListener === "function") themeMedia.addListener(onThemeChange);
      themeBound = true;
    }

    if (panel) apply();
    else apply();
  }

  /* ==========================================================================
   * 09. Public Init API
   * ========================================================================== */
  window.ITB = window.ITB || {};
  window.ITB.initAccessibility = initAccessibility;

  if (!window.__ITB_PARTIALS_ACTIVE__) initAccessibility();
})();
