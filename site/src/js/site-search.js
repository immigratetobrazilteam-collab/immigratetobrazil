(() => {
  'use strict';

  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  const count = document.getElementById('site-search-count');

  if (!input || !results || !count) return;

  const locale = (document.documentElement.lang || 'en').slice(0, 2);
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  const localePattern = /^\/(pt|es|fr)(\/|$)/;

  const copy = {
    en: {
      idle: 'Type to search legal services, guides, and articles.',
      noResults: 'No matching pages found.',
      noResultsHint: 'Try broader keywords like visa, residency, divorce, citizenship, or consultation.',
      unavailable: 'Search index could not be loaded right now.',
      noDescription: 'No description available.',
      results: countValue => `${countValue} result${countValue === 1 ? '' : 's'} found.`
    },
    pt: {
      idle: 'Digite para pesquisar serviços jurídicos, guias e artigos.',
      noResults: 'Nenhuma página correspondente foi encontrada.',
      noResultsHint: 'Tente termos mais amplos como visto, residência, divórcio, cidadania ou consulta.',
      unavailable: 'O índice de pesquisa não pôde ser carregado agora.',
      noDescription: 'Nenhuma descrição disponível.',
      results: countValue => `${countValue} resultado${countValue === 1 ? '' : 's'} encontrado${countValue === 1 ? '' : 's'}.`
    },
    es: {
      idle: 'Escribe para buscar servicios legales, guías y artículos.',
      noResults: 'No se encontraron páginas coincidentes.',
      noResultsHint: 'Prueba términos más amplios como visa, residencia, divorcio, ciudadanía o consulta.',
      unavailable: 'El índice de búsqueda no pudo cargarse en este momento.',
      noDescription: 'No hay descripción disponible.',
      results: countValue => `${countValue} resultado${countValue === 1 ? '' : 's'} encontrado${countValue === 1 ? '' : 's'}.`
    },
    fr: {
      idle: 'Saisissez votre recherche pour trouver des services juridiques, des guides et des articles.',
      noResults: 'Aucune page correspondante trouvée.',
      noResultsHint: 'Essayez des termes plus larges comme visa, résidence, divorce, citoyenneté ou consultation.',
      unavailable: "L'index de recherche n'a pas pu être chargé pour le moment.",
      noDescription: 'Aucune description disponible.',
      results: countValue => `${countValue} résultat${countValue === 1 ? '' : 's'} trouvé${countValue === 1 ? '' : 's'}.`
    }
  }[locale] || {
    idle: 'Type to search legal services, guides, and articles.',
    noResults: 'No matching pages found.',
    noResultsHint: 'Try broader keywords like visa, residency, divorce, citizenship, or consultation.',
    unavailable: 'Search index could not be loaded right now.',
    noDescription: 'No description available.',
    results: countValue => `${countValue} result${countValue === 1 ? '' : 's'} found.`
  };

  let searchIndex = [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeInternalUrl(value) {
    const url = String(value || '').trim();
    return url.startsWith('/') ? url : '#';
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function matchesLocaleUrl(url) {
    if (!url) return false;
    const hasLocalePrefix = localePattern.test(url);
    if (locale === 'en') return !hasLocalePrefix;
    return url.startsWith(`${localePrefix}/`) || url === localePrefix;
  }

  function scoreItem(item, terms) {
    const title = normalize(item.title || '');
    const description = normalize(item.description || '');
    const content = normalize(item.searchText || '');
    let score = 0;

    terms.forEach(term => {
      if (title.includes(term)) score += 8;
      if (description.includes(term)) score += 4;
      if (content.includes(term)) score += 2;
    });

    return score;
  }

  function render(list, query) {
    results.innerHTML = '';

    if (!query) {
      count.textContent = copy.idle;
      return;
    }

    if (!list.length) {
      count.textContent = copy.noResults;
      results.innerHTML = `<p class="mb-0">${escapeHtml(copy.noResultsHint)}</p>`;
      return;
    }

    count.textContent = copy.results(list.length);

    const fragment = document.createDocumentFragment();
    list.forEach(item => {
      const card = document.createElement('article');
      card.className = 'enhancement-card mb-3';
      const href = safeInternalUrl(item.url);
      card.innerHTML = `
        <h2 class="h5 mb-2"><a href="${escapeHtml(href)}" class="text-gold">${escapeHtml(item.title || '')}</a></h2>
        <p class="small mb-2">${escapeHtml(item.description || copy.noDescription)}</p>
        <p class="small mb-0 opacity-75">${escapeHtml(href)}</p>
      `;
      fragment.appendChild(card);
    });
    results.appendChild(fragment);
  }

  async function loadIndex() {
    try {
      const response = await fetch('/data/search-index.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('search index unavailable');
      const payload = await response.json();
      searchIndex = Array.isArray(payload) ? payload.filter(item => matchesLocaleUrl(item.url || '')) : [];
      render([], '');
    } catch (error) {
      count.textContent = copy.unavailable;
      console.error(error);
    }
  }

  input.addEventListener('input', () => {
    const query = normalize(input.value);
    if (!query) {
      render([], '');
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const ranked = searchIndex
      .map(item => ({ item, score: scoreItem(item, terms) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(entry => entry.item);

    render(ranked, query);
  });

  loadIndex();
})();
