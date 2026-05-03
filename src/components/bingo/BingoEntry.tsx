"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  BINGO_TEAMS,
  BingoTeam,
  getOrCreatePlayer,
  loadFrozenBingoSnapshot,
  BingoLocation,
  BingoPlayer,
} from "@/lib/bingo";
import BingoBoard from "./BingoBoard";

export default function BingoEntry() {
  const t = useTranslations("bingo");
  const [locations, setLocations] = useState<BingoLocation[]>([]);
  const [player, setPlayer] = useState<BingoPlayer | null>(null);
  const [name, setName] = useState("");
  const [team, setTeam] = useState<BingoTeam | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snapshot = await loadFrozenBingoSnapshot();
        setLocations(snapshot.locations);
      } catch (err) {
        console.error("Error loading:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleJoin = useCallback(async () => {
    if (!name.trim() || !team) return;
    setJoining(true);
    setError("");

    try {
      const result = await getOrCreatePlayer(name.trim(), team);
      if (!result.ok) {
        setError(
          result.reason === "limit" ? t("playerLimitReached") : t("joinFailed"),
        );
        setJoining(false);
        return;
      }
      setPlayer(result.player);
      sessionStorage.setItem("bingo_player_id", result.player.id);
      sessionStorage.setItem("bingo_player_name", result.player.name);
    } catch (err) {
      console.error("Error joining:", err);
      setError(t("joinFailed"));
    } finally {
      setJoining(false);
    }
  }, [name, team, t]);

  if (loading) {
    return (
      <div className="bingo-entry">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (player) {
    return <BingoBoard locations={locations} player={player} />;
  }

  return (
    <div className="bingo-entry">
      <h1>{t("eventName")}</h1>
      <p>{t("eventDescription")}</p>
      <form
        className="bingo-entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleJoin();
        }}
      >
        <fieldset className="bingo-entry-teams">
          <legend>{t("selectTeam")}</legend>
          {BINGO_TEAMS.map((option) => (
            <label key={option} className="bingo-entry-team-option">
              <input
                type="radio"
                name="bingo-team"
                value={option}
                checked={team === option}
                onChange={() => setTeam(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
        <input
          type="text"
          placeholder={t("enterName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <span className="bingo-entry-error">{error}</span>}
        <button
          type="submit"
          className="bingo-cta primary"
          disabled={joining || !name.trim() || !team}
        >
          {joining ? t("loading") : t("join")}
        </button>
      </form>
    </div>
  );
}
