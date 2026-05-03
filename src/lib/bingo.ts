import { getSupabaseClient, Database } from "./supabase";

// Hardcoded event config (single event)
export const BINGO_EVENT = {
  name: "을지로 탐험 빙고",
  description: "을지로 일대 9곳을 방문하세요!",
  proximityRadiusMeters: 75,
  startAt: "2026-04-29T14:00:00+09:00",
  endAt: "2026-04-29T17:00:00+09:00",
};

export const MAX_BINGO_PLAYERS = 100;

export const BINGO_ADMIN_NAME = "이소정";

export const BINGO_TEAMS = [
  "AX팀",
  "BX팀",
  "앱전략팀",
  "코어디자인팀",
  "프로덕트디자인팀",
] as const;
export type BingoTeam = (typeof BINGO_TEAMS)[number];

export type GetOrCreatePlayerResult =
  | { ok: true; player: BingoPlayer; created: boolean }
  | { ok: false; reason: "limit" | "failed" };

export type BingoLocation =
  Database["public"]["Tables"]["bingo_locations"]["Row"];
export type BingoPlayer = Database["public"]["Tables"]["bingo_players"]["Row"];
export type BingoCheck = Database["public"]["Tables"]["bingo_checks"]["Row"];
export type BingoLine = Database["public"]["Tables"]["bingo_lines"]["Row"];

export interface BingoSnapshot {
  locations: BingoLocation[];
  players: BingoPlayer[];
  checks: BingoCheck[];
  lines: BingoLine[];
}

export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  player_team: BingoTeam;
  line_count: number;
  check_count: number;
  latest_line_at: string | null;
  first_line_at: string | null;
}

export interface Leaderboards {
  mostLines: LeaderboardEntry[];
  speed: LeaderboardEntry[];
}

const BINGO_CACHE_KEY = "bingo_frozen_snapshot";
const BINGO_PLAYER_KEYS = ["bingo_player_id", "bingo_player_name"];

// All possible bingo lines (indices refer to board position 0-8)
export const BINGO_LINES: { type: string; cells: number[] }[] = [
  { type: "row-0", cells: [0, 1, 2] },
  { type: "row-1", cells: [3, 4, 5] },
  { type: "row-2", cells: [6, 7, 8] },
  { type: "col-0", cells: [0, 3, 6] },
  { type: "col-1", cells: [1, 4, 7] },
  { type: "col-2", cells: [2, 5, 8] },
  { type: "diag-main", cells: [0, 4, 8] },
  { type: "diag-anti", cells: [2, 4, 6] },
];

function emptySnapshot(): BingoSnapshot {
  return { locations: [], players: [], checks: [], lines: [] };
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function getCachedSnapshot(): BingoSnapshot {
  if (!canUseSessionStorage()) return emptySnapshot();

  const raw = window.sessionStorage.getItem(BINGO_CACHE_KEY);
  if (!raw) return emptySnapshot();

  try {
    const snapshot = JSON.parse(raw) as Partial<BingoSnapshot>;
    return {
      locations: snapshot.locations ?? [],
      players: snapshot.players ?? [],
      checks: snapshot.checks ?? [],
      lines: snapshot.lines ?? [],
    };
  } catch (error) {
    console.error("Error parsing bingo session cache:", error);
    return emptySnapshot();
  }
}

function saveCachedSnapshot(snapshot: BingoSnapshot) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(BINGO_CACHE_KEY, JSON.stringify(snapshot));
}

export function clearBingoSessionCache() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(BINGO_CACHE_KEY);
  for (const key of BINGO_PLAYER_KEYS) {
    window.sessionStorage.removeItem(key);
  }
}

export async function loadFrozenBingoSnapshot(): Promise<BingoSnapshot> {
  clearBingoSessionCache();

  try {
    const supabase = getSupabaseClient();
    const [locationsRes, playersRes, checksRes, linesRes] = await Promise.all([
      supabase
        .from("bingo_locations")
        .select("*")
        .order("cell_index", { ascending: true }),
      supabase
        .from("bingo_players")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("bingo_checks")
        .select("*")
        .order("checked_at", { ascending: true }),
      supabase
        .from("bingo_lines")
        .select("*")
        .order("completed_at", { ascending: true }),
    ]);

    if (locationsRes.error) {
      console.error("Error fetching locations:", locationsRes.error);
    }
    if (playersRes.error) {
      console.error("Error fetching players:", playersRes.error);
    }
    if (checksRes.error) {
      console.error("Error fetching checks:", checksRes.error);
    }
    if (linesRes.error) {
      console.error("Error fetching lines:", linesRes.error);
    }

    const snapshot: BingoSnapshot = {
      locations: (locationsRes.data as unknown as BingoLocation[]) ?? [],
      players: (playersRes.data as unknown as BingoPlayer[]) ?? [],
      checks: (checksRes.data as unknown as BingoCheck[]) ?? [],
      lines: (linesRes.data as unknown as BingoLine[]) ?? [],
    };
    saveCachedSnapshot(snapshot);
    return snapshot;
  } catch (error) {
    console.error("Error fetching bingo snapshot:", error);
    const snapshot = emptySnapshot();
    saveCachedSnapshot(snapshot);
    return snapshot;
  }
}

export async function getLocations(): Promise<BingoLocation[]> {
  return getCachedSnapshot().locations;
}

export async function getPlayerNameById(
  playerId: string,
): Promise<string | null> {
  return getCachedSnapshot().players.find((player) => player.id === playerId)
    ?.name ?? null;
}

export async function getPlayerByName(
  name: string,
): Promise<BingoPlayer | null> {
  const trimmed = name.trim();
  return (
    getCachedSnapshot().players.find((player) => player.name === trimmed) ??
    null
  );
}

function generateBoardLayout(): number[] {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

export async function getOrCreatePlayer(
  name: string,
  team: BingoTeam,
): Promise<GetOrCreatePlayerResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "failed" };
  if (!BINGO_TEAMS.includes(team)) return { ok: false, reason: "failed" };

  const snapshot = getCachedSnapshot();
  const existing = snapshot.players.find((player) => player.name === trimmed);
  if (existing) return { ok: true, player: existing, created: false };

  if (snapshot.players.length >= MAX_BINGO_PLAYERS) {
    return { ok: false, reason: "limit" };
  }

  const now = new Date().toISOString();
  const player: BingoPlayer = {
    id: crypto.randomUUID(),
    name: trimmed,
    team,
    board_layout: generateBoardLayout(),
    created_at: now,
  };

  snapshot.players = [...snapshot.players, player];
  saveCachedSnapshot(snapshot);

  return { ok: true, player, created: true };
}

export async function getPlayerChecks(playerId: string): Promise<BingoCheck[]> {
  return getCachedSnapshot().checks.filter((check) => check.player_id === playerId);
}

export async function getPlayerLines(playerId: string): Promise<BingoLine[]> {
  return getCachedSnapshot().lines.filter((line) => line.player_id === playerId);
}

export async function insertCheck(
  playerId: string,
  locationId: string,
  lat: number,
  lng: number,
): Promise<BingoCheck | null> {
  const snapshot = getCachedSnapshot();
  const exists = snapshot.checks.some(
    (check) =>
      check.player_id === playerId && check.location_id === locationId,
  );
  if (exists) return null;

  const check: BingoCheck = {
    id: crypto.randomUUID(),
    player_id: playerId,
    location_id: locationId,
    checked_at: new Date().toISOString(),
    latitude: lat,
    longitude: lng,
  };

  snapshot.checks = [...snapshot.checks, check];
  saveCachedSnapshot(snapshot);
  return check;
}

export async function updateLocationCoords(
  locationId: string,
  latitude: number,
  longitude: number,
): Promise<BingoLocation | null> {
  const snapshot = getCachedSnapshot();
  const location = snapshot.locations.find((loc) => loc.id === locationId);
  if (!location) return null;

  const updated: BingoLocation = { ...location, latitude, longitude };
  snapshot.locations = snapshot.locations.map((loc) =>
    loc.id === locationId ? updated : loc,
  );
  saveCachedSnapshot(snapshot);
  return updated;
}

export async function insertLine(
  playerId: string,
  lineType: string,
): Promise<BingoLine | null> {
  const snapshot = getCachedSnapshot();
  const exists = snapshot.lines.some(
    (line) => line.player_id === playerId && line.line_type === lineType,
  );
  if (exists) return null;

  const line: BingoLine = {
    id: crypto.randomUUID(),
    player_id: playerId,
    line_type: lineType,
    completed_at: new Date().toISOString(),
  };

  snapshot.lines = [...snapshot.lines, line];
  saveCachedSnapshot(snapshot);
  return line;
}

function coerceTeam(team: string): BingoTeam {
  return BINGO_TEAMS.includes(team as BingoTeam)
    ? (team as BingoTeam)
    : BINGO_TEAMS[0];
}

export async function getLeaderboard(): Promise<Leaderboards> {
  const snapshot = getCachedSnapshot();
  const entries: LeaderboardEntry[] = snapshot.players.map((player) => {
    const checks = snapshot.checks.filter(
      (check) => check.player_id === player.id,
    );
    const lines = snapshot.lines
      .filter((line) => line.player_id === player.id)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime(),
      );

    return {
      player_id: player.id,
      player_name: player.name,
      player_team: coerceTeam(player.team),
      line_count: lines.length,
      check_count: checks.length,
      first_line_at: lines.length > 0 ? lines[0].completed_at : null,
      latest_line_at:
        lines.length > 0 ? lines[lines.length - 1].completed_at : null,
    };
  });

  const mostLines = entries
    .filter((entry) => entry.line_count >= 1)
    .sort((a, b) => {
      if (b.line_count !== a.line_count) return b.line_count - a.line_count;
      if (a.latest_line_at && b.latest_line_at) {
        return (
          new Date(a.latest_line_at).getTime() -
          new Date(b.latest_line_at).getTime()
        );
      }
      if (a.latest_line_at) return -1;
      if (b.latest_line_at) return 1;
      return 0;
    })
    .slice(0, 5);

  const speed = entries
    .filter((entry) => entry.first_line_at !== null)
    .sort(
      (a, b) =>
        new Date(a.first_line_at as string).getTime() -
        new Date(b.first_line_at as string).getTime(),
    )
    .slice(0, 5);

  return { mostLines, speed };
}
