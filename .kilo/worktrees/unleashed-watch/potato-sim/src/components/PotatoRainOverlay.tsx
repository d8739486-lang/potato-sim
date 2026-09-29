import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface PotatoDrop {
  id: number;
  x: number;
  speed: number;
  size: number;
  rotation: number;
}

export default function PotatoRainOverlay() {
  const { isPotatoRainActive, potatoRainConfig, addCoins } = useGameStore();
  const [potatoes, setPotatoes] = useState<PotatoDrop[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const [phase, setPhase] = useState<'idle' | 'preloading' | 'active'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!isPotatoRainActive || !potatoRainConfig) {
      setPhase('idle');
      setPotatoes([]);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    if (potatoRainConfig.musicUrl && phase === 'idle') {
      setPhase('preloading');
      const audio = new Audio(potatoRainConfig.musicUrl);
      audio.preload = 'auto';
      audio.loop = true;
      audioRef.current = audio;

      const handleCanPlay = () => {
        setPhase('active');
        audio.play().catch(e => console.error('Audio play failed:', e));
      };
      
      const handleError = () => {
        console.warn("Failed to load music URL:", potatoRainConfig.musicUrl);
        setPhase('active');
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    } else if (!potatoRainConfig.musicUrl && phase === 'idle') {
      setPhase('active');
    }

  }, [isPotatoRainActive, potatoRainConfig, phase]);

  useEffect(() => {
    if (phase !== 'active' || !potatoRainConfig) return;

    const timer = setTimeout(() => {
       useGameStore.setState({ isPotatoRainActive: false });
    }, potatoRainConfig.duration * 1000);

    return () => clearTimeout(timer);
  }, [phase, potatoRainConfig]);

  useEffect(() => {
    if (phase !== 'active' || !potatoRainConfig) {
      setPotatoes([]);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = (time: number) => {
      if (time - lastSpawnRef.current > 100) {
        const drop: PotatoDrop = {
          id: Math.random(),
          x: Math.random() * window.innerWidth,
          speed: 2 + Math.random() * 5,
          size: 20 + Math.random() * 40,
          rotation: Math.random() * 360
        };
        setPotatoes(prev => [...prev.slice(-70), drop]);
        lastSpawnRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [phase, potatoRainConfig]);

  // Click handler
  useEffect(() => {
    if (phase !== 'active' || !potatoRainConfig) return;
    
    const bonus = potatoRainConfig.bonus;
    const color = potatoRainConfig.color;

    const handleClick = (e: MouseEvent) => {
      addCoins(bonus);
      
      const text = document.createElement('div');
      text.innerText = `+${bonus}`;
      text.style.position = 'fixed';
      text.style.left = `${e.clientX}px`;
      text.style.top = `${e.clientY}px`;
      text.style.color = color;
      text.style.fontWeight = 'black';
      text.style.fontSize = '28px';
      text.style.textShadow = '0 0 10px rgba(0,0,0,0.8)';
      text.style.pointerEvents = 'none';
      text.style.zIndex = '99999';
      text.style.transition = 'all 1s ease-out';
      document.body.appendChild(text);
      
      requestAnimationFrame(() => {
        text.style.transform = 'translateY(-100px) scale(1.5)';
        text.style.opacity = '0';
      });
      
      setTimeout(() => {
        if (text.parentNode) text.parentNode.removeChild(text);
      }, 1000);
      
      try {
        const audio = new Audio('/sfx/buy.wav');
        audio.volume = useGameStore.getState().getSoundVol(0.5);
        audio.playbackRate = 1.5 + Math.random();
        audio.play().catch(() => {});
      } catch (err) {}
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [phase, potatoRainConfig, addCoins]);

  if (!isPotatoRainActive || !potatoRainConfig) return null;

  return (
    <>
      {phase === 'preloading' && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in-fast">
          <div className="text-6xl animate-bounce mb-6">🥔</div>
          <h2 className="text-4xl font-black text-amber-500 uppercase tracking-widest text-center shadow-black drop-shadow-lg mb-2">ПОДГОТОВКА ИВЕНТА...</h2>
          <p className="text-white/50 animate-pulse">Загрузка музыки и ресурсов...</p>
        </div>
      )}
      
      {phase === 'active' && (
        <div className="fixed inset-0 pointer-events-none z-[9900] overflow-hidden">
           {potatoRainConfig.message && (
             <div className="absolute top-20 left-1/2 -translate-x-1/2 text-5xl font-black uppercase text-center animate-pulse drop-shadow-[0_0_15px_rgba(0,0,0,1)]" style={{ color: potatoRainConfig.color, textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
                {potatoRainConfig.message}
             </div>
           )}
           {potatoes.map(p => (
             <div 
               key={p.id}
               className="absolute pointer-events-none animate-fall-down"
               style={{
                 left: p.x,
                 top: -100,
                 width: p.size,
                 height: p.size,
                 backgroundImage: 'url(/sprites/potato_base.png)',
                 backgroundSize: 'cover',
                 transform: `rotate(${p.rotation}deg)`,
                 animationDuration: `${10 / p.speed}s`,
                 animationTimingFunction: 'linear',
               }}
             />
           ))}
        </div>
      )}
    </>
  );
}
