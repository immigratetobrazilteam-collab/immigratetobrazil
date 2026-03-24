import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "section-image-manifest.json");

let cachedManifest = null;
let manifestLoadAttempted = false;

function escapeAttribute(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadManifest() {
  if (manifestLoadAttempted) return cachedManifest;
  manifestLoadAttempted = true;
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    cachedManifest = JSON.parse(raw);
  } catch {
    cachedManifest = null;
  }
  return cachedManifest;
}

function mergeClassAttribute(attributes, className) {
  if (!className) return attributes;
  if (/\bclass="/i.test(attributes)) {
    return attributes.replace(/\bclass="([^"]*)"/i, (_match, existing) => {
      const parts = new Set(
        `${existing} ${className}`
          .split(/\s+/)
          .map((item) => item.trim())
          .filter(Boolean)
      );
      return `class="${escapeAttribute([...parts].join(" "))}"`;
    });
  }
  return `${attributes} class="${escapeAttribute(className)}"`;
}

function mergeStyleAttribute(attributes, styleValue) {
  if (!styleValue) return attributes;
  if (/\bstyle="/i.test(attributes)) {
    return attributes.replace(/\bstyle="([^"]*)"/i, (_match, existing) => {
      const separator = existing.trim().endsWith(";") || !existing.trim() ? "" : ";";
      return `style="${escapeAttribute(`${existing}${separator}${styleValue}`)}"`;
    });
  }
  return `${attributes} style="${escapeAttribute(styleValue)}"`;
}

function setAttribute(attributes, name, value) {
  const pattern = new RegExp(`\\b${escapeRegex(name)}="[^"]*"`, "i");
  if (pattern.test(attributes)) {
    return attributes.replace(pattern, `${name}="${escapeAttribute(value)}"`);
  }
  return `${attributes} ${name}="${escapeAttribute(value)}"`;
}

function selectedOptionForSection(sectionData) {
  const selectedKey = sectionData?.selected_option;
  const options = sectionData?.options || [];
  return (
    options.find((option) => option.option_key === selectedKey && option.asset_path) ||
    options.find((option) => option.asset_path) ||
    null
  );
}

function isVerifiedBrazilOption(option) {
  return Boolean(option?.asset_path && option?.source_validation?.is_brazil_verified === true);
}

function decorateSectionOpenTag(bodyHtml, sectionId, sectionData) {
  const selected = selectedOptionForSection(sectionData);
  if (!selected || !isVerifiedBrazilOption(selected)) return bodyHtml;

  const overlayCss = sectionData?.overlay?.css || "";
  const overlayName = sectionData?.overlay?.name || "";
  const inlineStyle = `--section-image:url('${selected.asset_path}');--section-overlay:${overlayCss};`;
  const pattern = new RegExp(`<section\\b([^>]*\\bid=(["'])${escapeRegex(sectionId)}\\2[^>]*)>`, "i");

  return bodyHtml.replace(pattern, (_match, attributes) => {
    let next = attributes;
    next = mergeClassAttribute(next, "section-has-media");
    next = mergeStyleAttribute(next, inlineStyle);
    next = setAttribute(next, "data-section-image", "true");
    next = setAttribute(next, "data-section-overlay", overlayName);
    next = setAttribute(next, "data-section-image-alt", selected.alt || "");
    next = setAttribute(next, "data-section-image-description", selected.description || "");
    return `<section${next}>`;
  });
}

export async function decorateBodyHtmlWithSectionImages(route, bodyHtml) {
  const manifest = await loadManifest();
  const routeData = manifest?.routes?.[route];
  if (!routeData) return bodyHtml;

  let nextHtml = bodyHtml;
  for (const [sectionId, sectionData] of Object.entries(routeData.sections || {})) {
    nextHtml = decorateSectionOpenTag(nextHtml, sectionId, sectionData);
  }
  return nextHtml;
}
