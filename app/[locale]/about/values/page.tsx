import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/about/values`,
    title: `Our Values | ${copy[locale].brand}`,
    description:
      'Our values define how we deliver immigration advisory for Brazil: clarity, legal precision, accountability, and client-first execution.',
  });
}

export default async function AboutValuesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const values = [
    {
      title: 'Clarity',
      body: 'We explain every step, deadline, and dependency in plain language so you always know what comes next.',
    },
    {
      title: 'Accuracy',
      body: 'Our workflows follow official requirements and document standards to reduce avoidable risk.',
    },
    {
      title: 'Respect',
      body: 'We respect Brazilian legal frameworks, local culture, and each client’s personal timeline.',
    },
    {
      title: 'Accountability',
      body: 'We track responsibilities on both sides and keep communication consistent from intake to completion.',
    },
  ];

  const commitments = [
    'We do not promise outcomes outside legal control.',
    'We do not recommend shortcuts that violate compliance standards.',
    'We protect client records and sensitive documents.',
    'We communicate tradeoffs and risks as early as possible.',
  ];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Brand Identity</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Our values</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            These values guide every engagement, from first consultation to final document delivery and long-term support in Brazil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/about/mission`}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50"
            >
              Read mission
            </Link>
            <Link
              href={`/${locale}/about/story`}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              Read story
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="font-display text-2xl text-ink-900">{value.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{value.body}</p>
              </article>
            ))}
          </div>

          <article className="mt-8 rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Ethical commitments</h2>
            <ul className="mt-4 grid gap-2 text-sm text-ink-700">
              {commitments.map((item) => (
                <li key={item} className="rounded-lg border border-sand-200 bg-sand-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
