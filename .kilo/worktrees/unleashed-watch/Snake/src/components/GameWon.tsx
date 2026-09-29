import { useEffect, useRef } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { RotateCcw, Home, Trophy } from 'lucide-react';

export const GameWon = () => {
  const { score, setScreen, startGame, playSfx, masterVolume, sfxVolume } = useSnakeStore();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Создаем AudioContext для победного звука
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      const finalVol = (masterVolume * sfxVolume) * 0.15;
      gainNode.gain.setValueAtTime(finalVol, ctx.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Мелодия победы (ту-ту-ту-тууу!)
    playTone(523.25, 0, 0.15); // C5
    playTone(659.25, 0.15, 0.15); // E5
    playTone(783.99, 0.3, 0.15); // G5
    playTone(1046.50, 0.45, 0.6); // C6 (длинная)

    return () => {
      ctx.close();
    };
  }, [masterVolume, sfxVolume]);

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#0e1624] border border-yellow-500/50 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center space-y-6 shadow-[0_0_80px_rgba(234,179,8,0.25)] relative overflow-hidden">
        {/* Декоративное свечение */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-yellow-500/20 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>

        <h2 className="text-3xl font-black text-yellow-400 tracking-wider text-center">
          ПОБЕДА!
        </h2>
        
        <p className="text-slate-300 text-center text-sm font-medium">
          Вы заполнили всё поле!<br />
          Вы настоящий мастер змейки!
        </p>

        <div className="flex flex-col items-center justify-center py-4">
          <span className="text-yellow-500/70 text-xs font-bold uppercase tracking-widest mb-1">Финальный счет</span>
          <span className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
            {score}
          </span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => { playSfx('click'); startGame(); }}
            className="w-full flex items-center justify-center gap-2 py-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 rounded-xl font-bold transition-all text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]"
          >
            <RotateCcw className="w-5 h-5" />
            ИГРАТЬ ЕЩЕ РАЗ
          </button>
          
          <button 
            onClick={() => { playSfx('click'); setScreen('MENU'); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors text-white"
          >
            <Home className="w-5 h-5 opacity-70" />
            В МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};
