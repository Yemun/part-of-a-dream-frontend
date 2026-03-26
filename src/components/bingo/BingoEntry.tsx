"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  BINGO_EVENT,
  getLocations,
  getPlayerByName,
  BingoLocation,
  BingoPlayer,
} from "@/lib/bingo";
import BingoBoard from "./BingoBoard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function BingoEntry() {
  const t = useTranslations("bingo");
  const [locations, setLocations] = useState<BingoLocation[]>([]);
  const [player, setPlayer] = useState<BingoPlayer | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const locs = await getLocations();
        setLocations(locs);

        // Restore session
        const savedName = sessionStorage.getItem("bingo_player_name");
        if (savedName) {
          const p = await getPlayerByName(savedName);
          if (p) setPlayer(p);
        }
      } catch (err) {
        console.error("Error loading:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("bingo_player_id");
    sessionStorage.removeItem("bingo_player_name");
    setPlayer(null);
    setName("");
    setError("");
  }, []);

  const handleJoin = useCallback(async () => {
    if (!name.trim()) return;
    setJoining(true);
    setError("");

    try {
      const p = await getPlayerByName(name.trim());
      if (!p) {
        setError(t("notRegistered"));
        setJoining(false);
        return;
      }
      setPlayer(p);
      sessionStorage.setItem("bingo_player_id", p.id);
      sessionStorage.setItem("bingo_player_name", p.name);
    } catch (err) {
      console.error("Error joining:", err);
      setError(t("notRegistered"));
    } finally {
      setJoining(false);
    }
  }, [name, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  if (player) {
    return <BingoBoard locations={locations} player={player} onChangeName={handleLogout} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
      <h1 className="text-lg font-semibold">{BINGO_EVENT.name}</h1>
      <p className="text-sm text-gray-500">{BINGO_EVENT.description}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleJoin();
        }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Input
          placeholder={t("enterName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error || undefined}
        />
        <Button type="submit" disabled={joining || !name.trim()}>
          {joining ? t("loading") : t("join")}
        </Button>
      </form>
    </div>
  );
}
