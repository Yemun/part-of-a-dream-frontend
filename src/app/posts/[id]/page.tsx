import { getBlogPost } from "@/lib/strapi";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

const formatKoreanDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const markdownComponents: any = {
  h1: ({ children }: any) => (
    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-3 sm:mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-sm sm:text-lg font-semibold text-gray-900 mt-2 sm:mt-3 mb-1 sm:mb-2">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-outside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base pl-5">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base pl-5">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li>{children}</li>,
  code: ({ children }: any) => (
    <code className="bg-gray-100 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-gray-100 p-2 sm:p-4 rounded-lg overflow-x-auto mb-3 sm:mb-4 text-xs sm:text-sm">
      {children}
    </pre>
  ),
  img: ({ src, alt }: any) => (
    <span className="block mb-3 sm:mb-4">
      <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" />
      {alt && (
        <span className="block text-xs sm:text-sm text-gray-500 italic mt-1 sm:mt-2">
          {alt}
        </span>
      )}
    </span>
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const revalidate = 300; // 5분마다 재생성

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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-4 px-4 sm:py-8">
        <nav className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
          >
            ← Back to all posts
          </Link>
        </nav>

        <article className="p-4 sm:p-8">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="text-gray-600">
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
  );
}
