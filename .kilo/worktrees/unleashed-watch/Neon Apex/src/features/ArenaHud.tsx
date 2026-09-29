import { useGameStore } from '../core/store/useGameStore';
import { useTranslation } from '../core/i18n/useTranslation';
import { ShieldAlert, Crosshair, Zap } from 'lucide-react';

export function ArenaHud() {
  const store = useGameStore();
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      
      {/* Top Left: Health & Status */}
      <div className="absolute top-6 left-6 flex flex-col gap-4 font-orbitron">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm tracking-[3px] text-gray-300">
            <ShieldAlert size={16} className="text-neon-blue" />
            HULL INTEGRITY
          </div>
          <div className="w-80 h-4 bg-gray-900 border border-[rgba(0,242,255,0.3)] rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-neon-blue shadow-[0_0_15px_#00f2ff] transition-all" 
              style={{ width: `${(store.playerHp / store.playerMaxHp) * 100}%` }} 
            />
          </div>
          <div className="text-xs text-neon-blue mt-1 font-syncopate">{Math.ceil(store.playerHp)} / {store.playerMaxHp}</div>
        </div>
      </div>

      {/* Top Right: Wave Info */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2 font-orbitron text-right">
        <div className="text-4xl font-black tracking-[10px] text-white drop-shadow-[0_0_15px_rgba(255,0,85,0.8)]">
          WAVE <span className="text-[#ff0055]">{store.currentWave}</span>
        </div>
        <div className="flex items-center gap-2 text-sm tracking-[3px] text-gray-400">
          <Crosshair size={14} className="text-gray-500" />
          ENEMIES REMAINING: <span className="text-white">{store.enemiesRemaining}</span>
        </div>
      </div>

      {/* Center Screen: Wave Announcements */}
      {!store.isWaveActive && store.enemiesRemaining === 0 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-fade-in-up">
          <div className="text-xl tracking-[15px] text-neon-blue drop-shadow-[0_0_20px_#00f2ff] font-syncopate mb-4">
            SECTOR CLEARED
          </div>
          <div className="text-sm tracking-[5px] text-gray-400 font-orbitron">
            PREPARING NEXT WAVE...
          </div>
        </div>
      )}

      {/* Bottom Center: Abilities / Hyper */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-orbitron">
        <div className="flex items-center gap-2 text-xs tracking-[4px] text-yellow-400">
          <Zap size={14} /> OVERCHARGE
        </div>
        <div className="w-96 h-2 bg-gray-900 border border-[rgba(255,204,0,0.3)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 shadow-[0_0_10px_#ffcc00] transition-all" 
            style={{ width: `${store.playerHyper}%` }} 
          />
        </div>
      </div>
      
    </div>
  );
}
