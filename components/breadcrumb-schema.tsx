type BreadcrumbItem = {
  name: string;
  href: string;
};

type BreadcrumbSchemaProps = {
  items: BreadcrumbItem[];
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

function toAbsoluteUrl(href: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  return new URL(href.startsWith('/') ? href : `/${href}`, BASE_URL).toString();
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items.length) {
    return null;
  }

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.href),
    })),
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
