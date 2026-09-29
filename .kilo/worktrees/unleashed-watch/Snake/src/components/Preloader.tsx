import { useEffect, useState } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { Worm } from 'lucide-react';
import bgUrl from '../assets/bg.png';

// Все ассеты перечислены здесь — Vite знает их хэшированные имена
const IMAGE_URLS: string[] = [bgUrl];

export const Preloader = () => {
  const setScreen = useSnakeStore((state) => state.setScreen);
  const playSfx = useSnakeStore((state) => state.playSfx);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (IMAGE_URLS.length === 0) {
      setProgress(100);
      setIsReady(true);
      return;
    }

    let loadedCount = 0;
    const total = IMAGE_URLS.length;

    const handleLoad = () => {
      loadedCount++;
      setProgress((loadedCount / total) * 100);
      if (loadedCount === total) {
        setIsReady(true);
      }
    };

    IMAGE_URLS.forEach((url) => {
      const img = new Image();
      img.src = url;
      // Если уже кешировано — complete сразу true
      if (img.complete) {
        handleLoad();
      } else {
        img.onload = handleLoad;
        img.onerror = handleLoad; // не блокируем при ошибке
      }
    });
  }, []);

  const handleStart = async () => {
    if (!isReady) return;
    
    // Запрос полноэкранного режима по клику
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('Не удалось перейти в полноэкранный режим', e);
    }
    
    playSfx('click');
    setScreen('MENU');
  };

  return (
    <div 
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#080c14] text-white transition-colors duration-300 ${isReady ? 'cursor-pointer hover:bg-[#0a1220]' : ''}`}
      onClick={handleStart}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center space-y-8 w-full max-w-xs">
        <div className="relative">
          <div className="absolute inset-0 bg-lime-500/20 blur-xl rounded-full animate-pulse"></div>
          <div className="w-20 h-20 bg-[#0e1624] border border-lime-500/30 rounded-2xl flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(132,204,22,0.15)]">
            <Worm className="w-10 h-10 text-lime-400" />
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-lime-400/80">
            <span>LOADING...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-lime-600 via-lime-400 to-green-400 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
        
        <div className="h-6">
          {!isReady ? (
            <p className="text-slate-500 text-sm animate-pulse">
              Загрузка текстур...
            </p>
          ) : (
            <p className="text-lime-400 font-bold text-sm animate-pulse tracking-widest uppercase drop-shadow-[0_0_10px_rgba(132,204,22,0.8)]">
              НАЖМИТЕ ДЛЯ ЗАПУСКА
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
