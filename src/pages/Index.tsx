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
import { Minus, Plus } from 'lucide-react';
import { SortableStageColumn } from '@/components/SortableStageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { JourneySizeScale } from '@/components/JourneySizeScale';
import { TShirtSize } from '@/types';
import { SIZE_POINTS, POINTS_PER_DEV_DAY } from '@/lib/constants';

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
}

interface Stage {
  id: string;
  name: string;
  features: Feature[];
}

interface StoredData {
  journeyName: string;
  teamSize: number;
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
      return JSON.parse(stored);
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
    setStages(data.stages);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ journeyName, teamSize, stages });
    }
  }, [journeyName, teamSize, stages, isLoaded]);

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
    const devDays = totalPoints / POINTS_PER_DEV_DAY;
    const calendarDays = devDays / teamSize;
    
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

    return { selectedCount, totalCount, totalPoints, timeEstimate, journeySize };
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
      <div className="flex flex-col h-screen bg-slate-50 items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

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
              className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleDecrement}
              disabled={teamSize <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{teamSize}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleIncrement}
              disabled={teamSize >= 10}
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
      <footer className="sticky bottom-0 z-10 px-6 py-3 bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4">
          {/* Journey Size Scale - Left */}
          <JourneySizeScale 
            currentSize={summary.journeySize} 
            totalPoints={summary.totalPoints} 
          />
          
          {/* Summary Stats - Right */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden md:inline">
              {summary.selectedCount}/{summary.totalCount} selected
            </span>
            <span className="text-muted-foreground hidden md:inline">·</span>
            <span className="font-medium">{summary.totalPoints} pts</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Team: {teamSize}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-medium text-primary">{summary.timeEstimate}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
