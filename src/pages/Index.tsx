import { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Minus, Plus, ChevronDown, Pencil, RotateCcw } from 'lucide-react';
import { SortableStageColumn } from '@/components/SortableStageColumn';
import { AddStageButton } from '@/components/AddStageButton';
import { JourneySizeScale } from '@/components/JourneySizeScale';
import { StageNavigation } from '@/components/StageNavigation';
import { BrandHeader } from '@/components/BrandHeader';
import { HeroSection } from '@/components/HeroSection';
import { TShirtSize, ReleaseColour } from '@/types';
import { SIZE_DAYS, WORKING_DAYS_PER_WEEK, getJourneySize, MIN_TEAM_SIZE, MAX_TEAM_SIZE, SCOPE_OPTIONS } from '@/lib/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  scope: number;
  stages: Stage[];
}

const calculateFeatureDays = (estimates?: FeatureEstimates): number => {
  if (!estimates) return 0;
  return SIZE_DAYS[estimates.fe] + SIZE_DAYS[estimates.be] + SIZE_DAYS[estimates.db] + SIZE_DAYS[estimates.int];
};

const defaultData: StoredData = {
  journeyName: '',
  teamSize: 2,
  scope: 6,
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
      // Backward compatibility: migrate sprintWeeks/appetite to scope
      return {
        ...defaultData,
        ...data,
        scope: data.scope ?? data.appetite ?? data.sprintWeeks ?? 6
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
  const [editingNameValue, setEditingNameValue] = useState('');
  const [teamSize, setTeamSize] = useState(2);
  const [scope, setScope] = useState(6);
  const [stages, setStages] = useState<Stage[]>([]);
  const [newStageId, setNewStageId] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const startEditingName = () => {
    setEditingNameValue(journeyName);
    setIsEditingName(true);
  };

  const commitName = () => {
    setJourneyName(editingNameValue.trim());
    setIsEditingName(false);
  };

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
    setScope(data.scope);
    setStages(data.stages);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({
        journeyName,
        teamSize,
        scope,
        stages
      });
    }
  }, [journeyName, teamSize, scope, stages, isLoaded]);

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
    if (teamSize > MIN_TEAM_SIZE) setTeamSize(teamSize - 1);
  };

  const handleIncrement = () => {
    if (teamSize < MAX_TEAM_SIZE) setTeamSize(teamSize + 1);
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

  const handleReset = () => {
    setJourneyName(defaultData.journeyName);
    setTeamSize(defaultData.teamSize);
    setScope(defaultData.scope);
    setStages(defaultData.stages);
    setResetDialogOpen(false);
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
            {/* Row 1: Journey Name + Reset */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex-1 min-w-0">
                {isEditingName || !journeyName ? (
                  <Input 
                    value={isEditingName ? editingNameValue : ''}
                    onChange={e => setEditingNameValue(e.target.value.slice(0, 60))}
                    onBlur={commitName}
                    onKeyDown={e => e.key === 'Enter' && commitName()}
                    onFocus={() => !isEditingName && startEditingName()}
                    placeholder="Journey name..."
                    autoFocus
                    maxLength={60}
                    className="h-8 text-sm w-full"
                  />
                ) : (
                  <button 
                    onClick={startEditingName}
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                  >
                    <span className="truncate">{journeyName}</span>
                    <Pencil className="h-3 w-3 opacity-60 flex-shrink-0" />
                  </button>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-foreground/50 hover:text-foreground"
                    onClick={() => setResetDialogOpen(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Reset all</TooltipContent>
              </Tooltip>
            </div>

            {/* Row 2: Controls */}
            <div className="flex items-center justify-between gap-2">
              {/* Team Size */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/60">Team</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleDecrement} disabled={teamSize <= MIN_TEAM_SIZE}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{teamSize}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleIncrement} disabled={teamSize >= MAX_TEAM_SIZE}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Scope */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/60">Scope</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-7 gap-1 px-2 text-sm">
                      {scope} wks
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    {SCOPE_OPTIONS.map((weeks) => (
                      <DropdownMenuItem 
                        key={weeks}
                        onClick={() => setScope(weeks)}
                        className={scope === weeks ? 'bg-accent' : ''}
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground/60">Scope</span>
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        summary.calendarWeeks > scope ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((summary.calendarWeeks / scope) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums ${summary.calendarWeeks > scope ? 'text-destructive' : 'text-foreground/60'}`}>
                    {Math.round((summary.calendarWeeks / scope) * 100)}%
                  </span>
                </div>
              </div>
              {/* Journey Size on its own row */}
              <div className="flex justify-center">
                <JourneySizeScale currentSize={summary.journeySize} compact />
              </div>
            </div>
          </div>

          {/* Desktop: Two row layout for medium, single row for large */}
          <div className="hidden sm:block">
            {/* Row 1: Settings */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Journey Name */}
              <div className="min-w-[140px] max-w-[280px]">
                {isEditingName || !journeyName ? (
                  <Input 
                    value={isEditingName ? editingNameValue : ''}
                    onChange={e => setEditingNameValue(e.target.value.slice(0, 60))}
                    onBlur={commitName}
                    onKeyDown={e => e.key === 'Enter' && commitName()}
                    onFocus={() => !isEditingName && startEditingName()}
                    placeholder="Journey name..."
                    autoFocus
                    maxLength={60}
                    className="h-8 text-sm"
                  />
                ) : (
                  <button 
                    onClick={startEditingName}
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                  >
                    <span className="truncate max-w-[240px]">{journeyName}</span>
                    <Pencil className="h-3 w-3 opacity-60 flex-shrink-0" />
                  </button>
                )}
              </div>

              {/* Reset Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-foreground/50 hover:text-foreground"
                    onClick={() => setResetDialogOpen(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Reset all</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border hidden lg:block" />

              {/* Team Size */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/60 hidden lg:inline">Team Size</span>
                <span className="text-xs text-foreground/60 lg:hidden">Team</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleDecrement} disabled={teamSize <= MIN_TEAM_SIZE}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{teamSize}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleIncrement} disabled={teamSize >= MAX_TEAM_SIZE}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Scope */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/60 hidden lg:inline">Delivery Scope</span>
                <span className="text-xs text-foreground/60 lg:hidden">Scope</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-7 gap-1 px-2 text-sm">
                      {scope} wks
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    {SCOPE_OPTIONS.map((weeks) => (
                      <DropdownMenuItem 
                        key={weeks}
                        onClick={() => setScope(weeks)}
                        className={scope === weeks ? 'bg-accent' : ''}
                      >
                        {weeks} week{weeks > 1 ? 's' : ''}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="w-px h-6 bg-border hidden xl:block" />

              {/* Summary Section - inline on xl, below on smaller */}
              <div className="hidden xl:flex items-center gap-3 ml-auto">
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

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground/60">Scope</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        summary.calendarWeeks > scope ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((summary.calendarWeeks / scope) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums ${summary.calendarWeeks > scope ? 'text-destructive' : 'text-foreground/60'}`}>
                    {Math.round((summary.calendarWeeks / scope) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Summary (shown on sm/md/lg, hidden on xl) */}
            <div className="flex xl:hidden items-center justify-between gap-3 pt-3 mt-3 border-t border-border">
              <div className="flex items-center gap-3">
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
              </div>

              <div className="flex items-center gap-3">
                <JourneySizeScale currentSize={summary.journeySize} />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground/60">Scope</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        summary.calendarWeeks > scope ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((summary.calendarWeeks / scope) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums ${summary.calendarWeeks > scope ? 'text-destructive' : 'text-foreground/60'}`}>
                    {Math.round((summary.calendarWeeks / scope) * 100)}%
                  </span>
                </div>
              </div>
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

        {/* Footer */}
        <footer className="py-6 text-center space-y-1">
          <p className="text-xs text-muted-foreground/50">This app is free to use forever, I guess.</p>
          <p className="text-sm text-muted-foreground/40">¯\_(ツ)_/¯</p>
        </footer>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset everything?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the journey name, reset team size and scope to defaults, and delete all stages and features. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default Index;
