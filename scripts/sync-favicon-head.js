import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ABOUT_PATH = path.join(ROOT, "content", "en", "about", "about.json");
const HTML_EXTENSIONS = new Set([".html"]);
const IGNORED_DIRS = new Set([".git", "node_modules"]);

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/"/g, "&quot;");
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

async function loadFaviconBlock() {
  const about = JSON.parse(await fs.readFile(ABOUT_PATH, "utf8"));
  return `<!-- Section: Favicons And Manifest -->\n${renderFaviconLinks(about.assets.favicons)}`;
}

async function discoverHtmlFiles(directory, files = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await discoverHtmlFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && HTML_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function syncFaviconSection(html, block) {
  const stylesheetsMarker = "<!-- Section: Stylesheets -->";
  const faviconMarker = "<!-- Section: Favicons And Manifest -->";

  if (html.includes(faviconMarker)) {
    return html.replace(
      /<!-- Section: Favicons And Manifest -->[\s\S]*?(?=\n<!-- Section: Stylesheets -->)/,
      block
    );
  }

  if (html.includes(stylesheetsMarker)) {
    return html.replace(stylesheetsMarker, `${block}\n\n${stylesheetsMarker}`);
  }

  return html;
}

async function main() {
  const block = await loadFaviconBlock();
  const htmlFiles = await discoverHtmlFiles(ROOT);
  let updatedCount = 0;

  for (const filePath of htmlFiles) {
    const current = await fs.readFile(filePath, "utf8");
    const next = syncFaviconSection(current, block);
    if (next === current) continue;
    await fs.writeFile(filePath, next, "utf8");
    updatedCount += 1;
  }

  console.log(`Synced favicon links in ${updatedCount} HTML files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
