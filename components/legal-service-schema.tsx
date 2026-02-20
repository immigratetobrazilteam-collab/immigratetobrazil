import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

type LegalServiceSchemaProps = {
  locale: Locale;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

export function LegalServiceSchema({ locale }: LegalServiceSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LegalService',
        '@id': `${BASE_URL}/#legalservice`,
        name: 'Immigrate to Brazil',
        url: `${BASE_URL}/${locale}`,
        image: `${BASE_URL}/brand/og-image.png`,
        logo: `${BASE_URL}/brand/logo-mark-512.png`,
        email: siteConfig.contact.primaryEmail,
        telephone: siteConfig.contact.whatsappNumber,
        areaServed: 'Brazil',
        sameAs: [siteConfig.contact.whatsappLink],
        serviceType: ['Immigration Law', 'Visa Advisory', 'Residency Advisory'],
        availableLanguage: ['English', 'Portuguese', 'Spanish', 'French'],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: siteConfig.contact.primaryEmail,
            telephone: siteConfig.contact.whatsappNumber,
            areaServed: 'BR',
            availableLanguage: ['en', 'pt', 'es', 'fr'],
          },
        ],
        description:
          'Immigration legal advisory for Brazil visas, residency pathways, documentation, and compliance planning.',
      },
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Immigrate to Brazil',
        url: BASE_URL,
        logo: `${BASE_URL}/brand/logo-mark-512.png`,
        email: siteConfig.contact.primaryEmail,
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Immigrate to Brazil',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
