import { useState, useRef, useEffect } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { EstimationModal } from '@/components/EstimationModal';
import { TShirtSize } from '@/types';
import { SIZE_POINTS } from '@/lib/constants';

interface FeatureEstimates {
  fe: TShirtSize;
  be: TShirtSize;
  db: TShirtSize;
  int: TShirtSize;
}

interface Feature {
  id: string;
  name: string;
  estimates?: FeatureEstimates;
  selected: boolean;
}

interface StageColumnProps {
  id: string;
  name: string;
  features: Feature[];
  onNameChange: (name: string) => void;
  onFeaturesChange: (features: Feature[]) => void;
  autoFocus?: boolean;
}

const calculatePoints = (estimates?: FeatureEstimates): number | undefined => {
  if (!estimates) return undefined;
  const total = SIZE_POINTS[estimates.fe] + SIZE_POINTS[estimates.be] + 
                SIZE_POINTS[estimates.db] + SIZE_POINTS[estimates.int];
  return total > 0 ? total : undefined;
};

export const StageColumn = ({ 
  id, 
  name, 
  features, 
  onNameChange, 
  onFeaturesChange,
  autoFocus = false,
}: StageColumnProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleToggleFeature = (featureId: string) => {
    onFeaturesChange(features.map(f => 
      f.id === featureId ? { ...f, selected: !f.selected } : f
    ));
  };

  const handleFeatureClick = (feature: Feature) => {
    setEditingFeature(feature);
    setModalOpen(true);
  };

  const handleSaveEstimates = (featureName: string, estimates: FeatureEstimates) => {
    if (!editingFeature) return;
    onFeaturesChange(features.map(f => 
      f.id === editingFeature.id ? { ...f, name: featureName, estimates } : f
    ));
    setEditingFeature(null);
  };

  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: `${id}-${Date.now()}`,
      name: 'New feature',
      estimates: undefined,
      selected: true,
    };
    onFeaturesChange([...features, newFeature]);
    setEditingFeature(newFeature);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col w-[280px] min-h-[400px] h-fit bg-background border border-border rounded-lg shadow-sm shrink-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
          <Input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Stage name"
            className="flex-1 border-none shadow-none bg-transparent font-semibold text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0 h-auto py-0"
          />
        </div>

        {/* Features Area */}
        <div className="flex-1 p-3 overflow-y-auto">
          {features.length === 0 ? (
            <button
              onClick={handleAddFeature}
              className="w-full h-full min-h-[120px] flex items-center justify-center border-2 border-dashed border-border rounded-md text-muted-foreground text-sm hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              No features yet
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  name={feature.name}
                  points={calculatePoints(feature.estimates)}
                  selected={feature.selected}
                  onToggle={() => handleToggleFeature(feature.id)}
                  onClick={() => handleFeatureClick(feature)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddFeature}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add feature
          </Button>
        </div>
      </div>

      {/* Estimation Modal */}
      <EstimationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        featureName={editingFeature?.name || ''}
        initialEstimates={editingFeature?.estimates}
        onSave={handleSaveEstimates}
      />
    </>
  );
};
