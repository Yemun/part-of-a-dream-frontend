"use client";

import { useTranslations } from "next-intl";

interface BingoStatusProps {
  lineCount: number;
  checkedCount: number;
}

export default function BingoStatus({
  lineCount,
  checkedCount,
}: BingoStatusProps) {
  const t = useTranslations("bingo");

  return (
    <div className="bingo-status-row">
      <span className="bingo-count-pill">
        <span className="x">{t("bingoLine")} ×</span>
        {lineCount}
      </span>
      <span className="bingo-progress-text">{checkedCount}/9 방문</span>
    </div>
  );
}
