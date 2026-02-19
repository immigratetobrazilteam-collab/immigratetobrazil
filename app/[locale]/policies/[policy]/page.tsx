import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CtaCard } from '@/components/cta-card';
import { copy, locales, resolveLocale } from '@/lib/i18n';
import { POLICY_SLUGS } from '@/lib/policy-slugs';
import { policyCopy } from '@/lib/phase2-content';
import { isPolicySlug } from '@/lib/phase2-routes';
import { createMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return locales.flatMap((locale) => POLICY_SLUGS.map((policy) => ({ locale, policy })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; policy: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, policy } = await params;
  const locale = resolveLocale(rawLocale);

  if (!isPolicySlug(policy)) {
    return createMetadata({
      locale,
      pathname: `/${locale}/policies/${policy}`,
      title: 'Policy',
      description: 'Policy page',
    });
  }

  const t = policyCopy(locale, policy);

  return createMetadata({
    locale,
    pathname: `/${locale}/policies/${policy}`,
    title: `${t.title} | ${copy[locale].brand}`,
    description: t.paragraphs[0],
  });
}

export default async function PolicyPage({ params }: { params: Promise<{ locale: string; policy: string }> }) {
  const { locale: rawLocale, policy } = await params;
  const locale = resolveLocale(rawLocale);

  if (!isPolicySlug(policy)) notFound();

  const t = policyCopy(locale, policy);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Policy</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-14 sm:px-6 lg:px-8">
          {t.paragraphs.map((paragraph) => (
            <article key={paragraph} className="rounded-2xl border border-sand-200 bg-white p-6 text-sm leading-relaxed text-ink-700 shadow-sm">
              {paragraph}
            </article>
          ))}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
