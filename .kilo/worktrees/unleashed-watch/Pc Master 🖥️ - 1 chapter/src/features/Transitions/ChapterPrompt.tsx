import { motion } from 'framer-motion';
import { playButtonSound } from '@/core/audio';
import { t } from '@/core/i18n';

interface ChapterPromptProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ChapterPrompt = ({ title, onConfirm, onCancel }: ChapterPromptProps) => {
  return (
    <div className="fixed inset-0 bg-black z-50000 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white font-sans text-center">
        <h2 className="text-4xl font-bold mb-10">{title}</h2>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => { playButtonSound(); onConfirm(); }} 
            className="px-10 py-3 bg-white text-black font-bold hover:bg-gray-200 cursor-pointer"
          >
            {t('prompt.yes')}
          </button>
          <button 
            onClick={() => { playButtonSound(); onCancel(); }} 
            className="px-10 py-3 border border-white text-white font-bold hover:bg-white/10 cursor-pointer"
          >
            {t('prompt.no')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
