(() => {
  'use strict';

  const LOCALE_PREFIX_RE = /^\/(pt|es|fr)(?=\/|$)/i;
  const SEARCH_PARAM_KEYS = ['q', 'query', 's', 'search'];
  const DOWNLOAD_PATH_RE = /\/assets\/downloads\//i;
  const DOWNLOAD_EXTENSION_RE = /\.(pdf|doc|docx|xls|xlsx|csv|zip|txt|ics|json)$/i;
  const CONSULTATION_PATH_RE = /\/book-consultation(?:$|\/)/i;
  const WHATSAPP_RE = /(?:wa\.me|whatsapp\.com)/i;
  const EMAIL_RE = /^mailto:/i;
  const PHONE_RE = /^tel:/i;
  const FORM_ACTION_LEAD_RE = /formspree\.io\/f\/mjkzwzkz/i;
  const FORM_ACTION_SERVICE_HUB_RE = /formspree\.io\/f\/maqpbgqe/i;
  const FORM_ACTION_EBOOK_RE = /formspree\.io\/f\/myzlnerw/i;
  const FORM_ACTION_NEWSLETTER_RE = /formspree\.io\/f\/myknwjlq/i;
  const SCROLL_THRESHOLDS = [25, 50, 75, 90];

  const state = {
    pageContext: null,
    startedForms: new WeakSet(),
    scrollThresholds: new Set()
  };

  function compactObject(value) {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== '' && entry !== null && entry !== undefined)
    );
  }

  function normalizePath(pathname) {
    if (!pathname) return '/';

    let path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    path = path.replace(/\/index\.html$/i, '/');
    path = path.replace(/\.html$/i, '');
    path = path.replace(/\/{2,}/g, '/');

    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    return path || '/';
  }

  function detectLocale(pathname) {
    const clean = normalizePath(pathname);
    const match = clean.match(LOCALE_PREFIX_RE);
    if (!match) {
      return {
        locale: 'en',
        localizedPath: clean,
        normalizedPath: clean
      };
    }

    const locale = match[1].toLowerCase();
    const normalizedPath = clean.replace(LOCALE_PREFIX_RE, '') || '/';

    return {
      locale,
      localizedPath: clean,
      normalizedPath: normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
    };
  }

  function getHeadingText() {
    const heading = document.querySelector('main h1, h1');
    return sanitizeText(heading?.textContent || '', 120);
  }

  function sanitizeText(value, maxLength = 120) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function humanizeSlug(value) {
    return sanitizeText(
      String(value || '')
        .replace(/[-_]+/g, ' ')
        .replace(/\blgbtq\b/gi, 'LGBTQ')
        .replace(/\bcplp\b/gi, 'CPLP')
        .replace(/\bcpf\b/gi, 'CPF')
        .replace(/\bcnpj\b/gi, 'CNPJ')
        .replace(/\boab\b/gi, 'OAB'),
      120
    );
  }

  function inferHubTaxonomy(normalizedPath) {
    const path = normalizedPath || '/';
    const segments = path.split('/').filter(Boolean);
    const leaf = segments[segments.length - 1] || '';

    if (path.startsWith('/services/immigration-to-brazil/by-country/')) {
      return compactObject({
        hub: 'immigrate-to-brazil',
        sub_hub: 'country-landing',
        country_audience: humanizeSlug(leaf),
        page_group: 'country_landing'
      });
    }

    if (path === '/services/immigration-to-brazil/all-immigration-to-brazil-services') {
      return {
        hub: 'immigrate-to-brazil',
        sub_hub: '',
        country_audience: '',
        page_group: 'service_hub'
      };
    }

    if (
      path === '/services/civil/all-civil-law-services' ||
      path.startsWith('/services/civil/')
    ) {
      return {
        hub: 'civil',
        sub_hub: '',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/family/all-family-law-services' ||
      path.startsWith('/services/family/')
    ) {
      return {
        hub: 'family',
        sub_hub: '',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/human-rights/all-human-rights-services' ||
      path.startsWith('/services/human-rights/')
    ) {
      return {
        hub: 'human-rights',
        sub_hub: '',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/immigration-abroad-services/all-immigration-abroad-services' ||
      path.startsWith('/services/immigration-abroad-services/')
    ) {
      return {
        hub: 'immigration-abroad',
        sub_hub: '',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/immigration-to-brazil/all-brazilian-visa-services' ||
      path.startsWith('/services/immigration-to-brazil/visas/')
    ) {
      return {
        hub: 'immigrate-to-brazil',
        sub_hub: 'visas',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/immigration-to-brazil/all-brazilian-residencies-services' ||
      path.startsWith('/services/immigration-to-brazil/residencies/')
    ) {
      return {
        hub: 'immigrate-to-brazil',
        sub_hub: 'residencies',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/immigration-to-brazil/all-brazilian-naturalisation-services' ||
      path.startsWith('/services/immigration-to-brazil/citizenship/')
    ) {
      return {
        hub: 'immigrate-to-brazil',
        sub_hub: 'naturalisation',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (
      path === '/services/immigration-to-brazil/all-brazilian-other-services' ||
      path.startsWith('/services/immigration-to-brazil/other/')
    ) {
      return {
        hub: 'immigrate-to-brazil',
        sub_hub: 'other-immigration',
        country_audience: '',
        page_group: 'service'
      };
    }

    if (path === '/services' || path === '/practice-areas') {
      return {
        hub: '',
        sub_hub: '',
        country_audience: '',
        page_group: 'service_directory'
      };
    }

    if (path === '/book-consultation' || path === '/contact') {
      return {
        hub: '',
        sub_hub: '',
        country_audience: '',
        page_group: 'conversion'
      };
    }

    return {
      hub: '',
      sub_hub: '',
      country_audience: '',
      page_group: ''
    };
  }

  function inferPracticeArea(normalizedPath) {
    const patterns = [
      {
        value: 'civil-law',
        matches: [
          '/services/civil/',
          '/services/funnels/civil-law/',
          '/legal-knowledge-center/civil-law',
          '/blog/civil-law',
          '/insights/civil-law/'
        ]
      },
      {
        value: 'family-law',
        matches: [
          '/services/family/',
          '/services/funnels/family-law/',
          '/legal-knowledge-center/family-law',
          '/blog/family-law',
          '/insights/family-law/'
        ]
      },
      {
        value: 'human-rights',
        matches: [
          '/services/human-rights/',
          '/services/funnels/human-rights/',
          '/legal-knowledge-center/human-rights',
          '/blog/human-rights',
          '/insights/human-rights/'
        ]
      },
      {
        value: 'brazilian-visas',
        matches: [
          '/services/immigration-to-brazil/all-brazilian-visa-services',
          '/services/immigration-to-brazil/visas/',
          '/services/funnels/brazilian-visas/',
          '/legal-knowledge-center/brazilian-visas',
          '/blog/brazilian-visas',
          '/insights/brazilian-visas/'
        ]
      },
      {
        value: 'brazilian-residencies',
        matches: [
          '/services/immigration-to-brazil/all-brazilian-residencies-services',
          '/services/immigration-to-brazil/residencies/',
          '/services/funnels/brazilian-residencies/',
          '/legal-knowledge-center/brazilian-residencies',
          '/blog/brazilian-residencies',
          '/insights/brazilian-residencies/'
        ]
      },
      {
        value: 'naturalisation',
        matches: [
          '/services/immigration-to-brazil/all-brazilian-naturalisation-services',
          '/services/immigration-to-brazil/citizenship/',
          '/services/funnels/naturalisation/',
          '/legal-knowledge-center/brazilian-naturalisation',
          '/blog/brazilian-naturalisation',
          '/insights/brazilian-naturalisation/'
        ]
      },
      {
        value: 'other-services',
        matches: [
          '/services/immigration-to-brazil/all-brazilian-other-services',
          '/services/immigration-to-brazil/other/',
          '/services/funnels/other-services/',
          '/legal-knowledge-center/other-immigration-services',
          '/blog/other-immigration-services',
          '/insights/other-immigration-services/'
        ]
      },
      {
        value: 'immigration-abroad',
        matches: [
          '/services/immigration-abroad-services/',
          '/services/funnels/immigration-abroad/',
          '/legal-knowledge-center/immigration-abroad',
          '/blog/immigration-abroad',
          '/insights/immigration-abroad/'
        ]
      }
    ];

    for (const pattern of patterns) {
      if (pattern.matches.some(entry => normalizedPath.startsWith(entry) || normalizedPath === entry)) {
        return pattern.value;
      }
    }

    return '';
  }

  function inferPageType(normalizedPath) {
    if (normalizedPath === '/') return 'home';
    if (normalizedPath === '/contact') return 'contact_page';
    if (normalizedPath === '/book-consultation') return 'consultation_page';
    if (normalizedPath === '/services') return 'services_overview';
    if (normalizedPath === '/practice-areas') return 'practice_areas';
    if (normalizedPath === '/resources') return 'resources_page';
    if (normalizedPath === '/newsletter') return 'newsletter_page';
    if (normalizedPath === '/payment') return 'payment_page';
    if (normalizedPath === '/privacy') return 'privacy_page';
    if (normalizedPath === '/search') return 'search_page';
    if (normalizedPath === '/client-feedback') return 'client_feedback';
    if (normalizedPath === '/legal-glossary') return 'legal_glossary';
    if (normalizedPath === '/faq-hub') return 'faq_hub';
    if (normalizedPath === '/legal-knowledge-center') return 'knowledge_hub';
    if (normalizedPath.startsWith('/legal-knowledge-center/')) return 'knowledge_category';
    if (normalizedPath === '/fyi') return 'fyi_hub';
    if (normalizedPath.startsWith('/fyi/')) return 'fyi_article';
    if (normalizedPath === '/blog' || normalizedPath === '/insights') return 'blog_hub';
    if (normalizedPath.startsWith('/blog/')) return 'blog_category';
    if (normalizedPath === '/legal-insights' || normalizedPath === '/legal-news-updates') return 'legal_updates';
    if (normalizedPath.startsWith('/insights/')) return 'insight_article';
    if (normalizedPath.startsWith('/client-access/')) return 'client_access';
    if (normalizedPath === '/404') return 'error_page';
    if (normalizedPath.startsWith('/services/funnels/')) return 'service_funnel';
    if (normalizedPath.startsWith('/services/') && normalizedPath.endsWith('/book-consultation')) {
      return 'consultation_redirect';
    }
    if (normalizedPath.startsWith('/services/') && /\/all-[^/]+$/.test(normalizedPath)) {
      return 'service_hub';
    }
    if (normalizedPath.startsWith('/services/all-legal-services/')) return 'service_hub';
    if (normalizedPath.startsWith('/services/')) return 'service_page';
    return 'site_page';
  }

  function inferContentGroup(pageType) {
    if (pageType === 'home') return 'marketing';
    if (pageType === 'contact_page' || pageType === 'consultation_page' || pageType === 'consultation_redirect') {
      return 'conversion';
    }
    if (pageType.startsWith('service')) return 'service';
    if (pageType.startsWith('insight') || pageType.startsWith('blog')) return 'content';
    if (pageType.startsWith('knowledge')) return 'knowledge';
    if (pageType.endsWith('hub') || pageType === 'practice_areas' || pageType === 'services_overview') return 'hub';
    if (pageType === 'search_page') return 'search';
    if (pageType === 'newsletter_page' || pageType === 'resources_page') {
      return 'resource';
    }
    if (pageType === 'client_access') return 'client_access';
    if (pageType === 'client_feedback') return 'feedback';
    return 'utility';
  }

  function inferPageTemplate(pageType) {
    if (pageType === 'home') return 'home';
    if (pageType.startsWith('service_')) return 'service';
    if (pageType === 'consultation_page' || pageType === 'contact_page') return 'conversion';
    if (pageType.endsWith('_hub') || pageType === 'practice_areas' || pageType === 'services_overview') return 'hub';
    if (pageType.endsWith('_article') || pageType.endsWith('_category')) return 'content';
    if (pageType === 'search_page') return 'search';
    return 'core';
  }

  function inferContentName(pageType, normalizedPath) {
    const heading = getHeadingText();
    if (heading) return heading;

    if (pageType === 'home') return 'Home';

    const segments = normalizedPath.split('/').filter(Boolean);
    const leaf = segments[segments.length - 1] || '';
    return humanizeSlug(leaf);
  }

  function inferServiceName(pageType, normalizedPath) {
    if (!['service_page', 'service_hub', 'service_funnel', 'consultation_redirect'].includes(pageType)) {
      return '';
    }
    return inferContentName(pageType, normalizedPath);
  }

  function getQueryValue() {
    const params = new URLSearchParams(window.location.search);
    for (const key of SEARCH_PARAM_KEYS) {
      const value = sanitizeText(params.get(key), 100);
      if (value) return value;
    }
    return '';
  }

  function buildPageContext() {
    const localeInfo = detectLocale(window.location.pathname);
    const pageType = inferPageType(localeInfo.normalizedPath);
    const taxonomy = inferHubTaxonomy(localeInfo.normalizedPath);

    return compactObject({
      page_locale: localeInfo.locale,
      localized_path: localeInfo.localizedPath,
      normalized_path: localeInfo.normalizedPath,
      page_type: pageType,
      page_template: inferPageTemplate(pageType),
      content_group: inferContentGroup(pageType),
      practice_area: inferPracticeArea(localeInfo.normalizedPath),
      page_group: taxonomy.page_group,
      hub: taxonomy.hub,
      sub_hub: taxonomy.sub_hub,
      country_audience: taxonomy.country_audience,
      content_name: inferContentName(pageType, localeInfo.normalizedPath),
      service_name: inferServiceName(pageType, localeInfo.normalizedPath),
      search_term: pageType === 'search_page' ? getQueryValue() : ''
    });
  }

  function ensureContext() {
    if (!state.pageContext) {
      state.pageContext = buildPageContext();
    }
    return state.pageContext;
  }

  function pushEvent(eventName, payload = {}) {
    const context = ensureContext();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(
      compactObject({
        event: eventName,
        event_source: 'analytics_js',
        event_timestamp: String(Date.now()),
        ...context,
        ...payload
      })
    );
  }

  function inferPlacement(element) {
    if (!element) return 'body';
    if (element.closest('header, #header-container, .site-header')) return 'header';
    if (element.closest('footer, #footer-container, .site-footer')) return 'footer';
    if (element.closest('form')) return 'form';
    if (element.closest('[data-seo-core-nav], nav')) return 'navigation';
    if (element.closest('.hero-section, .home-hero, .service-hero, .contact-intro-section')) return 'hero';
    if (element.classList.contains('position-fixed') || window.getComputedStyle(element).position === 'fixed') {
      return 'sticky';
    }
    return 'body';
  }

  function getAnchorLabel(anchor) {
    return (
      sanitizeText(anchor.getAttribute('aria-label'), 120) ||
      sanitizeText(anchor.getAttribute('title'), 120) ||
      sanitizeText(anchor.textContent, 120)
    );
  }

  function isDownloadLink(anchor, url) {
    if (anchor.hasAttribute('download')) return true;
    return DOWNLOAD_PATH_RE.test(url.pathname) || DOWNLOAD_EXTENSION_RE.test(url.pathname);
  }

  function isConsultationLink(normalizedPath) {
    return CONSULTATION_PATH_RE.test(normalizedPath);
  }

  function getFileInfo(value, fallbackName = '') {
    const path = String(value || '');
    const filename = sanitizeText(fallbackName || path.split('/').pop() || '', 120);
    const extensionMatch = filename.match(/\.([a-z0-9]+)$/i) || path.match(DOWNLOAD_EXTENSION_RE);

    return compactObject({
      file_name: filename || '',
      file_extension: extensionMatch ? extensionMatch[1].toLowerCase() : '',
      file_url: path || ''
    });
  }

  function getFormIdentifier(form) {
    return sanitizeText(
      form.getAttribute('id') ||
        form.getAttribute('name') ||
        form.getAttribute('data-form-title') ||
        form.getAttribute('action') ||
        '',
      120
    );
  }

  function getFormType(form) {
    const context = ensureContext();
    const action = sanitizeText(form.getAttribute('action'), 200);

    if (form.id === 'feedback-form') return 'client_feedback';
    if (form.hasAttribute('data-lead-form')) {
      return sanitizeText(form.getAttribute('data-lead-form'), 60) || 'site_form';
    }
    if (form.hasAttribute('data-newsletter-download-form') || FORM_ACTION_NEWSLETTER_RE.test(action)) {
      return 'newsletter_download';
    }
    if (
      form.hasAttribute('data-ebook-download-form') ||
      form.id === 'ebookForm' ||
      form.id === 'ebookFormCTA' ||
      FORM_ACTION_EBOOK_RE.test(action)
    ) {
      return 'ebook_download';
    }
    if (FORM_ACTION_LEAD_RE.test(action) || FORM_ACTION_SERVICE_HUB_RE.test(action)) {
      if (context.page_type === 'contact_page') return 'contact_inquiry';
      if (context.page_type === 'consultation_page') return 'consultation_request';
      if (context.page_type === 'service_funnel') return 'service_funnel_inquiry';
      if (context.page_group === 'country_landing') return 'country_landing_inquiry';
      if (form.querySelector('input[name="phone"], select[name="area"]')) return 'consultation_request';
      return 'general_inquiry';
    }
    if (/formspree\.io/i.test(action)) return 'site_form';
    return 'site_form';
  }

  function isLeadFormType(formType) {
    return [
      'consultation_request',
      'contact_inquiry',
      'service_funnel_inquiry',
      'general_inquiry',
      'newsletter_download',
      'ebook_download'
    ].includes(formType);
  }

  function handleAnchorClick(event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const rawHref = sanitizeText(anchor.getAttribute('href'), 500);
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

    let destination;
    try {
      destination = new URL(rawHref, window.location.href);
    } catch {
      return;
    }

    const destinationInfo = detectLocale(destination.pathname);
    const basePayload = compactObject({
      interaction_location: inferPlacement(anchor),
      cta_text: getAnchorLabel(anchor),
      cta_destination: destination.pathname + destination.search + destination.hash,
      destination_locale: destinationInfo.locale,
      destination_path: destinationInfo.normalizedPath
    });

    if (WHATSAPP_RE.test(destination.href)) {
      pushEvent('contact', {
        contact_method: 'whatsapp',
        ...basePayload
      });
      return;
    }

    if (EMAIL_RE.test(rawHref)) {
      pushEvent('contact', {
        contact_method: 'email',
        ...basePayload
      });
      return;
    }

    if (PHONE_RE.test(rawHref)) {
      pushEvent('contact', {
        contact_method: 'phone',
        ...basePayload
      });
      return;
    }

    if (isConsultationLink(destinationInfo.normalizedPath)) {
      pushEvent('generate_lead', {
        lead_type: 'consultation_cta',
        lead_method: 'click',
        ...basePayload
      });
      return;
    }

    if (isDownloadLink(anchor, destination)) {
      pushEvent('file_download', {
        download_method: 'link_click',
        ...basePayload,
        ...getFileInfo(destination.pathname, getAnchorLabel(anchor))
      });
    }
  }

  function handleFormStart(event) {
    const field = event.target.closest('input, select, textarea');
    const form = field?.form;
    if (!form || state.startedForms.has(form)) return;

    state.startedForms.add(form);
    pushEvent('form_start', {
      form_type: getFormType(form),
      form_id: getFormIdentifier(form),
      interaction_location: inferPlacement(form)
    });
  }

  function handleFormSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const formType = getFormType(form);
    const payload = {
      form_type: formType,
      form_id: getFormIdentifier(form),
      interaction_location: inferPlacement(form),
      form_country_audience: sanitizeText(
        form.querySelector('[name="country_audience"]')?.value || form.getAttribute('data-country-audience') || '',
        120
      ),
      form_hub: sanitizeText(form.querySelector('[name="hub"]')?.value || form.getAttribute('data-hub') || '', 80),
      form_sub_hub: sanitizeText(
        form.querySelector('[name="sub_hub"]')?.value || form.getAttribute('data-sub-hub') || '',
        80
      ),
      form_source_type: sanitizeText(
        form.querySelector('[name="source_type"]')?.value || form.getAttribute('data-source-type') || '',
        80
      )
    };

    pushEvent('form_submit', payload);

    if (isLeadFormType(formType)) {
      pushEvent('generate_lead', {
        lead_type: formType,
        lead_method: 'form_submit',
        ...payload
      });
    }
  }

  function getScrollPercent() {
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 0);
    if (maxScroll <= 0) return 100;
    return Math.round((window.scrollY / maxScroll) * 100);
  }

  function handleScroll() {
    const percent = getScrollPercent();
    SCROLL_THRESHOLDS.forEach(threshold => {
      if (percent < threshold || state.scrollThresholds.has(threshold)) return;
      state.scrollThresholds.add(threshold);
      pushEvent('scroll_depth', {
        scroll_percent: String(threshold)
      });
    });
  }

  function initializeSearchTracking() {
    const context = ensureContext();
    if (context.page_type !== 'search_page' || !context.search_term) return;

    pushEvent('search', {
      search_term: context.search_term
    });
  }

  function initializePageContext() {
    pushEvent('page_context');
  }

  function trackFileDownload(payload = {}) {
    pushEvent(
      'file_download',
      compactObject({
        download_method: payload.download_method || 'scripted_download',
        interaction_location: payload.interaction_location || 'script',
        ...getFileInfo(payload.file_url || '', payload.file_name || '')
      })
    );
  }

  ensureContext();
  initializePageContext();
  initializeSearchTracking();
  handleScroll();

  document.addEventListener('click', handleAnchorClick, true);
  document.addEventListener('focusin', handleFormStart, true);
  document.addEventListener('submit', handleFormSubmit, true);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });

  window.moniqueAnalytics = {
    getContext: ensureContext,
    pushEvent,
    trackFileDownload
  };
})();
