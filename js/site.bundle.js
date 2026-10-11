/* ========================================================================== 
   Immigrate to Brazil — single shared JavaScript entry point
   Responsibilities: shared partials, accessible navigation, search, forms,
   consent-aware measurement, and optional page enhancements.
   ========================================================================== */
(function () {
  "use strict";

  const root = new URL("/js/", window.location.origin);
  const modules = ["search.js", "accessibility.js", "site.js"];

  function loadModule(file) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(file, root).href;
      script.defer = true;
      script.dataset.itbModule = file;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${file}`));
      document.head.appendChild(script);
    });
  }

  /* Preserve the page's optional city enhancement without adding another tag. */
  const cityEnhancement = document.querySelector("[data-municipality-search], [data-largest-municipalities]")
    ? ["city-explorer.js"]
    : [];

  /* Modules register their init APIs before the partial loader's DOM-ready boot. */
  Promise.all([...modules, ...cityEnhancement].map(loadModule))
    .then(() => loadModule("partials.js"))
    .catch((error) => console.error("Immigrate to Brazil could not initialize all enhancements.", error));
})();
