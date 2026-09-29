import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { POTATOES, type PotatoId, type SprinklerRarity, type CropEra } from '../data/gameData';
import { getRebirthCost, getRebirthReward, getRebirthStartingBalance } from '../utils';

export function getWateringBoostPercentage(tier: number): number {
  let boost = 50;
  for (let i = 2; i <= tier; i++) {
    if (i <= 8) {
      boost -= 1; 
    } else if (i <= 10) {
      boost -= 5; 
    } else {
      // Экспоненциальное замедление: делим на 2 каждый следующий уровень
      boost = boost / 2;
    }
  }
  return Math.max(0.1, boost);
}

export type ToolType = 'hand' | 'watering_can' | 'shovel' | 'hoe' | 'seed' | 'sprinkler';

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface PlotData {
  id: string; // Формат "x_y"
  isWatered: boolean;
  wateredAt: number | null;
  isTilled: boolean;
  tilledUsesLeft: number;
  plantedSeedId: PotatoId | null;
  plantedAt: number | null;
  sprinklerId: SprinklerRarity | null;
}

interface ShopState {
  sprinklerStock: Record<SprinklerRarity, number>;
  nextRestockTime: number; 
}

export interface SpaceStationState {
  isUnlocked: boolean;
  stardust: number;
  greenhouses: { count: number; level: number };
  shuttles: { count: number; level: number };
  relays: { count: number; level: number };
  coinExtractors: { count: number; level: number };
  megastructure: { stage: number };
}

interface GameState {
  balance: number;
  inventory: {
    seeds: Record<PotatoId, number>;
    harvested: Record<PotatoId, number>;
    sprinklers: Record<SprinklerRarity, number>;
    tools: {
      watering_can: number;
      hoe: boolean;
    };
  };
  hotbar: (ToolType | PotatoId | null)[];
  plots: Record<string, PlotData>;
  sprinklers: Record<string, SprinklerRarity>; // Keys like x.5_y.5
  sprinklersPlacedAt: Record<string, number>;
  gridRadius: number; // Legacy bounds support
  unlockedPlots: Record<string, boolean>; // Specifically unlocked individual plots
  activeTool: ToolType;
  selectedSeedId: PotatoId | null;
  selectedSprinklerId: SprinklerRarity | null;
  shopState: ShopState;

  logs: LogEntry[];
  playerName: string | null;
  playerId: string | null;
  lastHoeUseAt: number;
  lastWateringUseAt: number;
  unlockedPotatoes: PotatoId[];
  everUnlockedPotatoes: PotatoId[];
  recentlyUnlocked: PotatoId[];
  sessionId: string | null;
  warehouseLevel: number;
  rebirths: number;
  potatoCoins: number;
  rebirthUpgrades: {
    investorLevel: number;
    cheapLandLevel: number;
    agronomistLevel: number;
    timeWarpLevel: number;
    backpackLevel: number;
    hotbarLevel: number;
  };
  activeGlobalMessage: string | null;
  isPotatoRainActive: boolean;
  shopOverrides: Record<string, { price: number; hidden: boolean; stock: number; is_unlimited: boolean }> | null;
  potatoRainConfig: { duration: number; bonus: number; color: string; message: string; musicUrl: string; active: boolean } | null;
  spaceStation: SpaceStationState;
  currentEra: CropEra;
  evolutionStage: number;
  
  evolveToNextEra: () => void;
  setCropEra: (era: CropEra) => void;
  addCoins: (amount: number) => void;
  setPlayerName: (name: string) => void;
  setSessionId: (id: string | null) => void;
  setActiveGlobalMessage: (msg: string | null) => void;
  processGlobalEvent: (eventType: string, payload: any) => void;
  resetProgress: () => void;
  hardReset: () => void;
  logout: () => void;
  clearRecentUnlock: (id: PotatoId) => void;
  checkUnlocks: () => void;
  tickSpaceStation: () => void;
  upgradeWarehouse: () => boolean;
  addLog: (message: string, type?: LogEntry['type']) => void;
  addBalance: (amount: number) => void;
  removeBalance: (amount: number) => boolean;
  buySeed: (id: PotatoId, amount: number, price: number) => boolean;
  buySprinkler: (id: SprinklerRarity, price: number) => boolean;
  sellHarvested: (id: PotatoId, amount: number, price: number) => void;
  sellAllHarvested: () => void;
  setActiveTool: (tool: ToolType, seedId?: PotatoId | null, sprinklerId?: SprinklerRarity | null) => void;
  interactWithPlot: (plotId: string) => void;
  interactWithIntersection: (x: number, y: number) => void;
  harvestPlot: (plotId: string) => boolean;
  waterPlot: (plotId: string) => void;
  refreshShopIfNeeded: () => void;
  
  masterVolume: number;
  musicVolume: number;
  soundVolume: number;
  language: 'ru' | 'en';
  setVolumes: (vols: Partial<{ masterVolume: number; musicVolume: number; soundVolume: number }>) => void;
  getSoundVol: (baseVol: number) => number;
  setLanguage: (lang: 'ru' | 'en') => void;

  buyTool: (tool: 'watering_can' | 'hoe', price: number) => boolean;
  buyPlot: (x: number, y: number) => { success: boolean; cost: number };
  assignToHotbar: (slotIndex: number, item: ToolType | PotatoId | null) => void;
  dryPlots: () => void;
  tickSprinklers: () => void;
  performRebirth: () => boolean;
  buyRebirthUpgrade: (type: 'investor' | 'cheapLand' | 'agronomist' | 'timeWarp' | 'backpack' | 'hotbar') => boolean;
  autoclickerBannedUntil: number | null;
  registerClick: () => boolean;
}

let clickTimestamps: number[] = [];

// Helpers are not generating default plots anymore, we generate empty plots dynamically on demand
const getEmptyPlot = (id: string): PlotData => ({
  id,
  isWatered: false,
  wateredAt: null,
  isTilled: false,
  tilledUsesLeft: 0,
  plantedSeedId: null,
  plantedAt: null,
  sprinklerId: null,
});

const generateSprinklerStock = () => ({
  common: Math.floor(Math.random() * 3) + 1, // 1-3
  rare: Math.random() > 0.3 ? 1 : 0, 
  epic: Math.random() > 0.7 ? 1 : 0, 
  mythic: Math.random() > 0.9 ? 1 : 0, 
  legendary: Math.random() > 0.98 ? 1 : 0, 
});

const SPRINKLER_LIFETIMES: Record<SprinklerRarity, number> = {
  common: 95000,
  rare: 115000,
  epic: 145000,
  mythic: 175000,
  legendary: 210000,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      balance: 2, // Стартовый капитал
      inventory: {
        seeds: {} as Record<PotatoId, number>,
        harvested: {} as Record<PotatoId, number>,
        sprinklers: {} as Record<SprinklerRarity, number>,
        tools: {
          watering_can: 0,
          hoe: false,
        }
      },
      hotbar: [null, null, null, null, null],
      plots: {},
      sprinklers: {},
      sprinklersPlacedAt: {},
      gridRadius: 2,
      unlockedPlots: {},
      activeTool: 'hand',
      selectedSeedId: null,
      selectedSprinklerId: null,
      shopState: {
        sprinklerStock: generateSprinklerStock(),
        nextRestockTime: Date.now() + 60000,
      },

      logs: [],
      playerName: null,
      playerId: null,
      lastHoeUseAt: 0,
      lastWateringUseAt: 0,
      unlockedPotatoes: ['common'],
      everUnlockedPotatoes: ['common'],
      recentlyUnlocked: [],
      warehouseLevel: 1,
      rebirths: 0,
      potatoCoins: 0,
      rebirthUpgrades: { investorLevel: 0, cheapLandLevel: 0, agronomistLevel: 0, timeWarpLevel: 0, backpackLevel: 0, hotbarLevel: 0 },
      autoclickerBannedUntil: null,
      activeGlobalMessage: null,
      sessionId: null,
      isPotatoRainActive: false,
      shopOverrides: null,
      potatoRainConfig: null,
      spaceStation: {
        isUnlocked: false,
        stardust: 0,
        greenhouses: { count: 0, level: 1 },
        shuttles: { count: 0, level: 1 },
        relays: { count: 0, level: 1 },
        coinExtractors: { count: 0, level: 1 },
        megastructure: { stage: 0 },
      },
      currentEra: 'potato',
      evolutionStage: 1,

      evolveToNextEra: () => {
        set(state => ({
          currentEra: 'cabbage',
          evolutionStage: Math.max(state.evolutionStage || 1, 2),
          // Clear current crops on field & seeds for new era
          inventory: {
            ...state.inventory,
            seeds: { common: 5 } as Record<PotatoId, number>,
            harvested: {} as Record<PotatoId, number>,
          },
          plots: {},
          unlockedPotatoes: ['common'],
          everUnlockedPotatoes: ['common'],
          balance: Math.max(state.balance, 50),
          spaceStation: {
            ...state.spaceStation,
            megastructure: { stage: 0 }
          }
        }));
        get().addLog('🚀 ЭВОЛЮЦИЯ СОВЕРШЕНА! Добро пожаловать в Капустную Эпоху 🥬', 'success');
      },

      setCropEra: (era: CropEra) => {
        set({ currentEra: era });
      },

      masterVolume: 100,
      musicVolume: 60,
      soundVolume: 80,
      language: 'ru',
      setVolumes: (vols) => set(state => ({ ...state, ...vols })),
      setLanguage: (lang) => set({ language: lang }),
      getSoundVol: (baseVol: number) => {
        const { masterVolume, soundVolume } = get();
        return baseVol * ((masterVolume ?? 100) / 100) * ((soundVolume ?? 80) / 100);
      },
      
      registerClick: () => {
        const now = Date.now();
        const { autoclickerBannedUntil } = get();
        
        if (autoclickerBannedUntil) {
          if (now < autoclickerBannedUntil) return true;
          set({ autoclickerBannedUntil: null });
        }

        clickTimestamps = clickTimestamps.filter(t => now - t < 1000);
        clickTimestamps.push(now);

        if (clickTimestamps.length > 12) {
          set({ autoclickerBannedUntil: now + 3000 });
          get().addLog('⚠️ Обнаружен автокликер! Действия заблокированы на 3 сек', 'warning');
          return true;
        }

        return false;
      },

      addCoins: (amount) => set((state) => ({ potatoCoins: state.potatoCoins + amount })),

      setPlayerName: (name) => set({ playerName: name }),
      setSessionId: (id) => set({ sessionId: id }),
      setActiveGlobalMessage: (msg) => set({ activeGlobalMessage: msg }),

      processGlobalEvent: (eventType, payload) => {
        set((state) => {
          let newPlots = { ...state.plots };
          let changed = false;

          if (eventType === 'golden_rain') {
            const mins = payload?.minutes || 5;
            const boostMs = mins * 60000;
            Object.keys(state.unlockedPlots).forEach(plotId => {
              let plot = newPlots[plotId];
              if (!plot) plot = getEmptyPlot(plotId);
              plot.isWatered = true;
              plot.wateredAt = Date.now();
              // Super speed boost
              if (plot.plantedAt) plot.plantedAt -= boostMs;
              newPlots[plotId] = plot;
            });
            changed = true;
            try {
              new Audio('/sfx/harvest.wav').play().catch(() => {});
            } catch(e) {}
            // Also show a toast?
          } else if (eventType === 'giveaway') {
            const amount = payload.amount || 0;
            if (amount > 0) {
              try { new Audio('/sfx/buy.wav').play().catch(() => {}); } catch(e) {}
              return { potatoCoins: state.potatoCoins + amount };
            }
          } else if (eventType === 'troll_player') {
            const target = payload.targetName;
            if (state.playerName && state.playerName.toLowerCase() === target.toLowerCase()) {
               try { new Audio('/sfx/error.wav').play().catch(() => {}); } catch(e) {}
               Object.keys(newPlots).forEach(id => { newPlots[id] = getEmptyPlot(id); });
               changed = true;
            }
          } else if (eventType === 'potato_rain') {
            const config = {
              duration: payload?.duration || 60,
              bonus: payload?.bonus || 1000,
              color: payload?.color || '#fbbf24',
              message: payload?.message || '🥔 НАЧАЛСЯ КАРТОФЕЛЕПАД!',
              musicUrl: payload?.musicUrl || '',
              active: true
            };
            set({ isPotatoRainActive: true, potatoRainConfig: config });
            try { new Audio('/sfx/harvest.wav').play().catch(() => {}); } catch(e) {}
            return { isPotatoRainActive: true };
          } else if (eventType === 'crazy_shop') {
            try { new Audio('/sfx/buy.wav').play().catch(() => {}); } catch(e) {}
            return { shopOverrides: payload.overrides };
          }

          if (changed) return { plots: newPlots };
          return state;
        });
      },

      buyPlot: (x, y) => {
        let result = { success: false, cost: 0 };
        set((state) => {
          const layer = Math.max(Math.abs(x), Math.abs(y));
          let cost = Math.floor(50 * Math.pow(3, Math.max(0, layer - 3)));
          
          if (state.rebirthUpgrades.cheapLandLevel > 0) {
            cost = Math.floor(cost * Math.pow(0.9, state.rebirthUpgrades.cheapLandLevel));
          }
          
          if (state.balance >= cost) {
            result = { success: true, cost };
            return {
              balance: state.balance - cost,
              unlockedPlots: { ...(state.unlockedPlots || {}), [`${x}_${y}`]: true },
              logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: `Куплена клетка [${x}, ${y}] за ${cost} 🥔`, type: 'success' as const }, ...state.logs].slice(0, 50)
            };
          }
          result = { success: false, cost };
          return state;
        });
        return result;
      },

      clearRecentUnlock: (id) => set((state) => ({
        recentlyUnlocked: state.recentlyUnlocked.filter(u => u !== id)
      })),

      checkUnlocks: () => {},

      upgradeWarehouse: () => {
        let success = false;
        set((state) => {
          if (state.warehouseLevel >= 5) return state;
          // Уровни склада: 1->2 (100 🥔), 2->3 (1000 🥔), 3->4 (10k 🥔), 4->5 (100k 🥔)
          const costs = [0, 100, 1000, 10000, 100000];
          const cost = costs[state.warehouseLevel];
          
          if (state.balance >= cost) {
            success = true;
            return {
              balance: state.balance - cost,
              warehouseLevel: state.warehouseLevel + 1,
              logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: `Склад улучшен до ур. ${state.warehouseLevel + 1}!`, type: 'success' as const }, ...state.logs].slice(0, 50)
            };
          }
          return state;
        });
        return success;
      },

      resetProgress: () => set(() => ({
        balance: 2,
        inventory: {
          seeds: {} as Record<PotatoId, number>,
          harvested: {} as Record<PotatoId, number>,
          sprinklers: {} as Record<SprinklerRarity, number>,
          tools: {
            watering_can: 0,
            hoe: false,
          }
        },
        hotbar: [null, null, null, null, null],
        plots: {},
        sprinklers: {},
        sprinklersPlacedAt: {},
        gridRadius: 2,
        unlockedPlots: {},
        activeTool: 'hand',
        selectedSeedId: null,
        selectedSprinklerId: null,
        shopState: {
          sprinklerStock: generateSprinklerStock(),
          nextRestockTime: Date.now() + 60000,
        },

        logs: [],
        lastHoeUseAt: 0,
        lastWateringUseAt: 0,
        unlockedPotatoes: ['common'],
        recentlyUnlocked: [],
        warehouseLevel: 1,
      })),
      hardReset: () => {
        get().resetProgress();
        set({
          rebirths: 0,
          potatoCoins: 0,
          rebirthUpgrades: { investorLevel: 0, cheapLandLevel: 0, agronomistLevel: 0, timeWarpLevel: 0, backpackLevel: 0, hotbarLevel: 0 },
          everUnlockedPotatoes: ['common'],
          spaceStation: {
            isUnlocked: false,
            stardust: 0,
            greenhouses: { count: 0, level: 1 },
            shuttles: { count: 0, level: 1 },
            relays: { count: 0, level: 1 },
            coinExtractors: { count: 0, level: 1 },
            megastructure: { stage: 0 },
          },
          autoclickerBannedUntil: null,
          logs: [],
        });
      },
      logout: () => {
        get().resetProgress();
        set({ 
          playerName: null, 
          playerId: null,
          sessionId: null,
          everUnlockedPotatoes: ['common'],
          rebirths: 0,
          potatoCoins: 0,
          rebirthUpgrades: { investorLevel: 0, cheapLandLevel: 0, agronomistLevel: 0, timeWarpLevel: 0, backpackLevel: 0, hotbarLevel: 0 },
          autoclickerBannedUntil: null
        });
      },
      addLog: (message, type = 'info') => set((state) => ({
          logs: [
            { id: Math.random().toString(36).substr(2, 9), message, timestamp: Date.now(), type },
            ...state.logs
          ].slice(0, 50) // Keep last 50
      })),

      addBalance: (amount) => {
         set((state) => ({ balance: state.balance + amount }));
      },
      removeBalance: (amount) => {
        let success = false;
        set((state) => {
          if (state.balance >= amount) {
            success = true;
            return { balance: state.balance - amount };
          }
          return state;
        });
        return success;
      },

      buySeed: (id, amount, price) => {
        if (get().registerClick()) return false;
        let success = false;
        set((state) => {
          const totalCost = price * amount;
          if (state.balance >= totalCost) {
            success = true;
            
            // Check if unlocking
            let newUnlocked = state.unlockedPotatoes;
            let newEverUnlocked = state.everUnlockedPotatoes || ['common'];
            let newRecently = state.recentlyUnlocked;
            
            if (!state.unlockedPotatoes.includes(id)) {
              newUnlocked = [...state.unlockedPotatoes, id];
            }
            if (!newEverUnlocked.includes(id)) {
              newEverUnlocked = [...newEverUnlocked, id];
              newRecently = [...state.recentlyUnlocked, id];
            }

            const updatedSeeds = {
              ...state.inventory.seeds,
              [id]: (state.inventory.seeds[id] || 0) + amount,
            };

            const updatedHotbar = [...state.hotbar];
            if (!updatedHotbar.includes(id)) {
              const emptyIdx = updatedHotbar.findIndex(item => item === null);
              if (emptyIdx !== -1) {
                updatedHotbar[emptyIdx] = id;
              }
            }

            return {
              balance: state.balance - totalCost,
              unlockedPotatoes: newUnlocked,
              everUnlockedPotatoes: newEverUnlocked,
              recentlyUnlocked: newRecently,
              hotbar: updatedHotbar,
              inventory: {
                ...state.inventory,
                seeds: updatedSeeds
              }
            };
          }
          return state;
        });
        if (success) get().addLog(`Куплено: ${amount}x семян`, 'success');
        return success;
      },

      buySprinkler: (id, price) => {
        const { balance, inventory, shopState } = get();
        if (balance >= price && shopState.sprinklerStock[id] > 0) {
          set({
            balance: balance - price,
            inventory: {
              ...inventory,
              sprinklers: {
                ...inventory.sprinklers,
                [id]: (inventory.sprinklers[id] || 0) + 1,
              },
            },
            shopState: {
              ...shopState,
              sprinklerStock: {
                ...shopState.sprinklerStock,
                [id]: shopState.sprinklerStock[id] - 1,
              }
            }
          });
          get().addLog(`Куплен сплинкер`, 'success');
          return true;
        }
        return false;
      },

      buyTool: (tool, price) => {
        const { balance, inventory } = get();
        const tools = inventory.tools || { watering_can: 0, hoe: false };
        if (balance >= price) {
          if (tool === 'watering_can') {
            const currentAmount = typeof tools.watering_can === 'number' ? tools.watering_can : (tools.watering_can ? 1 : 0);
            set({
              balance: balance - price,
              inventory: {
                ...inventory,
                tools: {
                  ...tools,
                  watering_can: currentAmount + 1
                }
              }
            });
            get().addLog(`Лейка куплена!`, 'success');
            return true;
          } else if (tool === 'hoe' && !tools.hoe) {
            set({
              balance: balance - price,
              inventory: {
                ...inventory,
                tools: {
                  ...tools,
                  hoe: true
                }
              }
            });
            return true;
          }
        }
        return false;
      },

      assignToHotbar: (slotIndex, item) => {
        set((state) => {
          const newHotbar = [...state.hotbar];
          // Если предмет уже есть в хотбаре, убираем его оттуда
          const existingIndex = newHotbar.indexOf(item);
          if (existingIndex !== -1) {
            newHotbar[existingIndex] = null;
          }
          newHotbar[slotIndex] = item;
          return { hotbar: newHotbar };
        });
      },

      sellHarvested: (id, amount, price) => {
        if (get().registerClick()) return;
        set((state) => {
          const newHarvested = { ...(state.inventory?.harvested || {}) } as Record<PotatoId, number>;
          const currentAmount = newHarvested[id] || 0;
          if (currentAmount >= amount) {
            newHarvested[id] = currentAmount - amount;
            if (newHarvested[id] === 0) delete newHarvested[id];
            
            // Квантовый ретранслятор дает глобальный множитель: +10% за каждый ретранслятор
            let multiplier = 1.0;
            if (state.spaceStation?.isUnlocked) {
              multiplier += (state.spaceStation.relays.count * 0.1) * state.spaceStation.relays.level;
            }

            return {
              balance: state.balance + Math.floor((price * amount) * multiplier),
              inventory: { ...state.inventory, harvested: newHarvested },
            };
          }
          return state;
        });
      },

      // sellAllHarvested bypasses per-click anti-cheat (bulk action from UI button)
      sellAllHarvested: () => {
        set((state) => {
          const harvested = state.inventory?.harvested || ({} as Record<PotatoId, number>);
          let totalGain = 0;
          
          let multiplier = 1.0;
          if (state.spaceStation?.isUnlocked) {
             multiplier += (state.spaceStation.relays.count * 0.1) * state.spaceStation.relays.level;
          }

          // Build a new harvested record only keeping items without valid prices (edge case)
          const newHarvested: Record<PotatoId, number> = { ...harvested };
          (Object.keys(newHarvested) as PotatoId[]).forEach((id) => {
            const count = newHarvested[id];
            if (count > 0) {
              const potato = POTATOES[id];
              if (potato) {
                totalGain += Math.floor((potato.sellPrice * count) * multiplier);
                newHarvested[id] = 0;
              }
            }
          });
          return {
            balance: state.balance + totalGain,
            inventory: { ...state.inventory, harvested: newHarvested },
          };
        });
      },

      tickSpaceStation: () => {
        set((state) => {
          if (!state.spaceStation?.isUnlocked) return state;

          let newStardust = state.spaceStation?.stardust || 0;
          let newCoins = state.potatoCoins || 0;
          let newCommonPotatoes = state.inventory?.harvested?.['common'] || 0;

          if (state.spaceStation.greenhouses && state.spaceStation.greenhouses.count > 0) {
            newStardust += state.spaceStation.greenhouses.count * (state.spaceStation.greenhouses.level || 1);
          }

          if (state.spaceStation.coinExtractors && state.spaceStation.coinExtractors.count > 0) {
            const coinIncome = state.spaceStation.coinExtractors.count * (state.spaceStation.coinExtractors.level || 1);
            const potatoesCost = coinIncome * 10;
            if (newCommonPotatoes >= potatoesCost) {
              newCommonPotatoes -= potatoesCost;
              newCoins += coinIncome;
            } else if (newCommonPotatoes > 10) {
              const possibleCoins = Math.floor(newCommonPotatoes / 10);
              newCommonPotatoes -= possibleCoins * 10;
              newCoins += possibleCoins;
            }
          }
          
          return {
            potatoCoins: newCoins,
            inventory: {
              ...state.inventory,
              harvested: {
                ...state.inventory.harvested,
                common: newCommonPotatoes
              }
            },
            spaceStation: {
              ...state.spaceStation,
              stardust: newStardust
            }
          };
        });
      },

      setActiveTool: (tool, seedId = null, sprinklerId = null) => {
        set({ activeTool: tool, selectedSeedId: seedId, selectedSprinklerId: sprinklerId });
      },

      refreshShopIfNeeded: () => {
        const { shopState } = get();
        if (Date.now() > shopState.nextRestockTime) {
          set({
            shopState: {
              sprinklerStock: generateSprinklerStock(),
              nextRestockTime: Date.now() + 5 * 60 * 1000,
            }
          });
        }
      },



      waterPlot: (plotId: string) => {
         set((state) => {
            const newPlots = { ...state.plots };
            if (!newPlots[plotId]) newPlots[plotId] = getEmptyPlot(plotId);
            newPlots[plotId] = { ...newPlots[plotId], isWatered: true, wateredAt: Date.now() };
            return { plots: newPlots };
         });
      },

      harvestPlot: (plotId) => {
         let harvestedSeedId: string | null = null;
         let overcapacity = false;
         let success = false;
         set((state) => {
            const newPlots = { ...state.plots };
            const plot = newPlots[plotId];
            if (!plot || !plot.plantedSeedId) return state;

            // Check warehouse capacity
            const capacities = [0, 3, 10, 50, 100, 500];
            const baseCapacity = capacities[state.warehouseLevel] || 500;
            const maxCapacity = Math.floor(baseCapacity * (1 + (state.rebirthUpgrades.backpackLevel || 0) * 0.25));
            const currentTotal = Object.entries(state.inventory.harvested).reduce((sum, [id, count]) => {
              return POTATOES[id as PotatoId] ? sum + count : sum;
            }, 0);
            
            const amountToHarvest = 1 + (state.rebirthUpgrades.agronomistLevel || 0);

            if (currentTotal + amountToHarvest > maxCapacity) {
              overcapacity = true;
              return state;
            }

            const seedId = plot.plantedSeedId;
            harvestedSeedId = seedId;
            const newInventory = { ...state.inventory };
            
            newInventory.harvested = {
               ...newInventory.harvested,
               [seedId]: (newInventory.harvested[seedId] || 0) + amountToHarvest
            };

            // Create new plot object for immutability
            const newPlot = { ...plot };
            newPlot.plantedSeedId = null;
            newPlot.plantedAt = null;
            
            // Handle tilled moisture retention
            if (newPlot.isTilled && newPlot.tilledUsesLeft > 0) {
               newPlot.tilledUsesLeft -= 1;
               // Keeps isWatered = true and keeps wateredAt
            } else {
               newPlot.isWatered = false; // dries up
               newPlot.wateredAt = null;
               newPlot.isTilled = false; // loses tilled state
            }
            
            newPlots[plotId] = newPlot;
            
            success = true;
            return { plots: newPlots, inventory: newInventory };
         });
         if (overcapacity) {
           get().addLog(`Склад переполнен! Продайте урожай.`, 'warning');
         } else if (harvestedSeedId) {
           get().addLog(`Урожай собран`, 'success');
         }
         return success;
      },

      interactWithPlot: (plotId) => {
        let logsToAdd: {msg: string, type: LogEntry['type']}[] = [];
        set((state) => {
          const { activeTool, selectedSeedId, inventory } = state;
          const newPlots = { ...state.plots };
          if (!newPlots[plotId]) newPlots[plotId] = getEmptyPlot(plotId);
          
          const plot = { ...newPlots[plotId] };
          const newInventory = { ...inventory };

          if (activeTool === 'hoe') {
            if (plot.isTilled) {
               return state;
            }
            
            const now = Date.now();

            if (!plot.plantedSeedId) {
              plot.isTilled = true;
              plot.tilledUsesLeft = 3;
              newPlots[plotId] = plot;
              logsToAdd.push({msg: `Земля вспахана`, type: 'info'});
              return { plots: newPlots, lastHoeUseAt: now };
            }
          } else if (activeTool === 'watering_can') {
            const now = Date.now();
            if (now - state.lastWateringUseAt < 50) {
               return state;
            }

            const currentAmount = typeof newInventory.tools?.watering_can === 'number' ? newInventory.tools.watering_can : (newInventory.tools?.watering_can ? 1 : 0);
            if (currentAmount > 0) {
              let didWater = false;
              if (plot.plantedSeedId && plot.plantedAt && !plot.isWatered) {
                 const potato = POTATOES[plot.plantedSeedId];
                 const boostPct = getWateringBoostPercentage(potato.tier);
                 const timeWarpMultiplier = 1 - ((state.rebirthUpgrades?.timeWarpLevel || 0) * 0.05);
                 const boostMs = (potato.growTimeSec * 1000 * timeWarpMultiplier) * (boostPct / 100);
                 plot.plantedAt -= boostMs;
                 plot.isWatered = true;
                 didWater = true;
                 logsToAdd.push({msg: `Рост ускорен на ${boostPct.toFixed(1)}%!`, type: 'success'});
              } else if (!plot.plantedSeedId && !plot.isWatered) {
                 plot.isWatered = true;
                 plot.wateredAt = Date.now();
                 didWater = true;
              }
              
              if (didWater) {
                 newInventory.tools = {
                   ...newInventory.tools,
                   watering_can: currentAmount - 1
                 };
                 if (currentAmount - 1 === 0) {
                   toast('Лейки закончились!', { icon: '💦', style: { background: '#1e3a8a', color: 'white', border: '1px solid #3b82f6' } });
                 }
                 try {
                   const audio = new Audio('/sfx/water_drop.wav');
                   audio.volume = useGameStore.getState().getSoundVol(0.5);
                   audio.play().catch(()=>{});
                 } catch(e) {}
                 
                 newPlots[plotId] = plot;
                 return { plots: newPlots, inventory: newInventory, lastWateringUseAt: now };
              }
            }
          } else if (activeTool === 'shovel') {
             if (plot.plantedSeedId) {
                // Destroy plant
                plot.plantedSeedId = null;
                plot.plantedAt = null;
                logsToAdd.push({msg: `Растение удалено`, type: 'info'});
             } else {
                // Untill soil
                plot.isTilled = false;
                plot.tilledUsesLeft = 0;
                plot.isWatered = false;
                plot.wateredAt = null;
             }
             newPlots[plotId] = plot;
          } else if (activeTool === 'seed' && selectedSeedId) {
            if (!plot.plantedSeedId && (newInventory.seeds[selectedSeedId] || 0) > 0) {
              plot.plantedSeedId = selectedSeedId;
              plot.plantedAt = Date.now();
              newInventory.seeds = { ...newInventory.seeds, [selectedSeedId]: newInventory.seeds[selectedSeedId] - 1 };
              newPlots[plotId] = plot;
              logsToAdd.push({msg: `Посажено семечко`, type: 'info'});
              
              if (newInventory.seeds[selectedSeedId] === 0) {
                  const newHotbar = [...state.hotbar];
                  const index = newHotbar.indexOf(selectedSeedId);
                  if (index !== -1) {
                     newHotbar[index] = null;
                  }
                  
                  // Автоматически пытаемся подставить другие имеющиеся семена
                  const availableSeeds = (Object.keys(newInventory.seeds) as PotatoId[]).filter(
                    id => (newInventory.seeds[id] || 0) > 0
                  );

                  for (const nextSeedId of availableSeeds) {
                    if (!newHotbar.includes(nextSeedId)) {
                      const emptyIdx = newHotbar.findIndex(item => item === null);
                      if (emptyIdx !== -1) {
                        newHotbar[emptyIdx] = nextSeedId;
                      }
                      break;
                    }
                  }

                  const nextSeed = newHotbar.find(
                    item => item && item !== 'shovel' && item !== 'watering_can' && item !== 'hoe' && item !== 'hand'
                  ) as PotatoId | undefined;

                  if (nextSeed) {
                    return { plots: newPlots, inventory: newInventory, hotbar: newHotbar, activeTool: 'seed', selectedSeedId: nextSeed };
                  }

                  return { plots: newPlots, inventory: newInventory, hotbar: newHotbar, activeTool: 'hand', selectedSeedId: null };
               }
            }
          }

          return { plots: newPlots, inventory: newInventory };
        });
        
        logsToAdd.forEach(log => get().addLog(log.msg, log.type));
      },

      interactWithIntersection: (x: number, y: number) => {
        let logsToAdd: {msg: string, type: LogEntry['type']}[] = [];
        set((state) => {
          const { activeTool, selectedSprinklerId, inventory } = state;
          const intersectionId = `${x}_${y}`;
          const newSprinklers = { ...state.sprinklers };
          const newInventory = { ...inventory };

          if (activeTool === 'sprinkler' && selectedSprinklerId) {
             if (newSprinklers[intersectionId]) {
                logsToAdd.push({msg: `Здесь уже стоит сплинкер! Сначала уберите его лопатой.`, type: 'warning'});
                return state;
             }
             
             if ((newInventory.sprinklers[selectedSprinklerId] || 0) <= 0) {
                logsToAdd.push({msg: `Нет в наличии сплинкеров`, type: 'warning'});
                return state;
             }

             newInventory.sprinklers = { ...newInventory.sprinklers };
             newInventory.sprinklers[selectedSprinklerId] -= 1;
             
             let newActiveTool: ToolType = activeTool;
             let newSelectedSprinklerId = selectedSprinklerId;
             
             if (newInventory.sprinklers[selectedSprinklerId] <= 0) {
                 delete newInventory.sprinklers[selectedSprinklerId];
                 newActiveTool = 'hand';
                 newSelectedSprinklerId = null as any;
             }
             
             newSprinklers[intersectionId] = selectedSprinklerId;
             const newPlacedAt = { ...state.sprinklersPlacedAt, [intersectionId]: Date.now() };
             logsToAdd.push({msg: `Установлен сплинкер`, type: 'success'});
             
             const audio = new Audio('/sfx/buy.wav');
             audio.volume = useGameStore.getState().getSoundVol(0.5);
             audio.play().catch(() => {});
             
             return { 
                sprinklers: newSprinklers, 
                sprinklersPlacedAt: newPlacedAt, 
                inventory: newInventory,
                activeTool: newActiveTool,
                selectedSprinklerId: newSelectedSprinklerId
             };
          }

          if (activeTool === 'shovel') {
             if (newSprinklers[intersectionId]) {
                const rarity = newSprinklers[intersectionId];
                newInventory.sprinklers = { ...newInventory.sprinklers };
                newInventory.sprinklers[rarity] = (newInventory.sprinklers[rarity] || 0) + 1;
                delete newSprinklers[intersectionId];
                
                const newPlacedAt = { ...state.sprinklersPlacedAt };
                delete newPlacedAt[intersectionId];

                logsToAdd.push({msg: `Сплинкер снят`, type: 'info'});
                
                const audio = new Audio('/sfx/shovel.wav');
                audio.volume = useGameStore.getState().getSoundVol(0.5);
                audio.play().catch(() => {});
                
                return { sprinklers: newSprinklers, sprinklersPlacedAt: newPlacedAt, inventory: newInventory };
             }
          }

          return state;
        });

        logsToAdd.forEach(log => get().addLog(log.msg, log.type));
      },

      dryPlots: () => {
         set((state) => {
            const now = Date.now();
            let changed = false;
            const newPlots = { ...state.plots };
            const newSprinklers = { ...state.sprinklers };
            const newPlacedAt = { ...state.sprinklersPlacedAt };
            
            for (const plotId in newPlots) {
               const plot = newPlots[plotId];
               if (plot.isWatered && !plot.plantedSeedId && plot.wateredAt && now - plot.wateredAt > 60000) {
                  newPlots[plotId] = { ...plot, isWatered: false, wateredAt: null };
                  changed = true;
               }
            }
            
            for (const intId in newSprinklers) {
               const rarity = newSprinklers[intId];
               const placedAt = newPlacedAt[intId];
               const lifetime = SPRINKLER_LIFETIMES[rarity] || 95000;
               if (placedAt && now - placedAt > lifetime) {
                  delete newSprinklers[intId];
                  delete newPlacedAt[intId];
                  changed = true;
               }
            }
            
            if (changed) return { plots: newPlots, sprinklers: newSprinklers, sprinklersPlacedAt: newPlacedAt };
            return state;
         });
      },

      tickSprinklers: () => {
         set((state) => {
            let changed = false;
            const newPlots = { ...state.plots };
            
            const coverageByRarity: Record<SprinklerRarity, number> = {
              common: 1, rare: 2, epic: 3, mythic: 4, legendary: 5
            };
            
            const boostSecondsByRarity: Record<SprinklerRarity, number> = {
              common: 1, rare: 2, epic: 4, mythic: 8, legendary: 15
            };

            const timeWarpMultiplier = 1 - ((state.rebirthUpgrades?.timeWarpLevel || 0) * 0.05);

            Object.entries(state.sprinklers).forEach(([intersectionId, rarity]) => {
              const [ix, iy] = intersectionId.split('_').map(Number);
              const radius = coverageByRarity[rarity];
              
              for (let r = ix - radius + 1; r <= ix + radius; r++) {
                for (let c = iy - radius + 1; c <= iy + radius; c++) {
                  const plotId = `${r}_${c}`;
                  if (state.unlockedPlots[plotId]) {
                    let plot = newPlots[plotId];
                    if (!plot) plot = getEmptyPlot(plotId);
                    
                    if (!plot.isWatered) {
                      plot = { ...plot, isWatered: true, wateredAt: Date.now() };
                      changed = true;
                    }
                    
                    if (plot.plantedSeedId && plot.plantedAt) {
                      plot = { ...plot, plantedAt: plot.plantedAt - (boostSecondsByRarity[rarity] * 1000 * timeWarpMultiplier) };
                      changed = true;
                    }
                    
                    newPlots[plotId] = plot;
                  }
                }
              }
            });
            
            if (changed) return { plots: newPlots };
            return state;
         });
      },

      performRebirth: () => {
         let success = false;
         set((state) => {
            const { rebirths, balance } = state;
            
            const cost = getRebirthCost(rebirths);
            
            if (balance >= cost) {
               success = true;
               const reward = getRebirthReward(rebirths);
               const baseBalance = getRebirthStartingBalance(rebirths);
               
               const investorBonus = (state.rebirthUpgrades?.investorLevel || 0) * 1000;
               const newBalance = baseBalance + investorBonus;
               
               return {
                  balance: newBalance,
                  inventory: {
                    seeds: {} as Record<PotatoId, number>,
                    harvested: {} as Record<PotatoId, number>,
                    sprinklers: {} as Record<SprinklerRarity, number>,
                    tools: { watering_can: 0, hoe: false }
                  },
                  hotbar: Array(5 + (state.rebirthUpgrades?.hotbarLevel || 0)).fill(null),
                  plots: {},
                  sprinklers: {},
                  sprinklersPlacedAt: {},
                  gridRadius: 2,
                  activeTool: 'hand',
                  selectedSeedId: null,
                  selectedSprinklerId: null,
                  shopState: {
                    sprinklerStock: generateSprinklerStock(),
                    nextRestockTime: Date.now() + 60000,
                  },

                  logs: [{ id: Date.now().toString(), timestamp: Date.now(), message: `Перерождение! Получено ${reward} Картоха-коинов!`, type: 'success' as const }, ...state.logs].slice(0, 50),
                  lastHoeUseAt: 0,
                  lastWateringUseAt: 0,
                  unlockedPotatoes: ['common'],
                  recentlyUnlocked: [],
                  warehouseLevel: 1,
                  rebirths: rebirths + 1,
                  potatoCoins: state.potatoCoins + reward
               };
            }
            return state;
         });
         return success;
      },

      buyRebirthUpgrade: (type) => {
         let success = false;
         set((state) => {
            const currentLevel = state.rebirthUpgrades[`${type}Level`] || 0;
            if (currentLevel >= 5) return state;

            let cost = 0;
            if (type === 'investor') cost = Math.floor(10 * Math.pow(1.5, state.rebirthUpgrades.investorLevel || 0));
            else if (type === 'cheapLand') cost = Math.floor(10 * Math.pow(1.5, state.rebirthUpgrades.cheapLandLevel || 0));
            else if (type === 'agronomist') cost = Math.floor(15 * Math.pow(1.5, state.rebirthUpgrades.agronomistLevel || 0));
            else if (type === 'timeWarp') cost = Math.floor(20 * Math.pow(1.5, state.rebirthUpgrades.timeWarpLevel || 0));
            else if (type === 'backpack') cost = Math.floor(30 * Math.pow(1.5, state.rebirthUpgrades.backpackLevel || 0));
            else if (type === 'hotbar') cost = Math.floor(100 * Math.pow(2.5, state.rebirthUpgrades.hotbarLevel || 0));

            if (state.potatoCoins >= cost) {
               success = true;
               const newState: any = {
                  potatoCoins: state.potatoCoins - cost,
                  rebirthUpgrades: {
                     ...state.rebirthUpgrades,
                     [`${type}Level`]: (state.rebirthUpgrades[`${type}Level`] || 0) + 1
                  }
               };
               if (type === 'hotbar') {
                 newState.hotbar = [...state.hotbar, null];
               }
               return newState;
            }
            return state;
         });
         return success;
      }
    }),
    {
      name: 'potato-sim-storage',
    }
  )
);
