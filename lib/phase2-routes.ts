import { stateBySlug } from '@/content/curated/states';
import { POLICY_SLUGS } from '@/lib/policy-slugs';

export type StateRouteType = 'contact' | 'faq' | 'services' | 'blog';

export function extractStateSlug(routeType: StateRouteType, slug: string): string | null {
  const prefixMap: Record<StateRouteType, string> = {
    contact: 'contact-',
    faq: 'faq-',
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
  if (slug.startsWith('faq-')) return 'faq';
  if (slug.startsWith('immigrate-to-')) return 'services';
  if (slug.startsWith('blog-')) return 'blog';
  return 'unknown';
}
