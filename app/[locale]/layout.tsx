import { notFound } from 'next/navigation';

import { FloatingActions } from '@/components/floating-actions';
import { LegalServiceSchema } from '@/components/legal-service-schema';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { locales, resolveLocale } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">
      <LegalServiceSchema locale={locale} />
      <SiteHeader locale={locale} />
      <main>{children}</main>
      <SiteFooter locale={locale} />
      <FloatingActions locale={locale} />
    </div>
  );
}
