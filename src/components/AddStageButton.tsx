import { Plus } from 'lucide-react';

interface AddStageButtonProps {
  onClick: () => void;
}

export const AddStageButton = ({ onClick }: AddStageButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-[280px] min-h-[400px] border-2 border-dashed border-border rounded-lg shrink-0 text-muted-foreground hover:border-muted-foreground hover:bg-muted/20 transition-colors cursor-pointer group"
    >
      <Plus className="h-8 w-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className="text-sm font-medium">Add stage</span>
    </button>
  );
};
