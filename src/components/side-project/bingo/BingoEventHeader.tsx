"use client";

import { useTranslations } from "next-intl";

interface BingoEventHeaderProps {
  playerName?: string;
  playerTeam?: string;
}

export default function BingoEventHeader({
  playerName,
  playerTeam,
}: BingoEventHeaderProps) {
  const t = useTranslations("bingo");

  return (
    <header className="bingo-hero">
      {playerName && (
        <div className="bingo-hero-player">
          {playerName}
          {playerTeam && (
            <span className="bingo-hero-team"> · {playerTeam}</span>
          )}
        </div>
      )}
      <div className="bingo-hero-eyebrow">AI CX KEMIDAY</div>
      <h1 className="bingo-hero-title">
        <em>{t("heroTitleEm")}</em> {t("heroTitleRest")}
      </h1>
    </header>
  );
}
