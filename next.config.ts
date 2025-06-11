import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 성능 최적화
  experimental: {
    optimizeCss: true,
  },
  // 압축 활성화
  compress: true,
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // 외부 도메인 prefetch
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Link',
            value: '<https://appealing-badge-1cb5ca360d.strapiapp.com>; rel=preconnect',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
