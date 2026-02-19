import type { Metadata } from 'next';

import { copy, resolveLocale } from '@/lib/i18n';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

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
  const contact = siteConfig.contact;

  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.nav.contact}</p>
        <h1 className="mt-4 font-display text-5xl text-ink-900">{t.contact.title}</h1>
        <p className="mt-6 text-lg text-ink-700">{t.contact.subtitle}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.contact.consultation}</h2>
            <a href={`mailto:${contact.consultationEmail}`} className="mt-3 block text-sm text-ink-700 underline decoration-sand-300 underline-offset-4">
              {contact.consultationEmail}
            </a>
          </article>
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.contact.whatsapp}</h2>
            <a href={contact.whatsappLink} className="mt-3 block text-sm text-ink-700 underline decoration-sand-300 underline-offset-4">
              {contact.whatsappNumber}
            </a>
          </article>
          <article className="rounded-2xl border border-sand-200 bg-white p-6">
            <h2 className="font-display text-2xl text-ink-900">{t.contact.email}</h2>
            <a href={`mailto:${contact.clientEmail}`} className="mt-3 block text-sm text-ink-700 underline decoration-sand-300 underline-offset-4">
              {contact.clientEmail}
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
