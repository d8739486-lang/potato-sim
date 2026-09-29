import { useGameStore, Screen } from '@/core/store';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { IntroVideo } from '@/features/IntroVideo';
import { StartMenu } from '@/features/StartMenu';
import { GameLayout } from '@/features/GameLayout';
import { EndingSequence } from '@/features/EndingSequence';
import { ModalManager } from '@/components/ModalManager';
import { LanguageSelect } from '@/features/LanguageSelect';
import { CustomCursor } from '@/components/CustomCursor';
import { Preloader } from '@/features/Preloader';

export default function App() {
  const { 
    screen, setScreen, resetGame,
    endingStage, setEndingStage 
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PREVENT ESCAPE: Disable default Escape behavior to the main menu
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black select-none">
      <CustomCursor />
      <ModalManager />

      <AnimatePresence mode="wait">
        {screen === Screen.LANGUAGE_SELECT && (
          <motion.div
            key="language"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <LanguageSelect />
          </motion.div>
        )}

        {screen === Screen.PRELOADER && (
          <motion.div
            key="preloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <Preloader />
          </motion.div>
        )}

        {screen === Screen.INTRO && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="h-full w-full"
          >
            <IntroVideo />
          </motion.div>
        )}

        {screen === Screen.START && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-full w-full"
          >
            <StartMenu />
          </motion.div>
        )}

        {(screen === Screen.GAME || screen === Screen.ENDING) && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <GameLayout />
          </motion.div>
        )}

        {screen === Screen.ENDING && endingStage !== 'idle' && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            <EndingSequence />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
