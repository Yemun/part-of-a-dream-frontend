import { getBlogPosts, BlogPost } from "@/lib/content";
import PostCard from "@/components/post/PostCard";
import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for homepage
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const localePrefix = locale === 'ko' ? '' : `/${locale}`;
  const homeKeywords = locale === 'ko' 
    ? ["사용자 경험", "제품 디자인", "서울", "개발 블로그", "디자인 시스템"]
    : ["user experience", "product design", "Seoul", "development blog", "design system"];
  
  return createMetadata({
    locale: locale as 'ko' | 'en',
    keywords: homeKeywords,
    url: `https://yemun.kr${localePrefix}`,
    type: "website",
  });
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  let posts: BlogPost[] = [];

  try {
    posts = await getBlogPosts(locale);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }

  return (
    <div className="border-t border-l flex items-start content-start self-stretch flex-wrap overflow-hidden max-h-[1008px] sm:max-h-[960px] texture-filter">
      {posts
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .map((post: BlogPost) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}

      {/* 30개의 "작업 중" 링크 추가 */}
      {Array.from({ length: 48 }, (_, index) => {
        return <PostCard key={`placeholder-${index}`} text="-" locale={locale} />;
      })}
    </div>
  );
}