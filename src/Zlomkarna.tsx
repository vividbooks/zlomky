import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useId,
  useMemo,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
  type TouchEvent,
  type RefObject,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { ModuleTileIllustration } from "./moduleTileIllustrations";
import { FractionVizGame } from "./FractionVizGame";
import {
  homeHref,
  moduleHref,
  parseZlomkPath,
  useZlomkNarrowLayout,
  useZlomkPhoneLayout,
  ZLOMK_PHONE_BREAKPOINT_PX,
  type HomeSection,
} from "./zlomkarnaRoutes";

// ─── Helpers ───
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
};
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/** Rozdělí zlomek na jednotky po 1 celku (pro kruhy a pruhy): např. 12/8 → [8/8, 4/8] */
function splitFractionUnits(numerator: number, denominator: number): { num: number; den: number }[] {
  if (denominator <= 0) return [{ num: 0, den: 1 }];
  const n = Math.max(0, numerator);
  const d = denominator;
  const wholes = Math.floor(n / d);
  const rem = n % d;
  const parts: { num: number; den: number }[] = [];
  for (let i = 0; i < wholes; i++) parts.push({ num: d, den: d });
  if (rem > 0) parts.push({ num: rem, den: d });
  if (parts.length === 0) parts.push({ num: 0, den: d });
  return parts;
}

// ─── Color Palette ───
const C = {
  bg: "#FFFAF5",
  card: "#FFFFFF",
  primary: "#3B5BDB",
  primaryLight: "#DBE4FF",
  primaryDark: "#2B44A8",
  orange: "#FF6B2B",
  orangeLight: "#FFF0E8",
  teal: "#12B886",
  tealLight: "#E6FCF5",
  pink: "#E64980",
  pinkLight: "#FFF0F6",
  purple: "#7950F2",
  purpleLight: "#F3F0FF",
  yellow: "#FAB005",
  yellowLight: "#FFF9DB",
  red: "#FA5252",
  redLight: "#FFF5F5",
  gray100: "#F8F9FA",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#ADB5BD",
  gray500: "#868E96",
  gray600: "#6C757D",
  gray700: "#495057",
  gray900: "#212529",
  shadow: "0 4px 24px rgba(0,0,0,0.06)",
  shadowHover: "0 8px 32px rgba(0,0,0,0.10)",
};

/** Obrys výsečí a vnější kruh koláče — světle modrá (dlaždice, moduly, kvíz). */
const PIE_SLICE_AND_RING_STROKE = C.primaryLight;

/** Geometrie online / Crossroads — typografie a barvy */
const FONT_UI = "'Fenomen Sans', ui-sans-serif, system-ui, sans-serif";
const GX = {
  ink: "#09056f",
  body: "#4e5871",
  brand: "#4d49f3",
  border: "#e5e7eb",
  page: "#ffffff",
  shadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
  shadowHover: "0 16px 32px -8px rgba(77,73,243,0.18), 0 6px 12px -4px rgba(77,73,243,0.1)",
} as const;

// ─── Jeden kruhový celek (čitatel ≤ jmenovatel) ───
function SingleCircleUnit({
  num,
  den,
  size,
  color,
  animated,
  sliceStroke = PIE_SLICE_AND_RING_STROKE,
  emptyFill = "#F1F3F5",
  emptyOpacity = 0.4,
  outerRingStroke = PIE_SLICE_AND_RING_STROKE,
}: {
  num: number;
  den: number;
  size: number;
  color: string;
  animated: boolean;
  sliceStroke?: string;
  emptyFill?: string;
  emptyOpacity?: number;
  outerRingStroke?: string;
}) {
  const r = size / 2 - 8,
    cx = size / 2,
    cy = size / 2,
    denominator = den,
    numerator = num;
  const slices = [];
  for (let i = 0; i < denominator; i++) {
    const sa = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const ea = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(sa),
      y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea),
      y2 = cy + r * Math.sin(ea);
    const la = 1 / denominator > 0.5 ? 1 : 0;
    const filled = i < numerator;
    if (denominator === 1) {
      slices.push(
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={filled ? color : emptyFill}
          stroke={sliceStroke}
          strokeWidth="2"
          style={{
            transition: animated ? "fill 0.4s" : "none",
            opacity: filled ? 0.85 : emptyOpacity,
          }}
        />
      );
    } else {
      slices.push(
        <path
          key={i}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`}
          fill={filled ? color : emptyFill}
          stroke={sliceStroke}
          strokeWidth="2.5"
          style={{
            transition: animated ? "fill 0.4s, opacity 0.4s" : "none",
            opacity: filled ? 0.85 : emptyOpacity,
          }}
        />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={outerRingStroke} strokeWidth="2" />
      {slices}
    </svg>
  );
}

// ─── SVG Fraction: Circle (více kruhů při n > d) ───
function CircleFraction({
  numerator,
  denominator,
  size = 160,
  color = C.primary,
  animated = true,
  label = true,
  /** >1 zvětší rozpočet pro více kruhů (např. porovnání – méně brzké zmenšení). */
  clusterSizeScale = 1,
  sliceStroke = PIE_SLICE_AND_RING_STROKE,
  emptyFill = "#F1F3F5",
  emptyOpacity = 0.4,
  outerRingStroke = PIE_SLICE_AND_RING_STROKE,
}: {
  numerator: number;
  denominator: number;
  size?: number;
  color?: string;
  animated?: boolean;
  label?: boolean;
  clusterSizeScale?: number;
  sliceStroke?: string;
  emptyFill?: string;
  emptyOpacity?: number;
  outerRingStroke?: string;
}) {
  const parts = splitFractionUnits(numerator, denominator);
  const n = parts.length;
  const gap = 8;
  const budget = size * clusterSizeScale;
  /** Odhad 2 sloupce → řádky = ceil(n/2); kruhy zmenšit, ať se cluster vejde do rozpočtu */
  const unitSize =
    n <= 1
      ? Math.max(56, Math.round(budget * 0.96))
      : Math.max(
          38,
          Math.round(
            Math.min(
              (budget * 0.97) / Math.ceil(n / 2) - gap,
              (budget * 0.97) / Math.min(n, 2) - gap,
              budget * 0.92,
            ),
          ),
        );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap,
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {parts.map((p, idx) => (
          <SingleCircleUnit
            key={`${idx}-${p.num}-${p.den}`}
            num={p.num}
            den={p.den}
            size={unitSize}
            color={color}
            animated={animated}
            sliceStroke={sliceStroke}
            emptyFill={emptyFill}
            emptyOpacity={emptyOpacity}
            outerRingStroke={outerRingStroke}
          />
        ))}
      </div>
      {label && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.gray900,
            fontFamily: FONT_UI,
          }}
        >
          <span style={{ color }}>{numerator}</span>
          <span style={{ color: C.gray400, margin: "0 2px" }}>/</span>
          <span>{denominator}</span>
        </div>
      )}
    </div>
  );
}

// ─── Jeden pruhový celek ───
function SingleBarUnit({
  num,
  den,
  width,
  height,
  color,
}: {
  num: number;
  den: number;
  width: number;
  height: number;
  color: string;
}) {
  const denominator = den,
    numerator = num;
  const pad = 2,
    segW = (width - pad * (denominator - 1)) / denominator;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flexShrink: 0 }}>
      <rect x={0} y={0} width={width} height={height} rx={12} fill={C.gray200} />
      {Array.from({ length: denominator }, (_, i) => (
        <rect
          key={i}
          x={i * (segW + pad)}
          y={0}
          width={segW}
          height={height}
          rx={i === 0 ? 12 : i === denominator - 1 ? 12 : 4}
          fill={i < numerator ? color : "transparent"}
          opacity={i < numerator ? 0.8 : 0.15}
          stroke={i < numerator ? color : C.gray300}
          strokeWidth="1.5"
          style={{ transition: "fill 0.3s, opacity 0.3s" }}
        />
      ))}
    </svg>
  );
}

// ─── Jeden vertikální pruh (odspodu nahoru; rovné boky díky clipPath) ───
function SingleVerticalBarUnit({
  num,
  den,
  width,
  height,
  color,
  segmentDividerStroke = "#ffffff",
}: {
  num: number;
  den: number;
  width: number;
  height: number;
  color: string;
  segmentDividerStroke?: string;
}) {
  const clipId = useId().replace(/:/g, "");
  const denominator = den,
    numerator = num;
  const segH = height / denominator;
  /** Prázdné díly — tmavší než gray200, ať jsou na světlém panelu dobře čitelné */
  const emptyFill = "#CED4DA";
  const barRx = Math.min(28, Math.max(12, Math.round(width * 0.14)));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ flexShrink: 0 }}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={width} height={height} rx={barRx} ry={barRx} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: denominator }, (_, i) => {
          const y = height - (i + 1) * segH;
          const filled = i < numerator;
          return (
            <rect
              key={i}
              x={0}
              y={y}
              width={width}
              height={segH}
              fill={filled ? color : emptyFill}
              opacity={filled ? 0.92 : 1}
              style={{ transition: "fill 0.25s, opacity 0.25s" }}
            />
          );
        })}
        {denominator > 1 &&
          Array.from({ length: denominator - 1 }, (__, k) => {
            const y = height - (k + 1) * segH;
            const dividerStroke = Math.max(3, Math.min(7, width * 0.08));
            return (
              <line
                key={`div-${k}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={segmentDividerStroke}
                strokeWidth={dividerStroke}
                strokeLinecap="butt"
                pointerEvents="none"
              />
            );
          })}
      </g>
    </svg>
  );
}

// ─── Vertikální pruhy (více vedle sebe při n > d) ───
function VerticalBarFraction({
  numerator,
  denominator,
  barWidth = 64,
  barHeight = 300,
  color = C.orange,
  label = true,
  wrapMaxWidth = 520,
  segmentDividerStroke = "#ffffff",
}: {
  numerator: number;
  denominator: number;
  barWidth?: number;
  barHeight?: number;
  color?: string;
  label?: boolean;
  wrapMaxWidth?: number;
  segmentDividerStroke?: string;
}) {
  const parts = splitFractionUnits(numerator, denominator);
  const scale = parts.length > 3 ? 0.65 : parts.length > 2 ? 0.75 : parts.length > 1 ? 0.88 : 1;
  const unitW = Math.max(48, Math.round(barWidth * scale));
  const unitH = Math.max(200, Math.round(barHeight * scale));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 12,
          maxWidth: wrapMaxWidth,
        }}
      >
        {parts.map((p, idx) => (
          <SingleVerticalBarUnit
            key={`${idx}-${p.num}-${p.den}`}
            num={p.num}
            den={p.den}
            width={unitW}
            height={unitH}
            color={color}
            segmentDividerStroke={segmentDividerStroke}
          />
        ))}
      </div>
      {label && (
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.gray700,
            fontFamily: FONT_UI,
          }}
        >
          <span style={{ color }}>{numerator}</span>
          <span style={{ color: C.gray400 }}> / </span>
          <span>{denominator}</span>
        </div>
      )}
    </div>
  );
}

// ─── SVG Fraction: Bar (více pruhů při n > d) ───
function BarFraction({
  numerator,
  denominator,
  width = 280,
  height = 56,
  color = C.primary,
  label = true,
}: {
  numerator: number;
  denominator: number;
  width?: number;
  height?: number;
  color?: string;
  label?: boolean;
}) {
  const parts = splitFractionUnits(numerator, denominator);
  const scale = parts.length > 3 ? 0.7 : parts.length > 2 ? 0.82 : parts.length > 1 ? 0.92 : 1;
  const unitW = Math.max(120, Math.round(width * scale));
  const unitH = height;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          maxWidth: width + 40,
        }}
      >
        {parts.map((p, idx) => (
          <SingleBarUnit key={`${idx}-${p.num}-${p.den}`} num={p.num} den={p.den} width={unitW} height={unitH} color={color} />
        ))}
      </div>
      {label && (
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.gray700,
            fontFamily: FONT_UI,
          }}
        >
          <span style={{ color }}>{numerator}</span>
          <span style={{ color: C.gray400 }}> / </span>
          <span>{denominator}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Číselná osa 0→1 výhradně pro kvíz „Poznávej zlomek“.
 * Samostatná geometrie (nesdílí NumberLine) — vždy celá škála, „0“ a „1“ viditelné.
 */
function QuizIdentifyNumberLine({
  numerator,
  denominator,
  axisInnerPx,
}: {
  numerator: number;
  denominator: number;
  axisInnerPx: number;
}) {
  const d = Math.max(1, denominator);
  const n = Math.max(0, Math.min(numerator, d));
  const inner = Math.max(120, Math.min(1000, axisInnerPx));
  const m = { L: 64, R: 88, T: 48, B: 72 };
  const W = m.L + inner + m.R;
  const y = m.T + 44;
  const labelY = y + 42;
  const x0 = m.L;
  const x1 = m.L + inner;
  const pos = m.L + (n / d) * inner;
  const tickMaj = 24;
  const tickMin = 14;
  const font = 24;
  const H = labelY + font + 20;
  const axisGray = "#495057";
  const ah = 12;
  const aw = 11;

  const ticks = Array.from({ length: d + 1 }, (_, i) => {
    const x = x0 + (i / d) * inner;
    const major = i === 0 || i === d;
    const h = major ? tickMaj : tickMin;
    return (
      <g key={i}>
        <line
          x1={x}
          y1={y - h}
          x2={x}
          y2={y + h}
          stroke={axisGray}
          strokeWidth={major ? 3.5 : 2.2}
          strokeLinecap="round"
        />
        {i === 0 && (
          <text x={x} y={labelY} textAnchor="middle" fontSize={font} fontWeight="800" fill={C.gray900} fontFamily={FONT_UI}>
            0
          </text>
        )}
        {i === d && (
          <text x={x} y={labelY} textAnchor="middle" fontSize={font} fontWeight="800" fill={C.gray900} fontFamily={FONT_UI}>
            1
          </text>
        )}
      </g>
    );
  });

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Číselná osa od 0 do 1, označeno ${n} z ${d} dílů`}
      style={{ display: "block", overflow: "visible" }}
    >
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.gray400} strokeWidth={4} strokeLinecap="round" />
      {n > 0 && (
        <line
          x1={x0}
          y1={y}
          x2={pos}
          y2={y}
          stroke={C.teal}
          strokeWidth={12}
          strokeLinecap="round"
        />
      )}
      {ticks}
      <polygon points={`${x1},${y} ${x1 - aw},${y - ah} ${x1 - aw},${y + ah}`} fill={axisGray} />
      <circle cx={pos} cy={y} r={15} fill={C.teal} stroke="#FFFFFF" strokeWidth={4} />
    </svg>
  );
}

// ─── SVG Fraction: Number Line ───
function NumberLine({
  numerator,
  denominator,
  width = 320,
  color = C.primary,
  max = null,
  presentation = false,
  showPositionLabel = true,
}: {
  numerator: number;
  denominator: number;
  width?: number;
  color?: string;
  max?: number | null;
  presentation?: boolean;
  showPositionLabel?: boolean;
}) {
  const padX = Math.max(
    presentation ? 88 : 48,
    Math.round(width * (presentation ? 0.11 : 0.09)),
  );
  const fontWholeUncapped = Math.max(
    presentation ? 26 : 13,
    Math.round(width * (presentation ? 0.048 : 0.028)),
  );
  const fontWhole = presentation ? Math.min(48, fontWholeUncapped) : fontWholeUncapped;
  const fontFrac = Math.round(fontWhole * (presentation ? 1.12 : 1.08));

  let h = Math.max(
    presentation ? 176 : 92,
    Math.min(presentation ? 340 : 200, Math.round(width * (presentation ? 0.32 : 0.19))),
  );
  let lineY = 0,
    tickMaj = 0,
    tickMin = 0,
    labelBelow = 0,
    labelAbove = 0;
  for (let pass = 0; pass < 2; pass++) {
    lineY = Math.round(h * 0.52);
    tickMaj = Math.round(h * 0.15);
    tickMin = Math.round(h * 0.09);
    labelBelow = Math.round(h * 0.32);
    labelAbove = Math.round(h * 0.26);
    const bottomNeed = Math.ceil(lineY + labelBelow + fontWhole * 1.22 + 16);
    const tickClear = Math.ceil(lineY + tickMaj + 12);
    h = Math.max(h, bottomNeed, tickClear);
    if (showPositionLabel) {
      h = Math.max(h, Math.ceil((fontFrac + 16) / 0.26));
    }
  }
  const strokeAxisInner = presentation ? 5 : 2;
  const strokeColored = presentation ? 14 : 6;
  const strokeTickMaj = presentation ? 4 : 2;
  const strokeTickMin = presentation ? 2.5 : 1;
  const ah = presentation ? 16 : 8;
  const aw = presentation ? 18 : 8;
  const rDot = presentation ? 16 : 7;
  const dotStroke = presentation ? 5 : 3;

  const effectiveMax = max ?? Math.max(1, Math.ceil(numerator / denominator));
  const denomSafe = Math.max(1, denominator);
  const totalTicks = Math.max(1, effectiveMax * denomSafe);
  const w = width - padX * 2;
  const arrowTipX = width - padX;
  const posX = padX + (numerator / totalTicks) * w;

  const tickGroups = Array.from({ length: totalTicks + 1 }, (_, i) => {
    const x = padX + (i / totalTicks) * w,
      isWhole = i % denominator === 0;
    const isLastWhole = isWhole && i === totalTicks;
    const labelAnchor = i === 0 ? ("start" as const) : isLastWhole ? ("end" as const) : ("middle" as const);
    const labelX = i === 0 ? padX + (presentation ? 6 : 2) : isLastWhole ? padX + w - (presentation ? 6 : 2) : x;
    return (
      <g key={i}>
        <line
          x1={x}
          y1={lineY - (isWhole ? tickMaj : tickMin)}
          x2={x}
          y2={lineY + (isWhole ? tickMaj : tickMin)}
          stroke={isWhole ? C.gray700 : C.gray400}
          strokeWidth={isWhole ? strokeTickMaj : strokeTickMin}
        />
        {isWhole && (
          <text
            x={labelX}
            y={lineY + labelBelow}
            textAnchor={labelAnchor}
            fontSize={fontWhole}
            fontWeight="700"
            fill={C.gray700}
            fontFamily={FONT_UI}
          >
            {i === 0 ? "0" : String(i / denominator)}
          </text>
        )}
      </g>
    );
  });

  return (
    <div
      style={{
        display: "block",
        width: "100%",
        maxWidth: "100%",
        overflow: "visible",
        padding: presentation ? "12px 14px 16px" : "8px 18px 12px",
        boxSizing: "border-box",
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        style={{ display: "block", height: "auto", maxWidth: "100%", overflow: "visible" }}
      >
        <line x1={padX} y1={lineY} x2={arrowTipX} y2={lineY} stroke={C.gray300} strokeWidth={strokeAxisInner} />
        <polygon
          points={`${arrowTipX},${lineY} ${arrowTipX - aw},${lineY - ah} ${arrowTipX - aw},${lineY + ah}`}
          fill={C.gray400}
        />
        {numerator > 0 && (
          <line
            x1={padX}
            y1={lineY}
            x2={posX}
            y2={lineY}
            stroke={color}
            strokeWidth={strokeColored}
            strokeLinecap="round"
            style={{ transition: "all 0.4s" }}
          />
        )}
        {tickGroups}
        <circle
          cx={posX}
          cy={lineY}
          r={rDot}
          fill={color}
          stroke="white"
          strokeWidth={dotStroke}
          style={{ transition: "all 0.4s" }}
        />
        {showPositionLabel && (
          <text
            x={posX}
            y={lineY - labelAbove}
            textAnchor="middle"
            fontSize={fontFrac}
            fontWeight="800"
            fill={color}
            fontFamily={FONT_UI}
            style={{ transition: "all 0.4s" }}
          >
            {numerator}/{denominator}
          </text>
        )}
      </svg>
    </div>
  );
}

// ─── Fraction Stepper ───
function FractionStepper({
  numerator,
  denominator,
  onChangeN,
  onChangeD,
  color = C.primary,
  minD = 1,
  maxD = 12,
  maxN = null,
  stepperSize = "default",
  showLabels = true,
  readOnly = false,
}: {
  numerator: number;
  denominator: number;
  onChangeN: (n: number) => void;
  onChangeD: (d: number) => void;
  color?: string;
  minD?: number;
  maxD?: number;
  maxN?: number | null;
  /** default = běžné moduly; explorer = velký Prozkoumej; explorerLine = menší, vejde s osou na obrazovku */
  stepperSize?: "default" | "explorer" | "explorerLine";
  showLabels?: boolean;
  /** Jen zobrazení čitatele/jmenovatele bez +/− (např. rozšířený zlomek v ekvivalenci). */
  readOnly?: boolean;
}) {
  const effMaxN = maxN ?? denominator * 2;
  const sz =
    stepperSize === "explorer"
      ? {
          btn: 40,
          btnFont: 20,
          btnRadius: 12,
          numFont: 174,
          labelSize: 13,
          rowGap: 14,
          lineMax: 440,
          lineH: 5,
          lineMargin: 22,
          charW: 88,
          minW: 120,
        }
      : stepperSize === "explorerLine"
        ? {
            btn: 34,
            btnFont: 17,
            btnRadius: 10,
            numFont: 52,
            labelSize: 11,
            rowGap: 8,
            lineMax: 220,
            lineH: 4,
            lineMargin: 10,
            charW: 26,
            minW: 40,
          }
        : {
            btn: 36,
            btnFont: 20,
            btnRadius: 10,
            numFont: 28,
            labelSize: 11,
            rowGap: 6,
            lineMax: 200,
            lineH: 3,
            lineMargin: 10,
            charW: 16,
            minW: 36,
          };
  const thickExplorerBar = stepperSize === "explorer";
  /** Dotyk: min. ~44 CSS px (Apple / WCAG 2.5.5) */
  const btnSize = Math.max(44, sz.btn);
  const btn = (active: boolean) => ({
    width: btnSize,
    height: btnSize,
    border: "none",
    borderRadius: sz.btnRadius,
    background: active ? color : C.gray200,
    color: active ? "white" : C.gray500,
    fontSize: sz.btnFont,
    fontWeight: 700,
    cursor: active ? ("pointer" as const) : ("not-allowed" as const),
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    transition: "all 0.2s",
    fontFamily: FONT_UI,
    opacity: active ? 1 : 0.5,
  });
  const valueMinWidth = Math.max(sz.minW, String(Math.max(numerator, denominator)).length * sz.charW);
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}
      aria-label={showLabels ? undefined : "Čitatel a jmenovatel"}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: sz.rowGap }}>
        {showLabels && (
          <span
            style={{
              fontSize: sz.labelSize,
              fontWeight: 700,
              color: C.gray500,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Čitatel
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: sz.rowGap }}>
          {!readOnly && (
            <button type="button" style={btn(numerator > 0)} onClick={() => numerator > 0 && onChangeN(numerator - 1)}>
              −
            </button>
          )}
          <span
            style={{
              fontSize: sz.numFont,
              fontWeight: 900,
              color,
              minWidth: valueMinWidth,
              textAlign: "center",
              fontFamily: FONT_UI,
              lineHeight: 1,
            }}
          >
            {numerator}
          </span>
          {!readOnly && (
            <button
              type="button"
              style={btn(numerator < effMaxN)}
              onClick={() => numerator < effMaxN && onChangeN(numerator + 1)}
            >
              +
            </button>
          )}
        </div>
      </div>
      <div
        role="separator"
        aria-hidden
        style={{
          width: "100%",
          maxWidth: sz.lineMax,
          margin: `${sz.lineMargin}px 0`,
        }}
      >
        {thickExplorerBar ? (
          <div
            style={{
              width: "100%",
              height: 14,
              borderRadius: 7,
              background: `linear-gradient(180deg, ${GX.ink} 0%, #1e0f6e 100%)`,
              boxShadow: `inset 0 2px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(9,5,111,0.25), 0 6px 20px rgba(77,73,243,0.35)`,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: sz.lineH,
              background: C.gray300,
              borderRadius: 2,
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: sz.rowGap }}>
        {showLabels && (
          <span
            style={{
              fontSize: sz.labelSize,
              fontWeight: 700,
              color: C.gray500,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Jmenovatel
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: sz.rowGap }}>
          {!readOnly && (
            <button
              type="button"
              style={btn(denominator > minD)}
              onClick={() => denominator > minD && onChangeD(denominator - 1)}
            >
              −
            </button>
          )}
          <span
            style={{
              fontSize: sz.numFont,
              fontWeight: 900,
              color: C.gray900,
              minWidth: valueMinWidth,
              textAlign: "center",
              fontFamily: FONT_UI,
              lineHeight: 1,
            }}
          >
            {denominator}
          </span>
          {!readOnly && (
            <button
              type="button"
              style={btn(denominator < maxD)}
              onClick={() => denominator < maxD && onChangeD(denominator + 1)}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Module: Explorer ───
type ExplorerVisual = "circle" | "vbar" | "line";

const EXPLORER_VISUAL_TABS: { id: ExplorerVisual; label: string }[] = [
  { id: "circle", label: "Kruh" },
  { id: "vbar", label: "Pruh" },
  { id: "line", label: "Číselná osa" },
];

const EXPLORER_VISUAL_IDS: ExplorerVisual[] = EXPLORER_VISUAL_TABS.map((t) => t.id);

function randomExplorerVisual(): ExplorerVisual {
  return EXPLORER_VISUAL_IDS[randInt(0, EXPLORER_VISUAL_IDS.length - 1)]!;
}

/** Náhodná dvojice různých zobrazení pro porovnání (Mix). */
function randomDistinctComparePair(): { a: ExplorerVisual; b: ExplorerVisual } {
  const a = EXPLORER_VISUAL_IDS[Math.floor(Math.random() * EXPLORER_VISUAL_IDS.length)]!;
  let b = EXPLORER_VISUAL_IDS[Math.floor(Math.random() * EXPLORER_VISUAL_IDS.length)]!;
  while (b === a) {
    b = EXPLORER_VISUAL_IDS[Math.floor(Math.random() * EXPLORER_VISUAL_IDS.length)]!;
  }
  return { a, b };
}

/** Číselná osa v porovnání: šířka SVG nad kontejnerem (−20 px), výrazně širší čárovaná osa. */
const COMPARE_NUMBER_LINE_WIDTH_FACTOR = 2.1;

function measureCompareBottom(el: HTMLDivElement | null) {
  if (!el)
    return { lineW: Math.round(400 * COMPARE_NUMBER_LINE_WIDTH_FACTOR), circle: 168, barW: 76, barH: 280 };
  const r = el.getBoundingClientRect();
  const w = Math.max(0, r.width);
  const h = Math.max(0, r.height);
  /** Kruhy v řadě potřebují šířku; jen min(w,h) je v porovnání příliš restriktivní. */
  const circleBudget = Math.min(w, h) * 0.52 + w * 0.38;
  return {
    lineW: Math.max(
      420,
      Math.min(Math.round(1200 * COMPARE_NUMBER_LINE_WIDTH_FACTOR), Math.floor((w - 20) * COMPARE_NUMBER_LINE_WIDTH_FACTOR)),
    ),
    circle: Math.max(115, Math.min(300, Math.floor(circleBudget))),
    barH: Math.max(160, Math.min(440, Math.floor(h * 0.9))),
    barW: Math.max(64, Math.min(124, Math.floor(Math.max(160, h * 0.9) * 0.34))),
  };
}

function ModuleExplorer({
  visual,
  onVisualChange,
}: {
  visual: ExplorerVisual;
  onVisualChange: (v: ExplorerVisual) => void;
}) {
  const narrow = useZlomkNarrowLayout();
  const phone = useZlomkPhoneLayout();
  const explorerStepperSize = phone ? ("explorerLine" as const) : ("explorer" as const);
  const [num, setNum] = useState(3),
    [den, setDen] = useState(8);
  const explorerPreviewRef = useRef<HTMLDivElement>(null);
  const explorerLineRowRef = useRef<HTMLDivElement>(null);
  const [explorerCircleSize, setExplorerCircleSize] = useState(420);
  const [explorerBarWidth, setExplorerBarWidth] = useState(100);
  const [explorerBarHeight, setExplorerBarHeight] = useState(440);
  const [explorerNumberLineWidth, setExplorerNumberLineWidth] = useState(960);

  useLayoutEffect(() => {
    if (visual === "line") {
      const el = explorerLineRowRef.current;
      if (!el) return;
      const update = () => {
        const cs = getComputedStyle(el);
        const padX =
          (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        const innerRaw = Math.max(0, el.clientWidth - padX);
        setExplorerNumberLineWidth(Math.max(200, Math.min(2400, Math.floor(innerRaw))));
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    const el = explorerPreviewRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const side = Math.min(width, height);
      const next = Math.floor(Math.max(0, side - 8) * 0.98);
      setExplorerCircleSize(Math.max(200, Math.min(720, next)));
      const barH = Math.max(320, Math.min(680, Math.floor(Math.max(0, height - 16) * 0.96)));
      const barW = Math.max(84, Math.min(148, Math.floor(barH * 0.34)));
      setExplorerBarHeight(barH);
      setExplorerBarWidth(barW);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visual, phone]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: 0,
        borderTop: `1px solid ${GX.border}`,
      }}
    >
      {visual === "line" ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%",
          }}
        >
          <div
            style={{
              flex: "1 1 0%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: phone ? "16px 12px 20px" : "24px 24px 32px",
              background: C.gray100,
              borderBottom: `3px solid ${GX.ink}`,
              overflow: "auto",
            }}
          >
            <FractionStepper
              stepperSize={explorerStepperSize}
              numerator={num}
              denominator={den}
              onChangeN={setNum}
              onChangeD={(d) => {
                setDen(d);
                if (num > d * 2) setNum(d * 2);
              }}
            />
          </div>
          <div
            ref={explorerLineRowRef}
            style={{
              flex: "1 1 0%",
              minHeight: 0,
              width: "100%",
              boxSizing: "border-box",
              padding: phone ? "10px 10px 14px" : "12px 16px 16px",
              background: GX.page,
              overflow: "visible",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <NumberLine
                numerator={num}
                denominator={den}
                width={explorerNumberLineWidth}
                color={C.teal}
                max={Math.max(1, Math.ceil(num / den))}
                presentation
                showPositionLabel={false}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: narrow ? "flex" : "grid",
            flexDirection: narrow ? "column" : undefined,
            gridTemplateColumns: narrow ? undefined : "1fr 1fr",
            gridTemplateRows: narrow ? undefined : "minmax(0, 1fr)",
            width: "100%",
            minHeight: 0,
          }}
        >
          <div
            style={{
              gridRow: narrow ? undefined : 1,
              gridColumn: narrow ? undefined : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding:
                narrow || phone ? "16px 12px 20px" : "24px 24px 32px",
              background: C.gray100,
              borderRight: narrow ? undefined : `1px solid ${GX.border}`,
              borderBottom: narrow ? `1px solid ${GX.border}` : undefined,
              minWidth: 0,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <FractionStepper
              stepperSize={explorerStepperSize}
              numerator={num}
              denominator={den}
              onChangeN={setNum}
              onChangeD={(d) => {
                setDen(d);
                if (num > d * 2) setNum(d * 2);
              }}
            />
          </div>
          <div
            ref={explorerPreviewRef}
            style={{
              gridRow: narrow ? undefined : 1,
              gridColumn: narrow ? undefined : 2,
              flex: narrow ? "1 1 0%" : undefined,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: narrow ? "16px 12px 20px" : 12,
              minWidth: 0,
              minHeight: narrow ? 200 : 0,
              overflow: "auto",
              background: GX.page,
            }}
          >
            {visual === "circle" && (
              <CircleFraction
                numerator={num}
                denominator={den}
                size={explorerCircleSize}
                color={C.primary}
                label={false}
              />
            )}
            {visual === "vbar" && (
              <VerticalBarFraction
                numerator={num}
                denominator={den}
                barWidth={explorerBarWidth}
                barHeight={explorerBarHeight}
                color={C.orange}
                label={false}
                wrapMaxWidth={1400}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Module: Compare ───
function ComparePanel({
  badge,
  badgeBg,
  cardBorder,
  numerator,
  denominator,
  onChangeN,
  onChangeD,
  color,
  numLineColor,
  visual,
  bottomRef,
  dims,
  stepperMaxN = 12,
  stepperMaxD = 12,
  stepperMinD = 1,
  readOnlyStepper = false,
}: {
  badge: string;
  badgeBg: string;
  cardBorder: string;
  numerator: number;
  denominator: number;
  onChangeN: (n: number) => void;
  onChangeD: (d: number) => void;
  color: string;
  numLineColor: string;
  visual: ExplorerVisual;
  bottomRef: RefObject<HTMLDivElement | null>;
  dims: { lineW: number; circle: number; barW: number; barH: number };
  stepperMaxN?: number;
  stepperMaxD?: number;
  stepperMinD?: number;
  readOnlyStepper?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `2px solid ${cardBorder}`,
        background: C.card,
        boxShadow: C.shadow,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "8px 10px 0", textAlign: "center", flexShrink: 0 }}>
        <span
          style={{
            display: "inline-block",
            background: badgeBg,
            borderRadius: 12,
            padding: "4px 14px",
            fontSize: 12,
            fontWeight: 800,
            color,
          }}
        >
          {badge}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "6px 10px 10px",
          gap: 8,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            padding: "4px 0 2px",
            borderBottom: `1px solid ${GX.border}`,
            background: C.gray100,
            borderRadius: 10,
          }}
        >
          <FractionStepper
            stepperSize="default"
            showLabels={false}
            readOnly={readOnlyStepper}
            numerator={numerator}
            denominator={denominator}
            onChangeN={onChangeN}
            onChangeD={onChangeD}
            color={color}
            maxN={stepperMaxN}
            maxD={stepperMaxD}
            minD={stepperMinD}
          />
        </div>
        <div
          ref={bottomRef}
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            background: GX.page,
            overflow: "hidden",
          }}
        >
          {visual === "circle" && (
            <CircleFraction
              numerator={numerator}
              denominator={denominator}
              size={dims.circle}
              color={color}
              label={false}
              clusterSizeScale={1.12}
            />
          )}
          {visual === "vbar" && (
            <VerticalBarFraction
              numerator={numerator}
              denominator={denominator}
              barWidth={dims.barW}
              barHeight={dims.barH}
              color={color}
              label={false}
              wrapMaxWidth={2000}
            />
          )}
          {visual === "line" && (
            <NumberLine
              numerator={numerator}
              denominator={denominator}
              width={dims.lineW}
              color={numLineColor}
              max={Math.max(1, Math.ceil(numerator / denominator))}
              presentation
              showPositionLabel={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleCompare({ visualA, visualB }: { visualA: ExplorerVisual; visualB: ExplorerVisual }) {
  const narrow = useZlomkNarrowLayout();
  const phone = useZlomkPhoneLayout();
  const [n1, setN1] = useState(2),
    [d1, setD1] = useState(5),
    [n2, setN2] = useState(3),
    [d2, setD2] = useState(4),
    [guessFeedback, setGuessFeedback] = useState<{ sym: string; ok: boolean } | null>(null);
  const bottomARef = useRef<HTMLDivElement>(null),
    bottomBRef = useRef<HTMLDivElement>(null);
  const [dimsA, setDimsA] = useState(() => measureCompareBottom(null));
  const [dimsB, setDimsB] = useState(() => measureCompareBottom(null));

  const cmp = n1 * d2 === n2 * d1 ? "=" : n1 * d2 > n2 * d1 ? ">" : "<";

  useLayoutEffect(() => {
    const tick = () => {
      setDimsA(measureCompareBottom(bottomARef.current));
      setDimsB(measureCompareBottom(bottomBRef.current));
    };
    tick();
    const ro = new ResizeObserver(tick);
    if (bottomARef.current) ro.observe(bottomARef.current);
    if (bottomBRef.current) ro.observe(bottomBRef.current);
    return () => ro.disconnect();
  }, [visualA, visualB]);

  const cmpChoices = [">", "<", "="] as const;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%" }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : "minmax(0,1fr) auto minmax(0,1fr)",
          gridTemplateRows: narrow ? "auto auto auto" : undefined,
          gap: narrow ? 14 : 12,
          alignItems: "stretch",
          padding: narrow
            ? `${phone ? 6 : 8}px max(8px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left))`
            : "8px 12px 16px",
        }}
      >
        <ComparePanel
          badge="Zlomek A"
          badgeBg={C.primaryLight}
          cardBorder={`${C.primary}33`}
          numerator={n1}
          denominator={d1}
          onChangeN={setN1}
          onChangeD={(d) => {
            setD1(d);
            if (n1 > d) setN1(d);
          }}
          color={C.primary}
          numLineColor={C.teal}
          visual={visualA}
          bottomRef={bottomARef}
          dims={dimsA}
        />
        <div
          style={{
            display: "flex",
            flexDirection: narrow ? "row" : "column",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: narrow ? 12 : 10,
            flexShrink: 0,
            paddingTop: narrow ? 4 : 24,
            paddingBottom: narrow ? 4 : 0,
          }}
        >
          {cmpChoices.map((sym) => {
            const hit = guessFeedback?.sym === sym;
            return (
              <button
                key={sym}
                type="button"
                aria-label={sym === ">" ? "A větší než B" : sym === "<" ? "A menší než B" : "stejně"}
                onClick={() => setGuessFeedback({ sym, ok: sym === cmp })}
                style={{
                  width: 62,
                  height: 62,
                  touchAction: "manipulation",
                  borderRadius: "50%",
                  border:
                    hit && guessFeedback
                      ? `3px solid ${guessFeedback.ok ? C.teal : C.red}`
                      : `2px solid ${GX.border}`,
                  background: hit && guessFeedback?.ok ? C.tealLight : hit && !guessFeedback?.ok ? C.redLight : "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 900,
                  color: GX.ink,
                  fontFamily: FONT_UI,
                  boxShadow: C.shadow,
                  transition: "all 0.2s",
                }}
              >
                {sym}
              </button>
            );
          })}
          {guessFeedback && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: guessFeedback.ok ? C.teal : C.gray600,
                textAlign: "center",
                maxWidth: 92,
                lineHeight: 1.35,
              }}
            >
              {guessFeedback.ok ? "Správně!" : `Zkus znovu. Je to ${cmp}.`}
            </div>
          )}
        </div>
        <ComparePanel
          badge="Zlomek B"
          badgeBg={C.orangeLight}
          cardBorder={`${C.orange}33`}
          numerator={n2}
          denominator={d2}
          onChangeN={setN2}
          onChangeD={(d) => {
            setD2(d);
            if (n2 > d) setN2(d);
          }}
          color={C.orange}
          numLineColor={C.orange}
          visual={visualB}
          bottomRef={bottomBRef}
          dims={dimsB}
        />
      </div>
    </div>
  );
}

// ─── Module: Equivalent (layout jako porovnání; uprostřed tlačítka násobku ×1–×6) ───
function ModuleEquivalent({ visualA, visualB }: { visualA: ExplorerVisual; visualB: ExplorerVisual }) {
  const narrow = useZlomkNarrowLayout();
  const phone = useZlomkPhoneLayout();
  const [baseN, setBaseN] = useState(1),
    [baseD, setBaseD] = useState(3),
    [multiplier, setMultiplier] = useState(1);
  const cN = baseN * multiplier;
  const cD = baseD * multiplier;
  const noop = useCallback(() => {}, []);
  const bottomARef = useRef<HTMLDivElement>(null);
  const bottomBRef = useRef<HTMLDivElement>(null);
  const [dimsA, setDimsA] = useState(() => measureCompareBottom(null));
  const [dimsB, setDimsB] = useState(() => measureCompareBottom(null));

  useLayoutEffect(() => {
    const tick = () => {
      setDimsA(measureCompareBottom(bottomARef.current));
      setDimsB(measureCompareBottom(bottomBRef.current));
    };
    tick();
    const ro = new ResizeObserver(tick);
    if (bottomARef.current) ro.observe(bottomARef.current);
    if (bottomBRef.current) ro.observe(bottomBRef.current);
    return () => ro.disconnect();
  }, [visualA, visualB, cN, cD]);

  const equivStepperMaxN = 6;
  const equivStepperMaxD = 8;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%" }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : "minmax(0,1fr) auto minmax(0,1fr)",
          gridTemplateRows: narrow ? "auto auto auto" : undefined,
          gap: narrow ? 14 : 12,
          alignItems: "stretch",
          padding: narrow
            ? `${phone ? 6 : 8}px max(8px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left))`
            : "8px 12px 16px",
        }}
      >
        <ComparePanel
          badge="Základní zlomek"
          badgeBg={C.primaryLight}
          cardBorder={`${C.primary}33`}
          numerator={baseN}
          denominator={baseD}
          onChangeN={(n) => {
            if (n > 0) setBaseN(Math.min(n, equivStepperMaxN));
          }}
          onChangeD={(d) => {
            setBaseD(d);
            if (baseN > d) setBaseN(d);
          }}
          color={C.primary}
          numLineColor={C.teal}
          visual={visualA}
          bottomRef={bottomARef}
          dims={dimsA}
          stepperMaxN={equivStepperMaxN}
          stepperMaxD={equivStepperMaxD}
          stepperMinD={2}
        />
        <div
          role="group"
          aria-label="Násobek rozšíření zlomku"
          style={{
            display: "flex",
            flexDirection: narrow ? "row" : "column",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: narrow ? 8 : 6,
            flexShrink: 0,
            width: narrow ? "100%" : 64,
            minHeight: 0,
            padding: narrow ? "10px 6px" : "8px 4px",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.gray500,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              textAlign: "center" as const,
              width: narrow ? "100%" : undefined,
            }}
          >
            Rozšíř
          </span>
          {[1, 2, 3, 4, 5, 6].map((m) => {
            const on = multiplier === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                aria-label={`Rozšířit ${m}×`}
                onClick={() => setMultiplier(m)}
                style={{
                  padding: narrow ? "10px 12px" : "8px 6px",
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: 10,
                  border: on ? `2px solid ${C.teal}` : `2px solid ${GX.border}`,
                  background: on ? C.teal : "white",
                  color: on ? "white" : GX.body,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT_UI,
                  boxShadow: on ? "0 2px 8px rgba(18, 184, 134, 0.35)" : "none",
                  transition: "all 0.15s",
                  touchAction: "manipulation",
                }}
              >
                ×{m}
              </button>
            );
          })}
        </div>
        <ComparePanel
          badge={`Stejná hodnota ×${multiplier}`}
          badgeBg={C.tealLight}
          cardBorder={`${C.teal}55`}
          numerator={cN}
          denominator={cD}
          onChangeN={noop}
          onChangeD={noop}
          color={C.teal}
          numLineColor={C.teal}
          visual={visualB}
          bottomRef={bottomBRef}
          dims={dimsB}
          stepperMaxN={equivStepperMaxN * 6}
          stepperMaxD={equivStepperMaxD * 6}
          stepperMinD={2}
          readOnlyStepper
        />
      </div>
    </div>
  );
}

// ─── Module: Addition ───
function ModuleAddition() {
  const narrow = useZlomkNarrowLayout();
  const [n1, setN1] = useState(1),
    [d1, setD1] = useState(4),
    [n2, setN2] = useState(1),
    [d2, setD2] = useState(3),
    [step, setStep] = useState(0);
  const cd = lcm(d1, d2),
    nn1 = n1 * (cd / d1),
    nn2 = n2 * (cd / d2),
    rn = nn1 + nn2;
  const [sn, sd] = simplify(rn, cd);
  const steps = [
    { title: "Zadej zlomky", desc: "Nastav dva zlomky" },
    { title: "Společný jmenovatel", desc: `NSN(${d1}, ${d2}) = ${cd}` },
    { title: "Rozšiř zlomky", desc: `${n1}/${d1} = ${nn1}/${cd}  a  ${n2}/${d2} = ${nn2}/${cd}` },
    {
      title: "Sečti čitatele",
      desc: `${nn1}/${cd} + ${nn2}/${cd} = ${rn}/${cd}${rn !== sn ? ` = ${sn}/${sd}` : ""}`,
    },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: narrow ? 20 : 28,
        paddingBottom: narrow ? "max(8px, env(safe-area-inset-bottom))" : undefined,
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", padding: narrow ? "0 8px" : undefined }}>
        <h2 style={{ fontSize: narrow ? 22 : 26, fontWeight: 900, color: C.gray900, margin: 0 }}>Sčítání zlomků</h2>
        <p style={{ fontSize: narrow ? 14 : 15, color: C.gray500, marginTop: 6 }}>Krok za krokem</p>
      </div>
      <div style={{ display: "flex", gap: narrow ? 6 : 4, justifyContent: "center", flexWrap: "wrap", padding: narrow ? "0 8px" : undefined }}>
        {steps.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "none",
              background: i === step ? C.primary : i < step ? C.primaryLight : C.gray100,
              color: i === step ? "white" : i < step ? C.primary : C.gray400,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.3s",
              fontFamily: FONT_UI,
            }}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
      <div
        style={{
          display: narrow ? "flex" : "grid",
          flexDirection: narrow ? "column" : undefined,
          gridTemplateColumns: narrow ? undefined : "1fr auto 1fr",
          gap: narrow ? 12 : 16,
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
          padding: narrow ? "0 8px" : undefined,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: C.card,
            borderRadius: 24,
            padding: narrow ? 16 : 20,
            boxShadow: C.shadow,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            border: `1px solid ${C.gray200}`,
            width: narrow ? "100%" : undefined,
            maxWidth: narrow ? 400 : undefined,
            boxSizing: "border-box",
          }}
        >
          {step < 2 ? (
            <CircleFraction numerator={n1} denominator={d1} size={narrow ? 100 : 120} color={C.primary} />
          ) : (
            <CircleFraction numerator={nn1} denominator={cd} size={narrow ? 100 : 120} color={C.primary} />
          )}
          {step === 0 && (
            <FractionStepper
              numerator={n1}
              denominator={d1}
              onChangeN={setN1}
              onChangeD={(d) => {
                setD1(d);
                if (n1 > d) setN1(d);
              }}
              color={C.primary}
              maxN={8}
              maxD={10}
              minD={2}
            />
          )}
          {step >= 2 && <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{nn1}/{cd}</div>}
        </div>
        <div style={{ fontSize: narrow ? 28 : 32, fontWeight: 900, color: C.gray400, lineHeight: 1 }}>+</div>
        <div
          style={{
            background: C.card,
            borderRadius: 24,
            padding: narrow ? 16 : 20,
            boxShadow: C.shadow,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            border: `1px solid ${C.gray200}`,
            width: narrow ? "100%" : undefined,
            maxWidth: narrow ? 400 : undefined,
            boxSizing: "border-box",
          }}
        >
          {step < 2 ? (
            <CircleFraction numerator={n2} denominator={d2} size={narrow ? 100 : 120} color={C.orange} />
          ) : (
            <CircleFraction numerator={nn2} denominator={cd} size={narrow ? 100 : 120} color={C.orange} />
          )}
          {step === 0 && (
            <FractionStepper
              numerator={n2}
              denominator={d2}
              onChangeN={setN2}
              onChangeD={(d) => {
                setD2(d);
                if (n2 > d) setN2(d);
              }}
              color={C.orange}
              maxN={8}
              maxD={10}
              minD={2}
            />
          )}
          {step >= 2 && <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{nn2}/{cd}</div>}
        </div>
      </div>
      <div
        style={{
          background:
            step === 3 ? `linear-gradient(135deg, ${C.tealLight}, ${C.primaryLight})` : C.card,
          borderRadius: 20,
          padding: 24,
          boxShadow: C.shadow,
          textAlign: "center",
          border: step === 3 ? `2px solid ${C.teal}33` : `1px solid ${C.gray200}`,
          transition: "all 0.4s",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: C.gray900, marginBottom: 8 }}>{steps[step].title}</div>
        <div style={{ fontSize: 15, color: C.gray700, lineHeight: 1.6 }}>{steps[step].desc}</div>
        {step === 1 && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ background: C.primaryLight, borderRadius: 12, padding: "8px 20px" }}>
              <span style={{ fontWeight: 800, color: C.primary }}>{d1}</span>
              <span style={{ color: C.gray500 }}> × {cd / d1} = {cd}</span>
            </div>
            <div style={{ background: C.orangeLight, borderRadius: 12, padding: "8px 20px" }}>
              <span style={{ fontWeight: 800, color: C.orange }}>{d2}</span>
              <span style={{ color: C.gray500 }}> × {cd / d2} = {cd}</span>
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
              <CircleFraction numerator={rn} denominator={cd} size={100} color={C.teal} label={false} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.teal, marginTop: 12 }}>
              ={" "}
              {rn > cd ? `${Math.floor(rn / cd)} a ${rn % cd}/${cd}` : `${rn}/${cd}`}
              {rn !== sn && ` = ${sn}/${sd}`}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            padding: "12px 28px",
            borderRadius: 14,
            border: "none",
            background: step === 0 ? C.gray100 : C.gray200,
            color: step === 0 ? C.gray400 : C.gray700,
            fontWeight: 700,
            fontSize: 15,
            cursor: step === 0 ? "not-allowed" : "pointer",
            fontFamily: FONT_UI,
          }}
        >
          ← Zpět
        </button>
        <button
          type="button"
          onClick={() => setStep(Math.min(3, step + 1))}
          disabled={step === 3}
          style={{
            padding: "12px 28px",
            borderRadius: 14,
            border: "none",
            background: step === 3 ? C.gray100 : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
            color: step === 3 ? C.gray400 : "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: step === 3 ? "not-allowed" : "pointer",
            boxShadow: step < 3 ? `0 4px 12px ${C.primary}44` : "none",
            fontFamily: FONT_UI,
          }}
        >
          Další →
        </button>
      </div>
    </div>
  );
}

type QuizQuestion = {
  type: string;
  text: string;
  n1: number;
  d1: number;
  options: string[];
  answer: number;
  explain: string;
};

/** Sdílený stav kvízu (hlavička + ModuleQuiz). */
type QuizHudState = {
  diff: number;
  score: number;
  total: number;
};

/** Úrovně kvízu „Poznávej zlomek“ — vždy stejný typ úlohy, liší se rozsah jmenovatele. */
const QUIZ_LEVELS = [
  { label: "Začátečník", emoji: "🌱", color: C.teal, maxD: 6 },
  { label: "Pokročilý", emoji: "⚡", color: C.orange, maxD: 10 },
  { label: "Mistr", emoji: "🏆", color: C.pink, maxD: 12 },
] as const;

function genIdentifyQuestion(levelIdx: number): QuizQuestion {
  const maxD = QUIZ_LEVELS[levelIdx].maxD;
  const d = randInt(2, Math.min(maxD, 12)),
    n = randInt(1, d - 1);
  const opts = shuffle([
    { t: `${n}/${d}`, c: true },
    { t: `${d}/${n}`, c: false },
    { t: `${n}/${d + 1}`, c: false },
  ]);
  return {
    type: "identify",
    text: "Který zlomek odpovídá obrázku?",
    n1: n,
    d1: d,
    options: opts.map((o) => o.t),
    answer: opts.findIndex((o) => o.c),
    explain: `Obarveno ${n} z ${d} dílů → správně je ${n}/${d}.`,
  };
}

const QUIZ_OPT_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

function ModuleQuiz({
  hud,
  setHud,
  onBack,
}: {
  hud: QuizHudState;
  setHud: Dispatch<SetStateAction<QuizHudState>>;
  onBack: () => void;
}) {
  const narrow = useZlomkNarrowLayout();
  const phone = useZlomkPhoneLayout();
  const previewRef = useRef<HTMLDivElement>(null);
  const [quizCircleSize, setQuizCircleSize] = useState(280);
  const [quizBarW, setQuizBarW] = useState(100);
  const [quizBarH, setQuizBarH] = useState(360);
  const [quizLineW, setQuizLineW] = useState(480);
  const [randomVisual, setRandomVisual] = useState<ExplorerVisual>(() => randomExplorerVisual());
  const [q, setQ] = useState<QuizQuestion | null>(null),
    [sel, setSel] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const newQ = useCallback(() => {
    setRandomVisual(randomExplorerVisual());
    setQ(genIdentifyQuestion(hud.diff));
    setSel(null);
    setShowExp(false);
  }, [hud.diff]);
  useEffect(() => {
    newQ();
  }, [newQ]);
  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(0, r.width);
      const h = Math.max(0, r.height);
      const baseLine = Math.max(240, Math.min(920, Math.floor(w - 12)));
      const lineWDesktop =
        randomVisual === "line" && !phone ? Math.min(1840, baseLine * 2) : baseLine;
      setQuizLineW(lineWDesktop);
      const side = Math.min(w, h || w);
      const nextCircle = Math.floor(Math.max(0, side - 12) * 0.92);
      setQuizCircleSize(Math.max(168, Math.min(540, nextCircle)));
      const barH = Math.max(200, Math.min(580, Math.floor((h || 360) * 0.88)));
      const barW = Math.max(72, Math.min(148, Math.floor(barH * 0.34)));
      setQuizBarH(barH);
      setQuizBarW(barW);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [randomVisual, q, narrow, phone]);
  const handleAns = (idx: number) => {
    if (sel !== null || !q) return;
    setSel(idx);
    setHud((h) =>
      idx === q.answer
        ? { ...h, total: h.total + 1, score: h.score + 1 }
        : { ...h, total: h.total + 1 },
    );
    if (idx !== q.answer) setShowExp(false);
  };
  if (!q) return null;
  const panelPad = phone ? "16px 14px 22px" : "24px 24px 32px";
  const panelPadPreview = phone ? "16px 14px 22px" : narrow ? "24px 24px 32px" : "40px 44px 40px";
  const assignmentPanel = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        flex: 1,
      }}
    >
      <div
        ref={previewRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: phone ? 180 : narrow ? 220 : 260,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {randomVisual === "circle" && (
          <CircleFraction
            numerator={q.n1}
            denominator={q.d1}
            size={quizCircleSize}
            color={C.primary}
            label={false}
            emptyFill="#FFFFFF"
            emptyOpacity={1}
          />
        )}
        {randomVisual === "vbar" && (
          <VerticalBarFraction
            numerator={q.n1}
            denominator={q.d1}
            barWidth={quizBarW}
            barHeight={quizBarH}
            color={C.orange}
            label={false}
            wrapMaxWidth={1200}
            segmentDividerStroke="#FFFFFF"
          />
        )}
        {randomVisual === "line" && (
          <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, padding: "8px 0 4px" }}>
            <QuizIdentifyNumberLine numerator={q.n1} denominator={q.d1} axisInnerPx={quizLineW} />
          </div>
        )}
      </div>
    </div>
  );
  const answersPanel = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        flex: 1,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 9999,
            border: `2px solid ${GX.border}`,
            background: "white",
            color: GX.body,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 200ms",
            alignSelf: "flex-start",
            fontFamily: FONT_UI,
          }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Zpět
        </button>
        <div style={{ color: GX.ink, fontSize: 21, fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Poznávej zlomek</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: phone ? "column" : "row",
          flexWrap: "wrap",
          alignItems: phone ? "stretch" : "center",
          gap: phone ? 10 : 12,
        }}
      >
        <div
          role="toolbar"
          aria-label="Úroveň obtížnosti"
          style={{ display: "flex", flexWrap: "wrap", gap: 6, width: phone ? "100%" : undefined }}
        >
          {QUIZ_LEVELS.map((d, i) => {
            const on = i === hud.diff;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => setHud((h) => (i === h.diff ? h : { ...h, diff: i, score: 0, total: 0 }))}
                style={{
                  padding: phone ? "10px 12px" : "8px 14px",
                  minHeight: phone ? 44 : undefined,
                  borderRadius: 9999,
                  border: on ? "2px solid transparent" : `2px solid ${GX.border}`,
                  background: on ? GX.brand : "white",
                  color: on ? "white" : GX.body,
                  fontWeight: 600,
                  fontSize: phone ? 12 : 13,
                  cursor: "pointer",
                  fontFamily: FONT_UI,
                  boxShadow: on ? "0 4px 14px rgba(77, 73, 243, 0.25)" : "none",
                  transition: "all 0.2s",
                  whiteSpace: phone ? undefined : "nowrap",
                  flex: phone ? "1 1 auto" : undefined,
                  textAlign: "center" as const,
                  touchAction: "manipulation",
                }}
              >
                {d.emoji} {d.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            fontSize: phone ? 14 : 16,
            color: GX.body,
            fontWeight: 600,
            fontFamily: FONT_UI,
            whiteSpace: phone ? undefined : "nowrap",
            width: phone ? "100%" : undefined,
          }}
        >
          Správně{" "}
          <strong style={{ color: GX.ink, fontSize: 17, fontWeight: 800 }}>
            {hud.score}/{hud.total}
          </strong>
        </div>
      </div>
      <div
        style={{
          color: GX.ink,
          fontSize: phone ? 16 : 17,
          fontWeight: 800,
          lineHeight: 1.35,
          marginTop: 4,
        }}
      >
        {q.text}
      </div>
      {q.options.map((opt, idx) => {
        const ic = idx === q.answer,
          is = idx === sel;
        const letter = QUIZ_OPT_LETTERS[idx] ?? String(idx + 1);
        let bg = GX.page,
          bd = GX.border,
          tc = GX.ink;
        if (sel !== null) {
          if (ic) {
            bg = C.tealLight;
            bd = C.teal;
            tc = C.teal;
          } else if (is) {
            bg = C.redLight;
            bd = C.red;
            tc = C.red;
          }
        }
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleAns(idx)}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: bg,
              border: `2px solid ${bd}`,
              fontSize: 17,
              fontWeight: 700,
              color: tc,
              cursor: sel !== null ? "default" : "pointer",
              transition: "all 0.25s",
              fontFamily: FONT_UI,
              display: "flex",
              alignItems: "center",
              gap: 14,
              textAlign: "left",
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: sel === null ? `${GX.brand}14` : ic || is ? "rgba(255,255,255,0.6)" : `${GX.brand}14`,
                color: GX.brand,
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              {letter}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{opt}</span>
            {sel !== null && ic && <span aria-hidden>✅</span>}
            {sel !== null && is && !ic && <span aria-hidden>❌</span>}
          </button>
        );
      })}
      {sel !== null && (
        <div style={{ animation: "fadeIn 0.4s", marginTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
          {(showExp || sel === q.answer) && (
            <div
              style={{
                background: sel === q.answer ? C.tealLight : C.yellowLight,
                borderRadius: 14,
                padding: 16,
                border: `2px solid ${sel === q.answer ? C.teal : C.yellow}44`,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: GX.ink,
                  fontSize: 15,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {sel === q.answer ? "Správně!" : "Vysvětlení"}
              </div>
              <div style={{ color: GX.body, fontSize: 14, lineHeight: 1.55 }}>{q.explain}</div>
            </div>
          )}
          {sel !== q.answer && !showExp && (
            <button
              type="button"
              onClick={() => setShowExp(true)}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: `2px solid ${GX.border}`,
                background: GX.page,
                color: GX.body,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: FONT_UI,
                width: "100%",
              }}
            >
              Zobrazit vysvětlení
            </button>
          )}
          <button
            type="button"
            onClick={newQ}
            style={{
              padding: "14px 24px",
              borderRadius: 9999,
              border: "none",
              width: "100%",
              background: GX.brand,
              color: "white",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(77, 73, 243, 0.28)",
              fontFamily: FONT_UI,
            }}
          >
            Další otázka →
          </button>
        </div>
      )}
    </div>
  );
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
          gridTemplateRows: narrow ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)",
          width: "100%",
          gap: narrow ? 0 : 12,
          padding: narrow ? 0 : "24px 28px 28px",
          boxSizing: "border-box",
        }}
      >
        {/* Vlevo UX (odpovědi) — na desktopu 50/50 jako Zlomkové kolo; na úzkém displeji pod náhledem */}
        <div
          style={{
            gridRow: narrow ? 2 : 1,
            gridColumn: 1,
            display: "flex",
            flexDirection: "column",
            padding: panelPad,
            background: GX.page,
            borderRadius: narrow ? 0 : 24,
            minWidth: 0,
            minHeight: narrow ? undefined : 0,
            overflow: "auto",
          }}
        >
          {answersPanel}
        </div>
        {/* Vpravo náhled zlomku — stejný odstín panelu jako kolo vpravo */}
        <div
          style={{
            gridRow: narrow ? 1 : 1,
            gridColumn: narrow ? 1 : 2,
            display: "flex",
            flexDirection: "column",
            padding: panelPadPreview,
            background: "#f3f4f6",
            borderRadius: narrow ? 0 : 24,
            border: narrow ? "none" : `1px solid ${C.gray200}`,
            minWidth: 0,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          {assignmentPanel}
        </div>
      </div>
    </div>
  );
}

function wheelAngleAccuracy(guessDeg: number, targetDeg: number): number {
  const diffDeg = Math.min(Math.abs(guessDeg - targetDeg), 360 - Math.abs(guessDeg - targetDeg));
  return Math.max(0, 100 - (diffDeg / 180) * 100);
}

function ModuleWheel({ onBack }: { onBack: () => void }) {
  const narrow = useZlomkNarrowLayout();
  const phone = useZlomkPhoneLayout();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [targetN, setTargetN] = useState(3),
    [targetD, setTargetD] = useState(4);
  const [guessAngle, setGuessAngle] = useState<number | null>(null);
  /** uložené tipy po oba tahy — po vyhodnocení oba non-null */
  const [storedAngles, setStoredAngles] = useState<[number | null, number | null]>([null, null]);
  /** p1 = jen hráč 1, p2 = jen hráč 2 (stejné zadání), results = konec kola */
  const [phase, setPhase] = useState<"p1" | "p2" | "results">("p1");
  const [matchRound, setMatchRound] = useState(0);
  const [playerTotals, setPlayerTotals] = useState<[number, number]>([0, 0]);
  const [playerRoundCounts, setPlayerRoundCounts] = useState<[number, number]>([0, 0]);
  const [hoverAngle, setHoverAngle] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [difficulty, setDifficulty] = useState(0);

  const SIZE = 420,
    CX = SIZE / 2,
    CY = SIZE / 2,
    R = SIZE / 2 - 28;
  const targetAngle = (targetN / targetD) * 360;
  const activePlayer: 0 | 1 | null = phase === "p1" ? 0 : phase === "p2" ? 1 : null;
  const P1 = C.orange;
  const P2 = C.purple;
  const turnAccent = phase === "p1" ? P1 : phase === "p2" ? P2 : C.gray600;
  const playing = phase === "p1" || phase === "p2";

  const accP1 =
    phase === "results" && storedAngles[0] !== null ? wheelAngleAccuracy(storedAngles[0], targetAngle) : null;
  const accP2 =
    phase === "results" && storedAngles[1] !== null ? wheelAngleAccuracy(storedAngles[1], targetAngle) : null;

  const genRound = useCallback(() => {
    const denoms =
      difficulty === 0
        ? [2, 3, 4]
        : difficulty === 1
          ? [2, 3, 4, 5, 6, 8]
          : [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    const d = denoms[randInt(0, denoms.length - 1)];
    const n = randInt(1, difficulty === 0 ? d - 1 : d);
    setTargetN(n);
    setTargetD(d);
    setPhase("p1");
    setStoredAngles([null, null]);
    setGuessAngle(null);
  }, [difficulty]);

  useEffect(() => {
    genRound();
  }, [matchRound, genRound]);

  const getAngle = useCallback(
    (e: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const scaleX = SIZE / rect.width,
        scaleY = SIZE / rect.height;
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const x = (clientX - rect.left) * scaleX - CX;
      const y = (clientY - rect.top) * scaleY - CY;
      let a = Math.atan2(x, -y) * (180 / Math.PI);
      if (a < 0) a += 360;
      return a;
    },
    []
  );

  const handleClick = (e: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>) => {
    if (playing) setGuessAngle(getAngle(e));
  };
  const handleMove = (e: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>) => {
    if (playing) {
      setHovering(true);
      setHoverAngle(getAngle(e));
    }
  };

  const resetCompetition = () => {
    setPlayerTotals([0, 0]);
    setPlayerRoundCounts([0, 0]);
    setMatchRound((r) => r + 1);
  };

  const handleSubmitPlay = () => {
    if (guessAngle === null || !playing || activePlayer === null) return;
    if (phase === "p1") {
      setStoredAngles([guessAngle, null]);
      setGuessAngle(null);
      setPhase("p2");
      return;
    }
    const a0 = storedAngles[0];
    if (phase === "p2" && a0 !== null) {
      const a1 = guessAngle;
      const s0 = Math.round(wheelAngleAccuracy(a0, targetAngle));
      const s1 = Math.round(wheelAngleAccuracy(a1, targetAngle));
      setPlayerTotals((t) => [t[0] + s0, t[1] + s1]);
      setPlayerRoundCounts((c) => [c[0] + 1, c[1] + 1]);
      setStoredAngles([a0, a1]);
      setPhase("results");
    }
  };

  const handleNextMatch = () => {
    setMatchRound((r) => r + 1);
  };

  const needle = (angle: number, len: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: CX + len * Math.cos(rad), y: CY + len * Math.sin(rad) };
  };
  const guessEnd = guessAngle !== null ? needle(guessAngle, R - 5) : null;
  const targetEnd = needle(targetAngle, R - 5);
  const hoverEnd = needle(hoverAngle, R - 5);

  const filledArc = (
    endAngle: number,
    radius: number,
    color: string,
    op = 0.2,
    opts?: { hoverPreview?: boolean }
  ) => {
    if (endAngle < 0.5) return null;
    const ea = Math.min(endAngle, 359.99);
    const start = needle(0, radius),
      end = needle(ea, radius),
      la = ea > 180 ? 1 : 0;
    return (
      <path
        d={`M ${CX} ${CY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${la} 1 ${end.x} ${end.y} Z`}
        fill={color}
        opacity={op}
        className={opts?.hoverPreview ? "zlomky-wheel-hover-fill" : undefined}
      />
    );
  };

  const zadaniHuge = (
    <div
      style={{
        textAlign: "center",
        background: `linear-gradient(135deg, ${C.purpleLight}, ${C.primaryLight})`,
        borderRadius: 22,
        padding: "22px 16px 26px",
        border: `2px solid ${C.primary}22`,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: C.gray500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Zadání
      </div>
      <div
        style={{
          fontSize: "clamp(52px, 11vw, 76px)",
          fontWeight: 900,
          color: C.primary,
          lineHeight: 1.05,
          marginTop: 6,
        }}
      >
        {targetN}
        <span style={{ color: C.gray400, margin: "0 0.08em", fontWeight: 800 }}>/</span>
        {targetD}
      </div>
      {targetN > targetD && (
        <div style={{ fontSize: 14, color: C.purple, fontWeight: 700, marginTop: 10 }}>
          = {Math.floor(targetN / targetD)} celých a {targetN % targetD}/{targetD}
        </div>
      )}
    </div>
  );

  let roundWinner: 0 | 1 | "tie" | null = null;
  if (phase === "results" && accP1 !== null && accP2 !== null) {
    if (accP1 > accP2) roundWinner = 0;
    else if (accP2 > accP1) roundWinner = 1;
    else roundWinner = "tie";
  }

  const sidebar = (
    <aside
      style={{
        width: narrow ? "100%" : 340,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxHeight: narrow ? "none" : "100%",
        overflowY: "auto",
        paddingRight: narrow ? 0 : 8,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 9999,
            border: `2px solid ${GX.border}`,
            background: "white",
            color: GX.body,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 200ms",
            alignSelf: "flex-start",
            fontFamily: FONT_UI,
          }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Zpět
        </button>
        <div style={{ color: GX.ink, fontSize: 21, fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          Zlomkové kolo
        </div>
      </div>

      {zadaniHuge}

      <p style={{ fontSize: 13, color: C.gray500, margin: 0, lineHeight: 1.45 }}>
        <strong style={{ color: C.gray900 }}>Dvojuhra:</strong> jedno zadání pro oba — nejdřív hráč&nbsp;1 (oranžová), pak hráč&nbsp;2
        (fialová) na prázdném kole, potom vyhodnocení.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["🌱 Snadné", "⚡ Střední", "🏆 Těžké"] as const).map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setDifficulty(i);
              resetCompetition();
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: `2px solid ${i === difficulty ? C.primary : C.gray200}`,
              background: i === difficulty ? C.primaryLight : C.card,
              color: i === difficulty ? C.primary : C.gray500,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: FONT_UI,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {([0, 1] as const).map((pid) => {
          const on = activePlayer === pid;
          const cnt = playerRoundCounts[pid];
          const avg = cnt > 0 ? Math.round(playerTotals[pid] / cnt) : null;
          const baseBorder = pid === 0 ? P1 : P2;
          const wonRound =
            phase === "results" && roundWinner !== null && roundWinner !== "tie"
              ? roundWinner === pid
              : false;
          return (
            <div
              key={pid}
              style={{
                background: C.card,
                borderRadius: 16,
                padding: "12px 14px",
                border: `2px solid ${
                  phase === "results" && wonRound ? baseBorder : on && playing ? baseBorder : C.gray200
                }`,
                boxShadow:
                  on && playing
                    ? `0 0 0 3px ${baseBorder}22`
                    : phase === "results" && wonRound
                      ? `0 0 0 4px ${baseBorder}55`
                      : undefined,
                opacity: phase === "results" && roundWinner !== "tie" && !wonRound ? 0.72 : 1,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: C.gray500, textTransform: "uppercase" }}>
                Hráč {pid + 1}
                {phase === "results" && wonRound && (
                  <span style={{ marginLeft: 6, color: baseBorder, fontWeight: 900 }}>★ Vítěz kola</span>
                )}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: pid === 0 ? P1 : P2, lineHeight: 1.1 }}>
                {playerTotals[pid]}
                <span style={{ fontSize: 13, fontWeight: 700, color: C.gray500 }}> b</span>
              </div>
              <div style={{ fontSize: 12, color: C.gray500, marginTop: 4 }}>
                {cnt > 0 && avg !== null ? `Průměr ${avg}% · ${cnt} kol` : "Zatím nehrál"}
              </div>
              {phase === "results" && (pid === 0 ? accP1 : accP2) !== null && (
                <div style={{ fontSize: 13, fontWeight: 800, color: C.gray700, marginTop: 6 }}>
                  Toto kolo: {Math.round((pid === 0 ? accP1 : accP2) as number)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {playing && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 14,
            background: turnAccent + "18",
            border: `1px solid ${turnAccent}44`,
            fontWeight: 800,
            fontSize: 15,
            color: C.gray900,
          }}
        >
          {phase === "p1" ? (
            <>
              Tah <span style={{ color: P1 }}>hráče 1</span>
              <span style={{ fontWeight: 600, color: C.gray500, fontSize: 13 }}> — klikni na kolo vpravo</span>
            </>
          ) : (
            <>
              Tah <span style={{ color: P2 }}>hráče 2</span>
              <span style={{ fontWeight: 600, color: C.gray500, fontSize: 13 }}> — stejné zadání, kolo je znovu prázdné</span>
            </>
          )}
        </div>
      )}

      {phase === "results" && accP1 !== null && accP2 !== null && roundWinner !== null && (
        <div
          style={{
            animation: "fadeIn 0.45s",
            borderRadius: 18,
            padding: 16,
            background: C.gray100,
            border: `1px solid ${C.gray200}`,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: C.gray500, textTransform: "uppercase", marginBottom: 8 }}>
            Vyhodnocení kola
          </div>
          <div
            style={{
              marginBottom: 14,
              padding: "14px 16px",
              borderRadius: 16,
              textAlign: "center",
              background:
                roundWinner === "tie"
                  ? C.gray200
                  : roundWinner === 0
                    ? C.orangeLight
                    : C.purpleLight,
              border: `3px solid ${
                roundWinner === "tie" ? C.gray400 : roundWinner === 0 ? P1 : P2
              }`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: C.gray600, marginBottom: 4 }}>Výsledek</div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1.2,
                color: roundWinner === "tie" ? C.gray700 : roundWinner === 0 ? P1 : P2,
              }}
            >
              {roundWinner === "tie"
                ? "Remíza!"
                : roundWinner === 0
                  ? "Vyhrává hráč 1"
                  : "Vyhrává hráč 2"}
            </div>
            {roundWinner !== "tie" && (
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700, marginTop: 8 }}>
                O{' '}
                {Math.abs(Math.round(accP1) - Math.round(accP2))}
                % přesněji než{' '}
                {roundWinner === 0 ? "hráč 2" : "hráč 1"}.
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 12,
                background: roundWinner === 0 ? C.orangeLight : "transparent",
                fontWeight: roundWinner === 0 ? 800 : 600,
              }}
            >
              <span style={{ fontWeight: 700, color: P1 }}>Hráč 1</span>
              <span style={{ fontWeight: 900, fontSize: 20, color: P1 }}>{Math.round(accP1)}%</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 12,
                background: roundWinner === 1 ? C.purpleLight : "transparent",
                fontWeight: roundWinner === 1 ? 800 : 600,
              }}
            >
              <span style={{ fontWeight: 700, color: P2 }}>Hráč 2</span>
              <span style={{ fontWeight: 900, fontSize: 20, color: P2 }}>{Math.round(accP2)}%</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNextMatch}
            style={{
              marginTop: 14,
              padding: "13px 20px",
              borderRadius: 14,
              border: "none",
              width: "100%",
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
              color: "white",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${C.primary}44`,
              fontFamily: FONT_UI,
            }}
          >
            Další kolo →
          </button>
        </div>
      )}

      {playing && guessAngle !== null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: C.gray600, fontWeight: 600, textAlign: "center" }}>
            Tip hráče {activePlayer! + 1} — potvrď nebo zkus jiný úhel.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setGuessAngle(null)}
              style={{
                flex: 1,
                padding: "11px 12px",
                borderRadius: 12,
                border: "none",
                background: C.gray200,
                color: C.gray700,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: FONT_UI,
              }}
            >
              Znovu
            </button>
            <button
              type="button"
              onClick={handleSubmitPlay}
              style={{
                flex: 1,
                padding: "11px 12px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                color: "white",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: `0 4px 16px ${C.primary}44`,
                fontFamily: FONT_UI,
              }}
            >
              {phase === "p1" ? "Potvrdit — hráč 2" : "Potvrdit a vyhodnotit"}
            </button>
          </div>
        </div>
      )}

      {playing && guessAngle === null && (
        <div style={{ textAlign: "center", color: C.gray500, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
          {phase === "p1"
            ? `Hráč 1: ukaž na kole, kde je ${targetN}/${targetD}.`
            : `Hráč 2: stejné zadání — ukaž svůj tip na kole.`}
        </div>
      )}
    </aside>
  );

  const a0 = storedAngles[0];
  const a1 = storedAngles[1];
  const end0 = a0 !== null ? needle(a0, R - 5) : null;
  const end1 = a1 !== null ? needle(a1, R - 5) : null;

  /** Čisté kolo: jen kruh a střed; bez rysků po obvodu; při hře jen aktuální tah, po kole oba tipy + správný směr */
  const wheelSvg = (
    <svg
      ref={svgRef}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        cursor: playing ? "crosshair" : "default",
        userSelect: "none",
        touchAction: "none",
        maxWidth: "min(92vmin, 100%)",
        height: "auto",
      }}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setHovering(false)}
      onTouchStart={handleClick}
      onTouchMove={handleMove}
      aria-label="Ciferník zlomku — klikni na obvod"
    >
      <defs>
        <filter id="glowWheel">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style type="text/css">{`
          /* Jen opacity — geometrie se mění okamžitě; CSS transition na path „d“ bývá rozbitá i při scale. */
          @keyframes zlomkyWheelHoverFillPulse {
            0%, 100% { opacity: 0.24; }
            50% { opacity: 0.44; }
          }
          .zlomky-wheel-hover-fill {
            animation: zlomkyWheelHoverFillPulse 1.1s ease-in-out infinite;
          }
        `}</style>
      </defs>

      <circle cx={CX} cy={CY} r={R} fill="#FFFFFF" stroke={C.gray300} strokeWidth="2.5" />

      <text
        x={CX}
        y={CY - R + 26}
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill={C.gray700}
        fontFamily={FONT_UI}
      >
        0
      </text>

      {phase === "p1" && guessAngle !== null && guessEnd && filledArc(guessAngle, R - 2, P1, 0.42)}
      {phase === "p2" && guessAngle !== null && guessEnd && filledArc(guessAngle, R - 2, P2, 0.42)}
      {phase === "results" && filledArc(Math.min(targetAngle, 359.99), R - 2, C.teal, 0.32)}

      {playing && hovering && guessAngle === null && filledArc(hoverAngle, R - 2, turnAccent, 0.34, { hoverPreview: true })}
      {playing && hovering && guessAngle === null && (
        <line
          x1={CX}
          y1={CY}
          x2={hoverEnd.x}
          y2={hoverEnd.y}
          stroke={turnAccent}
          strokeWidth="2"
          strokeDasharray="6,4"
          opacity="0.55"
        />
      )}

      {phase === "p1" && guessAngle !== null && guessEnd && (
        <g>
          <line x1={CX} y1={CY} x2={guessEnd.x} y2={guessEnd.y} stroke={P1} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={guessEnd.x} cy={guessEnd.y} r={7} fill={P1} stroke="white" strokeWidth="2.5" />
        </g>
      )}
      {phase === "p2" && guessAngle !== null && guessEnd && (
        <g>
          <line x1={CX} y1={CY} x2={guessEnd.x} y2={guessEnd.y} stroke={P2} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={guessEnd.x} cy={guessEnd.y} r={7} fill={P2} stroke="white" strokeWidth="2.5" />
        </g>
      )}

      {phase === "results" && end0 && (
        <g style={{ animation: "fadeIn 0.35s" }}>
          <line x1={CX} y1={CY} x2={end0.x} y2={end0.y} stroke={P1} strokeWidth="3.5" strokeLinecap="round" opacity={0.95} />
          <circle cx={end0.x} cy={end0.y} r={7} fill={P1} stroke="white" strokeWidth="2.5" />
        </g>
      )}
      {phase === "results" && end1 && (
        <g style={{ animation: "fadeIn 0.35s" }}>
          <line x1={CX} y1={CY} x2={end1.x} y2={end1.y} stroke={P2} strokeWidth="3.5" strokeLinecap="round" opacity={0.95} />
          <circle cx={end1.x} cy={end1.y} r={7} fill={P2} stroke="white" strokeWidth="2.5" />
        </g>
      )}

      {phase === "results" && (
        <g style={{ animation: "fadeIn 0.5s" }}>
          <line
            x1={CX}
            y1={CY}
            x2={targetEnd.x}
            y2={targetEnd.y}
            stroke={C.teal}
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#glowWheel)"
          />
          <circle cx={targetEnd.x} cy={targetEnd.y} r={9} fill={C.teal} stroke="white" strokeWidth="3" />
        </g>
      )}

      <circle cx={CX} cy={CY} r={10} fill={C.gray700} stroke="white" strokeWidth="3.5" />
    </svg>
  );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: narrow ? "column" : "row",
        alignItems: "stretch",
        gap: narrow ? 12 : 16,
        width: "100%",
        padding: narrow
          ? `${phone ? 2 : 4}px max(${phone ? 8 : 10}px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(${
              phone ? 8 : 10
            }px, env(safe-area-inset-left))`
          : "4px 8px 8px",
        overflow: narrow ? "auto" : undefined,
        boxSizing: "border-box",
      }}
    >
      {sidebar}
      <div
        style={{
          flex: narrow ? "0 0 auto" : 1,
          minWidth: 0,
          minHeight: narrow ? (phone ? 240 : 280) : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          borderRadius: narrow ? 16 : 24,
          border: `1px solid ${C.gray200}`,
          padding: narrow ? "12px 8px" : undefined,
        }}
      >
        {wheelSvg}
      </div>
    </div>
  );
}

const modules: readonly {
  id: string;
  label: string;
  desc: string;
  illustrationBg: string;
}[] = [
  { id: "explorer", label: "Prozkoumej", desc: "Co je zlomek? Měň a sleduj.", illustrationBg: "#dcf3ff" },
  { id: "compare", label: "Porovnávání", desc: "Který zlomek je větší?", illustrationBg: "#ffedd5" },
  { id: "equivalent", label: "Ekvivalence", desc: "Stejně velké, jinak zapsané.", illustrationBg: "#d1fae5" },
  { id: "addition", label: "Sčítání", desc: "Sečti zlomky krok za krokem.", illustrationBg: "#ede9fe" },
  {
    id: "wheel",
    label: "Zlomkové kolo",
    desc: "Dvojuhra: jedno zadání, dva tipy, pak vyhodnocení na kole.",
    illustrationBg: "#fce7f3",
  },
  { id: "quiz", label: "Poznávej zlomek", desc: "Náhled zlomku vpravo, správný zápis vybíráš vlevo.", illustrationBg: "#fefce8" },
  {
    id: "fractionViz",
    label: "Vizuální zlomky",
    desc: "Označ správnou část — koláč, mřížka nebo číselná osa. Pozor na čas!",
    illustrationBg: "#dbeafe",
  },
];

const HOME_LEARN_IDS = new Set(["explorer", "compare", "equivalent", "addition"]);
const HOME_COMPETE_IDS = new Set(["wheel", "quiz", "fractionViz"]);
const learnModules = modules.filter((m) => HOME_LEARN_IDS.has(m.id));
const competeModules = modules.filter((m) => HOME_COMPETE_IDS.has(m.id));

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Zlomkarna() {
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = useMemo(() => parseZlomkPath(location.pathname, ROUTER_BASENAME), [location.pathname]);

  useLayoutEffect(() => {
    if (parsed === null) {
      navigate("/ucime-se", { replace: true });
      return;
    }
    if (!parsed.moduleId) return;
    const inLearn = HOME_LEARN_IDS.has(parsed.moduleId);
    const inCompete = HOME_COMPETE_IDS.has(parsed.moduleId);
    if (!inLearn && !inCompete) {
      navigate(homeHref(parsed.section), { replace: true });
      return;
    }
    const wantSection: HomeSection = inLearn ? "learn" : "compete";
    if (parsed.section !== wantSection) {
      navigate(moduleHref(wantSection, parsed.moduleId), { replace: true });
    }
  }, [parsed, navigate]);

  const homeTab: "learn" | "compete" = parsed?.section === "compete" ? "compete" : "learn";
  const activeModule = parsed?.moduleId ?? null;
  const layoutNarrow = useZlomkNarrowLayout();
  const phoneLayout = useZlomkPhoneLayout();

  const [explorerVisual, setExplorerVisual] = useState<ExplorerVisual>("circle");
  const [quizHud, setQuizHud] = useState<QuizHudState>({ diff: 0, score: 0, total: 0 });
  const [compareVisA, setCompareVisA] = useState<ExplorerVisual>("circle");
  const [compareVisB, setCompareVisB] = useState<ExplorerVisual>("circle");
  const compareUnifiedView = compareVisA === compareVisB;
  const [equivVisA, setEquivVisA] = useState<ExplorerVisual>("circle");
  const [equivVisB, setEquivVisB] = useState<ExplorerVisual>("circle");
  const equivUnifiedView = equivVisA === equivVisB;
  const fullBleedModule =
    activeModule === "explorer" ||
    activeModule === "compare" ||
    activeModule === "equivalent" ||
    activeModule === "fractionViz" ||
    activeModule === "quiz";
  const wheelFullLayout = activeModule === "wheel";
  const active = modules.find((m) => m.id === activeModule);
  const explorerLineOnlyLayout = activeModule === "explorer" && explorerVisual === "line";
  const headerTitle =
    activeModule === "explorer"
      ? "Prozkoumej zlomek"
      : activeModule === "compare"
        ? "Porovnej zlomky"
        : active?.label ?? "";

  return (
    <div
      className="zlomk-app-shell"
      data-full-bleed={fullBleedModule || wheelFullLayout ? "1" : undefined}
      style={{
        background: GX.page,
        fontFamily: FONT_UI,
        display: "flex",
        flexDirection: "column",
        overflow: fullBleedModule || wheelFullLayout ? "hidden" : undefined,
        paddingLeft: "max(0px, env(safe-area-inset-left))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}
    >
      <style>{`
        .zlomk-app-shell { min-height: 100vh; }
        @supports (min-height: 100dvh) {
          .zlomk-app-shell { min-height: 100dvh; }
        }
        .zlomk-app-shell[data-full-bleed="1"] {
          height: 100vh;
          min-height: 100vh;
          overflow: hidden;
        }
        @supports (height: 100dvh) {
          .zlomk-app-shell[data-full-bleed="1"] {
            height: 100dvh;
            min-height: 100dvh;
          }
        }
        /* Telefon: neblokovat obsah pevnou výškou — scrollovat celou stránku (Safari / malé displeje). */
        @media (max-width: ${ZLOMK_PHONE_BREAKPOINT_PX}px) {
          .zlomk-app-shell[data-full-bleed="1"] {
            height: auto !important;
            max-height: none;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        input[type="range"]::-webkit-slider-thumb { appearance: none; width: 28px; height: 28px; border-radius: 50%; background: ${GX.brand}; cursor: pointer; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        @media (pointer: coarse) {
          input[type="range"]::-webkit-slider-thumb { width: 36px; height: 36px; border-width: 5px; }
        }
        * { box-sizing: border-box; }
        button { font-family: ${FONT_UI}; touch-action: manipulation; }
      `}</style>

      {activeModule && activeModule !== "wheel" && activeModule !== "quiz" && activeModule !== "fractionViz" ? (
        <header
          style={{
            borderBottom: `1px solid ${GX.border}`,
            padding:
              "max(10px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) 14px max(12px, env(safe-area-inset-left))",
            background: GX.page,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: fullBleedModule ? "100%" : 1044,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: fullBleedModule ? (phoneLayout ? "0 8px" : "0 12px") : "0 4px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(homeHref(parsed!.section))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                minHeight: 44,
                borderRadius: 9999,
                border: `2px solid ${GX.border}`,
                background: "white",
                color: GX.body,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 200ms",
                flexShrink: 0,
                touchAction: "manipulation",
              }}
            >
              <ArrowLeft size={18} strokeWidth={2} />
              Zpět
            </button>
            {activeModule === "explorer" ? (
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: phoneLayout ? "column" : "row",
                  flexWrap: "wrap",
                  alignItems: phoneLayout ? "stretch" : "flex-start",
                  justifyContent: "space-between",
                  gap: phoneLayout ? 8 : 10,
                  padding: "2px 0",
                }}
              >
                <div
                  style={{
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flex: phoneLayout ? "0 0 auto" : "1 1 140px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: GX.ink,
                      fontSize: phoneLayout ? 17 : 19,
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {headerTitle}
                  </div>
                  <div
                    style={{
                      color: GX.body,
                      fontSize: phoneLayout ? 11 : 12,
                      fontWeight: 500,
                      marginTop: 3,
                      lineHeight: 1.35,
                      maxWidth: 340,
                    }}
                  >
                    {explorerLineOnlyLayout
                      ? "Obrazovka je rozpolcená: nahoře zlomek, dole osa."
                      : layoutNarrow
                        ? "Nahoře zlomek, dole náhled."
                        : "Vlevo zlomek, vpravo náhled."}
                  </div>
                </div>
                <div
                  role="tablist"
                  aria-label="Způsob zobrazení"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    justifyContent: phoneLayout ? "stretch" : "flex-end",
                    alignItems: "center",
                    flexShrink: 0,
                    marginLeft: phoneLayout ? 0 : "auto",
                    width: phoneLayout ? "100%" : undefined,
                  }}
                >
                  {EXPLORER_VISUAL_TABS.map((t) => {
                    const on = explorerVisual === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setExplorerVisual(t.id)}
                        style={{
                          padding: phoneLayout ? "10px 12px" : "8px 14px",
                          minHeight: phoneLayout ? 44 : undefined,
                          flex: phoneLayout ? "1 1 calc(33.33% - 6px)" : undefined,
                          borderRadius: 9999,
                          border: on ? "2px solid transparent" : `2px solid ${GX.border}`,
                          background: on ? GX.brand : "white",
                          color: on ? "white" : GX.body,
                          fontWeight: 600,
                          fontSize: phoneLayout ? 12 : 13,
                          cursor: "pointer",
                          fontFamily: FONT_UI,
                          boxShadow: on ? "0 4px 14px rgba(77, 73, 243, 0.25)" : "none",
                          transition: "all 0.2s",
                          whiteSpace: phoneLayout ? undefined : "nowrap",
                          textAlign: "center" as const,
                          touchAction: "manipulation",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeModule === "compare" || activeModule === "equivalent" ? (
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: phoneLayout ? "column" : "row",
                  flexWrap: "wrap",
                  alignItems: phoneLayout ? "stretch" : "flex-start",
                  justifyContent: "space-between",
                  gap: phoneLayout ? 8 : 10,
                  padding: "2px 0",
                }}
              >
                <div
                  style={{
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flex: phoneLayout ? "0 0 auto" : "1 1 160px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: GX.ink,
                      fontSize: phoneLayout ? 17 : 19,
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {headerTitle}
                  </div>
                  <div
                    style={{
                      color: GX.body,
                      fontSize: phoneLayout ? 11 : 12,
                      fontWeight: 500,
                      marginTop: 3,
                      lineHeight: 1.35,
                      maxWidth: 360,
                      display: phoneLayout ? "-webkit-box" : undefined,
                      WebkitLineClamp: phoneLayout ? 4 : undefined,
                      WebkitBoxOrient: phoneLayout ? "vertical" : undefined,
                      overflow: phoneLayout ? "hidden" : undefined,
                    }}
                  >
                    {activeModule === "compare"
                      ? "Na kartě je jen zvolený náhled (kruh / pruh / osa); číslo měníš v malém krokování nahoře. Mix = dva různé typy náhodně vlevo a vpravo; další klik Mix znovu losuje."
                      : "Vlevo základní zlomek; uprostřed zvolíš násobek rozšíření (×1 až ×6); vpravo stejná hodnota v rozšířeném zápisu. Náhled jako u porovnávání."}
                  </div>
                </div>
                <div
                  role="toolbar"
                  aria-label="Zobrazení u obou zlomků"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    justifyContent: phoneLayout ? "stretch" : "flex-end",
                    alignItems: "center",
                    flexShrink: 0,
                    marginLeft: phoneLayout ? 0 : "auto",
                    width: phoneLayout ? "100%" : undefined,
                  }}
                >
                  {EXPLORER_VISUAL_TABS.map((t) => {
                    const unified = activeModule === "equivalent" ? equivUnifiedView : compareUnifiedView;
                    const visA = activeModule === "equivalent" ? equivVisA : compareVisA;
                    const on = unified && visA === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          if (activeModule === "equivalent") {
                            setEquivVisA(t.id);
                            setEquivVisB(t.id);
                          } else {
                            setCompareVisA(t.id);
                            setCompareVisB(t.id);
                          }
                        }}
                        style={{
                          padding: phoneLayout ? "10px 12px" : "8px 14px",
                          minHeight: phoneLayout ? 44 : undefined,
                          flex: phoneLayout ? "1 1 calc(33.33% - 6px)" : undefined,
                          borderRadius: 9999,
                          border: on ? "2px solid transparent" : `2px solid ${GX.border}`,
                          background: on ? GX.brand : "white",
                          color: on ? "white" : GX.body,
                          fontWeight: 600,
                          fontSize: phoneLayout ? 12 : 13,
                          cursor: "pointer",
                          fontFamily: FONT_UI,
                          boxShadow: on ? "0 4px 14px rgba(77, 73, 243, 0.25)" : "none",
                          transition: "all 0.2s",
                          whiteSpace: phoneLayout ? undefined : "nowrap",
                          textAlign: "center" as const,
                          touchAction: "manipulation",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-label="Mix: náhodně dva různé typy zobrazení vlevo a vpravo"
                    onClick={() => {
                      const { a, b } = randomDistinctComparePair();
                      if (activeModule === "equivalent") {
                        setEquivVisA(a);
                        setEquivVisB(b);
                      } else {
                        setCompareVisA(a);
                        setCompareVisB(b);
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: phoneLayout ? "10px 14px" : "8px 14px",
                      minHeight: phoneLayout ? 44 : undefined,
                      flex: phoneLayout ? "1 1 100%" : undefined,
                      justifyContent: "center",
                      borderRadius: 9999,
                      border:
                        (activeModule === "equivalent" ? equivUnifiedView : compareUnifiedView)
                          ? `2px dashed ${GX.border}`
                          : `2px dashed ${GX.brand}`,
                      background:
                        (activeModule === "equivalent" ? equivUnifiedView : compareUnifiedView)
                          ? "white"
                          : "rgba(77, 73, 243, 0.08)",
                      color: GX.body,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: FONT_UI,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <RefreshCw size={16} strokeWidth={2} aria-hidden />
                    Mix
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2px 0",
                  }}
                >
                  <div style={{ color: GX.ink, fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{headerTitle}</div>
                </div>
                <div style={{ width: 100, flexShrink: 0 }} aria-hidden />
              </>
            )}
          </div>
        </header>
      ) : !activeModule ? (
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding:
              "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 8px max(16px, env(safe-area-inset-left))",
            width: "100%",
            animation: "fadeIn 0.5s",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: phoneLayout ? "column" : "row",
              flexWrap: "wrap",
              alignItems: phoneLayout ? "stretch" : "center",
              justifyContent: "space-between",
              gap: phoneLayout ? 12 : 16,
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                color: GX.ink,
                fontSize: layoutNarrow ? 22 : 26,
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                fontFamily: FONT_UI,
              }}
            >
              Zlomkárna
            </h1>
            <div
              role="tablist"
              aria-label="Hlavní sekce"
              style={{ display: "flex", flexWrap: "wrap", gap: 8, width: phoneLayout ? "100%" : undefined }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={homeTab === "learn"}
                onClick={() => navigate("/ucime-se")}
                style={{
                  padding: "12px 18px",
                  minHeight: 44,
                  flex: phoneLayout ? "1 1 auto" : undefined,
                  borderRadius: 9999,
                  border: homeTab === "learn" ? "2px solid transparent" : `2px solid ${GX.border}`,
                  background: homeTab === "learn" ? GX.brand : "white",
                  color: homeTab === "learn" ? "white" : GX.body,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT_UI,
                  boxShadow: homeTab === "learn" ? "0 4px 14px rgba(77, 73, 243, 0.25)" : "none",
                  transition: "all 0.2s",
                  touchAction: "manipulation",
                }}
              >
                Učíme se zlomky
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={homeTab === "compete"}
                onClick={() => navigate("/soutez")}
                style={{
                  padding: "12px 18px",
                  minHeight: 44,
                  flex: phoneLayout ? "1 1 auto" : undefined,
                  borderRadius: 9999,
                  border: homeTab === "compete" ? "2px solid transparent" : `2px solid ${GX.border}`,
                  background: homeTab === "compete" ? GX.brand : "white",
                  color: homeTab === "compete" ? "white" : GX.body,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT_UI,
                  boxShadow: homeTab === "compete" ? "0 4px 14px rgba(77, 73, 243, 0.25)" : "none",
                  transition: "all 0.2s",
                  touchAction: "manipulation",
                }}
              >
                Soutěžíme
              </button>
            </div>
          </div>
          <h2
            style={{
              color: GX.ink,
              fontSize: layoutNarrow ? 28 : 34,
              fontWeight: 800,
              margin: "20px 0 24px",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              fontFamily: FONT_UI,
            }}
          >
            {homeTab === "learn" ? "Učíme se zlomky" : "Soutěžíme"}
          </h2>
        </div>
      ) : null}

      <div
        style={{
          flex: fullBleedModule || wheelFullLayout ? 1 : undefined,
          minHeight: fullBleedModule || wheelFullLayout ? 0 : undefined,
          overflow: fullBleedModule || wheelFullLayout ? "hidden" : undefined,
          display: fullBleedModule || wheelFullLayout ? "flex" : undefined,
          flexDirection: fullBleedModule || wheelFullLayout ? "column" : undefined,
          maxWidth: fullBleedModule || wheelFullLayout ? "none" : 1044,
          width: "100%",
          margin: "0 auto",
          padding: fullBleedModule
            ? 0
            : wheelFullLayout
              ? "12px max(12px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))"
              : activeModule
                ? "24px max(14px, env(safe-area-inset-right)) max(60px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left))"
                : "16px max(12px, env(safe-area-inset-right)) max(52px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))",
        }}
      >
        {!activeModule ? (
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              width: "100%",
              padding:
                "0 max(16px, env(safe-area-inset-right)) max(60px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
              animation: "fadeIn 0.5s",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 270px), 1fr))",
                gap: 20,
              }}
            >
              {(homeTab === "learn" ? learnModules : competeModules).map((mod) => {
                return (
                  <div
                    key={mod.id}
                    onClick={() => navigate(moduleHref(homeTab, mod.id))}
                    onKeyDown={(e) => e.key === "Enter" && navigate(moduleHref(homeTab, mod.id))}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 22,
                      overflow: "hidden",
                      border: `1px solid ${GX.border}`,
                      background: "white",
                      boxShadow: GX.shadow,
                      cursor: "pointer",
                      textAlign: "left" as const,
                      transition: "transform 200ms, box-shadow 200ms",
                      WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = GX.shadowHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = GX.shadow;
                    }}
                  >
                    <div
                      style={{
                        height: 168,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: mod.illustrationBg,
                        flexShrink: 0,
                      }}
                    >
                      <ModuleTileIllustration moduleId={mod.id} width={100} height={100} />
                    </div>
                    <div style={{ padding: "22px 22px 44px", position: "relative", flex: 1 }}>
                      <div style={{ color: GX.ink, fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: FONT_UI }}>
                        {mod.label}
                      </div>
                      <p
                        style={{
                          color: GX.body,
                          fontSize: 14,
                          lineHeight: 1.5,
                          fontWeight: 400,
                          margin: 0,
                          paddingRight: 8,
                          maxWidth: "32em",
                        }}
                      >
                        {mod.desc}
                      </p>
                      <ArrowRight
                        size={22}
                        strokeWidth={2}
                        aria-hidden
                        style={{ position: "absolute", bottom: 20, right: 20, color: GX.brand, opacity: 0.85 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={
              fullBleedModule
                ? {
                    animation: "fadeIn 0.4s",
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }
                : activeModule === "wheel"
                  ? {
                      animation: "fadeIn 0.4s",
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      maxWidth: "100%",
                    }
                  : { animation: "fadeIn 0.4s", maxWidth: 800, margin: "0 auto" }
            }
          >
            {activeModule === "explorer" && (
              <ModuleExplorer visual={explorerVisual} onVisualChange={setExplorerVisual} />
            )}
            {activeModule === "compare" && (
              <ModuleCompare visualA={compareVisA} visualB={compareVisB} />
            )}
            {activeModule === "equivalent" && (
              <ModuleEquivalent visualA={equivVisA} visualB={equivVisB} />
            )}
            {activeModule === "addition" && <ModuleAddition />}
            {activeModule === "wheel" && <ModuleWheel onBack={() => navigate("/soutez")} />}
            {activeModule === "quiz" && <ModuleQuiz hud={quizHud} setHud={setQuizHud} onBack={() => navigate("/soutez")} />}
            {activeModule === "fractionViz" && <FractionVizGame onBack={() => navigate("/soutez")} />}
          </div>
        )}
      </div>
    </div>
  );
}
