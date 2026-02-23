
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
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
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
        },
      });
    };
  }, []);

  useEffect(() => {
    if (playOnOpen && isReady && playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [playOnOpen, isReady]);

  const toggleMusic = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <div id="youtube-player" className="hidden" />
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
