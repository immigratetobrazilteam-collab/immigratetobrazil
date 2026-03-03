import { copy } from '@/lib/i18n';
import { getProcessSteps } from '@/lib/content';
import type { Locale } from '@/lib/types';

interface ProcessTimelineProps {
  locale: Locale;
}

export function ProcessTimeline({ locale }: ProcessTimelineProps) {
  const t = copy[locale];
  const steps = getProcessSteps(locale);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl space-y-3">
          <h2 className="font-display text-3xl text-ink-900 sm:text-4xl">{t.sections.processTitle}</h2>
          <p className="text-ink-700">{t.sections.processSubtitle}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-sand-200 bg-sand-50/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-civic-700">Step {index + 1}</p>
              <h3 className="mt-2 font-display text-2xl text-ink-900">{step.title}</h3>
              <p className="mt-3 text-sm text-ink-700">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
