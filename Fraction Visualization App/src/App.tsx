import { useState, useEffect } from "react";
import svgPaths from "./imports/svg-nla8uhchlc";
import numberLineSvgPaths from "./imports/svg-bgtts3104s";

interface Fraction {
  numerator: number;
  denominator: number;
}

export default function App() {
  const [currentFraction, setCurrentFraction] = useState<Fraction>({ numerator: 1, denominator: 4 });
  const [viewMode, setViewMode] = useState<'pie' | 'grid' | 'numberline'>('pie');
  const [subdivisions, setSubdivisions] = useState(1); // Start with 1 whole
  const [selectedSegments, setSelectedSegments] = useState<boolean[]>([false]);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [viewModeIndex, setViewModeIndex] = useState(0); // Index pro cyklické střídání
  
  // Gamifikační prvky
  const [timeLeft, setTimeLeft] = useState(20); // 20 sekund na úkol
  const [lives, setLives] = useState(3); // 3 životy
  const [completedInRound, setCompletedInRound] = useState(0); // Dokončené příklady v aktuálním kole (0-10)
  const [totalCompleted, setTotalCompleted] = useState(0); // Celkový počet dokončených příkladů
  const [gameOver, setGameOver] = useState(false);
  const [isActive, setIsActive] = useState(true); // Zda timer běží

  // Generate random fraction and cycle through view modes
  const generateNewRound = () => {
    if (gameOver) return;
    
    const denominators = [2, 3, 4, 5, 6, 8];
    const denominator = denominators[Math.floor(Math.random() * denominators.length)];
    const numerator = Math.floor(Math.random() * denominator) + 1;
    
    // Cyklické střídání zobrazení: koláč → čokoláda → osa
    const modes: ('pie' | 'grid' | 'numberline')[] = ['pie', 'grid', 'numberline'];
    const currentMode = modes[viewModeIndex];
    const nextIndex = (viewModeIndex + 1) % modes.length;
    
    setCurrentFraction({ numerator, denominator });
    setViewMode(currentMode);
    setViewModeIndex(nextIndex); // Připrav další index
    setSubdivisions(1); // Always start with 1 whole piece
    setSelectedSegments([false]);
    setShowHint(false);
    setShowResult(null);
    setTimeLeft(20); // Resetuj čas
    setIsActive(true); // Spusť timer
    
    // Debug log pro ověření cyklu
    console.log(`New round: ${numerator}/${denominator}, mode: ${currentMode}, next: ${modes[nextIndex]}`);
  };

  // Timer logika
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0 && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !gameOver) {
      // Čas vypršel
      setIsActive(false);
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setGameOver(true);
      } else {
        setShowResult('incorrect');
        setTimeout(() => {
          generateNewRound();
        }, 1500);
      }
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, lives, gameOver]);

  // Restart hry
  const restartGame = () => {
    setGameOver(false);
    setLives(3);
    setCompletedInRound(0);
    setTotalCompleted(0);
    setTimeLeft(20);
    setIsActive(true);
    setViewModeIndex(0);
    generateNewRound();
  };

  // Initialize with random fraction
  useEffect(() => {
    generateNewRound();
  }, []);

  // Update selected segments array when subdivisions change
  useEffect(() => {
    setSelectedSegments(new Array(subdivisions).fill(false));
  }, [subdivisions]);

  const handleSegmentClick = (index: number) => {
    const newSegments = [...selectedSegments];
    newSegments[index] = !newSegments[index];
    setSelectedSegments(newSegments);
  };

  const handleCheck = () => {
    if (gameOver) return;
    
    setIsActive(false); // Zastav timer
    const selectedCount = selectedSegments.filter(Boolean).length;
    
    // Pro správnou reprezentaci zlomku pot������ebujeme alespoň tolik dílků jako je jmenovatel
    if (subdivisions < currentFraction.denominator) {
      // Ukážeme tip a schovame ho po 2 sekundách
      setShowHint(true);
      setIsActive(true); // Spusť timer znovu
      setTimeout(() => setShowHint(false), 2000);
      return;
    }
    
    // Pokud máme více dílků než jmenovatel, musíme proporcionálně přepočítat
    const scaleFactor = subdivisions / currentFraction.denominator;
    const targetCount = currentFraction.numerator * scaleFactor;
    
    if (selectedCount === targetCount) {
      // Správně! Přičti dokončený příklad
      const newCompleted = completedInRound + 1;
      const newTotalCompleted = totalCompleted + 1;
      setCompletedInRound(newCompleted);
      setTotalCompleted(newTotalCompleted);
      
      // Pokud dokončil kolo (10 příkladů), resetuj počítadlo
      if (newCompleted >= 10) {
        setCompletedInRound(0);
      }
      
      setShowResult('correct');
      setTimeout(() => {
        generateNewRound();
      }, 1500);
    } else {
      // Špatně! Ztráta života
      const newLives = lives - 1;
      setLives(newLives);
      setShowResult('incorrect');
      
      if (newLives <= 0) {
        setGameOver(true);
      } else {
        setTimeout(() => {
          generateNewRound();
        }, 1500);
      }
    }
  };

  const handleIncreaseSubdivisions = () => {
    if (subdivisions < 20) {
      setSubdivisions(subdivisions + 1);
    }
  };

  const handleDecreaseSubdivisions = () => {
    if (subdivisions > 1) {
      setSubdivisions(subdivisions - 1);
    }
  };

  // Mobilní detekce
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || 
                            ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Game Over obrazovka
  if (gameOver) {
    return (
      <div className="min-h-screen bg-[#ffeae3] flex items-center justify-center p-4">
        <div className={`bg-white rounded-xl text-center shadow-lg ${
          isMobile ? 'p-6 w-full max-w-sm' : 'p-8'
        }`}>
          <div className={`mb-4 ${isMobile ? 'text-5xl' : 'text-6xl'}`}>😵</div>
          <h1 className={`mb-4 text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Konec hry!</h1>
          <p className={`mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            Dokončil jsi: <strong>{totalCompleted}</strong> příkladů
          </p>
          <p className={`text-gray-600 mb-6 ${isMobile ? 'text-sm' : 'text-sm'}`}>
            Příště to určitě zvládneš lépe!
          </p>
          <button 
            onClick={restartGame}
            className={`bg-[#16ffbc] hover:bg-[#14e6a8] text-[#05553e] rounded-lg transition-colors ${
              isMobile ? 'px-8 py-4 text-lg w-full' : 'px-6 py-3'
            }`}
          >
            Hrát znovu
          </button>
        </div>
      </div>
    );
  }

  // Mobilní verze
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#ffeae3] flex flex-col p-4">
        {/* Mobilní gamifikace - větší a nahoře */}
        <div className="flex items-center justify-between bg-white/80 rounded-xl p-3 mb-4 backdrop-blur-sm">
          {/* Životy - větší srdíčka */}
          <div className="flex items-center gap-1">
            {Array.from({length: 3}).map((_, i) => (
              <span 
                key={i} 
                className={`text-lg ${
                  i < lives ? 'text-[#ff6b6b]' : 'text-[#c0c0c0]'
                }`}
              >
                ♥
              </span>
            ))}
          </div>

          {/* Timer - větší loading bar */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${(timeLeft / 20) * 100}%`,
                  background: timeLeft > 5 ? '#25234f' : timeLeft > 2 ? '#f0ad4e' : '#d9534f'
                }}
              />
            </div>
            <span className="text-sm font-medium text-[#25234f] min-w-[24px]">
              {timeLeft}s
            </span>
          </div>

          {/* Pokrok v kole */}
          <div className="bg-[#25234f] text-white px-2 py-1 rounded-full">
            <span className="text-sm font-medium">
              {completedInRound}/10
            </span>
          </div>
        </div>

        {/* Hlavní obsah */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Title */}
          <h1 className="text-2xl font-medium text-black mb-6 text-center">
            Zaznamenej:
          </h1>

          {/* Zlomek a rovnítko vedle sebe */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Zlomek */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-medium mb-2">{currentFraction.numerator}</div>
                <div className="w-16 h-0.5 bg-black mx-auto mb-2"></div>
                <div className="text-4xl font-medium">{currentFraction.denominator}</div>
              </div>
            </div>

            {/* Rovnítko */}
            <div className="text-3xl font-medium text-black">=</div>
          </div>

          {/* Vizualizace s dedikovanými prostory */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg w-full max-w-sm">
            {/* Dedikovaný prostor pro mobilní verzi */}
            <div className="flex flex-col">
              {/* Vizualizační oblast - větší výška 280px */}
              <div className="h-[280px] flex items-center justify-center">
                {viewMode === 'pie' && (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <PieChartVisualization 
                      subdivisions={subdivisions}
                      selectedSegments={selectedSegments}
                      onSegmentClick={handleSegmentClick}
                    />
                  </div>
                )}
                
                {viewMode === 'grid' && (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <GridVisualization 
                      subdivisions={subdivisions}
                      selectedSegments={selectedSegments}
                      onSegmentClick={handleSegmentClick}
                    />
                  </div>
                )}

                {viewMode === 'numberline' && (
                  <div className="w-full h-64 flex items-center justify-center px-2">
                    <NumberLineVisualization 
                      subdivisions={subdivisions}
                      selectedSegments={selectedSegments}
                      onSegmentClick={handleSegmentClick}
                    />
                  </div>
                )}
              </div>

              {/* Mobilní ovládání - větší tlačítka 64px */}
              <div className="h-20 flex items-center justify-center gap-4 mt-4">
                <button
                  className="bg-[#4b4a5f] hover:bg-[#5a5969] text-white rounded-full w-16 h-16 flex items-center justify-center transition-colors"
                  onClick={handleDecreaseSubdivisions}
                >
                  <span className="text-2xl">−</span>
                </button>
                
                <button
                  className="bg-[#4b4a5f] hover:bg-[#5a5969] text-white rounded-full w-16 h-16 flex items-center justify-center transition-colors"
                  onClick={handleIncreaseSubdivisions}
                >
                  <span className="text-2xl">+</span>
                </button>

                {/* Kulaté kontrolní tlačítko na mobilech */}
                <button
                  className="bg-[#16ffbc] hover:bg-[#14e6a8] text-[#05553e] rounded-full w-16 h-16 flex items-center justify-center transition-colors shadow-lg ml-2"
                  onClick={handleCheck}
                >
                  <span className="text-2xl">✓</span>
                </button>
              </div>
            </div>
          </div>



          {/* Popup modály pro feedback - mobilní verze */}
          {showHint && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-amber-100 border-4 border-amber-300 rounded-2xl px-6 py-6 text-center max-w-sm mx-auto shadow-2xl animate-in fade-in duration-300">
                <p className="text-amber-800 text-lg font-medium">
                  Potřebuješ víc dílků!<br />Použij tlačítko +
                </p>
              </div>
            </div>
          )}

          {showResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`rounded-2xl px-6 py-6 text-center max-w-sm mx-auto shadow-2xl border-4 animate-in fade-in zoom-in duration-300 ${
                showResult === 'correct' 
                  ? 'bg-green-100 border-green-400 text-green-800' 
                  : 'bg-red-100 border-red-400 text-red-800'
              }`}>
                <p className="text-lg font-medium">
                  {showResult === 'correct' ? 'Skvělé! Správně!' : 'Zkus to znovu!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop verze - fullscreen
  return (
    <div className="min-h-screen bg-[#ffeae3] flex flex-col p-8">
      {/* Desktop gamifikace - větší a výraznější */}
      <div className="flex items-center justify-between bg-white/90 rounded-2xl p-4 mb-8 backdrop-blur-sm max-w-6xl mx-auto w-full bg-[rgba(255,255,255,0)]">
        {/* Životy - větší srdíčka */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-gray-700 mr-3">Životy:</span>
          {Array.from({length: 3}).map((_, i) => (
            <span 
              key={i} 
              className={`text-2xl ${
                i < lives ? 'text-[#ff6b6b]' : 'text-[#c0c0c0]'
              }`}
            >
              ♥
            </span>
          ))}
        </div>

        {/* Timer - větší loading bar */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-gray-700">Čas:</span>
          <div className="w-32 h-3 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(timeLeft / 20) * 100}%`,
                background: timeLeft > 5 ? '#25234f' : timeLeft > 2 ? '#f0ad4e' : '#d9534f'
              }}
            />
          </div>
          <span className="text-lg font-medium text-[#25234f] min-w-[32px]">
            {timeLeft}s
          </span>
        </div>

        {/* Pokrok v kole */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-gray-700">Pokrok:</span>
          <div className="bg-[#25234f] text-white px-4 py-2 rounded-full">
            <span className="text-lg font-medium">
              {completedInRound}/10
            </span>
          </div>
        </div>
      </div>

      {/* Hlavní obsah */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Title */}
          <h1 className="text-6xl font-medium text-black mb-12 text-center">
            Zaznamenej:
          </h1>

          <div className="flex items-center justify-center gap-20">
            {/* Zlomek */}
            <div className="bg-white rounded-3xl p-16 shadow-lg">
              <div className="text-center">
                <div className="text-9xl font-medium mb-8">{currentFraction.numerator}</div>
                <div className="w-40 h-2 bg-black mx-auto mb-8"></div>
                <div className="text-9xl font-medium">{currentFraction.denominator}</div>
              </div>
            </div>

            {/* Rovnítko */}
            <div className="text-8xl font-medium text-black">=</div>

            {/* Vizualizace */}
            <div className="bg-white rounded-3xl p-16 shadow-lg w-[600px] h-[500px]">
              {/* Dedikovaný prostor - pevné výšky */}
              <div className="h-full flex flex-col">
                {/* Vizualizační oblast - pevná výška 340px */}
                <div className="h-[340px] flex items-center justify-center w-full">
                  {viewMode === 'pie' && (
                    <div className="w-80 h-80 flex items-center justify-center">
                      <PieChartVisualization 
                        subdivisions={subdivisions}
                        selectedSegments={selectedSegments}
                        onSegmentClick={handleSegmentClick}
                      />
                    </div>
                  )}
                  
                  {viewMode === 'grid' && (
                    <div className="w-80 h-80 flex items-center justify-center">
                      <GridVisualization 
                        subdivisions={subdivisions}
                        selectedSegments={selectedSegments}
                        onSegmentClick={handleSegmentClick}
                      />
                    </div>
                  )}

                  {viewMode === 'numberline' && (
                    <div className="w-full h-80 flex items-center justify-center px-8">
                      <NumberLineVisualization 
                        subdivisions={subdivisions}
                        selectedSegments={selectedSegments}
                        onSegmentClick={handleSegmentClick}
                      />
                    </div>
                  )}
                </div>

                {/* Tlačítková oblast - pevná výška 128px (80px tlačítka + 48px mezery) */}
                <div className="h-[128px] flex items-center justify-center gap-8 mt-auto">
                  <button
                    className="bg-[#4b4a5f] hover:bg-[#5a5969] text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors"
                    onClick={handleDecreaseSubdivisions}
                  >
                    <span className="text-3xl">−</span>
                  </button>
                  
                  <button
                    className="bg-[#4b4a5f] hover:bg-[#5a5969] text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors"
                    onClick={handleIncreaseSubdivisions}
                  >
                    <span className="text-3xl">+</span>
                  </button>

                  {/* Kulaté kontrolní tlačítko */}
                  <button
                    className="bg-[#16ffbc] hover:bg-[#14e6a8] text-[#05553e] rounded-full w-20 h-20 flex items-center justify-center transition-colors shadow-lg"
                    onClick={handleCheck}
                  >
                    <span className="text-3xl">✓</span>
                  </button>
                </div>
              </div>
            </div>
          </div>



          {/* Popup modály pro feedback - desktop verze */}
          {showHint && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
              <div className="bg-amber-100 border-4 border-amber-300 rounded-3xl px-12 py-10 text-center max-w-2xl mx-auto shadow-2xl animate-in fade-in duration-300">
                <p className="text-amber-800 text-3xl font-medium">
                  Potřebuješ víc dílků!<br />Použij tlačítko +
                </p>
              </div>
            </div>
          )}

          {showResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
              <div className={`rounded-3xl px-12 py-10 text-center max-w-2xl mx-auto shadow-2xl border-4 animate-in fade-in zoom-in duration-300 ${
                showResult === 'correct' 
                  ? 'bg-green-100 border-green-400 text-green-800' 
                  : 'bg-red-100 border-red-400 text-red-800'
              }`}>
                <p className="text-3xl font-medium">
                  {showResult === 'correct' ? 'Skvělé! Správně!' : 'Zkus to znovu!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PieChartVisualization({ subdivisions, selectedSegments, onSegmentClick }: {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
}) {
  const isMobile = window.innerWidth <= 768;
  const radius = isMobile ? 80 : 150; // Ještě větší na mobilu
  const centerX = isMobile ? 90 : 160;
  const centerY = isMobile ? 90 : 160;

  // Pro celý kruh (subdivisions = 1) použijeme jiný přístup
  if (subdivisions === 1) {
    return (
      <svg className="block size-full cursor-pointer" fill="none" preserveAspectRatio="none" viewBox={`0 0 ${isMobile ? 180 : 320} ${isMobile ? 180 : 320}`}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={selectedSegments[0] ? "#25234F" : "#D3D3DC"}
          stroke="white"
          strokeWidth={isMobile ? "4" : "8"}
          onClick={() => onSegmentClick(0)}
          className="cursor-pointer hover:opacity-80 active:opacity-60"
          style={{ touchAction: 'manipulation' }}
        />
      </svg>
    );
  }

  const createPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", centerX, centerY,
      "L", x1, y1,
      "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
      "Z"
    ].join(" ");
  };

  return (
    <svg className="block size-full cursor-pointer" fill="none" preserveAspectRatio="none" viewBox={`0 0 ${isMobile ? 180 : 320} ${isMobile ? 180 : 320}`}>
      <g>
        {Array.from({ length: subdivisions }).map((_, index) => {
          const anglePerSegment = 360 / subdivisions;
          const startAngle = index * anglePerSegment - 90; // Start from top
          const endAngle = (index + 1) * anglePerSegment - 90;
          const isSelected = selectedSegments[index];

          return (
            <g key={index}>
              <mask fill="white" id={`path-${index}-inside-${index}_1_44`}>
                <path d={createPath(startAngle, endAngle)} />
              </mask>
              <path
                d={createPath(startAngle, endAngle)}
                fill={isSelected ? "#25234F" : "#D3D3DC"}
                mask={`url(#path-${index}-inside-${index}_1_44)`}
                stroke="white"
                strokeLinejoin="round"
                strokeWidth={isMobile ? "4" : "8"}
                onClick={() => onSegmentClick(index)}
                className="cursor-pointer hover:opacity-80 active:opacity-60"
                style={{ touchAction: 'manipulation' }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function GridVisualization({ subdivisions, selectedSegments, onSegmentClick }: {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
}) {
  // Dynamická velikost čtverečku - mobilní a desktop optimalizace
  const getSquareSize = (subdivisions: number) => {
    const isMobile = window.innerWidth <= 768;
    
    if (subdivisions === 1) {
      return isMobile ? 180 : 300; // Ještě větší na mobilu
    }
    if (subdivisions <= 4) return isMobile ? 90 : 150; // Větší na mobilu
    if (subdivisions <= 9) return isMobile ? 64 : 100; // Větší na mobilu
    if (subdivisions <= 16) return isMobile ? 50 : 75; // Větší touch target
    return isMobile ? 42 : 50; // Větší na mobilu
  };

  const squareSize = getSquareSize(subdivisions);
  const isMobile = window.innerWidth <= 768;
  const gap = subdivisions === 1 ? 0 : (isMobile ? 6 : 6); // Větší mezery i na mobilu

  // Pro jeden čtvereček - velký jako kolečko
  if (subdivisions === 1) {
    return (
      <div
        className={`
          cursor-pointer transition-all hover:opacity-80 active:opacity-60 border-white
          ${selectedSegments[0] ? 'bg-[#25234F]' : 'bg-[#D3D3DC]'}
        `}
        style={{ 
          width: `${squareSize}px`, 
          height: `${squareSize}px`,
          touchAction: 'manipulation',
          borderRadius: isMobile ? '8px' : '12px',
          borderWidth: isMobile ? '4px' : '6px'
        }}
        onClick={() => onSegmentClick(0)}
      />
    );
  }

  // Pro více čtverečků - přidáváme je vedle sebe/pod sebe
  const getGridLayout = (total: number) => {
    const sqrt = Math.sqrt(total);
    let cols = Math.ceil(sqrt);
    let rows = Math.ceil(total / cols);
    
    // Preferujeme širší layout
    if (cols > 6) {
      cols = 6;
      rows = Math.ceil(total / cols);
    }
    
    return { rows, cols };
  };

  const { rows, cols } = getGridLayout(subdivisions);

  return (
    <div 
      className={`grid gap-[${gap}px]`}
      style={{ 
        gridTemplateColumns: `repeat(${cols}, ${squareSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${squareSize}px)`,
        gap: `${gap}px`
      }}
    >
      {Array.from({ length: subdivisions }).map((_, index) => (
        <div
          key={index}
          className={`
            cursor-pointer transition-all hover:opacity-80 active:opacity-60 border-white
            ${selectedSegments[index] ? 'bg-[#25234F]' : 'bg-[#D3D3DC]'}
          `}
          style={{ 
            width: `${squareSize}px`, 
            height: `${squareSize}px`,
            touchAction: 'manipulation',
            borderRadius: isMobile ? '6px' : '8px',
            borderWidth: isMobile ? '3px' : '4px'
          }}
          onClick={() => onSegmentClick(index)}
        />
      ))}
    </div>
  );
}

function NumberLineVisualization({ subdivisions, selectedSegments, onSegmentClick }: {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
}) {
  // Mobilní a desktop optimalizace
  const isMobile = window.innerWidth <= 768;
  const itemHeight = isMobile ? 70 : 80; // Ještě větší na mobilu pro touch
  
  // Pro subdivisions = 1 zobrazíme jeden velký obdélník roztažený na celou šířku
  if (subdivisions === 1) {
    return (
      <div
        className={`
          w-full cursor-pointer transition-all hover:opacity-80 active:opacity-60 border-white
          ${selectedSegments[0] ? 'bg-[#25234f]' : 'bg-[rgba(37,35,79,0.15)]'}
        `}
        style={{ 
          height: `${itemHeight}px`,
          touchAction: 'manipulation',
          borderRadius: isMobile ? '8px' : '3px',
          borderWidth: isMobile ? '4px' : '2px'
        }}
        onClick={() => onSegmentClick(0)}
      />
    );
  }

  // Pro více subdivisions rozdělíme obdélník na části - celá šířka
  return (
    <div 
      className="w-full flex border-white overflow-hidden"
      style={{
        borderWidth: isMobile ? '4px' : '2px',
        borderRadius: isMobile ? '8px' : '3px'
      }}
    >
      {Array.from({ length: subdivisions }).map((_, index) => (
        <div
          key={index}
          className={`
            flex-1 cursor-pointer transition-all hover:opacity-80 active:opacity-60
            ${selectedSegments[index] ? 'bg-[#25234f]' : 'bg-[rgba(37,35,79,0.15)]'}
          `}
          style={{ 
            height: `${itemHeight}px`,
            touchAction: 'manipulation',
            borderRight: index !== subdivisions - 1 ? `${isMobile ? '4px' : '2px'} solid white` : 'none'
          }}
          onClick={() => onSegmentClick(index)}
        />
      ))}
    </div>
  );
}