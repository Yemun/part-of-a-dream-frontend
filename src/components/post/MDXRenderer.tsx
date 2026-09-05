/* eslint-disable react-hooks/static-components */
import { useMDXComponent } from "next-contentlayer2/hooks";
import dynamic from "next/dynamic";
import type { CSSProperties, IframeHTMLAttributes } from "react";
import PaletteEntry from "@/components/side-project/palette/PaletteEntry";

// Image 컴포넌트를 동적 로딩으로 최적화
const Image = dynamic(() => import("next/image"), {
  loading: () => <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-[400px] w-full rounded" />,
});

interface MDXRendererProps {
  code: string;
}

interface ImgComponentProps {
  src: string;
  alt: string;
}

function ImgComponent({ src, alt }: ImgComponentProps) {
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
}

// 원문의 style을 React style 객체로 정규화한다. 문자열(`style="a: b"`)과 객체(`style={{a: "b"}}`) 모두 받는다.
// border 계열은 사이트 공통 테두리(className)로 대체하므로 버린다.
function normalizeStyle(style: unknown): CSSProperties | undefined {
  const result: Record<string, string> = {};

  if (typeof style === "string") {
    for (const declaration of style.split(";")) {
      const separator = declaration.indexOf(":");
      if (separator === -1) continue;
      const property = declaration.slice(0, separator).trim();
      const value = declaration.slice(separator + 1).trim();
      if (!property || !value) continue;
      const key = property.startsWith("--")
        ? property
        : property.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
      result[key] = value;
    }
  } else if (style && typeof style === "object") {
    Object.assign(result, style as Record<string, string>);
  } else {
    return undefined;
  }

  for (const key of Object.keys(result)) {
    if (key.toLowerCase().startsWith("border")) delete result[key];
  }
  return result;
}

type IframeComponentProps = Omit<
  IframeHTMLAttributes<HTMLIFrameElement>,
  "style"
> & {
  style?: unknown;
  // 마크다운 원문의 HTML 속성 표기(소문자)
  allowfullscreen?: boolean | string;
};

function IframeComponent({
  style,
  allowfullscreen,
  allowFullScreen,
  className = "",
  ...rest
}: IframeComponentProps) {
  return (
    <figure>
      <iframe
        {...rest}
        style={normalizeStyle(style)}
        allowFullScreen={allowFullScreen ?? allowfullscreen !== undefined}
        className={`w-full border-[0.5px] border-black dark:border-white ${className}`}
      />
    </figure>
  );
}

// 본문 `[PaletteEntry.tsx]` 자리에 인라인 임베드되는 사이드 프로젝트 컴포넌트.
// 이미지·iframe과 같은 0.5px 외곽선으로 감싸 본문과 구분한다.
function PaletteEmbed() {
  return (
    <div className="not-prose my-6 sm:my-8 border-[0.5px] border-black dark:border-white p-4 sm:p-6">
      <PaletteEntry />
    </div>
  );
}

const mdxComponents = {
  img: ImgComponent,
  // remark-obsidian이 본문의 <iframe>을 <Iframe>으로 승격시킨다
  Iframe: IframeComponent,
  PaletteEntry: PaletteEmbed,
};

export default function MDXRenderer({ code }: MDXRendererProps) {
  const Component = useMDXComponent(code);

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <Component components={mdxComponents} />
    </div>
  );
}
