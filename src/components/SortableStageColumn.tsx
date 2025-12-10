import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StageColumn } from './StageColumn';
import { TShirtSize } from '@/types';

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

interface SortableStageColumnProps {
  id: string;
  name: string;
  features: Feature[];
  onNameChange: (name: string) => void;
  onFeaturesChange: (features: Feature[]) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  autoFocus?: boolean;
}

export const SortableStageColumn = ({
  id,
  name,
  features,
  onNameChange,
  onFeaturesChange,
  onDelete,
  canDelete,
  autoFocus,
}: SortableStageColumnProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    rotate: isDragging ? '2deg' : '0deg',
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'shadow-2xl' : ''}`}
    >
      <StageColumn
        id={id}
        name={name}
        features={features}
        onNameChange={onNameChange}
        onFeaturesChange={onFeaturesChange}
        onDelete={onDelete}
        canDelete={canDelete}
        autoFocus={autoFocus}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};
