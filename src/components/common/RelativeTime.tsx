"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

interface RelativeTimeProps {
  dateString: string;
  className?: string;
  showWeekday?: boolean;
}

export default function RelativeTime({
  dateString,
  className = "",
  showWeekday = false,
}: RelativeTimeProps) {
  const t = useTranslations("time");
  const locale = useLocale();

  // Helper function to get ordinal suffix for English
  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const displayTime = useMemo(() => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (locale === "en") {
      // English: "March 15th" format
      const months = t.raw("months") as string[];
      const monthName = months[date.getMonth()];
      const dayOrdinal = `${day}${getOrdinalSuffix(day)}`;
      return t("absoluteFormat", { monthName, dayOrdinal });
    } else {
      // Korean: "6월 22일" or "6월 22일 금요일" format
      if (showWeekday) {
        const weekdays = t.raw("weekdays") as string[];
        const weekday = weekdays[date.getDay()];
        return t("absoluteFormat", { month, day, weekday });
      } else {
        return t("shortFormat", { month, day });
      }
    }
  }, [dateString, locale, showWeekday, t]);

  return <span className={className}>{displayTime}</span>;
}
