import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { outputPathForRoute } from "./static-site-utils.js";
import { decorateBodyHtmlWithSectionImages } from "./section-image-utils.js";
import { buildStructuredData } from "./schema-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, "..");
export const CONTENT_ROOT = path.join(ROOT, "content");
export const EN_CONTENT_ROOT = path.join(CONTENT_ROOT, "en");
export const ROUTES_ROOT = path.join(EN_CONTENT_ROOT, "routes");
export const ABOUT_PATH = path.join(EN_CONTENT_ROOT, "about", "about.json");
export const SITE_DOMAIN = "https://immigratetobrazil.com";

const BODY_AND_SCRIPTS_RE =
  /<body[^>]*class="([^"]+)"[^>]*>([\s\S]*?)<!-- Section: Site Scripts -->\s*<script defer src="([^"]+)"><\/script>\s*<script defer src="([^"]+)"><\/script>\s*<script defer src="([^"]+)"><\/script>\s*<script defer src="([^"]+)"><\/script>\s*<\/body>\s*<\/html>\s*$/i;
const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
const WINDOW_CONFIG_RE = /window\.ITB_SITE\s*=\s*(\{.*?\});/s;

function assertMatch(route, label, value) {
  if (!value) {
    throw new Error(`Could not extract ${label} for ${route}.`);
  }
  return value;
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

function extractSingle(route, html, label, pattern, group = 1) {
  const match = html.match(pattern);
  return assertMatch(route, label, match?.[group]);
}

function extractSection(route, html, label, startMarker, endMarker) {
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error(`Could not find ${label} start marker for ${route}.`);
  }

  const afterStart = startIndex + startMarker.length;
  const endIndex = html.indexOf(endMarker, afterStart);
  if (endIndex === -1) {
    throw new Error(`Could not find ${label} end marker for ${route}.`);
  }

  return html.slice(afterStart, endIndex);
}

function parseLinkAttributes(source) {
  const attributes = {};
  for (const match of source.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function parseLinkList(section) {
  return [...section.matchAll(/<link\s+([^>]+?)\s*\/>/g)].map((match) => parseLinkAttributes(match[1]));
}

function normalizeSharedSchemaObjects(route, schemas) {
  const organization = schemas.find((item) => item?.["@type"] === "Organization");
  const contactPoint = schemas.find((item) => item?.["@type"] === "ContactPoint");

  if (!organization || !contactPoint) {
    throw new Error(`Expected Organization and ContactPoint schema objects on ${route}.`);
  }

  return {
    organization,
    contactPoint,
    pageSchemas: schemas.filter((item) => item !== organization && item !== contactPoint)
  };
}

function parseScripts(route, html) {
  const match = html.match(BODY_AND_SCRIPTS_RE);
  if (!match) {
    throw new Error(`Could not extract body/scripts block for ${route}.`);
  }

  return {
    bodyClass: match[1],
    bodyHtml: match[2],
    scripts: [match[3], match[4], match[5], match[6]]
  };
}

function pageTitleFromRuntime(route, runtime) {
  if (!runtime?.pageTitle || !runtime?.pageFamily) {
    throw new Error(`Missing pageTitle/pageFamily in window.ITB_SITE for ${route}.`);
  }

  return {
    pageTitle: runtime.pageTitle,
    pageFamily: runtime.pageFamily
  };
}

export function routeToContentDir(route) {
  if (route === "/") return path.join(ROUTES_ROOT, "root");
  return path.join(ROUTES_ROOT, route.replace(/^\/|\/$/g, ""));
}

export function contentDirToRoute(contentDir) {
  const relative = path.relative(ROUTES_ROOT, contentDir);
  if (!relative || relative === "root") return "/";
  return `/${relative.split(path.sep).join("/")}/`;
}

export function routeToUrl(route, domain = SITE_DOMAIN) {
  return route === "/" ? domain : `${domain}${route}`;
}

export function routeToPt(route) {
  return route === "/" ? "/pt-br/" : `/pt-br${route}`;
}

export function pageJsonPathForRoute(route) {
  return path.join(routeToContentDir(route), "page.json");
}

export function bodyHtmlPathForRoute(route) {
  return path.join(routeToContentDir(route), "body.html");
}

export async function writeFileIfChanged(filePath, content) {
  let current = null;
  try {
    current = await fs.readFile(filePath, "utf8");
  } catch {
    current = null;
  }

  if (current === content) return false;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

export async function loadJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

export async function loadAboutContent() {
  return loadJson(ABOUT_PATH);
}

export async function discoverContentRouteDirs() {
  const routeDirs = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile() || entry.name !== "page.json") continue;
      routeDirs.push(path.dirname(fullPath));
    }
  }

  await walk(ROUTES_ROOT);
  return routeDirs.sort((a, b) => contentDirToRoute(a).localeCompare(contentDirToRoute(b)));
}

function purgeLegacySections(html) {
  return html
    // Remove legacy sidebar facts section (At a glance)
    .replace(/<section[^>]+class="[^"]*sidebar-card--facts[^"]*"[\s\S]*?<\/section>/gi, "")
    // Remove inline references to old UI labels
    .replace(/<h2[^>]*>\s*(Service pathways at a glance|At a glance|Page model|Intake route|home guidance)[\s\S]*?<\/h2>/gi, "")
    // Remove legacy page guidance block markers if present
    .replace(/<!--\s*Legacy Home Guidance[\s\S]*?-->/gi, "");
}

export async function loadContentPage(routeDir) {
  const page = await loadJson(path.join(routeDir, "page.json"));
  let bodyHtml = await fs.readFile(path.join(routeDir, "body.html"), "utf8");
  bodyHtml = purgeLegacySections(bodyHtml);
  return {
    route: contentDirToRoute(routeDir),
    page,
    bodyHtml
  };
}

export function parseEnglishPage(route, html) {
  const lang = extractSingle(route, html, "html lang", /<html lang="([^"]+)">/i);
  const metaTitle = extractSingle(route, html, "title", /<title>([\s\S]*?)<\/title>/i);
  const themeColor = extractSingle(route, html, "theme color", /<meta name="theme-color" content="([^"]+)" \/>/i);
  const description = extractSingle(route, html, "meta description", /<meta name="description" content="([^"]+)" \/>/i);
  const author = extractSingle(route, html, "author", /<meta name="author" content="([^"]+)" \/>/i);
  const robots = extractSingle(route, html, "robots", /<meta name="robots" content="([^"]+)" \/>/i);
  const viewport = extractSingle(route, html, "viewport", /<meta name="viewport" content="([^"]+)" \/>/i);
  const formatDetection = extractSingle(
    route,
    html,
    "format detection",
    /<meta name="format-detection" content="([^"]+)" \/>/i
  );
  const preloadImage = extractSingle(route, html, "preload image", /<link rel="preload" as="image" href="([^"]+)" fetchpriority="high" \/>/i);
  const ogType = extractSingle(route, html, "og:type", /<meta property="og:type" content="([^"]+)" \/>/i);
  const ogTitle = extractSingle(route, html, "og:title", /<meta property="og:title" content="([^"]+)" \/>/i);
  const ogDescription = extractSingle(route, html, "og:description", /<meta property="og:description" content="([^"]+)" \/>/i);
  const ogImage = extractSingle(route, html, "og:image", /<meta property="og:image" content="([^"]+)" \/>/i);
  const ogImageAlt = extractSingle(route, html, "og:image:alt", /<meta property="og:image:alt" content="([^"]+)" \/>/i);
  const ogSiteName = extractSingle(route, html, "og:site_name", /<meta property="og:site_name" content="([^"]+)" \/>/i);
  const twitterCard = extractSingle(route, html, "twitter:card", /<meta name="twitter:card" content="([^"]+)" \/>/i);
  const twitterTitle = extractSingle(route, html, "twitter:title", /<meta name="twitter:title" content="([^"]+)" \/>/i);
  const twitterDescription = extractSingle(route, html, "twitter:description", /<meta name="twitter:description" content="([^"]+)" \/>/i);
  const twitterImage = extractSingle(route, html, "twitter:image", /<meta name="twitter:image" content="([^"]+)" \/>/i);
  const twitterImageAlt = extractSingle(route, html, "twitter:image:alt", /<meta name="twitter:image:alt" content="([^"]+)" \/>/i);

  const jsonLdRaw = extractSingle(route, html, "JSON-LD", JSON_LD_RE);
  const runtimeRaw = extractSingle(route, html, "window.ITB_SITE", WINDOW_CONFIG_RE);
  const runtime = JSON.parse(runtimeRaw);
  const schemas = JSON.parse(jsonLdRaw);
  const { bodyClass, bodyHtml, scripts } = parseScripts(route, html);
  const { organization, contactPoint, pageSchemas } = normalizeSharedSchemaObjects(route, schemas);

  const faviconSection = extractSection(
    route,
    html,
    "favicons section",
    "<!-- Section: Favicons And Manifest -->",
    "<!-- Section: Stylesheets -->"
  );
  const stylesheetSection = extractSection(
    route,
    html,
    "stylesheets section",
    "<!-- Section: Stylesheets -->",
    "<!-- Section: Open Graph Metadata -->"
  );

  return {
    page: {
      route,
      lang,
      bodyClass,
      meta: {
        themeColor,
        description,
        robots,
        title: metaTitle,
        preloadImage
      },
      social: {
        ogType,
        ogTitle,
        ogDescription,
        ogImage,
        ogImageAlt,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterImageAlt
      },
      runtime: pageTitleFromRuntime(route, runtime),
      schemas: pageSchemas
    },
    bodyHtml,
    aboutCandidate: {
      site: {
        name: author,
        socialName: ogSiteName,
        domain: SITE_DOMAIN,
        lang,
        author,
        viewport,
        formatDetection
      },
      assets: {
        favicons: parseLinkList(faviconSection),
        stylesheets: parseLinkList(stylesheetSection).map((item) => item.href),
        scripts
      },
      schemas: {
        organization,
        contactPoint
      },
      runtime: {
        tracking: runtime.tracking,
        consultationPolicy: runtime.consultationPolicy,
        contact: runtime.contact,
        accessibility: runtime.accessibility
      }
    }
  };
}

function renderFaviconLinks(favicons) {
  return favicons
    .map((item) => {
      const attributes = [
        `rel="${escapeAttribute(item.rel)}"`,
        `href="${escapeAttribute(item.href)}"`
      ];
      if (item.sizes) attributes.push(`sizes="${escapeAttribute(item.sizes)}"`);
      if (item.type) attributes.push(`type="${escapeAttribute(item.type)}"`);
      return `<link ${attributes.join(" ")} />`;
    })
    .join("\n");
}

function renderStylesheetLinks(stylesheets) {
  return stylesheets.map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}" />`).join("\n");
}

function renderScriptLinks(scripts) {
  return scripts
    .map((href, index) => `${index === 0 ? "  " : ""}<script defer src="${escapeAttribute(href)}"></script>`)
    .join("\n");
}

export function renderEnglishPage(about, page, bodyHtml, structuredData) {
  const canonicalUrl = routeToUrl(page.route, about.site.domain);
  const ptUrl = routeToUrl(routeToPt(page.route), about.site.domain);
  const runtimeConfig = JSON.stringify({
    pageRoute: page.route,
    pageTitle: page.runtime.pageTitle,
    pageFamily: page.runtime.pageFamily,
    ...(page.shell ? { shell: page.shell } : {}),
    ...about.runtime
  });
  const structuredDataJson = JSON.stringify(structuredData);

  return `<!DOCTYPE html>

<!-- Section: Document Structure -->
<html lang="${escapeAttribute(page.lang || about.site.lang)}">
<head>

<!-- Section: Core Metadata -->
    <meta charset="utf-8" />
<meta name="viewport" content="${escapeAttribute(about.site.viewport)}" />
<meta name="theme-color" content="${escapeAttribute(page.meta.themeColor)}" />
<meta name="description" content="${escapeAttribute(page.meta.description)}" />
<meta name="author" content="${escapeAttribute(about.site.author)}" />
<meta name="robots" content="${escapeAttribute(page.meta.robots)}" />
<meta name="format-detection" content="${escapeAttribute(about.site.formatDetection)}" />

<!-- Section: Title -->
<title>${escapeHtml(page.meta.title)}</title>

<!-- Section: Canonical And Language Alternates -->
<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />
<link rel="alternate" hreflang="en" href="${escapeAttribute(canonicalUrl)}" />
<link rel="alternate" hreflang="pt-BR" href="${escapeAttribute(ptUrl)}" />
<link rel="alternate" hreflang="x-default" href="${escapeAttribute(canonicalUrl)}" />

<!-- Section: Preloaded Assets -->
<link rel="preload" as="image" href="${escapeAttribute(page.meta.preloadImage)}" fetchpriority="high" />

<!-- Section: Favicons And Manifest -->
${renderFaviconLinks(about.assets.favicons)}

<!-- Section: Stylesheets -->
${renderStylesheetLinks(about.assets.stylesheets)}

<!-- Section: Open Graph Metadata -->
<meta property="og:type" content="${escapeAttribute(page.social.ogType)}" />
<meta property="og:title" content="${escapeAttribute(page.social.ogTitle)}" />
<meta property="og:description" content="${escapeAttribute(page.social.ogDescription)}" />
<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />
<meta property="og:image" content="${escapeAttribute(page.social.ogImage)}" />
<meta property="og:image:alt" content="${escapeAttribute(page.social.ogImageAlt)}" />
<meta property="og:site_name" content="${escapeAttribute(about.site.socialName)}" />

<!-- Section: Twitter Metadata -->
<meta name="twitter:card" content="${escapeAttribute(page.social.twitterCard)}" />
<meta name="twitter:title" content="${escapeAttribute(page.social.twitterTitle)}" />
<meta name="twitter:description" content="${escapeAttribute(page.social.twitterDescription)}" />
<meta name="twitter:image" content="${escapeAttribute(page.social.twitterImage)}" />
<meta name="twitter:image:alt" content="${escapeAttribute(page.social.twitterImageAlt)}" />

<!-- Section: Structured Data -->
<script type="application/ld+json">${structuredDataJson}</script>

<!-- Section: Site Runtime Config -->
<script>
      window.ITB_SITE = ${runtimeConfig};
    </script>
</head>
<body class="${escapeAttribute(page.bodyClass)}">${bodyHtml}<!-- Section: Site Scripts -->
${renderScriptLinks(about.assets.scripts)}
</body>
</html>
`;
}

export async function generateEnglishPage(route, about, page, bodyHtml, siteCatalog) {
  const outputPath = outputPathForRoute(ROOT, route);
  const decoratedBodyHtml = await decorateBodyHtmlWithSectionImages(route, bodyHtml);
  const structuredData = buildStructuredData({
    about,
    page: { ...page, route },
    route,
    bodyHtml,
    siteCatalog
  });
  const rendered = renderEnglishPage(about, { ...page, route }, decoratedBodyHtml, structuredData);
  const changed = await writeFileIfChanged(outputPath, rendered);
  return { outputPath, changed };
}
