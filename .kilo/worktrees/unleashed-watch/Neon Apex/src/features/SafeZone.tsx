import { useGameStore } from '../core/store/useGameStore';
import { useTranslation } from '../core/i18n/useTranslation';

export function SafeZone() {
  const playerHp = useGameStore((s) => s.playerHp);
  const hud = useGameStore((s) => s.hud);
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      
      {/* HUD Elements for Safe Zone */}
      <div className="absolute top-6 left-6 font-orbitron">
        <h1 className="text-2xl tracking-[5px] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">HANGAR <span className="text-neon-blue">04</span></h1>
        <div className="text-gray-400 tracking-[2px] text-sm mt-1">{t('hud.status_safe')}</div>
      </div>

      <div className="absolute bottom-6 left-6 font-syncopate">
        <div className="text-xs text-gray-500 mb-1 tracking-[3px]">{t('hud.system_integrity')}</div>
        <div className="w-64 h-3 bg-gray-900 border border-[rgba(0,242,255,0.3)] rounded-full overflow-hidden">
          <div className="h-full bg-neon-blue shadow-[0_0_10px_#00f2ff]" style={{ width: `${playerHp}%` }} />
        </div>
      </div>
      
      {/* Bottom HUD / Controls */}
      <div className="absolute bottom-6 right-6 font-orbitron">
        <div className="flex flex-col gap-2 text-xs tracking-[2px] text-gray-500">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hud.thrust ? 'bg-neon-blue shadow-[0_0_10px_#00f2ff]' : 'bg-gray-700'}`} />
            {t('hud.engage')}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hud.rotation !== 0 ? 'bg-neon-blue shadow-[0_0_10px_#00f2ff]' : 'bg-gray-700'}`} />
            {t('hud.rotate')}
          </div>
        </div>
      </div>

      {/* Arena Portal Progress */}
      <div className={`absolute top-1/4 right-1/4 flex flex-col items-center gap-2 transition-opacity duration-300 ${hud.inPortalZone ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-neon-blue font-orbitron tracking-[4px] animate-pulse">INITIATING JUMP</div>
        <div className="w-48 h-2 bg-gray-900 border border-[rgba(0,242,255,0.3)] rounded-full overflow-hidden">
          <div className="h-full bg-neon-blue shadow-[0_0_10px_#00f2ff] transition-all" style={{ width: `${hud.portalProgress}%` }} />
        </div>
      </div>

      {/* Placeholder for interaction prompts (e.g. "PRESS [F] TO OPEN SHOP") */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300" id="interaction-prompt">
        <div className="px-4 py-2 bg-glass text-white font-orbitron tracking-[3px] border border-[rgba(255,255,255,0.2)] rounded">
          [F] WAREHOUSE
        </div>
      </div>
      
    </div>
  );
}
