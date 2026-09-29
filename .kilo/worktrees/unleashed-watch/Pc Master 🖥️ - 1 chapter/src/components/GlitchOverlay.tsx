import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, LEVELS_DATA } from '@/core/store';

export const GlitchOverlay = ({ isVisible }: { isVisible: boolean }) => {
  const { evolution } = useGameStore();
  const currentLevel = LEVELS_DATA[evolution];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 pointer-events-none flex flex-col items-center justify-center bg-black/40 overflow-hidden"
        >
          {/* Main Glitch Text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10vw] font-black italic select-none relative"
            style={{ color: currentLevel.colors.main }}
          >
            <span className="relative z-10">EVOLUTION_UPRADE</span>
            
            {/* Layers for glitch effect */}
            <motion.span 
              animate={{ x: [-2, 2, -1, 1, 0], y: [1, -1, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              className="absolute inset-0 z-0 text-red-500 opacity-70 blur-[1px]"
            >
              EVOLUTION_UPRADE
            </motion.span>
            <motion.span 
              animate={{ x: [2, -2, 1, -1, 0], y: [-1, 1, -2, 2, 0] }}
              transition={{ repeat: Infinity, duration: 0.1, delay: 0.05 }}
              className="absolute inset-0 z-0 text-blue-500 opacity-70 blur-[1px]"
            >
              EVOLUTION_UPRADE
            </motion.span>
          </motion.div>

          {/* Random Scanlines */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 0.2 + Math.random() * 0.3, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              className="absolute h-px w-full bg-matrix/30 blur-[2px]"
              style={{ top: `${Math.random() * 100}%` }}
            />
          ))}

          {/* Glitch Blocks */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`block-${i}`}
              animate={{ 
                opacity: [0, 1, 0],
                x: [0, Math.random() * 100 - 50, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.2, delay: Math.random() * 1 }}
              className="absolute w-32 h-8 bg-matrix/20 blur-[4px]"
              style={{ 
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
