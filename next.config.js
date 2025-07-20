/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  eslint: {
    // Временно отключаем ESLint проверки во время билда
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Также можно отключить проверки TypeScript во время билда если нужно
    // ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { dev, isServer }) => {
    // Performance optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
  // Добавляем экспериментальные функции для совместимости
  experimental: {
    // forceSwcTransforms: true,
  },
};

module.exports = nextConfig;