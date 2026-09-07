import { getWorks, getWorkEndDate, WorkItem } from "@/lib/content";
import { groupByYear } from "@/lib/groupByYear";
import { formatDate } from "@/lib/careerUtils";
import PostCard from "@/components/post/PostCard";
import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLocalePrefix, type Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for homepage (Work 목록)
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const localePrefix = getLocalePrefix(locale);
  const homeKeywords =
    locale === "ko"
      ? ["포트폴리오", "디자인 시스템", "제품 디자인", "사용자 경험", "서울"]
      : [
          "portfolio",
          "design system",
          "product design",
          "user experience",
          "Seoul",
        ];

  return createMetadata({
    locale: locale as Locale,
    keywords: homeKeywords,
    url: `https://yemun.kr${localePrefix}`,
    type: "website",
  });
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations("work");

  let works: WorkItem[] = [];

  try {
    works = await getWorks(locale);
  } catch (error) {
    console.error("Failed to load works:", error);
  }

  if (works.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">{t("noWorksFound")}</p>
    );
  }

  const present = t("present");
  // 연도 레일은 종료일 기준. 진행 중인 업무는 올해로 묶인다.
  const worksByYear = groupByYear(works, getWorkEndDate);

  let globalIndex = 0;

  return (
    <>
      <style>{`html, body { overflow-x: hidden; }`}</style>
      {worksByYear.map(([year, yearWorks]) => (
        <div key={year} className="flex">
          <div className="inline-flex text-xs font-medium px-1 -ml-px -mt-px border [writing-mode:vertical-rl] [text-orientation:upright] tracking-tighter">
            {year}
            {locale === "ko" ? "년" : ""}
          </div>
          <div className="flex-1">
            {yearWorks.map((work) => {
              const idx = globalIndex++;
              const period = `${formatDate(work.startDate, present, locale)} – ${formatDate(work.endDate, present, locale)}`;
              return (
                <PostCard
                  key={work.slug}
                  post={{
                    slug: work.slug,
                    title: work.title,
                    publishedAt: work.startDate,
                  }}
                  href={`/work/${work.slug}`}
                  dateLabel={period}
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
