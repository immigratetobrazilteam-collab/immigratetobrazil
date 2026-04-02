(function () {
  'use strict';

  const PAGE_SIZE = 24;
  const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr'];
  const localeToken = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().slice(0, 2);
  const CURRENT_LOCALE = SUPPORTED_LOCALES.includes(localeToken) ? localeToken : 'en';
  const DATE_LOCALE = { en: 'en-US', pt: 'pt-BR', es: 'es-ES', fr: 'fr-FR' }[CURRENT_LOCALE] || 'en-US';
  const LOCAL_PREVIEW_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);
  const FEED_URL_BY_LOCALE = {
    en: '/data/insights-feed.json',
    pt: '/data/insights-feed.pt.json',
    es: '/data/insights-feed.es.json',
    fr: '/data/insights-feed.fr.json'
  };
  const PRIMARY_FEED_URL = FEED_URL_BY_LOCALE[CURRENT_LOCALE] || FEED_URL_BY_LOCALE.en;
  const FALLBACK_FEED_URL = FEED_URL_BY_LOCALE.en;
  const FALLBACK_CARD_IMAGE = '/assets/img/profile/blog/photo.lawyer.professional.trusted.BAR.OAB.Brazil.attorney.help.how-to.png';
  const BLOG_LANDING_PATH = '/insights.html';
  const BLOG_LOCALE_STUB_PATH = '/blog.html';

  const I18N = {
    en: {
      allHubs: 'All Hubs',
      insightsWord: 'insights',
      readFallback: 'Read full insight',
      cardAlt: 'Legal insight preview image',
      errorTitle: 'Insights feed unavailable right now',
      errorBody: 'Please refresh the page in a moment.',
      jsonldName: 'Brazil Immigration Insights Feed',
      cta: {
        visa: ['See visa pathway details', 'Review visa requirements', 'Check visa eligibility steps'],
        residency: ['Explore residency criteria', 'Review residency timeline', 'Open full residency guidance'],
        citizenship: ['Understand citizenship options', 'Review naturalisation steps', 'Open citizenship guidance'],
        family: ['Read full family-law breakdown', 'See family process guidance', 'Review family legal steps'],
        rights: ['Explore rights-based guidance', 'Open full rights analysis', 'Review protection pathways'],
        news: ['See full legal update', 'Read the complete update', 'Open full policy note'],
        default: ['Read full legal insight', 'Explore the full guidance', 'Open detailed legal analysis']
      }
    },
    pt: {
      allHubs: 'Todos os Hubs',
      insightsWord: 'insights',
      readFallback: 'Ler insight completo',
      cardAlt: 'Imagem de preview de insight juridico',
      errorTitle: 'Feed de insights indisponivel no momento',
      errorBody: 'Atualize a pagina em instantes.',
      jsonldName: 'Feed de Insights Juridicos de Imigracao no Brasil',
      cta: {
        visa: ['Ver detalhes da rota de visto', 'Revisar requisitos de visto', 'Checar elegibilidade de visto'],
        residency: ['Explorar criterios de residencia', 'Revisar cronograma de residencia', 'Abrir guia completo de residencia'],
        citizenship: ['Entender opcoes de cidadania', 'Revisar etapas de naturalizacao', 'Abrir guia de cidadania'],
        family: ['Ler analise completa de familia', 'Ver orientacao processual familiar', 'Revisar etapas juridicas de familia'],
        rights: ['Explorar orientacao de direitos', 'Abrir analise completa de direitos', 'Revisar vias de protecao'],
        news: ['Ver atualizacao juridica completa', 'Ler a atualizacao completa', 'Abrir nota completa de politica'],
        default: ['Ler insight juridico completo', 'Explorar orientacao completa', 'Abrir analise juridica detalhada']
      }
    },
    es: {
      allHubs: 'Todos los Hubs',
      insightsWord: 'insights',
      readFallback: 'Leer insight completo',
      cardAlt: 'Imagen previa de insight legal',
      errorTitle: 'El feed de insights no esta disponible ahora',
      errorBody: 'Actualice la pagina en un momento.',
      jsonldName: 'Feed de Insights Legales de Inmigracion en Brasil',
      cta: {
        visa: ['Ver detalles de la ruta de visa', 'Revisar requisitos de visa', 'Comprobar elegibilidad de visa'],
        residency: ['Explorar criterios de residencia', 'Revisar cronograma de residencia', 'Abrir guia completa de residencia'],
        citizenship: ['Entender opciones de ciudadania', 'Revisar pasos de naturalizacion', 'Abrir guia de ciudadania'],
        family: ['Leer analisis completo de familia', 'Ver guia del proceso familiar', 'Revisar pasos legales de familia'],
        rights: ['Explorar orientacion de derechos', 'Abrir analisis completo de derechos', 'Revisar rutas de proteccion'],
        news: ['Ver actualizacion legal completa', 'Leer la actualizacion completa', 'Abrir nota completa de politica'],
        default: ['Leer insight legal completo', 'Explorar guia completa', 'Abrir analisis legal detallado']
      }
    },
    fr: {
      allHubs: 'Tous les Hubs',
      insightsWord: 'insights',
      readFallback: 'Lire l insight complet',
      cardAlt: 'Image d apercu d insight juridique',
      errorTitle: 'Le flux d insights est indisponible pour le moment',
      errorBody: 'Veuillez actualiser la page dans un instant.',
      jsonldName: 'Flux d Insights Juridiques Immigration Bresil',
      cta: {
        visa: ['Voir le detail du parcours visa', 'Verifier les exigences visa', 'Controler l eligibilite visa'],
        residency: ['Explorer les criteres de residence', 'Verifier le calendrier de residence', 'Ouvrir le guide complet de residence'],
        citizenship: ['Comprendre les options de citoyennete', 'Verifier les etapes de naturalisation', 'Ouvrir le guide citoyennete'],
        family: ['Lire l analyse complete famille', 'Voir le guide du processus familial', 'Verifier les etapes juridiques famille'],
        rights: ['Explorer les orientations droits', 'Ouvrir l analyse complete droits', 'Verifier les voies de protection'],
        news: ['Voir la mise a jour juridique complete', 'Lire la mise a jour complete', 'Ouvrir la note complete de politique'],
        default: ['Lire l insight juridique complet', 'Explorer le guide complet', 'Ouvrir l analyse juridique detaillee']
      }
    }
  };

  const state = {
    items: [],
    hubs: [],
    activeHub: 'all',
    activeCollection: '',
    query: '',
    sort: 'newest',
    page: 1,
    autoLoadLocked: false
  };

  const COLLECTION_HUBS = {
    'immigrate-to-brazil': [
      'brazilian-visas',
      'brazilian-residencies',
      'brazilian-naturalisation',
      'other-immigration-services'
    ]
  };

  let refs = {};
  let initAttempts = 0;

  function refreshRefs() {
    refs = {
      hubPages: document.getElementById('insights-hub-pages'),
      chips: document.getElementById('insights-hub-filters'),
      search: document.getElementById('insights-search'),
      sort: document.getElementById('insights-sort'),
      count: document.getElementById('insights-count'),
      grid: document.getElementById('insights-grid'),
      loadMore: document.getElementById('insights-load-more'),
      jsonld: document.getElementById('blog-feed-jsonld')
    };
  }

  function t(key) {
    return (I18N[CURRENT_LOCALE] && I18N[CURRENT_LOCALE][key]) || I18N.en[key] || '';
  }

  function ctaSet() {
    return (I18N[CURRENT_LOCALE] && I18N[CURRENT_LOCALE].cta) || I18N.en.cta;
  }

  function splitHref(href) {
    const value = String(href || '');
    const hashIndex = value.indexOf('#');
    const queryIndex = value.indexOf('?');
    let cutIndex = value.length;
    if (queryIndex !== -1) cutIndex = Math.min(cutIndex, queryIndex);
    if (hashIndex !== -1) cutIndex = Math.min(cutIndex, hashIndex);

    return {
      path: value.slice(0, cutIndex) || '/',
      query: queryIndex !== -1 ? value.slice(queryIndex, hashIndex === -1 ? value.length : hashIndex) : '',
      hash: hashIndex !== -1 ? value.slice(hashIndex) : ''
    };
  }

  function normalizePagePath(path) {
    let normalized = String(path || '/');
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;
    normalized = normalized.replace(/^\/(pt|es|fr)(?=\/|$)/i, '');
    if (normalized === '/blog' || normalized === '/blog.html') return BLOG_LANDING_PATH;
    if (normalized === '/' || normalized === '') return '/index.html';
    if (normalized.endsWith('/')) {
      const trimmed = normalized.slice(0, -1);
      if (trimmed === '') return '/index.html';
      const depth = trimmed.split('/').filter(Boolean).length;
      return depth <= 1 ? `${trimmed}.html` : `${normalized}index.html`;
    }
    if (!normalized.endsWith('.html')) {
      normalized = `${normalized}.html`;
    }
    return normalized;
  }

  function toPublicPath(path) {
    let normalized = path || '/index.html';
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;
    if (normalized === '/index.html') return '/';
    if (normalized.endsWith('/index.html')) return `${normalized.slice(0, -'/index.html'.length).replace(/\/+$/, '')}/`;
    if (normalized.endsWith('.html')) return normalized.slice(0, -5);
    return normalized;
  }

  function isLocalPreviewEnvironment() {
    const { protocol, hostname } = window.location;
    return (
      protocol === 'file:' ||
      LOCAL_PREVIEW_HOSTNAMES.has((hostname || '').toLowerCase()) ||
      /\.local$/i.test(hostname || '')
    );
  }

  function normalizeNavigableFilePath(path) {
    let normalized = path || '/index.html';
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;

    if (normalized === '/') return '/index.html';

    const localeRootMatch = normalized.match(/^\/(pt|es|fr)(?:\/)?$/i);
    if (localeRootMatch) {
      return `/${localeRootMatch[1].toLowerCase()}/index.html`;
    }

    return normalizePagePath(normalized);
  }

  function localizePath(path) {
    const parts = splitHref(path);
    const normalized = normalizePagePath(parts.path || '/index.html');
    const localizedPath =
      normalized === BLOG_LANDING_PATH && CURRENT_LOCALE !== 'en'
        ? `/${CURRENT_LOCALE}${BLOG_LOCALE_STUB_PATH}`
        : CURRENT_LOCALE === 'en'
          ? normalized
          : `/${CURRENT_LOCALE}${normalized}`;
    const navigablePath = isLocalPreviewEnvironment() ? normalizeNavigableFilePath(localizedPath) : toPublicPath(localizedPath);
    return `${navigablePath}${parts.query}${parts.hash}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString(DATE_LOCALE, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function sortedItems(items) {
    const copy = [...items];
    copy.sort((a, b) => {
      const aDate = Date.parse(a.date || '1970-01-01');
      const bDate = Date.parse(b.date || '1970-01-01');

      if (state.sort === 'oldest') return aDate - bDate;
      if (state.sort === 'title-asc') return String(a.titleShort || a.title || '').localeCompare(String(b.titleShort || b.title || ''));
      if (state.sort === 'title-desc') return String(b.titleShort || b.title || '').localeCompare(String(a.titleShort || a.title || ''));
      return bDate - aDate;
    });
    return copy;
  }

  function normalizedTitle(item) {
    return item.titleShort || item.title || 'Insight';
  }

  function normalizedExcerpt(item) {
    return item.excerptShort || item.excerpt || '';
  }

  function isRenderableImagePath(value) {
    const path = String(value || '').trim();
    if (!path) return false;
    if (!/^\/.+\.(avif|gif|jpe?g|png|svg|webp)$/i.test(path)) return false;
    return true;
  }

  function updateJsonLd(visible) {
    if (!refs.jsonld) return;

    const blogFallback = CURRENT_LOCALE === 'en' ? '/insights.html' : '/blog.html';
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('jsonldName'),
      itemListElement: visible.slice(0, 30).map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'BlogPosting',
          headline: item.title || normalizedTitle(item),
          url: `https://monique-fernandes.com${localizePath(item.url || blogFallback)}`,
          datePublished: item.date || '',
          image: item.image ? `https://monique-fernandes.com${item.image}` : undefined,
          description: normalizedExcerpt(item)
        }
      }))
    };

    refs.jsonld.textContent = JSON.stringify(payload);
  }

  function hashText(value) {
    let hash = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function pickVariant(list, seed) {
    if (!Array.isArray(list) || !list.length) return t('readFallback');
    return list[seed % list.length];
  }

  function cardCta(item) {
    const text = `${item.title || ''} ${item.excerpt || ''} ${item.hub || ''} ${item.contentType || ''}`.toLowerCase();
    const seed = hashText(item.id || item.url || item.title || '');
    const cta = ctaSet();

    if (text.includes('visa')) return pickVariant(cta.visa, seed);
    if (text.includes('residenc')) return pickVariant(cta.residency, seed);
    if (text.includes('citizenship') || text.includes('naturalisation') || text.includes('naturalization')) {
      return pickVariant(cta.citizenship, seed);
    }
    if (text.includes('family') || text.includes('custody') || text.includes('marriage')) return pickVariant(cta.family, seed);
    if (text.includes('rights') || text.includes('asylum') || text.includes('refugee')) return pickVariant(cta.rights, seed);
    if (text.includes('news') || text.includes('update')) return pickVariant(cta.news, seed);
    return pickVariant(cta.default, seed);
  }

  function currentFiltered() {
    const q = state.query.trim().toLowerCase();
    const collectionHubs = COLLECTION_HUBS[state.activeCollection] || null;

    return state.items.filter(item => {
      const hubMatch = state.activeHub === 'all' || item.hub === state.activeHub;
      if (!hubMatch) return false;
      if (collectionHubs && !collectionHubs.includes(item.hub)) return false;
      if (!q) return true;

      const haystack = [item.title, item.excerpt, item.hubLabel, item.contentType].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  function renderHubChips() {
    if (!refs.chips) return;

    const allCount = state.items.length;
    const chips = [{ key: 'all', label: `${t('allHubs')} (${allCount})` }, ...state.hubs.map(h => ({ key: h.key, label: `${h.label} (${h.count})` }))];

    refs.chips.innerHTML = chips
      .map(
        chip => `
          <button class="insights-chip${state.activeHub === chip.key ? ' is-active' : ''}" type="button" data-hub="${escapeHtml(chip.key)}">
            ${escapeHtml(chip.label)}
          </button>
        `
      )
      .join('');

    refs.chips.querySelectorAll('[data-hub]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeHub = btn.getAttribute('data-hub') || 'all';
        state.activeCollection = '';
        state.page = 1;
        render();
      });
    });
  }

  function renderHubPages() {
    if (!refs.hubPages) return;

    const links = state.hubs
      .map(hub => {
        const href = localizePath(`/blog/${hub.key}.html`);
        return `<a class="insights-hub-page-link" href="${escapeHtml(href)}">${escapeHtml(hub.label)}</a>`;
      })
      .join('');

    refs.hubPages.innerHTML = links;
  }

  function renderCards() {
    if (!refs.grid) return;

    const filtered = sortedItems(currentFiltered());
    const visible = filtered.slice(0, state.page * PAGE_SIZE);

    refs.grid.innerHTML = visible
      .map(item => {
        const href = localizePath(item.url || (CURRENT_LOCALE === 'en' ? '/insights.html' : '/blog.html'));
        const imageAlt = item.imageAlt || item.title || t('cardAlt');
        const imageSrc = isRenderableImagePath(item.image) ? item.image : FALLBACK_CARD_IMAGE;
        return `
          <article class="insight-feed-card h-100">
            <a class="insight-feed-card__image-link" href="${escapeHtml(href)}">
              <img class="insight-feed-card__image" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async"/>
            </a>
            <div class="insight-feed-card__body">
              <p class="insight-feed-card__meta mb-2">
                <span class="insight-feed-card__hub">${escapeHtml(item.hubLabel)}</span>
                <span class="insight-feed-card__dot" aria-hidden="true">•</span>
                <time datetime="${escapeHtml(item.date || '')}">${escapeHtml(formatDate(item.date))}</time>
              </p>
              <h3 class="insight-feed-card__title h5 mb-2">
                <a href="${escapeHtml(href)}">${escapeHtml(normalizedTitle(item))}</a>
              </h3>
              <p class="insight-feed-card__excerpt mb-3">${escapeHtml(normalizedExcerpt(item))}</p>
              <a class="insight-feed-card__read" href="${escapeHtml(href)}">${escapeHtml(cardCta(item))}</a>
            </div>
          </article>
        `;
      })
      .map(card => `<div class="col-12 col-md-6 col-xl-4">${card}</div>`)
      .join('');

    refs.grid.querySelectorAll('img.insight-feed-card__image').forEach(img => {
      img.addEventListener(
        'error',
        () => {
          if (img.dataset.fallbackApplied) return;
          img.dataset.fallbackApplied = '1';
          img.src = FALLBACK_CARD_IMAGE;
        },
        { once: true }
      );
    });

    if (refs.count) {
      refs.count.textContent = `${filtered.length} ${t('insightsWord')}`;
    }

    if (refs.loadMore) {
      const hasMore = visible.length < filtered.length;
      refs.loadMore.hidden = !hasMore;
      refs.loadMore.disabled = !hasMore;
    }

    updateJsonLd(visible);
  }

  function render() {
    renderHubPages();
    renderHubChips();
    renderCards();
  }

  function bindEvents() {
    if (refs.search) {
      refs.search.addEventListener('input', event => {
        state.query = event.target.value || '';
        state.page = 1;
        render();
      });
    }

    if (refs.sort) {
      refs.sort.addEventListener('change', event => {
        state.sort = event.target.value || 'newest';
        state.page = 1;
        render();
      });
    }

    if (refs.loadMore) {
      refs.loadMore.addEventListener('click', () => {
        state.page += 1;
        renderCards();
      });
    }
  }

  function initializeInfiniteScroll() {
    if (!refs.loadMore) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (refs.loadMore.hidden || refs.loadMore.disabled) return;
          if (state.autoLoadLocked) return;

          state.autoLoadLocked = true;
          state.page += 1;
          renderCards();
          window.setTimeout(() => {
            state.autoLoadLocked = false;
          }, 220);
        });
      },
      {
        root: null,
        rootMargin: '260px 0px',
        threshold: 0.01
      }
    );

    observer.observe(refs.loadMore);
  }

  async function loadFeed() {
    let response = await fetch(PRIMARY_FEED_URL, { cache: 'no-cache' });
    if (!response.ok && PRIMARY_FEED_URL !== FALLBACK_FEED_URL) {
      response = await fetch(FALLBACK_FEED_URL, { cache: 'no-cache' });
    }
    if (!response.ok) throw new Error(`Failed to load feed: ${response.status}`);

    const payload = await response.json();
    state.items = Array.isArray(payload.items) ? payload.items : [];
    state.hubs = Array.isArray(payload.hubs) ? payload.hubs : [];
  }

  function initializeFiltersFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const hubParam = (params.get('hub') || '').trim();
    const collectionParam = (params.get('collection') || '').trim();

    if (collectionParam && Object.prototype.hasOwnProperty.call(COLLECTION_HUBS, collectionParam)) {
      state.activeCollection = collectionParam;
    }

    if (!hubParam) return;
    const knownHub = state.hubs.find(item => item.key === hubParam);
    if (knownHub) {
      state.activeHub = hubParam;
      state.activeCollection = '';
    }
  }

  function renderError() {
    if (!refs.grid) return;

    refs.grid.innerHTML = `
      <div class="col-12">
        <div class="insight-feed-empty">
          <h3 class="h5 mb-2">${escapeHtml(t('errorTitle'))}</h3>
          <p class="mb-0">${escapeHtml(t('errorBody'))}</p>
        </div>
      </div>
    `;
  }

  async function init() {
    refreshRefs();
    if (!refs.grid) {
      initAttempts += 1;
      if (initAttempts <= 60) window.setTimeout(init, 150);
      return;
    }

    bindEvents();
    initializeInfiniteScroll();

    try {
      await loadFeed();
      initializeFiltersFromQuery();
      render();
    } catch (error) {
      renderError();
      console.error(error);
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
