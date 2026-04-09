import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
const ITB_SITE_RE = /window\.ITB_SITE\s*=\s*(\{[\s\S]*?\});/;
const TITLE_RE = /<title>([\s\S]*?)<\/title>/i;
const HEAD_CLOSE_RE = /<\/head>/i;
const RELATED_READING_SECTION_RE = /<section\b[^>]*id=["']section-3-related-reading["'][^>]*>([\s\S]*?)<\/section>/i;
const INFO_CARD_RE = /<article class="info-card">([\s\S]*?)<\/article>/gi;
const HERO_ALT_RE = /<img class="hero-media"[^>]*alt="([^"]*)"/i;
const OG_IMAGE_ALT_RE = /<meta\b[^>]*property=["']og:image:alt["'][^>]*content=["']([^"']*)["'][^>]*>/i;
const OG_IMAGE_ALT_RE_ALT = /<meta\b[^>]*content=["']([^"']*)["'][^>]*property=["']og:image:alt["'][^>]*>/i;
const HERO_SUMMARY_RE = /(<p class="hero-summary">)([\s\S]*?)(<\/p>)/i;
const H1_RE = /(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i;
const BRAND_NOTE_RE = /(<p class="hero-brand-note">)([\s\S]*?)(<\/p>)/i;
const HERO_SRC_RE = /<img class="hero-media"[^>]*src="([^"]*)"/i;
const TITLE_SECTION_RE = /<!-- Section: Title -->/i;
const SITE_RUNTIME_SECTION_RE = /<!-- Section: Site Runtime Config -->/i;
const GOOGLE_TAG_SECTION_RE = /<!-- Section: Google Tag -->[\s\S]*?(?=<!-- Section: Site Runtime Config -->)/i;
const ROBOTS_ROUTE_SEGMENTS = new Set(["search", "404", "client-feedback"]);
const GOOGLE_SITE_VERIFICATION_TOKEN = "V_VZqx1NiakXTqLhWGFq83By48pnyeKglU8se9hGZIo";
const GOOGLE_SITE_VERIFICATION_ROUTES = new Set(["/", "/pt-br/"]);
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
    siteName: "Immigrate to Brazil",
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
    siteName: "Imigre para o Brasil",
    organizationDescription:
      "Imigre para o Brasil é a plataforma de orientação migratória liderada pela advogada Monique Fernandes para vistos, residência, naturalização, compliance e planejamento prático de vida no Brasil.",
    practiceName: "Prática jurídica de imigração para o Brasil de Monique Fernandes",
    practiceDescription:
      "Orientação jurídica em imigração para o Brasil, conduzida por advogada, com apoio em vistos, residência, naturalização, compliance, defesa e planejamento migratório.",
    personJobTitle: "advogada de imigração para o Brasil",
    personDescription:
      "A advogada Monique Fernandes orienta indivíduos, famílias, empreendedores e clientes internacionais em questões migratórias ligadas ao Brasil.",
    personKnowsAbout: [
      "direito de imigração para o Brasil",
      "vistos para o Brasil",
      "planejamento de residência no Brasil",
      "cidadania e naturalização brasileira",
      "compliance e defesa migratória",
      "documentação internacional e planejamento de mudança"
    ],
    contactType: "atendimento ao cliente",
    countryName: "Brasil",
    archiveBrandNote:
      "Este artigo foi revisado para o site Imigre para o Brasil para manter a orientação alinhada ao planejamento migratório, ao contexto jurídico e aos próximos passos práticos no Brasil.",
    archiveRouteLabel: "Arquivo",
    archiveReferenceLabel: "Registro do arquivo",
    localizedArchiveTitleLabel: "em português",
    localizedDescriptionLead: "Leitura em português.",
    articleSuffix: {
      blog: "Artigo",
      fyi: "FYI",
      general: "Insight sobre o Brasil",
      guides: "Guia Brasil",
      naturalisation: "Insight sobre naturalização",
      process: "Insight sobre processo",
      residency: "Insight sobre residência",
      updates: "Atualização",
      visa: "Insight sobre visto"
    },
    fallbackDescription:
      "Orientação prática da advogada Monique Fernandes sobre imigração para o Brasil, escolha de rota, documentos, prazos e próximos passos."
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
    naturalisation: "Naturalização",
    process: "Processo",
    residency: "Residência",
    updates: "Atualizações",
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
  const safeValue = escapeAttribute(decodeHtml(value));
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attr}=["']${escapeRegExp(key)}["'])[^>]*\\bcontent=["'][\\s\\S]*?["'][^>]*>`,
    "i"
  );
  const replacement = `<meta ${attr}="${key}" content="${safeValue}" />`;
  return pattern.test(html) ? html.replace(pattern, () => replacement) : html;
}

function upsertMetaTag(html, attr, key, value) {
  const replaced = replaceMetaTag(html, attr, key, value);
  if (replaced !== html) return replaced;

  const safeValue = escapeAttribute(decodeHtml(value));
  const tag = `<meta ${attr}="${key}" content="${safeValue}" />`;
  if (TITLE_SECTION_RE.test(html)) return html.replace(TITLE_SECTION_RE, `${tag}\n\n<!-- Section: Title -->`);
  return html.replace(/<\/head>/i, `${tag}\n</head>`);
}

function dedupeMetaTag(html, attr, key) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attr}=["']${escapeRegExp(key)}["'])[^>]*>\\s*`, "gi");
  let seen = false;
  return html.replace(pattern, (match) => {
    if (seen) return "";
    seen = true;
    return match;
  });
}

function ensureGoogleSiteVerification(html, route) {
  if (!GOOGLE_SITE_VERIFICATION_ROUTES.has(route)) return html;
  const withVerification = upsertMetaTag(
    dedupeMetaTag(html, "name", "google-site-verification"),
    "name",
    "google-site-verification",
    GOOGLE_SITE_VERIFICATION_TOKEN
  );
  return dedupeMetaTag(withVerification, "name", "google-site-verification");
}

function trackingConfigFromHtml(html) {
  const match = html.match(ITB_SITE_RE);
  if (!match) return { ga4Id: "" };

  try {
    const config = JSON.parse(match[1]);
    const tracking = config?.tracking || {};
    return {
      ga4Id: typeof tracking.ga4Id === "string" ? tracking.ga4Id.trim() : ""
    };
  } catch {
    return { ga4Id: "" };
  }
}

function buildGoogleTagSection(ga4Id) {
  const safeGa4Id = escapeAttribute(ga4Id);
  return `<!-- Section: Google Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${safeGa4Id}" data-itb-google-tag-script="ga4"></script>
<script>
      window.dataLayer = window.dataLayer || [];
      window.gtag =
        window.gtag ||
        function gtag() {
          window.dataLayer.push(arguments);
        };
      window.__ITB_GA_BOOTSTRAPPED__ = true;
      window.gtag("set", "ads_data_redaction", true);
      window.gtag("consent", "default", {
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500
      });
      window.gtag("js", new Date());
      window.gtag("config", "${safeGa4Id}", { send_page_view: false });
      window.__ITB_GA_CONFIGURED__ = true;
    </script>

`;
}

function ensureGoogleTagSection(html) {
  const { ga4Id } = trackingConfigFromHtml(html);
  if (!ga4Id) return html;

  const section = buildGoogleTagSection(ga4Id);
  if (GOOGLE_TAG_SECTION_RE.test(html)) {
    return html.replace(GOOGLE_TAG_SECTION_RE, section);
  }
  if (SITE_RUNTIME_SECTION_RE.test(html)) {
    return html.replace(SITE_RUNTIME_SECTION_RE, `${section}<!-- Section: Site Runtime Config -->`);
  }
  if (HEAD_CLOSE_RE.test(html)) {
    return html.replace(HEAD_CLOSE_RE, `${section}</head>`);
  }
  return html;
}

function replaceTitle(html, value) {
  return html.replace(TITLE_RE, () => `<title>${escapeHtml(decodeHtml(value))}</title>`);
}

function replaceWrappedContent(html, pattern, value) {
  return html.replace(pattern, (_, openTag, _current, closeTag) => `${openTag}${escapeHtml(decodeHtml(value))}${closeTag}`);
}

function truncateDescription(value, max = 160) {
  const normalized = normalizeSpace(value);
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  const clipped = normalized.slice(0, max - 1);
  const clean = clipped.replace(/[,:;\s-]+[^,:;\s-]*$/, "").trim();
  return `${clean || clipped}`.replace(/[.,;:]+$/, "").trim() + "...";
}

function resolveLocalHref(href, route) {
  if (!href) return "";
  try {
    const resolved = new URL(href, absoluteUrl(route));
    return resolved.pathname || "";
  } catch {
    return "";
  }
}

function dedupeResources(resources = []) {
  const seen = new Set();
  return resources.filter((item) => {
    const href = item?.href;
    if (!href || seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

function extractRelatedReadingResources(html, route) {
  const sectionMatch = html.match(RELATED_READING_SECTION_RE);
  if (!sectionMatch) return [];

  const resources = [];
  for (const match of sectionMatch[1].matchAll(INFO_CARD_RE)) {
    const cardHtml = match[1];
    const hrefMatch = cardHtml.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i);
    if (!hrefMatch) continue;

    const href = resolveLocalHref(decodeHtml(hrefMatch[1]), route);
    if (!href.startsWith("/")) continue;

    const title = readTextMatch(cardHtml, /<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const paragraphs = [...cardHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(([, value]) => stripTags(value))
      .filter(Boolean);
    const description = paragraphs[0] || "";
    if (!title || !description) continue;

    resources.push({ href, title, description });
  }

  return resources;
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
  titleParts.push(copy.localizedArchiveTitleLabel ? `${suffix} ${copy.localizedArchiveTitleLabel}` : suffix, copy.siteName);
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

  if (config.shell) {
    const relatedReadingResources = extractRelatedReadingResources(html, config.pageRoute || "/");
    const existingResources = Array.isArray(config.shell.officialResources) ? config.shell.officialResources : [];
    const externalResources = existingResources.filter((item) => typeof item?.href === "string" && !item.href.startsWith("/"));
    if (relatedReadingResources.length || externalResources.length) {
      config.shell.officialResources = dedupeResources([...relatedReadingResources, ...externalResources]);
    }
  }

  return html.replace(ITB_SITE_RE, () => `window.ITB_SITE = ${JSON.stringify(config)};`);
}

function patchInsightRuntimeResources(html, route) {
  const match = html.match(ITB_SITE_RE);
  if (!match) return html;

  let config;
  try {
    config = JSON.parse(match[1]);
  } catch {
    return html;
  }

  if (config.shell) {
    const relatedReadingResources = extractRelatedReadingResources(html, config.pageRoute || route || "/");
    const existingResources = Array.isArray(config.shell.officialResources) ? config.shell.officialResources : [];
    const externalResources = existingResources.filter((item) => typeof item?.href === "string" && !item.href.startsWith("/"));
    if (relatedReadingResources.length || externalResources.length) {
      config.shell.officialResources = dedupeResources([...relatedReadingResources, ...externalResources]);
    }
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
      schema.name = copy.siteName;
      schema.description = copy.organizationDescription;
    }

    if (schema["@type"] === "WebSite") {
      schema.name = copy.siteName;
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
      name: copy.siteName,
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
      name: copy.siteName,
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
    html = ensureGoogleSiteVerification(html, entry.route);
    html = ensureGoogleTagSection(html);

    let archiveMeta = null;
    if (isInsightArticleRoute(entry.route)) {
      if (locale === "pt-BR") {
        html = patchInsightRuntimeResources(html, entry.route);
      } else {
        const archiveResult = patchArchiveSeo(html, entry.route, locale);
        html = archiveResult.html;
        archiveMeta = archiveResult.archiveMeta;
      }
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
