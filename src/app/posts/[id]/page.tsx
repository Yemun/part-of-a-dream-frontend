import { getBlogPost } from "@/lib/strapi";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navigation from "@/components/Navigation";

const formatKoreanDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const markdownComponents: any = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-6 sm:mt-8 mb-4 sm:mb-6">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-5 sm:mt-7 mb-3 sm:mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 sm:mt-5 mb-2 sm:mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="mb-4 sm:mb-5 leading-relaxed text-base sm:text-lg text-gray-800 dark:text-gray-200">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-outside mb-4 sm:mb-5 space-y-2 text-base sm:text-lg pl-6">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside mb-4 sm:mb-5 space-y-2 text-base sm:text-lg pl-6">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li>{children}</li>,
  code: ({ children }: any) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-1 rounded text-sm sm:text-base font-mono text-gray-800 dark:text-gray-200">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-5 rounded-lg overflow-x-auto mb-4 sm:mb-6 text-sm sm:text-base text-gray-800 dark:text-gray-200">
      {children}
    </pre>
  ),
  img: ({ src, alt }: any) => (
    <span className="block mb-3 sm:mb-4">
      <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" />
      {alt && (
        <span className="block text-sm sm:text-base text-gray-500 dark:text-gray-400 italic mt-2 sm:mt-3">
          {alt}
        </span>
      )}
    </span>
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const revalidate = 604800; // 1주일(7일)마다 재생성

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex flex-col gap-12 sm:gap-20 items-center justify-start px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-20 w-full">
          <Navigation />
          <div className="max-w-4xl w-full">
            <article>
              <header className="mb-6 sm:mb-8">
                <h1 className="font-bold text-slate-950 dark:text-white text-2xl sm:text-3xl lg:text-4xl leading-7 sm:leading-9 lg:leading-10 mb-3 sm:mb-4">
                  {post.title}
                </h1>
                <div className="font-normal text-slate-700 dark:text-gray-300 text-sm sm:text-base leading-5 sm:leading-6">
                  <time dateTime={post.publishedAt}>
                    {formatKoreanDate(post.publishedAt)}
                  </time>
                </div>
              </header>

              <div className="prose prose-sm sm:prose-lg max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
