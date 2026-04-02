(function () {
  'use strict';

  const section = document.querySelector('[data-static-blog-feed="true"]');
  if (!section) return;

  const PAGE_SIZE = Number(section.getAttribute('data-page-size') || 24);
  const refs = {
    count: document.getElementById('insights-count'),
    chips: document.getElementById('insights-hub-filters'),
    grid: document.getElementById('insights-grid'),
    hubPages: document.getElementById('insights-hub-pages'),
    loadMore: document.getElementById('insights-load-more'),
    search: document.getElementById('insights-search'),
    sort: document.getElementById('insights-sort')
  };
  if (!refs.grid) return;

  const cards = Array.from(refs.grid.querySelectorAll('[data-insight-card="true"]'));
  if (!cards.length) return;

  const allHubsLabel = section.getAttribute('data-all-hubs-label') || 'All Hubs';
  const insightsWord = section.getAttribute('data-insights-word') || 'insights';
  const basePath = window.location.pathname || section.getAttribute('data-feed-base-path') || '/insights.html';
  const hubQuery = new URLSearchParams(window.location.search).get('hub') || 'all';
  const knownHubs = [];
  const hubMap = new Map();

  cards.forEach(card => {
    const key = card.getAttribute('data-hub-key') || '';
    const label = card.getAttribute('data-hub-label') || key;
    if (!key || hubMap.has(key)) return;
    hubMap.set(key, { key, label, count: 0 });
    knownHubs.push(key);
  });

  cards.forEach(card => {
    const key = card.getAttribute('data-hub-key') || '';
    if (!hubMap.has(key)) return;
    hubMap.get(key).count += 1;
  });

  const state = {
    activeHub: hubMap.has(hubQuery) ? hubQuery : 'all',
    page: 1,
    query: '',
    sort: refs.sort?.value || 'newest'
  };

  const normalize = value =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const hubPath = key => {
    const url = new URL(basePath, window.location.origin);
    if (key && key !== 'all') {
      url.searchParams.set('hub', key);
    } else {
      url.searchParams.delete('hub');
    }
    url.hash = 'blog-feed';
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const renderHubPages = () => {
    if (!refs.hubPages) return;
    refs.hubPages.innerHTML = knownHubs
      .map(key => {
        const hub = hubMap.get(key);
        return `<a class="insights-hub-page-link" href="${hubPath(hub.key)}">${hub.label}</a>`;
      })
      .join('');
  };

  const renderHubChips = () => {
    if (!refs.chips) return;
    const chips = [
      { key: 'all', label: `${allHubsLabel} (${cards.length})` },
      ...knownHubs.map(key => {
        const hub = hubMap.get(key);
        return { key: hub.key, label: `${hub.label} (${hub.count})` };
      })
    ];

    refs.chips.innerHTML = chips
      .map(
        chip => `
          <button class="insights-chip${state.activeHub === chip.key ? ' is-active' : ''}" type="button" data-hub="${chip.key}">
            ${chip.label}
          </button>
        `
      )
      .join('');

    refs.chips.querySelectorAll('[data-hub]').forEach(button => {
      button.addEventListener('click', () => {
        state.activeHub = button.getAttribute('data-hub') || 'all';
        state.page = 1;
        render();
      });
    });
  };

  const filteredCards = () =>
    cards.filter(card => {
      const hubKey = card.getAttribute('data-hub-key') || '';
      const title = card.getAttribute('data-title') || '';
      const excerpt = card.getAttribute('data-excerpt') || '';
      const matchesHub = state.activeHub === 'all' || hubKey === state.activeHub;
      if (!matchesHub) return false;
      if (!state.query) return true;
      return normalize(`${title} ${excerpt} ${hubKey}`).includes(state.query);
    });

  const sortCards = list =>
    list.slice().sort((left, right) => {
      const leftDate = Number(left.getAttribute('data-timestamp') || 0);
      const rightDate = Number(right.getAttribute('data-timestamp') || 0);
      const leftTitle = left.getAttribute('data-title') || '';
      const rightTitle = right.getAttribute('data-title') || '';
      if (state.sort === 'oldest') return leftDate - rightDate;
      if (state.sort === 'title-asc') return leftTitle.localeCompare(rightTitle);
      if (state.sort === 'title-desc') return rightTitle.localeCompare(leftTitle);
      return rightDate - leftDate;
    });

  const render = () => {
    renderHubPages();
    renderHubChips();

    const filtered = sortCards(filteredCards());
    const visibleCount = state.page * PAGE_SIZE;
    const fragment = document.createDocumentFragment();

    filtered.forEach((card, index) => {
      card.hidden = index >= visibleCount;
      fragment.appendChild(card);
    });

    cards
      .filter(card => !filtered.includes(card))
      .forEach(card => {
        card.hidden = true;
        fragment.appendChild(card);
      });

    refs.grid.appendChild(fragment);

    if (refs.count) {
      refs.count.textContent = `${filtered.length} ${insightsWord}`;
    }

    if (refs.loadMore) {
      const hasMore = filtered.length > visibleCount;
      refs.loadMore.hidden = !hasMore;
      refs.loadMore.disabled = !hasMore;
    }
  };

  refs.search?.addEventListener('input', event => {
    state.query = normalize(event.target.value || '');
    state.page = 1;
    render();
  });

  refs.sort?.addEventListener('change', event => {
    state.sort = event.target.value || 'newest';
    state.page = 1;
    render();
  });

  refs.loadMore?.addEventListener('click', () => {
    state.page += 1;
    render();
  });

  render();
})();
