
'use client';

import { useState } from 'react';
import { OpeningScreen } from '@/components/OpeningScreen';
import { InvitationContent } from '@/components/InvitationContent';
import { MusicPlayer } from '@/components/MusicPlayer';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="min-h-screen relative bg-[#F8F6F2]">
      {!isOpen && (
        <OpeningScreen 
          key="opening-screen" 
          onOpen={() => setIsOpen(true)} 
        />
      )}
      
      {isOpen && (
        <div 
          key="invitation-container"
          className="animate-in fade-in slide-in-from-bottom-10 duration-1000"
        >
          <InvitationContent />
        </div>
      )}

      <MusicPlayer playOnOpen={isOpen} />
    </main>
  );
}
