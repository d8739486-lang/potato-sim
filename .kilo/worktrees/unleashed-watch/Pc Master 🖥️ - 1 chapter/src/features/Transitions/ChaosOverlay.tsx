import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playErrorSound, playBsodSound } from '@/core/audio';
import { t } from '@/core/i18n';

interface WinErrorData {
  id: number;
  top: string;
  left: string;
  title?: string;
}

const WinError = ({ style, title = "Windows Error" }: { style: any, title?: string }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    style={style}
    className="fixed z-9999 w-[300px] md:w-[400px] bg-[#f0f0f0] border border-[#707070] shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-sans text-black overflow-hidden pointer-events-none"
  >
    <div className="bg-linear-to-r from-[#0054e3] to-[#2788f5] px-2 py-1 flex justify-between items-center">
      <span className="text-white text-[11px] font-bold">{title}</span>
      <div className="flex gap-1">
        <button className="w-5 h-5 bg-[#e81123] text-white flex items-center justify-center text-[10px]">✕</button>
      </div>
    </div>
    <div className="p-4 flex gap-4 items-start">
      <div className="w-8 h-8 shrink-0 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">✕</div>
      <div className="flex-1">
        <p className="text-[11px] leading-tight mb-4">A critical system error has occurred. Memory at 0x00000000 could not be read.</p>
        <div className="flex justify-center">
          <button className="px-8 py-1 bg-[#e1e1e1] border border-[#adadad] shadow-[inset_0_0_100px_white] text-[10px]">OK</button>
        </div>
      </div>
    </div>
  </motion.div>
);

interface ChaosOverlayProps {
  onFinish: () => void;
}

export const ChaosOverlay = ({ onFinish }: ChaosOverlayProps) => {
  const [errors, setErrors] = useState<WinErrorData[]>([]);
  const [isBsod, setIsBsod] = useState(false);
  const [bsodProgress, setBsodProgress] = useState(0);
  const [showDiskError, setShowDiskError] = useState(false);

  useEffect(() => {
    let timers: any[] = [];
    
    // Stage 1: 5 errors total, 1 error per second
    for (let i = 1; i <= 5; i++) {
        timers.push(setTimeout(() => {
            setErrors(prev => [...prev.slice(-40), { 
                id: Date.now() + i, 
                top: `${20 + Math.random() * 50}%`,
                left: `${20 + Math.random() * 40}%`,
                title: `Windows Error ${i}`
            }]);
            playErrorSound();
        }, i * 1000));
    }

    // Stage 2: 2 seconds pause after the 5th error, then 2s chaos
    // 5s (5th error) + 2s pause = 7s total delay before chaos starts
    timers.push(setTimeout(() => {
        const chaosInterval = setInterval(() => {
            setErrors(prev => [...prev.slice(-100), { 
                id: Date.now() + Math.random(), 
                top: `${Math.random() * 85}%`, 
                left: `${Math.random() * 75}%` 
            }]);
            playErrorSound();
        }, 40);
        
        // Chaos lasts for 2 seconds
        timers.push(setTimeout(() => {
            clearInterval(chaosInterval);
            setIsBsod(true);
            
            // Stop all sounds before BSOD, then play BSOD sound
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(a => {
              a.pause();
              a.currentTime = 0;
            });
            
            playBsodSound(); 
        }, 2000));
    }, 7000));

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  useEffect(() => {
    let interval: any;
    if (isBsod) {
      interval = setInterval(() => {
        setBsodProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setShowDiskError(true);
            return 100;
          }
          return p + 1;
        });
      }, 50); // ~5 seconds to reach 100%
    }
    return () => clearInterval(interval);
  }, [isBsod]);

  if (isBsod) {
    return (
      <div className="fixed inset-0 bg-[#0078d7] text-white font-sans p-10 md:p-20 z-99999 flex flex-col items-start justify-center cursor-none select-none">
        <div className="text-9xl mb-10 font-light">:(</div>
        <h1 className="text-2xl md:text-3xl mb-10 max-w-4xl font-light leading-snug">
          {t('chaos.bsod_message')}
        </h1>
        <div className="text-2xl mb-16 opacity-90">({bsodProgress}% {t('i18n.complete') || 'complete'})</div>
        
        <AnimatePresence>
          {showDiskError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 text-xl font-mono uppercase tracking-widest text-white/80">
               {t('chaos.storage_error')}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2 text-sm opacity-60 font-light">
           <p>{t('chaos.stop_code')}</p>
           <p className="mt-4 text-[10px] uppercase tracking-widest animate-pulse font-mono bg-white/10 px-2 py-1 w-fit rounded">{t('chaos.f2_hint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-99998 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {errors.map((error) => (
          <WinError key={error.id} title={error.title} style={{ top: error.top, left: error.left }} />
        ))}
      </AnimatePresence>
    </div>
  );
};
