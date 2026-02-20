'use client';

import { useEffect, useState } from 'react';

import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

type FloatingActionsProps = {
  locale: Locale;
};

function copy(locale: Locale) {
  if (locale === 'es') {
    return { whatsapp: 'WhatsApp', top: 'Volver arriba' };
  }
  if (locale === 'pt') {
    return { whatsapp: 'WhatsApp', top: 'Voltar ao topo' };
  }
  if (locale === 'fr') {
    return { whatsapp: 'WhatsApp', top: 'Retour en haut' };
  }
  return { whatsapp: 'WhatsApp', top: 'Back to top' };
}

export function FloatingActions({ locale }: FloatingActionsProps) {
  const [showTop, setShowTop] = useState(false);
  const t = copy(locale);

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
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-300 bg-white text-ink-800 shadow-card transition hover:-translate-y-0.5 hover:border-civic-400 hover:text-civic-700"
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
        aria-label={t.whatsapp}
        title={t.whatsapp}
        className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0e7a3f] bg-gradient-to-br from-[#25d366] to-[#128c7e] text-lg font-black text-white shadow-[0_12px_32px_rgba(18,140,126,0.35)] transition hover:-translate-y-0.5 hover:scale-105"
      >
        <span className="absolute -z-10 h-12 w-12 rounded-full bg-[#f5c400]/25 blur-sm" />
        ☎
      </a>
    </div>
  );
}
