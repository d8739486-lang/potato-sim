import { X, Wheat, Store, Target, Package } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#2c1810] border-4 border-[#4a331f] rounded-2xl p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col animate-slide-up">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer border border-red-500/30 hover:border-red-500/50 z-50"
        >
          <X size={32} />
        </button>

        <h2 className="text-4xl font-black text-white drop-shadow-md mb-8 text-center uppercase tracking-widest flex items-center justify-center gap-4">
          <Target className="text-amber-400" size={40} />
          Как играть?
          <Target className="text-amber-400" size={40} />
        </h2>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
          <div className="bg-black/40 border border-white/10 p-5 sm:p-6 rounded-3xl flex items-center gap-4 sm:gap-6">
            <div className="bg-amber-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-amber-500/30 flex items-center justify-center">
              <Store className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-black text-amber-400 mb-2 uppercase tracking-wide break-words">1. Магазин</h3>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Покупайте семена в <strong>Магазине</strong>. Чем дороже семена, тем дольше они растут, но приносят больше прибыли! Также в магазине можно купить инструменты: лейку для полива (без неё картошка не растет) и мотыгу для ускорения роста.
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-5 sm:p-6 rounded-3xl flex items-center gap-4 sm:gap-6">
            <div className="bg-green-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-green-500/30 flex items-center justify-center">
              <Wheat className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-black text-green-400 mb-2 uppercase tracking-wide break-words">2. Поле и Посадка</h3>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Зайдите в <strong>Рюкзак</strong> и перетащите семена в слоты <strong>Хотбара</strong> (внизу экрана). После этого идите на <strong>Поле</strong>, выберите семена цифрами на клавиатуре (1-5) или кликом и сажайте их на пустые грядки. Не забудьте полить из лейки!
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-5 sm:p-6 rounded-3xl flex items-center gap-4 sm:gap-6">
            <div className="bg-blue-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-blue-500/30 flex items-center justify-center">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-black text-blue-400 mb-2 uppercase tracking-wide break-words">3. Склад и Продажа</h3>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Когда картошка вырастет, соберите её инструментом "Рука" (по умолчанию слот 1). Весь собранный урожай попадает на <strong>Склад</strong>. Зайдите на склад, чтобы продать урожай и получить Картоха-коины!
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-5 sm:p-6 rounded-3xl flex items-center gap-4 sm:gap-6">
            <div className="bg-purple-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 border border-purple-500/30 flex items-center justify-center">
              <img src="/sprites/sprinkler_base.png" alt="Sprinkler" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" style={{ filter: 'hue-rotate(280deg)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-black text-purple-400 mb-2 uppercase tracking-wide break-words">4. Сплинкеры и Перерождения</h3>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Сплинкеры автоматически поливают грядки вокруг себя. А накопив достаточно денег, вы можете совершить <strong>Перерождение</strong> — ваш баланс и ферма сбросятся, но вы получите уникальные улучшения и новые виды картошки!
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full py-5 bg-amber-500 hover:bg-amber-400 text-[#2c1810] font-black text-2xl rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer tracking-widest uppercase"
        >
          Понятно, в бой!
        </button>

      </div>
    </div>
  );
}
