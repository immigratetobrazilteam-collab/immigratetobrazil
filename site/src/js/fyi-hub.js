(function () {
  'use strict';

  const FEED_URL = '/data/fyi/fyi-index.json';
  const locale = (document.documentElement.lang || 'en').slice(0, 2);
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  const copy = {
    en: {
      allGroups: 'All FYI groups',
      readPage: 'Read FYI page',
      count: total => `${total} FYI page${total === 1 ? '' : 's'}`,
      unavailableTitle: 'FYI feed is unavailable right now',
      unavailableBody: 'Please refresh this page in a moment.'
    },
    pt: {
      allGroups: 'Todos os grupos FYI',
      readPage: 'Abrir página FYI',
      count: total => `${total} página${total === 1 ? '' : 's'} FYI`,
      unavailableTitle: 'O feed FYI está indisponível no momento',
      unavailableBody: 'Atualize esta página em instantes.'
    },
    es: {
      allGroups: 'Todos los grupos FYI',
      readPage: 'Abrir página FYI',
      count: total => `${total} página${total === 1 ? '' : 's'} FYI`,
      unavailableTitle: 'El feed FYI no está disponible en este momento',
      unavailableBody: 'Actualiza esta página en unos instantes.'
    },
    fr: {
      allGroups: 'Tous les groupes FYI',
      readPage: 'Ouvrir la page FYI',
      count: total => `${total} page${total === 1 ? '' : 's'} FYI`,
      unavailableTitle: "Le flux FYI est indisponible pour le moment",
      unavailableBody: 'Actualisez cette page dans un instant.'
    }
  }[locale] || {
    allGroups: 'All FYI groups',
    readPage: 'Read FYI page',
    count: total => `${total} FYI page${total === 1 ? '' : 's'}`,
    unavailableTitle: 'FYI feed is unavailable right now',
    unavailableBody: 'Please refresh this page in a moment.'
  };

  const state = {
    items: [],
    query: '',
    groupId: 'all'
  };

  const refs = {
    search: document.getElementById('fyi-search'),
    group: document.getElementById('fyi-group'),
    count: document.getElementById('fyi-count'),
    grid: document.getElementById('fyi-grid'),
    empty: document.getElementById('fyi-empty'),
    jsonld: document.getElementById('fyi-hub-jsonld')
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function localizeUrl(url) {
    const safeUrl = String(url || '/fyi.html');
    if (!safeUrl.startsWith('/')) return '/fyi.html';
    if (locale === 'en') return safeUrl;
    return `${localePrefix}${safeUrl}`;
  }

  function groupOptions(items) {
    const groups = new Map();
    items.forEach(item => {
      if (item.groupId && item.groupLabel) groups.set(item.groupId, item.groupLabel);
    });
    return [[ 'all', copy.allGroups ], ...Array.from(groups.entries()).sort((a, b) => a[1].localeCompare(b[1]))];
  }

  function bindGroupOptions(items) {
    if (!refs.group) return;

    refs.group.innerHTML = groupOptions(items)
      .map(([groupId, groupLabel]) => `<option value="${escapeHtml(groupId)}">${escapeHtml(groupLabel)}</option>`)
      .join('');
  }

  function filteredItems() {
    const query = normalize(state.query);

    return state.items.filter(item => {
      if (state.groupId !== 'all' && item.groupId !== state.groupId) return false;
      if (!query) return true;

      const haystack = [
        item.title,
        item.summary,
        item.sourceDomain,
        item.groupLabel,
        (item.serviceTags || []).join(' ')
      ]
        .join(' ')
        .toLowerCase();

      return normalize(haystack).includes(query);
    });
  }

  function updateJsonLd(items) {
    if (!refs.jsonld) return;

    const payload = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'FYI Hub',
      itemListElement: items.slice(0, 30).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: item.title || 'FYI Page',
          url: `https://monique-fernandes.com${localizeUrl(item.url)}`,
          dateModified: item.lastUpdated || '',
          description: item.summary || '',
          image: item.image ? `https://monique-fernandes.com${item.image}` : undefined
        }
      }))
    };

    refs.jsonld.textContent = JSON.stringify(payload);
  }

  function render() {
    if (!refs.grid) return;

    const items = filteredItems();

    refs.grid.innerHTML = items
      .map(item => {
        const url = localizeUrl(item.url);
        const groupHtml = item.groupLabel ? `<span class="insight-feed-card__hub">${escapeHtml(item.groupLabel)}</span>` : '';

        return `
          <div class="col-12 col-md-6 col-xl-4">
            <article class="insight-feed-card h-100">
              <a class="insight-feed-card__image-link" href="${escapeHtml(url)}">
                <img class="insight-feed-card__image" src="${escapeHtml(item.image || '/assets/img/og-image.jpg')}" alt="${escapeHtml(item.imageAlt || item.title || 'FYI image')}" loading="lazy"/>
              </a>
              <div class="insight-feed-card__body">
                ${groupHtml ? `<p class="insight-feed-card__meta mb-2">${groupHtml}</p>` : ''}
                <h2 class="insight-feed-card__title h5 mb-2"><a href="${escapeHtml(url)}">${escapeHtml(item.title || 'FYI Update')}</a></h2>
                <p class="insight-feed-card__excerpt mb-3">${escapeHtml(item.summary || '')}</p>
                <div class="d-flex flex-wrap gap-2">
                  <a class="insight-feed-card__read" href="${escapeHtml(url)}">${escapeHtml(copy.readPage)}</a>
                </div>
              </div>
            </article>
          </div>
        `;
      })
      .join('');

    if (refs.count) refs.count.textContent = copy.count(items.length);
    if (refs.empty) refs.empty.hidden = items.length !== 0;
    updateJsonLd(items);
  }

  function bindEvents() {
    if (refs.search) {
      refs.search.addEventListener('input', event => {
        state.query = event.target.value || '';
        render();
      });
    }

    if (refs.group) {
      refs.group.addEventListener('change', event => {
        state.groupId = event.target.value || 'all';
        render();
      });
    }
  }

  async function loadFeed() {
    const response = await fetch(FEED_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`FYI feed unavailable: ${response.status}`);

    const payload = await response.json();
    state.items = Array.isArray(payload.items) ? payload.items : [];
  }

  async function init() {
    if (!refs.grid) return;

    bindEvents();

    try {
      await loadFeed();
      bindGroupOptions(state.items);
      render();
    } catch (error) {
      refs.grid.innerHTML = `
        <div class="col-12">
          <div class="insight-feed-empty">
            <h2 class="h5 mb-2">${escapeHtml(copy.unavailableTitle)}</h2>
            <p class="mb-0">${escapeHtml(copy.unavailableBody)}</p>
          </div>
        </div>
      `;
      if (refs.count) refs.count.textContent = copy.count(0);
      console.error(error);
    }
  }

  init();
})();
