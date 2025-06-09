import { getBlogPosts, getProfile, BlogPost } from "@/lib/strapi";
import Link from "next/link";
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
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const revalidate = 300; // 5분마다 재생성

export default async function Home() {
  const [posts, profile] = await Promise.all([getBlogPosts(), getProfile()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-4 px-4 sm:py-8">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            꿈의 일환
          </h1>
        </header>

        <main>
          {posts.length > 0 ? (
            <div className="grid gap-4 sm:gap-8">
              {posts.map((post: BlogPost) => {
                const contentText = post.content
                  .replace(/[#*\-\n]/g, " ")
                  .trim();

                return (
                  <Link key={post.id} href={`/posts/${post.slug}`}>
                    <article className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                        {contentText.substring(0, 80)}...
                      </p>
                      <div className="text-xs sm:text-sm text-gray-500">
                        <time dateTime={post.publishedAt}>
                          {formatKoreanDate(post.publishedAt)}
                        </time>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-600 text-base sm:text-lg">
                No blog posts found. Create your first post in Strapi!
              </p>
            </div>
          )}
        </main>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 mt-12 sm:mt-16">
          프로필
        </h2>

        {profile && (
          <section className="mb-12 sm:mb-16">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                {profile.title}
              </h2>

              {profile.biography && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    소개
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profile.biography}
                  </p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                {profile.career && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      경력
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown components={markdownComponents}>
                        {profile.career}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {profile.education && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      학력
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown components={markdownComponents}>
                        {profile.education}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {profile.contact && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    연락처
                  </h3>
                  <div className="text-gray-700">
                    {typeof profile.contact === "object" &&
                    profile.contact !== null ? (
                      <div className="space-y-1">
                        {profile.contact.email && (
                          <p>
                            이메일:{" "}
                            <a
                              href={`mailto:${profile.contact.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {profile.contact.email}
                            </a>
                          </p>
                        )}
                        {profile.contact.phone && (
                          <p>전화: {profile.contact.phone}</p>
                        )}
                        {profile.contact.linkedin && (
                          <p>
                            LinkedIn:{" "}
                            <a
                              href={profile.contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.contact.linkedin}
                            </a>
                          </p>
                        )}
                        {profile.contact.github && (
                          <p>
                            GitHub:{" "}
                            <a
                              href={profile.contact.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.contact.github}
                            </a>
                          </p>
                        )}
                      </div>
                    ) : profile.contact ? (
                      <p>{profile.contact}</p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
