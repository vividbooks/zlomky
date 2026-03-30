/**
 * Hra „Fraction Visualization App“ — přepsáno do inline stylů pro Zlomkárnu (bez Tailwindu).
 */
import { useState, useEffect, useCallback, useId } from "react";

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

type Fraction = { numerator: number; denominator: number };
type ViewMode = "pie" | "grid" | "numberline";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const q = () => {
      const m = window.innerWidth <= 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(m);
    };
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
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

function GridViz({
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
  const gap = 6;
  const squareSize = (() => {
    if (subdivisions === 1) return isMobile ? 140 : 220;
    if (subdivisions <= 4) return isMobile ? 72 : 110;
    if (subdivisions <= 9) return isMobile ? 52 : 80;
    if (subdivisions <= 16) return isMobile ? 42 : 58;
    return isMobile ? 36 : 48;
  })();

  if (subdivisions === 1) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSegmentClick(0)}
        onKeyDown={(e) => e.key === "Enter" && onSegmentClick(0)}
        style={{
          width: squareSize,
          height: squareSize,
          background: selectedSegments[0] ? "#25234f" : "#d3d3dc",
          borderRadius: isMobile ? 8 : 10,
          border: `${isMobile ? 4 : 6}px solid white`,
          cursor: "pointer",
          touchAction: "manipulation",
        }}
      />
    );
  }

  const sqrt = Math.sqrt(subdivisions);
  let cols = Math.ceil(sqrt);
  if (cols > 6) cols = 6;
  const rows = Math.ceil(subdivisions / cols);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${squareSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${squareSize}px)`,
        gap,
      }}
    >
      {Array.from({ length: subdivisions }).map((_, index) => (
        <div
          key={index}
          role="button"
          tabIndex={0}
          onClick={() => onSegmentClick(index)}
          onKeyDown={(e) => e.key === "Enter" && onSegmentClick(index)}
          style={{
            width: squareSize,
            height: squareSize,
            background: selectedSegments[index] ? "#25234f" : "#d3d3dc",
            borderRadius: isMobile ? 6 : 8,
            border: `${isMobile ? 3 : 4}px solid white`,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        />
      ))}
    </div>
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

export function FractionVizGame() {
  const uid = useId().replace(/:/g, "");
  const isMobile = useIsMobile();

  const [currentFraction, setCurrentFraction] = useState<Fraction>({ numerator: 1, denominator: 4 });
  const [viewMode, setViewMode] = useState<ViewMode>("pie");
  const [subdivisions, setSubdivisions] = useState(1);
  const [selectedSegments, setSelectedSegments] = useState<boolean[]>([false]);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [viewModeIndex, setViewModeIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(20);
  const [lives, setLives] = useState(3);
  const [completedInRound, setCompletedInRound] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const reallyGenerate = useCallback(() => {
    const denominators = [2, 3, 4, 5, 6, 8];
    const denominator = denominators[Math.floor(Math.random() * denominators.length)]!;
    const numerator = Math.floor(Math.random() * denominator) + 1;
    const modes: ViewMode[] = ["pie", "grid", "numberline"];
    setViewModeIndex((prev) => {
      const currentMode = modes[prev % 3]!;
      setViewMode(currentMode);
      return (prev + 1) % 3;
    });
    setCurrentFraction({ numerator, denominator });
    setSubdivisions(1);
    setSelectedSegments([false]);
    setShowHint(false);
    setShowResult(null);
    setTimeLeft(20);
    setIsActive(true);
  }, []);

  useEffect(() => {
    reallyGenerate();
  }, [reallyGenerate]);

  useEffect(() => {
    setSelectedSegments(new Array(subdivisions).fill(false));
  }, [subdivisions]);

  useEffect(() => {
    if (gameOver || !isActive || timeLeft <= 0) return;
    const id = setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setTimeout(() => {
            setLives((lv) => {
              const nl = lv - 1;
              if (nl <= 0) setGameOver(true);
              else {
                setShowResult("incorrect");
                setTimeout(() => reallyGenerate(), 1500);
              }
              return nl;
            });
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [gameOver, isActive, timeLeft, reallyGenerate]);

  const restartGame = () => {
    setGameOver(false);
    setLives(3);
    setCompletedInRound(0);
    setTotalCompleted(0);
    setTimeLeft(20);
    setIsActive(true);
    setViewModeIndex(0);
    reallyGenerate();
  };

  const handleSegmentClick = (index: number) => {
    const next = [...selectedSegments];
    next[index] = !next[index];
    setSelectedSegments(next);
  };

  const handleCheck = () => {
    if (gameOver) return;
    setIsActive(false);
    const selectedCount = selectedSegments.filter(Boolean).length;
    const { numerator: n, denominator: d } = currentFraction;

    if (subdivisions < d) {
      setShowHint(true);
      setIsActive(true);
      setTimeout(() => setShowHint(false), 2000);
      return;
    }

    const scale = subdivisions / d;
    const target = n * scale;

    if (selectedCount === target) {
      setCompletedInRound((c) => {
        const nc = c + 1;
        if (nc >= 10) return 0;
        return nc;
      });
      setTotalCompleted((t) => t + 1);
      setShowResult("correct");
      setTimeout(() => reallyGenerate(), 1500);
    } else {
      setLives((lv) => {
        const nl = lv - 1;
        setShowResult("incorrect");
        if (nl <= 0) setGameOver(true);
        else setTimeout(() => reallyGenerate(), 1500);
        return nl;
      });
    }
  };

  const decSub = () => subdivisions > 1 && setSubdivisions(subdivisions - 1);
  const incSub = () => subdivisions < 20 && setSubdivisions(subdivisions + 1);

  const padSm = isMobile ? 12 : 20;
  const titleFrac = isMobile ? 32 : 48;
  const barW = isMobile ? 96 : 140;

  if (gameOver) {
    return (
      <div
        style={{
          minHeight: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: padSm,
          background: "#ffeae3",
          fontFamily: FONT_UI,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: isMobile ? 24 : 32,
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            maxWidth: 400,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>😵</div>
          <h1 style={{ margin: "0 0 12px", color: "#dc2626", fontSize: isMobile ? 22 : 26 }}>Konec hry!</h1>
          <p style={{ fontSize: 17, marginBottom: 8 }}>
            Dokončil jsi: <strong>{totalCompleted}</strong> příkladů
          </p>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Příště to určitě zvládneš lépe!</p>
          <button
            type="button"
            onClick={restartGame}
            style={{
              background: "#16ffbc",
              color: "#05553e",
              border: "none",
              borderRadius: 12,
              padding: "14px 28px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Hrát znovu
          </button>
        </div>
      </div>
    );
  }

  const scorePill = (
    <div
      style={{
        background: GX.brand,
        color: "white",
        padding: "7px 16px",
        borderRadius: 9999,
        fontWeight: 700,
        fontSize: 13,
        boxShadow: "0 4px 14px rgba(77, 73, 243, 0.22)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {completedInRound}/10
    </div>
  );

  const livesBlock = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: GX.body, letterSpacing: "0.01em" }}>Životy</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            fontSize: isMobile ? 18 : 21,
            lineHeight: 1,
            color: i < lives ? "#FA5252" : GX.border,
            opacity: i < lives ? 1 : 0.85,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );

  const timerBlock = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: isMobile ? "unset" : "1 1 auto",
        justifyContent: isMobile ? "flex-start" : "center",
        minWidth: isMobile ? undefined : 160,
        width: isMobile ? "100%" : undefined,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: GX.body }}>Čas</span>
      <div
        style={{
          flex: 1,
          width: isMobile ? undefined : barW,
          maxWidth: isMobile ? undefined : barW,
          minWidth: 48,
          height: 8,
          background: GX.border,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(timeLeft / 20) * 100}%`,
            borderRadius: 999,
            transition: "width 0.3s ease",
            background: timeLeft > 5 ? GX.brand : timeLeft > 2 ? "#FAB005" : "#FA5252",
          }}
        />
      </div>
      <span style={{ fontWeight: 800, color: GX.ink, minWidth: 32, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{timeLeft}s</span>
    </div>
  );

  const hud = (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        flexWrap: "nowrap",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? 12 : 16,
        background: GX.page,
        borderRadius: 9999,
        padding: isMobile ? "10px 16px" : "11px 22px",
        marginBottom: 16,
        border: `2px solid ${GX.border}`,
        boxShadow: GX.shadowBar,
      }}
    >
      {isMobile ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            {livesBlock}
            {scorePill}
          </div>
          {timerBlock}
        </>
      ) : (
        <>
          {livesBlock}
          {timerBlock}
          {scorePill}
        </>
      )}
    </div>
  );

  const modeLabel =
    viewMode === "pie" ? "Koláč" : viewMode === "grid" ? "Čtverce" : "Číselná osa";

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        padding: padSm,
        background: "#ffeae3",
        fontFamily: FONT_UI,
        overflow: "auto",
      }}
    >
      {hud}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
        <p style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#25234f", textTransform: "uppercase", letterSpacing: 0.6 }}>
          Úkol: označ správný díl — zobrazení „{modeLabel}“
        </p>
        <h2 style={{ margin: "0 0 16px 0", fontSize: isMobile ? 24 : 30, fontWeight: 800, color: "#111" }}>Zaznamenej zlomek</h2>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 16 : 28,
            width: "100%",
            maxWidth: 980,
          }}
        >
          <div style={{ background: "white", borderRadius: isMobile ? 16 : 24, padding: isMobile ? 16 : 24, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: titleFrac, fontWeight: 700, color: "#111" }}>{currentFraction.numerator}</div>
              <div style={{ width: isMobile ? 56 : 80, height: 3, background: "#111", margin: "8px auto" }} />
              <div style={{ fontSize: titleFrac, fontWeight: 700, color: "#111" }}>{currentFraction.denominator}</div>
            </div>
          </div>

          <div style={{ fontSize: isMobile ? 36 : 44, fontWeight: 800, color: "#111" }}>=</div>

          <div
            style={{
              background: "white",
              borderRadius: isMobile ? 16 : 24,
              padding: isMobile ? 16 : 24,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              minWidth: 0,
              width: "100%",
              maxWidth: isMobile ? 400 : 520,
            }}
          >
            <div style={{ minHeight: isMobile ? 220 : 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {viewMode === "pie" && (
                <PieChartViz
                  subdivisions={subdivisions}
                  selectedSegments={selectedSegments}
                  onSegmentClick={handleSegmentClick}
                  isMobile={isMobile}
                  maskPrefix={`fvz-${uid}`}
                />
              )}
              {viewMode === "grid" && (
                <GridViz
                  subdivisions={subdivisions}
                  selectedSegments={selectedSegments}
                  onSegmentClick={handleSegmentClick}
                  isMobile={isMobile}
                />
              )}
              {viewMode === "numberline" && (
                <NumberLineViz
                  subdivisions={subdivisions}
                  selectedSegments={selectedSegments}
                  onSegmentClick={handleSegmentClick}
                  isMobile={isMobile}
                />
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 12 : 16, marginTop: 16, flexWrap: "wrap" }}>
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
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.45 }}>
              Nejprve + přidej stejně velké dílce jako je jmenovatel (nebo násobek). Klikáním je označ.
            </p>
          </div>
        </div>
      </div>

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
