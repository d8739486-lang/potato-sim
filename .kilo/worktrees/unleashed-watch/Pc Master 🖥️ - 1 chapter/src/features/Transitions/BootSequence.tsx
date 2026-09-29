import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { playPcClickSound } from '@/core/audio';

interface BootSequenceProps {
  onFinish: () => void;
  videoSrc?: string;
  duration?: number;
}

export const BootSequence = ({ onFinish, videoSrc = "/textures/loading.mp4", duration = 7000 }: BootSequenceProps) => {
  useEffect(() => {
    playPcClickSound();
    
    // Total sequence timing: 1s Black -> 7s Video -> 1s Black -> Finish
    // We rely on the video onEnded for the second transition
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50000 flex items-center justify-center cursor-none">
      <video 
        autoPlay 
        className="w-full h-full object-cover" 
        onEnded={onFinish}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
};
