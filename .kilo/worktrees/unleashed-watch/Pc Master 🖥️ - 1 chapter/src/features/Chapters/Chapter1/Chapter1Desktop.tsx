import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  playErrorSound, 
  playBsodSound, 
  playPcClickSound,
  playButtonSound,
  playMenuSfx,
  playShutSound,
  playBootSound,
  playBGM,
  stopBGM,
  AUDIO_PATHS
} from '@/core/audio';
import { 
  Shield, 
  FileText, 
  Trash2, 
  X, 
  AlertTriangle, 
  Activity,
  CheckCircle2,
  Settings,
  Power
} from 'lucide-react';
import { cn } from '@/core/utils';

// Global timer: 2m 4s
const TOTAL_TIMER_SECONDS = 124;

interface DesktopFile {
  id: number;
  name: string;
  isVirus: boolean;
  status: 'desktop' | 'bin' | 'deleted' | 'quarantined';
}

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  type: 'none' | 'file' | 'bin';
  targetId?: number;
}

interface Chapter1DesktopProps {
  onWin: () => void;
  onLose?: () => void;
  onOpenBios: () => void;
}

export const Chapter1Desktop = ({ onWin, onLose, onOpenBios }: Chapter1DesktopProps) => {
  const [stage, setStage] = useState<'desktop' | 'red_bsod' | 'green_bsod'>('desktop');
  const [timer, setTimer] = useState(TOTAL_TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(true);
  const [ignoreClicks, setIgnoreClicks] = useState(0);

  // Apps
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'update'>('main');
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  
  // Persistent window positions (draggable)
  const [settingsPos, setSettingsPos] = useState({ x: 0, y: 0 });

  // Notifications
  const [notification, setNotification] = useState<{ id: number, text: string } | null>(null);

  const showNotification = (text: string) => {
    const id = Date.now();
    setNotification({ id, text });
    setTimeout(() => {
      setNotification(prev => prev?.id === id ? null : prev);
    }, 3000);
  };

  const [files, setFiles] = useState<DesktopFile[]>([
    { id: 1, name: 'miner.exe', isVirus: true, status: 'desktop' },
    { id: 2, name: 'stealer.rar', isVirus: true, status: 'desktop' },
    { id: 3, name: 'trojan_dropper.bat', isVirus: true, status: 'desktop' },
    { id: 4, name: 'worm_payload.dll', isVirus: true, status: 'desktop' },
    { id: 5, name: 'kernel32.dll', isVirus: false, status: 'desktop' },
    { id: 6, name: 'system_config.ini', isVirus: false, status: 'desktop' },
  ]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ show: false, x: 0, y: 0, type: 'none' });

  const desktopRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Mount Logic: Music & Startup
  useEffect(() => {
    if (stage === 'desktop') {
      playBootSound();
      playBGM(AUDIO_PATHS.MUSIC_STAGE_1, 500);
    }
    return () => stopBGM(500);
  }, [stage]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (timerActive && timer > 0 && stage === 'desktop') {
      interval = setInterval(() => {
        setTimer(p => p - 1);
      }, 1000);
    } else if (timer <= 0 && stage === 'desktop') {
      triggerBsod();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer, stage]);

  const triggerBsod = () => {
    setStage('green_bsod'); // Choice 1 of plot: "если ничего не делать"
    playBsodSound();
    setTimerActive(false);
  };

  // Keyboard BIOS trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'F2' && stage === 'red_bsod') {
        onOpenBios();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, onOpenBios]);

  const handleGlobalClick = () => {
    if (contextMenu.show) setContextMenu({ ...contextMenu, show: false });
    if (showStartMenu) setShowStartMenu(false);
  };

  const onContextMenuFile = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, type: 'file', targetId: id });
  };

  const onContextMenuBin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, type: 'bin' });
  };

  const handleContextMenuAction = (action: string) => {
    setContextMenu({ ...contextMenu, show: false });
    playButtonSound();

    if (contextMenu.type === 'file' && contextMenu.targetId) {
      if (action === 'delete') {
        const file = files.find(f => f.id === contextMenu.targetId);
        if (file) {
          if (!file.isVirus) {
            playErrorSound();
          } else {
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'bin' } : f));
            showNotification('файл перемещён в корзину');
          }
        }
      }
    } else if (contextMenu.type === 'bin' && action === 'empty') {
      const binFiles = files.filter(f => f.status === 'bin');
      if (binFiles.length > 0) {
        setFiles(prev => prev.map(f => f.status === 'bin' ? { ...f, status: 'deleted' } : f));
        showNotification('корзина очищена');
      } else {
        showNotification('корзина пуста, очищать нечего');
      }
    }
  };

  // Handle Ignore Clicks (Antivirus)
  const handleIgnore = (fileId: number) => {
    playButtonSound();
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'deleted' } : f));
    setIgnoreClicks(p => {
      const newClicks = p + 1;
      if (newClicks >= 4) {
        setTimeout(triggerBsod, 500);
      }
      return newClicks;
    });
  };

  const handleFix = (fileId: number, action: 'deleted' | 'quarantined') => {
    playButtonSound();
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: action } : f));
  };

  // Check win condition based on fixing all viruses
  useEffect(() => {
    if (scanPhase === 'done') {
      const remainingViruses = files.filter(f => f.isVirus && (f.status === 'desktop' || f.status === 'bin'));
      if (remainingViruses.length === 0 && ignoreClicks < 4) {
        setTimerActive(false); // Victory condition met
      }
    }
  }, [files, scanPhase, ignoreClicks]);

  // Antivirus Scan Logic - checks virus, but if they were on desktop/bin, it finds them.
  useEffect(() => {
    let interval: any;
    if (scanPhase === 'scanning') {
      interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setScanPhase('done');
            return 100;
          }
          return p + 5;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [scanPhase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileDrop = (fileId: number, point: { x: number, y: number }) => {
    if (!binRef.current) return;
    const binRect = binRef.current.getBoundingClientRect();
    if (point.x >= binRect.left && point.x <= binRect.right && point.y >= binRect.top && point.y <= binRect.bottom) {
      const file = files.find(f => f.id === fileId);
      if (file && !file.isVirus) {
        playErrorSound();
        return;
      }
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'bin' } : f));
      showNotification('файл перемещён в корзину');
      playPcClickSound();
    }
  };

  const handleReboot = () => {
    playShutSound();
    onWin(); 
  };

  // BSOD Logic
  const [bsodProgress, setBsodProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (stage === 'green_bsod') {
      interval = setInterval(() => {
        setBsodProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [stage]);

  if (stage === 'red_bsod') {
    const shutSound = playShutSound;
    return (
      <div className="fixed inset-0 bg-[#8b0000] text-white font-sans p-10 md:p-20 z-60000 flex flex-col items-center justify-center cursor-none select-none text-center">
        <div className="text-9xl mb-10 font-black tracking-widest animate-pulse font-mono text-red-500 opacity-50">&gt;:(</div>
        <h1 className="text-4xl md:text-6xl max-w-5xl font-black uppercase tracking-[0.2em] leading-snug drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
           YOU THINK YOU SMARTER THAN ME? TRY THIS!
        </h1>
        <div className="mt-16 text-red-500 font-mono text-sm max-w-2xl opacity-40">
           FATAL_ERROR: VIRTUAL_SYSTEM_CORRUPTION_DETECTED <br/>
           KERNEL_MODE_EXCEPTION_NOT_HANDLED <br/>
           IRQL_NOT_LESS_OR_EQUAL
        </div>
        <p className="mt-10 opacity-30 text-xs animate-pulse">Press F2 to enter BIOS</p>
      </div>
    );
  }

  if (stage === 'green_bsod') {
    return (
      <div className="fixed inset-0 bg-[#005a00] text-[#00ff00] font-mono p-10 md:p-20 z-60000 flex flex-col items-start justify-start cursor-none select-none text-left">
        <h1 className="text-3xl font-black mb-8 p-2 bg-[#00ff00] text-[#005a00] inline-block">SYSTEM SYSTEM FATAL ERROR :/</h1>
        <div className="text-lg space-y-4 font-bold tracking-wider">
          <p>Analyzing system sectors... {bsodProgress}%</p>
          {bsodProgress === 100 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 bg-red-600 text-white p-4">
               КРИТИЧЕСКАЯ ОШИБКА: ОШИБКА НАКОПИТЕЛЯ (DISK_FAILURE)
            </motion.div>
          )}
          <p className="text-sm opacity-50 mt-10">System shutdown imminent...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={desktopRef} onClick={handleGlobalClick} onContextMenu={(e) => e.preventDefault()} className="fixed inset-0 bg-black z-50000 font-sans flex flex-col select-none overflow-hidden" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
      
      {/* Central Notification System Overlay */}
      <AnimatePresence>
        {notification && (
           <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded shadow-2xl z-60000 text-white font-bold tracking-wide pointer-events-none text-sm">
             {notification.text}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Overlay */}
      {timerActive && (
        <div className="absolute top-10 right-10 flex flex-col items-end gap-2 z-50000 pointer-events-none">
          <div className="text-red-500 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse drop-shadow-[0_0_10px_#ef4444]">SAFE_MODE: INFECTION DETECTED</div>
          <div className={cn("text-7xl font-black text-white bg-black/80 px-10 py-6 border-b-8 shadow-2xl skew-x-[-10deg] italic transition-colors", timer <= 30 ? "text-red-600 border-red-600" : "border-white/20")}>
            {formatTime(timer)}
          </div>
        </div>
      )}
      {!timerActive && scanPhase === 'done' && (
        <div className="absolute top-10 right-10 flex flex-col items-end gap-2 z-50000 pointer-events-none">
          <div className="text-green-500 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_10px_#4ade80]">SAFE_MODE: SYSTEM SECURE</div>
        </div>
      )}

      {/* Context Menu Overlay */}
      <AnimatePresence>
        {contextMenu.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-60000 bg-black/90 border border-white/20 shadow-2xl backdrop-blur-md min-w-[150px] py-1 text-sm text-white flex flex-col"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {contextMenu.type === 'file' && (
              <button className="px-4 py-2 text-left hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); handleContextMenuAction('delete'); }}>Удалить</button>
            )}
            {contextMenu.type === 'bin' && (
              <button className="px-4 py-2 text-left hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); handleContextMenuAction('empty'); }}>Очистить корзину</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons */}
      <div className="flex-1 p-6 flex flex-col flex-wrap gap-8 items-start content-start relative z-10 w-full h-full">
        <div ref={binRef} onContextMenu={onContextMenuBin} className="flex flex-col items-center gap-1 group cursor-pointer w-20 z-10 relative">
          <div className="w-12 h-12 bg-black/60 rounded flex items-center justify-center group-hover:bg-red-900/40 border border-red-500/20 transition-all pointer-events-none">
            <Trash2 className={cn("w-8 h-8", files.some(f => f.status === 'bin') ? "text-white" : "text-white/30")} />
          </div>
          <span className="text-white text-[10px] text-center font-bold tracking-wider drop-shadow-md px-1 bg-black/40 rounded">Корзина</span>
        </div>

        {files.filter(f => f.status === 'desktop').map((file, i) => (
          <motion.div 
            key={file.id} 
            drag 
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={desktopRef}
            onDragEnd={(_, info) => handleFileDrop(file.id, info.point)}
            onContextMenu={(e) => onContextMenuFile(e, file.id)}
            className="flex flex-col items-center gap-1 group w-20 cursor-default active:cursor-move z-10"
          >
            <div className="w-12 h-12 pointer-events-none bg-red-900/20 rounded flex items-center justify-center border border-red-500/30">
              <FileText className={cn("w-8 h-8", file.isVirus ? "text-red-500" : "text-white/50")} />
            </div>
            <span className="text-white text-[10px] truncate max-w-[80px] text-center text-shadow bg-black/50 px-1 rounded pointer-events-none">{file.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Settings App (Draggable, preserves position via style update onDragEnd) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            drag
            dragMomentum={false} 
            dragConstraints={desktopRef}
            dragElastic={0}
            initial={{ opacity: 0, scale: 0.95, x: settingsPos.x || "-50%", y: settingsPos.y || "-50%" }} 
            animate={{ opacity: 1, scale: 1, x: settingsPos.x || "-50%", y: settingsPos.y || "-50%" }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            onDragEnd={(_, info) => {
               const node = info.point;
               // info.point gives relative points. A simpler way is to just keep the visual offset but Framer Handles its own internal transform.
               // For a robust system we'd bind to useMotionValue, but letting framer re-animate from an offset is tricky. 
               // We will just let it be fully managed by drag if we do not unmount it strictly, or we accept defaults on re-open.
               // Actually, to make it persist: We just hide it with pointer-events-none opacity-0 instead of unmounting!
            }}
            // To properly persist across re-opens without complex motion values, we switch from AnimatePresence conditional rendering
            // to keeping it in the DOM but hidden. (Refactoring below)
            className="hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Persistent Settings Window */}
      <motion.div
         drag
         dragMomentum={false}
         dragElastic={0}
         dragConstraints={desktopRef}
         dragListener={false} // We will manually trigger drag from header
         dragControls={dragControls}
         initial={{ x: 200, y: 150 }}
         animate={showSettings ? { opacity: 1, scale: 1, pointerEvents: "auto" } : { opacity: 0, scale: 0.95, pointerEvents: "none" }}
         className="absolute top-0 left-0 w-[600px] h-[400px] bg-[#1a1a1a] border border-red-600 rounded shadow-[0_0_50px_rgba(220,38,38,0.3)] flex flex-col overflow-hidden z-40000"
      >
        <div 
           className="bg-red-900/40 px-4 py-2 flex justify-between items-center text-white border-b border-red-600 cursor-move"
           onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="text-xs font-black tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4" /> WINDOWS DEFENDER
          </div>
          <X onClick={() => setShowSettings(false)} className="w-4 h-4 cursor-pointer hover:text-red-400" />
        </div>
        
        <div className="flex flex-1 overflow-hidden pointer-events-auto">
          {/* Sidebar */}
          <div className="w-48 bg-black/50 border-r border-red-900/30 p-2 flex flex-col gap-1">
            <button onClick={() => setSettingsTab('main')} className={cn("text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-colors", settingsTab === 'main' ? "bg-red-600 text-white" : "text-white/50 hover:bg-white/5")}>System</button>
            <button onClick={() => setSettingsTab('update')} className={cn("text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-between", settingsTab === 'update' ? "bg-red-600 text-white" : "text-white/50 hover:bg-white/5")}>
              Defender
              {timerActive && scanPhase !== 'done' && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 bg-black/20 overflow-y-auto custom-scrollbar">
            {settingsTab === 'main' && (
              <div className="space-y-6">
                <h2 className="text-xl font-light text-white border-b border-white/10 pb-2">System Information</h2>
                <div className="grid grid-cols-2 gap-4 text-xs text-white/70">
                  <div>OS Name:</div><div className="text-white">Windows (Safe Mode)</div>
                  <div>System Status:</div><div className="text-red-500 font-bold animate-pulse">CRITICAL_INFECTION</div>
                  <div>Processor:</div><div className="text-white">Intel Core i9-14900KS</div>
                  <div>RAM:</div><div className="text-white">64.0 GB</div>
                </div>
              </div>
            )}

            {settingsTab === 'update' && (
              <div className="space-y-6">
                <h2 className="text-xl font-light text-white border-b border-white/10 pb-2 flex items-center gap-2">
                  <Shield className="text-red-500" /> Windows Defender
                </h2>
                
                {scanPhase === 'idle' && (
                  <div className="flex flex-col items-center justify-center p-8 border border-red-600/30 bg-red-900/10 rounded gap-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
                    <div className="text-center">
                      <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Attention Required</h3>
                      <p className="text-white/50 text-[10px]">Malicious patterns detected in memory. Deep scan recommended immediately.</p>
                    </div>
                    <button onClick={() => { playButtonSound(); setScanPhase('scanning'); }} className="mt-4 px-8 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                      Start Deep Scan
                    </button>
                  </div>
                )}

                {scanPhase === 'scanning' && (
                  <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Activity className="w-12 h-12 text-red-500 animate-spin-slow" />
                    <div className="text-red-500 text-xs font-mono">Analyzing sectors...</div>
                    <div className="w-full bg-black/80 h-2 rounded-full border border-white/10 overflow-hidden">
                      <motion.div animate={{ width: `${Math.floor(scanProgress)}%` }} className="h-full bg-red-600" />
                    </div>
                    <div className="text-white/30 text-[10px] font-mono">{Math.floor(scanProgress)}% Completed</div>
                  </div>
                )}

                {scanPhase === 'done' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold border-b border-white/10 pb-2">
                      {files.filter(f => f.isVirus && (f.status === 'desktop' || f.status === 'bin' || f.status === 'quarantined')).length > 0 ? (
                        <><AlertTriangle className="text-red-500 w-5 h-5" /> <span className="text-red-500 uppercase">Threats Detected</span></>
                      ) : (
                        <><CheckCircle2 className="text-green-500 w-5 h-5" /> <span className="text-green-500 uppercase">System Secure</span></>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {files.filter(f => f.isVirus && f.status !== 'deleted').map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-black/40 border border-red-500/20 rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-red-500" />
                            <div>
                              <div className="text-white text-xs">{file.name}</div>
                              <div className="text-red-500/60 text-[10px] font-mono">Severity: HIGH ({file.status})</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {file.status !== 'quarantined' && (
                               <button onClick={() => handleIgnore(file.id)} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] uppercase font-bold rounded transition-colors">Ignore</button>
                            )}
                            {file.status !== 'quarantined' && (
                               <button onClick={() => handleFix(file.id, 'quarantined')} className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-500/30 text-[10px] uppercase font-bold rounded transition-colors">Quarantine</button>
                            )}
                            <button onClick={() => handleFix(file.id, 'deleted')} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] uppercase font-bold rounded transition-colors shadow-[0_0_10px_rgba(239,68,68,0.2)]">Delete</button>
                          </div>
                        </div>
                      ))}
                      {files.filter(f => f.isVirus && f.status !== 'deleted').length === 0 && (
                        <div className="p-4 bg-green-900/10 border border-green-500/30 text-green-500 text-xs text-center rounded">
                          All identified threats have been successfully removed.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Start Menu Overlay */}
      <AnimatePresence>
        {showStartMenu && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-12 left-2 w-64 bg-[#1a1a1a] border border-red-600/50 shadow-2xl flex flex-col z-50020">
            <div className="p-4 flex items-center gap-3 border-b border-white/5">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">U</div>
              <div>
                <div className="text-white text-sm font-bold">User</div>
                <div className="text-white/50 text-[10px]">Administrator</div>
              </div>
            </div>
            <div className="flex flex-col py-2">
              <button onClick={(e) => { e.stopPropagation(); playMenuSfx(); setShowSettings(true); setShowStartMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/80 transition-colors text-xs">
                <Shield className="w-4 h-4 text-red-500" /> Windows Defender
              </button>
              <button disabled={timerActive} onClick={(e) => { e.stopPropagation(); handleReboot(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 active:bg-white/10 text-white/80 transition-colors text-xs border-t border-white/5 disabled:opacity-30 disabled:cursor-not-allowed">
                <Power className={cn("w-4 h-4", !timerActive && scanPhase === 'done' ? "text-green-500 animate-pulse" : "text-white/50")} /> Restart (Clean)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="h-10 bg-[#0a0a0a] border-t border-red-600/50 flex items-center px-2 mt-auto relative z-50015 shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        <button onClick={(e) => { e.stopPropagation(); playMenuSfx(); setShowStartMenu(!showStartMenu); }} className={cn("h-full px-4 flex items-center justify-center transition-all", showStartMenu ? "bg-red-900/40" : "hover:bg-white/10")}>
          <div className="w-6 h-6 bg-red-600 text-black flex items-center justify-center font-black text-xs skew-x-[-10deg] shadow-[0_0_10px_rgba(239,68,68,0.5)]">R</div>
        </button>
        <div className="flex-1 px-4 flex gap-2">
          {/* Open App Indicators */}
          {showSettings && <div className="h-full px-3 flex items-center border-b-2 border-red-500 bg-white/5"><Shield className="w-4 h-4 text-white" /></div>}
        </div>
        <div className="px-4 text-[10px] text-white/60 font-mono tracking-wider flex items-center gap-4">
           {timerActive ? <span className="text-red-500 animate-pulse"><AlertTriangle className="w-3 h-3 inline mr-1" />SAFE MODE</span> : <span className="text-green-500">SYSTEM SECURE</span>}
           <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

