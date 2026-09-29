import { motion, AnimatePresence } from 'framer-motion';
import { playPcClickSound, playButtonSound } from '@/core/audio';
import { useGameStore, LEVELS_DATA, Screen } from '@/core/store';
import { cn } from '@/core/utils';
import { useState } from 'react';
import { t } from '@/core/i18n';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: string;
}

export const ClickerZone = () => {
  const { evolution, addMoney, upgrades, evolve, isEvolving, clickPower, setScreen } = useGameStore();
  const currentLevel = LEVELS_DATA[evolution];
  
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const allMaxed = Object.values(upgrades).every(u => u.count >= u.max);

  const handleClick = (e: React.MouseEvent) => {
    if (isEvolving) return;
    
    // Play sound and add money
    playPcClickSound();
    addMoney();
    
    // Create floating text
    const newText: FloatingText = {
      id: Date.now(),
      x: e.clientX + (Math.random() * 40 - 20),
      y: e.clientY + (Math.random() * 40 - 20),
      value: `+$${clickPower.toFixed(1)}`
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    
    // Remove after 1 second
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-10 relative overflow-hidden bg-black/20 rounded-3xl border border-matrix/10">
      {/* "Tap for Money" Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 flex flex-col items-center z-20"
      >
        <h2 className="text-2xl md:text-4xl font-black text-matrix glow-text-matrix tracking-[0.2em] uppercase animate-pulse mb-2">
            {t('clicker.title')}
        </h2>
        <div className="h-0.5 w-48 bg-linear-to-r from-transparent via-matrix to-transparent opacity-50" />
      </motion.div>

      {/* Main Clicker Object */}
      <motion.div
        whileHover={{ 
          scale: isEvolving ? 1 : 1.05, 
          filter: isEvolving ? "none" : "brightness(1.1) drop-shadow(0 0 50px var(--matrix-color-dim))" 
        }}
        whileTap={{ 
          scale: isEvolving ? 1 : 0.95, 
          filter: isEvolving ? "none" : "brightness(1.5) drop-shadow(0 0 80px var(--matrix-color))" 
        }}
        onClick={handleClick}
        className={cn(
          "transition-all duration-300 relative group z-10",
          isEvolving ? "cursor-default opacity-50 grayscale" : "cursor-pointer"
        )}
      >
        <div className="absolute inset-x-0 -bottom-10 h-2 bg-matrix/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src={currentLevel.assets.pc}
          alt="PC"
          draggable="false"
          className={cn(
            "max-w-[360px] md:max-w-[480px] h-auto pointer-events-none drop-shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-transform duration-700",
            evolution === 1 && "scale-x-[-1]",
            evolution === 3 && "scale-110 drop-shadow-[0_0_60px_rgba(var(--matrix-color-rgb),0.4)]"
          )}
        />
      </motion.div>
      
      {/* Evolution / End Game Buttons */}
      <div className="absolute bottom-6 flex flex-col items-center gap-6 z-20">
        <AnimatePresence>
          {allMaxed && evolution < 3 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px var(--matrix-color-dim)" }}
              onClick={() => evolve()}
              disabled={isEvolving}
              className="px-12 py-5 bg-matrix text-black font-black text-2xl rounded-2xl animate-pulse shadow-[0_0_30px_rgba(var(--matrix-color-rgb),0.5)] uppercase tracking-tighter disabled:opacity-0"
            >
              {t('clicker.evolve')}
            </motion.button>
          )}

          {allMaxed && evolution === 3 && (
            <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center"
            >
                <p className="text-matrix/40 text-[10px] uppercase tracking-[1em] mb-4">{t('clicker.maxed')}</p>
                <button
                    onClick={() => { useGameStore.getState().setEndingStage('chaos_ch1'); setScreen(Screen.ENDING); }}
                    className="px-12 py-6 bg-matrix text-black font-black text-2xl rounded-2xl animate-pulse shadow-[0_0_50px_rgba(var(--matrix-color-rgb),0.6)] uppercase tracking-tighter hover:bg-white transition-all active:scale-95"
                >
                    {t('clicker.certificate')}
                </button>
            </motion.div>
          )}

          {!allMaxed && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-matrix/20 text-[10px] uppercase tracking-[1em] animate-pulse select-none"
            >
              {t('clicker.waiting')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Click Texts */}
      <AnimatePresence>
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            initial={{ opacity: 1, scale: 0.5, y: -20 }}
            animate={{ opacity: 0, scale: 1.5, y: -120 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none font-black text-2xl text-matrix glow-text z-100"
            style={{ left: text.x, top: text.y }}
          >
            {text.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--matrix-color-dim)_0%,transparent_70%)]" />
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
      </div>
    </div>
  );
};
