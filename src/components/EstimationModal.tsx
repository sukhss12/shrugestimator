import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TShirtSize } from '@/types';
import { SIZE_POINTS, SIZE_LABELS } from '@/lib/constants';

const SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'NA'];
const DIMENSIONS = [
  { key: 'fe', label: 'Frontend' },
  { key: 'be', label: 'Backend' },
  { key: 'db', label: 'Database' },
  { key: 'int', label: 'Integration' },
] as const;

type DimensionKey = typeof DIMENSIONS[number]['key'];

interface Estimates {
  fe: TShirtSize;
  be: TShirtSize;
  db: TShirtSize;
  int: TShirtSize;
}

interface EstimationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  initialEstimates?: Partial<Estimates>;
  onSave: (name: string, estimates: Estimates) => void;
}

export const EstimationModal = ({
  open,
  onOpenChange,
  featureName: initialName,
  initialEstimates,
  onSave,
}: EstimationModalProps) => {
  const [name, setName] = useState(initialName);
  const [estimates, setEstimates] = useState<Estimates>({
    fe: initialEstimates?.fe || 'NA',
    be: initialEstimates?.be || 'NA',
    db: initialEstimates?.db || 'NA',
    int: initialEstimates?.int || 'NA',
  });

  useEffect(() => {
    setName(initialName);
    setEstimates({
      fe: initialEstimates?.fe || 'NA',
      be: initialEstimates?.be || 'NA',
      db: initialEstimates?.db || 'NA',
      int: initialEstimates?.int || 'NA',
    });
  }, [initialName, initialEstimates, open]);

  const handleSizeSelect = (dimension: DimensionKey, size: TShirtSize) => {
    setEstimates(prev => ({ ...prev, [dimension]: size }));
  };

  const totalPoints = Object.values(estimates).reduce(
    (sum, size) => sum + SIZE_POINTS[size],
    0
  );

  const handleSave = () => {
    onSave(name, estimates);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-border pr-12">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Feature name"
            className="border-none shadow-none bg-transparent text-lg font-semibold placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0 h-auto"
          />
          <DialogTitle className="sr-only">Estimate Feature</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 space-y-4">
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {label}
              </label>
              <div className="flex gap-1.5">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(key, size)}
                    className={`
                      flex-1 py-1.5 px-2 text-xs font-medium rounded-full
                      transition-colors duration-150
                      ${estimates[key] === size
                        ? 'bg-foreground text-background'
                        : 'bg-background border border-border text-muted-foreground hover:border-foreground/30'
                      }
                    `}
                  >
                    {size === 'NA' ? 'N/A' : size}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Size Reference */}
          <p className="text-xs text-muted-foreground pt-2">
            {Object.entries(SIZE_LABELS)
              .filter(([key]) => key !== 'NA')
              .map(([key, label]) => `${key} = ${label}`)
              .join(' · ')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <span className="text-sm font-medium">
            Total: <span className="text-primary">{totalPoints} points</span>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
