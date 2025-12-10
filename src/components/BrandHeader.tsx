import { Logo } from './Logo';

export const BrandHeader = () => {
  return (
    <header className="fixed top-0 left-0 z-50 p-4">
      <div className="flex items-center gap-2">
        <Logo width={32} />
        <div>
          <span className="text-sm font-bold text-foreground leading-none">Shrug</span>
          <p className="text-[10px] text-muted-foreground italic">Product estimation, roughly</p>
        </div>
      </div>
    </header>
  );
};
