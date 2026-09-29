import { useSnakeStore } from '../store/useSnakeStore';
import { RotateCcw, Home } from 'lucide-react';

export const GameOver = () => {
  const { score, setScreen, startGame, playSfx } = useSnakeStore();

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#0e1624] border border-red-500/30 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center space-y-6 shadow-[0_0_60px_rgba(239,68,68,0.15)] relative overflow-hidden">
        {/* Декоративное свечение */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <h2 className="text-3xl font-black text-red-500 tracking-wider">GAME OVER</h2>
        
        <p className="text-slate-300 text-center text-sm font-medium">
          Ой! Вы врезались.<br />
          Хотите попробовать заново?
        </p>

        <div className="flex flex-col items-center justify-center py-4">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Ваш счет</span>
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500 drop-shadow-[0_0_20px_rgba(132,204,22,0.3)]">
            {score}
          </span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => { playSfx('click'); startGame(); }}
            className="w-full flex items-center justify-center gap-2 py-4 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/50 rounded-xl font-bold transition-all text-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.1)] hover:shadow-[0_0_25px_rgba(132,204,22,0.3)]"
          >
            <RotateCcw className="w-5 h-5" />
            НАЧАТЬ ЗАНОВО
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
