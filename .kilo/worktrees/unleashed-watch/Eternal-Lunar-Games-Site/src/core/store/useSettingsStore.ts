import { create } from 'zustand';

export type SiteThemeId = 'lunar-glass' | 'cyberpunk' | 'neubrutalism' | 'retro-pixel' | 'minimalism';

export interface SiteTheme {
  id: SiteThemeId;
  name: string;
  iconName: 'Moon' | 'Zap' | 'Box' | 'Gamepad2' | 'Minimize2';
  bgClass: string;
  navClass: string;
  cardClass: string;
  accentGradient: string;
  textPrimary: string;
  accentColor: string;
  glowColor: string;
  bodyFont: string;
  badgeBg: string;
}

interface GameSettings {
  theme: 'dark' | 'light' | 'custom';
  textures: {
    [key: string]: string;
  };
}

export const SITE_THEMES: SiteTheme[] = [
  {
    id: 'lunar-glass',
    name: 'Lunar Glass',
    iconName: 'Moon',
    bgClass: 'bg-[#080c14] text-slate-100',
    navClass: 'bg-[#080c14]/80 border-sky-500/15',
    cardClass: 'bg-white/5 border-white/10 hover:border-sky-500/40 hover:shadow-[0_15px_30px_rgba(56,189,248,0.1)]',
    accentGradient: 'from-sky-400 via-teal-300 to-lime-400',
    textPrimary: 'text-white',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56,189,248,0.15)',
    bodyFont: 'font-sans',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    iconName: 'Zap',
    bgClass: 'bg-[#06030e] text-pink-50',
    navClass: 'bg-[#06030e]/90 border-pink-500/25 shadow-[0_4px_20px_rgba(236,72,153,0.1)]',
    cardClass: 'bg-pink-950/20 border-pink-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.25)]',
    accentGradient: 'from-pink-500 via-purple-400 to-cyan-400',
    textPrimary: 'text-pink-100',
    accentColor: '#ec4899',
    glowColor: 'rgba(236,72,153,0.25)',
    bodyFont: 'font-mono',
    badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  },
  {
    id: 'neubrutalism',
    name: 'Neo Brutal',
    iconName: 'Box',
    bgClass: 'bg-[#ffde4d] text-black',
    navClass: 'bg-[#ffde4d] border-black border-b-4',
    cardClass: 'bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000]',
    accentGradient: 'from-black to-black',
    textPrimary: 'text-black',
    accentColor: '#000000',
    glowColor: 'rgba(0,0,0,0)',
    bodyFont: 'font-sans font-bold',
    badgeBg: 'bg-black text-white border-2 border-black',
  },
  {
    id: 'retro-pixel',
    name: 'Retro 8-Bit',
    iconName: 'Gamepad2',
    bgClass: 'bg-[#000044] text-[#00ff00]',
    navClass: 'bg-[#000044] border-b-4 border-double border-[#ff00ff]',
    cardClass: 'bg-black border-4 border-dashed border-[#00ff00] hover:border-[#ff00ff] hover:bg-[#111]',
    accentGradient: 'from-[#ff00ff] to-[#00ffff]',
    textPrimary: 'text-[#00ff00]',
    accentColor: '#ff00ff',
    glowColor: 'rgba(255,0,255,0.1)',
    bodyFont: 'font-mono',
    badgeBg: 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]',
  },
  {
    id: 'minimalism',
    name: 'Swiss Minimal',
    iconName: 'Minimize2',
    bgClass: 'bg-[#fafafa] text-[#111111]',
    navClass: 'bg-white border-b border-[#e5e5e5]',
    cardClass: 'bg-white border border-[#e5e5e5] hover:border-black transition-colors duration-150',
    accentGradient: 'from-black to-slate-700',
    textPrimary: 'text-black',
    accentColor: '#111111',
    glowColor: 'rgba(0,0,0,0)',
    bodyFont: 'font-sans',
    badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
];

interface SettingsState {
  siteTheme: SiteThemeId;
  setSiteTheme: (theme: SiteThemeId) => void;
  gameSettings: Record<string, GameSettings>;
  setGameTheme: (gameId: string, theme: GameSettings['theme']) => void;
  setGameTexture: (gameId: string, textureName: string, textureUrl: string) => void;
}

const rawTheme = localStorage.getItem('site_theme');
let SAVED_THEME: SiteThemeId = 'lunar-glass';
if (rawTheme === 'cyberpunk') {
  SAVED_THEME = 'cyberpunk';
} else if (rawTheme === 'emerald' || rawTheme === 'neubrutalism') {
  SAVED_THEME = 'neubrutalism';
} else if (rawTheme === 'sunset' || rawTheme === 'minimalism') {
  SAVED_THEME = 'minimalism';
} else if (rawTheme === 'retro-synth' || rawTheme === 'retro-pixel') {
  SAVED_THEME = 'retro-pixel';
}

export const useSettingsStore = create<SettingsState>((set) => ({
  siteTheme: SAVED_THEME,
  setSiteTheme: (theme) => {
    localStorage.setItem('site_theme', theme);
    set({ siteTheme: theme });
  },
  gameSettings: {},
  setGameTheme: (gameId, theme) =>
    set((state) => ({
      gameSettings: {
        ...state.gameSettings,
        [gameId]: {
          ...state.gameSettings[gameId],
          theme,
          textures: state.gameSettings[gameId]?.textures || {},
        },
      },
    })),
  setGameTexture: (gameId, textureName, textureUrl) =>
    set((state) => ({
      gameSettings: {
        ...state.gameSettings,
        [gameId]: {
          ...state.gameSettings[gameId],
          theme: state.gameSettings[gameId]?.theme || 'dark',
          textures: {
            ...(state.gameSettings[gameId]?.textures || {}),
            [textureName]: textureUrl,
          },
        },
      },
    })),
}));

