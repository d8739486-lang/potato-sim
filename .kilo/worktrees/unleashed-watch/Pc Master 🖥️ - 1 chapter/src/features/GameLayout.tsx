import { useGameStore, LEVELS_DATA, GameTab, Screen } from '@/core/store';
import { playBGM, AUDIO_PATHS, playPanelSound } from '@/core/audio';
import { MatrixRain } from '@/components/MatrixRain';
import { GlitchOverlay } from '@/components/GlitchOverlay';
import { EvolutionGate } from '@/components/EvolutionGate';
import { TopPanel } from './TopPanel';
import { TopBar } from './TopBar';
import { ClickerZone } from './ClickerZone';
import { UpgradePanel } from './UpgradePanel';
import { HardwarePanel } from './HardwarePanel';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const GameLayout = () => {
  const { evolution, addMoney, autoGen, buyUpgrade, evolve, upgrades, activeTab, isEvolving } = useGameStore();
  const currentLevel = LEVELS_DATA[evolution];
  const [showGlitch, setShowGlitch] = useState(false);
  const prevEvolution = useRef(evolution);

  // Dynamic Theming: Inject CSS variables into document root
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentLevel.colors;
    
    root.style.setProperty('--matrix-color', colors.main);
    root.style.setProperty('--matrix-color-dim', `${colors.main}50`);
    root.style.setProperty('--matrix-color-dark', colors.dark);
    
    // Update body background glow if needed
    document.body.style.background = colors.bg;
  }, [currentLevel]);

  // Evolution Glitch Trigger (Original effect kept alongside new gate)
  useEffect(() => {
    if (evolution !== prevEvolution.current) {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 2000);
      prevEvolution.current = evolution;
    }
    
    // Play stage music with adequate delays for transitions
    const delay = evolution === 1 ? 1500 : 3000;
    switch (evolution) {
      case 1: playBGM(AUDIO_PATHS.MUSIC_STAGE_1, delay, 3000); break;
      case 2: playBGM(AUDIO_PATHS.MUSIC_STAGE_2, delay, 3000); break;
      case 3: playBGM(AUDIO_PATHS.MUSIC_STAGE_3, delay, 3000); break;
      default: playBGM(AUDIO_PATHS.MUSIC_STAGE_1, delay, 3000); break;
    }
  }, [evolution]);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useGameStore.getState();
      if (state.isEvolving || state.screen !== Screen.GAME) return; 

      if (e.key === '1' && state.activeTab !== GameTab.TERMINAL) { playPanelSound(200); state.setTab(GameTab.TERMINAL); }
      if (e.key === '2' && state.activeTab !== GameTab.HARDWARE) { playPanelSound(200); state.setTab(GameTab.HARDWARE); }
      if (e.key === '3' && state.activeTab !== GameTab.SHOP) { playPanelSound(200); state.setTab(GameTab.SHOP); }

      if (e.key.toLowerCase() === 'e') {
        const allMaxed = Object.values(state.upgrades).every(u => u.count >= u.max);
        if (allMaxed) state.evolve();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [evolve, upgrades, isEvolving, activeTab]);

  // Autoclicker Logic (Strict 1 click per second)
  useEffect(() => {
    const clickerLevel = upgrades.autoclicker.count;
    if (clickerLevel === 0 || isEvolving) return;

    // Strict 1 click per second (1000ms)
    const interval = setInterval(() => {
      addMoney();
    }, 1000);

    return () => clearInterval(interval);
  }, [upgrades.autoclicker.count, addMoney, isEvolving]);

  // Income Generator (Passive Income from GPU/CPU)
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoGen > 0 && !isEvolving) {
        addMoney(autoGen / 5); 
      }
    }, 200);

    return () => clearInterval(interval);
  }, [autoGen, addMoney, isEvolving]);

  return (
    <div className="relative h-full w-full flex flex-col pt-14 bg-[#000000] overflow-hidden select-none transition-all duration-1000">
      <EvolutionGate />
      
      <GlitchOverlay isVisible={showGlitch} />
      <MatrixRain opacity={0.25} blur={4} />
      <TopPanel />
      
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] transition-all duration-2000"
        style={{ background: currentLevel.colors.bg }}
      />

      <div className="flex-1 flex flex-col relative z-10 px-10 pb-10">
        <TopBar />
        
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeTab === GameTab.TERMINAL && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full w-full"
              >
                <ClickerZone />
              </motion.div>
            )}

            {activeTab === GameTab.HARDWARE && (
              <motion.div
                key="hardware"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full w-full"
              >
                <HardwarePanel />
              </motion.div>
            )}

            {activeTab === GameTab.SHOP && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full w-full flex items-center justify-center overflow-hidden"
              >
                <UpgradePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none bg-size-[100%_4px,3px_100%] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 opacity-20" />
    </div>
  );
};
