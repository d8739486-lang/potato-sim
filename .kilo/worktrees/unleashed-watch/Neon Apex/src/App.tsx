import { useRef, useEffect } from 'react';
import { useGameStore } from './core/store/useGameStore';
import { useGameEngine } from './core/engine/GameEngine';
import { Preloader } from './features/Preloader';
import { MainMenu } from './features/MainMenu';
import { SettingsMenu } from './features/SettingsMenu';
import { AAATransition } from './features/AAATransition';
import { SafeZone } from './features/SafeZone';
import { ArenaHud } from './features/ArenaHud';
import { ModalRoot } from './components/ModalRoot';

function App() {
  const gameState = useGameStore((s) => s.gameState);
  const settings = useGameStore((s) => s.settings);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioInitialized = useRef(false);
  
  // Audio Controller
  useEffect(() => {
    if (audioRef.current && !audioInitialized.current) {
      audioInitialized.current = true;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        useGameStore.getState().setAudioAnalyser(analyser);
      } catch (e) {
        console.error("Audio Context setup failed", e);
      }
    }

    if (audioRef.current) {
      audioRef.current.volume = (settings.musicVolume / 100) * (settings.masterVolume / 100);
      if (gameState === 'MENU' || gameState === 'SETTINGS') {
        audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameState, settings.musicVolume, settings.masterVolume]);

  // GameEngine only runs when in PLAYING or SAFE_ZONE
  useGameEngine(canvasRef, matrixCanvasRef);

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-screen h-screen overflow-hidden bg-black text-white font-inter ${(gameState === 'SAFE_ZONE' || gameState === 'PLAYING') ? 'cursor-none' : ''}`}
    >
      {/* Background Matrix Layer */}
      <canvas 
        ref={matrixCanvasRef} 
        className="absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-1000"
      />
      
      {/* Game Layer */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 z-20 border-2 border-[rgba(0,242,255,0.1)] saturate-150 contrast-125 transition-opacity duration-1000 ${(gameState === 'SAFE_ZONE' || gameState === 'PLAYING') ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* UI Layers Overlaid */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        
        {gameState === 'PRELOADER' && <Preloader />}
        {gameState === 'MENU' && <MainMenu />}
        {gameState === 'SETTINGS' && <SettingsMenu />}
        {gameState === 'TRANSITION' && <AAATransition />}
        {gameState === 'SAFE_ZONE' && <SafeZone />}
        {gameState === 'PLAYING' && <ArenaHud />}
      </div>

      {/* Global Audio Player */}
      <audio ref={audioRef} src="/assets/soundtracks/main_menu.mp3" loop />
      
      {/* Global Modals */}
      <ModalRoot />
    </div>
  );
}

export default App;
