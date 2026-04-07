import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
const ITB_SITE_RE = /window\.ITB_SITE\s*=\s*(\{[\s\S]*?\});/;
const TITLE_RE = /<title>([\s\S]*?)<\/title>/i;
const HERO_ALT_RE = /<img class="hero-media"[^>]*alt="([^"]*)"/i;
const OG_IMAGE_ALT_RE = /<meta\b[^>]*property=["']og:image:alt["'][^>]*content=["']([^"']*)["'][^>]*>/i;
const OG_IMAGE_ALT_RE_ALT = /<meta\b[^>]*content=["']([^"']*)["'][^>]*property=["']og:image:alt["'][^>]*>/i;
const HERO_SUMMARY_RE = /(<p class="hero-summary">)([\s\S]*?)(<\/p>)/i;
const H1_RE = /(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i;
const BRAND_NOTE_RE = /(<p class="hero-brand-note">)([\s\S]*?)(<\/p>)/i;
const HERO_SRC_RE = /<img class="hero-media"[^>]*src="([^"]*)"/i;
const ROBOTS_ROUTE_SEGMENTS = new Set(["search", "404"]);
const GENERIC_ARCHIVE_TITLE_PATTERNS = {
  en: [
    /^brazilian citizenship and naturalisation planning\.?$/i,
    /^rnm and resident card planning in brazil\.?$/i,
    /^cplp temporary residency visa for brazil\.?$/i,
    /^investor immigration planning for brazil\.?$/i
  ],
  "pt-BR": [
    /^brasilian cidadania e naturalizacao planeamento\.?$/i,
    /^rnm e planejamento de cartao residente em brasil\.?$/i,
    /^cplp visto de residencia temporaria para brasil\.?$/i,
    /^planejamento de imigracao de investidores para brasil\.?$/i
  ]
};

const COPY = {
  en: {
    organizationDescription:
      "Immigrate to Brazil is the immigration platform led by attorney Monique Fernandes for visas, residency, naturalisation, compliance, and practical planning for life in Brazil.",
    practiceName: "Monique Fernandes Brazil Immigration Legal Practice",
    practiceDescription:
      "Attorney-led Brazil immigration legal guidance for visas, residency, naturalisation, compliance, defense, and cross-border planning.",
    personJobTitle: "Brazil immigration attorney",
    personDescription:
      "Attorney Monique Fernandes helps individuals, families, entrepreneurs, and international clients with immigration matters connected to Brazil.",
    personKnowsAbout: [
      "Brazil immigration law",
      "Brazil visas",
      "Brazil residency planning",
      "Brazilian citizenship and naturalisation",
      "Immigration compliance and defense",
      "Cross-border documentation and relocation planning"
    ],
    contactType: "customer support",
    countryName: "Brazil",
    archiveBrandNote:
      "This article has been reviewed for Immigrate to Brazil so the guidance stays aligned with Brazil immigration planning, legal context, and practical next steps.",
    archiveRouteLabel: "Archive",
    archiveReferenceLabel: "Archive record",
    localizedArchiveTitleLabel: "",
    localizedDescriptionLead: "",
    articleSuffix: {
      blog: "Blog Article",
      fyi: "FYI",
      general: "Brazil Insight",
      guides: "Brazil Guide",
      naturalisation: "Naturalisation Insight",
      process: "Process Insight",
      residency: "Residency Insight",
      updates: "Brazil Update",
      visa: "Visa Insight"
    },
    fallbackDescription:
      "Practical guidance from attorney Monique Fernandes on Brazil immigration, route choice, documents, timing, and next steps."
  },
  "pt-BR": {
    organizationDescription:
      "Immigrate to Brazil e a plataforma de imigracao liderada pela advogada Monique Fernandes para vistos, residencia, naturalizacao, compliance e planejamento pratico de mudanca para o Brasil.",
    practiceName: "Pratica juridica de imigracao para o Brasil de Monique Fernandes",
    practiceDescription:
      "Orientacao juridica conduzida por advogada para vistos, residencia, naturalizacao, compliance, defesa e planejamento migratorio para o Brasil.",
    personJobTitle: "advogada de imigracao para o Brasil",
    personDescription:
      "A advogada Monique Fernandes ajuda individuos, familias, empreendedores e clientes internacionais em questoes migratorias ligadas ao Brasil.",
    personKnowsAbout: [
      "direito de imigracao para o Brasil",
      "vistos para o Brasil",
      "planejamento de residencia no Brasil",
      "cidadania e naturalizacao brasileira",
      "compliance e defesa migratoria",
      "documentos transfronteiricos e planejamento de mudanca"
    ],
    contactType: "atendimento ao cliente",
    countryName: "Brasil",
    archiveBrandNote:
      "Este artigo foi revisado para o Immigrate to Brazil para manter a orientacao alinhada ao planejamento migratorio, ao contexto juridico e aos proximos passos no Brasil.",
    archiveRouteLabel: "Arquivo",
    archiveReferenceLabel: "Registro do arquivo",
    localizedArchiveTitleLabel: "em português",
    localizedDescriptionLead: "Leitura em português.",
    articleSuffix: {
      blog: "Artigo",
      fyi: "FYI",
      general: "Insight Brasil",
      guides: "Guia Brasil",
      naturalisation: "Insight de Naturalizacao",
      process: "Insight de Processo",
      residency: "Insight de Residencia",
      updates: "Atualizacao",
      visa: "Insight de Visto"
    },
    fallbackDescription:
      "Orientacao pratica da advogada Monique Fernandes sobre imigracao para o Brasil, escolha de rota, documentos, prazos e proximos passos."
  }
};

const CATEGORY_LABELS = {
  en: {
    blog: "Blog",
    fyi: "FYI",
    general: "General",
    guides: "Guides",
    naturalisation: "Naturalisation",
    process: "Process",
    residency: "Residency",
    updates: "Updates",
    visa: "Visa"
  },
  "pt-BR": {
    blog: "Blog",
    fyi: "FYI",
    general: "Geral",
    guides: "Guias",
    naturalisation: "Naturalizacao",
    process: "Processo",
    residency: "Residencia",
    updates: "Atualizacoes",
    visa: "Visto"
  }
};

const MONTHS = {
  en: {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12"
  },
  "pt-BR": {
    janeiro: "01",
    fevereiro: "02",
    marco: "03",
    abril: "04",
    maio: "05",
    junho: "06",
    julho: "07",
    agosto: "08",
    setembro: "09",
    outubro: "10",
    novembro: "11",
    dezembro: "12"
  }
};

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function decodeHtml(value = "") {
  let decoded = String(value);
  for (let index = 0; index < 4; index += 1) {
    const next = decoded
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
      .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, " ");
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function normalizeSpace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function stripTags(value = "") {
  return normalizeSpace(decodeHtml(String(value).replace(/<[^>]*>/g, " ")));
}

function baseRouteFor(route) {
  return route.startsWith("/pt-br/") ? route.replace(/^\/pt-br/, "") || "/" : route;
}

function routeSegments(route) {
  return baseRouteFor(route).replace(/^\/|\/$/g, "").split("/").filter(Boolean);
}

function localeForRoute(route) {
  return route.startsWith("/pt-br/") ? "pt-BR" : "en";
}

function readTextMatch(source, pattern, group = 1) {
  const match = source.match(pattern);
  return match ? stripTags(match[group]) : "";
}

function replaceMetaTag(html, attr, key, value) {
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attr}=["']${escapeRegExp(key)}["'])[^>]*\\bcontent=["'][\\s\\S]*?["'][^>]*>`,
    "i"
  );
  const replacement = `<meta ${attr}="${key}" content="${escapeAttribute(value)}" />`;
  return pattern.test(html) ? html.replace(pattern, () => replacement) : html;
}

function replaceTitle(html, value) {
  return html.replace(TITLE_RE, () => `<title>${escapeHtml(value)}</title>`);
}

function replaceWrappedContent(html, pattern, value) {
  return html.replace(pattern, (_, openTag, _current, closeTag) => `${openTag}${escapeHtml(value)}${closeTag}`);
}

function truncateDescription(value, max = 160) {
  const normalized = normalizeSpace(value);
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  const clipped = normalized.slice(0, max - 1);
  const clean = clipped.replace(/[,:;\s-]+[^,:;\s-]*$/, "").trim();
  return `${clean || clipped}`.replace(/[.,;:]+$/, "").trim() + "...";
}

function expectedRobots(route) {
  const segments = route.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  return segments.some((segment) => ROBOTS_ROUTE_SEGMENTS.has(segment)) ? "noindex,follow" : "index,follow";
}

function isInsightArticleRoute(route) {
  const segments = routeSegments(route);
  return segments[0] === "insights" && segments.length >= 3;
}

function extractHeroAlt(html) {
  return decodeHtml(readTextMatch(html, HERO_ALT_RE));
}

function extractOgImageAlt(html) {
  return decodeHtml(readTextMatch(html, OG_IMAGE_ALT_RE) || readTextMatch(html, OG_IMAGE_ALT_RE_ALT));
}

function extractHeroSrc(html) {
  return readTextMatch(html, HERO_SRC_RE);
}

function extractHeroSummary(html) {
  return readTextMatch(html, HERO_SUMMARY_RE, 2);
}

function extractFirstIntroParagraph(html) {
  const introBlock = html.match(/<section class="content-block intro-block"[\s\S]*?<\/section>/i)?.[0] || html;
  return readTextMatch(introBlock, /<p>([\s\S]*?)<\/p>/i);
}

function extractH1(html) {
  return readTextMatch(html, H1_RE, 2);
}

function extractTitleTag(html) {
  return readTextMatch(html, TITLE_RE);
}

function humanizeArticleSlug(route) {
  const slug = routeSegments(route).slice(-1)[0] || "";
  const cleanedSlug = slug
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/-\d+$/, "")
    .replace(/-/g, " ");
  const normalized = normalizeSpace(cleanedSlug);
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function extractDateLabel(html, locale) {
  if (locale === "pt-BR") {
    return readTextMatch(html, /(?:Data de origem|Contexto da publicacao):\s*([^<]+)/i);
  }
  return readTextMatch(html, /(?:Source date|Publication context):\s*([^<]+)/i);
}

function monthKey(value = "") {
  return normalizeSpace(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseDateToIso(label, locale) {
  const normalized = monthKey(label);
  if (!normalized) return "";

  if (locale === "pt-BR") {
    const match = normalized.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/i);
    if (!match) return "";
    const month = MONTHS["pt-BR"][match[2]];
    if (!month) return "";
    return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
  }

  const match = normalized.match(/([a-z]+)\s+(\d{1,2}),\s+(\d{4})/i);
  if (!match) return "";
  const month = MONTHS.en[match[1]];
  if (!month) return "";
  return `${match[3]}-${month}-${match[2].padStart(2, "0")}`;
}

function routeDisambiguator(route) {
  const slug = routeSegments(route).slice(-1)[0] || "";
  const numberedSlug = slug.match(/-(\d+)$/);
  return numberedSlug ? numberedSlug[1] : "";
}

function routeArchiveDateIso(route) {
  const slug = routeSegments(route).slice(-1)[0] || "";
  const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})-/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function formatIsoDateForLocale(isoDate, locale) {
  if (!isoDate) return "";
  const localeCode = locale === "pt-BR" ? "pt-BR" : "en-US";
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeCode, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function isGenericArchiveTitle(value, locale) {
  const normalized = monthKey(value).replace(/[.]+$/g, "");
  return (
    normalized === "brazil" ||
    normalized === "brasil" ||
    GENERIC_ARCHIVE_TITLE_PATTERNS[locale].some((pattern) => pattern.test(normalized))
  );
}

function chooseArchiveTitle(route, html, locale) {
  const sourceWeight = {
    heroAlt: 4,
    ogAlt: 5,
    h1: 3,
    title: 2,
    slug: 1
  };

  const candidates = [
    { source: "heroAlt", value: extractHeroAlt(html) },
    { source: "ogAlt", value: extractOgImageAlt(html) },
    { source: "h1", value: extractH1(html) },
    { source: "title", value: extractTitleTag(html).split("|")[0] },
    { source: "slug", value: humanizeArticleSlug(route) }
  ]
    .map((entry) => ({ ...entry, value: normalizeSpace(entry.value) }))
    .filter((entry) => entry.value)
    .filter((entry, index, array) => array.findIndex((item) => item.value === entry.value) === index)
    .map((entry) => {
      const wordCount = entry.value.split(/\s+/).filter(Boolean).length;
      let score = wordCount * 2 + Math.min(entry.value.length, 80) / 20 + (sourceWeight[entry.source] || 0);
      if (isGenericArchiveTitle(entry.value, locale)) score -= 30;
      if (wordCount <= 2) score -= 12;
      if (entry.value.length < 16) score -= 4;
      return { ...entry, score };
    })
    .sort((left, right) => right.score - left.score || right.value.length - left.value.length);

  return candidates[0]?.value || "Immigration insight";
}

function buildArchiveMeta(route, html, locale) {
  const copy = COPY[locale];
  const disambiguator = routeDisambiguator(route);
  const archiveDateIso = routeArchiveDateIso(route);
  const archiveDateLabel = formatIsoDateForLocale(archiveDateIso, locale);
  let articleTitle = chooseArchiveTitle(route, html, locale);
  if (disambiguator && !new RegExp(`\\b${escapeRegExp(disambiguator)}\\b`).test(articleTitle)) {
    articleTitle = `${articleTitle} (${disambiguator})`;
  }
  const introParagraph = extractFirstIntroParagraph(html);
  const heroSummary = extractHeroSummary(html);
  const baseSummary = normalizeSpace(
    introParagraph
      .replace(/^(Publication context|Contexto da publicacao):.*$/i, "")
      .replace(/\s+Publication context:.*$/i, "")
      .replace(/\s+Contexto da publicacao:.*$/i, "")
  );
  const dateLabel = extractDateLabel(html, locale);
  const summaryBody = [
    archiveDateLabel ? `${copy.archiveReferenceLabel}: ${archiveDateLabel}.` : "",
    baseSummary || heroSummary || copy.fallbackDescription,
    dateLabel ? `${locale === "pt-BR" ? "Data de origem" : "Source date"}: ${dateLabel}.` : ""
  ]
    .filter(Boolean)
    .join(" ");
  const descriptionPrefix =
    locale === "pt-BR"
      ? `${copy.localizedDescriptionLead} ${articleTitle}${articleTitle.endsWith("?") ? "" : "."} `
      : `${articleTitle}${articleTitle.endsWith("?") ? " " : ": "}`;
  const description = truncateDescription(
    `${descriptionPrefix}${summaryBody}`,
    160
  );
  const categorySlug = routeSegments(route)[1] || "general";
  const categoryLabel = CATEGORY_LABELS[locale][categorySlug] || CATEGORY_LABELS[locale].general;
  const suffix = copy.articleSuffix[categorySlug] || copy.articleSuffix.general;
  const titleParts = [articleTitle];
  if (dateLabel) titleParts.push(dateLabel);
  if (archiveDateLabel) titleParts.push(`${copy.archiveRouteLabel} ${archiveDateLabel}`);
  titleParts.push(copy.localizedArchiveTitleLabel ? `${suffix} ${copy.localizedArchiveTitleLabel}` : suffix, "Immigrate to Brazil");
  const browserTitle = titleParts.join(" | ");
  const datePublished = parseDateToIso(dateLabel, locale);

  return {
    articleTitle,
    browserTitle,
    categoryLabel,
    description,
    brandNote: copy.archiveBrandNote,
    archiveDateLabel,
    archiveDateIso,
    dateLabel,
    datePublished
  };
}

function patchRuntimeConfig(html, archiveMeta) {
  const match = html.match(ITB_SITE_RE);
  if (!match) return html;

  let config;
  try {
    config = JSON.parse(match[1]);
  } catch {
    return html;
  }

  config.pageTitle = archiveMeta.articleTitle;
  if (config.shell?.breadcrumbs?.length) {
    const lastCrumb = config.shell.breadcrumbs[config.shell.breadcrumbs.length - 1];
    if (lastCrumb) lastCrumb.label = archiveMeta.articleTitle;
  }
  if (config.shell?.sidebar?.brand) {
    config.shell.sidebar.brand.note = archiveMeta.brandNote;
  }

  return html.replace(ITB_SITE_RE, () => `window.ITB_SITE = ${JSON.stringify(config)};`);
}

function patchArchiveSeo(html, route, locale) {
  const archiveMeta = buildArchiveMeta(route, html, locale);
  let nextHtml = html;
  nextHtml = replaceTitle(nextHtml, archiveMeta.browserTitle);
  nextHtml = replaceMetaTag(nextHtml, "name", "description", archiveMeta.description);
  nextHtml = replaceMetaTag(nextHtml, "property", "og:title", archiveMeta.browserTitle);
  nextHtml = replaceMetaTag(nextHtml, "property", "og:description", archiveMeta.description);
  nextHtml = replaceMetaTag(nextHtml, "name", "twitter:title", archiveMeta.browserTitle);
  nextHtml = replaceMetaTag(nextHtml, "name", "twitter:description", archiveMeta.description);
  nextHtml = replaceWrappedContent(nextHtml, H1_RE, archiveMeta.articleTitle);
  if (HERO_SUMMARY_RE.test(nextHtml)) {
    nextHtml = replaceWrappedContent(nextHtml, HERO_SUMMARY_RE, archiveMeta.description);
  }
  if (BRAND_NOTE_RE.test(nextHtml)) {
    nextHtml = replaceWrappedContent(nextHtml, BRAND_NOTE_RE, archiveMeta.brandNote);
  }
  nextHtml = patchRuntimeConfig(nextHtml, archiveMeta);
  return { html: nextHtml, archiveMeta };
}

function patchJsonLd(html, route, locale, description, archiveMeta = null) {
  const match = html.match(JSON_LD_RE);
  if (!match) return html;

  let payload;
  try {
    payload = JSON.parse(match[1]);
  } catch {
    if (!archiveMeta) return html;
    return html.replace(JSON_LD_RE, () => `<script type="application/ld+json">${JSON.stringify(buildArchiveJsonLd(route, locale, archiveMeta, html))}</script>`);
  }

  const copy = COPY[locale];
  const schemas = Array.isArray(payload) ? payload : [payload];

  for (const schema of schemas) {
    if (!schema || typeof schema !== "object") continue;

    if (schema["@type"] === "Organization") {
      schema.description = copy.organizationDescription;
    }

    if (schema["@type"] === "ContactPoint") {
      schema.contactType = copy.contactType;
    }

    if (schema["@type"] === "Country") {
      schema.name = copy.countryName;
    }

    if (schema["@id"] === "https://immigratetobrazil.com#legal-practice") {
      schema.name = copy.practiceName;
      schema.description = copy.practiceDescription;
      schema.availableLanguage = ["English", "Portuguese"];
    }

    if (schema["@id"] === "https://immigratetobrazil.com#person-monique-fernandes") {
      schema.jobTitle = copy.personJobTitle;
      schema.description = copy.personDescription;
      schema.knowsLanguage = ["English", "Portuguese"];
      schema.knowsAbout = copy.personKnowsAbout;
    }

    if (archiveMeta && schema["@type"] === "ImageObject") {
      schema.name = `${archiveMeta.articleTitle} hero image`;
      schema.description = archiveMeta.description;
      schema.caption = extractHeroAlt(html) || archiveMeta.articleTitle;
      schema.inLanguage = locale;
    }

    if (archiveMeta && schema["@type"] === "Thing") {
      schema.name = archiveMeta.articleTitle;
      schema.description = archiveMeta.description;
    }

    if (archiveMeta && schema["@type"] === "BreadcrumbList") {
      const items = Array.isArray(schema.itemListElement) ? schema.itemListElement : [];
      if (items.length) {
        items[items.length - 1].name = archiveMeta.articleTitle;
      }
    }

    if (archiveMeta && ["Article", "BlogPosting", "NewsArticle"].includes(schema["@type"])) {
      schema.name = archiveMeta.articleTitle;
      schema.headline = archiveMeta.articleTitle;
      schema.description = archiveMeta.description;
      schema.inLanguage = locale;
      schema.articleSection = archiveMeta.categoryLabel;
      schema.author = { "@id": "https://immigratetobrazil.com#person-monique-fernandes" };
      schema.publisher = { "@id": "https://immigratetobrazil.com#organization" };
      if (archiveMeta.datePublished) {
        schema.datePublished = archiveMeta.datePublished;
      }
      if (archiveMeta.archiveDateIso) {
        schema.dateModified = archiveMeta.archiveDateIso;
      }
    }

    if (!archiveMeta && typeof schema.description === "string" && schema.description) {
      schema.description = description || schema.description;
      if (schema.inLanguage) schema.inLanguage = locale;
    }
  }

  return html.replace(JSON_LD_RE, () => `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`);
}

function absoluteUrl(routeOrPath = "") {
  if (!routeOrPath) return "https://immigratetobrazil.com";
  if (/^https?:\/\//i.test(routeOrPath)) return routeOrPath;
  if (routeOrPath.startsWith("/")) return `https://immigratetobrazil.com${routeOrPath}`;
  return `https://immigratetobrazil.com/${routeOrPath.replace(/^\.?\//, "")}`;
}

function buildArchiveJsonLd(route, locale, archiveMeta, html) {
  const copy = COPY[locale];
  const pageUrl = absoluteUrl(route);
  const heroUrl = absoluteUrl(extractHeroSrc(html));
  const categoryLabel = archiveMeta.categoryLabel;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://immigratetobrazil.com#organization",
      name: "Immigrate to Brazil",
      url: "https://immigratetobrazil.com",
      description: copy.organizationDescription,
      email: "moniquefadv@gmail.com",
      telephone: "+55 43 9961-4034",
      logo: "https://immigratetobrazil.com/assets/logo/logo.png",
      contactPoint: { "@id": "https://immigratetobrazil.com#contact-primary" }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://immigratetobrazil.com#website",
      name: "Immigrate to Brazil",
      url: "https://immigratetobrazil.com",
      publisher: { "@id": "https://immigratetobrazil.com#organization" }
    },
    {
      "@context": "https://schema.org",
      "@type": "ContactPoint",
      "@id": "https://immigratetobrazil.com#contact-primary",
      contactType: copy.contactType,
      email: "moniquefadv@gmail.com",
      telephone: "+55 43 9961-4034",
      availableLanguage: ["English", "Portuguese"]
    },
    {
      "@context": "https://schema.org",
      "@type": "Country",
      "@id": "https://immigratetobrazil.com#place-brazil",
      name: copy.countryName
    },
    {
      "@context": "https://schema.org",
      "@type": "LegalService",
      "@id": "https://immigratetobrazil.com#legal-practice",
      name: copy.practiceName,
      description: copy.practiceDescription,
      provider: { "@id": "https://immigratetobrazil.com#organization" },
      areaServed: { "@id": "https://immigratetobrazil.com#place-brazil" },
      availableLanguage: ["English", "Portuguese"]
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://immigratetobrazil.com#person-monique-fernandes",
      name: "Monique Fernandes",
      url: "https://immigratetobrazil.com/about/lawyer/",
      jobTitle: copy.personJobTitle,
      description: copy.personDescription,
      worksFor: { "@id": "https://immigratetobrazil.com#organization" }
    },
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "@id": `${pageUrl}#hero-image`,
      name: `${archiveMeta.articleTitle} hero image`,
      description: archiveMeta.description,
      caption: extractHeroAlt(html) || archiveMeta.articleTitle,
      contentUrl: heroUrl,
      url: heroUrl,
      thumbnailUrl: heroUrl,
      representativeOfPage: true,
      inLanguage: locale
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: archiveMeta.articleTitle,
      headline: archiveMeta.articleTitle,
      description: archiveMeta.description,
      articleSection: categoryLabel,
      isPartOf: { "@id": "https://immigratetobrazil.com#website" },
      primaryImageOfPage: { "@id": `${pageUrl}#hero-image` },
      author: { "@id": "https://immigratetobrazil.com#person-monique-fernandes" },
      publisher: { "@id": "https://immigratetobrazil.com#organization" },
      about: { "@id": "https://immigratetobrazil.com#legal-practice" },
      inLanguage: locale,
      ...(archiveMeta.datePublished ? { datePublished: archiveMeta.datePublished } : {}),
      ...(archiveMeta.archiveDateIso ? { dateModified: archiveMeta.archiveDateIso } : {})
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "pt-BR" ? "Inicio" : "Home",
          item: absoluteUrl(locale === "pt-BR" ? "/pt-br/" : "/")
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Insights",
          item: absoluteUrl(locale === "pt-BR" ? "/pt-br/insights/" : "/insights/")
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categoryLabel,
          item: absoluteUrl(locale === "pt-BR" ? `/pt-br/insights/${routeSegments(route)[1]}/` : `/insights/${routeSegments(route)[1]}/`)
        },
        {
          "@type": "ListItem",
          position: 4,
          name: archiveMeta.articleTitle,
          item: pageUrl
        }
      ]
    }
  ];
}

async function writeIfChanged(filePath, content) {
  const current = await fs.readFile(filePath, "utf8");
  if (current === content) return false;
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  let updatedCount = 0;

  for (const entry of routeFiles) {
    const locale = localeForRoute(entry.route);
    let html = await fs.readFile(entry.filePath, "utf8");
    html = replaceMetaTag(html, "name", "robots", expectedRobots(entry.route));

    let archiveMeta = null;
    if (isInsightArticleRoute(entry.route)) {
      const archiveResult = patchArchiveSeo(html, entry.route, locale);
      html = archiveResult.html;
      archiveMeta = archiveResult.archiveMeta;
    }

    const description = readTextMatch(
      html,
      /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']([\s\S]*?)["'])[^>]*>/i
    );
    html = patchJsonLd(html, entry.route, locale, description, archiveMeta);

    if (await writeIfChanged(entry.filePath, html)) {
      updatedCount += 1;
    }
  }

  console.log(`Site quality pass updated ${updatedCount} HTML files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
