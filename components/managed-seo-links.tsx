import Link from 'next/link';

import { isExternalHref, resolveManagedSeoHref, type ManagedSeoLink } from '@/lib/managed-seo';
import type { Locale } from '@/lib/types';

type ManagedSeoLinksProps = {
  locale: Locale;
  title: string;
  links: ManagedSeoLink[];
};

export function ManagedSeoLinks({ locale, title, links }: ManagedSeoLinksProps) {
  if (!links.length) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl text-ink-900">{title}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const href = resolveManagedSeoHref(locale, link.href);
            const external = isExternalHref(href);

            if (external) {
              return (
                <a
                  key={`${link.label}-${href}`}
                  href={href}
                  className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={`${link.label}-${href}`}
                href={href}
                className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
