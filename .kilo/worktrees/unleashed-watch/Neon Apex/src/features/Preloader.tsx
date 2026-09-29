import { useEffect, useState } from 'react';
import { useGameStore } from '../core/store/useGameStore';

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const setGameState = useGameStore((s) => s.setGameState);

  useEffect(() => {
    // Simulate asset loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setGameState('MENU'), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [setGameState]);

  return (
    <div className={`absolute inset-0 bg-black flex flex-col items-center justify-center z-1000 transition-opacity duration-500 ${progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'} text-neon-blue font-orbitron`}>
      <h2 className="text-4xl tracking-[10px] mb-8 animate-pulse">INITIALIZING SYSTEM</h2>
      
      <div className="w-96 h-2 bg-gray-900 border border-[rgba(0,242,255,0.3)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-neon-blue transition-all duration-200 ease-out shadow-[0_0_15px_#00f2ff]"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="mt-4 text-sm tracking-[5px] text-gray-400">
        {Math.min(progress, 100)}% // LOADING ASSETS
      </div>
    </div>
  );
}
