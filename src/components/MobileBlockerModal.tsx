import { Smartphone, Monitor } from 'lucide-react';

export default function MobileBlockerModal() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#09090b] text-white p-6 select-none">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-radial from-amber-600/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-md w-full bg-[#181310] border-2 border-amber-500/40 rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col items-center gap-6">
        
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
            <Smartphone size={42} className="animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-600 text-white font-black text-lg flex items-center justify-center border-2 border-[#181310] shadow">
            ✕
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <span className="text-4xl">🥔</span>
          <h1 className="text-2xl font-black text-amber-400 tracking-wide uppercase mt-2">
            Игра недоступна на телефоне
          </h1>
        </div>

        {/* Message */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 text-sm leading-relaxed font-semibold">
          <p>
            Управление и интерфейс «Симулятора выращивания картошки» разработаны исключительно для клавиатуры и мыши.
          </p>
        </div>

        {/* Recommendation Box */}
        <div className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold text-sm">
          <Monitor size={22} className="text-emerald-400 shrink-0" />
          <span>Пожалуйста, откройте игру с компьютера или ноутбука</span>
        </div>

        {/* Footer note */}
        <p className="text-xs text-white/40 font-medium">
          potato-sim.vercel.app • PC Only
        </p>
      </div>
    </div>
  );
}
