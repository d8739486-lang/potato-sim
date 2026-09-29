import { useGameStore, type GameState, playClickSFX } from '../core/store/useGameStore';
import { useModalStore, ModalType } from '../core/store/useModalStore';
import { useTranslation } from '../core/i18n/useTranslation';
import { Settings, Play, Triangle } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

export function MainMenu() {
  const setGameState = useGameStore((s) => s.setGameState);
  const exitingTo = useGameStore((s) => s.gameState);
  const { t } = useTranslation();

  const handleNavigate = (target: GameState) => {
    playClickSFX();
    setGameState(target);
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-auto transition-colors duration-700 ${(exitingTo === 'PLAYING' || exitingTo === 'TRANSITION') ? 'bg-black' : 'bg-[#05080f]'}`}>
      
      {/* Beating Background Layer with Cyberpunk Grid */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] animate-pulse-beat" />
         <div className="absolute w-[150vw] h-[150vw] bg-[radial-gradient(circle,rgba(0,242,255,0.08)_0%,transparent_60%)] animate-pulse-beat" />
         <Triangle size={1200} className="absolute text-neon-blue animate-pulse-beat drop-shadow-[0_0_50px_rgba(0,242,255,0.2)]" strokeWidth={0.2} fill="transparent" />
         
         {/* Background Audio Visualizers (Corners) */}
         <div className="absolute bottom-0 left-0 w-[40vw]">
           <AudioVisualizer />
         </div>
         <div className="absolute bottom-0 right-0 w-[40vw]">
           <AudioVisualizer reverse={true} />
         </div>
      </div>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#00f2ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Background Audio Visualizers (Corners) */}
      <div className="absolute bottom-0 left-0 w-[40vw]">
        <AudioVisualizer />
      </div>
      <div className="absolute bottom-0 right-0 w-[40vw]">
        <AudioVisualizer reverse={true} />
      </div>

      {/* Beating Background Triangle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 animate-pulse-beat">
        <Triangle size={800} strokeWidth={1} className="text-neon-blue drop-shadow-[0_0_50px_rgba(0,242,255,1)] opacity-50" />
      </div>

      <div className={`flex flex-col items-center gap-12 z-10 transition-all duration-700 ${exitingTo !== 'MENU' ? 'animate-drop-away' : ''}`}>
        
        {/* Title */}
        <div className="relative group cursor-default">
          <h1 className="font-syncopate font-black text-7xl tracking-[12px] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            NEON <span className="text-transparent bg-clip-text bg-linear-to-r from-neon-blue to-white drop-shadow-[0_0_30px_#00f2ff]">APEX</span>
          </h1>
          <div className="absolute -inset-4 bg-neon-blue blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-1000 rounded-full" />
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-6 w-80">
          
          {/* Play Button */}
          <button 
            onClick={() => handleNavigate('TRANSITION')}
            className="group relative bg-[rgba(0,242,255,0.05)] backdrop-blur-md border-2 border-[rgba(0,242,255,0.3)] shadow-[0_0_20px_rgba(0,242,255,0.1)] px-8 py-5 flex items-center justify-between overflow-hidden clip-btn transition-all duration-500 hover:bg-[rgba(0,242,255,0.15)] hover:border-neon-blue hover:shadow-[0_0_40px_rgba(0,242,255,0.4)] cursor-pointer"
          >
            <div className="absolute inset-0 w-0 bg-neon-blue/20 transition-all duration-500 group-hover:w-full" />
            <span className="font-orbitron font-bold text-xl tracking-[6px] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] relative z-10 group-hover:text-neon-blue transition-colors">
              {t('menu.play')}
            </span>
            <Play className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] relative z-10 group-hover:text-neon-blue transition-all duration-300 group-hover:translate-x-2" />
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => handleNavigate('SETTINGS')}
            className="group relative bg-[rgba(255,255,255,0.02)] backdrop-blur-md border-2 border-[rgba(255,255,255,0.2)] shadow-[0_0_15px_rgba(255,255,255,0.05)] px-8 py-5 flex items-center justify-between overflow-hidden clip-btn transition-all duration-500 hover:bg-[rgba(255,255,255,0.1)] hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer"
          >
            <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-500 group-hover:w-full" />
            <span className="font-orbitron font-bold text-lg tracking-[4px] text-gray-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] relative z-10 group-hover:text-white transition-colors">
              {t('menu.settings')}
            </span>
            <Settings className="text-gray-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] relative z-10 group-hover:text-white transition-all duration-500 group-hover:rotate-90" />
          </button>
        </div>

        <div className="flex w-full justify-between items-center pt-6 border-t border-[rgba(255,255,255,0.1)] text-xs font-orbitron text-gray-400 px-4">
          <button 
            type="button" 
            onClick={() => {
              playClickSFX();
              useModalStore.getState().openModal(ModalType.UPDATE_LOGS);
            }}
            className="px-4 py-2 border border-[rgba(0,242,255,0.3)] bg-[rgba(0,242,255,0.05)] rounded hover:bg-[rgba(0,242,255,0.15)] hover:border-neon-blue text-gray-200 hover:text-white transition-all duration-300 flex items-center gap-2 group shadow-[0_0_15px_rgba(0,242,255,0.1)] hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_5px_#00f2ff] animate-pulse group-hover:shadow-[0_0_8px_#00f2ff]" />
            {t('menu.update_logs')}
          </button>
          <span className="tracking-[2px] text-gray-500">v1.00.0</span>
        </div>
      </div>
    </div>
  );
}
