import { useState, useEffect } from 'react';
import { Logo } from './Logo';

const HERO_COLLAPSED_KEY = 'shrug-hero-collapsed';

export const HeroSection = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HERO_COLLAPSED_KEY);
    if (stored === 'true') {
      setIsCollapsed(true);
    }
    setIsLoaded(true);
  }, []);

  const toggleCollapse = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem(HERO_COLLAPSED_KEY, String(newValue));
  };

  // Prevent flash of wrong state
  if (!isLoaded) {
    return null;
  }

  // Collapsed state - just logo + wordmark
  if (isCollapsed) {
    return (
      <div className="border-b border-border">
        <div className="max-w-[600px] mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo width={48} />
            <div>
              <span className="text-2xl font-bold text-foreground">Shrug</span>
              <p className="text-sm text-muted-foreground italic mt-0.5">Product estimation, roughly</p>
            </div>
          </div>
          <button
            onClick={toggleCollapse}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Show
          </button>
        </div>
      </div>
    );
  }

  // Expanded state - full hero
  return (
    <div className="border-b border-border">
      <div className="max-w-[600px] mx-auto px-6 sm:px-8 pt-8 pb-6">
        {/* Hide link */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleCollapse}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Hide
          </button>
        </div>

        {/* Logo + Wordmark */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-6">
          <Logo width={48} />
          <div className="text-center sm:text-left">
            <span className="text-2xl font-bold text-foreground">Shrug</span>
            <p className="text-sm text-muted-foreground italic mt-1">Product estimation, roughly</p>
          </div>
        </div>

        {/* Body Copy */}
        <div className="space-y-4 text-base text-foreground/70 leading-relaxed">
          <p>
            You know that moment when someone asks "when's this shipping?" and everyone stares at the ceiling? Someone mutters "<em>...depends</em>".
          </p>

          <p className="text-lg font-medium text-foreground">
            This is for that.
          </p>

          <p>
            Map your journey. Size your features. See if your grand vision actually fits your appetite.{' '}
            <span className="text-muted-foreground">Spoiler:</span>{' '}
            <span className="text-foreground font-medium">it probably won't.</span>{' '}
            That's what the priorities are for:
          </p>

          {/* Priority List */}
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-medium text-foreground">Now</span>
              <span className="text-muted-foreground">— this ships</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="font-medium text-foreground">Next</span>
              <span className="text-muted-foreground">— that waits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
              <span className="font-medium text-foreground">Later</span>
              <span className="text-muted-foreground">— we'll get to it</span>
            </div>
          </div>

          <p>
            Get a rough shape before you've promised anything. Refine it properly once you're actually building.
          </p>
        </div>
      </div>
    </div>
  );
};
