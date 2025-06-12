import { getBlogPosts, BlogPost } from "@/lib/strapi";
import Link from "next/link";
import Navigation from "@/components/Navigation";

const formatKoreanDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
};

export const revalidate = 604800; // 1주일(7일)마다 재생성

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex flex-col gap-12 sm:gap-20 items-center justify-start px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-20 w-full">
          <Navigation />
          <div className="max-w-4xl w-full">
            <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 items-start justify-start w-full">
              {posts.length > 0 ? (
                posts
                  .sort(
                    (a, b) =>
                      new Date(b.publishedAt).getTime() -
                      new Date(a.publishedAt).getTime()
                  )
                  .map((post: BlogPost) => {
                    const contentText = post.content
                      .replace(/[#*\\-\\n]/g, " ")
                      .trim();

                    return (
                      <Link key={post.id} href={`/posts/${post.slug}`}>
                        <div className="w-full cursor-pointer hover:opacity-80 transition-opacity group">
                          <div className="flex flex-col gap-2 sm:gap-3 items-start justify-start w-full">
                            <div>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-end justify-start leading-none">
                                <h2 className="font-bold text-slate-950 dark:text-white text-xl sm:text-2xl lg:text-3xl leading-6 sm:leading-8 lg:leading-9">
                                  {post.title}
                                </h2>
                                <div className="font-normal text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-4 sm:leading-5">
                                  <p className="whitespace-pre">
                                    {formatKoreanDate(post.publishedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="font-normal text-slate-950 dark:text-gray-200 text-sm sm:text-base leading-6 sm:leading-7 line-clamp-2">
                              {contentText.substring(0, 180)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
              ) : (
                <div className="text-center py-6 sm:py-8 lg:py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                    No blog posts found. Create your first post in Strapi!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
