import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../utils';

interface EndingCutsceneProps {
  onComplete?: () => void;
}

const EndingCutscene: React.FC<EndingCutsceneProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Stage 1: Screen shakes, rocket launches
    const t1 = setTimeout(() => setPhase(1), 2000);
    // Stage 2: Rocket reaches space, dyson sphere expands
    const t2 = setTimeout(() => setPhase(2), 6000);
    // Stage 3: Flash of white light
    const t3 = setTimeout(() => setPhase(3), 10000);
    // Stage 4: Text appears
    const t4 = setTimeout(() => setPhase(4), 13000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleContinue = () => {
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background space */}
      <div className={cn(
        "absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black transition-opacity duration-3000",
        phase >= 2 ? "opacity-100" : "opacity-0"
      )} />

      {/* Earth & Dyson Sphere */}
      <div className={cn(
        "absolute transition-all duration-[4000ms] ease-in-out",
        phase === 0 ? "top-[150%] scale-50" : 
        phase === 1 ? "top-[60%] scale-100" :
        phase === 2 ? "top-1/2 -translate-y-1/2 scale-150" :
        "top-1/2 -translate-y-1/2 scale-[3]"
      )}>
        <div className="relative flex items-center justify-center">
          <div className="text-[250px] absolute opacity-50 drop-shadow-2xl leading-none flex items-center justify-center">🌍</div>
          <div className={cn(
            "absolute border-8 border-rose-500/80 rounded-full transition-all duration-[4000ms]",
            phase >= 2 ? "w-[400px] h-[400px] opacity-100 animate-[spin_10s_linear_infinite]" : "w-0 h-0 opacity-0"
          )} style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
          <div className={cn(
            "absolute border-4 border-amber-500/80 rounded-full transition-all duration-[4000ms] delay-500",
            phase >= 2 ? "w-[450px] h-[450px] opacity-100 animate-[spin_7s_linear_infinite_reverse]" : "w-0 h-0 opacity-0"
          )} style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
        </div>
      </div>

      {/* The Rocket Launching */}
      {phase >= 1 && phase < 3 && (
        <div className="absolute bottom-0 animate-slide-up-fast duration-[4000ms] ease-in flex flex-col items-center">
          <div className="text-[100px] mb-10 -rotate-45 animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">🚀</div>
          <div className="w-10 h-64 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 rounded-full blur-md" />
        </div>
      )}

      {/* Flash of Light */}
      <div className={cn(
        "absolute inset-0 bg-white transition-opacity duration-[3000ms]",
        phase === 3 ? "opacity-100" : "opacity-0 pointer-events-none"
      )} />

      <div className={cn(
        "relative z-10 text-center transition-all duration-2000 flex flex-col items-center max-w-4xl px-8",
        phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}>
        <div className="bg-black/70 backdrop-blur-xl border border-white/20 p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center">
          <ShieldCheck size={80} className="text-rose-500 mb-8 animate-pulse" />
          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-6 drop-shadow-2xl">
            ПОЗДРАВЛЯЕМ!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-8 max-w-3xl">
            Вы успешно построили Великую Картофельную Мегаструктуру. 
            Бесконечная энергия Сферы Дайсона навсегда решила энергетический кризис человечества.
            Картофель стал главным источником жизни и света во Вселенной!
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={handleContinue}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold text-xl transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
            >
              ПРОДОЛЖИТЬ ИГРУ
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EndingCutscene;
