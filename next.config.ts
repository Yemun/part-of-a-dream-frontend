import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // 성능 최적화
  compress: true,
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // 실험적 기능으로 성능 개선
  experimental: {
    // next-intl 최적화
    optimizePackageImports: ['next-intl'],
  },
  
  // 번들 최적화
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 클라이언트 사이드 번들 최적화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            intl: {
              name: 'intl',
              test: /[\\/]node_modules[\\/](next-intl)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
};

export default withNextIntl(withContentlayer(nextConfig));
