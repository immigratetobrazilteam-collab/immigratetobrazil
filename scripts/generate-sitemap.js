import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles, extractPageData } from "./static-site-utils.js";
import { buildSitemapArtifacts, resolveLastmodByFile } from "./sitemap-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const lastmodByFile = await resolveLastmodByFile(
    ROOT,
    routeFiles.map((page) => page.filePath)
  );
  const routeEntries = [];

  for (const page of routeFiles) {
    const html = await fs.readFile(page.filePath, "utf8");
    const pageData = extractPageData(page.route, html);
    routeEntries.push({
      route: page.route,
      noindex: pageData.noindex,
      lastmod: lastmodByFile.get(path.resolve(page.filePath)) || ""
    });
  }

  const artifacts = buildSitemapArtifacts(routeEntries);
  for (const file of artifacts.files) {
    const outputPath = path.join(ROOT, file.path);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, file.content, "utf8");
  }

  console.log(
    `Generated sitemap index, ${artifacts.childSitemaps.length} child sitemaps, stylesheet, and robots.txt from ${routeFiles.length} HTML routes.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
