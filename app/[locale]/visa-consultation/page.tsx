import type { Metadata } from 'next';

import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { FormspreeContactForm } from '@/components/formspree-contact-form';
import { FaqSchema } from '@/components/faq-schema';
import { ManagedSeoLinks } from '@/components/managed-seo-links';
import { CtaCard } from '@/components/cta-card';
import { LegacyContent } from '@/components/legacy-content';
import { copy, resolveLocale } from '@/lib/i18n';
import { renderMetaTitle, type ManagedSeoCopy } from '@/lib/managed-seo';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';

type VisaConsultationManagedCopy = {
  seo: ManagedSeoCopy;
  eyebrow: string;
  title: string;
  subtitle: string;
  blocks: Array<{
    title: string;
    detail: string;
  }>;
};

const visaConsultationFallback: VisaConsultationManagedCopy = {
  seo: {
    metaTitleTemplate: 'Visa Consultation | {{brand}}',
    metaDescription:
      'Brazil visa consultation with eligibility mapping, documentation planning, and execution guidance.',
    keywords: ['brazil visa consultation', 'immigration consultation brazil', 'visa planning'],
    faq: [
      {
        question: 'What do I get from a visa consultation?',
        answer: 'You receive category fit guidance, document requirements, risk flags, and a practical submission roadmap.',
      },
    ],
    internalLinksTitle: 'Continue your migration planning',
    internalLinks: [
      { href: '/services', label: 'Services overview' },
      { href: '/process', label: 'Process timeline' },
      { href: '/contact', label: 'Direct contact' },
    ],
  },
  eyebrow: 'Visa consultation',
  title: 'Visa consultation framework',
  subtitle: 'First-wave migration of legacy consultation content into a clear paid-advisory scope with documented outputs.',
  blocks: [
    {
      title: 'Session deliverables',
      detail: 'Eligibility map, risk flags, required documents, and priority timeline.',
    },
    {
      title: 'Profile categories',
      detail: 'Work, digital nomad, investment, retirement, family, and transition scenarios.',
    },
    {
      title: 'Commercial scope',
      detail: 'Advisory session, execution package options, and compliance follow-up.',
    },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const legacy = await getLegacyDocument(locale, ['visa-consultation']);

  if (legacy) {
    return createMetadata({
      locale,
      pathname: `/${locale}/visa-consultation`,
      title: legacy.title,
      description: legacy.description,
    });
  }

  const t = getManagedPageCopyWithFallback<VisaConsultationManagedCopy>(locale, 'visaConsultationPage', visaConsultationFallback);

  return createMetadata({
    locale,
    pathname: `/${locale}/visa-consultation`,
    title: renderMetaTitle(t.seo.metaTitleTemplate, { brand: copy[locale].brand }, `Visa Consultation | ${t.title}`),
    description: t.seo.metaDescription || t.subtitle,
  });
}

export default async function VisaConsultationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const nav = copy[locale].nav;
  const legacy = await getLegacyDocument(locale, ['visa-consultation']);

  if (legacy) {
    const relatedLinks = await getRelatedRouteLinks(locale, 'visa-consultation', 16);
    return (
      <>
        <BreadcrumbSchema
          items={[
            { name: nav.home, href: `/${locale}` },
            { name: nav.services, href: `/${locale}/services` },
            { name: legacy.heading, href: `/${locale}/visa-consultation` },
          ]}
        />
        <LegacyContent locale={locale} document={legacy} slug="visa-consultation" relatedLinks={relatedLinks} />
      </>
    );
  }

  const t = getManagedPageCopyWithFallback<VisaConsultationManagedCopy>(locale, 'visaConsultationPage', visaConsultationFallback);

  return (
    <>
      <FaqSchema items={t.seo.faq.map((item) => ({ question: item.question, answer: item.answer }))} />
      <BreadcrumbSchema
        items={[
          { name: nav.home, href: `/${locale}` },
          { name: nav.services, href: `/${locale}/services` },
          { name: t.title, href: `/${locale}/visa-consultation` },
        ]}
      />

      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-ink-700">{t.subtitle}</p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {t.blocks.map((block) => (
            <article key={block.title} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-ink-900">{block.title}</h2>
              <p className="mt-3 text-sm text-ink-700">{block.detail}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
          <FormspreeContactForm
            locale={locale}
            context="visa-consultation"
            title={t.title}
            subtitle={t.subtitle}
          />
        </div>
      </section>

      <ManagedSeoLinks locale={locale} title={t.seo.internalLinksTitle} links={t.seo.internalLinks} />

      <CtaCard locale={locale} />
    </>
  );
}
