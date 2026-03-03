import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/types';

type LegalServiceSchemaProps = {
  locale: Locale;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

export function LegalServiceSchema({ locale }: LegalServiceSchemaProps) {
  const brandName = siteConfig.brand.name;
  const logoUrl = `${BASE_URL}${siteConfig.brand.logoSchemaPath}`;
  const ogImageUrl = `${BASE_URL}${siteConfig.brand.ogImagePath}`;

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LegalService',
        '@id': `${BASE_URL}/#legalservice`,
        name: brandName,
        url: `${BASE_URL}/${locale}`,
        image: ogImageUrl,
        logo: logoUrl,
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
        name: brandName,
        url: BASE_URL,
        logo: logoUrl,
        email: siteConfig.contact.primaryEmail,
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: brandName,
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
