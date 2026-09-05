"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { BingoLocation } from "@/lib/bingo";

interface BingoCellProps {
  location: BingoLocation;
  isChecked: boolean;
  isNearby: boolean;
  justChecked?: boolean;
  inCompletedLine?: boolean;
  distance: number | null;
  onCheck: () => void;
  onOpenDetails: (location: BingoLocation) => void;
}

export default function BingoCell({
  location,
  isChecked,
  isNearby,
  justChecked = false,
  inCompletedLine = false,
  distance,
  onCheck,
  onOpenDetails,
}: BingoCellProps) {
  const t = useTranslations("bingo");

  const handleClick = () => {
    if (isChecked) {
      onOpenDetails(location);
      return;
    }
    if (isNearby) {
      onCheck();
      return;
    }
    onOpenDetails(location);
  };

  const classes = [
    "bingo-cell",
    isChecked ? "checked" : "",
    !isChecked && isNearby ? "nearby" : "",
    justChecked ? "just-checked" : "",
    inCompletedLine ? "line-flash-cell" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const distanceText =
    distance !== null
      ? isNearby
        ? t("nearby")
        : t("metersAway", { meters: Math.round(distance) })
      : null;

  return (
    <button type="button" className={classes} onClick={handleClick}>
      <span className="name">
        {location.name.split("\n").map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </span>
      {!isChecked && distanceText && <span className="meta">{distanceText}</span>}
      {isChecked && (
        <span className="stamp" aria-hidden="true">
          <svg className="bingo-stamp-svg" viewBox="0 0 56 56" fill="none">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="rgba(255,254,248,0.92)"
              stroke="#F55142"
              strokeWidth="4"
            />
            <path
              d="M16 28 L25 37 L40 20"
              stroke="#F55142"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
