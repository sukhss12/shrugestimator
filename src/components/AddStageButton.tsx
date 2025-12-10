import { Plus } from 'lucide-react';

interface AddStageButtonProps {
  onClick: () => void;
}

export const AddStageButton = ({ onClick }: AddStageButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-[280px] min-h-[400px] border-2 border-dashed border-border/50 rounded-xl shrink-0 text-foreground/50 hover:border-foreground/30 hover:text-foreground/70 hover:bg-foreground/5 transition-colors cursor-pointer group"
    >
      <Plus className="h-8 w-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className="text-sm font-medium">Add stage</span>
    </button>
  );
};
