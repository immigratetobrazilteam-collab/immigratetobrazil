import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { discoverContentRouteDirs, loadJson, writeFileIfChanged } from "./content-source-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const placeholders = {
  breadcrumbs: '  <div data-partial="breadcrumbs"></div>\n',
  sidebar: '        <div data-partial="sidebar-shell"></div>\n',
  resources: '        <div data-partial="official-resources"></div>\n',
  related: '  <div data-partial="related-links"></div>\n'
};

function stripHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function findEarliest(text, startsAt, patterns) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  let winner = -1;
  for (const pattern of list) {
    const index = text.indexOf(pattern, startsAt);
    if (index !== -1 && (winner === -1 || index < winner)) winner = index;
  }
  return winner;
}

function extract(text, start, end) {
  const s = text.indexOf(start);
  if (s === -1) return null;
  const e = findEarliest(text, s + start.length, end);
  if (e === -1) return null;
  return text.slice(s, e);
}

function replaceSection(text, start, end, replacement) {
  const s = text.indexOf(start);
  if (s === -1) return text;
  const e = findEarliest(text, s + start.length, end);
  if (e === -1) return text;
  return text.slice(0, s) + replacement + text.slice(e);
}

function parseBreadcrumbs(block) {
  if (!block) return [];
  return [...block.matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)].map((match) => {
    const attrs = match[1];
    const body = match[2];
    const link = body.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    return link
      ? { label: stripHtml(link[2]), href: link[1] }
      : { label: stripHtml(body), current: /aria-current="page"/.test(attrs) };
  });
}

function parseSidebar(block) {
  if (!block) return null;
  const brand = block.match(/<section class="sidebar-card sidebar-card--brand">[\s\S]*?<p class="sidebar-note">([\s\S]*?)<\/p>/);
  const action = block.match(
    /<section class="sidebar-card sidebar-card--action">[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<div class="sidebar-actions">([\s\S]*?)<\/div>[\s\S]*?<p class="sidebar-note">([\s\S]*?)<\/p>/
  );
  const actions = [...(action?.[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g) || [])].map((m) => {
    const attrs = m[1];
    const className = attrs.match(/\bclass="([^"]+)"/)?.[1] || "btn btn-secondary btn-sm";
    const href = attrs.match(/\bhref="([^"]+)"/)?.[1] || "#";
    return {
      className,
      href,
      label: stripHtml(m[2]),
      track: /data-cta-click/.test(attrs) ? "cta" : /data-whatsapp-click/.test(attrs) ? "whatsapp" : null
    };
  });

  return {
    brand: {
      note: stripHtml(brand?.[1] || "")
    },
    nextStep: action
      ? {
          lead: stripHtml(action[1]),
          actions,
          note: stripHtml(action[3])
        }
      : { lead: "", actions: [], note: "" }
  };
}

function parseResources(block) {
  if (!block) return [];
  return [...block.matchAll(/<article class="resource-card">[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/article>/g)].map(
    (m) => ({ href: m[1], title: stripHtml(m[2]), description: stripHtml(m[3]) })
  );
}

function parseRelated(block) {
  if (!block) return [];
  return [...block.matchAll(/<a class="related-card" href="([^"]+)">[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/a>/g)].map(
    (m) => ({ href: m[1], title: stripHtml(m[2]), description: stripHtml(m[3]) })
  );
}

async function main() {
  const routeDirs = await discoverContentRouteDirs();
  let updated = 0;

  for (const routeDir of routeDirs) {
    const pagePath = path.join(routeDir, "page.json");
    const bodyPath = path.join(routeDir, "body.html");
    const page = await loadJson(pagePath);
    const bodyHtml = await fs.readFile(bodyPath, "utf8");

    const breadcrumbs = extract(bodyHtml, "<!-- Section: Breadcrumb Navigation -->", "\n<header class=\"hero\"");
    const sidebar = extract(bodyHtml, "<!-- Section: Sidebar Column -->", ["</div>\n<div class=\"container\">", "      </div>\n<div class=\"container\">"]);
    const resources = extract(bodyHtml, "<!-- Section: Official Resources -->", ["<!-- Section: Related Links -->"]);
    const related = extract(bodyHtml, "<!-- Section: Related Links -->", ["<!-- Section: FAQ -->", "<!-- Section: Disclaimer -->"]);

    page.shell = {
      breadcrumbs: parseBreadcrumbs(breadcrumbs),
      sidebar: parseSidebar(sidebar),
      officialResources: parseResources(resources),
      relatedLinks: parseRelated(related)
    };

    let nextBody = bodyHtml;
    nextBody = replaceSection(nextBody, "<!-- Section: Breadcrumb Navigation -->", "\n<header class=\"hero\"", `${placeholders.breadcrumbs}`);
    nextBody = replaceSection(
      nextBody,
      "<!-- Section: Sidebar Column -->",
      ["</div>\n<div class=\"container\">", "      </div>\n<div class=\"container\">"],
      `${placeholders.sidebar}      </div>\n<div class="container">`
    );
    nextBody = replaceSection(nextBody, "<!-- Section: Official Resources -->", ["<!-- Section: Related Links -->"], `${placeholders.resources}`);
    nextBody = replaceSection(
      nextBody,
      "<!-- Section: Related Links -->",
      ["<!-- Section: FAQ -->", "<!-- Section: Disclaimer -->"],
      `${placeholders.related}`
    );

    const pageChanged = await writeFileIfChanged(pagePath, `${JSON.stringify(page, null, 2)}\n`);
    const bodyChanged = await writeFileIfChanged(bodyPath, nextBody);
    if (pageChanged || bodyChanged) updated += 1;
  }

  console.log(`Extracted route shell data for ${updated} content routes.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
