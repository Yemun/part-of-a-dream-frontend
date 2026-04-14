import { getSupabaseClient, Database } from "./supabase";

// Hardcoded event config (single event)
export const BINGO_EVENT = {
  name: "을지로 탐험 빙고",
  description: "을지로 일대 9곳을 방문하세요!",
  proximityRadiusMeters: 50,
  startAt: "2026-04-28T14:00:00+09:00",
  endAt: "2026-04-28T17:00:00+09:00",
};

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

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getSupabaseClient();

    const { data: players, error: playersError } = await supabase
      .from("bingo_players")
      .select("id, name");

    if (playersError || !players) return [];

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
          .order("completed_at", { ascending: false }),
      ]);

      const lines = (linesRes.data as unknown as BingoLine[]) || [];
      entries.push({
        player_id: player.id,
        player_name: player.name,
        line_count: lines.length,
        check_count: checksRes.count || 0,
        latest_line_at: lines.length > 0 ? lines[0].completed_at : null,
      });
    }

    entries.sort((a, b) => {
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
    });

    return entries;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
