import React, { memo } from 'react';
import { useGameStore, LEVELS_DATA, UpgradeType, GameTab, Screen } from '@/core/store';
import { cn } from '@/core/utils';
import { playButtonSound, playPanelSound, playBuySound, playUnbuySound } from '@/core/audio';
import { t } from '@/core/i18n';

// Memoized UpgradeItem to optimize performance during high-frequency balance updates
const UpgradeItem = memo(({ 
  type, 
  evolution, 
  upgrade, 
  data, 
  price, 
  canAfford, 
  onBuy,
  language
}: { 
  type: UpgradeType;
  evolution: number;
  upgrade: any;
  data: any;
  price: number;
  canAfford: boolean;
  onBuy: (type: UpgradeType) => void;
  language: 'en' | 'ru' | null;
}) => {
  const isMaxed = upgrade.count >= upgrade.max;

  return (
    <div 
      className={cn(
        "flex flex-col p-5 bg-black border-2 rounded-2xl transition-all duration-300 group relative overflow-hidden h-full border-matrix/40",
        isMaxed 
          ? "border-matrix/20 shadow-none bg-matrix/5" 
          : canAfford 
            ? "border-matrix shadow-[0_0_20px_var(--matrix-color-dark)] hover:bg-matrix/10 cursor-pointer" 
            : "border-matrix/40 bg-black/40"
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="text-[9px] bg-matrix/20 text-matrix px-2 py-0.5 rounded font-black uppercase tracking-[0.2em]">
          SYSTEM_{type}
        </div>
        <div className="text-[10px] text-matrix font-mono font-bold bg-black px-2 py-0.5 rounded border border-matrix/20">
          {upgrade.count}/{upgrade.max}
        </div>
      </div>

      <div 
        className="w-full aspect-video bg-black/60 border border-matrix/30 rounded-xl mb-4 bg-contain bg-center bg-no-repeat transition-all duration-700 shadow-inner group-hover:scale-[1.02]"
        style={{ backgroundImage: `url(${LEVELS_DATA[evolution].assets[type]})` }}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="font-black text-lg mb-2 uppercase glow-text tracking-tighter leading-tight flex flex-col">
          <span className="text-matrix drop-shadow-[0_0_8px_var(--matrix-color-dim)] truncate">
            {typeof data.name === 'string' ? data.name : (language === 'en' ? data.name.en : data.name.ru)}
          </span>
          <span className="text-[10px] opacity-70 font-mono italic text-matrix-dark lowercase">({data.sub})</span>
        </h3>
        
        <div className="mb-4 bg-matrix/5 rounded-xl border-l-[3px] border-matrix/60 p-3 transition-all hover:bg-matrix/10">
          <p className="text-[12px] text-matrix/90 leading-relaxed italic font-medium">
            "{typeof data.memeDescription === 'string' ? data.memeDescription : (language === 'en' ? data.memeDescription.en : data.memeDescription.ru)}"
          </p>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => onBuy(type)}
            disabled={isMaxed}
            className={cn(
              "w-full py-4 rounded-xl font-black text-xl border-2 transition-all uppercase tracking-widest relative overflow-hidden group/btn disabled:grayscale",
              isMaxed 
                ? "border-matrix/5 text-matrix/10 cursor-default bg-transparent" 
                : canAfford 
                  ? "border-matrix text-matrix hover:bg-matrix hover:text-black cursor-pointer active:scale-[0.98] shadow-[0_0_20px_var(--matrix-color-dark)]" 
                  : "border-matrix/10 text-matrix/20 cursor-pointer bg-black/40 hover:border-matrix/40"
            )}
          >
            <span className="relative z-10">{isMaxed ? "MAX" : `$${price.toLocaleString()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export const UpgradePanel = () => {
  const { evolution, upgrades, balance, buyUpgrade, buyAll, getUpgradePrice, setTab, isEvolving, language } = useGameStore();
  const currentLevel = LEVELS_DATA[evolution];

  const handleBuy = (type: UpgradeType) => {
    if (isEvolving) return;
    const upgrade = upgrades[type];
    if (upgrade.count < upgrade.max) {
      const price = getUpgradePrice(type);
      if (balance >= price) {
        playBuySound();
        buyUpgrade(type);
      } else {
        playUnbuySound();
      }
    }
  };

  const handleBuyAll = () => {
    if (isEvolving) return;
    buyAll();
  };

  const allMaxed = Object.values(upgrades).every((u: any) => u.count >= u.max);

  return (
    <div className="flex-1 flex items-start justify-center p-4 bg-black/40 backdrop-blur-md overflow-hidden h-screen pt-4">
      <div className="w-[98vw] max-w-[1240px] bg-black border-2 border-matrix/60 rounded-3xl p-6 md:p-10 flex flex-col shadow-[0_0_150px_rgba(0,0,0,1)] h-[85vh] max-h-[85vh] relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-matrix/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative mb-6 text-center flex flex-col md:flex-row items-center justify-center gap-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter glow-text uppercase text-matrix leading-none inline-block">
            {t('upgrade.title')}
          </h2>
          {!allMaxed && (
            <button 
              onClick={handleBuyAll}
              className="px-6 py-2 bg-matrix/20 border-2 border-matrix/60 text-matrix font-black text-xs rounded-xl hover:bg-matrix hover:text-black transition-all active:scale-95 uppercase tracking-widest shadow-[0_0_15px_rgba(var(--matrix-color-rgb),0.3)]"
            >
              {t('upgrade.buyAll')}
            </button>
          )}
        </div>
        <div className="h-0.5 w-20 bg-matrix/30 mx-auto mb-4 rounded-full" />
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4 min-h-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 h-full auto-rows-fr">
            {(['gpu', 'cpu', 'drive', 'autoclicker'] as UpgradeType[]).map((type) => (
              <UpgradeItem 
                key={type}
                type={type}
                evolution={evolution}
                upgrade={upgrades[type]}
                data={currentLevel[type]}
                price={getUpgradePrice(type)}
                canAfford={balance >= getUpgradePrice(type)}
                onBuy={handleBuy}
                language={language}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-matrix/10 bg-black/90 flex flex-col items-center justify-center relative shadow-inner z-20 shrink-0 gap-4">
          <div className="italic text-[10px] text-matrix/80 text-center uppercase tracking-[0.5em] font-mono font-bold">
            {t('upgrade.protection')}: LVL_{evolution * 4} | {t('upgrade.status')}: {allMaxed ? t('upgrade.ready') : t('upgrade.waiting')}
          </div>
        </div>
      </div>
    </div>
  );
};
