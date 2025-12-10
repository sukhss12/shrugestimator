import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { JOURNEY_SIZE_BANDS } from '@/lib/constants';

interface JourneySizeScaleProps {
  currentSize: string;
  totalDevDays: number;
  calendarWeeks: number;
  appetite: number;
}

const SIZES = [
  { size: 'XS', range: '< 2 wks' },
  { size: 'S', range: '2–4 wks' },
  { size: 'M', range: '4–8 wks' },
  { size: 'L', range: '8–12 wks' },
  { size: 'XL', range: '12+ wks' },
];

export const JourneySizeScale = ({ currentSize, totalDevDays, calendarWeeks, appetite }: JourneySizeScaleProps) => {
  const appetitePercent = appetite > 0 ? Math.round((calendarWeeks / appetite) * 100) : 0;
  const isOverAppetite = calendarWeeks > appetite;

  // Format weeks display
  const formatWeeks = (weeks: number) => {
    if (weeks === 0) return '0';
    const rounded = Math.round(weeks * 2) / 2; // Round to nearest 0.5
    return `~${rounded}`;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground/60 mr-2 hidden sm:inline">Journey:</span>
        <div className="flex gap-1">
          {SIZES.map(({ size, range }) => {
            const isActive = size === currentSize;
            const band = JOURNEY_SIZE_BANDS[size as keyof typeof JOURNEY_SIZE_BANDS];
            return (
              <Tooltip key={size}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      flex flex-col items-center justify-center px-2 py-1 rounded-md
                      transition-all duration-150 cursor-default min-w-[40px]
                      ${isActive
                        ? isOverAppetite 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : 'bg-card border border-border/50 text-foreground/60'
                      }
                    `}
                  >
                    <span className={`text-xs font-semibold`}>
                      {size}
                    </span>
                    <span className={`text-[10px] ${isActive ? 'opacity-80' : 'text-foreground/50'}`}>
                      {isActive ? `${formatWeeks(calendarWeeks)} wks` : range}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="text-center">
                    <div className="font-medium">{size}: {band.label}</div>
                    <div className="text-foreground/70">{band.sprints}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      
      {/* Appetite progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-foreground/60">Appetite: {appetite} wks</span>
        <div className="w-16 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${isOverAppetite ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(appetitePercent, 100)}%` }}
          />
        </div>
        <span className={`text-[10px] font-medium ${isOverAppetite ? 'text-red-500' : 'text-foreground/60'}`}>
          {appetitePercent}%
        </span>
      </div>
    </div>
  );
};
