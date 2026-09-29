import { motion } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { MatrixRain } from '@/components/MatrixRain';
import { useEffect, useState } from 'react';
import { playMenuSfx, playButtonSound, playBGM, pauseBGM, stopBGM, AUDIO_PATHS } from '@/core/audio';
import { t } from '@/core/i18n';

export const StartMenu = () => {
  const { setScreen, setIsReWatchingTeaser } = useGameStore();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    playMenuSfx();
    playBGM(AUDIO_PATHS.MUSIC_MENU, 1500, 2000);

    return () => { };
  }, []);

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    playButtonSound();
    stopBGM(1500);
    setScreen(Screen.GAME);
  };

  const handleWatchTeaser = () => {
    playButtonSound();
    pauseBGM(400);
    setIsReWatchingTeaser(true);
    setScreen(Screen.INTRO);
  };



  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-[#000000] overflow-hidden">
      <MatrixRain opacity={0.35} blur={2} speed={80} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <div className="mb-12">
          <h1 className="text-7xl font-black glow-text tracking-tight uppercase text-matrix scale-y-110">
            {t('menu.title')}
          </h1>

        </div>

        <div className="flex flex-col items-center gap-6">
          <motion.div
            key="start-buttons"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="matrix-button disabled:opacity-50 disabled:cursor-not-allowed group min-w-[300px]"
            >
              <span className="glow-text tracking-widest group-disabled:animate-none">
                {t('menu.start')}
              </span>
            </button>

            <button
              onClick={handleWatchTeaser}
              className="text-matrix/40 hover:text-matrix transition-all text-xs uppercase tracking-[0.2em] font-mono mt-2"
            >
              [ {t('menu.watch_teaser')} ]
            </button>

            <p className="text-red-500/50 text-[11px] uppercase tracking-wider font-mono -mt-1">
              {t('menu.sound_hint')}
            </p>

          </motion.div>

          <p className="text-matrix-dark text-[10px] mt-12 uppercase tracking-widest opacity-30">
            Build v1.0.4 | SYSTEM_READY
          </p>
        </div>
      </motion.div>
    </div>
  );
};
