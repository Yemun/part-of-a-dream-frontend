import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getLocalePrefix, type Locale } from "@/i18n/routing";
import BingoEntry from "@/components/bingo/BingoEntry";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const localePrefix = getLocalePrefix(locale);

  const meta =
    locale === "ko"
      ? {
          title: "GPS 빙고",
          description: "GPS 기반 3x3 빙고 게임",
        }
      : {
          title: "GPS Bingo",
          description: "GPS-based 3x3 bingo game",
        };

  return createMetadata({
    title: meta.title,
    description: meta.description,
    locale: locale as Locale,
    url: `https://yemun.kr${localePrefix}/side-project/bingo`,
  });
}

export default async function SideProject({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BingoEntry />;
}
