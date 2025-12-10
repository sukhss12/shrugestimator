import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { SortableStageColumn } from '@/components/SortableStageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { JourneySizeScale } from '@/components/JourneySizeScale';
import { SprintCapacityBar } from '@/components/SprintCapacityBar';
import { Logo } from '@/components/Logo';
import { TShirtSize, ReleaseColour } from '@/types';
import { SIZE_POINTS, POINTS_PER_DEV_DAY } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  sprintWeeks: number;
  stages: Stage[];
}

const calculateFeaturePoints = (estimates?: FeatureEstimates): number => {
  if (!estimates) return 0;
  return SIZE_POINTS[estimates.fe] + SIZE_POINTS[estimates.be] + 
         SIZE_POINTS[estimates.db] + SIZE_POINTS[estimates.int];
};

const defaultData: StoredData = {
  journeyName: '',
  teamSize: 2,
  sprintWeeks: 2,
  stages: [
    {
      id: '1',
      name: 'Stage 1',
      features: [],
    },
  ],
};

const loadFromStorage = (): StoredData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Backward compatibility: add sprintWeeks if missing
      return { ...defaultData, ...data, sprintWeeks: data.sprintWeeks ?? 2 };
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

const SPRINT_OPTIONS = [1, 2, 3, 4, 6] as const;

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [journeyName, setJourneyName] = useState('');
  const [teamSize, setTeamSize] = useState(2);
  const [sprintWeeks, setSprintWeeks] = useState(2);
  const [stages, setStages] = useState<Stage[]>([]);
  const [newStageId, setNewStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadFromStorage();
    setJourneyName(data.journeyName);
    setTeamSize(data.teamSize);
    setSprintWeeks(data.sprintWeeks);
    setStages(data.stages);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ journeyName, teamSize, sprintWeeks, stages });
    }
  }, [journeyName, teamSize, sprintWeeks, stages, isLoaded]);

  // Summary calculations
  const summary = useMemo(() => {
    const allFeatures = stages.flatMap(s => s.features);
    const totalCount = allFeatures.length;
    const selectedFeatures = allFeatures.filter(f => f.selected);
    const selectedCount = selectedFeatures.length;
    const totalPoints = selectedFeatures.reduce(
      (sum, f) => sum + calculateFeaturePoints(f.estimates),
      0
    );
    
    // Points by release colour
    const greenPoints = selectedFeatures
      .filter(f => f.colour === 'green')
      .reduce((sum, f) => sum + calculateFeaturePoints(f.estimates), 0);
    const amberPoints = selectedFeatures
      .filter(f => f.colour === 'amber')
      .reduce((sum, f) => sum + calculateFeaturePoints(f.estimates), 0);
    const purplePoints = selectedFeatures
      .filter(f => f.colour === 'purple')
      .reduce((sum, f) => sum + calculateFeaturePoints(f.estimates), 0);
    const unassignedPoints = selectedFeatures
      .filter(f => !f.colour)
      .reduce((sum, f) => sum + calculateFeaturePoints(f.estimates), 0);
    
    const devDays = totalPoints / POINTS_PER_DEV_DAY;
    const calendarDays = devDays / teamSize;
    
    // Sprint capacity calculation
    const sprintDays = sprintWeeks * 5;
    const sprintCapacity = sprintDays * teamSize * POINTS_PER_DEV_DAY;
    const capacityPercent = sprintCapacity > 0 ? (totalPoints / sprintCapacity) * 100 : 0;
    const greenCapacityPercent = sprintCapacity > 0 ? (greenPoints / sprintCapacity) * 100 : 0;
    
    // Round up to nearest 0.5
    const roundedDays = Math.ceil(calendarDays * 2) / 2;
    
    let timeEstimate: string;
    if (roundedDays === 0) {
      timeEstimate = '0 days';
    } else if (roundedDays < 5) {
      timeEstimate = `~${roundedDays} days`;
    } else {
      // Convert to weeks, round up to nearest 0.5
      const weeks = Math.ceil((roundedDays / 5) * 2) / 2;
      timeEstimate = `~${weeks} weeks`;
    }

    // Journey size based on total points
    let journeySize: string;
    if (totalPoints <= 10) {
      journeySize = 'XS';
    } else if (totalPoints <= 25) {
      journeySize = 'S';
    } else if (totalPoints <= 50) {
      journeySize = 'M';
    } else if (totalPoints <= 100) {
      journeySize = 'L';
    } else {
      journeySize = 'XL';
    }

    return { 
      selectedCount, totalCount, totalPoints, timeEstimate, journeySize, 
      sprintCapacity, capacityPercent, 
      greenPoints, amberPoints, purplePoints, unassignedPoints, greenCapacityPercent 
    };
  }, [stages, teamSize, sprintWeeks]);

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

  const handleDeleteStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Don't render until loaded to prevent flash
  if (!isLoaded) {
    return (
      <div className="dark flex flex-col h-screen bg-background items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dark flex flex-col h-screen bg-background">
      {/* Top Bar - Sticky */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-md border-b border-border/50">
        {/* Logo + Wordmark */}
        <div className="flex items-center gap-2 text-foreground">
          <Logo width={80} />
          <span className="font-medium text-lg hidden sm:inline">Shrug</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Team Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">Team:</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-foreground/30 text-foreground hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={handleDecrement}
                disabled={teamSize <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium text-foreground">{teamSize}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-foreground/30 text-foreground hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={handleIncrement}
                disabled={teamSize >= 10}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Sprint Length */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">Sprint:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1 px-2 border-foreground/30 text-foreground hover:bg-foreground/10">
                  {sprintWeeks} wk{sprintWeeks > 1 ? 's' : ''}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                {SPRINT_OPTIONS.map((weeks) => (
                  <DropdownMenuItem
                    key={weeks}
                    onClick={() => setSprintWeeks(weeks)}
                    className={sprintWeeks === weeks ? 'bg-accent' : ''}
                  >
                    {weeks} week{weeks > 1 ? 's' : ''}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Capacity indicator */}
          <span className="text-xs text-foreground/50 hidden lg:inline">
            {summary.sprintCapacity} pts/sprint
          </span>
        </div>
      </header>

      {/* Journey Title */}
      <div className="px-8 pt-6 pb-4">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Journey Name
        </label>
        <Input
          type="text"
          value={journeyName}
          onChange={(e) => setJourneyName(e.target.value)}
          placeholder="e.g. Business Review Flow"
          className="max-w-md text-lg"
        />
      </div>

      {/* Main Scrolling Area */}
      <main
        className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8"
        style={{
          background: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card) / 0.5) 50%, hsl(var(--background)) 100%)`,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stages.map(s => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-4 h-full items-start">
              {stages.map((stage) => (
                <SortableStageColumn
                  key={stage.id}
                  id={stage.id}
                  name={stage.name}
                  features={stage.features}
                  onNameChange={(name) => handleStageName(stage.id, name)}
                  onFeaturesChange={(features) => handleStageFeatures(stage.id, features)}
                  onDelete={() => handleDeleteStage(stage.id)}
                  canDelete={stages.length > 1}
                  autoFocus={stage.id === newStageId}
                />
              ))}
              <AddStageButton onClick={handleAddStage} />
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* Bottom Bar - Sticky */}
      <footer className="sticky bottom-0 z-10 px-6 py-3 bg-card/80 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-between gap-4">
          {/* Journey Size Scale - Left */}
          <JourneySizeScale 
            currentSize={summary.journeySize} 
            totalPoints={summary.totalPoints}
            sprintCapacity={summary.sprintCapacity}
          />
          
          {/* Sprint Capacity Bar - Center */}
          <SprintCapacityBar
            totalPoints={summary.totalPoints}
            sprintCapacity={summary.sprintCapacity}
            teamSize={teamSize}
            sprintWeeks={sprintWeeks}
            greenPoints={summary.greenPoints}
          />
          
          {/* Release Colour Totals */}
          <div className="flex items-center gap-3 text-sm">
            {summary.greenPoints > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium">{summary.greenPoints}</span>
              </span>
            )}
            {summary.amberPoints > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-medium">{summary.amberPoints}</span>
              </span>
            )}
            {summary.purplePoints > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="font-medium">{summary.purplePoints}</span>
              </span>
            )}
            {summary.unassignedPoints > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-foreground/20 border border-foreground/40" />
                <span className="text-foreground/60">{summary.unassignedPoints}</span>
              </span>
            )}
            <span className="text-foreground/40">·</span>
            <span className="font-medium text-foreground">{summary.totalPoints} pts</span>
            <span className="text-foreground/40">·</span>
            <span className="font-medium text-primary">{summary.timeEstimate}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
