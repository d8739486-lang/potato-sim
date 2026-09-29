import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getCrop } from '../data/gameData';
import { createPortal } from 'react-dom';

export default function UnlockModal() {
  const { recentlyUnlocked, clearRecentUnlock, currentEra } = useGameStore();
  const [currentUnlockId, setCurrentUnlockId] = useState<string | null>(null);

  useEffect(() => {
    if (recentlyUnlocked.length > 0 && !currentUnlockId) {
      const id = recentlyUnlocked[0];
      setCurrentUnlockId(id);
      
      // Play unlock sound
      try {
        const audio = new Audio('/sfx/unlock.wav');
        audio.volume = useGameStore.getState().getSoundVol(0.35);
        audio.play().catch(() => {});
      } catch(e) {}
    }
  }, [recentlyUnlocked, currentUnlockId]);

  if (!currentUnlockId) return null;

  const potato = getCrop(currentUnlockId as any, currentEra);
  if (!potato) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center justify-center p-8 max-w-lg w-full text-center">
        <h2 className="text-4xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          ПОЗДРАВЛЯЕМ!
        </h2>
        <p className="text-xl text-white/70 mb-8 uppercase tracking-widest">
          Вы разблокировали новый сорт
        </p>

        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse-slow" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full animate-spin-slow" />
          <img 
            src={`/sprites/seed_${potato.id}.png`} 
            alt={potato.name}
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform cursor-pointer"
            onError={(e) => { e.currentTarget.src = '/sprites/seed_packet_base.png'; Object.assign(e.currentTarget.style, potato.textureStyle); }}
          />
        </div>

        <h3 className="text-5xl font-black mb-12 uppercase drop-shadow-[0_0_15px_currentColor]" style={{ color: potato.color }}>
          {potato.name}
        </h3>

        <button 
          onClick={() => {
            clearRecentUnlock(potato.id);
            setCurrentUnlockId(null);
          }}
          className="px-12 py-4 bg-white hover:bg-white/90 text-black font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.5)] cursor-pointer"
        >
          ПРОДОЛЖИТЬ
        </button>
      </div>
    </div>,
    document.body
  );
}
