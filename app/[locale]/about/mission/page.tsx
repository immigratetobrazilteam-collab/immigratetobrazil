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
    pathname: `/${locale}/about/mission`,
    title: `Our Mission | ${copy[locale].brand}`,
    description:
      'Our mission is to make immigration to Brazil understandable, compliant, and strategically structured for each client profile.',
  });
}

export default async function AboutMissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const pillars = [
    {
      title: 'Legal certainty',
      body: 'Every roadmap is built around compliant pathways and verified requirements.',
    },
    {
      title: 'Structured execution',
      body: 'We convert complex immigration tasks into practical milestones your family or company can follow.',
    },
    {
      title: 'Decision confidence',
      body: 'We clarify options, timelines, and risks so you can move forward with confidence.',
    },
  ];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Brand Identity</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Our mission</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            Make Brazilian immigration understandable, predictable, and achievable for people who want to build a life in Brazil.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/process`}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50"
            >
              View process
            </Link>
            <Link
              href={`/${locale}/about/values`}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              View values
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="font-display text-2xl text-ink-900">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{pillar.body}</p>
              </article>
            ))}
          </div>

          <article className="mt-8 rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">How mission becomes execution</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              We align legal strategy, documentation readiness, and local onboarding so each case progresses through a measurable pathway instead of guesswork.
            </p>
            <Link
              href={`/${locale}/visa-consultation`}
              className="mt-5 inline-flex rounded-full bg-civic-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              Start consultation
            </Link>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
