import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

import { PAGES } from "../content/pages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PT_ROOT = path.join(ROOT, "pt-br");

function outputPath(route) {
  if (route === "/") return path.join(ROOT, "index.html");
  return path.join(ROOT, route.replace(/^\/|\/$/g, ""), "index.html");
}

function ptOutputPath(route) {
  if (route === "/") return path.join(PT_ROOT, "index.html");
  return path.join(PT_ROOT, route.replace(/^\/|\/$/g, ""), "index.html");
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function main() {
  if (!existsSync(path.join(ROOT, "index.html"))) {
    throw new Error("Build the English site before generating /pt-br/.");
  }

  await fs.mkdir(PT_ROOT, { recursive: true });

  for (const page of PAGES) {
    const src = await fs.readFile(outputPath(page.route), "utf8");
    const translated = src
      .replace(/<html lang="en">/i, '<html lang="pt-BR">')
      .replace(/data-language-toggle="pt-BR" disabled aria-disabled="true"/g, 'data-language-toggle="pt-BR"')
      .replace(
        /(<body class="[^"]*">)/i,
        `$1<div class="upgrade-banner"><div class="container upgrade-inner"><strong>Rascunho em português</strong><span>Esta árvore foi clonada automaticamente do conteúdo em inglês e ainda precisa de revisão editorial em português brasileiro.</span></div></div>`
      );
    await writeFile(ptOutputPath(page.route), translated);
  }

  const build = spawnSync("node", [path.join("scripts", "build-site.js")], {
    cwd: ROOT,
    env: { ...process.env, PT_PRESENT: "1" },
    stdio: "inherit"
  });
  if (build.status !== 0) {
    throw new Error("English rebuild with PT alternates failed");
  }

  const searchIndex = JSON.parse(await fs.readFile(path.join(ROOT, "data", "search-index.json"), "utf8"));
  const ptIndex = searchIndex.map((item) => ({ ...item, route: `/pt-br${item.route}` }));
  await writeFile(path.join(PT_ROOT, "data", "search-index.json"), JSON.stringify(ptIndex, null, 2));

  console.log("Generated /pt-br/ mirror tree.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
