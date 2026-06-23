import fs from "fs/promises";
import path from "path";
import { execFile as execFileCallback } from "child_process";
import { promisify } from "util";

export const SITE_DOMAIN = "https://immigratetobrazil.com";
export const SITEMAP_INDEX_ROUTE = "/sitemap.xml";
export const SITEMAP_STYLESHEET_ROUTE = "/sitemap.xsl";
export const SITEMAP_DIRECTORY = "sitemaps";

const execFile = promisify(execFileCallback);

const XML_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const SECTION_ORDER = [
  "foundation",
  "start-consultation",
  "contact",
  "services",
  "process",
  "rights",
  "brazil",
  "about",
  "countries",
  "insights",
  "insights-visa",
  "insights-naturalisation",
  "insights-updates",
  "insights-guides",
  "insights-fyi",
  "insights-residency",
  "insights-process",
  "insights-blog",
  "insights-general",
  "legal"
];
const SECTION_LABELS = {
  foundation: "Foundation",
  "start-consultation": "Start Consultation",
  contact: "Contact",
  services: "Services",
  process: "Process",
  rights: "Rights",
  brazil: "Brazil",
  about: "About",
  countries: "Countries",
  insights: "Insights Hub",
  "insights-visa": "Visa Insights",
  "insights-naturalisation": "Naturalisation Insights",
  "insights-updates": "Immigration Updates",
  "insights-guides": "Brazil Guides",
  "insights-fyi": "Brazil FYI",
  "insights-residency": "Residency Insights",
  "insights-process": "Process Insights",
  "insights-blog": "Blog",
  "insights-general": "General Insights",
  legal: "Legal"
};

export function localeForRoute(route) {
  return route.startsWith("/pt-br/") ? "pt-br" : "en";
}

export function absoluteUrl(route) {
  return route === "/" ? SITE_DOMAIN : `${SITE_DOMAIN}${route}`;
}

export function baseRouteFor(route) {
  return route.startsWith("/pt-br/") ? route.replace(/^\/pt-br/, "") || "/" : route;
}

export function sectionForRoute(route) {
  const segments = baseRouteFor(route).split("/").filter(Boolean);
  return segments[0] || "foundation";
}

export function sitemapGroupForRoute(route) {
  const segments = baseRouteFor(route).split("/").filter(Boolean);
  const section = segments[0] || "foundation";
  if (section === "insights" && segments[1]) {
    return `insights-${segments[1]}`;
  }
  return section;
}

export function childSitemapRoute(section) {
  return `/${SITEMAP_DIRECTORY}/sitemap-${section}.xml`;
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sectionRank(section) {
  const index = SECTION_ORDER.indexOf(section);
  return index === -1 ? SECTION_ORDER.length : index;
}

function normalizeLastmod(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function localeWeight(route) {
  return localeForRoute(route) === "en" ? 0 : 1;
}

function compareRouteEntries(a, b) {
  const sectionCompare = sectionRank(sitemapGroupForRoute(a.route)) - sectionRank(sitemapGroupForRoute(b.route));
  if (sectionCompare !== 0) return sectionCompare;

  const baseCompare = baseRouteFor(a.route).localeCompare(baseRouteFor(b.route));
  if (baseCompare !== 0) return baseCompare;

  const localeCompare = localeWeight(a.route) - localeWeight(b.route);
  if (localeCompare !== 0) return localeCompare;

  return a.route.localeCompare(b.route);
}

function buildRouteGroups(routeEntries) {
  const routeGroups = new Map();

  for (const entry of routeEntries) {
    const groupKey = baseRouteFor(entry.route);
    const group = routeGroups.get(groupKey) || {};
    group[localeForRoute(entry.route)] = entry.route;
    routeGroups.set(groupKey, group);
  }

  return routeGroups;
}

function alternatesForRoute(route, routeGroups) {
  const group = routeGroups.get(baseRouteFor(route)) || {};
  const locale = localeForRoute(route);
  const enRoute = group.en || (locale === "en" ? route : null);
  const ptRoute = group["pt-br"] || (locale === "pt-br" ? route : null);
  const defaultRoute = enRoute || route;
  const alternates = [];

  if (enRoute) {
    alternates.push({ hreflang: "en", href: absoluteUrl(enRoute) });
  }
  if (ptRoute) {
    alternates.push({ hreflang: "pt-BR", href: absoluteUrl(ptRoute) });
  }
  alternates.push({ hreflang: "x-default", href: absoluteUrl(defaultRoute) });

  return alternates;
}

function xmlHeader() {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<?xml-stylesheet type="text/xsl" href="${SITEMAP_STYLESHEET_ROUTE}"?>`
  ];
}

function buildUrlEntry(entry, routeGroups) {
  const lines = [`  <url>`, `    <loc>${escapeXml(absoluteUrl(entry.route))}</loc>`];
  const lastmod = normalizeLastmod(entry.lastmod);

  if (lastmod) {
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  }

  for (const alternate of alternatesForRoute(entry.route, routeGroups)) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}" />`
    );
  }

  lines.push(`  </url>`);
  return lines.join("\n");
}

function buildUrlSitemap(entries, routeGroups) {
  const lines = [
    ...xmlHeader(),
    `<urlset xmlns="${XML_NAMESPACE}" xmlns:xhtml="${XHTML_NAMESPACE}">`
  ];

  for (const entry of entries) {
    lines.push(buildUrlEntry(entry, routeGroups));
  }

  lines.push(`</urlset>`, "");
  return lines.join("\n");
}

function latestLastmod(entries) {
  let latest = "";

  for (const entry of entries) {
    const normalized = normalizeLastmod(entry.lastmod);
    if (normalized && normalized > latest) {
      latest = normalized;
    }
  }

  return latest;
}

async function gitLastmodMap(root, relativePaths) {
  if (!relativePaths.length) return new Map();

  try {
    const { stdout } = await execFile(
      "git",
      ["log", "--format=__ITB__%x09%cI", "--name-only", "--", ...relativePaths],
      {
        cwd: root,
        maxBuffer: 32 * 1024 * 1024
      }
    );
    const lastmodByRelativePath = new Map();
    let currentCommitDate = "";

    for (const rawLine of stdout.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("__ITB__\t")) {
        currentCommitDate = normalizeLastmod(line.slice("__ITB__\t".length));
        continue;
      }

      if (!currentCommitDate || lastmodByRelativePath.has(line)) continue;
      lastmodByRelativePath.set(line, currentCommitDate);
    }

    return lastmodByRelativePath;
  } catch {
    return new Map();
  }
}

function buildSitemapIndex(childSitemaps) {
  const lines = [...xmlHeader(), `<sitemapindex xmlns="${XML_NAMESPACE}">`];

  for (const sitemap of childSitemaps) {
    lines.push(`  <sitemap>`);
    lines.push(`    <loc>${escapeXml(sitemap.loc)}</loc>`);
    if (sitemap.lastmod) {
      lines.push(`    <lastmod>${sitemap.lastmod}</lastmod>`);
    }
    lines.push(`  </sitemap>`);
  }

  lines.push(`</sitemapindex>`, "");
  return lines.join("\n");
}

function humanSectionLabel(section) {
  return SECTION_LABELS[section] || section.replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export function buildSitemapStylesheet() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Immigrate to Brazil Sitemap</title>
        <style>
          :root {
            color-scheme: light;
            --bg: #f6f1e7;
            --bg-accent: #efe5d1;
            --ink: #1f2a2c;
            --muted: #5d6b67;
            --line: rgba(31, 42, 44, 0.12);
            --panel: rgba(255, 255, 255, 0.88);
            --brand: #0d5a4f;
            --brand-deep: #07362f;
            --warm: #c58933;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: "Trebuchet MS", "Gill Sans", sans-serif;
            color: var(--ink);
            background:
              radial-gradient(circle at top left, rgba(197, 137, 51, 0.18), transparent 28rem),
              linear-gradient(160deg, var(--bg) 0%, #fbf8f2 52%, var(--bg-accent) 100%);
          }

          a {
            color: var(--brand);
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }

          .page {
            width: min(1120px, calc(100% - 2rem));
            margin: 0 auto;
            padding: 2rem 0 3rem;
          }

          .hero {
            position: relative;
            overflow: hidden;
            margin-bottom: 1.5rem;
            padding: 1.5rem;
            border: 1px solid rgba(7, 54, 47, 0.1);
            border-radius: 1.5rem;
            background:
              linear-gradient(135deg, rgba(13, 90, 79, 0.96), rgba(7, 54, 47, 0.94)),
              linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent);
            color: #f8f4eb;
            box-shadow: 0 24px 60px rgba(7, 54, 47, 0.12);
          }

          .hero::after {
            content: "";
            position: absolute;
            inset: auto -6rem -7rem auto;
            width: 16rem;
            height: 16rem;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(197, 137, 51, 0.35), transparent 68%);
          }

          .eyebrow {
            margin: 0 0 0.5rem;
            font-size: 0.78rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(248, 244, 235, 0.72);
          }

          h1 {
            margin: 0;
            font-size: clamp(2rem, 4vw, 3.2rem);
            line-height: 1.02;
          }

          .lede {
            max-width: 46rem;
            margin: 0.9rem 0 0;
            color: rgba(248, 244, 235, 0.84);
            line-height: 1.6;
          }

          .quick-links {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 1.25rem;
          }

          .quick-links a {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.7rem 1rem;
            border-radius: 999px;
            background: rgba(248, 244, 235, 0.12);
            color: #fff7eb;
            border: 1px solid rgba(248, 244, 235, 0.18);
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .summary-card,
          .panel {
            border: 1px solid var(--line);
            border-radius: 1.25rem;
            background: var(--panel);
            box-shadow: 0 18px 40px rgba(31, 42, 44, 0.06);
            backdrop-filter: blur(12px);
          }

          .summary-card {
            padding: 1rem 1.1rem;
          }

          .summary-label {
            display: block;
            font-size: 0.82rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--muted);
          }

          .summary-value {
            display: block;
            margin-top: 0.3rem;
            font-size: 1.85rem;
            font-weight: 700;
            color: var(--brand-deep);
          }

          .panel {
            padding: 1.1rem;
          }

          .panel h2 {
            margin: 0 0 0.45rem;
            font-size: 1.2rem;
          }

          .panel p {
            margin: 0 0 1rem;
            color: var(--muted);
            line-height: 1.55;
          }

          .table-wrap {
            overflow-x: auto;
            border-radius: 1rem;
            border: 1px solid var(--line);
            background: rgba(255, 255, 255, 0.82);
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 0.9rem 1rem;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid var(--line);
          }

          th {
            font-size: 0.8rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--muted);
            background: rgba(13, 90, 79, 0.05);
          }

          tr:last-child td {
            border-bottom: 0;
          }

          .url-cell {
            min-width: 28rem;
            word-break: break-word;
          }

          .muted {
            color: var(--muted);
          }

          .pill-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;
          }

          .pill {
            display: inline-flex;
            padding: 0.3rem 0.6rem;
            border-radius: 999px;
            border: 1px solid rgba(197, 137, 51, 0.22);
            background: rgba(197, 137, 51, 0.12);
            color: var(--brand-deep);
            font-size: 0.8rem;
            white-space: nowrap;
          }

          @media (max-width: 960px) {
            .page {
              width: min(100% - 1rem, 1120px);
              padding-top: 1rem;
            }

            .hero,
            .panel {
              border-radius: 1.1rem;
            }

            .url-cell {
              min-width: 18rem;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            <p class="eyebrow">XML Sitemap</p>
            <h1>Immigrate to Brazil</h1>
            <p class="lede">Search engines read the XML directly. This styled view is here to make the sitemap easier for people to inspect, QA, and understand.</p>
            <nav class="quick-links">
              <a href="/sitemap.xml">Sitemap Index</a>
              <a href="/robots.txt">robots.txt</a>
            </nav>
          </section>

          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <section class="summary-grid">
                <article class="summary-card">
                  <span class="summary-label">Child Sitemaps</span>
                  <strong class="summary-value"><xsl:value-of select="count(s:sitemapindex/s:sitemap)" /></strong>
                </article>
                <article class="summary-card">
                  <span class="summary-label">Index URL</span>
                  <strong class="summary-value">1</strong>
                </article>
              </section>

              <section class="panel">
                <h2>Sitemap Index</h2>
                <p>Each child sitemap groups a major site section so Google can crawl a cleaner, more maintainable structure.</p>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Sitemap</th>
                        <th scope="col">Last Modified</th>
                      </tr>
                    </thead>
                    <tbody>
                      <xsl:apply-templates select="s:sitemapindex/s:sitemap" />
                    </tbody>
                  </table>
                </div>
              </section>
            </xsl:when>

            <xsl:otherwise>
              <section class="summary-grid">
                <article class="summary-card">
                  <span class="summary-label">URLs</span>
                  <strong class="summary-value"><xsl:value-of select="count(s:urlset/s:url)" /></strong>
                </article>
                <article class="summary-card">
                  <span class="summary-label">Alternate Links</span>
                  <strong class="summary-value"><xsl:value-of select="count(s:urlset/s:url/xhtml:link)" /></strong>
                </article>
              </section>

              <section class="panel">
                <h2>URL Sitemap</h2>
                <p>Entries include canonical URLs, accurate alternate language references, and last modified dates when available.</p>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">URL</th>
                        <th scope="col">Last Modified</th>
                        <th scope="col">Alternates</th>
                      </tr>
                    </thead>
                    <tbody>
                      <xsl:apply-templates select="s:urlset/s:url" />
                    </tbody>
                  </table>
                </div>
              </section>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="s:sitemap">
    <tr>
      <td class="url-cell">
        <a href="{s:loc}">
          <xsl:value-of select="s:loc" />
        </a>
      </td>
      <td class="muted">
        <xsl:choose>
          <xsl:when test="normalize-space(s:lastmod)">
            <xsl:value-of select="s:lastmod" />
          </xsl:when>
          <xsl:otherwise>Not set</xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="s:url">
    <tr>
      <td class="url-cell">
        <a href="{s:loc}">
          <xsl:value-of select="s:loc" />
        </a>
      </td>
      <td class="muted">
        <xsl:choose>
          <xsl:when test="normalize-space(s:lastmod)">
            <xsl:value-of select="s:lastmod" />
          </xsl:when>
          <xsl:otherwise>Not set</xsl:otherwise>
        </xsl:choose>
      </td>
      <td>
        <div class="pill-group">
          <xsl:for-each select="xhtml:link">
            <span class="pill">
              <xsl:value-of select="@hreflang" />
            </span>
          </xsl:for-each>
        </div>
      </td>
    </tr>
  </xsl:template>
</xsl:stylesheet>
`;
}

export function buildRobots() {
  return `# Immigrate to Brazil robots.txt
# Applies to legitimate search and AI crawlers, including Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, CCBot, and Google-Extended.

User-agent: *
Allow: /
Allow: /llms.txt
Allow: /sitemap.xml
Allow: /sitemaps/
Allow: /sitemap.html
Allow: /data/ai-route-manifest.json
Allow: /data/search-index.json
Allow: /pt-br/data/search-index.json
Disallow: /partials/
Disallow: /templates/
Disallow: /memory-bank/
Disallow: /reports/
Disallow: /scripts/
Disallow: /src/
Disallow: /docs/
Disallow: /path/
Disallow: /node_modules/
Disallow: /data/build-report.json
Disallow: /data/formspree-map.json
Disallow: /pt-br/data/build-report.json
Disallow: /pt-br/data/formspree-map.json

Sitemap: ${absoluteUrl(SITEMAP_INDEX_ROUTE)}
`;
}

export async function resolveLastmodByFile(root, filePaths) {
  const normalizedRoot = path.resolve(root);
  const absolutePaths = [...new Set(filePaths.map((filePath) => path.resolve(filePath)))];
  const relativePaths = absolutePaths.map((filePath) => path.relative(normalizedRoot, filePath).split(path.sep).join("/"));
  const gitLastmods = await gitLastmodMap(normalizedRoot, relativePaths);
  const lastmodByFile = new Map();

  await Promise.all(
    absolutePaths.map(async (filePath, index) => {
      const relativePath = relativePaths[index];
      const gitLastmod = gitLastmods.get(relativePath);

      if (gitLastmod) {
        lastmodByFile.set(filePath, gitLastmod);
        return;
      }

      try {
        const stats = await fs.stat(filePath);
        const fallbackLastmod = normalizeLastmod(stats.mtime);
        if (fallbackLastmod) {
          lastmodByFile.set(filePath, fallbackLastmod);
        }
      } catch {
        // Ignore missing files; sitemap generation only uses discovered routes.
      }
    })
  );

  return lastmodByFile;
}

export function buildSitemapArtifacts(routeEntries) {
  const indexedEntries = routeEntries
    .filter((entry) => !entry.noindex)
    .map((entry) => ({
      ...entry,
      lastmod: normalizeLastmod(entry.lastmod)
    }))
    .sort(compareRouteEntries);
  const routeGroups = buildRouteGroups(indexedEntries);
  const sections = [...new Set(indexedEntries.map((entry) => sitemapGroupForRoute(entry.route)))].sort((a, b) => {
    const rankCompare = sectionRank(a) - sectionRank(b);
    return rankCompare !== 0 ? rankCompare : a.localeCompare(b);
  });

  const childSitemaps = sections.map((section) => {
    const entries = indexedEntries.filter((entry) => sitemapGroupForRoute(entry.route) === section);
    const route = childSitemapRoute(section);

    return {
      section,
      label: humanSectionLabel(section),
      route,
      path: `${SITEMAP_DIRECTORY}/sitemap-${section}.xml`,
      loc: absoluteUrl(route),
      lastmod: latestLastmod(entries),
      entryCount: entries.length,
      content: buildUrlSitemap(entries, routeGroups)
    };
  });

  const files = [
    { path: "sitemap.xml", content: buildSitemapIndex(childSitemaps) },
    { path: "sitemap.xsl", content: buildSitemapStylesheet() },
    { path: "robots.txt", content: buildRobots() },
    ...childSitemaps.map((sitemap) => ({ path: sitemap.path, content: sitemap.content }))
  ];

  return {
    files,
    indexedEntries,
    childSitemaps
  };
}

export function buildSitemap(routeEntries) {
  return buildSitemapArtifacts(routeEntries).files.find((file) => file.path === "sitemap.xml")?.content || "";
}
