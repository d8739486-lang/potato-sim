import { useGameStore } from '../store/gameStore';
import { ru } from '../i18n/ru';
import { en } from '../i18n/en';

const dictionaries = { ru, en };

export function useTranslation() {
  const language = useGameStore((state) => state.language || 'ru');
  const setLanguage = useGameStore((state) => state.setLanguage);

  const t = (key: string, variables?: Record<string, string | number>) => {
    const dict = (dictionaries as Record<string, any>)[language] || dictionaries.ru;
    const keys = key.split('.');
    
    let value: any = dict;
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }

    if (value === undefined || typeof value !== 'string') {
      return key; // Fallback to key if not found
    }

    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        value = (value as string).replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
      });
    }

    return value as string;
  };

  return { t, language, setLanguage };
}
