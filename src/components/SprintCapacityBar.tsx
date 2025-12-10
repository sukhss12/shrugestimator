import { AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SprintCapacityBarProps {
  totalPoints: number;
  sprintCapacity: number;
  teamSize: number;
  sprintWeeks: number;
}

export const SprintCapacityBar = ({
  totalPoints,
  sprintCapacity,
  teamSize,
  sprintWeeks,
}: SprintCapacityBarProps) => {
  const capacityPercent = sprintCapacity > 0 ? (totalPoints / sprintCapacity) * 100 : 0;
  const sprintsNeeded = sprintCapacity > 0 ? totalPoints / sprintCapacity : 0;
  
  // Color based on capacity usage
  const getBarColor = () => {
    if (capacityPercent <= 80) return 'bg-emerald-500';
    if (capacityPercent <= 100) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (capacityPercent <= 80) return 'text-emerald-600';
    if (capacityPercent <= 100) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Display text
  const displayText = capacityPercent <= 100 
    ? `${Math.round(capacityPercent)}%`
    : `${sprintsNeeded.toFixed(1)}x`;

  const fillWidth = Math.min(capacityPercent, 100);

  return (
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1 cursor-default">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sprint:</span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getBarColor()} transition-all duration-300`}
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${getTextColor()}`}>
                {displayText}
              </span>
              {capacityPercent > 100 && (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="text-center space-y-1">
            <div className="font-medium">
              Sprint Capacity: {sprintCapacity} pts
            </div>
            <div className="text-muted-foreground">
              {teamSize} dev{teamSize > 1 ? 's' : ''} × {sprintWeeks} wk{sprintWeeks > 1 ? 's' : ''}
            </div>
            {capacityPercent > 100 && (
              <div className="text-red-500 font-medium">
                ⚠️ {sprintsNeeded.toFixed(1)} sprints needed
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};