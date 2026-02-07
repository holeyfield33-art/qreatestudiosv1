import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Externalize native modules that Turbopack can't bundle
  serverExternalPackages: [
    'lightningcss',
    'lightningcss-linux-x64-gnu',
    '@tailwindcss/node',
    'sharp',
    'bcryptjs',
    'geoip-lite',
    'isomorphic-dompurify',
    'jsdom',
  ],
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Security: prevent open redirects
  skipTrailingSlashRedirect: false,
  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
