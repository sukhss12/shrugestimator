import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StageNavigationProps {
  children: React.ReactNode;
  stageCount: number;
}

export const StageNavigation = ({ children, stageCount }: StageNavigationProps) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileCarousel stageCount={stageCount}>{children}</MobileCarousel>;
  }
  
  return <DesktopScroller>{children}</DesktopScroller>;
};

// Mobile: Swipeable carousel with dots
const MobileCarousel = ({ children, stageCount }: { children: React.ReactNode; stageCount: number }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="flex flex-col h-full">
      {/* Carousel */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 h-full">
          {children}
        </div>
      </div>
      
      {/* Dots indicator */}
      {stageCount > 1 && (
        <div className="flex justify-center gap-2 py-3">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to stage ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Desktop: Horizontal scroll with arrow buttons
const DesktopScroller = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    
    // Also check on resize
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    
    return () => {
      el.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  // Re-check when children change
  useEffect(() => {
    checkScroll();
  }, [children, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollAmount = 300; // Roughly one card width
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative flex-1 h-full">
      {/* Left Arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-r from-background via-background/80 to-transparent pl-1 pr-4 py-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-md bg-card hover:bg-accent"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 h-full overflow-x-auto overflow-y-visible scrollbar-hide items-start"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      
      {/* Right Arrow */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-l from-background via-background/80 to-transparent pr-1 pl-4 py-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-md bg-card hover:bg-accent"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
