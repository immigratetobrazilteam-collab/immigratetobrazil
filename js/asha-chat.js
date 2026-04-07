(function () {
  let cachedIndexes = new Map();
  let pendingIndexes = new Map();

  function getUrls() {
    if (window.ITB_URLS) return window.ITB_URLS;

    function normalizeSitePath(pathname) {
      if (!pathname) return "/";
      let clean = String(pathname).trim();
      if (!clean) return "/";
      clean = clean.replace(/\/index\.html$/i, "/");
      if (!clean.startsWith("/")) clean = `/${clean}`;
      if (!clean.endsWith("/") && !/\.[a-z0-9]+$/i.test(clean)) clean = `${clean}/`;
      return clean;
    }

    function getSitePath() {
      const canonical = document.querySelector("link[rel='canonical']")?.getAttribute("href");
      if (canonical) {
        try {
          return normalizeSitePath(new URL(canonical).pathname || "/");
        } catch {
          /* fall through */
        }
      }
      return normalizeSitePath(window.location.pathname || "/");
    }

    function getRootPrefix() {
      const parts = getSitePath().replace(/^\/|\/$/g, "").split("/").filter(Boolean);
      return parts.length ? "../".repeat(parts.length) : "./";
    }

    function resolveSiteUrl(value) {
      const raw = String(value || "");
      if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(raw) || !raw.startsWith("/")) return raw;
      return `${getRootPrefix()}${raw.replace(/^\/+/, "")}`;
    }

    function getLocale() {
      const path = getSitePath();
      return path === "/pt-br/" || path.startsWith("/pt-br/") ? "pt-br" : "en";
    }

    return { getSitePath, getLocale, resolveSiteUrl };
  }

  function getDecoder() {
    if (!getDecoder.node) getDecoder.node = document.createElement("textarea");
    return getDecoder.node;
  }

  function decodeHtml(value) {
    const raw = String(value || "");
    if (!raw.includes("&")) return raw;
    const decoder = getDecoder();
    decoder.innerHTML = raw;
    return decoder.value;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(value) {
    return decodeHtml(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function tokenize(query) {
    return [...new Set(normalize(query).split(/\s+/).filter((token) => token.length > 1))];
  }

  function getCopy(isPt) {
    return isPt
      ? {
          loading: "Pesquisando as páginas públicas...",
          defaultPrompt:
            "Pergunte sobre vistos, residência, naturalização, consulta ou lugares no Brasil. Eu pesquiso apenas páginas públicas deste site.",
          unavailable:
            "Asha não conseguiu acessar o índice público do site agora. Se a sua pergunta for pessoal, o caminho mais rápido é falar com a Monique no WhatsApp.",
          noResults:
            'Não encontrei uma página pública forte para "{query}". Tente palavras mais amplas como visto, residência, naturalização, família, custo, cidades ou consulta.',
          resultSingle: 'Encontrei a melhor página pública para "{query}".',
          resultPlural: 'Encontrei {count} páginas públicas para "{query}".',
          contactNudge:
            "Se a sua dúvida depender dos seus documentos, do seu cronograma ou de urgência, fale com a Monique no WhatsApp.",
          contactNudgeStrong:
            "Isso parece mais pessoal ou urgente. Vou orientar com páginas públicas, mas o próximo passo mais rápido provavelmente é o WhatsApp da Monique.",
          bestMatch: "Melhor leitura",
          familyLabels: {
            foundation: "início",
            about: "sobre",
            services: "serviços",
            process: "processo",
            brazil: "brasil",
            insights: "insights",
            legal: "jurídico"
          },
          contactPattern:
            /\b(?:whatsapp|contato|falar|advogada|advogado|urgente|meu caso|meus documentos|minha residencia|minha residenca|minha cidadania|minha naturalizacao|consulta|agendar)\b/
        }
      : {
          loading: "Searching the public pages...",
          defaultPrompt:
            "Ask about visas, residency, naturalisation, consultation, or places in Brazil. I search public pages on this website only.",
          unavailable:
            "Asha could not reach the public site index right now. If your question is personal, the fastest next step is to message Monique on WhatsApp.",
          noResults:
            'I could not find a strong public-page match for "{query}". Try broader words like visa, residency, naturalisation, family, cost, cities, or consultation.',
          resultSingle: 'I found the strongest public-page match for "{query}".',
          resultPlural: 'I found {count} public-page matches for "{query}".',
          contactNudge:
            "If your question depends on your own documents, timing, or urgency, message Monique on WhatsApp.",
          contactNudgeStrong:
            "This sounds more personal or urgent. I will point you to public pages, but WhatsApp is likely the faster next step with Monique.",
          bestMatch: "Best match",
          familyLabels: {
            foundation: "home",
            about: "about",
            services: "services",
            process: "process",
            brazil: "brazil",
            insights: "insights",
            legal: "legal"
          },
          contactPattern:
            /\b(?:whatsapp|contact|talk|speak|call|lawyer|attorney|urgent|my case|my documents|my visa|my residency|my citizenship|consultation|book)\b/
        };
  }

  function buildIndexPath(isPt) {
    const urls = getUrls();
    return urls.resolveSiteUrl(isPt ? "/pt-br/data/search-index.json" : "/data/search-index.json");
  }

  function isPublicContentItem(item) {
    if (!item || item.noindex === true) return false;
    const route = String(item.route || "");
    if (!route || route === "/404.html") return false;
    if (/\/(?:legal|brazil)\/search\/$/i.test(route)) return false;
    if (/\/pt-br\/(?:legal|brazil)\/search\/$/i.test(route)) return false;
    return true;
  }

  async function loadIndex(indexPath) {
    if (cachedIndexes.has(indexPath)) return cachedIndexes.get(indexPath);
    if (pendingIndexes.has(indexPath)) return pendingIndexes.get(indexPath);

    const pending = fetch(indexPath, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load Asha search index");
        return response.json();
      })
      .then((items) => {
        const filtered = Array.isArray(items) ? items.filter(isPublicContentItem) : [];
        cachedIndexes.set(indexPath, filtered);
        return filtered;
      })
      .finally(() => {
        pendingIndexes.delete(indexPath);
      });

    pendingIndexes.set(indexPath, pending);
    return pending;
  }

  function scoreItem(item, cleanQuery, tokens) {
    const title = normalize(item.title);
    const browserTitle = normalize(item.browserTitle);
    const summary = normalize(item.summary);
    const topics = normalize((item.topics || []).join(" "));
    const faq = normalize((item.faq || []).join(" "));
    const keywords = normalize(item.keywords);
    const route = normalize(String(item.route || "").replace(/\//g, " "));

    let score = 0;

    if (title.includes(cleanQuery)) score += 24;
    if (browserTitle.includes(cleanQuery)) score += 14;
    if (summary.includes(cleanQuery)) score += 11;
    if (topics.includes(cleanQuery)) score += 10;
    if (faq.includes(cleanQuery)) score += 8;
    if (keywords.includes(cleanQuery)) score += 6;
    if (route.includes(cleanQuery)) score += 5;

    tokens.forEach((token) => {
      if (title.includes(token)) score += 6;
      if (browserTitle.includes(token)) score += 4;
      if (summary.includes(token)) score += 4;
      if (topics.includes(token)) score += 4;
      if (faq.includes(token)) score += 3;
      if (keywords.includes(token)) score += 2;
      if (route.includes(token)) score += 1;
    });

    if (item.family === "about" && /(profile|monique|lawyer|mission|clients|ethics|about|sobre|advogada|perfil)/.test(cleanQuery)) {
      score += 4;
    }

    if (item.route === "/start-consultation/" || item.route === "/pt-br/start-consultation/") score += 1;

    return score;
  }

  function trimText(value, maxLength) {
    const text = decodeHtml(value).replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) return text;
    const clipped = text.slice(0, maxLength).replace(/\s+\S*$/, "");
    return `${clipped}...`;
  }

  function buildMatches(items, query) {
    const cleanQuery = normalize(query);
    const tokens = tokenize(query);
    if (!cleanQuery || !tokens.length) return [];

    return items
      .map((item) => ({ item, score: scoreItem(item, cleanQuery, tokens) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.route.length - b.item.route.length)
      .slice(0, 6);
  }

  function renderTranscript(widget, query, matches, copy) {
    const transcript = widget.querySelector("[data-asha-transcript]");
    if (!transcript) return;

    const cleanQuery = normalize(query);
    const contactHeavy = copy.contactPattern.test(cleanQuery);
    const intro = !query
      ? copy.defaultPrompt
      : matches.length
        ? (matches.length === 1 ? copy.resultSingle : copy.resultPlural.replace("{count}", String(matches.length))).replace("{query}", query)
        : copy.noResults.replace("{query}", query);
    const nudge = contactHeavy ? copy.contactNudgeStrong : copy.contactNudge;

    transcript.innerHTML = !query
      ? `<div class="asha-chat__bubble asha-chat__bubble--bot">${escapeHtml(intro)}</div>`
      : `<div class="asha-chat__bubble asha-chat__bubble--user">${escapeHtml(query)}</div>
<div class="asha-chat__bubble asha-chat__bubble--bot">
  <p>${escapeHtml(intro)}</p>
  <p>${escapeHtml(nudge)}</p>
</div>`;
  }

  function renderResults(widget, matches, copy) {
    const results = widget.querySelector("[data-asha-results]");
    if (!results) return;

    if (!matches.length) {
      results.innerHTML = "";
      return;
    }

    const urls = getUrls();
    results.innerHTML = matches
      .map(
        ({ item }, index) => `<article class="asha-chat__result">
  <div class="asha-chat__result-meta">
    <span class="asha-chat__family">${escapeHtml(copy.familyLabels[item.family] || item.family || "site")}</span>
    ${index === 0 ? `<span class="asha-chat__best">${escapeHtml(copy.bestMatch)}</span>` : ""}
  </div>
  <strong><a href="${escapeHtml(urls.resolveSiteUrl(item.route))}" data-itb-route="${escapeHtml(item.route)}">${escapeHtml(
            decodeHtml(item.title)
          )}</a></strong>
  <p>${escapeHtml(trimText(item.summary, 168))}</p>
</article>`
      )
      .join("");
  }

  async function handleSearch(widget, query) {
    const urls = getUrls();
    const isPt = urls.getLocale() === "pt-br";
    const copy = getCopy(isPt);
    const transcript = widget.querySelector("[data-asha-transcript]");
    const input = widget.querySelector("[data-asha-input]");

    if (input) input.value = query;

    if (!query.trim()) {
      renderTranscript(widget, "", [], copy);
      renderResults(widget, [], copy);
      return;
    }

    if (transcript) {
      transcript.innerHTML = `<div class="asha-chat__bubble asha-chat__bubble--user">${escapeHtml(query)}</div>
<div class="asha-chat__bubble asha-chat__bubble--bot">${escapeHtml(copy.loading)}</div>`;
    }

    try {
      const items = await loadIndex(buildIndexPath(isPt));
      const matches = buildMatches(items, query);
      renderTranscript(widget, query, matches, copy);
      renderResults(widget, matches, copy);

      if (window.dataLayer) {
        window.dataLayer.push({
          event: "asha_chat_search",
          page_route: window.ITB_SITE?.pageRoute || window.location.pathname,
          query,
          locale: isPt ? "pt-br" : "en",
          result_count: matches.length
        });
      }
    } catch (error) {
      console.error(error);
      if (transcript) {
        transcript.innerHTML = `<div class="asha-chat__bubble asha-chat__bubble--user">${escapeHtml(query)}</div>
<div class="asha-chat__bubble asha-chat__bubble--bot">${escapeHtml(copy.unavailable)}</div>`;
      }
      renderResults(widget, [], copy);
    }
  }

  function initWidget(widget) {
    if (!widget || widget.dataset.itbBoundAshaChat === "true") return;

    const form = widget.querySelector("[data-asha-form]");
    const input = widget.querySelector("[data-asha-input]");
    const suggestionButtons = widget.querySelectorAll("[data-asha-suggestion]");
    const urls = getUrls();
    const copy = getCopy(urls.getLocale() === "pt-br");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSearch(widget, input?.value || "");
    });

    suggestionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const query = button.getAttribute("data-asha-suggestion") || button.textContent || "";
        handleSearch(widget, query);
      });
    });

    widget.dataset.itbBoundAshaChat = "true";
    renderTranscript(widget, "", [], copy);
    renderResults(widget, [], copy);
  }

  function initAshaChat() {
    document.querySelectorAll("[data-asha-chat='true']").forEach(initWidget);
  }

  window.ITB = window.ITB || {};
  window.ITB.initAshaChat = initAshaChat;

  if (!window.__ITB_PARTIALS_ACTIVE__) initAshaChat();
})();
