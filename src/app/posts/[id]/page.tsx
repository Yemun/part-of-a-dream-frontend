import { getPostWithDetails } from "@/lib/content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  createMetadata,
  extractDescription,
  createArticleSchema,
} from "@/lib/metadata";
import MDXRenderer from "@/components/post/MDXRenderer";
import RelativeTime from "@/components/common/RelativeTime";
import PostNavigation from "@/components/post/PostNavigation";
import CommentSection from "@/components/comment/CommentSection";

// 정적 경로 생성 - 모든 포스트를 빌드타임에 미리 생성
export async function generateStaticParams() {
  try {
    const { getBlogPosts } = await import("@/lib/content");
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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const { post } = await getPostWithDetails(id);

    if (!post) {
      return createMetadata({
        title: "포스트를 찾을 수 없습니다",
        description: "요청하신 포스트를 찾을 수 없습니다.",
      });
    }

    const description = extractDescription(post.content);
    const publishedTime = new Date(post.publishedAt).toISOString();

    return createMetadata({
      title: post.title,
      description,
      keywords: [post.title, "서을"],
      url: `https://yemun.kr/posts/${post.slug}`,
      type: "article",
      publishedTime,
      authors: ["예문"],
      tags: [post.title],
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return createMetadata();
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  // 포스트 데이터와 댓글을 서버에서 함께 가져오기 (API 비용 최적화)
  const { post, adjacentPosts, comments } = await getPostWithDetails(id);

  if (!post) {
    notFound();
  }

  // Article schema for rich snippets
  const articleSchema = createArticleSchema({
    title: post.title,
    description: extractDescription(post.content),
    author: "예문",
    publishedTime: post.publishedAt,
    slug: post.slug,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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

        <MDXRenderer code={post.body.code} />

        <PostNavigation
          previous={adjacentPosts.previous}
          next={adjacentPosts.next}
        />

        <CommentSection postSlug={post.slug} initialComments={comments} />
      </article>
    </>
  );
}
