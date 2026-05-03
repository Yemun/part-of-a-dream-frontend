import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getLocalePrefix, type Locale } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";
import MobileContainer from "@/components/side-project/MobileContainer";
import JangbogiFrame from "@/components/side-project/JangbogiFrame";
import BingoEntry from "@/components/bingo/BingoEntry";
import "@/components/bingo/bingo.css";

type SideProjectTab = "bingo" | "jangbogi";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const localePrefix = getLocalePrefix(locale);
  const meta =
    locale === "ko"
      ? { title: "사이드 프로젝트", description: "직접 만든 작은 도구들" }
      : { title: "Side Project", description: "Small tools I built" };

  return createMetadata({
    title: meta.title,
    description: meta.description,
    locale: locale as Locale,
    url: `https://yemun.kr${localePrefix}/side-project`,
  });
}

function parseTab(value: string | undefined): SideProjectTab {
  return value === "jangbogi" ? "jangbogi" : "bingo";
}

export default async function SideProjectPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale }, { tab }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const activeTab = parseTab(tab);

  return (
    <MobileContainer>
      {activeTab === "bingo" ? (
        <div className="font-bingo bingo-app h-full">
          <BingoEntry />
        </div>
      ) : (
        <JangbogiFrame />
      )}
    </MobileContainer>
  );
}
