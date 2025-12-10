import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

const HERO_COLLAPSED_KEY = 'shrug-hero-collapsed';

export const HeroSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HERO_COLLAPSED_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
    setIsLoaded(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(HERO_COLLAPSED_KEY, String(newState));
  };

  if (!isLoaded) return null;

  return (
    <div className="border-b border-border bg-card/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7 px-2"
        >
          {isCollapsed ? (
            <>
              <span>What's this?</span>
              <ChevronDown className="h-3 w-3" />
            </>
          ) : (
            <>
              <span>Hide</span>
              <ChevronUp className="h-3 w-3" />
            </>
          )}
        </Button>

        {!isCollapsed && (
          <div className="py-3 space-y-3 text-xs text-muted-foreground leading-relaxed max-w-xl">
            <p>
              You know that moment when someone asks "when's this shipping?" and everyone stares at the ceiling? Someone mutters "<em>...depends</em>".{' '}
              <span className="text-foreground font-medium">This is for that.</span>
            </p>

            <p>
              Map your journey. Size your features. See if your grand vision fits your appetite.{' '}
              <span className="text-muted-foreground/70">Spoiler:</span>{' '}
              <span className="text-foreground font-medium">it probably won't.</span>
            </p>

            {/* Priority Legend - inline */}
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-foreground/80">Now</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-foreground/80">Next</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-foreground/80">Later</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
