import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { discoverRouteFiles } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

function extractBodyHtml(html) {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT);
  const textMap = {};

  for (const { route, filePath } of routeFiles) {
    const html = await fs.readFile(filePath, "utf8");
    const textContent = stripHtmlTags(extractBodyHtml(html));
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
