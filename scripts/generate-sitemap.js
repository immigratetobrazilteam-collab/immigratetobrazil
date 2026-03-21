import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles, extractPageData } from "./static-site-utils.js";
import { buildRobots, buildSitemap } from "./sitemap-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const routeEntries = [];

  for (const page of routeFiles) {
    const html = await fs.readFile(page.filePath, "utf8");
    const pageData = extractPageData(page.route, html);
    routeEntries.push({ route: page.route, noindex: pageData.noindex });
  }

  await fs.writeFile(path.join(ROOT, "sitemap.xml"), buildSitemap(routeEntries), "utf8");
  await fs.writeFile(path.join(ROOT, "robots.txt"), buildRobots(), "utf8");
  console.log(`Generated sitemap.xml and robots.txt from ${routeFiles.length} HTML routes.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
