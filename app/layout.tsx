import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';

import { Analytics } from '@/components/analytics';

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

export const metadata: Metadata = {
  title: {
    default: 'Immigrate to Brazil | Modern Immigration Advisory',
    template: '%s | Immigrate to Brazil',
  },
  description:
    'Modern immigration advisory platform for Brazil visas, residency strategy, and relocation execution.',
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
