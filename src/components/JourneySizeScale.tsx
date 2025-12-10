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
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground/60 hidden sm:inline">Journey:</span>
      <div className="flex gap-1">
        {SIZES.map(({ size, range }) => {
          const isActive = size === currentSize;
          const band = JOURNEY_SIZE_BANDS[size as keyof typeof JOURNEY_SIZE_BANDS];
          return (
            <Tooltip key={size}>
              <TooltipTrigger asChild>
                <div
                  className={`
                    px-2 py-1 rounded text-sm font-medium cursor-default
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground/50 hover:text-foreground/70'
                    }
                  `}
                >
                  {size}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="text-center">
                  <div className="font-medium">{band.label}</div>
                  <div className="text-foreground/70">{range} · {band.sprints}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
