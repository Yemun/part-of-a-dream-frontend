"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import Button from "@/components/ui/Button";

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
  const checkingRef = useRef<Set<string>>(new Set());

  const { position, status, pause, resume, isPaused } = useGpsTracking();

  const isAdmin = player.name === BINGO_ADMIN_NAME;

  const effectiveLocations = locations.map(
    (loc) => locationOverrides.get(loc.id) ?? loc
  );

  const locationById = new Map(effectiveLocations.map((loc) => [loc.id, loc]));

  const locationByCellIndex = new Map(
    effectiveLocations.map((loc) => [loc.cell_index, loc])
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

  const addToast = useCallback((text: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text }]);
  }, []);

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
            addToast(t("toastBingoLine", { player: player.name }));
          }
        }
      }
    },
    [board, player.id, player.name, addToast, t]
  );

  useEffect(() => {
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
  }, [position, status, locationOverrides]);

  const handleCheck = useCallback(
    async (locationId: string) => {
      if (!position) return;
      if (checkedLocationIds.has(locationId)) return;
      if (!nearbyLocationIds.has(locationId)) return;
      if (checkingRef.current.has(locationId)) return;

      checkingRef.current.add(locationId);
      const check = await insertCheck(
        player.id,
        locationId,
        position.latitude,
        position.longitude
      );
      checkingRef.current.delete(locationId);

      if (check) {
        const newChecks = [...checks, check];
        setChecks(newChecks);
        setLeaderboardKey((k) => k + 1);

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

  const handleEnableGps = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => resume(),
      () => resume(),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [resume]);

  const gpsActive = status === "active" && !isPaused;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{player.name}</span>
      </div>

      <BingoEventHeader />

      {gpsActive ? (
        <span className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {t("gpsTracking")}
        </span>
      ) : (
        <Button variant="primary" size="md" onClick={handleEnableGps}>
          {t("enableGps")}
        </Button>
      )}

      <BingoStatus
        gpsStatus={status}
        lineCount={lines.length}
        isPaused={isPaused}
        onPause={pause}
        onResume={resume}
      />

      <div className="grid grid-cols-3 gap-2 mx-auto w-full max-w-[500px]">
        {board.map((loc, index) =>
          loc ? (
            <BingoCell
              key={loc.id}
              location={loc}
              isChecked={checkedLocationIds.has(loc.id)}
              isNearby={nearbyLocationIds.has(loc.id)}
              distance={distances.get(loc.id) ?? null}
              onCheck={() => handleCheck(loc.id)}
              onOpenDetails={setSelectedLocation}
            />
          ) : (
            <div
              key={index}
              className="aspect-square border-[0.5px] border-gray-200 dark:border-gray-700"
            />
          )
        )}
      </div>

      <BingoLeaderboard
        currentPlayerId={player.id}
        refreshKey={leaderboardKey}
      />
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
        onNotify={addToast}
      />
    </div>
  );
}
