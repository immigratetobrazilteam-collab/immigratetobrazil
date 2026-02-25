import seoSettings from '@/content/cms/settings/seo-settings.json';

type RawSeoSettings = {
  siteUrl?: string;
  sitemapPath?: string;
  extraSitemaps?: string[];
  excludePathPrefixes?: string[];
  excludePathContains?: string[];
  robotsDisallow?: string[];
};

export type SeoSettings = {
  siteUrl: string;
  sitemapPath: string;
  extraSitemaps: string[];
  excludePathPrefixes: string[];
  excludePathContains: string[];
  robotsDisallow: string[];
};

const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteUrl: 'https://www.immigratetobrazil.com',
  sitemapPath: '/sitemap.xml',
  extraSitemaps: [],
  excludePathPrefixes: [
    '/admin',
    '/api/admin',
    '/memory-bank',
    '/partials',
    '/useful_scripts',
    '/template.html',
    '/.git',
    '/.env',
  ],
  excludePathContains: ['.bak', '.sql', '.env', 'private'],
  robotsDisallow: [
    '/admin/',
    '/api/admin/',
    '/memory-bank/',
    '/partials/',
    '/useful_scripts/',
    '/template.html',
    '/.git/',
    '/.env',
  ],
};

function sanitizePathValue(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function sanitizeList(values: string[] | undefined, fallback: string[]): string[] {
  const merged = values && values.length > 0 ? values : fallback;
  const normalized = merged
    .map((value) => sanitizePathValue(value))
    .filter((value) => value.length > 0);

  return Array.from(new Set(normalized));
}

function sanitizeContainsList(values: string[] | undefined, fallback: string[]): string[] {
  const merged = values && values.length > 0 ? values : fallback;
  const normalized = merged.map((value) => value.trim()).filter((value) => value.length > 0);
  return Array.from(new Set(normalized));
}

export function getSeoSettings(): SeoSettings {
  const raw = (seoSettings as RawSeoSettings) || {};
  const siteUrl = (raw.siteUrl || DEFAULT_SEO_SETTINGS.siteUrl).trim().replace(/\/+$/, '');
  const sitemapPath = sanitizePathValue(raw.sitemapPath || DEFAULT_SEO_SETTINGS.sitemapPath);

  return {
    siteUrl,
    sitemapPath,
    extraSitemaps: sanitizeList(raw.extraSitemaps, DEFAULT_SEO_SETTINGS.extraSitemaps),
    excludePathPrefixes: sanitizeList(raw.excludePathPrefixes, DEFAULT_SEO_SETTINGS.excludePathPrefixes),
    excludePathContains: sanitizeContainsList(raw.excludePathContains, DEFAULT_SEO_SETTINGS.excludePathContains),
    robotsDisallow: sanitizeList(raw.robotsDisallow, DEFAULT_SEO_SETTINGS.robotsDisallow),
  };
}
