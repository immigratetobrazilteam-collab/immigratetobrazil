import type { Locale } from '@/lib/types';
import { getCodeManagedPagesCopy } from '@/lib/code-managed-pages-content';

interface CalendlyEmbedProps {
  locale: Locale;
  calendlyUrl: string;
  title?: string;
  description?: string;
}

export function CalendlyEmbed({ locale, calendlyUrl, title, description }: CalendlyEmbedProps) {
  const t = getCodeManagedPagesCopy(locale).calendlyEmbed;

  return (
    <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
      <h2 className="font-display text-3xl text-ink-900">{title || t.title}</h2>
      <p className="mt-3 text-sm text-ink-700">{description || t.description}</p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-sand-200">
        <iframe
          src={calendlyUrl}
          title={title || t.title}
          className="h-[700px] w-full"
          loading="lazy"
        />
      </div>
    </section>
  );
}
