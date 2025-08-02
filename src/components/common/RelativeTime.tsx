"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

interface RelativeTimeProps {
  dateString: string;
  className?: string;
  absolute?: boolean; // 절대시간 표시 여부
}

export default function RelativeTime({
  dateString,
  className = "",
  absolute = false,
}: RelativeTimeProps) {
  const [displayTime, setDisplayTime] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations("time");
  const locale = useLocale();

  // Helper function to get ordinal suffix for English
  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  useEffect(() => {
    setIsClient(true);

    if (absolute) {
      // 절대시간 표시
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      if (locale === 'en') {
        // English: "March 15th" format
        const months = t.raw("months") as string[];
        const monthName = months[date.getMonth()];
        const dayOrdinal = `${day}${getOrdinalSuffix(day)}`;
        setDisplayTime(t("absoluteFormat", { monthName, dayOrdinal }));
      } else {
        // Korean: "6월 22일 금요일" format
        const weekdays = t.raw("weekdays") as string[];
        const weekday = weekdays[date.getDay()];
        setDisplayTime(t("absoluteFormat", { month, day, weekday }));
      }
    } else {
      // 상대시간 표시 (0일 전 형식)
      const updateTime = () => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffTime = now.getTime() - postDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        setDisplayTime(t("daysAgo", { days: diffDays }));
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [dateString, absolute]);

  if (!isClient) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (locale === 'en') {
      const months = t.raw("months") as string[];
      const monthName = months[date.getMonth()];
      const dayOrdinal = `${day}${getOrdinalSuffix(day)}`;
      return (
        <span className={className}>
          {t("shortFormat", { monthName, dayOrdinal })}
        </span>
      );
    } else {
      return (
        <span className={className}>
          {t("shortFormat", { month, day })}
        </span>
      );
    }
  }

  return <span className={className}>{displayTime}</span>;
}
