import { useGameStore, LEVELS_DATA } from '@/core/store';
import { t } from '@/core/i18n';

export const TopBar = () => {
  const { balance, autoGen, evolution } = useGameStore();
  const currentLevel = LEVELS_DATA[evolution];

  return (
    <div className="w-full flex justify-between items-end pb-4 mb-8 border-b border-matrix-dark z-10">
      <div className="text-sm tracking-widest opacity-70">
        {t('topBar.project')}: NULL_STABLE<br />
        {t('topBar.evolution')}: <span className="text-matrix font-bold">{evolution}</span>/3
      </div>
      
      <div className="text-right">
        <div className="text-xs opacity-60 uppercase tracking-widest mb-1">
          {t('topBar.autoGen')}: <span className="text-matrix">+${Math.floor(autoGen)}</span>/{t('topBar.sec')}
        </div>
        <div className="text-6xl font-black glow-text">
          ${Math.floor(balance)}
        </div>
      </div>
    </div>
  );
};
