
'use client';

import { cn } from '@/lib/utils';

interface MonogramProps {
  className?: string;
  showDate?: boolean;
}

export function Monogram({ className, showDate = false }: MonogramProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <div className="flex items-center gap-4 text-gold/40">
        <div className="h-[1px] w-8 bg-current"></div>
        <div className="font-headline text-2xl tracking-widest text-gold italic">
          F <span className="text-primary/30 not-italic mx-1">+</span> R
        </div>
        <div className="h-[1px] w-8 bg-current"></div>
      </div>
      {showDate && (
        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/60 mt-2">
          21.03.2026
        </p>
      )}
    </div>
  );
}
