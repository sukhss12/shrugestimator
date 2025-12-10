import { Logo } from './Logo';

export const BrandHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-background border-b border-border">
      <div className="flex items-center gap-3">
        <Logo width={48} />
        <div>
          <span className="text-base font-bold text-foreground leading-none">Shrug</span>
          <p className="text-xs text-muted-foreground italic">Product estimation, roughly</p>
        </div>
      </div>
    </header>
  );
};
