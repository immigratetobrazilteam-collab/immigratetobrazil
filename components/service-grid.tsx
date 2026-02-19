import Link from 'next/link';

import { copy } from '@/lib/i18n';
import { getServiceCards } from '@/lib/content';
import { localizedPath } from '@/lib/routes';
import type { Locale } from '@/lib/types';

interface ServiceGridProps {
  locale: Locale;
}

export function ServiceGrid({ locale }: ServiceGridProps) {
  const t = copy[locale];
  const services = getServiceCards(locale);

  return (
    <section className="bg-sand-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl space-y-4">
          <h2 className="font-display text-3xl text-ink-900 sm:text-4xl">{t.sections.servicesTitle}</h2>
          <p className="text-ink-700">{t.sections.servicesSubtitle}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.slug}
              className="group rounded-3xl border border-sand-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-civic-300"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-civic-700">Service</p>
              <h3 className="mt-3 font-display text-2xl text-ink-900">{service.title}</h3>
              <p className="mt-3 text-sm text-ink-700">{service.description}</p>
              <ul className="mt-5 space-y-2">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="text-sm text-ink-700">
                    • {highlight}
                  </li>
                ))}
              </ul>
              <Link
                href={localizedPath(locale, '/contact')}
                className="mt-6 inline-flex rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50 transition hover:bg-civic-700"
              >
                {t.cta.button}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
