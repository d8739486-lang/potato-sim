import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/core/store';

export const EvolutionGate = () => {
  const { isEvolving } = useGameStore();
  const [stage, setStage] = useState<'IDLE' | 'CLOSING' | 'CLOSED' | 'OPENING'>('IDLE');

  useEffect(() => {
    if (isEvolving && stage === 'IDLE') {
      setStage('CLOSING');
      setTimeout(() => {
        setStage('CLOSED');
      }, 900); // Wait for fade in
    } else if (!isEvolving && stage === 'CLOSED') {
      setStage('OPENING');
      setTimeout(() => {
        setStage('IDLE');
      }, 1200); // Wait for fade out
    }
  }, [isEvolving, stage]);

  if (stage === 'IDLE') return null;

  return (
    <AnimatePresence>
      <motion.div 
        key="fade-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: (stage === 'CLOSING' || stage === 'CLOSED') ? 1 : 0 }}
        transition={{ duration: stage === 'CLOSING' ? 0.9 : 1.2 }}
        className="fixed inset-0 z-[2000] bg-black flex flex-col justify-center items-center pointer-events-none"
      >
        <div className="flex flex-col items-center max-w-2xl px-6 text-center">
           <div className="text-matrix font-black text-2xl md:text-3xl tracking-[0.5em] animate-pulse mb-8 uppercase">
             {stage === 'CLOSED' ? 'ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...' : 'ПЕРЕХОД НА СЛЕДУЮЩИЙ ЭТАП...'}
           </div>
           
           {(stage === 'CLOSING' || stage === 'CLOSED') && (
             <div className="w-full h-2 bg-matrix/10 rounded-full overflow-hidden border border-matrix/20">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: stage === 'CLOSED' ? '100%' : '20%' }}
                 transition={{ duration: stage === 'CLOSED' ? 2 : 0.9, ease: "linear" }}
                 className="h-full bg-matrix shadow-[0_0_20px_var(--matrix-color)]"
               />
             </div>
           )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
