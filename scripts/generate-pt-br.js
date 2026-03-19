import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { discoverRouteFiles } from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PT_ROOT = path.join(ROOT, "pt-br");

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function ptRoute(route) {
  return route === "/" ? "/pt-br/" : `/pt-br${route}`;
}

function translateShell(html) {
  return html
    .replace(/<html lang="en">/i, '<html lang="pt-BR">')
    .replace(/data-language-toggle="pt-BR" disabled aria-disabled="true"/g, 'data-language-toggle="pt-BR"')
    .replace(
      /(<body class="[^"]*">)/i,
      `$1<div class="upgrade-banner"><div class="container upgrade-inner"><strong>Rascunho em português</strong><span>Esta árvore foi clonada automaticamente do conteúdo em inglês e ainda precisa de revisão editorial em português brasileiro.</span></div></div>`
    );
}

async function main() {
  if (!existsSync(path.join(ROOT, "index.html"))) {
    throw new Error("English HTML files are required before generating /pt-br/.");
  }

  const routeFiles = await discoverRouteFiles(ROOT);
  await fs.mkdir(PT_ROOT, { recursive: true });

  for (const page of routeFiles) {
    const src = await fs.readFile(page.filePath, "utf8");
    const targetPath =
      page.route === "/"
        ? path.join(PT_ROOT, "index.html")
        : path.join(PT_ROOT, page.route.replace(/^\/|\/$/g, ""), "index.html");
    await writeFile(targetPath, translateShell(src));
  }

  const searchIndexPath = path.join(ROOT, "data", "search-index.json");
  if (existsSync(searchIndexPath)) {
    const searchIndex = JSON.parse(await fs.readFile(searchIndexPath, "utf8"));
    const ptIndex = searchIndex.map((item) => ({ ...item, route: ptRoute(item.route) }));
    await writeFile(path.join(PT_ROOT, "data", "search-index.json"), JSON.stringify(ptIndex, null, 2));
  }

  const root404Path = path.join(ROOT, "404.html");
  if (existsSync(root404Path)) {
    const root404 = await fs.readFile(root404Path, "utf8");
    await writeFile(path.join(PT_ROOT, "404.html"), translateShell(root404));
  }

  console.log("Generated /pt-br/ mirror tree from static HTML.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
