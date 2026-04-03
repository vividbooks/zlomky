/**
 * Hra „Fraction Visualization App“ — přepsáno do inline stylů pro Zlomkárnu (bez Tailwindu).
 */
import { useState, useEffect, useCallback, useId } from "react";
import { ArrowLeft } from "lucide-react";
import { useZlomkPhoneLayout, ZLOMK_NARROW_BREAKPOINT_PX } from "./zlomkarnaRoutes";

const FONT_UI = "'Fenomen Sans', ui-sans-serif, system-ui, sans-serif";

/** Stejné tokeny jako horní lišta v Zlomkarna (GX) — jednotný vzhled s aplikací */
const GX = {
  ink: "#09056f",
  body: "#4e5871",
  brand: "#4d49f3",
  border: "#e5e7eb",
  page: "#ffffff",
  shadowBar: "0 1px 4px 0 rgba(0,0,0,0.06)",
} as const;

const PANEL_BG = "#f3f4f6";
const PANEL_BORDER = "#e9ecef";

function useNarrowTwoCol(maxWidthPx: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxWidthPx]);
  return narrow;
}

type Fraction = { numerator: number; denominator: number };
type ViewMode = "pie" | "numberline";

/** Kompaktní typografie / koláč — jen podle šířky okna (dotyk na desktopu nezmenšuje UI). */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isMobile;
}

function PieChartViz({
  subdivisions,
  selectedSegments,
  onSegmentClick,
  isMobile,
  maskPrefix,
}: {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
  isMobile: boolean;
  maskPrefix: string;
}) {
  const radius = isMobile ? 80 : 120;
  const centerX = isMobile ? 90 : 140;
  const centerY = isMobile ? 90 : 140;
  const vb = isMobile ? 180 : 280;

  const createPath = (startAngle: number, endAngle: number) => {
    const sr = (startAngle * Math.PI) / 180;
    const er = (endAngle * Math.PI) / 180;
    const x1 = centerX + radius * Math.cos(sr);
    const y1 = centerY + radius * Math.sin(sr);
    const x2 = centerX + radius * Math.cos(er);
    const y2 = centerY + radius * Math.sin(er);
    const large = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", centerX, centerY, "L", x1, y1, "A", radius, radius, 0, large, 1, x2, y2, "Z"].join(" ");
  };

  if (subdivisions === 1) {
    return (
      <svg width={vb} height={vb} viewBox={`0 0 ${vb} ${vb}`} style={{ display: "block", cursor: "pointer" }}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={selectedSegments[0] ? "#25234f" : "#d3d3dc"}
          stroke="white"
          strokeWidth={isMobile ? 4 : 6}
          onClick={() => onSegmentClick(0)}
          style={{ touchAction: "manipulation" }}
        />
      </svg>
    );
  }

  return (
    <svg width={vb} height={vb} viewBox={`0 0 ${vb} ${vb}`} style={{ display: "block", cursor: "pointer" }}>
      <g>
        {Array.from({ length: subdivisions }).map((_, index) => {
          const anglePer = 360 / subdivisions;
          const start = index * anglePer - 90;
          const end = (index + 1) * anglePer - 90;
          const d = createPath(start, end);
          const mid = `${maskPrefix}-p-${index}`;
          return (
            <g key={index}>
              <mask id={mid} fill="white">
                <path d={d} />
              </mask>
              <path
                d={d}
                fill={selectedSegments[index] ? "#25234f" : "#d3d3dc"}
                mask={`url(#${mid})`}
                stroke="white"
                strokeLinejoin="round"
                strokeWidth={isMobile ? 4 : 6}
                onClick={() => onSegmentClick(index)}
                style={{ touchAction: "manipulation", cursor: "pointer" }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function NumberLineViz({
  subdivisions,
  selectedSegments,
  onSegmentClick,
  isMobile,
}: {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
  isMobile: boolean;
}) {
  const h = isMobile ? 64 : 72;

  if (subdivisions === 1) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          height: h,
          background: selectedSegments[0] ? "#25234f" : "rgba(37,35,79,0.15)",
          borderRadius: isMobile ? 8 : 6,
          border: `${isMobile ? 4 : 3}px solid white`,
          cursor: "pointer",
          touchAction: "manipulation",
        }}
        role="button"
        tabIndex={0}
        onClick={() => onSegmentClick(0)}
        onKeyDown={(e) => e.key === "Enter" && onSegmentClick(0)}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        display: "flex",
        borderRadius: isMobile ? 8 : 6,
        border: `${isMobile ? 4 : 3}px solid white`,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: subdivisions }).map((_, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            height: h,
            background: selectedSegments[index] ? "#25234f" : "rgba(37,35,79,0.15)",
            borderRight: index !== subdivisions - 1 ? `${isMobile ? 3 : 2}px solid white` : "none",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
          role="button"
          tabIndex={0}
          onClick={() => onSegmentClick(index)}
          onKeyDown={(e) => e.key === "Enter" && onSegmentClick(index)}
        />
      ))}
    </div>
  );
}

export function FractionVizGame({ onBack }: { onBack: () => void }) {
  const uid = useId().replace(/:/g, "");
  const isMobile = useIsMobile();
  const narrow = useNarrowTwoCol(ZLOMK_NARROW_BREAKPOINT_PX);
  const phone = useZlomkPhoneLayout();
  const padStack = phone ? "16px 14px 22px" : "24px 24px 32px";

  const [currentFraction, setCurrentFraction] = useState<Fraction>({ numerator: 1, denominator: 4 });
  const [viewMode, setViewMode] = useState<ViewMode>("pie");
  const [subdivisions, setSubdivisions] = useState(1);
  const [selectedSegments, setSelectedSegments] = useState<boolean[]>([false]);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [viewModeIndex, setViewModeIndex] = useState(0);

  const reallyGenerate = useCallback(() => {
    const denominators = [2, 3, 4, 5, 6, 8];
    const denominator = denominators[Math.floor(Math.random() * denominators.length)]!;
    const numerator = Math.floor(Math.random() * denominator) + 1;
    const modes: ViewMode[] = ["pie", "numberline"];
    setViewModeIndex((prev) => {
      const currentMode = modes[prev % 2]!;
      setViewMode(currentMode);
      return (prev + 1) % 2;
    });
    setCurrentFraction({ numerator, denominator });
    setSubdivisions(1);
    setSelectedSegments([false]);
    setShowHint(false);
    setShowResult(null);
  }, []);

  useEffect(() => {
    reallyGenerate();
  }, [reallyGenerate]);

  useEffect(() => {
    setSelectedSegments(new Array(subdivisions).fill(false));
  }, [subdivisions]);

  const handleSegmentClick = (index: number) => {
    const next = [...selectedSegments];
    next[index] = !next[index];
    setSelectedSegments(next);
  };

  const handleCheck = () => {
    const selectedCount = selectedSegments.filter(Boolean).length;
    const { numerator: n, denominator: d } = currentFraction;

    // n/d = 1: jeden nečleněný díl (celý kruh / celý pruh) je totéž jako vybrat všech n dílků.
    const wholeAsSinglePart = n === d && subdivisions === 1;
    if (subdivisions < d && !wholeAsSinglePart) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
      return;
    }

    const scale = subdivisions / d;
    const target = n * scale;

    if (selectedCount === target) {
      setShowResult("correct");
      setTimeout(() => reallyGenerate(), 1500);
    } else {
      setShowResult("incorrect");
      setTimeout(() => reallyGenerate(), 1500);
    }
  };

  const decSub = () => subdivisions > 1 && setSubdivisions(subdivisions - 1);
  const incSub = () => subdivisions < 20 && setSubdivisions(subdivisions + 1);

  const titleFrac = isMobile ? 42 : 64;
  const titleFracLineW = isMobile ? 68 : 92;
  const titleEquals = isMobile ? 36 : 46;

  const vizCenter = (
    <div style={{ minHeight: isMobile ? 220 : 280, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
      {viewMode === "pie" && (
        <PieChartViz
          subdivisions={subdivisions}
          selectedSegments={selectedSegments}
          onSegmentClick={handleSegmentClick}
          isMobile={isMobile}
          maskPrefix={`fvz-${uid}`}
        />
      )}
      {viewMode === "numberline" && (
        <NumberLineViz subdivisions={subdivisions} selectedSegments={selectedSegments} onSegmentClick={handleSegmentClick} isMobile={isMobile} />
      )}
    </div>
  );

  const backBtn = (
    <button
      type="button"
      onClick={onBack}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        minHeight: phone ? 44 : undefined,
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
        touchAction: "manipulation",
      }}
    >
      <ArrowLeft size={18} strokeWidth={2} />
      Zpět
    </button>
  );

  const leftUx = (
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
        {backBtn}
        <div style={{ color: GX.ink, fontSize: 21, fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.02em", fontFamily: FONT_UI }}>Vizuální zlomky</div>
      </div>
      <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, color: GX.ink, fontFamily: FONT_UI }}>Zaznamenej zlomek</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: isMobile ? 16 : 22,
            border: `1px solid ${GX.border}`,
            boxShadow: GX.shadowBar,
            fontFamily: FONT_UI,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: titleFrac, fontWeight: 700, color: GX.ink }}>{currentFraction.numerator}</div>
            <div style={{ width: titleFracLineW, height: isMobile ? 3 : 4, background: GX.ink, margin: "10px auto" }} />
            <div style={{ fontSize: titleFrac, fontWeight: 700, color: GX.ink }}>{currentFraction.denominator}</div>
          </div>
        </div>
        <span style={{ fontSize: titleEquals, fontWeight: 800, color: GX.ink, fontFamily: FONT_UI }}>=</span>
      </div>
    </div>
  );

  const vizHelpText = (
    <p
      style={{
        margin: 0,
        padding: `${8 + (isMobile ? 8 : 0)}px ${isMobile ? 8 : 16}px 0`,
        fontSize: 14,
        fontWeight: 700,
        color: GX.body,
        lineHeight: 1.4,
        fontFamily: FONT_UI,
        textAlign: "center",
        maxWidth: 440,
        width: "100%",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      Naklikej a označ
    </p>
  );

  const vizActionButtons = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 12 : 16, flexWrap: "wrap", marginTop: 20 }}>
      <button
        type="button"
        onClick={decSub}
        style={{
          width: isMobile ? 52 : 56,
          height: isMobile ? 52 : 56,
          borderRadius: "50%",
          border: "none",
          background: "#4b4a5f",
          color: "white",
          fontSize: 26,
          cursor: "pointer",
        }}
      >
        −
      </button>
      <button
        type="button"
        onClick={incSub}
        style={{
          width: isMobile ? 52 : 56,
          height: isMobile ? 52 : 56,
          borderRadius: "50%",
          border: "none",
          background: "#4b4a5f",
          color: "white",
          fontSize: 26,
          cursor: "pointer",
        }}
      >
        +
      </button>
      <button
        type="button"
        onClick={handleCheck}
        style={{
          width: isMobile ? 52 : 56,
          height: isMobile ? 52 : 56,
          borderRadius: "50%",
          border: "none",
          background: "#16ffbc",
          color: "#05553e",
          fontSize: 22,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(22,255,188,0.45)",
        }}
      >
        ✓
      </button>
    </div>
  );

  const rightPanel = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: narrow ? 240 : 320,
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%" }}>
        {vizCenter}
        {vizActionButtons}
      </div>
      {vizHelpText}
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: narrow ? "flex" : "grid",
        flexDirection: narrow ? "column" : undefined,
        gridTemplateColumns: narrow ? undefined : "1fr 1fr",
        gap: narrow ? 0 : 12,
        padding: narrow ? 0 : "24px 28px 28px",
        background: GX.page,
        fontFamily: FONT_UI,
        overflow: "auto",
        boxSizing: "border-box",
      }}
    >
      {narrow ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: padStack,
              background: PANEL_BG,
              borderBottom: `1px solid ${PANEL_BORDER}`,
              order: 1,
            }}
          >
            {rightPanel}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: padStack,
              background: GX.page,
              order: 2,
              overflow: "auto",
            }}
          >
            {leftUx}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              gridRow: 1,
              gridColumn: 1,
              display: "flex",
              flexDirection: "column",
              padding: "24px 24px 32px",
              background: GX.page,
              borderRadius: 24,
              minWidth: 0,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            {leftUx}
          </div>
          <div
            style={{
              gridRow: 1,
              gridColumn: 2,
              display: "flex",
              flexDirection: "column",
              padding: "40px 44px 40px",
              background: PANEL_BG,
              borderRadius: 24,
              border: `1px solid ${PANEL_BORDER}`,
              minWidth: 0,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            {rightPanel}
          </div>
        </>
      )}

      {showHint && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fef3c7",
              border: "4px solid #f59e0b",
              borderRadius: 16,
              padding: "20px 24px",
              maxWidth: 360,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#92400e" }}>
              Potřebuješ víc dílků!
              <br />
              Použij tlačítko +
            </p>
          </div>
        </div>
      )}

      {showResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: "24px 32px",
              maxWidth: 360,
              textAlign: "center",
              border: "4px solid",
              background: showResult === "correct" ? "#dcfce7" : "#fee2e2",
              borderColor: showResult === "correct" ? "#22c55e" : "#ef4444",
              color: showResult === "correct" ? "#166534" : "#991b1b",
            }}
          >
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              {showResult === "correct" ? "Skvělé! Správně!" : "Zkus to znovu!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
