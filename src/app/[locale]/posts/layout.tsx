import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBlogPosts } from "@/lib/content";
import BlogSideNav from "@/components/post/BlogSideNav";

interface PostsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// /posts 하위 공통 레이아웃: 데스크톱(lg)에서만 좌측 글 목록 + 우측 본문 2단
export default async function PostsLayout({
  children,
  params,
}: PostsLayoutProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const posts = await getBlogPosts(locale);

  return (
    <div className="lg:flex lg:gap-8">
      <BlogSideNav
        posts={posts.map(({ slug, title, publishedAt }) => ({
          slug,
          title,
          publishedAt,
        }))}
        locale={locale}
        label={t("postList")}
      />
      {/* 본문 폭을 여기서 고정해 사이드바 바로 옆에 붙인다 (article의 mx-auto가 벌리지 않도록) */}
      <div className="min-w-0 lg:w-full lg:max-w-2xl">{children}</div>
    </div>
  );
}
