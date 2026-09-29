import { useState } from 'react';
import { X } from 'lucide-react';
import { useModalStore, ModalType } from '../core/store/useModalStore';
import { playClickSFX } from '../core/store/useGameStore';
import { useTranslation } from '../core/i18n/useTranslation';

export function UpdateLogsModal({ zIndex }: { zIndex?: number }) {
  const closeModal = useModalStore(s => s.closeModal);
  const { t } = useTranslation();
  const [isExiting, setIsExiting] = useState(false);

  const LOGS = [
    {
      version: 'v1.00.0',
      changes: [
        t('logs.v1_00_0_c1'),
        t('logs.v1_00_0_c2'),
        t('logs.v1_00_0_c3'),
        t('logs.v1_00_0_c4'),
        t('logs.v1_00_0_c5'),
        t('logs.v1_00_0_c6'),
        t('logs.v1_00_0_c7')
      ]
    }
  ];

  const handleClose = () => {
    if (isExiting) return;
    playClickSFX();
    setIsExiting(true);
    setTimeout(() => {
      closeModal(ModalType.UPDATE_LOGS);
    }, 400); // Matches the animation duration
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center transition-all duration-400 ${isExiting ? 'bg-transparent backdrop-blur-none pointer-events-none' : 'bg-black/70 backdrop-blur-md'}`}
      style={{ zIndex: zIndex || 1000 }}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className={`bg-[#05080f] border-2 border-[rgba(0,242,255,0.2)] rounded-[20px] w-175 max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(0,242,255,0.1)] relative z-10 ${isExiting ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[rgba(0,242,255,0.1)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-neon-blue shadow-[0_0_10px_#00f2ff] animate-pulse" />
            <h2 className="font-orbitron text-2xl font-bold tracking-[4px] text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.5)] uppercase">{t('logs.title')}</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-neon-blue transition-colors cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
          {LOGS.map((log) => (
            <div key={log.version} className="bg-glass border border-[rgba(255,255,255,0.05)] rounded-xl p-8 flex flex-col items-center">
              
              {/* Version Badge at Top Center */}
              <div className="bg-neon-blue text-black font-orbitron font-bold px-6 py-2 rounded-full text-xl shadow-[0_0_15px_rgba(0,242,255,0.5)] mb-8 tracking-[2px]">
                {log.version}
              </div>
              
              {/* Changes List */}
              <ul className="w-full text-gray-300 font-inter text-base space-y-4">
                {log.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-neon-blue mt-1">▸</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
