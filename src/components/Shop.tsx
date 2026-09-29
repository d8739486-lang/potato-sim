import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { POTATOES, SPRINKLERS, type PotatoId, type SprinklerRarity } from '../data/gameData';
import { Store, Clock, ArrowLeft } from 'lucide-react';
import { cn, formatNumber } from '../utils';

import UnlockModal from './UnlockModal';
import { supabase } from '../core/supabase';
import { toast } from 'sonner';

interface ShopProps {
  onBack: () => void;
}

export default function Shop({ onBack }: ShopProps) {
  const [activeTab, setActiveTab] = useState<'seeds' | 'sprinklers' | 'tools'>('seeds');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [buyAnimId, setBuyAnimId] = useState<string | null>(null);
  
  const { balance, buySeed, buySprinkler, buyTool, inventory, shopState, refreshShopIfNeeded, rebirths, shopOverrides } = useGameStore();

  const getMaxTier = (rebirths: number) => {
    if (rebirths === 0) return 9;
    if (rebirths === 1) return 11;
    if (rebirths === 2) return 13;
    if (rebirths === 3) return 14;
    return 15;
  };

  useEffect(() => {
    refreshShopIfNeeded();
    const interval = setInterval(() => {
      refreshShopIfNeeded();
      const diff = shopState.nextRestockTime - Date.now();
      if (diff <= 0) {
        setTimeLeft('Обновление...');
      } else {
        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [shopState.nextRestockTime, refreshShopIfNeeded]);

  const playBuySound = () => {
    const audio = new Audio('/sfx/buy.wav');
    audio.volume = useGameStore.getState().getSoundVol(0.4);
    audio.play().catch(() => {});
  };

  const triggerBuyAnim = (id: string) => {
    setBuyAnimId(id);
    setTimeout(() => setBuyAnimId(null), 600);
  };

  const handleBuySeed = async (id: PotatoId, amount: number, price: number) => {
    const override = shopOverrides?.[id];
    if (override && !override.is_unlimited) {
      try {
        const { data, error } = await supabase.rpc('buy_crazy_item', { p_item_id: id, p_price: price });
        if (error) throw error;
        if (!data.success) {
           toast.error(data.error);
           return;
        }
      } catch (err) {
        toast.error('Ошибка покупки лимитированного товара!');
        return;
      }
    }

    if (buySeed(id, amount, price)) {
      playBuySound();
      triggerBuyAnim(id);
    }
  };

  const handleBuySprinkler = async (id: SprinklerRarity, price: number) => {
    const override = shopOverrides?.[id];
    if (override && !override.is_unlimited) {
      try {
        const { data, error } = await supabase.rpc('buy_crazy_item', { p_item_id: id, p_price: price });
        if (error) throw error;
        if (!data.success) {
           toast.error(data.error);
           return;
        }
      } catch (err) {
        toast.error('Ошибка покупки лимитированного товара!');
        return;
      }
    }

    if (buySprinkler(id, price)) {
      playBuySound();
      triggerBuyAnim(id);
    }
  };

  const handleBuyTool = async (id: 'watering_can' | 'hoe', price: number) => {
    const override = shopOverrides?.[id];
    if (override && !override.is_unlimited) {
      try {
        const { data, error } = await supabase.rpc('buy_crazy_item', { p_item_id: id, p_price: price });
        if (error) throw error;
        if (!data.success) {
           toast.error(data.error);
           return;
        }
      } catch (err) {
        toast.error('Ошибка покупки лимитированного товара!');
        return;
      }
    }

    if (buyTool(id, price)) {
      playBuySound();
      triggerBuyAnim(id);
    }
  };


  const wateringCanCount = typeof inventory?.tools?.watering_can === 'number' ? inventory.tools.watering_can : (inventory?.tools?.watering_can ? 1 : 0);

  return (
    <div className="w-full h-screen bg-[#1a110a] flex flex-col text-white animate-fade-in relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#1a110a] to-[#1a110a] pointer-events-none" />
      
      <header className="relative z-10 w-full p-6 flex items-center justify-between bg-black/40 border-b border-amber-500/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              onBack();
            }}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all cursor-pointer border border-white/10 hover:border-white/30 relative"
          >
            <ArrowLeft size={28} />
          </button>
          <div className="flex items-center gap-4">
            <Store size={40} className="text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <div>
              <h2 className="text-4xl font-black tracking-wide text-white drop-shadow-md">МАГАЗИН</h2>
              <p className="text-amber-200/50 text-lg">Покупайте лучшие семена и инструменты</p>
            </div>
          </div>
        </div>
        <div className="text-right bg-black/50 py-3 px-8 rounded-2xl border border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="text-sm text-white/50 font-bold uppercase tracking-widest mb-1">Баланс</div>
          <div className="text-3xl font-black text-secondary drop-shadow-[0_0_10px_rgba(244,164,96,0.5)]">{formatNumber(balance)} 🥔</div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full p-8 gap-8 overflow-hidden">
        
        <div className="flex gap-4 p-2 bg-black/30 rounded-3xl w-fit border border-white/5">
          <button 
            onClick={() => setActiveTab('seeds')}
            className={cn("px-8 py-4 rounded-2xl font-bold text-xl transition-all cursor-pointer", activeTab === 'seeds' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/5')}
          >
            СЕМЕНА
          </button>
          <button 
            onClick={() => setActiveTab('sprinklers')}
            className={cn("px-8 py-4 rounded-2xl font-bold text-xl transition-all cursor-pointer flex items-center gap-3", activeTab === 'sprinklers' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/5')}
          >
            СПЛИНКЕРЫ
            {activeTab === 'sprinklers' && (
              <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-xl text-sm text-white/70">
                <Clock size={16} />
                <span className="font-mono">{timeLeft}</span>
              </div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={cn("px-8 py-4 rounded-2xl font-bold text-xl transition-all cursor-pointer flex items-center gap-3", activeTab === 'tools' ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/5')}
          >
            ИНСТРУМЕНТЫ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {activeTab === 'seeds' && (
            <div className="grid grid-cols-3 gap-6">
              {Object.values(POTATOES).map((potato, index) => {
                const maxTier = getMaxTier(rebirths);
                const isLockedByRebirth = potato.tier > maxTier;
                const override = shopOverrides?.[potato.id];
                if (override?.hidden) return null;
                const buyPrice = override ? override.price : potato.buyPrice;
                const outOfStockGlobal = override && !override.is_unlimited && override.stock <= 0;
                
                return (
                <div 
                  key={potato.id} 
                  className={cn("bg-[#101013] border rounded-2xl p-4 flex flex-col gap-4 transition-all group animate-fade-in shadow-sm", (!isLockedByRebirth && !outOfStockGlobal) ? "border-zinc-800/60 hover:border-zinc-700 hover:bg-[#151519]" : "border-zinc-900/40 opacity-50 grayscale")}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-full h-32 bg-[#08080a] border border-zinc-800/50 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={`/sprites/seed_${potato.id}.png`} 
                      alt={potato.name} 
                      className={cn("w-20 h-20 object-contain transition-transform drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]", (!isLockedByRebirth && !outOfStockGlobal) ? "group-hover:scale-110" : "brightness-0 opacity-50")} 
                      onError={(e) => { e.currentTarget.src = '/sprites/seed_packet_base.png'; if (!isLockedByRebirth && !outOfStockGlobal) Object.assign(e.currentTarget.style, potato.textureStyle); else e.currentTarget.style.filter = "brightness(0)"; }}
                    />
                    {isLockedByRebirth ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                           <div className="bg-red-900/50 p-2 mb-2 rounded-full border border-red-500/50">
                              <Store size={24} className="text-red-400" />
                           </div>
                           <div className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded">
                             НУЖЕН РЕБИТХ {rebirths === 0 ? "1" : rebirths === 1 ? "2" : "3"}
                           </div>
                        </div>
                      ) : null}
                  </div>
                  
                  <div className="flex-1 flex flex-col px-2">
                    <h3 className={cn("text-xl font-black mb-3 text-center truncate", (!isLockedByRebirth && !outOfStockGlobal) ? "" : "text-white/30")} style={(!isLockedByRebirth && !outOfStockGlobal) ? { color: potato.color } : undefined} title={(!isLockedByRebirth && !outOfStockGlobal) ? potato.name : "Неизвестно"}>{(!isLockedByRebirth && !outOfStockGlobal) ? potato.name : "???"}</h3>
                    
                    <div className="flex justify-between items-center mb-2 bg-[#08080a] rounded-xl p-3 border border-zinc-800/50">
                      <div className="text-center w-full">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Рост</div>
                        <div className="text-sm font-black text-zinc-300">{potato.growTimeSec >= 60 ? `${potato.growTimeSec / 60} мин` : `${potato.growTimeSec} сек`}</div>
                      </div>
                      <div className="w-px h-8 bg-zinc-800 mx-1" />
                      <div className="text-center w-full">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Продажа</div>
                        <div className="text-sm font-black text-secondary">{formatNumber(potato.sellPrice)} 🥔</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative mt-auto w-full">
                    {buyAnimId === potato.id && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 font-black text-2xl animate-fade-out-up z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
                        +1
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        handleBuySeed(potato.id, 1, buyPrice);
                      }}
                      disabled={balance < buyPrice || isLockedByRebirth || outOfStockGlobal}
                      className={cn(
                          "w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 transition-all cursor-pointer",
                          (isLockedByRebirth || outOfStockGlobal) ? "bg-white/5 text-white/30 opacity-50 cursor-not-allowed" :
                          balance >= buyPrice 
                            ? "bg-amber-500/20 active:scale-95 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                      >
                        {outOfStockGlobal ? "РАСПРОДАНО" : (override && !override.is_unlimited) ? `(${override.stock} ШТ) ЗА ${formatNumber(buyPrice)} 🥔` : `КУПИТЬ ЗА ${formatNumber(buyPrice)} 🥔`}
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}

          {activeTab === 'sprinklers' && (
            <div className="grid grid-cols-2 gap-6">
              {Object.values(SPRINKLERS).map((spr, index) => {
                const override = shopOverrides?.[spr.id];
                if (override?.hidden) return null;
                const buyPrice = override ? override.price : spr.price;
                
                const localStock = shopState.sprinklerStock[spr.id];
                // If admin override exists: use override rules (is_unlimited means always in stock)
                // If no override: fall back to local shopState stock
                const isOutOfStock = override
                  ? (!override.is_unlimited && override.stock <= 0)
                  : localStock <= 0;
                const displayStock = override
                  ? (override.is_unlimited ? '∞' : override.stock)
                  : localStock;
                
                return (
                  <div 
                    key={spr.id} 
                    className={`bg-[#101013] border border-zinc-800/60 rounded-2xl p-8 flex gap-6 transition-all group ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:scale-[1.01] hover:border-zinc-700 hover:bg-[#151519]'} animate-fade-in shadow-sm`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-24 h-24 rounded-2xl bg-black/50 flex items-center justify-center p-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/5 rounded-2xl animate-pulse" />
                      <img 
                        src="/sprites/sprinkler_base.png" 
                        alt={spr.name} 
                        className={`w-full h-full object-contain ${isOutOfStock ? '' : 'group-hover:animate-pulse'}`}
                        style={spr.textureStyle}
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-3xl font-black ${spr.iconColor}`}>{spr.name}</h3>
                          <div className="bg-black/60 px-4 py-1 rounded-lg border border-white/10 font-bold">
                            В наличии: <span className={displayStock === '∞' || displayStock > 0 ? 'text-green-400' : 'text-red-400'}>{displayStock}</span>
                          </div>
                        </div>
                        <p className="text-white/60 text-lg">Поливает грядок: <span className="font-bold text-white">{spr.coverage}</span></p>
                      </div>
                      
                      <button 
                        onClick={() => handleBuySprinkler(spr.id, buyPrice)}
                        disabled={balance < buyPrice || isOutOfStock}
                        className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${isOutOfStock ? 'bg-red-500/20 text-red-300 border border-red-500/30 cursor-not-allowed' : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                      >
                        {isOutOfStock ? 'РАСПРОДАНО' : `КУПИТЬ ЗА ${formatNumber(buyPrice)} 🥔`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- ВКЛАДКА ИНСТРУМЕНТЫ --- */}
          {activeTab === 'tools' && (
            <div className="grid grid-cols-3 gap-6">
              
              {/* Лейка */}
              <div className="bg-[#101013] border border-zinc-800/60 hover:border-zinc-700 hover:bg-[#151519] rounded-2xl p-6 flex flex-col items-center justify-between transition-all relative overflow-hidden group animate-fade-in shadow-sm" style={{ animationDelay: '0.1s' }}>
                <div className="w-24 h-24 mb-4 group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center">
                  <img src="/sprites/tool_watering_can.png" alt="Лейка" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest text-center">Лейка</h3>
                <p className="text-white/50 text-center mb-6 h-[60px] flex items-center justify-center">
                  Позволяет поливать грядки. Без воды картошка не растет!
                </p>
                <div className="w-full">
                  <button 
                    onClick={() => handleBuyTool('watering_can', 10)}
                    disabled={balance < 10}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-[#2c1810] font-black text-xl rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-amber-500 cursor-pointer flex flex-col items-center justify-center uppercase"
                  >
                    <span>КУПИТЬ ЗА 10 🥔</span>
                    <span className="text-sm font-bold opacity-80">(В наличии: {wateringCanCount})</span>
                  </button>
                </div>
              </div>

              {/* Мотыга */}
              <div className="bg-[#101013] border border-zinc-800/60 hover:border-zinc-700 hover:bg-[#151519] rounded-2xl p-6 flex flex-col items-center justify-between transition-all relative overflow-hidden group animate-fade-in shadow-sm" style={{ animationDelay: '0.2s' }}>
                <div className="w-24 h-24 mb-4 group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center">
                  <img src="/sprites/tool_hoe.png" alt="Мотыга" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest text-center">Мотыга</h3>
                <p className="text-white/50 text-center mb-6 h-[60px] flex items-center justify-center">
                  Вспахивает землю (на 5 посадок), ускоряя рост картошки.
                </p>
                <div className="w-full">
                  {inventory.tools?.hoe ? (
                    <button disabled className="w-full py-4 bg-green-500/20 text-green-400 font-black text-xl rounded-xl border border-green-500/50 uppercase tracking-widest cursor-not-allowed">
                      КУПЛЕНО
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuyTool('hoe', 50)}
                      disabled={balance < 50}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-[#2c1810] font-black text-xl rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-amber-500 cursor-pointer flex items-center justify-center gap-2 uppercase"
                    >
                      КУПИТЬ ЗА 50 🥔
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      <UnlockModal />
    </div>
  );
}
