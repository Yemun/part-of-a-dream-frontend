"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BINGO_EVENT } from "@/lib/bingo";

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}일 ${h}시간`;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function BingoEventHeader() {
  const t = useTranslations("bingo");
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(BINGO_EVENT.startAt).getTime();
  const end = new Date(BINGO_EVENT.endAt).getTime();

  let countdown: string;
  if (now < start) {
    countdown = t("countdownUpcoming", { time: formatRemaining(start - now) });
  } else if (now < end) {
    countdown = t("countdownLive", { time: formatRemaining(end - now) });
  } else {
    countdown = t("countdownEnded");
  }

  const isLive = now >= start && now < end;

  return (
    <div className="flex flex-col gap-1 border-[0.5px] border-gray-300 dark:border-gray-600 rounded-md px-3 py-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {t("eventSchedule")}
      </span>
      <span
        className={`text-sm font-medium tabular-nums ${
          isLive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {countdown}
      </span>
    </div>
  );
}
