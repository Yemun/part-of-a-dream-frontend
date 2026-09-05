"use client";

import { useMemo, useState } from "react";
import {
  FAMILIES,
  STEPS,
  ZERO_DELTA,
  addDelta,
  hueArc,
  involvement,
  scaleDelta,
  shiftColor,
  toCss,
  type Delta,
} from "./paletteTokens";

const DEFAULT_HUE_SPREAD = 2;
const DEFAULT_STEP_SPREAD = 2;
const BASE_STEP_INDEX = STEPS.findIndex((s) => s.key === "base");

function zeroGrid(): Delta[][] {
  return FAMILIES.map(() => STEPS.map(() => ZERO_DELTA));
}

export default function PaletteEntry() {
  const [anchorIndex, setAnchorIndex] = useState(
    FAMILIES.findIndex((f) => f.key === "blue")
  );
  const [stepIndex, setStepIndex] = useState(BASE_STEP_INDEX);
  const [hueSpread, setHueSpread] = useState(DEFAULT_HUE_SPREAD);
  const [stepSpread, setStepSpread] = useState(DEFAULT_STEP_SPREAD);
  const [baked, setBaked] = useState<Delta[][]>(zeroGrid);
  const [adj, setAdj] = useState<Delta>(ZERO_DELTA);

  const anchor = FAMILIES[anchorIndex];

  // hue 관여도: 기준 계열과 몇 행 떨어져 있는가
  const hueWeights = useMemo(
    () => FAMILIES.map((_, i) => involvement(anchorIndex, i, hueSpread)),
    [anchorIndex, hueSpread]
  );

  // lightness 관여도: 기준 단계와 몇 칸 떨어져 있는가
  const stepWeights = useMemo(
    () => STEPS.map((_, i) => involvement(stepIndex, i, stepSpread)),
    [stepIndex, stepSpread]
  );

  // 고정된 변화량 + 지금 조정 중인 변화량 × (hue 관여도 × lightness 관여도)
  const deltas = useMemo(
    () =>
      baked.map((row, r) =>
        row.map((d, c) =>
          addDelta(d, scaleDelta(adj, hueWeights[r] * stepWeights[c]))
        )
      ),
    [baked, adj, hueWeights, stepWeights]
  );

  const grid = useMemo(
    () =>
      FAMILIES.map((f, r) =>
        STEPS.map((s, c) => shiftColor(f.steps[s.key], deltas[r][c]))
      ),
    [deltas]
  );

  const anchorColor = grid[anchorIndex][stepIndex];
  const anchorOrigin = anchor.steps[STEPS[stepIndex].key];
  const originCss = toCss(anchorOrigin);
  const anchorCss = toCss(anchorColor);
  const touched =
    adj.l !== 0 ||
    adj.c !== 0 ||
    adj.h !== 0 ||
    baked.some((row) => row.some((d) => d.l !== 0 || d.c !== 0 || d.h !== 0));

  function pickCell(row: number, col: number) {
    if (row === anchorIndex && col === stepIndex) return;
    // 기준 칸이 바뀌면 지금까지 전파된 변화량을 각 칸에 고정한다
    setBaked(deltas);
    setAdj(ZERO_DELTA);
    setAnchorIndex(row);
    setStepIndex(col);
  }

  function nudge(channel: "l" | "c" | "h", value: number) {
    setAdj((a) =>
      channel === "h"
        ? { ...a, h: a.h + hueArc(anchorColor.h, value) }
        : { ...a, [channel]: a[channel] + (value - anchorColor[channel]) }
    );
  }

  function reset() {
    setBaked(zeroGrid());
    setAdj(ZERO_DELTA);
    setHueSpread(DEFAULT_HUE_SPREAD);
    setStepSpread(DEFAULT_STEP_SPREAD);
  }

  return (
    <div className="w-full sm:flex sm:items-start sm:gap-6 lg:gap-8">
      <div className="grid min-w-0 flex-1 grid-cols-[52px_repeat(6,1fr)] gap-1 sm:grid-cols-[64px_repeat(6,1fr)] sm:gap-1.5">
        <div />
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            className={`pb-1 text-center text-[11px] leading-3 sm:text-xs ${
              i === stepIndex
                ? "font-semibold text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {step.label}
            <span className="mt-0.5 block text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
              {Math.round(stepWeights[i] * 100)}%
            </span>
          </div>
        ))}

        {FAMILIES.map((family, row) => (
          <div key={family.key} className="contents">
            <button
              type="button"
              onClick={() => pickCell(row, stepIndex)}
              className="flex flex-col items-start justify-center pr-2 text-left"
            >
              <span
                className={`text-xs leading-4 sm:text-sm ${
                  row === anchorIndex
                    ? "font-semibold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {family.label}
              </span>
              <span className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
                {Math.round(hueWeights[row] * 100)}%
              </span>
            </button>

            {STEPS.map((step, col) => {
              const isAnchor = row === anchorIndex && col === stepIndex;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => pickCell(row, col)}
                  aria-label={`${family.label} ${step.label}`}
                  className={`aspect-square w-full rounded-sm ${
                    isAnchor
                      ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-zinc-950"
                      : ""
                  }`}
                  style={{ backgroundColor: toCss(grid[row][col]) }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-8 sm:mt-0 sm:w-52 sm:shrink-0 lg:w-56">
        <div className="flex items-center gap-2.5">
          <span
            className="h-6 w-6 shrink-0 rounded-sm"
            style={{ backgroundColor: toCss(anchorColor) }}
          />
          <span className="text-sm font-semibold">
            {anchor.label}-{STEPS[stepIndex].label}
          </span>
          <button
            type="button"
            onClick={reset}
            disabled={
              !touched &&
              hueSpread === DEFAULT_HUE_SPREAD &&
              stepSpread === DEFAULT_STEP_SPREAD
            }
            className="ml-auto border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Reset
          </button>
        </div>
        <div className="mt-2 space-y-0.5 font-mono text-[11px] tabular-nums">
          {/* 값이 그대로면 자리만 남기고 감춘다 — 슬라이더가 밀리지 않도록 */}
          <div
            className={`text-zinc-500 line-through dark:text-zinc-400 ${
              originCss === anchorCss ? "invisible" : ""
            }`}
          >
            {originCss}
          </div>
          <div>{anchorCss}</div>
        </div>

        <div className="mt-5 grid gap-4 sm:gap-3">
          <Slider
            label="L"
            value={anchorColor.l}
            min={0.1}
            max={1}
            step={0.001}
            digits={3}
            onChange={(v) => nudge("l", v)}
          />
          <Slider
            label="C"
            value={anchorColor.c}
            min={0}
            max={0.37}
            step={0.001}
            digits={3}
            onChange={(v) => nudge("c", v)}
          />
          <Slider
            label="H"
            value={anchorColor.h}
            min={0}
            max={360}
            step={0.5}
            digits={1}
            onChange={(v) => nudge("h", v)}
          />
          <Slider
            label="Hue spread"
            value={hueSpread}
            min={0}
            max={5}
            step={0.1}
            digits={1}
            onChange={setHueSpread}
          />
          <Slider
            label="Lightness spread"
            value={stepSpread}
            min={0}
            max={5}
            step={0.1}
            digits={1}
            onChange={setStepSpread}
          />
        </div>
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  digits: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step, digits, onChange }: SliderProps) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-zinc-600 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
          {value.toFixed(digits)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
