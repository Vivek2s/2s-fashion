/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The EC2 deploy runs .next/standalone/apps/web/server.js under pm2, so the
  // standalone bundle is the deploy artifact — not an optimisation.
  output: 'standalone',
  transpilePackages: ['@fashion-store/shared-types'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lassepedersen.biz' },
    ],
  },
};
module.exports = nextConfig;
