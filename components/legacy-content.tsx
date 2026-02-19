import Image from 'next/image';
import Link from 'next/link';

import { copy } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';
import type { LegacyDocument, Locale } from '@/lib/types';

interface LegacyContentProps {
  locale: Locale;
  document: LegacyDocument;
}

export function LegacyContent({ locale, document }: LegacyContentProps) {
  const t = copy[locale];

  return (
    <div className="bg-sand-50">
      <section className="border-b border-sand-200 bg-gradient-to-br from-sand-100 via-sand-50 to-civic-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">{t.sections.migrationTitle}</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink-900 sm:text-5xl">{document.heading}</h1>
            <p className="mt-5 max-w-2xl text-ink-700">{document.description}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.14em] text-ink-500">Source: {document.sourcePath}</p>
          </div>

          {document.heroImage ? (
            <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
              <Image
                src={document.heroImage}
                alt={document.heroImageAlt || document.heading}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {document.sections.map((section) => (
            <article key={`${section.title}-${section.paragraphs[0] || 'empty'}`} className="rounded-2xl border border-sand-200 bg-white p-6">
              <h2 className="font-display text-2xl text-ink-900">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {document.bullets.length ? (
          <aside className="mt-8 rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="font-display text-2xl text-ink-900">Key points</h3>
            <ul className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
              {document.bullets.map((bullet) => (
                <li key={bullet}>• {bullet}</li>
              ))}
            </ul>
          </aside>
        ) : null}

        <div className="mt-10 rounded-2xl border border-civic-300 bg-civic-50 p-6">
          <p className="text-sm text-ink-800">{t.sections.migrationSubtitle}</p>
          <Link
            href={localizedPath(locale, '/contact')}
            className="mt-4 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-sand-50"
          >
            {t.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
}
