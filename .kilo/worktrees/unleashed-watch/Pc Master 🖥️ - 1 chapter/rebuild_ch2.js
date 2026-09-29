const fs = require('fs');

try {
  let code = fs.readFileSync('src/features/Chapters/Chapter1/CleanDesktopCh1.tsx', 'utf-8');

  // 1. Rename Component and update colors/background
  code = code.split('CleanDesktopCh1Props').join('Chapter2DesktopProps');
  code = code.split('CleanDesktopCh1').join('Chapter2Desktop');
  code = code.split('blue-500').join('red-500')
             .split('blue-400').join('red-400')
             .split('blue-300').join('red-300')
             .split('blue-200').join('red-200')
             .split('blue-100').join('red-100')
             .split('blue-600').join('red-600')
             .split('blue-800').join('red-800');
  code = code.split('wallpaper.jpg').join('wallaper1.png');

  // 2. Add new states
  const stateInjection = `
  const [stage, setStage] = useState<'desktop' | 'defender_open' | 'defender_scanning' | 'defender_clean' | 'system_error' | 'black_screen' | 'taunt'>('desktop');
  const [scanProgress, setScanProgress] = useState(0);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    let interval: any;
    if (stage === 'defender_scanning') {
       interval = setInterval(() => {
          setScanProgress(p => {
             if (p >= 100) {
                clearInterval(interval);
                setStage('defender_clean');
                return 100;
             }
             return p + 5;
          });
       }, 250);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleSystemErrorClose = () => {
     playSound(AUDIO_PATHS.ERROR2);
     setStage('black_screen');
     setTimeout(() => {
        setStage('taunt');
        setTimeout(() => {
           onWin();
        }, 5000);
     }, 2000);
  };
  
  const handleRestrictedClick = () => {
    playSound(AUDIO_PATHS.ERROR2);
    setShowAccessDenied(true);
  };
`;
  code = code.replace("const desktopRef = useRef<HTMLDivElement>(null);", "const desktopRef = useRef<HTMLDivElement>(null);\n" + stateInjection);

  // 3. Fix interface
  code = code.replace("interface Chapter2DesktopProps {", "interface Chapter2DesktopProps {\n  onWin: () => void;");
  code = code.replace("export const Chapter2Desktop = ({ onContinue, isCh2Offer }: Chapter2DesktopProps) => {", "export const Chapter2Desktop = ({ onWin }: Chapter2DesktopProps) => {");

  // 4. Update Mail handling
  code = code.split("onContinue();").join("setShowMail(false);\n    setStage('defender_open');");
  code = code.split("[isCh2Offer, hasShownNotification]").join("[hasShownNotification]");
  code = code.split("} ? 2000 : 3000);").join("}, 2000);");

  // 5. Inject FsItem update and FileSystem
  code = code.replace("interface FsItem {", "interface FsItem {\n    isRestricted?: boolean;");
  
  // Safe filesystem replacement
  const fsStartIdx = code.indexOf("const fileSystem: Record<string");
  if (fsStartIdx !== -1) {
      // Find the closing brace of the fileSystem object
      // We know the browser and documents keys are there, we'll just search for the end of the documents object
      const docEndStr = "]     }   };";
      // To be safe we'll use a simple index search
      let fsEndIdx = code.indexOf("};", fsStartIdx);
      // Ensure we passed the documents key
      while (fsEndIdx !== -1 && code.substring(fsStartIdx, fsEndIdx).indexOf("documents:") === -1) {
          fsEndIdx = code.indexOf("};", fsEndIdx + 2);
      }
      
      if (fsEndIdx !== -1) {
          const newFs = `const fileSystem: Record<string, { icon: React.ReactNode; title: string; items: FsItem[] }> = {
    computer: {
      icon: <Monitor className="w-4 h-4 text-red-600" />,
      title: "Этот компьютер",
      items: [
        { name: "Системный диск (C:)", type: 'folder', totalGb: 500, usedGb: 120, children: [
          { name: "Windows", type: 'system', size: "28.4 ГБ" },
          { name: "SecurityLogs", type: 'folder', children: [
            { name: "auth_03_21.dat", type: 'file', size: "12 КБ", content: "ОШИБКА АВТОРИЗАЦИИ\\nНесанкционированный доступ к порту 443." },
            { name: "quarantine_list.txt", type: 'file', size: "2 КБ", content: "0 threats detected.\\nSystem is secure.\\n[Digital Dreams Engine v2.1]" }
          ]},
          { name: "Work_Assignments", type: 'folder', children: [
            { name: "Target_Alpha.docx", type: 'file', size: "45 КБ", content: "ЦЕЛЬ:\\nIP: 192.168.1.15\\nСтатус: Под наблюдением\\nАнализ уязвимостей завершен." },
            { name: "Report_Template.txt", type: 'file', size: "1 КБ", content: "Тут нужно писать отчёты о найденных дырах. Никаких имен." }
          ]}
        ]},
        { name: "Зашифрованный диск (D:)", type: 'system', size: "Отказано в доступе", isRestricted: true },
        { name: "Сервер_DD (Z:)", type: 'folder', totalGb: 10000, usedGb: 8400, children: [
          { name: "tools_hack.zip", type: 'file', size: "1.2 ГБ", content: "[ARCHIVE ENCRYPTED]\\nRequires Level 4 Clearance." },
          { name: "readme.txt", type: 'file', size: "200 Б", content: "Добро пожаловать в рабочую среду Digital Dreams.\\nВся активность логируется." }
        ]}
      ]
    },
    browser: {
      icon: <Globe className="w-4 h-4 text-red-600" />,
      title: "Браузер",
      items: [
        { name: "darknet_links.txt", type: 'file', size: "4 КБ", content: "onion v3 links:\\n[REDACTED]\\n[REDACTED]" },
        { name: "DD_Intranet.url", type: 'file', size: "1 КБ", content: "[InternetShortcut]\\nURL=https://intranet.digitaldreams.corp\\n\\nACCESS DENIED" }
      ]
    },
    documents: {
      icon: <Folder className="w-4 h-4 text-orange-600" />,
      title: "Документы",
      items: [
        { name: "Contract.pdf", type: 'file', size: "1.2 МБ", content: "[PDF Document]\\nNONDISCLOSURE AGREEMENT\\n...By accepting this job, you agree to... [REDACTED]" },
        { name: "rules.txt", type: 'file', size: "128 Б", content: "ПРАВИЛА:\\n1. Не задавать вопросов.\\n2. Выполнять задачи вовремя.\\n3. Никому не рассказывать о DD." }
      ]
    }
  };`;
          code = code.substring(0, fsStartIdx) + newFs + code.substring(fsEndIdx + 2);
      }
  }

  // 6. Inject the UI overlays
  const overlays = `
      {/* ROG Aesthetic Overlay */}
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none z-0" />
      
      {/* Sequence Overlays */}
      <AnimatePresence>
        {(stage === 'defender_open' || stage === 'defender_scanning' || stage === 'defender_clean') && (
          <motion.div 
            drag
            dragMomentum={false}
            dragConstraints={desktopRef}
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }} 
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }} 
            className="absolute top-1/2 left-1/2 w-[600px] h-[400px] bg-[#121212] border border-red-600/40 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded overflow-hidden z-[50040] flex flex-col"
          >
            <div className="bg-red-900/40 px-5 py-3 flex justify-between items-center text-red-500 border-b border-red-600/30 cursor-grab active:cursor-grabbing">
              <span className="text-xs font-black tracking-[0.2em] flex items-center gap-3"><Shield className="w-4 h-4" /> WINDOWS DEFENDER</span>
              {(stage === 'defender_open' || stage === 'defender_clean') && <X className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setStage('desktop')} />}
            </div>
            <div className="p-10 flex flex-col items-center justify-center flex-1">
               {stage === 'defender_open' && (
                 <>
                    <Shield className="w-24 h-24 text-green-500 mb-6 drop-shadow-[0_0_20px_#22c55e33]" />
                    <h2 className="text-white text-xl font-bold mb-2">Статус: требуется проверка</h2>
                    <p className="text-white/40 text-sm mb-10 uppercase tracking-widest font-mono">Выполните сканирование по запросу DD</p>
                    <button 
                       onClick={() => { playButtonSound(); setStage('defender_scanning'); setScanProgress(0); }}
                       className="px-12 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest transition-all rounded cursor-pointer"
                    >
                       Запустить проверку
                    </button>
                 </>
               )}
               {stage === 'defender_scanning' && (
                 <>
                    <RefreshCw className="w-20 h-20 text-red-500 mb-8 animate-spin-slow" />
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                       <motion.div animate={{ width: scanProgress + '%' }} className="h-full bg-red-600" />
                    </div>
                    <div className="mt-4 text-white/30 font-mono text-xs uppercase tracking-[0.5em]">{scanProgress}% ПРОВЕРКА...</div>
                 </>
               )}
               {stage === 'defender_clean' && (
                 <>
                    <Shield className="w-24 h-24 text-green-500 mb-6 drop-shadow-[0_0_20px_#22c55e33]" />
                    <h2 className="text-white text-xl font-bold mb-2">Проверка завершена</h2>
                    <p className="text-green-400 font-bold text-sm mb-10 uppercase tracking-widest animate-pulse">Угроз не обнаружено</p>
                    <button 
                       onClick={() => { playButtonSound(); setStage('desktop'); }}
                       className="px-12 py-3 border border-white/20 hover:bg-white/5 text-white font-black text-xs uppercase tracking-widest transition-all rounded cursor-pointer"
                    >
                       Закрыть
                    </button>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Denied Error */}
      <AnimatePresence>
        {showAccessDenied && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] bg-[#dfdfdf] border border-gray-600 shadow-2xl z-[50050] text-black font-sans overflow-hidden"
          >
            <div className="bg-[#0055e5] text-white px-2 py-1 flex justify-between items-center text-[11px] font-bold">
              <span>Windows Explorer</span>
              <X onClick={() => setShowAccessDenied(false)} className="w-4 h-4 cursor-pointer hover:bg-red-500" />
            </div>
            <div className="p-6 flex gap-4 items-center">
               <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white shrink-0">✕</div>
               <div className="text-xs leading-tight font-medium text-black">Нет доступа к папке.<br/><br/>Вам отказано в доступе к этой папке. Для получения доступа к этой папке воспользуйтесь вкладкой «Безопасность».</div>
            </div>
            <div className="bg-gray-100 p-2 flex justify-center border-t border-gray-300">
               <button onClick={() => setShowAccessDenied(false)} className="px-8 py-1 bg-white border border-gray-400 text-xs hover:bg-gray-100 shadow-sm text-black outline-none focus:border-blue-500 cursor-pointer">ОК</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
`;

  const bgStyleTarget = "style={{ backgroundImage: 'url(\"/textures/photos/wallaper1.png\")', backgroundSize: 'cover', backgroundPosition: 'center' }}>";
  code = code.replace(bgStyleTarget, bgStyleTarget + "\n" + overlays);

  // 7. Inject desktop restricted icons
  const desktopIcons = `
        {/* Dynamic Project Folders */}
        {[
          { name: "Проект 'Alpha'", id: 'p1' },
          { name: "Проект 'S-2'", id: 'p2' },
          { name: "Другой проект", id: 'p3' },
          { name: "Системные файлы", id: 'p4' }
        ].map(p => (
          <div key={p.id} className="flex flex-col items-center gap-1 group cursor-pointer w-20" onDoubleClick={handleRestrictedClick}>
            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors relative">
               <Folder className="text-red-500/60 w-8 h-8" />
               <Shield className="w-3 h-3 text-red-400 absolute bottom-1 right-1" />
            </div>
            <span className="text-white text-[10px] text-shadow-sm font-medium text-center leading-tight line-clamp-2">{p.name}</span>
          </div>
        ))}
`;
  const trashTarget = '<span className="text-white text-[10px] text-shadow-sm font-medium">Корзина</span>\n        </div>';
  code = code.replace(trashTarget, trashTarget + "\n" + desktopIcons);

  // 8. Add black screen/taunt blocks at the very top of the return block
  const tauntBlock = `
  if (stage === 'black_screen' || stage === 'taunt') return (
    <div className="fixed inset-0 bg-black z-[60000] flex items-center justify-center font-mono select-none">
      {stage === 'taunt' && (
        <div className="text-white text-4xl text-center px-10 leading-relaxed font-black tracking-widest animate-pulse uppercase">
           YOU THINK YOU SMARTER? HAHAHAHA! TAKE THIS...
        </div>
      )}
    </div>
  );

  return (`;
  
  // Replace only the first occurrence of "return (" which is for the main render
  const firstReturnIdx = code.indexOf("return (");
  if (firstReturnIdx !== -1) {
     code = code.substring(0, firstReturnIdx) + tauntBlock + code.substring(firstReturnIdx + 8);
  }

  fs.writeFileSync('src/features/Chapters/Chapter2/Chapter2Desktop.tsx', code);
  console.log("Successfully rebuilt Chapter2Desktop.tsx!");
} catch (e) {
  console.error("Error running script:", e);
}
