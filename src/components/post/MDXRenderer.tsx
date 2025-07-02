import { useMDXComponent } from "next-contentlayer2/hooks";
import Image from "next/image";

interface MDXRendererProps {
  code: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const mdxComponents: any = {
  img: ({ src, alt }: any) => (
    <span className="block">
      {src.startsWith("http") ? (
        // 외부 이미지는 Next.js Image 컴포넌트로 최적화
        <Image
          src={src}
          alt={alt}
          width={800}
          height={400}
          className="max-w-full h-auto"
          unoptimized // 외부 이미지는 최적화 비활성화
        />
      ) : (
        // 로컬 이미지는 Next.js Image 컴포넌트 사용
        <Image
          src={src}
          alt={alt}
          width={800}
          height={400}
          className="max-w-full h-auto"
        />
      )}
      {alt && (
        <span className="block text-sm sm:text-base text-gray-500 dark:text-gray-400 italic mt-2 sm:mt-3 mb-8 sm:mb-12 text-center">
          {alt}
        </span>
      )}
    </span>
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function MDXRenderer({ code }: MDXRendererProps) {
  const Component = useMDXComponent(code);

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <Component components={mdxComponents} />
    </div>
  );
}
