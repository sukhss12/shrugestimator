import { useState, useRef, useEffect } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { EstimationModal } from '@/components/EstimationModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TShirtSize, ReleaseColour } from '@/types';
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
  colour?: ReleaseColour;
}

interface StageColumnProps {
  id: string;
  name: string;
  features: Feature[];
  onNameChange: (name: string) => void;
  onFeaturesChange: (features: Feature[]) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  autoFocus?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
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
  onDelete,
  canDelete = true,
  autoFocus = false,
  dragHandleProps,
  isDragging = false,
}: StageColumnProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleColourChange = (featureId: string, colour: ReleaseColour) => {
    onFeaturesChange(features.map(f => 
      f.id === featureId ? { ...f, colour } : f
    ));
  };

  const handleFeatureClick = (feature: Feature) => {
    setEditingFeature(feature);
    setModalOpen(true);
  };

  const handleDeleteFeature = (featureId: string) => {
    onFeaturesChange(features.filter(f => f.id !== featureId));
  };

  const handleSaveEstimates = (featureName: string, estimates: FeatureEstimates) => {
    if (!editingFeature) return;
    savedRef.current = true;
    const featureId = editingFeature.id;
    const existingFeature = features.find(f => f.id === featureId);
    
    if (existingFeature) {
      onFeaturesChange(features.map(f => 
        f.id === featureId ? { ...f, name: featureName, estimates } : f
      ));
    } else {
      onFeaturesChange([...features, { ...editingFeature, name: featureName, estimates }]);
    }
    setEditingFeature(null);
    setModalOpen(false);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (editingFeature && !savedRef.current) {
        // Only add feature if closing without save (cancel/escape/click outside)
        const existingFeature = features.find(f => f.id === editingFeature.id);
        if (!existingFeature) {
          onFeaturesChange([...features, editingFeature]);
        }
      }
      setEditingFeature(null);
      savedRef.current = false;
    }
    setModalOpen(open);
  };

  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: `${id}-${Date.now()}`,
      name: 'New feature',
      estimates: undefined,
      selected: true,
    };
    setEditingFeature(newFeature);
    setModalOpen(true);
  };

  const handleDeleteStage = () => {
    if (features.length > 0) {
      setDeleteDialogOpen(true);
    } else {
      onDelete?.();
    }
  };

  const confirmDeleteStage = () => {
    setDeleteDialogOpen(false);
    onDelete?.();
  };

  return (
    <>
      <div className={`group/stage flex flex-col w-[280px] min-h-[400px] h-fit bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg shrink-0 transition-all duration-150 ${isDragging ? 'shadow-2xl scale-[1.02]' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border/50">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-foreground/40 hover:text-foreground/70 transition-colors" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Stage name"
            className="flex-1 border-none shadow-none bg-transparent font-semibold text-base text-foreground placeholder:text-foreground/40 focus-visible:ring-0 px-0 h-auto py-0"
          />
          {canDelete && onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDeleteStage}
                  className="opacity-0 group-hover/stage:opacity-100 transition-opacity duration-150 p-1 text-foreground/50 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="Delete stage"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Delete stage
              </TooltipContent>
            </Tooltip>
          )}
          {!canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="p-1 text-foreground/20 cursor-not-allowed">
                  <Trash2 className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Add another stage before deleting this one
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Features Area */}
        <div className="flex-1 p-3 overflow-y-auto">
          {features.length === 0 ? (
            <button
              onClick={handleAddFeature}
              className="w-full h-full min-h-[120px] flex items-center justify-center border-2 border-dashed border-border/50 rounded-md text-foreground/50 text-sm hover:border-foreground/30 hover:text-foreground/70 hover:bg-foreground/5 transition-colors cursor-pointer"
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
                  colour={feature.colour}
                  onToggle={() => handleToggleFeature(feature.id)}
                  onClick={() => handleFeatureClick(feature)}
                  onDelete={() => handleDeleteFeature(feature.id)}
                  onColourChange={(colour) => handleColourChange(feature.id, colour)}
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
            className="w-full justify-start text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add feature
          </Button>
        </div>
      </div>

      {/* Estimation Modal */}
      <EstimationModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        featureName={editingFeature?.name || ''}
        initialEstimates={editingFeature?.estimates}
        onSave={handleSaveEstimates}
      />

      {/* Delete Stage Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete '{name}'?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the stage and its {features.length} feature{features.length !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
