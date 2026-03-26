"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getLeaderboard, LeaderboardEntry } from "@/lib/bingo";

interface BingoLeaderboardProps {
  currentPlayerId: string;
  refreshKey: number;
}

export default function BingoLeaderboard({
  currentPlayerId,
  refreshKey,
}: BingoLeaderboardProps) {
  const t = useTranslations("bingo");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    const data = await getLeaderboard();
    setEntries(data);
  }, []);

  // Refresh on mount and whenever refreshKey changes (realtime event)
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard, refreshKey]);

  if (entries.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold mb-3">{t("leaderboard")}</h2>
      <div className="border-[0.5px] border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
              <th className="px-3 py-2 text-left font-medium">{t("rank")}</th>
              <th className="px-3 py-2 text-left font-medium">
                {t("player")}
              </th>
              <th className="px-3 py-2 text-center font-medium">
                {t("lines")}
              </th>
              <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">
                {t("time")}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
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
                  {entry.latest_line_at
                    ? new Date(entry.latest_line_at).toLocaleTimeString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
