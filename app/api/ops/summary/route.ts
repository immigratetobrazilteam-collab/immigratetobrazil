import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { POLICY_SLUGS } from '@/lib/policy-slugs';

export const runtime = 'nodejs';

type RouteIndexItem = {
  locale: 'en' | 'es' | 'pt';
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

  const localeCounts = {
    en: routeIndex.filter((r) => r.locale === 'en').length,
    es: routeIndex.filter((r) => r.locale === 'es').length,
    pt: routeIndex.filter((r) => r.locale === 'pt').length,
  };

  const stateCopyPaths = [
    path.join(process.cwd(), 'content/cms/state-copy/en.json'),
    path.join(process.cwd(), 'content/cms/state-copy/es.json'),
    path.join(process.cwd(), 'content/cms/state-copy/pt.json'),
  ];

  const policyPaths = [
    path.join(process.cwd(), 'content/cms/policies/en.json'),
    path.join(process.cwd(), 'content/cms/policies/es.json'),
    path.join(process.cwd(), 'content/cms/policies/pt.json'),
  ];

  const siteCopyPaths = [
    path.join(process.cwd(), 'content/cms/site-copy/en.json'),
    path.join(process.cwd(), 'content/cms/site-copy/es.json'),
    path.join(process.cwd(), 'content/cms/site-copy/pt.json'),
  ];

  const pageCopyPaths = [
    path.join(process.cwd(), 'content/cms/page-copy/en.json'),
    path.join(process.cwd(), 'content/cms/page-copy/es.json'),
    path.join(process.cwd(), 'content/cms/page-copy/pt.json'),
  ];

  const [enState, esState, ptState] = await Promise.all(stateCopyPaths.map(readJsonFile));
  const [enPolicies, esPolicies, ptPolicies] = await Promise.all(policyPaths.map(readJsonFile));
  const [enSiteCopy, esSiteCopy, ptSiteCopy] = await Promise.all(siteCopyPaths.map(readJsonFile));
  const [enPageCopy, esPageCopy, ptPageCopy] = await Promise.all(pageCopyPaths.map(readJsonFile));

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXTJS_ENV || process.env.NODE_ENV || 'unknown',
    routes: {
      total: routeIndex.length,
      byLocale: localeCounts,
    },
    cms: {
      stateTemplatesPresent: {
        en: Boolean(enState?.templates),
        es: Boolean(esState?.templates),
        pt: Boolean(ptState?.templates),
      },
      policyCounts: {
        en: Array.isArray(enPolicies?.policies) ? enPolicies.policies.length : 0,
        es: Array.isArray(esPolicies?.policies) ? esPolicies.policies.length : 0,
        pt: Array.isArray(ptPolicies?.policies) ? ptPolicies.policies.length : 0,
      },
      siteCopyPresent: {
        en: Boolean(enSiteCopy?.hero),
        es: Boolean(esSiteCopy?.hero),
        pt: Boolean(ptSiteCopy?.hero),
      },
      pageCopyPresent: {
        en: Boolean(enPageCopy?.applyBrazil),
        es: Boolean(esPageCopy?.applyBrazil),
        pt: Boolean(ptPageCopy?.applyBrazil),
      },
      expectedPolicySlugs: POLICY_SLUGS,
    },
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
