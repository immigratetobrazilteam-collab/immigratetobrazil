(function () {
  const storageKey = "itb-accessibility";
  const panel = document.getElementById("accessibility-panel");
  const body = document.body;
  const guide = document.querySelector("[data-reading-guide='true']");
  const textScaleValue = document.querySelector("[data-text-scale-value='true']");

  const state = Object.assign(
    {
      textScale: 1,
      contrast: false,
      invert: false,
      grayscale: false,
      dyslexia: false,
      links: false,
      headings: false,
      guide: false,
      images: false,
      motion: false
    },
    JSON.parse(localStorage.getItem(storageKey) || "{}")
  );

  function persist() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function syncButtons() {
    document.querySelectorAll("[data-accessibility-action]").forEach((button) => {
      const action = button.getAttribute("data-accessibility-action");
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
      if (keyMap[action]) {
        button.classList.toggle("is-active", Boolean(state[keyMap[action]]));
      }
    });
  }

  function apply() {
    document.documentElement.style.setProperty("--text-scale", String(state.textScale));
    document.documentElement.style.setProperty("--dyslexia-font", (window.ITB_SITE?.accessibility?.dyslexiaFont) || 'OpenDyslexic, sans-serif');
    body.classList.toggle("a11y-contrast", state.contrast);
    body.classList.toggle("a11y-invert", state.invert);
    body.classList.toggle("a11y-grayscale", state.grayscale);
    body.classList.toggle("a11y-dyslexia", state.dyslexia);
    body.classList.toggle("a11y-links", state.links);
    body.classList.toggle("a11y-headings", state.headings);
    body.classList.toggle("a11y-hide-images", state.images);
    body.classList.toggle("reduced-motion", state.motion);
    guide?.classList.toggle("is-active", state.guide);
    if (textScaleValue) {
      textScaleValue.textContent = `${Math.round(state.textScale * 100)}%`;
    }
    syncButtons();
  }

  function openPanel() {
    if (!panel) return;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    if (!panel) return;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-open-accessibility='true']").forEach((button) => {
    button.addEventListener("click", openPanel);
  });

  document.querySelectorAll("[data-close-accessibility='true']").forEach((button) => {
    button.addEventListener("click", closePanel);
  });

  document.querySelectorAll("[data-accessibility-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-accessibility-action");
      if (action === "text-increase") state.textScale = Math.min(1.35, +(state.textScale + 0.05).toFixed(2));
      if (action === "text-decrease") state.textScale = Math.max(0.85, +(state.textScale - 0.05).toFixed(2));
      if (action === "contrast") state.contrast = !state.contrast;
      if (action === "invert") state.invert = !state.invert;
      if (action === "grayscale") state.grayscale = !state.grayscale;
      if (action === "dyslexia") state.dyslexia = !state.dyslexia;
      if (action === "links") state.links = !state.links;
      if (action === "headings") state.headings = !state.headings;
      if (action === "guide") state.guide = !state.guide;
      if (action === "images") state.images = !state.images;
      if (action === "motion") state.motion = !state.motion;
      if (action === "reset") {
        Object.assign(state, {
          textScale: 1,
          contrast: false,
          invert: false,
          grayscale: false,
          dyslexia: false,
          links: false,
          headings: false,
          guide: false,
          images: false,
          motion: false
        });
      }
      persist();
      apply();
    });
  });

  window.addEventListener("mousemove", (event) => {
    if (!state.guide || !guide) return;
    guide.style.top = `${event.clientY}px`;
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanel();
  });

  apply();
})();
