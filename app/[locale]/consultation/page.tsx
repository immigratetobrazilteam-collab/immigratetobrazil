import { permanentRedirect } from 'next/navigation';

import { resolveLocale } from '@/lib/i18n';
import { localizedPath } from '@/lib/routes';

export default async function ConsultationRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  permanentRedirect(localizedPath(locale, '/visa-consultation'));
}
