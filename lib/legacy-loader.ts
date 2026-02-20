import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

import type { LegacyDocument, Locale } from '@/lib/types';

function candidateRoots() {
  const anchor = path.resolve(process.cwd());
  const roots = new Set<string>();

  let current = anchor;
  while (true) {
    roots.add(current);
    roots.add(path.join(current, 'server-functions', 'default'));
    roots.add(path.join(current, '.open-next', 'server-functions', 'default'));

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  if (process.env.LEGACY_CONTENT_ROOT) {
    roots.add(path.resolve(process.env.LEGACY_CONTENT_ROOT));
  }

  return Array.from(roots);
}

function decodeEntities(input: string) {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractMatch(source: string, pattern: RegExp, fallback = '') {
  const match = source.match(pattern);
  return match?.[1] ? stripTags(match[1]) : fallback;
}

function collectTexts(source: string, tag: 'h2' | 'h3' | 'h4' | 'p' | 'li', limit: number) {
  const matcher = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const values: string[] = [];

  for (const match of source.matchAll(matcher)) {
    const text = stripTags(match[1] || '');
    if (text.length < 24) continue;
    if (text.toLowerCase().includes('placeholder')) continue;
    values.push(text);
    if (values.length >= limit) break;
  }

  return values;
}

function normalizeLegacyImage(src?: string) {
  if (!src) return undefined;
  if (src.startsWith('/assets/')) return src.replace('/assets/', '/legacy-assets/');
  if (src.startsWith('assets/')) return `/legacy-assets/${src.slice('assets/'.length)}`;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return src;
  return `/${src}`;
}

function extractMainFragment(html: string) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return (main?.[1] || body?.[1] || html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<div[^>]*id=["'][^"']*placeholder[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
}

function buildSections(fragment: string) {
  const headings = [
    ...collectTexts(fragment, 'h2', 16),
    ...collectTexts(fragment, 'h3', 16),
    ...collectTexts(fragment, 'h4', 16),
  ];

  const paragraphs = [
    ...collectTexts(fragment, 'p', 24),
    ...collectTexts(fragment, 'li', 24),
  ].filter((text) => text.length > 35);

  const slices: LegacyDocument['sections'] = [];
  for (let i = 0; i < paragraphs.length; i += 3) {
    const group = paragraphs.slice(i, i + 3);
    if (!group.length) continue;

    slices.push({
      title: headings[Math.floor(i / 3)] || `Guidance ${Math.floor(i / 3) + 1}`,
      paragraphs: group,
    });

    if (slices.length >= 8) break;
  }

  if (!slices.length) {
    const plain = stripTags(fragment).split('. ').filter((line) => line.length > 40).slice(0, 6);
    if (plain.length) {
      slices.push({ title: 'Overview', paragraphs: plain.map((line) => (line.endsWith('.') ? line : `${line}.`)) });
    }
  }

  return {
    sections: slices,
    bullets: collectTexts(fragment, 'li', 8).slice(0, 6),
  };
}

function candidatePaths(locale: Locale, slug: string[]) {
  const joined = slug.join('/');
  const baseCandidates = new Set<string>();

  if (joined) {
    baseCandidates.add(joined);

    if (joined.startsWith('about/about-states/')) {
      const parts = joined.split('/');
      const last = parts[parts.length - 1] || '';
      if (last && !last.startsWith('about-')) {
        baseCandidates.add([...parts.slice(0, -1), `about-${last}`].join('/'));
      }
    }

    if (joined.startsWith('services/immigrate-to-')) {
      baseCandidates.add(`${joined}-`);
    }

    if (joined.startsWith('immigrate-to-') || joined === 'immigratetobrazil-index') {
      baseCandidates.add(`home/${joined}`);
    }
  }

  if (!joined) {
    baseCandidates.add('home/index');
    baseCandidates.add('home/immigratetobrazil-index');
  }

  if (locale !== 'en') {
    for (const candidate of Array.from(baseCandidates)) {
      baseCandidates.add(`${locale}/${candidate}`);
    }
  }

  const withExt = new Set<string>();

  for (const candidate of baseCandidates) {
    if (candidate.endsWith('.html')) {
      withExt.add(candidate);
      continue;
    }

    withExt.add(`${candidate}.html`);
    withExt.add(`${candidate}/index.html`);
  }

  return Array.from(withExt);
}

async function fileExists(absolutePath: string) {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveFile(locale: Locale, slug: string[]) {
  const candidates = candidatePaths(locale, slug);

  for (const root of candidateRoots()) {
    for (const candidate of candidates) {
      const absolutePath = path.resolve(root, candidate);
      if (!absolutePath.startsWith(root)) continue;
      if (await fileExists(absolutePath)) return { absolutePath, relativePath: candidate };
    }
  }

  return null;
}

export const getLegacyDocument = cache(async (locale: Locale, slug: string[]): Promise<LegacyDocument | null> => {
  const match = await resolveFile(locale, slug);
  if (!match) return null;

  const html = await readFile(match.absolutePath, 'utf8');
  const title = extractMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i, 'Immigrate to Brazil');
  const description = extractMatch(
    html,
    /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i,
    'Immigration guidance for Brazil visas, residency, and relocation planning.',
  );

  const fragment = extractMainFragment(html);
  const heading = extractMatch(fragment, /<h1[^>]*>([\s\S]*?)<\/h1>/i, title);

  const imageMatch = fragment.match(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/i);
  const heroImage = normalizeLegacyImage(imageMatch?.[1]);
  const heroImageAlt = imageMatch?.[2] ? stripTags(imageMatch[2]) : heading;

  const { sections, bullets } = buildSections(fragment);

  return {
    sourcePath: match.relativePath,
    title,
    description,
    heading,
    heroImage,
    heroImageAlt,
    sections,
    bullets,
  };
});
