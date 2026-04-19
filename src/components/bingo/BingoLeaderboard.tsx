"use client";

import { useState, useEffect, useRef } from "react";
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
        rule={t("ruleMostLines")}
        ruleLabel={t("ruleLabel")}
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
        rule={t("ruleSpeed")}
        ruleLabel={t("ruleLabel")}
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

function RuleTooltip({ rule, label }: { rule: string; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full border-[0.5px] border-gray-400 dark:border-gray-500 text-xs leading-none text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:border-gray-600 dark:hover:border-gray-300 transition-colors"
      >
        ?
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-1.5 z-10 w-64 px-3 py-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-[0.5px] border-gray-300 dark:border-gray-600 rounded-md shadow-sm whitespace-pre-line"
        >
          {rule}
        </div>
      )}
    </div>
  );
}

function LeaderboardTable({
  title,
  rule,
  ruleLabel,
  entries,
  currentPlayerId,
  valueLabel,
  timeLabel,
  emptyLabel,
  mode,
  t,
}: {
  title: string;
  rule: string;
  ruleLabel: string;
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
      <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
        {title}
        <RuleTooltip rule={rule} label={ruleLabel} />
      </h2>
      <div className="border-[0.5px] border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <table className="w-full text-sm sm:text-base">
          <thead>
            <tr className="border-b-[0.5px] border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
              <th className="px-3 py-2 text-left font-medium">{t("rank")}</th>
              <th className="px-3 py-2 text-left font-medium">{t("player")}</th>
              {mode === "mostLines" && (
                <th className="px-3 py-2 text-center font-medium">
                  {valueLabel}
                </th>
              )}
              <th
                className={`px-3 py-2 text-right font-medium ${
                  mode === "mostLines" ? "hidden sm:table-cell" : ""
                }`}
              >
                {timeLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === "mostLines" ? 4 : 3}
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
                    {mode === "mostLines" && (
                      <td className="px-3 py-2 text-center">
                        {entry.line_count > 0 ? entry.line_count : "-"}
                      </td>
                    )}
                    <td
                      className={`px-3 py-2 text-right text-gray-500 ${
                        mode === "mostLines" ? "hidden sm:table-cell" : ""
                      }`}
                    >
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
