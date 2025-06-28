import { getPostWithDetails } from "@/lib/strapi";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createMetadata, extractDescription, createArticleSchema } from "@/lib/metadata";
import MarkdownRenderer from "@/components/post/MarkdownRenderer";
import RelativeTime from "@/components/common/RelativeTime";
import PostNavigation from "@/components/post/PostNavigation";
import CommentSection from "@/components/comment/CommentSection";

// On-demand revalidation으로 변경 - 댓글 CRUD 시에만 재생성

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
        description: "요청하신 포스트를 찾을 수 없습니다."
      });
    }

    const description = extractDescription(post.content);
    const publishedTime = new Date(post.publishedAt).toISOString();
    const modifiedTime = new Date(post.updatedAt).toISOString();

    return createMetadata({
      title: post.title,
      description,
      keywords: [post.title, "서을"],
      url: `https://yemun.kr/posts/${post.slug}`,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: ["예문"],
      tags: [post.title]
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return createMetadata();
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  // 단일 API 호출로 모든 데이터 가져오기 (3개 → 1개 API 호출)
  const {
    post,
    adjacentPosts,
    comments: initialComments,
  } = await getPostWithDetails(id);

  if (!post) {
    notFound();
  }

  // Article schema for rich snippets
  const articleSchema = createArticleSchema({
    title: post.title,
    description: extractDescription(post.content),
    author: "예문",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    slug: post.slug
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
    </>
  );
}
