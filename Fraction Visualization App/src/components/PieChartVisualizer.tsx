interface PieChartVisualizerProps {
  subdivisions: number;
  selectedSegments: boolean[];
  onSegmentClick: (index: number) => void;
}

export function PieChartVisualizer({ subdivisions, selectedSegments, onSegmentClick }: PieChartVisualizerProps) {
  const radius = 30;
  const centerX = 35;
  const centerY = 35;

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
    <div className="flex justify-center">
      <svg width="70" height="70" className="cursor-pointer">
        {Array.from({ length: subdivisions }).map((_, index) => {
          const anglePerSegment = 360 / subdivisions;
          const startAngle = index * anglePerSegment - 90; // Start from top
          const endAngle = (index + 1) * anglePerSegment - 90;
          const isSelected = selectedSegments[index];

          return (
            <g key={index}>
              <path
                d={createPath(startAngle, endAngle)}
                fill={isSelected ? "#25234F" : "#D3D3DC"}
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
                onClick={() => onSegmentClick(index)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}