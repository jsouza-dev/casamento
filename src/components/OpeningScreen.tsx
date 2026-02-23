
'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpeningScreenProps {
  onOpen: () => void;
}

export function OpeningScreen({ onOpen }: OpeningScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F6F2] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative text-center space-y-12 max-w-2xl px-6 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-6">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground font-light">Convidamos para celebrar o amor de</p>
          <div className="flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-headline text-gold font-light leading-none">Felipe Augusto</h1>
            <div className="py-6 md:py-8">
              <span className="text-3xl md:text-5xl font-headline text-primary/40 italic">&</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline text-gold font-light leading-none">Rayssa Caldeira</h1>
          </div>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <p className="text-xl font-light">21 de Março de 2026</p>
          <p className="text-sm tracking-widest font-light">16:30H</p>
        </div>

        <div className="space-y-6 pt-8">
          <p className="text-sm font-light italic leading-relaxed max-w-md mx-auto px-4 text-muted-foreground">
            “Quando o Senhor restaurou a sorte de Sião, ficamos como quem sonha. Então, a nossa boca se encheu de riso, e a nossa língua, de júbilo.”
            <br />
            <span className="not-italic font-normal block mt-2 text-primary/60">— Salmos 126:1-2</span>
          </p>

          <Button 
            onClick={onOpen}
            size="lg"
            className="rounded-full bg-gold hover:bg-gold/90 text-white px-12 py-8 text-lg font-light transition-all hover:scale-105 shadow-md group"
          >
            Abrir Convite
            <Heart className="ml-2 h-5 w-5 fill-white/20 group-hover:fill-white/40 transition-all" />
          </Button>
        </div>
      </div>

      {/* Subtle border */}
      <div className="absolute inset-8 border border-primary/10 pointer-events-none rounded-[2rem]"></div>
    </div>
  );
}
