import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FeatureCardProps {
  name: string;
  points?: number;
  selected?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export const FeatureCard = ({
  name,
  points,
  selected = true,
  onToggle,
  onClick,
  onDelete,
}: FeatureCardProps) => {
  const hasEstimates = points !== undefined && points > 0;

  return (
    <div
      className={`
        group relative flex items-center gap-3 p-3 
        bg-background border border-border rounded-lg
        cursor-pointer transition-all duration-150
        hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
        ${selected ? 'opacity-100' : 'opacity-50'}
      `}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="h-4 w-4"
        />
      </div>

      {/* Feature Name */}
      <span className="flex-1 text-sm font-medium text-foreground truncate">
        {name}
      </span>

      {/* Points Badge */}
      <span
        className={`
          text-xs font-medium px-2 py-0.5 rounded-full
          ${hasEstimates 
            ? 'bg-primary/10 text-primary' 
            : 'bg-muted text-muted-foreground'
          }
        `}
      >
        {hasEstimates ? `${points} pts` : '–'}
      </span>

      {/* Delete Button - appears on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 -mr-1 text-muted-foreground hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Delete feature"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {/* Expand Icon with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Click to estimate
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
