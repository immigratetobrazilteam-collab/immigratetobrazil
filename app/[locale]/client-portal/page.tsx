import type { Metadata } from 'next';
import Link from 'next/link';

import { CtaCard } from '@/components/cta-card';
import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return createMetadata({
    locale,
    pathname: `/${locale}/client-portal`,
    title: `Client Portal Login | ${copy[locale].brand}`,
    description: 'Client portal access and secure consultation support channels.',
  });
}

export default async function ClientPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const contact = siteConfig.contact;

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Client Portal</p>
          <h1 className="mt-4 font-display text-5xl text-ink-900">Client portal login and support</h1>
          <p className="mt-6 text-lg text-ink-700">
            Use this area to access your case support channels, send secure updates, and continue consultation planning with our team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/visa-consultation`}
              className="rounded-full bg-civic-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-civic-800"
            >
              Start Consultation
            </Link>
            <Link
              href={`/${locale}/search`}
              className="rounded-full border border-sand-300 bg-sand-50 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:border-civic-300"
            >
              Search Site
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Email access</h2>
            <p className="mt-3 text-sm text-ink-700">Send client updates and document requests directly to the client channel.</p>
            <a href={`mailto:${contact.clientEmail}`} className="mt-4 inline-flex text-sm font-semibold text-civic-700 hover:text-civic-800">
              {contact.clientEmail}
            </a>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">WhatsApp support</h2>
            <p className="mt-3 text-sm text-ink-700">For urgent client questions and follow-up, use our verified WhatsApp line.</p>
            <a href={contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-civic-700 hover:text-civic-800">
              {contact.whatsappNumber}
            </a>
          </article>

          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">Need a new case strategy?</h2>
            <p className="mt-3 text-sm text-ink-700">Open a new consultation workflow to map visas, residency, and long-term compliance steps.</p>
            <Link href={`/${locale}/consultation`} className="mt-4 inline-flex text-sm font-semibold text-civic-700 hover:text-civic-800">
              Open consultation intake
            </Link>
          </article>
        </div>
      </section>

      <CtaCard locale={locale} />
    </>
  );
}
