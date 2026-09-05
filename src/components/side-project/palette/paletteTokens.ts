/**
 * util 컬러 토큰(oklch) 기반 6×6 프로토타입 데이터 + 관여도 계산.
 *
 * 핵심 개념: 각 컬러는 독립적이지 않다.
 * 기준 칸(anchor)의 L/C/H를 움직이면 그 변화량이
 *   - 세로(hue 계열)로 몇 행 떨어져 있는지에 따른 관여도
 *   - 가로(lightness 단계)로 몇 칸 떨어져 있는지에 따른 관여도
 * 를 곱한 만큼 나머지 35칸에 전파된다. 두 축의 번짐 범위는 각각 조절한다.
 */

export type Oklch = { l: number; c: number; h: number };
export type Delta = { l: number; c: number; h: number };
export type StepKey = "extrasoft" | "soft" | "light" | "base" | "medium" | "bold";

export const ZERO_DELTA: Delta = { l: 0, c: 0, h: 0 };

export interface Family {
  key: string;
  label: string;
  steps: Record<StepKey, Oklch>;
}

export interface Step {
  key: StepKey;
  label: string;
}

export const STEPS: Step[] = [
  { key: "extrasoft", label: "50" },
  { key: "soft", label: "100" },
  { key: "light", label: "300" },
  { key: "base", label: "500" },
  { key: "medium", label: "700" },
  { key: "bold", label: "900" },
];

export function norm360(h: number): number {
  return ((h % 360) + 360) % 360;
}

/** a → b 최단 회전량(-180~180) */
export function hueArc(from: number, to: number): number {
  const d = norm360(to - from);
  return d > 180 ? d - 360 : d;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** soft와 base 사이를 채우는 중간 단계(300)를 만든다. */
function deriveLight(soft: Oklch, base: Oklch): Oklch {
  return {
    l: soft.l + (base.l - soft.l) * 0.45,
    c: soft.c + (base.c - soft.c) * 0.42,
    h: norm360(soft.h + hueArc(soft.h, base.h) * 0.45),
  };
}

function family(
  key: string,
  label: string,
  raw: { extrasoft: Oklch; soft: Oklch; base: Oklch; medium: Oklch; bold: Oklch }
): Family {
  return {
    key,
    label,
    steps: { ...raw, light: deriveLight(raw.soft, raw.base) },
  };
}

/** 색상환에 고르게 퍼진 6개 계열만 추린다. */
export const FAMILIES: Family[] = [
  family("red", "red", {
    extrasoft: { l: 0.978, c: 0.011, h: 17.34 },
    soft: { l: 0.962, c: 0.019, h: 21.567 },
    base: { l: 0.67, c: 0.206, h: 21.81 },
    medium: { l: 0.571, c: 0.229, h: 22.13 },
    bold: { l: 0.394, c: 0.162, h: 29.234 },
  }),
  family("orange", "orange", {
    extrasoft: { l: 0.981, c: 0.019, h: 83.064 },
    soft: { l: 0.972, c: 0.032, h: 87.288 },
    base: { l: 0.759, c: 0.177, h: 60.637 },
    medium: { l: 0.693, c: 0.174, h: 53.909 },
    bold: { l: 0.402, c: 0.09, h: 64.696 },
  }),
  family("yellow", "yellow", {
    extrasoft: { l: 0.985, c: 0.029, h: 98.468 },
    soft: { l: 0.981, c: 0.039, h: 99.299 },
    base: { l: 0.927, c: 0.12, h: 95.848 },
    medium: { l: 0.883, c: 0.17, h: 94.852 },
    bold: { l: 0.403, c: 0.082, h: 91.026 },
  }),
  family("green", "green", {
    extrasoft: { l: 0.976, c: 0.013, h: 167.184 },
    soft: { l: 0.965, c: 0.02, h: 164.593 },
    base: { l: 0.682, c: 0.156, h: 159.139 },
    medium: { l: 0.608, c: 0.154, h: 153.739 },
    bold: { l: 0.391, c: 0.118, h: 146.587 },
  }),
  family("blue", "blue", {
    extrasoft: { l: 0.971, c: 0.014, h: 238.006 },
    soft: { l: 0.956, c: 0.022, h: 239.426 },
    base: { l: 0.723, c: 0.152, h: 247.276 },
    medium: { l: 0.62, c: 0.207, h: 258.418 },
    bold: { l: 0.375, c: 0.174, h: 262.087 },
  }),
  family("purple", "purple", {
    extrasoft: { l: 0.975, c: 0.012, h: 281.086 },
    soft: { l: 0.963, c: 0.018, h: 279.062 },
    base: { l: 0.658, c: 0.187, h: 282.027 },
    medium: { l: 0.571, c: 0.234, h: 280.897 },
    bold: { l: 0.352, c: 0.213, h: 280.17 },
  }),
];

/**
 * 관여도: 기준 칸과 가까울수록 1에 가깝다. hue(행)·lightness(열) 양쪽에 같은 식을 쓴다.
 * spread(관여 범위)는 몇 칸까지 번지는지를 뜻하고, 0이면 완전히 독립적으로 움직인다.
 */
export function involvement(anchorIndex: number, index: number, spread: number): number {
  const d = Math.abs(anchorIndex - index);
  if (spread <= 0) return d === 0 ? 1 : 0;
  const t = d / spread;
  return Math.exp(-t * t);
}

export function scaleDelta(delta: Delta, weight: number): Delta {
  return { l: delta.l * weight, c: delta.c * weight, h: delta.h * weight };
}

export function addDelta(a: Delta, b: Delta): Delta {
  return { l: a.l + b.l, c: a.c + b.c, h: a.h + b.h };
}

/** 원본 색 + 변화량 */
export function shiftColor(base: Oklch, delta: Delta): Oklch {
  return {
    l: clamp(base.l + delta.l, 0.02, 0.995),
    c: clamp(base.c + delta.c, 0, 0.37),
    h: norm360(base.h + delta.h),
  };
}

export function toCss(color: Oklch): string {
  return `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)})`;
}
