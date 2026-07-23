/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransitions: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  outputFileTracingExcludes: {
    '*': [
      './esc-skills-main/**',
      './videoforge/**',
      './remotion-danos-aparentes/**',
      './videos/**',
      './damage-model/**',
      './docs/**',
      './PDF/**',
      './outputs/**',
      './wireframes/**',
      './analysis/**',
      './deliverables/**',
      './.agents/**',
      './.claude/**',
      './.cursor/**',
    ],
  },
};

export default nextConfig;
