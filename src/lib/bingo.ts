import { getSupabaseClient, Database } from "./supabase";

// Hardcoded event config (single event)
export const BINGO_EVENT = {
  name: "을지로 탐험 빙고",
  description: "을지로 일대 9곳을 방문하세요!",
  proximityRadiusMeters: 50,
  startAt: "2026-04-29T14:00:00+09:00",
  endAt: "2026-04-29T17:00:00+09:00",
};

export const MAX_BINGO_PLAYERS = 100;

export type GetOrCreatePlayerResult =
  | { ok: true; player: BingoPlayer; created: boolean }
  | { ok: false; reason: "limit" | "failed" };

// Types
export type BingoLocation =
  Database["public"]["Tables"]["bingo_locations"]["Row"];
export type BingoPlayer = Database["public"]["Tables"]["bingo_players"]["Row"];
export type BingoCheck = Database["public"]["Tables"]["bingo_checks"]["Row"];
export type BingoLine = Database["public"]["Tables"]["bingo_lines"]["Row"];

export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  line_count: number;
  check_count: number;
  latest_line_at: string | null;
  first_line_at: string | null;
}

export interface Leaderboards {
  mostLines: LeaderboardEntry[];
  speed: LeaderboardEntry[];
}

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

// Player name lookup (for realtime toast messages)
export async function getPlayerNameById(
  playerId: string,
): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_players")
      .select("name")
      .eq("id", playerId)
      .single();

    if (error) return null;
    return (data as unknown as { name: string }).name;
  } catch {
    return null;
  }
}

// Data access functions

export async function getLocations(): Promise<BingoLocation[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_locations")
      .select("*")
      .order("cell_index", { ascending: true });

    if (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
    return (data as unknown as BingoLocation[]) || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function getPlayerByName(
  name: string,
): Promise<BingoPlayer | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_players")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("Error fetching player:", error);
      return null;
    }
    return data as unknown as BingoPlayer;
  } catch (error) {
    console.error("Error fetching player:", error);
    return null;
  }
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
): Promise<GetOrCreatePlayerResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "failed" };

  try {
    const existing = await getPlayerByName(trimmed);
    if (existing) return { ok: true, player: existing, created: false };

    const supabase = getSupabaseClient();

    const { count, error: countError } = await supabase
      .from("bingo_players")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting players:", countError);
      return { ok: false, reason: "failed" };
    }
    if ((count ?? 0) >= MAX_BINGO_PLAYERS) {
      return { ok: false, reason: "limit" };
    }

    const { data, error } = await supabase
      .from("bingo_players")
      .insert({ name: trimmed, board_layout: generateBoardLayout() })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        const raced = await getPlayerByName(trimmed);
        if (raced) return { ok: true, player: raced, created: false };
      }
      console.error("Error creating player:", error);
      return { ok: false, reason: "failed" };
    }

    return {
      ok: true,
      player: data as unknown as BingoPlayer,
      created: true,
    };
  } catch (error) {
    console.error("Error in getOrCreatePlayer:", error);
    return { ok: false, reason: "failed" };
  }
}

export async function getPlayerChecks(playerId: string): Promise<BingoCheck[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_checks")
      .select("*")
      .eq("player_id", playerId);

    if (error) {
      console.error("Error fetching checks:", error);
      return [];
    }
    return (data as unknown as BingoCheck[]) || [];
  } catch (error) {
    console.error("Error fetching checks:", error);
    return [];
  }
}

export async function getPlayerLines(playerId: string): Promise<BingoLine[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_lines")
      .select("*")
      .eq("player_id", playerId);

    if (error) {
      console.error("Error fetching lines:", error);
      return [];
    }
    return (data as unknown as BingoLine[]) || [];
  } catch (error) {
    console.error("Error fetching lines:", error);
    return [];
  }
}

export async function insertCheck(
  playerId: string,
  locationId: string,
  lat: number,
  lng: number,
): Promise<BingoCheck | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_checks")
      .insert({
        player_id: playerId,
        location_id: locationId,
        latitude: lat,
        longitude: lng,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return null;
      console.error("Error inserting check:", error);
      return null;
    }
    return data as unknown as BingoCheck;
  } catch (error) {
    console.error("Error inserting check:", error);
    return null;
  }
}

export async function insertLine(
  playerId: string,
  lineType: string,
): Promise<BingoLine | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bingo_lines")
      .insert({
        player_id: playerId,
        line_type: lineType,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return null;
      console.error("Error inserting line:", error);
      return null;
    }
    return data as unknown as BingoLine;
  } catch (error) {
    console.error("Error inserting line:", error);
    return null;
  }
}

export async function getLeaderboard(): Promise<Leaderboards> {
  try {
    const supabase = getSupabaseClient();

    const { data: players, error: playersError } = await supabase
      .from("bingo_players")
      .select("id, name");

    if (playersError || !players) return { mostLines: [], speed: [] };

    const entries: LeaderboardEntry[] = [];

    for (const player of players as unknown as { id: string; name: string }[]) {
      const [checksRes, linesRes] = await Promise.all([
        supabase
          .from("bingo_checks")
          .select("id", { count: "exact" })
          .eq("player_id", player.id),
        supabase
          .from("bingo_lines")
          .select("*")
          .eq("player_id", player.id)
          .order("completed_at", { ascending: true }),
      ]);

      const lines = (linesRes.data as unknown as BingoLine[]) || [];
      entries.push({
        player_id: player.id,
        player_name: player.name,
        line_count: lines.length,
        check_count: checksRes.count || 0,
        first_line_at: lines.length > 0 ? lines[0].completed_at : null,
        latest_line_at:
          lines.length > 0 ? lines[lines.length - 1].completed_at : null,
      });
    }

    const mostLines = [...entries]
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
      .filter((e) => e.first_line_at !== null)
      .sort(
        (a, b) =>
          new Date(a.first_line_at as string).getTime() -
          new Date(b.first_line_at as string).getTime(),
      )
      .slice(0, 5);

    return { mostLines, speed };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { mostLines: [], speed: [] };
  }
}
