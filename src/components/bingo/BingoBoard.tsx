"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  BINGO_EVENT,
  BINGO_ADMIN_NAME,
  BingoLocation,
  BingoPlayer,
  BingoCheck,
  BingoLine,
  BINGO_LINES,
  getPlayerChecks,
  getPlayerLines,
  getPlayerNameById,
  insertCheck,
  insertLine,
} from "@/lib/bingo";
import { getSupabaseClient } from "@/lib/supabase";
import { useGpsTracking, getDistance } from "@/lib/bingo-gps";
import BingoCell from "./BingoCell";
import BingoStatus from "./BingoStatus";
import BingoLeaderboard from "./BingoLeaderboard";
import BingoToast, { ToastMessage } from "./BingoToast";
import BingoEventHeader from "./BingoEventHeader";
import LocationModal from "./LocationModal";

interface BingoBoardProps {
  locations: BingoLocation[];
  player: BingoPlayer;
}

export default function BingoBoard({ locations, player }: BingoBoardProps) {
  const t = useTranslations("bingo");
  const [checks, setChecks] = useState<BingoCheck[]>([]);
  const [lines, setLines] = useState<BingoLine[]>([]);
  const [distances, setDistances] = useState<Map<string, number>>(new Map());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [selectedLocation, setSelectedLocation] =
    useState<BingoLocation | null>(null);
  const [locationOverrides, setLocationOverrides] = useState<
    Map<string, BingoLocation>
  >(new Map());
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const [lineFlashCells, setLineFlashCells] = useState<Set<number>>(new Set());
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGrandSlam, setShowGrandSlam] = useState(false);
  const checkingRef = useRef<Set<string>>(new Set());

  const { position, status, pause, resume, isPaused } = useGpsTracking();

  const isAdmin = player.name === BINGO_ADMIN_NAME;

  const effectiveLocations = locations.map(
    (loc) => locationOverrides.get(loc.id) ?? loc
  );

  const locationById = useMemo(
    () => new Map(effectiveLocations.map((loc) => [loc.id, loc])),
    [effectiveLocations]
  );

  const locationByCellIndex = useMemo(
    () => new Map(effectiveLocations.map((loc) => [loc.cell_index, loc])),
    [effectiveLocations]
  );
  const board: (BingoLocation | undefined)[] = player.board_layout.map(
    (cellIndex) => locationByCellIndex.get(cellIndex)
  );

  const checkedLocationIds = new Set(checks.map((c) => c.location_id));

  const nearbyLocationIds = new Set<string>();
  for (const [locId, dist] of distances) {
    if (
      dist <= BINGO_EVENT.proximityRadiusMeters &&
      !checkedLocationIds.has(locId)
    ) {
      nearbyLocationIds.add(locId);
    }
  }

  // Dev-only: ?testNearby=<cell_index> forces that cell into nearby state (GPS 없이 접근 상태 테스트)
  if (typeof window !== "undefined") {
    const param = new URLSearchParams(window.location.search).get("testNearby");
    if (param !== null) {
      const targetIndex = Number(param);
      const targetLoc = locations.find((l) => l.cell_index === targetIndex);
      if (targetLoc && !checkedLocationIds.has(targetLoc.id)) {
        nearbyLocationIds.add(targetLoc.id);
      }
    }
  }

  const completedLineIndexCells = useMemo(() => {
    const checkedPositions = new Set(
      board
        .map((loc, i) => (loc && checkedLocationIds.has(loc.id) ? i : -1))
        .filter((i) => i >= 0)
    );
    return BINGO_LINES.filter((line) =>
      line.cells.every((c) => checkedPositions.has(c))
    );
  }, [board, checkedLocationIds]);

  const addToast = useCallback(
    (text: string, kind?: "bingo") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, text, kind }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    async function load() {
      const [existingChecks, existingLines] = await Promise.all([
        getPlayerChecks(player.id),
        getPlayerLines(player.id),
      ]);
      setChecks(existingChecks);
      setLines(existingLines);
    }
    load();
  }, [player.id]);

  useEffect(() => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel("bingo-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bingo_checks" },
        async (payload) => {
          const row = payload.new as { player_id: string; location_id: string };
          if (row.player_id === player.id) return;

          const playerName = await getPlayerNameById(row.player_id);
          const loc = locationById.get(row.location_id);
          const locName = loc?.name;

          if (playerName && locName) {
            addToast(
              t("toastCheckIn", { player: playerName, location: locName })
            );
          }
          setLeaderboardKey((k) => k + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bingo_lines" },
        async (payload) => {
          const row = payload.new as { player_id: string };
          if (row.player_id === player.id) return;

          const playerName = await getPlayerNameById(row.player_id);
          if (playerName) {
            addToast(t("toastBingoLine", { player: playerName }));
          }
          setLeaderboardKey((k) => k + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id]);

  const detectLines = useCallback(
    async (currentChecks: BingoCheck[], currentLines: BingoLine[]) => {
      const currentCheckedLocationIds = new Set(
        currentChecks.map((c) => c.location_id)
      );
      const currentCheckedPositions = new Set(
        board
          .map((loc, i) =>
            loc && currentCheckedLocationIds.has(loc.id) ? i : -1
          )
          .filter((i) => i >= 0)
      );
      const currentLineTypes = new Set(currentLines.map((l) => l.line_type));

      const newlyCompletedCells = new Set<number>();
      let newLineCount = 0;

      for (const line of BINGO_LINES) {
        if (currentLineTypes.has(line.type)) continue;
        const allChecked = line.cells.every((c) =>
          currentCheckedPositions.has(c)
        );
        if (allChecked) {
          const newLine = await insertLine(player.id, line.type);
          if (newLine) {
            setLines((prev) => [...prev, newLine]);
            currentLineTypes.add(line.type);
            line.cells.forEach((c) => newlyCompletedCells.add(c));
            newLineCount += 1;
          }
        }
      }

      if (newLineCount > 0) {
        const totalLines = currentLineTypes.size;
        const isGrandSlam = totalLines === BINGO_LINES.length;
        addToast(t("toastBingoLine", { player: player.name }), "bingo");

        if (newlyCompletedCells.size > 0) {
          setLineFlashCells(newlyCompletedCells);
          setTimeout(() => setLineFlashCells(new Set()), 1000);
        }

        if (isGrandSlam) {
          setShowGrandSlam(true);
          setTimeout(() => setShowGrandSlam(false), 3200);
        } else {
          setShowCelebrate(true);
          setShowConfetti(true);
          setTimeout(() => setShowCelebrate(false), 1400);
          setTimeout(() => setShowConfetti(false), 1300);
        }
      }
    },
    [board, player.id, player.name, addToast, t]
  );

  useEffect(() => {
    // While paused, drop distance data so cells don't show stale values.
    // Resume's first GPS fix re-runs this effect and repopulates distances.
    if (isPaused) {
      setDistances(new Map());
      return;
    }
    if (!position || status !== "active") return;

    const newDistances = new Map<string, number>();
    for (const loc of effectiveLocations) {
      if (!checkedLocationIds.has(loc.id)) {
        const dist = getDistance(
          position.latitude,
          position.longitude,
          loc.latitude,
          loc.longitude
        );
        newDistances.set(loc.id, dist);
      }
    }
    setDistances(newDistances);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, status, isPaused, locationOverrides]);

  const handleCheck = useCallback(
    async (locationId: string) => {
      if (checkedLocationIds.has(locationId)) return;
      if (!nearbyLocationIds.has(locationId)) return;
      if (checkingRef.current.has(locationId)) return;

      const targetLoc = locationById.get(locationId);
      if (!targetLoc) return;

      // Real GPS fix when we have one; otherwise fall back to the location's
      // own coordinates so the testNearby flow (and non-HTTPS dev hosts that
      // can't get a fix) can still record a check-in.
      const lat = position?.latitude ?? targetLoc.latitude;
      const lng = position?.longitude ?? targetLoc.longitude;

      checkingRef.current.add(locationId);
      const check = await insertCheck(player.id, locationId, lat, lng);
      checkingRef.current.delete(locationId);

      if (check) {
        const newChecks = [...checks, check];
        setChecks(newChecks);
        setLeaderboardKey((k) => k + 1);
        setJustChecked(locationId);
        setTimeout(() => setJustChecked(null), 700);

        const loc = locationById.get(locationId);
        const locName = loc?.name;
        if (locName) {
          addToast(t("toastCheckIn", { player: player.name, location: locName }));
        }

        detectLines(newChecks, lines);
      }
    },
    [
      position,
      checks,
      lines,
      checkedLocationIds,
      nearbyLocationIds,
      player.id,
      player.name,
      locationById,
      addToast,
      t,
      detectLines,
    ]
  );

  return (
    <>
      <BingoEventHeader playerName={player.name} playerTeam={player.team} />

      <div className="bingo-board-wrap">
        <BingoStatus lineCount={lines.length} checkedCount={checks.length} />
        <div className="bingo-board" role="grid" aria-label={t("board")}>
          {board.map((loc, index) =>
            loc ? (
              <BingoCell
                key={loc.id}
                location={loc}
                isChecked={checkedLocationIds.has(loc.id)}
                isNearby={nearbyLocationIds.has(loc.id)}
                justChecked={justChecked === loc.id}
                inCompletedLine={lineFlashCells.has(index)}
                distance={distances.get(loc.id) ?? null}
                onCheck={() => handleCheck(loc.id)}
                onOpenDetails={setSelectedLocation}
              />
            ) : (
              <div key={index} className="bingo-cell empty" />
            )
          )}
          <BingoLineOverlay lines={completedLineIndexCells} />
        </div>
        {showCelebrate && (
          <div className="bingo-celebrate">
            <div className="bingo-celebrate-card">
              <div className="big">BINGO!</div>
              <div className="small">한 줄 완성 🎉</div>
            </div>
          </div>
        )}
        <Confetti show={showConfetti} />
      </div>

      <div className="bingo-gps-bar">
        <div className="bingo-gps-info">
          {!isPaused && <span className="ping" />}
          <span>{isPaused ? t("pauseTracking") : t("gpsTracking")}</span>
        </div>
        <button
          className={`bingo-toggle-btn ${isPaused ? "accent" : ""}`}
          onClick={isPaused ? resume : pause}
          type="button"
        >
          {isPaused ? t("enableGps") : t("pauseTracking")}
        </button>
      </div>

      <BingoLeaderboard
        currentPlayerId={player.id}
        refreshKey={leaderboardKey}
      />

      <div className="bingo-spacer-bottom" />

      <BingoToast toasts={toasts} onDismiss={dismissToast} />
      <LocationModal
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
        isAdmin={isAdmin}
        onLocationUpdated={(updated) => {
          setLocationOverrides((prev) => {
            const next = new Map(prev);
            next.set(updated.id, updated);
            return next;
          });
        }}
        onNotify={(text) => addToast(text)}
      />

      {showGrandSlam && <GrandSlamOverlay />}
    </>
  );
}

function BingoLineOverlay({
  lines,
}: {
  lines: { type: string; cells: number[] }[];
}) {
  if (lines.length === 0) return null;
  const center = (idx: number): [number, number] => {
    const r = Math.floor(idx / 3);
    const c = idx % 3;
    return [(c + 0.5) / 3, (r + 0.5) / 3];
  };
  return (
    <svg
      className="bingo-line-flash"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
    >
      {lines.map((ln, i) => {
        const [s, e] = [center(ln.cells[0]), center(ln.cells[2])];
        return (
          <line
            key={ln.type}
            x1={s[0]}
            y1={s[1]}
            x2={e[0]}
            y2={e[1]}
            stroke="#F55142"
            strokeWidth="0.04"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: 2,
              strokeDashoffset: 2,
              animation: `bingoDrawLine 500ms ${i * 120}ms ease forwards`,
            }}
          />
        );
      })}
    </svg>
  );
}

function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["#FFE04A", "#F55142", "#4262FF", "#1BA46E", "#FFB8D1"];
  // Deterministic jitter (index-seeded) keeps render pure.
  const jitter = (i: number, salt: number) =>
    (Math.sin((i + 1) * 12.9898 + salt * 78.233) + 1) / 2;
  // Constant radius → pieces land on a perfect circle.
  const RADIUS = 160;
  const pieces = Array.from({ length: 24 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 24;
    return {
      tx: `${Math.cos(angle) * RADIUS}px`,
      ty: `${Math.sin(angle) * RADIUS}px`,
      tr: `${(jitter(i, 3) - 0.5) * 720}deg`,
      bg: colors[i % colors.length],
      delay: `${jitter(i, 4) * 80}ms`,
    };
  });
  return (
    <div className="bingo-confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              background: p.bg,
              "--tx": p.tx,
              "--ty": p.ty,
              "--tr": p.tr,
              animationDelay: p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function GrandSlamOverlay() {
  return (
    <div className="bingo-grand-slam">
      <div className="bingo-grand-slam-rays" />
      <div className="bingo-grand-slam-card">
        <span className="crown">👑</span>
        <div className="gs-label">PERFECT</div>
        <div className="gs-big">
          <span>GRAND</span>
          <span>SLAM</span>
        </div>
        <div className="gs-sub">9개 위치 전부 방문 · 모든 빙고 완성</div>
      </div>
    </div>
  );
}
