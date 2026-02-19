import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

import type { Locale } from '@/lib/types';

export type RouteIndexEntry = {
  locale: Locale;
  slug: string;
  sourcePath: string;
  title: string;
  description: string;
};

export type RouteLink = {
  slug: string;
  href: string;
  title: string;
  description: string;
  sourcePath: string;
};

export type RoutePrefixGroup = {
  key: string;
  label: string;
  count: number;
  href: string;
  sample: RouteLink[];
};

const INDEX_PATH = path.join(process.cwd(), 'content/generated/route-index.json');
const LOCALES = new Set<Locale>(['en', 'es', 'pt']);

function decodeEntities(input: string) {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeText(value: string) {
  return decodeEntities(value).replace(/\s+/g, ' ').trim();
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function labelFromSegment(segment: string) {
  const clean = segment.toLowerCase();

  if (clean === 'immigratetobrazil-index' || clean === 'immigratetobrazil') {
    return 'Immigrate to Brazil';
  }

  if (clean.startsWith('immigrate-to-')) {
    const state = clean.replace(/^immigrate-to-/, '').replace(/-index$/, '').replace(/-/g, ' ');
    return `Immigrate to ${titleCase(state)}`;
  }

  const removedPrefix = clean
    .replace(/^(about|blog|contact|faq)-/, '')
    .replace(/-index$/, '')
    .replace(/-/g, ' ');

  return titleCase(removedPrefix);
}

export function routeTitle(entry: Pick<RouteIndexEntry, 'title' | 'slug'>) {
  const normalized = normalizeText(entry.title || '');
  if (normalized) return normalized;

  const segments = entry.slug.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || entry.slug;
  return labelFromSegment(last);
}

function toHref(locale: Locale, slug: string) {
  const clean = slug.replace(/^\/+/, '');
  if (!clean) return `/${locale}`;
  return `/${locale}/${clean}`;
}

function toLink(locale: Locale, entry: RouteIndexEntry): RouteLink {
  return {
    slug: entry.slug,
    href: toHref(locale, entry.slug),
    title: routeTitle(entry),
    description: normalizeText(entry.description || ''),
    sourcePath: entry.sourcePath,
  };
}

export const getRouteIndex = cache(async (): Promise<RouteIndexEntry[]> => {
  try {
    const raw = await readFile(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw) as RouteIndexEntry[];

    return parsed.filter((item) => LOCALES.has(item.locale));
  } catch {
    return [];
  }
});

export async function getLocaleRoutes(locale: Locale) {
  const routes = await getRouteIndex();
  return routes.filter((entry) => entry.locale === locale);
}

export async function getRouteLinksByPrefix(
  locale: Locale,
  prefix: string,
  options?: {
    limit?: number;
    includePrefixEntry?: boolean;
  },
) {
  const { limit = 24, includePrefixEntry = true } = options || {};
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
  const routes = await getLocaleRoutes(locale);

  const filtered = routes.filter((entry) => {
    if (!normalizedPrefix) return true;
    if (includePrefixEntry && entry.slug === normalizedPrefix) return true;
    return entry.slug.startsWith(`${normalizedPrefix}/`);
  });

  return filtered
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((entry) => toLink(locale, entry));
}

export async function countRoutesByPrefix(locale: Locale, prefix: string, includePrefixEntry = true) {
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
  const routes = await getLocaleRoutes(locale);

  return routes.filter((entry) => {
    if (!normalizedPrefix) return true;
    if (includePrefixEntry && entry.slug === normalizedPrefix) return true;
    return entry.slug.startsWith(`${normalizedPrefix}/`);
  }).length;
}

export async function getPrefixGroups(
  locale: Locale,
  prefix: string,
  options?: {
    maxGroups?: number;
    sampleSize?: number;
  },
): Promise<RoutePrefixGroup[]> {
  const { maxGroups = 12, sampleSize = 4 } = options || {};
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
  const routes = await getLocaleRoutes(locale);

  const matching = routes
    .filter((entry) => entry.slug.startsWith(`${normalizedPrefix}/`))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const grouped = new Map<string, RouteIndexEntry[]>();

  for (const entry of matching) {
    const remainder = entry.slug.slice(normalizedPrefix.length + 1);
    if (!remainder) continue;

    const key = remainder.split('/')[0];
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)?.push(entry);
  }

  return Array.from(grouped.entries())
    .map(([key, entries]) => {
      const direct = entries.find((entry) => {
        const remainder = entry.slug.slice(normalizedPrefix.length + 1);
        return remainder === key;
      });

      const first = direct || entries[0];
      const sample = entries.slice(0, sampleSize).map((entry) => toLink(locale, entry));

      return {
        key,
        label: labelFromSegment(key),
        count: entries.length,
        href: toHref(locale, first.slug),
        sample,
      };
    })
    .sort((a, b) => {
      if (a.count === b.count) return a.label.localeCompare(b.label);
      return b.count - a.count;
    })
    .slice(0, maxGroups);
}

export async function getRelatedRouteLinks(locale: Locale, slug: string, limit = 16) {
  const routes = await getLocaleRoutes(locale);
  const current = slug.replace(/^\/+|\/+$/g, '');
  const segments = current.split('/').filter(Boolean);

  const prefixCandidates: string[] = [];
  for (let depth = segments.length - 1; depth >= 1; depth -= 1) {
    prefixCandidates.push(segments.slice(0, depth).join('/'));
  }

  if (segments[0]) {
    prefixCandidates.push(segments[0]);
  }

  let related: RouteIndexEntry[] = [];

  for (const prefix of prefixCandidates) {
    const candidates = routes.filter((entry) => entry.slug !== current && entry.slug.startsWith(`${prefix}/`));

    if (candidates.length >= 1 && candidates.length <= 120) {
      related = candidates;
      break;
    }
  }

  if (!related.length) {
    related = routes.filter((entry) => entry.slug !== current).slice(0, limit);
  }

  return related
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((entry) => toLink(locale, entry));
}
