
'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
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
  const containerId = 'youtube-player-container';

  useEffect(() => {
    setIsMounted(true);

    // Function to initialize the YouTube player
    const initPlayer = () => {
      if (playerRef.current || !window.YT || !window.YT.Player) return;
      
      try {
        playerRef.current = new window.YT.Player(containerId, {
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
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(40);
              setIsReady(true);
              // If already open when ready, try to play
              if (playOnOpen) {
                event.target.playVideo();
                setIsPlaying(true);
              }
            },
            onStateChange: (event: any) => {
              // Handle loop manually if needed, though playlist param should cover it
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
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

    // Load YouTube API script
    if (!document.getElementById('youtube-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    // Set global callback
    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    }

    return () => {
      // Clean up if necessary
    };
  }, []);

  // React to playOnOpen changes
  useEffect(() => {
    if (isReady && playerRef.current) {
      try {
        if (playOnOpen) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        } else {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        }
      } catch (e) {
        console.error("Player interaction failed:", e);
      }
    }
  }, [playOnOpen, isReady]);

  const toggleMusic = () => {
    if (!playerRef.current || !isReady) return;
    
    try {
      const state = playerRef.current.getPlayerState();
      if (state === 1) { // Playing
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Toggle music error:", e);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="hidden" aria-hidden="true">
        <div id={containerId} />
      </div>
      {playOnOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMusic}
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-full bg-white/50 backdrop-blur-sm border border-primary/20 text-primary shadow-sm transition-all hover:scale-110 animate-in fade-in zoom-in duration-500"
          )}
        >
          {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      )}
    </>
  );
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
