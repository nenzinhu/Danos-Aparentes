/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransition: true,
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
