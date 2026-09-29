import { useState, useEffect } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { cn } from '../utils';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: 'danger' | 'warning';
}

export default function ConfirmModal({ 
  title, 
  message, 
  confirmText = 'ОК', 
  cancelText = 'Отмена', 
  onConfirm, 
  onClose,
  variant = 'warning'
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    try {
      new Audio('/sfx/error.wav').play().catch(() => {});
    } catch(e) {}
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); // 0.4s to match new animate-fade-out-fast
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(onConfirm, 400);
  };

  const isDanger = variant === 'danger';

  return (
    <div className={cn("fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4", isClosing ? "animate-fade-out-fast" : "animate-fade-in")}>
      <div className={cn(
        "bg-[#141014] border border-amber-500/30 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden",
        isDanger ? "border-red-500/50" : "border-amber-500/50"
      )}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className={cn(
            "p-4 rounded-full border-2 animate-bounce",
            isDanger ? "bg-red-500/20 border-red-500/50 text-red-500" : "bg-amber-500/20 border-amber-500/50 text-amber-500"
          )}>
            {isDanger ? <LogOut size={36} /> : <AlertTriangle size={36} />}
          </div>
          
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">{title}</h2>
          <p className="text-white/70 font-bold mb-4">{message}</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/20 cursor-pointer"
            >
              {cancelText}
            </button>
            <button 
              onClick={handleConfirm}
              className={cn(
                "flex-1 py-3 text-white font-black rounded-xl transition-all cursor-pointer shadow-lg",
                isDanger 
                  ? "bg-red-600 hover:bg-red-500 border-red-400 shadow-red-500/50" 
                  : "bg-amber-600 hover:bg-amber-500 border-amber-400 shadow-amber-500/50"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
