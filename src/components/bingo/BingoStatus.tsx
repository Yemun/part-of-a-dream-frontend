"use client";

import { useTranslations } from "next-intl";
import { GpsStatus } from "@/lib/bingo-gps";
import Button from "@/components/ui/Button";

interface BingoStatusProps {
  gpsStatus: GpsStatus;
  checkedCount: number;
  lineCount: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export default function BingoStatus({
  gpsStatus,
  checkedCount,
  lineCount,
  isPaused,
  onPause,
  onResume,
}: BingoStatusProps) {
  const t = useTranslations("bingo");

  const gpsLabel = {
    requesting: t("gpsRequesting"),
    active: t("gpsActive"),
    denied: t("gpsDenied"),
    unavailable: t("gpsUnavailable"),
  }[gpsStatus];

  const gpsColor = {
    requesting: "text-yellow-600 dark:text-yellow-400",
    active: "text-green-600 dark:text-green-400",
    denied: "text-red-600 dark:text-red-400",
    unavailable: "text-gray-500",
  }[gpsStatus];

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={gpsColor}>{gpsLabel}</span>
          <span>{t("cellsChecked", { count: checkedCount })}</span>
          {lineCount > 0 && (
            <span className="font-semibold text-green-600 dark:text-green-400">
              {t("bingoLine")} ×{lineCount}
            </span>
          )}
        </div>
        {gpsStatus === "active" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={isPaused ? onResume : onPause}
          >
            {isPaused ? t("resumeTracking") : t("pauseTracking")}
          </Button>
        )}
      </div>
    </div>
  );
}
