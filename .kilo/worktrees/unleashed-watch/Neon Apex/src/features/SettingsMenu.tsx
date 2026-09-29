import { useGameStore, playClickSFX } from '../core/store/useGameStore';
import { useTranslation, useTranslationStore } from '../core/i18n/useTranslation';
import { ArrowLeft, Monitor } from 'lucide-react';

export function SettingsMenu() {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setGameState = useGameStore((s) => s.setGameState);
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 bg-[#05080f] flex flex-col items-center justify-center pointer-events-auto">
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="w-150 flex flex-col gap-8 z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[rgba(255,255,255,0.1)] pb-4">
          <Monitor className="text-neon-blue" size={32} />
          <h2 className="font-orbitron font-bold text-3xl tracking-[8px] text-white">
            {t('settings.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="bg-glass p-8 flex flex-col gap-8 rounded-xl">

          {/* Language Selection */}
          <div className="flex items-center justify-between">
            <span className="font-orbitron text-sm tracking-[2px] text-gray-400">LANGUAGE / ЯЗЫК</span>
            <div className="flex bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded overflow-hidden">
              <button 
                onClick={() => {
                  playClickSFX();
                  useTranslationStore.getState().setLanguage('ru');
                }}
                className={`px-4 py-2 font-orbitron text-xs tracking-[2px] transition-colors cursor-pointer ${useTranslationStore.getState().language === 'ru' ? 'bg-neon-blue text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                RU
              </button>
              <button 
                onClick={() => {
                  playClickSFX();
                  useTranslationStore.getState().setLanguage('en');
                }}
                className={`px-4 py-2 font-orbitron text-xs tracking-[2px] transition-colors cursor-pointer ${useTranslationStore.getState().language === 'en' ? 'bg-neon-blue text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>
          
          {/* Master Volume */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between font-orbitron text-sm tracking-[2px]">
              <span className="text-gray-400">{t('settings.master_volume')}</span>
              <span className="text-neon-blue">{settings.masterVolume}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={settings.masterVolume}
              onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
              className="cyber-slider w-full"
              style={{ background: `linear-gradient(to right, #00f2ff ${settings.masterVolume}%, rgba(255,255,255,0.1) ${settings.masterVolume}%)` }}
            />
          </div>

          {/* Music Volume */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between font-orbitron text-sm tracking-[2px]">
              <span className="text-gray-400">{t('settings.music_volume')}</span>
              <span className="text-neon-blue">{settings.musicVolume}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
              className="cyber-slider w-full"
              style={{ background: `linear-gradient(to right, #00f2ff ${settings.musicVolume}%, rgba(255,255,255,0.1) ${settings.musicVolume}%)` }}
            />
          </div>

          {/* SFX Volume */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between font-orbitron text-sm tracking-[2px]">
              <span className="text-gray-400">{t('settings.sfx_volume')}</span>
              <span className="text-neon-blue">{settings.sfxVolume}%</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={settings.sfxVolume}
              onChange={(e) => {
                updateSettings({ sfxVolume: Number(e.target.value) });
              }}
              onMouseUp={() => playClickSFX()}
              className="cyber-slider w-full"
              style={{ background: `linear-gradient(to right, #00f2ff ${settings.sfxVolume}%, rgba(255,255,255,0.1) ${settings.sfxVolume}%)` }}
            />
          </div>

          {/* Controls: Invert Y */}
          <div className="flex items-center justify-between mt-4">
            <span className="font-orbitron text-sm tracking-[2px] text-gray-400">{t('settings.invert_y')}</span>
            <button 
              onClick={() => {
                playClickSFX();
                updateSettings({ invertY: !settings.invertY });
              }}
              className={`w-14 h-6 rounded-full p-1 transition-colors duration-300 ${settings.invertY ? 'bg-neon-blue' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${settings.invertY ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>

        {/* Back Button */}
        <button 
          onClick={() => {
            playClickSFX();
            setGameState('MENU');
          }}
          className="self-start flex items-center gap-3 text-gray-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" />
          <span className="font-orbitron tracking-[4px] font-bold">{t('settings.back')}</span>
        </button>

      </div>
    </div>
  );
}
