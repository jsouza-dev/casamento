
'use client';

import { useState, useEffect, useRef } from 'react';
import { Music2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  playOnOpen: boolean;
}

export function MusicPlayer({ playOnOpen }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);

    const initPlayer = () => {
      if (playerRef.current) return;
      
      try {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: 'IQavyVVJmvo',
          playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: 'IQavyVVJmvo',
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(40);
              setIsReady(true);
            },
            onError: (e: any) => {
              console.error("YouTube Player Error:", e);
            }
          },
        });
      } catch (err) {
        console.error("Failed to initialize YouTube player:", err);
      }
    };

    // Load YouTube API script safely if not already present
    if (typeof document !== 'undefined' && !document.getElementById('youtube-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    if (typeof window !== 'undefined') {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
      } else {
        (window as any).onYouTubeIframeAPIReady = initPlayer;
      }
    }
  }, []);

  useEffect(() => {
    if (playOnOpen && isReady && playerRef.current) {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        // Silently fail if autoplay is blocked or player state is invalid
      }
    }
  }, [playOnOpen, isReady]);

  const toggleMusic = () => {
    if (!playerRef.current || !isReady) return;
    
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    } catch (e) {
      console.error("Toggle music error:", e);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="hidden" aria-hidden="true">
        <div id="youtube-player" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMusic}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full bg-white/50 backdrop-blur-sm border border-primary/20 text-primary shadow-sm transition-all hover:scale-110",
          !playOnOpen && "opacity-0 pointer-events-none"
        )}
      >
        {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
    </>
  );
}
