import type { Metadata } from 'next';
import Link from 'next/link';

import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { brazilianStates } from '@/content/curated/states';
import { copy, resolveLocale } from '@/lib/i18n';
import { buildFaqStateSlug } from '@/lib/phase2-routes';
import { createMetadata } from '@/lib/seo';
import { localizedPath } from '@/lib/routes';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type FaqHubManagedCopy = {
  metaTitleTemplate: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
};

const faqHubFallback: FaqHubManagedCopy = {
  metaTitleTemplate: 'FAQ | {{brand}}',
  metaDescription: 'Frequently asked questions about migration, legal process, and relocation execution.',
  eyebrow: 'FAQ',
  title: 'State-specific immigration FAQ',
  subtitle: 'This is the phase-2 migrated FAQ hub. Choose a state to access modernized question-and-answer guidance.',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const pageCopy = getManagedPageCopyWithFallback<FaqHubManagedCopy>(locale, 'faqHubPage', faqHubFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}/faq`,
    title: pageCopy.metaTitleTemplate.replace('{{brand}}', copy[locale].brand),
    description: pageCopy.metaDescription,
  });
}

export default async function FaqIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const pageCopy = getManagedPageCopyWithFallback<FaqHubManagedCopy>(locale, 'faqHubPage', faqHubFallback);

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{pageCopy.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{pageCopy.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{pageCopy.subtitle}</p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brazilianStates.map((state) => (
              <Link
                key={state.slug}
                href={localizedPath(locale, `/faq/${buildFaqStateSlug(state.slug)}`)}
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
