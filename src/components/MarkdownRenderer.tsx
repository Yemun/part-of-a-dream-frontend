import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none
                   
                    prose-p:mb-4 sm:prose-p:mb-5 prose-p:leading-8 prose-p:text-base sm:prose-p:text-lg prose-p:whitespace-pre-wrap
                    
                    prose-img:rounded-xl prose-img:mb-8 sm:prose-img:mb-12 prose-img:bg-slate-100 dark:prose-img:bg-gray-800"
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
