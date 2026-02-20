import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { resolveLocale } from '@/lib/i18n';
import { getPageCmsCopy } from '@/lib/page-cms-content';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getPageCmsCopy(locale).costOfLivingBrazil;

  return createMetadata({
    locale,
    pathname: `/${locale}/about/about-brazil/cost-of-living-in-brazil`,
    title: `Cost of Living Brazil | ${t.title}`,
    description: t.subtitle,
  });
}

export default async function CostOfLivingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getPageCmsCopy(locale).costOfLivingBrazil;

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          {t.cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{card.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
