/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // self-contained server bundle for EC2 deploys
  outputFileTracingRoot: `${__dirname}/../..`,
  transpilePackages: ['@fashion-store/shared-types'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lassepedersen.biz' },
      { protocol: 'https', hostname: '2sfashion-products.s3.ap-south-1.amazonaws.com' },
    ],
  },
};
module.exports = nextConfig;
