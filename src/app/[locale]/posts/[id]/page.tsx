import { getPostWithDetails } from "@/lib/content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  createMetadata,
  extractDescription,
  createArticleSchema,
} from "@/lib/metadata";
import { getMessages, setRequestLocale } from "next-intl/server";

// Message types for type safety
interface MetaMessages {
  meta: {
    keywords: {
      seoul: string;
    };
    pages: {
      profile: {
        title: string;
      };
      post: {
        notFoundTitle: string;
        notFoundDescription: string;
      };
    };
  };
}
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
    const messages = await getMessages() as MetaMessages;

    if (!post) {
      const postMessages = messages.meta.pages.post;
      
      return createMetadata({
        title: postMessages.notFoundTitle,
        description: postMessages.notFoundDescription,
        locale: locale as 'ko' | 'en',
      });
    }

    const description = post.description || extractDescription(post.content);
    const publishedTime = new Date(post.publishedAt).toISOString();
    const localePrefix = locale === 'ko' ? '' : `/${locale}`;
    const profileMessages = messages.meta.pages.profile;

    return createMetadata({
      title: post.title,
      description,
      keywords: [post.title, messages.meta.keywords.seoul],
      url: `https://yemun.kr${localePrefix}/posts/${post.slug}`,
      type: "article",
      publishedTime,
      authors: [profileMessages.title],
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
  const messages = await getMessages() as MetaMessages;
  const profileMessages = messages.meta.pages.profile;
  
  const articleSchema = createArticleSchema({
    title: post.title,
    description: post.description || extractDescription(post.content),
    author: profileMessages.title,
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