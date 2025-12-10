import { useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const StageColumn = () => {
  const [stageName, setStageName] = useState('');
  const [features] = useState<string[]>([]);

  const handleAddFeature = () => {
    // Will be connected later
    console.log('Add feature clicked');
  };

  return (
    <div className="flex flex-col w-[280px] min-h-[400px] bg-background border border-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
        <Input
          type="text"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          placeholder="Stage name"
          className="flex-1 border-none shadow-none bg-transparent font-semibold text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0 h-auto py-0"
        />
      </div>

      {/* Features Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {features.length === 0 ? (
          <button
            onClick={handleAddFeature}
            className="w-full h-full min-h-[120px] flex items-center justify-center border-2 border-dashed border-border rounded-md text-muted-foreground text-sm hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            No features yet
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-3 bg-muted/50 border border-border rounded-md text-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFeature}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add feature
        </Button>
      </div>
    </div>
  );
};
