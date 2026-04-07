import path from "path";
import { fileURLToPath } from "url";

import { normalizeRouteHtmlFiles } from "./html-normalize-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function main() {
  const result = await normalizeRouteHtmlFiles(ROOT);
  console.log(`Normalized ${result.changed} HTML routes out of ${result.routeFiles.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
