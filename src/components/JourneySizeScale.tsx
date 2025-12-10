import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JourneySizeScaleProps {
  currentSize: string;
  totalPoints: number;
}

const SIZES = [
  { size: 'XS', range: '1-10', tooltip: 'A few days work' },
  { size: 'S', range: '11-25', tooltip: 'About a week' },
  { size: 'M', range: '26-50', tooltip: '1-2 weeks' },
  { size: 'L', range: '51-100', tooltip: '3-4 weeks' },
  { size: 'XL', range: '100+', tooltip: 'A month or more' },
];

export const JourneySizeScale = ({ currentSize, totalPoints }: JourneySizeScaleProps) => {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">Journey Size:</span>
      <div className="flex gap-1">
        {SIZES.map(({ size, range, tooltip }) => {
          const isActive = size === currentSize;
          return (
            <Tooltip key={size}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    flex flex-col items-center justify-center px-2 py-1 rounded-md
                    transition-all duration-150 cursor-default min-w-[40px]
                    ${isActive
                      ? 'bg-foreground text-background'
                      : 'bg-background border border-border text-muted-foreground'
                    }
                  `}
                >
                  <span className={`text-xs font-semibold ${isActive ? '' : 'text-muted-foreground'}`}>
                    {size}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'text-background/80' : 'text-muted-foreground/60'}`}>
                    {isActive ? `${totalPoints}` : range}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="text-center">
                  <div className="font-medium">{size}: {range} pts</div>
                  <div className="text-muted-foreground">{tooltip}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
