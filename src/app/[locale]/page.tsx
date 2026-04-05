import { getBlogPosts, BlogPost } from "@/lib/content";
import PostCard from "@/components/post/PostCard";
import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getLocalePrefix } from "@/i18n/routing";

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

  const localePrefix = getLocalePrefix(locale);
  const homeKeywords =
    locale === "ko"
      ? ["사용자 경험", "제품 디자인", "서울", "개발 블로그", "디자인 시스템"]
      : [
          "user experience",
          "product design",
          "Seoul",
          "development blog",
          "design system",
        ];

  return createMetadata({
    locale: locale as "ko" | "en",
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

  const sorted = posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const postsByYear = new Map<number, BlogPost[]>();
  for (const post of sorted) {
    const year = new Date(post.publishedAt).getFullYear();
    const group = postsByYear.get(year);
    if (group) {
      group.push(post);
    } else {
      postsByYear.set(year, [post]);
    }
  }

  let globalIndex = 0;

  return (
    <>
      {[...postsByYear.entries()].map(([year, yearPosts]) => (
        <div key={year}>
          <div className="inline-flex text-sm font-semibold px-1 -ml-px border ">
            {year}
            {locale === "ko" ? "년" : ""}
          </div>
          <div className="flex-1">
            {yearPosts.map((post) => {
              const idx = globalIndex++;
              return (
                <PostCard
                  key={post.slug}
                  post={post}
                  locale={locale}
                  index={idx}
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
