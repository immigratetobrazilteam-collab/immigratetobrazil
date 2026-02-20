'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { trackAnalyticsEvent } from '@/lib/analytics-events';
import { copy } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

type FloatingActionsProps = {
  locale: Locale;
};

export function FloatingActions({ locale }: FloatingActionsProps) {
  const [showTop, setShowTop] = useState(false);
  const t = copy[locale].floatingActions;

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 480);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-civic-300 bg-civic-700 text-white shadow-card transition hover:-translate-y-0.5 hover:bg-civic-800"
          aria-label={t.top}
          title={t.top}
        >
          ↑
        </button>
      ) : null}

      <a
        href={siteConfig.contact.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackAnalyticsEvent('contact_click', {
            contact_method: 'whatsapp',
            source: 'floating_actions',
            locale,
          })
        }
        aria-label={`${t.whatsapp} ${siteConfig.contact.whatsappNumber}`}
        title={t.whatsapp}
        className="pointer-events-auto group inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#0f5132]/20 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-glow sm:h-auto sm:w-auto sm:gap-2 sm:rounded-2xl sm:border-[#0c8d4a] sm:bg-[#25D366] sm:px-2.5 sm:py-2"
      >
        <span className="relative inline-flex h-11 w-11 overflow-hidden rounded-full border border-sand-200 shadow-sm">
          <Image
            src={siteConfig.contact.whatsappProfileImage}
            alt="Immigrate to Brazil WhatsApp profile image"
            fill
            sizes="44px"
            className="object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#25D366] text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="h-3 w-3" aria-hidden="true">
              <path d="M19.1 17.2c-.3-.2-1.7-.9-1.9-1-.3-.1-.5-.2-.8.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.5 0 1.4 1 2.9 1.1 3.1.1.2 2 3.1 4.8 4.3.7.3 1.2.5 1.7.6.7.2 1.3.1 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
            </svg>
          </span>
        </span>

        <span className="hidden pr-1 text-left sm:block">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d9ffe8]">{t.whatsappTag}</span>
          <span className="block text-xs font-semibold text-white">{t.whatsapp}</span>
        </span>
      </a>
    </div>
  );
}
