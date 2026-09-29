import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Coins, Crown, ArrowUpCircle, LandPlot, RefreshCw, X, Sprout, Backpack, LayoutGrid } from 'lucide-react';
import { cn, getRebirthCost, getRebirthReward } from '../utils';

interface RebirthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RebirthModal: React.FC<RebirthModalProps> = ({ isOpen, onClose }) => {
  const { balance, rebirths, potatoCoins, rebirthUpgrades, performRebirth, buyRebirthUpgrade } = useGameStore();

  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  const cost = getRebirthCost(rebirths);
  const reward = getRebirthReward(rebirths);
  const canRebirth = balance >= cost;

  const handleRebirth = () => {
    if (performRebirth()) {
      handleClose();
    }
  };

  const formatNum = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={cn("fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4", isClosing ? "animate-fade-out-fast" : "animate-fade-in-fast")}>
      <div className={cn("bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl shadow-indigo-500/20 overflow-hidden", isClosing ? "animate-slide-down-fast" : "animate-slide-up-fast")}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-3 rounded-2xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Crown size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white drop-shadow-md">ВРАТА ПЕРЕРОЖДЕНИЯ</h2>
              <p className="text-indigo-300/70 font-medium">Текущая эпоха: {rebirths}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Rebirth Section */}
          <div className="p-8 border-b border-white/10 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden shrink-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
             
             <div className="z-10">
               <h3 className="text-2xl font-bold text-white mb-2">Следующее Перерождение</h3>
               <p className="text-white/50 max-w-xs mx-auto mb-8">
                 Сбросьте прогресс, чтобы разблокировать новые виды семян и получить Картоха-коины!
               </p>
             </div>

             <div className="bg-black/40 border border-white/5 rounded-2xl p-6 z-10 w-full max-w-sm flex flex-col gap-4">
               <div className="flex justify-between items-center">
                 <span className="text-white/50 font-medium">Требуется баланс:</span>
                 <span className={cn("font-black text-xl", balance >= cost ? "text-amber-400" : "text-red-400")}>
                   {formatNum(cost)} 🥔
                 </span>
               </div>
                 <div className="flex justify-between items-center">
                   <span className="text-white/50 font-medium">Награда:</span>
                   <span className="font-black text-xl text-yellow-400 flex items-center gap-1">
                     +{reward} <Coins size={18} />
                   </span>
                 </div>
                 
                 <button
                   onClick={handleRebirth}
                   disabled={!canRebirth}
                   className={cn(
                     "w-full mt-4 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all",
                     canRebirth 
                       ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-95" 
                       : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                   )}
                 >
                   <RefreshCw size={20} className={canRebirth ? "animate-spin-slow" : ""} />
                   СДЕЛАТЬ РЕБИТХ
                 </button>
               </div>
          </div>

          {/* Upgrades Section */}
          <div className="flex-1 p-8 bg-black/20 flex flex-col relative">
            <div className="flex items-center justify-between mb-8 bg-indigo-900/40 p-4 rounded-2xl border border-indigo-500/20">
              <span className="text-indigo-200 font-medium">Ваши Картоха-коины:</span>
              <div className="flex items-center gap-2 text-yellow-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                {potatoCoins} <Coins size={28} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Upgrade: Investor */}
              {(() => {
                 const invLevel = rebirthUpgrades?.investorLevel || 0;
                 const invCost = Math.floor(10 * Math.pow(1.5, invLevel));
                 const maxLevel = 5;
                 const isMaxed = invLevel >= maxLevel;
                 const canBuyInv = potatoCoins >= invCost && !isMaxed;
                 return (
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                     <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30 text-amber-400">
                       <ArrowUpCircle size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-white font-bold text-lg">Инвестор (Ур. {invLevel}{isMaxed ? ' / MAX' : ''})</h4>
                       <p className="text-white/50 text-sm">Увеличивает стартовый капитал на 1000 🥔 за уровень.</p>
                       <div className="text-amber-400/80 text-xs font-medium mt-1">Текущий бонус: +{invLevel * 1000} 🥔</div>
                     </div>
                     <button
                       onClick={() => buyRebirthUpgrade('investor')}
                       disabled={!canBuyInv && !isMaxed}
                       className={cn(
                         "px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all",
                         isMaxed ? "bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed" : 
                         canBuyInv ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95" : "bg-white/5 text-white/30 cursor-not-allowed"
                       )}
                     >
                       {isMaxed ? "МАКСИМУМ" : `УЛУЧШИТЬ (${invCost} `} {!isMaxed && <Coins size={14} />} {isMaxed ? "" : ")"}
                     </button>
                   </div>
                 );
              })()}

              {/* Upgrade: Cheap Land */}
              {(() => {
                 const landLevel = rebirthUpgrades?.cheapLandLevel || 0;
                 const landCost = Math.floor(10 * Math.pow(1.5, landLevel));
                 const maxLevel = 5;
                 const isMaxed = landLevel >= maxLevel;
                 const canBuyLand = potatoCoins >= landCost && !isMaxed;
                 return (
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                     <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30 text-emerald-400">
                       <LandPlot size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-white font-bold text-lg">Дешевая земля (Ур. {landLevel}{isMaxed ? ' / MAX' : ''})</h4>
                       <p className="text-white/50 text-sm">Снижает стоимость расширения поля на 10% за уровень.</p>
                       <div className="text-emerald-400/80 text-xs font-medium mt-1">Скидка: {(1 - Math.pow(0.9, landLevel)) * 100 | 0}%</div>
                     </div>
                     <button
                       onClick={() => buyRebirthUpgrade('cheapLand')}
                       disabled={!canBuyLand && !isMaxed}
                       className={cn(
                         "px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all",
                         isMaxed ? "bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed" : 
                         canBuyLand ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95" : "bg-white/5 text-white/30 cursor-not-allowed"
                       )}
                     >
                       {isMaxed ? "МАКСИМУМ" : `УЛУЧШИТЬ (${landCost} `} {!isMaxed && <Coins size={14} />} {isMaxed ? "" : ")"}
                     </button>
                   </div>
                 );
              })()}

              {/* Upgrade: Agronomist */}
              {(() => {
                 const agroLevel = rebirthUpgrades?.agronomistLevel || 0;
                 const agroCost = Math.floor(15 * Math.pow(1.5, agroLevel));
                 const maxLevel = 5;
                 const isMaxed = agroLevel >= maxLevel;
                 const canBuyAgro = potatoCoins >= agroCost && !isMaxed;
                 return (
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                     <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30 text-green-400">
                       <Sprout size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-white font-bold text-lg">Агроном (Ур. {agroLevel}{isMaxed ? ' / MAX' : ''})</h4>
                       <p className="text-white/50 text-sm">Каждый уровень дает +1 картошку с каждой грядки при сборе урожая.</p>
                       <div className="text-green-400/80 text-xs font-medium mt-1">Доп. урожай: +{agroLevel} 🥔</div>
                     </div>
                     <button
                       onClick={() => buyRebirthUpgrade('agronomist')}
                       disabled={!canBuyAgro && !isMaxed}
                       className={cn(
                         "px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all",
                         isMaxed ? "bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed" : 
                         canBuyAgro ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95" : "bg-white/5 text-white/30 cursor-not-allowed"
                       )}
                     >
                       {isMaxed ? "МАКСИМУМ" : `УЛУЧШИТЬ (${agroCost} `} {!isMaxed && <Coins size={14} />} {isMaxed ? "" : ")"}
                     </button>
                   </div>
                 );
              })()}

              {/* Upgrade: Time Warp */}
              {(() => {
                 const warpLevel = rebirthUpgrades?.timeWarpLevel || 0;
                 const warpCost = Math.floor(20 * Math.pow(1.5, warpLevel));
                 const maxLevel = 5;
                 const isMaxed = warpLevel >= maxLevel;
                 const canBuyWarp = potatoCoins >= warpCost && !isMaxed;
                 return (
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                     <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30 text-blue-400">
                       <RefreshCw size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-white font-bold text-lg">Ускоритель роста (Ур. {warpLevel}{isMaxed ? ' / MAX' : ''})</h4>
                       <p className="text-white/50 text-sm">Ускоряет рост всей картошки на 5% за уровень.</p>
                       <div className="text-blue-400/80 text-xs font-medium mt-1">Текущее ускорение: +{warpLevel * 5}%</div>
                     </div>
                     <button
                       onClick={() => buyRebirthUpgrade('timeWarp')}
                       disabled={!canBuyWarp && !isMaxed}
                       className={cn(
                         "px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all",
                         isMaxed ? "bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed" : 
                         canBuyWarp ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95" : "bg-white/5 text-white/30 cursor-not-allowed"
                       )}
                     >
                       {isMaxed ? "МАКСИМУМ" : `УЛУЧШИТЬ (${warpCost} `} {!isMaxed && <Coins size={14} />} {isMaxed ? "" : ")"}
                     </button>
                   </div>
                 );
              })()}



              {/* Upgrade: Backpack */}
              {(() => {
                 const packLevel = rebirthUpgrades?.backpackLevel || 0;
                 const packCost = Math.floor(30 * Math.pow(1.5, packLevel));
                 const maxLevel = 5;
                 const isMaxed = packLevel >= maxLevel;
                 const canBuyPack = potatoCoins >= packCost && !isMaxed;
                 return (
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                     <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-500/30 text-orange-400">
                       <Backpack size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-white font-bold text-lg">Прокачка рюкзака (Ур. {packLevel}{isMaxed ? ' / MAX' : ''})</h4>
                       <p className="text-white/50 text-sm">Увеличивает базовую вместимость склада на 25% за уровень.</p>
                       <div className="text-orange-400/80 text-xs font-medium mt-1">Доп. вместимость: +{packLevel * 25}%</div>
                     </div>
                     <button
                       onClick={() => buyRebirthUpgrade('backpack')}
                       disabled={!canBuyPack && !isMaxed}
                       className={cn(
                         "px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all",
                         isMaxed ? "bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed" : 
                         canBuyPack ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95" : "bg-white/5 text-white/30 cursor-not-allowed"
                       )}
                     >
                       {isMaxed ? "МАКСИМУМ" : `УЛУЧШИТЬ (${packCost} `} {!isMaxed && <Coins size={14} />} {isMaxed ? "" : ")"}
                     </button>
                   </div>
                 );
              })()}

              {/* Upgrade: Hotbar Slots */}
              {(() => {
                 const hotbarLevel = rebirthUpgrades?.hotbarLevel || 0;
                 const hotbarCost = Math.floor(100 * Math.pow(2.5, hotbarLevel));
                 const maxHotbarLevel = 5;
                 const isMaxed = hotbarLevel >= maxHotbarLevel;
                 const canBuyHotbar = potatoCoins >= hotbarCost && !isMaxed;
                 return (
                   <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/60 transition-colors">
                     <div className="bg-fuchsia-500/20 p-3 rounded-xl border border-fuchsia-500/30 text-fuchsia-400">
                       <LayoutGrid size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-white font-bold text-lg">Доп. слоты (Ур. {hotbarLevel}{isMaxed ? ' / MAX' : ''})</h4>
                       <p className="text-white/50 text-sm">Добавляет новую ячейку в панель быстрого доступа.</p>
                       <div className="text-fuchsia-400/80 text-xs font-medium mt-1">Текущих доп. слотов: {hotbarLevel}</div>
                     </div>
                     <button
                       onClick={() => buyRebirthUpgrade('hotbar')}
                       disabled={!canBuyHotbar && !isMaxed}
                       className={cn(
                         "px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all",
                         isMaxed ? "bg-green-500/20 text-green-300 border-green-500/30 cursor-not-allowed" : 
                         canBuyHotbar ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95" : "bg-white/5 text-white/30 cursor-not-allowed"
                       )}
                     >
                       {isMaxed ? "МАКСИМУМ" : `УЛУЧШИТЬ (${hotbarCost} `} {!isMaxed && <Coins size={14} />} {isMaxed ? "" : ")"}
                     </button>
                   </div>
                 );
              })()}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
