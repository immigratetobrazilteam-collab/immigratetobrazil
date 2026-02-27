#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacyRoot = process.env.LEGACY_SOURCE_ROOT ? path.resolve(root, process.env.LEGACY_SOURCE_ROOT) : root;
const blogDir = path.join(legacyRoot, 'blog');
const outputDir = path.join(root, 'content', 'cms', 'state-guides');

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
        .replace(/<\/(p|li|h2|h3|h4|div|ul|ol|section|article|summary|details)>/gi, '\n')
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
    .slice(0, 80);
}

function extractByRegex(html, regex) {
  const match = regex.exec(html);
  if (!match) return '';
  return stripTags(match[1]);
}

function extractAllByRegex(html, regex) {
  return Array.from(html.matchAll(regex))
    .map((match) => stripTags(match[1]))
    .filter(Boolean);
}

function trimToSentence(text, maxLength = 220) {
  if (!text) return text;
  if (text.length <= maxLength) return text;

  const snippet = text.slice(0, maxLength);
  const sentenceEnd = Math.max(snippet.lastIndexOf('.'), snippet.lastIndexOf('!'), snippet.lastIndexOf('?'));

  if (sentenceEnd > 90) {
    return snippet.slice(0, sentenceEnd + 1).trim();
  }

  const wordEnd = snippet.lastIndexOf(' ');
  if (wordEnd > 60) {
    return `${snippet.slice(0, wordEnd).trim()}...`;
  }

  return `${snippet.trim()}...`;
}

function extractMainContentFragment(html) {
  const start = html.indexOf('<main id="main-content">');
  if (start === -1) {
    return html;
  }

  const endMarkers = [
    '<div data-include="/partials/newsletter.html"',
    '<!-- Partial: service-overview.html',
    '</body>',
  ];

  let end = html.length;
  for (const marker of endMarkers) {
    const markerIndex = html.indexOf(marker, start + 1);
    if (markerIndex !== -1 && markerIndex < end) {
      end = markerIndex;
    }
  }

  return html.slice(start, end);
}

function extractBalancedDivAt(html, startIndex) {
  let cursor = startIndex;
  let depth = 0;

  while (cursor < html.length) {
    const nextOpen = html.indexOf('<div', cursor);
    const nextClose = html.indexOf('</div>', cursor);

    if (nextClose === -1) return null;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 4;
      continue;
    }

    depth -= 1;
    cursor = nextClose + 6;

    if (depth === 0) {
      return {
        html: html.slice(startIndex, cursor),
        endIndex: cursor,
      };
    }
  }

  return null;
}

function extractDivBlocksByClass(fragment, classToken) {
  const out = [];
  const openTagRegex = /<div[^>]*class="([^"]*)"[^>]*>/gi;
  let match;

  while ((match = openTagRegex.exec(fragment)) !== null) {
    const classes = (match[1] || '').split(/\s+/).filter(Boolean);
    if (!classes.includes(classToken)) continue;

    const startIndex = match.index;
    const block = extractBalancedDivAt(fragment, startIndex);
    if (!block) continue;

    out.push({
      startIndex,
      html: block.html,
      classes,
    });

    openTagRegex.lastIndex = block.endIndex;
  }

  return out;
}

function innerHtmlOfDiv(blockHtml) {
  const firstClose = blockHtml.indexOf('>');
  const lastClose = blockHtml.lastIndexOf('</div>');
  if (firstClose === -1 || lastClose === -1 || lastClose <= firstClose) return '';
  return blockHtml.slice(firstClose + 1, lastClose);
}

function parseContentBlocks(innerHtml) {
  const tokenRegex = /<(h2|h3|p|ul|ol|div|details|table)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  const blocks = [];
  let primaryHeadingSkipped = false;

  let match;
  while ((match = tokenRegex.exec(innerHtml)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || '';
    const payload = match[3] || '';

    if (tag === 'h2') {
      const text = stripTags(payload);
      if (!text) continue;

      if (!primaryHeadingSkipped) {
        primaryHeadingSkipped = true;
        continue;
      }

      blocks.push({ type: 'subheading', text });
      continue;
    }

    if (tag === 'h3') {
      const text = stripTags(payload);
      if (text) {
        blocks.push({ type: 'subheading', text });
      }
      continue;
    }

    if (tag === 'p') {
      const text = stripTags(payload);
      if (!text) continue;

      const classNameMatch = /class="([^"]*)"/i.exec(attrs);
      const classTokens = (classNameMatch?.[1] || '').split(/\s+/).filter(Boolean);
      const tone = classTokens.includes('tip')
        ? 'tip'
        : classTokens.includes('highlight')
          ? 'highlight'
          : classTokens.includes('compliance')
            ? 'compliance'
            : classTokens.includes('note')
              ? 'note'
              : null;

      if (tone) {
        blocks.push({ type: 'note', tone, text });
      } else {
        blocks.push({ type: 'paragraph', text });
      }
      continue;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = extractAllByRegex(payload, /<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (items.length) {
        blocks.push({ type: 'list', items });
      }
      continue;
    }

    if (tag === 'div') {
      const classNameMatch = /class="([^"]*)"/i.exec(attrs);
      const classTokens = (classNameMatch?.[1] || '').split(/\s+/).filter(Boolean);

      const tone = classTokens.includes('tip')
        ? 'tip'
        : classTokens.includes('highlight')
          ? 'highlight'
          : classTokens.includes('compliance')
            ? 'compliance'
            : classTokens.includes('note')
              ? 'note'
              : null;

      if (!tone) continue;

      const text = stripTags(payload);
      if (text) {
        blocks.push({ type: 'note', tone, text });
      }

      continue;
    }

    if (tag === 'details') {
      const question = stripTags(payload.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || '');
      const answer = stripTags(payload.replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, ''));
      if (question && answer) {
        blocks.push({ type: 'subheading', text: question });
        blocks.push({ type: 'paragraph', text: answer });
      }

      continue;
    }

    if (tag === 'table') {
      const headers = Array.from(payload.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi))
        .map((entry) => stripTags(entry[1] || ''))
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

  return blocks;
}

function dedupePreservingOrder(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function ensureUniqueId(base, used) {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let idx = 2;
  while (used.has(`${base}-${idx}`)) {
    idx += 1;
  }

  const unique = `${base}-${idx}`;
  used.add(unique);
  return unique;
}

function parseSectionFromBlock(blockHtml, fallbackIndex, usedIds) {
  const h2Match = /<h2([^>]*)>([\s\S]*?)<\/h2>/i.exec(blockHtml);
  const heading = stripTags(h2Match?.[2] || `Section ${fallbackIndex + 1}`);

  const h2Attrs = h2Match?.[1] || '';
  const explicitId = /id="([^"]+)"/i.exec(h2Attrs)?.[1] || '';
  const generatedBaseId = explicitId || slugify(heading) || `section-${fallbackIndex + 1}`;
  const id = ensureUniqueId(generatedBaseId, usedIds);

  const inner = innerHtmlOfDiv(blockHtml);
  const blocks = parseContentBlocks(inner);

  const paragraph = blocks.find((entry) => entry.type === 'paragraph')?.text;
  const firstListItem = blocks.find((entry) => entry.type === 'list')?.items?.[0];
  const firstNote = blocks.find((entry) => entry.type === 'note')?.text;
  const summary = paragraph || firstListItem || firstNote || heading;

  const highlights = dedupePreservingOrder(
    blocks.flatMap((entry) => {
      if (entry.type === 'subheading') return [entry.text];
      if (entry.type === 'list') return entry.items;
      if (entry.type === 'note') return [entry.text];
      return [];
    }),
  );

  return {
    id,
    heading,
    summary: trimToSentence(summary, 320),
    highlights,
    blocks,
  };
}

function buildTableOfContents(fragment, sections) {
  const tocFromLegacy = [];
  const tocCardMatch = /<div class="card">[\s\S]*?<h3>[\s\S]*?Table of Contents[\s\S]*?<\/h3>[\s\S]*?<ul>([\s\S]*?)<\/ul>[\s\S]*?<\/div>/i.exec(
    fragment,
  );

  if (tocCardMatch) {
    const itemRegex = /<a[^>]*href="(#?[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(tocCardMatch[1])) !== null) {
      const href = (itemMatch[1] || '').trim();
      const label = stripTags(itemMatch[2] || '');
      if (!label) continue;

      const rawId = href.startsWith('#') ? href.slice(1) : href;
      if (!rawId) continue;

      const matchingSection = sections.find((section) => section.id === rawId || slugify(section.heading) === slugify(rawId));
      if (!matchingSection) continue;

      tocFromLegacy.push({ id: matchingSection.id, label });
    }
  }

  const bySection = sections.map((section) => ({ id: section.id, label: section.heading }));

  if (tocFromLegacy.length >= 5) {
    const merged = [...tocFromLegacy];
    const seen = new Set(tocFromLegacy.map((item) => item.id));

    for (const entry of bySection) {
      if (seen.has(entry.id)) continue;
      merged.push(entry);
      seen.add(entry.id);
    }

    return merged;
  }

  return bySection;
}

function buildFaq(stateName, sections) {
  const findSummary = (token, fallback) => {
    const section = sections.find((entry) => entry.id.includes(token) || entry.heading.toLowerCase().includes(token));
    return section?.summary || fallback;
  };

  return [
    {
      question: `What visa options are most common for moving to ${stateName}?`,
      answer: findSummary(
        'visa',
        `${stateName} offers multiple immigration pathways, including work, family, study, residency, and specialized permit categories depending on your profile.`,
      ),
    },
    {
      question: `How much should I budget monthly in ${stateName}?`,
      answer: findSummary(
        'cost',
        `Monthly costs in ${stateName} depend mainly on housing, location, transport choices, and lifestyle level.`,
      ),
    },
    {
      question: `What should I organize first after arriving in ${stateName}?`,
      answer: trimToSentence(
        `${findSummary('practical', `Start with core registrations, local documentation, banking, and healthcare setup in ${stateName}.`)} Keep all immigration paperwork organized and consistent.`,
        280,
      ),
    },
  ];
}

function buildGuideFromHtml(slug, fullHtml) {
  const stateSlug = slug.replace(/^blog-/, '');
  const fragment = extractMainContentFragment(fullHtml);

  const h1 = extractByRegex(fragment, /<div class="blog-header">[\s\S]*?<h1>\s*([\s\S]*?)\s*<\/h1>/i);
  const heroIntro = extractByRegex(fragment, /<div class="blog-header">[\s\S]*?<p>\s*([\s\S]*?)\s*<\/p>/i);
  const blogMeta = extractByRegex(fragment, /<div class="blog-meta">\s*([\s\S]*?)\s*<\/div>/i);

  const stateName = (() => {
    if (h1) {
      const match = /Complete Immigration Guide to\s+([^,]+),\s*Brazil/i.exec(h1);
      if (match) return match[1].trim();
    }

    return stateSlug
      .split('-')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');
  })();

  const usedIds = new Set();
  const sectionBlocks = [
    ...extractDivBlocksByClass(fragment, 'content-section'),
    ...extractDivBlocksByClass(fragment, 'section-block'),
  ].sort((a, b) => a.startIndex - b.startIndex);

  const sections = sectionBlocks
    .map((block, index) => parseSectionFromBlock(block.html, index, usedIds))
    .filter((section) => section.blocks.length > 0 || section.heading.length > 0);

  const tableOfContents = buildTableOfContents(fragment, sections);
  const faq = buildFaq(stateName, sections);

  const introFallback = `Comprehensive relocation and immigration guidance for ${stateName}, Brazil.`;

  return {
    stateSlug,
    slug: `everything-you-need-to-know-about-${stateSlug}`,
    title: `Everything You Need to Know About ${stateName}`,
    heroIntro: heroIntro || introFallback,
    sourcePath: `blog/${slug}.html`,
    sourceUpdatedLabel: blogMeta || 'Published on: January 2024 | Updated: January 2024',
    tableOfContents,
    sections,
    faq,
    cta: {
      title: `Plan your move to ${stateName}`,
      description: `Get a tailored immigration action plan for ${stateName}, including visa strategy, document sequencing, and first-month settlement tasks.`,
      primaryLabel: 'Book a consultation',
      primaryHref: '/visa-consultation',
      secondaryLabel: 'Contact our team',
      secondaryHref: '/contact',
    },
    seo: {
      metaTitle: `Everything You Need to Know About ${stateName} | Immigrate to Brazil`,
      metaDescription: trimToSentence(heroIntro || introFallback, 155),
      keywords: [
        `${stateName}`,
        `${stateName} Brazil`,
        `${stateName} immigration`,
        `${stateName} relocation`,
        `${stateName} visa`,
        `${stateName} cost of living`,
      ],
    },
    owner: 'content-team',
    status: 'published',
    lastReviewedAt: new Date().toISOString().slice(0, 10),
    reviewEveryDays: 90,
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  const stateFiles = entries
    .filter((entry) => entry.isFile() && /^blog-[a-z0-9-]+\.html$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (!stateFiles.length) {
    throw new Error(`No blog/blog-*.html files were found in ${blogDir}.`);
  }

  const guides = [];
  for (const fileName of stateFiles) {
    const filePath = path.join(blogDir, fileName);
    const html = await fs.readFile(filePath, 'utf8');
    guides.push(buildGuideFromHtml(fileName.replace(/\.html$/i, ''), html));
  }

  guides.sort((a, b) => a.stateSlug.localeCompare(b.stateSlug));

  await ensureDir(outputDir);

  const enPayload = {
    locale: 'en',
    hub: {
      eyebrow: 'State migration guides',
      title: 'Everything you need to know about each Brazilian state',
      subtitle:
        'A complete managed library of 27 state-by-state immigration guides rebuilt from the legacy blog content with full structured sections.',
      countLabel: '{{count}} state guides',
      backToBlogLabel: 'Back to blog',
      consultationLabel: 'Book a consultation',
    },
    guides,
  };

  const esPayload = {
    locale: 'es',
    hub: {
      eyebrow: 'Guías estatales de migración',
      title: 'Todo lo que necesitas saber sobre cada estado de Brasil',
      subtitle:
        'Biblioteca gestionada con 27 guías estatales basadas en el contenido legado y listas para edición continua.',
      countLabel: '{{count}} guías estatales',
      backToBlogLabel: 'Volver al blog',
      consultationLabel: 'Reservar consulta',
    },
    guides: [],
  };

  const ptPayload = {
    locale: 'pt',
    hub: {
      eyebrow: 'Guias estaduais de imigração',
      title: 'Tudo o que você precisa saber sobre cada estado do Brasil',
      subtitle:
        'Biblioteca gerenciável com 27 guias estaduais baseados no conteúdo legado e pronta para atualização contínua.',
      countLabel: '{{count}} guias estaduais',
      backToBlogLabel: 'Voltar ao blog',
      consultationLabel: 'Agendar consulta',
    },
    guides: [],
  };

  const frPayload = {
    locale: 'fr',
    hub: {
      eyebrow: 'Guides migratoires par État',
      title: 'Tout ce que vous devez savoir sur chaque État du Brésil',
      subtitle:
        'Bibliothèque gérée de 27 guides par État issus du contenu hérité et prête pour une maintenance éditoriale continue.',
      countLabel: '{{count}} guides par État',
      backToBlogLabel: 'Retour au blog',
      consultationLabel: 'Réserver une consultation',
    },
    guides: [],
  };

  await Promise.all([
    writeJson(path.join(outputDir, 'en.json'), enPayload),
    writeJson(path.join(outputDir, 'es.json'), esPayload),
    writeJson(path.join(outputDir, 'pt.json'), ptPayload),
    writeJson(path.join(outputDir, 'fr.json'), frPayload),
  ]);

  console.log(`Imported ${guides.length} state guides with full structured content.`);
  if (legacyRoot !== root) {
    console.log(`Legacy source root: ${legacyRoot}`);
  }
}

main().catch((error) => {
  console.error('Failed to import state guides from legacy blog HTML.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
