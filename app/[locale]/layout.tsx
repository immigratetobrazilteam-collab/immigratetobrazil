import { notFound } from 'next/navigation';

import { AccessibilityTools } from '@/components/accessibility-tools';
import { FloatingActions } from '@/components/floating-actions';
import { LegalServiceSchema } from '@/components/legal-service-schema';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SiteUpgradeNotice } from '@/components/site-upgrade-notice';
import { locales, resolveLocale } from '@/lib/locale';
import { getSiteCmsCopy } from '@/lib/site-cms-content';
import { getStaticLocales } from '@/lib/static-export';

export function generateStaticParams() {
  return getStaticLocales().map((locale) => ({ locale }));
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
  const skipToContentLabel = locale === 'pt' ? 'Pular para o conteudo principal' : 'Skip to main content';

  return (
    <>
      <AccessibilityTools locale={locale} />
      <div id="site-shell" lang={locale} className="min-h-screen bg-sand-50 text-ink-900">
        <LegalServiceSchema locale={locale} />
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[120] rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-sand-50 focus:not-sr-only"
        >
          {skipToContentLabel}
        </a>
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
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter locale={locale} />
        <FloatingActions locale={locale} labels={siteCopy.floatingActions} />
      </div>
    </>
  );
}
