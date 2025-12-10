import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ReleaseColour } from '@/types';

interface FeatureCardProps {
  name: string;
  points?: number;
  selected?: boolean;
  colour?: ReleaseColour;
  onToggle?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  onColourChange?: (colour: ReleaseColour) => void;
}

const COLOUR_OPTIONS: { value: ReleaseColour; label: string; bgClass: string; borderClass: string }[] = [
  { value: null, label: 'Unassigned', bgClass: 'bg-muted', borderClass: '' },
  { value: 'green', label: 'Now', bgClass: 'bg-emerald-500', borderClass: 'border-l-emerald-500' },
  { value: 'amber', label: 'Next', bgClass: 'bg-amber-500', borderClass: 'border-l-amber-500' },
  { value: 'purple', label: 'Later', bgClass: 'bg-violet-500', borderClass: 'border-l-violet-500' },
];

const getColourClasses = (colour: ReleaseColour) => {
  const option = COLOUR_OPTIONS.find(o => o.value === colour);
  return option || COLOUR_OPTIONS[0];
};

export const FeatureCard = ({
  name,
  points,
  selected = true,
  colour = null,
  onToggle,
  onClick,
  onDelete,
  onColourChange,
}: FeatureCardProps) => {
  const hasEstimates = points !== undefined && points > 0;
  const colourClasses = getColourClasses(colour);

  return (
    <div
      className={`
        group relative flex items-center gap-3 p-3 
        bg-background border border-border rounded-lg
        cursor-pointer transition-all duration-150
        hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
        ${selected ? 'opacity-100' : 'opacity-50'}
        ${colour ? `border-l-4 ${colourClasses.borderClass}` : ''}
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
      {/* Colour Dot */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={`
              w-3 h-3 rounded-full shrink-0 transition-transform
              hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
              ${colour ? colourClasses.bgClass : 'bg-muted-foreground/20 border border-muted-foreground/40'}
            `}
            aria-label="Set release phase"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-2">
            {COLOUR_OPTIONS.map((option) => (
              <Tooltip key={option.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onColourChange?.(option.value);
                    }}
                    className={`
                      w-6 h-6 rounded-full transition-transform hover:scale-110
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${option.value === null 
                        ? 'bg-muted-foreground/20 border-2 border-muted-foreground/40' 
                        : option.bgClass
                      }
                      ${colour === option.value ? 'ring-2 ring-ring ring-offset-1' : ''}
                    `}
                    aria-label={option.label}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {option.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </PopoverContent>
      </Popover>

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
