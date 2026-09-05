import { getWorks, getWorkBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  createMetadata,
  extractDescription,
  createArticleSchema,
} from "@/lib/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, getLocalePrefix, type Locale } from "@/i18n/routing";
import MDXRenderer from "@/components/post/MDXRenderer";
import WorkSummaryCards from "@/components/work/WorkSummaryCards";
import PostNavigation from "@/components/post/PostNavigation";

// 영문 문서가 없어도 ko 문서로 폴백하므로 모든 locale × slug 조합을 생성
export async function generateStaticParams() {
  try {
    const works = await getWorks();
    const slugs = [...new Set(works.map((work) => work.slug))];
    return routing.locales.flatMap((locale) =>
      slugs.map((slug) => ({ locale, slug })),
    );
  } catch (error) {
    console.error("Error generating work static params:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const work = await getWorkBySlug(slug, locale);

  if (!work) {
    return createMetadata({ locale: locale as Locale });
  }

  const localePrefix = getLocalePrefix(locale);

  return createMetadata({
    title: work.title,
    description: work.description || extractDescription(work.content),
    keywords: [
      work.title,
      ...(work.company ? [work.company] : []),
      ...(work.tags ?? []),
    ],
    url: `https://yemun.kr${localePrefix}/work/${work.slug}`,
    type: "article",
    publishedTime: new Date(work.startDate).toISOString(),
    tags: work.tags,
    locale: locale as Locale,
  });
}

export default async function WorkPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const work = await getWorkBySlug(slug, locale);

  if (!work) {
    notFound();
  }

  // 이전/다음: 홈 목록과 같은 순서(종료일 desc). 이전 = 더 최근, 다음 = 더 과거
  const works = await getWorks(locale);
  const currentIndex = works.findIndex((item) => item.slug === work.slug);
  const previous = currentIndex > 0 ? works[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < works.length - 1
      ? works[currentIndex + 1]
      : null;

  const t = await getTranslations("work");
  const authorName = locale === "ko" ? "예문" : "Yemun";

  const articleSchema = createArticleSchema({
    title: work.title,
    description: work.description || extractDescription(work.content),
    author: authorName,
    publishedTime: work.startDate,
    slug: work.slug,
    locale: locale as Locale,
    pathPrefix: "work",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="max-w-2xl mx-auto w-full">
        <header className="mb-8 sm:mb-10">
          <h1 className="font-semibold text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl leading-7 sm:leading-9 lg:leading-10 mb-3">
            {work.title}
          </h1>
          {work.description && (
            <p className="font-normal text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-5 sm:leading-6">
              {work.description}
            </p>
          )}
        </header>

        <WorkSummaryCards work={work} locale={locale} />

        <MDXRenderer code={work.body.code} />

        <PostNavigation
          previous={previous}
          next={next}
          basePath="/work"
          previousLabel={t("navigation.previous")}
          nextLabel={t("navigation.next")}
        />
      </article>
    </>
  );
}
