import ReactMarkdown from "react-markdown";

/* eslint-disable @typescript-eslint/no-explicit-any */
const markdownComponents: any = {
  img: ({ src, alt }: any) => (
    <span className="block">
      <img src={src} alt={alt} />
      {alt && (
        <span className="block text-sm sm:text-base text-gray-500 dark:text-gray-400 italic mt-2 sm:mt-3 mb-8 sm:mb-12 text-center">
          {alt}
        </span>
      )}
    </span>
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
