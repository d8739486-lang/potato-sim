import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Moon, Zap, Box, Gamepad2, Minimize2 } from 'lucide-react';
import { useSettingsStore, SITE_THEMES } from '../core/store/useSettingsStore';

const ICON_MAP = {
  Moon,
  Zap,
  Box,
  Gamepad2,
  Minimize2,
};

export const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { siteTheme, setSiteTheme } = useSettingsStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = SITE_THEMES.find((t) => t.id === siteTheme) || SITE_THEMES[0];
  const CurrentIcon = ICON_MAP[currentTheme.iconName];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all duration-300 cursor-pointer"
        title="Сменить стиль интерфейса"
        aria-label="Сменить стиль интерфейса"
      >
        <Palette className="w-4 h-4" style={{ color: currentTheme.accentColor }} />
        <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold">
          <CurrentIcon className="w-3.5 h-3.5" style={{ color: currentTheme.accentColor }} />
          {currentTheme.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0d1322]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-white/10 flex items-center justify-between">
            <span>Стили интерфейса</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold" style={{ color: currentTheme.accentColor }}>
              5 стилей
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {SITE_THEMES.map((theme) => {
              const isSelected = theme.id === siteTheme;
              const IconComponent = ICON_MAP[theme.iconName];

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setSiteTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className="w-4 h-4" style={{ color: theme.accentColor }} />
                    <span className="font-semibold">{theme.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ background: theme.accentColor }}
                    />
                    {isSelected && <Check className="w-4 h-4 text-[#4fc3f7]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
