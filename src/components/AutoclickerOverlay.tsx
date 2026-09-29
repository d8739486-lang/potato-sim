import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function AutoclickerOverlay() {
  const { autoclickerBannedUntil } = useGameStore();
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (autoclickerBannedUntil) {
      const remaining = autoclickerBannedUntil - Date.now();
      if (remaining > 0) {
        setIsBanned(true);
        const timer = setTimeout(() => setIsBanned(false), remaining);
        return () => clearTimeout(timer);
      }
    } else {
      setIsBanned(false);
    }
  }, [autoclickerBannedUntil]);

  if (!isBanned) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-red-950/80 backdrop-blur-md flex items-center justify-center animate-fade-in pointer-events-auto">
      <div className="bg-black/90 border-4 border-red-500 rounded-3xl p-8 flex flex-col items-center max-w-md text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        <div className="text-red-500 mb-6 animate-bounce">
          <AlertTriangle size={80} />
        </div>
        <h2 className="text-3xl font-black text-red-500 drop-shadow-md mb-4 uppercase">Слишком быстро!</h2>
        <p className="text-red-200/80 font-medium text-lg">Сработала защита от автокликера. Пожалуйста, подождите 3 секунды.</p>
      </div>
    </div>,
    document.body
  );
}
