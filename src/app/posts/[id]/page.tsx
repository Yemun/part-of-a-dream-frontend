import { getBlogPost } from '@/lib/strapi';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

const formatKoreanDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-4 px-4 sm:py-8">
        <nav className="mb-6 sm:mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
            ← Back to all posts
          </Link>
        </nav>
        
        <article className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {post.Title}
            </h1>
            <div className="text-gray-600">
              <time dateTime={post.publishedAt}>
                {formatKoreanDate(post.publishedAt)}
              </time>
            </div>
          </header>
          
          <div className="prose prose-sm sm:prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">{children}</h1>,
                h2: ({children}) => <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">{children}</h2>,
                h3: ({children}) => <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-3 sm:mt-4 mb-2">{children}</h3>,
                p: ({children}) => <p className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">{children}</ol>,
                li: ({children}) => <li className="ml-2 sm:ml-4">{children}</li>,
                code: ({children}) => <code className="bg-gray-100 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-mono">{children}</code>,
                pre: ({children}) => <pre className="bg-gray-100 p-2 sm:p-4 rounded-lg overflow-x-auto mb-3 sm:mb-4 text-xs sm:text-sm">{children}</pre>
              }}
            >
              {post.Content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}