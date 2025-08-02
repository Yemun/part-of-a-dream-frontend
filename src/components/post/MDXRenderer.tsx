import { useMDXComponent } from "next-contentlayer2/hooks";
import dynamic from "next/dynamic";

// Image 컴포넌트를 동적 로딩으로 최적화
const Image = dynamic(() => import("next/image"), {
  loading: () => <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-[400px] w-full rounded" />,
});

interface MDXRendererProps {
  code: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const mdxComponents: any = {
  img: ({ src, alt }: any) => {
    // alt 텍스트에서 object-fit 속성 파싱
    let displayAlt = alt;
    let objectFitClass = "object-contain"; // 기본값
    
    if (alt && alt.includes(" | ")) {
      const [actualAlt, objectFit] = alt.split(" | ");
      displayAlt = actualAlt.trim();
      
      if (objectFit.trim() === "cover") {
        objectFitClass = "object-cover";
      } else if (objectFit.trim() === "contain") {
        objectFitClass = "object-contain";
      }
    }

    return (
      <figure>
        {src.startsWith("http") ? (
          // 외부 이미지는 Next.js Image 컴포넌트로 최적화
          <Image
            src={src}
            alt={displayAlt}
            width={800}
            height={400}
            className={objectFitClass}
            unoptimized // 외부 이미지는 최적화 비활성화
          />
        ) : (
          // 로컬 이미지는 Next.js Image 컴포넌트 사용
          <Image 
            src={src} 
            alt={displayAlt} 
            width={800} 
            height={400}
            className={objectFitClass}
          />
        )}
        {displayAlt && <figcaption>{displayAlt}</figcaption>}
      </figure>
    );
  },
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
