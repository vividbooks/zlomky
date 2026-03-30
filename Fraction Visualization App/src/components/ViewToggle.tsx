import { Button } from "./ui/button";

interface ViewToggleProps {
  viewMode: 'pie' | 'grid';
  onViewChange: (mode: 'pie' | 'grid') => void;
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === 'pie' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('pie')}
      >
        🥧 Koláč
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
      >
        🍫 Čokoláda
      </Button>
    </div>
  );
}