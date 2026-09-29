import { useState } from 'react';
import { X } from 'lucide-react';

interface ChangelogModalProps {
  onClose: () => void;
}

export default function ChangelogModal({ onClose }: ChangelogModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 ${isClosing ? 'animate-fade-out-fast' : 'animate-fade-in-fast'}`}>
      <div className="bg-[#2c1810] border-4 border-[#4a331f] rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-all cursor-pointer z-10"
        >
          <X size={32} />
        </button>

        <h2 className="text-4xl font-black text-white drop-shadow-md mb-8 text-center uppercase tracking-widest">
          ЧТО НОВОГО
        </h2>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-white/90">
          <div className="space-y-6">
            <section>
              <h4 className="text-2xl font-black text-green-500 mb-2">🚀 Космическая станция</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li><strong>Космическая Станция:</strong> Откройте для себя бескрайний космос! После 5-го ребитха вам станет доступна покупка и строительство настоящей Космической Станции за Потато-Коины. Отправляйтесь на орбиту с помощью новой кнопки в главном меню!</li>
                <li><strong>Панель Банов:</strong> Добавлена новая удобная панель для модерации с возможностью выдачи временных и перманентных банов. Забаненные игроки теперь автоматически исключаются из Лидерборда.</li>
                <li><strong>Удобный Инвентарь:</strong> Теперь семена автоматически попадают в пустые слоты быстрого доступа (1-9). Двойной клик в рюкзаке отправляет предмет в хотбар, а двойной клик на хотбаре — убирает его обратно.</li>
                <li><strong>Новые Горячие Клавиши:</strong> Инструменты перенесены на `Z`, `X`, `C`, `V`, а рюкзак теперь открывается на `У` (`E` на английской раскладке).</li>
                <li><strong>Визуал Сплинкеров:</strong> При наведении на сплинкер теперь показывается прозрачная зона, демонстрирующая радиус его полива.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-black text-amber-500 mb-2">✨ Глобальные события и Сток</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li><strong>Глобальные Ивенты:</strong> Периодически в игре будут происходить особые глобальные события, такие как "Картофелепад"! Следите за красочными объявлениями на весь экран.</li>
                <li><strong>Глобальный Сток (Безумный Магазин):</strong> Время от времени в Магазине будут появляться лимитированные товары (например, сплинкеры) по специальным ценам. Хватайте редкие вещи, пока их не раскупили другие игроки — счетчик работает в реальном времени!</li>
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-black text-amber-500 mb-2">✨ Улучшения и редизайн</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li><strong>Интерфейс Врат Перерождения:</strong> Полный редизайн окна! Удобная сетка улучшений в две колонки и кнопка ребитха по центру, ничего больше не обрывается.</li>
                <li><strong>Новые Улучшения:</strong> В эпохах добавлены «Ускоритель роста», «Прокачка рюкзака» (вместимость склада) и «Доп. слоты» (расширение панели).</li>
                <li><strong>Магазин:</strong> Кнопка разблокировки заменена на "Купить" с анимацией, а также исправлен хитрый баг округления цен, из-за которого кнопка была недоступна.</li>
                <li><strong>Графика:</strong> Новый, идеально бесшовный и сочный газон "шахматкой" без единого квадрата и грязных пятен!</li>
                <li><strong>Перетаскивание:</strong> Теперь перетаскивается только сам аккуратный пакетик, без лишних зелёных фонов.</li>
                <li><strong>Защита от Автокликеров:</strong> Встроена мощная система защиты — кликайте честно, иначе экран покраснеет!</li>
                <li><strong>Разное:</strong> Починили некликабельный крестик в рюкзаке, вернули пропавшую музыку.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-black text-amber-500 mb-2">✨ Склад и новые стили</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li><strong>Масштабный склад:</strong> Вместимость до 500,000! Исправлен баг со сбором при переполнении.</li>
                <li><strong>Улучшенные Эпохи:</strong> Новое улучшение «Агроном». Улучшения не сбрасываются при перерождении.</li>
                <li><strong>Новый визуальный стиль:</strong> Премиальный темный фон с параллакс-эффектом.</li>
              </ul>
            </section>
            
            <section>
              <h4 className="text-2xl font-black text-amber-500 mb-2">✨ Обучение и звуки</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li>Добавлено интерактивное пошаговое обучение для новых игроков!</li>
                <li>Новые звуковые эффекты для копки, посадки и сбора урожая.</li>
                <li>Улучшен драг-энд-дроп: при переносе семян в хотбар они убираются из рюкзака.</li>
                <li>Отображение количества семян на иконке хотбара (x2, x3 и т.д.).</li>
                <li>Фикс багов с текстурами и отображением предметов.</li>
              </ul>
            </section>
            
            <section>
              <h4 className="text-2xl font-black text-amber-500 mb-2">🥔 Основные механики</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li>Создана базовая механика выращивания картошки (посадка, полив, рост).</li>
                <li>Добавлено 5 видов картошки: Обычная, Сладкая, Синяя, Фиолетовая и Золотая.</li>
                <li>Реализована система хотбара для быстрого доступа к инструментам и семенам.</li>
                <li>Сбор урожая с рандомизированным количеством плодов.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-black text-blue-400 mb-2">🛒 Экономика и Магазин</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li>Полноценный магазин для покупки семян, инструментов и сплинкеров.</li>
                <li>Склад для продажи выращенной картошки и пополнения баланса.</li>
                <li>Лейка теперь является расходным материалом.</li>
                <li>Звуковые эффекты при покупке предметов.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-black text-green-400 mb-2">✨ Интерфейс и Графика</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li>Переход от простых SVG/эмодзи к красивым 3D-спрайтам инструментов и семян.</li>
                <li>Новый удобный Рюкзак для управления инвентарем.</li>
                <li><strong>Drag-and-Drop:</strong> Полная поддержка перетаскивания предметов (семян и инструментов) из Рюкзака в Хотбар и из Хотбара на Грядки!</li>
                <li>Вертикальные кастомные карточки в магазине для лучшего обзора товаров.</li>
                <li>Внутриигровой лог событий (всплывающие уведомления).</li>
              </ul>
            </section>

            <section>
              <h4 className="text-2xl font-black text-purple-400 mb-2">⚙️ Система и Настройки</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-medium">
                <li>Добавлена возможность безопасного сброса прогресса внутри игры.</li>
                <li>Раздельная настройка громкости музыки и звуковых эффектов.</li>
                <li>Надежное сохранение всего прогресса, инвентаря и настроек.</li>
              </ul>
            </section>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm font-bold">Спасибо за игру в Симулятор Картошки! 🥔</p>
        </div>
      </div>
    </div>
  );
}
