import crypto from "crypto";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles, extractPageData } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_ROOT = path.join(ROOT, "docs", "client-facing-text-inventory-en");
const PAGE_OUTPUT_DIR = path.join(OUTPUT_ROOT, "pages");
const TOP_INDEX_PATH = path.join(ROOT, "docs", "client-facing-text-inventory-en.md");
const OLD_SINGLE_FILE_PATH = path.join(ROOT, "docs", "client-facing-text-inventory.md");
const PREAMBLE_FILE = "000-inventory-preamble.md";
const RUNTIME_FILE = "999-shared-english-runtime-generated-text.md";
const PARTIAL_DIR = path.join(ROOT, "partials", "en");
const RUNTIME_JS_DIR = path.join(ROOT, "js");
const MAINTAINED_CSS_FILES = [
  path.join(ROOT, "css", "site.css"),
  path.join(ROOT, "css", "bootstrap-lite.css"),
  path.join(ROOT, "new-file.css")
];
const STANDALONE_HTML_FILES = [
  { route: "/404.html", filePath: path.join(ROOT, "404.html") },
  { route: "/sitemap.html", filePath: path.join(ROOT, "sitemap.html") }
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

function markdownText(value = "") {
  return normalizeSpace(value).replace(/\|/g, "\\|");
}

function isPortugueseInventoryText(value = "") {
  const clean = normalizeSpace(value);
  if (!clean) return false;
  const folded = clean
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return /\b(?:policia|imigracao|ministerio|relacoes|justica|seguranca|assuntos|pagina|paginas|servicos|juridico|voce|nao|visto|residencia|advogada|formulario|obrigado|obrigada|comecar|mudanca)\b/.test(folded) ||
    /\b(?:mapa politico do brasil|portal consular|receita federal|diario oficial|governo federal|gov\.br)\b/.test(folded);
}

function isEnglishInventoryText(value = "") {
  return !isPortugueseInventoryText(value);
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

function visibleTextBlocks(html) {
  const blocky = stripNonVisibleBlocks(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|h[1-6]|div|section|article|header|footer|summary|button|a|label|strong|span|figcaption|td|th)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return normalizeTextList([...blocky.split(/\n+/), ...extractAttributeText(html)]).filter(isEnglishInventoryText);
}

function extractHeadings(html) {
  const headings = [];
  for (const match of html.matchAll(HEADING_RE)) {
    const text = stripTags(match[2]);
    if (text && isEnglishInventoryText(text)) headings.push({ level: Number(match[1]), text });
  }
  return headings;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readRuntimeConfig(html) {
  const match = html.match(/window\.ITB_SITE\s*=\s*({[\s\S]*?});\s*(?:<\/script>|$)/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

async function loadPartials() {
  const partials = new Map();
  const entries = await fs.readdir(PARTIAL_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const key = entry.name.replace(/\.html$/i, "");
    partials.set(key, await fs.readFile(path.join(PARTIAL_DIR, entry.name), "utf8"));
  }
  return partials;
}

function buildBreadcrumbs(config) {
  const items = config?.shell?.breadcrumbs || [];
  if (!items.length) return "";
  const list = items
    .map((item) => {
      const label = escapeHtml(item.label || "");
      if (!label) return "";
      if (item.current) return `<li><span>${label}</span></li>`;
      return `<li><a href="${escapeHtml(item.href || "#")}">${label}</a></li>`;
    })
    .filter(Boolean)
    .join("");
  return `<!-- Section: Breadcrumb Navigation --><nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${list}</ol></nav>`;
}

function sectionLabelsFromHtml(html) {
  const labels = [];
  for (const section of extractSections(html, { bodyOnly: true })) {
    if (!/^(?:Body Opening|Utility Bar|Site Navigation|Breadcrumb Navigation|Sidebar Column|Site Footer)$/i.test(section.label)) {
      labels.push(section.label);
    }
  }
  return normalizeTextList(labels).slice(0, 18);
}

function buildPageMap(sourceHtml) {
  const labels = sectionLabelsFromHtml(sourceHtml);
  const links = labels.map((label) => `<a href="#">${escapeHtml(label)}</a>`).join("");
  return `<!-- Section: Page Map --><section class="page-map page-map--compact"><div class="page-map__head"><h2>Quick navigation</h2><p>Go directly to the section that matters most.</p></div><div class="page-map__links">${links}</div></section>`;
}

function buildNextSteps(config) {
  const nextStep = config?.shell?.nextStep || {};
  const actions = (nextStep.actions || [])
    .map((action) => `<a class="${escapeHtml(action.className || "btn")}" href="${escapeHtml(action.href || "#")}">${escapeHtml(action.label || "")}</a>`)
    .join("");
  return `<!-- Section: Next Steps --><section class="sidebar-card sidebar-card--action"><h2>Next steps</h2><p>${escapeHtml(nextStep.lead || "Immigration consultation")}</p><div class="sidebar-actions">${actions}</div><p class="sidebar-note">${escapeHtml(nextStep.note || "Your pathway to Brazil.")}</p></section>`;
}

function buildSidebar(config, sourceHtml) {
  const note = config?.shell?.sidebar?.brand?.note || "";
  return `<!-- Section: Sidebar Column --><aside class="sidebar-column">${buildPageMap(sourceHtml)}<!-- Section: Sidebar Brand --><section class="sidebar-card sidebar-card--brand"><div class="sidebar-brand"><img src="/assets/logo/logo.png" alt="Immigrate to Brazil circular logo" /><div class="sidebar-brand__copy"><strong>Immigrate to Brazil</strong><span>Supporting immigrants. Promoting Brazil.</span></div></div><p class="sidebar-note">${escapeHtml(note)}</p></section>${buildNextSteps(config)}</aside>`;
}

function buildOfficialResources(config) {
  const resources = config?.shell?.officialResources || [];
  if (!resources.length) return "";
  const cards = resources
    .map((item) => `<article><h3><a href="${escapeHtml(item.href || "#")}">${escapeHtml(item.title || "")}</a></h3><p>${escapeHtml(item.description || "")}</p></article>`)
    .join("");
  return `<!-- Section: Official Resources --><section id="official-resources" class="official-resources"><div class="section-head"><h2>Official resources</h2><p>Official sources that help place this topic in its public legal and administrative context.</p></div><div class="resource-grid">${cards}</div></section>`;
}

function buildRelatedLinks(config) {
  const links = config?.shell?.relatedLinks || [];
  if (!links.length) return "";
  const cards = links
    .map((item) => {
      const img = item.image_src
        ? `<img src="${escapeHtml(item.image_src)}" alt="${escapeHtml(item.image_alt || "")}" />`
        : "";
      return `<article>${img}<h3><a href="${escapeHtml(item.href || "#")}">${escapeHtml(item.title || "")}</a></h3><p>${escapeHtml(item.description || "")}</p></article>`;
    })
    .join("");
  return `<!-- Section: Related Links --><section class="related-block"><div class="section-head"><h2>Related pages</h2></div><div class="related-grid">${cards}</div></section>`;
}

function buildDynamicPartial(name, config, sourceHtml) {
  if (name === "breadcrumbs") return buildBreadcrumbs(config);
  if (name === "sidebar-shell") return buildSidebar(config, sourceHtml);
  if (name === "next-steps") return buildNextSteps(config);
  if (name === "official-resources") return buildOfficialResources(config);
  if (name === "related-links") return buildRelatedLinks(config);
  return null;
}

function hydratePartials(html, partials, config) {
  let hydrated = html;
  for (let index = 0; index < 10; index += 1) {
    let changed = false;
    hydrated = hydrated.replace(/<div\b[^>]*\bdata-partial=(["'])([^"']+)\1[^>]*>\s*<\/div>/gi, (match, _quote, name) => {
      const dynamic = buildDynamicPartial(name, config, hydrated);
      const replacement = dynamic ?? partials.get(name);
      if (replacement === undefined) return match;
      changed = true;
      return replacement;
    });
    if (!changed) break;
  }
  return hydrated;
}

function extractSections(html, { bodyOnly = true } = {}) {
  const source = bodyOnly ? extractBodyHtml(html) : html;
  const matches = [...source.matchAll(SECTION_COMMENT_RE)];
  const sections = [];
  function pushSection(label, content) {
    const text = visibleTextBlocks(content);
    const headings = extractHeadings(content);
    if (!text.length && !headings.length) return;
    sections.push({ label: cleanSectionLabel(label), headings, text });
  }
  if (!matches.length) {
    pushSection("Page Body", source);
    return sections;
  }
  pushSection("Body Opening", source.slice(0, matches[0].index || 0));
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index || source.length : source.length;
    pushSection(match[1], source.slice(start, end));
  }
  return sections;
}

function pageDisplayName(pageData, route) {
  return pageData.title || pageData.browserTitle?.split("|")[0]?.trim() || route;
}

async function discoverEnglishHtmlFiles() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: false });
  const byRoute = new Map(routeFiles.map((entry) => [entry.route, entry]));
  for (const entry of STANDALONE_HTML_FILES) {
    if (existsSync(entry.filePath) && !byRoute.has(entry.route)) byRoute.set(entry.route, entry);
  }
  return [...byRoute.values()].sort((left, right) => left.route.localeCompare(right.route));
}

async function buildPageEntries(partials) {
  const files = await discoverEnglishHtmlFiles();
  const pages = [];
  for (const entry of files) {
    const rawHtml = await fs.readFile(entry.filePath, "utf8");
    const config = readRuntimeConfig(rawHtml);
    const html = hydratePartials(rawHtml, partials, config);
    const pageData = extractPageData(entry.route, rawHtml);
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

function looksClientFacingEnglish(value = "") {
  const clean = normalizeSpace(value);
  if (!clean || clean.length > 260) return false;
  if (!/[A-Za-z]/.test(clean)) return false;
  if (/^(?:https?:|mailto:|tel:|\/|\.\/|#|\?|data:|blob:)/i.test(clean)) return false;
  if (/^(?:[.#[]|data-|aria-|itb-|btn-|is-|has-|js-|css\/|assets\/)/i.test(clean)) return false;
  if (/^(?:click|submit|change|keydown|resize|scroll|load|DOMContentLoaded|true|false|null)$/i.test(clean)) return false;
  if (/^[a-z0-9_-]+$/.test(clean) && clean === clean.toLowerCase()) return false;
  if (/[À-ÿ]/.test(clean) || isPortugueseInventoryText(clean)) return false;
  return /\s/.test(clean) || /^[A-Z0-9][A-Za-z0-9&'().,+/-]*$/.test(clean) || /[.!?]$/.test(clean);
}

function quotedStrings(source) {
  const values = [];
  const stringRe = /(["'`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/g;
  for (const match of source.matchAll(stringRe)) values.push(cleanJsString(match[2]));
  return values;
}

function extractBalancedObject(source, openIndex) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, index + 1);
    }
  }
  return "";
}

function extractEnglishRuntimeStrings(source) {
  const strings = [];
  const cleanSource = stripJsComments(source);
  for (const match of cleanSource.matchAll(/\ben\s*:\s*(["'`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/g)) {
    strings.push(cleanJsString(match[2]));
  }
  for (const match of cleanSource.matchAll(/\bisPt\s*\?[\s\S]{0,220}?:\s*(["'`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/g)) {
    strings.push(cleanJsString(match[2]));
  }
  for (const match of cleanSource.matchAll(/\ben\s*:\s*{/g)) {
    const openIndex = cleanSource.indexOf("{", match.index);
    const block = extractBalancedObject(cleanSource, openIndex);
    strings.push(...quotedStrings(block));
  }
  for (const match of cleanSource.matchAll(/\boption\(\s*(["'`])(?:\\[\s\S]|(?!\1)[\s\S])*?\1\s*,\s*(["'`])((?:\\[\s\S]|(?!\2)[\s\S])*?)\2\s*,/g)) {
    strings.push(cleanJsString(match[3]));
  }
  return normalizeTextList(strings.filter(looksClientFacingEnglish));
}

async function buildRuntimeTextEntries() {
  const entries = await fs.readdir(RUNTIME_JS_DIR, { withFileTypes: true });
  const runtime = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const filePath = path.join(RUNTIME_JS_DIR, entry.name);
    const strings = extractEnglishRuntimeStrings(await fs.readFile(filePath, "utf8"));
    if (!strings.length) continue;
    runtime.push({ file: path.relative(ROOT, filePath), text: strings });
  }
  return runtime.sort((left, right) => left.file.localeCompare(right.file));
}

async function buildCssGeneratedContentEntries() {
  const entries = [];
  const contentRe = /\bcontent\s*:\s*(["'])([\s\S]*?)\1/gi;
  for (const filePath of MAINTAINED_CSS_FILES) {
    if (!existsSync(filePath)) continue;
    const source = await fs.readFile(filePath, "utf8");
    const values = normalizeTextList([...source.matchAll(contentRe)].map((match) => decodeHtml(match[2]))).filter(
      looksClientFacingEnglish
    );
    if (!values.length) continue;
    entries.push({ file: path.relative(ROOT, filePath), text: values });
  }
  return entries;
}

function pushTextList(lines, values) {
  for (const value of values) lines.push(`- ${markdownText(value)}`);
}

function pushHeadings(lines, headings) {
  if (!headings.length) return;
  lines.push("", "### Headings");
  for (const heading of headings) lines.push(`- H${heading.level}: ${markdownText(heading.text)}`);
}

function pushSections(lines, sections) {
  for (const section of sections) {
    lines.push("", `### ${markdownText(section.label)}`);
    for (const heading of section.headings) lines.push(`- H${heading.level}: ${markdownText(heading.text)}`);
    pushTextList(lines, section.text);
  }
}

function slugForRoute(route, fallback = "page") {
  if (route === "/") return "home";
  return (
    route
      .replace(/^\/|\/$/g, "")
      .replace(/\/index\.html$/i, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || fallback
  );
}

function buildPageMarkdown(page) {
  const lines = [`## ${markdownText(page.title)}`, "", `Route: \`${page.route}\``, `File: \`${page.relativePath}\``];
  lines.push("", "### Page Metadata");
  if (page.browserTitle) lines.push(`- Browser title: ${markdownText(page.browserTitle)}`);
  if (page.description) lines.push(`- Meta description: ${markdownText(page.description)}`);
  pushHeadings(lines, page.headings);
  if (page.sections.length) pushSections(lines, page.sections);
  else lines.push("", "- No readable client-facing text detected.");
  return `${lines.join("\n")}\n`;
}

function buildRuntimeMarkdown(runtimeText, cssGeneratedContent) {
  const lines = ["## Shared English Runtime-Generated Text"];
  for (const entry of runtimeText) {
    lines.push("", `### ${entry.file}`);
    pushTextList(lines, entry.text);
  }
  if (cssGeneratedContent.length) {
    lines.push("", "### CSS Generated-Content Text");
    for (const entry of cssGeneratedContent) {
      lines.push("", `#### ${entry.file}`);
      pushTextList(lines, entry.text);
    }
  }
  return `${lines.join("\n")}\n`;
}

function buildPreamble({ pages, runtimeText, cssGeneratedContent }) {
  return `# English Client-Facing Website Text Inventory

Generated from English public HTML routes, English shared partials, page-local visible runtime data, maintained JavaScript strings that can render in English, and maintained CSS generated-content strings.
Portuguese routes, Portuguese partials, and Portuguese translation content are intentionally excluded.

- English page files included: ${pages.length}
- Runtime JavaScript files with English client-facing strings: ${runtimeText.length}
- CSS files with generated English content strings: ${cssGeneratedContent.length}

## Page Inventory
`;
}

function buildReadme({ pageFiles, hash }) {
  const lines = [
    "# English Client-Facing Website Text Inventory",
    "",
    "This inventory is generated as smaller page-based Markdown files so editors can open the content reliably.",
    "",
    "- Source: English website HTML, English partials, English runtime text, and English generated-content strings",
    `- Page files: ${pageFiles.length}`,
    `- Split verification SHA-256: \`${hash}\``,
    "",
    "## Supporting Files",
    "",
    `- [Inventory preamble](${PREAMBLE_FILE})`,
    `- [Shared English runtime-generated text](${RUNTIME_FILE})`,
    "",
    "## Page Files",
    "",
    "| # | Route | Page | File |",
    "| --- | --- | --- | --- |"
  ];
  for (const page of pageFiles) {
    lines.push(
      `| ${page.number} | \`${markdownText(page.route)}\` | ${markdownText(page.title)} | [${page.fileName}](pages/${page.fileName}) |`
    );
  }
  return `${lines.join("\n")}\n`;
}

function buildTopIndex({ pageFiles, hash }) {
  return `# English Client-Facing Website Text Inventory

The English inventory is split into smaller Markdown files so VS Code can open the content reliably.

Start here: [docs/client-facing-text-inventory-en/README.md](client-facing-text-inventory-en/README.md)

- Page files: ${pageFiles.length}
- Supporting files: ${PREAMBLE_FILE}, ${RUNTIME_FILE}
- Split verification SHA-256: \`${hash}\`
`;
}

async function cleanOutput() {
  await fs.rm(PAGE_OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(PAGE_OUTPUT_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  if (existsSync(OLD_SINGLE_FILE_PATH)) await fs.rm(OLD_SINGLE_FILE_PATH, { force: true });
}

async function main() {
  const partials = await loadPartials();
  const [pages, runtimeText, cssGeneratedContent] = await Promise.all([
    buildPageEntries(partials),
    buildRuntimeTextEntries(),
    buildCssGeneratedContentEntries()
  ]);

  await cleanOutput();

  const pageFiles = [];
  const hash = crypto.createHash("sha256");
  const preamble = buildPreamble({ pages, runtimeText, cssGeneratedContent });
  const runtime = buildRuntimeMarkdown(runtimeText, cssGeneratedContent);
  await fs.writeFile(path.join(OUTPUT_ROOT, PREAMBLE_FILE), preamble, "utf8");
  await fs.writeFile(path.join(OUTPUT_ROOT, RUNTIME_FILE), runtime, "utf8");
  hash.update(preamble);
  hash.update(runtime);

  for (const [index, page] of pages.entries()) {
    const fileName = `${String(index + 1).padStart(3, "0")}-${slugForRoute(page.route)}.md`;
    const content = buildPageMarkdown(page);
    await fs.writeFile(path.join(PAGE_OUTPUT_DIR, fileName), content, "utf8");
    hash.update(content);
    pageFiles.push({ number: index + 1, route: page.route, title: page.title, fileName });
  }

  const digest = hash.digest("hex");
  await fs.writeFile(path.join(OUTPUT_ROOT, "README.md"), buildReadme({ pageFiles, hash: digest }), "utf8");
  await fs.writeFile(TOP_INDEX_PATH, buildTopIndex({ pageFiles, hash: digest }), "utf8");
  console.log(`Generated split English client-facing text inventory (${pageFiles.length} page files).`);
  console.log(`Split verification SHA-256: ${digest}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
