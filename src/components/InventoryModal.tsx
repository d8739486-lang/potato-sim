import { useState, useEffect } from 'react';
import { useGameStore, type ToolType } from '../store/gameStore';
import { POTATOES, SPRINKLERS, type PotatoId, type SprinklerRarity } from '../data/gameData';
import { X } from 'lucide-react';
import { cn } from '../utils';


interface InventoryModalProps {
  onClose: () => void;
}

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const { inventory, hotbar, assignToHotbar } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ToolType | PotatoId | null>(null);

  // Defensive fallbacks to prevent crashes on incomplete inventory state
  const safeTools = inventory?.tools || { watering_can: 0, hoe: false };
  const safeSeeds = inventory?.seeds || {} as Record<PotatoId, number>;
  const safeSprinklers = inventory?.sprinklers || {} as Record<SprinklerRarity, number>;
  const safeHotbar = hotbar || [];

  useEffect(() => {
    setDraggedItem(null);
  }, [hotbar]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400);
  };

  const handleItemClick = (item: ToolType | PotatoId) => {
    if (selectedSlot !== null) {
      assignToHotbar(selectedSlot, item);
      setSelectedSlot(null);
    }
  };

  const handleItemDoubleClick = (item: ToolType | PotatoId) => {
    const emptyIndex = hotbar.findIndex(slot => slot === null);
    if (emptyIndex !== -1) {
      assignToHotbar(emptyIndex, item);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: ToolType | PotatoId) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'inventory', item }));

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
      e.dataTransfer.setDragImage(ghost, clonedImg.width / 2 || 24, clonedImg.height / 2 || 24);
    } else {
      e.dataTransfer.setDragImage(btn, btn.offsetWidth / 2, btn.offsetHeight / 2);
    }

    setTimeout(() => setDraggedItem(item), 0);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allows dropping
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.source === 'inventory' && data.item) {
        assignToHotbar(index, data.item);
      }
    } catch (err) {}
  };

  const handleBackpackDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.source === 'hotbar' && typeof data.fromSlot === 'number') {
        assignToHotbar(data.fromSlot, null);
      }
    } catch (err) {}
  };

  return (
    <div 
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4", isClosing ? "animate-fade-out-fast" : "animate-fade-in-fast")}
      onMouseDown={e => e.stopPropagation()}
      onMouseMove={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
    >
      <div className={cn("bg-[#2c1810] border-4 border-[#4a331f] rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]", isClosing ? "animate-slide-down-fast" : "animate-slide-up-fast")}>
        
        <button 
          onClick={() => {
            handleClose();
          }}
          className="absolute top-6 right-6 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer border border-red-500/30 hover:border-red-500/50 z-50"
        >
          <X size={32} />
        </button>

        <h2 className="text-4xl font-black text-white drop-shadow-md mb-8 text-center uppercase tracking-widest">
          Ваш Рюкзак
        </h2>

        {/* Инструкция */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/10 mb-8 flex flex-col items-center">
          <p className="text-white/70 font-bold mb-4 text-center">
            {selectedSlot !== null 
              ? `Выберите предмет для слота №${selectedSlot + 1}`
              : 'Кликните на пустой слот хотбара, затем на предмет, чтобы назначить его.'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {safeHotbar.map((item, index) => {
              const isSelected = selectedSlot === index;
              return (
                <div 
                  key={index}
                  draggable={!!item}
                  onDragStart={(e) => {
                    if (!item) return;
                    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'hotbar', item, fromSlot: index }));
                  }}
                  onClick={() => setSelectedSlot(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "w-16 h-16 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all",
                    isSelected ? "bg-amber-500/30 border-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-black/50 border-white/20 hover:border-white/50",
                    index === 0 && "opacity-50 cursor-not-allowed",
                    item && index !== 0 && "cursor-grab active:cursor-grabbing"
                  )}
                >
                  {item === 'shovel' && <img src="/sprites/tool_shovel.png" alt="Лопата" className="w-10 h-10 object-contain drop-shadow-md" />}
                  {item === 'watering_can' && <img src="/sprites/tool_watering_can.png" alt="Лейка" className="w-10 h-10 object-contain drop-shadow-md" />}
                  {item === 'hoe' && <img src="/sprites/tool_hoe.png" alt="Мотыга" className="w-10 h-10 object-contain drop-shadow-md" />}
                  
                  {item && POTATOES[item as PotatoId] && (
                    <img src={`/sprites/seed_${item}.png`} alt="Семена" className="w-10 h-10 object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = '/sprites/seed_packet_base.png'; Object.assign(e.currentTarget.style, POTATOES[item as PotatoId].textureStyle); }} />
                  )}
                  {!item && <span className="text-white/20 font-black text-xl">{index + 1}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto custom-scrollbar pr-4"
          onDragOver={handleDragOver}
          onDrop={handleBackpackDrop}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white/50 mb-4 uppercase tracking-wider">Инструменты</h3>
            <div className="grid grid-cols-4 gap-4">
              {!safeHotbar.includes('watering_can') && safeTools.watering_can && (
                <button 
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'watering_can')}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleItemClick('watering_can')}
                  disabled={selectedSlot === 0}
                  className={cn("bg-black/40 border border-blue-500/30 hover:bg-blue-500/20 disabled:opacity-50 disabled:hover:bg-black/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer cursor-grab active:cursor-grabbing", draggedItem === 'watering_can' ? 'opacity-30 scale-95 border-blue-500 border-dashed' : '')}
                >
                  <div className="drag-image-container pointer-events-none">
                    <img src="/sprites/tool_watering_can.png" alt="Лейка" className="w-10 h-10 object-contain drop-shadow-md" />
                  </div>
                  <span className="text-sm font-bold text-blue-200">Лейка</span>
                </button>
              )}
              {!safeHotbar.includes('hoe') && safeTools.hoe && (
                <button 
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'hoe')}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleItemClick('hoe')}
                  disabled={selectedSlot === 0}
                  className={cn("bg-black/40 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50 disabled:hover:bg-black/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer cursor-grab active:cursor-grabbing", draggedItem === 'hoe' ? 'opacity-30 scale-95 border-amber-500 border-dashed' : '')}
                >
                  <div className="drag-image-container pointer-events-none">
                    <img src="/sprites/tool_hoe.png" alt="Мотыга" className="w-10 h-10 object-contain drop-shadow-md" />
                  </div>
                  <span className="text-sm font-bold text-amber-200">Мотыга</span>
                </button>
              )}
              {!safeTools.watering_can && !safeTools.hoe && (
                <div className="col-span-4 text-center py-4 text-white/30 font-bold">
                  У вас пока нет инструментов. Купите их в магазине!
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white/50 mb-4 uppercase tracking-wider">Семена</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(safeSeeds).filter(([id, count]) => count > 0 && !safeHotbar.includes(id as PotatoId) && POTATOES[id as PotatoId]).map(([id, count]) => {
                const potato = POTATOES[id as PotatoId];
                if (!potato) return null;
                return (
                  <button 
                    key={id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, id as PotatoId)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleItemClick(id as PotatoId)}
                    onDoubleClick={() => handleItemDoubleClick(id as PotatoId)}
                    disabled={selectedSlot === 0}
                    className={cn("relative bg-black/40 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-50 disabled:hover:bg-black/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer cursor-grab active:cursor-grabbing", draggedItem === id ? 'opacity-30 scale-95 border-green-500 border-dashed' : '')}
                  >
                    <div className="drag-image-container pointer-events-none">
                      <img src={`/sprites/seed_${id}.png`} alt={potato.name} className="w-12 h-12 object-contain drop-shadow-md" onError={(e) => { e.currentTarget.src = '/sprites/seed_packet_base.png'; Object.assign(e.currentTarget.style, potato.textureStyle); }} />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight uppercase" style={{ color: potato.color }}>
                      {potato.name}
                    </span>
                    <div className="absolute -top-3 -right-3 bg-secondary text-black font-black text-sm w-8 h-8 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                      x{count}
                    </div>
                  </button>
                );
              })}
              {Object.values(safeSeeds).every(count => count === 0) && (
                <div className="col-span-4 text-center py-4 text-white/30 font-bold">
                  У вас нет семян. Купите их в магазине!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold text-white/50 mb-4 uppercase tracking-wider">Сплинкеры</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(safeSprinklers).filter(([_, count]) => count > 0).map(([id, count]) => {
                const sprinklerId = id as SprinklerRarity;
                const sprinkler = SPRINKLERS[sprinklerId];
                if (!sprinkler) return null;
                return (
                  <button 
                    key={id}
                    onClick={() => {
                      if (selectedSlot === null) {
                        useGameStore.getState().setActiveTool('sprinkler', null, sprinklerId);
                        handleClose();
                      }
                    }}
                    disabled={selectedSlot !== null}
                    title={selectedSlot !== null ? "Сплинкеры нельзя поместить в хотбар" : "Взять в руки"}
                    className={cn("relative bg-black/40 border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all", sprinkler.color, selectedSlot !== null ? "opacity-50 cursor-not-allowed" : "hover:brightness-125 cursor-pointer")}
                  >
                    <div className={cn("w-10 h-10 rounded-full border-4 flex items-center justify-center drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-black/50", sprinkler.color)} style={sprinkler.textureStyle}>
                      <div className="w-3 h-3 rounded-full border-2 border-current opacity-50" />
                    </div>
                    <span className={cn("text-[10px] font-bold text-center leading-tight uppercase", sprinkler.iconColor)}>
                      {sprinkler.name}
                    </span>
                    <div className="absolute -top-3 -right-3 bg-secondary text-black font-black text-sm w-8 h-8 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                      x{count}
                    </div>
                  </button>
                );
              })}
              {Object.keys(safeSprinklers).length === 0 && (
                <div className="col-span-4 text-center py-4 text-white/30 font-bold">
                  У вас нет сплинкеров. Купите их в магазине!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
