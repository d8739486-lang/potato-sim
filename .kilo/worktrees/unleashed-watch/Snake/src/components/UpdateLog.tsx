import { X, GitBranch } from 'lucide-react';
import { useSnakeStore } from '../store/useSnakeStore';

interface UpdateEntry {
  version: string;
  date: string;
  label: 'RELEASE' | 'UPDATE' | 'HOTFIX';
  changes: string[];
}

const UPDATES: UpdateEntry[] = [
  {
    version: '1.1',
    date: '2026-07-23',
    label: 'UPDATE',
    changes: [
      'Добавлена система аккаунтов (регистрация / вход)',
      'Подключена база данных Supabase',
      'Реализован лидерборд: победы, смерти, яблоки',
      'Профиль в правом верхнем углу (смена пароля, удаление)',
      'Защита от ботов (honeypot)',
    ],
  },
  {
    version: '1.0',
    date: '2026-07-23',
    label: 'RELEASE',
    changes: [
      'Первый релиз игры Neon Snake',
      'Поле 20×20 с неоновой змейкой',
      'Обычные (красные) и золотые яблоки (+ускорение)',
      'Плавные повороты и анимации',
      'Звук меню, звуки эффектов, синтезатор для отсчёта',
      'Экраны: главное меню, отсчёт, Game Over, победа',
      'Настройки звука (3 ползунка), сброс прогресса',
      'Прелоадер с fullscreen-активацией',
      'Тряска камеры и вспышка при смерти',
    ],
  },
];

const LABEL_COLORS: Record<UpdateEntry['label'], string> = {
  RELEASE: 'bg-lime-500/20 text-lime-400 border-lime-500/40',
  UPDATE: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  HOTFIX: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
};

interface UpdateLogProps {
  onClose: () => void;
}

export const UpdateLog = ({ onClose }: UpdateLogProps) => {
  const playSfx = useSnakeStore((s) => s.playSfx);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1624] border border-white/10 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-lime-400" />
            <h2 className="text-xl font-bold text-white">Журнал обновлений</h2>
          </div>
          <button
            onClick={() => { playSfx('click'); onClose(); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Список обновлений */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {UPDATES.map((entry) => (
            <div key={entry.version} className="relative pl-5 border-l-2 border-white/10">
              {/* Точка на таймлайне */}
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(132,204,22,0.8)]" />

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-white font-black text-lg">v{entry.version}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LABEL_COLORS[entry.label]}`}>
                  {entry.label}
                </span>
                <span className="text-slate-500 text-xs ml-auto">{entry.date}</span>
              </div>

              <ul className="space-y-1.5">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-lime-500 mt-0.5 shrink-0">→</span>
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
};
