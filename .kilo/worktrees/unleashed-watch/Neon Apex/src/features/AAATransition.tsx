import { useEffect, useState } from 'react';
import { useGameStore } from '../core/store/useGameStore';
import { Triangle } from 'lucide-react';

export function AAATransition() {
  const setGameState = useGameStore((s) => s.setGameState);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Init systems
    const t1 = setTimeout(() => setStage(1), 800);
    // Stage 2: Hyperspace jump or powering up
    const t2 = setTimeout(() => setStage(2), 1800);
    // Stage 3: Clear screen and transition to SAFE_ZONE
    const t3 = setTimeout(() => {
      setGameState('SAFE_ZONE');
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [setGameState]);

  return (
    <div className="absolute inset-0 z-999 bg-black flex flex-col items-center justify-center pointer-events-auto text-white font-orbitron overflow-hidden">
      
      {/* Background hyperspace effect (simple CSS approach) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.2)_0%,black_100%)] animate-pulse" />
        <div className={`absolute top-1/2 left-1/2 w-[200vw] h-[200vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent,rgba(0,242,255,0.1),transparent)] transition-transform duration-2000 ease-in-out ${stage >= 2 ? 'rotate-180 scale-150' : 'rotate-0 scale-50'}`} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <Triangle size={120} strokeWidth={1} className="text-neon-blue drop-shadow-[0_0_50px_rgba(0,242,255,1)] opacity-50 animate-pulse" />
        <h2 className="text-3xl tracking-[10px] text-neon-blue drop-shadow-[0_0_10px_rgba(0,242,255,0.8)] animate-pulse">
          {stage === 0 && 'ENGAGING CORE...'}
          {stage === 1 && 'POWERING THRUSTERS...'}
          {stage === 2 && 'ENTERING SAFE ZONE...'}
        </h2>

        <div className="w-96 h-1 bg-gray-900 rounded overflow-hidden">
          <div 
            className="h-full bg-neon-blue transition-all ease-out"
            style={{ 
              width: stage === 0 ? '20%' : stage === 1 ? '60%' : '100%',
              transitionDuration: stage === 0 ? '800ms' : stage === 1 ? '1000ms' : '1500ms'
            }}
          />
        </div>
      </div>
      
      {/* Flash effect when entering safe zone */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-500 pointer-events-none ${stage === 2 ? 'opacity-100 animate-fade-out-down' : 'opacity-0'}`} />
    </div>
  );
}
