import { ChevronUp, ChevronDown } from "lucide-react";

interface ArrowControlsProps {
  onIncrease: () => void;
  onDecrease: () => void;
}

export function ArrowControls({ onIncrease, onDecrease }: ArrowControlsProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onIncrease}
        className="bg-[#4B4A5F] hover:bg-[#5a5969] rounded-[1.737px] w-4 h-4 flex items-center justify-center transition-colors"
      >
        <ChevronUp className="w-3 h-3 text-[#EFEFEF]" />
      </button>
      <button
        onClick={onDecrease}
        className="bg-[#4B4A5F] hover:bg-[#5a5969] rounded-[1.737px] w-4 h-4 flex items-center justify-center transition-colors"
      >
        <ChevronDown className="w-3 h-3 text-[#EFEFEF]" />
      </button>
    </div>
  );
}