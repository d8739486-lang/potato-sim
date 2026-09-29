import { create } from 'zustand';

type Language = 'ru' | 'en';

export const translations = {
  en: {
    'menu.play': 'PLAY',
    'menu.settings': 'SETTINGS',
    'menu.update_logs': 'UPDATE LOGS',
    'settings.title': 'SETTINGS',
    'settings.master_volume': 'MASTER VOLUME',
    'settings.music_volume': 'MUSIC VOLUME',
    'settings.sfx_volume': 'SFX VOLUME',
    'settings.invert_y': 'INVERT Y-AXIS',
    'settings.back': 'BACK',
    'logs.title': 'UPDATE LOGS',
    'logs.v1_00_0_c1': 'Initialized Game Engine and Physics Systems.',
    'logs.v1_00_0_c2': 'Implemented Hangar 04 Safe Zone environment.',
    'logs.v1_00_0_c3': 'Added dynamic Audio Visualizer with Web Audio API.',
    'logs.v1_00_0_c4': 'Constructed AAA loading transition screens.',
    'logs.v1_00_0_c5': 'Optimized Ship control using strict WASD vector bindings.',
    'logs.v1_00_0_c6': 'Fixed ship collision boundary boxes.',
    'logs.v1_00_0_c7': 'Added custom Particle Exhaust system for engines.',
    'hud.engage': 'ENGAGE THRUSTERS [W]',
    'hud.rotate': 'ROTATE SHIP [A/D]',
    'hud.system_online': 'SYSTEM ONLINE. WAITING FOR PILOT INPUT...',
    'hud.status_safe': 'STATUS: SAFE',
    'hud.system_integrity': 'SYSTEM INTEGRITY',
    'lang.ru': 'РУССКИЙ',
    'lang.en': 'ENGLISH',
  },
  ru: {
    'menu.play': 'ИГРАТЬ',
    'menu.settings': 'НАСТРОЙКИ',
    'menu.update_logs': 'ОБНОВЛЕНИЯ',
    'settings.title': 'НАСТРОЙКИ',
    'settings.master_volume': 'ОБЩАЯ ГРОМКОСТЬ',
    'settings.music_volume': 'ГРОМКОСТЬ МУЗЫКИ',
    'settings.sfx_volume': 'ГРОМКОСТЬ ЭФФЕКТОВ',
    'settings.invert_y': 'ИНВЕРСИЯ ОСИ Y',
    'settings.back': 'НАЗАД',
    'logs.title': 'ИСТОРИЯ ОБНОВЛЕНИЙ',
    'logs.v1_00_0_c1': 'Инициализирован игровой движок и физические системы.',
    'logs.v1_00_0_c2': 'Добавлена безопасная зона "Ангар 04".',
    'logs.v1_00_0_c3': 'Добавлен динамический аудио-визуализатор (Web Audio API).',
    'logs.v1_00_0_c4': 'Созданы переходные загрузочные экраны AAA класса.',
    'logs.v1_00_0_c5': 'Оптимизировано управление кораблем (строгие векторные привязки WASD).',
    'logs.v1_00_0_c6': 'Исправлены хитбоксы столкновений корабля.',
    'logs.v1_00_0_c7': 'Добавлена кастомная система выхлопных частиц для двигателей.',
    'hud.engage': 'АКТИВИРОВАТЬ ДВИГАТЕЛИ [W]',
    'hud.rotate': 'ПОВОРОТ КОРАБЛЯ [A/D]',
    'hud.system_online': 'СИСТЕМА АКТИВНА. ОЖИДАНИЕ ВВОДА ПИЛОТА...',
    'hud.status_safe': 'СТАТУС: БЕЗОПАСНО',
    'hud.system_integrity': 'ЦЕЛОСТНОСТЬ СИСТЕМЫ',
    'lang.ru': 'РУССКИЙ',
    'lang.en': 'ENGLISH',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

interface TranslationStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  language: 'ru',
  setLanguage: (lang) => set({ language: lang }),
}));

export const useTranslation = () => {
  const language = useTranslationStore(s => s.language);
  
  return {
    t: (key: TranslationKey) => translations[language][key] || key,
    language,
    setLanguage: useTranslationStore.getState().setLanguage
  };
};
