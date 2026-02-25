import { localizedPath } from '@/lib/routes';
import type { Locale } from '@/lib/types';

export type ManagedSeoFaqItem = {
  question: string;
  answer: string;
};

export type ManagedSeoLink = {
  href: string;
  label: string;
};

export type ManagedSeoCopy = {
  metaTitleTemplate: string;
  metaDescription: string;
  keywords: string[];
  faq: ManagedSeoFaqItem[];
  internalLinksTitle: string;
  internalLinks: ManagedSeoLink[];
};

export function isExternalHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(href.trim());
}

export function resolveManagedSeoHref(locale: Locale, href: string) {
  const trimmed = href.trim();
  if (!trimmed) return `/${locale}`;
  if (isExternalHref(trimmed)) return trimmed;
  if (trimmed === '/sitemap.xml' || trimmed === '/robots.txt') return trimmed;
  if (trimmed.startsWith('/en/') || trimmed.startsWith('/es/') || trimmed.startsWith('/pt/') || trimmed.startsWith('/fr/')) {
    return trimmed;
  }
  return localizedPath(locale, trimmed);
}

export function renderMetaTitle(template: string, replacements: Record<string, string>, fallback: string) {
  const normalized = template?.trim();
  if (!normalized) return fallback;

  let output = normalized;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.replaceAll(`{{${key}}}`, value);
  }

  return output;
}
