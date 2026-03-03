#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacyRoot = process.env.LEGACY_SOURCE_ROOT ? path.resolve(root, process.env.LEGACY_SOURCE_ROOT) : root;
const routeIndexPath = path.join(root, 'content', 'generated', 'route-index.json');
const outputDir = path.join(root, 'content', 'cms', 'managed-legacy');
const consultationSourcePath = path.join(legacyRoot, 'consultation', 'index.html');
const targetPrefixes = ['about', 'faq', 'policies', 'services', 'contact', 'home', 'resources-guides-brazil', 'accessibility'];
const fallbackScanRoots = ['blog', 'home', 'es', 'pt'];

function decodeHtmlEntities(input) {
  if (!input) return '';

  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, token) => {
    if (token[0] === '#') {
      const isHex = token[1]?.toLowerCase() === 'x';
      const raw = isHex ? token.slice(2) : token.slice(1);
      const codePoint = Number.parseInt(raw, isHex ? 16 : 10);
      if (Number.isNaN(codePoint)) return match;

      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }

    return named[token] ?? match;
  });
}

function collapseWhitespace(input) {
  return input
    .replace(/[\t\f\r ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function stripTags(input) {
  return collapseWhitespace(
    decodeHtmlEntities(
      input
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<\/(p|li|h1|h2|h3|h4|div|ul|ol|section|summary|details|td|th|tr)>/gi, '\n')
        .replace(/<[^>]+>/g, ' '),
    ),
  );
}

function normalizeLegacyImage(src) {
  if (!src) return undefined;
  if (src.startsWith('/assets/')) return src.replace('/assets/', '/legacy-assets/');
  if (src.startsWith('assets/')) return `/legacy-assets/${src.slice('assets/'.length)}`;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return `/${src}`;
}

function extractByRegex(html, regex, fallback = '') {
  const match = regex.exec(html);
  if (!match) return fallback;
  return stripTags(match[1] || '') || fallback;
}

function trimToSentence(text, maxLength = 160) {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const snippet = text.slice(0, maxLength);
  const sentenceEnd = Math.max(snippet.lastIndexOf('.'), snippet.lastIndexOf('!'), snippet.lastIndexOf('?'));
  if (sentenceEnd > 70) {
    return snippet.slice(0, sentenceEnd + 1).trim();
  }

  const wordEnd = snippet.lastIndexOf(' ');
  if (wordEnd > 50) {
    return `${snippet.slice(0, wordEnd).trim()}...`;
  }

  return `${snippet.trim()}...`;
}

function dedupePreservingOrder(items, limit = Number.POSITIVE_INFINITY) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(item);
    if (out.length >= limit) break;
  }

  return out;
}

function dedupeSequential(items) {
  const out = [];
  let previous = '';
  for (const item of items) {
    const normalized = item.trim().toLowerCase();
    if (!normalized) continue;
    if (normalized === previous) continue;
    out.push(item);
    previous = normalized;
  }
  return out;
}

function extractMainFragment(html) {
  const explicitMain = html.match(/<main[^>]*id=["']main-content["'][^>]*>([\s\S]*?)<\/main>/i);
  if (explicitMain?.[1]) {
    return explicitMain[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--([\s\S]*?)-->/g, '')
      .replace(/<div[^>]*(?:id|data-include|data-partial-role)=["'][^"']*(?:placeholder|partial)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  }

  const mainMatches = Array.from(html.matchAll(/<main[^>]*>([\s\S]*?)<\/main>/gi)).map((match) => match[1] || '');
  const longestMain = mainMatches.sort((a, b) => b.length - a.length)[0];
  if (longestMain) {
    return longestMain
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--([\s\S]*?)-->/g, '')
      .replace(/<div[^>]*(?:id|data-include|data-partial-role)=["'][^"']*(?:placeholder|partial)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  }

  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<div[^>]*(?:id|data-include|data-partial-role)=["'][^"']*(?:placeholder|partial)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
}

function collectTagTexts(fragment, tag) {
  return Array.from(fragment.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')))
    .map((match) => stripTags(match[1] || ''))
    .filter(Boolean);
}

function collectTableRows(fragment) {
  const rows = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(fragment)) !== null) {
    const tableHtml = tableMatch[1] || '';
    const headers = collectTagTexts(tableHtml, 'th').filter(Boolean);
    const rowMatches = Array.from(tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));

    for (const rowMatch of rowMatches) {
      const rowHtml = rowMatch[1] || '';
      const cells = collectTagTexts(rowHtml, 'td').filter(Boolean);
      if (!cells.length) continue;

      if (headers.length === cells.length) {
        rows.push(cells.map((cell, index) => `${headers[index]}: ${cell}`).join(' | '));
      } else {
        rows.push(cells.join(' | '));
      }
    }
  }

  return rows;
}

function collectBlockParagraphs(fragment) {
  const headingTexts = [
    ...collectTagTexts(fragment, 'h3'),
    ...collectTagTexts(fragment, 'h4'),
    ...collectTagTexts(fragment, 'h5'),
    ...collectTagTexts(fragment, 'dt'),
  ];
  const paragraphs = collectTagTexts(fragment, 'p');
  const listItems = collectTagTexts(fragment, 'li');
  const summaries = collectTagTexts(fragment, 'summary');
  const tableRows = collectTableRows(fragment);
  const noteDivs = Array.from(fragment.matchAll(/<div[^>]*class=["'][^"']*(?:tip|note|highlight|compliance|warning)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi))
    .map((match) => stripTags(match[1] || ''))
    .filter(Boolean);

  const details = Array.from(fragment.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi))
    .map((match) => {
      const detailsHtml = match[1] || '';
      const q = stripTags(detailsHtml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || '');
      const a = stripTags(detailsHtml.replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, ''));
      if (q && a) return `${q} ${a}`;
      return q || a;
    })
    .filter(Boolean);

  const merged = dedupeSequential(
    [...headingTexts, ...paragraphs, ...listItems, ...summaries, ...tableRows, ...noteDivs, ...details]
      .map((value) => collapseWhitespace(value))
      .filter((value) => value.length >= 3),
  );

  if (merged.length) return merged;

  const fallback = stripTags(fragment)
    .split('. ')
    .map((line) => line.trim())
    .filter((line) => line.length >= 30)
    .map((line) => (line.endsWith('.') ? line : `${line}.`));

  return fallback;
}

function buildSections(fragment) {
  const headingTagPriority = ['h2', 'h3', 'h4'];
  let headingMatches = [];
  let headingTagUsed = 'h2';

  for (const headingTag of headingTagPriority) {
    const matches = Array.from(fragment.matchAll(new RegExp(`<${headingTag}[^>]*>([\\s\\S]*?)<\\/${headingTag}>`, 'gi')));
    if (matches.length) {
      headingMatches = matches;
      headingTagUsed = headingTag;
      break;
    }
  }

  const sections = [];

  if (headingMatches.length) {
    const firstHeadingIndex = headingMatches[0].index;
    if (typeof firstHeadingIndex === 'number' && firstHeadingIndex > 0) {
      const introBlock = fragment.slice(0, firstHeadingIndex);
      const introParagraphs = collectBlockParagraphs(introBlock);
      if (introParagraphs.length) {
        sections.push({
          title: 'Introduction',
          paragraphs: introParagraphs,
        });
      }
    }

    for (let index = 0; index < headingMatches.length; index += 1) {
      const current = headingMatches[index];
      const next = headingMatches[index + 1];
      const rawTitle = stripTags(current[1] || '');
      if (!rawTitle) continue;

      const start = current.index + current[0].length;
      const end = next ? next.index : fragment.length;
      const block = fragment.slice(start, end);
      const paragraphs = collectBlockParagraphs(block);

      if (!paragraphs.length) continue;

      sections.push({
        title: rawTitle,
        paragraphs,
      });
    }
  }

  if (!sections.length) {
    const paragraphs = collectBlockParagraphs(fragment);
    for (let index = 0; index < paragraphs.length; index += 5) {
      const chunk = paragraphs.slice(index, index + 5);
      if (!chunk.length) continue;
      sections.push({
        title: index === 0 ? 'Overview' : `Guidance ${Math.floor(index / 5) + 1}`,
        paragraphs: chunk,
      });
    }
  }

  const bullets = dedupePreservingOrder(
    collectTagTexts(fragment, 'li')
      .map((item) => collapseWhitespace(item))
      .filter((item) => item.length >= 3),
  );

  return {
    sections,
    bullets,
  };
}

function parseLegacyDocumentFromHtml(html, sourcePath, routeTitle = '', routeDescription = '') {
  const title = extractByRegex(html, /<title[^>]*>([\s\S]*?)<\/title>/i, routeTitle || 'Immigrate to Brazil');
  const metaDescription = extractByRegex(html, /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i, routeDescription);
  const fragment = extractMainFragment(html);

  const heading = extractByRegex(fragment, /<h1[^>]*>([\s\S]*?)<\/h1>/i, title);
  const imageMatch = fragment.match(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/i);
  const heroImage = normalizeLegacyImage(imageMatch?.[1]);
  const heroImageAlt = imageMatch?.[2] ? stripTags(imageMatch[2]) : heading;

  const { sections, bullets } = buildSections(fragment);
  const firstParagraph = sections[0]?.paragraphs?.[0] || '';
  const description = trimToSentence(metaDescription || firstParagraph || routeDescription || heading, 170);

  return {
    sourcePath,
    title,
    description,
    heading,
    heroImage,
    heroImageAlt,
    sections,
    bullets,
  };
}

function normalizeSlug(value) {
  return value
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/');
}

function isTargetSlug(slug) {
  return targetPrefixes.some((prefix) => slug === prefix || slug.startsWith(`${prefix}/`));
}

function buildFaqCanonicalSlug(stateSlug) {
  return `faq/yourfaqsabout${stateSlug.replace(/-/g, '')}answeredbyimmigratetobrazil`;
}

async function ensureDirForFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJson(filePath, value) {
  await ensureDirForFile(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function outputFilePathForSlug(slug) {
  return path.join(outputDir, 'en', `${slug}.json`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkHtmlFiles(baseDir, output = []) {
  if (!(await fileExists(baseDir))) return output;

  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      await walkHtmlFiles(absolute, output);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    output.push(path.relative(legacyRoot, absolute).replace(/\\/g, '/'));
  }

  return output;
}

function slugFromSourcePath(sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/');

  if (normalized.endsWith('/index.html')) {
    return normalized.slice(0, -'/index.html'.length);
  }

  if (normalized.endsWith('.html')) {
    return normalized.slice(0, -'.html'.length);
  }

  return normalized;
}

async function main() {
  const routeIndexRaw = await fs.readFile(routeIndexPath, 'utf8');
  const routeIndex = JSON.parse(routeIndexRaw);
  const enRoutes = routeIndex
    .filter((entry) => entry.locale === 'en')
    .filter((entry) => typeof entry.slug === 'string' && typeof entry.sourcePath === 'string')
    .filter((entry) => isTargetSlug(entry.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const aliases = {};
  const coveredSourcePaths = new Set();
  const pagesBySlug = new Map();
  const importDate = new Date().toISOString().slice(0, 10);
  const stats = {
    about: 0,
    faq: 0,
    policies: 0,
    services: 0,
    consultation: 0,
  };

  for (const entry of enRoutes) {
    const sourcePath = path.join(legacyRoot, entry.sourcePath);
    if (!(await fileExists(sourcePath))) continue;

    const html = await fs.readFile(sourcePath, 'utf8');
    const legacyDocument = parseLegacyDocumentFromHtml(html, entry.sourcePath, entry.title || '', entry.description || '');

    const normalizedInputSlug = normalizeSlug(entry.slug);
    let canonicalSlug = normalizedInputSlug;

    const faqMatch = /^faq\/faq-([a-z0-9-]+)$/u.exec(normalizedInputSlug);
    if (faqMatch) {
      canonicalSlug = buildFaqCanonicalSlug(faqMatch[1]);
      aliases[normalizedInputSlug] = canonicalSlug;
    }

    const aboutStateMatch = /^about\/about-states\/about-([a-z0-9-]+)$/u.exec(normalizedInputSlug);
    if (aboutStateMatch) {
      aliases[`about/about-states/${aboutStateMatch[1]}`] = canonicalSlug;
    }

    if (pagesBySlug.has(canonicalSlug)) continue;

    const page = {
      locale: 'en',
      slug: canonicalSlug,
      pathname: `/${canonicalSlug}`,
      sourcePath: entry.sourcePath,
      title: legacyDocument.title,
      description: legacyDocument.description,
      heading: legacyDocument.heading,
      heroImage: legacyDocument.heroImage,
      heroImageAlt: legacyDocument.heroImageAlt,
      sections: legacyDocument.sections,
      bullets: legacyDocument.bullets,
      owner: 'content-team',
      status: 'published',
      lastReviewedAt: importDate,
      reviewEveryDays: 90,
    };

    pagesBySlug.set(canonicalSlug, page);
    coveredSourcePaths.add(entry.sourcePath);
  }

  if (await fileExists(consultationSourcePath)) {
    const html = await fs.readFile(consultationSourcePath, 'utf8');
    const legacyDocument = parseLegacyDocumentFromHtml(html, 'consultation/index.html', 'Consultation', '');
    const slug = 'consultation';

    pagesBySlug.set(slug, {
      locale: 'en',
      slug,
      pathname: `/${slug}`,
      sourcePath: 'consultation/index.html',
      title: legacyDocument.title,
      description: legacyDocument.description,
      heading: legacyDocument.heading,
      heroImage: legacyDocument.heroImage,
      heroImageAlt: legacyDocument.heroImageAlt,
      sections: legacyDocument.sections,
      bullets: legacyDocument.bullets,
      owner: 'content-team',
      status: 'published',
      lastReviewedAt: importDate,
      reviewEveryDays: 90,
    });
    coveredSourcePaths.add('consultation/index.html');
  }

  for (const scanRoot of fallbackScanRoots) {
    const sources = (await walkHtmlFiles(path.join(legacyRoot, scanRoot))).sort();

    for (const sourcePath of sources) {
      if (coveredSourcePaths.has(sourcePath)) continue;

      const absolutePath = path.join(legacyRoot, sourcePath);
      const html = await fs.readFile(absolutePath, 'utf8');
      const legacyDocument = parseLegacyDocumentFromHtml(html, sourcePath, '', '');
      let slug = slugFromSourcePath(sourcePath);
      if (!slug) slug = sourcePath.replace(/\.html$/i, '');

      if (pagesBySlug.has(slug)) {
        coveredSourcePaths.add(sourcePath);
        continue;
      }

      pagesBySlug.set(slug, {
        locale: 'en',
        slug,
        pathname: `/${slug}`,
        sourcePath,
        title: legacyDocument.title,
        description: legacyDocument.description,
        heading: legacyDocument.heading,
        heroImage: legacyDocument.heroImage,
        heroImageAlt: legacyDocument.heroImageAlt,
        sections: legacyDocument.sections,
        bullets: legacyDocument.bullets,
        owner: 'content-team',
        status: 'published',
        lastReviewedAt: importDate,
        reviewEveryDays: 90,
      });

      coveredSourcePaths.add(sourcePath);
    }
  }

  const pages = Array.from(pagesBySlug.values()).sort((a, b) => a.slug.localeCompare(b.slug));

  for (const page of pages) {
    await writeJson(outputFilePathForSlug(page.slug), page);
    const prefix = page.slug.split('/')[0];
    if (prefix in stats) stats[prefix] += 1;
  }

  const countsByPrefix = pages.reduce((acc, page) => {
    const prefix = page.slug.split('/')[0] || 'root';
    acc[prefix] = (acc[prefix] || 0) + 1;
    return acc;
  }, {});

  const manifest = {
    locale: 'en',
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    countsByPrefix,
    aliases,
    pages: pages.map((page) => ({
      slug: page.slug,
      pathname: page.pathname,
      sourcePath: page.sourcePath,
      title: page.title,
    })),
  };

  await writeJson(path.join(outputDir, 'en', '_manifest.json'), manifest);

  console.log(`Managed legacy import complete (${pages.length} pages).`);
  if (legacyRoot !== root) {
    console.log(`Legacy source root: ${legacyRoot}`);
  }
  console.log(`about=${stats.about} faq=${stats.faq} policies=${stats.policies} services=${stats.services} consultation=${stats.consultation}`);
  console.log(`faq aliases mapped=${Object.keys(aliases).length}`);
}

main().catch((error) => {
  console.error('Failed to import managed legacy pages.');
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
