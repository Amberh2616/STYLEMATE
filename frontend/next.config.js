/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開發環境不使用靜態導出
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
    assetPrefix: '/STYLEMATE',
    basePath: '/STYLEMATE',
  } : {}),
  images: {
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { isServer }) => {
    // Fabric.js 需要特殊配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig