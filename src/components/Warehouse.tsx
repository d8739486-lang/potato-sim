import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getCrop, ERA_INFO, type PotatoId } from '../data/gameData';
import { Package, ArrowLeft } from 'lucide-react';
import { formatNumber } from '../utils';

interface WarehouseProps {
  onBack: () => void;
}

export default function Warehouse({ onBack }: WarehouseProps) {
  const { inventory, balance, sellHarvested, sellAllHarvested, warehouseLevel, upgradeWarehouse, rebirthUpgrades, currentEra } = useGameStore();
  const eraInfo = ERA_INFO[currentEra] || ERA_INFO.potato;
  const [sellAnimId, setSellAnimId] = useState<string | null>(null);

  const safeHarvested = inventory?.harvested || {};

  const capacities = [0, 3, 10, 50, 100, 500];
  const currentLevel = warehouseLevel || 1;
  const baseCapacity = capacities[currentLevel] || 500000;
  const maxCapacity = Math.floor(baseCapacity * (1 + (rebirthUpgrades?.backpackLevel || 0) * 0.25));
  const isMaxLevel = currentLevel >= 5;
  const upgradeCosts = [0, 100, 1000, 10000, 100000];
  const nextUpgradeCost = upgradeCosts[currentLevel] || 100000;

  const triggerSellAnim = (id: string) => {
    setSellAnimId(id);
    setTimeout(() => setSellAnimId(null), 600);
  };

  const handleSell = (id: PotatoId, amount: number) => {
    const potato = getCrop(id, currentEra);
    if (!potato) return;
    sellHarvested(id, amount, potato.sellPrice);
    triggerSellAnim(id);
  };

  const handleSellAll = () => {
    sellAllHarvested();
  };

  const totalItems = Object.entries(safeHarvested as Record<string, number>).reduce((sum, [id, count]) => {
    return getCrop(id as PotatoId, currentEra) ? sum + count : sum;
  }, 0);

  return (
    <div className="w-full h-screen bg-[#1a110a] flex flex-col text-white animate-fade-in relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-[#1a110a] to-[#1a110a] pointer-events-none" />
      
      <header className="relative z-10 w-full p-6 flex items-center justify-between bg-black/40 border-b border-amber-500/10 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={onBack}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/10 hover:border-white/30"
            >
              <ArrowLeft size={28} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Package size={40} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <div>
              <h2 className="text-4xl font-black tracking-wide text-white drop-shadow-md">СКЛАД</h2>
              <p className="text-blue-200/50 text-lg">Продажа собранного урожая</p>
              <p className="text-red-400/80 text-sm font-bold mt-1">Тут хранится только урожай который можно продать, не предметы!</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {!isMaxLevel && (
            <button 
              onClick={() => {
                if (upgradeWarehouse()) {
                   const audio = new Audio('/sfx/buy.wav');
                   audio.volume = useGameStore.getState().getSoundVol(0.4);
                   audio.play().catch(()=>{});
                }
              }}
              disabled={balance < nextUpgradeCost}
              className="px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black rounded-xl border border-amber-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              УЛУЧШИТЬ ({formatNumber(nextUpgradeCost)} {eraInfo.currencyEmoji})
            </button>
          )}
          {totalItems > 0 && (
            <button 
              onClick={handleSellAll}
              className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-black rounded-xl border border-green-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
            >
              ПРОДАТЬ ВСЁ
            </button>
          )}
          <div className="text-right bg-black/50 py-3 px-8 rounded-2xl border border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="text-sm text-white/50 font-bold uppercase tracking-widest mb-1">
              Место: <span className={totalItems >= maxCapacity ? "text-red-400" : "text-white"}>{totalItems} / {maxCapacity}</span>
            </div>
            <div className="text-3xl font-black text-secondary drop-shadow-[0_0_10px_rgba(244,164,96,0.5)]">{formatNumber(balance)} {eraInfo.currencyEmoji}</div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full p-8 gap-8 overflow-hidden">
        
        {totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50">
            <Package size={120} className="mb-6 text-blue-500" />
            <h3 className="text-4xl font-black mb-2">СКЛАД ПУСТ</h3>
            <p className="text-xl">Отправляйтесь на поле и соберите урожай ({eraInfo.cropName})!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 overflow-y-auto pr-4 custom-scrollbar content-start">
            {Object.entries(safeHarvested as Record<string, number>).filter(([id, count]) => count > 0 && getCrop(id as PotatoId, currentEra)).map(([id, count]) => {
              const potato = getCrop(id as PotatoId, currentEra);
              if (!potato) return null;
              return (
                <div key={id} className="bg-[#101013] border border-zinc-800/60 hover:border-amber-500/30 hover:bg-[#151519] rounded-3xl p-4 flex flex-col gap-4 transition-all group animate-fade-in">
                  <div className="w-full h-32 bg-[#08080a] rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <img 
                      src={eraInfo.sprite} 
                      alt={potato.name} 
                      className="w-16 h-16 object-contain drop-shadow-md group-hover:scale-110 transition-transform" 
                      style={potato.textureStyle}
                    />
                    <div className="absolute top-2 right-2 bg-amber-500/20 px-3 py-1 rounded-xl text-amber-300 font-black border border-amber-500/30 text-lg">
                      x{count}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col px-2">
                    <h3 className="text-xl font-black text-white mb-1 leading-tight text-center truncate" style={{ color: potato.color }} title={potato.name}>{potato.name}</h3>
                    <div className="text-center mb-2">
                      <p className="text-white/50 text-xs uppercase font-bold">Цена за шт: <span className="text-secondary">{formatNumber(potato.sellPrice)} {eraInfo.currencyEmoji}</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 relative">
                    {sellAnimId === id && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-secondary font-black text-2xl animate-fade-out-up z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
                        +{formatNumber(potato.sellPrice)} {eraInfo.currencyEmoji}
                      </div>
                    )}
                    <button 
                      onClick={() => handleSell(id as PotatoId, 1)}
                      className="py-3 rounded-xl font-black text-sm transition-all cursor-pointer bg-white/5 active:scale-95 hover:bg-white/10 text-white border border-white/10"
                    >
                      ПРОДАТЬ 1
                    </button>
                    <div className="relative w-full">
                      <button 
                        onClick={() => handleSell(id as PotatoId, count)}
                        className="w-full py-3 rounded-xl font-black text-sm transition-all cursor-pointer bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-500/30"
                      >
                        ВСЕ ({formatNumber(count * potato.sellPrice)} {eraInfo.currencyEmoji})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
