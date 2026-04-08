import fs from "fs/promises";
import path from "path";

const DEFAULT_IGNORED_DIRS = new Set([
  ".git",
  ".cache",
  ".codacy",
  ".github",
  "assets",
  "content",
  "css",
  "data",
  "docs",
  "js",
  "memory-bank",
  "node_modules",
  "reports",
  "scripts",
  "templates"
]);

function sortByRoute(a, b) {
  return a.route.localeCompare(b.route);
}

function shouldIgnoreDir(name, options = {}) {
  const ignoredDirs = options.ignoredDirs || DEFAULT_IGNORED_DIRS;
  if (ignoredDirs.has(name)) return true;
  if (name.startsWith(".venv") || name.startsWith("venv")) return true;
  if (!options.includePt && name === "pt-br") return true;
  return false;
}

async function walkForRouteFiles(root, currentDir, files, options = {}) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (shouldIgnoreDir(entry.name, options)) continue;
      await walkForRouteFiles(root, fullPath, files, options);
      continue;
    }

    if (!entry.isFile() || entry.name !== "index.html") continue;
    const route = routeFromFile(root, fullPath);
    if (route) files.push({ route, filePath: fullPath });
  }
}

export async function discoverRouteFiles(root, options = {}) {
  const files = [];
  await walkForRouteFiles(root, root, files, options);
  return files.sort(sortByRoute);
}

export function routeFromFile(root, filePath) {
  const normalizedRoot = path.resolve(root);
  const normalizedFile = path.resolve(filePath);
  if (normalizedFile === path.join(normalizedRoot, "index.html")) return "/";
  if (!normalizedFile.endsWith(`${path.sep}index.html`)) return null;

  const relativeDir = path.relative(normalizedRoot, path.dirname(normalizedFile));
  if (!relativeDir) return "/";
  return `/${relativeDir.split(path.sep).join("/")}/`;
}

export function outputPathForRoute(root, route) {
  if (route === "/") return path.join(root, "index.html");
  return path.join(root, route.replace(/^\/|\/$/g, ""), "index.html");
}

export function stripHtml(value = "") {
  return decodeHtml(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function wordCount(value = "") {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).length : 0;
}

export function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSingle(html, pattern, group = 1) {
  const match = html.match(pattern);
  return match ? decodeHtml(match[group].trim()) : "";
}

export function extractAll(html, pattern, group = 1) {
  return [...html.matchAll(pattern)].map((match) => decodeHtml(stripHtml(match[group]))).filter(Boolean);
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function deriveFamily(html, route) {
  const bodyClass = extractSingle(html, /<body[^>]*class=(["'])([\s\S]*?)\1/i, 2);
  const familyMatch = bodyClass.match(/\bfamily-([a-z0-9-]+)/i);
  if (familyMatch) return familyMatch[1];
  if (route === "/") return "foundation";
  return route.split("/").filter(Boolean)[0] || "site";
}

export function isNoindex(html) {
  return /<meta\b(?=[^>]*\bname=(["'])robots\1)(?=[^>]*\bcontent=(["'])[\s\S]*?noindex[\s\S]*?\2)[^>]*>/i.test(html);
}

export function extractMetaContent(html, name) {
  return extractSingle(
    html,
    new RegExp(
      `<meta\\b(?=[^>]*\\bname=(["'])${escapeRegExp(name)}\\1)(?=[^>]*\\bcontent=(["'])([\\s\\S]*?)\\2)[^>]*>`,
      "i"
    ),
    3
  );
}

export function extractTopics(html) {
  const fromSections = extractAll(
    html,
    /<section\b[^>]*class="[^"]*\btopic-section\b[^"]*"[\s\S]*?<h2>([\s\S]*?)<\/h2>/gi
  );
  const fromDataTopic = extractAll(html, /data-topic="([^"]+)"/gi);
  return unique([...fromSections, ...fromDataTopic]);
}

export function extractFaqQuestions(html) {
  return unique(
    extractAll(html, /data-faq-question=["']true["'][\s\S]*?<button[^>]*>([\s\S]*?)<\/button>/gi)
  );
}

export function extractLocalRefs(html) {
  return unique(extractAll(html, /\b(?:href|src)=["']([^"']+)["']/gi));
}

export function extractFormActions(html) {
  return unique(extractAll(html, /<form\b[^>]*action="([^"]+)"/gi));
}

export function extractPageData(route, html) {
  const browserTitle = extractSingle(html, /<title>([\s\S]*?)<\/title>/i);
  const summary = extractMetaContent(html, "description");
  const h1 = extractSingle(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const topics = extractTopics(html);
  const faq = extractFaqQuestions(html);
  const family = deriveFamily(html, route);
  const title = h1 || browserTitle.split("|")[0].trim();
  const keywords = unique([browserTitle, title, h1, ...topics, ...faq, family]).join(" ");
  return {
    route,
    title,
    browserTitle,
    family,
    summary,
    topics,
    faq,
    keywords,
    noindex: isNoindex(html)
  };
}

export function normalizeUrlForLookup(url, route) {
  if (!url) return null;
  const clean = url.split("#")[0].split("?")[0].trim();
  if (!clean) return null;
  if (
    clean.startsWith("mailto:") ||
    clean.startsWith("tel:") ||
    clean.startsWith("javascript:") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(clean)) {
    try {
      const parsed = new URL(clean);
      const hostname = parsed.hostname.toLowerCase();
      const isSameSite =
        hostname === "immigratetobrazil.com" ||
        hostname === "www.immigratetobrazil.com" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1";
      if (!isSameSite) return null;
      return parsed.pathname || "/";
    } catch {
      return null;
    }
  }

  if (clean.startsWith("/")) return clean;

  const routeDir = route === "/" ? "/" : route;
  const resolved = path.posix.normalize(path.posix.join(routeDir, clean));
  return resolved.startsWith("/") ? resolved : `/${resolved}`;
}

export function resolveLocalPath(root, lookupPath) {
  if (!lookupPath) return null;
  if (lookupPath === "/") return path.join(root, "index.html");

  const fileLike = /\.[a-z0-9]+$/i.test(lookupPath);
  const relative = lookupPath.replace(/^\//, "");
  if (fileLike) return path.join(root, relative);
  return path.join(root, relative.replace(/\/$/, ""), "index.html");
}

export function buildFormMapMarkdown(formMap) {
  const lines = [
    "# Formspree Map",
    "",
    "| Route | Title | Endpoint |",
    "| --- | --- | --- |"
  ];

  for (const item of formMap) {
    lines.push(`| ${item.route} | ${item.title} | ${item.endpoint} |`);
  }

  return `${lines.join("\n")}\n`;
}
