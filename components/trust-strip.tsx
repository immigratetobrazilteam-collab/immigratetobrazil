import { copy } from '@/lib/i18n';
import { getTrustStats } from '@/lib/content';
import type { Locale } from '@/lib/types';

interface TrustStripProps {
  locale: Locale;
}

export function TrustStrip({ locale }: TrustStripProps) {
  const stats = getTrustStats(locale);
  const t = copy[locale];

  return (
    <section className="border-b border-sand-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.sections.trustTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <article
              key={`${item.value}-${item.label}`}
              className="rounded-2xl border border-sand-200 bg-sand-50/70 p-5 shadow-sm"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <p className="font-display text-3xl text-ink-900">{item.value}</p>
              <p className="mt-2 text-sm text-ink-700">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
