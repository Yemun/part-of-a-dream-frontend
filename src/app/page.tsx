import { getBlogPosts, BlogPost } from "@/lib/strapi";
import Link from "next/link";

const formatKoreanDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-4 px-4 sm:py-8">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            꿈의 일환
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            을지로에서 디자인 시스템을 만들고 있습니다.
          </p>
        </header>

        <main>
          {posts.length > 0 ? (
            <div className="grid gap-4 sm:gap-8">
              {posts.map((post: BlogPost) => {
                const contentText = post.Content.replace(
                  /[#*\-\n]/g,
                  " "
                ).trim();

                return (
                  <Link key={post.id} href={`/posts/${post.Slug}`}>
                    <article className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 hover:text-blue-600 transition-colors leading-tight">
                        {post.Title}
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
      </div>
    </div>
  );
}
