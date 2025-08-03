import { createMetadata, createPersonSchema } from "@/lib/metadata";
import { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";
import { setRequestLocale } from "next-intl/server";

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
  
  const localePrefix = locale === "ko" ? "" : `/${locale}`;
  
  const profileData = locale === 'ko' ? {
    title: "예문",
    description: "사용자와 제품의 관계를 탐구하는 디자인 시스템 매니저입니다.",
    keywords: ["예문", "디자인 시스템", "프로덕트 디자이너", "서울", "UX/UI", "케이뱅크"]
  } : {
    title: "Yemun",
    description: "Design System Manager exploring the relationship between users and products.",
    keywords: ["Yemun", "design system", "product designer", "Seoul", "UX/UI", "Kbank"]
  };

  return createMetadata({
    title: profileData.title,
    description: profileData.description,
    keywords: profileData.keywords,
    locale: locale as "ko" | "en",
    url: `https://yemun.kr${localePrefix}/profile`,
    type: "profile",
  });
}

export default async function Profile({ params }: PageProps) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

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
  const profileMetadata = locale === 'ko' ? {
    name: "예문",
    alternateName: "Yemun Cho",
    description: "사용자와 제품의 관계를 탐구하는 디자인 시스템 매니저입니다."
  } : {
    name: "Yemun",
    alternateName: "예문",
    description: "Design System Manager exploring the relationship between users and products."
  };
  
  const personSchema = createPersonSchema({
    name: profileMetadata.name,
    alternateName: profileMetadata.alternateName,
    description: profileMetadata.description,
    locale: locale as "ko" | "en",
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
