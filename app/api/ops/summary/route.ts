import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { POLICY_SLUGS } from '@/lib/policy-slugs';

export const runtime = 'nodejs';

const LOCALES = ['en', 'es', 'pt', 'fr'] as const;
type Locale = (typeof LOCALES)[number];

type RouteIndexItem = {
  locale: Locale;
  slug: string;
};

async function readRouteIndex() {
  const indexPath = path.join(process.cwd(), 'content/generated/route-index.json');

  try {
    const raw = await readFile(indexPath, 'utf8');
    return JSON.parse(raw) as RouteIndexItem[];
  } catch {
    return [];
  }
}

async function readJsonFile(filePath: string) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  const routeIndex = await readRouteIndex();

  const localeCounts = Object.fromEntries(
    LOCALES.map((locale) => [locale, routeIndex.filter((r) => r.locale === locale).length]),
  ) as Record<Locale, number>;

  const [stateCopies, policiesByLocale, siteCopies] = await Promise.all([
    Promise.all(
      LOCALES.map((locale) =>
        readJsonFile(path.join(process.cwd(), `content/cms/state-copy/${locale}.json`)),
      ),
    ),
    Promise.all(
      LOCALES.map((locale) =>
        readJsonFile(path.join(process.cwd(), `content/cms/policies/${locale}.json`)),
      ),
    ),
    Promise.all(
      LOCALES.map((locale) =>
        readJsonFile(path.join(process.cwd(), `content/cms/site-copy/${locale}.json`)),
      ),
    ),
  ]);

  const stateTemplatesPresent = Object.fromEntries(
    LOCALES.map((locale, index) => [locale, Boolean(stateCopies[index]?.templates)]),
  ) as Record<Locale, boolean>;

  const policyCounts = Object.fromEntries(
    LOCALES.map((locale, index) => [
      locale,
      Array.isArray(policiesByLocale[index]?.policies) ? (policiesByLocale[index]?.policies as unknown[]).length : 0,
    ]),
  ) as Record<Locale, number>;

  const siteCopyPresent = Object.fromEntries(
    LOCALES.map((locale, index) => [locale, Boolean(siteCopies[index]?.hero)]),
  ) as Record<Locale, boolean>;

  const managedPagesPresent = Object.fromEntries(
    LOCALES.map((locale, index) => [locale, Boolean(siteCopies[index]?.managedPages)]),
  ) as Record<Locale, boolean>;

  const managedPagesKeyCounts = Object.fromEntries(
    LOCALES.map((locale, index) => {
      const managedPages = siteCopies[index]?.managedPages;
      return [
        locale,
        managedPages && typeof managedPages === 'object'
          ? Object.keys(managedPages as Record<string, unknown>).length
          : 0,
      ];
    }),
  ) as Record<Locale, number>;

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXTJS_ENV || process.env.NODE_ENV || 'unknown',
    routes: {
      total: routeIndex.length,
      byLocale: localeCounts,
    },
    cms: {
      stateTemplatesPresent,
      policyCounts,
      siteCopyPresent,
      managedPagesPresent,
      managedPagesKeyCounts,
      expectedPolicySlugs: POLICY_SLUGS,
    },
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
