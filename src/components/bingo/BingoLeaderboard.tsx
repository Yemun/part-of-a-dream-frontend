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
  const [data, setData] = useState<Leaderboards>({ mostLines: [], speed: [] });

  useEffect(() => {
    let cancelled = false;
    getLeaderboard().then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <>
      <LeaderboardSection
        title={t("leaderboardSpeed")}
        rule={t("ruleSpeed")}
        ruleLabel={t("ruleLabel")}
        entries={data.speed}
        currentPlayerId={currentPlayerId}
        emptyLabel={t("noEntries")}
        mode="speed"
        unitLabel={t("lines")}
      />
      <LeaderboardSection
        title={t("leaderboardMostLines")}
        rule={t("ruleMostLines")}
        ruleLabel={t("ruleLabel")}
        entries={data.mostLines}
        currentPlayerId={currentPlayerId}
        emptyLabel={t("noEntries")}
        mode="mostLines"
        unitLabel={t("lines")}
      />
    </>
  );
}

function LeaderboardSection({
  title,
  rule,
  ruleLabel,
  entries,
  currentPlayerId,
  emptyLabel,
  mode,
  unitLabel,
}: {
  title: string;
  rule: string;
  ruleLabel: string;
  entries: LeaderboardEntry[];
  currentPlayerId: string;
  emptyLabel: string;
  mode: "mostLines" | "speed";
  unitLabel: string;
}) {
  return (
    <div className="bingo-section">
      <h2 className="bingo-section-title">
        {title}
        <RuleTooltip rule={rule} label={ruleLabel} />
      </h2>
      {entries.length === 0 ? (
        <div className="bingo-lb-empty">{emptyLabel}</div>
      ) : (
        <div className="bingo-lb-list">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isMe = entry.player_id === currentPlayerId;
            const timeValue =
              mode === "speed" ? entry.first_line_at : entry.latest_line_at;
            return (
              <div
                key={entry.player_id}
                className={`bingo-lb-row rank-${rank} ${isMe ? "me" : ""}`}
              >
                <Medal rank={rank} />
                <div className="bingo-lb-player">
                  <span className="bingo-lb-player-name">
                    {entry.player_name}
                  </span>
                  <span className="bingo-lb-player-team">
                    {entry.player_team}
                  </span>
                  {isMe && <span className="you-tag">YOU</span>}
                </div>
                {mode === "mostLines" ? (
                  <div className="bingo-lb-value">
                    {entry.line_count > 0 ? (
                      <>
                        {entry.line_count}
                        <span className="unit">{unitLabel}</span>
                      </>
                    ) : (
                      <span className="empty">—</span>
                    )}
                  </div>
                ) : (
                  <div className="bingo-lb-time">
                    {timeValue ? new Date(timeValue).toLocaleTimeString() : "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Medal({ rank }: { rank: number }) {
  if (rank > 3) {
    return (
      <div className="bingo-lb-medal">
        <div className="bingo-lb-medal-chip">{rank}</div>
      </div>
    );
  }
  const palettes: Record<number, { body: string; ring: string; star: string }> =
    {
      1: { body: "#FFE04A", ring: "#F9A012", star: "#F55142" },
      2: { body: "#E0E6F1", ring: "#8694B1", star: "#4262FF" },
      3: { body: "#FFC0A8", ring: "#E0653F", star: "#1BA46E" },
    };
  const p = palettes[rank];
  return (
    <div className="bingo-lb-medal">
      <svg
        className="bingo-lb-medal-svg"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="26"
          cy="26"
          r="22"
          fill={p.ring}
          stroke="#020616"
          strokeWidth="2.5"
        />
        <circle
          cx="26"
          cy="26"
          r="17"
          fill={p.body}
          stroke="#020616"
          strokeWidth="2"
        />
        <text
          x="26"
          y="32"
          textAnchor="middle"
          fontFamily="Pretendard, system-ui, sans-serif"
          fontWeight="900"
          fontSize="20"
          fill="#020616"
          letterSpacing="-0.5"
        >
          {rank}
        </text>
      </svg>
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
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="bingo-help"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <div role="tooltip" className="bingo-tooltip">
          {rule}
        </div>
      )}
    </div>
  );
}
