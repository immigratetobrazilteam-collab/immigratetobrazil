import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  discoverRouteFiles,
  extractFormActions,
  extractLocalRefs,
  extractPageData,
  normalizeUrlForLookup,
  resolveLocalPath
} from "./static-site-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
const PAGE_SCHEMA_TYPES = new Set([
  "WebPage",
  "CollectionPage",
  "AboutPage",
  "ContactPage",
  "SearchResultsPage",
  "Article",
  "BlogPosting",
  "NewsArticle"
]);
const ROOT_ORGANIZATION_URL = "https://immigratetobrazil.com";
const SHARED_IDS = {
  organization: `${ROOT_ORGANIZATION_URL}#organization`,
  website: `${ROOT_ORGANIZATION_URL}#website`,
  contactPoint: `${ROOT_ORGANIZATION_URL}#contact-primary`,
  person: `${ROOT_ORGANIZATION_URL}#person-monique-fernandes`
};
const ALLOWED_NOINDEX_ROUTES = new Set([
  "/brazil/search/",
  "/client-feedback/",
  "/legal/404/",
  "/legal/search/",
  "/pt-br/brazil/search/",
  "/pt-br/client-feedback/",
  "/pt-br/legal/404/",
  "/pt-br/legal/search/"
]);
const WHATSAPP_ANCHOR_RE = /<a\b[^>]*\bhref=["'][^"']*(?:api\.whatsapp\.com|wa\.me)[^"']*["'][^>]*>/gi;

function localeForRoute(route) {
  return route.startsWith("/pt-br/") ? "pt-br" : "en";
}

function localeDataPath(locale, fileName) {
  return locale === "pt-br" ? path.join(ROOT, "pt-br", "data", fileName) : path.join(ROOT, "data", fileName);
}

function compareStringSets(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every((value, index) => value === expected[index]);
}

function compareFormEntries(actual, expected) {
  if (actual.length !== expected.length) return false;
  return actual.every(
    (entry, index) =>
      entry.route === expected[index].route &&
      entry.title === expected[index].title &&
      entry.endpoint === expected[index].endpoint
  );
}

async function readJson(filePath, failures) {
  if (!existsSync(filePath)) {
    failures.push(`Missing file: ${path.relative(ROOT, filePath)}`);
    return null;
  }

  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, filePath)}: ${error.message}`);
    return null;
  }
}

function extractSchemaItems(route, html, failures) {
  const match = html.match(JSON_LD_RE);
  if (!match) {
    failures.push(`Missing JSON-LD schema: ${route}`);
    return [];
  }

  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed["@graph"])) return parsed["@graph"];
    return parsed ? [parsed] : [];
  } catch (error) {
    failures.push(`Invalid JSON-LD on ${route}: ${error.message}`);
    return [];
  }
}

function hasType(item, type) {
  if (!item || !item["@type"]) return false;
  if (Array.isArray(item["@type"])) return item["@type"].includes(type);
  return item["@type"] === type;
}

function isProfileRoute(route) {
  return route === "/about/profile/" || route === "/pt-br/about/profile/";
}

function whatsappAnchors(html) {
  return [...html.matchAll(WHATSAPP_ANCHOR_RE)].map((match) => match[0]);
}

async function main() {
  const routeFiles = await discoverRouteFiles(ROOT, { includePt: true });
  const failures = [];
  const titleMap = new Map();
  const descriptionMap = new Map();
  const expectedByLocale = {
    en: { searchRoutes: [], formMap: [] },
    "pt-br": { searchRoutes: [], formMap: [] }
  };
  let legal404Html = "";
  let ptLegal404Html = "";

  for (const page of routeFiles) {
    const html = await fs.readFile(page.filePath, "utf8");
    const pageData = extractPageData(page.route, html);
    const description = pageData.summary;
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const mainCount = (html.match(/<main\b/gi) || []).length;
    const locale = localeForRoute(page.route);

    if (!pageData.browserTitle) failures.push(`Missing <title>: ${page.route}`);
    if (!description) failures.push(`Missing meta description: ${page.route}`);
    if (h1Count !== 1) failures.push(`Expected exactly one H1 on ${page.route}, found ${h1Count}`);
    if (mainCount !== 1) failures.push(`Expected exactly one <main> on ${page.route}, found ${mainCount}`);
    if (pageData.noindex && !ALLOWED_NOINDEX_ROUTES.has(page.route)) {
      failures.push(`Unexpected noindex route: ${page.route}`);
    }

    const schemaItems = extractSchemaItems(page.route, html, failures);
    const pageSchemas = schemaItems.filter((item) => [...PAGE_SCHEMA_TYPES].some((type) => hasType(item, type)));
    const organization = schemaItems.find((item) => hasType(item, "Organization"));
    const website = schemaItems.find((item) => hasType(item, "WebSite"));
    const contactPoint = schemaItems.find((item) => hasType(item, "ContactPoint"));
    const faqSchema = schemaItems.find((item) => hasType(item, "FAQPage"));
    const heroImage = schemaItems.find((item) => hasType(item, "ImageObject"));
    const person = schemaItems.find((item) => hasType(item, "Person"));
    const hasVisibleFaq = html.includes('class="faq-block"');

    if (!organization || organization["@id"] !== SHARED_IDS.organization) {
      failures.push(`Missing shared Organization schema on ${page.route}`);
    }
    if (!website || website["@id"] !== SHARED_IDS.website) {
      failures.push(`Missing shared WebSite schema on ${page.route}`);
    }
    if (!contactPoint || contactPoint["@id"] !== SHARED_IDS.contactPoint) {
      failures.push(`Missing shared ContactPoint schema on ${page.route}`);
    }
    if (pageSchemas.length !== 1) {
      failures.push(`Expected exactly one primary page schema on ${page.route}, found ${pageSchemas.length}`);
    }
    if (hasVisibleFaq && !faqSchema) {
      failures.push(`Visible FAQ block is missing FAQPage schema on ${page.route}`);
    }
    if (!hasVisibleFaq && faqSchema) {
      failures.push(`FAQPage schema does not match visible content on ${page.route}`);
    }

    if (isProfileRoute(page.route)) {
      const pageSchema = pageSchemas[0];
      if (!hasType(pageSchema, "ProfilePage")) failures.push(`Profile page schema is missing ProfilePage on ${page.route}`);
      if (pageSchema?.mainEntity?.["@id"] !== SHARED_IDS.person) {
        failures.push(`Profile page main entity is incorrect on ${page.route}`);
      }
      if (person?.identifier?.propertyID !== "OAB/PR" || person?.identifier?.value !== "108.616") {
        failures.push(`Profile page is missing the OAB/PR professional identifier on ${page.route}`);
      }
      if (!Array.isArray(person?.sameAs) || !person.sameAs.includes("https://monique-fernandes.com/")) {
        failures.push(`Profile page is missing the verified professional sameAs URL on ${page.route}`);
      }
    }

    if (heroImage && heroImage.inLanguage !== (locale === "pt-br" ? "pt-BR" : "en")) {
      failures.push(`Hero image language is incorrect on ${page.route}`);
    }

    if (locale === "pt-br") {
      const pageSchema = pageSchemas[0];
      if (organization?.url !== ROOT_ORGANIZATION_URL) {
        failures.push(`PT Organization.url must stay on the root domain: ${page.route}`);
      }
      if (website?.url !== ROOT_ORGANIZATION_URL) {
        failures.push(`PT WebSite.url must stay on the root domain: ${page.route}`);
      }
      if (pageSchema?.inLanguage !== "pt-BR") {
        failures.push(`PT page schema language is incorrect on ${page.route}`);
      }
      if (pageSchema?.["@id"] && !pageSchema["@id"].includes("/pt-br/")) {
        failures.push(`PT page schema id must be localized on ${page.route}`);
      }
      if (heroImage?.["@id"] && !heroImage["@id"].includes("/pt-br/")) {
        failures.push(`PT hero image id must be localized on ${page.route}`);
      }
    }

    if (titleMap.has(pageData.browserTitle)) failures.push(`Duplicate title: ${pageData.browserTitle}`);
    if (descriptionMap.has(description)) failures.push(`Duplicate description: ${description}`);
    titleMap.set(pageData.browserTitle, page.route);
    descriptionMap.set(description, page.route);

    if (!pageData.noindex) {
      expectedByLocale[locale].searchRoutes.push(page.route);
    }

    const formActions = extractFormActions(html).filter((action) => /formspree\.io\/f\//i.test(action));
    if (!pageData.noindex && formActions.length === 0) {
      failures.push(`Indexable page is missing a Formspree contact form: ${page.route}`);
    }
    for (const endpoint of formActions) {
      expectedByLocale[locale].formMap.push({
        route: page.route,
        title: pageData.title,
        endpoint
      });
    }

    for (const anchor of whatsappAnchors(html)) {
      if (!/\bdata-whatsapp-click\b/i.test(anchor)) {
        failures.push(`WhatsApp link is missing tracking marker on ${page.route}`);
      }
    }

    const localRefs = extractLocalRefs(html);
    for (const ref of localRefs) {
      const lookupPath = normalizeUrlForLookup(ref, page.route);
      if (!lookupPath) continue;
      const localPath = resolveLocalPath(ROOT, lookupPath);
      if (localPath && !existsSync(localPath)) {
        failures.push(`Broken local reference ${ref} on ${page.route}`);
      }
    }

    if (page.route === "/legal/404/") {
      legal404Html = html;
    }
    if (page.route === "/pt-br/legal/404/") {
      ptLegal404Html = html;
    }
  }

  const formMapMarkdownPath = path.join(ROOT, "docs", "formspree-map.md");
  const root404Path = path.join(ROOT, "404.html");
  const pt404Path = path.join(ROOT, "pt-br", "404.html");

  for (const locale of Object.keys(expectedByLocale)) {
    const searchIndex = await readJson(localeDataPath(locale, "search-index.json"), failures);
    const formMap = await readJson(localeDataPath(locale, "formspree-map.json"), failures);
    await readJson(localeDataPath(locale, "build-report.json"), failures);

    if (searchIndex) {
      const actualSearchRoutes = [...new Set(searchIndex.map((item) => item.route))].sort();
      const expected = [...new Set(expectedByLocale[locale].searchRoutes)].sort();
      if (!compareStringSets(actualSearchRoutes, expected)) {
        failures.push(`Search index is out of sync for ${locale}. Run \`npm run sync:data\`.`);
      }
    }

    if (formMap) {
      const actualFormEntries = [...formMap]
        .map((item) => ({
          route: item.route,
          title: item.title,
          endpoint: item.endpoint
        }))
        .sort((a, b) => `${a.route}|${a.endpoint}`.localeCompare(`${b.route}|${b.endpoint}`));
      const expected = [...expectedByLocale[locale].formMap].sort((a, b) => `${a.route}|${a.endpoint}`.localeCompare(`${b.route}|${b.endpoint}`));
      if (!compareFormEntries(actualFormEntries, expected)) {
        failures.push(`Formspree map is out of sync for ${locale}. Run \`npm run sync:data\`.`);
      }
    }
  }

  if (!existsSync(formMapMarkdownPath)) {
    failures.push("Missing docs/formspree-map.md");
  }

  if (!existsSync(root404Path)) {
    failures.push("Missing root 404.html");
  } else if (legal404Html) {
    const root404Html = await fs.readFile(root404Path, "utf8");
    if (root404Html !== legal404Html) {
      failures.push("Root 404.html is out of sync with /legal/404/. Run `npm run sync:data`.");
    }
  }

  if (ptLegal404Html) {
    if (!existsSync(pt404Path)) {
      failures.push("Missing pt-br/404.html");
    } else {
      const pt404Html = await fs.readFile(pt404Path, "utf8");
      if (pt404Html !== ptLegal404Html) {
        failures.push("pt-br/404.html is out of sync with /pt-br/legal/404/. Run `npm run sync:data`.");
      }
    }
  }

  if (failures.length) {
    console.error("Validation failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Validation passed for ${routeFiles.length} route HTML files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
