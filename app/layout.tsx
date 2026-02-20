import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';

import { Analytics } from '@/components/analytics';
import { siteConfig } from '@/lib/site-config';

import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['600', '700', '800'],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.immigratetobrazil.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: '/site.webmanifest',
  title: {
    default: `${siteConfig.brand.name} | Modern Immigration Advisory`,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description:
    'Modern immigration advisory platform for Brazil visas, residency strategy, and relocation execution.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/brand/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand/favicon-64.png', type: 'image/png', sizes: '64x64' },
      { url: '/brand/android-chrome-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/brand/android-chrome-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: `${siteConfig.brand.name} | Modern Immigration Advisory`,
    description:
      'Modern immigration advisory platform for Brazil visas, residency strategy, and relocation execution.',
    url: BASE_URL,
    siteName: siteConfig.brand.name,
    images: [
      {
        url: siteConfig.brand.ogImagePath,
        width: 1200,
        height: 630,
        alt: siteConfig.brand.logoAlt,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [siteConfig.brand.ogImagePath],
  },
  verification: {
    google: siteConfig.seo.googleSiteVerification || undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} font-sans`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
