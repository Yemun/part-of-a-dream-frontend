import { createMetadata, createPersonSchema } from "@/lib/metadata";
import { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";
import { setRequestLocale } from "next-intl/server";
import { getLocalePrefix, type Locale } from "@/i18n/routing";
import { getProfileData } from "@/data/profile";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Generate metadata for profile page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const localePrefix = getLocalePrefix(locale);

  const metaData =
    locale === "ko"
      ? {
          title: "예문",
          description:
            "사용자와 제품의 관계를 탐구하는 디자인 시스템 매니저입니다.",
          keywords: [
            "예문",
            "디자인 시스템",
            "프로덕트 디자이너",
            "서울",
            "UX/UI",
            "케이뱅크",
          ],
        }
      : {
          title: "Yemun",
          description:
            "Design System Manager exploring the relationship between users and products.",
          keywords: [
            "Yemun",
            "design system",
            "product designer",
            "Seoul",
            "UX/UI",
            "Kbank",
          ],
        };

  return createMetadata({
    title: metaData.title,
    description: metaData.description,
    keywords: metaData.keywords,
    locale: locale as Locale,
    url: `https://yemun.kr${localePrefix}/profile`,
    type: "profile",
  });
}

export default async function Profile({ params }: PageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const profileData = getProfileData(locale);

  // Person schema for profile page
  const profileMetadata =
    locale === "ko"
      ? {
          name: "예문",
          alternateName: "Yemun Cho",
          description:
            "사용자와 제품의 관계를 탐구하는 디자인 시스템 매니저입니다.",
        }
      : {
          name: "Yemun",
          alternateName: "예문",
          description:
            "Design System Manager exploring the relationship between users and products.",
        };

  const personSchema = createPersonSchema({
    name: profileMetadata.name,
    alternateName: profileMetadata.alternateName,
    description: profileMetadata.description,
    locale: locale as Locale,
    contact: profileData.contact,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <ProfileClient profileData={profileData} />
    </>
  );
}
