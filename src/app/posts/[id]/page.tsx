import { getBlogPost, getAdjacentPosts, getComments } from "@/lib/strapi";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/post/MarkdownRenderer";
import RelativeTime from "@/components/common/RelativeTime";
import PostNavigation from "@/components/post/PostNavigation";
import CommentSection from "@/components/comment/CommentSection";

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

  // 포스트를 가져온 후 댓글을 가져옵니다
  const initialComments = await getComments(post.documentId);

  return (
    <article>
      <header className="mb-10 sm:mb-14">
        <h1 className="font-bold text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl leading-7 sm:leading-9 lg:leading-10 mb-4 sm:mb-4">
          {post.title}
        </h1>
        <div className="font-normal text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-5 sm:leading-6">
          <time dateTime={post.publishedAt}>
            <RelativeTime dateString={post.publishedAt} absolute />
          </time>
        </div>
      </header>

      <MarkdownRenderer content={post.content} />

      <PostNavigation
        previous={adjacentPosts.previous}
        next={adjacentPosts.next}
      />

      <CommentSection
        blogId={post.documentId}
        initialComments={initialComments}
      />
    </article>
  );
}
