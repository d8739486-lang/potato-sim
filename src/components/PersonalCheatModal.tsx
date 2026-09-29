import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Sparkles, Coins, Key, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getCrops, getCrop, ERA_INFO, SPRINKLERS, type PotatoId, type SprinklerRarity } from '../data/gameData';
import { supabase } from '../core/supabase';

export default function PersonalCheatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { playerName, inventory, currentEra } = useGameStore();
  const currentCrops = getCrops(currentEra);
  const eraInfo = ERA_INFO[currentEra] || ERA_INFO.potato;

  const [addBalance, setAddBalance] = useState('1000000');
  const [addCoins, setAddCoins] = useState('1000');
  const [addRebirths, setAddRebirths] = useState('10');

  const [seedId, setSeedId] = useState<PotatoId>('common');
  const [seedAmount, setSeedAmount] = useState('10');

  const [potatoId, setPotatoId] = useState<PotatoId>('common');
  const [potatoAmount, setPotatoAmount] = useState('100');

  const [targetPlayerName, setTargetPlayerName] = useState('');
  const [targetRebirths, setTargetRebirths] = useState('');
  const [targetCoins, setTargetCoins] = useState('');
  const [targetPotatoPlayerName, setTargetPotatoPlayerName] = useState('');
  const [targetSeedPlayerName, setTargetSeedPlayerName] = useState('');
  const [targetSprinklerPlayerName, setTargetSprinklerPlayerName] = useState('');
  const [targetWateringCanPlayerName, setTargetWateringCanPlayerName] = useState('');

  const [sprinklerSelectId, setSprinklerSelectId] = useState<SprinklerRarity>('common');
  const [sprinklerAmount, setSprinklerAmount] = useState('5');
  const [wateringCanAmount, setWateringCanAmount] = useState('1');

  const [allPlayerNames, setAllPlayerNames] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      supabase.from('players').select('player_name').order('player_name').then(({ data }) => {
        if (data) {
          setAllPlayerNames(data.map(p => p.player_name).filter(Boolean));
        }
      });
    }
  }, [isOpen]);

  // Hotkey F+G to open (works for RU/EN layouts and e.code)
  useEffect(() => {
    if (playerName?.toLowerCase() !== 'eternal_lunar') return;

    const activeCodes = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code) activeCodes.add(e.code);
      const k = e.key ? e.key.toLowerCase() : '';
      if (k === 'f' || k === 'а') activeCodes.add('KeyF');
      if (k === 'g' || k === 'п') activeCodes.add('KeyG');

      if (activeCodes.has('KeyF') && activeCodes.has('KeyG')) { 
        setIsOpen(prev => !prev); 
        activeCodes.clear(); 
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      if (e.code) activeCodes.delete(e.code);
      const k = e.key ? e.key.toLowerCase() : '';
      if (k === 'f' || k === 'а') activeCodes.delete('KeyF');
      if (k === 'g' || k === 'п') activeCodes.delete('KeyG');
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('open-cheat-console', handleCustomOpen);
    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      window.removeEventListener('keyup', handleKeyUp); 
      window.removeEventListener('open-cheat-console', handleCustomOpen);
    };
  }, [playerName]);

  if (playerName?.toLowerCase() !== 'eternal_lunar') return null;
  if (!isOpen) return null;

  const updatePlayerInventoryInDb = async (
    targetName: string,
    updateFn: (inv: any) => any,
    successMsg: string
  ) => {
    const isSelf = !targetName.trim() || targetName.trim().toLowerCase() === playerName?.toLowerCase();

    if (isSelf) {
      const currentInv = useGameStore.getState().inventory;
      const newInv = updateFn(JSON.parse(JSON.stringify(currentInv)));
      useGameStore.setState({ inventory: newInv });
      await saveCheatStateToDb();
      toast.success(`${successMsg} (себе)`);
      return;
    }

    try {
      const { data: player, error: fetchErr } = await supabase
        .from('players')
        .select('id, state_json')
        .ilike('player_name', targetName.trim())
        .single();

      if (fetchErr || !player) {
        toast.error(`Игрок "${targetName}" не найден!`);
        return;
      }

      const stateJson = player.state_json || {};
      const playerInventory = stateJson.inventory || { harvested: {}, seeds: {}, sprinklers: {}, tools: { watering_can: 0, hoe: false } };
      
      const newInv = updateFn(playerInventory);
      stateJson.inventory = newInv;

      const { error: updateErr } = await supabase
        .from('players')
        .update({ state_json: stateJson, last_saved_at: new Date().toISOString() })
        .eq('id', player.id);

      if (updateErr) {
        toast.error('Ошибка при обновлении инвентаря!');
      } else {
        toast.success(`${successMsg} (для ${targetName})`);
      }
    } catch (e) {
      toast.error('Ошибка сети при выдаче предмета');
    }
  };

  const saveCheatStateToDb = async () => {
    const state = useGameStore.getState();
    if (!state.playerId) return;
    try {
      await supabase
        .from('players')
        .update({
          balance: state.balance,
          potato_coins: state.potatoCoins,
          rebirths: state.rebirths,
          state_json: {
             inventory: state.inventory,
             plots: state.plots,
             sprinklers: state.sprinklers,
             unlockedPotatoes: state.unlockedPotatoes,
             everUnlockedPotatoes: state.everUnlockedPotatoes,
             rebirthUpgrades: state.rebirthUpgrades,
             warehouseLevel: state.warehouseLevel,
             sessionId: state.sessionId,
             spaceStation: state.spaceStation
          },
          last_saved_at: new Date().toISOString()
        })
        .eq('id', state.playerId);
    } catch (e) {
      console.error('Cheat sync failed:', e);
    }
  };

  const setMoney = async () => {
    const amount = parseInt(addBalance);
    if (!isNaN(amount)) {
      useGameStore.setState({ balance: amount });
      await saveCheatStateToDb();
      toast.success(`💸 Баланс установлен на ${amount} 🥔`);
    }
  };

  const setCoins = async () => {
    const amount = parseInt(addCoins);
    if (!isNaN(amount)) {
      useGameStore.setState({ potatoCoins: amount });
      await saveCheatStateToDb();
      toast.success(`🪙 Коины установлены на ${amount}`);
    }
  };

  const setRebirths = async () => {
    const amount = parseInt(addRebirths);
    if (!isNaN(amount)) {
      if (amount < 5) {
        useGameStore.setState(state => ({ 
          rebirths: amount,
          spaceStation: { ...state.spaceStation, unlocked: false, built: false, level: 0 }
        }));
      } else {
        useGameStore.setState({ rebirths: amount });
      }
      await saveCheatStateToDb();
      toast.success(`♻️ Ребитхи установлены на ${amount}`);
    }
  };

  const giveSeeds = async () => {
    const amount = parseInt(seedAmount);
    if (isNaN(amount) || amount <= 0) return;

    const crop = getCrop(seedId, currentEra);
    await updatePlayerInventoryInDb(
      targetSeedPlayerName,
      (inv) => {
        const seeds = inv.seeds || {};
        seeds[seedId] = (seeds[seedId] || 0) + amount;
        inv.seeds = seeds;
        return inv;
      },
      `🌱 Выдано ${amount} семян (${crop?.name})`
    );
  };

  const givePotatoes = async () => {
    const amount = parseInt(potatoAmount);
    if (isNaN(amount) || amount <= 0) return;

    const crop = getCrop(potatoId, currentEra);
    await updatePlayerInventoryInDb(
      targetPotatoPlayerName,
      (inv) => {
        const harvested = inv.harvested || {};
        harvested[potatoId] = (harvested[potatoId] || 0) + amount;
        inv.harvested = harvested;
        return inv;
      },
      `${eraInfo.emoji} Выдано ${amount} ${crop?.name}`
    );
  };

  const unlockAllPotatoes = async () => {
    const allIds = Object.keys(currentCrops) as PotatoId[];
    useGameStore.setState({ 
      unlockedPotatoes: allIds,
      everUnlockedPotatoes: Array.from(new Set([...useGameStore.getState().everUnlockedPotatoes, ...allIds])) as PotatoId[]
    });
    await saveCheatStateToDb();
    toast.success(`🔓 Все сорта (${eraInfo.cropName}) разблокированы!`);
  };

  const give1000AllPotatoes = async () => {
    const newHarvested = { ...inventory.harvested };
    const allIds = Object.keys(currentCrops) as PotatoId[];
    allIds.forEach(id => {
      newHarvested[id] = (newHarvested[id] || 0) + 1000;
    });
    
    useGameStore.setState({
      inventory: { ...inventory, harvested: newHarvested }
    });
    await saveCheatStateToDb();
    toast.success(`📦 Выдано по 1000 штук каждого сорта (${eraInfo.cropName})!`);
  };



  const giveSprinkler = async (id?: string, amt?: number) => {
    const sId = (id || sprinklerSelectId) as SprinklerRarity;
    const amount = amt !== undefined ? amt : parseInt(sprinklerAmount);
    if (isNaN(amount) || amount <= 0) return;

    await updatePlayerInventoryInDb(
      targetSprinklerPlayerName,
      (inv) => {
        const sprinklers = inv.sprinklers || {};
        sprinklers[sId] = (sprinklers[sId] || 0) + amount;
        inv.sprinklers = sprinklers;
        return inv;
      },
      `💦 Выдано ${amount} сплинкеров (${SPRINKLERS[sId]?.name || sId})`
    );
  };

  const giveWateringCan = async () => {
    const amount = parseInt(wateringCanAmount);
    if (isNaN(amount) || amount <= 0) return;

    await updatePlayerInventoryInDb(
      targetWateringCanPlayerName,
      (inv) => {
        const tools = inv.tools || { watering_can: 0, hoe: false };
        const currentCount = typeof tools.watering_can === 'number' ? tools.watering_can : (tools.watering_can ? 1 : 0);
        tools.watering_can = currentCount + amount;
        inv.tools = tools;
        return inv;
      },
      `💧 Выдано ${amount} леек`
    );
  };

  const giveCurrencyToPlayer = async () => {
    if (!targetPlayerName.trim()) {
      toast.error('Введите имя игрока!');
      return;
    }

    try {
      const { data: targetPlayer, error: fetchError } = await supabase
        .from('players')
        .select('id, balance')
        .ilike('player_name', targetPlayerName.trim())
        .single();

      if (fetchError || !targetPlayer) {
        toast.error(`Игрок "${targetPlayerName}" не найден!`);
        return;
      }

      const newBalance = (targetPlayer.balance || 0) + 1000;
      await supabase
        .from('players')
        .update({ balance: newBalance, last_saved_at: new Date().toISOString() })
        .eq('id', targetPlayer.id);

      if (targetPlayerName.trim().toLowerCase() === playerName?.toLowerCase()) {
        useGameStore.setState({ balance: newBalance });
      }
      toast.success(`🤑 Игроку ${targetPlayerName} выдано 1000 🥔!`);
    } catch (e) {
      toast.error('Ошибка сети при выдаче валюты');
    }
  };

  const setPlayerRebirths = async () => {
    if (!targetPlayerName.trim()) { toast.error('Введите имя игрока!'); return; }
    const amount = parseInt(targetRebirths);
    if (isNaN(amount) || amount < 0) { toast.error('Введите корректное число ребитхов!'); return; }
    
    try {
      const { data, error } = await supabase
        .from('players')
        .update({ rebirths: amount, last_saved_at: new Date().toISOString() })
        .ilike('player_name', targetPlayerName.trim())
        .select('id');

      if (error || !data || data.length === 0) {
        toast.error(`Игрок "${targetPlayerName}" не найден!`);
        return;
      }

      if (targetPlayerName.trim().toLowerCase() === playerName?.toLowerCase()) {
        if (amount < 5) {
          useGameStore.setState(state => ({ 
            rebirths: amount,
            spaceStation: { ...state.spaceStation, unlocked: false, built: false, level: 0 }
          }));
        } else {
          useGameStore.setState({ rebirths: amount });
        }
      }
      toast.success(`♻️ Ребитхи игрока ${targetPlayerName} установлены на ${amount}`);
    } catch(e) { toast.error('Ошибка сети'); }
  };

  const givePlayerCoins = async () => {
    if (!targetPlayerName.trim()) { toast.error('Введите имя игрока!'); return; }
    const amount = parseInt(targetCoins);
    if (isNaN(amount) || amount <= 0) { toast.error('Введите корректное количество коинов!'); return; }
    
    try {
      const { data: player, error: fetchErr } = await supabase
        .from('players')
        .select('id, potato_coins')
        .ilike('player_name', targetPlayerName.trim())
        .single();

      if (fetchErr || !player) { toast.error(`Игрок "${targetPlayerName}" не найден!`); return; }

      const newCoins = (player.potato_coins || 0) + amount;
      await supabase
        .from('players')
        .update({ potato_coins: newCoins, last_saved_at: new Date().toISOString() })
        .eq('id', player.id);

      if (targetPlayerName.trim().toLowerCase() === playerName?.toLowerCase()) {
        useGameStore.setState({ potatoCoins: newCoins });
      }
      toast.success(`🪙 Игроку ${targetPlayerName} выдано ${amount} коинов!`);
    } catch(e) { toast.error('Ошибка сети'); }
  };

  const resetPlayerRebirths = async () => {
    if (!targetPlayerName.trim()) { toast.error('Введите имя игрока!'); return; }
    
    try {
      const { data, error } = await supabase
        .from('players')
        .update({ rebirths: 0, last_saved_at: new Date().toISOString() })
        .ilike('player_name', targetPlayerName.trim())
        .select('id');

      if (error || !data || data.length === 0) {
        toast.error(`Игрок "${targetPlayerName}" не найден!`);
        return;
      }

      if (targetPlayerName.trim().toLowerCase() === playerName?.toLowerCase()) {
        useGameStore.setState(state => ({ 
          rebirths: 0,
          spaceStation: { ...state.spaceStation, unlocked: false, built: false, level: 0 }
        }));
      }
      toast.success(`♻️ Ребитхи игрока ${targetPlayerName} сброшены до 0`);
    } catch(e) { toast.error('Ошибка сети'); }
  };

  if (playerName?.toLowerCase() !== 'eternal_lunar' || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1a0f14] border border-fuchsia-500/50 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(217,70,239,0.2)] relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-fuchsia-500/20 p-2 rounded-xl transition-all border border-transparent hover:border-fuchsia-500/50 cursor-pointer z-10"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-6 border-b border-fuchsia-500/20 pb-4 shrink-0">
          <div className="bg-fuchsia-500/20 p-3 rounded-full border-2 border-fuchsia-500/50 text-fuchsia-500">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase leading-none">Личная Консоль</h2>
            <p className="text-fuchsia-400 font-bold text-sm">Только для тебя, eternal_lunar</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 gap-6 content-start">
          {/* Панель Банов (Кнопка перехода) */}
          <button 
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(new CustomEvent('open-ban-modal'));
            }}
            className="col-span-2 p-4 bg-red-600/20 hover:bg-red-500/40 text-red-400 font-bold rounded-2xl border border-red-500/50 transition-all cursor-pointer flex items-center justify-center gap-3 text-lg"
          >
            <ShieldAlert size={24} />
            ОТКРЫТЬ ПАНЕЛЬ БАНОВ
          </button>

          {/* Ресурсы */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2">
              <Coins size={20} /> Валюта и Статы
            </h3>
            
            <div className="flex gap-2 items-center">
              <label className="text-white/70 font-bold w-24">Баланс:</label>
              <input type="number" value={addBalance} onChange={e => setAddBalance(e.target.value)} className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-amber-400 font-bold focus:border-fuchsia-500 focus:outline-none" />
              <button onClick={setMoney} className="w-1/2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black font-bold rounded-lg border border-amber-500/50 transition-all cursor-pointer">
                УСТАНОВИТЬ
              </button>
            </div>
            
            <div className="flex gap-2 items-center">
              <label className="text-white/70 font-bold w-24">Коины:</label>
              <input type="number" value={addCoins} onChange={e => setAddCoins(e.target.value)} className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-blue-400 font-bold focus:border-fuchsia-500 focus:outline-none" />
              <button onClick={setCoins} className="w-1/2 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white font-bold rounded-lg border border-blue-500/50 transition-all cursor-pointer">
                УСТАНОВИТЬ
              </button>
            </div>
            
            <div className="flex gap-2 items-center">
              <label className="text-white/70 font-bold w-24">Ребитхи:</label>
              <input type="number" value={addRebirths} onChange={e => setAddRebirths(e.target.value)} className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-purple-400 font-bold focus:border-fuchsia-500 focus:outline-none" />
            <button onClick={setRebirths} className="w-1/2 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white font-bold rounded-lg border border-purple-500/50 transition-all cursor-pointer">
                УСТАНОВИТЬ
              </button>
            </div>
            
            <div className="mt-4 border-t border-white/10 pt-4">
              <h4 className="text-sm text-fuchsia-400 font-bold mb-2">Управление игроком:</h4>
              <input 
                type="text" 
                list="all-players-list"
                value={targetPlayerName} 
                onChange={e => setTargetPlayerName(e.target.value)} 
                placeholder="Никнейм игрока" 
                className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none mb-3" 
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={giveCurrencyToPlayer} 
                    className="w-full bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black font-bold rounded-lg border border-yellow-500/50 transition-all cursor-pointer text-xs py-2"
                  >
                    ВЫДАТЬ 1000 🥔
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="Ребитхи" value={targetRebirths} onChange={e => setTargetRebirths(e.target.value)} className="w-1/3 bg-black/50 border border-white/20 rounded-lg p-2 text-purple-400 font-bold focus:border-fuchsia-500 focus:outline-none text-xs" />
                  <button onClick={setPlayerRebirths} className="w-1/3 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white font-bold rounded-lg border border-purple-500/50 transition-all cursor-pointer text-xs py-2">
                    УСТАНОВИТЬ
                  </button>
                  <button onClick={resetPlayerRebirths} className="w-1/3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold rounded-lg border border-red-500/50 transition-all cursor-pointer text-xs py-2">
                    СБРОСИТЬ
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="Коины" value={targetCoins} onChange={e => setTargetCoins(e.target.value)} className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-blue-400 font-bold focus:border-fuchsia-500 focus:outline-none text-sm" />
                  <button onClick={givePlayerCoins} className="w-1/2 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white font-bold rounded-lg border border-blue-500/50 transition-all cursor-pointer text-xs py-2">
                    ВЫДАТЬ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Разблокировки */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2">
              <Key size={20} /> Прогресс
            </h3>
            
            <button onClick={unlockAllPotatoes} className="p-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl border border-fuchsia-400 transition-all cursor-pointer text-center shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              🔓 Разблокировать всю картошку
            </button>
            <p className="text-xs text-white/50 text-center">Открывает все сорта в энциклопедии и для посадки.</p>

            <button onClick={give1000AllPotatoes} className="p-3 mt-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl border border-green-400 transition-all cursor-pointer text-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              📦 Выдать по 1000 всей картошки
            </button>
            <p className="text-xs text-white/50 text-center">Добавляет 1000 единиц каждого сорта на склад.</p>
          </div>



          {/* Инвентарь (Сплинкеры) */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2">
              <Sparkles size={20} /> Выдать Спринклеры
            </h3>
            <input 
              type="text" 
              list="all-players-list"
              value={targetSprinklerPlayerName} 
              onChange={e => setTargetSprinklerPlayerName(e.target.value)} 
              placeholder="Никнейм (пусто = себе)" 
              className="bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none text-xs" 
            />
            <div className="flex gap-2">
              <select 
                value={sprinklerSelectId}
                onChange={(e) => setSprinklerSelectId(e.target.value as SprinklerRarity)}
                className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none text-xs"
              >
                {Object.values(SPRINKLERS).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input type="number" value={sprinklerAmount} onChange={e => setSprinklerAmount(e.target.value)} className="w-1/4 bg-black/50 border border-white/20 rounded-lg p-2 text-fuchsia-400 font-bold focus:border-fuchsia-500 focus:outline-none text-xs text-center" />
              <button onClick={() => giveSprinkler()} className="w-1/4 bg-fuchsia-500/20 hover:bg-fuchsia-500 text-fuchsia-400 hover:text-white font-bold rounded-lg border border-fuchsia-500/50 transition-all cursor-pointer text-xs">
                ВЫДАТЬ
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto custom-scrollbar pr-1 mt-1">
              {Object.values(SPRINKLERS).map(s => (
                <button key={s.id} onClick={() => giveSprinkler(s.id, 5)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-bold text-white transition-all cursor-pointer flex justify-between items-center">
                  <span className="truncate mr-1">{s.name}</span>
                  <span className="shrink-0 text-fuchsia-400">+5</span>
                </button>
              ))}
            </div>
          </div>

          {/* Выдать Семена */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2">
              🌱 Выдать Семена ({eraInfo.cropName})
            </h3>
            
            <input 
              type="text" 
              list="all-players-list"
              value={targetSeedPlayerName} 
              onChange={e => setTargetSeedPlayerName(e.target.value)} 
              placeholder="Никнейм (пусто = себе)" 
              className="bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none text-xs" 
            />

            <select 
              value={seedId}
              onChange={(e) => setSeedId(e.target.value as PotatoId)}
              className="bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none"
            >
              {Object.values(currentCrops).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <input type="number" value={seedAmount} onChange={e => setSeedAmount(e.target.value)} className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-green-400 font-bold focus:border-fuchsia-500 focus:outline-none" />
              <button onClick={giveSeeds} className="w-1/2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black font-bold rounded-lg border border-green-500/50 transition-all cursor-pointer">
                ВЫДАТЬ
              </button>
            </div>
          </div>

          {/* Выдать Инструменты (Лейка) */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 col-span-2">
            <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2">
              💧 Выдать Лейки (Инструмент)
            </h3>
            <div className="flex gap-4 items-center">
              <input 
                type="text" 
                list="all-players-list"
                value={targetWateringCanPlayerName} 
                onChange={e => setTargetWateringCanPlayerName(e.target.value)} 
                placeholder="Никнейм (пусто = себе)" 
                className="w-1/2 bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none text-xs" 
              />
              <input 
                type="number" 
                value={wateringCanAmount} 
                onChange={e => setWateringCanAmount(e.target.value)} 
                placeholder="Количество"
                className="w-1/4 bg-black/50 border border-white/20 rounded-lg p-2 text-blue-400 font-bold focus:border-fuchsia-500 focus:outline-none text-center" 
              />
              <button onClick={giveWateringCan} className="w-1/4 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white font-bold rounded-lg border border-blue-500/50 transition-all cursor-pointer text-sm">
                ВЫДАТЬ ЛЕЙКИ
              </button>
            </div>
          </div>

          {/* Урожай на склад */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 col-span-2">
            <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2">
              {eraInfo.emoji} Выдать {eraInfo.cropName} на склад
            </h3>
            
            <div className="flex gap-4">
              {/* Сетка иконок */}
              <div className="flex-1 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {Object.values(currentCrops).map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setPotatoId(p.id)}
                    className={`relative rounded-xl border-2 p-2 flex items-center justify-center bg-black/50 transition-all cursor-pointer ${
                      potatoId === p.id 
                        ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    title={p.name}
                  >
                    <img 
                      src={eraInfo.sprite} 
                      alt={p.name} 
                      className="w-10 h-10 object-contain drop-shadow-md"
                      style={p.textureStyle}
                    />
                  </button>
                ))}
              </div>

              {/* Управление выдачей */}
              <div className="w-48 flex flex-col gap-2 shrink-0">
                <div className="text-center font-bold text-white mb-2">
                  {getCrop(potatoId, currentEra)?.name}
                </div>
                <input 
                  type="text" 
                  list="all-players-list"
                  value={targetPotatoPlayerName} 
                  onChange={e => setTargetPotatoPlayerName(e.target.value)} 
                  placeholder="Никнейм (пусто = себе)" 
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:border-fuchsia-500 focus:outline-none text-xs text-center" 
                />
                <input 
                  type="number" 
                  value={potatoAmount} 
                  onChange={e => setPotatoAmount(e.target.value)} 
                  placeholder="Количество"
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-yellow-400 font-bold focus:border-fuchsia-500 focus:outline-none text-center" 
                />
                <button onClick={givePotatoes} className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black font-bold rounded-lg border border-yellow-500/50 transition-all cursor-pointer mt-1">
                  ДОБАВИТЬ
                </button>
              </div>
            </div>
          </div>

        </div>

        <datalist id="all-players-list">
          {allPlayerNames.map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
