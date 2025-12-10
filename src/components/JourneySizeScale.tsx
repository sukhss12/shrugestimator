import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JourneySizeScaleProps {
  currentSize: string;
  totalPoints: number;
  sprintCapacity: number;
}

const getSizes = (sprintCapacity: number) => [
  { size: 'XS', range: '1-10', tooltip: '<10% of sprint', sprintContext: 'fits easily' },
  { size: 'S', range: '11-25', tooltip: '~¼ sprint', sprintContext: 'fits easily' },
  { size: 'M', range: '26-50', tooltip: '~½ sprint', sprintContext: 'good fit' },
  { size: 'L', range: '51-100', tooltip: 'Full sprint', sprintContext: 'tight fit' },
  { size: 'XL', range: '100+', tooltip: 'Multi-sprint', sprintContext: 'split it' },
];

export const JourneySizeScale = ({ currentSize, totalPoints, sprintCapacity }: JourneySizeScaleProps) => {
  const sizes = getSizes(sprintCapacity);
  const capacityPercent = sprintCapacity > 0 ? Math.round((totalPoints / sprintCapacity) * 100) : 0;
  const isOverCapacity = totalPoints > sprintCapacity;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground/60 mr-2 hidden sm:inline">Journey:</span>
        <div className="flex gap-1">
          {sizes.map(({ size, range, tooltip, sprintContext }) => {
            const isActive = size === currentSize;
            const showWarning = isActive && isOverCapacity;
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
                      {isActive ? `${totalPoints}` : range}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="text-center">
                    <div className="font-medium">{size}: {range} pts</div>
                    <div className="text-foreground/70">{tooltip}</div>
                    <div className="text-foreground/50 text-[10px]">{sprintContext}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      {totalPoints > 0 && (
        <span className={`text-[10px] ${isOverCapacity ? 'text-red-500' : 'text-foreground/60'}`}>
          {capacityPercent}% of sprint capacity
        </span>
      )}
    </div>
  );
};
