import { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Minus, Plus, ChevronDown, Pencil } from 'lucide-react';
import { SortableStageColumn } from '@/components/SortableStageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { JourneySizeScale } from '@/components/JourneySizeScale';
import { StageNavigation } from '@/components/StageNavigation';
import { BrandHeader } from '@/components/BrandHeader';
import { HeroSection } from '@/components/HeroSection';
import { TShirtSize, ReleaseColour } from '@/types';
import { SIZE_DAYS, WORKING_DAYS_PER_WEEK, getJourneySize } from '@/lib/constants';
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
  const [isEditingName, setIsEditingName] = useState(false);
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

  return <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed Brand Header */}
      <BrandHeader />

      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection />
      </div>

      {/* Main Content - Fixed Width Container */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Settings/Summary Bar */}
        <div className="sticky top-0 z-10 my-4 px-4 py-3 bg-card border border-border rounded-lg">
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Row 1: Journey Name */}
            <div className="w-full">
              {isEditingName || !journeyName ? (
                <Input 
                  value={journeyName}
                  onChange={e => setJourneyName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                  placeholder="Journey name..."
                  autoFocus
                  className="h-8 text-sm w-full"
                />
              ) : (
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors group"
                >
                  <span className="truncate">{journeyName}</span>
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                </button>
              )}
            </div>

            {/* Row 2: Controls */}
            <div className="flex items-center justify-between gap-2">
              {/* Team Size */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/60">Team</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleDecrement} disabled={teamSize <= 1}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{teamSize}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleIncrement} disabled={teamSize >= 10}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Appetite */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/60">Appetite</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-7 gap-1 px-2 text-sm">
                      {appetite} wks
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    {[1, 2, 3, 4, 6, 8, 10, 12].map((weeks) => (
                      <DropdownMenuItem 
                        key={weeks}
                        onClick={() => setAppetite(weeks)}
                        className={appetite === weeks ? 'bg-accent' : ''}
                      >
                        {weeks} week{weeks > 1 ? 's' : ''}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Row 3: Summary */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm">
                        <span className="font-medium">{summary.totalDevDays}</span>
                        <span className="text-foreground/60 ml-1">d</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <div className="space-y-1">
                        {summary.greenDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Now: {summary.greenDevDays}d</div>}
                        {summary.amberDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Next: {summary.amberDevDays}d</div>}
                        {summary.purpleDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500" /> Later: {summary.purpleDevDays}d</div>}
                        {summary.unassignedDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-muted" /> Unassigned: {summary.unassignedDevDays}d</div>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-sm text-foreground/70">{summary.timeEstimate}</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            summary.calendarWeeks > appetite ? 'bg-destructive' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min((summary.calendarWeeks / appetite) * 100, 100)}%` }}
                        />
                      </div>
                      {summary.calendarWeeks > appetite && (
                        <span className="text-destructive text-xs font-medium">!</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {summary.calendarWeeks > appetite 
                      ? `Over appetite by ${(summary.calendarWeeks - appetite).toFixed(1)} weeks`
                      : `${Math.round((summary.calendarWeeks / appetite) * 100)}% of ${appetite} week appetite`
                    }
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* Journey Size on its own row */}
              <div className="flex justify-center">
                <JourneySizeScale currentSize={summary.journeySize} compact />
              </div>
            </div>
          </div>

          {/* Desktop: Single row layout */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Journey Name */}
            <div className="min-w-[140px] max-w-[200px]">
              {isEditingName || !journeyName ? (
                <Input 
                  value={journeyName}
                  onChange={e => setJourneyName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                  placeholder="Journey name..."
                  autoFocus
                  className="h-8 text-sm"
                />
              ) : (
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors group"
                >
                  <span className="truncate max-w-[160px]">{journeyName}</span>
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Team Size */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-foreground/60">Team Size</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleDecrement} disabled={teamSize <= 1}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium">{teamSize}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleIncrement} disabled={teamSize >= 10}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Appetite */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-foreground/60">Delivery Appetite</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-7 gap-1 px-2 text-sm">
                    {appetite} wks
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((weeks) => (
                    <DropdownMenuItem 
                      key={weeks}
                      onClick={() => setAppetite(weeks)}
                      className={appetite === weeks ? 'bg-accent' : ''}
                    >
                      {weeks} week{weeks > 1 ? 's' : ''}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Summary Section */}
            <div className="flex items-center gap-3 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm">
                    <span className="font-medium">{summary.totalDevDays}</span>
                    <span className="text-foreground/60 ml-1">dev-days</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <div className="space-y-1">
                    {summary.greenDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Now: {summary.greenDevDays}d</div>}
                    {summary.amberDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Next: {summary.amberDevDays}d</div>}
                    {summary.purpleDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500" /> Later: {summary.purpleDevDays}d</div>}
                    {summary.unassignedDevDays > 0 && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-muted" /> Unassigned: {summary.unassignedDevDays}d</div>}
                  </div>
                </TooltipContent>
              </Tooltip>

              <div className="text-sm text-foreground/70">{summary.timeEstimate}</div>

              <JourneySizeScale currentSize={summary.journeySize} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          summary.calendarWeeks > appetite ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min((summary.calendarWeeks / appetite) * 100, 100)}%` }}
                      />
                    </div>
                    {summary.calendarWeeks > appetite && (
                      <span className="text-destructive text-xs font-medium">!</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {summary.calendarWeeks > appetite 
                    ? `Over appetite by ${(summary.calendarWeeks - appetite).toFixed(1)} weeks`
                    : `${Math.round((summary.calendarWeeks / appetite) * 100)}% of ${appetite} week appetite`
                  }
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Scrolling Area */}
        <main className="flex-1 overflow-x-auto pb-6">
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
      </div>
    </div>;
};

export default Index;
