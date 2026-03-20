(function () {
  /* ==========================================================================
   * 01. Client-Side Search Runtime
   * Loads the locale-specific search index on demand and re-initializes safely
   * after runtime partial injection.
   * ========================================================================== */
  let cachedIndex = null;
  let pendingIndex = null;

  /* ==========================================================================
   * 02. Locale-Aware Context
   * DOM lookups stay inside the context helper because partial injection can
   * recreate the search form and results container.
   * ========================================================================== */
  function getContext() {
    const isPt = window.location.pathname.startsWith("/pt-br/");
    return {
      resultsNode: document.querySelector("[data-search-results='true']"),
      form: document.querySelector("[data-search-form='true']"),
      searchPath: isPt ? "/pt-br/legal/search/" : "/legal/search/",
      indexPath: isPt ? "/pt-br/data/search-index.json" : "/data/search-index.json",
      copy: isPt
        ? {
            prompt: "Use uma palavra-chave para pesquisar no site.",
            unavailable: "A pesquisa esta temporariamente indisponivel.",
            noResults:
              "Nenhum resultado correspondeu a <strong>{query}</strong>. Tente um termo mais amplo, como visto, residencia, naturalizacao, custo ou consulta."
          }
        : {
            prompt: "Use a keyword to search the site.",
            unavailable: "Search is temporarily unavailable.",
            noResults:
              "No results matched <strong>{query}</strong>. Try a broader term such as visa, residency, naturalisation, cost, or consultation."
          },
      familyLabels: isPt
        ? {
            foundation: "inicio",
            about: "sobre",
            services: "servicos",
            process: "processo",
            brazil: "brasil",
            insights: "insights",
            legal: "juridico",
            consultation: "consulta",
            site: "site"
          }
        : {}
    };
  }

  /* ==========================================================================
   * 03. Index Loading
   * Search index loading is memoized so repeated initializers do not refetch.
   * ========================================================================== */
  async function loadIndex(indexPath) {
    if (cachedIndex) return cachedIndex;
    if (pendingIndex) return pendingIndex;
    pendingIndex = fetch(indexPath, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load search index");
        return response.json();
      })
      .then((json) => {
        cachedIndex = json;
        return json;
      })
      .finally(() => {
        pendingIndex = null;
      });
    return pendingIndex;
  }

  /* ==========================================================================
   * 04. Query Normalization and Rendering
   * ========================================================================== */
  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function renderResults(query, items, context) {
    const { resultsNode, copy, familyLabels } = context;
    if (!resultsNode) return;
    if (!query) {
      resultsNode.innerHTML = `<p>${copy.prompt}</p>`;
      return;
    }
    const clean = normalize(query);
    const matches = items
      .map((item) => {
        const haystack = normalize(`${item.title} ${item.summary} ${item.keywords} ${(item.faq || []).join(" ")}`);
        let score = 0;
        if (normalize(item.title).includes(clean)) score += 3;
        if (normalize(item.summary).includes(clean)) score += 2;
        if (haystack.includes(clean)) score += 1;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    resultsNode.innerHTML = matches.length
      ? matches
          .map(
            ({ item }) => `<article class="search-result">
          <strong><a href="${item.route}">${item.title}</a></strong>
          <span>${familyLabels[item.family] || item.family}</span>
          <p>${item.summary}</p>
        </article>`
          )
          .join("")
      : `<p>${copy.noResults.replace("{query}", query)}</p>`;
  }

  /* ==========================================================================
   * 05. Search Execution
   * ========================================================================== */
  async function handlePageSearch(query, context) {
    if (!context.resultsNode) return;
    try {
      const items = await loadIndex(context.indexPath);
      renderResults(query, items, context);
    } catch (error) {
      context.resultsNode.innerHTML = `<p>${context.copy.unavailable}</p>`;
      console.error(error);
    }
  }

  /* ==========================================================================
   * 06. Public Init API
   * Used both on static pages and after runtime partial injection.
   * ========================================================================== */
  function initSearch() {
    const context = getContext();
    const { form, resultsNode, searchPath } = context;

    if (form && form.dataset.itbBoundSearchForm !== "true") {
      form.addEventListener("submit", (event) => {
        const input = form.querySelector("input[name='q']");
        if (!input || window.location.pathname !== searchPath) return;
        event.preventDefault();
        const query = input.value.trim();
        const url = new URL(window.location.href);
        url.searchParams.set("q", query);
        window.history.replaceState({}, "", url);
        handlePageSearch(query, context);
        if (window.dataLayer) window.dataLayer.push({ event: "search_submit", query });
      });
      form.dataset.itbBoundSearchForm = "true";
    }

    if (window.location.pathname === searchPath && resultsNode) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q") || "";
      const input = document.querySelector("input[name='q']");
      if (input) input.value = query;
      handlePageSearch(query, context);
    }
  }

  /* Shared runtime API registration and non-partial fallback boot. */
  window.ITB = window.ITB || {};
  window.ITB.initSearch = initSearch;

  if (!window.__ITB_PARTIALS_ACTIVE__) initSearch();
})();
