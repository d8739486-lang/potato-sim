import { useEffect, useRef, useState } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { Play, Trophy, Settings as SettingsIcon, X, AlertTriangle, ScrollText } from 'lucide-react';
import bgImage from '../assets/bg.png';
import { UpdateLog } from './UpdateLog';
import { ProfileMenu } from '../features/profile/ProfileMenu';
import { AuthModal } from '../features/auth/AuthModal';
import { Leaderboard } from '../features/leaderboard/Leaderboard';

export const MainMenu = () => {
  const { 
    setScreen, 
    masterVolume, musicVolume, sfxVolume,
    setMasterVolume, setMusicVolume, setSfxVolume,
    resetProject, playSfx
  } = useSnakeStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Состояния для модалок
  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsClosing, setIsSettingsClosing] = useState(false);
  
  const [showLeaderboardDev, setShowLeaderboardDev] = useState(false);
  const [isLeaderboardClosing, setIsLeaderboardClosing] = useState(false);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetConfirmClosing, setIsResetConfirmClosing] = useState(false);

  // Состояние для старта игры
  const [isStarting, setIsStarting] = useState(false);
  const [showUpdateLog, setShowUpdateLog] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Функции плавного закрытия
  const closeSettings = () => {
    setIsSettingsClosing(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsSettingsClosing(false);
    }, 280);
  };

  const closeLeaderboard = () => {
    setIsLeaderboardClosing(true);
    setTimeout(() => {
      setShowLeaderboardDev(false);
      setIsLeaderboardClosing(false);
    }, 280);
  };

  const closeResetConfirm = () => {
    setIsResetConfirmClosing(true);
    setTimeout(() => {
      setShowResetConfirm(false);
      setIsResetConfirmClosing(false);
    }, 280);
  };

  // Инициализация аудио
  useEffect(() => {
    const audio = new Audio('/assets/soundtracks/main_menu.mp3');
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Управление громкостью
  useEffect(() => {
    if (audioRef.current) {
      if (isStarting) {
        // Плавно затухаем
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume -= 0.05;
          } else {
            clearInterval(fadeInterval);
            if (audioRef.current) audioRef.current.pause();
          }
        }, 100);
        return () => clearInterval(fadeInterval);
      } else {
        // Итоговая громкость = (Громкость музыки) * (Общая громкость)
        const finalVolume = musicVolume * masterVolume;
        audioRef.current.volume = finalVolume;
        
        if (finalVolume > 0) {
          audioRef.current.play().catch((e) => console.log('Автовоспроизведение заблокировано', e));
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [musicVolume, masterVolume, isStarting]);

  const handlePlayClick = () => {
    playSfx('click');
    setIsStarting(true);
    
    // Через 1 секунду переходим на экран обратного отсчета
    setTimeout(() => {
      setScreen('COUNTDOWN');
    }, 1000);
  };

  return (
    <div 
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cover bg-center animate-fade-in"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-[#080c14]/70 backdrop-blur-sm z-0"></div>

      {/* Профиль в правом верхнем углу */}
      <div className="absolute top-4 right-4 z-20">
        <ProfileMenu onOpenAuth={() => setShowAuth(true)} />
      </div>

      {/* Оверлей затухания при нажатии ИГРАТЬ */}
      <div className={`absolute inset-0 bg-black z-40 transition-opacity duration-1000 pointer-events-none ${isStarting ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="relative z-10 flex flex-col items-center space-y-10 w-full max-w-md p-6">
        
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-lime-400 to-emerald-600 drop-shadow-[0_0_30px_rgba(132,204,22,0.4)]">
            NEON SNAKE
          </h1>
        </div>

        <div className="flex flex-col w-full space-y-4">
          <button 
            onClick={handlePlayClick}
            className="group relative w-full flex items-center justify-center gap-3 py-4 bg-linear-to-r from-lime-600 to-green-600 rounded-2xl font-bold text-lg text-white shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_40px_rgba(132,204,22,0.5)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></div>
            <Play className="w-6 h-6" fill="currentColor" />
            <span>ИГРАТЬ</span>
          </button>

          <button 
            onClick={() => { playSfx('click'); setShowSettings(true); }}
            className="group flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
          >
            <SettingsIcon className="w-5 h-5 text-slate-400" />
            <span>НАСТРОЙКИ</span>
          </button>

          <button 
            onClick={() => { playSfx('click'); setShowLeaderboard(true); }}
            className="group flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>РЕКОРДЫ</span>
          </button>

          <button
            onClick={() => { playSfx('click'); setShowUpdateLog(true); }}
            className="group flex items-center justify-center gap-3 py-3 bg-white/3 hover:bg-white/8 border border-white/5 rounded-2xl font-semibold text-slate-400 hover:text-white transition-all duration-300"
          >
            <ScrollText className="w-4 h-4" />
            <span className="text-sm">Журнал обновлений</span>
          </button>
        </div>
      </div>

      {/* Журнал обновлений */}
      {showUpdateLog && <UpdateLog onClose={() => setShowUpdateLog(false)} />}

      {/* Живой лидерборд */}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}

      {/* Модалка авторизации */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Модалка Настроек */}
      {showSettings && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-opacity duration-300 ${isSettingsClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-[#0e1624] border border-white/10 rounded-3xl p-6 w-full max-w-sm flex flex-col space-y-6 relative shadow-2xl ${isSettingsClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <button 
              onClick={() => { playSfx('click'); closeSettings(); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-lime-400" />
              Настройки
            </h2>

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
                  <span>Звуковые эффекты</span>
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

            <button 
              onClick={() => { playSfx('click'); setShowResetConfirm(true); }}
              className="mt-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold transition-colors w-full"
            >
              СБРОСИТЬ ПРОГРЕСС
            </button>
          </div>
        </div>
      )}

      {/* Модалка Подтверждения Сброса */}
      {showResetConfirm && (
        <div className={`absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-opacity duration-300 ${isResetConfirmClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-[#0e1624] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] ${isResetConfirmClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Сброс прогресса</h3>
              <p className="text-slate-400 text-sm">
                Вы действительно хотите полностью сбросить прогресс? 
                Это действие удалит все данные аккаунта без возможности восстановления.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full mt-4">
              <button 
                onClick={() => { playSfx('click'); closeResetConfirm(); }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-colors text-white"
              >
                Отмена
              </button>
              <button 
                onClick={() => {
                  playSfx('click');
                  resetProject();
                  window.location.reload(); 
                }}
                className="flex-1 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка Лидерборда (В разработке) */}
      {showLeaderboardDev && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${isLeaderboardClosing ? 'opacity-0' : 'opacity-100'}`} onClick={closeLeaderboard}>
          <div className={`bg-[#0e1624] border border-yellow-500/30 rounded-3xl p-6 flex flex-col items-center space-y-4 shadow-[0_0_50px_rgba(234,179,8,0.15)] ${isLeaderboardClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center">Лидерборд в разработке</h3>
            <p className="text-slate-400 text-center text-sm max-w-[250px]">
              Таблица рекордов появится в следующих обновлениях!
            </p>
            <button 
              onClick={() => { playSfx('click'); closeLeaderboard(); }}
              className="mt-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
