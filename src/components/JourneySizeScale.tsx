import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JourneySizeScaleProps {
  currentSize: string;
  totalDevDays: number;
  calendarWeeks: number;
  appetite: number;
}

const SIZES = [
  { size: 'XS', range: '< 1 wk', tooltip: 'Quick win' },
  { size: 'S', range: '1-2 wks', tooltip: 'A couple of weeks' },
  { size: 'M', range: '2-4 wks', tooltip: 'A month-ish' },
  { size: 'L', range: '4-6 wks', tooltip: 'A shape-up cycle' },
  { size: 'XL', range: '6+ wks', tooltip: 'Epic territory' },
];

export const JourneySizeScale = ({ currentSize, totalDevDays, calendarWeeks, appetite }: JourneySizeScaleProps) => {
  const appetitePercent = appetite > 0 ? Math.round((calendarWeeks / appetite) * 100) : 0;
  const isOverAppetite = calendarWeeks > appetite;

  // Format weeks display
  const formatWeeks = (weeks: number) => {
    if (weeks === 0) return '0 wks';
    const rounded = Math.round(weeks * 2) / 2; // Round to nearest 0.5
    return `~${rounded} wk${rounded !== 1 ? 's' : ''}`;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground/60 mr-2 hidden sm:inline">Journey:</span>
        <div className="flex gap-1">
          {SIZES.map(({ size, range, tooltip }) => {
            const isActive = size === currentSize;
            const showWarning = isActive && isOverAppetite;
            return (
              <Tooltip key={size}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      flex flex-col items-center justify-center px-2 py-1 rounded-md
                      transition-all duration-150 cursor-default min-w-[40px]
                      ${isActive
                        ? showWarning 
                          ? 'bg-red-500 text-white'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border/50 text-foreground/60'
                      }
                    `}
                  >
                    <span className={`text-xs font-semibold ${isActive ? '' : 'text-foreground/70'}`}>
                      {size}
                    </span>
                    <span className={`text-[10px] ${isActive ? (showWarning ? 'text-white/80' : 'text-primary-foreground/80') : 'text-foreground/50'}`}>
                      {isActive ? formatWeeks(calendarWeeks) : range}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="text-center">
                    <div className="font-medium">{size}: {range}</div>
                    <div className="text-foreground/70">{tooltip}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      {totalDevDays > 0 && (
        <span className={`text-[10px] ${isOverAppetite ? 'text-red-500' : 'text-foreground/60'}`}>
          {appetitePercent}% of {appetite}-week appetite
        </span>
      )}
    </div>
  );
};
