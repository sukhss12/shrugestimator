import { AlertTriangle, Check } from 'lucide-react';
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
  greenPoints?: number;
}

export const SprintCapacityBar = ({
  totalPoints,
  sprintCapacity,
  teamSize,
  sprintWeeks,
  greenPoints = 0,
}: SprintCapacityBarProps) => {
  const capacityPercent = sprintCapacity > 0 ? (totalPoints / sprintCapacity) * 100 : 0;
  const greenPercent = sprintCapacity > 0 ? (greenPoints / sprintCapacity) * 100 : 0;
  const sprintsNeeded = sprintCapacity > 0 ? totalPoints / sprintCapacity : 0;
  const greenOverBudget = greenPoints > sprintCapacity;
  const greenOverBy = greenPoints - sprintCapacity;
  
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
  const greenFillWidth = Math.min(greenPercent, 100);

  return (
    <div className="flex items-center gap-4">
      {/* Green appetite check - only show if green features exist */}
      {greenPoints > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-default">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-foreground/70">
                {greenPoints} of {sprintCapacity}
              </span>
              <div className="w-16 h-2 bg-foreground/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${greenOverBudget ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-300`}
                  style={{ width: `${greenFillWidth}%` }}
                />
              </div>
              {greenOverBudget ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="text-center space-y-1">
              <div className="font-medium">
                "Now" Release: {greenPoints} pts
              </div>
              {greenOverBudget ? (
                <div className="text-red-500 font-medium">
                  ⚠️ {greenOverBy} pts over appetite
                </div>
              ) : (
                <div className="text-emerald-500 font-medium">
                  ✓ {Math.round(greenPercent)}% of sprint
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Total sprint capacity */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1 cursor-default">
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/70">Total:</span>
              <div className="w-20 h-2 bg-foreground/20 rounded-full overflow-hidden">
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
            <div className="text-foreground/70">
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