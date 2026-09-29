import { useEffect, useRef, useState } from 'react';
import { useGameStore, Screen } from '@/core/store';
import { motion } from 'framer-motion';
import { playButtonSound } from '@/core/audio';
import { t } from '@/core/i18n';

export const IntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setScreen, isReWatchingTeaser, setIsReWatchingTeaser } = useGameStore();
  const [started, setStarted] = useState(isReWatchingTeaser);

  useEffect(() => {
    if (!started) return;

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (isReWatchingTeaser) {
        setIsReWatchingTeaser(false);
      }
      setScreen(Screen.START);
    };

    video.addEventListener('ended', handleEnded);
    
    video.play().catch((err) => {
      console.warn("Video play failed", err);
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [started, setScreen]);

  const handleStartAdventure = () => {
    playButtonSound();
    setStarted(true);
  };

  const handleSkip = () => {
    playButtonSound();
    if (isReWatchingTeaser) {
      setIsReWatchingTeaser(false);
    }
    setScreen(Screen.START);
  };

  if (!started) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center gap-6">
        <button 
          onClick={handleStartAdventure}
          className="matrix-button group"
        >
          <span className="group-hover:animate-pulse tracking-tighter uppercase">{t('menu.start')}</span>
        </button>
        <p className="text-matrix text-sm uppercase tracking-widest glow-text animate-pulse">
          {t('intro.fullscreen_hint')}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src="/textures/start.mp4"
        className="max-h-full max-w-full"
        autoPlay
        playsInline
      />
      <button 
        onClick={handleSkip}
        className="absolute bottom-10 right-10 opacity-0 hover:opacity-100 transition-opacity text-matrix text-xs border border-matrix p-2 group"
      >
        <span className="group-hover:glow-text uppercase">{t('intro.skip')}</span>
      </button>
    </div>
  );
};
