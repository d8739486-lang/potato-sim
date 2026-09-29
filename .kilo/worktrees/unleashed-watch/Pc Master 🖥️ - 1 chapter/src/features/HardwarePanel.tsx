import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, LEVELS_DATA, UpgradeType } from '@/core/store';
import { Cpu, Zap, MousePointer2, Thermometer, Activity, Gauge, Monitor } from 'lucide-react';
import { cn } from '@/core/utils';
import { useState } from 'react';
import { t } from '@/core/i18n';

export const HardwarePanel = () => {
  const { evolution, autoGen, clickPower, upgrades, language } = useGameStore();
  const currentLevel = LEVELS_DATA[evolution];
  const [hoveredComponent, setHoveredComponent] = useState<UpgradeType | null>(null);
  
  // Dynamic stats based on evolution
  const cpuGhz = (evolution * 1.5 + (upgrades.cpu.count * 0.4)).toFixed(2);
  const temp = (35 + (upgrades.gpu.count * 5) + (upgrades.cpu.count * 3)).toFixed(0);
  const power = (100 * evolution + (upgrades.gpu.count * 40)).toFixed(0);
  const ramUsage = (15 + (evolution * 10) + (upgrades.drive.count * 2)).toFixed(0);

  const mainStats = [
    { label: t('hardware.passive'), value: `${autoGen.toFixed(1)}$ / ${t('topBar.sec')}`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: t('hardware.clickPower'), value: `${clickPower.toFixed(1)}$ / ${t('topBar.click')}`, icon: MousePointer2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: t('hardware.totalComponents'), value: Object.values(upgrades).reduce((a, b) => a + b.count, 0), icon: Cpu, color: 'text-matrix', bg: 'bg-matrix/10' },
  ];

  const telemetry = [
    { label: t('hardware.freq'), value: `${cpuGhz} GHz`, icon: Gauge, color: 'text-matrix' },
    { label: t('hardware.temp'), value: `${temp}°C`, icon: Thermometer, color: parseInt(temp) > 80 ? 'text-red-500' : 'text-orange-400' },
    { label: t('hardware.energy'), value: `${power} W`, icon: Activity, color: 'text-green-400' },
    { label: 'RAM LOAD', value: `${ramUsage}%`, icon: Monitor, color: 'text-blue-400' },
  ];

  const allMaxed = Object.values(upgrades).every(u => u.count >= u.max);

  return (
    <div className="h-full w-full flex flex-col gap-6 p-1 overflow-y-auto custom-scrollbar pr-4">
      {/* Top Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {mainStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black/60 border border-matrix/20 p-5 rounded-2xl backdrop-blur-xl flex items-center gap-5 group hover:border-matrix/40 transition-colors"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-matrix/40 text-[10px] uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left: Component Matrix */}
        <div className="lg:col-span-8 flex flex-col gap-6 bg-black/40 border border-matrix/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black glow-text uppercase tracking-tighter flex items-center gap-2">
              <Cpu size={20} className="text-matrix" />
              {t('hardware.matrix')} [STAGE {evolution}]
            </h3>
            <div className="text-[10px] font-mono text-matrix/40 uppercase tracking-widest animate-pulse">
              System_Scanning...
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(upgrades).map(([key, state], i) => {
              const data = currentLevel[key as UpgradeType];
              const progress = (state.count / state.max) * 100;
              
              return (
                <motion.div 
                    key={key} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onMouseEnter={() => setHoveredComponent(key as UpgradeType)}
                    onMouseLeave={() => setHoveredComponent(null)}
                    className="group bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 hover:bg-white/10 hover:border-matrix/30 transition-all cursor-crosshair relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-matrix/0 group-hover:bg-matrix/40 transition-all" />
                  
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                        <p className="text-[10px] text-matrix uppercase font-bold tracking-tighter mb-1 truncate group-hover:scale-105 origin-left transition-transform">
                          {typeof data.name === 'string' ? data.name : (language === 'en' ? data.name.en : data.name.ru)}
                        </p>
                        <p className="text-[9px] text-white/30 uppercase font-mono italic">ID: 0x{key.toUpperCase()}</p>
                    </div>
                    <span className="text-xs font-black text-matrix/80 font-mono">
                        {state.count}/{state.max}
                    </span>
                  </div>
                  
                  <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-matrix shadow-[0_0_15px_var(--matrix-color)] rounded-full relative"
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-matrix/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {telemetry.map((t, i) => (
                <div key={t.label} className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                        <t.icon size={12} className={t.color} />
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t.label}</span>
                    </div>
                    <span className={cn("text-lg font-black font-mono", t.color)}>{t.value}</span>
                </div>
            ))}
          </div>

          {/* Decorative Background Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]" />
          </div>
        </div>

        {/* Right: Visual Setup */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-black/60 border border-matrix/20 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-matrix/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative h-full flex flex-col items-center justify-center">
              <div className="text-[10px] text-matrix/40 font-mono absolute top-0 left-0 uppercase tracking-widest">
                {hoveredComponent ? `ANALYZING_${hoveredComponent.toUpperCase()}` : `SYSTEM_MODEL_V.${evolution}.0`}
              </div>
              
              <div className="relative w-full aspect-square max-h-[300px] flex items-center justify-center">
                <div className={cn(
                    "absolute inset-0 bg-matrix/20 blur-3xl rounded-full scale-50 transition-all duration-500",
                    hoveredComponent ? "opacity-40 scale-75" : "opacity-20 animate-pulse"
                )} />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={hoveredComponent || 'pc'}
                        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full flex items-center justify-center p-4 relative"
                    >
                        <img 
                            src={hoveredComponent ? currentLevel.assets[hoveredComponent] : currentLevel.assets.pc}
                            className={cn(
                                "max-w-full max-h-full object-contain relative z-10 transition-all duration-700",
                                !hoveredComponent && evolution === 1 && "scale-x-[-1]",
                                hoveredComponent ? "drop-shadow-[0_0_20px_rgba(var(--matrix-color-rgb),0.5)] brightness-125 saturate-150" : "drop-shadow-[0_0_30px_rgba(var(--matrix-color-rgb),0.3)]"
                            )}
                            alt="Hardware Visualization"
                        />
                        {hoveredComponent && (
                            <div className="absolute inset-0 bg-matrix/10 pointer-events-none mix-blend-overlay animate-pulse" />
                        )}
                    </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-6 text-center">
                <div className="text-xs font-black text-matrix uppercase tracking-[0.3em] mb-1">
                    {hoveredComponent ? (typeof currentLevel[hoveredComponent].name === 'string' ? currentLevel[hoveredComponent].name : (language === 'en' ? currentLevel[hoveredComponent].name.en : currentLevel[hoveredComponent].name.ru)) : t('hardware.config')}
                </div>
                <div className="h-0.5 w-12 bg-matrix/30 mx-auto rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
