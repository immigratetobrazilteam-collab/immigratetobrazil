import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { RouteGroupCards } from '@/components/legacy-route-cards';
import { getPageCmsCopy } from '@/lib/page-cms-content';
import { resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix, getPrefixGroups } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getPageCmsCopy(locale).resourcesGuidesBrazil;

  return createMetadata({
    locale,
    pathname: `/${locale}/resources-guides-brazil`,
    title: `Resources | ${t.title}`,
    description: t.subtitle,
  });
}

export default async function ResourcesGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getPageCmsCopy(locale).resourcesGuidesBrazil;

  const [resourceCount, discoverCount, discoverGroups] = await Promise.all([
    countRoutesByPrefix(locale, 'resources-guides-brazil', true),
    countRoutesByPrefix(locale, 'discover', true),
    getPrefixGroups(locale, 'discover', { maxGroups: 8, sampleSize: 4 }),
  ]);

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {resourceCount} resource pages
            </span>
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {discoverCount} discover pages
            </span>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          {t.items.map((item) => (
            <article key={item.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{item.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{t.legacyArchiveTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{t.legacyArchiveSubtitle}</p>
          <div className="mt-8">
            <RouteGroupCards groups={discoverGroups} />
          </div>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
