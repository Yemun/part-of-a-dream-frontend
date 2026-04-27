"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BINGO_EVENT } from "@/lib/bingo";

interface CountdownParts {
  big: string;
  parts: [string, number][];
  isLive: boolean;
  isEnded: boolean;
}

function formatRemaining(ms: number): {
  big: string;
  parts: [string, number][];
} {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (d > 0) {
    return {
      big: `${d}일 ${h}시간`,
      parts: [
        ["일", d],
        ["시간", h],
        ["분", m],
      ],
    };
  }
  return {
    big: `${pad(h)}:${pad(m)}:${pad(s)}`,
    parts: [
      ["시", h],
      ["분", m],
      ["초", s],
    ],
  };
}

function useCountdown(): CountdownParts {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(BINGO_EVENT.startAt).getTime();
  const end = new Date(BINGO_EVENT.endAt).getTime();

  const isLive = now >= start && now < end;
  const isEnded = now >= end;
  const target = isEnded ? end : isLive ? end : start;
  const { big, parts } = formatRemaining(target - now);

  return { big, parts, isLive, isEnded };
}

export default function BingoEventHeader() {
  const t = useTranslations("bingo");
  const { parts, isLive, isEnded } = useCountdown();

  return (
    <header className="bingo-hero">
      <div className="bingo-hero-eyebrow">AI CX KEMIDAY</div>
      <h1 className="bingo-hero-title">
        <em>을지로</em> 탐험 빙고
      </h1>
      <div className="bingo-hero-bottom">
        <div className="bingo-hero-stat">
          <span className="num">9</span>
          <span className="label">위치 도전</span>
        </div>
        {!isEnded && (
          <div
            className="bingo-countdown"
            title={isLive ? "종료까지" : "시작까지"}
          >
            {parts.map(([unit, v], i) => (
              <Fragment key={i}>
                <span className="num">{String(v).padStart(2, "0")}</span>
                {unit}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
