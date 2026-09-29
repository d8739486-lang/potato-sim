import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playErrorSound, 
  playBsodSound, 
  stopBGM, 
  playPcClickSound,
  playButtonSound
} from '@/core/audio';
import { 
  Monitor, 
  Trash2, 
  FileText, 
  User, 
  Settings, 
  Power,
  Search
} from 'lucide-react';
import { cn } from '@/core/utils';
import { t } from '@/core/i18n';

const getErrorMessages = () => ({
  default: t('prologue.errors.default'),
  recycle_bin: t('prologue.errors.recycle_bin'),
  this_pc: t('prologue.errors.this_pc'),
  system_file: t('prologue.errors.system_file'),
  taskbar: t('prologue.errors.taskbar'),
  start_power: t('prologue.errors.start_power'),
  settings_lock: t('prologue.errors.settings_lock'),
  bsod_lost: t('prologue.errors.bsod_lost'),
  sys_delete: t('prologue.errors.sys_delete'),
  sys_scan_required: t('prologue.errors.sys_scan_required')
});

const BSOD_MESSAGES = [
  "The instruction at 0x00401234 referenced memory at 0x00000000.",
  "A fatal exception 0E has occurred at 0028:C0011E36.",
  "System has recovered from a serious error (fake).",
  "Unhandled Exception: System.AccessViolationException.",
  "Kernel Security Check Failure. System halted.",
];

interface WinErrorData {
  id: number;
  title: string;
  message: string;
  top: string;
  left: string;
}

const WinError = ({ title, message, style }: { title: string, message: string, style?: any }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    style={style}
    className="fixed z-9999 w-[400px] bg-[#f0f0f0] border border-[#707070] shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-sans text-black overflow-hidden pointer-events-auto"
  >
    <div className="bg-linear-to-r from-[#0054e3] to-[#2788f5] px-2 py-1 flex justify-between items-center select-none">
      <span className="text-white text-[11px] font-bold truncate">{title}</span>
      <div className="flex gap-1">
        <button className="w-5 h-5 bg-[#e81123] text-white flex items-center justify-center text-[10px] hover:bg-[#f1707a]">✕</button>
      </div>
    </div>
    <div className="p-4 flex gap-4 items-start">
      <div className="w-8 h-8 shrink-0 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">✕</div>
      <div className="flex-1">
        <p className="text-[11px] leading-tight mb-4">{message}</p>
        <div className="flex justify-center">
          <button className="px-8 py-1 bg-[#e1e1e1] border border-[#adadad] shadow-[inset_0_0_100px_white] text-[10px] hover:bg-[#e5f1fb]">OK</button>
        </div>
      </div>
    </div>
  </motion.div>
);

interface DesktopFile {
  id: number;
  name: string;
  isVirus?: boolean;
  status: 'desktop' | 'bin' | 'deleted';
}

interface PrologueDesktopProps {
  onFinish: () => void;
  onLose?: () => void;
  onOpenBios: () => void;
}

export const PrologueDesktop = ({ onFinish, onLose, onOpenBios }: PrologueDesktopProps) => {
  const [stage, setStage] = useState<'errors' | 'bsod' | 'fake_windows' | 'losing'>('errors');
  const [errors, setErrors] = useState<WinErrorData[]>([]);
  const [bsodStatus, setBsodStatus] = useState('complete');
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [isCleaned, setIsCleaned] = useState(false);

  const [files, setFiles] = useState<DesktopFile[]>([
    { id: 1, name: t('prologue.docs'), status: 'desktop' },
    { id: 2, name: 'system_core.dll', status: 'desktop' },
    { id: 3, name: 'Worm.Win32.Gen', isVirus: true, status: 'desktop' },
    { id: 4, name: 'Trojan.Miner.AA', isVirus: true, status: 'desktop' },
    { id: 5, name: 'Spyware.Keylog', isVirus: true, status: 'desktop' },
    { id: 6, name: 'Rootkit.Hidden', isVirus: true, status: 'desktop' },
  ]);

  const ERROR_MESSAGES = getErrorMessages();

  const desktopRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);

  const addError = (top: number, left: number, message: string) => {
    setErrors(prev => [...prev, { id: Date.now(), title: "System Error", message, top: `${top}%`, left: `${left}%` }]);
  };

  const handleFileDrop = (fileId: number, point: { x: number, y: number }) => {
    if (!binRef.current) return;
    const binRect = binRef.current.getBoundingClientRect();
    if (point.x >= binRect.left && point.x <= binRect.right && point.y >= binRect.top && point.y <= binRect.bottom) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'bin' } : f));
      playPcClickSound();
    }
  };

  useEffect(() => {
    if (stage === 'errors') {
      stopBGM(0);
      const timers: any[] = [];
      for (let i = 0; i < 5; i++) {
        timers.push(setTimeout(() => {
          addError(20 + Math.random() * 40, 20 + Math.random() * 40, BSOD_MESSAGES[i % BSOD_MESSAGES.length]);
          playErrorSound();
        }, (i + 1) * 1000));
      }

      let chaosInterval: any = null;
      timers.push(setTimeout(() => {
        chaosInterval = setInterval(() => {
          addError(Math.random() * 85, Math.random() * 75, BSOD_MESSAGES[Math.floor(Math.random() * BSOD_MESSAGES.length)]);
          playErrorSound();
        }, 50);
      }, 7000));

      timers.push(setTimeout(() => {
        if (chaosInterval) clearInterval(chaosInterval);
        setStage('bsod');
        playBsodSound();
      }, 10000));

      return () => {
        timers.forEach(clearTimeout);
        if (chaosInterval) clearInterval(chaosInterval);
      };
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'bsod') {
      const timer = setTimeout(() => {
        setStage('fake_windows');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'F2' && stage === 'bsod') {
        onOpenBios();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, onOpenBios]);

  if (stage === 'bsod' || stage === 'losing') {
    return (
      <div className="fixed inset-0 bg-[#0078d7] text-white font-sans p-10 md:p-20 z-50000 flex flex-col items-start justify-center cursor-none pointer-events-auto select-none">
        <div className="text-9xl mb-10 font-light select-none">:(</div>
        <h1 className="text-2xl md:text-3xl mb-10 max-w-4xl font-light leading-snug">
          {t('chaos.bsod_message')}
        </h1>
        <div className="text-2xl mb-16 opacity-90">{bsodStatus === 'complete' ? `(100% ${t('i18n.complete') || 'complete'})` : "(0% complete)"}</div>
        <div className="flex flex-col gap-2 text-sm opacity-60 font-light">
           <p>Stop code: {hasLost ? "PERMANENT_BIOS_FAILURE" : "CRITICAL_PROCESS_DIED"}</p>
        </div>
      </div>
    );
  }

  if (stage === 'fake_windows') {
    return (
      <div 
        ref={desktopRef}
        className="fixed inset-0 bg-[#0078d7] z-50000 font-sans overflow-hidden select-none flex flex-col"
        style={{ backgroundImage: 'url("/textures/photos/wallaper.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="flex-1 p-4 flex flex-col flex-wrap gap-6 items-start content-start relative">
          <motion.div drag onDoubleClick={() => addError(30, 30, ERROR_MESSAGES.this_pc)} className="flex flex-col items-center gap-1 group cursor-pointer w-20">
            <div className="w-12 h-12 bg-blue-100/40 rounded flex items-center justify-center group-hover:bg-white/20 border border-transparent"><Monitor className="text-white w-8 h-8" /></div>
            <span className="text-white text-[11px] text-shadow shadow-black/80 text-center">{t('desktop.pc')}</span>
          </motion.div>

          <motion.div ref={binRef} drag onDoubleClick={() => addError(30,30, ERROR_MESSAGES.recycle_bin)} className="flex flex-col items-center gap-1 group cursor-pointer w-20">
            <div className="w-12 h-12 bg-blue-100/40 rounded flex items-center justify-center group-hover:bg-white/20 border border-transparent">
              <Trash2 className={cn("text-white w-8 h-8", files.some(f => f.status === 'bin') && "fill-white/20")} />
            </div>
            <span className="text-white text-[11px] text-shadow shadow-black/80 text-center">{t('desktop.trash')}</span>
          </motion.div>

          {files.filter(f => f.status === 'desktop').map(file => (
            <motion.div 
              key={file.id} drag
              onDragEnd={(_, info) => handleFileDrop(file.id, info.point)}
              className="flex flex-col items-center gap-1 group cursor-pointer w-20"
            >
              <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center group-hover:bg-white/20 border border-transparent">
                <FileText className={cn("text-white/80 w-8 h-8", file.isVirus && "text-red-400")} />
              </div>
              <span className="text-white text-[10px] truncate max-w-full text-center text-shadow shadow-black/80">{file.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Start Menu Placeholder triggers transition if cleaned */}
        <div className="h-10 bg-[#000000]/80 backdrop-blur flex items-center justify-between border-t border-white/5 z-50004">
          <button onClick={() => setShowStartMenu(!showStartMenu)} className="px-4 hover:bg-white/10 h-full"><Search className="w-4 h-4 text-white/60" /></button>
          <div className="px-4 flex flex-col items-end text-[10px] text-white/80"><span>10:53</span><span>20.03.2026</span></div>
        </div>
        
        {showStartMenu && (
          <div className="absolute bottom-10 left-0 w-48 bg-black/90 p-2 flex flex-col gap-2 z-50005 shadow-2xl border border-white/5">
            <button onClick={onFinish} className="text-white text-xs p-2 hover:bg-white/10 text-left transition-colors flex items-center justify-between uppercase">
              {t('prologue.continue')}
              <span className="opacity-40 text-[10px]">→</span>
            </button>
          </div>
        )}

        <div className="absolute bottom-16 right-6 text-white/20 text-right pointer-events-none select-none z-50001">
          <p className="text-xl font-light">{t('settings.activation_title')}</p>
          <p className="text-xs">{t('settings.activation_desc')}</p>
        </div>

        <AnimatePresence>{errors.map((error) => <WinError key={error.id} title={error.title} message={error.message} style={{ top: error.top, left: error.left }} />)}</AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-transparent z-50000 pointer-events-none">
      <AnimatePresence>{errors.map((error) => <WinError key={error.id} title={error.title} message={error.message} style={{ top: error.top, left: error.left }} />)}</AnimatePresence>
    </div>
  );
};
