"use client";

interface BingoEventHeaderProps {
  playerName?: string;
}

export default function BingoEventHeader({
  playerName,
}: BingoEventHeaderProps) {
  return (
    <header className="bingo-hero">
      {playerName && <div className="bingo-hero-player">{playerName}</div>}
      <div className="bingo-hero-eyebrow">AI CX KEMIDAY</div>
      <h1 className="bingo-hero-title">
        <em>을지로</em> 탐험 빙고
      </h1>
    </header>
  );
}
