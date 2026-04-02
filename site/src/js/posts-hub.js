document.addEventListener('DOMContentLoaded', () => {
  const topicMeta = {
    'brazilian-naturalisation': {
      label: { en: 'Brazilian citizenship', pt: 'cidadania brasileira' },
      description: 'Naturalisation, nationality, passports, parent-based citizenship, and related mobility topics.',
      knowledgeHref: '/legal-knowledge-center/brazilian-naturalisation',
      blogHref: '/blog/brazilian-naturalisation'
    },
    'brazilian-visas': {
      label: { en: 'Brazilian visas', pt: 'vistos brasileiros' },
      description: 'Visitor, work, student, investor, family, and route-comparison visa content.',
      knowledgeHref: '/legal-knowledge-center/brazilian-visas',
      blogHref: '/blog/brazilian-visas'
    },
    'brazilian-residencies': {
      label: { en: 'Brazilian residencies', pt: 'residencias brasileiras' },
      description: 'Residency pathways, compliance, follow-up, and living-in-Brazil planning.',
      knowledgeHref: '/legal-knowledge-center/brazilian-residencies',
      blogHref: '/blog/brazilian-residencies'
    },
    'family-law': {
      label: { en: 'Family law', pt: 'direito de familia' },
      description: 'Marriage, divorce, custody, guardianship, inheritance, and cross-border family matters.',
      knowledgeHref: '/legal-knowledge-center/family-law',
      blogHref: '/blog/family-law'
    },
    'civil-law': {
      label: { en: 'Civil law', pt: 'direito civil' },
      description: 'Consumer rights, contracts, records, disputes, and practical civil-law support.',
      knowledgeHref: '/legal-knowledge-center/civil-law',
      blogHref: '/blog/civil-law'
    },
    'human-rights': {
      label: { en: 'Human rights', pt: 'direitos humanos' },
      description: 'Rights-based guidance for vulnerable communities, protection, and anti-discrimination issues.',
      knowledgeHref: '/legal-knowledge-center/human-rights',
      blogHref: '/blog/human-rights'
    },
    'immigration-abroad': {
      label: { en: 'Immigration abroad', pt: 'imigracao no exterior' },
      description: 'Outbound mobility, destination-country changes, and international movement topics.',
      knowledgeHref: '/legal-knowledge-center/immigration-abroad',
      blogHref: '/blog/immigration-abroad'
    },
    'other-immigration-services': {
      label: { en: 'Other immigration services', pt: 'outros servicos de imigracao' },
      description: 'Appeals, fines, consular help, deportation, expulsion, and operational immigration issues.',
      knowledgeHref: '/legal-knowledge-center/other-immigration-services',
      blogHref: '/blog/other-immigration-services'
    }
  };

  const body = document.body;
  const grid = document.getElementById('posts-grid');
  const tabs = document.getElementById('posts-tab-list');
  const directory = document.getElementById('posts-topic-directory');
  const search = document.getElementById('posts-search');
  const searchLabel = document.querySelector('.posts-search-label');
  const summary = document.getElementById('posts-results-summary');
  const loadMore = document.getElementById('posts-load-more');
  const languageToggle = document.getElementById('language-toggle');

  if (!grid || !tabs || !directory || !search || !summary || !loadMore || !languageToggle) {
    return;
  }

  const emptyState = document.createElement('div');
  emptyState.className = 'posts-empty';
  emptyState.hidden = true;
  grid.insertAdjacentElement('afterend', emptyState);

  const cards = Array.from(grid.querySelectorAll('.post-card'));
  const batchSize = 18;

  const state = {
    lang: body.dataset.postsLang || 'en',
    topic: 'all',
    search: '',
    visibleCount: batchSize
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function extractTopic(card) {
    const image = card.querySelector('.post-image');
    const source = image?.getAttribute('src') || '';
    const match = source.match(/assets\/img\/(?:insights|posts)\/([^/]+)/);
    if (match?.[1]) return match[1];

    const alt = normalize(image?.getAttribute('alt') || '');
    if (alt.includes('citizenship') || alt.includes('naturalisation') || alt.includes('naturalization')) {
      return 'brazilian-naturalisation';
    }
    if (alt.includes('visa')) return 'brazilian-visas';
    if (alt.includes('residency') || alt.includes('residence')) return 'brazilian-residencies';
    if (alt.includes('family')) return 'family-law';
    if (alt.includes('civil') || alt.includes('consumer')) return 'civil-law';
    if (alt.includes('human rights')) return 'human-rights';
    if (alt.includes('abroad') || alt.includes('overseas')) return 'immigration-abroad';
    return 'other-immigration-services';
  }

  function extractYear(card) {
    const image = card.querySelector('.post-image');
    const source = image?.getAttribute('src') || '';
    const match = source.match(/\/(20\d{2})\//);
    return match?.[1] || '';
  }

  function getVisibleLabel(topic) {
    if (topic === 'all') {
      return state.lang === 'pt' ? 'todos os temas' : 'all topics';
    }
    return topicMeta[topic]?.label[state.lang] || topicMeta[topic]?.label.en || topic;
  }

  function updateLanguageCopy() {
    body.dataset.postsLang = state.lang;
    languageToggle.textContent = state.lang === 'en' ? 'Ver em português' : 'View in English';
    search.placeholder =
      state.lang === 'en'
        ? 'Search visa, citizenship, family, Brazil, passport, deportation...'
        : 'Buscar visto, cidadania, familia, Brasil, passaporte, deportacao...';
    searchLabel.textContent =
      state.lang === 'en'
        ? 'Search by title, caption, hashtag, country, or legal topic'
        : 'Busque por titulo, legenda, hashtag, pais ou tema juridico';

    Array.from(directory.querySelectorAll('.posts-filter-topic')).forEach(button => {
      const key = button.dataset.topic || 'all';
      button.textContent =
        key === 'all'
          ? (state.lang === 'en' ? 'Show posts' : 'Ver posts')
          : (state.lang === 'en' ? 'Open this hub' : 'Abrir este hub');
    });

    Array.from(cards).forEach(card => {
      const button = card.querySelector('.post-expand');
      if (!button) return;
      button.textContent = card.classList.contains('is-expanded')
        ? (state.lang === 'en' ? 'Show less' : 'Mostrar menos')
        : (state.lang === 'en' ? 'Read more' : 'Ler mais');
    });
  }

  cards.forEach(card => {
    const topic = extractTopic(card);
    const year = extractYear(card);
    const title = card.querySelector('.post-title');
    const caption = card.querySelector('.post-caption');
    const hashtags = card.querySelector('.post-hashtags');
    const username = card.querySelector('.username');

    card.dataset.topic = topic;
    card.dataset.year = year;
    card.dataset.search = normalize(card.textContent);

    if (title) {
      const header = document.createElement('div');
      header.className = 'post-header';

      const topicBadge = document.createElement('span');
      topicBadge.className = 'post-topic-badge';
      topicBadge.textContent = topicMeta[topic]?.label.en || topic;
      header.appendChild(topicBadge);

      if (year) {
        const yearBadge = document.createElement('span');
        yearBadge.className = 'post-year-badge';
        yearBadge.textContent = year;
        header.appendChild(yearBadge);
      }

      title.insertAdjacentElement('beforebegin', header);
    }

    if (username) {
      username.textContent = '@moniquefadv';
    }

    if (caption && username) {
      const expand = document.createElement('button');
      expand.type = 'button';
      expand.className = 'post-expand';
      expand.textContent = 'Read more';
      expand.addEventListener('click', () => {
        card.classList.toggle('is-expanded');
        expand.textContent = card.classList.contains('is-expanded')
          ? (state.lang === 'en' ? 'Show less' : 'Mostrar menos')
          : (state.lang === 'en' ? 'Read more' : 'Ler mais');
      });

      const actions = document.createElement('div');
      actions.className = 'post-card-actions';
      actions.append(expand, username);
      username.remove();
      caption.insertAdjacentElement('afterend', actions);
    }

    if (hashtags && !hashtags.textContent.trim()) {
      hashtags.remove();
    }
  });

  const topicCounts = cards.reduce((accumulator, card) => {
    const topic = card.dataset.topic;
    accumulator[topic] = (accumulator[topic] || 0) + 1;
    return accumulator;
  }, {});

  function buildTabs() {
    const items = [{ key: 'all', count: cards.length }].concat(
      Object.keys(topicMeta)
        .filter(key => topicCounts[key])
        .map(key => ({ key, count: topicCounts[key] }))
    );

    tabs.innerHTML = items
      .map(item => {
        const label = item.key === 'all' ? 'All posts' : topicMeta[item.key].label.en;
        return `<button class="posts-tab" data-topic="${escapeHtml(item.key)}" role="tab" type="button">${escapeHtml(label)} <span class="posts-pill">${item.count}</span></button>`;
      })
      .join('');

    Array.from(tabs.querySelectorAll('.posts-tab')).forEach(button => {
      button.addEventListener('click', () => {
        state.topic = button.dataset.topic || 'all';
        state.visibleCount = batchSize;
        render();
      });
    });
  }

  function buildDirectory() {
    const cardsHtml = Object.keys(topicMeta)
      .filter(key => topicCounts[key])
      .map(key => {
        const meta = topicMeta[key];
        return `
          <article class="posts-topic-card" data-topic-card="${escapeHtml(key)}">
            <div>
              <span class="posts-kicker"><i class="fa-solid fa-folder"></i>${escapeHtml(meta.label.en)}</span>
              <h3 class="h5 text-gold mt-3 mb-2">${escapeHtml(meta.label.en)}</h3>
              <p class="mb-0 text-cream">${escapeHtml(meta.description)}</p>
            </div>
            <div class="posts-topic-meta">
              <span class="posts-pill">${topicCounts[key]} posts</span>
              <span class="posts-pill">topic hub</span>
            </div>
            <div class="post-card-actions">
              <button class="posts-mini-link posts-filter-topic" data-topic="${escapeHtml(key)}" type="button">Open this hub</button>
              <a class="posts-mini-link" href="${escapeHtml(meta.knowledgeHref)}">Knowledge center</a>
              <a class="posts-mini-link" href="${escapeHtml(meta.blogHref)}">Topic page</a>
            </div>
          </article>
        `;
      })
      .join('');

    directory.innerHTML = cardsHtml;

    Array.from(directory.querySelectorAll('.posts-filter-topic')).forEach(button => {
      button.addEventListener('click', () => {
        state.topic = button.dataset.topic || 'all';
        state.visibleCount = batchSize;
        render();
        tabs.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  function getMatches() {
    const searchTerm = normalize(state.search);

    return cards.filter(card => {
      const matchesTopic = state.topic === 'all' || card.dataset.topic === state.topic;
      const matchesSearch = !searchTerm || card.dataset.search.includes(searchTerm);
      return matchesTopic && matchesSearch;
    });
  }

  function render() {
    const matches = getMatches();
    const visible = matches.slice(0, state.visibleCount);

    cards.forEach(card => {
      card.hidden = !visible.includes(card);
    });

    Array.from(tabs.querySelectorAll('.posts-tab')).forEach(button => {
      button.classList.toggle('is-active', (button.dataset.topic || 'all') === state.topic);
      button.setAttribute('aria-selected', String((button.dataset.topic || 'all') === state.topic));
    });

    Array.from(directory.querySelectorAll('[data-topic-card]')).forEach(card => {
      card.classList.toggle('is-active', card.getAttribute('data-topic-card') === state.topic);
    });

    const label = getVisibleLabel(state.topic);
    if (matches.length) {
      emptyState.hidden = true;
      summary.textContent =
        state.lang === 'en'
          ? `Showing ${visible.length} of ${matches.length} posts in ${label}.`
          : `Mostrando ${visible.length} de ${matches.length} posts em ${label}.`;
    } else {
      emptyState.hidden = false;
      emptyState.textContent =
        state.lang === 'en'
          ? 'No posts match this search yet. Try a broader keyword or switch back to all topics.'
          : 'Nenhum post corresponde a essa busca. Tente uma palavra mais ampla ou volte para todos os temas.';
      summary.textContent =
        state.lang === 'en'
          ? 'No posts match this filter.'
          : 'Nenhum post corresponde a esse filtro.';
    }

    loadMore.hidden = matches.length <= state.visibleCount;
    loadMore.textContent = state.lang === 'en' ? 'Load more posts' : 'Carregar mais posts';
  }

  languageToggle.addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'pt' : 'en';
    updateLanguageCopy();
    render();
  });

  search.addEventListener('input', event => {
    state.search = event.target.value || '';
    state.visibleCount = batchSize;
    render();
  });

  loadMore.addEventListener('click', () => {
    state.visibleCount += batchSize;
    render();
  });

  buildTabs();
  buildDirectory();
  updateLanguageCopy();
  render();
});
