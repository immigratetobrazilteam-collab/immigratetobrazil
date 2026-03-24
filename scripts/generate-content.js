import { existsSync } from "fs";

import {
  ABOUT_PATH,
  ROUTES_ROOT,
  discoverContentRouteDirs,
  generateEnglishPage,
  loadAboutContent,
  loadContentPage
} from "./content-source-utils.js";
import { buildSiteCatalog } from "./schema-utils.js";

async function main() {
  if (!existsSync(ABOUT_PATH) || !existsSync(ROUTES_ROOT)) {
    throw new Error("Missing content sources. Run `npm run migrate:content` first.");
  }

  const about = await loadAboutContent();
  const routeDirs = await discoverContentRouteDirs();
  const contentPages = [];
  let changedCount = 0;

  for (const routeDir of routeDirs) {
    contentPages.push(await loadContentPage(routeDir));
  }

  const siteCatalog = buildSiteCatalog(contentPages);

  for (const { route, page, bodyHtml } of contentPages) {
    const { changed } = await generateEnglishPage(route, about, page, bodyHtml, siteCatalog);
    if (changed) changedCount += 1;
  }

  console.log(`Generated ${routeDirs.length} English HTML pages from content sources (${changedCount} updated).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
