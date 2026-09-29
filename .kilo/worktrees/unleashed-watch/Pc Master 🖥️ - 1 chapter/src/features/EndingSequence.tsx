import { useEffect, useCallback } from 'react';
import { BiosInterface } from './BiosInterface';
import { useGameStore } from '@/core/store';
import { PrologueDesktop } from './Chapters/Prologue/PrologueDesktop';
import { BootSequence } from './Transitions/BootSequence';
import { ChaosOverlay } from './Transitions/ChaosOverlay';
import { CleanDesktopCh1 } from './Chapters/Chapter1/CleanDesktopCh1';
import { motion } from 'framer-motion';
import { cn } from '@/core/utils';
import { 
  stopBGM
} from '@/core/audio';
import { t } from '@/core/i18n';

export const EndingSequence = () => {
  const { endingStage, setEndingStage } = useGameStore();

  // === HANDLERS ===
  const handleChaosFinish = useCallback(() => setEndingStage('bios_prologue'), [setEndingStage]);
  
  const handlePrologueBiosFinish = useCallback((success: boolean) => {
    if (success) setEndingStage('rebooting_ch1_black');
  }, [setEndingStage]);

  const handleAcceptDD = () => {
    setEndingStage('end_of_content');
  };

  // === EFFECTS ===

  // Music management
  useEffect(() => {
    if (endingStage === 'chaos_ch1') {
      stopBGM(0); // Cut immediately
    }
  }, [endingStage]);

  // Keyboard listener for BIOS entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'F2') {
        if (endingStage === 'chaos_ch1') setEndingStage('bios_prologue');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [endingStage, setEndingStage]);

  return (
    <div className={cn(
      "fixed inset-0 z-50000 overflow-hidden select-none",
      endingStage === 'chaos_ch1' ? "bg-transparent" : "bg-black"
    )}>
      
      {/* --- CHAPTERS --- */}
      {endingStage === 'chaos_ch1' && <ChaosOverlay onFinish={handleChaosFinish} />}
      {endingStage === 'clean_desktop_ch1' && <CleanDesktopCh1 onContinue={handleAcceptDD} />}

      {/* --- TRANSITIONS --- */}
      {endingStage === 'rebooting_ch1_black' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-50000" onAnimationComplete={() => setTimeout(() => setEndingStage('booting_chapter1'), 2000)} />
      )}
      {endingStage === 'booting_chapter1' && <BootSequence onFinish={() => setEndingStage('loading_desktop_ch1')} />}
      {endingStage === 'loading_desktop_ch1' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-50000 flex items-center justify-center" onAnimationComplete={() => setTimeout(() => setEndingStage('clean_desktop_ch1'), 1500)}>
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        </motion.div>
      )}

      {/* --- BIOS --- */}
      {endingStage === 'bios_prologue' && (
        <div className="fixed inset-0 z-70000 bg-black">
          <BiosInterface onFinishEnding2={handlePrologueBiosFinish} mode="ch1" />
        </div>
      )}

      {/* --- FINALE --- */}
      {endingStage === 'end_of_content' && (
        <div className="fixed inset-0 bg-black z-100000 flex flex-col items-center justify-center p-20 text-center font-mono text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black mb-8 tracking-tighter">
            {t('ending.full_history')}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-lg opacity-60 max-w-2xl leading-relaxed">
            {t('ending.congrats')}
          </motion.div>
          <button onClick={() => window.location.reload()} className="mt-12 px-10 py-3 bg-red-600 hover:bg-red-500 transition-colors font-black tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            {t('ending.restart')}
          </button>
        </div>
      )}
    </div>
  );
};
