"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";

// Types
interface RoleInfo {
  role: string;
  startDate: string;
  endDate: string;
}

interface CareerEntry {
  company: string;
  roles?: RoleInfo[];
  role?: string;
  startDate?: string;
  endDate?: string;
}

interface Education {
  university: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
}

// Format date for display
const formatDate = (dateStr: string, present: string, locale?: string) => {
  if (dateStr === "Now" || dateStr === "오늘") return present;

  // YYYY-MM-DD 형식을 locale에 따라 변환
  const [year, month] = dateStr.split("-");

  // 영어권에서는 MM/YYYY, 한국어에서는 YYYY.MM
  if (locale === "en") {
    return `${month}/${year}`;
  }
  return `${year}.${month}`;
};

// Section heading component
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
    {children}
  </h2>
);

// 월별 원 데이터
interface MonthCircleData {
  year: number;
  month: number;
  isWorked: boolean;
  fillPercentage: number; // 0-100: 해당 월에서 실제 근무한 비율
  company?: string;
  role?: string;
}

// 커리어 그래프 아이템 인터페이스
interface CareerGraphItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  monthCircles: MonthCircleData[];
  totalMonths: number;
  isCurrentJob: boolean;
}

// 두 날짜 사이의 모든 달을 계산하는 함수 (365일 기준)
const getMonthsBetweenDates = (
  startDate: string,
  endDate: string,
): MonthCircleData[] => {
  const circles: MonthCircleData[] = [];
  const start = new Date(startDate);
  const end = endDate === "오늘" ? new Date() : new Date(endDate);

  // 총 근무 일수 계산
  const totalDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 365일을 12로 나눈 값 (약 30.4일)
  const daysPerMonth = 365 / 12;

  // 필요한 달 수 계산
  const totalMonthsNeeded = Math.ceil(totalDays / daysPerMonth);

  // 시작 월부터 생성
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();

  for (let i = 0; i < totalMonthsNeeded; i++) {
    const currentDate = new Date(startYear, startMonth + i, 1);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    let fillPercentage = 100;

    // 마지막 달인 경우에만 부분 채움 계산
    if (i === totalMonthsNeeded - 1) {
      const remainingDays = totalDays - i * daysPerMonth;
      fillPercentage = Math.round((remainingDays / daysPerMonth) * 100);
      fillPercentage = Math.max(10, Math.min(100, fillPercentage)); // 10-100% 범위로 제한
    }

    circles.push({
      year,
      month,
      isWorked: true,
      fillPercentage,
    });
  }

  return circles;
};

// 커리어 데이터를 그래프 아이템으로 변환
const processCareerToGraph = (career: CareerEntry[]): CareerGraphItem[] => {
  const items: CareerGraphItem[] = [];

  // 모든 역할을 개별 항목으로 변환
  career.forEach((entry) => {
    entry.roles?.forEach((role) => {
      const monthCircles = getMonthsBetweenDates(role.startDate, role.endDate);

      items.push({
        company: entry.company,
        role: role.role,
        startDate: role.startDate,
        endDate: role.endDate,
        monthCircles,
        totalMonths: monthCircles.length,
        isCurrentJob: role.endDate === "오늘",
      });
    });
  });

  // endDate 기준 내림차순 정렬 (현재 재직중이 가장 위에)
  items.sort((a, b) => {
    if (a.isCurrentJob && !b.isCurrentJob) return -1;
    if (!a.isCurrentJob && b.isCurrentJob) return 1;

    const dateA = a.endDate === "오늘" ? new Date() : new Date(a.endDate);
    const dateB = b.endDate === "오늘" ? new Date() : new Date(b.endDate);

    return dateB.getTime() - dateA.getTime();
  });

  return items;
};

// 월별 원 컴포넌트 (SVG 달 위상 아이콘)
const getMoonPath = (phase: number): string => {
  switch (phase) {
    case 1:
      return "M2 12C2 17.5228 6.47715 22 12 22C7.39763 22 3.66667 17.5228 3.66667 12C3.66667 6.47715 7.39763 2 12 2C6.47715 2 2 6.47715 2 12Z";
    case 2:
      return "M2 12C2 17.5228 6.47715 22 12 22C8.77834 22 6.16667 17.5228 6.16667 12C6.16667 6.47715 8.77834 2 12 2C6.47715 2 2 6.47715 2 12Z";
    case 3:
      return "M2 12C2 17.5228 6.47715 22 12 22C9.69881 22 7.83333 17.5228 7.83333 12C7.83333 6.47715 9.69881 2 12 2C6.47715 2 2 6.47715 2 12Z";
    case 4:
      return "M2 12C2 17.5228 6.47715 22 12 22C11.0795 22 10.3333 17.5228 10.3333 12C10.3333 6.47715 11.0795 2 12 2C6.47715 2 2 6.47715 2 12Z";
    case 5:
      return "M12 2C9.34783 2 6.8043 3.05357 4.92893 4.92893C3.05357 6.8043 2 9.34783 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C6.80429 20.9464 9.34783 22 12 22L12 12L12 2Z";
    case 6:
      return "M12 2C12.9205 2 13.6667 6.47715 13.6667 12C13.6667 17.5228 12.9205 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z";
    case 7:
      return "M12 2C14.3012 2 16.1667 6.47715 16.1667 12C16.1667 17.5228 14.3012 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z";
    case 8:
      return "M12 2C15.2217 2 17.8333 6.47715 17.8333 12C17.8333 17.5228 15.2217 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z";
    case 9:
      return "M12 2C16.6024 2 20.3333 6.47715 20.3333 12C20.3333 17.5228 16.6024 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z";
    case 10:
      return "M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z";
    default:
      return "";
  }
};

const MonthCircle = ({
  circle,
  isCurrentJob,
  globalIndex = 0,
  animate = false,
}: {
  circle: MonthCircleData;
  isCurrentJob: boolean;
  globalIndex?: number;
  animate?: boolean;
}) => {
  const fillPercentage = circle.fillPercentage;
  const targetPhase = Math.max(
    1,
    Math.min(10, Math.round(fillPercentage / 10) || 1),
  );
  const [displayPhase, setDisplayPhase] = useState(animate ? 0 : targetPhase);

  useEffect(() => {
    if (!animate) return;

    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      let current = 1;
      setDisplayPhase(1);

      if (targetPhase > 1) {
        intervalId = setInterval(() => {
          current++;
          setDisplayPhase(current);
          if (current >= targetPhase) clearInterval(intervalId);
        }, 24);
      }
    }, globalIndex * 4);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [animate, globalIndex, targetPhase]);

  const colorClass = isCurrentJob ? "fill-yellow-200" : "fill-white";

  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      title={`${circle.year}년 ${circle.month}월 (${fillPercentage}%)`}
      style={{ opacity: displayPhase > 0 ? 1 : 0 }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.85}
        className="w-full h-full transition-colors dark:stroke-0 stroke-gray-800 dark:stroke-gray-100 duration-200"
      >
        <path d={getMoonPath(displayPhase || 1)} className={colorClass} />
      </svg>
    </div>
  );
};

// 가로 원형 커리어 그래프
const CareerGraph = ({ career }: { career: CareerEntry[] }) => {
  const t = useTranslations("profile");
  const locale = useLocale();
  const graphItems = processCareerToGraph(career);

  const hasAnimated = useRef(false);
  const shouldAnimate = !hasAnimated.current;
  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  const globalOffsets: number[] = [];
  let runningTotal = 0;
  graphItems.forEach((item) => {
    globalOffsets.push(runningTotal);
    runningTotal += item.monthCircles.length;
  });

  return (
    <div className="w-full">
      {graphItems.map((item, index) => (
        <div key={`${item.company}-${item.role}-${index}`} className="mb-5">
          {/* 커리어 정보 */}
          <p className="flex items-center gap-2 mb-1.5">
            {item.company}, {item.role}, <br className="sm:hidden" />
            {formatDate(item.startDate, t("present"), locale)} -{" "}
            {formatDate(item.endDate, t("present"), locale)}
            {", "}
            {(() => {
              const years = Math.floor(item.totalMonths / 12);
              const months = item.totalMonths % 12;
              const isKo = locale === "ko";
              const parts = [];
              if (years > 0)
                parts.push(
                  `${years}${isKo ? t("yearsUnit") : t(years === 1 ? "yearsUnit" : "yearsUnitPlural")}`,
                );
              if (months > 0)
                parts.push(
                  `${months}${isKo ? t("monthsUnit") : t(months === 1 ? "monthsUnit" : "monthsUnitPlural")}`,
                );
              return parts.join(" ") || `0${t("monthsUnit")}`;
            })()}
          </p>

          {/* 월별 원들 */}
          <div className="inline-flex border-[0.5px] flex-wrap dot-pattern p-0.5">
            {item.monthCircles.map((circle, circleIndex) => (
              <div key={circleIndex} className="flex items-center">
                {/* 12개월마다 연도 divider 추가 (첫 번째 제외) */}
                {circleIndex > 0 && circleIndex % 12 === 0 && (
                  <div className="w-px h-6 bg-gray-800 dark:bg-gray-200 mx-4"></div>
                )}
                <MonthCircle
                  circle={circle}
                  isCurrentJob={item.isCurrentJob}
                  globalIndex={globalOffsets[index] + circleIndex}
                  animate={shouldAnimate}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Education component
const Education = ({ education }: { education: Education }) => {
  const t = useTranslations("profile");
  const locale = useLocale();

  return (
    <div>
      <SectionTitle>{t("education")}</SectionTitle>

      <p className="mb-4 gap-2 flex items-center ">
        {education.university}, {education.degree}, <br className="sm:hidden" />
        {formatDate(education.startDate, t("present"), locale)} –{" "}
        {formatDate(education.endDate, t("present"), locale)}
      </p>
    </div>
  );
};

// Contact link component
const ContactLink = ({
  label,
  href,
  children,
  isEmail = false,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
  isEmail?: boolean;
}) => (
  <p>
    {label} -{" "}
    <a
      href={href}
      {...(!isEmail && { target: "_blank", rel: "noopener noreferrer" })}
      className="dark:text-blue-400 underline"
    >
      {children}
    </a>
  </p>
);

// Contact section component
const ContactSection = ({ contact }: { contact: ContactInfo }) => {
  const t = useTranslations("profile");

  return (
    <div className="mt-6 sm:mt-7 pt-6 sm:pt-7 border-t border-gray-200 dark:border-gray-700">
      <SectionTitle>{t("contact")}</SectionTitle>
      <div className="space-y-1">
        <ContactLink
          label={t("email")}
          href={`mailto:${contact.email}`}
          isEmail={true}
        >
          {contact.email}
        </ContactLink>
        <ContactLink label="Instagram" href={contact.instagram}>
          {contact.instagram}
        </ContactLink>
        <ContactLink label="LinkedIn" href={contact.linkedin}>
          {contact.linkedin}
        </ContactLink>
        <ContactLink label="GitHub" href={contact.github}>
          {contact.github}
        </ContactLink>
      </div>
    </div>
  );
};

interface ProfileData {
  contact: ContactInfo;
  career: CareerEntry[];
  education: Education;
}

export default function ProfileClient({
  profileData,
}: {
  profileData: ProfileData;
}) {
  const t = useTranslations("profile");
  const locale = useLocale();

  const totalCareerMonths = processCareerToGraph(profileData.career).reduce(
    (sum, item) => sum + item.totalMonths,
    0,
  );
  const careerYears = Math.floor(totalCareerMonths / 12);
  const careerMonths = totalCareerMonths % 12;
  const isKo = locale === "ko";
  const careerDuration = [
    careerYears > 0
      ? `${careerYears}${isKo ? t("yearsUnit") : t(careerYears === 1 ? "yearsUnit" : "yearsUnitPlural")}`
      : "",
    careerMonths > 0
      ? `${careerMonths}${isKo ? t("monthsUnit") : t(careerMonths === 1 ? "monthsUnit" : "monthsUnitPlural")}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section>
      <h1 className="font-bold text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl leading-7 sm:leading-9 lg:leading-10 mb-3">
        {t("name")}
      </h1>

      <div className="mb-8 sm:mb-10">
        <p className="text-base sm:text-lg">{t("biography")}</p>
      </div>

      <div className="mb-4 sm:mb-6">
        <SectionTitle>
          {t("career")}·{careerDuration}
        </SectionTitle>

        <CareerGraph career={profileData.career} />
      </div>
      <div className="mt-8">
        <Education education={profileData.education} />
      </div>

      <ContactSection contact={profileData.contact} />
    </section>
  );
}
