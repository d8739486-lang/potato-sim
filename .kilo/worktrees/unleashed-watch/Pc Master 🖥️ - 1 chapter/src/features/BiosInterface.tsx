import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/core/utils';
import { playButtonSound, playBsodSound, playErrorSound } from '@/core/audio';
import { t } from '@/core/i18n';

// --- HELPERS ---
const BIOS_TABS = ['main', 'advanced', 'security', 'boot', 'admin', 'exit'];

const EncryptedText = ({ text, glitch }: { text: string, glitch?: boolean }) => {
  const [glitchText, setGlitchText] = useState(text);
  
  useEffect(() => {
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const interval = setInterval(() => {
      setGlitchText(prev => 
        prev.split('').map((char, i) => 
          Math.random() > (glitch ? 0.5 : 0.9) ? chars[Math.floor(Math.random() * chars.length)] : text[i]
        ).join('')
      );
    }, glitch ? 50 : 100);
    return () => clearInterval(interval);
  }, [text, glitch]);

  return <span className={cn("font-mono", glitch ? "text-red-500 font-bold" : "text-red-400/60")}>{glitchText}</span>;
};

// --- CMD INTERFACE ---
const CmdInterface = ({ onClose, onUnlock, mode }: { onClose: () => void, onUnlock: () => void, mode: 'ch1' | 'ch2' | 'ch3' }) => {
  const [lines, setLines] = useState([
    'Microsoft Windows [Version 10.0.19045.2965]',
    '(c) Microsoft Corporation. All rights reserved.',
    ''
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    const cmd = inputValue.trim();
    setLines(prev => [...prev, `C:\\Windows\\system32> ${cmd}`]);
    setInputValue('');
    
    if (cmd.toLowerCase() === 'help') {
      if (mode === 'ch2') {
        setLines(prev => [...prev, t('bios.available_cmds'), t('bios.connect_host')]);
      } else if (mode === 'ch3') {
        setLines(prev => [...prev, t('bios.available_cmds'), t('bios.decrypt_core')]);
      } else {
        setLines(prev => [...prev, t('bios.available_cmds'), '- run dev : Initialize development environment']);
      }
      return;
    }

    if (mode === 'ch2') {
      if (cmd.toLowerCase() === 'connect host') {
        setLines(prev => [...prev, t('bios.host_discovered')]);
        onUnlock();
      } else {
        setLines(prev => [...prev, t('bios.not_recognized').replace('{cmd}', cmd), t('bios.connect_host_hint')]);
      }
    } else if (mode === 'ch3') {
       if (cmd.toLowerCase() === 'decrypt core') {
         setLines(prev => [...prev, t('bios.core_decrypted')]);
         onUnlock();
       } else {
         setLines(prev => [...prev, t('bios.identity_failed')]);
       }
    } else {
      // Chapter 1
      if (cmd.toLowerCase() === 'run dev') {
        setLines(prev => [...prev, t('bios.dev_mode_activated')]);
        onUnlock();
      } else {
        setLines(prev => [...prev, t('bios.not_recognized').replace('{cmd}', cmd)]);
      }
    }
  };

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-4 bg-black text-gray-200 font-['Cascadia_Mono',monospace] p-4 z-30000 shadow-2xl border border-white/20 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 bg-white text-black px-2">
        <span className="text-sm font-bold">{t('bios.cmd_title')}</span>
        <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 transition-colors">✕</button>
      </div>
      <div className="text-sm space-y-1 overflow-y-auto max-h-[80%] custom-scrollbar mb-4 flex-1">
        {lines.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
        <span className="text-sm shrink-0">C:\\Windows\\system32&gt;</span>
        <input autoFocus className="flex-1 bg-transparent border-none outline-none text-sm p-0 font-['Cascadia_Mono',monospace] text-gray-200" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      </form>
    </motion.div>
  );
};

// --- POWERSHELL INTERFACE ---
const PowerShellInterface = ({ onClose, onFinish, isUnlocked, mode }: { onClose: () => void, onFinish: (result: any) => void, isUnlocked: boolean, mode: 'ch1' | 'ch2' | 'ch3' }) => {
  const [lines, setLines] = useState([
    'Windows PowerShell',
    'Copyright (C) Microsoft Corporation. All rights reserved.',
    '',
    t('bios.help_hint'),
    ''
  ]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);

  // Initializers
  useEffect(() => {
     if (mode === 'ch2' && isUnlocked && step === 0) {
        const randomHost = Math.floor(Math.random() * 90000) + 10000;
        setLines(prev => [...prev, t('bios.verify_host').replace('{host}', randomHost.toString())]);
        setStep(1);
     }
     if (mode === 'ch3' && isUnlocked && step === 0) {
        setLines(prev => [...prev, t('bios.handshake_req'), t('bios.core_encrypted'), t('bios.hint_ny')]);
        setStep(1);
     }
  }, [isUnlocked, mode, step]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !inputValue) return;

    const rawCmd = inputValue.trim();
    const cmd = rawCmd.toUpperCase();
    setLines(prev => [...prev, `PS C:\\> ${rawCmd}`]);
    setInputValue('');

    if (rawCmd.toLowerCase() === 'help') {
      if (mode === 'ch1') {
        if (step === 0) setLines(p => [...p, t('bios.available_cmds'), '- npm run fv : Verify system files']);
        else setLines(p => [...p, t('bios.available_cmds'), '- reboot core : Force kernel restart']);
      } else if (mode === 'ch2') {
        if (step === 1) setLines(p => [...p, t('bios.available_cmds'), '- Y : Confirm connection', '- N : Reject connection']);
        else setLines(p => [...p, t('bios.available_cmds'), '- /f run : Execute final sequence']);
      } else if (mode === 'ch3') {
        setLines(p => [...p, t('bios.available_cmds'), '- Y/p@ssw0rd : Final handshake', '- N : Shutdown system']);
      }
      return;
    }

    if (mode === 'ch2') {
      if (step === 1 && isUnlocked) {
        if (cmd === 'Y') {
           setStep(2);
           setIsProcessing(true);
           setLines(prev => [...prev, t('bios.establishing_conn')]);
           setTimeout(() => {
              setIsProcessing(false);
              setLines(p => [...p, t('bios.access_granted'), t('bios.type_run')]);
           }, 5000); 
        } else if (cmd === 'N') {
           setLines(prev => [...prev, t('bios.cant_run')]);
           setTimeout(() => onFinish('blue_bsod'), 2000); 
        } else {
           setLines(prev => [...prev, t('bios.invalid_input')]);
        }
      } else if (step === 2) {
        if (rawCmd === '/f run') {
           setIsProcessing(true);
            setTimeout(() => {
               // Stay processing/hidden for final sequence
               onFinish(true); 
            }, 2000);
        } else {
           setLines(p => [...p, t('bios.access_denied_run')]);
        }
      }
      return;
    }

    if (mode === 'ch3') {
       if (step === 1 && isUnlocked) {
         if (rawCmd === 'p@ssw0rd' || cmd === 'Y') {
           setIsProcessing(true); // Hide input for final handshake
           onFinish(true);
         } else {
           setLines(p => [...p, t('bios.incorrect_key'), t('bios.try_again_fail')]);
           if (cmd === 'N') {
             setIsProcessing(true);
             onFinish('blue_bsod');
           }
         }
       }
       return;
    }

    // CHAPTER 1
    if (mode === 'ch1') {
      if (step === 0) {
        if (rawCmd === 'npm run fv') {
          setIsProcessing(true);
          setLines(p => [...p, t('bios.init_verification'), t('bios.calc_checksums')]);
          
          setTimeout(() => {
            setIsProcessing(false);
            setLines(p => [...p, t('bios.verification_fail'), t('bios.await_override')]);
            setStep(1);
          }, 3000);
        } else {
          setLines(prev => [...prev, `Error: The command '${rawCmd}' is not recognized.`]);
        }
      } else if (step === 1) {
        if (rawCmd === 'reboot core') {
           setIsProcessing(true);
           setLines(p => [...p, t('bios.access_kernel'), t('bios.rewrite_boot')]);
           
           setTimeout(() => {
             // Keep isProcessing = true to hide input permanently
             setLines(p => [...p, t('bios.reboot_init'), t('bios.rebooting')]);
             
             let count = 3;
             const iv = setInterval(() => {
                if (count > 0) {
                   setLines(p => [...p, `${count}...`]);
                   count--;
                } else {
                   clearInterval(iv);
                   onFinish(true);
                }
             }, 1000);
           }, 3000);
        } else {
          setLines(prev => [...prev, `Error: System requires a reboot command.`]);
        }
      }
    }
  };

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-4 bg-[#012456] text-white font-['Cascadia_Mono',monospace] p-4 z-30000 shadow-2xl border border-white/20 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 shrink-0">
        <span className="text-sm font-bold">{t('bios.ps_title')}</span>
      </div>
      
      <div className="text-sm space-y-1 overflow-y-auto max-h-[80%] custom-scrollbar mb-4 flex-1">
        {lines.map((line, i) => <div key={i}>{line}</div>)}
        {isProcessing && (
          <div className="flex gap-2 items-center">
            <span className="animate-pulse">_</span>
            <span className="text-xs opacity-50 italic">{t('bios.ps_processing')}</span>
          </div>
        )}
      </div>

      {!isProcessing && (
        <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
          <span className="text-sm shrink-0">PS C:\&gt;</span>
          <input autoFocus className="flex-1 bg-transparent border-none outline-none text-sm p-0 font-['Cascadia_Mono',monospace] text-white" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </form>
      )}
    </motion.div>
  );
};

// --- BOOTING SPINNER ---
const BootingSpinner = () => (
  <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-40000 cursor-none">
    <div className="text-white mb-8 font-mono tracking-widest text-sm">{t('bios.loading')}</div>
    <div className="relative w-12 h-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute w-2 h-2 bg-white rounded-full"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0], rotate: i * 45, x: Math.cos((i * 45 * Math.PI) / 180) * 20, y: Math.sin((i * 45 * Math.PI) / 180) * 20 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "linear" }}
        />
      ))}
    </div>
  </div>
);

// --- MAIN ENTRANCE ---
export const BiosInterface = ({ onFinishEnding2, mode = 'ch1' }: { onFinishEnding2: (result: any) => void, mode?: 'ch1' | 'ch2' | 'ch3' }) => {
  const [isBooting, setIsBooting] = useState(true);
  const [activeTab, setActiveTab] = useState('Main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPS, setShowPS] = useState(false);
  const [showCMD, setShowCMD] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const isGlitched = mode === 'ch2' || mode === 'ch3';

  useEffect(() => {
    if (isGlitched) {
      playErrorSound();
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.4) playErrorSound();
      }, 7000);
      return () => clearInterval(glitchInterval);
    }
  }, [isGlitched]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  if (isBooting) return <BootingSpinner />;

  const adminItems = [
    { name: t('bios.admin.system_core'), status: 'ENCRYPTED' },
    { name: t('bios.admin.cmd'), status: isGlitched ? 'ACTIVE' : 'ENCRYPTED' },
    { name: t('bios.admin.powershell'), status: 'ACTIVE' },
    { name: t('bios.admin.network'), status: 'ENCRYPTED' },
    { name: t('bios.admin.registry'), status: 'ENCRYPTED' },
  ];

  const handleItemClick = (item: any) => {
    playButtonSound();
    if (item.name === t('bios.admin.powershell') && item.status === 'ACTIVE') {
      if (isGlitched && !isUnlocked) {
        // Play error, don't open
      } else {
        setShowPS(true);
      }
    }
    if (item.name === t('bios.admin.cmd') && item.status === 'ACTIVE') {
      setShowCMD(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0000aa] text-[#aaaaaa] font-mono p-4 z-60000 flex flex-col select-none border-8 border-double border-[#aaaaaa]/20 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
      <AnimatePresence>
        {showCMD && <CmdInterface onClose={() => setShowCMD(false)} onUnlock={() => setIsUnlocked(true)} mode={mode} />}
        {showPS && <PowerShellInterface onClose={() => setShowPS(false)} onFinish={onFinishEnding2} isUnlocked={isUnlocked} mode={mode} />}
      </AnimatePresence>

      <div className="bg-[#aaaaaa] text-[#0000aa] text-center py-0.5 font-bold tracking-widest mb-4 flex justify-between px-4">
        <span>{t('bios.titles.main')}</span>
        {isGlitched && <span className="text-red-600 bg-white px-2 animate-pulse">{t('bios.unstable_kernel')}</span>}
      </div>

      <div className="flex border-b border-[#aaaaaa] mb-6">
        {BIOS_TABS.map(tab => (
          <div
            key={tab}
            onClick={() => { playButtonSound(); setActiveTab(tab); }}
            className={cn(
              "px-4 py-1 cursor-pointer transition-colors",
              activeTab === tab ? "bg-[#aaaaaa] text-[#0000aa]" : "hover:bg-[#aaaaaa]/20",
              isGlitched && Math.random() > 0.8 && "text-red-500 line-through"
            )}
          >
            {t(`bios.tabs.${tab}`).toUpperCase()}
          </div>
        ))}
      </div>

      <div className="flex-1 flex gap-8 border border-[#aaaaaa] p-6 relative">
        <div className="w-1/2 flex flex-col gap-2">
          {activeTab === 'admin' ? (
            <div className="space-y-4">
              <h2 className="text-[#ffffff] pb-2 border-b border-[#aaaaaa]/30 underline decoration-double">{t('bios.admin_title')}</h2>
              {adminItems.map((item, idx) => (
                <div 
                  key={item.name}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex justify-between items-center px-2 py-1 transition-all group cursor-pointer",
                    selectedIndex === idx ? "bg-[#ffffff] text-[#0000aa]" : "hover:text-[#ffffff]"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {selectedIndex === idx && ">"} {item.name}
                  </span>
                  <span className="opacity-80">
                    {item.status === 'ENCRYPTED' ? (
                      <EncryptedText text={t('bios.status.encrypted')} glitch={isGlitched} />
                    ) : (
                      <span className={cn("text-green-400", isGlitched && item.name === t('bios.admin.powershell') && !isUnlocked && "text-red-500 opacity-50")}>
                        {isGlitched && item.name === t('bios.admin.powershell') && !isUnlocked ? t('bios.status.locked') : t('bios.status.live')}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <div className="text-xl tracking-widest flex items-center gap-1">
                {t('bios.empty')} {isGlitched && <EncryptedText text="$$$" glitch={isGlitched} />}
              </div>
            </div>
          )}
        </div>

        <div className="w-1/2 border-l border-[#aaaaaa] pl-8 space-y-6 text-sm">
          <div className="mt-20 border border-[#aaaaaa]/40 p-4 bg-black/10">
            <h3 className="text-[#ffffff] mb-2 uppercase text-[10px] tracking-widest bg-red-900/40 px-2">{t('bios.stats.title')}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <span>{t('bios.stats.cpu_temp')}</span> <span className={cn(isGlitched ? "text-red-500 animate-pulse font-bold" : "text-white")}>{isGlitched ? "105°C" : "45°C"}</span>
              <span>{t('bios.stats.fan_speed')}</span> <span className={cn(isGlitched ? "text-red-500" : "text-white")}>{isGlitched ? "0 RPM" : "1200 RPM"}</span>
              <span>{t('bios.stats.voltage')}</span> <span className={cn(isGlitched ? "text-red-500" : "text-green-400")}>{isGlitched ? t('bios.stats.critical') : t('bios.stats.ok')}</span>
              <span>{t('bios.stats.integrity')}</span> <span className={cn(isGlitched ? "text-red-500" : "text-white")}>{isGlitched ? "0.02%" : "99.9%"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] animate-scanlines" />
    </div>
  );
};
