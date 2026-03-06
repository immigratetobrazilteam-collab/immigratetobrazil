import routeIndexData from '@/content/generated/route-index-lite.json';
import { getDiscoverManifest } from '@/lib/discover-pages-content';
import { locales } from '@/lib/locale';
import { getNavigationMap } from '@/lib/navigation-map-content';
import { getAllStateGuideSlugs } from '@/lib/state-guides-content';
import type { Locale } from '@/lib/types';

type RouteIndexEntry = {
  locale: Locale;
  slug: string;
};

const routeIndex = routeIndexData as RouteIndexEntry[];
export const STATIC_EXPORT = process.env.STATIC_EXPORT === '1';

export function getStaticLocales() {
  return [...locales];
}

function localeSlugs(locale: Locale) {
  return routeIndex
    .filter((entry) => entry.locale === locale)
    .map((entry) => entry.slug)
    .filter(Boolean);
}

function oneLevelFamilySlugs(locale: Locale, prefix: string) {
  const base = `${prefix}/`;
  return Array.from(
    new Set(
      localeSlugs(locale)
        .filter((slug) => slug.startsWith(base))
        .map((slug) => slug.slice(base.length))
        .filter((rest) => rest && !rest.includes('/')),
    ),
  );
}

export function getServicesSlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'services');
}

export function getBlogSlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'blog');
}

export function getContactSlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'contact');
}

export function getFaqSlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'faq');
}

export function getPolicySlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'policies');
}

export function getAboutUsSlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'about/about-us');
}

export function getAboutBrazilSlugs(locale: Locale) {
  return oneLevelFamilySlugs(locale, 'about/about-brazil');
}

export function getAboutBrazilStateParams(locale: Locale) {
  const base = 'about/about-brazil/';
  const seen = new Set<string>();
  const out: Array<{ slug: string; state: string }> = [];

  for (const slug of localeSlugs(locale)) {
    if (!slug.startsWith(base)) continue;
    const rest = slug.slice(base.length);
    const segments = rest.split('/').filter(Boolean);
    if (segments.length !== 2) continue;
    const key = `${segments[0]}::${segments[1]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ slug: segments[0], state: segments[1] });
  }

  return out;
}

export function getStateGuideSlugs() {
  return getAllStateGuideSlugs();
}

export async function getDiscoverCatchAllParams() {
  // Discover static params are generated from EN manifest slugs.
  const manifest = await getDiscoverManifest('en');
  return manifest.pages
    .map((page) => page.slug)
    .filter(Boolean)
    .map((slug) => slug.split('/').filter(Boolean));
}

export function getLegacyCatchAllParams(locale: Locale) {
  const dedicatedSingles = new Set([
    '',
    'about',
    'about/about-brazil',
    'about/about-states',
    'about/about-us',
    'about/mission',
    'about/story',
    'about/values',
    'accessibility',
    'client-portal',
    'consultation',
    'book-strategy-consultation',
    'email-us-notice',
    'home',
    'library',
    'process',
    'resources-guides-brazil',
    'search',
    'visa-consultation',
  ]);

  const navDerivedSlugs = getNavigationMap(locale).registry
    .map((item) => item.href)
    .filter((href) => href && href.startsWith('/'))
    .filter((href) => !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
    .map((href) => href.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);

  const slugPool = Array.from(new Set([...localeSlugs(locale), ...navDerivedSlugs]));

  function isHandledByDedicatedRoute(slug: string) {
    if (dedicatedSingles.has(slug)) return true;

    const segments = slug.split('/').filter(Boolean);
    if (!segments.length) return true;

    // Discover pages use their own catch-all pipeline and should not be duplicated.
    if (slug.startsWith('discover/')) return true;

    // Family routes below are handled by dedicated one-level routes.
    const oneLevelFamilies = new Set(['services', 'blog', 'contact', 'faq', 'state-guides', 'policies']);
    if (oneLevelFamilies.has(segments[0]) && segments.length === 2) return true;

    return false;
  }

  return slugPool
    .filter((slug) => !isHandledByDedicatedRoute(slug))
    .map((slug) => slug.split('/').filter(Boolean))
    .filter((parts) => parts.length > 0);
}
