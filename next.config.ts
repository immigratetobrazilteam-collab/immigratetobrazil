import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const legacyTracingGlobs = [
  './content/generated/**/*.json',
  './content/cms/managed-legacy/**/*.json',
  './content/cms/discover-pages/**/*.json',
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 72, 75, 85],
  },
  outputFileTracingIncludes: {
    '/*': legacyTracingGlobs,
  },
  async redirects() {
    return [
      {
        source: '/blog/blog-:state.html',
        destination: '/en/state-guides/everything-you-need-to-know-about-:state',
        permanent: true,
      },
      {
        source: '/blog/blog-:state',
        destination: '/en/state-guides/everything-you-need-to-know-about-:state',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/blog/blog-:state.html',
        destination: '/:locale/state-guides/everything-you-need-to-know-about-:state',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/blog/blog-:state',
        destination: '/:locale/state-guides/everything-you-need-to-know-about-:state',
        permanent: true,
      },
      {
        source: '/faq/:slug.html',
        destination: '/en/faq/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/faq/:slug.html',
        destination: '/:locale/faq/:slug',
        permanent: true,
      },
      {
        source: '/discover/index.html',
        destination: '/en/discover',
        permanent: true,
      },
      {
        source: '/discover/:path*/index.html',
        destination: '/en/discover/:path*',
        permanent: true,
      },
      {
        source: '/discover/:path*.html',
        destination: '/en/discover/:path*',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/discover/index.html',
        destination: '/:locale/discover',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/discover/:path*/index.html',
        destination: '/:locale/discover/:path*',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/discover/:path*.html',
        destination: '/:locale/discover/:path*',
        permanent: true,
      },
      {
        source: '/consultation/index.html',
        destination: '/en/consultation',
        permanent: true,
      },
      {
        source: '/:locale(en|es|pt|fr)/consultation/index.html',
        destination: '/:locale/consultation',
        permanent: true,
      },
    ];
  },
  async headers() {
    const contentCacheHeaders = [
      {
        key: 'Cache-Control',
        value: 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    ];

    return [
      {
        source: '/:locale(en|es|pt|fr)/discover/:path*',
        headers: contentCacheHeaders,
      },
      {
        source: '/:locale(en|es|pt|fr)/state-guides/:path*',
        headers: contentCacheHeaders,
      },
      {
        source: '/:locale(en|es|pt|fr)/services/:path*',
        headers: contentCacheHeaders,
      },
      {
        source: '/:locale(en|es|pt|fr)/faq/:path*',
        headers: contentCacheHeaders,
      },
      {
        source: '/:locale(en|es|pt|fr)/about/:path*',
        headers: contentCacheHeaders,
      },
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/robots.txt',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: false,
  },
});
