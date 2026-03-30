interface FractionDisplayProps {
  fraction: { numerator: number; denominator: number };
}

export function FractionDisplay({ fraction }: FractionDisplayProps) {
  return (
    <div className="bg-white rounded-[10.659px] p-4 min-w-[64px] text-center border">
      <div className="text-xl leading-tight">
        <div className="mb-2">{fraction.numerator}</div>
        <div className="border-t border-black w-8 mx-auto mb-2"></div>
        <div>{fraction.denominator}</div>
      </div>
    </div>
  );
}