import { useEffect, useState, useMemo, useRef } from 'react';
import { useGameStore, type ToolType } from '../store/gameStore';
import { getCrop, ERA_INFO, SPRINKLERS, type PotatoId } from '../data/gameData';
import Toolbar from './Toolbar';
import { Lock } from 'lucide-react';
import { cn } from '../utils';

import { toast } from 'sonner';

const PLOT_SIZE = 120; 
const PLOT_GAP = 16;
const CELL_SIZE = PLOT_SIZE + PLOT_GAP;


interface FieldProps {
  onBack: () => void;
}

export default function Field({ onBack }: FieldProps) {
  const { plots, sprinklers, gridRadius, unlockedPlots, interactWithPlot, interactWithIntersection, harvestPlot, buyPlot, rebirthUpgrades, currentEra } = useGameStore();
  const eraInfo = ERA_INFO[currentEra] || ERA_INFO.potato;
  const timeWarpMultiplier = 1 - ((rebirthUpgrades?.timeWarpLevel || 0) * 0.05);
  const [, setTick] = useState(0);
  
  const [harvestAnimIds, setHarvestAnimIds] = useState<{ [key: string]: string }>({});
  const [shovelAnimIds, setShovelAnimIds] = useState<{ [key: string]: boolean }>({});
  const [plantAnimIds, setPlantAnimIds] = useState<{ [key: string]: { seedId: PotatoId; key: number } }>({});
  const [hoveredIntersection, setHoveredIntersection] = useState<{x: number, y: number, radius: number} | null>(null);
  const sprinklerAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Camera State
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playHarvestAnim = (plotId: string, potatoName: string) => {
    setHarvestAnimIds(prev => ({ ...prev, [plotId]: potatoName }));
    setTimeout(() => {
      setHarvestAnimIds(prev => {
        const next = { ...prev };
        delete next[plotId];
        return next;
      });
    }, 1000);
  };

  const playPlantAnim = (plotId: string, seedId: PotatoId) => {
    setPlantAnimIds(prev => ({ ...prev, [plotId]: { seedId, key: Date.now() } }));
    setTimeout(() => {
      setPlantAnimIds(prev => {
        const next = { ...prev };
        delete next[plotId];
        return next;
      });
    }, 950);
  };

  const playShovelAnim = (id: string) => {
    setShovelAnimIds(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setShovelAnimIds(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 800);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      useGameStore.getState().dryPlots();
      useGameStore.getState().tickSprinklers();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Positional Audio Loop
  useEffect(() => {
    sprinklerAudioRef.current = new Audio('/sfx/splinker.wav');
    if (sprinklerAudioRef.current) {
       sprinklerAudioRef.current.loop = true;
       sprinklerAudioRef.current.volume = 0;
    }

    const playAudio = () => {
      sprinklerAudioRef.current?.play().catch(() => {});
      document.removeEventListener('click', playAudio);
    };
    document.addEventListener('click', playAudio);

    const interval = setInterval(() => {
      if (!sprinklerAudioRef.current) return;
      const { sprinklers } = useGameStore.getState();
      const placedKeys = Object.keys(sprinklers);
      
      if (placedKeys.length === 0) {
         sprinklerAudioRef.current.volume = 0;
         return;
      }

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      let minDistance = Infinity;

      placedKeys.forEach(key => {
         const [sx, sy] = key.split('_').map(Number);
         const worldX = sx * CELL_SIZE + CELL_SIZE/2;
         const worldY = sy * CELL_SIZE + CELL_SIZE/2;
         const screenX = cx + (worldX + camera.x) * camera.zoom;
         const screenY = cy + (worldY + camera.y) * camera.zoom;

         const dist = Math.sqrt((screenX - cx)**2 + (screenY - cy)**2);
         if (dist < minDistance) minDistance = dist;
      });

      const MAX_DIST = 1000;
      let targetVolume = 0;
      if (minDistance < MAX_DIST) {
         targetVolume = Math.max(0, 1 - (minDistance / MAX_DIST));
      }
      
      const currentVol = sprinklerAudioRef.current.volume;
      const maxVol = useGameStore.getState().getSoundVol(0.1);
      sprinklerAudioRef.current.volume = currentVol + (targetVolume * maxVol - currentVol) * 0.5;
    }, 100);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', playAudio);
      if (sprinklerAudioRef.current) {
        sprinklerAudioRef.current.pause();
        sprinklerAudioRef.current = null;
      }
    };
  }, [camera]);

  const handlePlotClick = (x: number, y: number) => {
    if (isDragging) return;
    const plotId = `${x}_${y}`;

    const { activeTool } = useGameStore.getState();
    const plot = plots[plotId] || { id: plotId, isWatered: false, isTilled: false, tilledUsesLeft: 0, plantedSeedId: null, plantedAt: null, sprinklerId: null };

    if (activeTool === 'hand' && plot.plantedSeedId && plot.plantedAt) {
       const potato = getCrop(plot.plantedSeedId, currentEra);
       const waterMultiplier = plot.isWatered ? 0.8 : 1.0;
       const isReady = Date.now() >= plot.plantedAt + (potato.growTimeSec * 1000 * timeWarpMultiplier * waterMultiplier);
       if (isReady) {
          const success = harvestPlot(plotId);
          if (success) {
             playHarvestAnim(plotId, potato.name);
             const audio = new Audio('/sfx/harvest.wav');
             audio.volume = useGameStore.getState().getSoundVol(0.6);
             audio.play().catch(() => {});
          } else {
             // Play synthesized "tutu" error sound
             try {
               const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
               const ctx = new AudioContext();
               const osc = ctx.createOscillator();
               const gainNode = ctx.createGain();
               osc.type = 'square';
               osc.frequency.value = 120; // low pitch for error
               
               gainNode.gain.setValueAtTime(0, ctx.currentTime);
               // First beep
               gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
               gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
               // Second beep
               gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.12);
               gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
               
               osc.connect(gainNode);
               gainNode.connect(ctx.destination);
               osc.start();
               osc.stop(ctx.currentTime + 0.25);
             } catch (e) {
               console.error(e);
             }
          }
          return;
       }
    }
    const { selectedSeedId } = useGameStore.getState();
    const canPlantSeed = activeTool === 'seed' && selectedSeedId && plot.isTilled && !plot.plantedSeedId && ((useGameStore.getState().inventory?.seeds?.[selectedSeedId] ?? 0) > 0);
    const seedBeingPlanted = selectedSeedId;
    const hadSomething = plot.plantedSeedId || plot.isTilled;

    interactWithPlot(plotId);
    
    if (canPlantSeed && seedBeingPlanted) {
       playPlantAnim(plotId, seedBeingPlanted);
       const audio = new Audio('/sfx/plant.wav');
       audio.volume = useGameStore.getState().getSoundVol(0.5);
       audio.play().catch(() => {});
    } else if (activeTool === 'hoe') {
       const audio = new Audio('/sfx/hoe.wav');
       audio.volume = useGameStore.getState().getSoundVol(0.5);
       audio.play().catch(() => {});
    } else if (activeTool === 'shovel' && hadSomething) {
       const updatedPlot = useGameStore.getState().plots[plotId];
       if (!updatedPlot?.plantedSeedId && !updatedPlot?.isTilled) {
         playShovelAnim(plotId);
         const audio = new Audio('/sfx/shovel.wav');
         audio.volume = useGameStore.getState().getSoundVol(0.5);
         audio.play().catch(() => {});
       }
    }
  };

  const handleIntersectionClick = (x: number, y: number) => {
     if (isDragging) return;
     const { activeTool } = useGameStore.getState();
     if (activeTool === 'sprinkler' || activeTool === 'shovel') {
        const id = `${x}_${y}`;
        const hadSprinkler = !!useGameStore.getState().sprinklers[id];
        interactWithIntersection(x, y);
        const hasSprinkler = !!useGameStore.getState().sprinklers[id];
        if (activeTool === 'shovel' && hadSprinkler && !hasSprinkler) {
           playShovelAnim(`int_${id}`);
        }
     }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.source === 'hotbar' && data.item) {
        const item = data.item;
        const { setActiveTool } = useGameStore.getState();
        if (item === 'shovel' || item === 'watering_can' || item === 'hoe' || item === 'hand') {
          setActiveTool(item as ToolType);
        } else {
          setActiveTool('seed', item as PotatoId);
        }
        setTimeout(() => handlePlotClick(x, y), 0);
      }
    } catch (err) {}
  };

  // Camera Controls
  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001;
    setCamera(prev => {
      const delta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.min(Math.max(0.1, prev.zoom + delta), 2);
      
      const mouseX = e.clientX - window.innerWidth / 2;
      const mouseY = e.clientY - window.innerHeight / 2;
      const ratio = newZoom / prev.zoom;
      
      return { 
        x: mouseX - (mouseX - prev.x) * ratio, 
        y: mouseY - (mouseY - prev.y) * ratio, 
        zoom: newZoom 
      };
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !(e.target as HTMLElement).closest('.clickable-element')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCamera(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const { visiblePlots, visibleIntersections } = useMemo(() => {
    const { w, h } = windowSize;
    const { x: cx, y: cy, zoom } = camera;

    const pxMin = (-w/2 - cx) / zoom;
    const pxMax = (w/2 - cx) / zoom;
    const pyMin = (-h/2 - cy) / zoom;
    const pyMax = (h/2 - cy) / zoom;

    const xMin = Math.floor(pxMin / CELL_SIZE) - 2;
    const xMax = Math.ceil(pxMax / CELL_SIZE) + 2;
    const yMin = Math.floor(pyMin / CELL_SIZE) - 2;
    const yMax = Math.ceil(pyMax / CELL_SIZE) + 2;

    const cells = [];
    const intersections = [];
    
    const isUnlocked = (nx: number, ny: number) => 
      Math.max(Math.abs(nx), Math.abs(ny)) <= gridRadius || !!unlockedPlots[`${nx}_${ny}`];

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        if (Math.abs(x) > 200 || Math.abs(y) > 200) continue;

        if (isUnlocked(x, y)) {
           cells.push({ x, y, isLocked: false });
        } else {
           if (isUnlocked(x-1, y) || isUnlocked(x+1, y) || isUnlocked(x, y-1) || isUnlocked(x, y+1)) {
              cells.push({ x, y, isLocked: true });
           }
        }
        
        if (isUnlocked(x, y) || isUnlocked(x+1, y) || isUnlocked(x, y+1) || isUnlocked(x+1, y+1)) {
           intersections.push({ x, y });
        }
      }
    }
    return { visiblePlots: cells, visibleIntersections: intersections };
  }, [windowSize, camera, unlockedPlots, gridRadius]);

  const { activeTool } = useGameStore();
  const showIntersections = activeTool === 'sprinkler';

  return (
    <div 
      className="w-full h-screen bg-[#377e31] flex flex-col items-center justify-center relative overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ 
        backgroundImage: `
          linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.08) 75%, rgba(255,255,255,0.08)),
          linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.08) 75%, rgba(255,255,255,0.08))
        `,
        backgroundRepeat: 'repeat',
        backgroundPosition: `${camera.x * 0.2}px ${camera.y * 0.2}px, ${camera.x * 0.2 + 32}px ${camera.y * 0.2 + 32}px`,
        backgroundSize: '64px 64px'
      }} />
      
      <div 
        className="absolute top-1/2 left-1/2 will-change-transform"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}
      >
        {visiblePlots.map(({ x, y, isLocked }) => {
          const plotId = `${x}_${y}`;
          const plot = plots[plotId];
          
          let potato = plot?.plantedSeedId ? getCrop(plot.plantedSeedId, currentEra) : null;
          let isReady = false;

          if (potato && plot?.plantedAt) {
            const elapsed = Date.now() - plot.plantedAt;
            const waterMultiplier = plot.isWatered ? 0.8 : 1.0;
            const totalRequired = potato.growTimeSec * 1000 * timeWarpMultiplier * waterMultiplier;
            isReady = elapsed >= totalRequired;
          }

          if (isLocked) {
             const layer = Math.max(Math.abs(x), Math.abs(y));
             let cost = Math.floor(50 * Math.pow(3, Math.max(0, layer - 3)));
             if (useGameStore.getState().rebirthUpgrades.cheapLandLevel > 0) {
               cost = Math.floor(cost * Math.pow(0.9, useGameStore.getState().rebirthUpgrades.cheapLandLevel));
             }

             return (
               <div 
                 key={plotId}
                 onClick={() => {
                   const { success, cost: buyCost } = buyPlot(x, y);
                   if (!success) toast.error(`Недостаточно ${eraInfo.cropName.toLowerCase()}! Нужно ${buyCost} ${eraInfo.currencyEmoji}`);
                 }}
                 className={cn(
                    "clickable-element absolute w-[120px] h-[120px] rounded-2xl cursor-pointer transition-colors border-4 flex flex-col items-center justify-center gap-2 z-0",
                    "bg-black/40 border-white/10 hover:border-amber-500/50 hover:bg-black/50 backdrop-blur-sm shadow-xl"
                 )}
                 style={{
                   left: x * CELL_SIZE - (PLOT_SIZE/2),
                   top: y * CELL_SIZE - (PLOT_SIZE/2),
                 }}
               >
                 <Lock size={32} className="text-white/30 mb-1" />
                 <div className="bg-black/60 px-3 py-1 rounded-lg text-amber-400 font-black text-sm whitespace-nowrap drop-shadow-md border border-amber-500/30">
                    {cost.toLocaleString()} {eraInfo.currencyEmoji}
                 </div>
               </div>
             )
          }

          return (
            <div 
              key={plotId}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, x, y)}
              onClick={() => handlePlotClick(x, y)}
              onMouseEnter={(e) => {
                if (e.buttons === 1) handlePlotClick(x, y);
              }}
              className={cn(
                "clickable-element absolute w-[120px] h-[120px] rounded-2xl cursor-pointer transition-colors border-4 flex items-center justify-center z-0",
                plot?.isWatered 
                    ? "bg-[#2e1a0e] border-[#1d1008] shadow-[inset_0_0_20px_rgba(37,99,235,0.25)]" 
                    : "bg-[#593e26] border-[#4a331f]",
                plot?.isTilled && !plot?.isWatered && "bg-[#6b4c30]",
                "hover:brightness-110"
              )}
              style={{
                left: x * CELL_SIZE - (PLOT_SIZE/2),
                top: y * CELL_SIZE - (PLOT_SIZE/2),
              }}
            >
              
              {plot?.isTilled && !plot?.plantedSeedId && (
                <div className="absolute inset-2 flex flex-col justify-evenly opacity-30 pointer-events-none">
                  <div className="w-full h-1 bg-black/40 rounded-full" />
                  <div className="w-full h-1 bg-black/40 rounded-full" />
                  <div className="w-full h-1 bg-black/40 rounded-full" />
                </div>
              )}

              {/* Визуальный эффект политой влажной почвы для всех политых клеток */}
              {plot?.isWatered && (
                <div className="absolute inset-0 bg-blue-500/20 pointer-events-none rounded-xl border border-blue-400/40 shadow-[inset_0_0_15px_rgba(59,130,246,0.3)] animate-pulse z-0" />
              )}

              {plot?.plantedSeedId && potato && (() => {
                 const waterMultiplier = plot.isWatered ? 0.8 : 1.0;
                 const totalRequired = potato.growTimeSec * 1000 * timeWarpMultiplier * waterMultiplier;
                 const progress = plot.plantedAt ? Math.min(1, (Date.now() - plot.plantedAt) / totalRequired) : 0;
                 return (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                     {!isReady ? (
                        <div 
                           className="origin-bottom transition-transform duration-1000 drop-shadow-md cursor-default select-none pointer-events-none relative"
                           style={{ 
                              filter: `${potato.textureStyle.filter} brightness(0.9) saturate(1.2)`,
                              transform: `scale(${0.3 + progress * 0.7})`,
                              width: '30px',
                              height: '40px'
                           }}
                        >
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-[#4ade80] rounded-full shadow-sm" />
                           <div className="absolute top-[20%] left-[-8px] w-4 h-4 bg-[#4ade80] rounded-bl-full rounded-tr-full -rotate-12 shadow-sm" />
                           <div className="absolute top-[40%] right-[-8px] w-4 h-4 bg-[#4ade80] rounded-br-full rounded-tl-full rotate-12 shadow-sm" />
                        </div>
                     ) : (
                        <img 
                          src={eraInfo.sprite} 
                          alt={potato.name} 
                          className="w-16 h-16 object-contain transition-all duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-bounce hover:scale-110"
                          style={potato.textureStyle}
                        />
                     )}
                     
                     {!isReady && (
                       <div className="absolute bottom-2 left-2 right-2 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                         <div 
                           className={cn("h-full transition-all duration-1000", plot.isWatered ? "bg-blue-400" : "bg-amber-500")}
                           style={{ width: `${progress * 100}%` }}
                         />
                       </div>
                     )}
                   </div>
                 );
              })()}

              {shovelAnimIds[plotId] && (
                <div className="absolute inset-0 pointer-events-none z-50">
                   {[...Array(8)].map((_, i) => (
                      <div key={i} className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#4a2b16] rounded-sm animate-particle" 
                           style={{ 
                              '--tx': `${(Math.random() - 0.5) * 150}px`,
                              '--ty': `${-50 - Math.random() * 100}px`,
                              '--rot': `${Math.random() * 360}deg`
                           } as any} />
                   ))}
                </div>
              )}

              {plantAnimIds[plotId] && (() => {
                const anim = plantAnimIds[plotId];
                const animCrop = getCrop(anim.seedId, currentEra);
                return (
                  <div key={anim.key} className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                    {/* Трясущийся пакетик семян над лункой */}
                    <div className="absolute top-1/2 left-1/2 animate-seed-pour">
                      <img 
                        src={`/sprites/seed_${anim.seedId}.png`} 
                        alt={animCrop.name}
                        className="w-14 h-14 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                        onError={(e) => { 
                          e.currentTarget.src = eraInfo.seedPacketSprite; 
                          Object.assign(e.currentTarget.style, animCrop.textureStyle); 
                        }}
                      />
                    </div>

                    {/* Высыпающиеся частицы семян */}
                    {[
                      { sx: -16, sy: 12, delay: 0.1 },
                      { sx: 14, sy: 8, delay: 0.15 },
                      { sx: -8, sy: 22, delay: 0.2 },
                      { sx: 10, sy: 20, delay: 0.25 },
                      { sx: -2, sy: 15, delay: 0.18 },
                      { sx: 18, sy: 26, delay: 0.28 },
                      { sx: -14, sy: 28, delay: 0.3 }
                    ].map((seed, i) => (
                      <div 
                        key={i}
                        className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full animate-seed-scatter shadow-md"
                        style={{
                          backgroundColor: animCrop.color || '#eab308',
                          border: '1px solid rgba(0,0,0,0.4)',
                          animationDelay: `${seed.delay}s`,
                          '--sx': `${seed.sx}px`,
                          '--sy': `${seed.sy}px`
                        } as any}
                      />
                    ))}
                  </div>
                );
              })()}

              {harvestAnimIds[plotId] && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-green-400 font-black text-xl whitespace-nowrap animate-fade-out-up z-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
                  +{harvestAnimIds[plotId]}
                </div>
              )}
            </div>
          );
        })}

        {visibleIntersections.map(({ x, y }) => {
           const intersectionId = `${x}_${y}`;
           const rarity = sprinklers[intersectionId];
           const hasSprinkler = !!rarity;
           const spr = rarity ? SPRINKLERS[rarity] : null;

           if (!hasSprinkler && !showIntersections) return null;
           
           const coverageByRarity: Record<string, number> = { common: 1, rare: 2, epic: 3, mythic: 4, legendary: 5 };
           const isHovered = hoveredIntersection?.x === x && hoveredIntersection?.y === y;
           const currentRadius = hasSprinkler ? coverageByRarity[rarity!] : (useGameStore.getState().activeTool === 'sprinkler' && useGameStore.getState().selectedSprinklerId ? coverageByRarity[useGameStore.getState().selectedSprinklerId!] : 0);

           return (
              <div
                key={`int_${intersectionId}`}
                onMouseEnter={() => {
                  setHoveredIntersection({x, y, radius: currentRadius});
                }}
                onMouseLeave={() => setHoveredIntersection(null)}
                onClick={() => handleIntersectionClick(x, y)}
                className={cn(
                   "clickable-element absolute w-8 h-8 -ml-4 -mt-4 rounded-full z-30 transition-all flex items-center justify-center cursor-pointer hover:scale-125",
                   hasSprinkler ? "bg-transparent" : "bg-blue-500/30 hover:bg-blue-500/60 border-2 border-blue-400 border-solid shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                )}
                style={{
                   left: x * CELL_SIZE + CELL_SIZE/2,
                   top: y * CELL_SIZE + CELL_SIZE/2,
                }}
              >
                 {isHovered && currentRadius > 0 && (
                   <div 
                     className="absolute bg-blue-500/20 border-2 border-blue-400 border-dashed rounded-2xl pointer-events-none z-[-1] animate-pulse shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]"
                     style={{
                        width: currentRadius * 2 * CELL_SIZE - PLOT_GAP,
                        height: currentRadius * 2 * CELL_SIZE - PLOT_GAP,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                     }}
                   />
                 )}
                 {hasSprinkler && spr && (
                    <div className={cn("w-12 h-12 rounded-full border-4 flex items-center justify-center bg-black/50 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-[spin_4s_linear_infinite]", spr.color)} style={spr.textureStyle}>
                      <div className="w-4 h-4 rounded-full border-2 border-current opacity-50" />
                      
                      <div className="absolute inset-0 pointer-events-none">
                         {[...Array(12)].map((_, i) => (
                            <div key={i} className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-sprinkler-drop shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                                 style={{ 
                                    '--angle': `${(i / 12) * 360}deg`,
                                    '--dist': `${60 + Math.random() * 40}px`,
                                    'animationDelay': `${Math.random() * 1.5}s`
                                 } as any} />
                         ))}
                      </div>
                    </div>
                 )}
                 
                 {shovelAnimIds[`int_${intersectionId}`] && (
                   <div className="absolute inset-0 pointer-events-none z-50">
                      {[...Array(5)].map((_, i) => (
                         <div key={i} className="absolute top-1/2 left-1/2 w-2 h-2 bg-zinc-400 rounded-sm animate-particle" 
                              style={{ 
                                 '--tx': `${(Math.random() - 0.5) * 100}px`,
                                 '--ty': `${-30 - Math.random() * 50}px`,
                                 '--rot': `${Math.random() * 360}deg`
                              } as any} />
                      ))}
                   </div>
                 )}
              </div>
           );
        })}
      </div>

      <div className="absolute top-6 left-6 z-40 bg-black/50 p-4 rounded-2xl border border-white/10 text-white/50 text-sm font-bold pointer-events-none backdrop-blur-sm">
        <div>Масштаб: {camera.zoom.toFixed(2)}x</div>
        <div className="mt-2 text-xs font-normal">ЛКМ + Drag: Двигать камеру<br/>Колесико: Зум</div>
      </div>

      <Toolbar onBack={onBack} />
    </div>
  );
}
