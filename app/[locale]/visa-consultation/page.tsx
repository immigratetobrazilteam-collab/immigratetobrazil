import type { Metadata } from 'next';

import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { FormspreeContactForm } from '@/components/formspree-contact-form';
import { CtaCard } from '@/components/cta-card';
import { LegacyContent } from '@/components/legacy-content';
import { getPageCmsCopy } from '@/lib/page-cms-content';
import { copy, resolveLocale } from '@/lib/i18n';
import { getLegacyDocument } from '@/lib/legacy-loader';
import { getRelatedRouteLinks } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';

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

  const t = getPageCmsCopy(locale).visaConsultation;

  return createMetadata({
    locale,
    pathname: `/${locale}/visa-consultation`,
    title: `Visa Consultation | ${t.title}`,
    description: t.subtitle,
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

  const t = getPageCmsCopy(locale).visaConsultation;

  return (
    <>
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

      <CtaCard locale={locale} />
    </>
  );
}
