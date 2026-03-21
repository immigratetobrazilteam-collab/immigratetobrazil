import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { discoverContentRouteDirs, contentDirToRoute } from "./content-source-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, ".." );

function stripHtmlTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSnippets(text) {
  const chunks = text
    .split(/(?<=\. )|(?<=\n)/g)
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(chunks)];
}

async function main() {
  const routeDirs = await discoverContentRouteDirs();
  const textMap = {};

  for (const routeDir of routeDirs) {
    const route = contentDirToRoute(routeDir);
    const bodyHtml = await fs.readFile(path.join(routeDir, "body.html"), "utf8");
    const textContent = stripHtmlTags(bodyHtml);
    textMap[route] = splitSnippets(textContent);
  }

  const outPath = path.join(ROOT, "data", "page-text-map.json");
  await fs.writeFile(outPath, JSON.stringify(textMap, null, 2), "utf8");
  console.log(`Generated page text map at ${outPath} (${Object.keys(textMap).length} routes).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});