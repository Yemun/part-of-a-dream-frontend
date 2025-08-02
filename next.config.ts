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
  
  // 운영 환경 최적화
  ...(process.env.NODE_ENV === 'production' && {
    experimental: {
      optimizePackageImports: ['next-intl'],
    },
    webpack: (config, { dev }) => {
      if (!dev) {
        // 운영 환경에서만 적용되는 최적화
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization.splitChunks,
            cacheGroups: {
              ...config.optimization.splitChunks.cacheGroups,
              // next-intl을 별도 청크로 분리
              intl: {
                name: 'intl',
                test: /[\\/]node_modules[\\/](next-intl)[\\/]/,
                chunks: 'all',
                priority: 30,
                enforce: true,
              },
            },
          },
        };
      }
      return config;
    },
  }),
};

export default withNextIntl(withContentlayer(nextConfig));
