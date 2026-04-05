import type { ProfileData } from "@/lib/careerUtils";

export function getProfileData(locale: string): ProfileData {
  const isKo = locale === "ko";

  return {
    contact: {
      email: "ymcho111@gmail.com",
      github: "https://github.com/yemun",
      linkedin: "https://www.linkedin.com/in/yemun-cho-11852885",
      instagram: "https://www.instagram.com/yemuncho",
    },
    career: [
      {
        company: isKo ? "케이뱅크" : "Kbank",
        roles: [
          {
            role: isKo ? "디자인 시스템 매니저" : "Design System Manager",
            startDate: "2024-01-01",
            endDate: null,
          },
          {
            role: isKo ? "제품 디자이너" : "Product Designer",
            startDate: "2022-06-27",
            endDate: "2023-12-31",
          },
        ],
      },
      {
        company: isKo ? "두나무" : "Donamu",
        roles: [
          {
            role: isKo ? "UX/UI 디자이너" : "UX/UI Designer",
            startDate: "2022-02-07",
            endDate: "2022-06-06",
          },
        ],
      },
      {
        company: isKo ? "(주)라인" : "LINE Corp",
        roles: [
          {
            role: isKo ? "UI 디자이너" : "UI Designer",
            startDate: "2021-04-01",
            endDate: "2021-09-30",
          },
        ],
      },
      {
        company: isKo ? "롯데면세점" : "Lotte Duty Free",
        roles: [
          {
            role: isKo ? "UI 디자이너" : "UI Designer",
            startDate: "2018-02-01",
            endDate: "2021-01-29",
          },
          {
            role: isKo ? "그래픽 디자이너 보조" : "Assistant Graphic Designer",
            startDate: "2017-01-16",
            endDate: "2018-01-31",
          },
        ],
      },
      {
        company: isKo ? "라인 플러스" : "LINE Plus",
        roles: [
          {
            role: isKo ? "UI 디자이너" : "UI Designer",
            startDate: "2016-08-01",
            endDate: "2016-09-23",
          },
        ],
      },
      {
        company: isKo ? "아메바" : "amoeba",
        roles: [
          {
            role: isKo ? "학생 인턴" : "Student Intern",
            startDate: "2016-01-18",
            endDate: "2016-02-19",
          },
        ],
      },
    ],
    education: {
      university: isKo ? "세종대학교" : "Sejong University",
      degree: isKo ? "시각디자인 학사 전공" : "Bachelor of Visual Design",
      startDate: "2010-03-02",
      endDate: "2016-02-19",
    },
  };
}
