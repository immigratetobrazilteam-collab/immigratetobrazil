const SCHEMA_CONTEXT = "https://schema.org";
const SITE_DOMAIN = "https://immigratetobrazil.com";
const AVAILABLE_LANGUAGES = ["en", "pt-BR"];

const ORGANIZATION_ID = rootId("organization");
const WEBSITE_ID = rootId("website");
const CONTACT_POINT_ID = rootId("contact-primary");
const LEGAL_PRACTICE_ID = rootId("legal-practice");
const PERSON_MONIQUE_ID = rootId("person-monique-fernandes");
const BRAZIL_ID = rootId("place-brazil");
const SERVICE_FAMILY_CATALOG_ID = rootId("catalog-service-families");

const SERVICE_FAMILY_ORDER = ["visas", "residencies", "naturalisation", "defense", "advisory", "other"];

const SERVICE_FAMILY_DEFINITIONS = {
  visas: {
    name: "Brazil Visa Services",
    alternateName: "Visas",
    type: "Service",
    childType: "LegalService",
    serviceType: "Brazil visa legal services",
    route: "/services/visas/"
  },
  residencies: {
    name: "Brazil Residency Services",
    alternateName: "Residencies",
    type: "Service",
    childType: "LegalService",
    serviceType: "Brazil residency legal services",
    route: "/services/residencies/"
  },
  naturalisation: {
    name: "Brazil Citizenship And Naturalisation Services",
    alternateName: "Naturalisation",
    type: "Service",
    childType: "LegalService",
    serviceType: "Brazil citizenship and naturalisation legal services",
    route: "/services/naturalisation/"
  },
  defense: {
    name: "Brazil Immigration Defense Services",
    alternateName: "Defense",
    type: "Service",
    childType: "LegalService",
    serviceType: "Brazil immigration defense and enforcement services",
    route: "/services/defense/"
  },
  advisory: {
    name: "Brazil Immigration Advisory Services",
    alternateName: "Advisory",
    type: "Service",
    childType: "Service",
    serviceType: "Brazil immigration advisory services",
    route: "/services/advisory/"
  },
  other: {
    name: "Brazil Immigration Support Services",
    alternateName: "Support Services",
    type: "Service",
    childType: "Service",
    serviceType: "Brazil immigration support services",
    route: "/services/other/"
  }
};

const REGION_DEFINITIONS = {
  "north": {
    name: "Northern Brazil",
    route: "/brazil/north/"
  },
  "northeast": {
    name: "Northeastern Brazil",
    route: "/brazil/northeast/"
  },
  "central-west": {
    name: "Central-West Brazil",
    route: "/brazil/central-west/"
  },
  "southeast": {
    name: "Southeastern Brazil",
    route: "/brazil/southeast/"
  },
  "south": {
    name: "Southern Brazil",
    route: "/brazil/south/"
  }
};

export function buildSiteCatalog(contentPages) {
  const byRoute = new Map();
  const serviceChildrenByFamily = {};
  const orderedRoutes = [];

  for (const familySlug of SERVICE_FAMILY_ORDER) {
    serviceChildrenByFamily[familySlug] = [];
  }

  for (const entry of contentPages) {
    const routeEntry = {
      route: entry.route,
      title: entry.page?.runtime?.pageTitle || cleanMetaTitle(entry.page?.meta?.title) || "",
      description: entry.page?.meta?.description || "",
      noindex: /\bnoindex\b/i.test(entry.page?.meta?.robots || "")
    };

    byRoute.set(entry.route, routeEntry);
    orderedRoutes.push(routeEntry);

    const segments = routeSegments(entry.route);
    if (segments[0] === "services" && segments.length === 3 && serviceChildrenByFamily[segments[1]]) {
      serviceChildrenByFamily[segments[1]].push(routeEntry);
    }
  }

  return {
    byRoute,
    orderedRoutes,
    serviceChildrenByFamily
  };
}

export function buildStructuredData({ about, page, route, bodyHtml, siteCatalog }) {
  const pageName = extractPageName(page, bodyHtml);
  const pageId = routeObjectId(route, "webpage");
  const heroImage = buildHeroImageSchema(route, page, pageName, bodyHtml);
  const breadcrumb = buildBreadcrumbSchema(route, page, pageName);
  const faqEntries = extractVisibleFaqEntries(bodyHtml);
  const faqPage = buildFaqSchema(route, faqEntries);
  const classification = classifyRoute(route);
  const includeMonique = shouldIncludeMonique(route, bodyHtml);

  const schemas = [
    buildOrganizationSchema(about),
    buildWebsiteSchema(about),
    buildContactPointSchema(about),
    buildBrazilSchema(),
    buildLegalPracticeSchema(route, classification),
    buildServiceFamilyCatalog(siteCatalog),
    ...buildServiceFamilySchemas(route, classification),
    heroImage
  ];

  if (includeMonique) {
    schemas.push(buildMoniqueSchema(route, page));
  }

  const pageSpecific = buildPageSpecificSchemas({
    about,
    page,
    route,
    bodyHtml,
    pageName,
    pageId,
    heroImageId: heroImage["@id"],
    breadcrumbId: breadcrumb?.["@id"],
    classification,
    siteCatalog
  });

  schemas.push(...pageSpecific);

  if (breadcrumb) {
    schemas.push(breadcrumb);
  }

  if (faqPage) {
    schemas.push(faqPage);
  }

  return dedupeSchemas(schemas.filter(Boolean)).map(withContext);
}

function buildPageSpecificSchemas({
  page,
  route,
  pageName,
  pageId,
  heroImageId,
  breadcrumbId,
  classification,
  siteCatalog
}) {
  const schemas = [];
  const aboutIds = [];
  let mainEntityId = null;
  let supplementalList = null;

  switch (classification.mainEntityKind) {
    case "practice":
      mainEntityId = LEGAL_PRACTICE_ID;
      break;
    case "organization":
      mainEntityId = ORGANIZATION_ID;
      break;
    case "person":
      mainEntityId = PERSON_MONIQUE_ID;
      break;
    case "service-family": {
      const familyEntity = buildServiceFamilySchema(classification.familySlug, {
        includeMainEntityOfPage: true,
        pageId,
        includeOfferCatalog: true
      });
      schemas.push(familyEntity);
      schemas.push(buildFamilyOfferCatalog(route, classification.familySlug, siteCatalog));
      schemas.push(
        ...(siteCatalog.serviceChildrenByFamily[classification.familySlug] || []).map((entry) =>
          buildServiceChildSchema(classification.familySlug, entry)
        )
      );
      mainEntityId = familyEntity["@id"];
      supplementalList = buildServiceRouteItemList(route, classification.familySlug, siteCatalog);
      aboutIds.push(BRAZIL_ID, LEGAL_PRACTICE_ID);
      break;
    }
    case "service-child": {
      const childEntity = buildServiceChildSchema(
        classification.familySlug,
        getRouteEntry(siteCatalog, route, page),
        { includeMainEntityOfPage: true, pageId }
      );
      schemas.push(childEntity);
      mainEntityId = childEntity["@id"];
      aboutIds.push(familyId(classification.familySlug), BRAZIL_ID, LEGAL_PRACTICE_ID);
      break;
    }
    case "consultation-service": {
      const consultationEntity = buildServiceChildSchema(
        "advisory",
        getRouteEntry(siteCatalog, "/services/advisory/consultation/"),
        {}
      );
      schemas.push(consultationEntity);
      mainEntityId = consultationEntity["@id"];
      aboutIds.push(CONTACT_POINT_ID, LEGAL_PRACTICE_ID, BRAZIL_ID);
      break;
    }
    case "country":
      mainEntityId = BRAZIL_ID;
      break;
    case "region": {
      const region = buildRegionSchema(classification.regionSlug);
      schemas.push(region);
      mainEntityId = region["@id"];
      aboutIds.push(BRAZIL_ID);
      break;
    }
    case "topic":
    default: {
      const topic = buildTopicSchema(route, pageName, page.meta?.description || "", pageId);
      schemas.push(topic);
      mainEntityId = topic["@id"];
      if (route.startsWith("/legal/")) aboutIds.push(ORGANIZATION_ID);
      if (route.startsWith("/process/") || route.startsWith("/insights/")) aboutIds.push(LEGAL_PRACTICE_ID);
      if (route.startsWith("/brazil/")) aboutIds.push(BRAZIL_ID);
      break;
    }
  }

  if (classification.pageKind === "services-home") {
    supplementalList = buildServiceRouteItemList(route, null, siteCatalog);
    aboutIds.push(BRAZIL_ID, LEGAL_PRACTICE_ID);
  } else if (classification.collectionSource === "direct-children") {
    supplementalList = buildDirectChildItemList(route, siteCatalog);
  } else if (classification.collectionSource === "shell-related") {
    supplementalList = buildShellRelatedItemList(route, page);
  }

  const pageSchema = buildPageSchema({
    classification,
    pageId,
    route,
    pageName,
    description: page.meta?.description || "",
    heroImageId,
    breadcrumbId,
    mainEntityId,
    aboutIds,
    supplementalListId: supplementalList?.["@id"],
    lang: page.lang || "en"
  });

  schemas.push(pageSchema);

  if (supplementalList) {
    schemas.push(supplementalList);
  }

  return schemas;
}

function classifyRoute(route) {
  const segments = routeSegments(route);

  if (route === "/") {
    return { pageType: "WebPage", pageKind: "home", mainEntityKind: "practice" };
  }

  if (route === "/start-consultation/") {
    return { pageType: "ContactPage", pageKind: "contact", mainEntityKind: "consultation-service" };
  }

  if (segments[0] === "services") {
    if (segments.length === 1) {
      return {
        pageType: "CollectionPage",
        pageKind: "services-home",
        mainEntityKind: "practice",
        collectionSource: "service-families"
      };
    }

    if (segments.length === 2) {
      return {
        pageType: "CollectionPage",
        pageKind: "service-hub",
        mainEntityKind: "service-family",
        familySlug: segments[1]
      };
    }

    if (segments.length === 3) {
      return {
        pageType: "WebPage",
        pageKind: "service-child",
        mainEntityKind: "service-child",
        familySlug: segments[1],
        childSlug: segments[2]
      };
    }
  }

  if (segments[0] === "about") {
    if (route === "/about/") {
      return {
        pageType: "AboutPage",
        pageKind: "about-hub",
        mainEntityKind: "organization",
        collectionSource: "direct-children"
      };
    }

    if (route === "/about/lawyer/") {
      return { pageType: "AboutPage", pageKind: "lawyer", mainEntityKind: "person" };
    }

    return { pageType: "AboutPage", pageKind: "about", mainEntityKind: "organization" };
  }

  if (segments[0] === "legal") {
    if (route === "/legal/") {
      return {
        pageType: "CollectionPage",
        pageKind: "legal-hub",
        mainEntityKind: "topic",
        collectionSource: "direct-children"
      };
    }

    if (segments[1] === "search") {
      return { pageType: "SearchResultsPage", pageKind: "search", mainEntityKind: "topic" };
    }

    return { pageType: "WebPage", pageKind: "legal", mainEntityKind: "topic" };
  }

  if (segments[0] === "process") {
    if (route === "/process/") {
      return {
        pageType: "CollectionPage",
        pageKind: "process-hub",
        mainEntityKind: "topic",
        collectionSource: "direct-children"
      };
    }

    return { pageType: "WebPage", pageKind: "process", mainEntityKind: "topic" };
  }

  if (segments[0] === "insights") {
    if (route === "/insights/") {
      return {
        pageType: "CollectionPage",
        pageKind: "insights-hub",
        mainEntityKind: "topic",
        collectionSource: "direct-children"
      };
    }

    return { pageType: "WebPage", pageKind: "insights", mainEntityKind: "topic" };
  }

  if (segments[0] === "brazil") {
    if (segments[1] === "search") {
      return { pageType: "SearchResultsPage", pageKind: "search", mainEntityKind: "topic" };
    }

    if (route === "/brazil/") {
      return {
        pageType: "CollectionPage",
        pageKind: "brazil-hub",
        mainEntityKind: "country",
        collectionSource: "shell-related"
      };
    }

    if (route === "/brazil/places/" || route === "/brazil/states/" || route === "/brazil/cities/") {
      return {
        pageType: "CollectionPage",
        pageKind: "brazil-hub",
        mainEntityKind: "topic",
        collectionSource: "shell-related"
      };
    }

    if (route === "/brazil/brazil/") {
      return { pageType: "WebPage", pageKind: "country-guide", mainEntityKind: "country" };
    }

    if (REGION_DEFINITIONS[segments[1]]) {
      return {
        pageType: "WebPage",
        pageKind: "region",
        mainEntityKind: "region",
        regionSlug: segments[1]
      };
    }

    return { pageType: "WebPage", pageKind: "brazil", mainEntityKind: "topic" };
  }

  return { pageType: "WebPage", pageKind: "generic", mainEntityKind: "topic" };
}

function buildOrganizationSchema(about) {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: about.site?.name || "Immigrate to Brazil",
    url: SITE_DOMAIN,
    email: about.runtime?.contact?.email || "immigratetobrazilteam@gmail.com",
    telephone: about.runtime?.contact?.phone || "+55 43 99132-4028",
    logo: `${SITE_DOMAIN}/assets/logo/immigrate-to-brazil-logo.png`,
    sameAs: [about.runtime?.contact?.whatsappUrl].filter(Boolean),
    contactPoint: ref(CONTACT_POINT_ID)
  };
}

function buildWebsiteSchema(about) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: about.site?.name || "Immigrate to Brazil",
    url: SITE_DOMAIN,
    publisher: ref(ORGANIZATION_ID)
  };
}

function buildContactPointSchema(about) {
  return {
    "@type": "ContactPoint",
    "@id": CONTACT_POINT_ID,
    contactType: "customer support",
    email: about.runtime?.contact?.email || "immigratetobrazilteam@gmail.com",
    telephone: about.runtime?.contact?.phone || "+55 43 99132-4028",
    availableLanguage: AVAILABLE_LANGUAGES
  };
}

function buildBrazilSchema() {
  return {
    "@type": "Country",
    "@id": BRAZIL_ID,
    name: "Brazil"
  };
}

function buildLegalPracticeSchema(route, classification) {
  const practice = {
    "@type": "LegalService",
    "@id": LEGAL_PRACTICE_ID,
    name: "Brazil Immigration Legal And Advisory Services",
    description: "Attorney-led Brazil immigration legal, advisory, consultation, compliance, and relocation support.",
    provider: ref(ORGANIZATION_ID),
    areaServed: ref(BRAZIL_ID),
    availableLanguage: AVAILABLE_LANGUAGES,
    serviceType: "Brazil immigration legal and advisory services",
    hasOfferCatalog: ref(SERVICE_FAMILY_CATALOG_ID)
  };

  if (classification.pageKind === "services-home") {
    practice.mainEntityOfPage = ref(routeObjectId(route, "webpage"));
  }

  return practice;
}

function buildServiceFamilyCatalog(siteCatalog) {
  return {
    "@type": "OfferCatalog",
    "@id": SERVICE_FAMILY_CATALOG_ID,
    name: "Brazil Immigration Service Families",
    itemListElement: SERVICE_FAMILY_ORDER.map((familySlug, index) => {
      const route = SERVICE_FAMILY_DEFINITIONS[familySlug].route;
      const routeEntry = getRouteEntry(siteCatalog, route);

      return {
        "@type": "ListItem",
        position: index + 1,
        url: routeToUrl(route),
        item: ref(familyId(familySlug)),
        name: routeEntry?.title || SERVICE_FAMILY_DEFINITIONS[familySlug].alternateName
      };
    })
  };
}

function buildFamilyOfferCatalog(route, familySlug, siteCatalog) {
  const entries = siteCatalog.serviceChildrenByFamily[familySlug] || [];
  if (!entries.length) return null;

  return {
    "@type": "OfferCatalog",
    "@id": familyCatalogId(familySlug),
    name: `${SERVICE_FAMILY_DEFINITIONS[familySlug].alternateName} Service Catalog`,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: routeToUrl(entry.route),
      item: ref(childServiceId(familySlug, routeSegments(entry.route)[2])),
      name: entry.title
    })),
    mainEntityOfPage: ref(routeObjectId(route, "webpage"))
  };
}

function buildServiceFamilySchemas(route, classification) {
  return SERVICE_FAMILY_ORDER.map((familySlug) =>
    buildServiceFamilySchema(familySlug, {
      includeMainEntityOfPage: classification.pageKind === "service-hub" && classification.familySlug === familySlug,
      pageId: routeObjectId(route, "webpage"),
      includeOfferCatalog: classification.pageKind === "service-hub" && classification.familySlug === familySlug
    })
  );
}

function buildServiceFamilySchema(familySlug, { includeMainEntityOfPage = false, pageId = "", includeOfferCatalog = false } = {}) {
  const config = SERVICE_FAMILY_DEFINITIONS[familySlug];
  const schema = {
    "@type": config.type,
    "@id": familyId(familySlug),
    name: config.name,
    alternateName: config.alternateName,
    provider: ref(ORGANIZATION_ID),
    areaServed: ref(BRAZIL_ID),
    availableLanguage: AVAILABLE_LANGUAGES,
    serviceType: config.serviceType,
    isRelatedTo: ref(LEGAL_PRACTICE_ID)
  };

  if (includeOfferCatalog) {
    schema.hasOfferCatalog = ref(familyCatalogId(familySlug));
  }

  if (includeMainEntityOfPage && pageId) {
    schema.mainEntityOfPage = ref(pageId);
  }

  return schema;
}

function buildServiceChildSchema(familySlug, routeEntry, { includeMainEntityOfPage = false, pageId = "" } = {}) {
  if (!routeEntry) return null;

  const childSlug = routeSegments(routeEntry.route)[2];
  const schema = {
    "@type": SERVICE_FAMILY_DEFINITIONS[familySlug].childType,
    "@id": childServiceId(familySlug, childSlug),
    name: routeEntry.title,
    description: routeEntry.description,
    provider: ref(ORGANIZATION_ID),
    areaServed: ref(BRAZIL_ID),
    availableLanguage: AVAILABLE_LANGUAGES,
    serviceType: `${routeEntry.title} for Brazil immigration support`,
    isRelatedTo: ref(familyId(familySlug))
  };

  if (includeMainEntityOfPage && pageId) {
    schema.mainEntityOfPage = ref(pageId);
  }

  return schema;
}

function buildMoniqueSchema(route, page) {
  const person = {
    "@type": "Person",
    "@id": PERSON_MONIQUE_ID,
    name: "Monique Fernandes",
    jobTitle: "Brazilian immigration lawyer",
    description:
      route === "/about/lawyer/"
        ? page.meta?.description || "Brazilian immigration lawyer supporting cross-border immigration and residency matters."
        : "Brazilian immigration lawyer supporting cross-border immigration and residency matters.",
    worksFor: ref(ORGANIZATION_ID),
    knowsLanguage: AVAILABLE_LANGUAGES
  };

  if (route === "/about/lawyer/") {
    person.mainEntityOfPage = ref(routeObjectId(route, "webpage"));
  }

  return person;
}

function buildRegionSchema(regionSlug) {
  const region = REGION_DEFINITIONS[regionSlug];
  return {
    "@type": "AdministrativeArea",
    "@id": rootId(`place-brazil-${regionSlug}`),
    name: region.name,
    containedInPlace: ref(BRAZIL_ID)
  };
}

function buildTopicSchema(route, pageName, description, pageId) {
  return {
    "@type": "Thing",
    "@id": routeObjectId(route, "topic"),
    name: pageName,
    description,
    mainEntityOfPage: ref(pageId)
  };
}

function buildPageSchema({
  classification,
  pageId,
  route,
  pageName,
  description,
  heroImageId,
  breadcrumbId,
  mainEntityId,
  aboutIds,
  supplementalListId,
  lang
}) {
  const schema = {
    "@type": classification.pageType,
    "@id": pageId,
    url: routeToUrl(route),
    name: pageName,
    description,
    isPartOf: ref(WEBSITE_ID),
    primaryImageOfPage: ref(heroImageId),
    inLanguage: lang
  };

  if (breadcrumbId) {
    schema.breadcrumb = ref(breadcrumbId);
  }

  if (mainEntityId) {
    schema.mainEntity = ref(mainEntityId);
  }

  if (aboutIds.length) {
    schema.about = buildRefValue(aboutIds);
  }

  if (supplementalListId) {
    schema.hasPart = ref(supplementalListId);
  }

  return schema;
}

function buildHeroImageSchema(route, page, pageName, bodyHtml) {
  const caption = extractHeroAlt(bodyHtml) || page.social?.ogImageAlt || `${pageName} hero image`;
  const contentUrl = toAbsoluteUrl(page.social?.ogImage || page.meta?.preloadImage || "");

  return {
    "@type": "ImageObject",
    "@id": routeObjectId(route, "hero-image"),
    name: `${pageName} hero image`,
    description: page.meta?.description || caption,
    caption,
    contentUrl,
    url: contentUrl,
    thumbnailUrl: contentUrl,
    representativeOfPage: true,
    inLanguage: page.lang || "en"
  };
}

function buildBreadcrumbSchema(route, page, pageName) {
  const breadcrumbs = page.shell?.breadcrumbs || [];
  if (!breadcrumbs.length) return null;

  return {
    "@type": "BreadcrumbList",
    "@id": routeObjectId(route, "breadcrumb"),
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label || pageName,
      item: routeToUrl(crumb.href || route)
    }))
  };
}

function buildFaqSchema(route, faqEntries) {
  if (!faqEntries.length) return null;

  return {
    "@type": "FAQPage",
    "@id": routeObjectId(route, "faq"),
    mainEntity: faqEntries.map((item, index) => ({
      "@type": "Question",
      "@id": routeObjectId(route, `faq-question-${index + 1}`),
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function buildServiceRouteItemList(route, familySlug, siteCatalog) {
  const entries = familySlug
    ? siteCatalog.serviceChildrenByFamily[familySlug] || []
    : SERVICE_FAMILY_ORDER.map((slug) => getRouteEntry(siteCatalog, SERVICE_FAMILY_DEFINITIONS[slug].route)).filter(Boolean);

  if (!entries.length) return null;

  return {
    "@type": "ItemList",
    "@id": routeObjectId(route, "page-list"),
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: routeToUrl(entry.route),
      name: entry.title
    }))
  };
}

function buildDirectChildItemList(route, siteCatalog) {
  const entries = siteCatalog.orderedRoutes.filter(
    (entry) => isDirectChildRoute(entry.route, route) && !entry.noindex
  );

  if (!entries.length) return null;

  return {
    "@type": "ItemList",
    "@id": routeObjectId(route, "page-list"),
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: routeToUrl(entry.route),
      name: entry.title
    }))
  };
}

function buildShellRelatedItemList(route, page) {
  const links = (page.shell?.relatedLinks || []).filter((item) => item?.href?.startsWith("/"));
  if (!links.length) return null;

  return {
    "@type": "ItemList",
    "@id": routeObjectId(route, "page-list"),
    itemListElement: links.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: routeToUrl(item.href),
      name: normalizeSpace(item.title || item.href)
    }))
  };
}

function extractVisibleFaqEntries(bodyHtml) {
  if (!bodyHtml || !bodyHtml.includes('class="faq-block"')) return [];

  const section = bodyHtml.match(/<section class="faq-block"[\s\S]*?<\/section>/i)?.[0] || bodyHtml;
  const entries = [];

  for (const match of section.matchAll(
    /<div class="accordion-item">[\s\S]*?<button[^>]*>([\s\S]*?)<\/button>[\s\S]*?<div class="accordion-body">([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi
  )) {
    const question = stripTags(match[1]);
    const answer = stripTags(match[2]);

    if (!question || !answer) continue;
    entries.push({ question, answer });
  }

  return entries;
}

function shouldIncludeMonique(route, bodyHtml) {
  return (
    route === "/about/lawyer/" ||
    /Monique Fernandes|Licensed Brazilian attorney|OAB\/PR|OAB-registered|OAB registered/i.test(bodyHtml || "")
  );
}

function extractPageName(page, bodyHtml) {
  return (
    extractFirstText(bodyHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    page.runtime?.pageTitle ||
    cleanMetaTitle(page.meta?.title) ||
    "Immigrate to Brazil"
  );
}

function extractHeroAlt(bodyHtml) {
  return extractAttribute(bodyHtml, /<img class="hero-media"[^>]*alt="([^"]*)"/i);
}

function extractFirstText(source, pattern) {
  const value = source.match(pattern)?.[1] || "";
  return stripTags(value);
}

function extractAttribute(source, pattern) {
  const value = source.match(pattern)?.[1] || "";
  return decodeHtmlEntities(value).trim();
}

function cleanMetaTitle(title = "") {
  return normalizeSpace(String(title).replace(/\s+\|\s+Immigrate to Brazil(?:\s+\|\s+Immigrate to Brazil)?$/i, ""));
}

function stripTags(value = "") {
  return normalizeSpace(decodeHtmlEntities(String(value).replace(/<[^>]*>/g, " ")));
}

function normalizeSpace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function getRouteEntry(siteCatalog, route, fallbackPage = null) {
  const entry = siteCatalog?.byRoute?.get(route);
  if (entry) return entry;
  if (!fallbackPage) return null;

  return {
    route,
    title: fallbackPage.runtime?.pageTitle || cleanMetaTitle(fallbackPage.meta?.title) || "",
    description: fallbackPage.meta?.description || "",
    noindex: /\bnoindex\b/i.test(fallbackPage.meta?.robots || "")
  };
}

function isDirectChildRoute(route, prefix) {
  if (!route.startsWith(prefix) || route === prefix) return false;
  return routeSegments(route).length === routeSegments(prefix).length + 1;
}

function buildRefValue(ids) {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (!filtered.length) return undefined;
  if (filtered.length === 1) return ref(filtered[0]);
  return filtered.map((id) => ref(id));
}

function ref(id) {
  return { "@id": id };
}

function withContext(schema) {
  return {
    "@context": SCHEMA_CONTEXT,
    ...schema
  };
}

function dedupeSchemas(schemas) {
  const seen = new Set();
  const deduped = [];

  for (let index = schemas.length - 1; index >= 0; index -= 1) {
    const schema = schemas[index];
    const key = schema["@id"] ? `${schema["@type"]}:${schema["@id"]}` : JSON.stringify(schema);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(schema);
  }

  return deduped.reverse();
}

function routeSegments(route) {
  return route.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
}

function routeToUrl(route) {
  return route === "/" ? SITE_DOMAIN : `${SITE_DOMAIN}${route}`;
}

function routeObjectId(route, fragment) {
  return `${routeToUrl(route)}#${fragment}`;
}

function rootId(fragment) {
  return `${SITE_DOMAIN}#${fragment}`;
}

function familyId(familySlug) {
  return rootId(`service-family-${familySlug}`);
}

function familyCatalogId(familySlug) {
  return rootId(`catalog-service-family-${familySlug}`);
}

function childServiceId(familySlug, childSlug) {
  return rootId(`service-${familySlug}-${childSlug}`);
}

function toAbsoluteUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SITE_DOMAIN}${value}`;
  return `${SITE_DOMAIN}/${value.replace(/^\.?\//, "")}`;
}
