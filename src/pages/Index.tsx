import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { StageColumn } from '@/components/StageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { TShirtSize } from '@/types';

interface FeatureEstimates {
  fe: TShirtSize;
  be: TShirtSize;
  db: TShirtSize;
  int: TShirtSize;
}

interface Feature {
  id: string;
  name: string;
  estimates?: FeatureEstimates;
  selected: boolean;
}

interface Stage {
  id: string;
  name: string;
  features: Feature[];
}

const initialStages: Stage[] = [
  {
    id: '1',
    name: 'Trigger',
    features: [
      { id: '1-1', name: 'Event listener setup', estimates: { fe: 'S', be: 'M', db: 'XS', int: 'S' }, selected: true },
      { id: '1-2', name: 'Webhook receiver', estimates: { fe: 'NA', be: 'M', db: 'S', int: 'M' }, selected: true },
    ],
  },
  {
    id: '2',
    name: 'Prepare',
    features: [
      { id: '2-1', name: 'Select company', estimates: undefined, selected: true },
      { id: '2-2', name: 'Select date range', estimates: undefined, selected: true },
      { id: '2-3', name: 'Choose report type', estimates: undefined, selected: true },
    ],
  },
  {
    id: '3',
    name: 'Generate',
    features: [
      { id: '3-1', name: 'Report builder', estimates: { fe: 'L', be: 'L', db: 'M', int: 'NA' }, selected: true },
      { id: '3-2', name: 'PDF export', estimates: { fe: 'M', be: 'M', db: 'NA', int: 'S' }, selected: false },
    ],
  },
  {
    id: '4',
    name: 'Send',
    features: [
      { id: '4-1', name: 'Email delivery', estimates: { fe: 'NA', be: 'M', db: 'XS', int: 'L' }, selected: true },
    ],
  },
  {
    id: '5',
    name: 'Review',
    features: [
      { id: '5-1', name: 'Status dashboard', estimates: { fe: 'L', be: 'S', db: 'S', int: 'NA' }, selected: true },
      { id: '5-2', name: 'Delivery logs', estimates: undefined, selected: true },
    ],
  },
];

const Index = () => {
  const [journeyName, setJourneyName] = useState('');
  const [teamSize, setTeamSize] = useState(2);
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [newStageId, setNewStageId] = useState<string | null>(null);

  const handleDecrement = () => {
    if (teamSize > 1) setTeamSize(teamSize - 1);
  };

  const handleIncrement = () => {
    setTeamSize(teamSize + 1);
  };

  const handleAddStage = () => {
    const id = Date.now().toString();
    const newStage: Stage = {
      id,
      name: 'New Stage',
      features: [],
    };
    setStages([...stages, newStage]);
    setNewStageId(id);
  };

  const handleStageName = (stageId: string, name: string) => {
    setStages(stages.map(s => 
      s.id === stageId ? { ...s, name } : s
    ));
  };

  const handleStageFeatures = (stageId: string, features: Feature[]) => {
    setStages(stages.map(s => 
      s.id === stageId ? { ...s, features } : s
    ));
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
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              id={stage.id}
              name={stage.name}
              features={stage.features}
              onNameChange={(name) => handleStageName(stage.id, name)}
              onFeaturesChange={(features) => handleStageFeatures(stage.id, features)}
              autoFocus={stage.id === newStageId}
            />
          ))}
          <AddStageButton onClick={handleAddStage} />
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
