import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { discoverRouteFiles } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CANONICAL_HTML_PATH = path.join(ROOT, "index.html");
const EXTRA_HTML_PATHS = [
  path.join(ROOT, "404.html"),
  path.join(ROOT, "pt-br", "404.html")
];
const FAVICON_SECTION_RE =
  /<!-- Section: Favicons And Manifest -->[\s\S]*?(?=\n<!-- Section: Stylesheets -->)/;

async function loadFaviconBlock() {
  const html = await fs.readFile(CANONICAL_HTML_PATH, "utf8");
  const match = html.match(FAVICON_SECTION_RE);
  if (!match) {
    throw new Error(`Could not find the favicon section in ${CANONICAL_HTML_PATH}.`);
  }
  return match[0].trimEnd();
}

async function listTargetHtmlFiles() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const fileSet = new Set(routeFiles.map((item) => item.filePath));

  for (const filePath of EXTRA_HTML_PATHS) {
    try {
      await fs.access(filePath);
      fileSet.add(filePath);
    } catch {
      // Ignore optional standalone HTML files that are not present.
    }
  }

  return [...fileSet].sort((a, b) => a.localeCompare(b));
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
  const htmlFiles = await listTargetHtmlFiles();
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
