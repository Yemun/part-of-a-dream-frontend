"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { CareerEntry, MonthCircleData } from "@/lib/careerUtils";
import {
  processCareerToGraph,
  formatDate,
  formatDuration,
} from "@/lib/careerUtils";

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

function MonthCircle({
  circle,
  isCurrentJob,
  globalIndex = 0,
  animate = false,
}: {
  circle: MonthCircleData;
  isCurrentJob: boolean;
  globalIndex?: number;
  animate?: boolean;
}) {
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
}

export default function CareerGraph({ career }: { career: CareerEntry[] }) {
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
          <p className="flex items-center gap-2 mb-1.5">
            {item.company}, {item.role}, <br className="sm:hidden" />
            {formatDate(item.startDate, t("present"), locale)} -{" "}
            {formatDate(item.endDate, t("present"), locale)}
            {", "}
            {formatDuration(item.totalMonths, locale, t)}
          </p>

          <div className="inline-flex border-[0.5px] flex-wrap dot-pattern p-0.5">
            {item.monthCircles.map((circle, circleIndex) => (
              <div key={circleIndex} className="flex items-center">
                {circleIndex > 0 && circleIndex % 12 === 0 && (
                  <div className="w-px h-6 bg-gray-800 dark:bg-gray-200 mx-4" />
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
}
