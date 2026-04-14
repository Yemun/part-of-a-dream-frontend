"use client";

import { useTranslations, useLocale } from "next-intl";
import { BingoLocation } from "@/lib/bingo";

interface BingoCellProps {
  location: BingoLocation;
  isChecked: boolean;
  isNearby: boolean;
  distance: number | null;
  onCheck: () => void;
  onOpenDetails: (location: BingoLocation) => void;
}

export default function BingoCell({
  location,
  isChecked,
  isNearby,
  distance,
  onCheck,
  onOpenDetails,
}: BingoCellProps) {
  const t = useTranslations("bingo");
  const locale = useLocale();

  const displayName =
    locale === "en" && location.name_en ? location.name_en : location.name;

  if (isChecked) {
    return (
      <div className="aspect-square flex items-center justify-center">
        <div className="w-[80%] h-[80%] rounded-full border-[4px] border-blue-600 dark:border-blue-400 flex items-center justify-center p-2">
          <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 text-center leading-tight line-clamp-2">
            {displayName}
          </span>
        </div>
      </div>
    );
  }

  const distanceText =
    distance !== null
      ? t("metersAway", { meters: Math.round(distance) })
      : null;

  const statusText = isNearby
    ? t("tapToCheck")
    : distanceText || t("unchecked");

  const handleClick = isNearby
    ? onCheck
    : () => onOpenDetails(location);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        relative aspect-square flex flex-col items-center justify-center rounded-md
        border-[0.5px] p-2 text-center transition-all duration-300 cursor-pointer
        ${
          isNearby
            ? "bg-blue-50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500 animate-shadow-breath"
            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        }
      `}
    >
      <span className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">
        {displayName}
      </span>
      <span
        className={`text-[10px] sm:text-xs mt-1 ${
          isNearby
            ? "text-blue-600 dark:text-blue-400 font-medium"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {statusText}
      </span>
    </button>
  );
}
