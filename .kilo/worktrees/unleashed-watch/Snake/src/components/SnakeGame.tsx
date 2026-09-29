import { useEffect, useRef, useState } from 'react';
import { Play, Home } from 'lucide-react';
import { useSnakeStore } from '../store/useSnakeStore';
import type { Point } from '../store/useSnakeStore';

const GRID_SIZE = 20;

interface Particle {
  id: number;
  tx: string;
  ty: string;
}

export const SnakeGame = () => {
  const { 
    snakeBody, apple, score, currentSpeed, isGameOver, isPaused,
    setDirection, tick, masterVolume, musicVolume, sfxVolume, direction, isShaking,
    togglePause, setScreen, setMasterVolume, setMusicVolume, setSfxVolume, playSfx
  } = useSnakeStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevIsGameOver = useRef(false);
  
  // Музыка для основной игры
  useEffect(() => {
    const audio = new Audio('/assets/soundtracks/main_game.mp3');
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isGameOver || isPaused) {
        audioRef.current.pause();
      } else {
        const finalVolume = musicVolume * masterVolume;
        audioRef.current.volume = finalVolume;
        if (finalVolume > 0) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [musicVolume, masterVolume, isGameOver, isPaused]);

  // Запускаем визуальные эффекты при смерти (только один раз)
  useEffect(() => {
    if (isGameOver && !prevIsGameOver.current) {
      // Красная вспышка
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 650);

      // Частицы взрыва из головы змейки
      if (snakeBody.length > 0) {
        const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 360;
          const dist = 30 + Math.random() * 50;
          const tx = `${Math.cos((angle * Math.PI) / 180) * dist}px`;
          const ty = `${Math.sin((angle * Math.PI) / 180) * dist}px`;
          return { id: i, tx, ty };
        });
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 600);
      }
    }
    prevIsGameOver.current = isGameOver;
  }, [isGameOver, snakeBody]);

  // Управление с клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        togglePause();
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': case 'ц': case 'Ц':
          setDirection('UP'); break;
        case 'ArrowDown': case 's': case 'S': case 'ы': case 'Ы':
          setDirection('DOWN'); break;
        case 'ArrowLeft': case 'a': case 'A': case 'ф': case 'Ф':
          setDirection('LEFT'); break;
        case 'ArrowRight': case 'd': case 'D': case 'в': case 'В':
          setDirection('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection]);

  // Главный игровой цикл
  useEffect(() => {
    if (isGameOver) return;
    
    const interval = setInterval(() => {
      tick();
    }, currentSpeed);

    return () => clearInterval(interval);
  }, [tick, currentSpeed, isGameOver]);

  const getSegmentStyle = (segment: Point, index: number) => {
    const isHead = index === 0;
    const left = `${(segment.x / GRID_SIZE) * 100}%`;
    const top = `${(segment.y / GRID_SIZE) * 100}%`;
    const size = `${(1 / GRID_SIZE) * 100}%`;

    return {
      left, top,
      width: size,
      height: size,
      transition: `left ${currentSpeed}ms linear, top ${currentSpeed}ms linear`,
      zIndex: isHead ? 20 : 10,
    };
  };

  const getAppleStyle = (applePoint: Point) => ({
    left: `${(applePoint.x / GRID_SIZE) * 100}%`,
    top: `${(applePoint.y / GRID_SIZE) * 100}%`,
    width: `${(1 / GRID_SIZE) * 100}%`,
    height: `${(1 / GRID_SIZE) * 100}%`,
  });

  // Позиция головы для частиц (в %)
  const headPercX = snakeBody.length > 0 ? (snakeBody[0].x / GRID_SIZE) * 100 : 50;
  const headPercY = snakeBody.length > 0 ? (snakeBody[0].y / GRID_SIZE) * 100 : 50;

  return (
    <div className={`absolute inset-0 bg-background flex flex-col items-center justify-center p-4 ${isShaking ? 'shake' : ''}`}>
      {/* Красная вспышка при смерти */}
      {showFlash && (
        <div className="absolute inset-0 bg-red-600 pointer-events-none z-50 death-flash" />
      )}

      {/* Пауза */}
      {isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0e1624] border border-white/10 rounded-3xl p-8 w-full max-w-sm flex flex-col space-y-6 shadow-2xl relative">
            <h2 className="text-3xl font-black text-white text-center tracking-wider">ПАУЗА</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-300">
                  <span>Общая громкость</span>
                  <span>{Math.round(masterVolume * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={masterVolume} onChange={(e) => setMasterVolume(Number(e.target.value))}
                  onPointerUp={() => playSfx('slider')}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-300">
                  <span>Музыка</span>
                  <span>{Math.round(musicVolume * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))}
                  onPointerUp={() => playSfx('slider')}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-300">
                  <span>Звуки</span>
                  <span>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={sfxVolume} onChange={(e) => setSfxVolume(Number(e.target.value))}
                  onPointerUp={() => playSfx('slider')}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => { playSfx('click'); togglePause(); }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/50 rounded-xl font-bold transition-all text-lime-400"
              >
                <Play className="w-5 h-5" />
                ПРОДОЛЖИТЬ
              </button>
              
              <button 
                onClick={() => { 
                  playSfx('click'); 
                  if (isPaused) togglePause();
                  setScreen('MENU'); 
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors text-white"
              >
                <Home className="w-5 h-5 opacity-70" />
                В МЕНЮ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Счётчик */}
      <div className="z-30 flex flex-col items-center mb-4 mt-2">
        <span className="text-lime-500/50 text-xs font-bold uppercase tracking-widest">Счет</span>
        <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-lime-400 to-green-500 drop-shadow-[0_0_15px_rgba(132,204,22,0.5)]">
          {score}
        </span>
      </div>

      {/* Игровое поле */}
      <div 
        ref={boardRef}
        className="relative bg-[#0e1624] border border-white/5 rounded-xl shadow-[0_0_40px_rgba(132,204,22,0.1)] overflow-hidden"
        style={{ width: '90vmin', height: '90vmin', maxWidth: '800px', maxHeight: '800px' }}
      >
        {/* Сетка */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]" style={{ backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` }}></div>

        {/* Частицы взрыва */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle absolute w-2 h-2 bg-red-500 rounded-full"
            style={{
              left: `${headPercX}%`,
              top: `${headPercY}%`,
              ['--tx' as string]: p.tx,
              ['--ty' as string]: p.ty,
              boxShadow: '0 0 8px rgba(239,68,68,0.8)',
            } as React.CSSProperties}
          />
        ))}

        {/* Яблоко */}
        {apple && (
          <div className="absolute flex items-center justify-center" style={getAppleStyle(apple)}>
            {apple.type === 'NORMAL' ? (
              <div className="w-[80%] h-[80%] bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
            ) : (
              <div className="w-[80%] h-[80%] bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,1)] animate-pulse border border-white/50"></div>
            )}
          </div>
        )}

        {/* Змейка */}
        {snakeBody.map((segment, idx) => (
          <div 
            key={`${segment.x}-${segment.y}-${idx}`}
            className="absolute p-px"
            style={getSegmentStyle(segment, idx)}
          >
            <div className={`w-full h-full rounded-md shadow-[0_0_10px_rgba(132,204,22,0.4)] ${idx === 0 ? 'bg-lime-300' : 'bg-lime-500'} relative flex items-center justify-center`}>
              {idx === 0 && (
                <div 
                  className="absolute flex gap-[2px]"
                  style={{
                    transform: 
                      direction === 'UP' ? 'translateY(-2px)' :
                      direction === 'DOWN' ? 'translateY(2px)' :
                      direction === 'LEFT' ? 'translateX(-2px) rotate(90deg)' :
                      'translateX(2px) rotate(90deg)'
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
