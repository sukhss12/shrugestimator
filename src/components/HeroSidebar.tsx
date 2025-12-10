import { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';

export const HeroSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[280px] lg:w-[280px] md:w-[240px]
          bg-muted/50 border-r border-border
          flex flex-col p-6 overflow-y-auto
          z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo + Wordmark */}
        <div className="flex items-center gap-3 mb-6">
          <Logo width={48} />
          <div>
            <span className="text-xl font-bold text-foreground">Shrug</span>
            <p className="text-sm text-muted-foreground italic">Product estimation, roughly</p>
          </div>
        </div>

        {/* Body Copy */}
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed flex-1">
          <p>
            You know that moment when someone asks "when's this shipping?" and everyone stares at the ceiling? Someone mutters "<em>...depends</em>".
          </p>

          <p className="text-base font-medium text-foreground py-2">
            This is for that.
          </p>

          <p>
            Map your journey. Size your features. See if your grand vision actually fits your appetite.{' '}
            <span className="text-muted-foreground/70">Spoiler:</span>{' '}
            <span className="text-foreground font-medium">it probably won't.</span>{' '}
            That's what the priorities are for:
          </p>

          {/* Priority Legend */}
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-medium text-foreground/80">Now</span>
              <span className="text-muted-foreground/70">— this ships</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="font-medium text-foreground/80">Next</span>
              <span className="text-muted-foreground/70">— that waits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
              <span className="font-medium text-foreground/80">Later</span>
              <span className="text-muted-foreground/70">— we'll get to it</span>
            </div>
          </div>

          <p className="text-muted-foreground/70">
            Get a rough shape before you've promised anything. Refine it properly once you're actually building.
          </p>
        </div>
      </aside>
    </>
  );
};
