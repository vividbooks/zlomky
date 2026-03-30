interface GridVisualizerProps {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
}

export function GridVisualizer({ subdivisions, selectedSegments, onSegmentClick }: GridVisualizerProps) {
  // Calculate optimal grid layout
  const getGridLayout = (total: number) => {
    // Try to make a roughly square grid
    const sqrt = Math.sqrt(total);
    let cols = Math.ceil(sqrt);
    let rows = Math.ceil(total / cols);
    
    // Prefer wider than taller for better visual
    if (cols * (rows - 1) >= total) {
      rows--;
    }
    
    return { rows, cols };
  };

  const { rows, cols } = getGridLayout(subdivisions);
  const cellSize = 22;
  const gap = 2;

  return (
    <div className="flex justify-center">
      <div 
        className="grid gap-[2px]"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`
        }}
      >
        {Array.from({ length: subdivisions }).map((_, index) => (
          <div
            key={index}
            className={`
              rounded-[2.415px] cursor-pointer transition-all hover:opacity-80 border border-white/20
              ${selectedSegments[index] ? 'bg-[#25234F]' : 'bg-[rgba(37,35,79,0.2)]'}
            `}
            style={{ 
              width: `${cellSize}px`, 
              height: `${cellSize}px` 
            }}
            onClick={() => onSegmentClick(index)}
          />
        ))}
      </div>
    </div>
  );
}