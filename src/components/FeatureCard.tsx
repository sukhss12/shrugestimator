import { useState } from 'react';
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
  devDays?: number;
  selected?: boolean;
  colour?: ReleaseColour;
  onToggle?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  onColourChange?: (colour: ReleaseColour) => void;
}

const COLOUR_OPTIONS: { value: ReleaseColour; label: string; bgClass: string; borderClass: string; textClass: string; glowClass: string }[] = [
  { value: null, label: 'Priority', bgClass: 'bg-muted', borderClass: 'border-l-muted-foreground/30', textClass: 'text-muted-foreground', glowClass: '' },
  { value: 'green', label: 'Now', bgClass: 'bg-emerald-500', borderClass: 'border-l-emerald-500', textClass: 'text-emerald-500', glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
  { value: 'amber', label: 'Next', bgClass: 'bg-amber-500', borderClass: 'border-l-amber-500', textClass: 'text-amber-500', glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]' },
  { value: 'purple', label: 'Later', bgClass: 'bg-violet-500', borderClass: 'border-l-violet-500', textClass: 'text-violet-500', glowClass: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]' },
];

const getColourClasses = (colour: ReleaseColour) => {
  const option = COLOUR_OPTIONS.find(o => o.value === colour);
  return option || COLOUR_OPTIONS[0];
};

export const FeatureCard = ({
  name,
  devDays,
  selected = true,
  colour = null,
  onToggle,
  onClick,
  onDelete,
  onColourChange,
}: FeatureCardProps) => {
  const [priorityOpen, setPriorityOpen] = useState(false);
  const hasEstimates = devDays !== undefined && devDays > 0;
  const colourClasses = getColourClasses(colour);

  return (
    <div
      className={`
        group relative flex flex-col gap-2 p-3 pl-4
        bg-card rounded-lg border border-border
        cursor-pointer transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
        hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30
        ${selected ? 'opacity-100' : 'opacity-50'}
        border-l-4 ${colourClasses.borderClass}
        ${selected && colour ? colourClasses.glowClass : ''}
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
      {/* Top Row: Checkbox + Name + Actions */}
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            className="h-4 w-4"
          />
        </div>

        {/* Feature Name */}
        <span className="flex-1 text-sm font-medium text-foreground line-clamp-2 leading-tight">
          {name}
        </span>

        {/* Delete Button - appears on hover */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 -mr-1 text-muted-foreground hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded flex-shrink-0"
            aria-label="Delete feature"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Expand Icon with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Click to estimate
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom Row: Release Phase + Dev Days */}
      <div className="flex items-center justify-between pl-7">
        <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
                border border-border hover:border-primary/30 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${colourClasses.textClass}
              `}
              aria-label="Set release phase"
            >
              <span className={`w-2 h-2 rounded-full ${colour ? colourClasses.bgClass : 'bg-muted-foreground/40'}`} />
              {colourClasses.label}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-col gap-1">
              {COLOUR_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColourChange?.(option.value);
                    setPriorityOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors
                    hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${colour === option.value ? 'bg-muted' : ''}
                  `}
                >
                  <span className={`w-3 h-3 rounded-full ${option.value === null ? 'bg-muted-foreground/30 border border-muted-foreground/50' : option.bgClass}`} />
                  <span className={option.textClass}>{option.label}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Dev Days */}
        <span
          className={`
            text-xs tabular-nums
            ${hasEstimates 
              ? 'text-muted-foreground' 
              : 'text-muted-foreground/50'
            }
          `}
        >
          {hasEstimates ? `${devDays}d` : '—'}
        </span>
      </div>
    </div>
  );
};
