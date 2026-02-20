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
    pathname: `/${locale}/about/story`,
    title: `Our Story | ${copy[locale].brand}`,
    description:
      'How Immigrate to Brazil started, why the firm exists, and how the operating model grew into a full-service immigration advisory.',
  });
}

export default async function AboutStoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const milestones = [
    {
      title: 'First relocation project',
      body: 'The company started after helping a friend relocate from Canada to São Paulo through a fragmented immigration process.',
    },
    {
      title: 'Method built from practice',
      body: 'A practical checklist became a repeatable framework covering legal steps, documentation, and local setup.',
    },
    {
      title: 'National service model',
      body: 'Today the advisory supports clients across all 27 Brazilian states, from visa strategy to on-the-ground integration.',
    },
  ];

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Brand Identity</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Our story</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">
            What began as one relocation support request evolved into a full immigration advisory designed for clarity, compliance, and predictable outcomes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/about/about-us`}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-sand-50"
            >
              About us hub
            </Link>
            <Link
              href={`/${locale}/about/mission`}
              className="rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-800"
            >
              Mission
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {milestones.map((milestone) => (
              <article key={milestone.title} className="rounded-2xl border border-sand-200 bg-white p-6">
                <h2 className="font-display text-2xl text-ink-900">{milestone.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{milestone.body}</p>
              </article>
            ))}
          </div>

          <article className="mt-8 rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Who we serve</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              Families, professionals, entrepreneurs, retirees, students, and travelers who need a structured plan for visas, residency, and legal onboarding in Brazil.
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-5 inline-flex rounded-full bg-civic-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              Talk to our team
            </Link>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
