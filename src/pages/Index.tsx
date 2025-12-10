import { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { SortableStageColumn } from '@/components/SortableStageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { JourneySizeScale } from '@/components/JourneySizeScale';
import { AppetiteBar } from '@/components/AppetiteBar';
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
      <div className="px-8 pt-8 pb-6 border-b border-border/30">
        <div className="max-w-2xl space-y-4">
          <p className="text-foreground/80 leading-relaxed">
            You know that moment in refinement where someone asks "how long will this take?" and everyone stares at the ceiling?
            <span className="text-foreground font-medium"> This is for that.</span>
          </p>
          <p className="text-foreground/70 text-sm leading-relaxed">
            Shrug is a free t-shirt sizing tool. Map your features, slap some sizes on them, and see if your grand vision actually fits in your appetite. 
            <span className="text-foreground/50 italic"> Spoiler: it probably doesn't. That's why there's a descope button.</span>
          </p>
          <p className="text-foreground/60 text-sm">
            Will your estimates be accurate? <span className="font-mono">¯\_(ツ)_/¯</span>
          </p>
        </div>
      </div>

      {/* Journey Settings */}
      <div className="px-8 pt-6 pb-4 flex flex-wrap items-end gap-6">
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
      <main className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 bg-background">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stages.map(s => s.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 h-full items-start">
              {stages.map(stage => <SortableStageColumn key={stage.id} id={stage.id} name={stage.name} features={stage.features} onNameChange={name => handleStageName(stage.id, name)} onFeaturesChange={features => handleStageFeatures(stage.id, features)} onDelete={() => handleDeleteStage(stage.id)} canDelete={stages.length > 1} autoFocus={stage.id === newStageId} />)}
              <AddStageButton onClick={handleAddStage} />
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* Bottom Bar - Sticky */}
      <footer className="sticky bottom-0 z-10 px-6 py-3 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-4">
          {/* Journey Size Scale - Left */}
          <JourneySizeScale 
            currentSize={summary.journeySize} 
            totalDevDays={summary.totalDevDays} 
            calendarWeeks={summary.calendarWeeks}
            appetite={appetite} 
          />
          
          {/* Appetite Bar - Center */}
          <AppetiteBar 
            totalDevDays={summary.totalDevDays} 
            calendarWeeks={summary.calendarWeeks}
            appetite={appetite} 
            teamSize={teamSize} 
            greenDevDays={summary.greenDevDays} 
          />
          
          {/* Release Colour Totals */}
          <div className="flex items-center gap-3 text-sm">
            {summary.greenDevDays > 0 && <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium">{summary.greenDevDays}d</span>
              </span>}
            {summary.amberDevDays > 0 && <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-medium">{summary.amberDevDays}d</span>
              </span>}
            {summary.purpleDevDays > 0 && <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="font-medium">{summary.purpleDevDays}d</span>
              </span>}
            {summary.unassignedDevDays > 0 && <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-foreground/20 border border-foreground/40" />
                <span className="text-foreground/60">{summary.unassignedDevDays}d</span>
              </span>}
            <span className="text-foreground/40">·</span>
            <span className="font-medium text-foreground">{summary.totalDevDays} dev-days</span>
            <span className="text-foreground/40">·</span>
            <span className="font-medium text-primary">{summary.timeEstimate}</span>
          </div>
        </div>
      </footer>
    </div>;
};

export default Index;
