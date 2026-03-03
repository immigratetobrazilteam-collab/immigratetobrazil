import Link from 'next/link';

import type { RouteLink, RoutePrefixGroup } from '@/lib/route-index';

export function RouteGroupCards({ groups }: { groups: RoutePrefixGroup[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <article key={group.key} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl text-ink-900">{group.label}</h2>
            <span className="rounded-full border border-civic-200 bg-civic-50 px-2.5 py-1 text-xs font-semibold text-civic-800">
              {group.count}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {group.sample.map((link) => (
              <Link
                key={link.slug}
                href={link.href}
                className="block rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-ink-800 transition hover:border-civic-300 hover:bg-white"
              >
                {link.title}
              </Link>
            ))}
          </div>
          <Link
            href={group.href}
            className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-civic-700 hover:text-civic-800"
          >
            Open section
          </Link>
        </article>
      ))}
    </div>
  );
}

export function RouteLinkGrid({ links, className }: { links: RouteLink[]; className?: string }) {
  return (
    <div className={className || 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
      {links.map((link) => (
        <Link
          key={link.slug}
          href={link.href}
          className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-civic-300"
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
}
