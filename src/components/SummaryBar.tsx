import { AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SummaryBarProps {
  totalDevDays: number;
  calendarWeeks: number;
  journeySize: string;
  scope: number;
  teamSize: number;
  greenDevDays: number;
  amberDevDays: number;
  purpleDevDays: number;
  unassignedDevDays: number;
}

export const SummaryBar = ({
  totalDevDays,
  calendarWeeks,
  journeySize,
  scope,
  teamSize,
  greenDevDays,
  amberDevDays,
  purpleDevDays,
  unassignedDevDays,
}: SummaryBarProps) => {
  const scopePercent = scope > 0 ? Math.round((calendarWeeks / scope) * 100) : 0;
  const isOverScope = calendarWeeks > scope;
  const weeksOver = Math.round((calendarWeeks - scope) * 2) / 2;
  
  const formatWeeks = (weeks: number) => {
    return Math.round(weeks * 2) / 2;
  };

  const getBarColor = () => {
    if (scopePercent <= 80) return 'bg-emerald-500';
    if (scopePercent <= 100) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const fillWidth = Math.min(scopePercent, 100);
  const hasPriorityBreakdown = greenDevDays > 0 || amberDevDays > 0 || purpleDevDays > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      {/* Dev-days: show breakdown OR total */}
      {hasPriorityBreakdown ? (
        <div className="flex items-center gap-2">
          {greenDevDays > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">{greenDevDays}d</span>
            </span>
          )}
          {amberDevDays > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-medium">{amberDevDays}d</span>
            </span>
          )}
          {purpleDevDays > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="font-medium">{purpleDevDays}d</span>
            </span>
          )}
          {unassignedDevDays > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30 border border-muted-foreground/50" />
              <span className="text-foreground/60">{unassignedDevDays}d</span>
            </span>
          )}
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-medium cursor-default">{totalDevDays} dev-days</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Total effort across all selected features
          </TooltipContent>
        </Tooltip>
      )}

      <span className="text-foreground/30">·</span>
      
      <span className="text-foreground/70">{teamSize} dev{teamSize > 1 ? 's' : ''}</span>
      
      <span className="text-foreground/30">·</span>

      {/* Weeks + Size badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <span className="font-medium">~{formatWeeks(calendarWeeks)} wks</span>
            <span className={`
              text-xs font-semibold px-1.5 py-0.5 rounded
              ${isOverScope 
                ? 'bg-destructive/20 text-destructive' 
                : 'bg-emerald-500/20 text-emerald-500'
              }
            `}>
              {journeySize}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {totalDevDays} dev-days ÷ {teamSize} dev{teamSize > 1 ? 's' : ''} ÷ 5 days/week
        </TooltipContent>
      </Tooltip>

      <span className="text-foreground/30">·</span>

      {/* Scope check */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-default">
            {isOverScope ? (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{scopePercent}% — descope {weeksOver} wks</span>
              </span>
            ) : (
              <>
                <span className="text-foreground/70">{scopePercent}%</span>
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getBarColor()} transition-all duration-300`}
                    style={{ width: `${fillWidth}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="text-center">
            <div className="font-medium">Scope: {scope} weeks</div>
            {isOverScope && (
              <div className="text-destructive">Descope {weeksOver} weeks to fit</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
