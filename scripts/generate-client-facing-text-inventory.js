import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles, extractPageData } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "docs", "client-facing-text-inventory.md");
const PARTIAL_DIRS = [
  { locale: "en", dir: path.join(ROOT, "partials", "en") },
  { locale: "pt-br", dir: path.join(ROOT, "partials", "pt-br") }
];
const STANDALONE_HTML_FILES = [
  { route: "/404.html", filePath: path.join(ROOT, "404.html") },
  { route: "/sitemap.html", filePath: path.join(ROOT, "sitemap.html") }
];
const RUNTIME_JS_DIR = path.join(ROOT, "js");
const MAINTAINED_CSS_FILES = [
  path.join(ROOT, "css", "site.css"),
  path.join(ROOT, "css", "bootstrap-lite.css"),
  path.join(ROOT, "new-file.css")
];
const SECTION_COMMENT_RE = /<!--\s*Section:\s*([\s\S]*?)\s*-->/gi;
const HEADING_RE = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
const ATTRIBUTE_TEXT_NAMES = ["alt", "aria-label", "title", "placeholder"];

function normalizeSpace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
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

function stripTags(value = "") {
  return normalizeSpace(decodeHtml(String(value).replace(/<[^>]*>/g, " ")));
}

function cleanSectionLabel(value = "") {
  return normalizeSpace(decodeHtml(value).replace(/\s*\|[\s\S]*$/, "")) || "Unlabelled Section";
}

function extractBodyHtml(html) {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

function stripNonVisibleBlocks(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template[\s\S]*?<\/template>/gi, " ")
    .replace(/<input\b(?=[^>]*\btype=(["'])hidden\1)[^>]*>/gi, " ")
    .replace(/<input\b(?=[^>]*\bclass=(["'])[^"']*\bform-honeypot\b[^"']*\1)[^>]*>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function isHiddenTag(tag) {
  return (
    /\btype=(["'])hidden\1/i.test(tag) ||
    /\baria-hidden=(["'])true\1/i.test(tag) ||
    /\bhidden(?:\s|=|>)/i.test(tag) ||
    /\bclass=(["'])[^"']*\bform-honeypot\b[^"']*\1/i.test(tag)
  );
}

function attributeValue(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, "i"));
  return match ? normalizeSpace(decodeHtml(match[2])) : "";
}

function extractAttributeText(html) {
  const values = [];
  for (const tag of html.match(/<[^>]+>/g) || []) {
    if (isHiddenTag(tag)) continue;
    for (const name of ATTRIBUTE_TEXT_NAMES) {
      const value = attributeValue(tag, name);
      if (value) values.push(value);
    }
    if (/\btype=(["'])(?:submit|button)\1/i.test(tag)) {
      const value = attributeValue(tag, "value");
      if (value) values.push(value);
    }
  }
  return values;
}

function visibleTextBlocks(html) {
  const blocky = stripNonVisibleBlocks(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|h[1-6]|div|section|article|header|footer|summary|button|a|label|strong|span|figcaption|td|th)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return normalizeTextList([...blocky.split(/\n+/), ...extractAttributeText(html)]);
}

function normalizeTextList(values = []) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const clean = normalizeSpace(stripTags(value));
    if (!clean) continue;
    if (/^\W+$/.test(clean) && clean.length > 3) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }

  return result;
}

function extractHeadings(html) {
  const headings = [];
  for (const match of html.matchAll(HEADING_RE)) {
    const text = stripTags(match[2]);
    if (text) headings.push({ level: Number(match[1]), text });
  }
  return headings;
}

function extractSections(html, { bodyOnly = true } = {}) {
  const source = bodyOnly ? extractBodyHtml(html) : html;
  const matches = [...source.matchAll(SECTION_COMMENT_RE)];
  const sections = [];

  function pushSection(label, content) {
    const text = visibleTextBlocks(content);
    const headings = extractHeadings(content);
    if (!text.length && !headings.length) return;
    sections.push({
      label: cleanSectionLabel(label),
      headings,
      text
    });
  }

  if (!matches.length) {
    pushSection("Page Body", source);
    return sections;
  }

  const opening = source.slice(0, matches[0].index || 0);
  pushSection("Body Opening", opening);

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index || source.length : source.length;
    pushSection(match[1], source.slice(start, end));
  }

  return sections;
}

function markdownText(value = "") {
  return normalizeSpace(value).replace(/\|/g, "\\|");
}

function pageDisplayName(pageData, route) {
  return pageData.title || pageData.browserTitle?.split("|")[0]?.trim() || route;
}

async function discoverClientHtmlFiles() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const byRoute = new Map(routeFiles.map((entry) => [entry.route, entry]));

  for (const entry of STANDALONE_HTML_FILES) {
    if (existsSync(entry.filePath) && !byRoute.has(entry.route)) byRoute.set(entry.route, entry);
  }

  return [...byRoute.values()].sort((left, right) => left.route.localeCompare(right.route));
}

async function buildPageEntries() {
  const files = await discoverClientHtmlFiles();
  const pages = [];

  for (const entry of files) {
    const html = await fs.readFile(entry.filePath, "utf8");
    const pageData = extractPageData(entry.route, html);
    pages.push({
      ...entry,
      relativePath: path.relative(ROOT, entry.filePath),
      title: pageDisplayName(pageData, entry.route),
      browserTitle: pageData.browserTitle,
      description: pageData.summary,
      headings: extractHeadings(extractBodyHtml(html)),
      sections: extractSections(html)
    });
  }

  return pages;
}

async function buildPartialEntries() {
  const partials = [];

  for (const { locale, dir } of PARTIAL_DIRS) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
      const filePath = path.join(dir, entry.name);
      const html = await fs.readFile(filePath, "utf8");
      partials.push({
        locale,
        name: entry.name,
        relativePath: path.relative(ROOT, filePath),
        sections: extractSections(html, { bodyOnly: false })
      });
    }
  }

  return partials.sort((left, right) => `${left.locale}/${left.name}`.localeCompare(`${right.locale}/${right.name}`));
}

function stripJsComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1 ");
}

function cleanJsString(value = "") {
  return normalizeSpace(
    stripTags(
      value
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\t/g, " ")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/`/g, "")
        .replace(/\$\{[\s\S]*?\}/g, " ")
    )
  );
}

function looksClientFacing(value = "") {
  const clean = normalizeSpace(value);
  if (!clean || clean.length > 260) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(clean)) return false;
  if (/^(?:https?:|mailto:|tel:|\/|\.\/|#|\?|data:|blob:)/i.test(clean)) return false;
  if (/^(?:[.#[]|data-|aria-|itb-|btn-|is-|has-|js-|css\/|assets\/)/i.test(clean)) return false;
  if (/^(?:click|submit|change|keydown|resize|scroll|load|DOMContentLoaded|true|false|null)$/i.test(clean)) return false;
  if (/^[a-z0-9_-]+$/.test(clean) && clean === clean.toLowerCase()) return false;
  if (/^(?:currentColor|viewBox|path|svg|rgba|linear-gradient|translate|scale|none|block|inline|flex|grid)$/i.test(clean)) {
    return false;
  }
  if (clean.includes("${")) return false;
  return /\s/.test(clean) || /^[A-ZÀ-Ý0-9][A-Za-zÀ-ÿ0-9&'’().,+/-]*$/.test(clean) || /[.!?]$/.test(clean);
}

function extractRuntimeStrings(source) {
  const strings = [];
  const cleanSource = stripJsComments(source);
  const stringRe = /(["'`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/g;

  for (const match of cleanSource.matchAll(stringRe)) {
    const value = cleanJsString(match[2]);
    if (looksClientFacing(value)) strings.push(value);
  }

  return normalizeTextList(strings);
}

async function buildRuntimeTextEntries() {
  const entries = await fs.readdir(RUNTIME_JS_DIR, { withFileTypes: true });
  const runtime = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const filePath = path.join(RUNTIME_JS_DIR, entry.name);
    const strings = extractRuntimeStrings(await fs.readFile(filePath, "utf8"));
    if (!strings.length) continue;
    runtime.push({
      file: path.relative(ROOT, filePath),
      text: strings
    });
  }

  return runtime.sort((left, right) => left.file.localeCompare(right.file));
}

async function buildCssGeneratedContentEntries() {
  const entries = [];
  const contentRe = /\bcontent\s*:\s*(["'])([\s\S]*?)\1/gi;

  for (const filePath of MAINTAINED_CSS_FILES) {
    if (!existsSync(filePath)) continue;
    const source = await fs.readFile(filePath, "utf8");
    const values = normalizeTextList([...source.matchAll(contentRe)].map((match) => decodeHtml(match[2])));
    if (!values.length) continue;
    entries.push({
      file: path.relative(ROOT, filePath),
      text: values
    });
  }

  return entries;
}

function pushTextList(lines, values) {
  for (const value of values) {
    lines.push(`- ${markdownText(value)}`);
  }
}

function pushHeadings(lines, headings) {
  if (!headings.length) return;
  lines.push("", "Headings:");
  for (const heading of headings) {
    lines.push(`- H${heading.level}: ${markdownText(heading.text)}`);
  }
}

function pushSections(lines, sections) {
  for (const section of sections) {
    lines.push("", `#### ${markdownText(section.label)}`);
    if (section.headings.length) {
      for (const heading of section.headings) {
        lines.push(`- H${heading.level}: ${markdownText(heading.text)}`);
      }
    }
    pushTextList(lines, section.text);
  }
}

function buildMarkdown({ pages, partials, runtimeText, cssGeneratedContent }) {
  const lines = [
    "# Client-Facing Website Text Inventory",
    "",
    "Generated from the public HTML routes, shared partials, maintained runtime JavaScript, and maintained CSS generated-content strings.",
    "HTML page sections are grouped by the hidden `<!-- Section: ... -->` comments in the source.",
    "",
    `- Page HTML files: ${pages.length}`,
    `- Shared partial files: ${partials.length}`,
    `- Runtime JavaScript files with client-facing strings: ${runtimeText.length}`,
    `- CSS files with generated content strings: ${cssGeneratedContent.length}`,
    "",
    "## Shared Client-Facing Sections",
    "",
    "These partials are injected into pages at runtime, so they are listed once here instead of repeated under every route."
  ];

  for (const partial of partials) {
    lines.push("", `### ${partial.locale} / ${partial.name}`, "", `File: \`${partial.relativePath}\``);
    if (partial.sections.length) pushSections(lines, partial.sections);
    else lines.push("", "- No readable client-facing text detected.");
  }

  lines.push("", "## Runtime-Generated Client-Facing Text");
  for (const entry of runtimeText) {
    lines.push("", `### ${entry.file}`);
    pushTextList(lines, entry.text);
  }

  if (cssGeneratedContent.length) {
    lines.push("", "## CSS Generated-Content Text");
    for (const entry of cssGeneratedContent) {
      lines.push("", `### ${entry.file}`);
      pushTextList(lines, entry.text);
    }
  }

  lines.push("", "## Page Inventory");

  for (const page of pages) {
    lines.push("", `### ${markdownText(page.title)} (\`${page.route}\`)`, "", `File: \`${page.relativePath}\``);
    if (page.browserTitle) lines.push(`Browser title: ${markdownText(page.browserTitle)}`);
    if (page.description) lines.push(`Meta description: ${markdownText(page.description)}`);
    pushHeadings(lines, page.headings);
    if (page.sections.length) pushSections(lines, page.sections);
    else lines.push("", "- No readable client-facing text detected.");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const [pages, partials, runtimeText, cssGeneratedContent] = await Promise.all([
    buildPageEntries(),
    buildPartialEntries(),
    buildRuntimeTextEntries(),
    buildCssGeneratedContentEntries()
  ]);

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, buildMarkdown({ pages, partials, runtimeText, cssGeneratedContent }), "utf8");
  console.log(`Generated client-facing text inventory at ${path.relative(ROOT, OUTPUT_PATH)} (${pages.length} pages).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
