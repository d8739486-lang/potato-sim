import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { playButtonSound, playSound, AUDIO_PATHS } from '@/core/audio';
import { MatrixRain } from '@/components/MatrixRain';
import { Globe } from 'lucide-react';

export const LanguageSelect = () => {
  const { setScreen, setLanguage } = useGameStore();

  const handleSelect = (lang: 'en' | 'ru') => {
    playButtonSound();
    setLanguage(lang);
    // Move to Preloader screen after selection
    setScreen(Screen.PRELOADER);
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <MatrixRain opacity={0.2} speed={100} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="mb-16 flex flex-col items-center">
          <div className="w-16 h-16 mb-6 rounded-full bg-matrix/10 flex items-center justify-center border border-matrix/20 animate-pulse">
            <Globe className="w-8 h-8 text-matrix" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white/40">
            Select Language / Выберите язык
          </h2>
          <div className="h-px w-32 bg-matrix/30 mt-4" />
        </div>

        <div className="flex gap-8">
          <button
            onClick={() => handleSelect('en')}
            className="group relative px-12 py-4 border-2 border-matrix/20 text-matrix/40 hover:border-matrix hover:text-matrix transition-all font-black uppercase tracking-[0.4em] text-sm bg-matrix/5 rounded-sm cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 transition-transform group-hover:scale-110 block">English</span>
            <div className="absolute inset-0 bg-matrix/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,255,100,0)] group-hover:shadow-[inset_0_0_20px_rgba(0,255,100,0.1)] transition-all" />
          </button>

          <button
            onClick={() => handleSelect('ru')}
            className="group relative px-12 py-4 border-2 border-matrix/20 text-matrix/40 hover:border-matrix hover:text-matrix transition-all font-black uppercase tracking-[0.4em] text-sm bg-matrix/5 rounded-sm cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 transition-transform group-hover:scale-110 block">Русский</span>
            <div className="absolute inset-0 bg-matrix/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,255,100,0)] group-hover:shadow-[inset_0_0_20px_rgba(0,255,100,0.1)] transition-all" />
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full text-center">
        <p className="text-[10px] uppercase font-mono tracking-widest text-white/10">
          PC Master | Initial Handshake
        </p>
      </div>
    </div>
  );
};
