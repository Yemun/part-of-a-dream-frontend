"use client";

import { useTranslations } from "next-intl";
import { GpsStatus } from "@/lib/bingo-gps";
import Button from "@/components/ui/Button";

interface BingoStatusProps {
  gpsStatus: GpsStatus;
  lineCount: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export default function BingoStatus({
  gpsStatus,
  lineCount,
  isPaused,
  onPause,
  onResume,
}: BingoStatusProps) {
  const t = useTranslations("bingo");

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-blue-600 dark:text-blue-400">
        {t("bingoLine")} ×{lineCount}
      </span>
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
  );
}
