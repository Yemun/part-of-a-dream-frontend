import { createMetadata, createPersonSchema } from "@/lib/metadata";
import { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";

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

  const title = locale === "ko" ? "예문" : "Yemun";
  const description =
    locale === "ko"
      ? "서울 을지로에서 디자인 시스템을 만들고 있습니다."
      : "I'm a design systems creator based in Euljiro, Seoul.";
  const keywords = locale === "ko" ? ["서을", "프로필"] : ["Seoul", "profile"];
  const localePrefix = locale === "ko" ? "" : `/${locale}`;

  return createMetadata({
    title,
    description,
    keywords,
    url: `https://yemun.kr${localePrefix}/profile`,
    type: "profile",
    locale: locale as "ko" | "en",
  });
}

export default async function Profile({ params }: PageProps) {
  const { locale } = await params;

  // Static profile data
  const profileData = {
    contact: {
      email: "ymcho111@gmail.com",
      github: "https://github.com/yemun",
      linkedin: "https://www.linkedin.com/in/yemun-cho-11852885",
      instagram: "https://www.instagram.com/yemuncho",
    },
    career: [
      {
        company: "Kbank",
        roles: [
          {
            role: "Design System Manager",
            startDate: "2024-01-01",
            endDate: "오늘",
          },
          {
            role: "Product Designer",
            startDate: "2022-06-27",
            endDate: "2023-12-31",
          },
        ],
      },
      {
        company: "Donamu",
        roles: [
          {
            role: "UX/UI Designer",
            startDate: "2022-02-07",
            endDate: "2022-06-06",
          },
        ],
      },
      {
        company: "LINE Corp",
        roles: [
          {
            role: "UI Designer",
            startDate: "2021-04-01",
            endDate: "2021-09-30",
          },
        ],
      },
      {
        company: "Lotte Duty Free",
        roles: [
          {
            role: "UI Designer",
            startDate: "2018-02-01",
            endDate: "2021-01-29",
          },
          {
            role: "Assistant Graphic Designer",
            startDate: "2017-01-16",
            endDate: "2018-01-31",
          },
        ],
      },
      {
        company: "LINE Plus",
        roles: [
          {
            role: "UI Designer",
            startDate: "2016-08-01",
            endDate: "2016-09-23",
          },
        ],
      },
      {
        company: "amoeba",
        roles: [
          {
            role: "Student Intern",
            startDate: "2016-01-18",
            endDate: "2016-02-19",
          },
        ],
      },
    ],
    education: {
      university: locale === "ko" ? "세종대학교" : "Sejong University",
      degree: locale === "ko" ? "시각디자인 학사 전공" : "Bachelor of Visual Design",
      startDate: "2010-03-02",
      endDate: "2016-02-19",
    },
  };

  // Person schema for profile page
  const personSchema = createPersonSchema({
    name: locale === "ko" ? "예문" : "Yemun",
    alternateName: locale === "ko" ? "서울" : "Seoul",
    description:
      locale === "ko"
        ? "사용자와 제품의 관계를 탐구하는 일지를 작성합니다."
        : "I write about the relationship between users and products.",
    contact: profileData.contact,
    locale: locale as "ko" | "en",
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
