import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TShirtSize } from '@/types';
import { SIZE_DAYS, SIZE_LABELS } from '@/lib/constants';

const SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'NA'];
const DIMENSIONS = [
  { key: 'fe', label: 'Frontend', description: 'UI, components, styling, interactions, responsive behaviour' },
  { key: 'be', label: 'Backend', description: 'Business logic, services, validation, processing' },
  { key: 'db', label: 'Data', description: 'Schema, queries, storage, caching' },
  { key: 'int', label: 'External', description: 'Third-party APIs, integrations' },
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

  const totalDevDays = Object.values(estimates).reduce(
    (sum, size) => sum + SIZE_DAYS[size],
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
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-border pr-12">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Feature name"
            className="text-lg font-semibold placeholder:text-muted-foreground/60"
          />
          <DialogTitle className="sr-only">Estimate Feature</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 space-y-4">
          {DIMENSIONS.map(({ key, label, description }) => (
            <div key={key} className="space-y-1.5">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {label}
                </label>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex gap-1.5">
                {SIZES.map((size) => (
                  <Tooltip key={size}>
                    <TooltipTrigger asChild>
                      <button
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
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <span className="font-medium">{size === 'NA' ? 'N/A' : size}</span>
                      <span className="text-foreground/70"> = {SIZE_LABELS[size]}</span>
                      {size !== 'NA' && (
                        <span className="text-foreground/50"> ({SIZE_DAYS[size]} dev-day{SIZE_DAYS[size] !== 1 ? 's' : ''})</span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}

          {/* Size Legend */}
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Size Guide</p>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {Object.entries(SIZE_LABELS)
                .filter(([key]) => key !== 'NA')
                .map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground/80">{key}</span>
                    <span className="text-foreground/50">{label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <span className="text-sm font-medium">
            Total: <span className="text-primary">{totalDevDays} dev-days</span>
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
