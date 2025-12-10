import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { StageColumn } from '@/components/StageColumn';

const Index = () => {
  const [journeyName, setJourneyName] = useState('');
  const [teamSize, setTeamSize] = useState(2);

  const handleDecrement = () => {
    if (teamSize > 1) setTeamSize(teamSize - 1);
  };

  const handleIncrement = () => {
    setTeamSize(teamSize + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Bar - Sticky */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background border-b border-border">
        <Input
          type="text"
          value={journeyName}
          onChange={(e) => setJourneyName(e.target.value)}
          placeholder="e.g. Business Review Flow"
          className="max-w-xs bg-transparent border-none shadow-none text-lg font-medium placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0"
        />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Team:</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleDecrement}
              disabled={teamSize <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{teamSize}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleIncrement}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Scrolling Area */}
      <main 
        className="flex-1 overflow-x-auto overflow-y-hidden p-8"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <div className="flex gap-4 h-full items-start">
          <StageColumn />
        </div>
      </main>

      {/* Bottom Bar - Sticky */}
      <footer className="sticky bottom-0 z-10 px-6 py-4 bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Summary will appear here</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
