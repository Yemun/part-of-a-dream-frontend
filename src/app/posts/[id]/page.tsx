import { getBlogPost, getAdjacentPosts } from "@/lib/strapi";
import { notFound } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import RelativeTime from "@/components/RelativeTime";
import PostNavigation from "@/components/PostNavigation";

export const revalidate = 604800; // 1주일(7일)마다 재생성

// 정적 경로 생성 - 주요 포스트들을 미리 생성
export async function generateStaticParams() {
  try {
    const { getBlogPosts } = await import("@/lib/strapi");
    const posts = await getBlogPosts();

    return posts.map((post) => ({
      id: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const [post, adjacentPosts] = await Promise.all([
    getBlogPost(id),
    getAdjacentPosts(id),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <PageLayout customPadding="pt-8 pb-36 sm:pt-12 sm:pb-36 lg:pt-20 lg:pb-52">
      <article>
        <header className="mb-6 sm:mb-8">
          <h1 className="font-bold text-slate-950 dark:text-white text-2xl sm:text-3xl lg:text-4xl leading-7 sm:leading-9 lg:leading-10 mb-3 sm:mb-4">
            {post.title}
          </h1>
          <div className="font-normal text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-5 sm:leading-6">
            <time dateTime={post.publishedAt}>
              <RelativeTime dateString={post.publishedAt} />
            </time>
          </div>
        </header>

        <MarkdownRenderer content={post.content} />
        
        <PostNavigation 
          previous={adjacentPosts.previous} 
          next={adjacentPosts.next} 
        />
      </article>
    </PageLayout>
  );
}
