#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacyRoot = process.env.LEGACY_SOURCE_ROOT ? path.resolve(root, process.env.LEGACY_SOURCE_ROOT) : root;
const discoverDir = path.join(legacyRoot, 'discover');
const outputDir = path.join(root, 'content', 'cms', 'discover-pages');

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
        .replace(/<\/(p|li|h1|h2|h3|h4|div|ul|ol|section|summary|details|figure|main)>/gi, '\n')
        .replace(/<[^>]+>/g, ' '),
    ),
  );
}

function slugify(input) {
  const normalized = decodeHtmlEntities(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function titleCaseFromSlugToken(token) {
  return token
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readMetaDescription(html) {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  return stripTags(match?.[1] || '');
}

function readTitleTag(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return stripTags(match?.[1] || '');
}

function normalizeLegacyImage(src) {
  if (!src) return undefined;
  if (src.startsWith('/assets/')) return src.replace('/assets/', '/legacy-assets/');
  if (src.startsWith('assets/')) return `/legacy-assets/${src.slice('assets/'.length)}`;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return `/${src}`;
}

function extractMainFragment(html) {
  const startMarkers = ['<main id="main-content">', '<main role="main">', '<main>'];

  let start = -1;
  for (const marker of startMarkers) {
    start = html.indexOf(marker);
    if (start !== -1) break;
  }

  if (start === -1) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch?.[1] || html;
  }

  const endMarkers = [
    '<!-- Partial: service-overview.html',
    '<div data-toggle="on" id="service-overview-placeholder"',
    '<div data-toggle="on" id="footer-placeholder"',
    '</body>',
  ];

  let end = html.length;
  for (const marker of endMarkers) {
    const markerIndex = html.indexOf(marker, start + 1);
    if (markerIndex !== -1 && markerIndex < end) {
      end = markerIndex;
    }
  }

  const raw = html.slice(start, end);

  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<div[^>]*(?:id|data-include|data-partial-role)=["'][^"']*placeholder[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
}

function extractSectionHtmlBlocks(fragment) {
  const blocks = [];
  const sectionRegex = /<section\b[^>]*>[\s\S]*?<\/section>/gi;

  for (const match of fragment.matchAll(sectionRegex)) {
    blocks.push(match[0]);
  }

  return blocks;
}

function toneFromClassAttr(attrs) {
  const classMatch = /class="([^"]+)"/i.exec(attrs);
  const classTokens = (classMatch?.[1] || '').split(/\s+/).filter(Boolean);

  if (classTokens.includes('tip')) return 'tip';
  if (classTokens.includes('highlight')) return 'highlight';
  if (classTokens.includes('compliance')) return 'compliance';
  if (classTokens.includes('note')) return 'note';
  return null;
}

function parseSection(sectionHtml, sectionIndex, usedIds) {
  const headingMatch =
    /<h2([^>]*)>([\s\S]*?)<\/h2>/i.exec(sectionHtml) ||
    /<h1([^>]*)>([\s\S]*?)<\/h1>/i.exec(sectionHtml) ||
    /<h3([^>]*)>([\s\S]*?)<\/h3>/i.exec(sectionHtml);

  const headingText = stripTags(headingMatch?.[2] || '');
  if (!headingText) {
    return null;
  }

  const explicitId = /id="([^"]+)"/i.exec(headingMatch?.[1] || '')?.[1];
  const baseId = explicitId || slugify(headingText) || `section-${sectionIndex + 1}`;

  let sectionId = baseId;
  let suffix = 2;
  while (usedIds.has(sectionId)) {
    sectionId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(sectionId);

  const inner = sectionHtml
    .replace(/^<section\b[^>]*>/i, '')
    .replace(/<\/section>$/i, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '');

  const blocks = [];
  const faq = [];
  const primaryHeadingNormalized = headingText.toLowerCase();
  let primaryHeadingSkipped = false;

  const tokenRegex = /<(h2|h3|h4|p|ul|ol|details|table)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let tokenMatch;
  while ((tokenMatch = tokenRegex.exec(inner)) !== null) {
    const tag = tokenMatch[1].toLowerCase();
    const attrs = tokenMatch[2] || '';
    const payload = tokenMatch[3] || '';

    if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const text = stripTags(payload);
      if (text) {
        if (tag === 'h2' && !primaryHeadingSkipped && text.toLowerCase() === primaryHeadingNormalized) {
          primaryHeadingSkipped = true;
          continue;
        }

        blocks.push({ type: 'subheading', text });
      }
      continue;
    }

    if (tag === 'p') {
      const text = stripTags(payload);
      if (!text) continue;

      const tone = toneFromClassAttr(attrs);
      if (tone) {
        blocks.push({ type: 'note', tone, text });
      } else {
        blocks.push({ type: 'paragraph', text });
      }

      continue;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(payload.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
        .map((match) => stripTags(match[1] || ''))
        .filter(Boolean);

      if (items.length) {
        blocks.push({ type: 'list', items });
      }

      continue;
    }

    if (tag === 'details') {
      const question = stripTags(payload.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || '');
      const answer = stripTags(payload.replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, ''));
      if (question && answer) {
        faq.push({ question, answer });
      }

      continue;
    }

    if (tag === 'table') {
      const headers = Array.from(payload.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi))
        .map((match) => stripTags(match[1] || ''))
        .filter(Boolean);
      const rows = Array.from(payload.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi))
        .map((rowMatch) =>
          Array.from(rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi))
            .map((cellMatch) => stripTags(cellMatch[1] || ''))
            .filter(Boolean),
        )
        .filter((cells) => cells.length > 0);

      const items = rows.map((cells) => {
        if (headers.length === cells.length) {
          return cells.map((cell, index) => `${headers[index]}: ${cell}`).join(' | ');
        }

        return cells.join(' | ');
      });

      if (items.length) {
        blocks.push({ type: 'list', items });
      }
    }
  }

  if (!blocks.length) {
    const fallback = stripTags(inner);
    if (fallback) {
      blocks.push({ type: 'paragraph', text: fallback });
    }
  }

  const summary =
    blocks.find((block) => block.type === 'paragraph')?.text ||
    blocks.find((block) => block.type === 'list')?.items?.[0] ||
    blocks.find((block) => block.type === 'note')?.text ||
    headingText;

  const highlightPool = [];
  for (const block of blocks) {
    if (block.type === 'subheading') highlightPool.push(block.text);
    if (block.type === 'list') highlightPool.push(...block.items);
    if (block.type === 'note') highlightPool.push(block.text);
  }

  const highlights = [];
  const seen = new Set();
  for (const item of highlightPool) {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    highlights.push(item);
    if (highlights.length >= 30) break;
  }

  return {
    section: {
      id: sectionId,
      heading: headingText,
      summary,
      highlights,
      blocks,
    },
    faq,
  };
}

function buildTaxonomy(slug) {
  const segments = slug ? slug.split('/').filter(Boolean) : [];

  let type = 'other';
  if (!segments.length) {
    type = 'discover-root';
  } else if (segments[0] === 'brazilian-states') {
    if (segments.length === 1) type = 'states-hub';
    else if (segments.length === 2) type = 'state-overview';
    else type = 'state-subpage';
  } else if (segments[0] === 'brazilian-regions') {
    if (segments.length === 1) type = 'regions-hub';
    else if (segments.length === 2) type = 'region-overview';
    else if (segments.length === 3) type = 'region-state-overview';
    else type = 'region-city';
  }

  return {
    type,
    depth: segments.length,
    segments,
  };
}

function trimToSentence(text, maxLength = 180) {
  if (!text) return text;
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

function subjectFromTitle(title, slug) {
  if (title) {
    const cleaned = title
      .replace(/\s*[-|]\s*Immigrate to Brazil.*$/i, '')
      .replace(/^Immigrate to Brazil\s*[|:-]\s*/i, '')
      .trim();
    if (cleaned) return cleaned;
  }

  const lastToken = slug.split('/').filter(Boolean).pop() || 'Brazil destination';
  return titleCaseFromSlugToken(lastToken);
}

function relativeHtmlToSlug(relativeHtmlPath) {
  const normalized = relativeHtmlPath.replace(/\\/g, '/');

  if (normalized === 'index.html') {
    return '';
  }

  if (normalized.endsWith('/index.html')) {
    return normalized.slice(0, -'/index.html'.length);
  }

  if (normalized.endsWith('.html')) {
    return normalized.slice(0, -'.html'.length);
  }

  return normalized;
}

function routePathFromSlug(slug) {
  return slug ? `/discover/${slug}` : '/discover';
}

function outputFilePathForSlug(locale, slug) {
  const relative = slug ? `${slug}.json` : '__root__.json';
  return path.join(outputDir, locale, relative);
}

async function ensureDirForFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJson(filePath, value) {
  await ensureDirForFile(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function walkHtmlFiles(baseDir) {
  const output = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.html')) continue;

      const rel = path.relative(baseDir, abs).replace(/\\/g, '/');
      output.push({ absolutePath: abs, relativePath: rel });
    }
  }

  await walk(baseDir);
  output.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return output;
}

function buildPageData(relativePath, html) {
  const slug = relativeHtmlToSlug(relativePath);
  const pathname = routePathFromSlug(slug);
  const fragment = extractMainFragment(html);

  const titleTag = readTitleTag(html);
  const heading =
    stripTags(fragment.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '') ||
    titleTag ||
    titleCaseFromSlugToken(slug.split('/').filter(Boolean).pop() || 'discover');

  const heroIntro =
    stripTags(
      fragment
        .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
        .match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '',
    ) || readMetaDescription(html);

  const imageMatch = fragment.match(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/i);
  const heroImage = normalizeLegacyImage(imageMatch?.[1]);
  const heroImageAlt = stripTags(imageMatch?.[2] || heading);

  const usedIds = new Set();
  const sections = [];
  const faq = [];

  const sectionBlocks = extractSectionHtmlBlocks(fragment);
  for (let idx = 0; idx < sectionBlocks.length; idx += 1) {
    const parsed = parseSection(sectionBlocks[idx], idx, usedIds);
    if (!parsed) continue;
    sections.push(parsed.section);
    faq.push(...parsed.faq);
  }

  if (!sections.length) {
    const fallbackParagraphs = Array.from(fragment.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
      .map((match) => stripTags(match[1] || ''))
      .filter(Boolean)
      .slice(0, 20);

    if (fallbackParagraphs.length) {
      sections.push({
        id: 'overview',
        heading: 'Overview',
        summary: fallbackParagraphs[0],
        highlights: fallbackParagraphs.slice(1, 8),
        blocks: fallbackParagraphs.map((text) => ({ type: 'paragraph', text })),
      });
    }
  }

  const tableOfContents = sections.map((section) => ({ id: section.id, label: section.heading }));
  const sourceUpdatedLabel =
    stripTags(fragment.match(/<div class="blog-meta">\s*([\s\S]*?)\s*<\/div>/i)?.[1] || '') ||
    'Legacy discover source migrated to managed content';

  const subject = subjectFromTitle(heading || titleTag, slug);
  const metaDescription = readMetaDescription(html) || trimToSentence(heroIntro || sections[0]?.summary || heading, 155);

  const taxonomy = buildTaxonomy(slug);

  return {
    slug,
    pathname,
    title: heading,
    heroIntro: heroIntro || sections[0]?.summary || '',
    heroImage,
    heroImageAlt,
    sourcePath: `discover/${relativePath}`,
    sourceUpdatedLabel,
    tableOfContents,
    sections,
    faq,
    cta: {
      title: `Plan your move to ${subject}`,
      description: `Get a tailored relocation roadmap for ${subject}, including immigration planning, document sequencing, and practical first-month setup steps.`,
      primaryLabel: 'Book a consultation',
      primaryHref: '/visa-consultation',
      secondaryLabel: 'Contact our team',
      secondaryHref: '/contact',
    },
    seo: {
      metaTitle: `${heading} | Immigrate to Brazil`,
      metaDescription,
      keywords: [
        heading,
        slug.replace(/\//g, ' '),
        'Brazil discover guide',
        'Brazil relocation',
        'Brazil immigration',
      ],
    },
    taxonomy,
    owner: 'content-team',
    status: 'published',
    lastReviewedAt: new Date().toISOString().slice(0, 10),
    reviewEveryDays: 90,
  };
}

function localizedHubCopy(locale) {
  if (locale === 'es') {
    return {
      eyebrow: 'Biblioteca Discover',
      title: 'Discover Brazil por estado, región y ciudad',
      subtitle:
        'Biblioteca gestionada de páginas Discover migradas desde HTML legado sin dependencias de parciales.',
      countLabel: '{{count}} páginas discover',
      browseStatesLabel: 'Explorar estados',
      browseRegionsLabel: 'Explorar regiones',
      consultationLabel: 'Reservar consulta',
    };
  }

  if (locale === 'pt') {
    return {
      eyebrow: 'Biblioteca Discover',
      title: 'Discover Brazil por estado, região e cidade',
      subtitle:
        'Biblioteca gerenciável de páginas Discover migradas do HTML legado sem dependências de parciais.',
      countLabel: '{{count}} páginas discover',
      browseStatesLabel: 'Ver estados',
      browseRegionsLabel: 'Ver regiões',
      consultationLabel: 'Agendar consulta',
    };
  }

  if (locale === 'fr') {
    return {
      eyebrow: 'Bibliothèque Discover',
      title: 'Discover Brazil par État, région et ville',
      subtitle:
        'Bibliothèque gérée des pages Discover migrées depuis le HTML hérité sans dépendance aux partiels.',
      countLabel: '{{count}} pages discover',
      browseStatesLabel: 'Parcourir les États',
      browseRegionsLabel: 'Parcourir les régions',
      consultationLabel: 'Réserver une consultation',
    };
  }

  return {
    eyebrow: 'Discover library',
    title: 'Discover Brazil by state, region, and city',
    subtitle:
      'Managed library of discover pages migrated from legacy HTML with no partial dependencies.',
    countLabel: '{{count}} discover pages',
    browseStatesLabel: 'Browse states',
    browseRegionsLabel: 'Browse regions',
    consultationLabel: 'Book a consultation',
  };
}

async function main() {
  const files = await walkHtmlFiles(discoverDir);
  if (!files.length) {
    throw new Error(`No discover HTML files were found in ${discoverDir}.`);
  }

  const pages = [];

  let processed = 0;
  for (const file of files) {
    const html = await fs.readFile(file.absolutePath, 'utf8');
    const pageData = buildPageData(file.relativePath, html);

    await writeJson(outputFilePathForSlug('en', pageData.slug), pageData);

    pages.push({
      slug: pageData.slug,
      pathname: pageData.pathname,
      title: pageData.title,
      heroIntro: pageData.heroIntro,
      sourcePath: pageData.sourcePath,
      taxonomy: pageData.taxonomy,
      sectionCount: pageData.sections.length,
      faqCount: pageData.faq.length,
    });

    processed += 1;
    if (processed % 500 === 0) {
      console.log(`Processed ${processed}/${files.length} discover pages...`);
    }
  }

  const statsByType = pages.reduce((acc, page) => {
    acc[page.taxonomy.type] = (acc[page.taxonomy.type] || 0) + 1;
    return acc;
  }, {});

  const manifest = {
    locale: 'en',
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    statsByType,
    pages,
  };

  const labelsBySlug = Object.fromEntries(pages.map((page) => [page.slug, page.title]));
  const hubIndex = {
    locale: 'en',
    generatedAt: manifest.generatedAt,
    pageCount: manifest.pageCount,
    statePages: pages
      .filter((page) => page.taxonomy.type === 'state-overview')
      .slice(0, 60),
    citySamples: pages
      .filter((page) => page.taxonomy.type === 'region-city')
      .slice(0, 160),
  };

  await writeJson(path.join(outputDir, 'en', '_manifest.json'), manifest);
  await writeJson(path.join(outputDir, 'en', '_labels.json'), labelsBySlug);
  await writeJson(path.join(outputDir, 'en', '_hub-index.json'), hubIndex);
  await writeJson(path.join(outputDir, 'en', '_hub.json'), {
    locale: 'en',
    ...localizedHubCopy('en'),
  });

  for (const locale of ['es', 'pt', 'fr']) {
    await writeJson(path.join(outputDir, locale, '_hub.json'), {
      locale,
      ...localizedHubCopy(locale),
    });
  }

  console.log(`Imported ${pages.length} discover pages into managed content.`);
  if (legacyRoot !== root) {
    console.log(`Legacy source root: ${legacyRoot}`);
  }
}

main().catch((error) => {
  console.error('Failed to import discover pages from legacy HTML.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
