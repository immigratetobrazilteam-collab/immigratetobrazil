import type { Metadata } from 'next';
import Link from 'next/link';

import { copy, resolveLocale } from '@/lib/i18n';
import { policyCopy } from '@/lib/phase2-content';
import { POLICY_SLUGS } from '@/lib/policy-slugs';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/policies`,
    title: `Policies | ${copy[locale].brand}`,
    description: 'Policy center for privacy, terms, cookies, and legal notices.',
  });
}

export default async function PoliciesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Policies</p>
        <h1 className="mt-4 font-display text-5xl text-ink-900">Policy center</h1>
        <p className="mt-6 max-w-3xl text-lg text-ink-700">
          Centralized legal and compliance policies in the modern architecture.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {POLICY_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={localizedPath(locale, `/policies/${slug}`)}
              className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm hover:border-civic-300"
            >
              {policyCopy(locale, slug).title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
