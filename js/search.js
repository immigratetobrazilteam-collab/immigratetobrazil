(function () {
  const resultsNode = document.querySelector("[data-search-results='true']");
  const form = document.querySelector("[data-search-form='true']");
  const isPt = window.location.pathname.startsWith("/pt-br/");
  const searchPath = isPt ? "/pt-br/legal/search/" : "/legal/search/";
  const indexPath = isPt ? "/pt-br/data/search-index.json" : "/data/search-index.json";
  const copy = isPt
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
      };
  const familyLabels = isPt
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
    : {};

  async function loadIndex() {
    const response = await fetch(indexPath, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Unable to load search index");
    return response.json();
  }

  function normalize(value) {
    return value.toLowerCase().trim();
  }

  function renderResults(query, items) {
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

    if (!matches.length) {
      resultsNode.innerHTML = `<p>${copy.noResults.replace("{query}", query)}</p>`;
      return;
    }

    resultsNode.innerHTML = matches
      .map(
        ({ item }) => `<article class="search-result">
          <strong><a href="${item.route}">${item.title}</a></strong>
          <span>${familyLabels[item.family] || item.family}</span>
          <p>${item.summary}</p>
        </article>`
      )
      .join("");
  }

  async function handlePageSearch(query) {
    if (!resultsNode) return;
    try {
      const items = await loadIndex();
      renderResults(query, items);
    } catch (error) {
      resultsNode.innerHTML = `<p>${copy.unavailable}</p>`;
      console.error(error);
    }
  }

  form?.addEventListener("submit", (event) => {
    const input = form.querySelector("input[name='q']");
    if (!input) return;
    if (window.location.pathname !== searchPath) {
      return;
    }
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url);
    handlePageSearch(query);
    if (window.dataLayer) {
      window.dataLayer.push({ event: "search_submit", query });
    }
  });

  if (window.location.pathname === searchPath && resultsNode) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const input = document.querySelector("input[name='q']");
    if (input) input.value = query;
    handlePageSearch(query);
  }
})();
