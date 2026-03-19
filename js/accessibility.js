(function () {
  const storageKey = "itb-accessibility";
  const minTextScale = 0.2;
  const maxTextScale = 2;
  const textScaleStep = 0.1;
  const panel = document.getElementById("accessibility-panel");
  const body = document.body;
  const guide = document.querySelector("[data-reading-guide='true']");
  const textScaleValue = document.querySelector("[data-text-scale-value='true']");
  const openButtons = document.querySelectorAll("[data-open-accessibility='true']");
  const closeButtons = document.querySelectorAll("[data-close-accessibility='true']");
  const motionMedia = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const themeMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function clampTextScale(value) {
    return Math.min(maxTextScale, Math.max(minTextScale, value));
  }

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

  let lastFocusedElement = null;

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

  const storedState = readStoredState();
  const state = {
    ...defaultState,
    ...storedState,
    theme: normalizeTheme(typeof storedState.theme === "string" ? storedState.theme : defaultState.theme),
    textScale: Number.isFinite(storedState.textScale) ? clampTextScale(storedState.textScale) : defaultState.textScale
  };

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* Ignore storage failures so controls still work for the session. */
    }
  }

  function syncButtons() {
    document.querySelectorAll("[data-accessibility-action]").forEach((button) => {
      const action = button.getAttribute("data-accessibility-action");
      if (action === "theme") {
        const value = normalizeTheme(button.getAttribute("data-accessibility-value"));
        const isPressed = state.theme === value;
        button.classList.toggle("is-active", isPressed);
        button.setAttribute("aria-pressed", String(isPressed));
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
      const isPressed = key ? Boolean(state[key]) : false;
      if (key) {
        button.classList.toggle("is-active", isPressed);
        button.setAttribute("aria-pressed", String(isPressed));
      }
    });
  }

  function resolvedTheme() {
    if (state.theme === "dark") return "dark";
    if (state.theme === "light") return "light";
    return themeMedia?.matches ? "dark" : "light";
  }

  function applyTheme() {
    const theme = resolvedTheme();
    body.classList.toggle("theme-light", theme === "light");
    body.classList.toggle("theme-dark", theme === "dark");
    body.dataset.themePreference = state.theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const themeColor = window.ITB_SITE?.accessibility?.themeColors?.[theme];
    if (themeColor) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
    }
  }

  function setGuidePosition(y) {
    if (!guide) return;
    guide.style.top = `${Math.max(0, Math.round(y))}px`;
  }

  function apply() {
    applyTheme();
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
    if (state.guide) {
      setGuidePosition(window.innerHeight * 0.35);
    }
    if (textScaleValue) {
      textScaleValue.textContent = `${Math.round(state.textScale * 100)}%`;
    }
    syncButtons();
  }

  function setPanelOpen(isOpen) {
    if (!panel) return;
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

  function openPanel() {
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  function resetState() {
    Object.assign(state, defaultState, {
      textScale: 1,
      theme: "dark",
      motion: motionMedia ? motionMedia.matches : false
    });
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", openPanel);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closePanel);
  });

  document.querySelectorAll("[data-accessibility-action]").forEach((button) => {
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
  });

  document.addEventListener("pointermove", (event) => {
    if (!state.guide) return;
    setGuidePosition(event.clientY);
  });

  if (motionMedia) {
    const onMotionChange = (event) => {
      const stored = readStoredState();
      if (typeof stored.motion === "boolean") return;
      state.motion = event.matches;
      apply();
    };
    if (typeof motionMedia.addEventListener === "function") {
      motionMedia.addEventListener("change", onMotionChange);
    } else if (typeof motionMedia.addListener === "function") {
      motionMedia.addListener(onMotionChange);
    }
  }

  if (themeMedia) {
    const onThemeChange = () => {
      if (state.theme !== "system") return;
      apply();
    };
    if (typeof themeMedia.addEventListener === "function") {
      themeMedia.addEventListener("change", onThemeChange);
    } else if (typeof themeMedia.addListener === "function") {
      themeMedia.addListener(onThemeChange);
    }
  }

  document.addEventListener("click", (event) => {
    if (!panel || panel.getAttribute("aria-hidden") === "true") return;
    if (event.target.closest("#accessibility-panel") || event.target.closest("[data-open-accessibility='true']")) return;
    closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
    }
  });

  apply();
})();
