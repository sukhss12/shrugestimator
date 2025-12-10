import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { JOURNEY_SIZE_BANDS } from '@/lib/constants';

interface JourneySizeScaleProps {
  currentSize: string;
}

const SIZES = [
  { size: 'XS', range: '< 2 wks' },
  { size: 'S', range: '2–4 wks' },
  { size: 'M', range: '4–8 wks' },
  { size: 'L', range: '8–12 wks' },
  { size: 'XL', range: '12+ wks' },
];

export const JourneySizeScale = ({ currentSize }: JourneySizeScaleProps) => {
  return (
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
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/50 text-foreground/60'
                    }
                  `}
                >
                  <span className="text-xs font-semibold">
                    {size}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'opacity-80' : 'text-foreground/50'}`}>
                    {range}
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
  );
};
