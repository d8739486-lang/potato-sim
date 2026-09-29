import { useEffect, useState, useRef } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';

export const Countdown = () => {
  const { startGame, masterVolume, sfxVolume } = useSnakeStore();
  const [count, setCount] = useState(3);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Создаем AudioContext один раз для генерации звука
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playBeep = (freq: number, duration: number, type: OscillatorType = 'square') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Вычисляем громкость с учетом настроек ползунков
    const finalVol = (masterVolume * sfxVolume) * 0.1; // 0.1 как базовая громкость синтезатора
    gainNode.gain.setValueAtTime(finalVol, ctx.currentTime);
    
    // Затухание звука для приятного клика
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  useEffect(() => {
    if (count > 0) {
      // Писк (ту)
      playBeep(440, 0.1, 'sine');
      
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Последний длинный гудок (ТУУУУ)
      playBeep(880, 0.4, 'sine');
      
      // Задержка перед началом
      setTimeout(() => {
        startGame();
      }, 500);
    }
  }, [count]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-[150px] font-black text-transparent bg-clip-text bg-linear-to-br from-lime-400 to-green-600 drop-shadow-[0_0_80px_rgba(132,204,22,0.8)] animate-[pulse_1s_ease-in-out_infinite]">
        {count > 0 ? count : 'GO!'}
      </div>
    </div>
  );
};
