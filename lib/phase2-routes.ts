import { stateBySlug } from '@/content/curated/states';
import { POLICY_SLUGS } from '@/lib/policy-slugs';

export type StateRouteType = 'contact' | 'faq' | 'services' | 'blog';

const FAQ_PREFIX = 'yourfaqsabout';
const FAQ_SUFFIX = 'answeredbyimmigratetobrazil';
const stateSlugByCompact = new Map(
  Array.from(stateBySlug.keys()).map((stateSlug) => [stateSlug.replace(/-/g, ''), stateSlug]),
);

export function buildFaqStateSlug(stateSlug: string) {
  return `${FAQ_PREFIX}${stateSlug.replace(/-/g, '')}${FAQ_SUFFIX}`;
}

export function isLegacyFaqStateSlug(slug: string) {
  if (!slug.startsWith('faq-')) return false;
  const stateSlug = slug.slice('faq-'.length);
  return Boolean(stateSlug) && stateBySlug.has(stateSlug);
}

function stateSlugFromFaqSlug(slug: string) {
  if (isLegacyFaqStateSlug(slug)) {
    return slug.slice('faq-'.length);
  }

  if (!slug.startsWith(FAQ_PREFIX) || !slug.endsWith(FAQ_SUFFIX)) {
    return null;
  }

  const compact = slug.slice(FAQ_PREFIX.length, slug.length - FAQ_SUFFIX.length);
  if (!compact) return null;
  return stateSlugByCompact.get(compact) || null;
}

export function extractStateSlug(routeType: StateRouteType, slug: string): string | null {
  if (routeType === 'faq') {
    return stateSlugFromFaqSlug(slug);
  }

  const prefixMap: Record<StateRouteType, string> = {
    contact: 'contact-',
    faq: '',
    services: 'immigrate-to-',
    blog: 'blog-',
  };

  const prefix = prefixMap[routeType];
  if (!slug.startsWith(prefix)) return null;

  const stateSlug = slug.slice(prefix.length);
  if (!stateSlug) return null;
  if (!stateBySlug.has(stateSlug)) return null;

  return stateSlug;
}

export function isPolicySlug(slug: string) {
  return POLICY_SLUGS.includes(slug as (typeof POLICY_SLUGS)[number]);
}

export function routePatternFromSlug(slug: string) {
  if (slug.startsWith('contact-')) return 'contact';
  if (isLegacyFaqStateSlug(slug) || (slug.startsWith(FAQ_PREFIX) && slug.endsWith(FAQ_SUFFIX))) return 'faq';
  if (slug.startsWith('immigrate-to-')) return 'services';
  if (slug.startsWith('blog-')) return 'blog';
  return 'unknown';
}
