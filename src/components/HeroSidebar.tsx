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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black/70 backdrop-blur-xl border border-violet-500/20 rounded-lg text-white"
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
          bg-gradient-to-b from-violet-950/40 via-black/70 to-black/80
          backdrop-blur-xl border-r border-violet-500/30
          shadow-[inset_0_0_60px_rgba(139,92,246,0.1)]
          flex flex-col p-6 overflow-y-auto
          z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo + Wordmark */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Logo width={56} />
            <span className="text-xl font-bold text-white leading-none">Shrug</span>
          </div>
          <p className="text-sm text-slate-400 italic mt-1.5">Product estimation, roughly</p>
        </div>

        {/* Body Copy */}
        <div className="space-y-4 text-sm text-slate-400 leading-relaxed flex-1">
          <p>
            You know that moment when someone asks "when's this shipping?" and everyone stares at the ceiling? Someone mutters "<em>...depends</em>".
          </p>

          <p className="text-base font-medium text-white py-2">
            This is for that.
          </p>

          <p>
            Map your journey. Size your features. See if your grand vision actually fits your appetite.{' '}
            <span className="text-slate-500">Spoiler:</span>{' '}
            <span className="text-white font-medium">it probably won't.</span>{' '}
            That's what the priorities are for:
          </p>

          {/* Priority Legend */}
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-medium text-slate-300">Now</span>
              <span className="text-slate-500">— this ships</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="font-medium text-slate-300">Next</span>
              <span className="text-slate-500">— that waits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
              <span className="font-medium text-slate-300">Later</span>
              <span className="text-slate-500">— we'll get to it</span>
            </div>
          </div>

          <p className="text-slate-500">
            Get a rough shape before you've promised anything. Refine it properly once you're actually building.
          </p>
        </div>
      </aside>
    </>
  );
};
