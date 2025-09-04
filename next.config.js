/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    domains: ['mapleepoch.com', 'api.mapleepoch.com', 'api.www.mapleepoch.com', 'www.mapleepoch.com', 'images.pexels.com'],
  },
  trailingSlash: true,
  experimental: {
    forceSwcTransforms: true,
  },
  async rewrites() {
    return [
      {
        source: '/:slug',
        destination: '/article/:slug',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?!.*text/html).*', // Only rewrite for non-HTML requests or when slug doesn't match existing pages
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/article/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/news/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
  // Disable static optimization for dynamic content
  output: 'standalone',
  // Ensure all dynamic routes are handled properly
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Add error handling for build process
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Optimize for deployment
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  // Disable static page generation for dynamic content
  generateStaticParams: false,
};

module.exports = nextConfig;