import React, { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface SpaceCutsceneProps {
  onComplete: () => void;
}

const SpaceCutscene: React.FC<SpaceCutsceneProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'takeoff' | 'space'>('takeoff');
  const { masterVolume, soundVolume } = useGameStore();

  useEffect(() => {
    // Воспроизведение звука взлета (фшшшииуу)
    const audio = new Audio('/sfx/takeoff.wav');
    audio.volume = ((soundVolume ?? 100) / 100) * ((masterVolume ?? 100) / 100);
    audio.play().catch(() => {});

    // 1.4 seconds of shaking and flying up
    const t1 = setTimeout(() => {
      setPhase('space');
    }, 1400);

    // 2.5 seconds of space reveal
    const t2 = setTimeout(() => {
      onComplete();
    }, 3900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-100 flex items-center justify-center">
      {phase === 'takeoff' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a110a] animate-takeoff">
          <div className="absolute inset-0 bg-white/10 opacity-0 animate-flash-long" />
          <h1 className="text-white text-5xl font-black mb-12 animate-pulse tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">ПОДГОТОВКА К ЗАПУСКУ...</h1>
          <Rocket size={150} className="text-fuchsia-500 animate-shake drop-shadow-[0_0_30px_rgba(217,70,239,0.8)]" />
          
          {/* Speed lines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI1MCIgeT0iNTAiIHg9IjEwJSIgZmlsbD0id2hpdGUiIC8+CjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCIgeT0iMjAiIHg9IjMwJSIgZmlsbD0id2hpdGUiIC8+CjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjcwIiB5PSI4MCIgeD0iNjAlIiBmaWxsPSJ3aGl0ZSIgLz4KPHJlY3Qgd2lkdGg9IjIiIGhlaWdodD0iMTAwIiB5PSI0MCIgeD0iODAlIiBmaWxsPSJ3aGl0ZSIgLz4KPC9zdmc+')] animate-speed-lines" />
        </div>
      )}

      {phase === 'space' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050510] animate-space-reveal">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-fuchsia-900/40 via-[#050510] to-[#050510] pointer-events-none" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
          
          <Rocket size={200} className="text-fuchsia-400 drop-shadow-[0_0_50px_rgba(217,70,239,0.8)]" />
          <h1 className="mt-12 text-5xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-purple-600 animate-fade-in">
            СТАНЦИЯ УСПЕШНО ВЫВЕДЕНА НА ОРБИТУ
          </h1>
        </div>
      )}
    </div>
  );
};

export default SpaceCutscene;
