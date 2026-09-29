import { useState, useEffect } from 'react';
import { useGameStore, type ToolType } from '../store/gameStore';
import { getCrop, type PotatoId } from '../data/gameData';
import { Hand, ArrowLeft, Backpack, Crown } from 'lucide-react';
import { cn } from '../utils';
import InventoryModal from './InventoryModal';
import { RebirthModal } from './RebirthModal';


interface ToolbarProps {
  onBack: () => void;
}

export default function Toolbar({ onBack }: ToolbarProps) {
  const { activeTool, setActiveTool, hotbar, selectedSeedId, inventory, currentEra } = useGameStore();
  const [showInventory, setShowInventory] = useState(false);
  const [showRebirthModal, setShowRebirthModal] = useState(false);

  useEffect(() => {
    const correctLength = 5 + (useGameStore.getState().rebirthUpgrades?.hotbarLevel || 0);
    let changed = false;
    let newHotbar = [...useGameStore.getState().hotbar];

    newHotbar = newHotbar.map(item => {
      if (item === 'shovel' || item === 'watering_can' || item === 'hoe' || item === 'hand') {
        changed = true;
        return null;
      }
      return item;
    });

    if (newHotbar.length !== correctLength) {
      changed = true;
      if (newHotbar.length < correctLength) {
        newHotbar = [...newHotbar, ...Array(correctLength - newHotbar.length).fill(null)];
      } else {
        newHotbar = newHotbar.slice(0, correctLength);
      }
    }

    if (changed) {
      useGameStore.setState({ hotbar: newHotbar });
    }
  }, []);

  const handleSlotClick = (item: ToolType | PotatoId | null) => {
    if (!item) {
      setActiveTool('hand');
      return;
    }

    if (item === 'shovel' || item === 'watering_can' || item === 'hoe' || item === 'hand') {
      if (activeTool === item) {
        setActiveTool('hand');
      } else {
        setActiveTool(item as ToolType);
      }
    } else {
      if (activeTool === 'seed' && selectedSeedId === item) {
        setActiveTool('hand');
      } else {
        setActiveTool('seed', item as PotatoId);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, item: ToolType | PotatoId | null, index: number) => {
    if (!item) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'hotbar', item, fromSlot: index }));
    
    const btn = e.currentTarget as HTMLElement;
    const img = btn.querySelector('img');
    if (img) {
      let ghost = document.getElementById('drag-ghost');
      if (!ghost) {
        ghost = document.createElement('div');
        ghost.id = 'drag-ghost';
        ghost.style.position = 'absolute';
        ghost.style.top = '-1000px';
        ghost.style.left = '-1000px';
        ghost.style.pointerEvents = 'none';
        document.body.appendChild(ghost);
      }
      ghost.innerHTML = '';
      const clonedImg = img.cloneNode(true) as HTMLImageElement;
      ghost.appendChild(clonedImg);
      e.dataTransfer.setDragImage(ghost, clonedImg.width / 2 || 20, clonedImg.height / 2 || 20);
    } else {
      e.dataTransfer.setDragImage(btn, btn.offsetWidth / 2, btn.offsetHeight / 2);
    }
  };



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      
      // Hotkey for Inventory (У / E or B or Tab or I)
      if (key === 'b' || key === 'и' || key === 'i' || key === 'tab' || key === 'e' || key === 'у') {
        if (key === 'tab') e.preventDefault();
        setShowInventory(prev => !prev);
        return;
      }

      // Hotkeys for Tools (Z, X, C, V)
      if (key === 'z' || key === 'я') {
        setActiveTool('hand');
        return;
      }
      if (key === 'x' || key === 'ч') {
        setActiveTool('hoe');
        return;
      }
      if (key === 'c' || key === 'с') {
        setActiveTool('watering_can');
        return;
      }
      if (key === 'v' || key === 'м') {
        setActiveTool('shovel');
        return;
      }

      // Hotkeys for Seeds (1-9)
      const num = parseInt(key, 10);
      if (!isNaN(num)) {
        let index = -1;
        if (num >= 1 && num <= 9) {
          index = num - 1;
        } else if (num === 0) {
          index = 9;
        }

        if (index >= 0 && index < hotbar.length) {
          const item = hotbar[index];
          if (item) {
            handleSlotClick(item);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotbar, activeTool, selectedSeedId, setActiveTool]);

  const toolsList: { id: ToolType; name: string; key: string; icon: React.ReactNode }[] = [
    { id: 'hand', name: 'Рука', key: 'Z', icon: <Hand size={24} className={activeTool === 'hand' ? "text-amber-400" : "text-white/60"} /> },
    { id: 'hoe', name: 'Мотыга', key: 'X', icon: <img src="/sprites/tool_hoe.png" alt="Мотыга" className="w-6 h-6 object-contain" /> },
    { id: 'watering_can', name: 'Лейка', key: 'C', icon: <img src="/sprites/tool_watering_can.png" alt="Лейка" className="w-6 h-6 object-contain" /> },
    { id: 'shovel', name: 'Лопата', key: 'V', icon: <img src="/sprites/tool_shovel.png" alt="Лопата" className="w-6 h-6 object-contain" /> },
  ];

  return (
    <>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md p-4 rounded-[2rem] border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 items-center z-40 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Кнопка назад */}
        <div className="relative w-full">
          <button 
            onClick={() => {
              onBack();
            }}
            className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all cursor-pointer border border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2"
            title="Вернуться на базу"
          >
            <ArrowLeft size={24} />
            <span className="text-xs font-black uppercase">База</span>
          </button>
        </div>

        <div className="w-full h-[1px] bg-white/10" />

        {/* Панель Инструментов (Z, X, C, V) */}
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[10px] font-black uppercase text-white/40 px-1">Инструменты (Z,X,C,V)</span>
          <div className="grid grid-cols-2 gap-2">
            {toolsList.map((t) => {
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer w-[65px] h-[65px]",
                    isActive 
                      ? "bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 z-10" 
                      : "bg-black/50 border-white/10 hover:bg-black/70 hover:border-white/30 text-white/60"
                  )}
                  title={`${t.name} [${t.key}]`}
                >
                  <div className="absolute top-1 left-1.5 text-[9px] font-black text-amber-300 bg-black/60 px-1 rounded border border-amber-400/30">
                    {t.key}
                  </div>
                  <div className="mt-2">{t.icon}</div>
                  <span className="text-[9px] font-bold mt-1 text-white/70 uppercase">{t.name}</span>
                  {t.id === 'watering_can' && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500/90 px-1.5 py-0.2 rounded text-[9px] font-black text-white border border-blue-300 shadow">
                      x{typeof inventory?.tools?.watering_can === 'number' ? inventory.tools.watering_can : (inventory?.tools?.watering_can ? 1 : 0)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/10" />

        {/* Панель Семян */}
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[10px] font-black uppercase text-white/40 px-1">
            Семена (1-{hotbar.length === 10 ? '0' : hotbar.length})
          </span>
          <div className="grid grid-cols-2 gap-2">
            {hotbar.map((item, index) => {
              const isTool = item === 'shovel' || item === 'watering_can' || item === 'hoe' || item === 'hand';
              const isSeed = item && !isTool;
              const potato = isSeed ? getCrop(item as PotatoId, currentEra) : null;
              
              const isActive = isSeed && activeTool === 'seed' && selectedSeedId === item;

              return (
                <button
                  key={index}
                  draggable={!!item}
                  onDragStart={(e) => handleDragStart(e, item, index)}
                  onClick={() => handleSlotClick(item)}
                  onDoubleClick={() => {
                    if (item && item !== 'hand' && item !== 'hoe' && item !== 'watering_can' && item !== 'shovel') {
                      useGameStore.getState().assignToHotbar(index, null);
                    }
                  }}
                  disabled={!item}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer w-[65px] h-[65px]",
                    isActive 
                      ? "bg-green-500/20 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105 z-10" 
                      : item 
                        ? "bg-black/50 border-white/10 hover:bg-black/70 hover:border-white/30 text-white" 
                        : "bg-black/20 border-dashed border-white/10 cursor-not-allowed opacity-40"
                  )}
                >
                  <div className="absolute top-1 left-1.5 text-[9px] font-black text-white/40">
                    {index === 9 ? '0' : index + 1}
                  </div>
                  
                  {potato && (
                    <>
                      <div className="drag-image-container pointer-events-none mt-1">
                        <img src={`/sprites/seed_${item}.png`} alt={potato.name} className="w-8 h-8 object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = '/sprites/seed_packet_base.png'; Object.assign(e.currentTarget.style, potato.textureStyle); }} title={potato.name} />
                      </div>
                      {(inventory?.seeds?.[item as PotatoId] ?? 0) > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-500/90 px-1.5 py-0.2 rounded text-[9px] font-black text-white border border-amber-300 shadow">
                          x{inventory?.seeds?.[item as PotatoId] ?? 0}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/10" />

        {/* Bottom buttons */}
        <div className="flex gap-2 w-full">
          {/* Кнопка Рюкзака */}
          <div className="relative flex-1">
            <button 
              onClick={() => {
                setShowInventory(true);
              }}
              className="w-full p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all cursor-pointer border border-purple-500/30 hover:border-purple-500/50 flex flex-col items-center justify-center"
              title="Рюкзак [У / E]"
            >
              <Backpack size={24} className="mb-0.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Рюкзак</span>
            </button>
          </div>

          {/* Кнопка Ребитха */}
          <div className="relative flex-1">
            <button 
              onClick={() => setShowRebirthModal(true)}
              className="w-full p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all cursor-pointer border border-indigo-500/30 hover:border-indigo-500/50 flex flex-col items-center justify-center"
              title="Врата Перерождения"
            >
              <Crown size={24} className="mb-0.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Эпохи</span>
            </button>
          </div>
        </div>

      </div>

      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      <RebirthModal isOpen={showRebirthModal} onClose={() => setShowRebirthModal(false)} />
    </>
  );
}
