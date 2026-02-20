import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/'],
      },
    ],
    host: BASE_URL,
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
