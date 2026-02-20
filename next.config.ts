import type { NextConfig } from 'next';

const legacyTracingGlobs = [
  './about/**/*.html',
  './accessibility/**/*.html',
  './blog/**/*.html',
  './contact/**/*.html',
  './discover/**/*.html',
  './faq/**/*.html',
  './home/**/*.html',
  './policies/**/*.html',
  './resources-guides-brazil/**/*.html',
  './services/**/*.html',
  './visa-consultation/**/*.html',
  './es/**/*.html',
  './pt/**/*.html',
  './content/generated/**/*.json',
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  outputFileTracingIncludes: {
    '/*': legacyTracingGlobs,
  },
};

export default nextConfig;
