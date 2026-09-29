import React, { useState } from 'react';
import { ArrowLeft, Rocket, Radio, Sprout, Star, Zap, Globe, Orbit, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils';

interface SpaceStationProps {
  onBack: () => void;
  onUnlock?: () => void;
  onEnding?: () => void;
}

const SpaceStation: React.FC<SpaceStationProps> = ({ onBack, onUnlock, onEnding }) => {
  const { spaceStation, potatoCoins } = useGameStore();
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const coinExtractorsCount = spaceStation.coinExtractors?.count || 0;
  const megastructureStage = spaceStation.megastructure?.stage || 0;

  const handleUnlock = () => {
    if (potatoCoins >= 50) {
      useGameStore.setState((state) => ({
        potatoCoins: state.potatoCoins - 50,
        spaceStation: { ...state.spaceStation, isUnlocked: true }
      }));
      if (onUnlock) onUnlock();
    } else {
      showError("Недостаточно Potato Coins! Нужно 50 🪙");
    }
  };

  const showError = (msg: string) => {
    setPurchaseError(msg);
    setTimeout(() => setPurchaseError(null), 3000);
  };

  const buyGreenhouse = () => {
    const cost = 50 * (spaceStation.greenhouses.count + 1);
    if (potatoCoins >= cost) {
      useGameStore.setState((state) => ({
        potatoCoins: state.potatoCoins - cost,
        spaceStation: {
          ...state.spaceStation,
          greenhouses: { ...state.spaceStation.greenhouses, count: state.spaceStation.greenhouses.count + 1 }
        }
      }));
    } else {
      showError(`Нужно ${formatNumber(cost)} Potato Coins!`);
    }
  };

  const buyRelay = () => {
    const cost = 50 * (spaceStation.relays.count + 1);
    if (spaceStation.stardust >= cost) {
      useGameStore.setState((state) => ({
        spaceStation: {
          ...state.spaceStation,
          stardust: state.spaceStation.stardust - cost,
          relays: { ...state.spaceStation.relays, count: state.spaceStation.relays.count + 1 }
        }
      }));
    } else {
      showError(`Нужно ${formatNumber(cost)} Звездной Пыли! ✨`);
    }
  };

  const buyCoinExtractor = () => {
    const stardustCost = 500 * (coinExtractorsCount + 1);
    const potatoCost = 1000 * (coinExtractorsCount + 1);
    const commonPotatoes = useGameStore.getState().inventory.harvested['common'] || 0;

    if (spaceStation.stardust >= stardustCost && commonPotatoes >= potatoCost) {
      useGameStore.setState((state) => ({
        spaceStation: {
          ...state.spaceStation,
          stardust: state.spaceStation.stardust - stardustCost,
          coinExtractors: { 
            count: coinExtractorsCount + 1, 
            level: state.spaceStation.coinExtractors?.level || 1 
          }
        },
        inventory: {
          ...state.inventory,
          harvested: {
            ...state.inventory.harvested,
            common: (state.inventory.harvested['common'] || 0) - potatoCost
          }
        }
      }));
    } else {
      showError(`Нужно ${formatNumber(stardustCost)} ✨ и ${formatNumber(potatoCost)} Обычных картошек!`);
    }
  };

  const MEGASTRUCTURE_COSTS = [
    { stardust: 50000, coins: 100, name: "Орбитальный Каркас" },
    { stardust: 250000, coins: 500, name: "Солнечные Панели" },
    { stardust: 1000000, coins: 1000, name: "Космическая Биосфера" },
    { stardust: 5000000, coins: 2500, name: "Ядро Бесконечности" },
    { stardust: 10000000, coins: 5000, name: "Сфера Дайсона (ЗАПУСК)" },
  ];

  const buyMegastructureStage = () => {
    const stage = megastructureStage;
    if (stage >= 5) return;

    const cost = MEGASTRUCTURE_COSTS[stage];
    if (spaceStation.stardust >= cost.stardust && potatoCoins >= cost.coins) {
      useGameStore.setState((state) => ({
        potatoCoins: state.potatoCoins - cost.coins,
        spaceStation: {
          ...state.spaceStation,
          stardust: state.spaceStation.stardust - cost.stardust,
          megastructure: { stage: stage + 1 }
        }
      }));
    } else {
      showError(`Нужно ${formatNumber(cost.stardust)} ✨ и ${formatNumber(cost.coins)} 🪙!`);
    }
  };

  if (!spaceStation.isUnlocked) {
    return (
      <div className="w-full h-screen bg-[#050510] flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-fuchsia-900/20 via-[#050510] to-[#050510] pointer-events-none" />
        
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/10 hover:scale-105 z-10"
        >
          <ArrowLeft size={32} />
        </button>

        <Rocket size={120} className="text-fuchsia-500 mb-8 animate-bounce drop-shadow-[0_0_30px_rgba(217,70,239,0.8)]" />
        <h1 className="text-6xl font-black mb-4 tracking-widest text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-purple-600 text-center">
          ОРБИТАЛЬНАЯ СТАНЦИЯ
        </h1>
        <p className="text-xl text-fuchsia-200/60 mb-12 max-w-2xl text-center">
          Постройте свою первую космическую базу, чтобы начать добычу Звездной Пыли и многократно увеличить доход Земли!
        </p>

        <button 
          onClick={handleUnlock}
          className="group relative px-12 py-6 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-3xl font-black text-2xl transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(217,70,239,0.5)] border-4 border-fuchsia-400 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center gap-4 z-10">
            РАЗВЕРНУТЬ СТАНЦИЮ <span className="bg-black/40 px-4 py-2 rounded-xl text-fuchsia-300">50 🥔</span>
          </span>
        </button>

        {purchaseError && (
          <div className="absolute bottom-20 bg-red-500/20 text-red-400 px-8 py-4 rounded-2xl font-bold border border-red-500/50 animate-bounce">
            {purchaseError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#050510] flex flex-col text-white relative overflow-hidden">
      {/* Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-fuchsia-900/30 via-[#050510] to-[#050510] pointer-events-none" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />

      {/* Header */}
      <header className="relative z-10 w-full p-8 flex items-center justify-between bg-black/40 border-b border-fuchsia-500/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBack}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/10 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={32} />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-purple-600 drop-shadow-[0_0_10px_rgba(217,70,239,0.3)]">
              КОСМОДРОМ
            </h1>
            <p className="text-fuchsia-200/50 font-bold tracking-widest">УПРАВЛЕНИЕ СТАНЦИЕЙ</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col items-end bg-black/40 px-6 py-3 rounded-2xl border border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
            <span className="text-fuchsia-300/70 text-sm font-bold uppercase tracking-wider mb-1">Звездная Пыль</span>
            <div className="flex items-center gap-3">
              <Star className="text-fuchsia-400 animate-pulse" size={28} />
              <span className="text-3xl font-black text-white">{formatNumber(spaceStation.stardust)} ✨</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end bg-black/40 px-6 py-3 rounded-2xl border border-amber-500/30">
            <span className="text-amber-300/70 text-sm font-bold uppercase tracking-wider mb-1">Potato Coins</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-amber-400">{formatNumber(potatoCoins)} 🪙</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 p-10 flex gap-10 max-w-7xl mx-auto w-full min-h-0">
        
        {/* Visual Station Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
           <div className="relative w-96 h-96">
             <Rocket size={150} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fuchsia-400 drop-shadow-[0_0_50px_rgba(217,70,239,0.6)] animate-pulse" />
             {/* Orbital Ring */}
             <div className="absolute inset-0 border-4 border-fuchsia-500/30 rounded-full animate-[spin_10s_linear_infinite]" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
             <div className="absolute inset-10 border-2 border-purple-500/40 rounded-full animate-[spin_7s_linear_infinite_reverse]" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
           </div>
           
           <div className="mt-12 text-center bg-black/40 p-6 rounded-3xl border border-fuchsia-500/20 backdrop-blur-sm shadow-xl">
             <h3 className="text-2xl font-black text-white mb-2 tracking-widest">СТАТУС СТАНЦИИ</h3>
             <p className="text-fuchsia-300 text-lg mb-1">Приток Пыли: <span className="font-black text-white ml-2">+{formatNumber(spaceStation.greenhouses.count * spaceStation.greenhouses.level)}/сек</span></p>
             <p className="text-green-400 text-lg">Бонус Фермы Земли: <span className="font-black text-white ml-2">+{formatNumber(spaceStation.relays.count * 10)}%</span></p>
           </div>
        </div>

        {/* Upgrades Panel */}
        <div className="w-125 flex flex-col gap-6 bg-black/40 p-8 rounded-4xl border-2 border-fuchsia-500/20 backdrop-blur-md overflow-y-auto space-scrollbar">
          <h2 className="text-3xl font-black text-white mb-4 tracking-widest border-b border-fuchsia-500/20 pb-4">МОДУЛИ</h2>
          
          {/* Greenhouse */}
          <div className="shrink-0 bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                  <Sprout size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Орбитальная Теплица</h3>
                  <p className="text-green-400/80 font-bold">Уровень {spaceStation.greenhouses.count}</p>
                </div>
              </div>
            </div>
            <p className="text-white/60 mb-6 min-h-12">Автоматически генерирует Звездную Пыль каждую секунду.</p>
            <button 
              onClick={buyGreenhouse}
              className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(22,163,74,0.3)]"
            >
              ПОСТРОИТЬ <span className="bg-black/30 px-3 py-1 rounded-lg text-green-200">{formatNumber(50 * (spaceStation.greenhouses.count + 1))} 🪙</span>
            </button>
          </div>

          {/* Relay */}
          <div className="shrink-0 bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                  <Radio size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Квантовый Ретранслятор</h3>
                  <p className="text-purple-400/80 font-bold">Уровень {spaceStation.relays.count}</p>
                </div>
              </div>
            </div>
            <p className="text-white/60 mb-6 min-h-12">Увеличивает доход от продажи урожая на Земле на 10% за уровень.</p>
            <button 
              onClick={buyRelay}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            >
              ПОСТРОИТЬ <span className="bg-black/30 px-3 py-1 rounded-lg text-purple-200">{formatNumber(50 * (spaceStation.relays.count + 1))} ✨</span>
            </button>
          </div>
          
          {/* Coin Extractor */}
          <div className="shrink-0 bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Zap size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Орбитальный Конвертер</h3>
                  <p className="text-amber-400/80 font-bold">Уровень {coinExtractorsCount}</p>
                </div>
              </div>
            </div>
            <p className="text-white/60 mb-6 min-h-12">Преобразует 10 Обычных Картошек со Склада в 1 Картоха-Коин каждую секунду.</p>
            <button 
              onClick={buyCoinExtractor}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 flex flex-wrap items-center justify-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              ПОСТРОИТЬ <span className="bg-black/30 px-3 py-1 rounded-lg text-amber-200">{formatNumber(500 * (coinExtractorsCount + 1))} ✨</span> <span className="bg-black/30 px-3 py-1 rounded-lg text-amber-200">{formatNumber(1000 * (coinExtractorsCount + 1))} Обыч. 🥔</span>
            </button>
          </div>

          <h2 className="text-3xl font-black text-white mt-8 mb-4 tracking-widest border-b border-rose-500/50 pb-4 text-center">ГЛАВНЫЙ ПРОЕКТ</h2>
          
          {/* Megastructure */}
          <div className="shrink-0 bg-rose-950/40 border-2 border-rose-500/50 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/40">
              <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${(megastructureStage / 5) * 100}%` }} />
            </div>
            <div className="flex items-start justify-between mb-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl animate-pulse">
                  <Globe size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Картофельная Мегаструктура</h3>
                  <p className="text-rose-400/80 font-bold">Стадия: {megastructureStage} / 5</p>
                </div>
              </div>
            </div>
            <p className="text-white/80 font-medium mb-6 min-h-12">Постройте Сферу Дайсона из чистой картофельной энергии. Завершите все 5 стадий, чтобы спасти Вселенную и пройти игру!</p>
            
            {megastructureStage < 5 ? (
              <button 
                onClick={buyMegastructureStage}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 flex flex-wrap items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(225,29,72,0.4)]"
              >
                СТАДИЯ {megastructureStage + 1}: {MEGASTRUCTURE_COSTS[megastructureStage].name} 
                <span className="bg-black/30 px-3 py-1 rounded-lg text-rose-200 text-sm ml-2">{formatNumber(MEGASTRUCTURE_COSTS[megastructureStage].stardust)} ✨</span>
                <span className="bg-black/30 px-3 py-1 rounded-lg text-rose-200 text-sm">{formatNumber(MEGASTRUCTURE_COSTS[megastructureStage].coins)} 🪙</span>
              </button>
            ) : (
              <button 
                onClick={() => onEnding?.()}
                className="w-full py-4 bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-2 border-rose-400 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(225,29,72,0.5)] hover:shadow-[0_0_50px_rgba(225,29,72,0.8)] animate-pulse"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-4 w-[90%] max-w-fit">
                  <Orbit size={28} className="shrink-0 animate-spin text-rose-200" style={{ animationDuration: '4s' }} /> 
                  <span className="text-center font-black text-lg sm:text-xl text-rose-100 uppercase tracking-wide leading-tight whitespace-normal break-words" style={{ textShadow: '0 0 10px rgba(251,113,133,0.8)' }}>
                    ЗАПУСТИТЬ МЕГАСТРУКТУРУ!
                  </span>
                  <Sparkles size={28} className="shrink-0 animate-pulse text-rose-200" />
                </div>
              </button>
            )}
          </div>
          
        </div>

      </div>
      
      {/* Error Toast fallback */}
      {purchaseError && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-fade-in-fast">
          {purchaseError}
        </div>
      )}
    </div>
  );
};

export default SpaceStation;
