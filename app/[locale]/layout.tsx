import { notFound } from 'next/navigation';

import { FloatingActions } from '@/components/floating-actions';
import { LegalServiceSchema } from '@/components/legal-service-schema';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SiteUpgradeNotice } from '@/components/site-upgrade-notice';
import { locales, resolveLocale } from '@/lib/locale';
import { getSiteCmsCopy } from '@/lib/site-cms-content';

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

  const siteCopy = getSiteCmsCopy(locale);

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">
      <LegalServiceSchema locale={locale} />
      <SiteHeader
        locale={locale}
        brand={siteCopy.brand}
        nav={{
          services: siteCopy.nav.services,
          resources: siteCopy.nav.resources,
          process: siteCopy.nav.process,
          blog: siteCopy.nav.blog,
          faq: siteCopy.nav.faq,
        }}
        ctaButton={siteCopy.cta.button}
        headerNavigation={siteCopy.headerNavigation}
      />
      <SiteUpgradeNotice locale={locale} />
      <main>{children}</main>
      <SiteFooter locale={locale} />
      <FloatingActions locale={locale} labels={siteCopy.floatingActions} />
    </div>
  );
}
