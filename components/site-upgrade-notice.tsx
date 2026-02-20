import { BrandLogo } from '@/components/brand-logo';
import { getSiteCmsCopy } from '@/lib/site-cms-content';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

interface SiteUpgradeNoticeProps {
  locale: Locale;
}

export function SiteUpgradeNotice({ locale }: SiteUpgradeNoticeProps) {
  const contact = siteConfig.contact;
  const notice = getSiteCmsCopy(locale).upgradeNotice;

  if (!notice.enabled) {
    return null;
  }

  return (
    <section className="border-b border-sand-200 bg-gradient-to-r from-ink-900 via-civic-800 to-ink-900 text-sand-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-sand-100/20 bg-white/10 p-4 shadow-glow backdrop-blur sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sand-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-civic-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <BrandLogo variant="mark" className="h-14 w-14 rounded-2xl border border-sand-100/30 bg-white/95 p-1.5" />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand-200">{notice.eyebrow}</p>
                <h2 className="font-display text-2xl leading-tight text-white sm:text-3xl">
                  {notice.title}
                </h2>
                <p className="max-w-4xl text-sm leading-relaxed text-sand-100 sm:text-base">
                  {notice.body}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#f5c400]/70 bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:-translate-y-0.5 hover:bg-[#32df75]"
              >
                {notice.whatsappButton}
              </a>
              <a
                href={`mailto:${contact.clientEmail}`}
                className="inline-flex items-center justify-center rounded-full border border-sand-100/35 bg-white/15 px-5 py-2.5 text-sm font-semibold text-sand-50 transition hover:-translate-y-0.5 hover:bg-white/25"
              >
                {notice.emailButton}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
