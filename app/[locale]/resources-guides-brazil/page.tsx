import type { Metadata } from 'next';

import { CtaCard } from '@/components/cta-card';
import { FaqSchema } from '@/components/faq-schema';
import { RouteGroupCards } from '@/components/legacy-route-cards';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { copy, resolveLocale } from '@/lib/i18n';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { countRoutesByPrefix, getPrefixGroups } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type ResourcesGuidesManagedCopy = {
  seo: ManagedSeoCopy;
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Array<{
    title: string;
    detail: string;
  }>;
  resourceCountLabel: string;
  discoverCountLabel: string;
  legacyArchiveTitle: string;
  legacyArchiveSubtitle: string;
};

const resourcesGuidesFallback: ResourcesGuidesManagedCopy = {
  seo: {
    metaTitleTemplate: 'Resources | {{brand}}',
    metaDescription: 'Immigration resource playbooks, state selection guides, and compliance operations for Brazil.',
    keywords: ['brazil immigration resources', 'brazil relocation guide', 'visa checklist brazil'],
    faq: [
      {
        question: 'What is included in the resources hub?',
        answer: 'It includes visa category playbooks, state selection guidance, arrival operations, and compliance checkpoints.',
      },
    ],
    internalLinksTitle: 'Useful migration links',
    internalLinks: [
      { href: '/library', label: 'Open full library' },
      { href: '/services', label: 'Services overview' },
      { href: '/contact', label: 'Get support' },
    ],
  },
  eyebrow: 'Resource hub',
  title: 'Brazil immigration resources and operational guides',
  subtitle: 'Modernized resource hub replacing legacy static blocks with structured guidance categories.',
  items: [
    {
      title: 'Visa category playbooks',
      detail: 'Decision trees, eligibility references, and supporting document standards.',
    },
    {
      title: 'State selection guides',
      detail: 'Regional cost, climate, legal workflow, and infrastructure tradeoffs.',
    },
    {
      title: 'Arrival operations',
      detail: 'CPF, CRNM/RNE, housing, healthcare, education, and banking setup references.',
    },
    {
      title: 'Compliance alerts',
      detail: 'Renewal timing, validity windows, and procedural checkpoints.',
    },
  ],
  resourceCountLabel: '{{count}} resource pages',
  discoverCountLabel: '{{count}} discover pages',
  legacyArchiveTitle: 'Legacy discover archives',
  legacyArchiveSubtitle: 'The old discover folders are now grouped below so they can be linked from modern pages and navigation.',
};

function renderCountLabel(template: string, count: number) {
  return template.includes('{{count}}') ? template.replace('{{count}}', String(count)) : template;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getManagedPageCopyWithFallback<ResourcesGuidesManagedCopy>(locale, 'resourcesGuidesBrazilPage', resourcesGuidesFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}/resources-guides-brazil`,
    title: renderMetaTitle(t.seo.metaTitleTemplate, { brand: copy[locale].brand }, `Resources | ${t.title}`),
    description: t.seo.metaDescription || t.subtitle,
  });
}

export default async function ResourcesGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = getManagedPageCopyWithFallback<ResourcesGuidesManagedCopy>(locale, 'resourcesGuidesBrazilPage', resourcesGuidesFallback);

  const [resourceCount, discoverCount, discoverGroups] = await Promise.all([
    countRoutesByPrefix(locale, 'resources-guides-brazil', true),
    countRoutesByPrefix(locale, 'discover', true),
    getPrefixGroups(locale, 'discover', { maxGroups: 8, sampleSize: 4 }),
  ]);

  return (
    <>
      <FaqSchema items={t.seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {renderCountLabel(t.resourceCountLabel, resourceCount)}
            </span>
            <span className="rounded-full border border-civic-200 bg-civic-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-800">
              {renderCountLabel(t.discoverCountLabel, discoverCount)}
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

      <ManagedSeoLinks locale={locale} title={t.seo.internalLinksTitle} links={t.seo.internalLinks} />

      <CtaCard locale={locale} />
    </>
  );
}
