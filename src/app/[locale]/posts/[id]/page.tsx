import { getPostWithDetails } from "@/lib/content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  createMetadata,
  extractDescription,
  createArticleSchema,
} from "@/lib/metadata";
import { setRequestLocale } from "next-intl/server";
import MDXRenderer from "@/components/post/MDXRenderer";
import RelativeTime from "@/components/common/RelativeTime";
import PostNavigation from "@/components/post/PostNavigation";
import CommentSection from "@/components/comment/CommentSection";

// 정적 경로 생성 - 최적화된 버전
export async function generateStaticParams() {
  try {
    const { allBlogPosts } = await import("contentlayer/generated");
    
    // 더 간단한 방식으로 파라미터 생성
    return allBlogPosts.flatMap(post => {
      const isEnglish = post._raw.flattenedPath.endsWith('-en');
      const locale = isEnglish ? 'en' : 'ko';
      
      return {
        locale,
        id: post.slug,
      };
    });
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  try {
    const { post } = await getPostWithDetails(id, locale);

    if (!post) {
      const notFoundData = locale === 'ko' ? {
        title: "게시글을 찾을 수 없습니다",
        description: "요청하신 게시글이 존재하지 않습니다."
      } : {
        title: "Post Not Found",
        description: "The requested post does not exist."
      };
      
      return createMetadata({
        title: notFoundData.title,
        description: notFoundData.description,
        locale: locale as 'ko' | 'en',
      });
    }

    const description = post.description || extractDescription(post.content);
    const publishedTime = new Date(post.publishedAt).toISOString();
    const localePrefix = locale === 'ko' ? '' : `/${locale}`;
    const authorName = locale === 'ko' ? '예문' : 'Yemun';
    const seoulKeyword = locale === 'ko' ? '서울' : 'Seoul';

    return createMetadata({
      title: post.title,
      description,
      keywords: [post.title, seoulKeyword],
      url: `https://yemun.kr${localePrefix}/posts/${post.slug}`,
      type: "article",
      publishedTime,
      authors: [authorName],
      tags: [post.title],
      locale: locale as 'ko' | 'en',
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return createMetadata({ locale: locale as 'ko' | 'en' });
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id, locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // 포스트 데이터와 댓글을 서버에서 함께 가져오기 (API 비용 최적화)
  const { post, adjacentPosts, comments } = await getPostWithDetails(id, locale);

  if (!post) {
    notFound();
  }

  // Article schema for rich snippets
  const authorName = locale === 'ko' ? '예문' : 'Yemun';
  
  const articleSchema = createArticleSchema({
    title: post.title,
    description: post.description || extractDescription(post.content),
    author: authorName,
    publishedTime: post.publishedAt,
    slug: post.slug,
    locale: locale as 'ko' | 'en',
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