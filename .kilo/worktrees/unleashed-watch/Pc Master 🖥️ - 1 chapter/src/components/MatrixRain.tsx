import { useEffect, useRef } from 'react';
import { useGameStore, LEVELS_DATA } from '@/core/store';

interface MatrixRainProps {
  opacity?: number;
  blur?: number;
  speed?: number;
}

export const MatrixRain = ({ opacity = 0.5, blur = 0, speed = 33 }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { evolution } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentLevel = LEVELS_DATA[evolution];
    const matrixColor = currentLevel.colors.main;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#&';
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = matrixColor;
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, index) => {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = index * fontSize;
        
        ctx.fillText(text, x, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        }
        drops[index]++;
      });
    };

    const interval = setInterval(draw, speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [evolution]); // Re-init rain when evolution (and color) changes

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-filter duration-2000"
      style={{ 
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : 'none'
      }}
    />
  );
};
