import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LegacyContent } from '@/components/legacy-content';
import { resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { createMetadata } from '@/lib/seo';

export const revalidate = 3600;

type Params = {
  locale: string;
  slug?: string[];
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const slug = resolved.slug || [];
  const page = await getLegacyDocument(locale, slug);

  if (!page) {
    return createMetadata({
      locale,
      pathname: `/${locale}/${slug.join('/')}`,
      title: 'Page',
      description: 'Immigration guidance for Brazil.',
    });
  }

  return createMetadata({
    locale,
    pathname: `/${locale}/${slug.join('/')}`,
    title: page.title,
    description: page.description,
  });
}

export default async function LegacyCatchAllPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const slug = resolved.slug || [];

  const page = await getLegacyDocument(locale, slug);
  if (!page) notFound();

  return <LegacyContent locale={locale} document={page} />;
}
