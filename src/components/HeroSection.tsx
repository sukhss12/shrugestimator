import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
export const HeroSection = () => {
  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem('hero-collapsed');
    if (stored !== null) {
      setIsOpen(stored !== 'true');
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('hero-collapsed', (!isOpen).toString());
  }, [isOpen]);
  return <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1 px-2 h-7">
              {isOpen ? <>
                  <ChevronUp className="h-3 w-3" />
                  Hide intro
                </> : <>
                  <ChevronDown className="h-3 w-3" />
                  What's this?
                </>}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                You know that moment when someone asks "when's this shipping?" and all you can do is shrug?
              </p>

              <p className="text-sm font-medium text-foreground">
                This is for that.
              </p>

              {/* Instructions */}
              <div className="space-y-1">
                <p className="font-medium text-foreground/80">Here's how it works:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                  <li>Map your journey into steps</li>
                  <li>Add features to each step</li>
                  <li>Size them with your team (S, M, L, XL)</li>
                  <li>Set your priorities</li>
                </ol>
              </div>

              <p>
                We'll crunch the numbers and tell you if you're on track — or heading into{' '}
                <span className="text-foreground font-medium">scope creep</span> territory. 🚨
              </p>
              <p className="text-muted-foreground/70">
                Got room to spare? We'll let you know that too.
              </p>

              {/* Priority Legend */}
              <div className="space-y-1.5 py-2">
                <p className="font-medium text-foreground/80">Prioritise ruthlessly:</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-medium text-foreground/80">Now</span>
                  <span className="text-muted-foreground/70">— this ships</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-medium text-foreground/80">Next</span>
                  <span className="text-muted-foreground/70">— that waits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                  <span className="font-medium text-foreground/80">Later</span>
                  <span className="text-muted-foreground/70">— we'll get to it</span>
                </div>
              </div>

              <p className="text-muted-foreground/70">
                We estimate effort for a single developer, then divide by your team size. It's rough math for rough planning — refine it once you're actually building.
              </p>

              {/* Closing line */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground/70">Document your guesswork.</p>
                <p className="text-sm text-foreground/60 mt-1">¯\_(ツ)_/¯</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>;
};