import type { NextConfig } from 'next';

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
};

export default nextConfig;
