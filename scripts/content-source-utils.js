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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/"/g, "&quot;");
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

function buildGoogleTagSection(tracking = {}) {
  const ga4Id = typeof tracking.ga4Id === "string" ? tracking.ga4Id.trim() : "";
  const gtmId = typeof tracking.gtmId === "string" ? tracking.gtmId.trim() : "";
  if (!ga4Id && !gtmId) return "";

  const safeGa4Id = escapeAttribute(ga4Id);
  const jsGa4Id = JSON.stringify(ga4Id);
  const jsGtmId = JSON.stringify(gtmId);

  return `<!-- Section: Google Tag -->
<script>
      window.dataLayer = window.dataLayer || [];
      window.gtag =
        window.gtag ||
        function gtag() {
          window.dataLayer.push(arguments);
        };
      window.gtag("set", "ads_data_redaction", true);
      window.gtag("consent", "default", {
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500
      });
    </script>
${gtmId
  ? `<script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l !== "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", ${jsGtmId});
    </script>
`
  : ""}${ga4Id
  ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${safeGa4Id}" data-itb-google-tag-script="ga4"></script>
<script>
      window.__ITB_GA_BOOTSTRAPPED__ = true;
      window.gtag("js", new Date());
      window.gtag("config", ${jsGa4Id}, { send_page_view: false });
      window.__ITB_GA_CONFIGURED__ = true;
    </script>`
  : ""}`;
}

function buildGoogleTagFallback(gtmId) {
  if (!gtmId) return "";
  const safeGtmId = escapeAttribute(gtmId);
  return `<!-- Section: Google Tag Fallback -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${safeGtmId}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;
}

function injectGoogleTagFallback(bodyHtml, gtmId) {
  if (!gtmId) return bodyHtml;
  const fallback = buildGoogleTagFallback(gtmId);
  const placeholderRe = /<div\s+data-partial=["']gtm-noscript["']\s*>\s*<\/div>/i;
  if (placeholderRe.test(bodyHtml)) return bodyHtml.replace(placeholderRe, fallback);
  return `${fallback}\n${bodyHtml}`;
}

function renderScriptLinks(scripts) {
  return scripts
    .map((href, index) => `${index === 0 ? "  " : ""}<script defer src="${escapeAttribute(href)}"></script>`)
    .join("\n");
}

export function renderEnglishPage(about, page, bodyHtml, structuredData) {
  const canonicalUrl = routeToUrl(page.route, about.site.domain);
  const ptUrl = routeToUrl(routeToPt(page.route), about.site.domain);
  const tracking = about.runtime?.tracking || {};
  const decoratedBodyHtml = injectGoogleTagFallback(bodyHtml, tracking.gtmId || "");
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

${buildGoogleTagSection(tracking)}

<!-- Section: Site Runtime Config -->
<script>
      window.ITB_SITE = ${runtimeConfig};
    </script>
</head>
<body class="${escapeAttribute(page.bodyClass)}">${decoratedBodyHtml}<!-- Section: Site Scripts -->
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
