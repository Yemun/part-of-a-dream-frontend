"use client";

import { useTranslations, useLocale } from "next-intl";
import { BingoLocation } from "@/lib/bingo";

interface BingoCellProps {
  location: BingoLocation;
  isChecked: boolean;
  isNearby: boolean;
  isInLine: boolean;
  distance: number | null;
  onCheck: () => void;
}

export default function BingoCell({
  location,
  isChecked,
  isNearby,
  isInLine,
  distance,
  onCheck,
}: BingoCellProps) {
  const t = useTranslations("bingo");
  const locale = useLocale();

  const displayName =
    locale === "en" && location.name_en ? location.name_en : location.name;

  const distanceText =
    distance !== null
      ? t("metersAway", { meters: Math.round(distance) })
      : null;

  const statusText = isChecked
    ? t("checked")
    : isNearby
      ? t("tapToCheck")
      : distanceText || t("unchecked");

  return (
    <button
      type="button"
      disabled={!isNearby || isChecked}
      onClick={isNearby && !isChecked ? onCheck : undefined}
      className={`
        relative aspect-square flex flex-col items-center justify-center
        border-[0.5px] p-2 text-center transition-all duration-300
        ${
          isChecked
            ? isInLine
              ? "bg-green-100 border-green-500 dark:bg-green-900/40 dark:border-green-400"
              : "bg-green-50 border-green-400 dark:bg-green-950/30 dark:border-green-600"
            : isNearby
              ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-500 animate-pulse cursor-pointer"
              : "border-gray-300 dark:border-gray-600 cursor-default"
        }
      `}
    >
      {isChecked && (
        <span className="absolute top-1 right-1 text-green-600 dark:text-green-400 text-xs">
          ✓
        </span>
      )}
      {isNearby && !isChecked && (
        <span className="absolute top-1 right-1 text-yellow-600 dark:text-yellow-400 text-xs">
          ●
        </span>
      )}
      <span className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">
        {displayName}
      </span>
      <span
        className={`text-[10px] sm:text-xs mt-1 ${
          isNearby && !isChecked
            ? "text-yellow-600 dark:text-yellow-400 font-medium"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {statusText}
      </span>
    </button>
  );
}
