import { promises as fs } from "node:fs";
import path from "node:path";

import { SERVICES_ALL_FAMILIES } from "./services-all.catalog.mjs";

const rootDir = process.cwd();
const imageRoot = path.join(rootDir, "assets/images/services/all");
const legacyImageRoot = path.join(rootDir, "assets/images/pages/services/all");
const iconRoot = path.join(rootDir, "assets/icons/services/all");
const imageManifestPath = path.join(imageRoot, "manifest.json");
const iconManifestPath = path.join(iconRoot, "manifest.json");
const pagePaths = [
  path.join(rootDir, "services/all/index.html"),
  path.join(rootDir, "pt-br/services/all/index.html")
];

const SOURCE_WEIGHTS = {
  stocksnap: 60,
  woc_tech: 72,
  wikimedia: 48,
  flickr: 40,
  smithsonian_portrait_gallery: 28
};

const LICENSE_WEIGHTS = {
  cc0: 24,
  pdm: 22,
  by: 15,
  "by-sa": 12
};

const BANNED_TITLE_PATTERN =
  /\b(adolf|hitler|lego|toilet|surveillance|ribbon|medal|beaten|postcard|vaccine|cover|number|unknown|graffiti|social media|field meet|plant pulling|sign at|stamp|wall-painting|battle-field|protectorate|cross into goathaunt|boss not sure|athletic club|dharma|streetlight)\b/i;

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildConsultationHref(consultation) {
  const params = new URLSearchParams();
  params.set("service_interest", consultation.serviceInterest);
  if (consultation.topicInterest) params.set("topic_interest", consultation.topicInterest);
  return `/start-consultation/?${params.toString()}`;
}

function fileExtensionFromUrl(rawUrl) {
  try {
    const pathname = new URL(rawUrl).pathname.toLowerCase();
    if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return ".jpg";
    if (pathname.endsWith(".png")) return ".png";
    if (pathname.endsWith(".webp")) return ".webp";
  } catch {
    return "";
  }
  return "";
}

function fileExtensionFromContentType(contentType) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  return "";
}

function scoreResult(result, queryTokens) {
  const title = String(result.title || "");
  if (!result?.url || !/^https?:\/\//.test(result.url)) return -Infinity;
  if (BANNED_TITLE_PATTERN.test(title)) return -Infinity;
  if (String(result.url).toLowerCase().endsWith(".svg")) return -Infinity;
  if (Number(result.width || 0) < 520 || Number(result.height || 0) < 360) return -Infinity;
  if (result.mature) return -Infinity;

  const sourceScore = SOURCE_WEIGHTS[result.source] ?? 8;
  const licenseScore = LICENSE_WEIGHTS[result.license] ?? 0;
  const landscapeScore = Number(result.width || 0) >= Number(result.height || 0) ? 12 : 4;
  const sizeScore = Math.min(Number(result.width || 0), 1800) / 120;
  const titleLower = title.toLowerCase();
  const tokenHits = queryTokens.reduce((count, token) => count + (titleLower.includes(token) ? 1 : 0), 0);
  return sourceScore + licenseScore + landscapeScore + sizeScore + tokenHits * 6;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "ImmigrateToBrazilServicesDirectoryBot/1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.json();
}

async function findOpenverseImage(queries, preferredSource, usedUrls) {
  for (const query of queries) {
    const sourceAttempts = preferredSource ? [preferredSource, ""] : [""];

    for (const source of sourceAttempts) {
      for (const page of [1, 2, 3]) {
        const url = new URL("https://api.openverse.org/v1/images/");
        url.searchParams.set("q", query);
        url.searchParams.set("page_size", "20");
        url.searchParams.set("page", String(page));
        url.searchParams.set("license", "cc0,pdm,by,by-sa");
        if (source) url.searchParams.set("source", source);

        const payload = await fetchJson(url);
        const tokens = query
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((token) => token.length >= 4);

        const ranked = (payload.results || [])
          .map((result) => ({ result, score: scoreResult(result, tokens) }))
          .filter((entry) => Number.isFinite(entry.score) && !usedUrls.has(entry.result.url))
          .sort((left, right) => right.score - left.score);

        if (ranked.length > 0) {
          return { query, ...ranked[0].result };
        }
      }
    }
  }

  throw new Error(`No suitable Openverse image found for queries: ${queries.join(" | ")}`);
}

async function downloadBinary(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "ImmigrateToBrazilServicesDirectoryBot/1.0"
    }
  });
  if (!response.ok) {
    const error = new Error(`Download failed for ${url}: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get("content-type") || ""
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function createCleanDirectories() {
  await fs.rm(imageRoot, { recursive: true, force: true });
  await fs.rm(legacyImageRoot, { recursive: true, force: true });
  await fs.rm(iconRoot, { recursive: true, force: true });
  await ensureDir(imageRoot);
  await ensureDir(iconRoot);
}

async function downloadLucideIcon(iconName, slug) {
  const iconUrl = `https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${iconName}.svg`;
  const { buffer } = await downloadBinary(iconUrl);
  const relativePath = `/assets/icons/services/all/${slug}.svg`;
  const absolutePath = path.join(rootDir, relativePath.replace(/^\//, ""));
  await ensureDir(path.dirname(absolutePath));
  await fs.writeFile(absolutePath, buffer);
  return {
    relativePath,
    iconName,
    sourceUrl: iconUrl,
    title: titleCase(iconName.replace(/-/g, " "))
  };
}

async function downloadServiceImage(family, service, usedUrls) {
  const slug = slugify(service.label);
  const imageResult = await findOpenverseImage(
    [...(service.imageQueries || []), ...(family.fallbackQueries || []), service.label],
    service.preferredSource || family.preferredSource || "",
    usedUrls
  );
  let imageDownload;
  let downloadedFrom = imageResult.url;
  try {
    imageDownload = await downloadBinary(imageResult.url);
  } catch (error) {
    if (!imageResult.thumbnail) throw error;
    imageDownload = await downloadBinary(imageResult.thumbnail);
    downloadedFrom = imageResult.thumbnail;
  }
  const extension =
    fileExtensionFromContentType(imageDownload.contentType) ||
    fileExtensionFromUrl(downloadedFrom) ||
    fileExtensionFromUrl(imageResult.url) ||
    ".jpg";
  const relativePath = `/assets/images/services/all/${family.key}/${slug}${extension}`;
  const absolutePath = path.join(rootDir, relativePath.replace(/^\//, ""));
  await ensureDir(path.dirname(absolutePath));
  await fs.writeFile(absolutePath, imageDownload.buffer);
  usedUrls.add(imageResult.url);

  return {
    relativePath,
    width: imageResult.width || null,
    height: imageResult.height || null,
    sourceUrl: imageResult.url,
    downloadedFrom,
    sourcePage: imageResult.foreign_landing_url || imageResult.detail_url || "",
    sourceTitle: imageResult.title || "",
    creator: imageResult.creator || "",
    license: imageResult.license || "",
    licenseUrl: imageResult.license_url || "",
    attribution: imageResult.attribution || "",
    query: imageResult.query || ""
  };
}

function buildPageData(assetMap) {
  const familyEntries = SERVICES_ALL_FAMILIES.map((family) => {
    const services = family.services.map((service) => {
      const slug = slugify(service.label);
      const asset = assetMap.get(`${family.key}:${slug}`);

      return {
        label: service.label,
        slug,
        href: service.href,
        description: service.description,
        consultationHref: buildConsultationHref(service.consultation),
        consultationSubject: `Consultation request | ${service.label} | All Services`,
        imageSrc: asset.image.relativePath,
        imageAlt: service.imageAlt,
        imageWidth: asset.image.width,
        imageHeight: asset.image.height,
        iconSrc: asset.icon.relativePath
      };
    });

    return [
      family.key,
      {
        eyebrow: family.eyebrow,
        services
      }
    ];
  });

  return {
    exploreLabel: "Explore service",
    consultLabel: "Book consultation",
    families: Object.fromEntries(familyEntries)
  };
}

async function writeManifestFiles(imageEntries, iconEntries) {
  await fs.writeFile(
    imageManifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        description: "Open-license image manifest for the All Services directory cards.",
        entries: imageEntries
      },
      null,
      2
    )}\n`
  );

  await fs.writeFile(
    iconManifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        description: "Lucide icon manifest for the All Services directory cards.",
        entries: iconEntries
      },
      null,
      2
    )}\n`
  );
}

async function patchPageData(filepath, pageData) {
  const html = await fs.readFile(filepath, "utf8");
  const pattern = /(<script id="services-directory-data" type="application\/json">\n)([\s\S]*?)(\n\s*<\/script>)/;
  const replacement = `$1${JSON.stringify(pageData, null, 2)}$3`;
  const updated = html.replace(pattern, replacement);
  if (updated === html) {
    throw new Error(`Could not replace services directory data block in ${filepath}`);
  }
  await fs.writeFile(filepath, updated);
}

async function main() {
  await createCleanDirectories();

  const imageManifestEntries = [];
  const iconManifestEntries = [];
  const assetMap = new Map();
  const usedImageUrls = new Set();

  for (const family of SERVICES_ALL_FAMILIES) {
    for (const service of family.services) {
      const slug = slugify(service.label);
      const key = `${family.key}:${slug}`;
      const image = await downloadServiceImage(family, service, usedImageUrls);
      const icon = await downloadLucideIcon(service.icon, slug);

      assetMap.set(key, { image, icon });

      imageManifestEntries.push({
        family: family.key,
        service: service.label,
        slug,
        file: image.relativePath,
        alt: service.imageAlt,
        description: `Open-license image for the ${service.label} service card in the Brazil immigration services directory.`,
        sourceTitle: image.sourceTitle,
        creator: image.creator,
        license: image.license,
        licenseUrl: image.licenseUrl,
        sourcePage: image.sourcePage,
        sourceUrl: image.sourceUrl,
        searchQuery: image.query
      });

      iconManifestEntries.push({
        family: family.key,
        service: service.label,
        slug,
        file: icon.relativePath,
        iconName: icon.iconName,
        sourceUrl: icon.sourceUrl
      });
    }
  }

  const pageData = buildPageData(assetMap);

  await Promise.all(pagePaths.map((filepath) => patchPageData(filepath, pageData)));
  await writeManifestFiles(imageManifestEntries, iconManifestEntries);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
