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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar border border-sidebar-border rounded-lg text-sidebar-foreground"
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
          bg-sidebar border-r border-sidebar-border
          flex flex-col p-6 overflow-y-auto
          z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 text-muted-foreground hover:text-sidebar-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo + Wordmark */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Logo width={48} />
            <span className="text-lg font-bold text-sidebar-foreground leading-none">Shrug</span>
          </div>
          <p className="text-xs text-muted-foreground italic mt-1.5">Product estimation, roughly</p>
        </div>

        {/* Body Copy */}
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed flex-1">
          <p>
            You know that moment when someone asks "when's this shipping?" and everyone stares at the ceiling? Someone mutters "<em>...depends</em>".
          </p>

          <p className="text-sm font-medium text-sidebar-foreground py-1">
            This is for that.
          </p>

          <p>
            Map your journey. Size your features. See if your grand vision actually fits your appetite.
          </p>

          <p>
            <span className="text-muted-foreground/70">Spoiler:</span>{' '}
            <span className="text-sidebar-foreground font-medium">it probably won't.</span>{' '}
            That's what the priorities are for:
          </p>

          {/* Priority Legend */}
          <div className="space-y-1.5 py-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-medium text-sidebar-foreground/80">Now</span>
              <span className="text-muted-foreground/70">— this ships</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="font-medium text-sidebar-foreground/80">Next</span>
              <span className="text-muted-foreground/70">— that waits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
              <span className="font-medium text-sidebar-foreground/80">Later</span>
              <span className="text-muted-foreground/70">— we'll get to it</span>
            </div>
          </div>

          <p className="text-muted-foreground/70">
            Get a rough shape before you've promised anything. Refine it properly once you're actually building.
          </p>

          {/* Closing line */}
          <div className="pt-4 mt-auto">
            <p className="text-xs text-muted-foreground/70">Document your guesswork.</p>
            <p className="text-sm text-sidebar-foreground/60 mt-1">¯\_(ツ)_/¯</p>
          </div>
        </div>
      </aside>
    </>
  );
};
