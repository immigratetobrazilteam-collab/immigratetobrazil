import type { Metadata } from 'next';
import Link from 'next/link';

import { BreadcrumbSchema } from '@/components/breadcrumb-schema';
import { BrandLogo } from '@/components/brand-logo';
import { FormspreeContactForm } from '@/components/formspree-contact-form';
import { TrackedAnchor } from '@/components/tracked-anchor';
import { brazilianStates } from '@/content/curated/states';
import { copy, resolveLocale } from '@/lib/i18n';
import { countRoutesByPrefix } from '@/lib/route-index';
import { createMetadata } from '@/lib/seo';
import { getManagedPageCopyWithFallback } from '@/lib/site-cms-content';
import { siteConfig } from '@/lib/site-config';

type ContactHubManagedCopy = {
  formTitle: string;
  formSubtitle: string;
  stateArchiveTitle: string;
  stateArchiveSubtitle: string;
};

const contactHubFallback: ContactHubManagedCopy = {
  formTitle: 'Start Consultation',
  formSubtitle: 'Use this secure form for legal advisory requests. We answer by email and WhatsApp.',
  stateArchiveTitle: 'State contact archives',
  stateArchiveSubtitle: '{{count}} state-specific contact pages from your old site are now available in the redesigned routing system.',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];

  return createMetadata({
    locale,
    pathname: `/${locale}/contact`,
    title: `${t.nav.contact} | ${t.brand}`,
    description: t.contact.subtitle,
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = copy[locale];
  const pageCopy = getManagedPageCopyWithFallback<ContactHubManagedCopy>(locale, 'contactHubPage', contactHubFallback);
  const contact = siteConfig.contact;
  const stateContactCount = await countRoutesByPrefix(locale, 'contact', false);
  const stateArchiveSubtitle = pageCopy.stateArchiveSubtitle.replace('{{count}}', String(stateContactCount));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.contact, href: `/${locale}/contact` },
        ]}
      />

      <section className="bg-sand-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-4">
            <BrandLogo priority className="h-14 w-auto sm:h-16" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.contact}</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">{t.contact.title}</h1>
          <p className="mt-6 text-lg text-ink-700">{t.contact.subtitle}</p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-sand-200 bg-white p-6">
              <h2 className="font-display text-2xl text-ink-900">{t.contact.consultation}</h2>
              <TrackedAnchor
                href={`mailto:${contact.consultationEmail}`}
                eventName="contact_click"
                eventParams={{ contact_method: 'email', source: 'contact_page_consultation_card', locale }}
                className="mt-3 block text-sm text-ink-700 underline decoration-sand-300 underline-offset-4"
              >
                {contact.consultationEmail}
              </TrackedAnchor>
            </article>
            <article className="rounded-2xl border border-sand-200 bg-white p-6">
              <h2 className="font-display text-2xl text-ink-900">{t.contact.whatsapp}</h2>
              <TrackedAnchor
                href={contact.whatsappLink}
                eventName="contact_click"
                eventParams={{ contact_method: 'whatsapp', source: 'contact_page_whatsapp_card', locale }}
                className="mt-3 block text-sm text-ink-700 underline decoration-sand-300 underline-offset-4"
              >
                {contact.whatsappNumber}
              </TrackedAnchor>
            </article>
            <article className="rounded-2xl border border-sand-200 bg-white p-6">
              <h2 className="font-display text-2xl text-ink-900">{t.contact.email}</h2>
              <TrackedAnchor
                href={`mailto:${contact.clientEmail}`}
                eventName="contact_click"
                eventParams={{ contact_method: 'email', source: 'contact_page_email_card', locale }}
                className="mt-3 block text-sm text-ink-700 underline decoration-sand-300 underline-offset-4"
              >
                {contact.clientEmail}
              </TrackedAnchor>
            </article>
          </div>

          <div className="mt-10">
            <FormspreeContactForm
              locale={locale}
              context="contact-page"
              title={pageCopy.formTitle}
              subtitle={pageCopy.formSubtitle}
            />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-ink-900">{pageCopy.stateArchiveTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm text-ink-700">{stateArchiveSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brazilianStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${locale}/contact/contact-${state.slug}`}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
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
