import { useEffect, useRef } from 'react';
import { useGameStore } from '../core/store/useGameStore';

export function AudioVisualizer({ reverse = false }: { reverse?: boolean }) {
  const analyser = useGameStore(s => s.audioAnalyser);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount; 
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const padding = 4;
      const barWidth = (canvas.width / bufferLength) - padding;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        // Multiply percent by 1.5 to make bars jump higher
        const percent = Math.min(1, (val / 255) * 1.5);
        const barHeight = Math.max(2, percent * canvas.height);

        ctx.fillStyle = '#00f2ff';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        if (val > 50) {
          ctx.shadowColor = '#00f2ff';
          ctx.shadowBlur = 10;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }

        x += barWidth + padding;
      }
    };
    draw();

    return () => cancelAnimationFrame(animationId);
  }, [analyser]);

  return (
    <div className={`w-full h-48 flex items-end pointer-events-none opacity-50 ${reverse ? 'justify-end' : 'justify-start'}`}>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={200} 
        className={`w-full h-full drop-shadow-[0_0_15px_rgba(0,242,255,0.8)] ${reverse ? 'scale-x-[-1]' : ''}`} 
      />
    </div>
  );
}
