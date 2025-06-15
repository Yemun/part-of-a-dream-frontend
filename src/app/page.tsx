import { getBlogPosts, BlogPost } from "@/lib/strapi";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import RelativeTime from "@/components/RelativeTime";

export const revalidate = 604800; // 1주일(7일)마다 재생성

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <PageLayout>
      <div className="flex flex-col gap-4 sm:gap-8 items-start justify-start w-full">
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
                  <div className="w-full cursor-pointer hover:bg-slate-50 py-2 px-2 rounded-xl sm:py-5 sm:px-5 dark:hover:bg-gray-900 transition-opacity transition-colors group ">
                    <div className="flex flex-col gap-2 sm:gap-3 items-start justify-start w-full">
                      <div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-end justify-start leading-none">
                          <h2 className="font-bold text-slate-950 dark:text-white text-l sm:text-xl lg:text-2xl leading-6 sm:leading-8 lg:leading-9 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {post.title}
                          </h2>
                          <div className="font-normal text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-3 sm:leading-5">
                            <p className="whitespace-pre">
                              <RelativeTime dateString={post.publishedAt} />
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="font-normal text-slate-950 dark:text-slate-200 text-sm sm:text-base leading-6 sm:leading-7 line-clamp-2">
                        {contentText.substring(0, 180)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
        ) : (
          <div className="text-center py-6 sm:py-8 lg:py-12">
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
              No blog posts found. Create your first post in Strapi!
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
