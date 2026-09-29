import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore, Screen, LEVELS_DATA } from '@/core/store';
import { MatrixRain } from '@/components/MatrixRain';
import { t } from '@/core/i18n';

// Function to preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Always resolve, even on error, to not block indefinitely
  });
};

// Function to preload an audio
const preloadAudio = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = src;
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => resolve();
    setTimeout(resolve, 2000);
  });
};

export const Preloader = () => {
  const { setScreen } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      setStatusText(t('common.loading') || 'Loading assets...');

      const assetsToLoad: { url: string, type: 'img' | 'audio' }[] = [
        // Common textures
        { url: '/textures/photos/ad1.png', type: 'img' },
        { url: '/textures/photos/ad2.png', type: 'img' },
        { url: '/textures/photos/st_banner.png', type: 'img' },
        { url: '/textures/photos/st_contract.png', type: 'img' },
        { url: '/textures/photos/wallaper.webp', type: 'img' },
        { url: '/cursor.png', type: 'img' },
      ];

      // Add all level assets
      [1, 2, 3].forEach((level) => {
        const assets = LEVELS_DATA[level]?.assets;
        if (assets) {
          assetsToLoad.push({ url: assets.pc, type: 'img' });
          assetsToLoad.push({ url: assets.gpu, type: 'img' });
          assetsToLoad.push({ url: assets.cpu, type: 'img' });
          assetsToLoad.push({ url: assets.drive, type: 'img' });
          assetsToLoad.push({ url: assets.autoclicker, type: 'img' });
        }
      });

      const total = assetsToLoad.length;
      let loaded = 0;

      const promises = assetsToLoad.map(async (asset) => {
        if (asset.type === 'img') {
          await preloadImage(asset.url);
        } else if (asset.type === 'audio') {
          await preloadAudio(asset.url);
        }

        if (!isMounted) return;
        loaded++;
        setProgress(Math.round((loaded / total) * 100));
      });

      await Promise.all(promises);

      if (isMounted) {
        setStatusText(t('common.success') || 'Ready');
        await new Promise(r => setTimeout(r, 600)); // Hold at 100% for a moment
        setScreen(Screen.START);
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [setScreen]);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono select-none">
      <MatrixRain opacity={0.15} speed={80} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center"
      >
        <div className="text-matrix mb-8 text-center">
          <h2 className="text-xl font-bold tracking-[0.3em] uppercase mb-2 glow-text">
            INITIALIZING SYSTEM
          </h2>
          <p className="text-xs text-matrix/60 uppercase tracking-widest animate-pulse">
            {statusText}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-8 border-2 border-matrix/40 p-1 relative bg-black/50 overflow-hidden">
          {/* Animated Fill */}
          <motion.div
            className="h-full bg-matrix/80"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />

          {/* Grid Overlay for aesthetic */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,rgba(0,0,0,0.8)_100%)] bg-size-[10px_100%]" />
        </div>

        <div className="w-full flex justify-between mt-3 text-matrix/80 text-xs font-bold tracking-widest">
          <span>[ LOADING ]</span>
          <span>{progress}%</span>
        </div>

        <div className="mt-12 text-center text-matrix/30 text-[10px] tracking-[0.5em] uppercase">
          SECURE CONNECTION ESTABLISHED
        </div>
      </motion.div>
    </div>
  );
};
