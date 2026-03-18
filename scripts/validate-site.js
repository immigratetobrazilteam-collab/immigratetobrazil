import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { FORBIDDEN_PHRASES } from "../content/config.js";
import { PAGES } from "../content/pages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).length : 0;
}

function outputPath(route) {
  if (route === "/") return path.join(ROOT, "index.html");
  return path.join(ROOT, route.replace(/^\/|\/$/g, ""), "index.html");
}

async function readFileSafe(filePath) {
  return fs.readFile(filePath, "utf8");
}

function extractTag(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1].trim() : "";
}

function extractLinks(html) {
  return [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

async function main() {
  const failures = [];
  const titleMap = new Map();
  const descriptionMap = new Map();
  const heroMap = new Map();
  const faqMap = new Map();

  for (const page of PAGES) {
    const filePath = outputPath(page.route);
    if (!existsSync(filePath)) {
      failures.push(`Missing route file: ${page.route}`);
      continue;
    }

    const html = await readFileSafe(filePath);
    const title = extractTag(html, /<title>([^<]+)<\/title>/i);
    const description = extractTag(html, /<meta name="description" content="([^"]+)"/i);
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const heroImage = extractTag(html, /--hero-image:url\('([^']+)'\)/i);
    const faqQuestions = [...html.matchAll(/data-faq-question="true"[\s\S]*?<button[^>]*>([\s\S]*?)<\/button>/gi)].map((match) =>
      stripHtml(match[1])
    );
    const links = extractLinks(html);

    if (!title) failures.push(`Missing <title>: ${page.route}`);
    if (!description) failures.push(`Missing meta description: ${page.route}`);
    if (h1Count !== 1) failures.push(`Expected exactly one H1 on ${page.route}, found ${h1Count}`);
    if (!heroImage) failures.push(`Missing hero image reference: ${page.route}`);
    if (!html.includes("application/ld+json")) failures.push(`Missing JSON-LD schema: ${page.route}`);
    if (!html.includes('data-official-resources="true"') && !page.utility) failures.push(`Missing official resources block: ${page.route}`);
    if (!html.includes('data-related-links="true"') && !page.utility) failures.push(`Missing related links block: ${page.route}`);
    if (!page.utility && !html.includes('data-faq="true"')) failures.push(`Missing FAQ block: ${page.route}`);
    if (page.noindex && !html.includes('name="robots" content="noindex,follow"')) failures.push(`Missing noindex on ${page.route}`);

    if (titleMap.has(title)) failures.push(`Duplicate title: ${title}`);
    if (descriptionMap.has(description)) failures.push(`Duplicate description: ${description}`);
    titleMap.set(title, page.route);
    descriptionMap.set(description, page.route);

    if (heroImage) {
      const heroPath = path.join(ROOT, heroImage.replace(/^\//, ""));
      if (!existsSync(heroPath)) failures.push(`Missing hero image asset: ${heroImage} for ${page.route}`);
      if (heroMap.has(heroImage)) failures.push(`Duplicate hero image asset: ${heroImage}`);
      heroMap.set(heroImage, page.route);
    }

    for (const question of faqQuestions) {
      if (faqMap.has(question)) failures.push(`Duplicate FAQ question: "${question}"`);
      faqMap.set(question, page.route);
    }

    const articleMatch = html.match(/<article class="content-column">([\s\S]*?)<\/article>\s*<aside class="sidebar-column">/i);
    const countTarget = articleMatch ? articleMatch[1] : html.match(/<main[\s\S]*?<\/main>/i)?.[0];
    if (countTarget && !page.utility && page.sectionStyle !== "search") {
      const words = wordCount(countTarget);
      if (words < 2000 || words > 3000) {
        failures.push(`Word count out of range on ${page.route}: ${words}`);
      }
    }

    for (const link of links) {
      if (!link.startsWith("/")) continue;
      if (link.startsWith("/assets/") || link.startsWith("/css/") || link.startsWith("/js/") || link.startsWith("/data/")) {
        const assetPath = path.join(ROOT, link.replace(/^\//, ""));
        if (!existsSync(assetPath)) failures.push(`Broken asset link ${link} on ${page.route}`);
        continue;
      }
      if (/\.(xml|txt|json|webmanifest)$/i.test(link)) {
        const filePath = path.join(ROOT, link.replace(/^\//, ""));
        if (!existsSync(filePath)) {
          failures.push(`Broken internal file link ${link} on ${page.route}`);
        }
        continue;
      }
      const candidate = link === "/"
        ? path.join(ROOT, "index.html")
        : path.join(ROOT, link.replace(/^\/|\/$/g, ""), "index.html");
      const isHtmlFile = link.endsWith(".html") && existsSync(path.join(ROOT, link.replace(/^\//, "")));
      if (!existsSync(candidate) && !isHtmlFile) {
        failures.push(`Broken internal link ${link} on ${page.route}`);
      }
    }

    for (const phrase of FORBIDDEN_PHRASES) {
      if (!html.includes(phrase)) continue;
      const allowedMonique =
        phrase === "Monique Fernandes" &&
        (page.route === "/about/lawyer/" || page.route === "/about/testimonials/");
      const allowedTestimonialPhrase =
        page.route === "/about/testimonials/" && phrase !== "Calen" + "dly";
      if (!allowedMonique && !allowedTestimonialPhrase) {
        failures.push(`Forbidden phrase "${phrase}" found on ${page.route}`);
      }
    }
  }

  const root404 = path.join(ROOT, "404.html");
  if (!existsSync(root404)) failures.push("Missing root 404.html");
  const robots = path.join(ROOT, "robots.txt");
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!existsSync(robots)) failures.push("Missing robots.txt");
  if (!existsSync(sitemap)) failures.push("Missing sitemap.xml");
  if (!existsSync(path.join(ROOT, "_headers"))) failures.push("Missing _headers");
  if (!existsSync(path.join(ROOT, "data", "formspree-map.json"))) failures.push("Missing data/formspree-map.json");
  if (!existsSync(path.join(ROOT, "docs", "formspree-map.md"))) failures.push("Missing docs/formspree-map.md");
  if (!existsSync(path.join(ROOT, "data", "search-index.json"))) failures.push("Missing data/search-index.json");

  if (failures.length) {
    console.error("Validation failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Validation passed for ${PAGES.length} routes.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
