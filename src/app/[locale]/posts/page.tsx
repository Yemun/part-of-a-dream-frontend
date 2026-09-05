import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBlogPosts } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { redirect, getLocalePrefix, type Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const localePrefix = getLocalePrefix(locale);

  return createMetadata({
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    url: `https://yemun.kr${localePrefix}/posts`,
  });
}

// /posts 는 목록 페이지 대신 최신 글로 보낸다 (목록은 좌측 사이드바가 담당)
export default async function PostsIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = await getBlogPosts(locale);
  const latest = posts[0];

  if (latest) {
    redirect({ href: `/posts/${latest.slug}`, locale: locale as Locale });
  }

  const t = await getTranslations("blog");
  return (
    <p className="text-gray-500 dark:text-gray-400">{t("noPostsFound")}</p>
  );
}
