"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getLeaderboard, LeaderboardEntry, Leaderboards } from "@/lib/bingo";

interface BingoLeaderboardProps {
  currentPlayerId: string;
  refreshKey: number;
}

export default function BingoLeaderboard({
  currentPlayerId,
  refreshKey,
}: BingoLeaderboardProps) {
  const t = useTranslations("bingo");
  const [data, setData] = useState<Leaderboards>({
    mostLines: [],
    speed: [],
  });

  useEffect(() => {
    let cancelled = false;
    getLeaderboard().then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (data.mostLines.length === 0 && data.speed.length === 0) return null;

  return (
    <div className="mt-6 space-y-6">
      <LeaderboardTable
        title={t("leaderboardMostLines")}
        entries={data.mostLines}
        currentPlayerId={currentPlayerId}
        valueLabel={t("lines")}
        timeLabel={t("time")}
        emptyLabel={t("noEntries")}
        mode="mostLines"
        t={t}
      />
      <LeaderboardTable
        title={t("leaderboardSpeed")}
        entries={data.speed}
        currentPlayerId={currentPlayerId}
        valueLabel={t("lines")}
        timeLabel={t("firstLineTime")}
        emptyLabel={t("noEntries")}
        mode="speed"
        t={t}
      />
    </div>
  );
}

function LeaderboardTable({
  title,
  entries,
  currentPlayerId,
  valueLabel,
  timeLabel,
  emptyLabel,
  mode,
  t,
}: {
  title: string;
  entries: LeaderboardEntry[];
  currentPlayerId: string;
  valueLabel: string;
  timeLabel: string;
  emptyLabel: string;
  mode: "mostLines" | "speed";
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="border-[0.5px] border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
              <th className="px-3 py-2 text-left font-medium">{t("rank")}</th>
              <th className="px-3 py-2 text-left font-medium">{t("player")}</th>
              <th className="px-3 py-2 text-center font-medium">
                {valueLabel}
              </th>
              <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">
                {timeLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const timeValue =
                  mode === "speed" ? entry.first_line_at : entry.latest_line_at;
                return (
                  <tr
                    key={entry.player_id}
                    className={`
                      border-b-[0.5px] border-gray-200 dark:border-gray-700 last:border-b-0
                      ${
                        entry.player_id === currentPlayerId
                          ? "bg-blue-50 dark:bg-blue-950/30 font-medium"
                          : ""
                      }
                    `}
                  >
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">{entry.player_name}</td>
                    <td className="px-3 py-2 text-center">
                      {entry.line_count > 0 ? entry.line_count : "-"}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500 hidden sm:table-cell">
                      {timeValue
                        ? new Date(timeValue).toLocaleTimeString()
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
