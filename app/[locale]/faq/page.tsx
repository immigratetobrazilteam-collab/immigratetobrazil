import type { Metadata } from 'next';
import Link from 'next/link';

import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { brazilianStates } from '@/content/curated/states';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/faq`,
    title: `FAQ | ${copy[locale].brand}`,
    description: 'Frequently asked questions about migration, legal process, and relocation execution.',
  });
}

export default async function FaqIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.faq, href: `/${locale}/faq` },
        ]}
      />

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">FAQ</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">State-specific immigration FAQ</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            This is the phase-2 migrated FAQ hub. Choose a state to access modernized question-and-answer guidance.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brazilianStates.map((state) => (
              <Link
                key={state.slug}
                href={localizedPath(locale, `/faq/faq-${state.slug}`)}
                className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm hover:border-civic-300"
              >
                {state[locale]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
