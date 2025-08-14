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
    domains: ['mapleepoch.com', 'images.pexels.com'],
  },
  trailingSlash: true,
  experimental: {
    forceSwcTransforms: true,
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