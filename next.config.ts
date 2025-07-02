import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  // 성능 최적화 (optimizeCss 제거 - critters 의존성 문제)
  // 압축 활성화
  compress: true,
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default withContentlayer(nextConfig);
