import { AlertTriangle, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getJourneySize } from '@/lib/constants';

interface AppetiteBarProps {
  totalDevDays: number;
  calendarWeeks: number;
  appetite: number;
  teamSize: number;
  greenDevDays?: number;
}

export const AppetiteBar = ({
  totalDevDays,
  calendarWeeks,
  appetite,
  teamSize,
  greenDevDays = 0,
}: AppetiteBarProps) => {
  const appetitePercent = appetite > 0 ? (calendarWeeks / appetite) * 100 : 0;
  const greenCalendarWeeks = teamSize > 0 ? greenDevDays / teamSize / 5 : 0;
  const greenPercent = appetite > 0 ? (greenCalendarWeeks / appetite) * 100 : 0;
  const greenOverAppetite = greenCalendarWeeks > appetite;
  const isOverAppetite = calendarWeeks > appetite;
  const weeksOver = calendarWeeks - appetite;
  const greenWeeksOver = greenCalendarWeeks - appetite;
  const journeySize = getJourneySize(calendarWeeks);
  
  // Color based on appetite usage
  const getBarColor = () => {
    if (appetitePercent <= 80) return 'bg-emerald-500';
    if (appetitePercent <= 100) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (appetitePercent <= 80) return 'text-emerald-600';
    if (appetitePercent <= 100) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Format weeks for display
  const formatWeeks = (weeks: number) => {
    const rounded = Math.round(weeks * 2) / 2;
    return rounded;
  };

  const fillWidth = Math.min(appetitePercent, 100);
  const greenFillWidth = Math.min(greenPercent, 100);

  return (
    <div className="flex items-center gap-4">
      {/* Green appetite check - only show if green features exist */}
      {greenDevDays > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-default">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-foreground/70">
                ~{formatWeeks(greenCalendarWeeks)} of {appetite} wks
              </span>
              <div className="w-16 h-2 bg-foreground/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${greenOverAppetite ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-300`}
                  style={{ width: `${greenFillWidth}%` }}
                />
              </div>
              {greenOverAppetite ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="text-center space-y-1">
              <div className="font-medium">
                "Now" Release: {greenDevDays} dev-days
              </div>
              {greenOverAppetite ? (
                <div className="text-red-500 font-medium">
                  ⚠️ {formatWeeks(greenWeeksOver)} weeks over appetite
                </div>
              ) : (
                <div className="text-emerald-500 font-medium">
                  ✓ {Math.round(greenPercent)}% of {appetite}-week appetite
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Total appetite summary */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-default">
            <span className="text-xs text-foreground/70">
              ~{formatWeeks(calendarWeeks)} wks
            </span>
            <span className={`
              text-xs font-semibold px-1.5 py-0.5 rounded
              ${isOverAppetite 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' 
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              }
            `}>
              {journeySize}
            </span>
            <span className="text-xs text-foreground/40">·</span>
            {isOverAppetite ? (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {Math.round(appetitePercent)}% — descope {formatWeeks(weeksOver)} wks to fit
              </span>
            ) : (
              <>
                <span className={`text-xs ${getTextColor()}`}>
                  {Math.round(appetitePercent)}% of {appetite}-week appetite
                </span>
                <div className="w-16 h-2 bg-foreground/20 rounded-full overflow-hidden">
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
          <div className="text-center space-y-1">
            <div className="font-medium">
              Appetite: {appetite} weeks
            </div>
            <div className="text-foreground/70">
              {totalDevDays} dev-days ÷ {teamSize} dev{teamSize > 1 ? 's' : ''} = ~{formatWeeks(calendarWeeks)} weeks
            </div>
            {isOverAppetite && (
              <div className="text-red-500 font-medium">
                ⚠️ Descope {formatWeeks(weeksOver)} weeks to fit appetite
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
