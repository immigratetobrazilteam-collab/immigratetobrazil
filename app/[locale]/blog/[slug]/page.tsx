import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { stateBySlug } from '@/content/curated/states';
import { copy, resolveLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';
import { createMetadata } from '@/lib/seo';
import { buildStateGuideSlug, stateGuidePathBySlug } from '@/lib/state-guides-content';

function stateSlugFromBlogSlug(slug: string) {
  if (!slug.startsWith('blog-')) return null;
  const stateSlug = slug.slice('blog-'.length);
  if (!stateSlug) return null;
  if (!stateBySlug.has(stateSlug)) return null;
  return stateSlug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const stateSlug = stateSlugFromBlogSlug(slug);

  if (!stateSlug) {
    return createMetadata({
      locale,
      pathname: `/${locale}/blog/${slug}`,
      title: 'Blog',
      description: 'State blog redirect.',
    });
  }

  const state = stateBySlug.get(stateSlug);
  const stateLabel = state ? state[locale] : stateSlug.replace(/-/g, ' ');

  return createMetadata({
    locale,
    pathname: `/${locale}/blog/${slug}`,
    title: `${copy[locale].nav.blog}: ${stateLabel}`,
    description: `Redirecting to the managed state guide for ${stateLabel}.`,
  });
}

export default async function BlogStateLegacyRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const stateSlug = stateSlugFromBlogSlug(slug);

  if (!stateSlug) {
    notFound();
  }

  const guideSlug = buildStateGuideSlug(stateSlug);
  permanentRedirect(localizedPath(locale, stateGuidePathBySlug(guideSlug)));
}
