import { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { SortableStageColumn } from '@/components/SortableStageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { JourneySizeScale } from '@/components/JourneySizeScale';
import { SummaryBar } from '@/components/SummaryBar';
import { StageNavigation } from '@/components/StageNavigation';
import { Logo } from '@/components/Logo';
import { TShirtSize, ReleaseColour } from '@/types';
import { SIZE_DAYS, WORKING_DAYS_PER_WEEK, APPETITE_OPTIONS, getJourneySize } from '@/lib/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STORAGE_KEY = 'tshirt-estimator-data';

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
  colour?: ReleaseColour;
}

interface Stage {
  id: string;
  name: string;
  features: Feature[];
}

interface StoredData {
  journeyName: string;
  teamSize: number;
  appetite: number;
  stages: Stage[];
}

const calculateFeatureDays = (estimates?: FeatureEstimates): number => {
  if (!estimates) return 0;
  return SIZE_DAYS[estimates.fe] + SIZE_DAYS[estimates.be] + SIZE_DAYS[estimates.db] + SIZE_DAYS[estimates.int];
};

const defaultData: StoredData = {
  journeyName: '',
  teamSize: 2,
  appetite: 6,
  stages: [{
    id: '1',
    name: 'Stage 1',
    features: []
  }]
};

const loadFromStorage = (): StoredData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Backward compatibility: migrate sprintWeeks to appetite
      return {
        ...defaultData,
        ...data,
        appetite: data.appetite ?? data.sprintWeeks ?? 6
      };
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return defaultData;
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [journeyName, setJourneyName] = useState('');
  const [teamSize, setTeamSize] = useState(2);
  const [appetite, setAppetite] = useState(6);
  const [stages, setStages] = useState<Stage[]>([]);
  const [newStageId, setNewStageId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadFromStorage();
    setJourneyName(data.journeyName);
    setTeamSize(data.teamSize);
    setAppetite(data.appetite);
    setStages(data.stages);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({
        journeyName,
        teamSize,
        appetite,
        stages
      });
    }
  }, [journeyName, teamSize, appetite, stages, isLoaded]);

  // Summary calculations
  const summary = useMemo(() => {
    const allFeatures = stages.flatMap(s => s.features);
    const totalCount = allFeatures.length;
    const selectedFeatures = allFeatures.filter(f => f.selected);
    const selectedCount = selectedFeatures.length;
    
    // Dev-days totals
    const totalDevDays = selectedFeatures.reduce((sum, f) => sum + calculateFeatureDays(f.estimates), 0);
    const greenDevDays = selectedFeatures.filter(f => f.colour === 'green').reduce((sum, f) => sum + calculateFeatureDays(f.estimates), 0);
    const amberDevDays = selectedFeatures.filter(f => f.colour === 'amber').reduce((sum, f) => sum + calculateFeatureDays(f.estimates), 0);
    const purpleDevDays = selectedFeatures.filter(f => f.colour === 'purple').reduce((sum, f) => sum + calculateFeatureDays(f.estimates), 0);
    const unassignedDevDays = selectedFeatures.filter(f => !f.colour).reduce((sum, f) => sum + calculateFeatureDays(f.estimates), 0);

    // Calendar time calculation: (dev-days ÷ team size) ÷ 5 days/week
    const calendarDays = teamSize > 0 ? totalDevDays / teamSize : 0;
    const calendarWeeks = calendarDays / WORKING_DAYS_PER_WEEK;
    
    // Round to nearest 0.5
    const roundedWeeks = Math.round(calendarWeeks * 2) / 2;
    
    // Time estimate display
    let timeEstimate: string;
    if (roundedWeeks === 0) {
      timeEstimate = '0 weeks';
    } else {
      timeEstimate = `~${roundedWeeks} week${roundedWeeks !== 1 ? 's' : ''}`;
    }

    // Journey size based on calendar weeks (using new bands)
    const journeySize = getJourneySize(calendarWeeks);

    return {
      selectedCount,
      totalCount,
      totalDevDays,
      calendarWeeks,
      timeEstimate,
      journeySize,
      greenDevDays,
      amberDevDays,
      purpleDevDays,
      unassignedDevDays
    };
  }, [stages, teamSize]);

  const handleDecrement = () => {
    if (teamSize > 1) setTeamSize(teamSize - 1);
  };

  const handleIncrement = () => {
    if (teamSize < 10) setTeamSize(teamSize + 1);
  };

  const handleAddStage = () => {
    const id = Date.now().toString();
    const newStage: Stage = {
      id,
      name: 'New Stage',
      features: []
    };
    setStages([...stages, newStage]);
    setNewStageId(id);
  };

  const handleStageName = (stageId: string, name: string) => {
    setStages(stages.map(s => s.id === stageId ? {
      ...s,
      name
    } : s));
  };

  const handleStageFeatures = (stageId: string, features: Feature[]) => {
    setStages(stages.map(s => s.id === stageId ? {
      ...s,
      features
    } : s));
  };

  const handleDeleteStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      setStages(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Don't render until loaded to prevent flash
  if (!isLoaded) {
    return <div className="flex flex-col h-screen bg-background items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>;
  }

  return <div className="flex flex-col h-screen bg-background">
      {/* Top Bar - Sticky */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        {/* Logo + Wordmark */}
        <div className="flex items-center gap-3 text-foreground">
          <Logo width={80} />
          <div className="hidden sm:block">
            <span className="font-bold text-lg block leading-tight">Shrug</span>
            <span className="text-xs text-foreground/60">Product estimation, roughly</span>
          </div>
        </div>
      </header>

      {/* Hero Intro */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-border/30">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
            You know that moment in refinement where someone asks "how long will this take?" and everyone stares at the ceiling?
            <span className="text-foreground font-medium"> This is for that.</span>
          </p>
          <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
            Shrug is a free t-shirt sizing tool. Map your features, slap some sizes on them, and see if your grand vision actually fits in your appetite. 
            <span className="text-foreground/50 italic"> Spoiler: it probably doesn't. That's why there's a descope button.</span>
          </p>
          <p className="text-foreground/60 text-xs sm:text-sm">
            Will your estimates be accurate? <span className="font-mono">¯\_(ツ)_/¯</span>
          </p>
        </div>
      </div>

      {/* Journey Settings */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 flex flex-wrap items-end gap-4 sm:gap-6">
        {/* Journey Name */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Journey Name
          </label>
          <Input type="text" value={journeyName} onChange={e => setJourneyName(e.target.value)} placeholder="e.g. Business Review Flow" className="text-lg" />
        </div>

        {/* Team Size */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Team</label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleDecrement} disabled={teamSize <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium text-foreground">{teamSize}</span>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleIncrement} disabled={teamSize >= 10}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Appetite */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Appetite</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-1 px-3">
                {appetite} week{appetite > 1 ? 's' : ''}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {APPETITE_OPTIONS.map(weeks => <DropdownMenuItem key={weeks} onClick={() => setAppetite(weeks)} className={appetite === weeks ? 'bg-accent' : ''}>
                  {weeks} week{weeks > 1 ? 's' : ''}
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Scrolling Area */}
      <main className="flex-1 overflow-hidden px-4 sm:px-8 pb-4 sm:pb-8 bg-background">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stages.map(s => s.id)} strategy={horizontalListSortingStrategy}>
            <StageNavigation stageCount={stages.length + 1}>
              {stages.map(stage => (
                <div key={stage.id} className="flex-shrink-0 w-full sm:w-auto">
                  <SortableStageColumn 
                    id={stage.id} 
                    name={stage.name} 
                    features={stage.features} 
                    onNameChange={name => handleStageName(stage.id, name)} 
                    onFeaturesChange={features => handleStageFeatures(stage.id, features)} 
                    onDelete={() => handleDeleteStage(stage.id)} 
                    canDelete={stages.length > 1} 
                    autoFocus={stage.id === newStageId} 
                  />
                </div>
              ))}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <AddStageButton onClick={handleAddStage} />
              </div>
            </StageNavigation>
          </SortableContext>
        </DndContext>
      </main>

      {/* Bottom Bar - Sticky */}
      <footer className="sticky bottom-0 z-10 px-4 sm:px-6 py-2 sm:py-3 bg-card border-t border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          {/* Journey Size Scale - Left (reference only) */}
          <JourneySizeScale currentSize={summary.journeySize} />
          
          {/* Summary - Right (all metrics) */}
          <SummaryBar 
            totalDevDays={summary.totalDevDays}
            calendarWeeks={summary.calendarWeeks}
            journeySize={summary.journeySize}
            appetite={appetite}
            teamSize={teamSize}
            greenDevDays={summary.greenDevDays}
            amberDevDays={summary.amberDevDays}
            purpleDevDays={summary.purpleDevDays}
            unassignedDevDays={summary.unassignedDevDays}
          />
        </div>
      </footer>
    </div>;
};

export default Index;
