import { create } from 'zustand';

export type GameState = 'PRELOADER' | 'MENU' | 'SETTINGS' | 'TRANSITION' | 'SAFE_ZONE' | 'PLAYING' | 'BOSS_DEATH' | 'FINISH';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  effectsEnabled: boolean;
  invertY: boolean;
}

export interface GameStore {
  gameState: GameState;
  settings: GameSettings;
  audioAnalyser: AnalyserNode | null;

  // Game logic state
  isPaused: boolean;
  shipId: number;
  playerColor: string;
  wins: number;

  // HUD State
  playerHp: number;
  playerMaxHp: number;
  playerHyper: number;
  playerCdF: number;
  playerCdG: number;
  playerCdH: number;

  bossHp: number;
  bossMaxHp: number;
  bossName: string;
  bossColor: string;
  threatLevel: string;

  portalTimer: number;
  portalActive: boolean;
  
  // Wave state
  currentWave: number;
  enemiesRemaining: number;
  isWaveActive: boolean;

  hud: {
    thrust: boolean;
    rotation: number;
    inPortalZone: boolean;
    portalProgress: number;
  };

  setGameState: (state: GameState) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setAudioAnalyser: (analyser: AnalyserNode) => void;
  togglePause: () => void;
  setShipId: (id: number) => void;
  setPlayerColor: (color: string) => void;
  incrementWins: () => void;
  updateHud: (data: Partial<GameStore>) => void;
}

const defaultSettings: GameSettings = {
  masterVolume: 100,
  musicVolume: 50,
  sfxVolume: 80,
  effectsEnabled: true,
  invertY: false,
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'PRELOADER',
  settings: defaultSettings,
  audioAnalyser: null,

  isPaused: false,
  shipId: 1,
  playerColor: '#00f2ff',
  wins: parseInt(localStorage.getItem('neonApexWins') || '0', 10),

  playerHp: 100,
  playerMaxHp: 100,
  playerHyper: 0,
  playerCdF: 0,
  playerCdG: 0,
  playerCdH: 0,

  bossHp: 2000,
  bossMaxHp: 2000,
  bossName: 'CORE UNIT',
  bossColor: '#00ff6a',
  threatLevel: 'EXTREME',

  portalTimer: 0,
  portalActive: false,
  
  currentWave: 1,
  enemiesRemaining: 0,
  isWaveActive: false,

  hud: { thrust: false, rotation: 0, inPortalZone: false, portalProgress: 0 },

  setGameState: (state) => set({ gameState: state }),
  updateSettings: (newSettings) => set((s) => ({ settings: { ...s.settings, ...newSettings } })),
  setAudioAnalyser: (analyser) => set({ audioAnalyser: analyser }),
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  setShipId: (id) => set({ shipId: id }),
  setPlayerColor: (color) => set({ playerColor: color }),
  incrementWins: () => set((s) => {
    const newWins = s.wins + 1;
    localStorage.setItem('neonApexWins', newWins.toString());
    return { wins: newWins };
  }),
  updateHud: (data) => set((s) => ({ ...s, ...data })),
}));

export const playClickSFX = () => {
  const settings = useGameStore.getState().settings;
  const master = settings.masterVolume / 100;
  const volume = (settings.sfxVolume / 100) * master;
  if (volume <= 0) return;
  const audio = new Audio('/assets/sfx/click.wav');
  // Make click 40% quieter
  audio.volume = volume * 0.6;
  audio.play().catch(() => {});
};
